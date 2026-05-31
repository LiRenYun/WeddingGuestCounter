/**
 * 📷 婚紗特集照片清單 (預設雲端測試照片)
 * 💡 清空下方陣列即可測試「🚧 功能開發中」提示。
 */

const weddingPhotos = ["img/p1.jpg","img/p2.jpg","img/p3.jpg","img/p4.jpg","img/p5.jpg","img/p6.jpg","img/p7.jpg"]; 

// ================= 1. 多國語系字典 (i18n) =================
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
        "title": "💍 仁雲&銳芝💌私たちの結婚式 💍",
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

// ================= 2. 語系與頁面切換核心邏輯 =================
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

document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const targetId = btn.getAttribute('data-target');
        const targetSection = document.getElementById(targetId);
        
        if (targetSection) {
            document.querySelectorAll('.view-section').forEach(sec => sec.classList.add('hidden'));
            targetSection.classList.remove('hidden');
            
            if (targetId === 'sec-photos') {
                document.querySelector('.game-box').classList.add('expanded');
                initWeddingPhotos();
            } else {
                document.querySelector('.game-box').classList.remove('expanded');
            }

            if (targetId === 'sec-rsvp') {
                resetRsvpSteps();
            }
        }
    });
});

// ================= 3. RSVP 表單步驟切換邏輯 =================
function resetRsvpSteps() {
    const step1 = document.getElementById('rsvp-step-1');
    const step2 = document.getElementById('rsvp-step-2');
    if (step1 && step2) {
        step1.classList.remove('hidden');
        step2.classList.add('hidden');
    }
}

const btnNextStep = document.getElementById('btn-next-step');
if (btnNextStep) {
    btnNextStep.addEventListener('click', () => {
        const sideChecked = document.querySelector('input[name="side"]:checked');
        if (!sideChecked) {
            alert(currentLang === 'zh' ? "請先選擇您是哪一方的親友喔！" : "どちらの親族か選択してください。");
            return;
        }
        document.getElementById('rsvp-step-1').classList.add('hidden');
        document.getElementById('rsvp-step-2').classList.remove('hidden');
    });
}

const btnPrevStep = document.getElementById('btn-prev-step');
if (btnPrevStep) {
    btnPrevStep.addEventListener('click', () => {
        document.getElementById('rsvp-step-2').classList.add('hidden');
        document.getElementById('rsvp-step-1').classList.remove('hidden');
    });
}


// ================= 4. 🚀【完整防禦修復】：人數防護（Defense機制） =================
const rsvpPax = document.getElementById('rsvp-pax');
const dietSingle = document.getElementById('diet-single');
const dietMultiple = document.getElementById('diet-multiple');
const dietMeat = document.getElementById('diet-meat');
const dietVeg = document.getElementById('diet-veg');

if (rsvpPax) {
    rsvpPax.addEventListener('input', () => {
        // Defense 1: 防止輸入負數、0 或非數字，低於 1 強制歸 1
        let total = parseInt(rsvpPax.value);
        if (isNaN(total) || total < 1) {
            total = 1;
            rsvpPax.value = 1;
        }
        // Defense 2: 設定合理上限值（例如最多 99 人），防惡意輸入
        if (total > 99) {
            total = 99;
            rsvpPax.value = 99;
        }

        // 連動葷素區塊切換
        if (total > 1) {
            if (dietSingle) dietSingle.classList.add('hidden');
            if (dietMultiple) dietMultiple.classList.remove('hidden');
            // 預設將總人數分配給葷食
            if (dietMeat) dietMeat.value = total;
            if (dietVeg) dietVeg.value = 0;
        } else {
            if (dietSingle) dietSingle.classList.remove('hidden');
            if (dietMultiple) dietMultiple.classList.add('hidden');
        }
    });
}

