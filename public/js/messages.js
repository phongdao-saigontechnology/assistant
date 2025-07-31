let currentMessage = null;
let messagePreview = null;

async function loadMessageComposer() {
  try {
    showLoading();
    
    // Load templates and categories for the composer
    const [templates, categories] = await Promise.all([
      templateAPI.getAll({ limit: 20 }).catch(() => ({ templates: [] })),
      templateAPI.getCategories().catch(() => [])
    ]);

    // Check if there's a selected template from storage
    const selectedTemplateId = sessionStorage.getItem('selectedTemplateId');
    let selectedTemplate = null;
    if (selectedTemplateId) {
      try {
        selectedTemplate = await templateAPI.getById(selectedTemplateId);
        sessionStorage.removeItem('selectedTemplateId');
      } catch (error) {
        console.warn('Failed to load selected template:', error);
      }
    }

    document.getElementById('main-content').innerHTML = `
      <div class="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
        <h1 class="h2">Create Message</h1>
        <div class="btn-toolbar mb-2 mb-md-0">
          <div class="btn-group me-2">
            <button type="button" class="btn btn-sm btn-outline-secondary" onclick="showMessages()">
              <i class="fas fa-arrow-left"></i> Back to Messages
            </button>
          </div>
        </div>
      </div>

      <div class="row">
        <div class="col-md-8">
          <div class="card message-composer">
            <div class="card-header">
              <h5 class="mb-0">Message Details</h5>
            </div>
            <div class="card-body">
              <form id="messageForm">
                <div class="row">
                  <div class="col-md-6">
                    <div class="form-floating mb-3">
                      <select class="form-select" id="category" required onchange="updateTemplates()">
                        <option value="">Select Category</option>
                        ${categories.map(cat => `
                          <option value="${cat.value}" ${selectedTemplate && selectedTemplate.category === cat.value ? 'selected' : ''}>
                            ${cat.label}
                          </option>
                        `).join('')}
                      </select>
                      <label for="category">Category</label>
                    </div>
                  </div>
                  <div class="col-md-6">
                    <div class="form-floating mb-3">
                      <select class="form-select" id="tone">
                        <option value="professional" ${selectedTemplate && selectedTemplate.tone === 'professional' ? 'selected' : ''}>Professional</option>
                        <option value="friendly" ${selectedTemplate && selectedTemplate.tone === 'friendly' ? 'selected' : ''}>Friendly</option>
                        <option value="urgent" ${selectedTemplate && selectedTemplate.tone === 'urgent' ? 'selected' : ''}>Urgent</option>
                        <option value="celebratory" ${selectedTemplate && selectedTemplate.tone === 'celebratory' ? 'selected' : ''}>Celebratory</option>
                      </select>
                      <label for="tone">Tone</label>
                    </div>
                  </div>
                </div>

                <div class="form-floating mb-3">
                  <select class="form-select" id="templateSelect" onchange="loadTemplate()">
                    <option value="">Choose a template (optional)</option>
                    ${templates.templates.map(template => `
                      <option value="${template._id}" ${selectedTemplate && selectedTemplate._id === template._id ? 'selected' : ''}>
                        ${template.name} (${template.category.replace('_', ' ')})
                      </option>
                    `).join('')}
                  </select>
                  <label for="templateSelect">Template</label>
                </div>

                <div class="form-floating mb-3">
                  <textarea class="form-control" id="prompt" style="height: 120px" placeholder="Describe what you want to communicate..." required></textarea>
                  <label for="prompt">Message Description</label>
                </div>

                <div class="row">
                  <div class="col-md-6">
                    <div class="form-floating mb-3">
                      <input type="text" class="form-control" id="targetAudience" placeholder="e.g., All employees, HR team">
                      <label for="targetAudience">Target Audience (optional)</label>
                    </div>
                  </div>
                  <div class="col-md-6">
                    <div class="form-floating mb-3">
                      <input type="text" class="form-control" id="callToAction" placeholder="e.g., Please confirm by Friday">
                      <label for="callToAction">Call to Action (optional)</label>
                    </div>
                  </div>
                </div>

                <div class="form-floating mb-3">
                  <textarea class="form-control" id="keyPoints" style="height: 80px" placeholder="Enter key points separated by commas"></textarea>
                  <label for="keyPoints">Key Points (optional)</label>
                </div>

                <div class="d-flex gap-2">
                  <button type="button" class="btn btn-primary" onclick="generateMessage()">
                    <i class="fas fa-robot"></i> Generate with AI
                  </button>
                  <button type="button" class="btn btn-outline-secondary" onclick="clearForm()">
                    <i class="fas fa-eraser"></i> Clear
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>

        <div class="col-md-4">
          <div class="card">
            <div class="card-header">
              <h5 class="mb-0">Tips</h5>
            </div>
            <div class="card-body">
              <ul class="list-unstyled">
                <li class="mb-2"><i class="fas fa-lightbulb text-warning"></i> Be specific about what you want to communicate</li>
                <li class="mb-2"><i class="fas fa-users text-info"></i> Consider your audience when choosing tone</li>
                <li class="mb-2"><i class="fas fa-template text-success"></i> Use templates to save time and ensure consistency</li>
                <li class="mb-2"><i class="fas fa-check text-primary"></i> Include clear action items when needed</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div id="messagePreview" class="row mt-4" style="display: none;">
        <div class="col-12">
          <div class="card">
            <div class="card-header d-flex justify-content-between align-items-center">
              <h5 class="mb-0">Generated Message</h5>
              <div>
                <button class="btn btn-sm btn-outline-primary" onclick="regenerateMessage()">
                  <i class="fas fa-redo"></i> Regenerate
                </button>
                <button class="btn btn-sm btn-success" onclick="saveMessage()">
                  <i class="fas fa-save"></i> Save
                </button>
              </div>
            </div>
            <div class="card-body">
              <div id="previewContent"></div>
              <div id="analysisContent" class="mt-3"></div>
            </div>
          </div>
        </div>
      </div>
    `;

    // If there's a selected template, load it
    if (selectedTemplate) {
      loadTemplateContent(selectedTemplate);
    }

    hideLoading();
  } catch (error) {
    hideLoading();
    showAlert('Failed to load message composer: ' + error.message, 'danger');
  }
}

