// ==================== Configuration ====================
const API_URL = 'https://script.google.com/macros/s/AKfycbyIeXjikd-dbJJ90ov4RT2FtHTCq2LQnmcp_mlH6JadJxW09_vJshb3f1893xwF8Dd1TA/exec';

// ==================== State ====================
let guestData = [];      // 禮金紀錄
let rsvpData = [];       // 報名清單
let seatingData = [];    // 桌次分配（每個座位一列）
let currentRenderedList = [];
let currentGuest = null;
let viewMode = 'edit';   // 'edit' | 'add'
let filterMode = localStorage.getItem('gift_filter_mode') || 'all';   // 'all' | 'groom' | 'bride'
let sortMode = localStorage.getItem('gift_sort_mode_v2') || 'name';
let searchKeyword = '';
const busy = new Set();  // 寫入中的賓客 key，避免重複送出
let lastStamped = null;  // 剛報到的賓客 key，用於印章動畫

// ==================== Init ====================
// ==================== Theme (icon toggle) ====================
const ICON_MOON = '<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg>';
const ICON_SUN = '<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>';

function currentTheme() {
  return document.documentElement.dataset.theme
    || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
}

function applyTheme(theme) {
  document.documentElement.dataset.theme = theme;
  const btn = document.getElementById('btn-theme');
  const toDark = theme !== 'dark';
  btn.innerHTML = toDark ? ICON_MOON : ICON_SUN;
  btn.setAttribute('aria-label', toDark ? '切換為深色模式' : '切換為淺色模式');
}

function initTheme() {
  try {
    const saved = localStorage.getItem('gift_theme');
    if (saved) document.documentElement.dataset.theme = saved;
  } catch (e) { /* 無法存取 localStorage 時使用系統設定 */ }
  applyTheme(currentTheme());
  document.getElementById('btn-theme').addEventListener('click', () => {
    const next = currentTheme() === 'dark' ? 'light' : 'dark';
    try { localStorage.setItem('gift_theme', next); } catch (e) { /* 忽略 */ }
    applyTheme(next);
  });
}

function init() {
  initTheme();
  document.body.classList.add('amounts-hidden');
  document.getElementById('toggle-amounts').setAttribute('aria-pressed', 'false');
  document.querySelectorAll('.seg').forEach(btn => {
    const on = btn.dataset.filter === filterMode;
    btn.setAttribute('aria-selected', String(on));
  });
  document.getElementById('sort-select').value = sortMode;
  if (window.matchMedia('(max-width: 639px)').matches) {
    document.getElementById('stats').open = false;
  }
  attachEventListeners();
  loadGuestData();
  // 多台裝置同步：每 20 秒在前景且無寫入中時重新讀取
  setInterval(() => {
    const editing = !document.getElementById('edit-view').classList.contains('hidden');
    if (!document.hidden && busy.size === 0 && !editing) loadGuestData();
  }, 20000);
}

// ==================== Data ====================
async function fetchGift() {
  // 桌次另外用 ?action=seating 取得：目前線上部署的 gift 回應還沒包含桌次
  const [giftRes, seatRes] = await Promise.all([
    fetch(API_URL + '?action=gift'),
    fetch(API_URL + '?action=seating').catch(() => null)
  ]);
  const json = await giftRes.json();
  if (json.status !== 'success' || !json.data || !Array.isArray(json.data.gift)) {
    throw new Error('Invalid response format');
  }
  let seating = Array.isArray(json.data.seating) ? json.data.seating : [];
  if (seatRes) {
    try {
      const s = await seatRes.json();
      if (s.status === 'success' && Array.isArray(s.data.seating)) seating = s.data.seating;
    } catch (e) {
      console.warn('Seating load warning:', e);
    }
  }
  return { ...json.data, seating };
}

