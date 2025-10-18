const CONFIG = {
  sheetName: 'Starfort',
  headerSynonyms: {
    locationId: ['location_id', 'locationid', 'helyszin_id'],
    locationName: ['location', 'helyszin', 'location_name'],
    locationTitle: ['location_title', 'helyszin_cim', 'title'],
    locationSubtitle: ['location_subtitle', 'helyszin_alcim', 'subtitle'],
    alertLevel: ['riado', 'alert', 'alert_level'],
    sectorId: ['sector_id', 'sectorid', 'szektor_id'],
    sectorName: ['sector', 'sektor', 'negyed'],
    sectorOrder: ['sector_sorrend', 'sector_order', 'szektor_sorrend'],
    categoryId: ['category_id', 'categoryid', 'kategoria_id'],
    categoryName: ['category', 'kategoria'],
    categoryOrder: ['category_sorrend', 'category_order', 'kategoria_sorrend'],
    itemId: ['item_id', 'itemid', 'id', 'unique_id'],
    itemLabel: ['tartalom', 'item', 'nev', 'label'],
    status: ['statusz', 'status', 'allapot'],
    updatedAt: ['last_updated', 'updated_at', 'frissitve', 'timestamp']
  }
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
    const headerInfo = getHeaderInfo(sheet);

    switch (payload.action) {
      case 'add-item':
        return jsonResponse({
          success: true,
          ...handleAddItem(sheet, headerInfo, payload)
        });
      case 'update-status':
        return jsonResponse({
          success: true,
          ...handleUpdateStatus(sheet, headerInfo, payload)
        });
      case 'remove-item':
        return jsonResponse({
          success: true,
          ...handleRemoveItem(sheet, headerInfo, payload)
        });
      default:
        throw new Error(`Ismeretlen művelet: ${payload.action}`);
    }
  } catch (error) {
    console.error('❌ Hibás Apps Script hívás', error);
    return jsonResponse({ success: false, message: error.message || 'Ismeretlen hiba történt.' });
  } finally {
    lock.releaseLock();
  }
}

function parseRequest(e) {
  if (!e || !e.postData || !e.postData.contents) {
    throw new Error('Üres kérés érkezett a webhookra.');
  }

  try {
    const data = JSON.parse(e.postData.contents);
    if (!data.action) {
      throw new Error('A "action" mező megadása kötelező.');
    }
    return data;
  } catch (error) {
    throw new Error('Nem sikerült feldolgozni a JSON törzset.');
  }
}

function getTargetSheet() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(CONFIG.sheetName);
  if (!sheet) {
    throw new Error(`A(z) "${CONFIG.sheetName}" nevű munkalap nem található.`);
  }
  return sheet;
}

function getHeaderInfo(sheet) {
  const columnCount = sheet.getLastColumn();
  if (columnCount === 0) {
    throw new Error('A munkalapon nincsenek fejléc oszlopok.');
  }
  const headerValues = sheet.getRange(1, 1, 1, columnCount).getValues()[0];
  const slugMap = {};
  headerValues.forEach((value, index) => {
    slugMap[normalizeKey(value)] = index + 1;
  });

  return {
    headers: headerValues,
    columnFor(field) {
      const candidates = CONFIG.headerSynonyms[field] || [];
      for (let i = 0; i < candidates.length; i += 1) {
        const candidate = normalizeKey(candidates[i]);
        if (slugMap[candidate]) {
          return slugMap[candidate];
        }
      }
      return null;
    }
  };
}

function handleAddItem(sheet, headerInfo, data) {
  const row = findRowByItemId(sheet, headerInfo, data.itemId);
  const values = row ? row.values : new Array(headerInfo.headers.length).fill('');

  applyRowValues(values, headerInfo, data, { skipEmptyOnUpdate: Boolean(row) });

  if (row) {
    sheet.getRange(row.rowNumber, 1, 1, values.length).setValues([values]);
    return { rowNumber: row.rowNumber, updated: true };
  }

  sheet.appendRow(values);
  return { rowNumber: sheet.getLastRow(), created: true };
}

