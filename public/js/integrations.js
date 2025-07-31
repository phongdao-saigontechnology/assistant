async function loadIntegrations() {
  try {
    showLoading();
    
    const userIntegrations = await integrationAPI.getUserIntegrations().catch(() => ({
      slack: { enabled: false },
      teams: { enabled: false },
      email: { enabled: true, distributionLists: [] }
    }));
    
    document.getElementById('main-content').innerHTML = `
      <div class="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
        <h1 class="h2">Integrations</h1>
        <div class="btn-toolbar mb-2 mb-md-0">
          <div class="btn-group me-2">
            <button type="button" class="btn btn-sm btn-success" onclick="testAllConnections()">
              <i class="fas fa-check-circle"></i> Test All
            </button>
            <button type="button" class="btn btn-sm btn-primary" onclick="saveIntegrationSettings()">
              <i class="fas fa-save"></i> Save Settings
            </button>
          </div>
        </div>
      </div>

      <div class="row">
        <div class="col-md-8">
          <div class="card mb-4">
            <div class="card-header d-flex justify-content-between align-items-center">
              <h5 class="mb-0">
                <i class="fab fa-slack text-primary"></i> Slack Integration
              </h5>
              <span class="integration-status ${userIntegrations.slack?.enabled ? 'integration-connected' : 'integration-disconnected'}">
                ${userIntegrations.slack?.enabled ? 'Connected' : 'Disconnected'}
              </span>
            </div>
            <div class="card-body">
              <div class="form-check mb-3">
                <input class="form-check-input" type="checkbox" id="slackEnabled" 
                       ${userIntegrations.slack?.enabled ? 'checked' : ''}>
                <label class="form-check-label" for="slackEnabled">
                  Enable Slack integration
                </label>
              </div>
              
              <div id="slackSettings" class="${userIntegrations.slack?.enabled ? '' : 'd-none'}">
                <div class="row">
                  <div class="col-md-6">
                    <div class="form-floating mb-3">
                      <input type="text" class="form-control" id="slackToken" 
                             placeholder="xoxb-..." 
                             value="${userIntegrations.slack?.token || ''}">
                      <label for="slackToken">Bot Token</label>
                    </div>
                  </div>
                  <div class="col-md-6">
                    <div class="form-floating mb-3">
                      <select class="form-select" id="slackChannel">
                        <option value="">Select Channel</option>
                        <!-- Channels will be loaded dynamically -->
                      </select>
                      <label for="slackChannel">Default Channel</label>
                    </div>
                  </div>
                </div>
                
                <div class="d-flex gap-2">
                  <button class="btn btn-sm btn-outline-primary" onclick="testSlackConnection()">
                    <i class="fas fa-plug"></i> Test Connection
                  </button>
                  <button class="btn btn-sm btn-outline-secondary" onclick="loadSlackChannels()">
                    <i class="fas fa-sync"></i> Load Channels
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div class="card mb-4">
            <div class="card-header d-flex justify-content-between align-items-center">
              <h5 class="mb-0">
                <i class="fab fa-microsoft text-primary"></i> Microsoft Teams Integration
              </h5>
              <span class="integration-status ${userIntegrations.teams?.enabled ? 'integration-connected' : 'integration-disconnected'}">
                ${userIntegrations.teams?.enabled ? 'Connected' : 'Disconnected'}
              </span>
            </div>
            <div class="card-body">
              <div class="form-check mb-3">
                <input class="form-check-input" type="checkbox" id="teamsEnabled" 
                       ${userIntegrations.teams?.enabled ? 'checked' : ''}>
                <label class="form-check-label" for="teamsEnabled">
                  Enable Microsoft Teams integration
                </label>
              </div>
              
              <div id="teamsSettings" class="${userIntegrations.teams?.enabled ? '' : 'd-none'}">
                <div class="row">
                  <div class="col-md-4">
                    <div class="form-floating mb-3">
                      <input type="text" class="form-control" id="teamsClientId" 
                             value="${userIntegrations.teams?.clientId || ''}">
                      <label for="teamsClientId">Client ID</label>
                    </div>
                  </div>
                  <div class="col-md-4">
                    <div class="form-floating mb-3">
                      <input type="password" class="form-control" id="teamsClientSecret" 
                             value="${userIntegrations.teams?.clientSecret || ''}">
                      <label for="teamsClientSecret">Client Secret</label>
                    </div>
                  </div>
                  <div class="col-md-4">
                    <div class="form-floating mb-3">
                      <input type="text" class="form-control" id="teamsTenantId" 
                             value="${userIntegrations.teams?.tenantId || ''}">
                      <label for="teamsTenantId">Tenant ID</label>
                    </div>
                  </div>
                </div>

                <div class="row">
                  <div class="col-md-6">
                    <div class="form-floating mb-3">
                      <input type="text" class="form-control" id="teamsTeamId" 
                             value="${userIntegrations.teams?.teamId || ''}">
                      <label for="teamsTeamId">Team ID</label>
                    </div>
                  </div>
                  <div class="col-md-6">
                    <div class="form-floating mb-3">
                      <input type="text" class="form-control" id="teamsChannelId" 
                             value="${userIntegrations.teams?.channelId || ''}">
                      <label for="teamsChannelId">Channel ID</label>
                    </div>
                  </div>
                </div>
                
                <button class="btn btn-sm btn-outline-primary" onclick="testTeamsConnection()">
                  <i class="fas fa-plug"></i> Test Connection
                </button>
              </div>
            </div>
          </div>

          <div class="card mb-4">
            <div class="card-header d-flex justify-content-between align-items-center">
              <h5 class="mb-0">
                <i class="fas fa-envelope text-primary"></i> Email Integration
              </h5>
              <span class="integration-status ${userIntegrations.email?.enabled ? 'integration-connected' : 'integration-disconnected'}">
                ${userIntegrations.email?.enabled ? 'Connected' : 'Disconnected'}
              </span>
            </div>
            <div class="card-body">
              <div class="form-check mb-3">
                <input class="form-check-input" type="checkbox" id="emailEnabled" 
                       ${userIntegrations.email?.enabled ? 'checked' : ''}>
                <label class="form-check-label" for="emailEnabled">
                  Enable email integration
                </label>
              </div>
              
              <div id="emailSettings" class="${userIntegrations.email?.enabled ? '' : 'd-none'}">
                <div class="form-floating mb-3">
                  <textarea class="form-control" id="distributionLists" style="height: 100px" 
                            placeholder="Enter email addresses, one per line">${userIntegrations.email?.distributionLists?.join('\n') || ''}</textarea>
                  <label for="distributionLists">Distribution Lists</label>
                </div>
                
                <button class="btn btn-sm btn-outline-primary" onclick="testEmailConnection()">
                  <i class="fas fa-plug"></i> Test Connection
                </button>
              </div>
            </div>
          </div>
        </div>

        <div class="col-md-4">
          <div class="card mb-4">
            <div class="card-header">
              <h5 class="mb-0">Integration Status</h5>
            </div>
            <div class="card-body">
              <div class="d-flex justify-content-between align-items-center mb-2">
                <span>Slack</span>
                <span id="slackStatus" class="badge ${userIntegrations.slack?.enabled ? 'bg-success' : 'bg-secondary'}">
                  ${userIntegrations.slack?.enabled ? 'Enabled' : 'Disabled'}
                </span>
              </div>
              <div class="d-flex justify-content-between align-items-center mb-2">
                <span>Teams</span>
                <span id="teamsStatus" class="badge ${userIntegrations.teams?.enabled ? 'bg-success' : 'bg-secondary'}">
                  ${userIntegrations.teams?.enabled ? 'Enabled' : 'Disabled'}
                </span>
              </div>
              <div class="d-flex justify-content-between align-items-center">
                <span>Email</span>
                <span id="emailStatus" class="badge ${userIntegrations.email?.enabled ? 'bg-success' : 'bg-secondary'}">
                  ${userIntegrations.email?.enabled ? 'Enabled' : 'Disabled'}  
                </span>
              </div>
            </div>
          </div>

          <div class="card mb-4">
            <div class="card-header">
              <h5 class="mb-0">Quick Setup Guide</h5>
            </div>
            <div class="card-body">
              <div class="accordion" id="setupAccordion">
                <div class="accordion-item">
                  <h2 class="accordion-header">
                    <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#slackSetup">
                      Slack Setup
                    </button>
                  </h2>
                  <div id="slackSetup" class="accordion-collapse collapse" data-bs-parent="#setupAccordion">
                    <div class="accordion-body">
                      <ol class="list-unstyled">
                        <li>1. Create a Slack app in your workspace</li>
                        <li>2. Add bot permissions: chat:write, channels:read</li>
                        <li>3. Install the app to your workspace</li>
                        <li>4. Copy the Bot User OAuth Token</li>
                        <li>5. Paste the token above and test connection</li>
                      </ol>
                    </div>
                  </div>
                </div>
                
                <div class="accordion-item">
                  <h2 class="accordion-header">
                    <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#teamsSetup">
                      Teams Setup
                    </button>
                  </h2>
                  <div id="teamsSetup" class="accordion-collapse collapse" data-bs-parent="#setupAccordion">
                    <div class="accordion-body">
                      <ol class="list-unstyled">
                        <li>1. Register an app in Azure AD</li>
                        <li>2. Add Microsoft Graph permissions</li>
                        <li>3. Create a client secret</li>
                        <li>4. Get your tenant, team, and channel IDs</li>
                        <li>5. Enter the details above and test</li>
                      </ol>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="card">
            <div class="card-header">
              <h5 class="mb-0">Recent Activity</h5>
            </div>
            <div class="card-body">
              <div id="recentActivity" class="text-muted">
                <small>No recent integration activity</small>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    // Set up event listeners
    setupIntegrationEventListeners();
    
    hideLoading();
  } catch (error) {
    hideLoading();
    showAlert('Failed to load integrations: ' + error.message, 'danger');
  }
}

function setupIntegrationEventListeners() {
  // Slack toggle
  document.getElementById('slackEnabled').addEventListener('change', (e) => {
    const settings = document.getElementById('slackSettings');
    const status = document.getElementById('slackStatus');
    
    if (e.target.checked) {
      settings.classList.remove('d-none');
      status.className = 'badge bg-warning';
      status.textContent = 'Configuring';
    } else {
      settings.classList.add('d-none');
      status.className = 'badge bg-secondary';
      status.textContent = 'Disabled';
    }
  });

  // Teams toggle
  document.getElementById('teamsEnabled').addEventListener('change', (e) => {
    const settings = document.getElementById('teamsSettings');
    const status = document.getElementById('teamsStatus');
    
    if (e.target.checked) {
      settings.classList.remove('d-none');
      status.className = 'badge bg-warning';
      status.textContent = 'Configuring';
    } else {
      settings.classList.add('d-none');
      status.className = 'badge bg-secondary';
      status.textContent = 'Disabled';
    }
  });

  // Email toggle
  document.getElementById('emailEnabled').addEventListener('change', (e) => {
    const settings = document.getElementById('emailSettings');
    const status = document.getElementById('emailStatus');
    
    if (e.target.checked) {
      settings.classList.remove('d-none');
      status.className = 'badge bg-success';
      status.textContent = 'Enabled';
    } else {
      settings.classList.add('d-none');
      status.className = 'badge bg-secondary';
      status.textContent = 'Disabled';
    }
  });
}

async function testSlackConnection() {
  const token = document.getElementById('slackToken').value;
  
  if (!token) {
    showAlert('Please enter a Slack bot token', 'warning');
    return;
  }

  try {
    showLoading();
    const result = await integrationAPI.testConnection({
      platform: 'slack',
      config: { token }
    });

    hideLoading();
    
    if (result.success) {
      showAlert(`Slack connection successful! Connected to ${result.team}`, 'success');
      // Update status
      document.getElementById('slackStatus').className = 'badge bg-success';
      document.getElementById('slackStatus').textContent = 'Connected';
      
      // Load channels
      loadSlackChannels();
    } else {
      showAlert(`Slack connection failed: ${result.error}`, 'danger');
      document.getElementById('slackStatus').className = 'badge bg-danger';
      document.getElementById('slackStatus').textContent = 'Failed';
    }
  } catch (error) {
    hideLoading();
    showAlert('Failed to test Slack connection: ' + error.message, 'danger');
  }
}

async function loadSlackChannels() {
  const token = document.getElementById('slackToken').value;
  
  if (!token) {
    showAlert('Please enter a Slack bot token first', 'warning');
    return;
  }

  try {
    const result = await integrationAPI.getSlackChannels(token);
    const channelSelect = document.getElementById('slackChannel');
    
    if (result.success) {
      channelSelect.innerHTML = '<option value="">Select Channel</option>';
      result.channels.forEach(channel => {
        const option = document.createElement('option');
        option.value = channel.id;
        option.textContent = `#${channel.name} (${channel.memberCount} members)`;
        channelSelect.appendChild(option);
      });
      
      showAlert(`Loaded ${result.channels.length} channels`, 'success');
    } else {
      showAlert('Failed to load channels: ' + result.error, 'danger');
    }
  } catch (error) {
    showAlert('Failed to load Slack channels: ' + error.message, 'danger');
  }
}