async function loadGuestData() {
  setSync('saving', '讀取中…');
  try {
    const data = await fetchGift();
    guestData = data.gift;
    rsvpData = Array.isArray(data.rsvp) ? data.rsvp : [];
    seatingData = Array.isArray(data.seating) ? data.seating : [];
    setSync('ok', `已同步 ${new Date().toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit' })}`);
  } catch (error) {
    console.error('Load error:', error);
    setSync('error', '讀取失敗，請重新讀取');
  }
  renderAll();
}

// 寫入 GAS：回應必須是 success 才算寫入成功
async function postWrite(payload) {
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify(payload)
  });
  const json = await res.json();
  if (json.result !== 'success' && json.status !== 'success') {
    throw new Error(json.error || 'write failed');
  }
  return json;
}

const rowKey = g => `${String(g['姓名'] || '').trim()}|${String(g['陣營'] || '').trim()}`;
const findGuest = key => guestData.find(g => rowKey(g) === key) || null;

// ==================== Guest helpers ====================
const isCheckedIn = g => String(g['已報到'] ?? '').trim() === '是';
const checkinNo = g => Number(g['報到序號']) || 0;
const sideKey = g => {
  const s = String(g['陣營'] || '');
  return s.includes('男方') ? 'groom' : (s.includes('女方') ? 'bride' : '');
};
const isNoGift = g => {
  const raw = String(g['不收取禮金'] ?? '').trim().toLowerCase();
  return ['是', 'true', '1', 'yes', 'y', 'v', '✓'].includes(raw);
};

// 本機先算出暫時序號（同陣營最小未用數字），GAS 回應後以伺服器序號為準
function provisionalCheckinNo(guest) {
  const side = sideKey(guest);
  const used = new Set(guestData.filter(g => isCheckedIn(g) && sideKey(g) === side).map(checkinNo));
  let n = 1;
  while (used.has(n)) n++;
  return n;
}

// 依姓名與陣營找出最後一筆報名資料
function findLatestRsvp(guest) {
  const name = String(guest['姓名'] || '').trim();
  const side = String(guest['陣營'] || '').trim();
  if (!name || rsvpData.length === 0) return null;

  let matched = rsvpData.filter(r => String(r['姓名'] || '').trim() === name && String(r['陣營'] || '').trim() === side);
  if (matched.length === 0 && side) {
    const isGroom = side.includes('男方');
    const isBride = side.includes('女方');
    matched = rsvpData.filter(r => {
      if (String(r['姓名'] || '').trim() !== name) return false;
      const rSide = String(r['陣營'] || '');
      return (isGroom && rSide.includes('男方')) || (isBride && rSide.includes('女方'));
    });
  }
  if (matched.length === 0) {
    matched = rsvpData.filter(r => String(r['姓名'] || '').trim() === name);
  }
  return matched.length > 0 ? matched[matched.length - 1] : null;
}

// 報到人數：報名的「參與人數」，無報名資料視為 1 人
function getGuestPax(guest) {
  return Math.max(1, Number(findLatestRsvp(guest)?.['參與人數']) || 1);
}

function getGuestDiet(guest) {
  const rsvp = findLatestRsvp(guest);
  const raw = String(rsvp ? (rsvp['葷素選擇'] ?? rsvp['葷素'] ?? rsvp['飲食'] ?? '') : (guest['葷素選擇'] ?? guest['葷素'] ?? guest['飲食'] ?? '')).trim();
  return { isVeg: hasVegetarian(raw), label: hasVegetarian(raw) ? '素食' : '葷食' };
}

function hasVegetarian(raw) {
  if (!raw) return false;
  const counts = [...raw.matchAll(/素食?\s*[:：]?\s*(\d+)/g)];
  if (counts.length > 0) return counts.some(m => parseInt(m[1], 10) > 0);
  return raw.includes('素') || raw.toLowerCase().includes('veg');
}

