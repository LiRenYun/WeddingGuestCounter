// ================= 1. 多國語系字典 (i18n) =================
const translations = {
    "zh": {
        "title": "💍 我們的婚禮 💍",
        "subtitle": "2026.11.29 歡迎來到新手村",
        "btn_rsvp": "📝 報名參加",
        "btn_info": "🗺️ 婚宴資訊",
        "btn_wishes": "💌 想對新人說的話",
        "title_rsvp": "📝 報名參加",
        "title_info": "🗺️ 婚宴資訊",
        "title_wishes": "💌 留言祝福",
        "btn_back": "返回主選單",
        "btn_submit": "確認送出",
        "side_groom": "男方",
        "side_bride": "女方",
        "info_date_label": "📅 日期:",
        "info_date": "2026/11/29 (日)",
        "info_time_label": "⏰ 時間:",
        "info_time": "11:00 AM 進場",
        "info_venue_label": "📍 地點:",
        "info_venue": "玄饌海鮮宴會館",
        "info_map_link": "📍 開啟 Google Maps",
        "info_transport": "🚗 交通方式",
        "info_hsr": "🚄 高鐵：台南站下車，轉計程車約20-30分",
        "info_tra": "🚆 台鐵：台南火車站，轉計程車約15分",
        "info_parking": "🅿️ 停車場配置圖"
    },
    "ja": {
        "title": "💍 私たちの結婚式 💍",
        "subtitle": "2026.11.29 始まりの村へようこそ",
        "btn_rsvp": "📝 出席の返信",
        "btn_info": "🗺️ 結婚式の案内",
        "btn_wishes": "💌 お祝いのメッセージ",
        "title_rsvp": "📝 出席の返信",
        "title_info": "🗺️ 結婚式の案内",
        "title_wishes": "💌 メッセージ",
        "btn_back": "戻る",
        "btn_submit": "送信する",
        "side_groom": "新郎側",
        "side_bride": "新婦側",
        "info_date_label": "📅 日付:",
        "info_date": "2026年11月29日 (日曜日)",
        "info_time_label": "⏰ 時間:",
        "info_time": "午前11時 入場",
        "info_venue_label": "📍 会場:",
        "info_venue": "玄饌海鮮宴會館",
        "info_map_link": "📍 Google Mapsを開く",
        "info_transport": "🚗 アクセス",
        "info_hsr": "🚄 高鉄：台南駅下車、タクシーで約20-30分",
        "info_tra": "🚆 台鉄：台南駅下車、タクシーで約15分",
        "info_parking": "🅿️ 駐車場マップ"
    }
};

// ================= 2. 語系切換邏輯 =================
let currentLang = 'zh'; // 預設語言為繁體中文

const langBtn = document.getElementById('btn-lang');
langBtn.addEventListener('click', () => {
    // 切換語言
    currentLang = currentLang === 'zh' ? 'ja' : 'zh';
    
    // 更新畫面上所有帶有 data-i18n 的元素
    document.querySelectorAll('[data-i18n]').forEach(element => {
        const key = element.getAttribute('data-i18n');
        if (translations[currentLang][key]) {
            element.innerText = translations[currentLang][key];
        }
    });
});

// ================= 3. 頁面切換邏輯 (返回與進入) =================
// 抓取所有帶有 nav-btn class 的按鈕
const navButtons = document.querySelectorAll('.nav-btn');

navButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        // 取得按鈕指定的目標區塊 ID (例如: sec-info)
        const targetId = btn.getAttribute('data-target');
        
        // 隱藏所有 section
        document.querySelectorAll('.view-section').forEach(section => {
            section.classList.add('hidden');
        });
        
        // 顯示目標 section
        document.getElementById(targetId).classList.remove('hidden');
    });
});
// ================= 4. 圖片放大 (Lightbox) 邏輯 =================
const mapImg = document.getElementById('parking-map-img');
const imageModal = document.getElementById('image-modal');
const enlargedImg = document.getElementById('enlarged-img');
const closeModal = document.getElementById('close-modal');

if (mapImg && imageModal) {
    // 1. 點擊小圖，開啟 Modal
    mapImg.addEventListener('click', () => {
        enlargedImg.src = mapImg.src; // 把小圖的網址丟給大圖
        imageModal.classList.remove('hidden');
    });

    // 2. 點擊 [X] 按鈕，關閉 Modal
    closeModal.addEventListener('click', () => {
        imageModal.classList.add('hidden');
    });

    // 3. 點擊「黑色背景的任何地方」，也能關閉 Modal (使用者體驗更好)
    imageModal.addEventListener('click', (e) => {
        if (e.target === imageModal) {
            imageModal.classList.add('hidden');
        }
    });
}