async function generateMessage() {
  try {
    const formData = getFormData();
    
    if (!formData.prompt) {
      showAlert('Please describe what you want to communicate', 'warning');
      return;
    }

    if (!formData.category) {
      showAlert('Please select a category', 'warning');
      return;
    }

    showLoading();
    
    const result = await messageAPI.generate(formData);
    messagePreview = result;
    
    displayMessagePreview(result);
    hideLoading();
    
  } catch (error) {
    hideLoading();
    showAlert('Failed to generate message: ' + error.message, 'danger');
  }
}

function getFormData() {
  const keyPoints = document.getElementById('keyPoints').value;
  return {
    prompt: document.getElementById('prompt').value,
    category: document.getElementById('category').value,
    tone: document.getElementById('tone').value,
    templateId: document.getElementById('templateSelect').value || undefined,
    targetAudience: document.getElementById('targetAudience').value || undefined,
    callToAction: document.getElementById('callToAction').value || undefined,
    keyPoints: keyPoints ? keyPoints.split(',').map(p => p.trim()) : undefined
  };
}

function displayMessagePreview(result) {
  const previewDiv = document.getElementById('messagePreview');
  const contentDiv = document.getElementById('previewContent');
  const analysisDiv = document.getElementById('analysisContent');

  contentDiv.innerHTML = `
    <div class="message-preview">
      <h6>Subject:</h6>
      <div class="border p-2 mb-3 bg-light">
        <strong>${result.subject}</strong>
      </div>
      
      <h6>Message:</h6>
      <div class="border p-3 bg-white" style="white-space: pre-wrap;">${result.content}</div>
      
      <div class="mt-3">
        <button class="btn btn-sm btn-outline-primary" onclick="copyToClipboard('${result.subject}\\n\\n${result.content.replace(/'/g, "\\'")}')">
          <i class="fas fa-copy"></i> Copy Message
        </button>
        <button class="btn btn-sm btn-outline-secondary" onclick="improveMessage()">
          <i class="fas fa-magic"></i> Improve
        </button>
      </div>
    </div>
  `;

  if (result.analysis) {
    analysisDiv.innerHTML = `
      <div class="card">
        <div class="card-header">
          <h6 class="mb-0">AI Analysis</h6>
        </div>
        <div class="card-body">
          <div class="analysis-score">
            <span>Tonal Consistency:</span>
            <div class="score-bar">
              <div class="score-fill ${getScoreClass(result.analysis.tonalConsistency)}" 
                   style="width: ${result.analysis.tonalConsistency * 10}%"></div>
            </div>
            <span>${result.analysis.tonalConsistency}/10</span>
          </div>
          
          <div class="analysis-score">
            <span>Clarity Score:</span>
            <div class="score-bar">
              <div class="score-fill ${getScoreClass(result.analysis.clarityScore)}" 
                   style="width: ${result.analysis.clarityScore * 10}%"></div>
            </div>
            <span>${result.analysis.clarityScore}/10</span>
          </div>
          
          <div class="analysis-score">
            <span>Brand Alignment:</span>
            <div class="score-bar">
              <div class="score-fill ${getScoreClass(result.analysis.brandAlignment)}" 
                   style="width: ${result.analysis.brandAlignment * 10}%"></div>
            </div>
            <span>${result.analysis.brandAlignment}/10</span>
          </div>
          
          ${result.analysis.suggestions && result.analysis.suggestions.length > 0 ? `
            <div class="mt-3">
              <h6>Suggestions:</h6>
              <ul class="list-unstyled">
                ${result.analysis.suggestions.map(suggestion => `
                  <li class="mb-1"><i class="fas fa-lightbulb text-warning"></i> ${suggestion}</li>
                `).join('')}
              </ul>
            </div>
          ` : ''}
        </div>
      </div>
    `;
  }

  previewDiv.style.display = 'block';
  previewDiv.scrollIntoView({ behavior: 'smooth' });
}

