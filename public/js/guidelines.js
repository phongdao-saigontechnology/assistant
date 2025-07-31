async function loadGuidelines() {
  try {
    showLoading();
    
    const [guidelines, activeGuideline] = await Promise.all([
      guidelinesAPI.getAll(),
      guidelinesAPI.getActive().catch(() => null)
    ]);
    
    const user = auth.getUser();
    const canManageGuidelines = ['hr', 'communications'].includes(user.role);
    
    document.getElementById('main-content').innerHTML = `
      <div class="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
        <h1 class="h2">Communication Guidelines</h1>
        <div class="btn-toolbar mb-2 mb-md-0">
          <div class="btn-group me-2">
            ${canManageGuidelines ? `
              <button type="button" class="btn btn-sm btn-primary" onclick="showCreateGuidelines()">
                <i class="fas fa-plus"></i> Create Guidelines
              </button>
              <button type="button" class="btn btn-sm btn-outline-primary" onclick="showUploadGuidelines()">
                <i class="fas fa-upload"></i> Upload File
              </button>
            ` : ''}
          </div>
        </div>
      </div>

      ${activeGuideline ? `
        <div class="row mb-4">
          <div class="col-12">
            <div class="card border-success">
              <div class="card-header bg-success text-white">
                <h5 class="mb-0">
                  <i class="fas fa-check-circle"></i> Active Guidelines: ${activeGuideline.name}
                </h5>
              </div>
              <div class="card-body">
                <p class="card-text">${activeGuideline.description}</p>
                <div class="row">
                  <div class="col-md-6">
                    <h6>Brand Voice:</h6>
                    <p class="text-muted">${activeGuideline.brandVoice?.personality?.join(', ') || 'Not specified'}</p>
                  </div>
                  <div class="col-md-6">
                    <h6>Version:</h6>
                    <p class="text-muted">v${activeGuideline.version} • Updated ${formatRelativeTime(activeGuideline.updatedAt)}</p>
                  </div>
                </div>
                <button class="btn btn-sm btn-outline-primary" onclick="viewGuideline('${activeGuideline._id}')">
                  View Details
                </button>
              </div>
            </div>
          </div>
        </div>
      ` : `
        <div class="row mb-4">
          <div class="col-12">
            <div class="alert alert-warning">
              <i class="fas fa-exclamation-triangle"></i>
              <strong>No Active Guidelines</strong> - 
              ${canManageGuidelines ? 'Create or activate guidelines to help AI generate on-brand messages.' : 'Contact your HR or Communications team to set up guidelines.'}
            </div>
          </div>
        </div>
      `}

      <div class="row">
        <div class="col-12">
          <div class="card">
            <div class="card-header">
              <h5 class="mb-0">All Guidelines</h5>
            </div>
            <div class="card-body">
              ${renderGuidelinesList(guidelines.guidelines || [])}
            </div>
          </div>
        </div>
      </div>
    `;
    
    hideLoading();
  } catch (error) {
    hideLoading();
    showAlert('Failed to load guidelines: ' + error.message, 'danger');
  }
}

