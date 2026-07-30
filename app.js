/* ==========================================================================
   STATE MANAGEMENT & CONFIGURATION
   ========================================================================== */
const state = {
  filesQueue: [], // Array of objects: { id, file, name, size, resolution: '-', status: 'pending', webpBlob: null, webpSize: 0, webpUrl: '' }
  isConverting: false,
  downloadMode: 'zip', // 'zip' | 'individual'
  compressionMetric: 'lossy', // 'lossy' | 'lossless'
  qualityValue: 85,
  preserveTransparency: true,
  autoDownload: false,
  searchQuery: '',
  user: null,
  pendingOtpUser: null
};

// DOM Elements
const elements = {
  Navbar: document.getElementById('Navbar'),
  pulseDot: document.getElementById('pulse-dot'),
  downloadModeControl: document.getElementById('download-mode-control'),
  downloadModeHelper: document.getElementById('download-mode-helper'),
  compressionMetricControl: document.getElementById('compression-metric-control'),
  qualitySliderContainer: document.getElementById('quality-slider-container'),
  qualitySlider: document.getElementById('quality-slider'),
  qualityBadge: document.getElementById('quality-badge'),
  preserveTransparencyCheckbox: document.getElementById('preserve-transparency'),
  autoDownloadCheckbox: document.getElementById('auto-download'),
  btnConvert: document.getElementById('btn-convert'),
  btnDownloadAll: document.getElementById('btn-download-all'),
  btnClear: document.getElementById('btn-clear'),
  dragDropArea: document.getElementById('drag-drop-area'),
  fileInput: document.getElementById('file-input'),
  workspaceStack: document.getElementById('workspace-stack'),
  emptyStateView: document.getElementById('empty-state-view'),
  tableView: document.getElementById('table-view'),
  btnImportMock: document.getElementById('btn-import-mock'),
  searchInput: document.getElementById('search-input'),
  filesTableBody: document.getElementById('files-table-body'),
  progressBar: document.getElementById('progress-bar'),
  progressContainer: document.getElementById('progress-container'),
  statsText: document.getElementById('stats-text'),
  
  // Auth DOM Elements
  authContainer: document.getElementById('auth-container'),
  dashboardContainer: document.getElementById('dashboard-container'),
  developerFooter: document.getElementById('DeveloperFooter'),
  tabLogin: document.getElementById('tab-login'),
  tabSignup: document.getElementById('tab-signup'),
  loginForm: document.getElementById('login-form'),
  signupForm: document.getElementById('signup-form'),
  loginError: document.getElementById('login-error'),
  signupError: document.getElementById('signup-error'),
  signupSuccess: document.getElementById('signup-success'),
  userProfileHeader: document.getElementById('user-profile-header'),
  userDisplayName: document.getElementById('user-display-name'),
  btnLogout: document.getElementById('btn-logout'),

  // OTP DOM Elements
  otpForm: document.getElementById('otp-form'),
  otpCodeInput: document.getElementById('otp-code-input'),
  otpError: document.getElementById('otp-error'),
  otpSuccess: document.getElementById('otp-success'),
  otpEmailDisplay: document.getElementById('otp-email-display'),
  btnResendOtp: document.getElementById('btn-resend-otp'),
  btnGoogleLogin: document.querySelector('.btn-google-login'),
  btnGoogleSignup: document.querySelector('.btn-google-signup'),

  // Google Modal Elements
  googleModal: document.getElementById('google-modal'),
  btnCloseGoogle: document.getElementById('btn-close-google'),
  btnConfirmGoogleAuth: document.getElementById('btn-confirm-google-auth'),
  googleEmailInput: document.getElementById('google-email-input'),

  // Forgot Password Elements
  linkForgotPassword: document.getElementById('link-forgot-password'),
  forgotForm: document.getElementById('forgot-form'),
  forgotUsername: document.getElementById('forgot-username'),
  forgotError: document.getElementById('forgot-error'),
  forgotSuccess: document.getElementById('forgot-success'),
  resetForm: document.getElementById('reset-form'),
  resetOtpInput: document.getElementById('reset-otp-input'),
  resetNewPassword: document.getElementById('reset-new-password'),
  resetError: document.getElementById('reset-error'),
  resetSuccess: document.getElementById('reset-success'),

  // SaaS Pricing & API Elements
  navLinkPricing: document.getElementById('nav-link-pricing'),
  navLinkApi: document.getElementById('nav-link-api'),
  pricingModal: document.getElementById('pricing-modal'),
  btnClosePricing: document.getElementById('btn-close-pricing'),
  apiKeyModal: document.getElementById('api-key-modal'),
  btnCloseApi: document.getElementById('btn-close-api'),
  apiKeyDisplay: document.getElementById('api-key-display'),
  btnCopyApiKey: document.getElementById('btn-copy-api-key'),
  btnGenerateApiKey: document.getElementById('btn-generate-api-key'),

  // Payment Checkout Modal Elements
  checkoutMethodModal: document.getElementById('checkout-method-modal'),
  btnCloseCheckoutModal: document.getElementById('btn-close-checkout-modal'),
  checkoutSelectedPlanName: document.getElementById('checkout-selected-plan-name'),
  tabPaymentCard: document.getElementById('tab-payment-card'),
  tabPaymentLocal: document.getElementById('tab-payment-local'),
  paymentViewCard: document.getElementById('payment-view-card'),
  paymentViewLocal: document.getElementById('payment-view-local'),
  btnProceedCardPayment: document.getElementById('btn-proceed-card-payment'),
  localTrxForm: document.getElementById('local-trx-form'),
  trxIdInput: document.getElementById('trx-id-input'),
  trxError: document.getElementById('trx-error'),
  trxSuccess: document.getElementById('trx-success'),

  // Dedicated Admin Panel Modal Elements
  btnAdminPortal: document.getElementById('btn-admin-portal'),
  adminPanelModal: document.getElementById('admin-panel-modal'),
  btnCloseAdminPanel: document.getElementById('btn-close-admin-panel'),
  adminStatTotalUsers: document.getElementById('admin-stat-total-users'),
  adminStatTotalCredits: document.getElementById('admin-stat-total-credits'),
  adminStatDbMode: document.getElementById('admin-stat-db-mode'),
  adminTabUsers: document.getElementById('admin-tab-users'),
  adminTabCreate: document.getElementById('admin-tab-create'),
  adminViewUsersList: document.getElementById('admin-view-users-list'),
  adminViewCreateUser: document.getElementById('admin-view-create-user'),
  adminPanelUsersTbody: document.getElementById('admin-panel-users-tbody'),
  adminPanelCreateForm: document.getElementById('admin-panel-create-form'),
  admCreateError: document.getElementById('adm-create-error'),
  admCreateSuccess: document.getElementById('adm-create-success'),

  // Help & Docs Modals
  navLinkDocs: document.getElementById('nav-link-docs'),
  navLinkHelp: document.getElementById('nav-link-help'),
  docsModal: document.getElementById('docs-modal'),
  helpModal: document.getElementById('help-modal'),
  btnCloseDocs: document.getElementById('btn-close-docs'),
  btnCloseHelp: document.getElementById('btn-close-help'),
  supportForm: document.getElementById('support-form'),
  supportSuccessMsg: document.getElementById('support-success-msg'),
  btnResetSupport: document.getElementById('btn-reset-support'),

  // Admin and Credits elements
  navbarCredits: document.getElementById('navbar-credits'),
  adminView: document.getElementById('admin-view'),
  adminCreateForm: document.getElementById('admin-create-user-form'),
  adminUsersTableBody: document.getElementById('admin-users-table-body'),
  adminCreateError: document.getElementById('admin-create-error'),
  adminCreateSuccess: document.getElementById('admin-create-success')
};

/* ==========================================================================
   EVENT INITIALIZATION & ROUTING
   ========================================================================== */
