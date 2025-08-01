class AuthManager {
  constructor() {
    this.token = localStorage.getItem('token');
    this.user = JSON.parse(localStorage.getItem('user') || 'null');
    this.checkAuth();
  }

  checkAuth() {
    if (this.token && this.user) {
      this.showUserInfo();
      this.hideSidebar(false);
    } else {
      this.showLoginButton();
      this.hideSidebar(true);
    }
  }

  showUserInfo() {
    document.getElementById('user-info').classList.remove('d-none');
    document.getElementById('login-btn').classList.add('d-none');
    document.getElementById('user-name').textContent = this.user.name;
  }

  showLoginButton() {
    document.getElementById('user-info').classList.add('d-none');
    document.getElementById('login-btn').classList.remove('d-none');
  }

  hideSidebar(hide) {
    const sidebar = document.getElementById('sidebar');
    if (hide) {
      sidebar.style.display = 'none';
    } else {
      sidebar.style.display = 'block';
    }
  }

  async login(email, password) {
    try {
      showLoading();
      const response = await api.post('/auth/login', { email, password });
      
      this.token = response.token;
      this.user = response.user;
      
      localStorage.setItem('token', this.token);
      localStorage.setItem('user', JSON.stringify(this.user));
      
      this.checkAuth();
      hideLoading();
      hideModal('loginModal');
      showAlert('Login successful!', 'success');
      showDashboard();
      
    } catch (error) {
      hideLoading();
      showAlert(error.message || 'Login failed', 'danger');
    }
  }

  async register(userData) {
    try {
      showLoading();
      const response = await api.post('/auth/register', userData);
      
      this.token = response.token;
      this.user = response.user;
      
      localStorage.setItem('token', this.token);
      localStorage.setItem('user', JSON.stringify(this.user));
      
      this.checkAuth();
      hideLoading();
      hideModal('registerModal');
      showAlert('Registration successful!', 'success');
      showDashboard();
      
    } catch (error) {
      hideLoading();
      showAlert(error.message || 'Registration failed', 'danger');
    }
  }

  logout() {
    this.token = null;
    this.user = null;
    
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    this.checkAuth();
    showAlert('Logged out successfully', 'info');
    
    // Clear main content
    document.getElementById('main-content').innerHTML = `
      <div class="d-flex justify-content-center align-items-center" style="height: 50vh;">
        <div class="text-center">
          <h3>Welcome to Internal Communications Assistant</h3>
          <p class="text-muted">Please login to get started</p>
          <button class="btn btn-primary" onclick="showLogin()">Login</button>
        </div>
      </div>
    `;
  }

  getToken() {
    return this.token;
  }

  getUser() {
    return this.user;
  }

  isAuthenticated() {
    return !!(this.token && this.user);
  }
}

// Global auth instance
const auth = new AuthManager();

// Login functions
function showLogin() {
  hideModal('registerModal');
  showModal('loginModal');
}

function showRegister() {
  hideModal('loginModal');
  showModal('registerModal');
}

async function login() {
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  
  if (!email || !password) {
    showAlert('Please fill in all fields', 'warning');
    return;
  }
  
  await auth.login(email, password);
}

async function register() {
  const userData = {
    name: document.getElementById('regName').value,
    email: document.getElementById('regEmail').value,
    password: document.getElementById('regPassword').value,
    role: document.getElementById('role').value,
    department: document.getElementById('department').value,
    company: document.getElementById('company').value
  };
  
  // Validate required fields
  for (const [key, value] of Object.entries(userData)) {
    if (!value) {
      showAlert(`Please fill in the ${key} field`, 'warning');
      return;
    }
  }
  
  await auth.register(userData);
}

function logout() {
  auth.logout();
}

// Utility functions
function showModal(modalId) {
  if (typeof bootstrap === 'undefined') {
    console.error('Bootstrap is not loaded');
    return;
  }
  const modal = new bootstrap.Modal(document.getElementById(modalId));
  modal.show();
}

function hideModal(modalId) {
  if (typeof bootstrap === 'undefined') {
    console.error('Bootstrap is not loaded');
    return;
  }
  const modal = bootstrap.Modal.getInstance(document.getElementById(modalId));
  if (modal) {
    modal.hide();
  }
}

function showAlert(message, type = 'info') {
  const alertContainer = document.createElement('div');
  alertContainer.innerHTML = `
    <div class="alert alert-${type} alert-dismissible fade show" role="alert">
      ${message}
      <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    </div>
  `;
  
  // Insert at the top of main content
  const mainContent = document.getElementById('main-content');
  mainContent.insertBefore(alertContainer, mainContent.firstChild);
  
  // Auto-dismiss after 5 seconds
  setTimeout(() => {
    if (alertContainer.parentNode) {
      alertContainer.remove();
    }
  }, 5000);
}

function showLoading() {
  const loading = document.createElement('div');
  loading.id = 'loading-overlay';
  loading.className = 'loading-overlay';
  loading.innerHTML = `
    <div class="loading-spinner">
      <i class="fas fa-spinner fa-spin"></i>
    </div>
  `;
  document.body.appendChild(loading);
}

function hideLoading() {
  const loading = document.getElementById('loading-overlay');
  if (loading) {
    loading.remove();
  }
}