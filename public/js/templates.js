async function loadTemplates() {
  try {
    showLoading();
    
    const [templates, categories] = await Promise.all([
      templateAPI.getAll(),
      templateAPI.getCategories()
    ]);
    
    const user = auth.getUser();
    const canCreateTemplates = ['hr', 'communications'].includes(user.role);
    
    document.getElementById('main-content').innerHTML = `
      <div class="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
        <h1 class="h2">Templates</h1>
        <div class="btn-toolbar mb-2 mb-md-0">
          <div class="btn-group me-2">
            ${canCreateTemplates ? `
              <button type="button" class="btn btn-sm btn-primary" onclick="showCreateTemplate()">
                <i class="fas fa-plus"></i> Create Template
              </button>
            ` : ''}
          </div>
        </div>
      </div>

      <div class="row mb-3">
        <div class="col-md-3">
          <select class="form-select" id="categoryFilter" onchange="filterTemplates()">
            <option value="">All Categories</option>
            ${categories.map(cat => `
              <option value="${cat.value}">${cat.label}</option>
            `).join('')}
          </select>
        </div>
        <div class="col-md-3">
          <select class="form-select" id="toneFilter" onchange="filterTemplates()">
            <option value="">All Tones</option>
            <option value="professional">Professional</option>
            <option value="friendly">Friendly</option>
            <option value="urgent">Urgent</option>
            <option value="celebratory">Celebratory</option>
          </select>
        </div>
        <div class="col-md-6">
          <input type="search" class="form-control" id="searchInput" placeholder="Search templates..." onkeyup="searchTemplates()">
        </div>
      </div>

      <div class="row" id="templatesContainer">
        ${renderTemplateGrid(templates.templates || [])}
      </div>
    `;
    
    hideLoading();
  } catch (error) {
    hideLoading();
    showAlert('Failed to load templates: ' + error.message, 'danger');
  }
}

function renderTemplateGrid(templates) {
  if (!templates || templates.length === 0) {
    return `
      <div class="col-12">
        <div class="text-center py-5">
          <i class="fas fa-file-alt fa-4x text-muted mb-3"></i>
          <h4>No templates found</h4>
          <p class="text-muted">Create your first template or adjust your filters</p>
        </div>
      </div>
    `;
  }

  return templates.map(template => `
    <div class="col-md-6 col-lg-4 mb-4">
      <div class="card template-card" onclick="viewTemplate('${template._id}')">
        <div class="card-header d-flex justify-content-between align-items-center">
          <h6 class="mb-0">${template.name}</h6>
          <span class="badge ${getToneClass(template.tone)}">${template.tone}</span>
        </div>
        <div class="card-body">
          <p class="text-muted small">${template.description}</p>
          <div class="d-flex justify-content-between align-items-center">
            <span class="badge bg-light text-dark">${template.category.replace('_', ' ')}</span>
            <small class="text-muted">${template.usageCount || 0} uses</small>
          </div>
          <div class="mt-2">
            <small class="text-muted">
              by ${template.createdBy?.name || 'System'} • 
              ${formatRelativeTime(template.createdAt)}
            </small>
          </div>
        </div>
        <div class="card-footer">
          <div class="btn-group btn-group-sm w-100">
            <button class="btn btn-outline-primary" onclick="event.stopPropagation(); useTemplate('${template._id}')">
              <i class="fas fa-play"></i> Use
            </button>
            <button class="btn btn-outline-secondary" onclick="event.stopPropagation(); previewTemplate('${template._id}')">
              <i class="fas fa-eye"></i> Preview
            </button>
            ${template.createdBy?._id === auth.getUser().id ? `
              <button class="btn btn-outline-danger" onclick="event.stopPropagation(); deleteTemplate('${template._id}')">
                <i class="fas fa-trash"></i>
              </button>
            ` : ''}
          </div>
        </div>
      </div>
    </div>
  `).join('');
}

async function viewTemplate(templateId) {
  try {
    const template = await templateAPI.getById(templateId);
    showTemplateModal(template);
  } catch (error) {
    showAlert('Failed to load template: ' + error.message, 'danger');
  }
}

