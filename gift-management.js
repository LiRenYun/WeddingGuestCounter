// ==================== Configuration ====================
const API_URL = 'https://script.google.com/macros/s/AKfycbwiLr_vDKvXLwAnsffXn3PyYSCsxr_d1fRUOtuSF0nZqjRmwLW2mFLb4HF7fv7nBysmAA/exec';

// ==================== Text Content ====================
const text = {
  loading: '載入中...',
  empty: '尚無賓客資料',
  error_load: '載入失敗，請重新整理頁面',
  edit_title: '編輯禮金',
  add_title: '新增賓客',
  success_save: '儲存成功！',
  error_save: '儲存失敗，請重試',
  error_amount: '請輸入有效金額',
  error_name: '請輸入姓名',
  error_side: '請選擇陣營',
  btn_saving: '儲存中...'
};

// ==================== State ====================
let guestData = [];
let currentGuest = null;
let filterMode = localStorage.getItem('gift_filter_mode') || 'all'; // 記住篩選狀態
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
  loadGuestData();
}

// ==================== Data Functions ====================
async function loadGuestData() {
  const listEl = document.getElementById('guest-list');

  try {
    const response = await fetch(API_URL + '?action=gift');
    const result = await response.json();

    if (result.status === 'success' && result.data && result.data.gift) {
      guestData = result.data.gift;
      renderGuestList(guestData);
    } else {
      throw new Error('Invalid response format');
    }
  } catch (error) {
    console.error('Load error:', error);
    listEl.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon"></div>
        <p>${text.error_load}</p>
      </div>
    `;
  }
}

function getFilteredData() {
  if (filterMode === 'groom') {
    return guestData.filter(g => (g['陣營'] || '').includes('男方'));
  } else if (filterMode === 'bride') {
    return guestData.filter(g => (g['陣營'] || '').includes('女方'));
  }
  return guestData;
}

function renderGuestList(data) {
  const listEl = document.getElementById('guest-list');

  if (!data || data.length === 0) {
    listEl.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon"></div>
        <p>${text.empty}</p>
      </div>
    `;
    return;
  }

  listEl.innerHTML = data.map(guest => {
    const amount = Number(guest['金額']) || 0;
    const isPaid = amount > 0;
    const paidClass = isPaid ? 'paid' : 'unpaid';
    const name = guest['姓名'] || '';
    const side = guest['陣營'] || '';
    const sideClass = side.includes('男方') ? 'side-groom' : 'side-bride';

    return `
      <div class="guest-item" data-name="${escapeHtml(name)}" data-side="${escapeHtml(side)}">
        <div class="guest-info">
          <div class="guest-name ${paidClass}">${escapeHtml(name)}</div>
          <span class="guest-side ${sideClass}">${escapeHtml(side)}</span>
        </div>
        <div class="guest-amount">$${amount.toLocaleString()}</div>
      </div>
    `;
  }).join('');

  attachGuestItemListeners();
}