// 座位：桌次分配以姓名比對，取第一個座位
function getSeat(guest) {
  const name = String(guest['姓名'] || '').trim();
  const row = seatingData.find(s => String(s['姓名'] || '').trim() === name && String(s['桌號'] ?? '').trim() !== '');
  if (!row) return null;
  const table = String(row['桌號']).trim();
  const seat = String(row['座位編號'] ?? '').trim();
  return { table, seat, seatNum: Number(seat) || 0 };
}

function seatLabel(seat) {
  if (!seat) return '未分配';
  return /桌$/.test(seat.table) ? seat.table : `${seat.table} 桌`;
}

// ==================== Filter / sort ====================
function getFilteredAndSearchedData() {
  let list = guestData;
  if (filterMode !== 'all') list = list.filter(g => sideKey(g) === filterMode);
  if (searchKeyword) {
    const kw = searchKeyword.toLowerCase();
    list = list.filter(g => [
      g['姓名'], g['陣營'], g['備註/合包明細'], getGuestDiet(g).label, isNoGift(g) ? '不收取禮金' : ''
    ].some(v => String(v || '').toLowerCase().includes(kw)));
  }
  return sortGuests(list);
}

function sortGuests(list) {
  const byName = (a, b) => String(a['姓名'] || '').localeCompare(String(b['姓名'] || ''), 'zh-Hant');
  const bySide = (a, b) => String(a['陣營'] || '').localeCompare(String(b['陣營'] || ''), 'zh-Hant');
  const seatOf = g => getSeat(g);
  const comparators = {
    'name': byName,
    // 報到順序由小到大；未報到的排在後面
    // 先男方、再女方，各自由小到大；未報到的排最後
    'checkin-seq': (a, b) => {
      const rank = g => !isCheckedIn(g) ? 9 : (sideKey(g) === 'groom' ? 0 : (sideKey(g) === 'bride' ? 1 : 2));
      const ka = rank(a), kb = rank(b);
      if (ka !== kb) return ka - kb;
      return ka === 9 ? byName(a, b) : (checkinNo(a) - checkinNo(b)) || byName(a, b);
    },
    'seat': (a, b) => {
      const sa = seatOf(a), sb = seatOf(b);
      if (!sa || !sb) return (sa ? 0 : 1) - (sb ? 0 : 1) || byName(a, b);
      return sa.table.localeCompare(sb.table, 'zh-Hant', { numeric: true }) || (sa.seatNum - sb.seatNum) || byName(a, b);
    },
    'amount-desc': (a, b) => (Number(b['金額']) || 0) - (Number(a['金額']) || 0) || byName(a, b),
    'side': (a, b) => bySide(a, b) || byName(a, b)
  };
  const cmp = comparators[sortMode];
  return cmp ? [...list].sort(cmp) : list;
}

// ==================== Render ====================
function renderAll() {
  renderStats();
  renderList();
}

function renderStats() {
  let totalAmount = 0, totalCakes = 0, totalPeople = 0, checkedPeople = 0;
  let groomTotal = 0, groomPaid = 0, brideTotal = 0, bridePaid = 0;
  guestData.forEach(g => {
    const pax = getGuestPax(g);
    const checked = isCheckedIn(g);
    totalAmount += Number(g['金額']) || 0;
    totalCakes += Number(g['喜餅數量']) || 0;
    totalPeople += pax;
    if (checked) checkedPeople += pax;
    const side = sideKey(g);
    if (side === 'groom') { groomTotal += pax; if (checked) groomPaid += pax; }
    if (side === 'bride') { brideTotal += pax; if (checked) bridePaid += pax; }
  });
  document.getElementById('stat-total-guests').textContent = `${checkedPeople} / ${totalPeople}`;
  document.getElementById('stat-groom-count').textContent = `${groomPaid} / ${groomTotal}`;
  document.getElementById('stat-bride-count').textContent = `${bridePaid} / ${brideTotal}`;
  document.getElementById('stat-total-cakes').innerHTML = `${totalCakes}<small>盒</small>`;
  document.getElementById('stat-total-amount').textContent = '$' + totalAmount.toLocaleString();
}

