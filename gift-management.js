// ==================== Configuration ====================
const API_URL = 'https://script.google.com/macros/s/AKfycbzygeElwgGgU1z_cqL2C5WDJ72Jtlvua1lUMg_52i6spDi3xxDXOzkqI2IXNQQPgDFLNw/exec';

// ==================== Text Content ====================
const text = {
  loading: '載入中...',
  empty: '尚無符合條件的賓客資料',
  error_load: '載入失敗，請重新整理頁面',
  edit_title: '編輯禮金',
  add_title: '新增賓客',
  success_save: '儲存成功！',
  error_save: '儲存失敗，請重試',
  error_amount: '請輸入有效金額',
  error_name: '請輸入姓名',
  error_side: '請選擇陣營',
  btn_saving: '儲存中...',
  btn_save: '確認儲存'
};

// ==================== State ====================
let guestData = [];
let currentRenderedList = [];
let currentGuest = null;
let filterMode = localStorage.getItem('gift_filter_mode') || 'all'; // 'all' | 'groom' | 'bride'
let searchKeyword = '';
let viewMode = 'edit'; // 'edit' | 'add'

// ==================== Initialize ====================
function init() {
  // 預設隱藏金額
  document.body.classList.add('amounts-hidden');
  document.getElementById('eye-icon').textContent = '🙈';

  // 恢復篩選狀態
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.classList.remove('active');
    if (btn.dataset.filter === filterMode) {
      btn.classList.add('active');
    }
  });

  attachEventListeners();
  loadGuestData(true);
}