async function testTeamsConnection() {
  const config = {
    clientId: document.getElementById('teamsClientId').value,
    clientSecret: document.getElementById('teamsClientSecret').value,
    tenantId: document.getElementById('teamsTenantId').value,
    teamId: document.getElementById('teamsTeamId').value,
    channelId: document.getElementById('teamsChannelId').value
  };

  // Validate required fields
  if (!config.clientId || !config.clientSecret || !config.tenantId) {
    showAlert('Please fill in all required Teams configuration fields', 'warning');
    return;
  }

  try {
    showLoading();
    const result = await integrationAPI.testConnection({
      platform: 'teams',
      config
    });

    hideLoading();
    
    if (result.success) {
      showAlert('Teams connection successful!', 'success');
      document.getElementById('teamsStatus').className = 'badge bg-success';
      document.getElementById('teamsStatus').textContent = 'Connected';
    } else {
      showAlert(`Teams connection failed: ${result.error}`, 'danger');
      document.getElementById('teamsStatus').className = 'badge bg-danger';
      document.getElementById('teamsStatus').textContent = 'Failed';
    }
  } catch (error) {
    hideLoading();
    showAlert('Failed to test Teams connection: ' + error.message, 'danger');
  }
}

async function testEmailConnection() {
  try {
    showLoading();
    const result = await integrationAPI.testConnection({
      platform: 'email',
      config: {}
    });

    hideLoading();
    
    if (result.success) {
      showAlert('Email connection successful!', 'success');
      document.getElementById('emailStatus').className = 'badge bg-success';
      document.getElementById('emailStatus').textContent = 'Connected';
    } else {
      showAlert(`Email connection failed: ${result.error}`, 'danger');
      document.getElementById('emailStatus').className = 'badge bg-danger';
      document.getElementById('emailStatus').textContent = 'Failed';
    }
  } catch (error) {
    hideLoading();
    showAlert('Failed to test email connection: ' + error.message, 'danger');
  }
}