function showTemplateModal(template) {
  const modalHTML = `
    <div class="modal fade" id="templateModal" tabindex="-1">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">${template.name}</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <div class="row mb-3">
              <div class="col-md-6">
                <strong>Category:</strong> ${template.category.replace('_', ' ')}
              </div>
              <div class="col-md-6">
                <strong>Tone:</strong> <span class="badge ${getToneClass(template.tone)}">${template.tone}</span>
              </div>
            </div>
            
            <div class="mb-3">
              <strong>Description:</strong>
              <p class="text-muted">${template.description}</p>
            </div>

            <div class="mb-3">
              <strong>Subject Template:</strong>
              <div class="border p-2 bg-light">
                <code>${template.content.subject}</code>
              </div>
            </div>

            <div class="mb-3">
              <strong>Body Template:</strong>
              <div class="border p-3 bg-light" style="white-space: pre-wrap; max-height: 300px; overflow-y: auto;">
                <code>${template.content.body}</code>
              </div>
            </div>

            ${template.variables && template.variables.length > 0 ? `
              <div class="mb-3">
                <strong>Variables:</strong>
                <div class="table-responsive">
                  <table class="table table-sm">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Description</th>
                        <th>Type</th>
                        <th>Required</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${template.variables.map(variable => `
                        <tr>
                          <td><code>{{${variable.name}}}</code></td>
                          <td>${variable.description}</td>
                          <td>${variable.type}</td>
                          <td>${variable.required ? 'Yes' : 'No'}</td>
                        </tr>
                      `).join('')}
                    </tbody>
                  </table>
                </div>
              </div>
            ` : ''}

            <div class="text-muted small">
              Created by ${template.createdBy?.name || 'System'} on ${formatDate(template.createdAt)}
              • Used ${template.usageCount || 0} times
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
            <button type="button" class="btn btn-primary" onclick="useTemplateFromModal('${template._id}')">
              <i class="fas fa-play"></i> Use Template
            </button>
          </div>
        </div>
      </div>
    </div>
  `;

  // Remove existing modal if present
  const existingModal = document.getElementById('templateModal');
  if (existingModal) {
    existingModal.remove();
  }

  // Add modal to DOM
  document.body.insertAdjacentHTML('beforeend', modalHTML);
  
  // Show modal
  const modal = new bootstrap.Modal(document.getElementById('templateModal'));
  modal.show();
}

async function useTemplate(templateId) {
  sessionStorage.setItem('selectedTemplateId', templateId);
  showMessageComposer();
}

async function useTemplateFromModal(templateId) {
  // Close modal first
  const modal = bootstrap.Modal.getInstance(document.getElementById('templateModal'));
  if (modal) {
    modal.hide();
  }
  
  await useTemplate(templateId);
}

async function previewTemplate(templateId) {
  await viewTemplate(templateId);
}

async function deleteTemplate(templateId) {
  if (!confirm('Are you sure you want to delete this template?')) return;

  try {
    await templateAPI.delete(templateId);
    showAlert('Template deleted successfully!', 'success');
    loadTemplates(); // Reload the grid
  } catch (error) {
    showAlert('Failed to delete template: ' + error.message, 'danger');
  }
}

function showCreateTemplate() {
  const user = auth.getUser();
  if (!['hr', 'communications'].includes(user.role)) {
    showAlert('Only HR and Communications team members can create templates', 'warning');
    return;
  }

  const modalHTML = `
    <div class="modal fade" id="createTemplateModal" tabindex="-1">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Create New Template</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <form id="createTemplateForm">
              <div class="row">
                <div class="col-md-6">
                  <div class="form-floating mb-3">
                    <input type="text" class="form-control" id="templateName" required>
                    <label for="templateName">Template Name</label>
                  </div>
                </div>
                <div class="col-md-6">
                  <div class="form-floating mb-3">
                    <select class="form-select" id="templateCategory" required>
                      <option value="">Select Category</option>
                      <option value="policy_update">Policy Update</option>
                      <option value="leadership_announcement">Leadership Announcement</option>
                      <option value="event_invitation">Event Invitation</option>
                      <option value="general_update">General Update</option>
                      <option value="urgent_notice">Urgent Notice</option>
                    </select>
                    <label for="templateCategory">Category</label>
                  </div>
                </div>
              </div>

              <div class="row">
                <div class="col-md-6">
                  <div class="form-floating mb-3">
                    <select class="form-select" id="templateTone" required>
                      <option value="professional">Professional</option>
                      <option value="friendly">Friendly</option>
                      <option value="urgent">Urgent</option>
                      <option value="celebratory">Celebratory</option>
                    </select>
                    <label for="templateTone">Tone</label>
                  </div>
                </div>
                <div class="col-md-6">
                  <div class="form-check mt-3">
                    <input class="form-check-input" type="checkbox" id="isPublic" checked>
                    <label class="form-check-label" for="isPublic">
                      Make template public
                    </label>
                  </div>
                </div>
              </div>

              <div class="form-floating mb-3">
                <textarea class="form-control" id="templateDescription" style="height: 80px" required></textarea>
                <label for="templateDescription">Description</label>
              </div>

              <div class="form-floating mb-3">
                <input type="text" class="form-control" id="templateSubject" required>
                <label for="templateSubject">Subject Template</label>
              </div>

              <div class="form-floating mb-3">
                <textarea class="form-control" id="templateBody" style="height: 200px" required></textarea>
                <label for="templateBody">Body Template</label>
              </div>

              <div class="card">
                <div class="card-header">
                  <h6 class="mb-0">Variables (Optional)</h6>
                  <small class="text-muted">Define variables using {{variableName}} format in your template</small>
                </div>
                <div class="card-body">
                  <div id="variablesContainer">
                    <!-- Variables will be added here -->
                  </div>
                  <button type="button" class="btn btn-sm btn-outline-primary" onclick="addVariable()">
                    <i class="fas fa-plus"></i> Add Variable
                  </button>
                </div>
              </div>
            </form>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
            <button type="button" class="btn btn-primary" onclick="createTemplate()">
              <i class="fas fa-save"></i> Create Template
            </button>
          </div>
        </div>
      </div>
    </div>
  `;

  // Remove existing modal if present
  const existingModal = document.getElementById('createTemplateModal');
  if (existingModal) {
    existingModal.remove();
  }

  // Add modal to DOM
  document.body.insertAdjacentHTML('beforeend', modalHTML);
  
  // Show modal
  const modal = new bootstrap.Modal(document.getElementById('createTemplateModal'));
  modal.show();
}