// ==================== Data Functions ====================
async function loadGuestData(showLoading = false) {
  const listEl = document.getElementById('guest-list');
  if (showLoading) {
    listEl.innerHTML = `
      <div class="loading-state">
        <div class="spinner"></div>
        <p>${text.loading}</p>
      </div>
    `;
  }

  try {
    const response = await fetch(API_URL + '?action=gift');
    const result = await response.json();

    if (result.status === 'success' && result.data && Array.isArray(result.data.gift)) {
      guestData = result.data.gift;
      renderCurrentList();
    } else {
      throw new Error('Invalid response format');
    }
  } catch (error) {
    console.error('Load error:', error);
    if (showLoading || guestData.length === 0) {
      listEl.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">⚠️</div>
          <p>${text.error_load}</p>
        </div>
      `;
    }
  }
}

// 根據 filterMode 與 searchKeyword 計算過濾後的資料
function getFilteredAndSearchedData() {
  let list = guestData;

  // 1. 依陣營篩選
  if (filterMode === 'groom') {
    list = list.filter(g => (g['陣營'] || '').includes('男方'));
  } else if (filterMode === 'bride') {
    list = list.filter(g => (g['陣營'] || '').includes('女方'));
  }

  // 2. 依搜尋字串篩選
  if (searchKeyword) {
    const kw = searchKeyword.toLowerCase();
    list = list.filter(guest => {
      const name = String(guest['姓名'] || '').toLowerCase();
      const side = String(guest['陣營'] || '').toLowerCase();
      const note = String(guest['備註/合包明細'] || '').toLowerCase();
      return name.includes(kw) || side.includes(kw) || note.includes(kw);
    });
  }

  return list;
}

// 更新頂部儀表板統計數字
function updateStats() {
  const totalGuests = guestData.length;
  let totalAmount = 0;
  let totalPaid = 0;
  let groomTotal = 0;
  let groomPaid = 0;
  let brideTotal = 0;
  let bridePaid = 0;

  guestData.forEach(g => {
    const amt = Number(g['金額']) || 0;
    const isPaid = amt > 0;
    totalAmount += amt;
    if (isPaid) totalPaid++;

    const side = String(g['陣營'] || '');
    if (side.includes('男方')) {
      groomTotal++;
      if (isPaid) groomPaid++;
    }
    if (side.includes('女方')) {
      brideTotal++;
      if (isPaid) bridePaid++;
    }
  });

  const totalGuestsEl = document.getElementById('stat-total-guests');
  const totalAmountEl = document.getElementById('stat-total-amount');
  const groomCountEl = document.getElementById('stat-groom-count');
  const brideCountEl = document.getElementById('stat-bride-count');

  if (totalGuestsEl) totalGuestsEl.innerHTML = `${totalPaid} / ${totalGuests} <span class="stat-subtext">人</span>`;
  if (totalAmountEl) totalAmountEl.textContent = '$' + totalAmount.toLocaleString();
  if (groomCountEl) groomCountEl.innerHTML = `${groomPaid} / ${groomTotal} <span class="stat-subtext">人</span>`;
  if (brideCountEl) brideCountEl.innerHTML = `${bridePaid} / ${brideTotal} <span class="stat-subtext">人</span>`;
}

// 統一渲染入口：保證依目前 filter 和搜尋呈現清單
function renderCurrentList() {
  updateStats();
  const listEl = document.getElementById('guest-list');
  currentRenderedList = getFilteredAndSearchedData();

  if (!currentRenderedList || currentRenderedList.length === 0) {
    listEl.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">💌</div>
        <p>${text.empty}</p>
      </div>
    `;
    return;
  }

  listEl.innerHTML = currentRenderedList.map((guest, index) => {
    const amount = Number(guest['金額']) || 0;
    const isPaid = amount > 0;
    const paidClass = isPaid ? 'paid' : '';
    const name = String(guest['姓名'] || '').trim();
    const side = String(guest['陣營'] || '').trim();
    const isGroom = side.includes('男方');
    const avatarType = isGroom ? 'groom' : 'bride';
    const sideBadgeType = isGroom ? 'groom' : 'bride';
    const initial = name ? name.charAt(0) : '客';

    const cakes = Number(guest['喜餅數量']) || 0;
    const note = String(guest['備註/合包明細'] || '').trim();
    const updateTime = guest['更新時間'] || '';
    const formattedTime = updateTime ? formatTaiwanDateTime(updateTime) : '';

    return `
      <div class="guest-item" data-index="${index}">
        <div class="guest-item-main">
          <div class="guest-avatar ${avatarType}">${escapeHtml(initial)}</div>
          <div class="guest-details">
            <div class="guest-name-row">
              <span class="guest-name ${paidClass}">${escapeHtml(name)}</span>
              <span class="guest-side-badge ${sideBadgeType}">${escapeHtml(side || '親友')}</span>
            </div>
            <div class="guest-meta-row">
              ${cakes > 0 ? `<span class="guest-tag cake">🎁 喜餅 ${cakes} 盒</span>` : ''}
              ${note ? `<span class="guest-tag" title="${escapeHtml(note)}">📝 ${escapeHtml(note)}</span>` : ''}
              ${formattedTime ? `<span class="guest-tag time">🕒 ${escapeHtml(formattedTime)}</span>` : ''}
            </div>
          </div>
        </div>
        <div class="guest-amount-wrap">
          <div class="guest-amount-val ${paidClass}">$${amount.toLocaleString()}</div>
        </div>
      </div>
    `;
  }).join('');

  attachGuestItemListeners();
}

function attachGuestItemListeners() {
  document.querySelectorAll('.guest-item').forEach(item => {
    item.addEventListener('click', () => {
      const index = parseInt(item.dataset.index, 10);
      const guest = currentRenderedList[index];
      if (guest) {
        openEditView(guest);
      }
    });
  });
}

// ==================== Filter ====================
function setFilter(mode) {
  filterMode = mode;
  localStorage.setItem('gift_filter_mode', mode); // 記住篩選狀態
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.classList.remove('active');
    if (btn.dataset.filter === mode) {
      btn.classList.add('active');
    }
  });
  renderCurrentList();
}

