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

  // 橘色擴充區在海報 (920 x 1520) 上的垂直百分比門檻
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
    zoomLevel: 1.0,
    isDirty: false,
    lastSavedAt: null,
    rsvpList: []                // 從雲端或範例載入之報名清單
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
    badge.className = 'sync-badge';
    if (mode === 'saving') {
      badge.classList.add('saving');
      badge.textContent = statusText || '⏳ 雲端同步儲存中...';
    } else if (state.isDirty) {
      badge.classList.add('dirty');
      badge.textContent = statusText || '● 草稿已存於本機（尚未同步雲端）';
    } else {
      badge.classList.add('saved');
      badge.textContent = statusText || '✓ 已儲存（本機＋雲端同步就緒）';
    }
  }

  // ==================== Cloud Sync (Google Apps Script) ====================
  async function saveToCloud() {
    const saveBtn = document.getElementById('btn-save-cloud');
    if (saveBtn) saveBtn.disabled = true;
    updateSyncBadge('⏳ 正在儲存至 Google 試算表...', 'saving');

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
        updateSyncBadge('✓ 已同步至雲端試算表', 'saved');
        showToast('✅ 已成功將所有桌次與 10 人座位同步儲存至 Google 試算表！');
      } else {
        throw new Error((result && result.error) || 'Unknown response');
      }
    } catch (err) {
      console.warn('Cloud save fallback notice:', err);
      saveToLocalStorage(false);
      updateSyncBadge('✓ 已保存於本機草稿（可隨時匯出 Excel）', 'saved');
      showToast('💾 已完整保存至本機（若需同步雲端請確認 GAS 已更新部署）');
    } finally {
      if (saveBtn) saveBtn.disabled = false;
    }
  }

  async function loadFromCloud() {
    updateSyncBadge('⏳ 正在從雲端試算表讀取...', 'saving');
    try {
      const response = await fetch(API_URL + '?action=seating');
      const result = await response.json();
      if (result && result.status === 'success' && result.data && Array.isArray(result.data.seating)) {
        const rows = result.data.seating;
        if (rows.length === 0) {
          showToast('ℹ️ 雲端試算表「桌次分配」目前尚無資料，維持現有桌位。');
          updateSyncBadge();
          return;
        }
        const reconstructed = reconstructTablesFromSheetRows(rows);
        if (reconstructed.length > 0) {
          state.tables = reconstructed;
          state.selectedTableId = state.tables[0].id;
          state.selectedSeatIndex = 1;
          state.isDirty = false;
          saveToLocalStorage(false);
          renderAll();
          showToast(`✅ 已從雲端成功載入 ${reconstructed.length} 桌座位配置！`);
        }
      } else {
        throw new Error('Invalid cloud response');
      }
    } catch (err) {
      console.warn('Load cloud error:', err);
      showToast('⚠️ 無法連線至雲端試算表，目前顯示本機最新儲存的桌次配置。');
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

  function getNextTableNumber() {
    let maxNum = 15;
    state.tables.forEach(t => {
      const n = parseInt(t.tableNumber, 10);
      if (Number.isFinite(n) && n > maxNum) maxNum = n;
    });
    return String(maxNum + 1).padStart(2, '0');
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
    showToast(`🪑 已於${zone === 'orange' ? '橘色擴充區' : '主廳'}新增「${newTbl.tableNumber} 桌」！`);
  }

  // 在橘色框框動態設定為指定桌數（如 5 桌 或 10 桌）
  function setOrangeZoneTableCount(targetCount) {
    const currentOrange = state.tables.filter(t => t.zone === 'orange');
    if (currentOrange.length < targetCount) {
      const toAdd = targetCount - currentOrange.length;
      for (let i = 0; i < toAdd; i++) {
        const tbl = createNewTableObject('orange', null, `擴充席 ${currentOrange.length + i + 1}`, state.tables);
        state.tables.push(tbl);
      }
    } else if (currentOrange.length > targetCount) {
      // 由後往前移除多餘的擴充桌
      const idsToRemove = currentOrange.slice(targetCount).map(t => t.id);
      state.tables = state.tables.filter(t => !idsToRemove.includes(t.id));
    }

    // 重新整齊排列橘色區的所有桌子（最多 5 欄 x 2 排 = 10 桌完美對齊於橘色框內）
    const updatedOrange = state.tables.filter(t => t.zone === 'orange');
    updatedOrange.forEach((t, idx) => {
      const cols = updatedOrange.length <= 5 ? Math.max(updatedOrange.length, 5) : 5;
      const col = idx % cols;
      const row = Math.floor(idx / cols);
      t.x = 16 + col * 17;
      t.y = updatedOrange.length <= 5 ? 80.5 : (75.0 + row * 11.2);
    });

    if (!state.tables.some(t => t.id === state.selectedTableId) && state.tables.length > 0) {
      state.selectedTableId = state.tables[state.tables.length - 1].id;
    } else if (updatedOrange.length > 0) {
      state.selectedTableId = updatedOrange[updatedOrange.length - 1].id;
    }

    saveToLocalStorage(true);
    renderAll();
    showToast(`🍊 橘色擴充區已動態調整為 ${targetCount} 桌（每桌 10 位）！`);
  }

  function clearOrangeZoneTables() {
    const orangeCount = state.tables.filter(t => t.zone === 'orange').length;
    if (orangeCount === 0) {
      showToast('ℹ️ 橘色擴充區目前沒有桌子。');
      return;
    }
    state.tables = state.tables.filter(t => t.zone !== 'orange');
    if (!state.tables.some(t => t.id === state.selectedTableId) && state.tables.length > 0) {
      state.selectedTableId = state.tables[0].id;
    }
    saveToLocalStorage(true);
    renderAll();
    showToast(`🗑️ 已清空橘色擴充區的 ${orangeCount} 張桌子。`);
  }

  function deleteSelectedTable() {
    if (state.tables.length <= 1) {
      showToast('⚠️ 至少需保留一張桌子！');
      return;
    }
    const current = getSelectedTable();
    if (!current) return;
    const removedLabel = `${current.tableNumber} (${current.alias || '未命名'})`;
    state.tables = state.tables.filter(t => t.id !== current.id);
    state.selectedTableId = state.tables[0].id;
    state.selectedSeatIndex = 1;
    saveToLocalStorage(true);
    renderAll();
    showToast(`🗑️ 已刪除桌次：${removedLabel}`);
  }

  function resetToDefaultLayout() {
    state.tables = getDefaultTables();
    state.selectedTableId = state.tables[0].id;
    state.selectedSeatIndex = 1;
    state.swapSourceSeatIndex = null;
    saveToLocalStorage(true);
    renderAll();
    showToast('↺ 已重置為金饌廳預設 15 桌比例配置！');
  }

  // ==================== Rendering Engine ====================
  function renderAll() {
    renderStatistics();
    renderPosterTables();
    renderInspector();
  }

  function renderStatistics() {
    const totalTables = state.tables.length;
    const orangeTables = state.tables.filter(t => t.zone === 'orange').length;
    const totalSeats = totalTables * SEATS_PER_TABLE;

    let seatedCount = 0;
    let meatCount = 0;
    let vegCount = 0;
    let childCount = 0;
    let giftCount = 0;

    state.tables.forEach(t => {
      t.seats.forEach(s => {
        const occupied = Boolean(s.name && s.name.trim()) || s.isChildSeat;
        if (occupied) {
          seatedCount++;
          if (s.diet === 'veg') {
            vegCount++;
          } else {
            meatCount++;
          }
        }
        if (s.isChildSeat) childCount++;
        if (s.hasGift) giftCount++;
      });
    });

    const elTableCount = document.getElementById('stat-table-count');
    const elPosterCounter = document.getElementById('poster-table-counter');
    const elOrangeCount = document.getElementById('orange-zone-count');
    const elSeated = document.getElementById('stat-seated-count');
    const elMeat = document.getElementById('stat-meat-count');
    const elVeg = document.getElementById('stat-veg-count');
    const elChild = document.getElementById('stat-child-count');
    const elGift = document.getElementById('stat-gift-count');

    if (elTableCount) elTableCount.textContent = String(totalTables);
    if (elPosterCounter) elPosterCounter.textContent = `桌數：${totalTables}桌`;
    if (elOrangeCount) elOrangeCount.textContent = String(orangeTables);
    if (elSeated) elSeated.textContent = `${seatedCount} / ${totalSeats}`;
    if (elMeat) elMeat.textContent = String(meatCount);
    if (elVeg) elVeg.textContent = String(vegCount);
    if (elChild) elChild.textContent = String(childCount);
    if (elGift) elGift.textContent = String(giftCount);

    const hintEl = document.getElementById('orange-zone-hint');
    if (hintEl) {
      hintEl.style.opacity = orangeTables > 0 ? '0.35' : '0.95';
    }
  }

  function tableMatchesFilterAndSearch(table) {
    const q = state.searchQuery.trim().toLowerCase();
    let matchesSearch = true;
    if (q) {
      const inTableMeta =
        table.tableNumber.toLowerCase().includes(q) ||
        (table.alias || '').toLowerCase().includes(q);
      const inSeats = table.seats.some(s =>
        (s.name || '').toLowerCase().includes(q) ||
        (s.giftNote || '').toLowerCase().includes(q)
      );
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

  function renderPosterTables() {
    const layer = document.getElementById('tables-layer');
    if (!layer) return;

    const radiusPx = 56; // 10 個電影院座位小格環繞半徑
    const centerPx = 73; // table-node 146x146 的中心點

    layer.innerHTML = state.tables.map(table => {
      const isSelected = table.id === state.selectedTableId;
      const isMain = table.tableNumber === '主桌' || table.id === 'T_MAIN';
      const isOrange = table.zone === 'orange';
      const isMatch = tableMatchesFilterAndSearch(table);

      const seated = table.seats.filter(s => (s.name && s.name.trim()) || s.isChildSeat).length;
      const vegs = table.seats.filter(s => (s.name || s.isChildSeat) && s.diet === 'veg').length;
      const childs = table.seats.filter(s => s.isChildSeat).length;
      const gifts = table.seats.filter(s => s.hasGift).length;

      // 產生環繞 10 個電影院座位小格
      const seatsHtml = table.seats.map((seat, idx) => {
        const angle = (idx / SEATS_PER_TABLE) * 2 * Math.PI - Math.PI / 2;
        const sx = centerPx + radiusPx * Math.cos(angle);
        const sy = centerPx + radiusPx * Math.sin(angle);

        const hasName = Boolean(seat.name && seat.name.trim());
        const classes = ['seat-mini-box'];
        if (hasName) classes.push('occupied');
        if (seat.diet === 'veg' && (hasName || seat.isChildSeat)) classes.push('diet-veg');
        if (seat.isChildSeat) classes.push('child-seat');

        // 兒童座椅更換顯示：優先顯示 👶 圖示 + 簡稱；一般入座顯示人名前 2~3 字；空位顯示題號
        let displayLabel = String(seat.seatIndex);
        if (seat.isChildSeat) {
          const shortName = hasName ? seat.name.trim().slice(0, 2) : '兒童';
          displayLabel = `👶${shortName}`;
        } else if (hasName) {
          displayLabel = seat.name.trim().slice(0, 3);
        }

        // 右上角微型標記（素食 🥗 / 婚禮小物 🎁）
        let badges = '';
        if (seat.diet === 'veg' && (hasName || seat.isChildSeat)) {
          badges += '<span class="micro-badge" title="素食">🥗</span>';
        }
        if (seat.hasGift) {
          badges += `<span class="micro-badge" title="婚禮小物：${escapeHtml(seat.giftNote || '已標記')}">🎁</span>`;
        }

        const tooltipParts = [
          `${table.tableNumber}桌 - 座位 #${seat.seatIndex}`,
          hasName ? `賓客：${seat.name}` : '（空位）',
          `飲食：${seat.diet === 'veg' ? '🥗 素食' : '🥩 葷食'}`,
          seat.isChildSeat ? '👶 兒童座椅' : '',
          seat.hasGift ? `🎁 小物/驚喜：${seat.giftNote || '有'}` : ''
        ].filter(Boolean).join('｜');

        return `
          <div class="${classes.join(' ')}"
               style="left: ${sx.toFixed(1)}px; top: ${sy.toFixed(1)}px;"
               data-table-id="${escapeHtml(table.id)}"
               data-seat-index="${seat.seatIndex}"
               title="${escapeHtml(tooltipParts)}">
            <span class="seat-mini-text">${escapeHtml(displayLabel)}</span>
            ${badges ? `<div class="seat-micro-badges">${badges}</div>` : ''}
          </div>
        `;
      }).join('');

      let miniSummary = `${seated}/10`;
      if (childs > 0) miniSummary += ` 👶${childs}`;
      if (vegs > 0) miniSummary += ` 🥗${vegs}`;
      if (gifts > 0) miniSummary += ` 🎁${gifts}`;

      const nodeClasses = [
        'table-node',
        isMain ? 'main-table' : '',
        isOrange ? 'orange-table' : '',
        isSelected ? 'selected' : '',
        !isMatch ? 'dimmed' : ''
      ].filter(Boolean).join(' ');

      return `
        <div class="${nodeClasses}"
             id="poster-table-${escapeHtml(table.id)}"
             data-table-id="${escapeHtml(table.id)}"
             style="left: ${table.x.toFixed(2)}%; top: ${table.y.toFixed(2)}%;">
          ${seatsHtml}
          <div class="table-circle" data-table-id="${escapeHtml(table.id)}">
            <div class="table-number-label">${escapeHtml(table.tableNumber)}</div>
            ${table.alias ? `<div class="table-alias-label" title="${escapeHtml(table.alias)}">${escapeHtml(table.alias)}</div>` : ''}
            <div class="table-occupancy-badge">${escapeHtml(miniSummary)}</div>
          </div>
        </div>
      `;
    }).join('');
  }

  function renderInspector() {
    const table = getSelectedTable();
    if (!table) return;

    const heading = document.getElementById('inspector-heading');
    const inputNum = document.getElementById('input-table-number');
    const inputAlias = document.getElementById('input-table-alias');
    const wheelNum = document.getElementById('wheel-table-num');
    const wheelAlias = document.getElementById('wheel-table-alias');
    const wheelStats = document.getElementById('wheel-table-stats');

    const seatedCount = table.seats.filter(s => (s.name && s.name.trim()) || s.isChildSeat).length;
    const zoneTag = table.zone === 'orange' ? '［🍊 橘色擴充區］' : '［🏛️ 主宴會廳］';

    if (heading) {
      heading.textContent = `🪑 ${table.tableNumber}（${table.alias || '未設別稱'}）${zoneTag}`;
    }
    if (inputNum && document.activeElement !== inputNum) {
      inputNum.value = table.tableNumber;
    }
    if (inputAlias && document.activeElement !== inputAlias) {
      inputAlias.value = table.alias || '';
    }
    if (wheelNum) wheelNum.textContent = table.tableNumber;
    if (wheelAlias) wheelAlias.textContent = table.alias || '點擊上方輸入別稱';
    if (wheelStats) wheelStats.textContent = `已排 ${seatedCount} / ${SEATS_PER_TABLE} 位`;

    renderCinemaWheelSeats(table);
    renderSelectedSeatForm(table);
    renderCompactSeatList(table);
    syncBatchTextarea(table);
  }

  function renderCinemaWheelSeats(table) {
    const container = document.getElementById('cinema-wheel-seats');
    if (!container) return;

    const box = document.getElementById('cinema-wheel-box');
    const w = (box && box.clientWidth) ? box.clientWidth : 410;
    const h = 315;
    const cx = w / 2;
    const cy = h / 2;
    const rx = Math.min(155, (w / 2) - 46);
    const ry = 118;

    container.innerHTML = table.seats.map((seat, idx) => {
      const angle = (idx / SEATS_PER_TABLE) * 2 * Math.PI - Math.PI / 2;
      const x = cx + rx * Math.cos(angle);
      const y = cy + ry * Math.sin(angle);

      const isCurrent = seat.seatIndex === state.selectedSeatIndex;
      const isSwapSource = seat.seatIndex === state.swapSourceSeatIndex;
      const hasName = Boolean(seat.name && seat.name.trim());

      const classes = ['cinema-seat-slot'];
      if (isCurrent) classes.push('active-seat');
      if (isSwapSource) classes.push('swap-source');
      if (seat.isChildSeat) classes.push('is-child');
      if (seat.diet === 'veg' && (hasName || seat.isChildSeat)) classes.push('is-veg');

      const icons = [
        seat.isChildSeat ? '👶' : '',
        (seat.diet === 'veg' && (hasName || seat.isChildSeat)) ? '🥗' : '',
        seat.hasGift ? '🎁' : ''
      ].filter(Boolean).join('');

      const nameDisplay = seat.isChildSeat
        ? (hasName ? `👶 ${seat.name}` : '👶 兒童座椅')
        : (hasName ? seat.name : '空位');

      return `
        <div class="${classes.join(' ')}"
             style="left: ${x.toFixed(1)}px; top: ${y.toFixed(1)}px;"
             data-wheel-seat="${seat.seatIndex}"
             title="點擊編輯座位 #${seat.seatIndex}（或於換位模式點擊對調）">
          <div class="cinema-seat-top">
            <span>#${seat.seatIndex}</span>
            <span>${icons}</span>
          </div>
          <div class="cinema-seat-name ${(!hasName && !seat.isChildSeat) ? 'empty' : ''}">
            ${escapeHtml(nameDisplay)}
          </div>
        </div>
      `;
    }).join('');
  }

  function renderSelectedSeatForm(table) {
    const seat = table.seats.find(s => s.seatIndex === state.selectedSeatIndex) || table.seats[0];
    if (!seat) return;

    const badgeEl = document.getElementById('editor-seat-badge');
    const statusEl = document.getElementById('editor-seat-status');
    const nameInput = document.getElementById('input-seat-guest-name');
    const giftNoteInput = document.getElementById('input-seat-gift-note');
    const btnMeat = document.getElementById('btn-seat-diet-meat');
    const btnVeg = document.getElementById('btn-seat-diet-veg');
    const btnChild = document.getElementById('btn-seat-child-toggle');
    const btnGift = document.getElementById('btn-seat-gift-toggle');
    const btnSwap = document.getElementById('btn-swap-seat-mode');

    if (badgeEl) {
      badgeEl.textContent = `${table.tableNumber} 桌 — 座位 #${seat.seatIndex}`;
    }
    if (statusEl) {
      const tags = [];
      if (seat.name) tags.push(seat.name);
      if (seat.isChildSeat) tags.push('👶兒童椅');
      tags.push(seat.diet === 'veg' ? '🥗素食' : '🥩葷食');
      if (seat.hasGift) tags.push(`🎁${seat.giftNote || '婚禮小物'}`);
      statusEl.textContent = tags.length ? `（${tags.join('・')}）` : '（空位）';
    }

    if (nameInput && document.activeElement !== nameInput) {
      nameInput.value = seat.name || '';
    }
    if (giftNoteInput && document.activeElement !== giftNoteInput) {
      giftNoteInput.value = seat.giftNote || '';
    }

    if (btnMeat) {
      btnMeat.className = 'toggle-option' + (seat.diet !== 'veg' ? ' active-meat' : '');
    }
    if (btnVeg) {
      btnVeg.className = 'toggle-option' + (seat.diet === 'veg' ? ' active-veg' : '');
    }
    if (btnChild) {
      btnChild.className = 'toggle-option' + (seat.isChildSeat ? ' active-child' : '');
      btnChild.innerHTML = seat.isChildSeat ? '👶 兒童座椅（已啟用）' : '👶 設為兒童座椅';
    }
    if (btnGift) {
      btnGift.className = 'toggle-option' + (seat.hasGift ? ' active-gift' : '');
      btnGift.innerHTML = seat.hasGift ? '🎁 已放小物/驚喜' : '🎁 放置小物/驚喜';
    }
    if (btnSwap) {
      if (state.swapSourceSeatIndex === seat.seatIndex) {
        btnSwap.textContent = '✨ 請點選目標座位對調 (點此取消)';
        btnSwap.classList.add('btn-orange');
      } else {
        btnSwap.textContent = '⇄ 與他座換位';
        btnSwap.classList.remove('btn-orange');
      }
    }
  }

  function renderCompactSeatList(table) {
    const listEl = document.getElementById('seat-list-compact');
    if (!listEl) return;

    listEl.innerHTML = table.seats.map(seat => {
      const isActive = seat.seatIndex === state.selectedSeatIndex;
      const hasName = Boolean(seat.name && seat.name.trim());
      const badges = [];

      if (seat.isChildSeat) {
        badges.push('<span style="background:#fef3c7;color:#92400e;padding:2px 6px;border-radius:6px;font-size:0.7rem;font-weight:700;">👶 兒童座椅</span>');
      }
      if (hasName || seat.isChildSeat) {
        if (seat.diet === 'veg') {
          badges.push('<span style="background:#d1fae5;color:#065f46;padding:2px 6px;border-radius:6px;font-size:0.7rem;font-weight:700;">🥗 素食</span>');
        } else {
          badges.push('<span style="background:#f1f5f9;color:#475569;padding:2px 6px;border-radius:6px;font-size:0.7rem;font-weight:600;">🥩 葷</span>');
        }
      }
      if (seat.hasGift) {
        badges.push(`<span style="background:#ede9fe;color:#5b21b6;padding:2px 6px;border-radius:6px;font-size:0.7rem;font-weight:700;">🎁 ${escapeHtml(seat.giftNote || '小物')}</span>`);
      }

      return `
        <div class="seat-row-item ${isActive ? 'active' : ''} ${seat.isChildSeat ? 'is-child' : ''}"
             data-row-seat="${seat.seatIndex}">
          <div class="seat-row-num">${seat.isChildSeat ? '👶' : seat.seatIndex}</div>
          <div style="font-size: 0.83rem; font-weight: ${hasName ? '800' : '500'}; color: ${hasName ? '#0f172a' : '#94a3b8'};">
            ${escapeHtml(hasName ? seat.name : (seat.isChildSeat ? '兒童專用座位' : '（空位 - 點擊編輯）'))}
          </div>
          <div style="display: flex; gap: 4px; flex-wrap: wrap; justify-content: flex-end;">
            ${badges.join('')}
          </div>
        </div>
      `;
    }).join('');
  }

  function syncBatchTextarea(table) {
    const textarea = document.getElementById('textarea-batch-seats');
    if (!textarea || document.activeElement === textarea) return;

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

    saveToLocalStorage(true);
    renderAll();
    showToast(`📋 已整桌更新「${table.tableNumber} 桌」的 1~10 號座位清單！`);
  }

  // ==================== RSVP Import to Current Table ====================
  async function fetchCloudRsvpList(silent = false) {
    try {
      const response = await fetch(API_URL + '?action=rsvp');
      const result = await response.json();
      if (result && result.status === 'success' && result.data && Array.isArray(result.data.rsvp) && result.data.rsvp.length > 0) {
        state.rsvpList = result.data.rsvp;
        renderRsvpImportList();
        if (!silent) {
          showToast(`💌 已同步 ${state.rsvpList.length} 筆雲端報名清單！`);
        }
        return;
      }
    } catch (err) {
      console.warn('RSVP fetch fallback:', err);
    }
    renderRsvpImportList();
    if (!silent) {
      showToast('ℹ️ 已載入預設報名清單範例供快速排桌。');
    }
  }

  function renderRsvpImportList() {
    const container = document.getElementById('rsvp-card-list');
    if (!container) return;

    if (!state.rsvpList || state.rsvpList.length === 0) {
      container.innerHTML = '<div style="padding:18px;text-align:center;color:#64748b;font-size:0.84rem;">尚無報名資料</div>';
      return;
    }

    container.innerHTML = state.rsvpList.map((item, idx) => {
      const name = String(item['姓名'] || '').trim();
      const side = String(item['陣營'] || '').trim();
      const pax = Math.max(1, parseInt(item['參與人數'], 10) || 1);
      const dietStr = String(item['葷素選擇'] || '葷食').trim();
      const childCount = parseInt(item['兒童座椅'], 10) || 0;
      const note = String(item['備註/祝福'] || '').trim();

      // 檢查是否已經排入某桌
      let assignedTable = '';
      state.tables.forEach(t => {
        if (t.seats.some(s => s.name && (s.name === name || s.name.startsWith(name + '(')))) {
          assignedTable = t.tableNumber;
        }
      });

      return `
        <div class="rsvp-guest-card">
          <div class="rsvp-guest-info">
            <div class="rsvp-guest-name">
              ${escapeHtml(name)}
              <span style="font-size:0.72rem;font-weight:700;padding:1px 6px;border-radius:999px;background:#e0f2fe;color:#0369a1;">
                ${escapeHtml(side || '親友')}・共 ${pax} 人
              </span>
              ${assignedTable ? `<span style="font-size:0.72rem;font-weight:700;padding:1px 6px;border-radius:999px;background:#d1fae5;color:#065f46;">已排 ${escapeHtml(assignedTable)} 桌</span>` : ''}
            </div>
            <div class="rsvp-guest-meta">
              <span>🍽️ ${escapeHtml(dietStr)}</span>
              ${childCount > 0 ? `<span>👶 兒童椅 ${childCount} 張</span>` : ''}
              ${note ? `<span>📝 ${escapeHtml(note)}</span>` : ''}
            </div>
          </div>
          <button type="button" class="btn btn-sm btn-primary" data-rsvp-idx="${idx}">
            ＋ 帶入本桌 (${pax}位)
          </button>
        </div>
      `;
    }).join('');
  }

  function importRsvpGuestToCurrentTable(rsvpIndex) {
    const item = state.rsvpList[rsvpIndex];
    const table = getSelectedTable();
    if (!item || !table) return;

    const baseName = String(item['姓名'] || '貴賓').trim();
    const pax = Math.max(1, parseInt(item['參與人數'], 10) || 1);
    const dietStr = String(item['葷素選擇'] || '').trim();
    const childCount = Math.max(0, parseInt(item['兒童座椅'], 10) || 0);

    // 解析素食人數
    let vegQuota = 0;
    const vegMatch = dietStr.match(/素食?\s*[:：]?\s*(\d+)/);
    if (vegMatch) {
      vegQuota = parseInt(vegMatch[1], 10) || 0;
    } else if (dietStr.includes('素')) {
      vegQuota = pax;
    }
    let childQuota = childCount;

    const emptySeats = table.seats.filter(s => !s.name && !s.isChildSeat);
    if (emptySeats.length < pax) {
      showToast(`⚠️ 「${table.tableNumber} 桌」目前僅剩 ${emptySeats.length} 個空位，無法一次放入 ${pax} 人！`);
      return;
    }

    for (let i = 0; i < pax; i++) {
      const targetSeat = emptySeats[i];
      const isChild = childQuota > 0 && (i >= pax - childCount);
      if (isChild) childQuota--;

      const isVeg = vegQuota > 0;
      if (isVeg) vegQuota--;

      targetSeat.name = i === 0
        ? baseName
        : (isChild ? `${baseName}(兒童椅)` : `${baseName}(攜伴${i + 1})`);
      targetSeat.diet = isVeg ? 'veg' : 'meat';
      targetSeat.isChildSeat = isChild;
    }

    saveToLocalStorage(true);
    renderAll();
    renderRsvpImportList();
    showToast(`🎉 已將「${baseName}」共 ${pax} 位賓客帶入 ${table.tableNumber} 桌！`);
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
      showToast('📥 已匯出 Excel 檔案：金饌廳_婚宴座位安排表.xlsx');
    } else {
      // Fallback: 匯出 JSON 檔案
      const blob = new Blob([JSON.stringify({ tables: state.tables }, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = '金饌廳_婚宴座位安排表.json';
      a.click();
      URL.revokeObjectURL(url);
      showToast('📥 已匯出座位設定檔 (.json)');
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
            state.tables = normalizeTables(rawTables);
            state.selectedTableId = state.tables[0].id;
            state.selectedSeatIndex = 1;
            saveToLocalStorage(true);
            renderAll();
            showToast(`📤 已從 JSON 成功匯入 ${state.tables.length} 桌座位配置！`);
          }
        } catch (err) {
          showToast('⚠️ JSON 檔案格式不正確，請確認內容。');
        }
      };
      reader.readAsText(file);
      return;
    }

    // Excel (.xlsx / .xls) 匯入解析
    if (typeof XLSX === 'undefined') {
      showToast('⚠️ Excel 解析元件未載入，請使用 JSON 檔案匯入。');
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
          state.tables = normalizeTables(reconstructed);
          state.selectedTableId = state.tables[0].id;
          state.selectedSeatIndex = 1;
          saveToLocalStorage(true);
          renderAll();
          showToast(`📤 已從 Excel 成功匯入 ${state.tables.length} 桌與完整座位設定！`);
        } else {
          showToast('⚠️ Excel 中未找到有效的桌次資料列。');
        }
      } catch (err) {
        console.error('Excel import error:', err);
        showToast('⚠️ 匯入 Excel 失敗，請確認檔案格式。');
      }
    };
    reader.readAsArrayBuffer(file);
  }

  // ==================== Drag & Drop Table Positioning on Poster ====================
  let dragContext = null;

  function initPosterDragAndClick() {
    const poster = document.getElementById('banquet-poster');
    const orangeZoneEl = document.getElementById('orange-extension-zone');
    if (!poster) return;

    poster.addEventListener('pointerdown', e => {
      // 若點擊的是某個座位小格，直接選取該桌與該座位
      const seatBox = e.target.closest('.seat-mini-box');
      if (seatBox) {
        e.stopPropagation();
        const tblId = seatBox.dataset.tableId;
        const seatIdx = parseInt(seatBox.dataset.seatIndex, 10);
        if (tblId) state.selectedTableId = tblId;
        if (seatIdx >= 1 && seatIdx <= SEATS_PER_TABLE) {
          state.selectedSeatIndex = seatIdx;
        }
        state.swapSourceSeatIndex = null;
        switchInspectorTab('seat-map');
        renderAll();
        return;
      }

      // 若點擊的是圓桌本體，啟動選取與可拖曳狀態
      const tableNode = e.target.closest('.table-node');
      if (!tableNode) return;

      const tblId = tableNode.dataset.tableId;
      const table = state.tables.find(t => t.id === tblId);
      if (!table) return;

      state.selectedTableId = tblId;
      renderInspector();
      document.querySelectorAll('.table-node').forEach(el => {
        el.classList.toggle('selected', el.dataset.tableId === tblId);
      });

      const rect = poster.getBoundingClientRect();
      dragContext = {
        tableId: tblId,
        nodeEl: tableNode,
        startClientX: e.clientX,
        startClientY: e.clientY,
        origX: table.x,
        origY: table.y,
        posterWidth: rect.width,
        posterHeight: rect.height,
        moved: false
      };

      tableNode.classList.add('dragging');
      if (tableNode.setPointerCapture) {
        try { tableNode.setPointerCapture(e.pointerId); } catch (_) {}
      }
    });

    window.addEventListener('pointermove', e => {
      if (!dragContext) return;
      const dxPx = e.clientX - dragContext.startClientX;
      const dyPx = e.clientY - dragContext.startClientY;

      if (Math.abs(dxPx) > 3 || Math.abs(dyPx) > 3) {
        dragContext.moved = true;
      }
      if (!dragContext.moved) return;

      const dxPct = (dxPx / dragContext.posterWidth) * 100;
      const dyPct = (dyPx / dragContext.posterHeight) * 100;

      let nextX = dragContext.origX + dxPct;
      let nextY = dragContext.origY + dyPct;

      if (state.gridSnap) {
        nextX = Math.round(nextX / 1.5) * 1.5;
        nextY = Math.round(nextY / 1.2) * 1.2;
      }

      nextX = Math.max(7.5, Math.min(92.5, nextX));
      nextY = Math.max(19.0, Math.min(91.5, nextY));

      const table = state.tables.find(t => t.id === dragContext.tableId);
      if (table) {
        table.x = nextX;
        table.y = nextY;
        table.zone = nextY >= ORANGE_ZONE_Y_MIN ? 'orange' : 'main';
      }

      if (dragContext.nodeEl) {
        dragContext.nodeEl.style.left = `${nextX.toFixed(2)}%`;
        dragContext.nodeEl.style.top = `${nextY.toFixed(2)}%`;
        dragContext.nodeEl.classList.toggle('orange-table', nextY >= ORANGE_ZONE_Y_MIN);
      }

      if (orangeZoneEl) {
        orangeZoneEl.classList.toggle('drag-over', nextY >= ORANGE_ZONE_Y_MIN);
      }
    });

    window.addEventListener('pointerup', () => {
      if (!dragContext) return;
      const wasMoved = dragContext.moved;
      if (dragContext.nodeEl) {
        dragContext.nodeEl.classList.remove('dragging');
      }
      if (orangeZoneEl) {
        orangeZoneEl.classList.remove('drag-over');
      }
      dragContext = null;

      if (wasMoved) {
        saveToLocalStorage(true);
        renderAll();
      }
    });
  }

  // ==================== Event Bindings ====================
  function bindEvents() {
    initPosterDragAndClick();

    // Top bar table actions
    const btnAddMain = document.getElementById('btn-add-main-table');
    if (btnAddMain) btnAddMain.addEventListener('click', () => addTable('main'));

    const btnAddOrange = document.getElementById('btn-add-orange-table');
    if (btnAddOrange) btnAddOrange.addEventListener('click', () => addTable('orange'));

    // Orange extension box quick controls (＋1桌 / 設為5桌 / 設為10桌 / 清空)
    const btnOrangeAdd1 = document.getElementById('btn-orange-add-1');
    if (btnOrangeAdd1) btnOrangeAdd1.addEventListener('click', () => addTable('orange'));

    const btnOrange5 = document.getElementById('btn-orange-preset-5');
    if (btnOrange5) btnOrange5.addEventListener('click', () => setOrangeZoneTableCount(5));

    const btnOrange10 = document.getElementById('btn-orange-preset-10');
    if (btnOrange10) btnOrange10.addEventListener('click', () => setOrangeZoneTableCount(10));

    const btnOrangeClear = document.getElementById('btn-orange-clear');
    if (btnOrangeClear) btnOrangeClear.addEventListener('click', clearOrangeZoneTables);

    // Delete table & Reset layout
    const btnDeleteTable = document.getElementById('btn-delete-selected-table');
    if (btnDeleteTable) btnDeleteTable.addEventListener('click', deleteSelectedTable);

    const btnResetLayout = document.getElementById('btn-reset-default-layout');
    if (btnResetLayout) btnResetLayout.addEventListener('click', resetToDefaultLayout);

    // Cloud Sync & Excel Import/Export
    const btnSaveCloud = document.getElementById('btn-save-cloud');
    if (btnSaveCloud) btnSaveCloud.addEventListener('click', saveToCloud);

    const btnLoadCloud = document.getElementById('btn-load-cloud');
    if (btnLoadCloud) btnLoadCloud.addEventListener('click', loadFromCloud);

    const btnExportExcel = document.getElementById('btn-export-excel');
    if (btnExportExcel) btnExportExcel.addEventListener('click', exportToExcel);

    const btnImportTrigger = document.getElementById('btn-import-excel-trigger');
    const inputImportFile = document.getElementById('input-import-file');
    if (btnImportTrigger && inputImportFile) {
      btnImportTrigger.addEventListener('click', () => inputImportFile.click());
      inputImportFile.addEventListener('change', e => {
        const file = e.target.files && e.target.files[0];
        if (file) {
          handleImportFile(file);
          inputImportFile.value = '';
        }
      });
    }

    // Search & Highlight Filter Chips
    const searchInput = document.getElementById('input-search-guest');
    const clearSearchBtn = document.getElementById('btn-clear-search');
    if (searchInput) {
      searchInput.addEventListener('input', e => {
        state.searchQuery = e.target.value;
        if (clearSearchBtn) {
          clearSearchBtn.style.display = state.searchQuery ? 'block' : 'none';
        }
        renderPosterTables();
      });
    }
    if (clearSearchBtn) {
      clearSearchBtn.addEventListener('click', () => {
        state.searchQuery = '';
        if (searchInput) searchInput.value = '';
        clearSearchBtn.style.display = 'none';
        renderPosterTables();
      });
    }

    document.querySelectorAll('[data-highlight]').forEach(btn => {
      btn.addEventListener('click', () => {
        state.highlightMode = btn.dataset.highlight || 'all';
        document.querySelectorAll('[data-highlight]').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        renderPosterTables();
      });
    });

    // Grid Snap & Zoom Controls
    const chkSnap = document.getElementById('chk-grid-snap');
    if (chkSnap) {
      chkSnap.addEventListener('change', e => {
        state.gridSnap = e.target.checked;
      });
    }

    const btnZoomIn = document.getElementById('btn-zoom-in');
    const btnZoomOut = document.getElementById('btn-zoom-out');
    const btnZoomFit = document.getElementById('btn-zoom-fit');
    if (btnZoomIn) btnZoomIn.addEventListener('click', () => setZoom(state.zoomLevel + 0.1));
    if (btnZoomOut) btnZoomOut.addEventListener('click', () => setZoom(state.zoomLevel - 0.1));
    if (btnZoomFit) {
      btnZoomFit.addEventListener('click', () => {
        const wrapper = document.getElementById('hall-scroll-wrapper');
        if (wrapper) {
          const ratio = Math.min(1.0, Math.max(0.55, (wrapper.clientWidth - 36) / 920));
          setZoom(ratio);
        }
      });
    }

    // Inspector Tabs
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        switchInspectorTab(btn.dataset.tab);
      });
    });

    // Table Number & Alias Live Edit
    const inputTableNum = document.getElementById('input-table-number');
    const inputTableAlias = document.getElementById('input-table-alias');
    if (inputTableNum) {
      inputTableNum.addEventListener('input', e => {
        const table = getSelectedTable();
        if (!table) return;
        table.tableNumber = e.target.value.trim() || table.tableNumber;
        saveToLocalStorage(true);
        renderAll();
      });
    }
    if (inputTableAlias) {
      inputTableAlias.addEventListener('input', e => {
        const table = getSelectedTable();
        if (!table) return;
        table.alias = e.target.value;
        saveToLocalStorage(true);
        renderAll();
      });
    }

    // Cinema Wheel Seat Click & Swap Logic
    const wheelSeatsContainer = document.getElementById('cinema-wheel-seats');
    if (wheelSeatsContainer) {
      wheelSeatsContainer.addEventListener('click', e => {
        const slot = e.target.closest('[data-wheel-seat]');
        if (!slot) return;
        const targetIdx = parseInt(slot.dataset.wheelSeat, 10);
        handleSeatSelectionOrSwap(targetIdx);
      });
    }

    // Compact Seat Row Click
    const compactList = document.getElementById('seat-list-compact');
    if (compactList) {
      compactList.addEventListener('click', e => {
        const row = e.target.closest('[data-row-seat]');
        if (!row) return;
        const targetIdx = parseInt(row.dataset.rowSeat, 10);
        handleSeatSelectionOrSwap(targetIdx);
      });
    }

    // Single Seat Editor Controls (人名、葷素、兒童座椅更換顯示、婚禮小物/驚喜)
    const inputSeatName = document.getElementById('input-seat-guest-name');
    if (inputSeatName) {
      inputSeatName.addEventListener('input', e => {
        const seat = getSelectedSeatObject();
        if (!seat) return;
        seat.name = e.target.value;
        saveToLocalStorage(true);
        renderAll();
      });
    }

    const btnDietMeat = document.getElementById('btn-seat-diet-meat');
    const btnDietVeg = document.getElementById('btn-seat-diet-veg');
    if (btnDietMeat) {
      btnDietMeat.addEventListener('click', () => {
        const seat = getSelectedSeatObject();
        if (!seat) return;
        seat.diet = 'meat';
        saveToLocalStorage(true);
        renderAll();
      });
    }
    if (btnDietVeg) {
      btnDietVeg.addEventListener('click', () => {
        const seat = getSelectedSeatObject();
        if (!seat) return;
        seat.diet = 'veg';
        saveToLocalStorage(true);
        renderAll();
      });
    }

    const btnChildToggle = document.getElementById('btn-seat-child-toggle');
    if (btnChildToggle) {
      btnChildToggle.addEventListener('click', () => {
        const seat = getSelectedSeatObject();
        if (!seat) return;
        seat.isChildSeat = !seat.isChildSeat;
        saveToLocalStorage(true);
        renderAll();
        showToast(seat.isChildSeat ? '👶 已將此座位更換為「兒童座椅」顯示！' : '🪑 已恢復為一般成人座位顯示。');
      });
    }

    const btnGiftToggle = document.getElementById('btn-seat-gift-toggle');
    const inputGiftNote = document.getElementById('input-seat-gift-note');
    if (btnGiftToggle) {
      btnGiftToggle.addEventListener('click', () => {
        const seat = getSelectedSeatObject();
        if (!seat) return;
        seat.hasGift = !seat.hasGift;
        saveToLocalStorage(true);
        renderAll();
      });
    }
    if (inputGiftNote) {
      inputGiftNote.addEventListener('input', e => {
        const seat = getSelectedSeatObject();
        if (!seat) return;
        seat.giftNote = e.target.value;
        if (seat.giftNote.trim()) {
          seat.hasGift = true;
        }
        saveToLocalStorage(true);
        renderAll();
      });
    }

    const btnSwapSeat = document.getElementById('btn-swap-seat-mode');
    if (btnSwapSeat) {
      btnSwapSeat.addEventListener('click', () => {
        if (state.swapSourceSeatIndex === state.selectedSeatIndex) {
          state.swapSourceSeatIndex = null;
        } else {
          state.swapSourceSeatIndex = state.selectedSeatIndex;
          showToast(`⇄ 請點選本桌另一個座位，即可與座位 #${state.selectedSeatIndex} 對調位置！`);
        }
        renderInspector();
      });
    }

    const btnClearSeat = document.getElementById('btn-clear-single-seat');
    if (btnClearSeat) {
      btnClearSeat.addEventListener('click', () => {
        const seat = getSelectedSeatObject();
        if (!seat) return;
        seat.name = '';
        seat.diet = 'meat';
        seat.isChildSeat = false;
        seat.hasGift = false;
        seat.giftNote = '';
        saveToLocalStorage(true);
        renderAll();
      });
    }

    // Batch List Tab Actions
    const btnApplyBatch = document.getElementById('btn-apply-batch-text');
    if (btnApplyBatch) btnApplyBatch.addEventListener('click', applyBatchTextToTable);

    const btnAllMeat = document.getElementById('btn-table-all-meat');
    if (btnAllMeat) {
      btnAllMeat.addEventListener('click', () => {
        const table = getSelectedTable();
        if (!table) return;
        table.seats.forEach(s => { s.diet = 'meat'; });
        saveToLocalStorage(true);
        renderAll();
        showToast(`🥩 已將 ${table.tableNumber} 桌全數設為葷食。`);
      });
    }

    const btnAllVeg = document.getElementById('btn-table-all-veg');
    if (btnAllVeg) {
      btnAllVeg.addEventListener('click', () => {
        const table = getSelectedTable();
        if (!table) return;
        table.seats.forEach(s => { s.diet = 'veg'; });
        saveToLocalStorage(true);
        renderAll();
        showToast(`🥗 已將 ${table.tableNumber} 桌全數設為素食。`);
      });
    }

    const btnTableAddChild = document.getElementById('btn-table-add-child');
    if (btnTableAddChild) {
      btnTableAddChild.addEventListener('click', () => {
        const table = getSelectedTable();
        if (!table) return;
        const target = [...table.seats].reverse().find(s => !s.isChildSeat);
        if (target) {
          target.isChildSeat = true;
          if (!target.name) target.name = '兒童座椅';
          saveToLocalStorage(true);
          renderAll();
          showToast(`👶 已於 ${table.tableNumber} 桌座位 #${target.seatIndex} 設置兒童座椅！`);
        }
      });
    }

    const btnTableAllGift = document.getElementById('btn-table-all-gift');
    if (btnTableAllGift) {
      btnTableAllGift.addEventListener('click', () => {
        const table = getSelectedTable();
        if (!table) return;
        table.seats.forEach(s => {
          if (s.name || s.isChildSeat) s.hasGift = true;
        });
        saveToLocalStorage(true);
        renderAll();
        showToast(`🎁 已為 ${table.tableNumber} 桌所有在座賓客標記婚禮小物！`);
      });
    }

    const btnTableClearAll = document.getElementById('btn-table-clear-all');
    if (btnTableClearAll) {
      btnTableClearAll.addEventListener('click', () => {
        const table = getSelectedTable();
        if (!table) return;
        table.seats = createEmptySeats(SEATS_PER_TABLE);
        saveToLocalStorage(true);
        renderAll();
        showToast(`🗑️ 已清空 ${table.tableNumber} 桌的所有座位資料。`);
      });
    }

    // RSVP Import Tab Actions
    const btnFetchRsvp = document.getElementById('btn-fetch-rsvp');
    if (btnFetchRsvp) btnFetchRsvp.addEventListener('click', () => fetchCloudRsvpList(false));

    const rsvpListEl = document.getElementById('rsvp-card-list');
    if (rsvpListEl) {
      rsvpListEl.addEventListener('click', e => {
        const btn = e.target.closest('[data-rsvp-idx]');
        if (!btn) return;
        const idx = parseInt(btn.dataset.rsvpIdx, 10);
        importRsvpGuestToCurrentTable(idx);
      });
    }
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

        showToast(`⇄ 已將座位 #${s1.seatIndex} 與 座位 #${s2.seatIndex} 位置對調！`);
      }
      state.swapSourceSeatIndex = null;
      state.selectedSeatIndex = targetSeatIndex;
      saveToLocalStorage(true);
      renderAll();
      return;
    }

    state.swapSourceSeatIndex = null;
    state.selectedSeatIndex = targetSeatIndex;
    renderInspector();
  }

  function switchInspectorTab(tabId) {
    document.querySelectorAll('.tab-btn').forEach(btn => {
      const isMatch = btn.dataset.tab === tabId;
      btn.classList.toggle('active', isMatch);
      btn.setAttribute('aria-selected', isMatch ? 'true' : 'false');
    });

    const pSeatMap = document.getElementById('tab-panel-seat-map');
    const pBatch = document.getElementById('tab-panel-batch-list');
    const pRsvp = document.getElementById('tab-panel-rsvp-import');

    if (pSeatMap) pSeatMap.classList.toggle('hidden', tabId !== 'seat-map');
    if (pBatch) pBatch.classList.toggle('hidden', tabId !== 'batch-list');
    if (pRsvp) pRsvp.classList.toggle('hidden', tabId !== 'rsvp-import');

    const table = getSelectedTable();
    if (table && tabId === 'batch-list') {
      syncBatchTextarea(table);
    }
  }

  function setZoom(level) {
    state.zoomLevel = Math.max(0.55, Math.min(1.35, Number(level.toFixed(2))));
    const poster = document.getElementById('banquet-poster');
    const label = document.getElementById('label-zoom-level');
    if (poster) {
      poster.style.transform = `scale(${state.zoomLevel})`;
      poster.style.marginBottom = `${(state.zoomLevel - 1) * 1520}px`;
    }
    if (label) {
      label.textContent = `${Math.round(state.zoomLevel * 100)}%`;
    }
  }

  // ==================== Utilities ====================
  function showToast(message) {
    const container = document.getElementById('toast-container');
    if (!container) return;
    const el = document.createElement('div');
    el.className = 'toast-msg';
    el.textContent = message;
    container.appendChild(el);
    setTimeout(() => {
      el.remove();
    }, 3200);
  }

  function escapeHtml(str) {
    return String(str ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  // Expose minimal API on window for automated Playwright verification & debugging
  window.WeddingSeatingApp = {
    getState: () => state,
    setOrangeZoneTableCount,
    addTable,
    resetToDefaultLayout,
    exportToExcel,
    reconstructTablesFromSheetRows
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