async function testAllConnections() {
  const promises = [];
  
  if (document.getElementById('slackEnabled').checked) {
    promises.push(testSlackConnection());
  }
  
  if (document.getElementById('teamsEnabled').checked) {
    promises.push(testTeamsConnection());
  }
  
  if (document.getElementById('emailEnabled').checked) {
    promises.push(testEmailConnection());
  }

  if (promises.length === 0) {
    showAlert('No integrations enabled to test', 'warning');
    return;
  }

  try {
    await Promise.all(promises);
    showAlert('All connection tests completed', 'info');
  } catch (error) {
    showAlert('Some connection tests failed', 'warning');
  }
}

async function saveIntegrationSettings() {
  try {
    const distributionLists = document.getElementById('distributionLists').value
      .split('\n')
      .map(email => email.trim())
      .filter(email => email);

    const settings = {
      slack: {
        enabled: document.getElementById('slackEnabled').checked,
        token: document.getElementById('slackToken').value,
        channelId: document.getElementById('slackChannel').value
      },
      teams: {
        enabled: document.getElementById('teamsEnabled').checked,
        clientId: document.getElementById('teamsClientId').value,
        clientSecret: document.getElementById('teamsClientSecret').value,
        tenantId: document.getElementById('teamsTenantId').value,
        teamId: document.getElementById('teamsTeamId').value,
        channelId: document.getElementById('teamsChannelId').value
      },
      email: {
        enabled: document.getElementById('emailEnabled').checked,
        distributionLists
      }
    };

    showLoading();
    await integrationAPI.updateUserIntegrations(settings);
    hideLoading();
    
    showAlert('Integration settings saved successfully!', 'success');
  } catch (error) {
    hideLoading();
    showAlert('Failed to save integration settings: ' + error.message, 'danger');
  }
}

