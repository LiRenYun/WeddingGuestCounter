/**
 * 💡 婚紗特集照片清單
 * 未來將照片放到專案資料夾後，將路徑填入下方陣列。
 * 例如: const weddingPhotos = ["img/p1.jpg", "img/p2.jpg"];
 */
const weddingPhotos = ["img/p1.jpg"]; 

// ================= 1. 多國語系字典 =================
const translations = {
    "zh": {
        "title": "💍 仁雲&銳芝💌我們的婚禮 💍",
        "subtitle": "2026.11.29 歡迎來到新手村",
        "btn_rsvp": "📝 報名參加",
        "btn_info": "🗺️ 婚宴資訊",
        "btn_wishes": "💌 想對新人說的話",
        "btn_photos": "📷 婚紗特集",
        "title_rsvp": "📝 報名參加",
        "title_info": "🗺️ 婚宴資訊",
        "title_wishes": "💌 留言祝福",
        "title_photos": "📷 婚紗特集",
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
        "info_parking": "🅿️ 停車場配置圖",
        "label_wish_name": "你是誰 (姓名/暱稱)",
        "placeholder_wish_name": "請輸入您的名字",
        "label_wish_message": "祝福的話語",
        "placeholder_wish_message": "在這裡寫下對仁雲&銳芝的祝福吧...",
        "btn_send_wish": "送出祝福",
        "photos_coming_soon": "🚧 功能開發中，敬請期待！"
    },
    "ja": {
        "title": "💍仁雲&銳芝💌私たちの結婚式💍",
        "subtitle": "2026.11.29 始まりの村へようこそ",
        "btn_rsvp": "📝 出席の返信",
        "btn_info": "🗺️ 結婚式の案内",
        "btn_wishes": "💌 お祝いのメッセージ",
        "btn_photos": "📷 フォトアルバム",
        "title_rsvp": "📝 出席の返信",
        "title_info": "🗺️ 結婚式の案内",
        "title_wishes": "💌 お祝いメッセージ",
        "title_photos": "📷 フォトアルバム",
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
        "info_parking": "🅿️ 駐車場マップ",
        "label_wish_name": "お名前（ニックネーム）",
        "placeholder_wish_name": "お名前を入力してください",
        "label_wish_message": "お祝いのメッセージ",
        "placeholder_wish_message": "ここに仁雲＆銳芝への祝福の言葉を書いてください...",
        "btn_send_wish": "お祝いを送る",
        "photos_coming_soon": "🚧 現在開発中、お楽しみに！"
    }
};

// ================= 2. 語系與頁面切換核心 =================
let currentLang = 'zh';

function updateLanguage() {
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (translations[currentLang][key]) el.innerText = translations[currentLang][key];
    });
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
        const key = el.getAttribute('data-i18n-placeholder');
        if (translations[currentLang][key]) el.setAttribute('placeholder', translations[currentLang][key]);
    });
}

const langBtn = document.getElementById('btn-lang');
if (langBtn) {
    langBtn.addEventListener('click', () => {
        currentLang = currentLang === 'zh' ? 'ja' : 'zh';
        updateLanguage();
    });
}

// 導覽切換點擊事件 (確保切換目標存在才執行，防止報錯)
document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const targetId = btn.getAttribute('data-target');
        const targetSection = document.getElementById(targetId);
        
        if (targetSection) {
            // 隱藏所有視窗
            document.querySelectorAll('.view-section').forEach(sec => sec.classList.add('hidden'));
            // 顯示目標視窗
            targetSection.classList.remove('hidden');
            
            // 如果進入的是婚紗特集頁面，觸發相簿檢查
            if (targetId === 'sec-photos') {
                initWeddingPhotos();
            }
        } else {
            console.warn(`找不到目標頁面: #${targetId}，請檢查 HTML 中是否有對應的 id。`);
        }
    });
});

// ================= 3. 婚紗相簿判斷邏輯 (高安全版) =================
function initWeddingPhotos() {
    const container = document.getElementById('photos-container');
    const emptyMsg = document.getElementById('photos-empty-msg');
    
    // 如果 HTML 裡找不到對應的容器，就安靜地退出不報錯
    if (!container || !emptyMsg) return;

    if (weddingPhotos.length === 0) {
        container.classList.add('hidden');
        emptyMsg.classList.remove('hidden');
    } else {
        emptyMsg.classList.add('hidden');
        container.classList.remove('hidden');
        container.innerHTML = '';
        weddingPhotos.forEach(src => {
            const img = document.createElement('img');
            img.src = src;
            img.className = 'photo-item';
            img.addEventListener('click', () => {
                const modal = document.getElementById('image-modal');
                const enlarged = document.getElementById('enlarged-img');
                if (modal && enlarged) {
                    enlarged.src = src;
                    modal.classList.remove('hidden');
                }
            });
            container.appendChild(img);
        });
    }
}

