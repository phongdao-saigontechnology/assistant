import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class WebsiteService {
  constructor() {
    this.websiteDir = path.join(__dirname, '../../public/demo');
    this.ensureDirectoryExists();
  }

  async ensureDirectoryExists() {
    try {
      await fs.access(this.websiteDir);
    } catch {
      await fs.mkdir(this.websiteDir, { recursive: true });
    }
  }

  async publishToWebsite(message, companyInfo = {}) {
    try {
      const websiteData = {
        id: message._id.toString(),
        title: message.title,
        subject: message.subject,
        content: message.content,
        category: message.category,
        tone: message.tone,
        publishedAt: new Date(),
        author: message.createdBy?.name || 'Internal Communications',
        company: companyInfo.name || 'Demo Company'
      };

      // Generate HTML page
      const htmlContent = this.generateMessagePage(websiteData);
      const fileName = `message-${websiteData.id}.html`;
      const filePath = path.join(this.websiteDir, fileName);
      
      await fs.writeFile(filePath, htmlContent);

      // Update index page
      await this.updateIndexPage();

      return {
        success: true,
        url: `/demo/${fileName}`,
        publishedAt: websiteData.publishedAt
      };
    } catch (error) {
      console.error('Website publication error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  generateMessagePage(data) {
    const categoryDisplayNames = {
      'policy_update': 'Policy Update',
      'leadership_announcement': 'Leadership Announcement',
      'event_invitation': 'Event Invitation',
      'general_update': 'General Update',
      'urgent_notice': 'Urgent Notice'
    };

    const toneClasses = {
      'professional': 'tone-professional',
      'friendly': 'tone-friendly',
      'urgent': 'tone-urgent',
      'celebratory': 'tone-celebratory'
    };

    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${data.subject} - ${data.company}</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">
    <style>
        .demo-header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 2rem 0;
        }
        .message-content {
            line-height: 1.7;
            font-size: 1.1rem;
        }
        .tone-professional { border-left: 4px solid #0d6efd; }
        .tone-friendly { border-left: 4px solid #198754; }
        .tone-urgent { border-left: 4px solid #dc3545; }
        .tone-celebratory { border-left: 4px solid #fd7e14; }
        .category-badge {
            background: rgba(102, 126, 234, 0.1);
            color: #667eea;
            border: 1px solid rgba(102, 126, 234, 0.3);
        }
        .demo-banner {
            background: #f8f9fa;
            border-left: 4px solid #667eea;
            margin-bottom: 2rem;
        }
        .back-link {
            color: #667eea;
            text-decoration: none;
        }
        .back-link:hover {
            color: #764ba2;
        }
    </style>
</head>
<body>
    <div class="demo-banner p-3">
        <div class="container">
            <div class="d-flex align-items-center">
                <i class="fas fa-robot me-2 text-primary"></i>
                <small class="text-muted">
                    <strong>AI-Generated Communication Demo</strong> - This content was created using our Internal Communications Assistant
                </small>
                <a href="/demo" class="ms-auto back-link">
                    <i class="fas fa-arrow-left me-1"></i> Back to Demo Home
                </a>
            </div>
        </div>
    </div>

    <header class="demo-header">
        <div class="container">
            <div class="row align-items-center">
                <div class="col-md-8">
                    <h1 class="mb-0">${data.company}</h1>
                    <p class="mb-0 opacity-75">Internal Communications</p>
                </div>
                <div class="col-md-4 text-md-end">
                    <span class="badge category-badge fs-6">${categoryDisplayNames[data.category] || data.category}</span>
                </div>
            </div>
        </div>
    </header>

    <main class="container my-5">
        <div class="row justify-content-center">
            <div class="col-lg-8">
                <article class="card shadow-sm ${toneClasses[data.tone]}">
                    <div class="card-body p-4">
                        <header class="mb-4 pb-3 border-bottom">
                            <h1 class="card-title h2 mb-3">${data.subject}</h1>
                            <div class="d-flex justify-content-between align-items-center text-muted">
                                <div>
                                    <i class="fas fa-user me-1"></i>
                                    <span>${data.author}</span>
                                </div>
                                <div>
                                    <i class="fas fa-calendar me-1"></i>
                                    <span>${new Date(data.publishedAt).toLocaleDateString('en-US', { 
                                        year: 'numeric', 
                                        month: 'long', 
                                        day: 'numeric' 
                                    })}</span>
                                </div>
                            </div>
                        </header>
                        
                        <div class="message-content">
                            ${data.content.replace(/\n/g, '<br><br>')}
                        </div>
                    </div>
                </article>

                <div class="mt-4 p-3 bg-light rounded">
                    <h6 class="text-muted mb-2">
                        <i class="fas fa-info-circle me-1"></i>
                        About This Demo
                    </h6>
                    <p class="small text-muted mb-0">
                        This communication was generated using AI to demonstrate the capabilities of our Internal Communications Assistant. 
                        The system can create professional, contextually appropriate messages for various business scenarios while maintaining 
                        your company's tone and branding guidelines.
                    </p>
                </div>
            </div>
        </div>
    </main>

    <footer class="bg-light py-4 mt-5">
        <div class="container text-center">
            <p class="text-muted mb-0">
                <i class="fas fa-robot me-1"></i>
                Powered by AI Internal Communications Assistant
            </p>
        </div>
    </footer>

    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html>`;
  }

  async updateIndexPage() {
    try {
      // Get all published messages
      const files = await fs.readdir(this.websiteDir);
      const messageFiles = files.filter(f => f.startsWith('message-') && f.endsWith('.html'));
      
      const indexContent = this.generateIndexPage(messageFiles);
      await fs.writeFile(path.join(this.websiteDir, 'index.html'), indexContent);
    } catch (error) {
      console.error('Error updating index page:', error);
    }
  }

  generateIndexPage(messageFiles) {
    const messageLinks = messageFiles.map(file => {
      const messageId = file.replace('message-', '').replace('.html', '');
      return `<li><a href="${file}" class="text-decoration-none">Message ${messageId.substring(0, 8)}...</a></li>`;
    }).join('\n                ');

    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>AI Communications Demo - Internal Communications Assistant</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">
    <style>
        .hero-section {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 4rem 0;
        }
        .feature-card {
            transition: transform 0.2s;
            border: none;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .feature-card:hover {
            transform: translateY(-5px);
        }
        .demo-list a {
            color: #667eea;
            padding: 0.5rem 0;
            display: block;
            border-bottom: 1px solid #eee;
        }
        .demo-list a:hover {
            background-color: #f8f9fa;
            padding-left: 1rem;
            transition: all 0.2s;
        }
    </style>
</head>
<body>
    <header class="hero-section text-center">
        <div class="container">
            <div class="row justify-content-center">
                <div class="col-lg-8">
                    <i class="fas fa-robot fa-3x mb-4"></i>
                    <h1 class="display-4 fw-bold mb-3">AI Communications Demo</h1>
                    <p class="lead mb-4">
                        Experience the power of AI-generated internal communications. 
                        Professional, consistent, and contextually appropriate messages created instantly.
                    </p>
                    <div class="badge bg-white text-primary fs-6 px-3 py-2">
                        <i class="fas fa-sparkles me-1"></i>
                        Powered by Google Gemini AI
                    </div>
                </div>
            </div>
        </div>
    </header>

    <section class="py-5">
        <div class="container">
            <div class="row text-center mb-5">
                <div class="col-12">
                    <h2 class="h3 mb-3">Key Features</h2>
                    <p class="text-muted">Transform your internal communications with AI-powered assistance</p>
                </div>
            </div>
            <div class="row g-4">
                <div class="col-md-4">
                    <div class="card feature-card h-100 text-center p-4">
                        <div class="card-body">
                            <i class="fas fa-magic fa-2x text-primary mb-3"></i>
                            <h5 class="card-title">AI-Powered Generation</h5>
                            <p class="card-text">Create professional communications instantly using advanced AI that understands your company's tone and style.</p>
                        </div>
                    </div>
                </div>
                <div class="col-md-4">
                    <div class="card feature-card h-100 text-center p-4">
                        <div class="card-body">
                            <i class="fas fa-palette fa-2x text-success mb-3"></i>
                            <h5 class="card-title">Multiple Tones & Styles</h5>
                            <p class="card-text">Choose from professional, friendly, urgent, or celebratory tones to match your message's purpose.</p>
                        </div>
                    </div>
                </div>
                <div class="col-md-4">
                    <div class="card feature-card h-100 text-center p-4">
                        <div class="card-body">
                            <i class="fas fa-share-alt fa-2x text-warning mb-3"></i>
                            <h5 class="card-title">Multi-Platform Distribution</h5>
                            <p class="card-text">Publish to Teams, Slack, email, or showcase on your company website with one click.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <section class="py-5 bg-light">
        <div class="container">
            <div class="row">
                <div class="col-lg-8 mx-auto text-center">
                    <h2 class="h3 mb-4">Demo Communications</h2>
                    <p class="text-muted mb-4">
                        Browse example communications generated by our AI assistant. 
                        Each message demonstrates different categories, tones, and use cases.
                    </p>
                    
                    ${messageFiles.length > 0 ? `
                    <div class="card">
                        <div class="card-body">
                            <h6 class="card-title text-start mb-3">
                                <i class="fas fa-list me-2"></i>
                                Published Communications
                            </h6>
                            <ul class="list-unstyled demo-list text-start">
                                ${messageLinks}
                            </ul>
                        </div>
                    </div>
                    ` : `
                    <div class="alert alert-info">
                        <i class="fas fa-info-circle me-2"></i>
                        No demo communications have been published yet. 
                        Use the application to generate and publish messages to see them here.
                    </div>
                    `}
                </div>
            </div>
        </div>
    </section>

    <section class="py-5">
        <div class="container text-center">
            <div class="row justify-content-center">
                <div class="col-lg-6">
                    <h2 class="h3 mb-3">Ready to Get Started?</h2>
                    <p class="text-muted mb-4">
                        Experience the future of internal communications with our AI-powered assistant.
                    </p>
                    <a href="/" class="btn btn-primary btn-lg">
                        <i class="fas fa-rocket me-2"></i>
                        Try the Application
                    </a>
                </div>
            </div>
        </div>
    </section>

    <footer class="bg-dark text-white py-4">
        <div class="container text-center">
            <p class="mb-0">
                <i class="fas fa-robot me-2"></i>
                AI Internal Communications Assistant Demo
            </p>
        </div>
    </footer>

    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html>`;
  }

  async getPublishedMessages() {
    try {
      const files = await fs.readdir(this.websiteDir);
      const messageFiles = files.filter(f => f.startsWith('message-') && f.endsWith('.html'));
      
      return messageFiles.map(file => ({
        filename: file,
        messageId: file.replace('message-', '').replace('.html', ''),
        url: `/demo/${file}`
      }));
    } catch (error) {
      console.error('Error getting published messages:', error);
      return [];
    }
  }
}

export default new WebsiteService();