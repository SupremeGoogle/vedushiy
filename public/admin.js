document.addEventListener('DOMContentLoaded', () => {
  // Authentication & State variables
  const CORRECT_PASS = 'ved123';
  let adminPassword = '';
  let siteData = null;
  let pendingImages = []; // Array of { name: 'relpath.jpg', base64: 'data:...' }
  let hasChanges = false;

  // DOM elements cache
  const loginSection = document.getElementById('login-section');
  const adminSection = document.getElementById('admin-section');
  const adminFooterBar = document.getElementById('admin-footer-bar');
  
  const adminPassInput = document.getElementById('admin-pass');
  const btnLogin = document.getElementById('btn-login');
  const loginError = document.getElementById('login-error');
  const btnLogout = document.getElementById('btn-logout');

  const sidebarButtons = document.querySelectorAll('.sidebar-btn');
  const sections = document.querySelectorAll('.admin-section');

  const statusIcon = document.getElementById('status-icon');
  const statusDesc = document.getElementById('status-desc');
  const btnSaveAll = document.getElementById('btn-save-all');

  // Input elements: General & Contacts
  const inpTitle = document.getElementById('inp-title');
  const inpDescription = document.getElementById('inp-description');
  const inpPhone = document.getElementById('inp-phone');
  const inpYandexDisk = document.getElementById('inp-yandexdisk');
  const inpTelegram = document.getElementById('inp-telegram');
  const inpInstagram = document.getElementById('inp-instagram');
  const inpMusicEnabled = document.getElementById('inp-music-enabled');
  const inpMusicUrl = document.getElementById('inp-music-url');
  const fileMusicSource = document.getElementById('file-music-source');

  // Input elements: Hero
  const inpHeroTitle = document.getElementById('inp-hero-title');
  const inpHeroSubtitle = document.getElementById('inp-hero-subtitle');
  const inpHeroBtnText = document.getElementById('inp-hero-btntext');
  const prevHeroImage = document.getElementById('prev-hero-image');
  const fileHeroImage = document.getElementById('file-hero-image');

  // Input elements: About
  const inpAboutTitle = document.getElementById('inp-about-title');
  const inpAboutSubtitle = document.getElementById('inp-about-subtitle');
  const inpAboutText1 = document.getElementById('inp-about-text1');
  const inpAboutText2 = document.getElementById('inp-about-text2');
  const inpAboutExp = document.getElementById('inp-about-exp');
  const inpAboutEvents = document.getElementById('inp-about-events');
  const inpAboutClients = document.getElementById('inp-about-clients');
  const prevAboutImage = document.getElementById('prev-about-image');
  const fileAboutImage = document.getElementById('file-about-image');

  // Event formats list container
  const adminEventsList = document.getElementById('admin-events-list');

  // Gallery container & dialog
  const adminGalleryContainer = document.getElementById('admin-gallery-container');
  const btnTriggerAddGallery = document.getElementById('btn-trigger-add-gallery');
  const addPhotoModal = document.getElementById('add-photo-modal');
  const fileAddPhoto = document.getElementById('file-add-photo');
  const prevAddPhoto = document.getElementById('prev-add-photo');
  const inpAddTitle = document.getElementById('inp-add-title');
  const inpAddDesc = document.getElementById('inp-add-desc');
  const selAddCat = document.getElementById('sel-add-cat');
  const btnConfirmAddPhoto = document.getElementById('btn-confirm-add-photo');

  // Bot indicators
  const botStatusBadge = document.getElementById('bot-status-badge');
  const botAdminsList = document.getElementById('bot-admins-list');

  /* ==========================================================================
     1. AUTHENTICATION FLOW
     ========================================================================== */
  function checkAuth() {
    const savedPass = sessionStorage.getItem('admin_pass') || localStorage.getItem('admin_pass');
    if (savedPass === CORRECT_PASS) {
      adminPassword = savedPass;
      showWorkspace();
    } else {
      showLogin();
    }
  }

  function handleLogin() {
    const enteredPass = adminPassInput.value.trim();
    if (enteredPass === CORRECT_PASS) {
      adminPassword = enteredPass;
      sessionStorage.setItem('admin_pass', enteredPass);
      // Optional remember me
      localStorage.setItem('admin_pass', enteredPass);
      
      loginError.style.display = 'none';
      showWorkspace();
    } else {
      loginError.textContent = 'Неверный пароль администратора!';
      loginError.style.display = 'block';
      adminPassInput.value = '';
      adminPassInput.focus();
    }
  }

  function handleLogout() {
    sessionStorage.removeItem('admin_pass');
    localStorage.removeItem('admin_pass');
    location.reload();
  }

  function showLogin() {
    loginSection.style.display = 'flex';
    adminSection.style.display = 'none';
    adminFooterBar.style.display = 'none';
    btnLogout.style.display = 'none';
  }

  function showWorkspace() {
    loginSection.style.display = 'none';
    adminSection.style.display = 'block';
    adminFooterBar.style.display = 'flex';
    btnLogout.style.display = 'inline-flex';
    
    // Load config data
    loadSiteData();
    checkBotStatus();
  }

  btnLogin.addEventListener('click', handleLogin);
  adminPassInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') handleLogin();
  });
  btnLogout.addEventListener('click', handleLogout);

  /* ==========================================================================
     2. TAB NAVIGATION
     ========================================================================== */
  sidebarButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      sidebarButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      
      const tabId = btn.getAttribute('data-tab');
      sections.forEach(sec => {
        sec.classList.remove('active');
        if (sec.getAttribute('id') === `section-${tabId}`) {
          sec.classList.add('active');
        }
      });
    });
  });

  /* ==========================================================================
     3. SITE DATA CONFIG LOAD & SYNC
     ========================================================================== */
  async function loadSiteData() {
    try {
      const response = await fetch('/data.json');
      if (!response.ok) throw new Error('Не удалось получить data.json');
      siteData = await response.json();
      
      populateForm();
    } catch (e) {
      alert('Ошибка при загрузке конфигурации: ' + e.message);
    }
  }

  function populateForm() {
    if (!siteData) return;

    // General
    inpTitle.value = siteData.title || '';
    inpDescription.value = siteData.metaDescription || '';
    inpPhone.value = siteData.phone || '';
    inpYandexDisk.value = siteData.yandexDisk || '';
    inpTelegram.value = siteData.telegram || '';
    inpInstagram.value = siteData.instagram || '';

    // Music settings
    if (inpMusicEnabled) inpMusicEnabled.checked = siteData.musicEnabled !== false;
    if (inpMusicUrl) inpMusicUrl.value = siteData.musicUrl || 'audio/ambient.mp3';

    // Hero
    if (siteData.hero) {
      inpHeroTitle.value = (siteData.hero.title || '').replace(/<[^>]+>/g, '');
      inpHeroSubtitle.value = siteData.hero.subtitle || '';
      inpHeroBtnText.value = siteData.hero.buttonText || '';
      if (siteData.hero.image) prevHeroImage.setAttribute('src', '/' + siteData.hero.image);
    }

    // About
    if (siteData.about) {
      inpAboutTitle.value = siteData.about.title || '';
      inpAboutSubtitle.value = siteData.about.subtitle || '';
      inpAboutText1.value = siteData.about.text1 || '';
      inpAboutText2.value = siteData.about.text2 || '';
      inpAboutExp.value = siteData.about.experience || '';
      inpAboutEvents.value = siteData.about.eventsCount || '';
      inpAboutClients.value = siteData.about.clientsCount || '';
      if (siteData.about.image) prevAboutImage.setAttribute('src', '/' + siteData.about.image);
    }

    // Event Formats list
    renderEventFormatsEditor();

    // Gallery List
    renderGalleryEditor();

    // Sync input listeners for change tracking
    setupChangeTracking();
    setUnsavedChanges(false);
  }

  // Change status tracking
  function setUnsavedChanges(unsaved) {
    hasChanges = unsaved;
    if (unsaved) {
      statusIcon.className = 'fa-solid fa-circle-exclamation status-unsaved';
      statusDesc.textContent = 'Есть несохраненные изменения';
      btnSaveAll.disabled = false;
    } else {
      statusIcon.className = 'fa-solid fa-circle-check status-saved';
      statusDesc.textContent = 'Все изменения синхронизированы';
      btnSaveAll.disabled = true;
    }
  }

  function setupChangeTracking() {
    const allInputs = adminSection.querySelectorAll('input, textarea, select');
    allInputs.forEach(input => {
      // Avoid adding duplicate event listeners
      input.removeEventListener('input', onInputChange);
      input.addEventListener('input', onInputChange);
    });
  }

  function onInputChange(e) {
    setUnsavedChanges(true);
    updateSiteDataState();
  }

  // Sync inputs back to local siteData structure
  function updateSiteDataState() {
    if (!siteData) return;

    // General
    siteData.title = inpTitle.value.trim();
    siteData.metaDescription = inpDescription.value.trim();
    siteData.phone = inpPhone.value.trim();
    siteData.yandexDisk = inpYandexDisk.value.trim();
    siteData.telegram = inpTelegram.value.trim();
    siteData.instagram = inpInstagram.value.trim();

    // Music settings
    if (inpMusicEnabled) siteData.musicEnabled = inpMusicEnabled.checked;
    if (inpMusicUrl) siteData.musicUrl = inpMusicUrl.value.trim();

    // Hero
    if (!siteData.hero) siteData.hero = {};
    siteData.hero.title = inpHeroTitle.value.trim();
    siteData.hero.subtitle = inpHeroSubtitle.value.trim();
    siteData.hero.buttonText = inpHeroBtnText.value.trim();

    // About
    if (!siteData.about) siteData.about = {};
    siteData.about.title = inpAboutTitle.value.trim();
    siteData.about.subtitle = inpAboutSubtitle.value.trim();
    siteData.about.text1 = inpAboutText1.value.trim();
    siteData.about.text2 = inpAboutText2.value.trim();
    siteData.about.experience = inpAboutExp.value.trim();
    siteData.about.eventsCount = inpAboutEvents.value.trim();
    siteData.about.clientsCount = inpAboutClients.value.trim();

    // Sync dynamic Event Formats
    if (siteData.eventTypes) {
      siteData.eventTypes.forEach((evt, idx) => {
        const titleEl = document.getElementById(`evt-title-${idx}`);
        const descEl = document.getElementById(`evt-desc-${idx}`);
        if (titleEl) evt.title = titleEl.value.trim();
        if (descEl) evt.description = descEl.value.trim();
      });
    }
  }

  /* ==========================================================================
     4. EVENT FORMATS SUB-EDITOR
     ========================================================================== */
  function renderEventFormatsEditor() {
    if (!siteData || !siteData.eventTypes) return;
    
    adminEventsList.innerHTML = '';
    siteData.eventTypes.forEach((evt, idx) => {
      const card = document.createElement('div');
      card.className = 'admin-event-card';
      card.innerHTML = `
        <h4>Формат #${idx + 1}: ${evt.title}</h4>
        
        <div class="form-group-admin">
          <label for="evt-title-${idx}">Название формата</label>
          <input type="text" id="evt-title-${idx}" value="${evt.title}">
        </div>
        
        <div class="form-group-admin">
          <label for="evt-desc-${idx}">Описание формата</label>
          <textarea id="evt-desc-${idx}" rows="2">${evt.description}</textarea>
        </div>
        
        <div class="form-group-admin">
          <label>Обложка формата</label>
          <div class="image-picker">
            <img id="prev-evt-img-${idx}" class="picker-preview" src="/${evt.image}" alt="${evt.title}">
            <div class="picker-actions">
              <input type="file" id="file-evt-img-${idx}" class="file-input-hidden" accept="image/*">
              <button class="btn btn-outline btn-picker" data-index="${idx}">Выбрать фото</button>
            </div>
          </div>
        </div>
      `;

      adminEventsList.appendChild(card);

      // Register file picker click triggers
      const btnPicker = card.querySelector(`.btn-picker`);
      const fileInput = card.querySelector(`.file-input-hidden`);
      
      btnPicker.addEventListener('click', (e) => {
        e.preventDefault();
        fileInput.click();
      });

      fileInput.addEventListener('change', (e) => {
        handleImageFileSelect(e, (base64, filename) => {
          // Add to pending queue and render preview
          const imageRelPath = `events_covers/evt_${idx}_${Date.now()}_${filename}`;
          pendingImages.push({
            name: imageRelPath,
            base64: base64
          });

          evt.image = `images/${imageRelPath}`;
          document.getElementById(`prev-evt-img-${idx}`).setAttribute('src', base64);
          setUnsavedChanges(true);
        });
      });
    });
  }

  /* ==========================================================================
     5. GALLERY PORTFOLIO MANAGER
     ========================================================================== */
  function renderGalleryEditor() {
    if (!siteData || !siteData.gallery) return;

    adminGalleryContainer.innerHTML = '';
    
    siteData.gallery.forEach((item, index) => {
      const card = document.createElement('div');
      card.className = 'admin-gallery-card';
      card.innerHTML = `
        <img class="gallery-card-img" src="/${item.image}" alt="${item.title}">
        <div class="gallery-card-info">
          <div>
            <span class="gallery-card-cat">${getCategoryLabel(item.category)}</span>
            <h5>${item.title}</h5>
          </div>
          <p style="font-size: 0.75rem; color: var(--color-text-muted); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 140px;">${item.description || '—'}</p>
        </div>
        <button class="btn-delete-card" data-index="${index}" aria-label="Delete"><i class="fa-solid fa-trash-can"></i></button>
      `;

      card.querySelector('.btn-delete-card').addEventListener('click', (e) => {
        e.preventDefault();
        if (confirm(`Удалить фото "${item.title}" из портфолио?`)) {
          siteData.gallery.splice(index, 1);
          renderGalleryEditor();
          setUnsavedChanges(true);
        }
      });

      adminGalleryContainer.appendChild(card);
    });
  }

  function getCategoryLabel(category) {
    const labels = {
      'weddings': 'Свадьба',
      'graduations': 'Выпускной',
      'commercial': 'Бизнес',
      'host': 'Ведущий'
    };
    return labels[category] || category;
  }

  // Open Add modal dialog
  btnTriggerAddGallery.addEventListener('click', () => {
    // Reset add dialog inputs
    inpAddTitle.value = '';
    inpAddDesc.value = '';
    fileAddPhoto.value = '';
    prevAddPhoto.style.display = 'none';
    prevAddPhoto.setAttribute('src', '');
    
    addPhotoModal.classList.add('active');
  });

  // Modal dialog file picker
  fileAddPhoto.addEventListener('change', (e) => {
    handleImageFileSelect(e, (base64, filename) => {
      prevAddPhoto.setAttribute('src', base64);
      prevAddPhoto.style.display = 'block';
    });
  });

  // Confirm add image to list
  btnConfirmAddPhoto.addEventListener('click', () => {
    const title = inpAddTitle.value.trim();
    const desc = inpAddDesc.value.trim();
    const category = selAddCat.value;
    const file = fileAddPhoto.files[0];

    if (!file) {
      alert('Пожалуйста, выберите файл фотографии.');
      return;
    }

    if (!title) {
      alert('Пожалуйста, введите короткий заголовок.');
      return;
    }

    const reader = new FileReader();
    reader.onload = function(e) {
      const base64 = e.target.result;
      const filename = `${Date.now()}_${file.name.replace(/\s+/g, '_')}`;
      const imageRelPath = `portfolio/${filename}`;

      // 1. Pushes upload details to pendingImages queue
      pendingImages.push({
        name: imageRelPath,
        base64: base64
      });

      // 2. Pushes new item to data model
      siteData.gallery.push({
        id: `gal-${Date.now()}-${Math.random()}`,
        image: `images/${imageRelPath}`,
        category: category,
        title: title,
        description: desc
      });

      // 3. Render and close modal
      renderGalleryEditor();
      setUnsavedChanges(true);
      addPhotoModal.classList.remove('active');
    };
    reader.readAsDataURL(file);
  });

  /* ==========================================================================
     6. IMAGE FILE HANDLING (BASE64 UTILS)
     ========================================================================== */
  function handleImageFileSelect(e, callback) {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Файл должен быть изображением!');
      return;
    }

    const reader = new FileReader();
    reader.onload = function(evt) {
      callback(evt.target.result, file.name.replace(/\s+/g, '_'));
    };
    reader.readAsDataURL(file);
  }

  // Listening to main banner image selection
  fileHeroImage.addEventListener('change', (e) => {
    handleImageFileSelect(e, (base64, filename) => {
      const imageRelPath = `host/hero_${Date.now()}_${filename}`;
      pendingImages.push({
        name: imageRelPath,
        base64: base64
      });

      if (!siteData.hero) siteData.hero = {};
      siteData.hero.image = `images/${imageRelPath}`;
      prevHeroImage.setAttribute('src', base64);
      setUnsavedChanges(true);
    });
  });

  // Listening to about image selection
  fileAboutImage.addEventListener('change', (e) => {
    handleImageFileSelect(e, (base64, filename) => {
      const imageRelPath = `host/about_${Date.now()}_${filename}`;
      pendingImages.push({
        name: imageRelPath,
        base64: base64
      });

      if (!siteData.about) siteData.about = {};
      siteData.about.image = `images/${imageRelPath}`;
      prevAboutImage.setAttribute('src', base64);
      setUnsavedChanges(true);
    });
  });

  // Listening to background music selection
  if (fileMusicSource) {
    fileMusicSource.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;

      if (!file.type.startsWith('audio/') && !file.name.endsWith('.mp3')) {
        alert('Файл должен быть аудиофайлом в формате MP3!');
        return;
      }

      if (file.size > 6 * 1024 * 1024) {
        alert('Внимание: Аудиофайл довольно большой (' + (file.size / 1024 / 1024).toFixed(1) + ' МБ). Для более быстрой загрузки сайта рекомендуется использовать сжатые MP3 файлы до 5 МБ.');
      }

      const reader = new FileReader();
      reader.onload = function(evt) {
        const base64 = evt.target.result;
        const cleanName = file.name.replace(/\s+/g, '_');
        const audioPath = `public/audio/${Date.now()}_${cleanName}`;
        
        pendingImages.push({
          name: audioPath,
          base64: base64
        });

        const displayPath = audioPath.replace('public/', '');
        siteData.musicUrl = displayPath;
        if (inpMusicUrl) inpMusicUrl.value = displayPath;
        
        setUnsavedChanges(true);
      };
      reader.readAsDataURL(file);
    });
  }

  // Listening to music toggle check
  if (inpMusicEnabled) {
    inpMusicEnabled.addEventListener('change', () => {
      setUnsavedChanges(true);
      updateSiteDataState();
    });
  }

  /* ==========================================================================
     7. BROADCAST AND COMMIT (SAVE HANDLER)
     ========================================================================== */
  btnSaveAll.addEventListener('click', async (e) => {
    e.preventDefault();
    if (!siteData) return;

    // Show loading state
    btnSaveAll.disabled = true;
    const originalText = btnSaveAll.innerHTML;
    btnSaveAll.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Сохранение...`;
    
    statusIcon.className = 'fa-solid fa-spinner fa-spin status-loading';
    statusDesc.textContent = 'Сохранение изменений...';

    // Verify all text changes are synced to siteData
    updateSiteDataState();

    try {
      const response = await fetch('/api/save-content', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          password: adminPassword,
          data: siteData,
          images: pendingImages
        })
      });

      const result = await response.json();

      if (response.ok && result.success) {
        alert('🎉 Изменения успешно сохранены! Они вступят в силу на сайте в течение 1 минуты.');
        pendingImages = []; // Clear queue
        setUnsavedChanges(false);
      } else {
        alert('❌ Ошибка сохранения: ' + (result.error || 'Неизвестная ошибка'));
        setUnsavedChanges(true);
      }
    } catch (err) {
      alert('❌ Ошибка связи с API: ' + err.message);
      setUnsavedChanges(true);
    } finally {
      btnSaveAll.innerHTML = originalText;
      if (!hasChanges) {
        statusIcon.className = 'fa-solid fa-circle-check status-saved';
        statusDesc.textContent = 'Все изменения синхронизированы';
      }
    }
  });

  /* ==========================================================================
     8. TELEGRAM BOT STATUS WIDGET
     ========================================================================== */
  async function checkBotStatus() {
    try {
      const response = await fetch('/api/bot-status');
      if (!response.ok) return;
      const status = await response.json();
      
      if (status.hasToken) {
        botStatusBadge.className = 'admin-badge';
        botStatusBadge.style.background = 'rgba(16, 185, 129, 0.1)';
        botStatusBadge.style.color = '#10b981';
        botStatusBadge.style.borderColor = '#10b981';
        botStatusBadge.innerHTML = `<i class="fa-solid fa-link"></i> Бот активен (Админов: ${status.adminsCount})`;
        
        // Render names of active receivers
        botAdminsList.innerHTML = '';
        if (status.adminsList && status.adminsList.length > 0) {
          status.adminsList.forEach(admin => {
            const badge = document.createElement('span');
            badge.className = 'admin-badge';
            badge.textContent = admin;
            botAdminsList.appendChild(badge);
          });
        } else {
          botAdminsList.innerHTML = `<p style="font-size: 0.8rem; color: #f59e0b; margin-top: 5px;"><i class="fa-solid fa-triangle-exclamation"></i> Получатели не зарегистрированы. Отправьте боту /ved123</p>`;
        }
      } else {
        botStatusBadge.className = 'admin-badge';
        botStatusBadge.style.background = 'rgba(239, 68, 68, 0.1)';
        botStatusBadge.style.color = '#ef4444';
        botStatusBadge.style.borderColor = '#ef4444';
        botStatusBadge.innerHTML = `<i class="fa-solid fa-circle-xmark"></i> Токен бота не настроен`;
        botAdminsList.innerHTML = '';
      }
    } catch (e) {
      console.error('Ошибка проверки статуса бота:', e.message);
    }
  }

  // Run Auth Check
  checkAuth();
});