async function saveMessage() {
  if (!messagePreview) {
    showAlert('No message to save', 'warning');
    return;
  }

  try {
    showLoading();
    
    const formData = getFormData();
    const messageData = {
      title: messagePreview.subject,
      subject: messagePreview.subject,
      content: messagePreview.content,
      originalPrompt: formData.prompt,
      tone: formData.tone,
      category: formData.category,
      templateUsed: formData.templateId || undefined
    };

    await messageAPI.save(messageData);
    hideLoading();
    showAlert('Message saved successfully!', 'success');
    
    // Optionally redirect to messages list
    setTimeout(() => showMessages(), 1500);
    
  } catch (error) {
    hideLoading();
    showAlert('Failed to save message: ' + error.message, 'danger');
  }
}

async function regenerateMessage() {
  await generateMessage();
}

async function improveMessage() {
  if (!messagePreview) {
    showAlert('No message to improve', 'warning');
    return;
  }

  const feedback = prompt('Please provide feedback on how to improve this message:');
  if (!feedback) return;

  try {
    showLoading();
    // This would need a message ID, so we'd need to save first or handle differently
    showAlert('Message improvement feature coming soon!', 'info');
    hideLoading();
  } catch (error) {
    hideLoading();
    showAlert('Failed to improve message: ' + error.message, 'danger');
  }
}

async function loadTemplate() {
  const templateId = document.getElementById('templateSelect').value;
  if (!templateId) return;

  try {
    const template = await templateAPI.getById(templateId);
    loadTemplateContent(template);
  } catch (error) {
    showAlert('Failed to load template: ' + error.message, 'danger');
  }
}

function loadTemplateContent(template) {
  document.getElementById('category').value = template.category;
  document.getElementById('tone').value = template.tone;
  
  // Pre-fill prompt with template description
  const promptField = document.getElementById('prompt');
  if (!promptField.value) {
    promptField.value = `Create a message using the "${template.name}" template. ${template.description}`;
  }
}

function clearForm() {
  document.getElementById('messageForm').reset();
  document.getElementById('messagePreview').style.display = 'none';
  messagePreview = null;
}

function updateTemplates() {
  // This would filter templates based on selected category
  // Implementation would reload template options
}

