// Explicit opt-in: inserts one unique temporary entry, changes its category,
// reads it back, then removes only that entry from the Terra worksheet.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { randomUUID } = require('node:crypto');

if (!process.argv.includes('--live') && !process.argv.includes('--read-only')) {
  console.log('Live test skipped. Pass --live to exercise the configured Google endpoint.');
  process.exit(0);
}

async function main() {
  const html = fs.readFileSync(path.join(__dirname, 'terra-ostroma.html'), 'utf8');
  const declarations = ['SPREADSHEET_ID', 'SHEET_ID', 'SHEET_API_URL'].map(name => html.match(new RegExp(`const ${name} = [^;]+;`))[0]).join('\n');
  const functions = html.slice(html.indexOf('    function assertSheetResponse('), html.indexOf('    function stateFromRows('));
  const inspectedFetch = async (url, options) => {
    const response = await fetch(url, { ...options, headers: { ...options.headers, Origin: 'null' } });
    assert.equal(response.headers.get('access-control-allow-origin'), '*', 'The endpoint must allow file-page cross-origin requests');
    const text = await response.clone().text();
    if (!text.trimStart().startsWith('{')) {
      console.error('Unexpected Google response:', response.status, response.headers.get('content-type'), text.slice(0, 500));
    }
    return response;
  };
  const context = vm.createContext({ fetch: inspectedFetch, AbortController, setTimeout, clearTimeout, Date });
  vm.runInContext(declarations + "\nconst SHEET_NAME='Terraostroma'; let sheetReady=true;\n" + functions, context);
  const before = await context.readSheetRows();
  if (process.argv.includes('--read-only')) {
    console.log('Read endpoint, worksheet identity and file-origin CORS verified. Rows:', before.length);
    return;
  }
  const id = 'codex-connection-test-' + randomUUID();
  const segment = { id: 'titkok', name: 'Titkok', defense: 2 };
  const entry = { id, label: 'Automatikus kapcsolatteszt (ideiglenes)', status: 'normal' };
  let attempted = false;
  try {
    attempted = true;
    await context.syncWithSheet('add-entry', { segment, entry });
    let rows = await context.readSheetRows();
    assert.equal(rows.find(row => row.item_id === id)?.label, entry.label);
    for (const status of ['inkognito', 'jogosultsag']) {
      await context.syncWithSheet('update-entry-status', { entryId: id, status });
      rows = await context.readSheetRows();
      assert.equal(rows.find(row => row.item_id === id)?.entry_status, status);
    }
    console.log('Live insert, readback and both category changes verified.');
  } finally {
    if (attempted) {
      await context.syncWithSheet('remove-entry', { entryId: id });
      const after = await context.readSheetRows();
      assert.ok(!after.some(row => row.item_id === id));
      for (const row of before) assert.ok(after.some(item => JSON.stringify(item) === JSON.stringify(row)), 'A pre-existing row changed');
      console.log('Temporary entry removed; pre-existing Terra records preserved.');
    }
  }
}
main().catch(error => { console.error(error); process.exitCode = 1; });