function renderGuidelinesList(guidelines) {
  if (!guidelines || guidelines.length === 0) {
    return `
      <div class="text-center py-5">
        <i class="fas fa-book fa-4x text-muted mb-3"></i>
        <h4>No guidelines yet</h4>
        <p class="text-muted">Create your first set of communication guidelines</p>
        ${auth.getUser() && ['hr', 'communications'].includes(auth.getUser().role) ? `
          <button class="btn btn-primary" onclick="showCreateGuidelines()">Create Guidelines</button>
        ` : ''}
      </div>
    `;
  }

  return `
    <div class="table-responsive">
      <table class="table table-hover">
        <thead>
          <tr>
            <th>Name</th>
            <th>Description</th>
            <th>Version</th>
            <th>Status</th>
            <th>Created</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          ${guidelines.map(guideline => `
            <tr class="${guideline.isActive ? 'table-success' : ''}">
              <td>
                <strong>${guideline.name}</strong>
                ${guideline.isActive ? '<i class="fas fa-check-circle text-success ms-2"></i>' : ''}
              </td>
              <td>
                <div class="text-truncate" style="max-width: 300px;">
                  ${guideline.description}
                </div>
              </td>
              <td>v${guideline.version}</td>
              <td>
                <span class="badge ${guideline.isActive ? 'bg-success' : 'bg-secondary'}">
                  ${guideline.isActive ? 'Active' : 'Inactive'}
                </span>
              </td>
              <td>
                <small class="text-muted">
                  ${formatRelativeTime(guideline.createdAt)}<br>
                  by ${guideline.createdBy?.name || 'Unknown'}
                </small>
              </td>
              <td>
                <div class="btn-group btn-group-sm">
                  <button class="btn btn-outline-primary" onclick="viewGuideline('${guideline._id}')">
                    <i class="fas fa-eye"></i>
                  </button>
                  ${['hr', 'communications'].includes(auth.getUser().role) ? `
                    ${!guideline.isActive ? `
                      <button class="btn btn-outline-success" onclick="activateGuideline('${guideline._id}')">
                        <i class="fas fa-check"></i>
                      </button>
                    ` : ''}
                    <button class="btn btn-outline-secondary" onclick="editGuideline('${guideline._id}')">
                      <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-outline-danger" onclick="deleteGuideline('${guideline._id}')">
                      <i class="fas fa-trash"></i>
                    </button>
                  ` : ''}
                </div>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;
}

async function viewGuideline(guidelineId) {
  try {
    const guideline = await guidelinesAPI.getById(guidelineId);
    showGuidelineModal(guideline);
  } catch (error) {
    showAlert('Failed to load guideline: ' + error.message, 'danger');
  }
}

