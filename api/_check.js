// Shared by server.mjs (your PC) and the Vercel functions: a published config.js may only hold data.
// (Files starting with "_" in api/ are helpers, not web endpoints.)
const vm = require('node:vm');

function checkConfig(text) {
  if (typeof text !== 'string' || text.length > 500000) throw new Error('config is missing or too large');
  const code = text.replace(/"(?:[^"\\\n]|\\.)*"/g, '""').replace(/\/\/.*$/gm, '');
  if (/[`'()]|=>|\b(function|require|import|process|eval|new)\b/.test(code)) throw new Error('config may only contain data');
  const ctx = vm.createContext({});
  vm.runInContext(`${text}\n;this.__out = { SITE, CATALOG };`, ctx, { timeout: 500 });
  const { SITE, CATALOG } = ctx.__out;
  if (!SITE || typeof SITE !== 'object' || !CATALOG || typeof CATALOG !== 'object') throw new Error('config must define SITE and CATALOG');
  return { SITE, CATALOG };
}

module.exports = { checkConfig };