// Defense 3: 多人時，葷食與素食人數防呆與自動加總校正
if (dietMeat && dietVeg && rsvpPax) {
    const handleDietDefense = (changedInput) => {
        let total = parseInt(rsvpPax.value) || 1;
        let meat = parseInt(dietMeat.value);
        let veg = parseInt(dietVeg.value);

        // 防止小於 0
        if (isNaN(meat) || meat < 0) { meat = 0; dietMeat.value = 0; }
        if (isNaN(veg) || veg < 0) { veg = 0; dietVeg.value = 0; }

        // 如果目前改的是葷食，自動去計算素食 = 總人數 - 葷食
        if (changedInput === 'meat') {
            if (meat > total) {
                meat = total;
                dietMeat.value = total;
            }
            veg = total - meat;
            dietVeg.value = veg;
        } 
        // 如果目前改的是素食，自動去計算葷食 = 總人數 - 素食
        else if (changedInput === 'veg') {
            if (veg > total) {
                veg = total;
                dietVeg.value = total;
            }
            meat = total - veg;
            dietMeat.value = meat;
        }
    };

    dietMeat.addEventListener('input', () => handleDietDefense('meat'));
    dietVeg.addEventListener('input', () => handleDietDefense('veg'));
}


// ================= 5. 婚紗相簿 - 浮動置中輪播與手勢核心 =================
let currentPhotoIndex = 0; 
let isDragMoving = false; 

function initWeddingPhotos() {
    const container = document.getElementById('photos-container');
    const emptyMsg = document.getElementById('photos-empty-msg');
    
    if (!container || !emptyMsg) return;

    if (weddingPhotos.length === 0) {
        container.classList.add('hidden'); 
        emptyMsg.classList.remove('hidden'); 
        return;
    }

    emptyMsg.classList.add('hidden');
    container.classList.remove('hidden');
    
    if (container.children.length === 0) {
        container.innerHTML = '';
        weddingPhotos.forEach((src, index) => {
            const img = document.createElement('img');
            img.src = src;
            img.className = 'photo-item';
            img.alt = `Wedding Photo ${index + 1}`;
            img.setAttribute('draggable', 'false'); 
            
            img.onload = () => {
                updateCarouselPosition();
            };
            
            img.addEventListener('click', (e) => {
                if (isDragMoving) return; 
                currentPhotoIndex = index;
                updateCarouselPosition();
                openLightbox(src);
            });
            container.appendChild(img);
        });
        
        addDragInteractionToCarousel();
    }
    updateCarouselPosition(0); 
}

function updateCarouselPosition(customSpeed) {
    const container = document.getElementById('photos-container');
    const items = container.querySelectorAll('.photo-item');
    const viewContainer = document.querySelector('.game-box');
    
    if (items.length === 0 || !viewContainer) return;

    if (currentPhotoIndex < 0) currentPhotoIndex = 0;
    if (currentPhotoIndex >= items.length) currentPhotoIndex = items.length - 1;

    items.forEach((item, idx) => {
        item.classList.remove('active');
        if (idx === currentPhotoIndex) item.classList.add('active');
    });

    const activeItem = items[currentPhotoIndex];
    const containerWidth = viewContainer.offsetWidth;
    const trackOffset = (containerWidth / 2) - (activeItem.offsetLeft + activeItem.offsetWidth / 2);
    
    if (customSpeed !== undefined) {
        container.style.transition = `transform ${customSpeed}s cubic-bezier(0.23, 1, 0.32, 1)`;
    } else {
        container.style.transition = 'transform 0.5s cubic-bezier(0.23, 1, 0.32, 1)'; 
    }
    container.style.transform = `translateX(${trackOffset}px)`;
}