// ================= 4. 其它功能安全防護 (Lightbox、打字特效、拉炮) =================
// 圖片放大 Lightbox 邏輯
const mapImg = document.getElementById('parking-map-img');
const imageModal = document.getElementById('image-modal');
const enlargedImg = document.getElementById('enlarged-img');
const closeModal = document.getElementById('close-modal');

if (mapImg && imageModal && enlargedImg) {
    mapImg.addEventListener('click', () => {
        enlargedImg.src = mapImg.src;
        imageModal.classList.remove('hidden');
    });
}
if (closeModal && imageModal) {
    closeModal.addEventListener('click', () => imageModal.classList.add('hidden'));
}
if (imageModal) {
    imageModal.addEventListener('click', (e) => {
        if (e.target === imageModal) imageModal.classList.add('hidden');
    });
}

// 打字特效邏輯
const wishMessage = document.getElementById('wish-message');
if (wishMessage) {
    wishMessage.addEventListener('input', (e) => {
        if (e.inputType && !e.inputType.startsWith('insert')) return;
        const rect = wishMessage.getBoundingClientRect();
        for (let i = 0; i < 2; i++) {
            const p = document.createElement('div');
            p.className = 'typing-particle';
            p.innerText = Math.random() > 0.5 ? '💖' : '▪';
            p.style.left = `${rect.left + (Math.random() * rect.width)}px`;
            p.style.top = `${rect.top + (rect.height / 2)}px`;
            p.style.setProperty('--twx', `${(Math.random() - 0.5) * 60}px`);
            p.style.setProperty('--twy', `${(Math.random() - 1) * 40}px`);
            document.body.appendChild(p);
            p.addEventListener('animationend', () => p.remove());
        }
    });
}

// RSVP 表單人數邏輯
const paxInput = document.getElementById('rsvp-pax');
if (paxInput) {
    paxInput.addEventListener('input', () => {
        const pax = parseInt(paxInput.value) || 1;
        const s = document.getElementById('diet-single');
        const m = document.getElementById('diet-multiple');
        const meat = document.getElementById('diet-meat');
        const veg = document.getElementById('diet-veg');
        
        if (pax > 1) {
            if (s) s.classList.add('hidden'); 
            if (m) m.classList.remove('hidden');
            if (meat) meat.value = pax;
            if (veg) veg.value = 0;
        } else {
            if (s) s.classList.remove('hidden'); 
            if (m) m.classList.add('hidden');
        }
    });
}

// 通用送出邏輯
const API_URL = "https://script.google.com/macros/s/AKfycbzKsZ90yBKYSlTADzaVt6PLin9tevzgnTaskNF06jNWr6G63vX8k_GEu64gx275eTrumA/exec";

function handleFormSubmit(formId, formType, getPayload) {
    const form = document.getElementById(formId);
    if (!form) return;
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const btn = form.querySelector('button[type="submit"]');
        if (!btn) return;
        btn.disabled = true;
        const oldText = btn.innerText;
        btn.innerText = "⏳...";

        fetch(API_URL, {
            method: 'POST',
            mode: 'no-cors',
            body: JSON.stringify({ formType, ...getPayload() })
        }).then(() => {
            const successModal = document.getElementById('success-modal');
            if (successModal) successModal.classList.remove('hidden');
            form.reset();
        }).finally(() => {
            btn.disabled = false;
            btn.innerText = oldText;
        });
    });
}

// 註冊 RSVP
handleFormSubmit('form-rsvp', 'rsvp', () => {
    const pax = paxInput ? (parseInt(paxInput.value) || 1) : 1;
    let diet = "葷";
    const checkedDiet = document.querySelector('input[name="diet"]:checked');
    if (checkedDiet) diet = checkedDiet.value;
    
    const meat = document.getElementById('diet-meat');
    const veg = document.getElementById('diet-veg');
    if (pax > 1 && meat && veg) diet = `葷:${meat.value},素:${veg.value}`;
    
    return {
        name: document.getElementById('rsvp-name')?.value || "未填",
        side: document.querySelector('input[name="side"]:checked')?.value || "未填",
        pax, diet,
        childSeat: document.getElementById('rsvp-child')?.value || 0,
        message: document.getElementById('rsvp-message')?.value || ""
    };
});

// 註冊 祝福
handleFormSubmit('form-wish', 'wish', () => ({
    name: document.getElementById('wish-name')?.value || "匿名親友",
    message: document.getElementById('wish-message')?.value || ""
}));

// 成功視窗關閉
const btnSuccessOk = document.getElementById('btn-success-ok');
if (btnSuccessOk) {
    btnSuccessOk.addEventListener('click', () => {
        const successModal = document.getElementById('success-modal');
        if (successModal) successModal.classList.add('hidden');
        document.querySelectorAll('.view-section').forEach(sec => sec.classList.add('hidden'));
        const homeSec = document.getElementById('sec-home');
        if (homeSec) homeSec.classList.remove('hidden');
    });
}

// 初始化執行
document.addEventListener('DOMContentLoaded', () => {
    updateLanguage();
    initWeddingPhotos();
});