// Distribution functions for sending messages
async function showDistributionModal(messageId) {
  try {
    const [message, integrations] = await Promise.all([
      messageAPI.getById(messageId),
      integrationAPI.getUserIntegrations()
    ]);

    const modalHTML = `
      <div class="modal fade" id="distributionModal" tabindex="-1">
        <div class="modal-dialog modal-lg">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">Distribute Message</h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <div class="modal-body">
              <div class="card mb-3">
                <div class="card-header">
                  <h6 class="mb-0">Message Preview</h6>
                </div>
                <div class="card-body">
                  <strong>Subject:</strong> ${message.subject}<br>
                  <strong>Content:</strong> 
                  <div class="mt-2 p-2 bg-light border rounded" style="max-height: 150px; overflow-y: auto;">
                    ${message.content.substring(0, 300)}${message.content.length > 300 ? '...' : ''}
                  </div>
                </div>
              </div>

              <div class="card">
                <div class="card-header">
                  <h6 class="mb-0">Distribution Options</h6>
                </div>
                <div class="card-body">
                  <form id="distributionForm">
                    ${integrations.slack?.enabled ? `
                      <div class="form-check mb-3">
                        <input class="form-check-input" type="checkbox" id="distributeSlack">
                        <label class="form-check-label" for="distributeSlack">
                          <i class="fab fa-slack text-primary"></i> Send to Slack
                        </label>
                        <div class="ms-4 mt-2">
                          <select class="form-select form-select-sm" id="slackChannelSelect">
                            <option value="">Select Channel</option>
                            <!-- Channels would be loaded here -->
                          </select>
                        </div>
                      </div>
                    ` : ''}

                    ${integrations.teams?.enabled ? `
                      <div class="form-check mb-3">
                        <input class="form-check-input" type="checkbox" id="distributeTeams">
                        <label class="form-check-label" for="distributeTeams">
                          <i class="fab fa-microsoft text-primary"></i> Send to Teams
                        </label>
                      </div>
                    ` : ''}

                    ${integrations.email?.enabled ? `
                      <div class="form-check mb-3">
                        <input class="form-check-input" type="checkbox" id="distributeEmail" checked>
                        <label class="form-check-label" for="distributeEmail">
                          <i class="fas fa-envelope text-primary"></i> Send via Email
                        </label>
                        <div class="ms-4 mt-2">
                          <textarea class="form-control form-control-sm" id="emailRecipients" rows="3" 
                                    placeholder="Enter email addresses, one per line">${integrations.email.distributionLists?.join('\n') || ''}</textarea>
                        </div>
                      </div>
                    ` : ''}

                    <div class="form-check">
                      <input class="form-check-input" type="checkbox" id="scheduleDelivery">
                      <label class="form-check-label" for="scheduleDelivery">
                        Schedule for later
                      </label>
                      <div class="ms-4 mt-2" id="scheduleSettings" style="display: none;">
                        <input type="datetime-local" class="form-control form-control-sm" id="scheduleDateTime">
                      </div>
                    </div>
                  </form>
                </div>
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
              <button type="button" class="btn btn-primary" onclick="distributeMessage('${messageId}')">
                <i class="fas fa-paper-plane"></i> Send Now
              </button>
            </div>
          </div>
        </div>
      </div>
    `;

    // Remove existing modal
    const existingModal = document.getElementById('distributionModal');
    if (existingModal) {
      existingModal.remove();
    }

    // Add modal to DOM
    document.body.insertAdjacentHTML('beforeend', modalHTML);

    // Set up schedule toggle
    document.getElementById('scheduleDelivery').addEventListener('change', (e) => {
      const scheduleSettings = document.getElementById('scheduleSettings');
      if (e.target.checked) {
        scheduleSettings.style.display = 'block';
      } else {
        scheduleSettings.style.display = 'none';
      }
    });

    // Show modal
    const modal = new bootstrap.Modal(document.getElementById('distributionModal'));
    modal.show();

  } catch (error) {
    showAlert('Failed to load distribution options: ' + error.message, 'danger');
  }
}