function initEvents() {
  // Mock theme toggle and dummy links
  document.querySelectorAll('.theme-toggle').forEach(el => {
    el.addEventListener('click', (e) => {
      e.preventDefault();
    });
  });

  // Segmented control: Download Mode
  elements.downloadModeControl.addEventListener('click', (e) => {
    const btn = e.target.closest('.segment-btn');
    if (!btn) return;
    
    // Toggle active state
    elements.downloadModeControl.querySelectorAll('.segment-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    
    state.downloadMode = btn.dataset.mode;
    
    // Update helper text & download button display
    if (state.downloadMode === 'zip') {
      elements.downloadModeHelper.textContent = "Files will be compiled into a single ZIP archive for bulk download.";
      const completed = state.filesQueue.filter(f => f.status === 'success');
      if (completed.length > 0) {
        elements.btnDownloadAll.style.display = 'inline-flex';
      }
    } else {
      elements.downloadModeHelper.textContent = "Images will download automatically or individually upon conversion.";
      elements.btnDownloadAll.style.display = 'none';
    }
  });

  // Segmented control: Compression Metric
  elements.compressionMetricControl.addEventListener('click', (e) => {
    const btn = e.target.closest('.segment-btn');
    if (!btn) return;
    
    // Toggle active state
    elements.compressionMetricControl.querySelectorAll('.segment-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    
    state.compressionMetric = btn.dataset.metric;
    
    // Handle slider visibility & quality parameters
    if (state.compressionMetric === 'lossless') {
      elements.qualitySlider.disabled = true;
      elements.qualityBadge.textContent = 'Lossless';
      elements.qualityBadge.style.backgroundColor = 'rgba(16, 185, 129, 0.15)';
      elements.qualityBadge.style.color = '#10b981';
    } else {
      elements.qualitySlider.disabled = false;
      elements.qualityBadge.textContent = `${state.qualityValue}%`;
      elements.qualityBadge.style.backgroundColor = 'var(--accent-primary-glow)';
      elements.qualityBadge.style.color = '#818cf8';
    }
  });

  // Quality slider input
  elements.qualitySlider.addEventListener('input', (e) => {
    state.qualityValue = parseInt(e.target.value);
    if (state.compressionMetric !== 'lossless') {
      elements.qualityBadge.textContent = `${state.qualityValue}%`;
    }
  });

  // Checkbox: Preserve Transparency
  elements.preserveTransparencyCheckbox.addEventListener('change', (e) => {
    state.preserveTransparency = e.target.checked;
  });

  // Checkbox: Auto Download
  elements.autoDownloadCheckbox.addEventListener('change', (e) => {
    state.autoDownload = e.target.checked;
  });

  // Drag & drop handlers
  elements.dragDropArea.addEventListener('click', () => {
    if (state.isConverting) return;
    elements.fileInput.click();
  });
  
  elements.btnImportMock.addEventListener('click', () => {
    if (state.isConverting) return;
    elements.fileInput.click();
  });

  elements.fileInput.addEventListener('change', (e) => {
    if (e.target.files.length > 0) {
      handleIncomingFiles(e.target.files);
      e.target.value = ''; // Reset input so same file can be reloaded if cleared
    }
  });

  elements.dragDropArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    if (state.isConverting) return;
    elements.dragDropArea.classList.add('dragover');
  });

  elements.dragDropArea.addEventListener('dragleave', () => {
    elements.dragDropArea.classList.remove('dragover');
  });

  elements.dragDropArea.addEventListener('drop', (e) => {
    e.preventDefault();
    elements.dragDropArea.classList.remove('dragover');
    if (state.isConverting) return;
    
    if (e.dataTransfer.files.length > 0) {
      handleIncomingFiles(e.dataTransfer.files);
    }
  });

  // Search input handler
  elements.searchInput.addEventListener('input', (e) => {
    state.searchQuery = e.target.value.toLowerCase().trim();
    filterTableRows();
  });

  // Action Buttons
  elements.btnConvert.addEventListener('click', startBatchConversion);
  elements.btnClear.addEventListener('click', clearQueue);
  elements.btnDownloadAll.addEventListener('click', downloadZipArchive);

  // Auth Event Listeners
  elements.tabLogin.addEventListener('click', () => toggleAuthTabs('login'));
  elements.tabSignup.addEventListener('click', () => toggleAuthTabs('signup'));
  elements.loginForm.addEventListener('submit', handleLoginSubmit);
  elements.signupForm.addEventListener('submit', handleSignupSubmit);
  elements.btnLogout.addEventListener('click', handleLogout);

  if (elements.linkForgotPassword) {
    elements.linkForgotPassword.addEventListener('click', (e) => {
      e.preventDefault();
      showForgotView();
    });
  }

  if (elements.forgotForm) elements.forgotForm.addEventListener('submit', handleForgotSubmit);
  if (elements.resetForm) elements.resetForm.addEventListener('submit', handleResetSubmit);

  document.querySelectorAll('.link-back-login').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      toggleAuthTabs('login');
    });
  });

  if (elements.otpForm) elements.otpForm.addEventListener('submit', handleOtpSubmit);
  if (elements.btnResendOtp) elements.btnResendOtp.addEventListener('click', handleResendOtp);
  if (elements.btnGoogleLogin) elements.btnGoogleLogin.addEventListener('click', openGoogleAuthModal);
  if (elements.btnGoogleSignup) elements.btnGoogleSignup.addEventListener('click', openGoogleAuthModal);
  if (elements.btnCloseGoogle) elements.btnCloseGoogle.addEventListener('click', closeGoogleAuthModal);
  if (elements.btnConfirmGoogleAuth) elements.btnConfirmGoogleAuth.addEventListener('click', handleConfirmGoogleAuth);

  // SaaS Pricing & API Key Listeners
  if (elements.navLinkPricing) elements.navLinkPricing.addEventListener('click', (e) => { e.preventDefault(); openPricingModal(); });
  if (elements.navLinkApi) elements.navLinkApi.addEventListener('click', (e) => { e.preventDefault(); openApiKeyModal(); });
  if (elements.btnClosePricing) elements.btnClosePricing.addEventListener('click', closePricingModal);
  if (elements.btnCloseApi) elements.btnCloseApi.addEventListener('click', closeApiKeyModal);
  if (elements.btnGenerateApiKey) elements.btnGenerateApiKey.addEventListener('click', handleGenerateApiKey);
  if (elements.btnCopyApiKey) elements.btnCopyApiKey.addEventListener('click', handleCopyApiKey);

  document.querySelectorAll('.btn-buy-plan').forEach(btn => {
    btn.addEventListener('click', () => {
      const plan = btn.dataset.plan;
      handleBuyPlan(plan);
    });
  });

  if (elements.btnCloseCheckoutModal) elements.btnCloseCheckoutModal.addEventListener('click', closeCheckoutMethodModal);
  if (elements.tabPaymentCard) elements.tabPaymentCard.addEventListener('click', () => switchPaymentTab('card'));
  if (elements.tabPaymentLocal) elements.tabPaymentLocal.addEventListener('click', () => switchPaymentTab('local'));
  if (elements.btnProceedCardPayment) elements.btnProceedCardPayment.addEventListener('click', handleCardPayment);
  if (elements.localTrxForm) elements.localTrxForm.addEventListener('submit', handleLocalTrxSubmit);

  // Dedicated Admin Panel Listeners
  if (elements.btnAdminPortal) elements.btnAdminPortal.addEventListener('click', openAdminPanelModal);
  if (elements.btnCloseAdminPanel) elements.btnCloseAdminPanel.addEventListener('click', closeAdminPanelModal);
  if (elements.adminTabUsers) elements.adminTabUsers.addEventListener('click', () => switchAdminTab('users'));
  if (elements.adminTabCreate) elements.adminTabCreate.addEventListener('click', () => switchAdminTab('create'));
  if (elements.adminPanelCreateForm) elements.adminPanelCreateForm.addEventListener('submit', handleAdminPanelCreateUserSubmit);

  // Help & Docs Modals Listeners
  elements.navLinkDocs.addEventListener('click', (e) => { 
    e.preventDefault(); 
    elements.docsModal.style.display = 'flex'; 
  });
  elements.navLinkHelp.addEventListener('click', (e) => { 
    e.preventDefault(); 
    elements.helpModal.style.display = 'flex'; 
  });
  
  elements.btnCloseDocs.addEventListener('click', () => { 
    elements.docsModal.style.display = 'none'; 
  });

  const resetHelpModalFormView = () => {
    if (elements.supportSuccessMsg && elements.supportForm) {
      elements.supportSuccessMsg.style.display = 'none';
      elements.supportForm.style.display = 'block';
    }
  };

  elements.btnCloseHelp.addEventListener('click', () => { 
    elements.helpModal.style.display = 'none'; 
    resetHelpModalFormView();
  });
  
  // Close modals on clicking outside of modal content
  window.addEventListener('click', (e) => {
    if (e.target === elements.docsModal) {
      elements.docsModal.style.display = 'none';
    }
    if (e.target === elements.helpModal) {
      elements.helpModal.style.display = 'none';
      resetHelpModalFormView();
    }
    if (e.target === elements.googleModal) {
      closeGoogleAuthModal();
    }
    if (e.target === elements.pricingModal) {
      closePricingModal();
    }
    if (e.target === elements.apiKeyModal) {
      closeApiKeyModal();
    }
    if (e.target === elements.checkoutMethodModal) {
      closeCheckoutMethodModal();
    }
    if (e.target === elements.adminPanelModal) {
      closeAdminPanelModal();
    }
  });

  // Docs Tab Switcher
  const tabButtons = elements.docsModal.querySelectorAll('.modal-tab-btn');
  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      tabButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      
      const targetPaneId = btn.dataset.tab;
      elements.docsModal.querySelectorAll('.modal-pane').forEach(pane => {
        pane.classList.remove('active');
      });
      document.getElementById(targetPaneId).classList.add('active');
    });
  });

  // Support Form Submit Handler
  if (elements.supportForm) {
    elements.supportForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const submitBtn = elements.supportForm.querySelector('button[type="submit"]');
      const origText = submitBtn.textContent;
      
      submitBtn.disabled = true;
      submitBtn.textContent = 'Sending...';
      
      // Simulate submission delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      elements.supportForm.style.display = 'none';
      elements.supportSuccessMsg.style.display = 'block';
      
      // Log Support Request locally
      if (state.user) {
        const key = `support_req_${state.user.username}`;
        const reqs = JSON.parse(localStorage.getItem(key) || '[]');
        reqs.push({
          category: document.getElementById('support-category').value,
          message: document.getElementById('support-message').value,
          date: new Date().toISOString()
        });
        localStorage.setItem(key, JSON.stringify(reqs));
      }
      
      submitBtn.disabled = false;
      submitBtn.textContent = origText;
      elements.supportForm.reset();
    });
  }

  // Reset Support Form Action
  if (elements.btnResetSupport) {
    elements.btnResetSupport.addEventListener('click', () => {
      resetHelpModalFormView();
    });
  }

  // Admin Create User Form listener
  if (elements.adminCreateForm) {
    elements.adminCreateForm.addEventListener('submit', handleAdminCreateUserSubmit);
  }

  // Check if session exists on load
  checkAuthSession();
}

