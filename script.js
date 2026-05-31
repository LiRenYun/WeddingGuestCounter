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
        "info_parking": "🅿️ 停車場配置圖"
    },
    "ja": {
        "title": "💍仁雲&銳芝💌私たちの結婚式💍",
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

// ================= 5. 自訂像素拉炮與花瓣點擊動畫邏輯 =================
document.addEventListener('click', function(e) {
    // 取得點擊位置坐标 (相對於視窗)
    const x = e.clientX;
    const y = e.clientY;

    // 建立一個 Confetti 容器 (如果還沒建立的話)
    let container = document.querySelector('.confetti-container');
    if (!container) {
        container = document.createElement('div');
        container.className = 'confetti-container';
        document.body.appendChild(container);
    }

    // 動態產生粒子，包含原有的像素 Confetti 和新增的像素花瓣
    const particleCount = 18; // 增加粒子數量，更有層次感
    const colorsConfetti = ['#ff9fb2', '#8ce1d5', '#bda4ff', '#fffd80', '#ffffff']; // 原有 bold 彩色
    const colorsPetal = ['#ffdae0', '#dbffff', '#e6daff', '#ffffee', '#ffffff']; // 新增 粉嫩柔和花瓣色

    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        
        // 隨機決定是 Confetti (0) 還是 花瓣 (1)
        const particleType = Math.floor(Math.random() * 2);
        
        if (particleType === 0) {
            particle.className = 'pixel-confetti';
            particle.style.backgroundColor = colorsConfetti[Math.floor(Math.random() * colorsConfetti.length)];
        } else {
            particle.className = 'pixel-petal';
            particle.style.backgroundColor = colorsPetal[Math.floor(Math.random() * colorsPetal.length)];
        }
        
        // 散開與旋轉邏輯
        const angle = Math.random() * Math.PI * 2;
        const radius = Math.random() * 120 + 60; // 稍微擴大散開半徑
        const dx = Math.cos(angle) * radius;
        const dy = Math.sin(angle) * radius;
        const dr = (Math.random() - 0.5) * 360; // 旋轉度數

        // 將變數傳給 CSS keyframes
        particle.style.setProperty('--dx', `${dx}px`);
        particle.style.setProperty('--dy', `${dy}px`);
        particle.style.setProperty('--dr', `${dr}deg`);
        
        // 設定初始位置為點擊位置
        particle.style.left = `${x}px`;
        particle.style.top = `${y}px`;

        // 隨機動畫延時，更有層次感
        particle.style.animationDelay = `${Math.random() * 0.1}s`;

        // 將粒子加入容器
        container.appendChild(particle);

        // 動畫結束後從 DOM 移除粒子
        particle.addEventListener('animationend', function() {
            particle.remove();
        });
    }
});

// ================= 6. 報名表單 分步與動態連動邏輯 =================
const rsvpStep1 = document.getElementById('rsvp-step-1');
const rsvpStep2 = document.getElementById('rsvp-step-2');
const btnNextStep = document.getElementById('btn-next-step');
const btnPrevStep = document.getElementById('btn-prev-step');

// 取得人數與葷素相關 DOM
const paxInput = document.getElementById('rsvp-pax');
const dietSingle = document.getElementById('diet-single');
const dietMultiple = document.getElementById('diet-multiple');
const dietMeat = document.getElementById('diet-meat');
const dietVeg = document.getElementById('diet-veg');
const dietError = document.getElementById('diet-error');

// 點擊「下一步」
btnNextStep.addEventListener('click', () => {
    // 檢查是否有選擇男方或女方
    const sideSelected = document.querySelector('input[name="side"]:checked');
    if (!sideSelected) {
        alert('請先選擇您是哪一方的親友喔！');
        return;
    }
    // 隱藏第一步，顯示第二步
    rsvpStep1.classList.add('hidden');
    rsvpStep2.classList.remove('hidden');
});