async function distributeMessage(messageId) {
  try {
    const distributions = [];
    
    // Check Slack
    if (document.getElementById('distributeSlack')?.checked) {
      const channel = document.getElementById('slackChannelSelect').value;
      if (!channel) {
        showAlert('Please select a Slack channel', 'warning');
        return;
      }
      distributions.push({
        platform: 'slack',
        config: { channel }
      });
    }

    // Check Teams
    if (document.getElementById('distributeTeams')?.checked) {
      distributions.push({
        platform: 'teams',
        config: {} // Team config from user settings
      });
    }

    // Check Email
    if (document.getElementById('distributeEmail')?.checked) {
      const recipients = document.getElementById('emailRecipients').value
        .split('\n')
        .map(email => email.trim())
        .filter(email => email);
      
      if (recipients.length === 0) {
        showAlert('Please enter email recipients', 'warning');
        return;
      }
      
      distributions.push({
        platform: 'email',
        config: { to: recipients }
      });
    }

    if (distributions.length === 0) {
      showAlert('Please select at least one distribution method', 'warning');
      return;
    }

    showLoading();

    // Check if scheduled
    const isScheduled = document.getElementById('scheduleDelivery').checked;
    
    if (isScheduled) {
      const scheduleDateTime = document.getElementById('scheduleDateTime').value;
      if (!scheduleDateTime) {
        showAlert('Please select a schedule date and time', 'warning');
        hideLoading();
        return;
      }
      
      await integrationAPI.schedule({
        messageId,
        scheduledFor: scheduleDateTime,
        distributions
      });
      
      showAlert('Message scheduled successfully!', 'success');
    } else {
      const result = await integrationAPI.send({
        messageId,
        distributions
      });
      
      const successCount = result.results.filter(r => r.status === 'sent').length;
      const failCount = result.results.filter(r => r.status === 'failed').length;
      
      if (successCount > 0 && failCount === 0) {
        showAlert(`Message sent successfully to ${successCount} platform(s)!`, 'success');
      } else if (successCount > 0) {
        showAlert(`Message sent to ${successCount} platform(s), ${failCount} failed`, 'warning');
      } else {
        showAlert('Failed to send message to all platforms', 'danger');
      }
    }

    hideLoading();
    
    // Close modal
    const modal = bootstrap.Modal.getInstance(document.getElementById('distributionModal'));
    if (modal) {
      modal.hide();
    }

  } catch (error) {
    hideLoading();
    showAlert('Failed to distribute message: ' + error.message, 'danger');
  }
}