/* ==========================================================================
   QUEUE MANAGEMENT & INCOMING DATA
   ========================================================================== */
function handleIncomingFiles(fileList) {
  const supportedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/bmp', 'image/tiff'];
  const supportedExtensions = ['.png', '.jpg', '.jpeg', '.bmp', '.tiff'];
  let addedAny = false;

  for (let i = 0; i < fileList.length; i++) {
    const file = fileList[i];
    const extension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
    
    // Validate file type
    if (supportedTypes.includes(file.type) || supportedExtensions.includes(extension)) {
      // Avoid duplicate file names already in queue
      if (state.filesQueue.some(item => item.name === file.name && item.size === file.size)) {
        continue;
      }
      
      const fileEntry = {
        id: 'img-' + Math.random().toString(36).substring(2, 9),
        file: file,
        name: file.name,
        size: file.size,
        resolution: 'Pending',
        status: 'pending',
        webpBlob: null,
        webpSize: 0,
        webpUrl: ''
      };
      
      state.filesQueue.push(fileEntry);
      addTableRow(fileEntry);
      addedAny = true;
    }
  }

  if (addedAny) {
    updateStatsDisplay();
    // Reset progress bar
    elements.progressBar.style.width = '0%';
  }
}

function addTableRow(entry) {
  const tr = document.createElement('tr');
  tr.id = entry.id;
  
  // Format original size
  const origSizeFormatted = formatSize(entry.size);

  tr.innerHTML = `
    <td>
      <div class="preview-cell">
        <div class="thumb-preview" id="thumb-${entry.id}">🖼️</div>
        <span class="file-name-txt" title="${escapeHtml(entry.name)}">${escapeHtml(entry.name)}</span>
      </div>
    </td>
    <td style="text-align: center; color: var(--slate-500);" id="res-${entry.id}">Pending</td>
    <td style="text-align: right;" class="size-txt">${origSizeFormatted}</td>
    <td style="text-align: right; color: var(--slate-500);" class="size-txt" id="out-size-${entry.id}">-</td>
    <td style="text-align: center;">
      <span class="status-badge pending" id="status-${entry.id}">Pending</span>
    </td>
  `;

  elements.filesTableBody.appendChild(tr);
}

function updateStatsDisplay() {
  const total = state.filesQueue.length;
  
  if (total === 0) {
    // Show Empty State Onboarding
    elements.emptyStateView.classList.add('active');
    elements.tableView.classList.remove('active');
    elements.btnConvert.disabled = true;
    elements.btnClear.disabled = true;
    elements.btnDownloadAll.style.display = 'none';
  } else {
    // Show File list table
    elements.emptyStateView.classList.remove('active');
    elements.tableView.classList.add('active');
    
    // Recalculate size
    const totalBytes = state.filesQueue.reduce((acc, curr) => acc + curr.size, 0);
    const formattedBytes = formatSize(totalBytes);
    elements.statsText.textContent = `Total Selected: ${total} image(s) | Total File Size: ${formattedBytes}`;
    
    // Enable actions if not converting
    if (!state.isConverting) {
      elements.btnConvert.disabled = false;
      elements.btnClear.disabled = false;
    }
  }
}

function clearQueue() {
  if (state.isConverting) return;
  
  // Revoke blob URLs to prevent memory leaks
  state.filesQueue.forEach(entry => {
    if (entry.webpUrl) URL.revokeObjectURL(entry.webpUrl);
  });
  
  state.filesQueue = [];
  elements.filesTableBody.innerHTML = '';
  elements.progressBar.style.width = '0%';
  updateStatsDisplay();
}

function filterTableRows() {
  state.filesQueue.forEach(entry => {
    const tr = document.getElementById(entry.id);
    if (!tr) return;
    
    if (entry.name.toLowerCase().includes(state.searchQuery)) {
      tr.style.display = '';
    } else {
      tr.style.display = 'none';
    }
  });
}

/* ==========================================================================
   CONVERSION WORKER ENGINE (CLIENT-SIDE CANVAS)
   ========================================================================== */
