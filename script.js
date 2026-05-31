// ================= 1. 多國語系字典 (i18n) =================
const translations = {
    "zh": {
        "title": "💍 仁雲&銳芝💌我們的婚禮 💍",
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
        "info_parking": "🅿️ 停車場配置圖",
        
        // 新增：祝福留言區塊的中文
        "label_wish_name": "你是誰 (姓名/暱稱)",
        "placeholder_wish_name": "請輸入您的名字",
        "label_wish_message": "祝福的話語",
        "placeholder_wish_message": "在這裡寫下對仁雲&銳芝的祝福吧...",
        "btn_send_wish": "送出祝福"
    },
    "ja": {
        "title": "💍 仁雲&銳芝💌私たちの結婚式 💍",
        "subtitle": "2026.11.29 始まりの村へようこそ",
        "btn_rsvp": "📝 出席の返信",
        "btn_info": "🗺️ 結婚式の案内",
        "btn_wishes": "💌 お祝いのメッセージ",
        "title_rsvp": "📝 出席の返信",
        "title_info": "🗺️ 結婚式の案内",
        "title_wishes": "💌 お祝いメッセージ",
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
        
        // 新增：祝福留言區塊的日文
        "label_wish_name": "お名前（ニックネーム）",
        "placeholder_wish_name": "お名前を入力してください",
        "label_wish_message": "お祝いのメッセージ",
        "placeholder_wish_message": "ここに仁雲＆銳芝への祝福の言葉を書いてください...",
        "btn_send_wish": "お祝いを送る"
    }
};

// ================= 2. 語系切換邏輯 (已升級支援 Placeholder 屬性) =================
let currentLang = 'zh';

const langBtn = document.getElementById('btn-lang');
langBtn.addEventListener('click', () => {
    currentLang = currentLang === 'zh' ? 'ja' : 'zh';
    
    // A. 更新一般帶有文字的元素
    document.querySelectorAll('[data-i18n]').forEach(element => {
        const key = element.getAttribute('data-i18n');
        if (translations[currentLang][key]) {
            element.innerText = translations[currentLang][key];
        }
    });

    // B. 更新輸入框的提示字 (Placeholder)
    document.querySelectorAll('[data-i18n-placeholder]').forEach(element => {
        const key = element.getAttribute('data-i18n-placeholder');
        if (translations[currentLang][key]) {
            element.setAttribute('placeholder', translations[currentLang][key]);
        }
    });
});

// ================= 3. 頁面切換邏輯 (返回與進入) =================
const navButtons = document.querySelectorAll('.nav-btn');
navButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        const targetId = btn.getAttribute('data-target');
        document.querySelectorAll('.view-section').forEach(section => {
            section.classList.add('hidden');
        });
        document.getElementById(targetId).classList.remove('hidden');
    });
});

// ================= 4. 圖片放大 (Lightbox) 邏輯 =================
const mapImg = document.getElementById('parking-map-img');
const imageModal = document.getElementById('image-modal');
const enlargedImg = document.getElementById('enlarged-img');
const closeModal = document.getElementById('close-modal');

if (mapImg && imageModal) {
    mapImg.addEventListener('click', () => {
        enlargedImg.src = mapImg.src;
        imageModal.classList.remove('hidden');
    });
    closeModal.addEventListener('click', () => {
        imageModal.classList.add('hidden');
    });
    imageModal.addEventListener('click', (e) => {
        if (e.target === imageModal) {
            imageModal.classList.add('hidden');
        }
    });
}