// Messages list functionality
async function loadMessages() {
  try {
    showLoading();
    
    const result = await messageAPI.getAll();
    
    document.getElementById('main-content').innerHTML = `
      <div class="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
        <h1 class="h2">My Messages</h1>
        <div class="btn-toolbar mb-2 mb-md-0">
          <div class="btn-group me-2">
            <button type="button" class="btn btn-sm btn-primary" onclick="showMessageComposer()">
              <i class="fas fa-plus"></i> Create Message
            </button>
          </div>
        </div>
      </div>

      <div class="row mb-3">
        <div class="col-md-4">
          <select class="form-select" id="statusFilter" onchange="filterMessages()">
            <option value="">All Status</option>
            <option value="draft">Draft</option>
            <option value="published">Published</option>
            <option value="scheduled">Scheduled</option>
          </select>
        </div>
        <div class="col-md-4">
          <select class="form-select" id="categoryFilter" onchange="filterMessages()">
            <option value="">All Categories</option>
            <option value="policy_update">Policy Update</option>
            <option value="leadership_announcement">Leadership Announcement</option>
            <option value="event_invitation">Event Invitation</option>
            <option value="general_update">General Update</option>
            <option value="urgent_notice">Urgent Notice</option>
          </select>
        </div>
        <div class="col-md-4">
          <input type="search" class="form-control" id="searchInput" placeholder="Search messages..." onkeyup="searchMessages()">
        </div>
      </div>

      <div class="row">
        <div class="col-12">
          <div class="card">
            <div class="card-body">
              ${renderMessagesList(result.messages || [])}
            </div>
          </div>
        </div>
      </div>
    `;
    
    hideLoading();
  } catch (error) {
    hideLoading();
    showAlert('Failed to load messages: ' + error.message, 'danger');
  }
}

function renderMessagesList(messages) {
  if (!messages || messages.length === 0) {
    return `
      <div class="text-center py-5">
        <i class="fas fa-envelope fa-4x text-muted mb-3"></i>
        <h4>No messages yet</h4>
        <p class="text-muted">Create your first message to get started!</p>
        <button class="btn btn-primary" onclick="showMessageComposer()">Create Message</button>
      </div>
    `;
  }

  return `
    <div class="table-responsive">
      <table class="table table-hover">
        <thead>
          <tr>
            <th>Title</th>
            <th>Category</th>
            <th>Tone</th>
            <th>Status</th>
            <th>Created</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          ${messages.map(message => `
            <tr>
              <td>
                <div>
                  <strong>${message.title}</strong>
                  <br>
                  <small class="text-muted">${truncateText(message.subject, 60)}</small>
                </div>
              </td>
              <td><span class="badge bg-light text-dark">${message.category.replace('_', ' ')}</span></td>
              <td><span class="badge ${getToneClass(message.tone)}">${message.tone}</span></td>
              <td><span class="badge ${getStatusBadgeClass(message.status)}">${message.status}</span></td>
              <td><small class="text-muted">${formatRelativeTime(message.createdAt)}</small></td>
              <td>
                <div class="btn-group btn-group-sm">
                  <button class="btn btn-outline-primary" onclick="viewMessageDetails('${message._id}')">
                    <i class="fas fa-eye"></i>
                  </button>
                  <button class="btn btn-outline-secondary" onclick="editMessage('${message._id}')">
                    <i class="fas fa-edit"></i>
                  </button>
                  <button class="btn btn-outline-danger" onclick="deleteMessage('${message._id}')">
                    <i class="fas fa-trash"></i>
                  </button>
                </div>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;
}

async function viewMessageDetails(messageId) {
  // Implementation for viewing message details
  showAlert('Message details view coming soon!', 'info');
}

async function editMessage(messageId) {
  // Implementation for editing messages
  showAlert('Message editing coming soon!', 'info');
}

async function deleteMessage(messageId) {
  if (!confirm('Are you sure you want to delete this message?')) return;

  try {
    await messageAPI.delete(messageId);
    showAlert('Message deleted successfully!', 'success');
    loadMessages(); // Reload the list
  } catch (error) {
    showAlert('Failed to delete message: ' + error.message, 'danger');
  }
}

function filterMessages() {
  // Implementation for filtering messages
  showAlert('Message filtering coming soon!', 'info');
}

function searchMessages() {
  // Implementation for searching messages
  showAlert('Message search coming soon!', 'info');
}