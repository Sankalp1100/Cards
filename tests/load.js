// Loads the browser scripts (plain globals) into a sandbox so Node tests can use them.
const vm = require('node:vm');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.join(__dirname, '..');

function loadApp() {
  const ctx = vm.createContext({ TextEncoder, TextDecoder, btoa, atob, URL, URLSearchParams, console });
  for (const f of ['config.js', 'themes.js', 'codec.js', 'core.js', 'catalog.js']) {
    vm.runInContext(fs.readFileSync(path.join(ROOT, 'js', f), 'utf8'), ctx, { filename: f });
  }
  return vm.runInContext('({ Templates, PRESETS, Codec, Core, Catalog, SITE, CATALOG, INTROS })', ctx);
}

// Objects from the sandbox have a different Object.prototype; normalise before deepStrictEqual.
const plain = o => JSON.parse(JSON.stringify(o));

module.exports = { loadApp, plain, ROOT };
