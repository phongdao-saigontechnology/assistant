// Main application controller
class App {
  constructor() {
    this.currentView = 'dashboard';
    this.init();
  }

  init() {
    this.setupNavigation();
    this.loadInitialView();
  }

  setupNavigation() {
    // Update active nav links
    document.addEventListener('click', (e) => {
      if (e.target.matches('.nav-link')) {
        this.updateActiveNavLink(e.target);
      }
    });
  }

  updateActiveNavLink(clickedLink) {
    // Remove active class from all nav links
    document.querySelectorAll('.nav-link').forEach(link => {
      link.classList.remove('active');
    });
    
    // Add active class to clicked link
    clickedLink.classList.add('active');
  }

  loadInitialView() {
    if (auth.isAuthenticated()) {
      showDashboard();
    } else {
      this.showWelcome();
    }
  }

  showWelcome() {
    document.getElementById('main-content').innerHTML = `
      <div class="d-flex justify-content-center align-items-center" style="height: 60vh;">
        <div class="text-center">
          <div class="mb-4">
            <i class="fas fa-comments fa-5x text-primary"></i>
          </div>
          <h1 class="display-4 mb-3">Internal Communications Assistant</h1>
          <p class="lead text-muted mb-4">
            AI-powered platform for creating clear, on-brand internal messages quickly and at scale
          </p>
          <div class="row justify-content-center">
            <div class="col-md-8">
              <div class="card">
                <div class="card-body">
                  <h5 class="card-title">Key Features</h5>
                  <div class="row">
                    <div class="col-md-6">
                      <ul class="list-unstyled">
                        <li><i class="fas fa-robot text-primary"></i> AI-powered writing support</li>
                        <li><i class="fas fa-file-alt text-primary"></i> Template library</li>
                        <li><i class="fas fa-palette text-primary"></i> Brand consistency</li>
                      </ul>
                    </div>
                    <div class="col-md-6">
                      <ul class="list-unstyled">
                        <li><i class="fas fa-plug text-primary"></i> Platform integrations</li>
                        <li><i class="fas fa-users text-primary"></i> Team collaboration</li>
                        <li><i class="fas fa-chart-line text-primary"></i> Analytics & insights</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="mt-4">
            <button class="btn btn-primary btn-lg me-3" onclick="showLogin()">
              <i class="fas fa-sign-in-alt"></i> Login
            </button>
            <button class="btn btn-outline-primary btn-lg" onclick="showRegister()">
              <i class="fas fa-user-plus"></i> Get Started
            </button>
          </div>
        </div>
      </div>
    `;
  }
}

// Initialize the application first
const app = new App();

// Navigation functions
function showDashboard() {
  if (!auth.isAuthenticated()) {
    showAlert('Please login to access the dashboard', 'warning');
    showLogin();
    return;
  }
  app.currentView = 'dashboard';
  loadDashboard();
}

function showMessageComposer() {
  if (!auth.isAuthenticated()) {
    showAlert('Please login to create messages', 'warning');
    showLogin();
    return;
  }
  app.currentView = 'composer';
  loadMessageComposer();
}

function showMessages() {
  if (!auth.isAuthenticated()) {
    showAlert('Please login to view messages', 'warning');
    showLogin();
    return;
  }
  app.currentView = 'messages';
  loadMessages();
}

function showTemplates() {
  if (!auth.isAuthenticated()) {
    showAlert('Please login to view templates', 'warning');
    showLogin();
    return;
  }
  app.currentView = 'templates';
  loadTemplates();
}

function showGuidelines() {
  if (!auth.isAuthenticated()) {
    showAlert('Please login to view guidelines', 'warning');
    showLogin();
    return;
  }
  app.currentView = 'guidelines';
  loadGuidelines();
}

function showIntegrations() {
  if (!auth.isAuthenticated()) {
    showAlert('Please login to view integrations', 'warning');
    showLogin();
    return;
  }
  app.currentView = 'integrations';
  loadIntegrations();
}

function showSettings() {
  if (!auth.isAuthenticated()) {
    showAlert('Please login to access settings', 'warning');
    showLogin();
    return;
  }
  // Settings implementation would go here
  showAlert('Settings page coming soon!', 'info');
}

// Utility functions
function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
}

function formatRelativeTime(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);
  
  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;
  
  return date.toLocaleDateString();
}

function getToneClass(tone) {
  return `tone-${tone}`;
}

function getScoreClass(score) {
  if (score >= 8) return 'score-high';
  if (score >= 6) return 'score-medium';
  return 'score-low';
}

function truncateText(text, maxLength = 100) {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}

function copyToClipboard(text) {
  navigator.clipboard.writeText(text).then(() => {
    showAlert('Copied to clipboard!', 'success');
  }).catch(err => {
    console.error('Failed to copy: ', err);
    showAlert('Failed to copy to clipboard', 'danger');
  });
}

// Handle page refresh
window.addEventListener('beforeunload', () => {
  // Save current state if needed
});

// Handle browser back/forward buttons
window.addEventListener('popstate', (e) => {
  if (e.state && e.state.view) {
    // Restore view state
    switch (e.state.view) {
      case 'dashboard':
        showDashboard();
        break;
      case 'composer':
        showMessageComposer();
        break;
      case 'messages':
        showMessages();
        break;
      case 'templates':
        showTemplates();
        break;
      case 'guidelines':
        showGuidelines();
        break;
      case 'integrations':
        showIntegrations();
        break;
    }
  }
});