function showGuidelineModal(guideline) {
  const modalHTML = `
    <div class="modal fade" id="guidelineModal" tabindex="-1">
      <div class="modal-dialog modal-xl">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">
              ${guideline.name}
              ${guideline.isActive ? '<i class="fas fa-check-circle text-success ms-2"></i>' : ''}
            </h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <div class="row mb-4">
              <div class="col-md-6">
                <h6>Description:</h6>
                <p>${guideline.description}</p>
              </div>
              <div class="col-md-3">
                <h6>Version:</h6>
                <p>v${guideline.version}</p>
              </div>
              <div class="col-md-3">
                <h6>Status:</h6>
                <span class="badge ${guideline.isActive ? 'bg-success' : 'bg-secondary'}">
                  ${guideline.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>

            <div class="mb-4">
              <h6>Content Guidelines:</h6>
              <div class="border p-3 bg-light" style="max-height: 300px; overflow-y: auto; white-space: pre-wrap;">
                ${guideline.content}
              </div>
            </div>

            ${guideline.brandVoice ? `
              <div class="mb-4">
                <h6>Brand Voice:</h6>
                <div class="row">
                  <div class="col-md-4">
                    <strong>Personality:</strong>
                    <ul class="list-unstyled">
                      ${guideline.brandVoice.personality?.map(trait => `<li>• ${trait}</li>`).join('') || '<li class="text-muted">Not specified</li>'}
                    </ul>
                  </div>
                  <div class="col-md-4">
                    <strong>Preferred Terms:</strong>
                    <ul class="list-unstyled">
                      ${guideline.brandVoice.vocabulary?.preferred?.map(term => `<li>• ${term}</li>`).join('') || '<li class="text-muted">Not specified</li>'}
                    </ul>
                  </div>
                  <div class="col-md-4">
                    <strong>Terms to Avoid:</strong>
                    <ul class="list-unstyled">
                      ${guideline.brandVoice.vocabulary?.avoid?.map(term => `<li>• ${term}</li>`).join('') || '<li class="text-muted">Not specified</li>'}
                    </ul>
                  </div>
                </div>
              </div>
            ` : ''}

            ${guideline.toneGuidelines && Object.keys(guideline.toneGuidelines).length > 0 ? `
              <div class="mb-4">
                <h6>Tone-Specific Guidelines:</h6>
                <div class="accordion" id="toneAccordion">
                  ${Object.entries(guideline.toneGuidelines).filter(([_, content]) => content).map(([tone, content], index) => `
                    <div class="accordion-item">
                      <h2 class="accordion-header" id="heading${index}">
                        <button class="accordion-button ${index !== 0 ? 'collapsed' : ''}" type="button" 
                                data-bs-toggle="collapse" data-bs-target="#collapse${index}">
                          <span class="badge ${getToneClass(tone)} me-2">${tone}</span>
                          ${tone.charAt(0).toUpperCase() + tone.slice(1)} Tone
                        </button>
                      </h2>
                      <div id="collapse${index}" class="accordion-collapse collapse ${index === 0 ? 'show' : ''}" 
                           data-bs-parent="#toneAccordion">
                        <div class="accordion-body">
                          ${content}
                        </div>
                      </div>
                    </div>
                  `).join('')}
                </div>
              </div>
            ` : ''}

            ${guideline.examples && guideline.examples.length > 0 ? `
              <div class="mb-4">
                <h6>Examples:</h6>
                ${guideline.examples.map((example, index) => `
                  <div class="card mb-3">
                    <div class="card-header">
                      <strong>Example ${index + 1}: ${example.scenario}</strong>
                    </div>
                    <div class="card-body">
                      <div class="row">
                        <div class="col-md-6">
                          <h6 class="text-success">Good Example:</h6>
                          <div class="border p-2 bg-light">
                            ${example.goodExample}
                          </div>
                        </div>
                        ${example.badExample ? `
                          <div class="col-md-6">
                            <h6 class="text-danger">Bad Example:</h6>
                            <div class="border p-2 bg-light">
                              ${example.badExample}
                            </div>
                          </div>
                        ` : ''}
                      </div>
                      <div class="mt-2">
                        <h6>Explanation:</h6>
                        <p class="text-muted">${example.explanation}</p>
                      </div>
                    </div>
                  </div>
                `).join('')}
              </div>
            ` : ''}

            <div class="text-muted small">
              Created by ${guideline.createdBy?.name || 'Unknown'} on ${formatDate(guideline.createdAt)}
              ${guideline.updatedAt !== guideline.createdAt ? `• Updated ${formatDate(guideline.updatedAt)}` : ''}
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
            ${['hr', 'communications'].includes(auth.getUser().role) && !guideline.isActive ? `
              <button type="button" class="btn btn-success" onclick="activateGuidelineFromModal('${guideline._id}')">
                <i class="fas fa-check"></i> Activate
              </button>
            ` : ''}
          </div>
        </div>
      </div>
    </div>
  `;

  // Remove existing modal if present
  const existingModal = document.getElementById('guidelineModal');
  if (existingModal) {
    existingModal.remove();
  }

  // Add modal to DOM
  document.body.insertAdjacentHTML('beforeend', modalHTML);
  
  // Show modal
  const modal = new bootstrap.Modal(document.getElementById('guidelineModal'));
  modal.show();
}