// ================= 5. 自訂像素拉炮與花瓣點擊動畫邏輯 =================
document.addEventListener('click', function(e) {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

    const x = e.clientX;
    const y = e.clientY;

    let container = document.querySelector('.confetti-container');
    if (!container) {
        container = document.createElement('div');
        container.className = 'confetti-container';
        document.body.appendChild(container);
    }

    const particleCount = 18;
    const colorsConfetti = ['#ff9fb2', '#8ce1d5', '#bda4ff', '#fffd80', '#ffffff'];
    const colorsPetal = ['#ffdae0', '#dbffff', '#e6daff', '#ffffee', '#ffffff'];

    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        const particleType = Math.floor(Math.random() * 2);
        
        if (particleType === 0) {
            particle.className = 'pixel-confetti';
            particle.style.backgroundColor = colorsConfetti[Math.floor(Math.random() * colorsConfetti.length)];
        } else {
            particle.className = 'pixel-petal';
            particle.style.backgroundColor = colorsPetal[Math.floor(Math.random() * colorsPetal.length)];
        }
        
        const angle = Math.random() * Math.PI * 2;
        const radius = Math.random() * 120 + 60;
        const dx = Math.cos(angle) * radius;
        const dy = Math.sin(angle) * radius;
        const dr = (Math.random() - 0.5) * 360;

        particle.style.setProperty('--dx', `${dx}px`);
        particle.style.setProperty('--dy', `${dy}px`);
        particle.style.setProperty('--dr', `${dr}deg`);
        particle.style.left = `${x}px`;
        particle.style.top = `${y}px`;
        particle.style.animationDelay = `${Math.random() * 0.1}s`;

        container.appendChild(particle);
        particle.addEventListener('animationend', () => particle.remove());
    }
});

// ================= 6. 報名表單 分步與動態連動邏輯 =================
const rsvpStep1 = document.getElementById('rsvp-step-1');
const rsvpStep2 = document.getElementById('rsvp-step-2');
const btnNextStep = document.getElementById('btn-next-step');
const btnPrevStep = document.getElementById('btn-prev-step');

const paxInput = document.getElementById('rsvp-pax');
const dietSingle = document.getElementById('diet-single');
const dietMultiple = document.getElementById('diet-multiple');
const dietMeat = document.getElementById('diet-meat');
const dietVeg = document.getElementById('diet-veg');
const dietError = document.getElementById('diet-error');

btnNextStep.addEventListener('click', () => {
    const sideSelected = document.querySelector('input[name="side"]:checked');
    if (!sideSelected) {
        alert('請先選擇您是哪一方的親友喔！');
        return;
    }
    rsvpStep1.classList.add('hidden');
    rsvpStep2.classList.remove('hidden');
});

btnPrevStep.addEventListener('click', () => {
    rsvpStep2.classList.add('hidden');
    rsvpStep1.classList.remove('hidden');
});

if (paxInput) {
    paxInput.addEventListener('input', () => {
        const pax = parseInt(paxInput.value) || 1;
        if (pax > 1) {
            dietSingle.classList.add('hidden');
            dietMultiple.classList.remove('hidden');
            dietMeat.value = pax;
            dietVeg.value = 0;
            dietError.classList.add('hidden');
        } else {
            dietSingle.classList.remove('hidden');
            dietMultiple.classList.add('hidden');
        }
    });
}

// ================= 7. 表單共同 API 設定 =================
const API_URL = "https://script.google.com/macros/s/AKfycbzKsZ90yBKYSlTADzaVt6PLin9tevzgnTaskNF06jNWr6G63vX8k_GEu64gx275eTrumA/exec";
const successModal = document.getElementById('success-modal');
const btnSuccessOk = document.getElementById('btn-success-ok');