async function startBatchConversion() {
  if (state.isConverting || state.filesQueue.length === 0) return;
  
  // Credit check for non-admin users
  const pendingImagesCount = state.filesQueue.filter(f => f.status !== 'success').length;
  if (state.user && state.user.username !== 'admin') {
    const currentCredits = parseInt(state.user.credits || '0', 10);
    if (currentCredits < pendingImagesCount) {
      alert(`Insufficient Credits! You are trying to convert ${pendingImagesCount} images, but only have ${currentCredits} credits left. Please contact Bilal Faisal Arain (0327-2190535) to refill credits.`);
      return;
    }
  }

  toggleUIControls(false);
  state.isConverting = true;
  elements.btnConvert.textContent = "Converting...";
  elements.progressBar.style.width = '0%';
  
  // Hide download button during conversion run
  elements.btnDownloadAll.style.display = 'none';

  let processedCount = 0;
  const totalFiles = state.filesQueue.length;

  // Reset previously completed items in case they re-run
  state.filesQueue.forEach(entry => {
    if (entry.status !== 'success') {
      entry.status = 'pending';
      const statusBadge = document.getElementById(`status-${entry.id}`);
      if (statusBadge) {
        statusBadge.textContent = 'Pending';
        statusBadge.className = 'status-badge pending';
      }
    }
  });

  // Batch process
  for (let i = 0; i < state.filesQueue.length; i++) {
    const entry = state.filesQueue[i];
    
    // Skip if already successfully converted (allow resuming/partial runs)
    if (entry.status === 'success') {
      processedCount++;
      elements.progressBar.style.width = `${(processedCount / totalFiles) * 100}%`;
      continue;
    }
    
    const statusBadge = document.getElementById(`status-${entry.id}`);
    if (statusBadge) {
      statusBadge.textContent = 'Converting';
      statusBadge.className = 'status-badge converting';
    }

    try {
      const results = await convertSingleImage(entry);
      
      // Deduct credit for standard user
      let creditDeducted = true;
      if (state.user && state.user.username !== 'admin') {
        try {
          const credRes = await fetch('/api/credits', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: state.user.username, amount: 1 })
          });
          const credData = await credRes.json();
          if (credRes.ok) {
            state.user.credits = credData.credits;
            localStorage.setItem('auth_user', JSON.stringify(state.user));
            elements.navbarCredits.textContent = `Credits: ${state.user.credits}`;
          } else {
            creditDeducted = false;
            throw new Error(credData.error || 'Failed to deduct credits');
          }
        } catch (e) {
          creditDeducted = false;
          alert(`Credit Error: ${e.message}. Conversion stopped.`);
          break; // Stop batch run if credit check fails or is exhausted
        }
      }

      if (creditDeducted) {
        // Update entry state
        entry.status = 'success';
        entry.webpBlob = results.blob;
        entry.webpSize = results.blob.size;
        entry.webpUrl = URL.createObjectURL(results.blob);
        entry.resolution = `${results.width} × ${results.height}`;
        
        // Update UI row elements
        document.getElementById(`res-${entry.id}`).textContent = entry.resolution;
        document.getElementById(`res-${entry.id}`).style.color = '#fff';
        
        const ratio = ((entry.size - entry.webpSize) / entry.size * 100).toFixed(0);
        const outputTxt = document.getElementById(`out-size-${entry.id}`);
        outputTxt.innerHTML = `${formatSize(entry.webpSize)} <span class="ratio-badge">-${ratio}%</span>`;
        outputTxt.style.color = '#fff';
        
        // Load converted image preview thumbnail
        const thumb = document.getElementById(`thumb-${entry.id}`);
        if (thumb) {
          thumb.innerHTML = '';
          const imgEl = document.createElement('img');
          imgEl.src = entry.webpUrl;
          imgEl.className = 'thumb-preview';
          imgEl.style.width = '100%';
          imgEl.style.height = '100%';
          thumb.appendChild(imgEl);
        }
        
        if (statusBadge) {
          statusBadge.textContent = 'Success';
          statusBadge.className = 'status-badge success';
        }
        
        // Handle Auto Download if set
        if (state.autoDownload && state.downloadMode === 'individual') {
          downloadIndividualFile(entry);
        }
      }

    } catch (err) {
      entry.status = 'error';
      if (statusBadge) {
        statusBadge.textContent = 'Error';
        statusBadge.className = 'status-badge error';
        statusBadge.title = err.message || 'Conversion failed';
      }
      document.getElementById(`res-${entry.id}`).textContent = 'Fail';
      document.getElementById(`res-${entry.id}`).style.color = 'var(--status-error)';
    }

    processedCount++;
    elements.progressBar.style.width = `${(processedCount / totalFiles) * 100}%`;
  }

  // Finished batch run
  state.isConverting = false;
  toggleUIControls(true);
  elements.btnConvert.textContent = "Convert Images";
  
  // Show Zip download button if mode is ZIP and we have successful runs
  const successfulRuns = state.filesQueue.filter(f => f.status === 'success');
  if (state.downloadMode === 'zip' && successfulRuns.length > 0) {
    elements.btnDownloadAll.style.display = 'inline-flex';
    elements.btnDownloadAll.textContent = `Download All (${successfulRuns.length} WebP ZIP)`;
  }

}

function convertSingleImage(entry) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(entry.file);
    
    img.onload = () => {
      // Revoke the object URL to save memory
      URL.revokeObjectURL(url);
      
      try {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        
        // Handle transparency pasting (White background replacement)
        if (!state.preserveTransparency) {
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
        
        ctx.drawImage(img, 0, 0);
        
        // Quality fraction: mapping lossless mode to 1.0 or lossy quality range
        const qualityFraction = state.compressionMetric === 'lossless' ? 1.0 : (state.qualityValue / 100);
        
        // Convert to WebP format
        canvas.toBlob((blob) => {
          if (blob) {
            resolve({ blob: blob, width: img.width, height: img.height });
          } else {
            reject(new Error("Canvas WebP blob output failed"));
          }
        }, 'image/webp', qualityFraction);

      } catch (err) {
        reject(err);
      }
    };
    
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Failed to load source image file"));
    };
    
    img.src = url;
  });
}

/* ==========================================================================
   DOWNLOADING & ARCHIVING
   ========================================================================== */