// 點擊「上一步」
btnPrevStep.addEventListener('click', () => {
    rsvpStep2.classList.add('hidden');
    rsvpStep1.classList.remove('hidden');
});

// 監聽參與人數變化，動態切換葷素輸入介面
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

// ================= 7. 表單送出 & API 串接邏輯 =================
const rsvpForm = document.getElementById('form-rsvp');
const successModal = document.getElementById('success-modal');
const btnSuccessOk = document.getElementById('btn-success-ok');

// Google Apps Script URL
const API_URL = "https://script.google.com/macros/s/AKfycbzKsZ90yBKYSlTADzaVt6PLin9tevzgnTaskNF06jNWr6G63vX8k_GEu64gx275eTrumA/exec";

if (rsvpForm) {
    rsvpForm.addEventListener('submit', function (e) {
        e.preventDefault(); // 防止網頁重新整理

        // === 防呆驗證 (Defense) ===
        const pax = parseInt(paxInput.value) || 1;
        let finalDiet = "";

        if (pax > 1) {
            const meatCount = parseInt(dietMeat.value) || 0;
            const vegCount = parseInt(dietVeg.value) || 0;
            
            // 檢查葷素總和是否等於總人數
            if (meatCount + vegCount !== pax) {
                dietError.classList.remove('hidden');
                alert('⚠️ 葷食與素食人數總和，必須剛好等於參與總人數喔！');
                return; // 終止執行，不送出表單
            } else {
                dietError.classList.add('hidden');
            }
            // 組合多人葷素字串格式
            finalDiet = `葷食: ${meatCount}, 素食: ${vegCount}`;
        } else {
            // 單人模式直接抓單選按鈕的值
            finalDiet = document.querySelector('input[name="diet"]:checked').value;
        }
        // ========================

        // 將按鈕改為傳送中狀態，避免重複點擊
        const submitBtn = rsvpForm.querySelector('button[type="submit"]');
        const originalBtnText = submitBtn.innerText;
        submitBtn.innerText = "傳送中... ⏳";
        submitBtn.disabled = true;

        // 收集表單資料
        const payload = {
            formType: "rsvp",
            name: document.getElementById('rsvp-name').value,
            side: document.querySelector('input[name="side"]:checked').value,
            pax: pax,
            diet: finalDiet, // 使用剛剛判斷好的葷素資料
            childSeat: document.getElementById('rsvp-child').value || 0,
            message: document.getElementById('rsvp-message').value || "無"
        };

        // 發送資料至 Google Excel
        fetch(API_URL, {
            method: 'POST',
            mode: 'no-cors',
            redirect: "follow",
            headers: {
                'Content-Type': 'text/plain;charset=utf-8',
            },
            body: JSON.stringify(payload)
        })
        .then(() => {
            // 傳送成功：顯示自訂的成功視窗
            successModal.classList.remove('hidden');
            rsvpForm.reset(); // 清空表單內容
            
            // 重置表單狀態回第一步
            rsvpStep2.classList.add('hidden');
            rsvpStep1.classList.remove('hidden');

            // 觸發人數重置的 UI 連動
            dietSingle.classList.remove('hidden');
            dietMultiple.classList.add('hidden');
        })
        .catch(err => {
            console.error("API 錯誤:", err);
            alert("❌ 傳送失敗，請稍後再試。");
        })
        .finally(() => {
            // 恢復按鈕狀態
            submitBtn.innerText = originalBtnText;
            submitBtn.disabled = false;
        });
    });
}

// 點擊祝賀視窗的「確認並回首頁」
if (btnSuccessOk) {
    btnSuccessOk.addEventListener('click', () => {
        // 隱藏成功視窗
        successModal.classList.add('hidden');
        
        // 隱藏所有 section，並顯示首頁
        document.querySelectorAll('.view-section').forEach(section => {
            section.classList.add('hidden');
        });
        document.getElementById('sec-home').classList.remove('hidden');
    });
}