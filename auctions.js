/**
 * ملف auctions.js - نظام إدارة المزادات الكامل
 * يتضمن:
 * - إدارة المزادات
 * - نظام المزايدة
 * - عدادات تنازلية
 * - إدارة المستخدمين
 */

// ===== المتغيرات العامة =====
let auctions = []; // جميع المزادات
let userBids = {}; // المزايدات لكل مستخدم
let activeTimers = {}; // المؤقتات النشطة
let currentUser = null; // المستخدم الحالي
let socket = null; // اتصال Socket للبث المباشر

// ===== تهيئة التطبيق =====
document.addEventListener('DOMContentLoaded', function() {
    initApp();
});

async function initApp() {
    await checkAuthStatus();
    await loadAuctions();
    setupSocketConnection();
    setupEventListeners();
    
    if (isAuctionDetailPage()) {
        const auctionId = getAuctionIdFromURL();
        await loadAuctionDetails(auctionId);
    }
}

// ===== إدارة المزادات =====
async function loadAuctions() {
    try {
        const response = await fetch('/api/auctions');
        auctions = await response.json();
        renderAuctions();
        startAllTimers();
    } catch (error) {
        console.error('خطأ في تحميل المزادات:', error);
        showNotification('فشل تحميل المزادات', 'error');
    }
}

function renderAuctions() {
    const container = document.getElementById('auctions-container');
    if (!container) return;

    container.innerHTML = auctions.map(auction => `
        <div class="auction-card" data-id="${auction.id}">
            <img src="${auction.imageUrl}" alt="${auction.title}">
            <div class="auction-info">
                <h3>${auction.title}</h3>
                <p class="description">${auction.description}</p>
                <div class="price-section">
                    <span class="current-price">${formatPrice(auction.currentPrice)} ر.س</span>
                    ${auction.bidsCount > 0 ? 
                        `<span class="bids">(${auction.bidsCount} مزايدة)</span>` : ''}
                </div>
                <div class="time-left" data-end="${auction.endTime}">
                    ${calculateTimeLeft(auction.endTime)}
                </div>
                <button class="bid-btn" onclick="openBidModal(${auction.id})">
                    تقديم مزايدة
                </button>
            </div>
        </div>
    `).join('');
}

// ===== نظام المزايدة =====
async function placeBid(auctionId, bidAmount) {
    if (!currentUser) {
        showLoginModal();
        return false;
    }

    try {
        const response = await fetch('/api/bids', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({
                auctionId,
                amount: bidAmount
            })
        });

        if (response.ok) {
            const result = await response.json();
            updateAuctionUI(auctionId, result.newPrice, result.bidsCount);
            showNotification('تم تقديم المزايدة بنجاح', 'success');
            return true;
        } else {
            const error = await response.json();
            showNotification(error.message || 'فشل في المزايدة', 'error');
            return false;
        }
    } catch (error) {
        console.error('خطأ في المزايدة:', error);
        showNotification('حدث خطأ أثناء المزايدة', 'error');
        return false;
    }
}

function updateAuctionUI(auctionId, newPrice, bidsCount) {
    // تحديث الواجهة مباشرة
    const priceElement = document.querySelector(`.auction-card[data-id="${auctionId}"] .current-price`);
    const bidsElement = document.querySelector(`.auction-card[data-id="${auctionId}"] .bids`);
    
    if (priceElement) priceElement.textContent = `${formatPrice(newPrice)} ر.س`;
    if (bidsElement) bidsElement.textContent = `(${bidsCount} مزايدة)`;
}

// ===== المؤقتات التنازلية =====
function startAllTimers() {
    auctions.forEach(auction => {
        startTimer(auction.id, auction.endTime);
    });
}

function startTimer(auctionId, endTime) {
    if (activeTimers[auctionId]) {
        clearInterval(activeTimers[auctionId]);
    }

    updateTimerDisplay(auctionId, endTime);
    
    activeTimers[auctionId] = setInterval(() => {
        updateTimerDisplay(auctionId, endTime);
    }, 1000);
}

function updateTimerDisplay(auctionId, endTime) {
    const timerElement = document.querySelector(`.auction-card[data-id="${auctionId}"] .time-left`);
    if (!timerElement) return;

    const timeLeft = calculateTimeLeft(endTime);
    timerElement.textContent = timeLeft;

    if (new Date(endTime) <= new Date()) {
        clearInterval(activeTimers[auctionId]);
        timerElement.innerHTML = '<span class="ended">انتهى المزاد</span>';
        disableBidButton(auctionId);
    }
}

// ===== أدوات مساعدة =====
function formatPrice(price) {
    return new Intl.NumberFormat('ar-SA').format(price);
}

function calculateTimeLeft(endTime) {
    const end = new Date(endTime);
    const now = new Date();
    const diff = end - now;

    if (diff <= 0) return 'انتهى المزاد';

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    return `متبقي: ${days} يوم ${hours} ساعة ${minutes} دقيقة`;
}

// ===== إدارة الأحداث =====
function setupEventListeners() {
    // أحداث عامة
    document.addEventListener('click', handleGlobalClicks);
    
    // أحداث النماذج
    const bidForm = document.getElementById('bidForm');
    if (bidForm) {
        bidForm.addEventListener('submit', handleBidSubmit);
    }
}

function handleBidSubmit(e) {
    e.preventDefault();
    const auctionId = parseInt(this.dataset.auctionId);
    const bidAmount = parseFloat(document.getElementById('bidAmount').value);
    
    placeBid(auctionId, bidAmount)
        .then(success => {
            if (success) this.reset();
        });
}

// ===== اتصال Socket للبث المباشر =====
function setupSocketConnection() {
    socket = io.connect('https://your-auction-server.com');
    
    socket.on('newBid', (data) => {
        if (data.auctionId === getCurrentAuctionId()) {
            updateAuctionUI(data.auctionId, data.newPrice, data.bidsCount);
            showNotification(`تمت مزايدة جديدة بمبلغ ${formatPrice(data.newPrice)} ر.س`, 'info');
        }
    });
    
    socket.on('auctionEnded', (auctionId) => {
        if (auctionId === getCurrentAuctionId()) {
            showNotification('انتهى المزاد', 'warning');
            disableBidButton(auctionId);
        }
    });
}

// ===== التصدير للاستخدام في ملفات أخرى =====
window.auctionModule = {
    placeBid,
    loadAuctionDetails,
    openBidModal,
    // ... تصدير الدوال الأخرى التي تحتاجها
};