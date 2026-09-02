const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');

// In-memory Sheets adapter runs the same Apps Script code as the live endpoint.
function makeSheetService(initial = []) {
  const cells = initial.map(row => [...row]);
  const calls = [];
  const writes = [];
  const sheet = {
    getSheetId: () => 1904387278,
    getLastRow: () => cells.length,
    getRange(row, column, height = 1, width = 1) {
      return {
        getValues: () => Array.from({ length: height }, (_, y) => Array.from({ length: width }, (_, x) => cells[row - 1 + y]?.[column - 1 + x] ?? '')),
        setValues(values) {
          writes.push({ row, column, values });
          values.forEach((valuesRow, y) => valuesRow.forEach((value, x) => {
            const dest = cells[row - 1 + y] ||= [];
            dest[column - 1 + x] = typeof value === 'string' && /^'[=+@-]/.test(value) ? value.slice(1) : value;
          }));
        },
        setValue(value) { this.setValues([[value]]); }
      };
    },
    appendRow(values) { this.getRange(cells.length + 1, 1, 1, values.length).setValues([values]); },
    deleteRow(row) { cells.splice(row - 1, 1); }
  };
  const context = vm.createContext({
    SpreadsheetApp: { openById(id) {
      assert.equal(id, '1HS2z9dVFxzIzQCb3Ix2e7fDNlU_unGRhQncjLFmzrN0');
      return { getSheets: () => [{ getSheetId: () => 1140814065, getRange() { throw Error('Starfort must not be accessed'); } }, sheet] };
    } },
    LockService: { getScriptLock: () => ({ tryLock: () => true, releaseLock() {} }) },
    ContentService: { MimeType: { JSON: 'application/json' }, createTextOutput: text => ({ text, setMimeType() { return this; } }) },
    console: { error() {} }
  });
  vm.runInContext(fs.readFileSync(path.join(__dirname, 'apps-script/terra_ostroma_webhook.gs'), 'utf8'), context);
  function get() { return JSON.parse(context.doGet().text); }
  function post(payload) { return JSON.parse(context.doPost({ postData: { contents: JSON.stringify(payload) } }).text); }
  return {
    get, post, calls, writes, cells,
    async fetch(url, options = {}) {
      assert.match(url, /^https:\/\/script\.google\.com\/macros\/s\/AKfycbyPoIqbyY9BwJPpOu8YgQ6Ylp5BL8jj7cY0aenZdtF2ynIaaKwuVR6-nIurMZELYzTv\/exec(?:\?t=\d+)?$/);
      const method = options.method || 'GET';
      const payload = options.body ? JSON.parse(options.body) : null;
      calls.push({ url, method, payload, options });
      const data = method === 'POST' ? post(payload) : get();
      return { ok: true, status: 200, text: async () => JSON.stringify(data) };
    }
  };
}

module.exports = { makeSheetService };