function showCreateGuidelines() {
  const user = auth.getUser();
  if (!['hr', 'communications'].includes(user.role)) {
    showAlert('Only HR and Communications team members can create guidelines', 'warning');
    return;
  }

  const modalHTML = `
    <div class="modal fade" id="createGuidelinesModal" tabindex="-1">
      <div class="modal-dialog modal-xl">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Create Communication Guidelines</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <form id="createGuidelinesForm">
              <div class="row">
                <div class="col-md-8">
                  <div class="form-floating mb-3">
                    <input type="text" class="form-control" id="guidelineName" required>
                    <label for="guidelineName">Guidelines Name</label>
                  </div>
                </div>
                <div class="col-md-4">
                  <div class="form-check mt-3">
                    <input class="form-check-input" type="checkbox" id="setAsActive" checked>
                    <label class="form-check-label" for="setAsActive">
                      Set as active guidelines
                    </label>
                  </div>
                </div>
              </div>

              <div class="form-floating mb-3">
                <textarea class="form-control" id="guidelineDescription" style="height: 100px" required></textarea>
                <label for="guidelineDescription">Description</label>
              </div>

              <div class="form-floating mb-4">
                <textarea class="form-control" id="guidelineContent" style="height: 200px" required 
                          placeholder="Enter your communication guidelines here..."></textarea>
                <label for="guidelineContent">Guidelines Content</label>
              </div>

              <div class="card mb-4">
                <div class="card-header">
                  <h6 class="mb-0">Brand Voice (Optional)</h6>
                </div>
                <div class="card-body">
                  <div class="row">
                    <div class="col-md-4">
                      <label class="form-label">Personality Traits</label>
                      <textarea class="form-control" id="personalityTraits" rows="3" 
                                placeholder="e.g., Professional, Approachable, Innovative"></textarea>
                      <small class="text-muted">Enter traits separated by commas</small>
                    </div>
                    <div class="col-md-4">
                      <label class="form-label">Preferred Terms</label>
                      <textarea class="form-control" id="preferredTerms" rows="3" 
                                placeholder="e.g., Team members, Colleagues, Innovation"></textarea>
                      <small class="text-muted">Enter terms separated by commas</small>
                    </div>
                    <div class="col-md-4">
                      <label class="form-label">Terms to Avoid</label>
                      <textarea class="form-control" id="avoidTerms" rows="3" 
                                placeholder="e.g., Guys, ASAP, Cheap"></textarea>
                      <small class="text-muted">Enter terms separated by commas</small>
                    </div>
                  </div>
                </div>
              </div>

              <div class="card mb-4">
                <div class="card-header">
                  <h6 class="mb-0">Tone-Specific Guidelines (Optional)</h6>
                </div>
                <div class="card-body">
                  <div class="row">
                    <div class="col-md-6">
                      <div class="form-floating mb-3">
                        <textarea class="form-control" id="professionalTone" style="height: 80px"></textarea>
                        <label for="professionalTone">Professional Tone</label>
                      </div>
                      <div class="form-floating mb-3">
                        <textarea class="form-control" id="friendlyTone" style="height: 80px"></textarea>
                        <label for="friendlyTone">Friendly Tone</label>
                      </div>
                    </div>
                    <div class="col-md-6">
                      <div class="form-floating mb-3">
                        <textarea class="form-control" id="urgentTone" style="height: 80px"></textarea>
                        <label for="urgentTone">Urgent Tone</label>
                      </div>
                      <div class="form-floating mb-3">
                        <textarea class="form-control" id="celebratoryTone" style="height: 80px"></textarea>
                        <label for="celebratoryTone">Celebratory Tone</label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div class="card">
                <div class="card-header">
                  <h6 class="mb-0">Examples (Optional)</h6>
                </div>
                <div class="card-body">
                  <div id="examplesContainer">
                    <!-- Examples will be added here -->
                  </div>
                  <button type="button" class="btn btn-sm btn-outline-primary" onclick="addExample()">
                    <i class="fas fa-plus"></i> Add Example
                  </button>
                </div>
              </div>
            </form>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
            <button type="button" class="btn btn-primary" onclick="createGuidelines()">
              <i class="fas fa-save"></i> Create Guidelines
            </button>
          </div>
        </div>
      </div>
    </div>
  `;

  // Remove existing modal if present
  const existingModal = document.getElementById('createGuidelinesModal');
  if (existingModal) {
    existingModal.remove();
  }

  // Add modal to DOM
  document.body.insertAdjacentHTML('beforeend', modalHTML);
  
  // Show modal
  const modal = new bootstrap.Modal(document.getElementById('createGuidelinesModal'));
  modal.show();
}

let exampleCount = 0;

function addExample() {
  const container = document.getElementById('examplesContainer');
  const exampleId = `example_${exampleCount++}`;
  
  const exampleHTML = `
    <div class="card mb-3" id="${exampleId}">
      <div class="card-header d-flex justify-content-between align-items-center">
        <h6 class="mb-0">Example ${exampleCount}</h6>
        <button type="button" class="btn btn-sm btn-outline-danger" onclick="removeExample('${exampleId}')">
          <i class="fas fa-times"></i>
        </button>
      </div>
      <div class="card-body">
        <div class="form-floating mb-3">
          <input type="text" class="form-control" name="exampleScenario" required>
          <label>Scenario</label>
        </div>
        <div class="row">
          <div class="col-md-6">
            <div class="form-floating mb-3">
              <textarea class="form-control" name="goodExample" style="height: 100px" required></textarea>
              <label>Good Example</label>
            </div>
          </div>
          <div class="col-md-6">
            <div class="form-floating mb-3">
              <textarea class="form-control" name="badExample" style="height: 100px"></textarea>
              <label>Bad Example (Optional)</label>
            </div>
          </div>
        </div>
        <div class="form-floating">
          <textarea class="form-control" name="exampleExplanation" style="height: 80px" required></textarea>
          <label>Explanation</label>
        </div>
      </div>
    </div>
  `;
  
  container.insertAdjacentHTML('beforeend', exampleHTML);
}

