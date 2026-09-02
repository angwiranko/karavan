const CONFIG = {
  spreadsheetId: '1HS2z9dVFxzIzQCb3Ix2e7fDNlU_unGRhQncjLFmzrN0',
  sheetId: 1904387278,
  sheetName: 'Terraostroma',
  headers: [
    'record_type',
    'segment_id',
    'segment_name',
    'segment_order',
    'defense',
    'item_id',
    'label',
    'character_id',
    'character_name',
    'character_image',
    'character_group',
    'updated_at',
    'entry_status'
  ]
};

function doPost(e) {
  const lock = LockService.getScriptLock();
  if (!lock.tryLock(5000)) {
    return jsonResponse({
      success: false,
      message: 'A rendszer jelenleg foglalt, próbáld újra néhány másodperc múlva.'
    });
  }

  try {
    const payload = parseRequest(e);
    if (payload.sheetId !== CONFIG.sheetId || payload.spreadsheetId !== CONFIG.spreadsheetId) {
      throw new Error('A kérés nem a Terraostroma munkalapot célozza.');
    }
    if (!['update-segment', 'add-entry', 'remove-entry', 'update-entry-status', 'update-character-group'].includes(payload.action)) {
      throw new Error('Ismeretlen művelet.');
    }
    const sheet = getTargetSheet();
    ensureHeaders(sheet);

    switch (payload.action) {
      case 'update-segment':
        return jsonResponse({ success: true, ...handleUpdateSegment(sheet, payload.segment) });
      case 'add-entry':
        return jsonResponse({ success: true, ...handleAddEntry(sheet, payload.segment, payload.entry) });
      case 'remove-entry':
        return jsonResponse({ success: true, ...handleRemoveEntry(sheet, payload.entryId) });
      case 'update-entry-status':
        return jsonResponse({ success: true, ...handleUpdateEntryStatus(sheet, payload.entryId, payload.status) });
      case 'update-character-group':
        return jsonResponse({ success: true, ...handleUpdateCharacter(sheet, payload.character) });
      default:
        throw new Error(`Ismeretlen művelet: ${payload.action}`);
    }
  } catch (error) {
    console.error('Terra Ostroma webhook hiba', error);
    return jsonResponse({ success: false, message: error.message || 'Ismeretlen hiba történt.' });
  } finally {
    lock.releaseLock();
  }
}

function doGet() {
  const lock = LockService.getScriptLock();
  if (!lock.tryLock(5000)) return jsonResponse({ success: false, message: 'A rendszer foglalt.' });
  try {
    const sheet = getTargetSheet();
    if (sheet.getLastRow() === 0) return jsonResponse({ success: true, rows: [] });
    checkHeaders(sheet);
    const rows = sheet.getLastRow() < 2 ? [] : sheet.getRange(2, 1, sheet.getLastRow() - 1, CONFIG.headers.length).getValues().map(rowToObject);
    return jsonResponse({ success: true, rows });
  } catch (error) {
    return jsonResponse({ success: false, message: error.message });
  } finally {
    lock.releaseLock();
  }
}

function doOptions() {
  return jsonResponse({ success: true });
}

function parseRequest(e) {
  if (!e || !e.postData || !e.postData.contents) {
    throw new Error('Üres kérés érkezett a webhookra.');
  }

  const data = JSON.parse(e.postData.contents);
  if (!data.action) {
    throw new Error('Az "action" mező megadása kötelező.');
  }
  return data;
}

function getTargetSheet() {
  const spreadsheet = SpreadsheetApp.openById(CONFIG.spreadsheetId);
  const sheet = spreadsheet.getSheets().find(item => item.getSheetId() === CONFIG.sheetId);
  if (!sheet) throw new Error('A rögzített Terraostroma munkalap nem található.');
  return sheet;
}

function checkHeaders(sheet) {
  const headers = sheet.getRange(1, 1, 1, CONFIG.headers.length).getValues()[0];
  CONFIG.headers.forEach((header, index) => {
    // The last column is the only extension of the original Terra schema.
    if (index === CONFIG.headers.length - 1 && !headers[index]) return;
    if (headers[index] !== header) throw new Error('Eltérő táblaszerkezet; meglévő adatokat nem írunk felül.');
  });
}

function ensureHeaders(sheet) {
  if (sheet.getLastRow() === 0) {
    sheet.getRange(1, 1, 1, CONFIG.headers.length).setValues([CONFIG.headers]);
    return;
  }
  checkHeaders(sheet);
  sheet.getRange(1, CONFIG.headers.length).setValue('entry_status');
}

function handleUpdateSegment(sheet, segment) {
  if (!segment || !segment.id) {
    throw new Error('A segment.id megadása kötelező.');
  }

  const rowNumber = findRow(sheet, 'segment_id', segment.id, row => row.record_type === 'segment');
  const row = buildEmptyRow();
  row.record_type = 'segment';
  row.segment_id = segment.id;
  row.segment_name = segment.name || '';
  row.segment_order = getSegmentOrder(segment.id);
  row.defense = clampDefense(segment.defense);
  row.updated_at = new Date();
  writeRow(sheet, rowNumber, row);
  return { rowNumber: rowNumber || sheet.getLastRow() };
}