function renderList() {
  const listEl = document.getElementById('guest-list');
  currentRenderedList = getFilteredAndSearchedData();

  if (guestData.length === 0) {
    listEl.innerHTML = '<li class="empty">尚無賓客資料。按「新增賓客」或由報名資料建立。</li>';
    return;
  }
  if (currentRenderedList.length === 0) {
    listEl.innerHTML = '<li class="empty">沒有符合條件的賓客</li>';
    return;
  }

  listEl.innerHTML = currentRenderedList.map((g, i) => {
    const key = rowKey(g);
    const checked = isCheckedIn(g);
    const pending = busy.has(key);
    const no = checkinNo(g);
    const side = sideKey(g);
    const name = String(g['姓名'] || '').trim();
    const sideText = String(g['陣營'] || '').trim() || '親友';
    const diet = getGuestDiet(g);
    const seat = getSeat(g);
    const cakes = Number(g['喜餅數量']) || 0;
    const note = String(g['備註/合包明細'] || '').trim();
    const amount = Number(g['金額']) || 0;
    const checkinAt = String(g['報到時間'] || '').trim();
    const stamp = checked && key === lastStamped ? ' is-new' : '';

    const seal = pending
      ? `<button class="seal${checked ? ' is-in' : ''}" type="button" disabled aria-busy="true" aria-label="寫入中：${escapeHtml(name)}">${checked ? `<span class="seal-no">${no || '…'}</span>` : '…'}</button>`
      : checked
        ? `<button class="seal is-in${stamp}" type="button" data-action="checkin" data-index="${i}" aria-pressed="true" aria-label="取消報到：${escapeHtml(name)}，報到序號 ${no}"><span class="seal-no">${no || '…'}</span><span class="seal-no-label">已報到</span></button>`
        : `<button class="seal" type="button" data-action="checkin" data-index="${i}" aria-pressed="false" aria-label="報到：${escapeHtml(name)}"><span>報到</span></button>`;

    return `
      <li class="row" data-side="${side}">
        ${seal}
        <button class="row-main" type="button" data-action="open" data-index="${i}">
          <span class="name-line">
            <span class="name">${escapeHtml(name)}</span>
            <span class="side-tag ${side}">${escapeHtml(sideText)}</span>
            <span class="badge ${diet.isVeg ? 'veg' : 'meat'}">${diet.label}</span>
            ${isNoGift(g) ? '<span class="badge nogift">不收取禮金</span>' : ''}
          </span>
          <span class="meta">
            <span class="chip seat${seat ? '' : ' unassigned'}">${escapeHtml(seatLabel(seat))}</span>
            ${cakes > 0 ? `<span class="chip cake">喜餅 ${cakes} 盒</span>` : ''}
            ${note ? `<span class="note">${escapeHtml(note)}</span>` : ''}
          </span>
        </button>
        <div class="row-side">
          <span class="row-amount money${amount > 0 ? ' has' : ''}">$${amount.toLocaleString()}</span>
          ${checkinAt ? `<div class="row-time">${escapeHtml(formatTaiwanDateTime(checkinAt))}</div>` : ''}
        </div>
      </li>`;
  }).join('');

  lastStamped = null;
}

function setSync(state, text) {
  const el = document.getElementById('sync-status');
  el.dataset.state = state;
  document.getElementById('sync-text').textContent = text;
}

