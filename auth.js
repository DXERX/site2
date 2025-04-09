/**
 * auth.js - إدارة تسجيل الدخول والتسجيل
 */

// تسجيل مستخدم جديد
async function register(userData) {
    try {
        const response = await fetch('/api/auth/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(userData)
        });

        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message || 'فشل في التسجيل');
        }

        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        return data;
    } catch (error) {
        console.error('Register error:', error);
        throw error;
    }
}

// تسجيل الدخول
async function login(credentials) {
    try {
        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(credentials)
        });

        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message || 'فشل في تسجيل الدخول');
        }

        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        return data;
    } catch (error) {
        console.error('Login error:', error);
        throw error;
    }
}

// تسجيل الخروج
function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login.html';
}

// التحقق من حالة المصادقة
async function checkAuth() {
    const token = localStorage.getItem('token');
    if (!token) return null;

    try {
        const response = await fetch('/api/auth/verify', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            return JSON.parse(localStorage.getItem('user'));
        }
        return null;
    } catch (error) {
        console.error('Auth check error:', error);
        return null;
    }
}

// حماية المسارات
function protectRoute() {
    const publicRoutes = ['/login.html', '/register.html'];
    if (publicRoutes.includes(window.location.pathname)) return;

    if (!localStorage.getItem('token')) {
        window.location.href = '/login.html';
    }
}