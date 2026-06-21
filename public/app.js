document.addEventListener('DOMContentLoaded', () => {
  // Global site configuration state
  let siteData = null;
  let activeGalleryItems = [];
  let currentLightboxIndex = 0;

  // Cache DOM elements
  const heroTitle = document.querySelector('.hero-title');
  const heroSubtitle = document.querySelector('.hero-subtitle');
  const heroBtn = document.querySelector('.hero-cta .btn-primary');
  const heroImg = document.getElementById('hero-img');
  
  const aboutTag = document.getElementById('about-tag');
  const aboutTitle = document.getElementById('about-title');
  const aboutText1 = document.getElementById('about-text1');
  const aboutText2 = document.getElementById('about-text2');
  const statExperience = document.getElementById('stat-experience');
  const statEvents = document.getElementById('stat-events');
  const statClients = document.getElementById('stat-clients');
  const aboutImg = document.getElementById('about-img');

  const servicesContainer = document.getElementById('services-container');
  const portfolioGrid = document.getElementById('portfolio-grid');
  const filterButtons = document.querySelectorAll('.filter-btn');
  const yandexDiskBtn = document.getElementById('yandex-disk-btn');

  const telegramLink = document.getElementById('telegram-link');
  const instagramLink = document.getElementById('instagram-link');
  
  const phoneText = document.querySelector('.phone-text');
  const phoneLink = document.querySelector('.btn-phone');
  const phoneValue = document.querySelector('.phone-value');
  const phoneTarget = document.querySelector('.phone-target');

  const feedbackForm = document.getElementById('feedback-form');
  const btnSubmitForm = document.getElementById('btn-submit-form');
  const successOverlay = document.getElementById('form-success-overlay');
  const errorOverlay = document.getElementById('form-error-overlay');
  const errorMessageEl = document.getElementById('form-error-message');
  const resetFormBtns = document.querySelectorAll('.reset-form-btn');

  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightbox-img');
  const lightboxTitle = document.getElementById('lightbox-title');
  const lightboxDesc = document.getElementById('lightbox-desc');
  const lightboxClose = document.querySelector('.lightbox-close');
  const lightboxPrev = document.querySelector('.lightbox-prev');
  const lightboxNext = document.querySelector('.lightbox-next');

  const mainHeader = document.getElementById('main-header');
  const mobileToggle = document.querySelector('.mobile-toggle');
  const navMenu = document.querySelector('.nav-menu');

  /* ==========================================================================
     1. DATA RETRIEVAL & RENDERING
     ========================================================================== */
  async function init() {
    try {
      const response = await fetch('/data.json');
      if (!response.ok) throw new Error('Не удалось загрузить данные сайта');
      siteData = await response.json();
      
      renderSiteContent();
    } catch (error) {
      console.error('Ошибка инициализации сайта:', error);
    }
  }

  function renderSiteContent() {
    if (!siteData) return;

    // Document SEO
    document.title = siteData.title || 'Алексей Соколов';
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc && siteData.metaDescription) {
      metaDesc.setAttribute('content', siteData.metaDescription);
    }

    // Phone Contacts
    if (siteData.phone) {
      if (phoneText) phoneText.textContent = siteData.phone;
      if (phoneLink) phoneLink.setAttribute('href', `tel:${siteData.phone.replace(/[^+\d]/g, '')}`);
      if (phoneValue) phoneValue.textContent = siteData.phone;
      if (phoneTarget) phoneTarget.setAttribute('href', `tel:${siteData.phone.replace(/[^+\d]/g, '')}`);
    }

    // Social Links
    if (siteData.telegram && telegramLink) telegramLink.setAttribute('href', siteData.telegram);
    if (siteData.instagram && instagramLink) instagramLink.setAttribute('href', siteData.instagram);
    if (siteData.yandexDisk && yandexDiskBtn) yandexDiskBtn.setAttribute('href', siteData.yandexDisk);

    // Hero Section
    if (siteData.hero) {
      if (heroTitle) heroTitle.innerHTML = siteData.hero.title;
      if (heroSubtitle) heroSubtitle.textContent = siteData.hero.subtitle;
      if (heroBtn && siteData.hero.buttonText) {
        heroBtn.innerHTML = `${siteData.hero.buttonText} <i class="fa-solid fa-arrow-right"></i>`;
      }
      if (heroImg && siteData.hero.image) heroImg.setAttribute('src', siteData.hero.image);
    }

    // About Section
    if (siteData.about) {
      if (aboutTitle) aboutTitle.textContent = siteData.about.title;
      if (aboutTag && siteData.about.subtitle) aboutTag.textContent = siteData.about.subtitle;
      if (aboutText1) aboutText1.textContent = siteData.about.text1;
      if (aboutText2) aboutText2.textContent = siteData.about.text2;
      if (statExperience && siteData.about.experience) statExperience.textContent = siteData.about.experience;
      if (statEvents && siteData.about.eventsCount) statEvents.textContent = siteData.about.eventsCount;
      if (statClients && siteData.about.clientsCount) statClients.textContent = siteData.about.clientsCount;
      if (aboutImg && siteData.about.image) aboutImg.setAttribute('src', siteData.about.image);
      else if (aboutImg && siteData.gallery && siteData.gallery.length > 0) {
        // Fallback to first host gallery image if about image is not specifically set
        const hostPhoto = siteData.gallery.find(item => item.category === 'host');
        if (hostPhoto) aboutImg.setAttribute('src', hostPhoto.image);
      }
    }

    // Event Types / Services
    if (siteData.eventTypes && servicesContainer) {
      servicesContainer.innerHTML = '';
      siteData.eventTypes.forEach(evt => {
        const card = document.createElement('div');
        card.className = 'service-card glass';
        card.innerHTML = `
          <div class="service-img-box">
            <img src="${evt.image}" alt="${evt.title}" class="service-img" loading="lazy">
          </div>
          <div class="service-content">
            <h3 class="service-title">${evt.title}</h3>
            <p class="service-desc">${evt.description}</p>
            <a href="#contact" class="service-footer">
              <span>Заказать формат</span> <i class="fa-solid fa-arrow-right"></i>
            </a>
          </div>
        `;
        servicesContainer.appendChild(card);
      });
    }

    // Portfolio Grid
    renderPortfolio('all');
  }

  function renderPortfolio(filterCategory) {
    if (!siteData || !siteData.gallery || !portfolioGrid) return;

    portfolioGrid.innerHTML = '';
    
    // Filter items
    activeGalleryItems = siteData.gallery.filter(item => {
      return filterCategory === 'all' || item.category === filterCategory;
    });

    if (activeGalleryItems.length === 0) {
      portfolioGrid.innerHTML = `<p class="text-center" style="grid-column: 1/-1; color: var(--color-text-muted); padding: 40px 0;">Фотографий в этой категории пока нет</p>`;
      return;
    }

    // Render cards
    activeGalleryItems.forEach((item, index) => {
      const card = document.createElement('div');
      card.className = 'portfolio-item';
      card.setAttribute('data-index', index);
      card.innerHTML = `
        <img src="${item.image}" alt="${item.title}" loading="lazy">
        <div class="portfolio-overlay">
          <span class="portfolio-item-category">${getCategoryLabel(item.category)}</span>
          <h4 class="portfolio-item-title">${item.title}</h4>
        </div>
      `;
      
      // Open Lightbox on Click
      card.addEventListener('click', () => {
        openLightbox(index);
      });

      portfolioGrid.appendChild(card);
    });
  }

  function getCategoryLabel(category) {
    const labels = {
      'weddings': 'Свадьбы & Юбилеи',
      'graduations': 'Выпускные',
      'commercial': 'Коммерческие',
      'host': 'Ведущий'
    };
    return labels[category] || category;
  }

  /* ==========================================================================
     2. PORTFOLIO FILTER HANDLERS
     ========================================================================== */
  filterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      filterButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const filter = btn.getAttribute('data-filter');
      renderPortfolio(filter);
    });
  });

  /* ==========================================================================
     3. LIGHTBOX GALLERY
     ========================================================================== */
  function openLightbox(index) {
    currentLightboxIndex = index;
    updateLightboxContent();
    lightbox.classList.add('active');
    document.body.style.overflow = 'hidden'; // Lock scroll
  }

  function closeLightbox() {
    lightbox.classList.remove('active');
    document.body.style.overflow = ''; // Unlock scroll
  }

  function updateLightboxContent() {
    if (!activeGalleryItems[currentLightboxIndex]) return;
    const item = activeGalleryItems[currentLightboxIndex];
    lightboxImg.setAttribute('src', item.image);
    lightboxTitle.textContent = item.title;
    lightboxDesc.textContent = item.description || '';
  }

  function nextLightboxImage() {
    currentLightboxIndex = (currentLightboxIndex + 1) % activeGalleryItems.length;
    updateLightboxContent();
  }

  function prevLightboxImage() {
    currentLightboxIndex = (currentLightboxIndex - 1 + activeGalleryItems.length) % activeGalleryItems.length;
    updateLightboxContent();
  }

  // Lightbox Event Listeners
  if (lightboxClose) lightboxClose.addEventListener('click', closeLightbox);
  if (lightboxNext) lightboxNext.addEventListener('click', nextLightboxImage);
  if (lightboxPrev) lightboxPrev.addEventListener('click', prevLightboxImage);
  
  // Close on outside click
  if (lightbox) {
    lightbox.addEventListener('click', (e) => {
      if (e.target === lightbox) closeLightbox();
    });
  }

  // Keyboard navigation for Lightbox
  document.addEventListener('keydown', (e) => {
    if (!lightbox.classList.contains('active')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowRight') nextLightboxImage();
    if (e.key === 'ArrowLeft') prevLightboxImage();
  });

  /* ==========================================================================
     4. NAVIGATION & SCROLL EVENTS
     ========================================================================== */
  // Mobile menu toggle
  if (mobileToggle && navMenu) {
    mobileToggle.addEventListener('click', () => {
      mobileToggle.classList.toggle('open');
      navMenu.classList.toggle('open');
      document.body.classList.toggle('menu-open');
    });
    
    // Close menu when clicking nav link
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        mobileToggle.classList.remove('open');
        navMenu.classList.remove('open');
        document.body.classList.remove('menu-open');
      });
    });
  }

  // Sticky header on scroll
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      mainHeader.classList.add('scrolled');
    } else {
      mainHeader.classList.remove('scrolled');
    }
  });

  // Scroll reveal triggers
  const sections = document.querySelectorAll('.scroll-reveal');
  const revealOnScroll = () => {
    sections.forEach(sec => {
      const secTop = sec.getBoundingClientRect().top;
      const windowHeight = window.innerHeight;
      if (secTop < windowHeight * 0.85) {
        sec.classList.add('revealed');
      }
    });
  };
  
  window.addEventListener('scroll', revealOnScroll);
  setTimeout(revealOnScroll, 300); // Trigger initial checks

  /* ==========================================================================
     5. FEEDBACK FORM SUBMISSION (TELEGRAM INTERACTIVE)
     ========================================================================== */
  if (feedbackForm) {
    feedbackForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      // Get form values
      const name = document.getElementById('client-name').value.trim();
      const phone = document.getElementById('client-phone').value.trim();
      const message = document.getElementById('client-message').value.trim();

      // Show loading state
      btnSubmitForm.disabled = true;
      const originalBtnHtml = btnSubmitForm.innerHTML;
      btnSubmitForm.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Отправка...`;

      try {
        const response = await fetch('/api/feedback', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ name, phone, message })
        });

        const result = await response.json();

        if (response.ok && result.success) {
          // Show Success Overlay
          successOverlay.classList.add('active');
          feedbackForm.reset();
        } else {
          // Show Error Overlay
          errorMessageEl.textContent = result.error || 'Произошла непредвиденная ошибка на сервере.';
          errorOverlay.classList.add('active');
        }
      } catch (err) {
        errorMessageEl.textContent = 'Не удалось связаться с сервером. Пожалуйста, проверьте интернет-соединение.';
        errorOverlay.classList.add('active');
      } finally {
        // Reset button loading state
        btnSubmitForm.disabled = false;
        btnSubmitForm.innerHTML = originalBtnHtml;
      }
    });
  }

  // Reset overlay events
  resetFormBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      successOverlay.classList.remove('active');
      errorOverlay.classList.remove('active');
    });
  });

  // Run initialization
  init();
});