// ==================== Check-in ====================
async function toggleCheckin(guest) {
  const key = rowKey(guest);
  if (busy.has(key)) return;
  const want = !isCheckedIn(guest);
  busy.add(key);
  // 先更新畫面（不等 GAS），失敗時再還原
  const idx = guestData.findIndex(g => rowKey(g) === key);
  const prev = idx !== -1 ? guestData[idx] : null;
  if (idx !== -1) {
    guestData[idx] = { ...prev, '已報到': want ? '是' : '', '報到時間': want ? formatTaiwanDateTime(new Date()) : '', '報到序號': want ? provisionalCheckinNo(prev) : '' };
  }
  renderAll();
  setSync('saving', want ? '報到寫入中…' : '取消報到寫入中…');

  try {
    const res = await postWrite({ formType: 'gift', action: 'checkin', name: guest['姓名'], side: guest['陣營'], checkedIn: want });
    busy.delete(key);
    if (want && idx !== -1 && res.checkinNo !== undefined) guestData[idx] = { ...guestData[idx], '報到序號': res.checkinNo };
    // 寫入成功即顯示提示；核對在背景進行，不阻擋畫面
    lastStamped = want ? key : null;
    renderAll();
    if (sandboxed(res)) {
      showToast('沙盒模式：寫入已攔截，線上資料未變更', 'error');
    } else {
      showToast(want ? `已報到，序號 ${res.checkinNo}` : '已取消報到');
    }
    verifyCheckin(key, want, res);
  } catch (error) {
    console.error('Checkin error:', error);
    if (idx !== -1) guestData[idx] = prev;   // 還原
    setSync('error', '寫入失敗，資料未變更');
    showToast('寫入失敗，資料未變更，請確認網路後重試', 'error');
  } finally {
    busy.delete(key);
    renderAll();
    if (currentGuest && rowKey(currentGuest) === key) refreshEditView(key);
  }
}

// 背景核對：重新讀取資料庫，確認報到狀態與序號與寫入結果一致
let verifySeq = 0;
async function verifyCheckin(key, want, res) {
  if (sandboxed(res)) return;   // 沙盒不會真的寫入，略過核對
  const seq = ++verifySeq;
  try {
    const data = await fetchGift();
    if (seq !== verifySeq) return;   // 較新的核對已開始，丟棄較舊的回應
    guestData = data.gift;
    rsvpData = Array.isArray(data.rsvp) ? data.rsvp : rsvpData;
    seatingData = Array.isArray(data.seating) ? data.seating : seatingData;
    setSync('ok', `已同步 ${new Date().toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit' })}`);
    const row = findGuest(key);
    const verified = row && isCheckedIn(row) === want && (!want || checkinNo(row) === Number(res.checkinNo));
    if (!verified) showToast('寫入後核對不一致，已重新讀取，請再確認一次', 'error');
    renderAll();
  } catch (error) {
    console.error('Verify error:', error);
    setSync('error', '核對失敗，請重新讀取');
  }
}

const sandboxed = res => Boolean(res && res.sandbox);

// ==================== Edit / add view ====================
function openEditView(guest) {
  viewMode = 'edit';
  currentGuest = guest;
  document.getElementById('view-title').textContent = '編輯禮金';
  document.getElementById('edit-name').value = guest['姓名'] || '';
  document.getElementById('edit-name').readOnly = true;
  document.getElementById('edit-side').value = guest['陣營'] || '';
  document.getElementById('edit-side').classList.remove('hidden');
  document.getElementById('edit-side-select').classList.add('hidden');
  document.getElementById('edit-nogift').checked = isNoGift(guest);
  document.getElementById('edit-amount').value = Number(guest['金額']) || 0;
  document.getElementById('edit-cakes').value = Number(guest['喜餅數量']) || 0;
  document.getElementById('edit-note').value = guest['備註/合包明細'] || '';
  const upd = document.getElementById('view-update-time');
  const updated = String(guest['更新時間'] || '').trim();
  upd.textContent = updated ? `最後更新：${formatTaiwanDateTime(updated)}` : '';
  upd.classList.toggle('hidden', !updated);
  document.getElementById('btn-checkin').classList.remove('hidden');
  refreshEditView(rowKey(guest));
  showEditView();
}

