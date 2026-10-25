// Turns the "fragmented" MP4 that browsers record (moov + many moof/mdat pieces) into a standard MP4
// (one moov with full sample tables, placed before the media data: "fast start"). WhatsApp and phones only
// treat the standard kind as a video. Nothing is re-encoded: the same H.264/AAC samples are just re-indexed.
const MP4Fix = (() => {
  const u32 = (b, o) => b.getUint32(o);
  const u64 = (b, o) => u32(b, o) * 2 ** 32 + u32(b, o + 4);
  const type = (b, o) => String.fromCharCode(b.getUint8(o + 4), b.getUint8(o + 5), b.getUint8(o + 6), b.getUint8(o + 7));

  // Lists the boxes in [start, end): [{ type, start, size, body }] (body = where the content starts).
  function boxes(b, start, end) {
    const out = [];
    for (let o = start; o + 8 <= end;) {
      let size = u32(b, o), head = 8;
      if (size === 1) { size = u64(b, o + 8); head = 16; } else if (size === 0) size = end - o;
      if (size < head || o + size > end) break;
      out.push({ type: type(b, o), start: o, size, body: o + head });
      o += size;
    }
    return out;
  }
  const find = (list, t) => list.find(x => x.type === t);
  const kids = (b, box, skip = 0) => boxes(b, box.body + skip, box.start + box.size);

  // ---- Writing ----
  const be32 = n => [(n >>> 24) & 255, (n >>> 16) & 255, (n >>> 8) & 255, n & 255];
  const str = s => [...s].map(c => c.charCodeAt(0));
  const box = (t, ...parts) => {
    const body = parts.flat();
    return [...be32(body.length + 8), ...str(t), ...body];
  };
  const full = (t, version, flags, ...parts) => box(t, [version, (flags >> 16) & 255, (flags >> 8) & 255, flags & 255], ...parts);
  const raw = (bytes, bx) => Array.from(bytes.subarray(bx.start, bx.start + bx.size));

  function defragment(input) {
    const bytes = input instanceof Uint8Array ? input : new Uint8Array(input);
    const b = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
    const top = boxes(b, 0, bytes.length);
    const moov = find(top, 'moov'), ftyp = find(top, 'ftyp');
    if (!moov || !top.some(x => x.type === 'moof')) return bytes; // already a standard MP4

    // Track defaults (trex), per track id
    const trex = {};
    const mvex = find(kids(b, moov), 'mvex');
    if (mvex) for (const t of kids(b, mvex).filter(x => x.type === 'trex')) {
      const o = t.body + 4;
      trex[u32(b, o)] = { duration: u32(b, o + 8), size: u32(b, o + 12), flags: u32(b, o + 16) };
    }

    // Every sample of every fragment: where it is, how long, how big, keyframe or not, display offset
    const samples = {};
    for (const moof of top.filter(x => x.type === 'moof')) {
      for (const traf of kids(b, moof).filter(x => x.type === 'traf')) {
        const t = kids(b, traf), tfhd = find(t, 'tfhd');
        const tf = u32(b, tfhd.body) & 0xffffff;
        let o = tfhd.body + 4;
        const id = u32(b, o); o += 4;
        const d = trex[id] || { duration: 0, size: 0, flags: 0 };
        let base = moof.start, dur = d.duration, size = d.size, flags = d.flags;
        if (tf & 0x1) { base = u64(b, o); o += 8; }
        if (tf & 0x2) o += 4;
        if (tf & 0x8) { dur = u32(b, o); o += 4; }
        if (tf & 0x10) { size = u32(b, o); o += 4; }
        if (tf & 0x20) { flags = u32(b, o); o += 4; }
        const list = samples[id] = samples[id] || [];
        for (const trun of t.filter(x => x.type === 'trun')) {
          const version = b.getUint8(trun.body), rf = u32(b, trun.body) & 0xffffff;
          let p = trun.body + 4;
          const count = u32(b, p); p += 4;
          let at = base;
          if (rf & 0x1) { at = base + b.getInt32(p); p += 4; }
          let firstFlags = null;
          if (rf & 0x4) { firstFlags = u32(b, p); p += 4; }
          for (let i = 0; i < count; i++) {
            const s = { duration: dur, size, flags: i === 0 && firstFlags !== null ? firstFlags : flags, cto: 0 };
            if (rf & 0x100) { s.duration = u32(b, p); p += 4; }
            if (rf & 0x200) { s.size = u32(b, p); p += 4; }
            if (rf & 0x400) { s.flags = u32(b, p); p += 4; }
            if (rf & 0x800) { s.cto = version ? b.getInt32(p) : u32(b, p); p += 4; }
            s.at = at;
            at += s.size;
            list.push(s);
          }
        }
      }
    }

    // Movie timescale (for the overall duration)
    const moovKids = kids(b, moov), mvhd = find(moovKids, 'mvhd');
    const mvhdV = b.getUint8(mvhd.body), movieScale = u32(b, mvhd.body + (mvhdV ? 20 : 12));

    // New mdat: each track's samples one after another (one chunk per track).
    const order = Object.keys(samples).map(Number);
    let mdatSize = 0;
    for (const id of order) for (const s of samples[id]) mdatSize += s.size;

    function buildMoov(chunkOffsets) {
      let longest = 0;
      const traks = moovKids.filter(x => x.type === 'trak').map(trak => {
        const tk = kids(b, trak), tkhd = find(tk, 'tkhd'), mdia = find(tk, 'mdia');
        const tkV = b.getUint8(tkhd.body), id = u32(b, tkhd.body + (tkV ? 20 : 12));
        const list = samples[id] || [];
        const md = kids(b, mdia), mdhd = find(md, 'mdhd'), minf = find(md, 'minf');
        const mdV = b.getUint8(mdhd.body), scale = u32(b, mdhd.body + (mdV ? 20 : 12));
        const total = list.reduce((a, s) => a + s.duration, 0);
        const movieDur = Math.round(total * movieScale / scale);
        longest = Math.max(longest, movieDur);
        // stts: runs of equal durations
        const stts = [];
        for (const s of list) {
          const last = stts[stts.length - 1];
          if (last && last[1] === s.duration) last[0]++; else stts.push([1, s.duration]);
        }
        const ctts = [];
        if (list.some(s => s.cto)) for (const s of list) {
          const last = ctts[ctts.length - 1];
          if (last && last[1] === s.cto) last[0]++; else ctts.push([1, s.cto]);
        }
        const sync = [];
        list.forEach((s, i) => { if (!(s.flags & 0x10000)) sync.push(i + 1); });
        const mf = kids(b, minf), stbl = find(mf, 'stbl'), stsd = find(kids(b, stbl), 'stsd');
        const newStbl = box('stbl',
          raw(bytes, stsd),
          full('stts', 0, 0, be32(stts.length), stts.flatMap(([n, d]) => [...be32(n), ...be32(d)])),
          sync.length < list.length ? full('stss', 0, 0, be32(sync.length), sync.flatMap(be32)) : [],
          ctts.length ? full('ctts', 0, 0, be32(ctts.length), ctts.flatMap(([n, c]) => [...be32(n), ...be32(c >>> 0)])) : [],
          full('stsc', 0, 0, be32(1), be32(1), be32(list.length), be32(1)),
          full('stsz', 0, 0, be32(0), be32(list.length), list.flatMap(s => be32(s.size))),
          full('stco', 0, 0, be32(1), be32(chunkOffsets[id] || 0))
        );
        const newMinf = box('minf', ...mf.map(x => x.type === 'stbl' ? newStbl : raw(bytes, x)));
        // mdhd and tkhd with the real duration
        const mdhdBytes = raw(bytes, mdhd), tkhdBytes = raw(bytes, tkhd);
        const put = (arr, at, n, wide) => {
          if (wide) { arr.splice(at, 8, ...be32(Math.floor(n / 2 ** 32)), ...be32(n >>> 0)); } else arr.splice(at, 4, ...be32(n));
        };
        put(mdhdBytes, mdhd.body - mdhd.start + (mdV ? 24 : 16), total, mdV);
        put(tkhdBytes, tkhd.body - tkhd.start + (tkV ? 28 : 20), movieDur, tkV);
        const newMdia = box('mdia', ...md.map(x => x.type === 'mdhd' ? mdhdBytes : x.type === 'minf' ? newMinf : raw(bytes, x)));
        return box('trak', ...tk.map(x => x.type === 'tkhd' ? tkhdBytes : x.type === 'mdia' ? newMdia : raw(bytes, x)));
      });
      const mvhdBytes = raw(bytes, mvhd);
      if (mvhdV) mvhdBytes.splice(mvhd.body - mvhd.start + 24, 8, ...be32(Math.floor(longest / 2 ** 32)), ...be32(longest >>> 0));
      else mvhdBytes.splice(mvhd.body - mvhd.start + 16, 4, ...be32(longest));
      const others = moovKids.filter(x => !['mvhd', 'trak', 'mvex'].includes(x.type)).map(x => raw(bytes, x));
      return box('moov', mvhdBytes, ...traks, ...others);
    }

    // Fast start: ftyp, moov, then mdat. The moov's size does not depend on the offsets, so build it twice.
    const ftypBytes = ftyp ? raw(bytes, ftyp) : box('ftyp', str('isom'), be32(512), str('isomiso2avc1mp41'));
    const moovSize = buildMoov({}).length;
    const offsets = {};
    let at = ftypBytes.length + moovSize + 8;
    for (const id of order) { offsets[id] = at; for (const s of samples[id]) at += s.size; }
    const moovBytes = buildMoov(offsets);

    const out = new Uint8Array(ftypBytes.length + moovBytes.length + 8 + mdatSize);
    out.set(ftypBytes, 0);
    out.set(moovBytes, ftypBytes.length);
    let w = ftypBytes.length + moovBytes.length;
    out.set([...be32(mdatSize + 8), ...str('mdat')], w);
    w += 8;
    for (const id of order) for (const s of samples[id]) { out.set(bytes.subarray(s.at, s.at + s.size), w); w += s.size; }
    return out;
  }

  return { defragment };
})();

if (typeof module !== 'undefined') module.exports = MP4Fix;