// ==================== Search ====================
function handleSearch(e) {
  searchKeyword = e.target.value.trim();
  const clearBtn = document.getElementById('clear-search');
  if (clearBtn) {
    clearBtn.style.display = searchKeyword ? 'flex' : 'none';
  }
  renderCurrentList();
}

function clearSearch() {
  const input = document.getElementById('search-input');
  if (input) {
    input.value = '';
  }
  searchKeyword = '';
  const clearBtn = document.getElementById('clear-search');
  if (clearBtn) clearBtn.style.display = 'none';
  renderCurrentList();
}

// ==================== Toggle Amounts ====================
function toggleAmounts() {
  const eyeIcon = document.getElementById('eye-icon');
  const isHidden = document.body.classList.contains('amounts-hidden');

  if (isHidden) {
    document.body.classList.remove('amounts-hidden');
    eyeIcon.textContent = '👁️';
  } else {
    document.body.classList.add('amounts-hidden');
    eyeIcon.textContent = '🙈';
  }
}

// ==================== Edit View ====================
function openEditView(guest) {
  viewMode = 'edit';
  currentGuest = guest;

  const titleEl = document.getElementById('view-title');
  const timeWrapEl = document.getElementById('view-update-time');
  const timeTextEl = document.getElementById('update-time-text');

  titleEl.textContent = text.edit_title;

  // 檢查是否有更新時間
  const updateTime = guest['更新時間'] || '';
  if (updateTime) {
    const formattedTime = formatTaiwanDateTime(updateTime);
    timeTextEl.textContent = `最後更新：${formattedTime}`;
    timeWrapEl.classList.remove('hidden');
  } else {
    timeWrapEl.classList.add('hidden');
  }

  // 姓名 (唯讀)
  const nameInput = document.getElementById('edit-name');
  nameInput.value = guest['姓名'] || '';
  nameInput.readOnly = true;

  // 陣營 (唯讀)
  const sideInput = document.getElementById('edit-side');
  const sideSelect = document.getElementById('edit-side-select');
  sideInput.value = guest['陣營'] || '';
  sideInput.readOnly = true;
  sideInput.style.display = 'block';
  sideSelect.style.display = 'none';

  // 金額、喜餅、備註
  document.getElementById('edit-amount').value = Number(guest['金額']) || 0;
  document.getElementById('edit-cakes').value = Number(guest['喜餅數量']) || 0;
  document.getElementById('edit-note').value = guest['備註/合包明細'] || '';

  document.getElementById('list-view').classList.add('hidden');
  document.getElementById('edit-view').classList.remove('hidden');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function openAddView() {
  viewMode = 'add';
  currentGuest = null;

  document.getElementById('view-title').textContent = text.add_title;
  document.getElementById('view-update-time').classList.add('hidden');

  // 姓名 (可輸入)
  const nameInput = document.getElementById('edit-name');
  nameInput.value = '';
  nameInput.readOnly = false;

  // 陣營 (下拉選單)
  const sideInput = document.getElementById('edit-side');
  const sideSelect = document.getElementById('edit-side-select');
  sideInput.style.display = 'none';
  sideSelect.style.display = 'block';
  // 預設選取當前 filter 陣營
  if (filterMode === 'groom') {
    sideSelect.value = '男方親友';
  } else if (filterMode === 'bride') {
    sideSelect.value = '女方親友';
  } else {
    sideSelect.value = '';
  }

  document.getElementById('edit-amount').value = 0;
  document.getElementById('edit-cakes').value = 0;
  document.getElementById('edit-note').value = '';

  document.getElementById('list-view').classList.add('hidden');
  document.getElementById('edit-view').classList.remove('hidden');
  window.scrollTo({ top: 0, behavior: 'smooth' });
  nameInput.focus();
}

function closeEditView() {
  currentGuest = null;
  document.getElementById('edit-view').classList.add('hidden');
  document.getElementById('list-view').classList.remove('hidden');
  // 返回清單時保證按當前 filter 重新渲染
  renderCurrentList();
}

// 快捷金額按鈕處理
function handleQuickAmount(e) {
  const btn = e.target.closest('.btn-quick-amount');
  if (!btn) return;

  const amountInput = document.getElementById('edit-amount');
  let currentVal = Number(amountInput.value) || 0;

  if (btn.dataset.add) {
    const addVal = Number(btn.dataset.add);
    amountInput.value = Math.max(0, currentVal + addVal);
  } else if (btn.dataset.set !== undefined) {
    const setVal = Number(btn.dataset.set);
    amountInput.value = setVal;
  }
}

// 快捷喜餅按鈕處理 (+1 與 歸 0)
function handleQuickCake(e) {
  const btn = e.target.closest('.btn-quick-cake');
  if (!btn) return;

  const cakeInput = document.getElementById('edit-cakes');
  let currentVal = Number(cakeInput.value) || 0;

  if (btn.dataset.cakeAdd !== undefined) {
    const addVal = Number(btn.dataset.cakeAdd);
    cakeInput.value = Math.max(0, currentVal + addVal);
  } else if (btn.dataset.cakeSet !== undefined) {
    cakeInput.value = Number(btn.dataset.cakeSet);
  }
}

// 統計看板收合/展開切換
function toggleStatsDashboard() {
  const dashboard = document.getElementById('stat-dashboard');
  const btn = document.getElementById('toggle-stats-btn');
  if (!dashboard || !btn) return;

  const isCollapsed = dashboard.classList.contains('collapsed');
  if (isCollapsed) {
    dashboard.classList.remove('collapsed');
    btn.setAttribute('aria-expanded', 'true');
    btn.textContent = '📊 收合統計看板 ▴';
  } else {
    dashboard.classList.add('collapsed');
    btn.setAttribute('aria-expanded', 'false');
    btn.textContent = '📊 報到統計看板 ▾';
  }
}

// 儲存邏輯
async function handleSave(e) {
  e.preventDefault();

  const name = document.getElementById('edit-name').value.trim();
  let side = '';

  if (viewMode === 'edit') {
    side = document.getElementById('edit-side').value.trim();
  } else {
    side = document.getElementById('edit-side-select').value.trim();
  }

  const amountStr = document.getElementById('edit-amount').value;
  const cakes = Number(document.getElementById('edit-cakes').value) || 0;
  const note = document.getElementById('edit-note').value.trim();

  // 驗證
  if (!name) {
    showToast(text.error_name, 'error');
    return;
  }
  if (!side) {
    showToast(text.error_side, 'error');
    return;
  }
  if (amountStr === '' || isNaN(amountStr) || Number(amountStr) < 0) {
    showToast(text.error_amount, 'error');
    return;
  }

  const amount = Number(amountStr);
  const nowFormatted = formatTaiwanDateTime(new Date());

  const saveBtn = document.getElementById('save-btn');
  const originalText = saveBtn.textContent;
  saveBtn.disabled = true;
  saveBtn.textContent = text.btn_saving;

  // 樂觀更新 (Optimistic Update)：先更新本地 guestData
  if (viewMode === 'edit') {
    const existingIndex = guestData.findIndex(g => 
      String(g['姓名']).trim() === name && String(g['陣營']).trim() === side
    );
    if (existingIndex !== -1) {
      guestData[existingIndex] = {
        ...guestData[existingIndex],
        '金額': amount,
        '喜餅數量': cakes,
        '備註/合包明細': note,
        '更新時間': nowFormatted
      };
    }
  } else {
    // 新增模式：加入 guestData 最前面
    const newGuest = {
      '姓名': name,
      '陣營': side,
      '金額': amount,
      '喜餅數量': cakes,
      '備註/合包明細': note,
      '更新時間': nowFormatted
    };
    // 檢查是否已有相同姓名陣營
    const existIdx = guestData.findIndex(g => 
      String(g['姓名']).trim() === name && String(g['陣營']).trim() === side
    );
    if (existIdx !== -1) {
      guestData[existIdx] = newGuest;
    } else {
      guestData.unshift(newGuest);
    }
  }

  // 立即重繪畫面並關閉編輯頁
  renderCurrentList();
  showToast(text.success_save, 'success');
  closeEditView();

  try {
    const payload = {
      formType: 'gift',
      action: 'update',
      name: name,
      side: side,
      amount: amount,
      cakes: cakes,
      note: note
    };

    await fetch(API_URL, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'text/plain' },
      body: JSON.stringify(payload)
    });

    // 背景靜態再同步一次資料
    setTimeout(() => {
      loadGuestData(false);
    }, 1500);

  } catch (error) {
    console.error('Save sync error:', error);
    // 即使背景同步失敗，本地已儲存，提示一次
  } finally {
    saveBtn.disabled = false;
    saveBtn.textContent = originalText;
  }
}