function openAddView() {
  viewMode = 'add';
  currentGuest = null;
  document.getElementById('view-title').textContent = '新增賓客';
  document.getElementById('edit-name').value = '';
  document.getElementById('edit-name').readOnly = false;
  document.getElementById('edit-side').classList.add('hidden');
  document.getElementById('edit-side-select').classList.remove('hidden');
  document.getElementById('edit-side-select').value = filterMode === 'groom' ? '男方親友' : (filterMode === 'bride' ? '女方親友' : '');
  document.getElementById('edit-nogift').checked = false;
  document.getElementById('edit-amount').value = 0;
  document.getElementById('edit-cakes').value = 0;
  document.getElementById('edit-note').value = '';
  document.getElementById('view-update-time').classList.add('hidden');
  document.getElementById('btn-checkin').classList.add('hidden');
  showEditView();
  document.getElementById('edit-name').focus();
}

function refreshEditView(key) {
  const latest = findGuest(key);
  if (latest) currentGuest = latest;
  const btn = document.getElementById('btn-checkin');
  const checked = Boolean(currentGuest) && isCheckedIn(currentGuest);
  btn.textContent = busy.has(key) ? '寫入中…' : (checked ? `取消報到（序號 ${checkinNo(currentGuest)}）` : '確認報到');
  btn.disabled = busy.has(key);
}

function showEditView() {
  document.getElementById('list-view').classList.add('hidden');
  document.getElementById('edit-view').classList.remove('hidden');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function closeEditView() {
  currentGuest = null;
  document.getElementById('edit-view').classList.add('hidden');
  document.getElementById('list-view').classList.remove('hidden');
  renderList();
}

async function handleSave(e) {
  e.preventDefault();
  const name = document.getElementById('edit-name').value.trim();
  const side = viewMode === 'edit'
    ? document.getElementById('edit-side').value.trim()
    : document.getElementById('edit-side-select').value.trim();
  const amountStr = document.getElementById('edit-amount').value;
  const cakes = Number(document.getElementById('edit-cakes').value) || 0;
  const note = document.getElementById('edit-note').value.trim();
  const noGift = document.getElementById('edit-nogift').checked;

  if (!name) return showToast('請輸入姓名', 'error');
  if (!side) return showToast('請選擇陣營', 'error');
  if (amountStr === '' || isNaN(amountStr) || Number(amountStr) < 0) return showToast('請輸入有效金額', 'error');
  const amount = Number(amountStr);

  // 先更新畫面並返回名單，寫入與核對在背景進行
  const key = `${name}|${side}`;
  const idx = guestData.findIndex(g => rowKey(g) === key);
  const prev = idx !== -1 ? guestData[idx] : null;
  const next = {
    ...(prev || { '姓名': name, '陣營': side }),
    '金額': amount, '喜餅數量': cakes, '備註/合包明細': note,
    '不收取禮金': noGift ? '是' : '', '更新時間': formatTaiwanDateTime(new Date())
  };
  if (idx !== -1) guestData[idx] = next; else guestData.unshift(next);
  closeEditView();
  setSync('saving', '儲存寫入中…');
  try {
    await postWrite({ formType: 'gift', action: 'update', name, side, amount, cakes, note, noGift });
    const data = await fetchGift();
    guestData = data.gift;
    rsvpData = Array.isArray(data.rsvp) ? data.rsvp : rsvpData;
    seatingData = Array.isArray(data.seating) ? data.seating : seatingData;
    setSync('ok', `已同步 ${new Date().toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit' })}`);
    const row = findGuest(`${name}|${side}`);
    const verified = row && Number(row['金額']) === amount && (Number(row['喜餅數量']) || 0) === cakes;
    if (verified) {
      showToast('儲存成功');
    } else {
      showToast('儲存後核對不一致，請確認後再儲存', 'error');
    }
  } catch (error) {
    console.error('Save error:', error);
    // 寫入失敗：還原本地資料
    if (idx !== -1) guestData[idx] = prev; else guestData = guestData.filter(g => rowKey(g) !== key);
    setSync('error', '儲存失敗，資料未變更');
    showToast('儲存失敗，資料未變更，請重試', 'error');
  } finally {
    renderAll();
  }
}

// ==================== Toast ====================
let toastTimer = null;
function showToast(message, type = 'ok') {
  const el = document.getElementById('toast');
  el.textContent = message;
  el.classList.toggle('is-error', type === 'error');
  el.classList.remove('hidden');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.add('hidden'), type === 'error' ? 4200 : 2600);
}

