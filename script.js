/**
 * 📷 婚紗特集照片清單 (預設雲端測試照片)
 * 💡 清空下方陣列即可測試「🚧 功能開發中」提示。
 */
//"img/p1.jpg","img/p2.jpg","img/p3.jpg","img/p4.jpg","img/p5.jpg","img/p6.jpg","img/p7.jpg"
const weddingPhotos = []; 

// ================= 1. 多國語系字典 (i18n) =================
const translations = {
    "zh": {
        "title": "💍 仁雲&銳芝💌我們的婚禮 💍",
        "subtitle": "2026.11.29 歡迎來到新手村",
        "btn_lang": "切換至 日本語 🇯🇵",
        "btn_rsvp": "📝 報名參加",
        "btn_info": "🗺️ 婚宴資訊",
        "btn_wishes": "💌 想對新人說的話",
        "btn_photos": "📷 婚紗特集🚧",
        "title_rsvp": "📝 報名參加",
        "title_info": "🗺️ 婚宴資訊",
        "title_wishes": "💌 留言祝福",
        "title_photos": "📷 婚紗特集",
        "btn_back": "返回主選單",
        "btn_next": "下一步 ➡️",
        "btn_prev": "⬅️ 上一步",
        "btn_submit": "確認送出 💖",
        "btn_submitting": "⏳ 送出中...",
        "label_side": "您是哪一方的親友？",
        "side_groom": "男方",
        "side_bride": "女方",
        "alert_select_side": "請先選擇您是哪一方的親友喔！",
        "label_name": "姓名",
        "placeholder_rsvp_name": "請輸入您的姓名",
        "label_pax": "參與人數(含孩童)",
        "label_diet": "葷素選擇",
        "diet_meat": "🥩 葷食",
        "diet_veg": "🥗 素食",
        "diet_multiple_meat": "🥩 葷食:",
        "diet_multiple_veg": "🥗 素食:",
        "unit_people": "人",
        "diet_error": "⚠️ 葷食與素食人數總和必須等於參與總人數！",
        "label_child": "兒童座椅數量",
        "placeholder_rsvp_child": "不需要請填 0",
        "label_note": "備註/祝福",
        "placeholder_rsvp_message": "有什麼特別需求或想說的話嗎？",
        "info_date_label": "📅 日期:",
        "info_date": "2026/11/29 (日)",
        "info_time_label": "⏰ 時間:",
        "info_time": "11:30~12:00 入場 | 12:00 開席",
        "info_venue_label": "📍 地點:",
        "info_venue": "玄饌海鮮宴會館",
        "info_map_link": "📍 開啟 Google Maps",
        "info_transport": "🚗 交通方式",
        "info_hsr": "🚄 高鐵：台南站下車，轉計程車約40分",
        "info_tra": "🚆 台鐵：台南火車站，轉計程車約25分",
        "info_parking": "🅿️ 停車場配置圖",
        "label_wish_name": "你是誰 (姓名/暱稱)",
        "placeholder_wish_name": "請輸入您的名字",
        "label_wish_message": "祝福的話語",
        "placeholder_wish_message": "在這裡寫下對仁雲&銳芝的祝福吧...",
        "btn_send_wish": "送出祝福 💌",
        "photos_coming_soon": "🚧 功能開發中，敬請期待！",
        "success_title": "🎉 報名成功！",
        "success_desc": "感謝您的回覆，期待在婚禮上見到您！",
        "btn_success_ok": "確認並回首頁",
        "btn_game": "🎮 戀愛PK大作戰",
        "title_game": "🎮 戀愛PK大作戰",
        "cupid_name": "邱比特",
        "yuelao_name": "月老",
        "game_wind_label": "風向",
        "game_btn_charge": "🎯 長按蓄力發射",
        "game_btn_charging": "⚡ 蓄力中... 鬆開即射！",
        "game_btn_config": "⚙️ 模式設定",
        "game_btn_restart": "🔄 重新開始",
        "game_btn_close": "關閉",
        "game_modal_title": "💘 對戰設定",
        "game_label_mode": "遊戲模式：",
        "game_mode_2p": "👥 雙人對戰",
        "game_mode_cpu": "🤖 單人 vs 電腦",
        "game_label_first": "先攻選擇：",
        "game_first_cupid": "邱比特先攻",
        "game_first_yuelao": "月老先攻",
        "game_first_random": "🎲 隨機先攻",
        "game_start_btn": "⚔️ 開始對決！",
        "game_turn_cupid": "🏹 邱比特的回合",
        "game_turn_yuelao": "🪄 月老的回合",
        "game_hit_msg": "💥 命中對手！",
        "game_blocked_msg": "🌸 被緣分神木阻擋了！",
        "game_miss_msg": "💨 未命中！",
        "game_win_cupid": "🎉 愛神邱比特獲勝！",
        "game_win_cupid_desc": "💘 金箭穿心，邱比特為新人締結浪漫良緣！",
        "game_win_yuelao": "🎉 月老爺爺獲勝！",
        "game_win_yuelao_desc": "⭕ 千里姻緣一線牽，月老將兩人牢牢結下良緣！",
        "game_btn_play_again": "🔄 再玩一局"
    },
    "ja": {
        "title": "💍 仁雲&銳芝💌私たちの結婚式 💍",
        "subtitle": "2026.11.29 始まりの村へようこそ",
        "btn_lang": "繁體中文へ切替 🇹🇼",
        "btn_rsvp": "📝 出席の返信",
        "btn_info": "🗺️ 結婚式の案内",
        "btn_wishes": "💌 お祝いのメッセージ",
        "btn_photos": "📷 フォトアルバム🚧",
        "title_rsvp": "📝 出席の返信",
        "title_info": "🗺️ 結婚式の案内",
        "title_wishes": "💌 お祝いメッセージ",
        "title_photos": "📷 フォトアルバム",
        "btn_back": "トップへ戻る",
        "btn_next": "次へ ➡️",
        "btn_prev": "⬅️ 前へ",
        "btn_submit": "送信する 💖",
        "btn_submitting": "⏳ 送信中...",
        "label_side": "どちら側の親族・ご友人ですか？",
        "side_groom": "新郎側",
        "side_bride": "新婦側",
        "alert_select_side": "どちら側の親族・ご友人か選択してください。",
        "label_name": "お名前",
        "placeholder_rsvp_name": "お名前を入力してください",
        "label_pax": "参加人数（お子様を含む）",
        "label_diet": "お食事の希望",
        "diet_meat": "🥩 お肉料理",
        "diet_veg": "🥗 ベジタリアン",
        "diet_multiple_meat": "🥩 お肉:",
        "diet_multiple_veg": "🥗 ベジ:",
        "unit_people": "名",
        "diet_error": "⚠️ お肉とベジタリアンの合計人数が参加人数と一致していません！",
        "label_child": "チャイルドシートの数",
        "placeholder_rsvp_child": "不要な場合は 0 と入力",
        "label_note": "備考・メッセージ",
        "placeholder_rsvp_message": "特別なご要望やメッセージがあればご記入ください...",
        "info_date_label": "📅 日付:",
        "info_date": "2026年11月29日 (日曜日)",
        "info_time_label": "⏰ 時間:",
        "info_time": "11:30~12:00 受付 | 12:00 開宴",
        "info_venue_label": "📍 会場:",
        "info_venue": "玄饌海鮮宴會館",
        "info_map_link": "📍 Google Mapsを開く",
        "info_transport": "🚗 アクセス",
        "info_hsr": "🚄 高鉄：台南駅下車、タクシーで約40分",
        "info_tra": "🚆 台鉄：台南駅下車、タクシーで約25分",
        "info_parking": "🅿️ 駐車場マップ",
        "label_wish_name": "お名前（ニックネーム）",
        "placeholder_wish_name": "お名前を入力してください",
        "label_wish_message": "お祝いのメッセージ",
        "placeholder_wish_message": "ここに仁雲＆銳芝への祝福の言葉を書いてください...",
        "btn_send_wish": "お祝いを送る 💌",
        "photos_coming_soon": "🚧 現在開発中、お楽しみに！",
        "success_title": "🎉 ご返信ありがとうございます！",
        "success_desc": "ご返信を受け付けました。当日お会いできるのを楽しみにしています！",
        "btn_success_ok": "トップページへ戻る",
        "btn_game": "🎮 愛のPKバトル",
        "title_game": "🎮 愛のPKバトル",
        "cupid_name": "キューピッド",
        "yuelao_name": "月下老人",
        "game_wind_label": "風向き",
        "game_btn_charge": "🎯 長押しでパワー発射",
        "game_btn_charging": "⚡ チャージ中... 離して発射！",
        "game_btn_config": "⚙️ 設定",
        "game_btn_restart": "🔄 やり直す",
        "game_btn_close": "閉じる",
        "game_modal_title": "💘 バトル設定",
        "game_label_mode": "ゲームモード：",
        "game_mode_2p": "👥 二人対戦",
        "game_mode_cpu": "🤖 一人プレイ (vs CPU)",
        "game_label_first": "先攻の選択：",
        "game_first_cupid": "キューピッド先攻",
        "game_first_yuelao": "月下老人先攻",
        "game_first_random": "🎲 ランダム先攻",
        "game_start_btn": "⚔️ バトル開始！",
        "game_turn_cupid": "🏹 キューピッドのターン",
        "game_turn_yuelao": "🪄 月下老人のターン",
        "game_hit_msg": "💥 命中！",
        "game_blocked_msg": "🌸 縁結びの神木に阻まれた！",
        "game_miss_msg": "💨 外れた！",
        "game_win_cupid": "🎉 キューピッドの勝利！",
        "game_win_cupid_desc": "💘 愛の矢が命中！キューピッドが二人に永遠の愛を授けました！",
        "game_win_yuelao": "🎉 月下老人の勝利！",
        "game_win_yuelao_desc": "⭕ 赤い糸が結ばれました！月下老人が運命の二人を永遠に結びました！",
        "game_btn_play_again": "🔄 もう一度遊ぶ"
    }
};