function attachGuestItemListeners() {
  document.querySelectorAll('.guest-item').forEach(item => {
    item.addEventListener('click', () => {
      const name = item.dataset.name;
      const side = item.dataset.side;
      // 直接用本地資料，不重新 fetch
      const guest = guestData.find(g => g['姓名'] === name && g['陣營'] === side);
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
  renderGuestList(getFilteredData());
}

// ==================== Search ====================
function handleSearch(e) {
  const keyword = e.target.value.toLowerCase().trim();

  let filtered = getFilteredData();

  if (keyword) {
    filtered = filtered.filter(guest => {
      const name = (guest['姓名'] || '').toLowerCase();
      const side = (guest['陣營'] || '').toLowerCase();
      return name.includes(keyword) || side.includes(keyword);
    });
  }

  renderGuestList(filtered);
}

// ==================== Toggle Amounts ====================
function toggleAmounts() {
  const eyeIcon = document.getElementById('eye-icon');

  if (document.body.classList.contains('amounts-hidden')) {
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

  // 標題加上更新時間
  const titleEl = document.getElementById('view-title');
  const updateTime = guest['更新時間'] || '';
  if (updateTime) {
    const timeStr = formatUpdateTime(updateTime);
    titleEl.innerHTML = `${text.edit_title} <span style="font-size: 0.8rem; color: var(--text-muted); font-weight: 400; margin-left: 8px;">${timeStr}</span>`;
  } else {
    titleEl.textContent = text.edit_title;
  }

  document.getElementById('edit-name').value = guest['姓名'] || '';
  document.getElementById('edit-name').readOnly = true;
  document.getElementById('edit-name').classList.add('readonly');

  // 陣營用 select，新增時可以選
  document.getElementById('edit-side').value = guest['陣營'] || '';
  document.getElementById('edit-side').readOnly = true;
  document.getElementById('edit-side').classList.add('readonly');
  document.getElementById('edit-side-select').style.display = 'none';
  document.getElementById('edit-side').style.display = 'block';

  document.getElementById('edit-amount').value = Number(guest['金額']) || 0;
  document.getElementById('edit-cakes').value = Number(guest['喜餅數量']) || 0;
  document.getElementById('edit-note').value = guest['備註/合包明細'] || '';

  document.getElementById('list-view').classList.add('hidden');
  document.getElementById('edit-view').classList.remove('hidden');
}

function openAddView() {
  viewMode = 'add';
  currentGuest = null;

  document.getElementById('view-title').innerHTML = text.add_title; // 清除時間
  document.getElementById('edit-name').value = '';
  document.getElementById('edit-name').readOnly = false;
  document.getElementById('edit-name').classList.remove('readonly');

  // 陣營用 select
  document.getElementById('edit-side').style.display = 'none';
  document.getElementById('edit-side-select').style.display = 'block';
  document.getElementById('edit-side-select').value = '';

  document.getElementById('edit-amount').value = 0;
  document.getElementById('edit-cakes').value = 0;
  document.getElementById('edit-note').value = '';

  document.getElementById('list-view').classList.add('hidden');
  document.getElementById('edit-view').classList.remove('hidden');
}

function closeEditView() {
  currentGuest = null;
  document.getElementById('edit-view').classList.add('hidden');
  document.getElementById('list-view').classList.remove('hidden');
}

async function handleSave(e) {
  e.preventDefault();

  const name = document.getElementById('edit-name').value.trim();
  let side = '';

  if (viewMode === 'edit') {
    side = document.getElementById('edit-side').value;
  } else {
    side = document.getElementById('edit-side-select').value;
  }

  const amount = document.getElementById('edit-amount').value;
  const cakes = Number(document.getElementById('edit-cakes').value) || 0;
  const note = document.getElementById('edit-note').value;

  // 驗證
  if (viewMode === 'add' && !name) {
    showToast(text.error_name, 'error');
    return;
  }
  if (!side) {
    showToast(text.error_side, 'error');
    return;
  }
  if (!amount || isNaN(amount) || Number(amount) < 0) {
    showToast(text.error_amount, 'error');
    return;
  }

  const saveBtn = document.getElementById('save-btn');
  const originalText = saveBtn.textContent;
  saveBtn.disabled = true;
  saveBtn.textContent = text.btn_saving;

  try {
    const payload = {
      formType: 'gift',
      action: 'update',
      name: name,
      side: side,
      amount: Number(amount),
      cakes: cakes,
      note: note
    };

    await fetch(API_URL, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'text/plain' },
      body: JSON.stringify(payload)
    });

    // 重新載入資料
    await loadGuestData();

    showToast(text.success_save, 'success');
    closeEditView();

  } catch (error) {
    console.error('Save error:', error);
    showToast(text.error_save, 'error');
  } finally {
    saveBtn.disabled = false;
    saveBtn.textContent = originalText;
  }
}

// ==================== Toast ====================
function showToast(message, type = 'success') {
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;

  const icon = type === 'success' ? '' : '';
  toast.innerHTML = `
    <span class="toast-icon">${icon}</span>
    <span>${message}</span>
  `;

  document.body.appendChild(toast);

  setTimeout(() => {
    toast.style.animation = 'slideIn 0.4s reverse';
    setTimeout(() => toast.remove(), 400);
  }, 3000);
}

// ==================== Event Listeners ====================
function attachEventListeners() {
  document.getElementById('search-input').addEventListener('input', handleSearch);
  document.getElementById('toggle-amounts').addEventListener('click', toggleAmounts);
  document.getElementById('cancel-btn').addEventListener('click', closeEditView);
  document.getElementById('edit-form').addEventListener('submit', handleSave);
  document.getElementById('btn-add').addEventListener('click', openAddView);

  // Filter buttons
  document.querySelectorAll('.filter-btn[data-filter]').forEach(btn => {
    btn.addEventListener('click', () => setFilter(btn.dataset.filter));
  });
}

// ==================== Utility ====================
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function formatUpdateTime(timeValue) {
  if (!timeValue) return '';
  try {
    const date = new Date(timeValue);
    if (isNaN(date.getTime())) return '';
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}/${month}/${day} ${hours}:${minutes}`;
  } catch (e) {
    return '';
  }
}

// ==================== Start ====================
init();