function addDragInteractionToCarousel() {
    const touchZone = document.getElementById('photos-container');
    if (!touchZone) return;

    let isDragging = false;
    let startX = 0;
    let startOffset = 0;
    let dragThreshold = 40; 

    const getCurrentTranslate = (el) => {
        const style = window.getComputedStyle(el);
        const matrix = new WebKitCSSMatrix(style.transform);
        return matrix.m41; 
    }

    const startDrag = (e) => {
        isDragging = true;
        isDragMoving = false; 
        startX = e.clientX || e.touches[0].clientX;
        startOffset = getCurrentTranslate(touchZone);
        touchZone.style.transition = 'none'; 
    };

    const moveDrag = (e) => {
        if (!isDragging) return;
        const currentX = e.clientX || (e.touches && e.touches[0].clientX);
        if (currentX === undefined) return;
        
        const diffX = currentX - startX;
        if (Math.abs(diffX) > 8) {
            isDragMoving = true; 
        }
        touchZone.style.transform = `translateX(${startOffset + diffX}px)`;
    };

    const endDrag = (e) => {
        if (!isDragging) return;
        isDragging = false;

        let currentX = startX;
        if (e.clientX !== undefined) {
            currentX = e.clientX;
        } else if (e.changedTouches && e.changedTouches[0]) {
            currentX = e.changedTouches[0].clientX;
        }
        
        const diffX = currentX - startX;
        const firstItem = document.querySelector('.photo-item');
        const itemWidth = firstItem ? (firstItem.offsetWidth + 30) : 180; 
        
        if (Math.abs(diffX) > dragThreshold) {
            let change = Math.round(diffX / itemWidth);
            if (change === 0) change = diffX > 0 ? 1 : -1;
            currentPhotoIndex -= change; 
        }
        
        updateCarouselPosition(0.4); 
        setTimeout(() => { isDragMoving = false; }, 80);
    };

    touchZone.addEventListener('mousedown', startDrag);
    window.addEventListener('mousemove', moveDrag);
    window.addEventListener('mouseup', endDrag);

    touchZone.addEventListener('touchstart', startDrag);
    touchZone.addEventListener('touchmove', moveDrag, { passive: true });
    touchZone.addEventListener('touchend', endDrag);
}

// ================= 6. 大畫面燈箱 (Lightbox Slider) =================
const imageModal = document.getElementById('image-modal');
const enlargedImg = document.getElementById('enlarged-img');
const closeModal = document.getElementById('close-modal');

function openLightbox(src) {
    if (imageModal && enlargedImg) {
        enlargedImg.src = src;
        imageModal.classList.remove('hidden');
        addSwipeInteractionToModal();
    }
}

function addSwipeInteractionToModal() {
    const modalTouchZone = document.getElementById('modal-touch-zone');
    if (!modalTouchZone) return;

    let isModalDragging = false;
    let startModalX = 0;
    let swipeThreshold = 80; 

    const startModalDrag = (e) => {
        isModalDragging = true;
        startModalX = e.clientX || e.touches[0].clientX;
        modalTouchZone.style.transition = 'none';
    };

    const moveModalDrag = (e) => {
        if (!isModalDragging) return;
        const currentModalX = e.clientX || (e.touches && e.touches[0].clientX);
        if (currentModalX === undefined) return;
        
        const diffX = currentModalX - startModalX;
        modalTouchZone.style.transform = `translateX(${diffX}px)`.tr; 
    };

    const endModalDrag = (e) => {
        if (!isModalDragging) return;
        isModalDragging = false;

        let endModalX = startModalX;
        if (e.clientX !== undefined) {
            endModalX = e.clientX;
        } else if (e.changedTouches && e.changedTouches[0]) {
            endModalX = e.changedTouches[0].clientX;
        }
        
        const diffX = endModalX - startModalX;
        modalTouchZone.style.transition = 'transform 0.3s cubic-bezier(0.23, 1, 0.32, 1)';

        if (diffX < -swipeThreshold) {
            currentPhotoIndex = (currentPhotoIndex + 1) % weddingPhotos.length; 
        } else if (diffX > swipeThreshold) {
            currentPhotoIndex = (currentPhotoIndex - 1 + weddingPhotos.length) % weddingPhotos.length;
        }

        updateCarouselPosition();
        if (enlargedImg) enlargedImg.src = weddingPhotos[currentPhotoIndex];
        modalTouchZone.style.transform = 'translateX(0px)';
    };

    modalTouchZone.addEventListener('mousedown', startModalDrag);
    window.addEventListener('mousemove', moveModalDrag);
    window.addEventListener('mouseup', endModalDrag);

    modalTouchZone.addEventListener('touchstart', startModalDrag);
    modalTouchZone.addEventListener('touchmove', moveModalDrag, { passive: true });
    modalTouchZone.addEventListener('touchend', endModalDrag);
}

