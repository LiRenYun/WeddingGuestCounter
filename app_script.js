/**
 * =========================================================================
 * 婚禮管理系統 Google Apps Script (後端 API)
 * 包含功能：
 * 1. 撈取資料 (doGet)：支援全部撈取、各分頁單獨撈取、依姓名查詢賓客資訊
 * 2. 寫入資料 (doPost)：報名 (RSVP)、祝福留言、禮金紀錄、簽到記錄、桌次分配
 * 3. 跨域處理 (doOptions)
 * =========================================================================
 */

// =========================================================================
// 1. GET 請求：撈取／讀取試算表資料
// =========================================================================
function doGet(e) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var params = e ? e.parameter : {};
    var action = params.action || 'all'; // 預設為 'all' (撈取全部)，或傳入 'checkin' | 'gift' | 'seating' | 'rsvp' | 'wish' | 'search'
    var result = {};

    // 依據 action 參數決定撈取的範圍
    if (action === 'checkin') {
      // 僅撈取「簽到紀錄」
      result = { checkin: getSheetDataAsJson(ss, "簽到紀錄") };
    } else if (action === 'gift') {
      // 僅撈取「禮金紀錄」
      result = { gift: getSheetDataAsJson(ss, "禮金紀錄") };
    } else if (action === 'seating') {
      // 僅撈取「桌次分配」
      result = { seating: getSheetDataAsJson(ss, "桌次分配") };
    } else if (action === 'rsvp') {
      // 僅撈取「報名清單」
      result = { rsvp: getSheetDataAsJson(ss, "報名清單") };
    } else if (action === 'wish') {
      // 僅撈取「祝福留言」
      result = { wish: getSheetDataAsJson(ss, "祝福留言") };
    } else if (action === 'search') {
      // 依賓客姓名快速查詢桌號與簽到狀況 (?action=search&name=王小明)
      var searchName = (params.name || "").trim();
      result = searchGuestInfo(ss, searchName);
    } else {
      // 預設一次撈取所有分頁資料
      result = {
        checkin: getSheetDataAsJson(ss, "簽到紀錄"),
        seating: getSheetDataAsJson(ss, "桌次分配"),
        gift: getSheetDataAsJson(ss, "禮金紀錄"),
        rsvp: getSheetDataAsJson(ss, "報名清單"),
        wish: getSheetDataAsJson(ss, "祝福留言")
      };
    }

    return ContentService.createTextOutput(JSON.stringify({
      status: "success",
      data: result
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      status: "error",
      error: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

// =========================================================================
// 2. POST 請求：寫入／更新資料
// =========================================================================
function doPost(e) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var data = JSON.parse(e.postData.contents);
    var timestamp = new Date(); // 使用 new Date() 記錄時間
    var formType = data.formType; // 'rsvp' | 'wish' | 'gift' | 'checkin' | 'seating'

    // ---------------------------------------------------------------------
    // (1) 報名參加 (RSVP)
    // ---------------------------------------------------------------------
    if (formType === 'rsvp') {
      var sheet = getOrCreateSheet(ss, "報名清單");
      // 若為新工作表，建立預設標題列
      if (sheet.getLastRow() === 0) {
        sheet.appendRow(["時間戳記", "姓名", "陣營", "參與人數", "葷素選擇", "兒童座椅", "備註/祝福"]);
      }

      sheet.appendRow([
        timestamp,
        data.name || "",
        data.side || "",
        data.pax || 1,
        data.diet || "",
        data.childSeat || "無",
        data.message || ""
      ]);

      // 自動將報名賓客同步至「簽到紀錄」分頁（預設狀態為未抵達）
      syncToCheckinSheet(ss, data.name, data.pax || 1);

      // 自動將報名賓客同步至「禮金紀錄」分頁（預設金額為 0）
      syncToGiftSheet(ss, data.name, data.side || "");

    // ---------------------------------------------------------------------
    // (2) 祝福留言 (Wish)
    // ---------------------------------------------------------------------
    } else if (formType === 'wish') {
      var sheet = getOrCreateSheet(ss, "祝福留言");
      if (sheet.getLastRow() === 0) {
        sheet.appendRow(["時間戳記", "姓名", "祝福話語"]);
      }

      sheet.appendRow([
        timestamp,
        data.name || "匿名親友",
        data.message || ""
      ]);

    // ---------------------------------------------------------------------
    // (3) 禮金紀錄 (Gift)
    // ---------------------------------------------------------------------
    } else if (formType === 'gift') {
      var sheet = getOrCreateSheet(ss, "禮金紀錄");

      // 強制確保標題列正確（避免手動編輯造成欄位錯位）
      if (sheet.getLastRow() === 0) {
        sheet.appendRow(["姓名", "陣營", "金額", "喜餅數量", "備註/合包明細", "更新時間"]);
      } else {
        // 檢查並修正標題列
        var headers = sheet.getRange(1, 1, 1, 6).getValues()[0];
        var correctHeaders = ["姓名", "陣營", "金額", "喜餅數量", "備註/合包明細", "更新時間"];
        var needsUpdate = false;
        for (var i = 0; i < correctHeaders.length; i++) {
          if (headers[i] !== correctHeaders[i]) {
            needsUpdate = true;
            break;
          }
        }
        if (needsUpdate) {
          sheet.getRange(1, 1, 1, 6).setValues([correctHeaders]);
        }
      }

      // 判斷是否為更新操作
      if (data.action === 'update') {
        // 依「姓名+陣營」更新金額、喜餅數量、備註與更新時間；找不到則新增
        var updated = updateGiftAmount(
          sheet, data.name, data.side, data.amount,
          Number(data.cakes) || 0, data.note || "", timestamp
        );
        if (!updated) {
          sheet.appendRow([
            data.name || "",
            data.side || "",
            Number(data.amount) || 0,
            0,
            "",
            timestamp
          ]);
        }
      } else {
        // 保留舊 append 行為（向下相容）
        // 若有多人合包傳入陣列，自動轉為逗號隔開字串 "aaa,bbb,ccc"
        var names = Array.isArray(data.name) ? data.name.join(",") : (data.name || "");

        sheet.appendRow([
          names,
          data.side || "",
          Number(data.amount) || 0,
          Number(data.cakes) || 0,
          data.note || "",
          timestamp
        ]);
      }

    // ---------------------------------------------------------------------
    // (4) 簽到記錄 (Checkin)
    // ---------------------------------------------------------------------
    } else if (formType === 'checkin') {
      var sheet = getOrCreateSheet(ss, "簽到紀錄");
      if (sheet.getLastRow() === 0) {
        sheet.appendRow(["姓名", "數量", "已抵達", "更新時間"]);
      }

      var targetName = (data.name || "").trim();
      var arrivedStatus = data.arrived !== undefined ? data.arrived : true;
      var paxCount = data.pax !== undefined ? Number(data.pax) : 1;

      // 若名單中已有此姓名則更新簽到狀態與時間；若無則新增一列
      var updated = updateCheckinStatus(sheet, targetName, arrivedStatus, timestamp);
      if (!updated) {
        sheet.appendRow([
          targetName,
          paxCount,
          arrivedStatus,
          timestamp
        ]);
      }

    // ---------------------------------------------------------------------
    // (5) 桌次分配 (Seating)
    // ---------------------------------------------------------------------
    } else if (formType === 'seating') {
      var sheet = getOrCreateSheet(ss, "桌次分配");
      if (sheet.getLastRow() === 0) {
        sheet.appendRow(["姓名", "桌號"]);
      }

      var targetName = (data.name || "").trim();
      var tableNumber = data.table || "";

      // 若名單中已有此姓名則更新桌號；若無則新增一列
      var updated = updateSeatingTable(sheet, targetName, tableNumber);
      if (!updated) {
        sheet.appendRow([targetName, tableNumber]);
      }
    }

    return ContentService.createTextOutput(JSON.stringify({ result: "success" }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ result: "error", error: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// =========================================================================
// 3. 輔助函式 (Helper Functions)
// =========================================================================

/**
 * 取得指定分頁，若不存在則自動建立
 */
function getOrCreateSheet(ss, sheetName) {
  var sheet = ss.getSheetByName(sheetName);
  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
  }
  return sheet;
}

/**
 * 將指定工作表的資料轉換為 JSON 物件陣列（第一列為屬性名稱）
 */
function getSheetDataAsJson(ss, sheetName) {
  var sheet = ss.getSheetByName(sheetName);
  if (!sheet || sheet.getLastRow() <= 1) return [];

  var data = sheet.getDataRange().getValues();
  var headers = data[0];
  var rows = [];

  for (var i = 1; i < data.length; i++) {
    var rowObj = {};
    for (var j = 0; j < headers.length; j++) {
      var key = headers[j];
      rowObj[key] = data[i][j];
    }
    rows.push(rowObj);
  }
  return rows;
}

/**
 * 查詢單一賓客的桌號與簽到狀態
 */
function searchGuestInfo(ss, name) {
  if (!name) return { error: "請提供姓名" };

  var checkinList = getSheetDataAsJson(ss, "簽到紀錄");
  var seatingList = getSheetDataAsJson(ss, "桌次分配");

  var guestCheckin = checkinList.find(function(item) {
    return item["姓名"] && item["姓名"].toString().trim() === name;
  });

  var guestSeating = seatingList.find(function(item) {
    return item["姓名"] && item["姓名"].toString().trim() === name;
  });

  return {
    name: name,
    table: guestSeating ? guestSeating["桌號"] : "未分配",
    pax: guestCheckin ? guestCheckin["數量"] : 1,
    arrived: guestCheckin ? guestCheckin["已抵達"] : false,
    updatedAt: guestCheckin ? guestCheckin["更新時間"] : ""
  };
}

/**
 * 更新簽到紀錄（比對姓名，更新第3欄已抵達、第4欄更新時間）
 */
function updateCheckinStatus(sheet, name, arrived, timestamp) {
  var lastRow = sheet.getLastRow();
  if (lastRow <= 1) return false;

  var names = sheet.getRange(2, 1, lastRow - 1, 1).getValues();
  for (var i = 0; i < names.length; i++) {
    if (names[i][0].toString().trim() === name) {
      var rowIndex = i + 2;
      sheet.getRange(rowIndex, 3).setValue(arrived);
      sheet.getRange(rowIndex, 4).setValue(timestamp);
      return true;
    }
  }
  return false;
}

/**
 * 報名時自動在「簽到紀錄」建立預設資料（已抵達設為 false）
 */
function syncToCheckinSheet(ss, name, pax) {
  if (!name) return;
  var sheet = getOrCreateSheet(ss, "簽到紀錄");
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(["姓名", "數量", "已抵達", "更新時間"]);
  }

  // 檢查是否已存在同名紀錄，避免重複新增
  var lastRow = sheet.getLastRow();
  if (lastRow > 1) {
    var names = sheet.getRange(2, 1, lastRow - 1, 1).getValues();
    for (var i = 0; i < names.length; i++) {
      if (names[i][0].toString().trim() === name.toString().trim()) return;
    }
  }
  sheet.appendRow([name, pax, false, new Date()]);
}

/**
 * 更新桌次分配（比對姓名，更新第2欄桌號）
 */
function updateSeatingTable(sheet, name, tableNumber) {
  var lastRow = sheet.getLastRow();
  if (lastRow <= 1) return false;

  var names = sheet.getRange(2, 1, lastRow - 1, 1).getValues();
  for (var i = 0; i < names.length; i++) {
    if (names[i][0].toString().trim() === name) {
      var rowIndex = i + 2;
      sheet.getRange(rowIndex, 2).setValue(tableNumber);
      return true;
    }
  }
  return false;
}

// =========================================================================
// 4. 禮金紀錄專用輔助函式
// =========================================================================

/**
 * 更新禮金紀錄：依「姓名+陣營」定位既有列，找到則更新金額、喜餅數量、備註與更新時間，並返回 true；
 * 找不到則返回 false（呼叫者可決定是否新增）。
 *
 * @param {GoogleAppsScript.Spreadsheet.Sheet} sheet - 禮金紀錄工作表
 * @param {string} name - 賓客姓名
 * @param {string} side - 陣營（男方親友 / 女方親友）
 * @param {number} amount - 新的禮金金額
 * @param {number} cakes - 喜餅數量
 * @param {string} note - 備註/合包明細
 * @param {Date} timestamp - 更新時間
 * @return {boolean} 是否成功找到並更新
 */
function updateGiftAmount(sheet, name, side, amount, cakes, note, timestamp) {
  var lastRow = sheet.getLastRow();
  if (lastRow <= 1) return false;

  // 姓名在第 1 欄（A），陣營在第 2 欄（B）
  var names = sheet.getRange(2, 1, lastRow - 1, 1).getValues();
  var sides = sheet.getRange(2, 2, lastRow - 1, 1).getValues();

  for (var i = 0; i < names.length; i++) {
    var n = names[i][0].toString().trim();
    var s = sides[i][0].toString().trim();
    if (n === name.toString().trim() && s === side.toString().trim()) {
      var rowIndex = i + 2;
      // 第 3 欄 = 金額，第 4 欄 = 喜餅數量，第 5 欄 = 備註，第 6 欄 = 更新時間
      sheet.getRange(rowIndex, 3).setValue(Number(amount));
      sheet.getRange(rowIndex, 4).setValue(Number(cakes) || 0);
      sheet.getRange(rowIndex, 5).setValue(note || "");
      sheet.getRange(rowIndex, 6).setValue(timestamp);
      return true;
    }
  }
  return false;
}

/**
 * 報名時自動在「禮金紀錄」建立預設資料（金額設為 0）。
 * 複用 syncToCheckinSheet 的模式：檢查是否已存在同名+同陣營的紀錄，沒有才新增。
 * 包在 try/catch 確保非阻塞（不影響 RSVP 主流程）。
 *
 * @param {GoogleAppsScript.Spreadsheet.Spreadsheet} ss - 活動試算表
 * @param {string} name - 賓客姓名
 * @param {string} side - 陣營
 */
function syncToGiftSheet(ss, name, side) {
  if (!name) return;
  var sheet = getOrCreateSheet(ss, "禮金紀錄");
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(["姓名", "陣營", "金額", "喜餅數量", "備註/合包明細", "更新時間"]);
  }

  // 檢查是否已存在同名+同陣營的紀錄，避免重複新增
  var lastRow = sheet.getLastRow();
  if (lastRow > 1) {
    var data = sheet.getRange(2, 1, lastRow - 1, 2).getValues();
    for (var i = 0; i < data.length; i++) {
      if (data[i][0].toString().trim() === name.toString().trim() &&
          data[i][1].toString().trim() === side.toString().trim()) {
        return; // 已存在，不重複新增
      }
    }
  }
  sheet.appendRow([name, side, 0, 0, "", new Date()]);
}

/**
 * 處理 CORS 預檢請求
 */
function doOptions(e) {
  return ContentService.createTextOutput("").setMimeType(ContentService.MimeType.TEXT);
}