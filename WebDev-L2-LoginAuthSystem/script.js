document.addEventListener('DOMContentLoaded', function () {
    const loginView = document.getElementById('login-view');
    const registerView = document.getElementById('register-view');
    const dashboardView = document.getElementById('dashboard-view');

    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');

    const loginIdentifier = document.getElementById('login-identifier');
    const loginPassword = document.getElementById('login-password');
    const loginError = document.getElementById('login-error');

    const regUsername = document.getElementById('reg-username');
    const regEmail = document.getElementById('reg-email');
    const regPassword = document.getElementById('reg-password');
    const regError = document.getElementById('reg-error');
    const regSuccess = document.getElementById('reg-success');

    const dashUsername = document.getElementById('dash-username');
    const infoUsername = document.getElementById('info-username');
    const infoEmail = document.getElementById('info-email');
    const infoTime = document.getElementById('info-time');

    const gotoRegister = document.getElementById('goto-register');
    const gotoLogin = document.getElementById('goto-login');
    const logoutBtn = document.getElementById('logout-btn');

    async function hashPassword(password) {
        const msgUint8 = new TextEncoder().encode(password);
        const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    }

    function getUsers() {
        const stored = localStorage.getItem('auth_users');
        if (!stored) return [];
        try {
            return JSON.parse(stored);
        } catch (e) {
            return [];
        }
    }

    function saveUsers(users) {
        localStorage.setItem('auth_users', JSON.stringify(users));
    }

    function getSession() {
        const stored = localStorage.getItem('auth_session');
        if (!stored) return null;
        try {
            return JSON.parse(stored);
        } catch (e) {
            return null;
        }
    }

    function setSession(sessionData) {
        localStorage.setItem('auth_session', JSON.stringify(sessionData));
    }

    function clearSession() {
        localStorage.removeItem('auth_session');
    }

    function showView(viewElement) {
        loginView.className = 'view view-hidden';
        registerView.className = 'view view-hidden';
        dashboardView.className = 'view view-hidden';
        viewElement.className = 'view view-active';
        hideAlerts();
    }

    function hideAlerts() {
        loginError.style.display = 'none';
        regError.style.display = 'none';
        regSuccess.style.display = 'none';
    }

    function checkRouter() {
        const session = getSession();
        if (session) {
            dashUsername.textContent = session.username;
            infoUsername.textContent = session.username;
            infoEmail.textContent = session.email;
            infoTime.textContent = session.loginTime;
            showView(dashboardView);
        } else {
            showView(loginView);
        }
    }

    gotoRegister.addEventListener('click', function (e) {
        e.preventDefault();
        showView(registerView);
    });

    gotoLogin.addEventListener('click', function (e) {
        e.preventDefault();
        showView(loginView);
    });

    registerForm.addEventListener('submit', async function (e) {
        e.preventDefault();
        hideAlerts();

        const username = regUsername.value.trim();
        const email = regEmail.value.trim().toLowerCase();
        const password = regPassword.value;

        if (!username || !email || !password) {
            regError.textContent = 'All fields are required.';
            regError.style.display = 'block';
            return;
        }

        if (username.length < 3) {
            regError.textContent = 'Username must be at least 3 characters long.';
            regError.style.display = 'block';
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            regError.textContent = 'Please enter a valid email address.';
            regError.style.display = 'block';
            return;
        }

        if (password.length < 8) {
            regError.textContent = 'Password must be at least 8 characters long.';
            regError.style.display = 'block';
            return;
        }

        if (!/\d/.test(password)) {
            regError.textContent = 'Password must contain at least 1 number.';
            regError.style.display = 'block';
            return;
        }

        const users = getUsers();

        const duplicateUser = users.find(u => u.username.toLowerCase() === username.toLowerCase());
        if (duplicateUser) {
            regError.textContent = 'Username already exists. Please choose another.';
            regError.style.display = 'block';
            return;
        }

        const duplicateEmail = users.find(u => u.email.toLowerCase() === email);
        if (duplicateEmail) {
            regError.textContent = 'Email address is already registered.';
            regError.style.display = 'block';
            return;
        }

        const hashedPassword = await hashPassword(password);

        users.push({
            username: username,
            email: email,
            passwordHash: hashedPassword,
            registeredAt: new Date().toLocaleString()
        });

        saveUsers(users);

        regSuccess.textContent = 'Registration successful! Redirecting to login...';
        regSuccess.style.display = 'block';
        registerForm.reset();

        setTimeout(() => {
            showView(loginView);
        }, 1500);
    });

    loginForm.addEventListener('submit', async function (e) {
        e.preventDefault();
        hideAlerts();

        const identifier = loginIdentifier.value.trim().toLowerCase();
        const password = loginPassword.value;

        if (!identifier || !password) {
            loginError.textContent = 'Please enter both username/email and password.';
            loginError.style.display = 'block';
            return;
        }

        const users = getUsers();
        const user = users.find(u => u.username.toLowerCase() === identifier || u.email.toLowerCase() === identifier);

        if (!user) {
            loginError.textContent = 'Invalid username/email or password.';
            loginError.style.display = 'block';
            return;
        }

        const inputHash = await hashPassword(password);
        if (inputHash !== user.passwordHash) {
            loginError.textContent = 'Invalid username/email or password.';
            loginError.style.display = 'block';
            return;
        }

        setSession({
            username: user.username,
            email: user.email,
            loginTime: new Date().toLocaleString()
        });

        loginForm.reset();
        checkRouter();
    });

    logoutBtn.addEventListener('click', function () {
        clearSession();
        checkRouter();
    });

    checkRouter();
});