function downloadIndividualFile(entry) {
  if (!entry.webpUrl) return;
  const link = document.createElement('a');
  link.href = entry.webpUrl;
  
  // Swap extension to .webp
  const nameWithoutExt = entry.name.substring(0, entry.name.lastIndexOf('.'));
  link.download = `${nameWithoutExt}.webp`;
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

async function downloadZipArchive() {
  const successfulRuns = state.filesQueue.filter(f => f.status === 'success');
  if (successfulRuns.length === 0) return;
  
  elements.btnDownloadAll.textContent = "Archiving ZIP...";
  elements.btnDownloadAll.disabled = true;

  try {
    const zip = new JSZip();
    
    successfulRuns.forEach(entry => {
      const nameWithoutExt = entry.name.substring(0, entry.name.lastIndexOf('.'));
      zip.file(`${nameWithoutExt}.webp`, entry.webpBlob);
    });

    const content = await zip.generateAsync({ type: 'blob' });
    const zipUrl = URL.createObjectURL(content);
    
    const link = document.createElement('a');
    link.href = zipUrl;
    link.download = `webp_converted_${Date.now()}.zip`;
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Revoke zip blob
    setTimeout(() => URL.revokeObjectURL(zipUrl), 1000);

  } catch (err) {
    alert("Archiving ZIP failed. Try individual download modes. Detail: " + err.message);
  } finally {
    elements.btnDownloadAll.disabled = false;
    elements.btnDownloadAll.textContent = `Download All (${successfulRuns.length} WebP ZIP)`;
  }
}

/* ==========================================================================
   HELPER UTILITY FUNCTIONS
   ========================================================================== */
function toggleUIControls(enabled) {
  // Disable sidebar items during conversion
  elements.qualitySlider.disabled = !enabled || (state.compressionMetric === 'lossless');
  elements.preserveTransparencyCheckbox.disabled = !enabled;
  elements.autoDownloadCheckbox.disabled = !enabled;
  elements.btnClear.disabled = !enabled;
  elements.fileInput.disabled = !enabled;
  
  // Disable all segment controls
  elements.downloadModeControl.querySelectorAll('.segment-btn').forEach(b => b.disabled = !enabled);
  elements.compressionMetricControl.querySelectorAll('.segment-btn').forEach(b => b.disabled = !enabled);
  
  state.isConverting = !enabled;
}

function formatSize(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

function escapeHtml(unsafe) {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/* ==========================================================================
   AUTHENTICATION WORKFLOW FUNCTIONS
   ========================================================================== */
/* ==========================================================================
   AUTHENTICATION WORKFLOW FUNCTIONS
   ========================================================================== */
async function checkAuthSession() {
  const token = localStorage.getItem('auth_token');
  const cachedUser = localStorage.getItem('auth_user');

  if (cachedUser && !token) {
    // Legacy session cleanup
    localStorage.removeItem('auth_user');
  }

  if (token) {
    try {
      const res = await fetch('/api/me', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok && data.user) {
        state.user = data.user;
        localStorage.setItem('auth_user', JSON.stringify(data.user));
        showAuthenticatedApp();
        return;
      } else {
        // Token expired or invalid
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_user');
        showAuthForms();
      }
    } catch (e) {
      console.warn('Network error checking session:', e);
      if (cachedUser) {
        try {
          state.user = JSON.parse(cachedUser);
          showAuthenticatedApp();
          return;
        } catch (err) {}
      }
      showAuthForms();
    }
  } else {
    showAuthForms();
  }
}

function showAuthenticatedApp() {
  elements.authContainer.style.display = 'none';
  elements.developerFooter.style.display = 'block';
  elements.dashboardContainer.style.display = 'flex';
  
  elements.userDisplayName.textContent = state.user.username;
  elements.userProfileHeader.style.display = 'inline-flex';

  if (state.user.role === 'admin' || state.user.username === 'admin') {
    if (elements.btnAdminPortal) elements.btnAdminPortal.style.display = 'inline-block';
    if (elements.navbarCredits) elements.navbarCredits.textContent = 'Admin (Unlimited)';
  } else {
    if (elements.btnAdminPortal) elements.btnAdminPortal.style.display = 'none';
    if (elements.navbarCredits) {
      elements.navbarCredits.style.display = 'inline-flex';
      elements.navbarCredits.textContent = `Credits: ${state.user.credits}`;
    }
  }

  // Show Converter View
  document.querySelector('.sidebar-column').style.display = 'flex';
  elements.dragDropArea.style.display = 'flex';
  
  const total = state.filesQueue.length;
  if (total === 0) {
    elements.emptyStateView.classList.add('active');
    elements.tableView.classList.remove('active');
  } else {
    elements.emptyStateView.classList.remove('active');
    elements.tableView.classList.add('active');
  }
}

function showAuthForms() {
  elements.authContainer.style.display = 'flex';
  elements.dashboardContainer.style.display = 'none';
  elements.developerFooter.style.display = 'none';
  elements.userProfileHeader.style.display = 'none';
  elements.adminView.style.display = 'none';
}

function toggleAuthTabs(mode) {
  if (elements.otpForm) elements.otpForm.style.display = 'none';
  if (elements.forgotForm) elements.forgotForm.style.display = 'none';
  if (elements.resetForm) elements.resetForm.style.display = 'none';

  if (mode === 'login') {
    elements.tabLogin.classList.add('active');
    elements.tabSignup.classList.remove('active');
    elements.loginForm.style.display = 'flex';
    elements.signupForm.style.display = 'none';
  } else {
    elements.tabLogin.classList.remove('active');
    elements.tabSignup.classList.add('active');
    elements.loginForm.style.display = 'none';
    elements.signupForm.style.display = 'flex';
  }
  // Clear any existing errors/successes
  elements.loginError.style.display = 'none';
  elements.signupError.style.display = 'none';
  elements.signupSuccess.style.display = 'none';
}

function showForgotView() {
  elements.loginForm.style.display = 'none';
  elements.signupForm.style.display = 'none';
  if (elements.otpForm) elements.otpForm.style.display = 'none';
  if (elements.resetForm) elements.resetForm.style.display = 'none';
  if (elements.forgotForm) {
    elements.forgotForm.style.display = 'flex';
    elements.forgotForm.style.flexDirection = 'column';
  }
  if (elements.forgotError) elements.forgotError.style.display = 'none';
  if (elements.forgotSuccess) elements.forgotSuccess.style.display = 'none';
}

function showResetView(username, email) {
  state.pendingResetUser = username;
  elements.loginForm.style.display = 'none';
  elements.signupForm.style.display = 'none';
  if (elements.otpForm) elements.otpForm.style.display = 'none';
  if (elements.forgotForm) elements.forgotForm.style.display = 'none';
  if (elements.resetForm) {
    elements.resetForm.style.display = 'flex';
    elements.resetForm.style.flexDirection = 'column';
  }
  if (elements.resetError) elements.resetError.style.display = 'none';
  if (elements.resetSuccess) elements.resetSuccess.style.display = 'none';
}

async function handleForgotSubmit(e) {
  e.preventDefault();
  elements.forgotError.style.display = 'none';
  elements.forgotSuccess.style.display = 'none';

  const usernameOrEmail = elements.forgotUsername.value.trim();
  const submitBtn = elements.forgotForm.querySelector('button[type="submit"]');
  submitBtn.disabled = true;
  submitBtn.textContent = 'Sending Reset Code...';

  try {
    const response = await fetch('/api/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ usernameOrEmail })
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Failed to send reset code.');

    elements.forgotSuccess.textContent = data.message || '6-digit code sent to your email!';
    elements.forgotSuccess.style.display = 'block';

    setTimeout(() => {
      showResetView(data.username || usernameOrEmail, data.email);
    }, 1000);

  } catch (err) {
    elements.forgotError.textContent = err.message;
    elements.forgotError.style.display = 'block';
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = 'Send Reset Code 📩';
  }
}

async function handleResetSubmit(e) {
  e.preventDefault();
  elements.resetError.style.display = 'none';
  elements.resetSuccess.style.display = 'none';

  const otp = elements.resetOtpInput.value.trim();
  const newPassword = elements.resetNewPassword.value;
  const submitBtn = elements.resetForm.querySelector('button[type="submit"]');

  submitBtn.disabled = true;
  submitBtn.textContent = 'Updating Password...';

  try {
    const response = await fetch('/api/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        usernameOrEmail: state.pendingResetUser || elements.forgotUsername.value,
        otp,
        newPassword
      })
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Failed to reset password.');

    elements.resetSuccess.textContent = data.message || 'Password reset successful!';
    elements.resetSuccess.style.display = 'block';

    setTimeout(() => {
      toggleAuthTabs('login');
    }, 1200);

  } catch (err) {
    elements.resetError.textContent = err.message;
    elements.resetError.style.display = 'block';
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = 'Update Password 🚀';
  }
}

function showOtpView(username, email) {
  state.pendingOtpUser = { username, email };
  elements.loginForm.style.display = 'none';
  elements.signupForm.style.display = 'none';
  if (elements.otpForm) {
    elements.otpForm.style.display = 'flex';
    elements.otpForm.style.flexDirection = 'column';
  }
  if (elements.otpEmailDisplay) elements.otpEmailDisplay.textContent = email || username;
  if (elements.otpError) elements.otpError.style.display = 'none';
  if (elements.otpSuccess) elements.otpSuccess.style.display = 'none';
  if (elements.otpCodeInput) elements.otpCodeInput.value = '';
}

async function handleLoginSubmit(e) {
  e.preventDefault();
  elements.loginError.style.display = 'none';
  
  const usernameOrEmail = document.getElementById('login-username').value.trim();
  const password = document.getElementById('login-password').value;
  const submitBtn = elements.loginForm.querySelector('button[type="submit"]');
  
  submitBtn.disabled = true;
  submitBtn.textContent = 'Logging in...';
  
  try {
    const response = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ usernameOrEmail, password })
    });
    
    const data = await response.json();
    
    if (data.requiresOtp) {
      showOtpView(data.username || usernameOrEmail, data.email || usernameOrEmail);
      return;
    }

    if (!response.ok) {
      throw new Error(data.error || 'Invalid username or password.');
    }
    
    // Save session token & user
    state.user = data.user;
    if (data.token) {
      localStorage.setItem('auth_token', data.token);
    }
    localStorage.setItem('auth_user', JSON.stringify(data.user));
    
    elements.loginForm.reset();
    showAuthenticatedApp();
    
  } catch (err) {
    elements.loginError.textContent = err.message;
    elements.loginError.style.display = 'block';
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = 'Log In';
  }
}

