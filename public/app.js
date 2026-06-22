document.addEventListener('DOMContentLoaded', () => {
  // Global site configuration state
  let siteData = null;
  let activeGalleryItems = [];
  let currentLightboxIndex = 0;

  // Cache DOM elements
  const logoText = document.querySelector('.logo-text');
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

  function parseStatString(str) {
    if (!str) return null;
    const match = str.trim().match(/^([\d\s+-]+[+±]?)\s+(.*)$/);
    if (match) {
      return { num: match[1].trim(), lbl: match[2].trim() };
    }
    return { num: str.trim(), lbl: null };
  }

  function renderSiteContent() {
    if (!siteData) return;

    // Logo Text
    if (logoText && siteData.logoText) {
      logoText.textContent = siteData.logoText;
    }

    // Document SEO
    // Document SEO
    document.title = siteData.title || 'Алиса Вайнштейн';
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

    // Email Contact
    const emailValue = document.getElementById('email-value');
    if (emailValue && siteData.email) {
      emailValue.textContent = siteData.email;
    }

    // Social Links
    if (siteData.telegram && telegramLink) telegramLink.setAttribute('href', siteData.telegram);
    if (siteData.instagram && instagramLink) instagramLink.setAttribute('href', siteData.instagram);
    if (siteData.yandexDisk && yandexDiskBtn) yandexDiskBtn.setAttribute('href', siteData.yandexDisk);

    // Hero Section
    if (siteData.hero) {
      if (heroTitle && siteData.hero.title) {
        let cleanText = siteData.hero.title.replace(/<[^>]+>/g, '');
        const sentences = cleanText.split('.').map(s => s.trim()).filter(Boolean);
        if (sentences.length >= 2) {
          const mainPart = sentences.slice(0, -1).join('. ') + '.';
          const lastPart = sentences[sentences.length - 1];
          const words = lastPart.split(' ').map(w => w.trim()).filter(Boolean);
          if (words.length > 0) {
            words[0] = `<span>${words[0]}</span>`;
          }
          heroTitle.innerHTML = `${mainPart}<br>${words.join(' ')}`;
        } else {
          const words = cleanText.split(' ').map(w => w.trim()).filter(Boolean);
          if (words.length > 0) {
            words[0] = `<span>${words[0]}</span>`;
          }
          heroTitle.innerHTML = words.join(' ');
        }
      }
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
      if (statExperience && siteData.about.experience) {
        const parsed = parseStatString(siteData.about.experience);
        if (parsed) {
          statExperience.textContent = parsed.num;
          const labelEl = statExperience.parentElement.querySelector('.badge-text');
          if (labelEl && parsed.lbl) labelEl.textContent = parsed.lbl;
        }
      }
      if (statEvents && siteData.about.eventsCount) {
        const parsed = parseStatString(siteData.about.eventsCount);
        if (parsed) {
          statEvents.textContent = parsed.num;
          const labelEl = statEvents.parentElement.querySelector('.stat-lbl');
          if (labelEl && parsed.lbl) labelEl.textContent = parsed.lbl;
        }
      }
      if (statClients && siteData.about.clientsCount) {
        const parsed = parseStatString(siteData.about.clientsCount);
        if (parsed) {
          statClients.textContent = parsed.num;
          const labelEl = statClients.parentElement.querySelector('.stat-lbl');
          if (labelEl && parsed.lbl) labelEl.textContent = parsed.lbl;
        }
      }
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
            <div class="service-price">
              <i class="fa-solid fa-tags"></i> Цену уточняйте индивидуально
            </div>
            <a href="#contact" class="service-footer">
              <span>Заказать формат</span> <i class="fa-solid fa-arrow-right"></i>
            </a>
          </div>
        `;
        servicesContainer.appendChild(card);
      });
    }

    // Portfolio Grid
    renderPortfolio('weddings');

    // Background Music init
    initMusic();
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
  // Parallax background and geometric elements cache
  const orb1 = document.querySelector('.orb-1');
  const orb2 = document.querySelector('.orb-2');
  const path1 = document.querySelector('.path-1');
  const path2 = document.querySelector('.path-2');
  const shape1 = document.querySelector('.shape-1');
  const shape2 = document.querySelector('.shape-2');

  // Sticky header on scroll & Parallax animations
  window.addEventListener('scroll', () => {
    const scrolled = window.scrollY;
    
    if (scrolled > 50) {
      mainHeader.classList.add('scrolled');
    } else {
      mainHeader.classList.remove('scrolled');
    }
    
    // Move background glow orbs in parallax
    if (orb1) orb1.style.transform = `translateY(${scrolled * 0.12}px)`;
    if (orb2) orb2.style.transform = `translateY(${scrolled * -0.08}px)`;
    
    // Translate background SVG vector lines
    if (path1) path1.style.transform = `translateY(${scrolled * 0.05}px)`;
    if (path2) path2.style.transform = `translateY(${scrolled * -0.03}px)`;
    
    // Zoom and shift hero image slightly
    if (heroImg && scrolled < window.innerHeight) {
      heroImg.style.transform = `scale(${1 + scrolled * 0.00008}) translateY(${scrolled * 0.03}px)`;
    }
    
    // Rotate abstract geometric visual helpers
    if (shape1) shape1.style.transform = `rotate(${scrolled * 0.12}deg) translateY(${scrolled * 0.06}px)`;
    if (shape2) shape2.style.transform = `translateY(${scrolled * -0.08}px) rotate(${scrolled * -0.04}deg)`;
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

  /* ==========================================================================
     6. BACKGROUND MUSIC PLAYER (FADE-IN & AUTOPLAY)
     ========================================================================== */
  const bgMusic = document.getElementById('bg-music');
  const btnMusicToggle = document.getElementById('btn-music-toggle');
  const musicWavesEl = document.getElementById('music-waves-el');
  const musicToggleContainer = document.querySelector('.music-toggle-container');

  let musicPlaying = false;
  let autoplayInitiated = false;
  let musicInitialized = false;

  function initMusic() {
    if (!bgMusic) return;

    // Check if music is enabled in data.json configuration
    if (siteData && siteData.musicEnabled === false) {
      if (musicToggleContainer) musicToggleContainer.style.display = 'none';
      bgMusic.pause();
      removeAutoplayTriggers();
      return;
    }

    // Music is enabled: display UI toggle
    if (musicToggleContainer) musicToggleContainer.style.display = 'flex';
    
    // Set custom music source URL if configured
    if (siteData && siteData.musicUrl) {
      bgMusic.src = siteData.musicUrl;
    }

    if (musicInitialized) return; // Prevent duplicate listeners
    musicInitialized = true;

    if (btnMusicToggle) {
      btnMusicToggle.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleMusic();
      });
    }

    // Try to play immediately (works if browser autoplay permissions are already granted)
    bgMusic.volume = 0.25;
    bgMusic.play().then(() => {
      if (musicWavesEl) {
        musicWavesEl.classList.add('playing');
        musicWavesEl.classList.remove('paused');
      }
      musicPlaying = true;
      autoplayInitiated = true;
    }).catch(() => {
      // Autoplay blocked by browser policy: register document-wide triggers for first user interaction to play
      ['click', 'scroll', 'keydown', 'touchstart'].forEach(evt => {
        document.addEventListener(evt, startAutoplayWithFade, { passive: true });
      });
    });
  }

  function toggleMusic() {
    if (!bgMusic) return;
    
    if (musicPlaying) {
      bgMusic.pause();
      if (musicWavesEl) {
        musicWavesEl.classList.add('paused');
        musicWavesEl.classList.remove('playing');
      }
      musicPlaying = false;
    } else {
      bgMusic.volume = 0.25;
      bgMusic.play().then(() => {
        if (musicWavesEl) {
          musicWavesEl.classList.add('playing');
          musicWavesEl.classList.remove('paused');
        }
        musicPlaying = true;
      }).catch(err => {
        console.warn('Audio play error:', err.message);
      });
    }
  }

  // Smooth fade-in to prevent sudden loud sounds
  function startAutoplayWithFade() {
    if (autoplayInitiated || !bgMusic) return;
    autoplayInitiated = true;
    
    bgMusic.volume = 0;
    bgMusic.play().then(() => {
      if (musicWavesEl) {
        musicWavesEl.classList.add('playing');
        musicWavesEl.classList.remove('paused');
      }
      musicPlaying = true;
      
      let vol = 0;
      const targetVol = 0.25; // Increase pleasant background volume for better audibility
      const fadeDuration = 3000; // 3 seconds fade
      const step = 0.01;
      const interval = fadeDuration / (targetVol / step);
      
      const fadeInterval = setInterval(() => {
        vol += step;
        if (vol >= targetVol) {
          bgMusic.volume = targetVol;
          clearInterval(fadeInterval);
        } else {
          bgMusic.volume = vol;
        }
      }, interval);
      
      removeAutoplayTriggers();
    }).catch(() => {
      // Reset volume to 0.25 in case browser blocked autoplay, 
      // so that when the user manually clicks play, they can actually hear it!
      bgMusic.volume = 0.25;
      console.log('Autoplay blocked. Waiting for manual play click.');
    });
  }

  function removeAutoplayTriggers() {
    ['click', 'scroll', 'keydown', 'touchstart'].forEach(evt => {
      document.removeEventListener(evt, startAutoplayWithFade);
    });
  }

  // Scroll Drawing SVG Path Animation
  function initScrollDrawing() {
    const scrollPath = document.getElementById('scroll-path');
    if (!scrollPath) return;

    let pathLength = 1050;
    try {
      pathLength = scrollPath.getTotalLength() || 1050;
    } catch (e) {}

    scrollPath.style.strokeDasharray = pathLength;
    scrollPath.style.strokeDashoffset = pathLength;

    function updatePathDrawing() {
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (scrollHeight <= 0) return;
      
      const scrollPercent = window.scrollY / scrollHeight;
      const percent = Math.min(Math.max(scrollPercent, 0), 1);
      
      scrollPath.style.strokeDashoffset = pathLength - (pathLength * percent);
    }

    updatePathDrawing();
    window.addEventListener('scroll', updatePathDrawing);
    window.addEventListener('resize', () => {
      try {
        pathLength = scrollPath.getTotalLength() || 1050;
        scrollPath.style.strokeDasharray = pathLength;
      } catch (e) {}
      updatePathDrawing();
    });
  }

  // Run initialization
  init();
  initScrollDrawing();
});