if (closeModal && imageModal) {
    closeModal.addEventListener('click', () => {
        imageModal.classList.add('hidden');
    });
}
const backdrop = document.getElementById('modal-backdrop');
if (backdrop && imageModal) {
    backdrop.addEventListener('click', () => {
        imageModal.classList.add('hidden');
    });
}

const mPrev = document.getElementById('modal-prev');
const mNext = document.getElementById('modal-next');
if (mPrev) { mPrev.addEventListener('click', (e) => { e.stopPropagation(); switchLightboxPhoto('prev'); }); }
if (mNext) { mNext.addEventListener('click', (e) => { e.stopPropagation(); switchLightboxPhoto('next'); }); }

function switchLightboxPhoto(dir) {
    if (weddingPhotos.length === 0) return;
    if (dir === 'next') {
        currentPhotoIndex = (currentPhotoIndex + 1) % weddingPhotos.length;
    } else if (dir === 'prev') {
        currentPhotoIndex = (currentPhotoIndex - 1 + weddingPhotos.length) % weddingPhotos.length;
    }
    updateCarouselPosition();
    if (enlargedImg) enlargedImg.src = weddingPhotos[currentPhotoIndex];
}

// ================= 7. 其他表單功能與對接 =================
const mapImg = document.getElementById('parking-map-img');
if (mapImg) {
    mapImg.addEventListener('click', () => {
        const mPrev = document.getElementById('modal-prev');
        const mNext = document.getElementById('modal-next');
        if (mPrev) mPrev.style.display = 'none';
        if (mNext) mNext.style.display = 'none';
        
        const modalTouchZone = document.getElementById('modal-touch-zone');
        if (modalTouchZone) {
            modalTouchZone.innerHTML = `<img id="enlarged-img" src="${mapImg.src}" alt="Map">`;
        }
        imageModal.classList.remove('hidden');
    });
}

document.querySelectorAll('.photo-item, #image-modal .close-btn, #modal-backdrop').forEach(el => {
    el.addEventListener('click', () => {
        const mPrev = document.getElementById('modal-prev');
        const mNext = document.getElementById('modal-next');
        if (mPrev) mPrev.style.display = 'block';
        if (mNext) mNext.style.display = 'block';
    });
});

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

handleFormSubmit('form-rsvp', 'rsvp', () => ({
    name: document.getElementById('rsvp-name')?.value || "未填",
    side: document.querySelector('input[name="side"]:checked')?.value || "未填",
    pax: rsvpPax ? (parseInt(rsvpPax.value) || 1) : 1,
    diet: rsvpPax && parseInt(rsvpPax.value) > 1 ? `葷:${dietMeat.value},素:${dietVeg.value}` : (document.querySelector('input[name="diet"]:checked')?.value || "葷"),
    childSeat: document.getElementById('rsvp-child')?.value || 0,
    message: document.getElementById('rsvp-message')?.value || ""
}));

handleFormSubmit('form-wish', 'wish', () => ({
    name: document.getElementById('wish-name')?.value || "匿名親友",
    message: document.getElementById('wish-message')?.value || ""
}));

const btnSuccessOk = document.getElementById('btn-success-ok');
if (btnSuccessOk) {
    btnSuccessOk.addEventListener('click', () => {
        const successModal = document.getElementById('success-modal');
        if (successModal) successModal.classList.add('hidden');
        document.querySelectorAll('.view-section').forEach(sec => sec.classList.add('hidden'));
        document.getElementById('sec-home').classList.remove('hidden');
        document.querySelector('.game-box').classList.remove('expanded');
    });
}

document.addEventListener('DOMContentLoaded', () => {
    updateLanguage();
    initWeddingPhotos();
    setTimeout(() => { updateCarouselPosition(); }, 150);
});

window.addEventListener('load', () => {
    updateCarouselPosition();
});