let variableCount = 0;

function addVariable() {
  const container = document.getElementById('variablesContainer');
  const variableId = `variable_${variableCount++}`;
  
  const variableHTML = `
    <div class="row mb-2" id="${variableId}">
      <div class="col-md-3">
        <input type="text" class="form-control form-control-sm" placeholder="Variable name" name="varName">
      </div>
      <div class="col-md-4">
        <input type="text" class="form-control form-control-sm" placeholder="Description" name="varDescription">
      </div>
      <div class="col-md-2">
        <select class="form-select form-select-sm" name="varType">
          <option value="text">Text</option>
          <option value="date">Date</option>
          <option value="number">Number</option>
        </select>
      </div>
      <div class="col-md-2">
        <div class="form-check">
          <input class="form-check-input" type="checkbox" name="varRequired" checked>
          <label class="form-check-label">Required</label>
        </div>
      </div>
      <div class="col-md-1">
        <button type="button" class="btn btn-sm btn-outline-danger" onclick="removeVariable('${variableId}')">
          <i class="fas fa-times"></i>
        </button>
      </div>
    </div>
  `;
  
  container.insertAdjacentHTML('beforeend', variableHTML);
}

function removeVariable(variableId) {
  document.getElementById(variableId).remove();
}

async function createTemplate() {
  try {
    const formData = {
      name: document.getElementById('templateName').value,
      category: document.getElementById('templateCategory').value,
      description: document.getElementById('templateDescription').value,
      tone: document.getElementById('templateTone').value,
      isPublic: document.getElementById('isPublic').checked,
      content: {
        subject: document.getElementById('templateSubject').value,
        body: document.getElementById('templateBody').value
      },
      variables: getVariables()
    };

    // Validate required fields
    if (!formData.name || !formData.category || !formData.description || 
        !formData.content.subject || !formData.content.body) {
      showAlert('Please fill in all required fields', 'warning');
      return;
    }

    showLoading();
    await templateAPI.create(formData);
    hideLoading();

    // Close modal
    const modal = bootstrap.Modal.getInstance(document.getElementById('createTemplateModal'));
    if (modal) {
      modal.hide();
    }

    showAlert('Template created successfully!', 'success');
    loadTemplates(); // Reload the grid
    
  } catch (error) {
    hideLoading();
    showAlert('Failed to create template: ' + error.message, 'danger');
  }
}

function getVariables() {
  const variables = [];
  const container = document.getElementById('variablesContainer');
  const variableRows = container.querySelectorAll('.row');
  
  variableRows.forEach(row => {
    const name = row.querySelector('input[name="varName"]').value;
    const description = row.querySelector('input[name="varDescription"]').value;
    const type = row.querySelector('select[name="varType"]').value;
    const required = row.querySelector('input[name="varRequired"]').checked;
    
    if (name && description) {
      variables.push({ name, description, type, required });
    }
  });
  
  return variables;
}

function filterTemplates() {
  // Implementation for filtering templates
  showAlert('Template filtering coming soon!', 'info');
}

function searchTemplates() {
  // Implementation for searching templates
  showAlert('Template search coming soon!', 'info');
}