// User Registration Form Submission
async function handleSignupSubmit(e) {
  e.preventDefault();
  elements.signupError.style.display = 'none';
  elements.signupSuccess.style.display = 'none';
  
  const username = document.getElementById('req-name').value.trim();
  const email = document.getElementById('req-email').value.trim();
  const password = document.getElementById('req-password').value;
  const whatsapp = document.getElementById('req-whatsapp').value.trim();
  const credits = document.getElementById('req-credits').value;
  const submitBtn = elements.signupForm.querySelector('button[type="submit"]');
  
  submitBtn.disabled = true;
  submitBtn.textContent = 'Registering...';
  
  try {
    const response = await fetch('/api/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email, password, whatsapp, creditsRequested: credits })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to register account.');
    }

    if (data.requiresOtp) {
      showOtpView(data.username || username, data.email || email);
      return;
    }

    state.user = data.user;
    if (data.token) {
      localStorage.setItem('auth_token', data.token);
    }
    localStorage.setItem('auth_user', JSON.stringify(data.user));

    elements.signupSuccess.textContent = 'Account created successfully! Logging you in...';
    elements.signupSuccess.style.display = 'block';
    elements.signupForm.reset();
    
    setTimeout(() => {
      showAuthenticatedApp();
    }, 1000);

  } catch (err) {
    elements.signupError.textContent = err.message || 'Failed to register account.';
    elements.signupError.style.display = 'block';
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = 'Create Account 🚀';
  }
}

// OTP Code Submission Handler
async function handleOtpSubmit(e) {
  e.preventDefault();
  if (!state.pendingOtpUser) return;

  elements.otpError.style.display = 'none';
  elements.otpSuccess.style.display = 'none';

  const otp = elements.otpCodeInput.value.trim();
  const submitBtn = elements.otpForm.querySelector('button[type="submit"]');
  submitBtn.disabled = true;
  submitBtn.textContent = 'Verifying Code...';

  try {
    const response = await fetch('/api/verify-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ usernameOrEmail: state.pendingOtpUser.username, otp })
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'Verification failed.');
    }

    state.user = data.user;
    if (data.token) {
      localStorage.setItem('auth_token', data.token);
    }
    localStorage.setItem('auth_user', JSON.stringify(data.user));

    elements.otpSuccess.textContent = 'Email verified successfully! Logging you in...';
    elements.otpSuccess.style.display = 'block';

    setTimeout(() => {
      showAuthenticatedApp();
    }, 800);

  } catch (err) {
    elements.otpError.textContent = err.message;
    elements.otpError.style.display = 'block';
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = 'Verify & Activate Account';
  }
}

// Resend OTP Code Handler
async function handleResendOtp() {
  if (!state.pendingOtpUser) return;

  elements.btnResendOtp.disabled = true;
  elements.btnResendOtp.textContent = 'Sending...';

  try {
    const response = await fetch('/api/verify-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'resend', usernameOrEmail: state.pendingOtpUser.username })
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error);

    elements.otpSuccess.textContent = data.message || 'Fresh verification code sent to your email.';
    elements.otpSuccess.style.display = 'block';

  } catch (err) {
    elements.otpError.textContent = err.message;
    elements.otpError.style.display = 'block';
  } finally {
    elements.btnResendOtp.disabled = false;
    elements.btnResendOtp.textContent = 'Resend Code';
  }
}

// Google OAuth Modal Handlers
function openGoogleAuthModal() {
  if (elements.googleModal) {
    elements.googleModal.style.display = 'flex';
  }
}

function closeGoogleAuthModal() {
  if (elements.googleModal) {
    elements.googleModal.style.display = 'none';
  }
}

async function handleConfirmGoogleAuth() {
  const userEmail = elements.googleEmailInput ? elements.googleEmailInput.value.trim() : 'bilalfaisalarain@gmail.com';
  if (!userEmail) {
    alert("Please enter a valid Google email address.");
    return;
  }

  const submitBtn = elements.btnConfirmGoogleAuth;
  const origText = submitBtn.textContent;
  submitBtn.disabled = true;
  submitBtn.textContent = 'Authenticating...';

  try {
    const response = await fetch('/api/google-auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: userEmail,
        name: userEmail.split('@')[0],
        googleId: 'g_' + Date.now()
      })
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error);

    state.user = data.user;
    if (data.token) {
      localStorage.setItem('auth_token', data.token);
    }
    localStorage.setItem('auth_user', JSON.stringify(data.user));

    closeGoogleAuthModal();
    showAuthenticatedApp();

  } catch (err) {
    alert("Google Authentication failed: " + err.message);
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = origText;
  }
}

function handleLogout() {
  state.user = null;
  localStorage.removeItem('auth_token');
  localStorage.removeItem('auth_user');
  showAuthForms();
}

/* ==========================================================================
   ADMIN DASHBOARD ACTIONS
   ========================================================================== */