function handleAddEntry(sheet, segment, entry) {
  if (!segment || !segment.id || !entry || !entry.id) {
    throw new Error('A segment.id és entry.id megadása kötelező.');
  }

  const rowNumber = findRow(sheet, 'item_id', entry.id);
  const row = buildEmptyRow();
  row.record_type = 'entry';
  row.segment_id = segment.id;
  row.segment_name = segment.name || '';
  row.segment_order = getSegmentOrder(segment.id);
  row.defense = clampDefense(segment.defense);
  row.item_id = entry.id;
  row.label = String(entry.label || '').trim();
  if (!row.label || row.label.length > 160) throw new Error('A bejegyzés hossza 1–160 karakter lehet.');
  row.entry_status = normalizeEntryStatus(entry.status);
  row.updated_at = new Date();
  writeRow(sheet, rowNumber, row);
  return { rowNumber: rowNumber || sheet.getLastRow() };
}

function handleRemoveEntry(sheet, entryId) {
  if (!entryId) {
    throw new Error('Az entryId megadása kötelező.');
  }

  const rowNumber = findRow(sheet, 'item_id', entryId, row => row.record_type === 'entry');
  if (!rowNumber) {
    return { removed: false };
  }
  sheet.deleteRow(rowNumber);
  return { rowNumber, removed: true };
}

function handleUpdateEntryStatus(sheet, entryId, status) {
  const rowNumber = findRow(sheet, 'item_id', entryId, row => row.record_type === 'entry');
  if (!rowNumber) throw new Error('A bejegyzés nem található.');
  sheet.getRange(rowNumber, CONFIG.headers.indexOf('entry_status') + 1).setValue(normalizeEntryStatus(status));
  sheet.getRange(rowNumber, CONFIG.headers.indexOf('updated_at') + 1).setValue(new Date());
  return { rowNumber };
}

function normalizeEntryStatus(status) {
  return ['normal', 'inkognito', 'jogosultsag'].includes(status) ? status : 'normal';
}

function handleUpdateCharacter(sheet, character) {
  if (!character || !/^character-0[1-7]$/.test(character.id) || !['rogue-trader', 'smuggler'].includes(character.group)) {
    throw new Error('A character.id megadása kötelező.');
  }

  const rowNumber = findRow(sheet, 'character_id', character.id);
  const row = buildEmptyRow();
  row.record_type = 'character';
  row.character_id = character.id;
  row.character_name = character.name || '';
  row.character_image = character.image || '';
  row.character_group = character.group || '';
  row.updated_at = new Date();
  writeRow(sheet, rowNumber, row);
  return { rowNumber: rowNumber || sheet.getLastRow() };
}

function buildEmptyRow() {
  return CONFIG.headers.reduce((row, header) => {
    row[header] = '';
    return row;
  }, {});
}

function writeRow(sheet, rowNumber, row) {
  const values = CONFIG.headers.map(header => {
    const value = row[header] === undefined ? '' : row[header];
    return typeof value === 'string' && /^[=+@\-]/.test(value) ? "'" + value : value;
  });
  if (rowNumber) {
    sheet.getRange(rowNumber, 1, 1, values.length).setValues([values]);
    return;
  }
  sheet.appendRow(values);
}

function findRow(sheet, header, value, predicate) {
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) {
    return null;
  }

  const rows = sheet.getRange(2, 1, lastRow - 1, CONFIG.headers.length).getValues();
  const columnIndex = CONFIG.headers.indexOf(header);
  if (columnIndex === -1) {
    throw new Error(`Hiányzó fejléc: ${header}`);
  }

  for (let index = 0; index < rows.length; index += 1) {
    const row = rowToObject(rows[index]);
    if (String(rows[index][columnIndex]) === String(value) && (!predicate || predicate(row))) {
      return index + 2;
    }
  }
  return null;
}

function rowToObject(values) {
  return CONFIG.headers.reduce((row, header, index) => {
    row[header] = values[index];
    return row;
  }, {});
}

function getSegmentOrder(segmentId) {
  const order = ['paktum', 'propaganda', 'hadmuvelet', 'merenylet', 'blokad', 'titkok'];
  const index = order.indexOf(segmentId);
  if (index === -1) throw new Error('Ismeretlen műveleti terület.');
  return index + 1;
}

function clampDefense(value) {
  const number = Number(value);
  if (!Number.isFinite(number)) {
    return 2;
  }
  return Math.min(6, Math.max(2, Math.round(number)));
}

function jsonResponse(payload) {
  return ContentService.createTextOutput(JSON.stringify({
    service: 'terra-ostroma-v1',
    spreadsheetId: CONFIG.spreadsheetId,
    sheetId: CONFIG.sheetId,
    ...payload
  }))
    .setMimeType(ContentService.MimeType.JSON);
}
