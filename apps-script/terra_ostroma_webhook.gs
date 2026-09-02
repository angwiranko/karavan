const CONFIG = {
  sheetName: 'TerraOstroma',
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
    'updated_at'
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
    const sheet = getTargetSheet();

    switch (payload.action) {
      case 'update-segment':
        return jsonResponse({ success: true, ...handleUpdateSegment(sheet, payload.segment) });
      case 'add-entry':
        return jsonResponse({ success: true, ...handleAddEntry(sheet, payload.segment, payload.entry) });
      case 'remove-entry':
        return jsonResponse({ success: true, ...handleRemoveEntry(sheet, payload.entryId) });
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
  return jsonResponse({ success: true, message: 'Terra Ostroma webhook aktív.' });
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
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = spreadsheet.getSheetByName(CONFIG.sheetName);
  if (!sheet) {
    sheet = spreadsheet.insertSheet(CONFIG.sheetName);
  }

  if (sheet.getLastRow() === 0) {
    sheet.appendRow(CONFIG.headers);
  }

  const currentHeaders = sheet.getRange(1, 1, 1, Math.max(sheet.getLastColumn(), CONFIG.headers.length)).getValues()[0];
  CONFIG.headers.forEach((header, index) => {
    if (currentHeaders[index] !== header) {
      sheet.getRange(1, index + 1).setValue(header);
    }
  });

  return sheet;
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
  row.label = entry.label || '';
  row.updated_at = new Date();
  writeRow(sheet, rowNumber, row);
  return { rowNumber: rowNumber || sheet.getLastRow() };
}

function handleRemoveEntry(sheet, entryId) {
  if (!entryId) {
    throw new Error('Az entryId megadása kötelező.');
  }

  const rowNumber = findRow(sheet, 'item_id', entryId);
  if (!rowNumber) {
    return { removed: false };
  }
  sheet.deleteRow(rowNumber);
  return { rowNumber, removed: true };
}

function handleUpdateCharacter(sheet, character) {
  if (!character || !character.id) {
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
  const values = CONFIG.headers.map(header => row[header] === undefined ? '' : row[header]);
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
  return index === -1 ? '' : index + 1;
}

function clampDefense(value) {
  const number = Number(value);
  if (!Number.isFinite(number)) {
    return 2;
  }
  return Math.min(6, Math.max(2, number));
}

function jsonResponse(payload) {
  const response = ContentService.createTextOutput(JSON.stringify(payload))
    .setMimeType(ContentService.MimeType.JSON);

  response.setHeader('Access-Control-Allow-Origin', '*');
  response.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  response.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  return response;
}