// ==================== Events ====================
function attachEventListeners() {
  document.getElementById('guest-list').addEventListener('click', (e) => {
    const btn = e.target.closest('[data-action]');
    if (!btn) return;
    const guest = currentRenderedList[Number(btn.dataset.index)];
    if (!guest) return;
    if (btn.dataset.action === 'checkin') toggleCheckin(guest);
    if (btn.dataset.action === 'open') openEditView(guest);
  });

  document.getElementById('btn-checkin').addEventListener('click', () => {
    if (currentGuest) toggleCheckin(currentGuest);
  });

  document.querySelectorAll('.seg').forEach(btn => {
    btn.addEventListener('click', () => {
      filterMode = btn.dataset.filter;
      localStorage.setItem('gift_filter_mode', filterMode);
      document.querySelectorAll('.seg').forEach(b => b.setAttribute('aria-selected', String(b === btn)));
      renderList();
    });
  });

  document.getElementById('search-input').addEventListener('input', (e) => {
    searchKeyword = e.target.value.trim();
    renderList();
  });

  document.getElementById('sort-select').addEventListener('change', (e) => {
    sortMode = e.target.value;
    localStorage.setItem('gift_sort_mode_v2', sortMode);
    renderList();
  });

  document.getElementById('toggle-amounts').addEventListener('click', (e) => {
    const hidden = document.body.classList.toggle('amounts-hidden');
    e.currentTarget.setAttribute('aria-pressed', String(!hidden));
  });

  document.getElementById('btn-resync').addEventListener('click', loadGuestData);
  document.getElementById('btn-add').addEventListener('click', openAddView);
  document.getElementById('btn-back').addEventListener('click', closeEditView);
  document.getElementById('cancel-btn').addEventListener('click', closeEditView);
  document.getElementById('edit-form').addEventListener('submit', handleSave);

  document.getElementById('amount-presets').addEventListener('click', (e) => {
    const btn = e.target.closest('.preset');
    if (!btn) return;
    const input = document.getElementById('edit-amount');
    if (btn.dataset.add !== undefined) input.value = Math.max(0, (Number(input.value) || 0) + Number(btn.dataset.add));
    if (btn.dataset.set !== undefined) input.value = Number(btn.dataset.set);
  });
  document.getElementById('cake-add').addEventListener('click', () => {
    const input = document.getElementById('edit-cakes');
    input.value = (Number(input.value) || 0) + 1;
  });
  document.getElementById('cake-zero').addEventListener('click', () => {
    document.getElementById('edit-cakes').value = 0;
  });

  // 切回頁面時重新讀取，避免其他裝置的修改沒有反映
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden && busy.size === 0 && document.getElementById('edit-view').classList.contains('hidden')) {
      loadGuestData();
    }
  });
}

// ==================== Utility ====================
function escapeHtml(text) {
  return String(text ?? '')
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

// 格式化為「YYYY/M/D 上午/下午 h:mm:ss」
function formatTaiwanDateTime(timeValue) {
  if (!timeValue) return '';
  if (typeof timeValue === 'string' && (timeValue.includes('上午') || timeValue.includes('下午'))) return timeValue;
  const d = new Date(timeValue);
  if (isNaN(d.getTime())) return String(timeValue);
  const hours = d.getHours();
  const hour12 = hours % 12 || 12;
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const seconds = String(d.getSeconds()).padStart(2, '0');
  return `${d.getFullYear()}/${d.getMonth() + 1}/${d.getDate()} ${hours < 12 ? '上午' : '下午'} ${hour12}:${minutes}:${seconds}`;
}

// ==================== Start ====================
init();
