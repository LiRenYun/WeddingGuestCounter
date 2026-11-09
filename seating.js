/**
 * ============================================================================
 * 金饌廳｜婚宴座位安排系統 獨立前端腳本 (seating.js)
 * 注意：本檔案完全獨立運作，不與專案其他頁面共用任何 JS
 * ============================================================================
 */
(function () {
  'use strict';

  // ==================== Configuration ====================
  const API_URL = 'https://script.google.com/macros/s/AKfycbxK7R2lWFy16dodZ3DOLEiCGqwhzUWvlEK1f_oSNQq0IxOAo1aAle919AiGm-u2io4qJQ/exec';
  const STORAGE_KEY = 'wedding_jinzhuan_seating_v1';
  const SEATS_PER_TABLE = 10;
  const MAP_WIDTH = 1496; // 平面圖寬（設計座標 1100 × POSTER_K 1.36），以 CSS zoom 縮放

  // 橘色擴充區在海報 (高 1520) 上的垂直百分比門檻
  // 海報總高 1520px，橘色框框 top: 1020px (~67.1%) ~ 1410px (~92.7%)
  const ORANGE_ZONE_Y_MIN = 67.0;

  // ==================== Default Jinzhuan Hall 15-Table Proportion Layout ====================
  // 嚴格參照使用者提供之「金饌廳 桌次配置圖」截圖比例設定預設位置：
  // 舞台位於上方中央，主桌位於舞台正下方，中央為 L 型走道，
  // 左側三排為 (10, 09)、(13, 12, 11)、(15, 14)，右側三排為 (02, 03)、(04, 05, 06)、(07, 08)
  function createEmptySeats(count = SEATS_PER_TABLE) {
    const seats = [];
    for (let i = 1; i <= count; i++) {
      seats.push({
        seatIndex: i,
        name: '',
        diet: 'meat',        // 'meat' (葷食) | 'veg' (素食)
        isChildSeat: false,  // 是否為兒童座椅（勾選後更換顯示）
        hasGift: false,      // 是否放置婚禮小物或小驚喜
        giftNote: ''         // 婚禮小物/驚喜備註
      });
    }
    return seats;
  }

  function getDefaultTables() {
    const presets = [
      // 主桌 (中央舞台下方，走道頂端上方)
      { id: 'T_MAIN', tableNumber: '主桌', alias: '雙方主婚人席', zone: 'main', x: 50.0, y: 22.8 },

      // 右上排：02, 03
      { id: 'T_02', tableNumber: '02', alias: '男方親戚席', zone: 'main', x: 75.5, y: 33.8 },
      { id: 'T_03', tableNumber: '03', alias: '女方親戚席', zone: 'main', x: 90.2, y: 33.8 },

      // 右中排：04, 05, 06
      { id: 'T_04', tableNumber: '04', alias: '男方貴賓席', zone: 'main', x: 60.8, y: 44.5 },
      { id: 'T_05', tableNumber: '05', alias: '男方摯友席', zone: 'main', x: 75.5, y: 44.5 },
      { id: 'T_06', tableNumber: '06', alias: '女方摯友席', zone: 'main', x: 90.2, y: 44.5 },

      // 右下排（水平走道上方）：07, 08
      { id: 'T_07', tableNumber: '07', alias: '大學同學席', zone: 'main', x: 60.8, y: 55.2 },
      { id: 'T_08', tableNumber: '08', alias: '同事好友席', zone: 'main', x: 75.5, y: 55.2 },

      // 左上排：10, 09
      { id: 'T_10', tableNumber: '10', alias: '女方長輩席', zone: 'main', x: 10.2, y: 33.8 },
      { id: 'T_09', tableNumber: '09', alias: '男方長輩席', zone: 'main', x: 24.8, y: 33.8 },

      // 左中排：13, 12, 11
      { id: 'T_13', tableNumber: '13', alias: '女方親友席', zone: 'main', x: 10.2, y: 44.5 },
      { id: 'T_12', tableNumber: '12', alias: '男方親友席', zone: 'main', x: 24.8, y: 44.5 },
      { id: 'T_11', tableNumber: '11', alias: '摯愛閨蜜席', zone: 'main', x: 39.2, y: 44.5 },

      // 左下排：15, 14
      { id: 'T_15', tableNumber: '15', alias: '高中死黨席', zone: 'main', x: 24.8, y: 55.2 },
      { id: 'T_14', tableNumber: '14', alias: '社團好友席', zone: 'main', x: 39.2, y: 55.2 }
    ];

    return presets.map(t => ({
      ...t,
      seats: createEmptySeats(SEATS_PER_TABLE)
    }));
  }

  // ==================== Application State ====================
  let state = {
    tables: [],
    selectedTableId: 'T_MAIN',
    selectedSeatIndex: 1,       // 1 ~ 10
    swapSourceSeatIndex: null,  // 若不為 null 代表正在進行座位對調
    highlightMode: 'all',       // 'all' | 'veg' | 'child' | 'gift' | 'empty'
    searchQuery: '',
    gridSnap: true,
    align: { multi: false, auto: true, ids: [] }, // 桌次對齊：多選模式、拖曳自動對齊、已選桌號
    zoomLevel: 1.0,
    isDirty: false,
    lastSavedAt: null,
    guardTableNumber: true,     // 桌號防呆：開啟時重複桌號會還原；關閉時允許暫時重複，方便重新排序
    batchDrafts: {},            // 整桌名單未套用的草稿（僅記憶體，依桌次 id 保存，切換桌次不會遺失）
    rsvpList: [],               // 從雲端或範例載入之報名清單
    rsvpQuery: '',
    rsvpStatus: 'all',          // 'all' | 'free' | 'assigned'
    rsvpSide: 'all',            // 'all' | 'groom' | 'bride'
    rsvpSel: -1,                // 目前在報名清單選取的索引
    poster: { showTitle: true, title: '金饌廳 桌次配置圖', showCounter: true, seatRadius: 84, seatScale: 1 }, // 座位距離／大小僅存於本機草稿
    undo: null                  // 最近一次破壞性操作前的快照
  };

  // 預設範例報名清單（當離線或雲端無資料時提供快速展示與帶入測試）
  const FALLBACK_RSVP_LIST = [
    { '姓名': '陳建宏', '陣營': '男方親友', '參與人數': 4, '葷素選擇': '葷食3, 素食1', '兒童座椅': 1, '備註/祝福': '攜帶一位寶寶需兒童椅' },
    { '姓名': '林雅婷', '陣營': '女方親友', '參與人數': 2, '葷素選擇': '素食', '兒童座椅': 0, '備註/祝福': '全素，恭喜仁雲&銳芝！' },
    { '姓名': '張家豪', '陣營': '男方親友', '參與人數': 3, '葷素選擇': '葷食', '兒童座椅': 1, '備註/祝福': '百年好合' },
    { '姓名': '黃詩涵', '陣營': '女方親友', '參與人數': 1, '葷素選擇': '葷食', '兒童座椅': 0, '備註/祝福': '抽捧花候選人' },
    { '姓名': '李冠宇', '陣營': '男方親友', '參與人數': 5, '葷素選擇': '葷食4, 素食1', '兒童座椅': 2, '備註/祝福': '全家出席' }
  ];

  // ==================== Initialization ====================
  function init() {
    loadFromLocalStorage();
    if (!Array.isArray(state.tables) || state.tables.length === 0) {
      state.tables = getDefaultTables();
      state.selectedTableId = state.tables[0].id;
      saveToLocalStorage(false);
    }

    state.rsvpList = [...FALLBACK_RSVP_LIST];
    bindEvents();
    renderAll();
    updateSyncBadge();
    fitZoom();
    renderRsvpImportList();
    // 啟動時自動在背景同步雲端真實「報名清單 (RSVP)」，若雲端有桌次分配且本機尚無自訂修改亦可隨時讀取
    fetchCloudRsvpList(true);
  }

  // ==================== Persistence (LocalStorage & Cloud GAS) ====================
  function saveToLocalStorage(markDirty = true) {
    if (markDirty) {
      state.isDirty = true;
    }
    try {
      const payload = {
        tables: state.tables,
        selectedTableId: state.selectedTableId,
        poster: state.poster,
        isDirty: state.isDirty,
        guardTableNumber: state.guardTableNumber,
        lastSavedAt: new Date().toISOString()
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
      updateSyncBadge();
    } catch (err) {
      console.warn('Failed to save to localStorage:', err);
    }
  }

  function loadFromLocalStorage() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (parsed && Array.isArray(parsed.tables) && parsed.tables.length > 0) {
        state.tables = normalizeTables(parsed.tables);
        state.selectedTableId = parsed.selectedTableId || state.tables[0].id;
        state.lastSavedAt = parsed.lastSavedAt || null;
        state.isDirty = parsed.isDirty === true;
        state.guardTableNumber = parsed.guardTableNumber !== false;
        if (parsed.poster) state.poster = { ...state.poster, ...parsed.poster };
      }
    } catch (err) {
      console.warn('Failed to load from localStorage:', err);
    }
  }

  function normalizeTables(tables) {
    return tables.map((t, idx) => {
      const seats = createEmptySeats(SEATS_PER_TABLE);
      if (Array.isArray(t.seats)) {
        t.seats.forEach((s, sIdx) => {
          const targetIdx = (Number(s.seatIndex) >= 1 && Number(s.seatIndex) <= SEATS_PER_TABLE)
            ? Number(s.seatIndex) - 1
            : sIdx;
          if (targetIdx >= 0 && targetIdx < SEATS_PER_TABLE) {
            seats[targetIdx] = {
              seatIndex: targetIdx + 1,
              name: String(s.name || '').trim(),
              diet: (s.diet === 'veg' || s.diet === '素食' || s.diet === '素') ? 'veg' : 'meat',
              isChildSeat: Boolean(s.isChildSeat === true || s.isChildSeat === '是' || s.isChildSeat === 'true'),
              hasGift: Boolean(s.hasGift === true || s.hasGift === '是' || s.hasGift === 'true' || (s.giftNote && String(s.giftNote).trim())),
              giftNote: String(s.giftNote || '').trim()
            };
          }
        });
      }
      const x = Number.isFinite(Number(t.x)) ? Number(t.x) : 50;
      const y = Number.isFinite(Number(t.y)) ? Number(t.y) : 50;
      const zone = t.zone || (y >= ORANGE_ZONE_Y_MIN ? 'orange' : 'main');
      return {
        id: String(t.id || `T_${idx + 1}`),
        tableNumber: String(t.tableNumber !== undefined ? t.tableNumber : `${idx + 1}`),
        alias: String(t.alias || ''),
        zone,
        x: Math.max(6, Math.min(94, x)),
        y: Math.max(16, Math.min(94, y)),
        seats
      };
    });
  }

  function updateSyncBadge(statusText, mode) {
    const badge = document.getElementById('sync-status-badge');
    if (!badge) return;
    const cls = mode === 'saving' ? 'saving' : (mode === 'error' ? 'error' : (state.isDirty ? 'dirty' : 'saved'));
    const fallback = {
      saving: '儲存中…',
      error: '⚠ 雲端儲存失敗，變更仍在本機草稿',
      dirty: '● 有變更尚未存到雲端',
      saved: '✓ 沒有未儲存的變更'
    };
    badge.className = 'sync-status ' + cls;
    badge.textContent = statusText || fallback[cls];
  }

  // ==================== Cloud Sync (Google Apps Script) ====================
  async function saveToCloud() {
    const dups = duplicateTableNumbers();
    if (dups.length && !window.confirm(`目前有重複桌號：${dups.join('、')}。\n依桌號比對的功能會無法分辨，確定仍要儲存至雲端？`)) return;
    const pendingDrafts = Object.keys(state.batchDrafts).filter(id => state.tables.some(t => t.id === id)).length;
    if (pendingDrafts && !window.confirm(`有 ${pendingDrafts} 桌的整桌名單尚未套用，這些內容不會被儲存。\n確定仍要儲存？`)) return;
    const saveBtn = document.getElementById('btn-save-cloud');
    if (saveBtn) saveBtn.disabled = true;
    updateSyncBadge('儲存至 Google 試算表中…', 'saving');

    const payload = {
      formType: 'seating',
      action: 'saveAll',
      tables: state.tables
    };

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(payload)
      });
      const result = await response.json();
      if (result && (result.result === 'success' || result.status === 'success')) {
        state.isDirty = false;
        saveToLocalStorage(false);
        updateSyncBadge(result.sandbox ? '沙盒：未寫入' : '✓ 已存到雲端');
        showToast(result.sandbox
          ? '沙盒模式：寫入已攔截，線上資料未變更'
          : '已將所有桌次與座位儲存至 Google 試算表');
      } else {
        throw new Error((result && result.error) || 'Unknown response');
      }
    } catch (err) {
      console.warn('Cloud save fallback notice:', err);
      saveToLocalStorage(false);
      updateSyncBadge('', 'error');
      showToast('雲端儲存失敗：變更已保存在本機草稿，請確認網路或 GAS 部署後再按「儲存至雲端」。');
    } finally {
      if (saveBtn) saveBtn.disabled = false;
    }
  }

  async function loadFromCloud() {
    updateSyncBadge('從雲端讀取中…', 'saving');
    try {
      const response = await fetch(API_URL + '?action=seating');
      const result = await response.json();
      if (result && result.status === 'success' && result.data && Array.isArray(result.data.seating)) {
        const rows = result.data.seating;
        if (rows.length === 0) {
          showToast('雲端「桌次分配」目前沒有資料，維持現有桌位。');
          updateSyncBadge();
          return;
        }
        const reconstructed = reconstructTablesFromSheetRows(rows);
        if (reconstructed.length > 0) {
          remember('從雲端讀取');
          state.tables = reconstructed;
          state.selectedTableId = state.tables[0].id;
          state.selectedSeatIndex = 1;
          state.isDirty = false;
          saveToLocalStorage(false);
          renderAll();
          showToast(`已從雲端載入 ${reconstructed.length} 桌座位配置`, true);
        }
      } else {
        throw new Error('Invalid cloud response');
      }
    } catch (err) {
      console.warn('Load cloud error:', err);
      showToast('無法連線雲端試算表，目前顯示本機草稿。');
      updateSyncBadge();
    }
  }

  // 將 Google Sheet「桌次分配」平面資料列還原為 GUI 桌次與 10 座位結構
  function reconstructTablesFromSheetRows(rows) {
    // 若試算表具備升級版欄位（含桌次ID 或 座位編號 或 X座標）
    const hasStructuredCols = rows.some(r =>
      r['桌次ID'] !== undefined || r['座位編號'] !== undefined || r['X座標'] !== undefined
    );

    if (hasStructuredCols) {
      const tableMap = new Map();
      rows.forEach((row, idx) => {
        const tblNumber = String(row['桌號'] !== undefined ? row['桌號'] : '').trim();
        const tblId = String(row['桌次ID'] || (tblNumber ? `T_${tblNumber}` : `T_ROW_${idx}`)).trim();
        if (!tableMap.has(tblId)) {
          const xVal = parseFloat(row['X座標']);
          const yVal = parseFloat(row['Y座標']);
          const zoneVal = String(row['區域'] || '').trim();
          tableMap.set(tblId, {
            id: tblId,
            tableNumber: tblNumber || String(tableMap.size + 1),
            alias: String(row['座位別稱'] || '').trim(),
            zone: (zoneVal === 'orange' || zoneVal === '橘色擴充區' || yVal >= ORANGE_ZONE_Y_MIN) ? 'orange' : 'main',
            x: Number.isFinite(xVal) ? xVal : 50,
            y: Number.isFinite(yVal) ? yVal : 50,
            seats: createEmptySeats(SEATS_PER_TABLE)
          });
        }
        const tbl = tableMap.get(tblId);
        const seatNo = parseInt(row['座位編號'], 10);
        const targetIdx = (seatNo >= 1 && seatNo <= SEATS_PER_TABLE)
          ? seatNo - 1
          : tbl.seats.findIndex(s => !s.name);
        if (targetIdx >= 0 && targetIdx < SEATS_PER_TABLE) {
          const dietRaw = String(row['飲食'] || '').trim();
          const childRaw = String(row['兒童座椅'] || '').trim();
          const giftRaw = String(row['婚禮小物'] || '').trim();
          const giftNote = String(row['小物備註'] || '').trim();
          tbl.seats[targetIdx] = {
            seatIndex: targetIdx + 1,
            name: String(row['姓名'] || row['賓客姓名'] || '').trim(),
            diet: (dietRaw.includes('素') || dietRaw === 'veg') ? 'veg' : 'meat',
            isChildSeat: (childRaw === '是' || childRaw === 'true' || childRaw === '1' || childRaw === '👶'),
            hasGift: (giftRaw === '是' || giftRaw === 'true' || giftRaw === '1' || Boolean(giftNote)),
            giftNote
          };
        }
      });
      return Array.from(tableMap.values());
    }

    // 向下相容：若試算表僅有舊版 ["姓名", "桌號"] 兩欄，智慧對應至預設金饌廳桌次
    const baseTables = getDefaultTables();
    rows.forEach(row => {
      const guestName = String(row['姓名'] || '').trim();
      const tblNum = String(row['桌號'] || '').trim();
      if (!guestName && !tblNum) return;
      let targetTable = baseTables.find(t => t.tableNumber === tblNum || t.tableNumber === tblNum.padStart(2, '0'));
      if (!targetTable) {
        targetTable = createNewTableObject('orange', tblNum || String(baseTables.length + 1), '雲端匯入桌', baseTables);
        baseTables.push(targetTable);
      }
      const emptySeat = targetTable.seats.find(s => !s.name);
      if (emptySeat) {
        emptySeat.name = guestName;
      }
    });
    return baseTables;
  }

  // ==================== Table & Seat CRUD Helpers ====================
  function getSelectedTable() {
    return state.tables.find(t => t.id === state.selectedTableId) || state.tables[0] || null;
  }

  // 桌號比對：忽略前導 0 與大小寫（"02" 與 "2" 視為相同）
  function normalizeTableNumber(v) {
    return String(v || '').trim().toLowerCase().replace(/^0+(?=\d)/, '');
  }

  // 回傳與 v 重複的其他桌桌號，無重複則為空字串
  function findDuplicateTableNumber(v, selfId) {
    const key = normalizeTableNumber(v);
    const other = state.tables.find(t => t.id !== selfId && normalizeTableNumber(t.tableNumber) === key);
    return other ? other.tableNumber : '';
  }

  function setTableNumberError(msg) {
    const el = document.getElementById('table-number-error');
    if (!el) return;
    el.textContent = msg;
    el.hidden = !msg;
  }

  // 防呆關閉時，若目前桌與其他桌重複，於欄位下方提示（不阻擋編輯）
  function refreshTableNumberWarning() {
    const table = getSelectedTable();
    const cb = document.getElementById('chk-table-number-guard');
    if (cb) cb.checked = state.guardTableNumber;
    if (state.guardTableNumber || !table) { setTableNumberError(''); return; }
    const dup = findDuplicateTableNumber(table.tableNumber, table.id);
    setTableNumberError(dup ? `桌號「${table.tableNumber}」與其他桌（${dup}）重複，存檔前請確認` : '');
  }

  // 全部重複的桌號清單（去重後），供存檔前提示
  function duplicateTableNumbers() {
    const seen = new Map();
    state.tables.forEach(t => {
      const key = normalizeTableNumber(t.tableNumber);
      seen.set(key, (seen.get(key) || 0) + 1);
    });
    return state.tables.filter(t => seen.get(normalizeTableNumber(t.tableNumber)) > 1)
      .map(t => t.tableNumber)
      .filter((v, i, arr) => arr.indexOf(v) === i);
  }

  function getNextTableNumber() {
    const used = new Set(state.tables.map(t => parseInt(t.tableNumber, 10)).filter(Number.isFinite));
    let n = 2; // 桌號從 02 起算，優先補上最小的空號
    while (used.has(n)) n++;
    return String(n).padStart(2, '0');
  }

  function createNewTableObject(zone = 'orange', customNumber = null, customAlias = '', existingList = state.tables) {
    const tblNum = customNumber || getNextTableNumber();
    const id = 'T_' + Date.now() + '_' + Math.floor(Math.random() * 1000);

    let x = 50;
    let y = 33.8;

    if (zone === 'orange') {
      const orangeTables = existingList.filter(t => t.zone === 'orange');
      const idx = orangeTables.length;
      const col = idx % 5;
      const row = Math.floor(idx / 5);
      x = 16 + col * 17;
      y = 74.5 + row * 11.2;
    } else {
      // 主廳預設找右上方或左上方空位（例如 01 桌位置 x: 60.8, y: 33.8）
      const hasRightInner = existingList.some(t => Math.abs(t.x - 60.8) < 5 && Math.abs(t.y - 33.8) < 5);
      const hasLeftInner = existingList.some(t => Math.abs(t.x - 39.2) < 5 && Math.abs(t.y - 33.8) < 5);
      if (!hasRightInner) {
        x = 60.8;
        y = 33.8;
      } else if (!hasLeftInner) {
        x = 39.2;
        y = 33.8;
      } else {
        x = 10.2;
        y = 55.2;
      }
    }

    return {
      id,
      tableNumber: tblNum,
      alias: customAlias || (zone === 'orange' ? '擴充預備席' : '貴賓親友席'),
      zone,
      x,
      y,
      seats: createEmptySeats(SEATS_PER_TABLE)
    };
  }

  function addTable(zone = 'orange', customAlias = '') {
    const newTbl = createNewTableObject(zone, null, customAlias, state.tables);
    state.tables.push(newTbl);
    state.selectedTableId = newTbl.id;
    state.selectedSeatIndex = 1;
    saveToLocalStorage(true);
    renderAll();
    showToast(`已於${zone === 'orange' ? '擴充區' : '主廳'}新增「${newTbl.tableNumber} 桌」`);
  }

  function clearOrangeZoneTables() {
    const orangeCount = state.tables.filter(t => t.zone === 'orange').length;
    if (orangeCount === 0) {
      showToast('擴充區目前沒有桌子。');
      return;
    }
    remember(`清空擴充區 ${orangeCount} 桌`);
    state.tables = state.tables.filter(t => t.zone !== 'orange');
    if (!state.tables.some(t => t.id === state.selectedTableId) && state.tables.length > 0) {
      state.selectedTableId = state.tables[0].id;
    }
    saveToLocalStorage(true);
    renderAll();
    showToast(`已清空擴充區的 ${orangeCount} 張桌子`, true);
  }

  function deleteSelectedTable() {
    if (state.tables.length <= 1) {
      showToast('至少需保留一張桌子。');
      return;
    }
    const current = getSelectedTable();
    if (!current) return;
    const removedLabel = `${current.tableNumber} (${current.alias || '未命名'})`;
    remember(`刪除桌次 ${removedLabel}`);
    state.tables = state.tables.filter(t => t.id !== current.id);
    state.selectedTableId = state.tables[0].id;
    state.selectedSeatIndex = 1;
    saveToLocalStorage(true);
    renderAll();
    showToast(`已刪除桌次：${removedLabel}`, true);
  }

  // 全部重製：二次確認後，桌次與主桌回到預設 15 桌＋主桌、所有座位清空（僅本機草稿，未儲存至雲端）
  function resetToDefaultLayout() {
    if (!window.confirm('確定要全部重製為預設 15 桌配置嗎？\n所有桌次、座位名單與標記都會清空（尚未儲存至雲端的內容也會消失）。')) return;
    if (!window.confirm('再次確認：此動作無法直接還原，確定重製？（重製後仍可用「復原」按鈕還原一次）')) return;
    remember('全部重製');
    state.tables = getDefaultTables();
    state.selectedTableId = state.tables[0].id;
    state.selectedSeatIndex = 1;
    state.swapSourceSeatIndex = null;
    state.align.ids = [];
    state.rsvpSel = -1;
    state.batchDrafts = {};
    saveToLocalStorage(true);
    renderAll();
    showToast('已全部重製為預設 15 桌配置', true);
  }

  // ==================== Undo (last destructive action) ====================
  function remember(label) {
    state.undo = { label, tables: JSON.stringify(state.tables), selectedTableId: state.selectedTableId };
  }

  function undoLast() {
    const snap = state.undo;
    if (!snap) return;
    state.undo = null;
    state.tables = JSON.parse(snap.tables);
    state.selectedTableId = state.tables.some(t => t.id === snap.selectedTableId)
      ? snap.selectedTableId
      : (state.tables[0] && state.tables[0].id);
    state.swapSourceSeatIndex = null;
    saveToLocalStorage(true);
    renderAll();
    renderRsvpImportList();
    showToast(`已復原：${snap.label}`);
  }

  // ==================== Shared helpers ====================
  const MARKS = {
    veg: { text: '素', color: '#047857' },
    child: { text: '童', color: '#92400e' },
    gift: { text: '禮', color: '#6d28d9' }
  };

  function isFilled(seat) {
    return Boolean(seat.name && seat.name.trim()) || seat.isChildSeat;
  }

  function seatMarks(seat) {
    const marks = [];
    if (seat.diet === 'veg' && isFilled(seat)) marks.push('veg');
    if (seat.isChildSeat) marks.push('child');
    if (seat.hasGift) marks.push('gift');
    return marks;
  }

  function seatedCount(table) {
    return table.seats.filter(isFilled).length;
  }

  function isMainTable(table) {
    return table.tableNumber === '主桌' || table.id === 'T_MAIN';
  }

  // 主桌優先，其次依數字桌號排序，其餘文字桌號殿後
  function sortTables(tables) {
    return [...tables].sort((a, b) => {
      const am = isMainTable(a), bm = isMainTable(b);
      if (am !== bm) return am ? -1 : 1;
      const an = parseInt(a.tableNumber, 10), bn = parseInt(b.tableNumber, 10);
      const af = Number.isFinite(an), bf = Number.isFinite(bn);
      if (af && bf && an !== bn) return an - bn;
      if (af !== bf) return af ? -1 : 1;
      return String(a.tableNumber).localeCompare(String(b.tableNumber), 'zh-Hant');
    });
  }

  function computeTotals() {
    const totals = { tables: state.tables.length, orange: 0, seated: 0, meat: 0, veg: 0, child: 0, gift: 0 };
    state.tables.forEach(t => {
      if (t.zone === 'orange') totals.orange++;
      t.seats.forEach(s => {
        if (isFilled(s)) {
          totals.seated++;
          if (s.diet === 'veg') totals.veg++; else totals.meat++;
        }
        if (s.isChildSeat) totals.child++;
        if (s.hasGift) totals.gift++;
      });
    });
    return totals;
  }

  function isFiltering() {
    return Boolean(state.searchQuery.trim()) || state.highlightMode !== 'all';
  }

  function seatMatchesSearch(seat, q) {
    return Boolean(q) && (
      (seat.name || '').toLowerCase().includes(q) ||
      (seat.giftNote || '').toLowerCase().includes(q)
    );
  }

  // 重新繪製時保留鍵盤焦點（元素以 id 重建）
  function withFocus(fn) {
    const active = document.activeElement;
    const id = active && active.id;
    fn();
    if (id && document.activeElement !== active) {
      const el = document.getElementById(id);
      if (el) el.focus({ preventScroll: true });
    }
  }

  // ==================== Rendering Engine ====================
  function renderAll() {
    withFocus(() => {
      renderStatistics();
      renderMap();
      renderJumpSelect();
      renderEditor();
      renderRsvpImportList();
    });
  }

  // 打字中使用：不重建編輯面板，避免中文輸入法組字被打斷
  function renderLive() {
    renderStatistics();
    renderMap();
    renderJumpSelect();
    renderEditorHeader();
    renderSeatDetail();
  }

  function renderStatistics() {
    const t = computeTotals();
    setText('stat-table-count', String(t.tables));
    setText('stat-seated-count', `${t.seated} / ${t.tables * SEATS_PER_TABLE}`);
    setText('stat-meat-count', String(t.meat));
    setText('stat-veg-count', String(t.veg));
    setText('stat-child-count', String(t.child));
    setText('stat-gift-count', String(t.gift));
    setText('poster-table-counter', `桌數：${t.tables} 桌`);
    setText('orange-zone-count', String(t.orange));
    applyPosterSettings();
  }

  function applyPosterSettings() {
    const p = state.poster;
    const title = document.querySelector('.poster-title');
    const counter = document.getElementById('poster-table-counter');
    if (title) { title.textContent = p.title; title.hidden = !p.showTitle; }
    if (counter) counter.hidden = !p.showCounter;
    const chkTitle = document.getElementById('chk-poster-show-title');
    const inputTitle = document.getElementById('input-poster-title');
    const chkCounter = document.getElementById('chk-poster-show-counter');
    if (chkTitle) chkTitle.checked = p.showTitle;
    if (inputTitle && document.activeElement !== inputTitle) inputTitle.value = p.title;
    if (chkCounter) chkCounter.checked = p.showCounter;
    const rr = document.getElementById('range-seat-radius');
    if (rr && document.activeElement !== rr) rr.value = String(p.seatRadius);
    setText('out-seat-radius', String(p.seatRadius));
    const rs = document.getElementById('range-seat-scale');
    const pct = Math.round(p.seatScale * 100);
    if (rs && document.activeElement !== rs) rs.value = String(pct);
    setText('out-seat-scale', pct + '%');
    updateAlignPanel();
  }

  function tableMatchesFilterAndSearch(table) {
    const q = state.searchQuery.trim().toLowerCase();
    let matchesSearch = true;
    if (q) {
      const inTableMeta =
        table.tableNumber.toLowerCase().includes(q) ||
        (table.alias || '').toLowerCase().includes(q);
      const inSeats = table.seats.some(s => seatMatchesSearch(s, q));
      matchesSearch = inTableMeta || inSeats;
    }

    let matchesHighlight = true;
    if (state.highlightMode === 'veg') {
      matchesHighlight = table.seats.some(s => s.diet === 'veg' && (s.name || s.isChildSeat));
    } else if (state.highlightMode === 'child') {
      matchesHighlight = table.seats.some(s => s.isChildSeat);
    } else if (state.highlightMode === 'gift') {
      matchesHighlight = table.seats.some(s => s.hasGift);
    } else if (state.highlightMode === 'empty') {
      matchesHighlight = table.seats.some(s => !s.name && !s.isChildSeat);
    }

    return matchesSearch && matchesHighlight;
  }

  function describeSeat(table, seat) {
    const parts = [`${table.tableNumber}桌 座位${seat.seatIndex}`];
    parts.push(seat.name && seat.name.trim() ? seat.name.trim() : (seat.isChildSeat ? '兒童座椅' : '空位'));
    if (isFilled(seat)) parts.push(seat.diet === 'veg' ? '素食' : '葷食');
    if (seat.isChildSeat) parts.push('兒童椅');
    if (seat.hasGift) parts.push(`婚禮小物${seat.giftNote ? '：' + seat.giftNote : ''}`);
    return parts.join('，');
  }

  function renderMap() {
    const layer = document.getElementById('tables-layer');
    if (!layer) return;

    const q = state.searchQuery.trim().toLowerCase();
    const filtering = isFiltering();
    const radius = state.poster.seatRadius;  // 座位中心距離（可於地圖顯示設定調整）
    const sc = state.poster.seatScale;       // 座位與名牌大小倍率
    const nodeSize = Math.round(2 * (radius + 22 * sc) + 12);
    const center = nodeSize / 2;

    layer.innerHTML = state.tables.map(table => {
      const isSelected = table.id === state.selectedTableId;
      const isMatch = tableMatchesFilterAndSearch(table);
      const seated = seatedCount(table);
      const tid = escapeHtml(table.id);

      const seatsHtml = table.seats.map((seat, idx) => {
        const angle = (idx / SEATS_PER_TABLE) * 2 * Math.PI - Math.PI / 2;
        const sx = center + radius * Math.cos(angle);
        const sy = center + radius * Math.sin(angle);
        const filled = isFilled(seat);
        const classes = ['seat-chip'];
        if (filled) classes.push('is-filled');
        if (seat.isChildSeat) classes.push('is-child');
        if (isSelected && seat.seatIndex === state.selectedSeatIndex) classes.push('is-current');
        if (seatMatchesSearch(seat, q)) classes.push('is-hit');

        const label = filled ? ((seat.name || '').trim() || '兒童').slice(0, 3) : String(seat.seatIndex);
        const marks = seatMarks(seat);
        const desc = describeSeat(table, seat);
        return `<button type="button" class="${classes.join(' ')}" id="chip-${tid}-${seat.seatIndex}"
          style="left:${sx.toFixed(1)}px;top:${sy.toFixed(1)}px"
          data-table-id="${tid}" data-seat-index="${seat.seatIndex}"
          title="${escapeHtml(desc)}" aria-label="${escapeHtml(desc)}" tabindex="-1">
          <span class="chip-name">${escapeHtml(label)}</span>${marks.length ? `<span class="chip-marks" aria-hidden="true">${marks.map(m => `<span class="mk mk-${m}">${MARKS[m].text}</span>`).join('')}</span>` : ''}
        </button>`;
      }).join('');

      const nodeClasses = ['table-node'];
      if (isMainTable(table)) nodeClasses.push('is-main');
      if (table.zone === 'orange') nodeClasses.push('is-orange');
      if (isSelected) nodeClasses.push('is-selected');
      if (state.align.ids.includes(table.id)) nodeClasses.push('is-multi');
      if (filtering) nodeClasses.push(isMatch ? 'is-match' : 'is-dim');

      return `<div class="${nodeClasses.join(' ')}" data-table-id="${tid}"
          style="left:${table.x.toFixed(2)}%;top:${table.y.toFixed(2)}%;width:${nodeSize}px;height:${nodeSize}px;--seat-scale:${sc}">
          ${seatsHtml}
          <button type="button" class="table-disc" id="disc-${tid}" data-table-id="${tid}"
            aria-pressed="${isSelected}" aria-label="${escapeHtml(`${table.tableNumber}桌 ${table.alias || ''}，已入座 ${seated}/${SEATS_PER_TABLE}`)}">
            <span class="disc-num">${escapeHtml(table.tableNumber)}</span>
            ${table.alias ? `<span class="disc-alias">${escapeHtml(table.alias)}</span>` : ''}
            <span class="disc-count">${seated}/${SEATS_PER_TABLE}</span>
          </button>
        </div>`;
    }).join('');
  }

  // 「跳到桌次」下拉選單：名單變動才重建，避免打字或開啟選單時被洗掉
  function renderJumpSelect() {
    const sel = document.getElementById('select-jump-table');
    if (!sel) return;
    const sorted = sortTables(state.tables);
    const key = sorted.map(t => `${t.id}|${t.tableNumber}|${t.alias || ''}|${t.zone}`).join('\n');
    if (sel.dataset.key !== key) {
      sel.dataset.key = key;
      sel.innerHTML = sorted.map(t =>
        `<option value="${escapeHtml(t.id)}">${escapeHtml(t.tableNumber)} 桌${t.alias ? '｜' + escapeHtml(t.alias) : ''}${t.zone === 'orange' ? '（擴充）' : ''}</option>`
      ).join('');
    }
    sel.value = state.selectedTableId;

    const q = state.searchQuery.trim();
    const matches = q ? state.tables.filter(tableMatchesFilterAndSearch).length : 0;
    setText('search-result', q ? `符合 ${matches} 桌` : '');
  }

  function renderEditor() {
    const table = getSelectedTable();
    if (!table) return;
    const inputNum = document.getElementById('input-table-number');
    const inputAlias = document.getElementById('input-table-alias');
    if (inputNum && document.activeElement !== inputNum) inputNum.value = table.tableNumber;
    if (inputAlias && document.activeElement !== inputAlias) inputAlias.value = table.alias || '';
    renderEditorHeader();
    renderSeatRows(table);
    renderSeatDetail();
    syncBatchTextarea(table);
    renderSwapTableSelect();
    refreshTableNumberWarning();
  }

  function renderEditorHeader() {
    const table = getSelectedTable();
    if (!table) return;
    const isNumeric = /^\d+$/.test(table.tableNumber);
    setText('inspector-heading', `${table.tableNumber}${isNumeric ? ' 桌' : ''}${table.alias ? '　' + table.alias : ''}`);
    setText('editor-occupancy', `${seatedCount(table)} / ${SEATS_PER_TABLE} 已入座`);
    const zoneEl = document.getElementById('editor-zone');
    if (zoneEl) {
      zoneEl.textContent = table.zone === 'orange' ? '擴充區' : '主宴會廳';
      zoneEl.classList.toggle('orange', table.zone === 'orange');
    }
  }

  function renderSeatRows(table) {
    const list = document.getElementById('seat-rows');
    if (!list) return;
    list.innerHTML = table.seats.map(seat => {
      const i = seat.seatIndex;
      const rowCls = ['seat-row'];
      if (isFilled(seat)) rowCls.push('is-filled');
      if (i === state.selectedSeatIndex) rowCls.push('is-selected');
      if (i === state.swapSourceSeatIndex) rowCls.push('is-swap-src');
      const veg = seat.diet === 'veg';
      return `<li class="${rowCls.join(' ')}" data-row-seat="${i}">
        <label class="seat-no" for="seat-${i}-name"><span aria-hidden="true">${i}</span><span class="visually-hidden">${i} 號座位姓名</span></label>
        <input type="text" class="input seat-name" id="seat-${i}-name" data-seat-name="${i}"
          value="${escapeHtml(seat.name || '')}" placeholder="${seat.isChildSeat ? '兒童座椅' : '空位'}" autocomplete="off" enterkeyhint="next">
        <button type="button" class="mark-toggle m-veg" id="seat-${i}-veg" data-toggle="veg" aria-pressed="${veg}" aria-label="${i} 號素食" title="素食">素</button>
        <button type="button" class="mark-toggle m-child" id="seat-${i}-child" data-toggle="child" aria-pressed="${seat.isChildSeat}" aria-label="${i} 號兒童椅" title="兒童椅">童</button>
        <button type="button" class="mark-toggle m-gift" id="seat-${i}-gift" data-toggle="gift" aria-pressed="${seat.hasGift}" aria-label="${i} 號婚禮小物" title="婚禮小物">禮</button>
      </li>`;
    }).join('');
  }

  // 只更新列狀態，不重建輸入框
  function updateSeatRowState() {
    const table = getSelectedTable();
    if (!table) return;
    document.querySelectorAll('#seat-rows .seat-row').forEach(row => {
      const i = parseInt(row.dataset.rowSeat, 10);
      const seat = table.seats[i - 1];
      if (!seat) return;
      row.classList.toggle('is-filled', isFilled(seat));
      row.classList.toggle('is-selected', i === state.selectedSeatIndex);
      row.classList.toggle('is-swap-src', i === state.swapSourceSeatIndex);
      const gift = row.querySelector('[data-toggle="gift"]');
      if (gift) gift.setAttribute('aria-pressed', String(seat.hasGift));
    });
  }

  function renderSeatDetail() {
    const table = getSelectedTable();
    const seat = getSelectedSeatObject();
    if (!table || !seat) return;

    setText('editor-seat-badge', `座位 #${seat.seatIndex}`);
    const tags = [];
    if (seat.name) tags.push(seat.name);
    if (seat.isChildSeat) tags.push('兒童椅');
    if (isFilled(seat)) tags.push(seat.diet === 'veg' ? '素食' : '葷食');
    if (seat.hasGift) tags.push(`小物${seat.giftNote ? '：' + seat.giftNote : ''}`);
    setText('editor-seat-status', tags.length ? `（${tags.join('・')}）` : '（空位）');

    const giftNoteInput = document.getElementById('input-seat-gift-note');
    if (giftNoteInput && document.activeElement !== giftNoteInput) {
      giftNoteInput.value = seat.giftNote || '';
    }

    const btnSwap = document.getElementById('btn-swap-seat-mode');
    if (btnSwap) {
      const swapping = state.swapSourceSeatIndex === seat.seatIndex;
      btnSwap.setAttribute('aria-pressed', String(swapping));
      btnSwap.textContent = swapping ? '請點選要對調的座位（再按取消）' : '與本桌其他座位對調';
    }
  }

  // 未套用的整桌名單草稿數量（切換桌次時保留，套用後清除）
  function updateBatchDraftStatus() {
    const el = document.getElementById('batch-draft-status');
    if (!el) return;
    const n = Object.keys(state.batchDrafts).filter(id => state.tables.some(t => t.id === id)).length;
    el.textContent = `有 ${n} 桌的名單尚未套用（切換桌次會保留；按「套用名單至本桌」才會寫入，存檔前也請先套用）`;
    el.hidden = n === 0;
  }

  function syncBatchTextarea(table) {
    const textarea = document.getElementById('textarea-batch-seats');
    if (!textarea || document.activeElement === textarea) return;
    updateBatchDraftStatus();

    if (state.batchDrafts[table.id] !== undefined) {
      textarea.value = state.batchDrafts[table.id];
      return;
    }
    const lines = table.seats.map(seat => {
      const parts = [];
      if (seat.name) parts.push(seat.name);
      if (seat.diet === 'veg' && (seat.name || seat.isChildSeat)) parts.push('素食');
      if (seat.isChildSeat) parts.push('兒童椅');
      if (seat.hasGift) {
        parts.push(seat.giftNote ? `小物:${seat.giftNote}` : '小物');
      }
      return parts.join(', ');
    });
    textarea.value = lines.join('\n');
  }

  // ==================== Batch Text Parsing & Whole-Table Updates ====================
  function applyBatchTextToTable() {
    const table = getSelectedTable();
    const textarea = document.getElementById('textarea-batch-seats');
    if (!table || !textarea) return;
    remember(`整桌名單套用（${table.tableNumber} 桌）`);

    const rawLines = textarea.value.split(/\r?\n/);
    for (let i = 0; i < SEATS_PER_TABLE; i++) {
      const line = (rawLines[i] || '').trim();
      if (!line) {
        table.seats[i] = {
          seatIndex: i + 1,
          name: '',
          diet: 'meat',
          isChildSeat: false,
          hasGift: false,
          giftNote: ''
        };
        continue;
      }

      const tokens = line.split(/[,，、/｜|]+/).map(s => s.trim()).filter(Boolean);
      let name = '';
      let diet = 'meat';
      let isChildSeat = false;
      let hasGift = false;
      let giftNote = '';

      tokens.forEach((tok, idx) => {
        const lower = tok.toLowerCase();
        if (tok === '素' || tok === '素食' || lower === 'veg') {
          diet = 'veg';
        } else if (tok === '葷' || tok === '葷食' || lower === 'meat') {
          diet = 'meat';
        } else if (tok.includes('兒童') || tok.includes('寶寶') || tok.includes('安全椅') || lower === 'child') {
          isChildSeat = true;
          if (idx === 0 && tokens.length === 1) {
            name = tok;
          }
        } else if (tok.startsWith('小物:') || tok.startsWith('小物：') || tok.startsWith('驚喜:') || tok.startsWith('驚喜：')) {
          hasGift = true;
          giftNote = tok.replace(/^(小物|驚喜)[:：]/, '').trim();
        } else if (tok === '小物' || tok === '婚禮小物' || tok === '驚喜' || tok === '小驚喜') {
          hasGift = true;
        } else if (!name) {
          name = tok;
        } else {
          // 額外描述視為婚禮小物或驚喜備註
          hasGift = true;
          giftNote = giftNote ? `${giftNote} ${tok}` : tok;
        }
      });

      table.seats[i] = {
        seatIndex: i + 1,
        name,
        diet,
        isChildSeat,
        hasGift,
        giftNote
      };
    }

    delete state.batchDrafts[table.id];
    saveToLocalStorage(true);
    renderAll();
    showToast(`已套用「${table.tableNumber} 桌」1～10 號座位名單`, true);
  }

  // 與其他桌對調：座位名單與桌名互換，桌號、座標與區域保持不變
  function renderSwapTableSelect() {
    const sel = document.getElementById('select-swap-table');
    const current = getSelectedTable();
    if (!sel || !current) return;
    const others = sortTables(state.tables).filter(t => t.id !== current.id);
    const html = others.map(t =>
      `<option value="${escapeHtml(t.id)}">${escapeHtml(t.tableNumber)} 桌${t.alias ? '｜' + escapeHtml(t.alias) : ''}</option>`
    ).join('');
    if (sel.dataset.key !== html) {
      sel.dataset.key = html;
      sel.innerHTML = html;
    }
  }

  function swapTableContentWithSelected() {
    const table = getSelectedTable();
    const sel = document.getElementById('select-swap-table');
    const other = sel && state.tables.find(t => t.id === sel.value);
    if (!table || !other || other.id === table.id) {
      showToast('請先選擇要對調的另一桌。');
      return;
    }
    remember(`與 ${other.tableNumber} 桌對調名單與桌名`);
    [table.seats, other.seats] = [other.seats, table.seats];
    [table.alias, other.alias] = [other.alias, table.alias];
    delete state.batchDrafts[table.id];
    delete state.batchDrafts[other.id];
    saveToLocalStorage(true);
    renderAll();
    showToast(`已對調 ${table.tableNumber} 桌與 ${other.tableNumber} 桌的名單與桌名（桌號不變）`, true);
  }

  // ==================== RSVP Import to Current Table ====================
  async function fetchCloudRsvpList(silent = false) {
    try {
      const response = await fetch(API_URL + '?action=rsvp');
      const result = await response.json();
      if (result && result.status === 'success' && result.data && Array.isArray(result.data.rsvp) && result.data.rsvp.length > 0) {
        state.rsvpList = result.data.rsvp;
        state.rsvpSel = -1;
        renderRsvpImportList();
        if (!silent) {
          showToast(`已同步 ${state.rsvpList.length} 筆雲端報名清單`);
        }
        return;
      }
    } catch (err) {
      console.warn('RSVP fetch fallback:', err);
    }
    renderRsvpImportList();
    if (!silent) {
      showToast('無法取得雲端報名清單，目前顯示範例資料。');
    }
  }

  // 報名「葷素選擇」→ 葷／素人數。支援「葷:1,素:1」「葷食3, 素食1」「素食」「葷食」等格式；未填數字的人數視為葷食
  function parseDietCounts(dietStr, pax) {
    const str = String(dietStr || '');
    let meat = 0;
    let veg = 0;
    let matched = false;
    for (const m of str.matchAll(/(葷|素)食?\s*[:：]?\s*(\d+)/g)) {
      matched = true;
      if (m[1] === '葷') meat += parseInt(m[2], 10); else veg += parseInt(m[2], 10);
    }
    if (!matched) {
      if (str.includes('素') && !str.includes('葷')) veg = pax; else meat = pax;
    }
    meat = Math.min(meat, pax);
    veg = Math.min(veg, pax - meat);
    meat += pax - meat - veg;
    return { meat, veg };
  }

  // 某筆報名在所有桌次的帶入狀況（依姓名比對：本人＝姓名，同行＝姓名(攜伴N)／姓名(兒童椅)）
  function rsvpImportStatus(item) {
    const base = String(item['姓名'] || '').trim();
    const pax = Math.max(1, parseInt(item['參與人數'], 10) || 1);
    const diet = parseDietCounts(item['葷素選擇'], pax);
    const tables = [];
    let imported = 0;
    let importedVeg = 0;
    state.tables.forEach(t => {
      t.seats.forEach(s => {
        if (!s.name || !(s.name === base || s.name.startsWith(base + '('))) return;
        imported++;
        if (s.diet === 'veg') importedVeg++;
        if (!tables.includes(t.tableNumber)) tables.push(t.tableNumber);
      });
    });
    const remaining = Math.max(0, pax - imported);
    const remVeg = Math.min(Math.max(0, diet.veg - importedVeg), remaining);
    return { base, pax, diet, imported, remaining, remVeg, remMeat: remaining - remVeg, tables };
  }

  // 帶入 n 位時的葷素分配：葷食優先，其餘為素食
  function importSplit(status, n) {
    const meat = Math.min(status.remMeat, n);
    return { meat, veg: n - meat };
  }

  function rsvpFilteredRows() {
    const q = state.rsvpQuery.trim().toLowerCase();
    return state.rsvpList.map((item, idx) => ({ idx, item, st: rsvpImportStatus(item) })).filter(({ item, st }) => {
      if (state.rsvpStatus === 'free' && st.imported > 0) return false;
      if (state.rsvpStatus === 'assigned' && st.imported === 0) return false;
      const side = String(item['陣營'] || '');
      if (state.rsvpSide === 'groom' && !side.includes('男方')) return false;
      if (state.rsvpSide === 'bride' && !side.includes('女方')) return false;
      if (q && !st.base.toLowerCase().includes(q)) return false;
      return true;
    });
  }

  // 名單：每列只顯示姓名、陣營、人數與葷素、狀態，點選後由下方操作列帶入
  function renderRsvpImportList() {
    const container = document.getElementById('rsvp-card-list');
    if (!container) return;
    const countEl = document.getElementById('rsvp-count');

    if (!state.rsvpList || state.rsvpList.length === 0) {
      container.innerHTML = '<li class="empty-state">尚無報名資料，按「重新同步」從雲端讀取。</li>';
      if (countEl) countEl.textContent = '';
    } else {
      const shown = rsvpFilteredRows();
      if (countEl) countEl.textContent = `顯示 ${shown.length} / ${state.rsvpList.length} 組`;
      container.innerHTML = shown.length === 0
        ? '<li class="empty-state">沒有符合條件的賓客。</li>'
        : shown.map(({ idx, item, st }) => {
          const side = String(item['陣營'] || '').trim();
          const done = st.remaining === 0;
          const selected = idx === state.rsvpSel;
          let badge;
          if (done) badge = '<span class="rsvp-badge ok">已全數</span>';
          else if (st.imported > 0) badge = `<span class="rsvp-badge part">尚餘 ${st.remaining}</span>`;
          else badge = '<span class="rsvp-badge">未排入</span>';
          const tables = st.tables.length ? ` · ${escapeHtml(st.tables.join('、'))} 桌` : '';
          return `<li><button type="button" class="rsvp-row${selected ? ' is-selected' : ''}" data-rsvp-idx="${idx}" aria-pressed="${selected}"${done ? ' disabled' : ''}>
              <span class="rsvp-main"><span class="rsvp-name">${escapeHtml(st.base)}</span><span class="rsvp-side">${escapeHtml(side || '親友')}</span></span>
              <span class="rsvp-sub">${st.pax} 人・葷 ${st.diet.meat}／素 ${st.diet.veg}${tables}</span>
              ${badge}
            </button></li>`;
        }).join('');
    }
    renderRsvpBar();
  }

  // 下方操作列：顯示目前選取的報名、可帶入人數與葷素分配
  function renderRsvpBar() {
    const nameEl = document.getElementById('rsvp-sel-name');
    if (!nameEl) return;
    const metaEl = document.getElementById('rsvp-sel-meta');
    const splitEl = document.getElementById('rsvp-split');
    const input = document.getElementById('input-rsvp-count');
    const btn = document.getElementById('btn-rsvp-import');
    const item = state.rsvpSel >= 0 ? state.rsvpList[state.rsvpSel] : null;

    if (!item) {
      nameEl.textContent = '請從上方名單選擇';
      metaEl.textContent = '';
      splitEl.textContent = '';
      input.disabled = true;
      btn.disabled = true;
      btn.textContent = '帶入本桌';
      return;
    }

    const table = getSelectedTable();
    const emptyInTable = table ? table.seats.filter(s => !s.name && !s.isChildSeat).length : 0;
    const st = rsvpImportStatus(item);
    const max = Math.min(st.remaining, emptyInTable);
    const n = Math.floor(Number(input.value));
    const valid = Number.isFinite(n) && n >= 1 && n <= max;

    nameEl.textContent = st.base;
    metaEl.textContent = `尚餘 ${st.remaining} 位・本桌空位 ${emptyInTable}`;
    input.disabled = max === 0;
    input.max = String(Math.max(1, max));
    btn.disabled = max === 0;
    if (valid) {
      const split = importSplit(st, n);
      splitEl.textContent = `將帶入：葷 ${split.meat}・素 ${split.veg}`;
      btn.textContent = `帶入 ${n} 位`;
    } else {
      splitEl.textContent = max === 0 ? (st.remaining === 0 ? '已全數帶入' : '本桌已無空位') : `請輸入 1～${max} 位`;
      btn.textContent = '帶入本桌';
      btn.disabled = true;
    }
  }

  // 帶入報名中的 requested 位賓客到目前選取的桌子
  function importRsvpGuestToCurrentTable(rsvpIndex, requested) {
    const item = state.rsvpList[rsvpIndex];
    const table = getSelectedTable();
    if (!item || !table) return;

    const st = rsvpImportStatus(item);
    if (st.remaining === 0) {
      showToast(`「${st.base}」已全數帶入，若要重新帶入請先清空原座位`, true);
      return;
    }
    const emptySeats = table.seats.filter(s => !s.name && !s.isChildSeat);
    const n = Math.floor(Number(requested));
    if (!Number.isFinite(n) || n < 1 || n > st.remaining) {
      showToast(`請輸入 1～${st.remaining} 之間的人數`);
      return;
    }
    if (n > emptySeats.length) {
      showToast(`「${table.tableNumber} 桌」只剩 ${emptySeats.length} 個空位，無法帶入 ${n} 位。`);
      return;
    }

    const split = importSplit(st, n);
    const childTotal = Math.max(0, parseInt(item['兒童座椅'], 10) || 0);
    const childImported = state.tables.reduce((sum, t) =>
      sum + t.seats.filter(s => s.name && s.name.startsWith(st.base + '(兒童椅)')).length, 0);
    let childLeft = Math.min(Math.max(0, childTotal - childImported), n);

    for (let i = 0; i < n; i++) {
      const seat = emptySeats[i];
      const p = st.imported + i; // 已帶入人數之後的序號
      const isChild = p > 0 && childLeft > 0 && i >= n - childLeft; // 第一位本人不標為兒童椅
      if (isChild) childLeft--;
      seat.name = p === 0 ? st.base
        : (isChild ? `${st.base}(兒童椅)` : `${st.base}(攜伴${p + 1})`);
      seat.diet = i < split.meat ? 'meat' : 'veg';
      seat.isChildSeat = isChild;
    }

    saveToLocalStorage(true);
    renderAll();
    showToast(`已將「${st.base}」帶入 ${table.tableNumber} 桌 ${n} 位（葷 ${split.meat}・素 ${split.veg}）`);
  }

  // ==================== Excel (.xlsx) & JSON Export / Import ====================
  function exportToExcel() {
    const seatRows = [];
    const tableRows = [];

    state.tables.forEach(t => {
      const seated = t.seats.filter(s => (s.name && s.name.trim()) || s.isChildSeat).length;
      const vegs = t.seats.filter(s => (s.name || s.isChildSeat) && s.diet === 'veg').length;
      const childs = t.seats.filter(s => s.isChildSeat).length;
      const gifts = t.seats.filter(s => s.hasGift).length;

      tableRows.push({
        '桌次ID': t.id,
        '桌號': t.tableNumber,
        '座位別稱': t.alias || '',
        '區域': t.zone === 'orange' ? '橘色擴充區' : '主宴會廳',
        'X座標': Number(t.x.toFixed(2)),
        'Y座標': Number(t.y.toFixed(2)),
        '座位上限': SEATS_PER_TABLE,
        '已坐人數': seated,
        '素食人數': vegs,
        '兒童座椅數': childs,
        '婚禮小物數': gifts
      });

      t.seats.forEach(s => {
        seatRows.push({
          '姓名': s.name || '',
          '桌號': t.tableNumber,
          '座位別稱': t.alias || '',
          '座位編號': s.seatIndex,
          '飲食': s.diet === 'veg' ? '素食' : '葷食',
          '兒童座椅': s.isChildSeat ? '是' : '否',
          '婚禮小物': s.hasGift ? '是' : '否',
          '小物備註': s.giftNote || '',
          '桌次ID': t.id,
          '區域': t.zone === 'orange' ? 'orange' : 'main',
          'X座標': Number(t.x.toFixed(2)),
          'Y座標': Number(t.y.toFixed(2))
        });
      });
    });

    if (typeof XLSX !== 'undefined' && XLSX.utils) {
      const wb = XLSX.utils.book_new();
      const wsSeats = XLSX.utils.json_to_sheet(seatRows);
      const wsTables = XLSX.utils.json_to_sheet(tableRows);
      XLSX.utils.book_append_sheet(wb, wsSeats, '座位明細表');
      XLSX.utils.book_append_sheet(wb, wsTables, '桌次配置表');
      XLSX.writeFile(wb, '金饌廳_婚宴座位安排表.xlsx');
      showToast('已匯出 Excel：金饌廳_婚宴座位安排表.xlsx');
    } else {
      // Fallback: 匯出 JSON 檔案
      const blob = new Blob([JSON.stringify({ tables: state.tables }, null, 2)], { type: 'application/json' });
      downloadBlob(blob, '金饌廳_婚宴座位安排表.json');
      showToast('已匯出座位設定檔 (.json)');
    }
  }

  function handleImportFile(file) {
    if (!file) return;
    const fileName = file.name.toLowerCase();

    if (fileName.endsWith('.json')) {
      const reader = new FileReader();
      reader.onload = e => {
        try {
          const parsed = JSON.parse(e.target.result);
          const rawTables = Array.isArray(parsed) ? parsed : parsed.tables;
          if (Array.isArray(rawTables) && rawTables.length > 0) {
            remember('匯入 JSON');
            state.tables = normalizeTables(rawTables);
            state.selectedTableId = state.tables[0].id;
            state.selectedSeatIndex = 1;
            saveToLocalStorage(true);
            renderAll();
            showToast(`已從 JSON 匯入 ${state.tables.length} 桌座位配置`, true);
          }
        } catch (err) {
          showToast('JSON 檔案格式不正確，請確認內容。');
        }
      };
      reader.readAsText(file);
      return;
    }

    // Excel (.xlsx / .xls) 匯入解析
    if (typeof XLSX === 'undefined') {
      showToast('Excel 解析元件未載入，請改用 JSON 檔案匯入。');
      return;
    }

    const reader = new FileReader();
    reader.onload = e => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });

        // 優先讀取「座位明細表」或第一個分頁
        const sheetName = workbook.SheetNames.includes('座位明細表')
          ? '座位明細表'
          : workbook.SheetNames[0];
        const rows = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], { defval: '' });

        // 若有「桌次配置表」也一併讀取其座標與別稱
        let configRows = [];
        if (workbook.SheetNames.includes('桌次配置表')) {
          configRows = XLSX.utils.sheet_to_json(workbook.Sheets['桌次配置表'], { defval: '' });
        }

        const reconstructed = reconstructTablesFromSheetRows(rows);
        if (configRows.length > 0) {
          configRows.forEach(cfg => {
            const target = reconstructed.find(t =>
              t.id === String(cfg['桌次ID'] || '').trim() ||
              t.tableNumber === String(cfg['桌號'] || '').trim()
            );
            if (target) {
              if (cfg['座位別稱']) target.alias = String(cfg['座位別稱']).trim();
              if (Number.isFinite(parseFloat(cfg['X座標']))) target.x = parseFloat(cfg['X座標']);
              if (Number.isFinite(parseFloat(cfg['Y座標']))) target.y = parseFloat(cfg['Y座標']);
              if (String(cfg['區域'] || '').includes('橘色')) target.zone = 'orange';
            }
          });
        }

        if (reconstructed.length > 0) {
          remember('匯入 Excel');
          state.tables = normalizeTables(reconstructed);
          state.selectedTableId = state.tables[0].id;
          state.selectedSeatIndex = 1;
          saveToLocalStorage(true);
          renderAll();
          showToast(`已從 Excel 匯入 ${state.tables.length} 桌座位設定`, true);
        } else {
          showToast('Excel 中找不到桌次資料列。');
        }
      } catch (err) {
        console.error('Excel import error:', err);
        showToast('匯入 Excel 失敗，請確認檔案格式。');
      }
    };
    reader.readAsArrayBuffer(file);
  }

  // ==================== Printable Seating Chart (SVG → PNG / print) ====================
  const EVENT_LABEL = '婚宴日期 2026/11/29（日）11:00 入場';
  const CHART = { cardW: 300, rowH: 28, head: 66, gap: 16, pad: 32, top: 168, minW: 960 };
  const CHART_FONT = "'Noto Sans TC','Microsoft JhengHei','PingFang TC','Heiti TC','Noto Sans CJK TC',sans-serif";

  function truncChars(str, max) {
    const chars = Array.from(String(str || ''));
    return chars.length > max ? chars.slice(0, Math.max(1, max - 1)).join('') + '…' : chars.join('');
  }

  function formatNow() {
    const d = new Date();
    const p = n => String(n).padStart(2, '0');
    return `${d.getFullYear()}/${p(d.getMonth() + 1)}/${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`;
  }

  // 從記憶體資料產生座位圖 SVG（PNG 與列印共用）
  // shortcut: 一律排成單頁網格，約 25 桌以上列印字級會低於 6pt；桌數再增加時改為分頁輸出
  function buildChartSvg() {
    const tables = sortTables(state.tables);
    const n = Math.max(1, tables.length);
    const { cardW, rowH, head, gap, pad, top, minW } = CHART;
    const cardH = head + SEATS_PER_TABLE * rowH + 12;

    // 選擇欄數：讓整張圖縮放到 A4 橫式（277 x 194 mm）時字最大
    let best = null;
    for (let cols = 1; cols <= Math.min(10, n); cols++) {
      const rows = Math.ceil(n / cols);
      const w = Math.max(minW, pad * 2 + cols * cardW + (cols - 1) * gap);
      const h = top + rows * cardH + (rows - 1) * gap + pad;
      const scale = Math.min(277 / w, 194 / h);
      if (!best || scale > best.scale) best = { cols, w, h, scale };
    }
    const { cols, w, h } = best;
    const gridW = cols * cardW + (cols - 1) * gap;
    const x0 = (w - gridW) / 2;
    const totals = computeTotals();
    const out = [];

    out.push(`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" font-family="${CHART_FONT}" role="img" aria-label="金饌廳 桌次座位圖">`);
    out.push(`<rect width="${w}" height="${h}" fill="#ffffff"/>`);
    out.push(`<text x="${pad}" y="62" font-size="40" font-weight="900" fill="#1c4b5c">金饌廳 桌次座位圖</text>`);
    out.push(`<text x="${pad}" y="100" font-size="18" fill="#12303a">${EVENT_LABEL}｜共 ${totals.tables} 桌，已入座 ${totals.seated} 位（葷 ${totals.meat}／素 ${totals.veg}／兒童椅 ${totals.child}／小物 ${totals.gift}）</text>`);

    // Legend
    let lx = pad;
    [['veg', '素食'], ['child', '兒童椅'], ['gift', '婚禮小物']].forEach(([key, label]) => {
      out.push(`<rect x="${lx}" y="118" width="22" height="22" rx="4" fill="${MARKS[key].color}"/>`);
      out.push(`<text x="${lx + 11}" y="135" font-size="15" font-weight="800" fill="#fff" text-anchor="middle">${MARKS[key].text}</text>`);
      out.push(`<text x="${lx + 30}" y="135" font-size="16" fill="#12303a">${label}</text>`);
      lx += 30 + label.length * 16 + 24;
    });
    out.push(`<text x="${lx}" y="135" font-size="16" fill="#4f6670">未標示＝葷食</text>`);
    out.push(`<text x="${w - pad}" y="135" font-size="14" fill="#4f6670" text-anchor="end">輸出時間 ${formatNow()}</text>`);

    tables.forEach((t, idx) => {
      const x = x0 + (idx % cols) * (cardW + gap);
      const y = top + Math.floor(idx / cols) * (cardH + gap);
      const isMain = isMainTable(t);
      const isOrange = t.zone === 'orange';
      const headFill = isMain ? '#fbeccb' : (isOrange ? '#ffedd5' : '#e3f2f5');
      const stroke = isMain ? '#b7862f' : (isOrange ? '#c2410c' : '#7fb8c3');
      const numLabel = /^\d+$/.test(t.tableNumber) ? `${t.tableNumber} 桌` : t.tableNumber;
      const vegs = t.seats.filter(s => isFilled(s) && s.diet === 'veg').length;
      const seated = seatedCount(t);
      const childs = t.seats.filter(s => s.isChildSeat).length;
      const gifts = t.seats.filter(s => s.hasGift).length;
      let counts = `葷 ${seated - vegs}　素 ${vegs}`;
      if (childs) counts += `　童 ${childs}`;
      if (gifts) counts += `　禮 ${gifts}`;
      const alias = truncChars(t.alias || '', isOrange ? 6 : 9) + (isOrange ? '（擴充區）' : '');

      out.push(`<g transform="translate(${x},${y})">`);
      out.push(`<rect width="${cardW}" height="${cardH}" rx="12" fill="#fff" stroke="${stroke}" stroke-width="2"/>`);
      out.push(`<path d="M1 13 A12 12 0 0 1 13 1 H${cardW - 13} A12 12 0 0 1 ${cardW - 1} 13 V${head} H1 Z" fill="${headFill}"/>`);
      out.push(`<text x="14" y="31" font-size="24" font-weight="800" fill="#1c4b5c">${escapeHtml(truncChars(numLabel, 8))}</text>`);
      out.push(`<text x="${cardW - 14}" y="31" font-size="16" font-weight="700" fill="#12303a" text-anchor="end">${seated}/${SEATS_PER_TABLE} 人</text>`);
      out.push(`<text x="14" y="56" font-size="15" fill="#12303a">${escapeHtml(alias)}</text>`);
      out.push(`<text x="${cardW - 14}" y="56" font-size="14" fill="#4f6670" text-anchor="end">${counts}</text>`);

      t.seats.forEach((seat, i) => {
        const ry = head + 8 + i * rowH;
        const filled = isFilled(seat);
        const marks = seatMarks(seat);
        const maxChars = Math.floor((cardW - 42 - 16 - marks.length * 26) / 18);
        const name = filled ? ((seat.name || '').trim() || '兒童座椅') : '（空位）';
        if (i > 0) out.push(`<line x1="10" x2="${cardW - 10}" y1="${ry}" y2="${ry}" stroke="#e3edf0"/>`);
        out.push(`<text x="24" y="${ry + 20}" font-size="14" font-weight="700" fill="#4f6670" text-anchor="middle">${seat.seatIndex}</text>`);
        out.push(`<text x="42" y="${ry + 20}" font-size="18" font-weight="${filled ? 600 : 400}" fill="${filled ? '#12303a' : '#64748b'}">${escapeHtml(truncChars(name, maxChars))}</text>`);
        marks.forEach((m, k) => {
          const mx = cardW - 12 - 22 - (marks.length - 1 - k) * 26;
          out.push(`<rect x="${mx}" y="${ry + 4}" width="22" height="20" rx="4" fill="${MARKS[m].color}"/>`);
          out.push(`<text x="${mx + 11}" y="${ry + 19}" font-size="14" font-weight="800" fill="#fff" text-anchor="middle">${MARKS[m].text}</text>`);
        });
      });
      out.push('</g>');
    });

    out.push('</svg>');
    return { svg: out.join(''), w, h };
  }

  function downloadBlob(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  function exportChartPng() {
    const { svg, w, h } = buildChartSvg();
    const svgUrl = URL.createObjectURL(new Blob([svg], { type: 'image/svg+xml;charset=utf-8' }));
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = w * 2;
      canvas.height = h * 2;
      const ctx = canvas.getContext('2d');
      ctx.scale(2, 2);
      ctx.drawImage(img, 0, 0, w, h);
      URL.revokeObjectURL(svgUrl);
      canvas.toBlob(blob => {
        if (!blob) {
          showToast('座位圖輸出失敗，請改用「列印座位圖」。');
          return;
        }
        downloadBlob(blob, '金饌廳_桌次座位圖.png');
        showToast('已輸出座位圖：金饌廳_桌次座位圖.png');
      }, 'image/png');
    };
    img.onerror = () => {
      URL.revokeObjectURL(svgUrl);
      showToast('座位圖輸出失敗，請改用「列印座位圖」。');
    };
    img.src = svgUrl;
  }

  function fillPrintChart() {
    const holder = document.getElementById('print-chart');
    if (holder) holder.innerHTML = buildChartSvg().svg;
  }

  // ==================== Map: select, drag, keyboard move ====================
  let dragContext = null;

  function selectTable(tableId, keepMapDom = false) {
    if (!state.tables.some(t => t.id === tableId)) return;
    if (state.selectedTableId !== tableId) {
      state.selectedTableId = tableId;
      state.swapSourceSeatIndex = null;
    }
    withFocus(() => {
      if (keepMapDom) {
        document.querySelectorAll('.table-node').forEach(el => {
          const on = el.dataset.tableId === tableId;
          el.classList.toggle('is-selected', on);
          const disc = el.querySelector('.table-disc');
          if (disc) disc.setAttribute('aria-pressed', String(on));
        });
      } else {
        renderMap();
      }
      renderJumpSelect();
      renderEditor();
    });
  }

  function centerOnTable(tableId) {
    const scroller = document.getElementById('map-scroller');
    const node = document.querySelector(`.table-node[data-table-id="${CSS.escape(tableId)}"]`);
    if (!scroller || !node) return;
    const a = node.getBoundingClientRect();
    const b = scroller.getBoundingClientRect();
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    scroller.scrollBy({
      left: a.left + a.width / 2 - (b.left + b.width / 2),
      top: a.top + a.height / 2 - (b.top + b.height / 2),
      behavior: reduce ? 'auto' : 'smooth'
    });
  }

  // 拖曳時若與其他桌的 Y 座標相差 ≤ ROW_SNAP（%），自動貼齊成同一水平線
  const ROW_SNAP = 0.8;
  function snapToRow(table, y) {
    let best = null;
    state.tables.forEach(t => {
      if (t.id === table.id) return;
      const d = Math.abs(t.y - y);
      if (d <= ROW_SNAP && (!best || d < best.d)) best = { y: t.y, d };
    });
    return best ? best.y : y;
  }

  function selectedAlignTables() {
    return state.align.ids.map(id => state.tables.find(t => t.id === id)).filter(Boolean);
  }

  function toggleAlignTable(id) {
    const ids = state.align.ids;
    state.align.ids = ids.includes(id) ? ids.filter(x => x !== id) : [...ids, id];
    renderAll();
  }

  // 水平對齊：所選桌子維持各自 X，Y 統一為平均高度
  function alignSelectedRow() {
    const list = selectedAlignTables();
    if (list.length < 2) { showToast('請至少選取 2 桌（先開啟多選模式再點圓桌）'); return; }
    remember('水平對齊');
    const avgY = list.reduce((sum, t) => sum + t.y, 0) / list.length;
    list.forEach(t => clampPosition(t, t.x, avgY));
    saveToLocalStorage(true);
    renderAll();
    showToast(`已將 ${list.length} 桌水平對齊`);
  }

  // 垂直置中：所選桌子維持各自 Y，X 統一為平均值（排成同一直線）
  function alignSelectedColumn() {
    const list = selectedAlignTables();
    if (list.length < 2) { showToast('請至少選取 2 桌（先開啟多選模式再點圓桌）'); return; }
    remember('垂直置中');
    const avgX = list.reduce((sum, t) => sum + t.x, 0) / list.length;
    list.forEach(t => clampPosition(t, avgX, t.y));
    saveToLocalStorage(true);
    renderAll();
    showToast(`已將 ${list.length} 桌垂直置中`);
  }

  // 垂直平均分散：依 Y 由上至下，在最上與最下之間平均分配，X 統一為平均值
  function distributeSelectedColumn() {
    const list = selectedAlignTables().sort((a, b) => a.y - b.y);
    if (list.length < 2) { showToast('請至少選取 2 桌（先開啟多選模式再點圓桌）'); return; }
    remember('垂直平均分散');
    const minY = list[0].y;
    const maxY = list[list.length - 1].y;
    const avgX = list.reduce((sum, t) => sum + t.x, 0) / list.length;
    list.forEach((t, i) => clampPosition(t, avgX, minY + ((maxY - minY) * i) / (list.length - 1)));
    saveToLocalStorage(true);
    renderAll();
    showToast(`已將 ${list.length} 桌垂直平均分散`);
  }

  // 水平平均分散：依 X 由左至右，在最左與最右之間平均分配，Y 統一為平均高度
  function distributeSelectedRow() {
    const list = selectedAlignTables().sort((a, b) => a.x - b.x);
    if (list.length < 2) { showToast('請至少選取 2 桌（先開啟多選模式再點圓桌）'); return; }
    remember('水平平均分散');
    const minX = list[0].x;
    const maxX = list[list.length - 1].x;
    const avgY = list.reduce((sum, t) => sum + t.y, 0) / list.length;
    list.forEach((t, i) => clampPosition(t, minX + ((maxX - minX) * i) / (list.length - 1), avgY));
    saveToLocalStorage(true);
    renderAll();
    showToast(`已將 ${list.length} 桌水平平均分散`);
  }

  function updateAlignPanel() {
    const n = selectedAlignTables().length;
    setText('align-count', `已選 ${n} 桌`);
    const m = document.getElementById('chk-align-multi');
    if (m) m.checked = state.align.multi;
    const a = document.getElementById('chk-align-auto');
    if (a) a.checked = state.align.auto;
    ['btn-align-row', 'btn-align-column', 'btn-align-distribute', 'btn-distribute-column'].forEach(id => {
      const b = document.getElementById(id);
      if (b) b.disabled = n < 2;
    });
  }

  function clampPosition(table, x, y) {
    table.x = Math.max(7.5, Math.min(92.5, x));
    table.y = Math.max(19.0, Math.min(91.5, y));
    table.zone = table.y >= ORANGE_ZONE_Y_MIN ? 'orange' : 'main';
  }

  function initPosterDragAndClick() {
    const poster = document.getElementById('banquet-poster');
    const orangeZoneEl = document.getElementById('orange-extension-zone');
    if (!poster) return;

    poster.addEventListener('click', e => {
      const chip = e.target.closest('.seat-chip');
      if (chip) {
        const seatIdx = parseInt(chip.dataset.seatIndex, 10);
        state.selectedTableId = chip.dataset.tableId;
        if (seatIdx >= 1 && seatIdx <= SEATS_PER_TABLE) state.selectedSeatIndex = seatIdx;
        state.swapSourceSeatIndex = null;
        switchInspectorTab('seat-map');
        renderAll();
        const input = document.getElementById(`seat-${state.selectedSeatIndex}-name`);
        if (input) input.focus();
        return;
      }
      const disc = e.target.closest('.table-disc');
      if (disc && state.align.multi) toggleAlignTable(disc.dataset.tableId);
      else if (disc) selectTable(disc.dataset.tableId);
    });

    poster.addEventListener('pointerdown', e => {
      const disc = e.target.closest('.table-disc');
      if (!disc || e.button > 0) return;
      const table = state.tables.find(t => t.id === disc.dataset.tableId);
      if (!table) return;
      selectTable(table.id, true);

      const rect = poster.getBoundingClientRect();
      const nodeEl = disc.parentElement;
      dragContext = {
        tableId: table.id,
        nodeEl,
        startClientX: e.clientX,
        startClientY: e.clientY,
        origX: table.x,
        origY: table.y,
        posterWidth: rect.width,
        posterHeight: rect.height,
        moved: false
      };
      nodeEl.classList.add('dragging');
      try { disc.setPointerCapture(e.pointerId); } catch (_) {}
    });

    // 空白處拖曳＝框選（Shift 加選）：框內圓桌中心落在範圍內即選取，並開啟多選模式
    const marqueeEl = document.getElementById('marquee-box');
    let marquee = null;
    const toPct = e => {
      const r = poster.getBoundingClientRect();
      return { x: (e.clientX - r.left) / r.width * 100, y: (e.clientY - r.top) / r.height * 100 };
    };
    poster.addEventListener('pointerdown', e => {
      if (e.button > 0 || e.target.closest('.table-disc, .seat-chip, button, input, textarea')) return;
      const p = toPct(e);
      marquee = { x0: p.x, y0: p.y, x1: p.x, y1: p.y, add: e.shiftKey, moved: false };
    });
    window.addEventListener('pointermove', e => {
      if (!marquee) return;
      const p = toPct(e);
      marquee.x1 = p.x; marquee.y1 = p.y;
      if (!marquee.moved && Math.abs(marquee.x1 - marquee.x0) + Math.abs(marquee.y1 - marquee.y0) < 0.8) return;
      marquee.moved = true;
      marqueeEl.hidden = false;
      marqueeEl.style.left = Math.min(marquee.x0, marquee.x1) + '%';
      marqueeEl.style.top = Math.min(marquee.y0, marquee.y1) + '%';
      marqueeEl.style.width = Math.abs(marquee.x1 - marquee.x0) + '%';
      marqueeEl.style.height = Math.abs(marquee.y1 - marquee.y0) + '%';
    });
    window.addEventListener('pointerup', () => {
      if (!marquee) return;
      const m = marquee;
      marquee = null;
      marqueeEl.hidden = true;
      if (!m.moved) return;
      const x0 = Math.min(m.x0, m.x1), x1 = Math.max(m.x0, m.x1);
      const y0 = Math.min(m.y0, m.y1), y1 = Math.max(m.y0, m.y1);
      const inside = state.tables.filter(t => t.x >= x0 && t.x <= x1 && t.y >= y0 && t.y <= y1).map(t => t.id);
      state.align.ids = m.add ? [...new Set([...state.align.ids, ...inside])] : inside;
      state.align.multi = true;
      if (inside.length) state.selectedTableId = inside[inside.length - 1];
      renderAll();
      showToast(`已框選 ${state.align.ids.length} 桌`);
    });

    window.addEventListener('pointermove', e => {
      if (!dragContext) return;
      const dxPx = e.clientX - dragContext.startClientX;
      const dyPx = e.clientY - dragContext.startClientY;
      if (Math.abs(dxPx) > 3 || Math.abs(dyPx) > 3) dragContext.moved = true;
      if (!dragContext.moved) return;

      let nextX = dragContext.origX + (dxPx / dragContext.posterWidth) * 100;
      let nextY = dragContext.origY + (dyPx / dragContext.posterHeight) * 100;
      if (state.gridSnap) {
        nextX = Math.round(nextX / 1.5) * 1.5;
        nextY = Math.round(nextY / 1.2) * 1.2;
      }

      const table = state.tables.find(t => t.id === dragContext.tableId);
      if (!table) return;
      clampPosition(table, nextX, state.align.auto ? snapToRow(table, nextY) : nextY);
      dragContext.nodeEl.style.left = `${table.x.toFixed(2)}%`;
      dragContext.nodeEl.style.top = `${table.y.toFixed(2)}%`;
      dragContext.nodeEl.classList.toggle('is-orange', table.zone === 'orange');
      if (orangeZoneEl) orangeZoneEl.classList.toggle('drag-over', table.zone === 'orange');
    });

    const endDrag = () => {
      if (!dragContext) return;
      const wasMoved = dragContext.moved;
      dragContext.nodeEl.classList.remove('dragging');
      if (orangeZoneEl) orangeZoneEl.classList.remove('drag-over');
      dragContext = null;
      if (wasMoved) {
        saveToLocalStorage(true);
        renderAll();
      }
    };
    window.addEventListener('pointerup', endDrag);
    window.addEventListener('pointercancel', endDrag);

    // 拖曳的鍵盤替代：方向鍵移動選取的圓桌
    poster.addEventListener('keydown', e => {
      const disc = e.target.closest('.table-disc');
      const dirs = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] };
      if (!disc || !dirs[e.key]) return;
      e.preventDefault();
      const table = state.tables.find(t => t.id === disc.dataset.tableId);
      if (!table) return;
      const step = e.shiftKey ? 4 : 1;
      clampPosition(table, table.x + dirs[e.key][0] * 1.5 * step, table.y + dirs[e.key][1] * 1.2 * step);
      state.selectedTableId = table.id;
      saveToLocalStorage(true);
      renderAll();
    });
  }

  // ==================== Event Bindings ====================
  function on(id, event, handler) {
    const el = document.getElementById(id);
    if (el) el.addEventListener(event, handler);
  }

  function bindEvents() {
    initPosterDragAndClick();

    // Table management
    on('btn-add-main-table', 'click', () => addTable('main'));
    on('btn-add-orange-table', 'click', () => addTable('orange'));
    on('btn-orange-clear', 'click', clearOrangeZoneTables);
    on('btn-delete-selected-table', 'click', deleteSelectedTable);
    on('btn-reset-default-layout', 'click', resetToDefaultLayout);

    // Cloud, files, chart
    const menu = document.getElementById('file-menu');
    const closeMenu = () => { if (menu) menu.open = false; };
    on('btn-save-cloud', 'click', saveToCloud);
    on('btn-load-cloud', 'click', () => { closeMenu(); loadFromCloud(); });
    on('btn-export-excel', 'click', () => { closeMenu(); exportToExcel(); });
    on('btn-export-png', 'click', exportChartPng);
    on('btn-print-chart', 'click', () => { closeMenu(); fillPrintChart(); window.print(); });
    window.addEventListener('beforeprint', fillPrintChart);
    document.addEventListener('click', e => {
      if (menu && menu.open && !menu.contains(e.target)) closeMenu();
    });
    document.addEventListener('keydown', e => {
      if (e.key !== 'Escape') return;
      if (menu && menu.open) {
        closeMenu();
        menu.querySelector('summary').focus();
      }
      if (state.swapSourceSeatIndex) {
        state.swapSourceSeatIndex = null;
        updateSeatRowState();
        renderSeatDetail();
      }
    });

    const inputImportFile = document.getElementById('input-import-file');
    on('btn-import-excel-trigger', 'click', () => { closeMenu(); if (inputImportFile) inputImportFile.click(); });
    if (inputImportFile) {
      inputImportFile.addEventListener('change', e => {
        const file = e.target.files && e.target.files[0];
        if (file) {
          handleImportFile(file);
          inputImportFile.value = '';
        }
      });
    }

    // Search & highlight filters
    const searchInput = document.getElementById('input-search-guest');
    const clearSearchBtn = document.getElementById('btn-clear-search');
    const applySearch = value => {
      state.searchQuery = value;
      if (clearSearchBtn) clearSearchBtn.hidden = !value;
      renderMap();
      renderJumpSelect();
    };
    if (searchInput) {
      searchInput.addEventListener('input', e => applySearch(e.target.value));
      searchInput.addEventListener('keydown', e => {
        if (e.key !== 'Enter') return;
        e.preventDefault();
        const first = sortTables(state.tables).find(tableMatchesFilterAndSearch);
        if (first && state.searchQuery.trim()) {
          selectTable(first.id);
          centerOnTable(first.id);
        }
      });
    }
    if (clearSearchBtn) {
      clearSearchBtn.addEventListener('click', () => {
        if (searchInput) { searchInput.value = ''; searchInput.focus(); }
        applySearch('');
      });
    }

    document.querySelectorAll('[data-highlight]').forEach(btn => {
      btn.addEventListener('click', () => {
        state.highlightMode = btn.dataset.highlight || 'all';
        document.querySelectorAll('[data-highlight]').forEach(b => {
          b.setAttribute('aria-pressed', String(b === btn));
        });
        renderMap();
        renderJumpSelect();
      });
    });

    // Jump select: pick a table, select it and center it on the map
    on('select-jump-table', 'change', e => {
      selectTable(e.target.value);
      centerOnTable(e.target.value);
    });

    // Side panels: collapse/expand left (總覽) and right (座位編輯) columns
    const toggleSide = (panelId, btnId, layoutCls, collapsedArrow, openArrow) => {
      const panel = document.getElementById(panelId);
      const btn = document.getElementById(btnId);
      if (!panel || !btn) return;
      const collapsed = !panel.classList.contains('is-collapsed');
      panel.classList.toggle('is-collapsed', collapsed);
      document.querySelector('.layout').classList.toggle(layoutCls, collapsed);
      btn.setAttribute('aria-expanded', String(!collapsed));
      btn.textContent = collapsed ? openArrow : collapsedArrow;
      btn.title = collapsed ? '展開' : '收合';
    };
    on('btn-collapse-left', 'click', () => toggleSide('side-panel-left', 'btn-collapse-left', 'left-collapsed', '‹', '›'));
    on('btn-collapse-right', 'click', () => toggleSide('editor', 'btn-collapse-right', 'right-collapsed', '›', '‹'));

    // Poster title/counter display settings (local draft only)
    on('chk-poster-show-title', 'change', e => { state.poster.showTitle = e.target.checked; applyPosterSettings(); saveToLocalStorage(false); });
    on('input-poster-title', 'input', e => { state.poster.title = e.target.value; applyPosterSettings(); saveToLocalStorage(false); });
    // 座位距離與大小（本機草稿）
    on('range-seat-radius', 'input', e => { state.poster.seatRadius = Number(e.target.value); applyPosterSettings(); saveToLocalStorage(false); renderMap(); });
    on('range-seat-scale', 'input', e => { state.poster.seatScale = Number(e.target.value) / 100; applyPosterSettings(); saveToLocalStorage(false); renderMap(); });
    on('btn-seat-reset', 'click', () => { state.poster.seatRadius = 84; state.poster.seatScale = 1; applyPosterSettings(); saveToLocalStorage(false); renderMap(); });
    // 桌次對齊
    on('chk-align-multi', 'change', e => { state.align.multi = e.target.checked; updateAlignPanel(); });
    on('chk-align-auto', 'change', e => { state.align.auto = e.target.checked; });
    on('btn-align-row', 'click', alignSelectedRow);
    on('btn-align-column', 'click', alignSelectedColumn);
    on('btn-align-distribute', 'click', distributeSelectedRow);
    on('btn-distribute-column', 'click', distributeSelectedColumn);
    on('btn-align-clear', 'click', () => { state.align.ids = []; renderAll(); });
    on('chk-poster-show-counter', 'change', e => { state.poster.showCounter = e.target.checked; applyPosterSettings(); saveToLocalStorage(false); });

    // RSVP list filters
    on('input-rsvp-filter', 'input', e => { state.rsvpQuery = e.target.value; renderRsvpImportList(); });
    on('select-rsvp-status', 'change', e => { state.rsvpStatus = e.target.value; renderRsvpImportList(); });

    // Grid snap & zoom
    on('chk-grid-snap', 'change', e => { state.gridSnap = e.target.checked; });
    on('btn-zoom-in', 'click', () => { autoFit = false; setZoom(state.zoomLevel + 0.1); });
    on('btn-zoom-out', 'click', () => { autoFit = false; setZoom(state.zoomLevel - 0.1); });
    on('btn-zoom-fit', 'click', () => { autoFit = true; fitZoom(); });
    // 未手動縮放前，視窗尺寸改變時自動符合寬度
    let resizeTimer = 0;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => { if (autoFit) fitZoom(); }, 150);
    });

    // Tabs (click + arrow keys)
    const tabs = Array.from(document.querySelectorAll('.tab-btn'));
    tabs.forEach((btn, i) => {
      btn.addEventListener('click', () => switchInspectorTab(btn.dataset.tab));
      btn.addEventListener('keydown', e => {
        const delta = e.key === 'ArrowRight' ? 1 : (e.key === 'ArrowLeft' ? -1 : 0);
        if (!delta) return;
        e.preventDefault();
        const next = tabs[(i + delta + tabs.length) % tabs.length];
        switchInspectorTab(next.dataset.tab);
        next.focus();
      });
    });

    // Table number & alias live edit
    on('input-table-number', 'input', e => {
      const table = getSelectedTable();
      if (!table) return;
      const v = e.target.value.trim();
      const dup = v ? findDuplicateTableNumber(v, table.id) : '';
      if (state.guardTableNumber) {
        setTableNumberError(dup ? `桌號「${v}」與其他桌（${dup}）重複，請換一個` : '');
        e.target.setAttribute('aria-invalid', String(Boolean(dup)));
        if (!v || dup) return;
      } else {
        if (!v) return;
        refreshTableNumberWarning();
      }
      table.tableNumber = v;
      saveToLocalStorage(true);
      renderAll();
    });
    // 離開欄位時：防呆開啟且仍為空白或重複，還原為原桌號；防呆關閉則保留（允許暫時重複）
    on('input-table-number', 'change', e => {
      const table = getSelectedTable();
      if (!table) return;
      const v = e.target.value.trim();
      if (!state.guardTableNumber) {
        if (v) return;
      } else if (v && !findDuplicateTableNumber(v, table.id)) {
        return;
      }
      e.target.value = table.tableNumber;
      e.target.setAttribute('aria-invalid', 'false');
      setTableNumberError('');
      showToast(`桌號無效或重複，已還原為 ${table.tableNumber} 桌`);
    });
    on('chk-table-number-guard', 'change', e => {
      state.guardTableNumber = e.target.checked;
      saveToLocalStorage(false);
      refreshTableNumberWarning();
      showToast(state.guardTableNumber ? '桌號防呆已開啟' : '桌號防呆已關閉：可暫時重複，改完後再存檔');
    });
    on('input-table-alias', 'input', e => {
      const table = getSelectedTable();
      if (!table) return;
      table.alias = e.target.value;
      saveToLocalStorage(true);
      renderAll();
    });

    // Seat rows: select, type name, toggle markers, swap
    const rows = document.getElementById('seat-rows');
    if (rows) {
      rows.addEventListener('focusin', e => {
        const row = e.target.closest('[data-row-seat]');
        if (!row || state.swapSourceSeatIndex) return;
        const idx = parseInt(row.dataset.rowSeat, 10);
        if (idx === state.selectedSeatIndex) return;
        state.selectedSeatIndex = idx;
        updateSeatRowState();
        renderSeatDetail();
        renderMap();
      });

      rows.addEventListener('click', e => {
        const row = e.target.closest('[data-row-seat]');
        if (!row) return;
        const idx = parseInt(row.dataset.rowSeat, 10);
        if (state.swapSourceSeatIndex) {
          if (idx !== state.swapSourceSeatIndex) handleSeatSelectionOrSwap(idx);
          return;
        }
        const toggle = e.target.closest('[data-toggle]');
        if (!toggle) return;
        const table = getSelectedTable();
        const seat = table && table.seats[idx - 1];
        if (!seat) return;
        state.selectedSeatIndex = idx;
        if (toggle.dataset.toggle === 'veg') seat.diet = seat.diet === 'veg' ? 'meat' : 'veg';
        if (toggle.dataset.toggle === 'child') seat.isChildSeat = !seat.isChildSeat;
        if (toggle.dataset.toggle === 'gift') seat.hasGift = !seat.hasGift;
        saveToLocalStorage(true);
        renderAll();
      });

      rows.addEventListener('input', e => {
        const idx = parseInt(e.target.dataset.seatName, 10);
        const table = getSelectedTable();
        const seat = table && table.seats[idx - 1];
        if (!seat) return;
        seat.name = e.target.value;
        saveToLocalStorage(true);
        updateSeatRowState();
        renderLive();
      });

      rows.addEventListener('keydown', e => {
        const idx = parseInt(e.target.dataset.seatName, 10);
        if (!idx || e.isComposing) return;
        let next = 0;
        if (e.key === 'ArrowDown' || (e.key === 'Enter' && !e.shiftKey)) next = idx + 1;
        if (e.key === 'ArrowUp' || (e.key === 'Enter' && e.shiftKey)) next = idx - 1;
        if (!next) return;
        e.preventDefault();
        const target = document.getElementById(`seat-${next}-name`);
        if (target) target.focus();
      });
    }

    on('input-seat-gift-note', 'input', e => {
      const seat = getSelectedSeatObject();
      if (!seat) return;
      seat.giftNote = e.target.value;
      if (seat.giftNote.trim()) seat.hasGift = true;
      saveToLocalStorage(true);
      updateSeatRowState();
      renderLive();
    });

    on('btn-swap-seat-mode', 'click', () => {
      if (state.swapSourceSeatIndex === state.selectedSeatIndex) {
        state.swapSourceSeatIndex = null;
      } else {
        state.swapSourceSeatIndex = state.selectedSeatIndex;
        showToast(`請點選本桌另一個座位，與座位 #${state.selectedSeatIndex} 對調（Esc 取消）`);
      }
      updateSeatRowState();
      renderSeatDetail();
    });

    on('btn-clear-single-seat', 'click', () => {
      const table = getSelectedTable();
      const seat = getSelectedSeatObject();
      if (!table || !seat) return;
      remember(`清空 ${table.tableNumber} 桌座位 #${seat.seatIndex}`);
      seat.name = '';
      seat.diet = 'meat';
      seat.isChildSeat = false;
      seat.hasGift = false;
      seat.giftNote = '';
      saveToLocalStorage(true);
      renderAll();
      showToast(`已清空 ${table.tableNumber} 桌座位 #${seat.seatIndex}`, true);
    });

    // Batch tab
    on('btn-apply-batch-text', 'click', applyBatchTextToTable);
    // 整桌快速設定會改寫座位，先丟棄該桌的未套用草稿（須在下方各按鈕的 handler 之前註冊）
    ['btn-table-all-meat', 'btn-table-all-veg', 'btn-table-add-child', 'btn-table-all-gift', 'btn-table-clear-all'].forEach(id => {
      on(id, 'click', () => { const t = getSelectedTable(); if (t) delete state.batchDrafts[t.id]; });
    });
    on('textarea-batch-seats', 'input', e => {
      const table = getSelectedTable();
      if (!table) return;
      state.batchDrafts[table.id] = e.target.value;
      updateBatchDraftStatus();
    });
    on('btn-table-all-meat', 'click', () => {
      const table = getSelectedTable();
      if (!table) return;
      table.seats.forEach(s => { s.diet = 'meat'; });
      saveToLocalStorage(true);
      renderAll();
      showToast(`已將 ${table.tableNumber} 桌全數設為葷食`);
    });
    on('btn-table-all-veg', 'click', () => {
      const table = getSelectedTable();
      if (!table) return;
      table.seats.forEach(s => { s.diet = 'veg'; });
      saveToLocalStorage(true);
      renderAll();
      showToast(`已將 ${table.tableNumber} 桌全數設為素食`);
    });
    on('btn-table-add-child', 'click', () => {
      const table = getSelectedTable();
      if (!table) return;
      const target = [...table.seats].reverse().find(s => !s.isChildSeat);
      if (target) {
        target.isChildSeat = true;
        if (!target.name) target.name = '兒童座椅';
        saveToLocalStorage(true);
        renderAll();
        showToast(`已於 ${table.tableNumber} 桌座位 #${target.seatIndex} 設置兒童座椅`);
      }
    });
    on('btn-table-all-gift', 'click', () => {
      const table = getSelectedTable();
      if (!table) return;
      table.seats.forEach(s => {
        if (s.name || s.isChildSeat) s.hasGift = true;
      });
      saveToLocalStorage(true);
      renderAll();
      showToast(`已為 ${table.tableNumber} 桌在座賓客標記婚禮小物`);
    });
    on('btn-table-clear-all', 'click', () => {
      const table = getSelectedTable();
      if (!table) return;
      remember(`清空 ${table.tableNumber} 桌`);
      table.seats = createEmptySeats(SEATS_PER_TABLE);
      saveToLocalStorage(true);
      renderAll();
      showToast(`已清空 ${table.tableNumber} 桌的所有座位`, true);
    });
    on('btn-swap-table-content', 'click', swapTableContentWithSelected);

    // RSVP tab
    on('btn-fetch-rsvp', 'click', () => fetchCloudRsvpList(false));
    on('rsvp-card-list', 'click', e => {
      const row = e.target.closest('[data-rsvp-idx]');
      if (!row || row.disabled) return;
      state.rsvpSel = parseInt(row.dataset.rsvpIdx, 10);
      const st = rsvpImportStatus(state.rsvpList[state.rsvpSel]);
      const table = getSelectedTable();
      const empty = table ? table.seats.filter(x => !x.name && !x.isChildSeat).length : 0;
      document.getElementById('input-rsvp-count').value = String(Math.max(1, Math.min(st.remaining, empty)));
      renderRsvpImportList();
    });
    on('input-rsvp-count', 'input', () => renderRsvpBar());
    on('btn-rsvp-import', 'click', () => {
      importRsvpGuestToCurrentTable(state.rsvpSel, document.getElementById('input-rsvp-count').value);
    });
    on('select-rsvp-side', 'change', e => { state.rsvpSide = e.target.value; renderRsvpImportList(); });

    // Toast undo
    on('toast-container', 'click', e => {
      if (!e.target.closest('[data-undo]')) return;
      e.target.closest('.toast').remove();
      undoLast();
    });
  }

  function getSelectedSeatObject() {
    const table = getSelectedTable();
    if (!table) return null;
    return table.seats.find(s => s.seatIndex === state.selectedSeatIndex) || table.seats[0];
  }

  function handleSeatSelectionOrSwap(targetSeatIndex) {
    const table = getSelectedTable();
    if (!table) return;

    if (state.swapSourceSeatIndex && state.swapSourceSeatIndex !== targetSeatIndex) {
      const s1 = table.seats.find(s => s.seatIndex === state.swapSourceSeatIndex);
      const s2 = table.seats.find(s => s.seatIndex === targetSeatIndex);
      if (s1 && s2) {
        const temp = {
          name: s1.name,
          diet: s1.diet,
          isChildSeat: s1.isChildSeat,
          hasGift: s1.hasGift,
          giftNote: s1.giftNote
        };
        s1.name = s2.name;
        s1.diet = s2.diet;
        s1.isChildSeat = s2.isChildSeat;
        s1.hasGift = s2.hasGift;
        s1.giftNote = s2.giftNote;

        s2.name = temp.name;
        s2.diet = temp.diet;
        s2.isChildSeat = temp.isChildSeat;
        s2.hasGift = temp.hasGift;
        s2.giftNote = temp.giftNote;

        showToast(`已將座位 #${s1.seatIndex} 與座位 #${s2.seatIndex} 對調`);
      }
      state.swapSourceSeatIndex = null;
      state.selectedSeatIndex = targetSeatIndex;
      saveToLocalStorage(true);
      renderAll();
      return;
    }

    state.swapSourceSeatIndex = null;
    state.selectedSeatIndex = targetSeatIndex;
    renderEditor();
  }

  function switchInspectorTab(tabId) {
    document.querySelectorAll('.tab-btn').forEach(btn => {
      const isMatch = btn.dataset.tab === tabId;
      btn.setAttribute('aria-selected', String(isMatch));
      btn.tabIndex = isMatch ? 0 : -1;
      const panel = document.getElementById(btn.getAttribute('aria-controls'));
      if (panel) panel.hidden = !isMatch;
    });

    const table = getSelectedTable();
    if (table && tabId === 'batch-list') {
      syncBatchTextarea(table);
    }
  }

  function setZoom(level) {
    state.zoomLevel = Math.max(0.3, Math.min(1.5, Number(level.toFixed(2))));
    const poster = document.getElementById('banquet-poster');
    if (poster) poster.style.zoom = String(state.zoomLevel);
    setText('label-zoom-level', `${Math.round(state.zoomLevel * 100)}%`);
  }

  let autoFit = true;

  function fitZoom() {
    const scroller = document.getElementById('map-scroller');
    if (!scroller) return;
    setZoom(Math.min(1, Math.floor(((scroller.clientWidth - 20) / MAP_WIDTH) * 100) / 100));
  }

  // ==================== Utilities ====================
  function setText(id, text) {
    const el = document.getElementById(id);
    if (el) el.textContent = text;
  }

  function showToast(message, withUndo = false) {
    const container = document.getElementById('toast-container');
    if (!container) return;
    const el = document.createElement('div');
    el.className = 'toast';
    const text = document.createElement('span');
    text.textContent = message;
    el.appendChild(text);
    if (withUndo && state.undo) {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.dataset.undo = '1';
      btn.textContent = '復原';
      el.appendChild(btn);
    }
    container.appendChild(el);
    setTimeout(() => el.remove(), withUndo ? 8000 : 3200);
  }

  function escapeHtml(str) {
    return String(str ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  // Expose minimal API on window for automated verification & debugging
  window.WeddingSeatingApp = {
    getState: () => state,
    addTable,
    resetToDefaultLayout,
    exportToExcel,
    reconstructTablesFromSheetRows,
    buildChartSvg,
    exportChartPng,
    undoLast
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