// ================= 2. 語系與頁面切換核心邏輯 =================
let currentLang = 'zh';
try {
    const savedLang = localStorage.getItem('wedding_lang');
    if (savedLang && (savedLang === 'zh' || savedLang === 'ja')) {
        currentLang = savedLang;
    }
} catch (e) {
    console.warn('localStorage is not accessible', e);
}

function updateLanguage() {
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (translations[currentLang] && translations[currentLang][key]) {
            el.innerText = translations[currentLang][key];
        }
    });
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
        const key = el.getAttribute('data-i18n-placeholder');
        if (translations[currentLang] && translations[currentLang][key]) {
            el.setAttribute('placeholder', translations[currentLang][key]);
        }
    });

    const langBtn = document.getElementById('btn-lang');
    if (langBtn && translations[currentLang] && translations[currentLang]['btn_lang']) {
        langBtn.innerText = translations[currentLang]['btn_lang'];
    }

    try {
        localStorage.setItem('wedding_lang', currentLang);
    } catch (e) {
        console.warn('localStorage is not accessible', e);
    }

    if (window.lovePKGame) {
        window.lovePKGame.updateLanguageTexts();
    }
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
            
            if (targetId === 'sec-photos' || targetId === 'sec-game') {
                document.querySelector('.game-box').classList.add('expanded');
                if (targetId === 'sec-photos') initWeddingPhotos();
                if (targetId === 'sec-game') initLoveGame();
            } else {
                document.querySelector('.game-box').classList.remove('expanded');
                if (window.lovePKGame) {
                    window.lovePKGame.cleanupOnLeave();
                }
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
            const alertMsg = translations[currentLang]?.alert_select_side || 
                (currentLang === 'zh' ? "請先選擇您是哪一方的親友喔！" : "どちら側の親族・ご友人か選択してください。");
            alert(alertMsg);
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


// ================= 4. 人數防護（Defense機制） =================
const rsvpPax = document.getElementById('rsvp-pax');
const dietSingle = document.getElementById('diet-single');
const dietMultiple = document.getElementById('diet-multiple');
const dietMeat = document.getElementById('diet-meat');
const dietVeg = document.getElementById('diet-veg');
const dietError = document.getElementById('diet-error');
const rsvpChild = document.getElementById('rsvp-child');

function updateDietErrorState() {
    if (!rsvpPax || !dietMeat || !dietVeg || !dietError) return;
    const total = parseInt(rsvpPax.value);
    if (!isNaN(total) && total > 1) {
        const meat = parseInt(dietMeat.value) || 0;
        const veg = parseInt(dietVeg.value) || 0;
        if (meat + veg !== total) {
            dietError.classList.remove('hidden');
        } else {
            dietError.classList.add('hidden');
        }
    } else {
        dietError.classList.add('hidden');
    }
}

if (rsvpPax) {
    rsvpPax.addEventListener('input', () => {
        const rawVal = rsvpPax.value.trim();
        if (rawVal === '') {
            updateDietErrorState();
            return;
        }

        const total = parseInt(rawVal);
        if (!isNaN(total)) {
            if (total > 1) {
                if (dietSingle) dietSingle.classList.add('hidden');
                if (dietMultiple) dietMultiple.classList.remove('hidden');
                const meat = parseInt(dietMeat?.value);
                const veg = parseInt(dietVeg?.value);
                if ((isNaN(meat) && isNaN(veg)) || (meat === 0 && veg === 0)) {
                    if (dietMeat) dietMeat.value = total;
                    if (dietVeg) dietVeg.value = 0;
                }
            } else {
                if (dietSingle) dietSingle.classList.remove('hidden');
                if (dietMultiple) dietMultiple.classList.add('hidden');
            }
        }
        updateDietErrorState();
    });

    rsvpPax.addEventListener('blur', () => {
        let total = parseInt(rsvpPax.value);
        if (isNaN(total) || total < 1) {
            total = 1;
            rsvpPax.value = 1;
        } else if (total > 99) {
            total = 99;
            rsvpPax.value = 99;
        }

        if (total > 1) {
            if (dietSingle) dietSingle.classList.add('hidden');
            if (dietMultiple) dietMultiple.classList.remove('hidden');
            if (dietMeat && (dietMeat.value === '' || isNaN(parseInt(dietMeat.value)))) {
                dietMeat.value = total;
            }
            if (dietVeg && (dietVeg.value === '' || isNaN(parseInt(dietVeg.value)))) {
                dietVeg.value = 0;
            }
        } else {
            if (dietSingle) dietSingle.classList.remove('hidden');
            if (dietMultiple) dietMultiple.classList.add('hidden');
        }
        updateDietErrorState();
    });
}

if (dietMeat) {
    dietMeat.addEventListener('input', () => {
        updateDietErrorState();
    });
    dietMeat.addEventListener('blur', () => {
        let val = parseInt(dietMeat.value);
        if (isNaN(val) || val < 0) {
            dietMeat.value = 0;
        }
        updateDietErrorState();
    });
}

if (dietVeg) {
    dietVeg.addEventListener('input', () => {
        updateDietErrorState();
    });
    dietVeg.addEventListener('blur', () => {
        let val = parseInt(dietVeg.value);
        if (isNaN(val) || val < 0) {
            dietVeg.value = 0;
        }
        updateDietErrorState();
    });
}

if (rsvpChild) {
    rsvpChild.addEventListener('blur', () => {
        let val = parseInt(rsvpChild.value);
        if (isNaN(val) || val < 0) {
            rsvpChild.value = 0;
        }
    });
}


// ================= 5. 🚀【全新加回】：滑鼠點擊像素愛心動畫 (Click Particles) =================
document.addEventListener('click', (e) => {
    // 如果點擊的是按鈕或輸入框，依然會觸發動畫
    const particleCount = 60; // 每次點擊噴出的粒子數量
    
    for (let i = 0; i < particleCount; i++) {
        const p = document.createElement('div');
        p.className = 'pixel-confetti';
        
        // 隨機決定是愛心還是小方塊
        const symbols = ['💖', '▪', '⭐', '✨', '🌸', '💎', '❤️', '🔥'];
        p.innerText = symbols[Math.floor(Math.random() * symbols.length)];
        //p.innerText = Math.random() > 0.4 ? '💖' : '▪';
        
        // 定位在滑鼠游標的位置
        p.style.left = `${e.clientX}px`;
        p.style.top = `${e.clientY}px`;
        p.style.position = 'fixed';
        p.style.fontSize = Math.random() > 0.5 ? '14px' : '10px';
        p.style.zIndex = '99999';
        p.style.pointerEvents = 'none';
        
        // 隨機計算爆炸散射的角度與力道 (CSS 動畫變數)
        const angle = Math.random() * Math.PI * 2;
        const velocity = 100 + Math.random() * 200;
        const dx = Math.cos(angle) * velocity;
        const dy = Math.sin(angle) * velocity - 50; // 稍微帶有一點往上飄的效果
        const dr = (Math.random() - 0.5) * 360; // 旋轉角度
        
        p.style.setProperty('--dx', `${dx}px`);
        p.style.setProperty('--dy', `${dy}px`);
        p.style.setProperty('--dr', `${dr}deg`);
        
        document.body.appendChild(p);
        
        // 動態結束後自動將物件銷毀，防止佔用記憶體
        p.addEventListener('animationend', () => p.remove());
    }
});


// ================= 6. 婚紗相簿 - 浮動置中輪播與手勢核心 =================
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

// ================= 7. 大畫面燈箱 (Lightbox Slider) =================
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
        modalTouchZone.style.transform = `translateX(${diffX}px)`; 
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

// ================= 8. 其他表單功能與對接 =================
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

function handleFormSubmit(formId, formType, getPayload, validateFn) {
    const form = document.getElementById(formId);
    if (!form) return;
    form.addEventListener('submit', (e) => {
        e.preventDefault();

        // 執行送出前驗證防護
        if (typeof validateFn === 'function' && !validateFn()) {
            return;
        }

        const btn = form.querySelector('button[type="submit"]');
        if (!btn) return;
        btn.disabled = true;
        const oldText = btn.innerText;
        btn.innerText = translations[currentLang]?.btn_submitting || "⏳...";

        fetch(API_URL, {
            method: 'POST',
            mode: 'no-cors',
            body: JSON.stringify({ formType, ...getPayload() })
        }).then(() => {
            const successModal = document.getElementById('success-modal');
            if (successModal) successModal.classList.remove('hidden');
            form.reset();

            // 重置 RSVP 表單各欄位與步驟狀態
            if (formId === 'form-rsvp') {
                if (dietSingle) dietSingle.classList.remove('hidden');
                if (dietMultiple) dietMultiple.classList.add('hidden');
                if (dietError) dietError.classList.add('hidden');
                if (rsvpPax) rsvpPax.value = 1;
                if (dietMeat) dietMeat.value = 1;
                if (dietVeg) dietVeg.value = 0;
                if (rsvpChild) rsvpChild.value = 0;
                resetRsvpSteps();
            }
        }).finally(() => {
            btn.disabled = false;
            btn.innerText = oldText;
        });
    });
}

function validateRsvpForm() {
    const totalPax = parseInt(rsvpPax?.value) || 1;
    if (totalPax > 1) {
        const meat = parseInt(dietMeat?.value) || 0;
        const veg = parseInt(dietVeg?.value) || 0;
        if (meat + veg !== totalPax) {
            if (dietError) dietError.classList.remove('hidden');
            const errorMsg = translations[currentLang]?.diet_error || 
                (currentLang === 'zh' ? "⚠️ 葷食與素食人數總和必須等於參與總人數！" : "⚠️ お肉とベジタリアンの合計人数が参加人数と一致していません！");
            alert(errorMsg);
            if (dietMeat) dietMeat.focus();
            return false;
        }
    }
    return true;
}

handleFormSubmit('form-rsvp', 'rsvp', () => {
    const totalPax = rsvpPax ? (parseInt(rsvpPax.value) || 1) : 1;
    const meat = dietMeat ? (parseInt(dietMeat.value) || 0) : 0;
    const veg = dietVeg ? (parseInt(dietVeg.value) || 0) : 0;
    const dietVal = totalPax > 1 
        ? `葷:${meat},素:${veg}` 
        : (document.querySelector('input[name="diet"]:checked')?.value || "葷食");

    return {
        name: document.getElementById('rsvp-name')?.value || "未填",
        side: document.querySelector('input[name="side"]:checked')?.value || "未填",
        pax: totalPax,
        diet: dietVal,
        childSeat: parseInt(document.getElementById('rsvp-child')?.value) || 0,
        message: document.getElementById('rsvp-message')?.value || ""
    };
}, validateRsvpForm);

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

// ================= 9. 🎮 戀愛PK大作戰 (邱比特 vs 月老) 核心遊戲引擎 =================
class LovePKGame {
    constructor() {
        this.canvas = document.getElementById('game-canvas');
        if (!this.canvas) return;
        this.ctx = this.canvas.getContext('2d');

        this.width = 800;
        this.height = 420;
        this.canvas.width = this.width;
        this.canvas.height = this.height;

        this.mode = '2p'; // '2p' | 'cpu'
        this.firstPlayer = 'cupid';
        this.currentTurn = 'cupid';
        this.state = 'idle'; // 'idle' | 'charging' | 'flying' | 'gameover'

        this.cupidHP = 5;
        this.yuelaoHP = 5;
        this.wind = 0;

        this.cupid = {
            x: 120,
            y: 310,
            launchX: 155,
            launchY: 285,
            angle: 55 * (Math.PI / 180) // 55 度仰角
        };

        this.yuelao = {
            x: 680,
            y: 310,
            launchX: 645,
            launchY: 285,
            angle: 55 * (Math.PI / 180) // 55 度仰角
        };

        this.tree = {
            x: 368,
            y: 165, // 縮小 0.8 倍的高度 (原 110 降為 165，高 220px)
            width: 64,
            height: 220
        };

        this.power = 0;
        this.chargeSpeed = 70; // % per second
        this.isCharging = false;
        this.projectile = null;
        this.particles = [];
        this.stars = [];
        this.sakuraPetals = [];
        this.shakeTimer = 0;
        this.cpuTimeout = null;
        this.turnTimeout = null;
        this.winTimeout = null;
        this.cpuChargeInterval = null;
        this.time = 0;

        this.initStars();
        this.initSakuraPetals();
        this.bindEvents();

        this.updateHpDisplay();
        this.startNewTurn(false);

        this.lastTime = performance.now();
        this.loop = this.loop.bind(this);
        requestAnimationFrame(this.loop);
    }

    clearAllTimers() {
        if (this.cpuTimeout) {
            clearTimeout(this.cpuTimeout);
            this.cpuTimeout = null;
        }
        if (this.turnTimeout) {
            clearTimeout(this.turnTimeout);
            this.turnTimeout = null;
        }
        if (this.winTimeout) {
            clearTimeout(this.winTimeout);
            this.winTimeout = null;
        }
        if (this.cpuChargeInterval) {
            clearInterval(this.cpuChargeInterval);
            this.cpuChargeInterval = null;
        }
    }

    initStars() {
        this.stars = [];
        for (let i = 0; i < 60; i++) {
            this.stars.push({
                x: Math.random() * this.width,
                y: Math.random() * (this.height - 60),
                size: Math.random() > 0.7 ? 2 : 1,
                color: Math.random() > 0.5 ? '#ffffff' : (Math.random() > 0.5 ? '#ffeaa7' : '#74b9ff'),
                alpha: Math.random() * 0.7 + 0.3,
                twinkleSpeed: (Math.random() * 0.03 + 0.01) * (Math.random() > 0.5 ? 1 : -1)
            });
        }
    }

    initSakuraPetals() {
        this.sakuraPetals = [];
        for (let i = 0; i < 16; i++) {
            this.sakuraPetals.push({
                x: 340 + Math.random() * 120,
                y: 160 + Math.random() * 220,
                speedY: 0.4 + Math.random() * 0.6,
                speedX: (Math.random() - 0.5) * 0.4,
                rot: Math.random() * Math.PI * 2,
                rotSpeed: (Math.random() - 0.5) * 0.04,
                size: 3 + Math.random() * 3,
                alpha: 0.6 + Math.random() * 0.4
            });
        }
    }

    bindEvents() {
        const btnStart = document.getElementById('btn-start-game');
        if (btnStart) {
            btnStart.addEventListener('click', () => this.startGameFromModal());
        }

        const btnConfig = document.getElementById('btn-game-config');
        if (btnConfig) {
            btnConfig.addEventListener('click', () => this.showStartModal());
        }

        const btnReset = document.getElementById('btn-game-reset');
        if (btnReset) {
            btnReset.addEventListener('click', () => this.resetGameDirectly());
        }

        const btnCloseModal = document.getElementById('btn-close-modal');
        if (btnCloseModal) {
            btnCloseModal.addEventListener('click', () => this.hideStartModal());
        }

        const btnPlayAgain = document.getElementById('btn-play-again');
        if (btnPlayAgain) {
            btnPlayAgain.addEventListener('click', () => {
                const winModal = document.getElementById('game-win-modal');
                if (winModal) winModal.classList.add('hidden');
                this.resetGameDirectly();
            });
        }

        const chargeBtn = document.getElementById('btn-game-charge');
        const handleStartCharge = (e) => {
            if (e && e.cancelable && e.type !== 'mousedown') e.preventDefault();
            this.startCharging();
        };
        const handleEndCharge = (e) => {
            if (this.isCharging) {
                this.releaseAndFire();
                if (e && e.cancelable && e.type !== 'mouseup') e.preventDefault();
            }
        };

        if (chargeBtn) {
            chargeBtn.addEventListener('pointerdown', handleStartCharge);
        }

        window.addEventListener('pointerup', handleEndCharge);
        window.addEventListener('pointercancel', handleEndCharge);

        // Canvas 點擊/長按支援
        if (this.canvas) {
            this.canvas.addEventListener('pointerdown', handleStartCharge);
        }

        // 鍵盤空白鍵支援
        window.addEventListener('keydown', (e) => {
            if (e.code === 'Space' && !e.repeat && document.getElementById('sec-game') && !document.getElementById('sec-game').classList.contains('hidden')) {
                const startModal = document.getElementById('game-start-modal');
                const winModal = document.getElementById('game-win-modal');
                if ((!startModal || startModal.classList.contains('hidden')) && (!winModal || winModal.classList.contains('hidden'))) {
                    e.preventDefault();
                    this.startCharging();
                }
            }
        });
        window.addEventListener('keyup', (e) => {
            if (e.code === 'Space') {
                if (this.isCharging) {
                    this.releaseAndFire();
                }
            }
        });
    }

    showStartModal() {
        this.clearAllTimers();
        this.isCharging = false;
        if (this.state === 'charging') this.state = 'idle';
        const chargeBtn = document.getElementById('btn-game-charge');
        if (chargeBtn) {
            chargeBtn.classList.remove('charging');
            chargeBtn.innerText = translations[currentLang]?.game_btn_charge || "🎯 長按蓄力發射";
        }
        const startModal = document.getElementById('game-start-modal');
        if (startModal) startModal.classList.remove('hidden');
    }

    hideStartModal() {
        const startModal = document.getElementById('game-start-modal');
        if (startModal) startModal.classList.add('hidden');
        if (this.mode === 'cpu' && this.currentTurn === 'yuelao' && this.state === 'idle') {
            this.clearAllTimers();
            this.cpuTimeout = setTimeout(() => this.runCpuTurn(), 700);
        }
    }

    resetGameDirectly() {
        this.clearAllTimers();
        this.cupidHP = 5;
        this.yuelaoHP = 5;
        this.currentTurn = this.firstPlayer;
        this.projectile = null;
        this.particles = [];
        this.state = 'idle';
        this.isCharging = false;
        this.power = 0;

        this.hideStartModal();
        const winModal = document.getElementById('game-win-modal');
        if (winModal) winModal.classList.add('hidden');
        const toast = document.getElementById('game-toast');
        if (toast) toast.classList.add('hidden');

        const chargeBtn = document.getElementById('btn-game-charge');
        if (chargeBtn) {
            chargeBtn.classList.remove('charging');
            chargeBtn.innerText = translations[currentLang]?.game_btn_charge || "🎯 長按蓄力發射";
        }

        this.updateHpDisplay();
        this.startNewTurn(false);
    }

    startGameFromModal() {
        this.clearAllTimers();
        const modeEl = document.querySelector('input[name="game-mode"]:checked');
        const firstEl = document.querySelector('input[name="game-first"]:checked');
        this.mode = modeEl ? modeEl.value : '2p';

        let first = firstEl ? firstEl.value : 'cupid';
        if (first === 'random') {
            first = Math.random() > 0.5 ? 'cupid' : 'yuelao';
        }
        this.firstPlayer = first;
        this.currentTurn = first;

        this.cupidHP = 5;
        this.yuelaoHP = 5;
        this.projectile = null;
        this.particles = [];
        this.state = 'idle';
        this.isCharging = false;
        this.power = 0;

        this.hideStartModal();
        const winModal = document.getElementById('game-win-modal');
        if (winModal) winModal.classList.add('hidden');
        const toast = document.getElementById('game-toast');
        if (toast) toast.classList.add('hidden');

        const chargeBtn = document.getElementById('btn-game-charge');
        if (chargeBtn) {
            chargeBtn.classList.remove('charging');
            chargeBtn.innerText = translations[currentLang]?.game_btn_charge || "🎯 長按蓄力發射";
        }

        this.updateHpDisplay();
        this.startNewTurn(false);
    }

    startNewTurn(switchTurn = true) {
        this.clearAllTimers();

        if (switchTurn) {
            this.currentTurn = this.currentTurn === 'cupid' ? 'yuelao' : 'cupid';
        }

        this.power = 0;
        this.isCharging = false;
        this.state = 'idle';

        // 隨機產生風向 (-3.5 ~ +3.5)
        this.wind = parseFloat(((Math.random() * 7) - 3.5).toFixed(1));
        this.updateHUD();

        const chargeBtn = document.getElementById('btn-game-charge');
        if (chargeBtn) {
            chargeBtn.classList.remove('charging');
            chargeBtn.innerText = translations[currentLang]?.game_btn_charge || "🎯 長按蓄力發射";
        }

        // 電腦回合自動計算發射
        if (this.mode === 'cpu' && this.currentTurn === 'yuelao' && this.state === 'idle') {
            this.cpuTimeout = setTimeout(() => this.runCpuTurn(), 700);
        }
    }

    startCharging() {
        if (this.state !== 'idle') return;
        if (this.mode === 'cpu' && this.currentTurn === 'yuelao') return;
        const secGame = document.getElementById('sec-game');
        if (!secGame || secGame.classList.contains('hidden')) return;
        const startModal = document.getElementById('game-start-modal');
        const winModal = document.getElementById('game-win-modal');
        if ((startModal && !startModal.classList.contains('hidden')) || (winModal && !winModal.classList.contains('hidden'))) {
            return;
        }

        this.state = 'charging';
        this.isCharging = true;
        this.power = 0;

        const chargeBtn = document.getElementById('btn-game-charge');
        if (chargeBtn) {
            chargeBtn.classList.add('charging');
            chargeBtn.innerText = translations[currentLang]?.game_btn_charging || "⚡ 蓄力中... 鬆開即射！";
        }
    }

    releaseAndFire() {
        if (this.state !== 'charging' || !this.isCharging) return;
        this.isCharging = false;

        const chargeBtn = document.getElementById('btn-game-charge');
        if (chargeBtn) {
            chargeBtn.classList.remove('charging');
            chargeBtn.innerText = translations[currentLang]?.game_btn_charge || "🎯 長按蓄力發射";
        }

        this.fireProjectile(this.power);
    }

    fireProjectile(powerValue) {
        this.state = 'flying';
        const isCupid = this.currentTurn === 'cupid';
        const char = isCupid ? this.cupid : this.yuelao;

        // 初速度校準 (0% -> 7.0, 50% -> 14.0, 100% -> 21.0)
        const speed = 7.0 + (Math.max(10, powerValue) / 100) * 14.0;
        // 邱比特向右 (vx > 0)，月老向左 (vx < 0)
        const vx = Math.cos(char.angle) * speed * (isCupid ? 1 : -1);
        const vy = -Math.sin(char.angle) * speed;

        this.projectile = {
            x: char.launchX,
            y: char.launchY,
            vx: vx,
            vy: vy,
            type: isCupid ? 'arrow' : 'ring',
            trail: []
        };
    }

    runCpuTurn() {
        if (this.state !== 'idle' || this.currentTurn !== 'yuelao') return;
        this.state = 'charging';
        this.isCharging = true;

        // 月老向左射：wind > 0 (向右吹/逆風) 需加力；wind < 0 (向左吹/順風) 需省力
        let idealPower = 51.0;
        if (this.wind > 0) {
            idealPower += this.wind * 6.0;
        } else {
            idealPower += this.wind * 3.1;
        }
        const jitter = (Math.random() * 6) - 3; // ±3% 誤差
        const targetPower = Math.min(100, Math.max(20, idealPower + jitter));

        let currentP = 0;
        if (this.cpuChargeInterval) clearInterval(this.cpuChargeInterval);
        this.cpuChargeInterval = setInterval(() => {
            if (this.state !== 'charging') {
                if (this.cpuChargeInterval) clearInterval(this.cpuChargeInterval);
                this.cpuChargeInterval = null;
                return;
            }
            currentP += 3.5;
            this.power = Math.min(targetPower, currentP);

            if (this.power >= targetPower) {
                if (this.cpuChargeInterval) clearInterval(this.cpuChargeInterval);
                this.cpuChargeInterval = null;
                this.isCharging = false;
                this.fireProjectile(this.power);
            }
        }, 30);
    }

    updateHUD() {
        const turnBadge = document.getElementById('game-turn-badge');
        if (turnBadge) {
            if (this.currentTurn === 'cupid') {
                turnBadge.innerText = translations[currentLang]?.game_turn_cupid || "🏹 邱比特的回合";
                turnBadge.style.background = "#ff4757";
            } else {
                turnBadge.innerText = translations[currentLang]?.game_turn_yuelao || "🪄 月老的回合";
                turnBadge.style.background = "#e84118";
            }
        }

        const windArrow = document.getElementById('wind-arrow');
        const windVal = document.getElementById('wind-value');
        if (windArrow && windVal) {
            if (this.wind > 0.1) {
                windArrow.innerText = "💨 ➡️";
            } else if (this.wind < -0.1) {
                windArrow.innerText = "⬅️ 💨";
            } else {
                windArrow.innerText = "💨 ⏸️";
            }
            windVal.innerText = Math.abs(this.wind).toFixed(1);
        }
    }

    updateHpDisplay() {
        const cupidBar = document.getElementById('cupid-hp-bar');
        const yuelaoBar = document.getElementById('yuelao-hp-bar');

        if (cupidBar) {
            cupidBar.innerHTML = '';
            for (let i = 0; i < 5; i++) {
                const span = document.createElement('span');
                span.className = 'hp-item' + (i >= this.cupidHP ? ' lost' : ' active');
                span.innerText = '🏹';
                cupidBar.appendChild(span);
            }
        }

        if (yuelaoBar) {
            yuelaoBar.innerHTML = '';
            for (let i = 0; i < 5; i++) {
                const span = document.createElement('span');
                span.className = 'hp-item' + (i >= this.yuelaoHP ? ' lost' : ' active');
                span.innerText = '🪄';
                yuelaoBar.appendChild(span);
            }
        }
    }

    showToast(msgKey) {
        const toast = document.getElementById('game-toast');
        if (!toast) return;
        const msg = translations[currentLang]?.[msgKey] || msgKey;
        toast.innerText = msg;
        toast.classList.remove('hidden');

        toast.style.animation = 'none';
        toast.offsetHeight;
        toast.style.animation = null;

        setTimeout(() => {
            if (toast) toast.classList.add('hidden');
        }, 900);
    }

    onHit(target) {
        this.shakeTimer = 16;
        if (target === 'yuelao') {
            this.yuelaoHP = Math.max(0, this.yuelaoHP - 1);
            this.showToast('game_hit_msg');
            this.spawnExplosion(this.yuelao.x, this.yuelao.y, '💖');
        } else if (target === 'cupid') {
            this.cupidHP = Math.max(0, this.cupidHP - 1);
            this.showToast('game_hit_msg');
            this.spawnExplosion(this.cupid.x, this.cupid.y, '⭕');
        }

        this.updateHpDisplay();

        if (this.cupidHP <= 0 || this.yuelaoHP <= 0) {
            this.state = 'gameover';
            const winner = this.cupidHP > 0 ? 'cupid' : 'yuelao';
            this.winTimeout = setTimeout(() => this.triggerVictory(winner), 1000);
        } else {
            this.turnTimeout = setTimeout(() => this.startNewTurn(true), 1100);
        }
    }

    onBlocked() {
        this.showToast('game_blocked_msg');
        if (this.projectile) {
            this.spawnExplosion(this.projectile.x, this.projectile.y, '✨');
        }
        this.turnTimeout = setTimeout(() => this.startNewTurn(true), 900);
    }

    onMiss() {
        this.showToast('game_miss_msg');
        if (this.projectile) {
            this.spawnExplosion(this.projectile.x, Math.min(380, this.projectile.y), '▪');
        }
        this.turnTimeout = setTimeout(() => this.startNewTurn(true), 900);
    }

    spawnExplosion(x, y, symbol) {
        for (let i = 0; i < 24; i++) {
            const angle = Math.random() * Math.PI * 2;
            const spd = 2 + Math.random() * 5;
            this.particles.push({
                x: x,
                y: y,
                vx: Math.cos(angle) * spd,
                vy: Math.sin(angle) * spd - 1.5,
                symbol: symbol,
                alpha: 1,
                life: 35 + Math.random() * 15
            });
        }
    }

    triggerVictory(winner) {
        const winModal = document.getElementById('game-win-modal');
        const titleEl = document.getElementById('win-title');
        const descEl = document.getElementById('win-desc');

        if (titleEl && descEl && winModal) {
            if (winner === 'cupid') {
                titleEl.innerText = translations[currentLang]?.game_win_cupid || "🎉 愛神邱比特獲勝！";
                descEl.innerText = translations[currentLang]?.game_win_cupid_desc || "💘 金箭穿心，邱比特為新人締結浪漫良緣！";
            } else {
                titleEl.innerText = translations[currentLang]?.game_win_yuelao || "🎉 月老爺爺獲勝！";
                descEl.innerText = translations[currentLang]?.game_win_yuelao_desc || "⭕ 千里姻緣一線牽，月老將兩人牢牢結下良緣！";
            }
            winModal.classList.remove('hidden');
        }
    }

    updateLanguageTexts() {
        this.updateHUD();
        this.updateHpDisplay();
    }

    updatePhysics(dt) {
        // 蓄力處理
        if (this.state === 'charging' && this.isCharging) {
            this.power += this.chargeSpeed * (dt / 1000);
            if (this.power >= 100) {
                this.power = 100;
                this.releaseAndFire();
            }
        }

        // 飛行物理更新
        if (this.state === 'flying' && this.projectile) {
            const p = this.projectile;
            p.trail.push({ x: p.x, y: p.y, alpha: 0.8 });
            if (p.trail.length > 15) p.trail.shift();

            // 風力與重力加速度
            p.vx += this.wind * 0.022;
            p.vy += 0.36; // 重力加速度
            p.x += p.vx;
            p.y += p.vy;

            // 碰撞判定 1: 緣分神木阻隔 (高度縮小0.8倍，更易越過)
            if (p.x >= this.tree.x && p.x <= this.tree.x + this.tree.width && p.y >= this.tree.y) {
                this.projectile = null;
                this.onBlocked();
                return;
            }

            // 碰撞判定 2: 月老被命中 (由邱比特射出，朝右飛)
            if (p.type === 'arrow') {
                if (Math.abs(p.x - this.yuelao.x) <= 30 && p.y >= this.yuelao.y - 45 && p.y <= this.yuelao.y + 25) {
                    this.projectile = null;
                    this.onHit('yuelao');
                    return;
                }
            }

            // 碰撞判定 3: 邱比特被命中 (由月老射出，朝左飛)
            if (p.type === 'ring') {
                if (Math.abs(p.x - this.cupid.x) <= 30 && p.y >= this.cupid.y - 45 && p.y <= this.cupid.y + 25) {
                    this.projectile = null;
                    this.onHit('cupid');
                    return;
                }
            }

            // 碰撞判定 4: 掉落地面或出界
            if (p.y >= 385 || p.x < -40 || p.x > this.width + 40 || p.y > this.height + 40) {
                this.projectile = null;
                this.onMiss();
                return;
            }
        }

        // 粒子更新
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const pt = this.particles[i];
            pt.x += pt.vx;
            pt.y += pt.vy;
            pt.vy += 0.15;
            pt.life--;
            pt.alpha = pt.life / 50;
            if (pt.life <= 0) {
                this.particles.splice(i, 1);
            }
        }

        // 星星閃爍
        this.stars.forEach(st => {
            st.alpha += st.twinkleSpeed;
            if (st.alpha > 0.9 || st.alpha < 0.2) st.twinkleSpeed = -st.twinkleSpeed;
        });

        // 飄落櫻花瓣動態
        this.sakuraPetals.forEach(p => {
            p.y += p.speedY;
            p.x += p.speedX + (this.wind * 0.08);
            p.rot += p.rotSpeed;
            if (p.y > 385) {
                p.y = 155 + Math.random() * 20;
                p.x = 340 + Math.random() * 120;
            }
            if (p.x < 280) p.x = 500;
            if (p.x > 520) p.x = 300;
        });

        if (this.shakeTimer > 0) this.shakeTimer--;
    }

    render() {
        const ctx = this.ctx;
        this.time = performance.now();
        ctx.save();

        if (this.shakeTimer > 0) {
            const dx = (Math.random() - 0.5) * this.shakeTimer * 0.8;
            const dy = (Math.random() - 0.5) * this.shakeTimer * 0.8;
            ctx.translate(dx, dy);
        }

        // 1. 背景與夜空漸層
        const bgGrad = ctx.createLinearGradient(0, 0, this.width, this.height);
        bgGrad.addColorStop(0, '#0c071e');
        bgGrad.addColorStop(0.5, '#12142e');
        bgGrad.addColorStop(1, '#230b1e');
        ctx.fillStyle = bgGrad;
        ctx.fillRect(0, 0, this.width, this.height);

        // 2. 繪製閃爍星星
        this.stars.forEach(st => {
            ctx.fillStyle = st.color;
            ctx.globalAlpha = Math.max(0.1, st.alpha);
            ctx.fillRect(st.x, st.y, st.size * 2, st.size * 2);
        });
        ctx.globalAlpha = 1;

        // 3. 地面景觀
        ctx.fillStyle = '#1e1428';
        ctx.fillRect(0, 385, this.width, 35);
        ctx.fillStyle = '#481d3b';
        ctx.fillRect(0, 380, this.width, 5);
        ctx.fillStyle = '#ff6b81';
        for (let i = 20; i < this.width; i += 40) {
            ctx.fillRect(i, 382, 3, 3);
        }

        // 4. 繪製唯美 16-bit 像素緣分櫻花神木 (Sakura Love Tree)
        this.drawPixelSakuraTree(ctx, this.time);

        // 5. 繪製角色像素插畫與雲朵
        const isCupidCharging = this.state === 'charging' && this.currentTurn === 'cupid';
        const isYuelaoCharging = this.state === 'charging' && this.currentTurn === 'yuelao';

        this.drawPixelCupid(ctx, this.cupid.x, this.cupid.y, this.time, isCupidCharging, this.currentTurn === 'cupid');
        this.drawPixelYueLao(ctx, this.yuelao.x, this.yuelao.y, this.time, isYuelaoCharging, this.currentTurn === 'yuelao');

        // 6. 繪製蓄力能量條
        if (this.state === 'charging') {
            const isCupid = this.currentTurn === 'cupid';
            const char = isCupid ? this.cupid : this.yuelao;
            this.drawPowerBar(ctx, char.x, char.y - 75, this.power);
        }

        // 7. 繪製拋物線武器
        if (this.projectile) {
            this.drawProjectile(ctx, this.projectile, this.time);
        }

        // 8. 繪製爆炸粒子
        this.particles.forEach(pt => {
            ctx.save();
            ctx.globalAlpha = Math.max(0, pt.alpha);
            ctx.font = '16px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(pt.symbol, pt.x, pt.y);
            ctx.restore();
        });

        ctx.restore();
    }

    // 🌸 唯美 16-bit 像素緣分櫻花神木 (高度已縮小 0.8 倍)
    drawPixelSakuraTree(ctx, time) {
        const tx = this.tree.x;
        const ty = this.tree.y;
        const tw = this.tree.width;
        const th = this.tree.height;
        const centerX = tx + tw / 2; // 400

        ctx.save();

        // 1. 櫻花外圍柔和粉紅星芒光暈
        const glowGrad = ctx.createRadialGradient(centerX, ty + 60, 20, centerX, ty + 60, 110);
        glowGrad.addColorStop(0, 'rgba(255, 118, 117, 0.25)');
        glowGrad.addColorStop(0.6, 'rgba(255, 182, 193, 0.12)');
        glowGrad.addColorStop(1, 'rgba(255, 118, 117, 0)');
        ctx.fillStyle = glowGrad;
        ctx.beginPath();
        ctx.arc(centerX, ty + 60, 110, 0, Math.PI * 2);
        ctx.fill();

        // 2. 盤根與神木樹幹 (Ancient Trunk & Roots)
        // 樹根底部
        ctx.fillStyle = '#2d1d16';
        ctx.fillRect(centerX - 24, 370, 48, 15);
        ctx.fillRect(centerX - 30, 378, 60, 7);

        // 主樹幹
        ctx.fillStyle = '#3e2723';
        ctx.fillRect(centerX - 14, ty + 75, 28, th - 75);
        ctx.fillStyle = '#5d4037';
        ctx.fillRect(centerX - 10, ty + 75, 14, th - 75);
        ctx.fillStyle = '#795548';
        ctx.fillRect(centerX - 6, ty + 80, 8, th - 85);

        // 樹枝向左右延伸
        ctx.fillStyle = '#4e342e';
        ctx.fillRect(centerX - 26, ty + 65, 16, 12);
        ctx.fillRect(centerX + 10, ty + 65, 16, 12);
        ctx.fillRect(centerX - 32, ty + 50, 14, 16);
        ctx.fillRect(centerX + 18, ty + 50, 14, 16);

        // 3. 蓬鬆盛開櫻花樹冠 (Layered Sakura Blossom Canopy)
        const sway = Math.sin(time * 0.003) * 2;

        // 樹冠底層陰影花團
        ctx.fillStyle = '#c2185b';
        ctx.beginPath();
        ctx.arc(centerX - 28 + sway, ty + 48, 26, 0, Math.PI * 2);
        ctx.arc(centerX + 28 + sway, ty + 48, 26, 0, Math.PI * 2);
        ctx.arc(centerX + sway, ty + 30, 36, 0, Math.PI * 2);
        ctx.fill();

        // 樹冠主花團 (粉嫩櫻花色)
        ctx.fillStyle = '#ff4081';
        ctx.beginPath();
        ctx.arc(centerX - 24 + sway, ty + 42, 24, 0, Math.PI * 2);
        ctx.arc(centerX + 24 + sway, ty + 42, 24, 0, Math.PI * 2);
        ctx.arc(centerX + sway, ty + 24, 32, 0, Math.PI * 2);
        ctx.fill();

        // 樹冠亮層粉白花瓣
        ctx.fillStyle = '#ff80ab';
        ctx.beginPath();
        ctx.arc(centerX - 16 + sway, ty + 34, 18, 0, Math.PI * 2);
        ctx.arc(centerX + 16 + sway, ty + 34, 18, 0, Math.PI * 2);
        ctx.arc(centerX + sway, ty + 15, 24, 0, Math.PI * 2);
        ctx.fill();

        // 頂部高光花簇
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(centerX - 8 + sway, ty + 12, 10, 0, Math.PI * 2);
        ctx.arc(centerX + 8 + sway, ty + 12, 10, 0, Math.PI * 2);
        ctx.fill();

        // 4. 懸掛許願祈福紅繩與愛心果實 (Wish Talismans)
        ctx.fillStyle = '#ff3838';
        ctx.fillRect(centerX - 20, ty + 70, 3, 16);
        ctx.fillRect(centerX + 18, ty + 68, 3, 18);
        ctx.fillStyle = '#ffd32a';
        ctx.beginPath();
        ctx.arc(centerX - 18.5, ty + 88, 4, 0, Math.PI * 2);
        ctx.arc(centerX + 19.5, ty + 88, 4, 0, Math.PI * 2);
        ctx.fill();

        // 5. 飄落櫻花瓣動畫 (Drifting Sakura Petals)
        this.sakuraPetals.forEach(p => {
            ctx.save();
            ctx.translate(p.x, p.y);
            ctx.rotate(p.rot);
            ctx.fillStyle = `rgba(255, 182, 193, ${p.alpha})`;
            ctx.beginPath();
            ctx.ellipse(0, 0, p.size, p.size * 0.55, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        });

        // 6. 頂部神木標記
        ctx.fillStyle = '#ffeaa7';
        ctx.font = 'bold 12px DotGothic16, monospace';
        ctx.textAlign = 'center';
        ctx.shadowColor = '#000';
        ctx.shadowBlur = 3;
        ctx.fillText('🌸 緣分神木 🌸', centerX, ty - 10);
        ctx.shadowBlur = 0;

        ctx.restore();
    }

    // 👼 純手繪 16-bit 像素愛神邱比特
    drawPixelCupid(ctx, cx, cy, time, isCharging, isCurrent) {
        ctx.save();
        const hover = Math.sin(time * 0.004) * 4;
        const wingFlap = Math.sin(time * 0.008) * 4;
        const x = cx;
        const y = cy + hover;

        // 當前輪到回合的光環
        if (isCurrent) {
            ctx.strokeStyle = '#ffd166';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(x, y - 10, 36, 0, Math.PI * 2);
            ctx.stroke();
        }

        // 1. 浮空白雲平台
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(x, y + 36, 32, 0, Math.PI * 2);
        ctx.arc(x - 22, y + 38, 22, 0, Math.PI * 2);
        ctx.arc(x + 22, y + 38, 22, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#ffccd5';
        ctx.beginPath();
        ctx.arc(x, y + 42, 18, 0, Math.PI);
        ctx.fill();

        // 2. 天使羽翼 (Pixel Wings)
        ctx.fillStyle = '#ffffff';
        // 左翅
        ctx.beginPath();
        ctx.ellipse(x - 24, y - 18 + wingFlap, 16, 8, -Math.PI / 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#dfe6e9';
        ctx.lineWidth = 2;
        ctx.stroke();
        // 右翅
        ctx.beginPath();
        ctx.ellipse(x + 14, y - 22 + wingFlap, 14, 7, Math.PI / 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // 3. 身體與托加袍 (Tunic)
        ctx.fillStyle = '#f8f9fa';
        ctx.fillRect(x - 12, y - 14, 24, 28);
        // 金色肩帶
        ctx.fillStyle = '#f1c40f';
        ctx.fillRect(x - 12, y - 14, 6, 28);
        ctx.fillRect(x - 12, y + 8, 24, 4);

        // 4. 頭部與金髮
        // 臉龐膚色
        ctx.fillStyle = '#ffd8b3';
        ctx.fillRect(x - 14, y - 36, 28, 24);
        // 腮紅
        ctx.fillStyle = '#ff7675';
        ctx.fillRect(x - 11, y - 20, 5, 3);
        ctx.fillRect(x + 6, y - 20, 5, 3);
        // 眼睛
        ctx.fillStyle = '#2d3436';
        ctx.fillRect(x - 9, y - 26, 4, 6);
        ctx.fillRect(x + 5, y - 26, 4, 6);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(x - 9, y - 26, 2, 2);
        ctx.fillRect(x + 5, y - 26, 2, 2);

        // 金色捲髮
        ctx.fillStyle = '#fed330';
        ctx.fillRect(x - 16, y - 44, 32, 12);
        ctx.fillRect(x - 18, y - 40, 6, 18);
        ctx.fillRect(x + 12, y - 40, 6, 18);
        // 頭頂金色光環 (Halo)
        ctx.strokeStyle = '#ffd32a';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.ellipse(x, y - 48, 16, 5, 0, 0, Math.PI * 2);
        ctx.stroke();

        // 5. 金色愛心弓與箭
        const bowPull = isCharging ? 6 : 0;
        ctx.strokeStyle = '#d35400';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(x + 18 - bowPull, y - 6, 18, -Math.PI / 3, Math.PI / 3);
        ctx.stroke();

        // 弓弦
        ctx.strokeStyle = '#ffeaa7';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(x + 27 - bowPull, y - 20);
        ctx.lineTo(x + 10 - (bowPull * 1.5), y - 6);
        ctx.lineTo(x + 27 - bowPull, y + 8);
        ctx.stroke();

        // 金箭箭頭（愛心）
        ctx.fillStyle = '#ff4757';
        ctx.beginPath();
        ctx.arc(x + 24, y - 6, 5, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }

    // 👴 純手繪 16-bit 像素東方月老
    drawPixelYueLao(ctx, yx, yy, time, isCharging, isCurrent) {
        ctx.save();
        const hover = Math.sin((time * 0.004) + 1.5) * 4;
        const x = yx;
        const y = yy + hover;

        // 當前輪到回合的光環
        if (isCurrent) {
            ctx.strokeStyle = '#ff4757';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(x, y - 10, 36, 0, Math.PI * 2);
            ctx.stroke();
        }

        // 1. 吉祥紅雲平台
        ctx.fillStyle = '#eb4d4b';
        ctx.beginPath();
        ctx.arc(x, y + 36, 32, 0, Math.PI * 2);
        ctx.arc(x - 22, y + 38, 22, 0, Math.PI * 2);
        ctx.arc(x + 22, y + 38, 22, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#f9ca24';
        ctx.beginPath();
        ctx.arc(x, y + 42, 18, 0, Math.PI);
        ctx.fill();

        // 2. 傳統深紅漢服長袍 (Red Robe)
        ctx.fillStyle = '#c0392b';
        ctx.fillRect(x - 14, y - 14, 28, 30);
        // 金色滾邊與雲紋
        ctx.fillStyle = '#f1c40f';
        ctx.fillRect(x - 14, y - 14, 28, 4);
        ctx.fillRect(x - 3, y - 10, 6, 26);
        ctx.fillRect(x - 14, y + 8, 28, 4);

        // 3. 頭部、白髮與長鬍鬚
        // 膚色
        ctx.fillStyle = '#ffeaa7';
        ctx.fillRect(x - 13, y - 36, 26, 24);
        // 和藹笑眼
        ctx.fillStyle = '#2d3436';
        ctx.fillRect(x - 9, y - 26, 4, 3);
        ctx.fillRect(x + 5, y - 26, 4, 3);
        // 腮紅
        ctx.fillStyle = '#ff7675';
        ctx.fillRect(x - 10, y - 20, 5, 3);
        ctx.fillRect(x + 5, y - 20, 5, 3);

        // 白髮頂髻與髮簪
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(x - 15, y - 44, 30, 10);
        ctx.fillRect(x - 6, y - 50, 12, 8);
        ctx.fillStyle = '#8e44ad';
        ctx.fillRect(x - 10, y - 48, 20, 3);

        // 白長鬍鬚 (Swaying Beard)
        const beardSway = Math.sin(time * 0.005) * 3;
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.moveTo(x - 11, y - 16);
        ctx.lineTo(x + 11, y - 16);
        ctx.lineTo(x + 6 + beardSway, y + 16);
        ctx.lineTo(x - 6 + beardSway, y + 16);
        ctx.closePath();
        ctx.fill();

        // 4. 龍頭木法杖 (Staff)
        ctx.fillStyle = '#795548';
        ctx.fillRect(x + 16, y - 30, 4, 52);
        // 法杖頂部翠綠明珠
        ctx.fillStyle = '#2ed573';
        ctx.beginPath();
        ctx.arc(x + 18, y - 32, 7, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#f1c40f';
        ctx.lineWidth = 2;
        ctx.stroke();

        // 5. 姻緣紅線圈 (Red Ring)
        const ringRot = (time * 0.005) % (Math.PI * 2);
        ctx.save();
        ctx.translate(x - 20, y - 10);
        ctx.rotate(ringRot);
        ctx.strokeStyle = '#ff4757';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(0, 0, 9, 0, Math.PI * 2);
        ctx.stroke();
        ctx.strokeStyle = '#ffd32a';
        ctx.lineWidth = 1.5;
        ctx.stroke();
        ctx.restore();

        ctx.restore();
    }

    // ⚡ 8-bit 復古像素蓄力能量條
    drawPowerBar(ctx, x, y, power) {
        const w = 84;
        const h = 16;
        const barX = x - w / 2;
        const barY = y;

        // 外部 8-bit 雙層邊框
        ctx.fillStyle = '#000000';
        ctx.fillRect(barX - 3, barY - 3, w + 6, h + 6);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(barX - 1, barY - 1, w + 2, h + 2);
        ctx.fillStyle = '#1e272e';
        ctx.fillRect(barX, barY, w, h);

        // 能量顏色動態漸層
        let color = '#2ed573';
        if (power > 40) color = '#ffa502';
        if (power > 75) color = '#ff6348';
        if (power > 90) color = '#ff4757';

        // 繪製充能內部條
        const fillW = Math.max(0, (w * power) / 100);
        ctx.fillStyle = color;
        ctx.fillRect(barX, barY, fillW, h);

        // 像素格線裝飾
        ctx.fillStyle = 'rgba(0,0,0,0.15)';
        for (let px = barX + 6; px < barX + fillW; px += 6) {
            ctx.fillRect(px, barY, 2, h);
        }

        // 百分比文字
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 12px DotGothic16, monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.shadowColor = '#000';
        ctx.shadowBlur = 3;
        ctx.fillText(`POWER ${Math.round(power)}%`, x, barY + h / 2);
        ctx.shadowBlur = 0;
    }

    // 🚀 繪製拋物線飛行武器 (金箭 / 紅繩圈)
    drawProjectile(ctx, p, time) {
        ctx.save();

        // 軌跡粒子殘影
        p.trail.forEach((tr, idx) => {
            const alpha = (idx / p.trail.length) * 0.7;
            ctx.fillStyle = p.type === 'arrow' ? `rgba(255, 215, 0, ${alpha})` : `rgba(255, 71, 87, ${alpha})`;
            ctx.beginPath();
            ctx.arc(tr.x, tr.y, p.type === 'arrow' ? 3 : 4, 0, Math.PI * 2);
            ctx.fill();
        });

        ctx.translate(p.x, p.y);

        if (p.type === 'arrow') {
            // 邱比特金色愛心箭
            const rotAngle = Math.atan2(p.vy, p.vx);
            ctx.rotate(rotAngle);

            // 箭桿
            ctx.fillStyle = '#f39c12';
            ctx.fillRect(-14, -2, 28, 4);
            // 箭羽
            ctx.fillStyle = '#ecf0f1';
            ctx.fillRect(-16, -5, 6, 10);
            // 愛心箭頭
            ctx.fillStyle = '#ff4757';
            ctx.beginPath();
            ctx.arc(14, -2, 4, 0, Math.PI * 2);
            ctx.arc(14, 2, 4, 0, Math.PI * 2);
            ctx.lineTo(20, 0);
            ctx.fill();
        } else {
            // 月老姻緣紅線圈
            const spin = time * 0.01;
            ctx.rotate(spin);

            ctx.strokeStyle = '#ff4757';
            ctx.lineWidth = 4;
            ctx.beginPath();
            ctx.arc(0, 0, 10, 0, Math.PI * 2);
            ctx.stroke();

            ctx.strokeStyle = '#f1c40f';
            ctx.lineWidth = 1.5;
            ctx.stroke();
        }

        ctx.restore();
    }

    cleanupOnLeave() {
        this.clearAllTimers();
        this.isCharging = false;
        if (this.state === 'charging') this.state = 'idle';
        this.hideStartModal();
        const winModal = document.getElementById('game-win-modal');
        if (winModal) winModal.classList.add('hidden');
        const toast = document.getElementById('game-toast');
        if (toast) toast.classList.add('hidden');
        const chargeBtn = document.getElementById('btn-game-charge');
        if (chargeBtn) {
            chargeBtn.classList.remove('charging');
            chargeBtn.innerText = translations[currentLang]?.game_btn_charge || "🎯 長按蓄力發射";
        }
    }

    loop(time) {
        const dt = Math.min(50, time - this.lastTime);
        this.lastTime = time;

        const secGame = document.getElementById('sec-game');
        if (secGame && !secGame.classList.contains('hidden')) {
            this.updatePhysics(dt);
            this.render();
        }

        requestAnimationFrame(this.loop);
    }
}

function initLoveGame() {
    if (!window.lovePKGame) {
        window.lovePKGame = new LovePKGame();
    } else {
        window.lovePKGame.updateLanguageTexts();
        if (window.lovePKGame.state === 'gameover') {
            window.lovePKGame.resetGameDirectly();
        } else {
            window.lovePKGame.hideStartModal();
            const winModal = document.getElementById('game-win-modal');
            if (winModal) winModal.classList.add('hidden');
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    updateLanguage();
    initWeddingPhotos();
    setTimeout(() => { updateCarouselPosition(); }, 150);
});

window.addEventListener('load', () => {
    updateCarouselPosition();
});