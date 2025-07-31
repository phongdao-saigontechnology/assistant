async function loadDashboard() {
  try {
    showLoading();
    
    // Fetch dashboard data
    const [messages, templates, guidelines] = await Promise.all([
      messageAPI.getAll({ limit: 5 }).catch(() => ({ messages: [], total: 0 })),
      templateAPI.getPopular().catch(() => []),
      guidelinesAPI.getActive().catch(() => null)
    ]);

    const user = auth.getUser();
    
    document.getElementById('main-content').innerHTML = `
      <div class="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
        <h1 class="h2">Dashboard</h1>
        <div class="btn-toolbar mb-2 mb-md-0">
          <div class="btn-group me-2">
            <button type="button" class="btn btn-sm btn-primary" onclick="showMessageComposer()">
              <i class="fas fa-plus"></i> Create Message
            </button>
          </div>
        </div>
      </div>

      <div class="row mb-4">
        <div class="col-md-3">
          <div class="card card-stat">
            <div class="card-body">
              <div class="d-flex justify-content-between">
                <div>
                  <h6 class="card-title text-muted">Total Messages</h6>
                  <h3 class="mb-0">${messages.total || 0}</h3>
                </div>
                <div class="text-primary">
                  <i class="fas fa-envelope fa-2x"></i>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="card card-stat success">
            <div class="card-body">
              <div class="d-flex justify-content-between">
                <div>
                  <h6 class="card-title text-muted">Published</h6>
                  <h3 class="mb-0">${messages.messages?.filter(m => m.status === 'published').length || 0}</h3>
                </div>
                <div class="text-success">
                  <i class="fas fa-check-circle fa-2x"></i>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="card card-stat warning">
            <div class="card-body">
              <div class="d-flex justify-content-between">
                <div>
                  <h6 class="card-title text-muted">Drafts</h6>
                  <h3 class="mb-0">${messages.messages?.filter(m => m.status === 'draft').length || 0}</h3>
                </div>
                <div class="text-warning">
                  <i class="fas fa-edit fa-2x"></i>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="card card-stat danger">
            <div class="card-body">
              <div class="d-flex justify-content-between">
                <div>
                  <h6 class="card-title text-muted">Templates</h6>
                  <h3 class="mb-0">${templates.length || 0}</h3>
                </div>
                <div class="text-info">
                  <i class="fas fa-file-alt fa-2x"></i>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="row">
        <div class="col-md-8">
          <div class="card">
            <div class="card-header d-flex justify-content-between align-items-center">
              <h5 class="mb-0">Recent Messages</h5>
              <a href="#" onclick="showMessages()" class="btn btn-sm btn-outline-primary">View All</a>
            </div>
            <div class="card-body">
              ${renderRecentMessages(messages.messages || [])}
            </div>
          </div>
        </div>
        <div class="col-md-4">
          <div class="card">
            <div class="card-header">
              <h5 class="mb-0">Quick Actions</h5>
            </div>
            <div class="card-body">
              <div class="d-grid gap-2">
                <button class="btn btn-primary" onclick="showMessageComposer()">
                  <i class="fas fa-plus"></i> Create New Message
                </button>
                <button class="btn btn-outline-primary" onclick="showTemplates()">
                  <i class="fas fa-file-alt"></i> Browse Templates
                </button>
                <button class="btn btn-outline-primary" onclick="showGuidelines()">
                  <i class="fas fa-book"></i> View Guidelines
                </button>
                <button class="btn btn-outline-primary" onclick="showIntegrations()">
                  <i class="fas fa-plug"></i> Manage Integrations
                </button>
              </div>
            </div>
          </div>

          <div class="card mt-3">
            <div class="card-header">
              <h5 class="mb-0">Popular Templates</h5>
            </div>
            <div class="card-body">
              ${renderPopularTemplates(templates)}
            </div>
          </div>

          ${guidelines ? `
          <div class="card mt-3">
            <div class="card-header">
              <h5 class="mb-0">Active Guidelines</h5>
            </div>
            <div class="card-body">
              <h6>${guidelines.name}</h6>
              <p class="text-muted small">${guidelines.description}</p>
              <button class="btn btn-sm btn-outline-primary" onclick="showGuidelines()">
                View Details
              </button>
            </div>
          </div>
          ` : ''}
        </div>
      </div>

      <div class="row mt-4">
        <div class="col-12">
          <div class="card">
            <div class="card-header">
              <h5 class="mb-0">Getting Started Tips</h5>
            </div>
            <div class="card-body">
              <div class="row">
                <div class="col-md-4">
                  <div class="text-center">
                    <i class="fas fa-robot fa-3x text-primary mb-3"></i>
                    <h6>AI-Powered Writing</h6>
                    <p class="text-muted small">Let AI help you create professional messages that match your company's tone and style.</p>
                  </div>
                </div>
                <div class="col-md-4">
                  <div class="text-center">
                    <i class="fas fa-file-alt fa-3x text-success mb-3"></i>
                    <h6>Use Templates</h6>
                    <p class="text-muted small">Start with pre-built templates for common communication scenarios to save time.</p>
                  </div>
                </div>
                <div class="col-md-4">
                  <div class="text-center">
                    <i class="fas fa-share-alt fa-3x text-info mb-3"></i>
                    <h6>Multi-Platform Distribution</h6>
                    <p class="text-muted small">Send your messages to Slack, Teams, or email with just one click.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
    
    hideLoading();
  } catch (error) {
    hideLoading();
    showAlert('Failed to load dashboard: ' + error.message, 'danger');
  }
}

function renderRecentMessages(messages) {
  if (!messages || messages.length === 0) {
    return `
      <div class="text-center py-4">
        <i class="fas fa-envelope fa-3x text-muted mb-3"></i>
        <p class="text-muted">No messages yet. Create your first message to get started!</p>
        <button class="btn btn-primary" onclick="showMessageComposer()">Create Message</button>
      </div>
    `;
  }

  return messages.map(message => `
    <div class="border-bottom py-3">
      <div class="d-flex justify-content-between align-items-start">
        <div class="flex-grow-1">
          <h6 class="mb-1">
            <a href="#" onclick="viewMessage('${message._id}')" class="text-decoration-none">
              ${message.title}
            </a>
          </h6>
          <p class="text-muted small mb-1">${truncateText(message.subject, 80)}</p>
          <div class="d-flex align-items-center">
            <span class="badge ${getToneClass(message.tone)} me-2">${message.tone}</span>
            <span class="badge bg-light text-dark me-2">${message.category.replace('_', ' ')}</span>
            <small class="text-muted">${formatRelativeTime(message.createdAt)}</small>
          </div>
        </div>
        <div class="ms-3">
          <span class="badge ${getStatusBadgeClass(message.status)}">${message.status}</span>
        </div>
      </div>
    </div>
  `).join('');
}

function renderPopularTemplates(templates) {
  if (!templates || templates.length === 0) {
    return `
      <div class="text-center py-3">
        <p class="text-muted small">No templates available</p>
        <button class="btn btn-sm btn-outline-primary" onclick="showTemplates()">Browse Templates</button>
      </div>
    `;
  }

  return templates.slice(0, 3).map(template => `
    <div class="border-bottom py-2">
      <div class="d-flex justify-content-between align-items-center">
        <div>
          <h6 class="mb-1">
            <a href="#" onclick="useTemplate('${template._id}')" class="text-decoration-none">
              ${template.name}
            </a>
          </h6>
          <small class="text-muted">${template.usageCount} uses</small>
        </div>
        <span class="badge ${getToneClass(template.tone)}">${template.tone}</span>
      </div>
    </div>
  `).join('');
}

function getStatusBadgeClass(status) {
  switch (status) {
    case 'published': return 'bg-success';
    case 'draft': return 'bg-warning';
    case 'scheduled': return 'bg-info';
    default: return 'bg-secondary';
  }
}

async function viewMessage(messageId) {
  try {
    const message = await messageAPI.getById(messageId);
    // Implementation would show message details in a modal or navigate to message view
    showAlert('Message details view coming soon!', 'info');
  } catch (error) {
    showAlert('Failed to load message: ' + error.message, 'danger');
  }
}

async function useTemplate(templateId) {
  try {
    // Store template ID for use in message composer
    sessionStorage.setItem('selectedTemplateId', templateId);
    showMessageComposer();
  } catch (error) {
    showAlert('Failed to load template: ' + error.message, 'danger');
  }
}