function handleUpdateStatus(sheet, headerInfo, data) {
  const row = findRowByItemId(sheet, headerInfo, data.itemId);
  if (!row) {
    throw new Error('A megadott elem nem található a táblázatban.');
  }

  const statusColumn = headerInfo.columnFor('status');
  if (!statusColumn) {
    throw new Error('A státusz oszlop nem található a táblázatban.');
  }

  const normalizedStatus = normalizeStatus(data.status);
  sheet.getRange(row.rowNumber, statusColumn).setValue(normalizedStatus);

  const updatedAtColumn = headerInfo.columnFor('updatedAt');
  if (updatedAtColumn) {
    sheet.getRange(row.rowNumber, updatedAtColumn).setValue(new Date());
  }

  return { rowNumber: row.rowNumber, status: normalizedStatus };
}

function handleRemoveItem(sheet, headerInfo, data) {
  const row = findRowByItemId(sheet, headerInfo, data.itemId);
  if (!row) {
    throw new Error('A megadott elem már nem szerepel a táblázatban.');
  }

  sheet.deleteRow(row.rowNumber);
  return { rowNumber: row.rowNumber, removed: true };
}

function findRowByItemId(sheet, headerInfo, itemId) {
  if (!itemId) {
    throw new Error('Az "itemId" mező megadása kötelező.');
  }

  const itemColumn = headerInfo.columnFor('itemId');
  if (!itemColumn) {
    throw new Error('Az "itemId" oszlop nem található a táblázatban.');
  }

  const lastRow = sheet.getLastRow();
  if (lastRow < 2) {
    return null;
  }

  const range = sheet.getRange(2, itemColumn, lastRow - 1, 1);
  const finder = range.createTextFinder(String(itemId)).matchEntireCell(true);
  const cell = finder.findNext();

  if (!cell) {
    return null;
  }

  const rowNumber = cell.getRow();
  const values = sheet.getRange(rowNumber, 1, 1, headerInfo.headers.length).getValues()[0];
  return { rowNumber, values };
}

function applyRowValues(rowValues, headerInfo, data, { skipEmptyOnUpdate = false } = {}) {
  const assignments = {
    locationId: data.locationId,
    locationName: data.locationName || data.locationTitle,
    locationTitle: data.locationTitle || data.locationName,
    locationSubtitle: data.locationSubtitle,
    alertLevel: data.alertLevel,
    sectorId: data.sectorId,
    sectorName: data.sectorName,
    sectorOrder: data.sectorOrder,
    categoryId: data.categoryId,
    categoryName: data.categoryName,
    categoryOrder: data.categoryOrder,
    itemId: data.itemId,
    itemLabel: data.label,
    status: normalizeStatus(data.status),
    updatedAt: new Date()
  };

  Object.keys(assignments).forEach(field => {
    const column = headerInfo.columnFor(field);
    if (!column) {
      return;
    }
    const value = transformFieldValue(field, assignments[field]);
    if (skipEmptyOnUpdate && value === '' && rowValues[column - 1] !== '' && rowValues[column - 1] !== null && rowValues[column - 1] !== undefined) {
      return;
    }
    rowValues[column - 1] = value;
  });
}

function transformFieldValue(field, value) {
  if (value === undefined || value === null || value === '') {
    return '';
  }

  if (field === 'alertLevel' || field === 'sectorOrder' || field === 'categoryOrder') {
    const numeric = Number(value);
    return Number.isFinite(numeric) ? numeric : '';
  }

  if (field === 'updatedAt') {
    return value instanceof Date ? value : new Date(value);
  }

  if (field === 'status') {
    return normalizeStatus(value);
  }

  return value;
}

function normalizeStatus(status) {
  const normalized = String(status || '').toLowerCase();
  return normalized === 'insider' ? 'insider' : 'info';
}

function normalizeKey(value) {
  return String(value || '')
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '');
}

function jsonResponse(payload) {
  return ContentService.createTextOutput(JSON.stringify(payload))
    .setMimeType(ContentService.MimeType.JSON);
}