async function loadAdminUsers() {
  elements.adminUsersTableBody.innerHTML = '<tr><td colspan="4" style="text-align: center; color: var(--slate-500); padding: 15px;">Loading users...</td></tr>';
  
  try {
    const token = localStorage.getItem('auth_token');
    const res = await fetch('/api/admin?action=list', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'x-admin-auth': 'admin1234'
      }
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);

    elements.adminUsersTableBody.innerHTML = '';
    
    if (data.users.length === 0) {
      elements.adminUsersTableBody.innerHTML = '<tr><td colspan="4" style="text-align: center; color: var(--slate-500); padding: 15px;">No client accounts registered. Add one above!</td></tr>';
      return;
    }

    data.users.forEach(user => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td><strong style="color:#fff;">${escapeHtml(user.username)}</strong></td>
        <td>${escapeHtml(user.email)}</td>
        <td style="text-align: center;">
          <div style="display: inline-flex; align-items: center; gap: 8px;">
            <input type="number" value="${user.credits}" id="credits-${user.username}" class="search-input" style="width: 70px; padding: 4px 8px; text-align: center; font-size:12px; margin:0;">
            <button class="btn btn-accent btn-update-credits" data-username="${user.username}" style="padding: 4px 8px; font-size: 11px; width:auto;">Set</button>
          </div>
        </td>
        <td style="text-align: center;">
          <button class="btn btn-danger btn-delete-user" data-username="${user.username}" style="padding: 4px 10px; font-size: 11px; width:auto;">Delete</button>
        </td>
      `;
      elements.adminUsersTableBody.appendChild(tr);
    });

    // Attach actions
    elements.adminUsersTableBody.querySelectorAll('.btn-update-credits').forEach(btn => {
      btn.addEventListener('click', async () => {
        const username = btn.dataset.username;
        const credits = document.getElementById(`credits-${username}`).value;
        const origText = btn.textContent;
        btn.textContent = '...';
        btn.disabled = true;
        
        try {
          const token = localStorage.getItem('auth_token');
          const r = await fetch('/api/admin?action=update_credits', {
            method: 'POST',
            headers: { 
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
              'x-admin-auth': 'admin1234' 
            },
            body: JSON.stringify({ username, credits })
          });
          if (!r.ok) {
            const errData = await r.json();
            throw new Error(errData.error);
          }
          alert(`Credits for ${username} updated successfully!`);
          loadAdminUsers();
        } catch (e) {
          alert('Update error: ' + e.message);
          btn.textContent = origText;
          btn.disabled = false;
        }
      });
    });

    elements.adminUsersTableBody.querySelectorAll('.btn-delete-user').forEach(btn => {
      btn.addEventListener('click', async () => {
        const username = btn.dataset.username;
        if (!confirm(`Are you absolutely sure you want to delete user ${username}?`)) return;
        
        btn.textContent = '...';
        btn.disabled = true;

        try {
          const token = localStorage.getItem('auth_token');
          const r = await fetch('/api/admin?action=delete_user', {
            method: 'POST',
            headers: { 
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
              'x-admin-auth': 'admin1234' 
            },
            body: JSON.stringify({ username })
          });
          if (!r.ok) {
            const errData = await r.json();
            throw new Error(errData.error);
          }
          loadAdminUsers();
        } catch (e) {
          alert('Delete error: ' + e.message);
          btn.disabled = false;
          btn.textContent = 'Delete';
        }
      });
    });

  } catch (e) {
    elements.adminUsersTableBody.innerHTML = `<tr><td colspan="4" style="text-align: center; color: var(--status-error); padding: 15px;">Failed to load users: ${e.message}</td></tr>`;
  }
}

async function handleAdminCreateUserSubmit(e) {
  e.preventDefault();
  elements.adminCreateError.style.display = 'none';
  elements.adminCreateSuccess.style.display = 'none';

  const username = document.getElementById('admin-user-username').value.trim();
  const email = document.getElementById('admin-user-email').value.trim();
  const password = document.getElementById('admin-user-password').value;
  const credits = document.getElementById('admin-user-credits').value;
  const submitBtn = elements.adminCreateForm.querySelector('button[type="submit"]');

  submitBtn.disabled = true;
  submitBtn.textContent = 'Creating...';

  try {
    const token = localStorage.getItem('auth_token');
    const r = await fetch('/api/admin?action=create_user', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'x-admin-auth': 'admin1234'
      },
      body: JSON.stringify({ username, email, password, credits })
    });
    const data = await r.json();
    if (!r.ok) throw new Error(data.error);

    elements.adminCreateSuccess.textContent = 'User account created successfully!';
    elements.adminCreateSuccess.style.display = 'block';
    elements.adminCreateForm.reset();
    document.getElementById('admin-user-credits').value = '50';
    loadAdminUsers();
  } catch (err) {
    elements.adminCreateError.textContent = err.message;
    elements.adminCreateError.style.display = 'block';
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = 'Create User';
  }
}

// SaaS Pricing & Subscription Handlers
function openPricingModal() {
  if (elements.pricingModal) elements.pricingModal.style.display = 'flex';
}

function closePricingModal() {
  if (elements.pricingModal) elements.pricingModal.style.display = 'none';
}

async function handleBuyPlan(plan) {
  const token = localStorage.getItem('auth_token');
  if (!token) {
    alert("Please log in or create an account to upgrade plans or purchase credits.");
    openPricingModal();
    return;
  }

  state.selectedCheckoutPlan = plan;
  let label = 'Pro Plan ($9/mo - +2,500 Credits)';
  if (plan === 'business') label = 'Business Unlimited ($29/mo - +10,000 Credits)';
  if (plan === 'credits_500') label = '500 Extra Credits Pack ($5)';

  if (elements.checkoutSelectedPlanName) elements.checkoutSelectedPlanName.textContent = label;
  if (elements.checkoutMethodModal) elements.checkoutMethodModal.style.display = 'flex';
  if (elements.trxError) elements.trxError.style.display = 'none';
  if (elements.trxSuccess) elements.trxSuccess.style.display = 'none';
  if (elements.localTrxForm) elements.localTrxForm.reset();
}

function closeCheckoutMethodModal() {
  if (elements.checkoutMethodModal) elements.checkoutMethodModal.style.display = 'none';
}

function switchPaymentTab(tab) {
  if (tab === 'card') {
    elements.tabPaymentCard.classList.add('active-payment-tab');
    elements.tabPaymentCard.style.borderColor = '#6366f1';
    elements.tabPaymentCard.style.background = 'rgba(99,102,241,0.15)';

    elements.tabPaymentLocal.classList.remove('active-payment-tab');
    elements.tabPaymentLocal.style.borderColor = 'var(--glass-border)';
    elements.tabPaymentLocal.style.background = 'transparent';

    elements.paymentViewCard.style.display = 'block';
    elements.paymentViewLocal.style.display = 'none';
  } else {
    elements.tabPaymentLocal.classList.add('active-payment-tab');
    elements.tabPaymentLocal.style.borderColor = '#10b981';
    elements.tabPaymentLocal.style.background = 'rgba(16,185,129,0.15)';

    elements.tabPaymentCard.classList.remove('active-payment-tab');
    elements.tabPaymentCard.style.borderColor = 'var(--glass-border)';
    elements.tabPaymentCard.style.background = 'transparent';

    elements.paymentViewCard.style.display = 'none';
    elements.paymentViewLocal.style.display = 'block';
  }
}

async function handleCardPayment() {
  const token = localStorage.getItem('auth_token');
  if (!token) return;

  const plan = state.selectedCheckoutPlan || 'pro';
  const btn = elements.btnProceedCardPayment;
  btn.disabled = true;
  btn.textContent = 'Redirecting to Secure Gateway...';

  try {
    const response = await fetch('/api/checkout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ plan, gateway: 'stripe' })
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Card Payment checkout failed.');

    if (state.user) {
      state.user.credits = data.credits;
      localStorage.setItem('auth_user', JSON.stringify(state.user));
    }
    if (elements.navbarCredits) {
      elements.navbarCredits.textContent = `Credits: ${data.credits}`;
    }

    alert("🎉 Payment Success! " + data.message);
    closeCheckoutMethodModal();
    closePricingModal();

  } catch (err) {
    alert("Payment Error: " + err.message);
  } finally {
    btn.disabled = false;
    btn.textContent = 'Proceed to Secure Card Checkout 🔒';
  }
}

async function handleLocalTrxSubmit(e) {
  e.preventDefault();
  const token = localStorage.getItem('auth_token');
  if (!token) return;

  elements.trxError.style.display = 'none';
  elements.trxSuccess.style.display = 'none';

  const trxId = elements.trxIdInput.value.trim();
  const plan = state.selectedCheckoutPlan || 'pro';
  const submitBtn = elements.localTrxForm.querySelector('button[type="submit"]');

  submitBtn.disabled = true;
  submitBtn.textContent = 'Verifying Transaction...';

  try {
    const response = await fetch('/api/checkout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ plan, trxId })
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Transaction verification failed.');

    if (state.user) {
      state.user.credits = data.credits;
      localStorage.setItem('auth_user', JSON.stringify(state.user));
    }
    if (elements.navbarCredits) {
      elements.navbarCredits.textContent = `Credits: ${data.credits}`;
    }

    elements.trxSuccess.textContent = `✅ Transaction Verified! Added credits to your account.`;
    elements.trxSuccess.style.display = 'block';

    setTimeout(() => {
      closeCheckoutMethodModal();
      closePricingModal();
    }, 1200);

  } catch (err) {
    elements.trxError.textContent = err.message;
    elements.trxError.style.display = 'block';
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = 'Submit Transaction ID & Activate Credits 🚀';
  }
}

// Developer API Key Handlers
function openApiKeyModal() {
  const token = localStorage.getItem('auth_token');
  if (!token) {
    alert("Please log in to manage your Developer API Keys.");
    return;
  }
  if (elements.apiKeyModal) elements.apiKeyModal.style.display = 'flex';
  loadApiKey();
}

function closeApiKeyModal() {
  if (elements.apiKeyModal) elements.apiKeyModal.style.display = 'none';
}

async function loadApiKey() {
  const token = localStorage.getItem('auth_token');
  if (!token) return;

  try {
    const response = await fetch('/api/apikeys?action=list', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await response.json();
    if (response.ok && data.apiKey) {
      if (elements.apiKeyDisplay) elements.apiKeyDisplay.value = data.apiKey;
    } else {
      if (elements.apiKeyDisplay) elements.apiKeyDisplay.value = "No API Key generated yet.";
    }
  } catch (err) {
    console.error('Failed to fetch API key:', err);
  }
}

async function handleGenerateApiKey() {
  const token = localStorage.getItem('auth_token');
  if (!token) return;

  const btn = elements.btnGenerateApiKey;
  btn.disabled = true;
  btn.textContent = 'Generating Key...';

  try {
    const response = await fetch('/api/apikeys?action=generate', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Failed to generate API Key.');

    if (elements.apiKeyDisplay) elements.apiKeyDisplay.value = data.apiKey;
    alert("New Developer API Key generated successfully!");

  } catch (err) {
    alert("API Key Error: " + err.message);
  } finally {
    btn.disabled = false;
    btn.textContent = 'Generate New API Key 🚀';
  }
}

function handleCopyApiKey() {
  const val = elements.apiKeyDisplay ? elements.apiKeyDisplay.value : '';
  if (!val || val.includes('No API Key')) {
    alert("Please generate an API key first.");
    return;
  }
  navigator.clipboard.writeText(val);
  alert("API Key copied to clipboard! 📋");
}

// Dedicated Admin Panel Modal Handlers
function openAdminPanelModal() {
  if (elements.adminPanelModal) elements.adminPanelModal.style.display = 'flex';
  loadAdminPanelData();
}

function closeAdminPanelModal() {
  if (elements.adminPanelModal) elements.adminPanelModal.style.display = 'none';
}

function switchAdminTab(tab) {
  if (tab === 'users') {
    elements.adminTabUsers.classList.add('active');
    elements.adminTabCreate.classList.remove('active');
    elements.adminViewUsersList.style.display = 'block';
    elements.adminViewCreateUser.style.display = 'none';
  } else {
    elements.adminTabUsers.classList.remove('active');
    elements.adminTabCreate.classList.add('active');
    elements.adminViewUsersList.style.display = 'none';
    elements.adminViewCreateUser.style.display = 'block';
  }
}

async function loadAdminPanelData() {
  const token = localStorage.getItem('auth_token');
  if (!elements.adminPanelUsersTbody) return;

  elements.adminPanelUsersTbody.innerHTML = '<tr><td colspan="5" style="text-align: center; padding: 20px; color: var(--slate-400);">Loading SaaS users...</td></tr>';

  try {
    const response = await fetch('/api/admin?action=list', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'x-admin-auth': 'admin1234'
      }
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Failed to fetch admin users list.');

    const users = data.users || [];
    let totalCreditsSum = 0;

    if (elements.adminStatTotalUsers) elements.adminStatTotalUsers.textContent = users.length;

    elements.adminPanelUsersTbody.innerHTML = '';
    if (users.length === 0) {
      elements.adminPanelUsersTbody.innerHTML = '<tr><td colspan="5" style="text-align: center; padding: 20px;">No registered users found.</td></tr>';
      return;
    }

    users.forEach(u => {
      totalCreditsSum += (u.credits || 0);
      const tr = document.createElement('tr');
      tr.style.borderBottom = '1px solid rgba(255,255,255,0.05)';
      
      const roleBadgeClass = u.role === 'admin' ? 'background: #ec4899; color: #fff;' : (u.role === 'pro' || u.role === 'business' ? 'background: #6366f1; color: #fff;' : 'background: rgba(255,255,255,0.1); color: #cbd5e1;');
      
      tr.innerHTML = `
        <td style="padding: 10px; font-weight: 700; color: #fff;">${escapeHtml(u.username)}</td>
        <td style="padding: 10px; color: var(--slate-300);">${escapeHtml(u.email)}</td>
        <td style="padding: 10px;"><span class="badge" style="${roleBadgeClass}">${escapeHtml(u.role || 'user')}</span></td>
        <td style="padding: 10px; color: #10b981; font-weight: 700;">${u.credits || 0}</td>
        <td style="padding: 10px; text-align: right;">
          <button class="btn btn-secondary btn-adm-add-credits" data-username="${escapeHtml(u.username)}" data-credits="${u.credits || 0}" style="padding: 2px 8px; font-size: 10px; width: auto; margin-right: 4px;">+500 Credits</button>
          ${u.username !== 'admin' ? `<button class="btn btn-danger btn-adm-delete-user" data-username="${escapeHtml(u.username)}" style="padding: 2px 8px; font-size: 10px; width: auto;">Delete</button>` : ''}
        </td>
      `;
      elements.adminPanelUsersTbody.appendChild(tr);
    });

    if (elements.adminStatTotalCredits) elements.adminStatTotalCredits.textContent = totalCreditsSum.toLocaleString();

    // Attach row button listeners
    elements.adminPanelUsersTbody.querySelectorAll('.btn-adm-add-credits').forEach(btn => {
      btn.addEventListener('click', async () => {
        const targetUsername = btn.dataset.username;
        const currentCr = parseInt(btn.dataset.credits, 10);
        const newCr = currentCr + 500;

        btn.disabled = true;
        btn.textContent = '...';

        try {
          const res = await fetch('/api/admin?action=update_credits', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
              'x-admin-auth': 'admin1234'
            },
            body: JSON.stringify({ username: targetUsername, credits: newCr })
          });
          const resData = await res.json();
          if (!res.ok) throw new Error(resData.error);
          loadAdminPanelData();
        } catch (err) {
          alert('Failed to update credits: ' + err.message);
          btn.disabled = false;
        }
      });
    });

    elements.adminPanelUsersTbody.querySelectorAll('.btn-adm-delete-user').forEach(btn => {
      btn.addEventListener('click', async () => {
        const targetUsername = btn.dataset.username;
        if (!confirm(`Are you sure you want to delete user "${targetUsername}"?`)) return;

        btn.disabled = true;
        btn.textContent = '...';

        try {
          const res = await fetch('/api/admin?action=delete_user', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
              'x-admin-auth': 'admin1234'
            },
            body: JSON.stringify({ username: targetUsername })
          });
          const resData = await res.json();
          if (!res.ok) throw new Error(resData.error);
          loadAdminPanelData();
        } catch (err) {
          alert('Failed to delete user: ' + err.message);
          btn.disabled = false;
        }
      });
    });

  } catch (err) {
    elements.adminPanelUsersTbody.innerHTML = `<tr><td colspan="5" style="text-align: center; padding: 20px; color: var(--status-error);">Error loading users: ${err.message}</td></tr>`;
  }
}

async function handleAdminPanelCreateUserSubmit(e) {
  e.preventDefault();
  const token = localStorage.getItem('auth_token');

  elements.admCreateError.style.display = 'none';
  elements.admCreateSuccess.style.display = 'none';

  const username = document.getElementById('adm-username').value.trim();
  const email = document.getElementById('adm-email').value.trim();
  const password = document.getElementById('adm-password').value;
  const credits = document.getElementById('adm-credits').value;
  const role = document.getElementById('adm-role').value;

  const submitBtn = elements.adminPanelCreateForm.querySelector('button[type="submit"]');
  submitBtn.disabled = true;
  submitBtn.textContent = 'Creating Account...';

  try {
    const response = await fetch('/api/admin?action=create_user', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'x-admin-auth': 'admin1234'
      },
      body: JSON.stringify({ username, email, password, credits, role })
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Failed to create user.');

    elements.admCreateSuccess.textContent = `User "${username}" created successfully!`;
    elements.admCreateSuccess.style.display = 'block';
    elements.adminPanelCreateForm.reset();
    document.getElementById('adm-credits').value = '500';

    loadAdminPanelData();

  } catch (err) {
    elements.admCreateError.textContent = err.message;
    elements.admCreateError.style.display = 'block';
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = 'Create Account 🚀';
  }
}

// Start listener
window.addEventListener('DOMContentLoaded', initEvents);
