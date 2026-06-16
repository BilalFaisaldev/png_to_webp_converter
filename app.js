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
  user: null
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

  // Analytics DOM Elements
  btnNavConverter: document.getElementById('btn-nav-converter'),
  btnNavAnalytics: document.getElementById('btn-nav-analytics'),
  analyticsView: document.getElementById('analytics-view'),
  statProcessedCount: document.getElementById('stat-processed-count'),
  statSavedSize: document.getElementById('stat-saved-size'),
  statRatioAvg: document.getElementById('stat-ratio-avg'),
  btnClearHistory: document.getElementById('btn-clear-history'),
  historyTableBody: document.getElementById('history-table-body'),

  // Help & Docs Modals
  navLinkDocs: document.getElementById('nav-link-docs'),
  navLinkHelp: document.getElementById('nav-link-help'),
  docsModal: document.getElementById('docs-modal'),
  helpModal: document.getElementById('help-modal'),
  btnCloseDocs: document.getElementById('btn-close-docs'),
  btnCloseHelp: document.getElementById('btn-close-help')
};

/* ==========================================================================
   EVENT INITIALIZATION & ROUTING
   ========================================================================== */
function initEvents() {
  // Mock navbar links and theme toggle clicks
  document.querySelectorAll('.nav-link, .theme-toggle').forEach(el => {
    el.addEventListener('click', (e) => {
      e.preventDefault();
      // Simply visual effect or mock notification
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

  // Analytics Navigation Listeners
  elements.btnNavConverter.addEventListener('click', () => toggleWorkspaceView('converter'));
  elements.btnNavAnalytics.addEventListener('click', () => toggleWorkspaceView('analytics'));
  elements.btnClearHistory.addEventListener('click', handleClearHistory);

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

  // Save to history & update stats
  const newSuccessfulRuns = state.filesQueue.filter(f => f.status === 'success' && !f.loggedToHistory);
  if (newSuccessfulRuns.length > 0) {
    saveBatchToHistory(newSuccessfulRuns);
    // Mark as logged so they don't get logged again if we run again
    newSuccessfulRuns.forEach(f => f.loggedToHistory = true);
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
function checkAuthSession() {
  const cachedUser = localStorage.getItem('auth_user');
  if (cachedUser) {
    try {
      state.user = JSON.parse(cachedUser);
      showAuthenticatedApp();
    } catch (e) {
      localStorage.removeItem('auth_user');
      showAuthForms();
    }
  } else {
    showAuthForms();
  }
}

function showAuthenticatedApp() {
  elements.authContainer.style.display = 'none';
  elements.dashboardContainer.style.display = 'flex';
  elements.developerFooter.style.display = 'block';
  
  elements.userDisplayName.textContent = state.user.username;
  elements.userProfileHeader.style.display = 'inline-flex';
  
  toggleWorkspaceView('converter');
}

function showAuthForms() {
  elements.authContainer.style.display = 'flex';
  elements.dashboardContainer.style.display = 'none';
  elements.developerFooter.style.display = 'none';
  elements.userProfileHeader.style.display = 'none';
}

function toggleAuthTabs(mode) {
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

async function handleLoginSubmit(e) {
  e.preventDefault();
  elements.loginError.style.display = 'none';
  
  const usernameOrEmail = document.getElementById('login-username').value.trim().toLowerCase();
  const password = document.getElementById('login-password').value;
  const submitBtn = elements.loginForm.querySelector('button[type="submit"]');
  
  submitBtn.disabled = true;
  submitBtn.textContent = 'Logging in...';
  
  // Simulate minor network delay for feedback feel
  await new Promise(resolve => setTimeout(resolve, 500));
  
  try {
    const users = JSON.parse(localStorage.getItem('registered_users') || '[]');
    const user = users.find(u => 
      (u.username.toLowerCase() === usernameOrEmail || u.email.toLowerCase() === usernameOrEmail) && 
      u.password === password
    );
    
    if (!user) {
      throw new Error('Invalid username/email or password.');
    }
    
    // Save session
    const activeSession = { username: user.username, email: user.email };
    state.user = activeSession;
    localStorage.setItem('auth_user', JSON.stringify(activeSession));
    
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

async function handleSignupSubmit(e) {
  e.preventDefault();
  elements.signupError.style.display = 'none';
  elements.signupSuccess.style.display = 'none';
  
  const username = document.getElementById('signup-username').value.trim();
  const email = document.getElementById('signup-email').value.trim();
  const password = document.getElementById('signup-password').value;
  const submitBtn = elements.signupForm.querySelector('button[type="submit"]');
  
  if (username.length < 3) {
    elements.signupError.textContent = 'Username must be at least 3 characters.';
    elements.signupError.style.display = 'block';
    return;
  }
  
  if (password.length < 6) {
    elements.signupError.textContent = 'Password must be at least 6 characters.';
    elements.signupError.style.display = 'block';
    return;
  }
  
  submitBtn.disabled = true;
  submitBtn.textContent = 'Creating account...';
  
  await new Promise(resolve => setTimeout(resolve, 500));
  
  try {
    const users = JSON.parse(localStorage.getItem('registered_users') || '[]');
    
    if (users.some(u => u.username.toLowerCase() === username.toLowerCase())) {
      throw new Error('This username is already taken.');
    }
    if (users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
      throw new Error('This email is already registered.');
    }
    
    users.push({ username, email, password });
    localStorage.setItem('registered_users', JSON.stringify(users));
    
    elements.signupSuccess.textContent = 'Account created! Please switch to Login tab to log in.';
    elements.signupSuccess.style.display = 'block';
    elements.signupForm.reset();
    
  } catch (err) {
    elements.signupError.textContent = err.message;
    elements.signupError.style.display = 'block';
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = 'Create Account';
  }
}

function handleLogout() {
  state.user = null;
  localStorage.removeItem('auth_user');
  showAuthForms();
}

/* ==========================================================================
   USER ANALYTICS & DASHBOARD FUNCTIONS
   ========================================================================== */
function toggleWorkspaceView(view) {
  if (view === 'converter') {
    elements.btnNavConverter.style.backgroundColor = 'var(--accent-primary)';
    elements.btnNavAnalytics.style.backgroundColor = 'transparent';
    
    // Show converter columns
    document.querySelector('.sidebar-column').style.display = 'flex';
    elements.dragDropArea.style.display = 'flex';
    
    // Show active workspace stack item
    elements.analyticsView.style.display = 'none';
    const total = state.filesQueue.length;
    if (total === 0) {
      elements.emptyStateView.classList.add('active');
      elements.tableView.classList.remove('active');
    } else {
      elements.emptyStateView.classList.remove('active');
      elements.tableView.classList.add('active');
    }
  } else {
    elements.btnNavConverter.style.backgroundColor = 'transparent';
    elements.btnNavAnalytics.style.backgroundColor = 'var(--accent-primary)';
    
    // Hide converter columns
    document.querySelector('.sidebar-column').style.display = 'none';
    elements.dragDropArea.style.display = 'none';
    
    // Show analytics view
    elements.emptyStateView.classList.remove('active');
    elements.tableView.classList.remove('active');
    elements.analyticsView.style.display = 'flex';
    
    renderAnalytics();
  }
}

function saveBatchToHistory(newEntries) {
  if (!state.user) return;
  const historyKey = `history_${state.user.username}`;
  const history = JSON.parse(localStorage.getItem(historyKey) || '[]');
  
  newEntries.forEach(entry => {
    history.unshift({
      id: entry.id,
      name: entry.name,
      originalSize: entry.size,
      webpSize: entry.webpSize,
      date: new Date().toLocaleString()
    });
  });
  
  // Cap history at 100 entries to prevent local storage quota issues
  if (history.length > 100) {
    history.length = 100;
  }
  
  localStorage.setItem(historyKey, JSON.stringify(history));
}

function renderAnalytics() {
  if (!state.user) return;
  const historyKey = `history_${state.user.username}`;
  const history = JSON.parse(localStorage.getItem(historyKey) || '[]');
  
  // Calculate totals
  const totalCount = history.length;
  let totalSaved = 0;
  let totalOriginal = 0;
  
  history.forEach(item => {
    totalOriginal += item.originalSize;
    totalSaved += (item.originalSize - item.webpSize);
  });
  
  const avgRatio = totalOriginal > 0 ? ((totalSaved / totalOriginal) * 100).toFixed(0) : 0;
  
  // Update Stats Cards
  elements.statProcessedCount.textContent = totalCount;
  elements.statSavedSize.textContent = formatSize(totalSaved);
  elements.statRatioAvg.textContent = `${avgRatio}%`;
  
  // Render History Table
  elements.historyTableBody.innerHTML = '';
  
  if (history.length === 0) {
    elements.historyTableBody.innerHTML = `
      <tr>
        <td colspan="5" style="text-align: center; color: var(--slate-500); padding: 20px;">
          No conversion history found. Run some conversions to populate stats!
        </td>
      </tr>
    `;
    return;
  }
  
  history.forEach(item => {
    const tr = document.createElement('tr');
    const savingPercent = ((item.originalSize - item.webpSize) / item.originalSize * 100).toFixed(0);
    
    tr.innerHTML = `
      <td>
        <span class="file-name-txt" title="${escapeHtml(item.name)}">${escapeHtml(item.name)}</span>
      </td>
      <td style="text-align: center; color: var(--slate-400); font-size: 11px;">${item.date}</td>
      <td style="text-align: right;" class="size-txt">${formatSize(item.originalSize)}</td>
      <td style="text-align: right;" class="size-txt">${formatSize(item.webpSize)}</td>
      <td style="text-align: center;">
        <span class="ratio-badge" style="margin: 0; padding: 2px 6px;">-${savingPercent}%</span>
      </td>
    `;
    elements.historyTableBody.appendChild(tr);
  });
}

function handleClearHistory() {
  if (!state.user) return;
  if (confirm('Are you sure you want to clear your conversion history and statistics?')) {
    const historyKey = `history_${state.user.username}`;
    localStorage.removeItem(historyKey);
    renderAnalytics();
  }
}

// Start listener
window.addEventListener('DOMContentLoaded', initEvents);