// ==================== Toast ====================
function showToast(message, type = 'success') {
  const existingToasts = document.querySelectorAll('.toast');
  existingToasts.forEach(t => t.remove());

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  const icon = type === 'success' ? '✅' : '⚠️';
  toast.innerHTML = `
    <span>${icon}</span>
    <span>${message}</span>
  `;

  document.body.appendChild(toast);

  setTimeout(() => {
    toast.style.animation = 'slideIn 0.3s reverse';
    setTimeout(() => toast.remove(), 300);
  }, 2600);
}

// ==================== Event Listeners ====================
function attachEventListeners() {
  document.getElementById('search-input').addEventListener('input', handleSearch);
  const clearBtn = document.getElementById('clear-search');
  if (clearBtn) clearBtn.addEventListener('click', clearSearch);

  document.getElementById('toggle-amounts').addEventListener('click', toggleAmounts);
  document.getElementById('cancel-btn').addEventListener('click', closeEditView);
  document.getElementById('btn-back').addEventListener('click', closeEditView);
  document.getElementById('edit-form').addEventListener('submit', handleSave);
  document.getElementById('btn-add').addEventListener('click', openAddView);

  // Quick preset amount buttons
  document.querySelector('.quick-amounts')?.addEventListener('click', handleQuickAmount);

  // Quick cake buttons
  document.querySelector('.quick-cake-actions')?.addEventListener('click', handleQuickCake);

  // Toggle stats dashboard
  document.getElementById('toggle-stats-btn')?.addEventListener('click', toggleStatsDashboard);

  // Filter tabs
  document.querySelectorAll('.filter-btn[data-filter]').forEach(btn => {
    btn.addEventListener('click', () => setFilter(btn.dataset.filter));
  });
}

// ==================== Utility ====================
function escapeHtml(text) {
  if (!text) return '';
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

/**
 * 格式化時間為「YYYY/M/D 上午/下午 h:mm:ss」
 * 例如：2026/8/25 上午 9:18:53
 */
function formatTaiwanDateTime(timeValue) {
  if (!timeValue) return '';
  try {
    // 若已經是這種格式字串直接返回
    if (typeof timeValue === 'string' && (timeValue.includes('上午') || timeValue.includes('下午'))) {
      return timeValue;
    }
    const d = new Date(timeValue);
    if (isNaN(d.getTime())) return String(timeValue);

    const year = d.getFullYear();
    const month = d.getMonth() + 1;
    const day = d.getDate();
    const hours = d.getHours();
    const minutes = String(d.getMinutes()).padStart(2, '0');
    const seconds = String(d.getSeconds()).padStart(2, '0');

    const ampm = hours < 12 ? '上午' : '下午';
    let hour12 = hours % 12;
    if (hour12 === 0) hour12 = 12;

    return `${year}/${month}/${day} ${ampm} ${hour12}:${minutes}:${seconds}`;
  } catch (e) {
    return String(timeValue);
  }
}

// ==================== Start ====================
init();