function removeExample(exampleId) {
  document.getElementById(exampleId).remove();
}

async function createGuidelines() {
  try {
    const formData = {
      name: document.getElementById('guidelineName').value,
      description: document.getElementById('guidelineDescription').value,
      content: document.getElementById('guidelineContent').value,
      brandVoice: getBrandVoice(),
      toneGuidelines: getToneGuidelines(),
      examples: getExamples()
    };

    // Validate required fields
    if (!formData.name || !formData.description || !formData.content) {
      showAlert('Please fill in all required fields', 'warning');
      return;
    }

    showLoading();
    await guidelinesAPI.create(formData);
    hideLoading();

    // Close modal
    const modal = bootstrap.Modal.getInstance(document.getElementById('createGuidelinesModal'));
    if (modal) {
      modal.hide();
    }

    showAlert('Guidelines created successfully!', 'success');
    loadGuidelines(); // Reload the page
    
  } catch (error) {
    hideLoading();
    showAlert('Failed to create guidelines: ' + error.message, 'danger');
  }
}

function getBrandVoice() {
  const personality = document.getElementById('personalityTraits').value;
  const preferred = document.getElementById('preferredTerms').value;
  const avoid = document.getElementById('avoidTerms').value;

  return {
    personality: personality ? personality.split(',').map(t => t.trim()).filter(t => t) : [],
    vocabulary: {
      preferred: preferred ? preferred.split(',').map(t => t.trim()).filter(t => t) : [],
      avoid: avoid ? avoid.split(',').map(t => t.trim()).filter(t => t) : []
    }
  };
}

function getToneGuidelines() {
  return {
    professional: document.getElementById('professionalTone').value || '',
    friendly: document.getElementById('friendlyTone').value || '',
    urgent: document.getElementById('urgentTone').value || '',
    celebratory: document.getElementById('celebratoryTone').value || ''
  };
}

function getExamples() {
  const examples = [];
  const container = document.getElementById('examplesContainer');
  const exampleCards = container.querySelectorAll('.card');
  
  exampleCards.forEach(card => {
    const scenario = card.querySelector('input[name="exampleScenario"]').value;
    const goodExample = card.querySelector('textarea[name="goodExample"]').value;
    const badExample = card.querySelector('textarea[name="badExample"]').value;
    const explanation = card.querySelector('textarea[name="exampleExplanation"]').value;
    
    if (scenario && goodExample && explanation) {
      examples.push({ 
        scenario, 
        goodExample, 
        badExample: badExample || '', 
        explanation 
      });
    }
  });
  
  return examples;
}

