// بيانات وهمية للمزادات المميزة
const featuredAuctions = [
    {
        id: 1,
        title: "تويوتا كامري 2020",
        image: "images/cars/toyota-camry.jpg",
        price: "85,000 ر.س",
        endDate: "ينتهي في 2 يوم",
        bids: 12
    },
    {
        id: 2,
        title: "نيسان باترول 2021",
        image: "images/cars/nissan-patrol.jpg",
        price: "120,000 ر.س",
        endDate: "ينتهي في 5 يوم",
        bids: 8
    },
    {
        id: 3,
        title: "هيونداي سوناتا 2019",
        image: "images/cars/hyundai-sonata.jpg",
        price: "65,000 ر.س",
        endDate: "ينتهي في 1 يوم",
        bids: 5
    },
    {
        id: 4,
        title: "فورد إكسبلورر 2022",
        image: "images/cars/ford-explorer.jpg",
        price: "150,000 ر.س",
        endDate: "ينتهي في 3 يوم",
        bids: 15
    }
];

// عرض المزادات المميزة في الصفحة الرئيسية
document.addEventListener('DOMContentLoaded', function() {
    const featuredAuctionsGrid = document.getElementById('featuredAuctions');
    
    if (featuredAuctionsGrid) {
        featuredAuctions.forEach(auction => {
            const auctionItem = document.createElement('div');
            auctionItem.className = 'auction-item';
            auctionItem.innerHTML = `
                <img src="${auction.image}" alt="${auction.title}">
                <div class="auction-info">
                    <h3>${auction.title}</h3>
                    <p><i class="fas fa-tag"></i> السعر الحالي: ${auction.price}</p>
                    <p><i class="fas fa-clock"></i> ${auction.endDate}</p>
                    <p><i class="fas fa-gavel"></i> عدد المزايدات: ${auction.bids}</p>
                    <a href="car-details.html?id=${auction.id}" class="btn primary">عرض التفاصيل</a>
                </div>
            `;
            featuredAuctionsGrid.appendChild(auctionItem);
        });
    }
});

// تسجيل الدخول
const loginForm = document.getElementById('loginForm');
if (loginForm) {
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        
        // هنا يمكنك إضافة التحقق من البيانات وإرسالها للخادم
        alert('تم تسجيل الدخول بنجاح!');
        window.location.href = 'index.html';
    });
}

// التسجيل
const registerForm = document.getElementById('registerForm');
if (registerForm) {
    registerForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const fullName = document.getElementById('fullName').value;
        const email = document.getElementById('email').value;
        const phone = document.getElementById('phone').value;
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        
        if (password !== confirmPassword) {
            alert('كلمة المرور غير متطابقة!');
            return;
        }
        
        // هنا يمكنك إضافة التحقق من البيانات وإرسالها للخادم
        alert('تم إنشاء الحساب بنجاح!');
        window.location.href = 'login.html';
    });
}