// --- 報名表單送出邏輯 ---
const rsvpForm = document.getElementById('form-rsvp');
if (rsvpForm) {
    rsvpForm.addEventListener('submit', function (e) {
        e.preventDefault();

        const pax = parseInt(paxInput.value) || 1;
        let finalDiet = "";

        if (pax > 1) {
            const meatCount = parseInt(dietMeat.value) || 0;
            const vegCount = parseInt(dietVeg.value) || 0;
            if (meatCount + vegCount !== pax) {
                dietError.classList.remove('hidden');
                alert('⚠️ 葷食與素食人數總和，必須剛好等於參與總人數喔！');
                return;
            }
            finalDiet = `葷食: ${meatCount}, 素食: ${vegCount}`;
        } else {
            finalDiet = document.querySelector('input[name="diet"]:checked').value;
        }

        const submitBtn = rsvpForm.querySelector('button[type="submit"]');
        const originalBtnText = submitBtn.innerText;
        submitBtn.innerText = "傳送中... ⏳";
        submitBtn.disabled = true;

        const payload = {
            formType: "rsvp",
            name: document.getElementById('rsvp-name').value,
            side: document.querySelector('input[name="side"]:checked').value,
            pax: pax,
            diet: finalDiet,
            childSeat: document.getElementById('rsvp-child').value || 0,
            message: document.getElementById('rsvp-message').value || "無"
        };

        fetch(API_URL, {
            method: 'POST',
            mode: 'no-cors',
            redirect: "follow",
            headers: { 'Content-Type': 'text/plain;charset=utf-8' },
            body: JSON.stringify(payload)
        })
        .then(() => {
            successModal.classList.remove('hidden');
            rsvpForm.reset();
            rsvpStep2.classList.add('hidden');
            rsvpStep1.classList.remove('hidden');
            dietSingle.classList.remove('hidden');
            dietMultiple.classList.add('hidden');
        })
        .catch(err => {
            console.error("API 錯誤:", err);
            alert("❌ 傳送失敗，請稍後再試。");
        })
        .finally(() => {
            submitBtn.innerText = originalBtnText;
            submitBtn.disabled = false;
        });
    });
}

// ================= 8. 祝福留言表單送出 & 打字特效邏輯 (支援中日文切換) =================
const wishForm = document.getElementById('form-wish');
const wishMessage = document.getElementById('wish-message');

// --- 8a. 浮標打字散落像素粒子特效 (完美支援中文) ---
if (wishMessage) {
    wishMessage.addEventListener('input', function(e) {
        if (e.inputType && !e.inputType.startsWith('insert')) return;

        const rect = wishMessage.getBoundingClientRect();
        
        for (let i = 0; i < 2; i++) {
            const particle = document.createElement('div');
            particle.className = 'typing-particle';
            
            particle.innerText = Math.random() > 0.5 ? '💖' : '▪';
            
            const startX = rect.left + 20 + (Math.random() * (rect.width - 40));
            const startY = rect.top + (rect.height / 2) + (Math.random() * 20);
            
            particle.style.left = `${startX}px`;
            particle.style.top = `${startY}px`;

            const twx = (Math.random() - 0.5) * 60;
            const twy = (Math.random() - 1) * 40; 
            particle.style.setProperty('--twx', `${twx}px`);
            particle.style.setProperty('--twy', `${twy}px`);

            document.body.appendChild(particle);
            particle.addEventListener('animationend', () => particle.remove());
        }
    });
}

// --- 8b. 祝福表單送出 ---
if (wishForm) {
    wishForm.addEventListener('submit', function(e) {
        e.preventDefault();

        const submitBtn = wishForm.querySelector('button[type="submit"]');
        const originalBtnText = submitBtn.innerText;
        submitBtn.innerText = "傳送中... ⏳";
        submitBtn.disabled = true;

        const payload = {
            formType: "wish", 
            name: document.getElementById('wish-name').value,
            message: document.getElementById('wish-message').value
        };

        fetch(API_URL, {
            method: 'POST',
            mode: 'no-cors',
            redirect: "follow",
            headers: { 'Content-Type': 'text/plain;charset=utf-8' },
            body: JSON.stringify(payload)
        })
        .then(() => {
            successModal.classList.remove('hidden');
            wishForm.reset();
        })
        .catch(err => {
            console.error("API 錯誤:", err);
            alert("❌ 傳送失敗，請稍後再試。");
        })
        .finally(() => {
            submitBtn.innerText = originalBtnText;
            submitBtn.disabled = false;
        });
    });
}

// --- 點擊祝賀視窗的「確認並回首頁」 ---
if (btnSuccessOk) {
    btnSuccessOk.addEventListener('click', () => {
        successModal.classList.add('hidden');
        document.querySelectorAll('.view-section').forEach(section => {
            section.classList.add('hidden');
        });
        document.getElementById('sec-home').classList.remove('hidden');
    });
}