function showUploadGuidelines() {
  const user = auth.getUser();
  if (!['hr', 'communications'].includes(user.role)) {
    showAlert('Only HR and Communications team members can upload guidelines', 'warning');
    return;
  }

  const modalHTML = `
    <div class="modal fade" id="uploadGuidelinesModal" tabindex="-1">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Upload Guidelines File</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <div class="guidelines-upload" id="uploadArea">
              <i class="fas fa-cloud-upload-alt fa-3x text-muted mb-3"></i>
              <h5>Drop your file here or click to browse</h5>
              <p class="text-muted">Supported formats: TXT, DOC, DOCX, PDF, MD</p>
              <p class="text-muted">Maximum size: 10MB</p>
              <input type="file" id="guidelinesFile" style="display: none;" 
                     accept=".txt,.doc,.docx,.pdf,.md" onchange="handleFileSelect(event)">
            </div>
            <div id="uploadProgress" style="display: none;">
              <div class="progress">
                <div class="progress-bar" role="progressbar" style="width: 0%"></div>
              </div>
            </div>
            <div id="uploadResult" style="display: none;"></div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
          </div>
        </div>
      </div>
    </div>
  `;

  // Remove existing modal if present
  const existingModal = document.getElementById('uploadGuidelinesModal');
  if (existingModal) {
    existingModal.remove();
  }

  // Add modal to DOM
  document.body.insertAdjacentHTML('beforeend', modalHTML);
  
  // Set up drag and drop
  const uploadArea = document.getElementById('uploadArea');
  const fileInput = document.getElementById('guidelinesFile');

  uploadArea.addEventListener('click', () => fileInput.click());
  uploadArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadArea.classList.add('dragover');
  });
  uploadArea.addEventListener('dragleave', () => {
    uploadArea.classList.remove('dragover');
  });
  uploadArea.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadArea.classList.remove('dragover');
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileUpload(files[0]);
    }
  });
  
  // Show modal
  const modal = new bootstrap.Modal(document.getElementById('uploadGuidelinesModal'));
  modal.show();
}

function handleFileSelect(event) {
  const file = event.target.files[0];
  if (file) {
    handleFileUpload(file);
  }
}

async function handleFileUpload(file) {
  try {
    const formData = new FormData();
    formData.append('guideline', file);

    document.getElementById('uploadProgress').style.display = 'block';
    
    const result = await guidelinesAPI.upload(formData);
    
    document.getElementById('uploadProgress').style.display = 'none';
    document.getElementById('uploadResult').style.display = 'block';
    document.getElementById('uploadResult').innerHTML = `
      <div class="alert alert-success">
        <i class="fas fa-check-circle"></i>
        File uploaded successfully! You can now use this content to create guidelines.
        <div class="mt-2">
          <strong>File:</strong> ${result.file.originalName}<br>
          <strong>Size:</strong> ${(result.file.size / 1024).toFixed(2)} KB
        </div>
        <div class="mt-3">
          <button class="btn btn-sm btn-primary" onclick="useUploadedContent('${result.file.content}')">
            Use This Content
          </button>
        </div>
      </div>
    `;
  } catch (error) {
    document.getElementById('uploadProgress').style.display = 'none';
    document.getElementById('uploadResult').style.display = 'block';
    document.getElementById('uploadResult').innerHTML = `
      <div class="alert alert-danger">
        <i class="fas fa-exclamation-circle"></i>
        Upload failed: ${error.message}
      </div>
    `;
  }
}

function useUploadedContent(content) {
  // Close upload modal
  const uploadModal = bootstrap.Modal.getInstance(document.getElementById('uploadGuidelinesModal'));
  if (uploadModal) {
    uploadModal.hide();
  }

  // Show create guidelines modal with pre-filled content
  showCreateGuidelines();
  
  // Wait for modal to be shown then fill content
  setTimeout(() => {
    document.getElementById('guidelineContent').value = content;
  }, 500);
}

async function activateGuideline(guidelineId) {
  if (!confirm('Are you sure you want to activate these guidelines? This will deactivate the current active guidelines.')) {
    return;
  }

  try {
    await guidelinesAPI.activate(guidelineId);
    showAlert('Guidelines activated successfully!', 'success');
    loadGuidelines();
  } catch (error) {
    showAlert('Failed to activate guidelines: ' + error.message, 'danger');
  }
}

async function activateGuidelineFromModal(guidelineId) {
  // Close modal first
  const modal = bootstrap.Modal.getInstance(document.getElementById('guidelineModal'));
  if (modal) {
    modal.hide();
  }
  
  await activateGuideline(guidelineId);
}

async function editGuideline(guidelineId) {
  showAlert('Guideline editing coming soon!', 'info');
}

async function deleteGuideline(guidelineId) {
  if (!confirm('Are you sure you want to delete these guidelines?')) return;

  try {
    await guidelinesAPI.delete(guidelineId);
    showAlert('Guidelines deleted successfully!', 'success');
    loadGuidelines();
  } catch (error) {
    showAlert('Failed to delete guidelines: ' + error.message, 'danger');
  }
}