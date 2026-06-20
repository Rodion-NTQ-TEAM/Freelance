document.addEventListener('DOMContentLoaded', () => {
  setupCatalogFilters();
  setupMortgageModal();
  setupProjectSlider();
  setupHomeCarousel();
  setupLightbox();
  setupParallax();
  setupProjectHeroCard();
  setupHeroBackgroundSlider();
  setupMortgageInline();
  setupContactsForm();
  setupAccordions();
  setupCountUpOnView();
  setupCopyOnClick();
  setupHeaderGlassOnScroll();
  setupHamburgerMenu();
  setupMeetingForm();
  setupConsultButtons();
  setupApartmentPopup();
});

function setupCatalogFilters() {
  const grid = document.getElementById('cards-grid');
  if (!grid) return;

  const roomSelect = document.getElementById('filter-rooms');
  const priceMin = document.getElementById('filter-price-min');
  const priceMax = document.getElementById('filter-price-max');
  const areaMin = document.getElementById('filter-area-min');
  const areaMax = document.getElementById('filter-area-max');
  const applyBtn = document.getElementById('apply-filters');
  const resetBtn = document.getElementById('reset-filters');

  const applyFilters = () => {
    const desiredRooms = roomSelect && roomSelect.value !== '' ? Number(roomSelect.value) : null;
    const minPrice = priceMin && priceMin.value ? Number(priceMin.value) : null;
    const maxPrice = priceMax && priceMax.value ? Number(priceMax.value) : null;
    const minArea = areaMin && areaMin.value ? Number(areaMin.value) : null;
    const maxArea = areaMax && areaMax.value ? Number(areaMax.value) : null;

    const cards = grid.querySelectorAll('.card');
    cards.forEach(card => {
      const rooms = Number(card.getAttribute('data-rooms'));
      const price = Number(card.getAttribute('data-price'));
      const area = Number(card.getAttribute('data-area'));

      const roomsOk = desiredRooms === null || rooms === desiredRooms;
      const priceOk = (minPrice === null || price >= minPrice) && (maxPrice === null || price <= maxPrice);
      const areaOk = (minArea === null || area >= minArea) && (maxArea === null || area <= maxArea);

      card.style.display = roomsOk && priceOk && areaOk ? '' : 'none';
    });
  };

  applyBtn && applyBtn.addEventListener('click', applyFilters);
  [roomSelect, priceMin, priceMax, areaMin, areaMax].forEach(el => {
    el && el.addEventListener('change', applyFilters);
    el && el.addEventListener('keyup', e => { if (e.key === 'Enter') applyFilters(); });
  });

  resetBtn && resetBtn.addEventListener('click', () => {
    if (roomSelect) roomSelect.value = '';
    [priceMin, priceMax, areaMin, areaMax].forEach(el => { if (el) el.value = ''; });
    applyFilters();
  });
}

function setupMortgageModal() {
  const modal = document.getElementById('mortgage-modal');
  if (!modal) return;
  const resultEl = document.getElementById('m-result');
  const form = document.getElementById('mortgage-form');
  const priceInput = document.getElementById('m-price');
  const downInput = document.getElementById('m-down');
  const rateInput = document.getElementById('m-rate');
  const yearsInput = document.getElementById('m-years');

  // open handlers
  document.querySelectorAll('.mortgage-link').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const card = link.closest('.card');
      if (card && priceInput) {
        const price = Number(card.getAttribute('data-price') || '0');
        priceInput.value = String(price);
      }
      openModal(modal);
    });
  });

  // close handlers
  modal.querySelectorAll('[data-close-modal]').forEach(el => el.addEventListener('click', () => closeModal(modal)));
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeModal(modal); });

  form && form.addEventListener('submit', (e) => {
    e.preventDefault();
    const price = Number(priceInput && priceInput.value ? priceInput.value : '0');
    const down = Number(downInput && downInput.value ? downInput.value : '0');
    const rate = Number(rateInput && rateInput.value ? rateInput.value : '0') / 100 / 12; // monthly
    const months = Number(yearsInput && yearsInput.value ? yearsInput.value : '0') * 12;
    const principal = Math.max(price - down, 0);

    let monthly = 0;
    if (rate > 0 && months > 0) {
      const factor = Math.pow(1 + rate, months);
      monthly = principal * (rate * factor) / (factor - 1);
    } else if (months > 0) {
      monthly = principal / months;
    }

    if (resultEl) {
      resultEl.textContent = monthly ? `Платёж: ${formatCurrency(monthly)} ₽/мес.` : '';
    }
  });
}

function openModal(modal) {
  modal.classList.add('open');
  modal.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
}
function closeModal(modal) {
  modal.classList.remove('open');
  modal.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
}

function formatCurrency(value) {
  return Math.round(value).toLocaleString('ru-RU');
}

function setupProjectSlider() {
  const slider = document.getElementById('project-slider');
  if (!slider) return;
  const slides = Array.from(slider.querySelectorAll('.slide'));
  const prev = slider.querySelector('.prev');
  const next = slider.querySelector('.next');
  let index = slides.findIndex(s => s.classList.contains('active'));
  if (index < 0) index = 0;

  const show = (i) => {
    slides.forEach((s, idx) => s.classList.toggle('active', idx === i));
  };
  prev && prev.addEventListener('click', () => { index = (index - 1 + slides.length) % slides.length; show(index); });
  next && next.addEventListener('click', () => { index = (index + 1) % slides.length; show(index); });

  // autoplay
  let timer = setInterval(() => { index = (index + 1) % slides.length; show(index); }, 4000);
  [prev, next, slider].forEach(el => el && el.addEventListener('mouseenter', () => clearInterval(timer)));
  [prev, next, slider].forEach(el => el && el.addEventListener('mouseleave', () => { timer = setInterval(() => { index = (index + 1) % slides.length; show(index); }, 4000); }));
}

function setupHomeCarousel() {
  const carousel = document.getElementById('home-carousel');
  if (!carousel) return;
  const slides = Array.from(carousel.querySelectorAll('.carousel-slide'));
  const prev = carousel.querySelector('.prev');
  const next = carousel.querySelector('.next');
  const dotsWrap = carousel.querySelector('.carousel-dots');
  let index = slides.findIndex(s => s.classList.contains('active'));
  if (index < 0) index = 0;

  const renderDots = () => {
    dotsWrap.innerHTML = '';
    slides.forEach((_, i) => {
      const b = document.createElement('button');
      b.className = i === index ? 'active' : '';
      b.addEventListener('click', () => { index = i; show(index); });
      dotsWrap.appendChild(b);
    });
  };
  const show = (i) => {
    slides.forEach((s, idx) => s.classList.toggle('active', idx === i));
    renderDots();
  };
  prev && prev.addEventListener('click', () => { index = (index - 1 + slides.length) % slides.length; show(index); });
  next && next.addEventListener('click', () => { index = (index + 1) % slides.length; show(index); });
  renderDots();
  let timer = setInterval(() => { index = (index + 1) % slides.length; show(index); }, 5000);
  [prev, next, carousel].forEach(el => el && el.addEventListener('mouseenter', () => clearInterval(timer)));
  [prev, next, carousel].forEach(el => el && el.addEventListener('mouseleave', () => { timer = setInterval(() => { index = (index + 1) % slides.length; show(index); }, 5000); }));
}

function setupLightbox() {
  const imgs = document.querySelectorAll('.lightboxable');
  if (!imgs.length) return;
  let lightboxEl = document.getElementById('lightbox');
  if (!lightboxEl) {
    lightboxEl = document.createElement('div');
    lightboxEl.id = 'lightbox';
    lightboxEl.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.9);display:none;align-items:center;justify-content:center;z-index:2000;';
    const img = document.createElement('img');
    img.style.maxWidth = '92%';
    img.style.maxHeight = '92%';
    img.alt = '';
    img.id = 'lightbox-img';
    lightboxEl.appendChild(img);
    const close = document.createElement('button');
    close.textContent = '×';
    close.setAttribute('aria-label', 'Закрыть');
    close.style.cssText = 'position:absolute;top:16px;right:20px;font-size:32px;color:#fff;background:transparent;border:none;cursor:pointer';
    close.addEventListener('click', () => lightboxEl.style.display = 'none');
    lightboxEl.appendChild(close);
    lightboxEl.addEventListener('click', (e) => { if (e.target === lightboxEl) lightboxEl.style.display = 'none'; });
    document.body.appendChild(lightboxEl);
  }
  const show = (src, alt) => {
    const img = document.getElementById('lightbox-img');
    img.src = src; img.alt = alt || '';
    lightboxEl.style.display = 'flex';
  };
  imgs.forEach(im => im.addEventListener('click', () => show(im.src, im.alt)));
  // expose globally for programmatic open
  window.showLightbox = show;
}

function setupParallax() {
  const elements = document.querySelectorAll('.parallax');
  if (!elements.length) return;
  const onScroll = () => {
    const y = window.scrollY;
    elements.forEach(el => {
      el.style.transform = `translateY(${y * 0.1}px)`;
    });
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

function setupProjectHeroCard() {
  document.querySelectorAll('.project-hero-card').forEach(hero => {
    const slidesContainer = hero.querySelector('.phc-slides');
    const prev = hero.querySelector('.phc-btn.prev');
    const next = hero.querySelector('.phc-btn.next');
    const currentEl = hero.querySelector('.phc-current');
    const totalEl = hero.querySelector('.phc-total');
    const tabs = hero.querySelectorAll('.phc-tab');
    const panels = hero.querySelectorAll('[data-tab-panel]');

    let slides = Array.from(slidesContainer.querySelectorAll('.phc-slide'));
    let index = 0;
    let activePanel = null;
    let timerId = null;
    let isHovered = false;
    let lastActionTime = Date.now();

    const DURATION = 4500; // 4.5 сек между автопереходами

    // === Функции управления ===
    const showSlide = (i) => {
      if (!slides.length) return;
      slides.forEach((s, idx) => s.classList.toggle('active', idx === i));
      if (currentEl) currentEl.textContent = String(i + 1);
    };

    const goToNext = () => {
      if (!slides.length) return;
      index = (index + 1) % slides.length;
      showSlide(index);
    };

    const goToPrev = () => {
      if (!slides.length) return;
      index = (index - 1 + slides.length) % slides.length;
      showSlide(index);
    };

    const clearTimer = () => {
      if (timerId) {
        clearInterval(timerId);
        timerId = null;
      }
    };

    const startTimer = () => {
      clearTimer();
      timerId = setInterval(() => {
        const timePassed = Date.now() - lastActionTime;
        if (!isHovered && timePassed >= DURATION) {
          goToNext();
          lastActionTime = Date.now();
        }
      }, 200);
    };

    const restartTimer = () => {
      lastActionTime = Date.now();
      startTimer();
    };

    // === Кнопки ===
    prev?.addEventListener('click', () => {
      goToPrev();
      restartTimer();
    });

    next?.addEventListener('click', () => {
      goToNext();
      restartTimer();
    });

    // === Наведение ===
    hero.addEventListener('mouseenter', () => {
      isHovered = true;
    });

    hero.addEventListener('mouseleave', () => {
      isHovered = false;
      lastActionTime = Date.now();
    });

    // === Обновление слайдов ===
    function updateSlides() {
      slides = Array.from(slidesContainer.querySelectorAll('.phc-slide'));
      index = 0;
      if (totalEl) totalEl.textContent = String(slides.length);
      showSlide(index);
      restartTimer();
    }

    // === Переключение табов ===
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');

        const tabName = tab.getAttribute('data-tab');
        panels.forEach(p => {
          const isActive = p.getAttribute('data-tab-panel') === tabName;
          p.classList.toggle('hidden', !isActive);
          if (isActive) activePanel = p;
        });

        // Подгрузка картинок (если есть data-src)
        if (activePanel) {
          activePanel.querySelectorAll('img[data-src]').forEach(img => {
            img.src = img.dataset.src;
            img.removeAttribute('data-src');
          });
        }

        // обновляем миниатюры, не ломая главный слайдер
        updateSlides();
      });
    });

    // === Клик по миниатюрам ===
    panels.forEach(panel => {
      panel.addEventListener('click', e => {
        const t = e.target;
        if (t && t.matches('img[data-slide]')) {
          const slideIdx = Number(t.getAttribute('data-slide'));
          if (!Number.isNaN(slideIdx)) {
            const src = t.getAttribute('src');
            const alt = t.getAttribute('alt') || '';

            // Проверяем, есть ли это изображение среди основных слайдов
            const foundSlide = slides.find(s => s.src.includes(src.split('/').pop()));

            if (foundSlide) {
              index = slides.indexOf(foundSlide);
              showSlide(index);
              restartTimer();
            }

            // Всегда показываем нужное изображение в лайтбоксе
            if (window.showLightbox) {
              window.showLightbox(src, alt);
            }
          }

        }
      });
    });

    // === Инициализация ===
    const firstTab = hero.querySelector('.phc-tab.active') || tabs[0];
    if (firstTab) {
      const tabName = firstTab.getAttribute('data-tab');
      panels.forEach(p => p.classList.toggle('hidden', p.getAttribute('data-tab-panel') !== tabName));
      activePanel = hero.querySelector(`[data-tab-panel="${tabName}"]`);
    }

    updateSlides();
    startTimer();
  });
}



function setupHeroBackgroundSlider() {
  const hero = document.querySelector('.hero');
  const slides = hero ? Array.from(hero.querySelectorAll('.hero-slide')) : [];
  if (!hero || !slides.length) return;
  let i = slides.findIndex(s => s.classList.contains('active')); if (i < 0) i = 0;
  const show = (idx) => slides.forEach((s, k) => s.classList.toggle('active', k === idx));
  let timer = setInterval(() => { i = (i + 1) % slides.length; show(i); }, 5000);
  hero.addEventListener('mouseenter', () => clearInterval(timer));
  hero.addEventListener('mouseleave', () => { timer = setInterval(() => { i = (i + 1) % slides.length; show(i); }, 5000); });
}

function setupMortgageInline() {
  const form = document.getElementById('mortgage-form-page');
  if (!form) return;
  const priceInput = document.getElementById('m-price-page');
  const downInput = document.getElementById('m-down-page');
  const rateInput = document.getElementById('m-rate-page');
  const yearsInput = document.getElementById('m-years-page');
  const resultEl = document.getElementById('m-result-page');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const price = Number(priceInput.value || '0');
    const down = Number(downInput.value || '0');
    const rate = Number(rateInput.value || '0') / 100 / 12;
    const months = Number(yearsInput.value || '0') * 12;
    const principal = Math.max(price - down, 0);
    let monthly = 0;
    if (rate > 0 && months > 0) {
      const factor = Math.pow(1 + rate, months);
      monthly = principal * (rate * factor) / (factor - 1);
    } else if (months > 0) {
      monthly = principal / months;
    }
    resultEl.textContent = monthly ? `Платёж: ${formatCurrency(monthly)} ₽/мес.` : '';
  });
}

function setupContactsForm() {
  const form = document.getElementById('contact-form');
  if (!form) return;
  const resultEl = document.getElementById('contact-result');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    resultEl.textContent = 'Спасибо! Мы свяжемся с вами в ближайшее время.';
    form.reset();
  });
}

function setupAccordions() {
  document.querySelectorAll('.accordion .accordion-header').forEach(btn => {
    btn.addEventListener('click', () => {
      const card = btn.closest('.accordion');
      card.classList.toggle('open');
    });
  });
}

function setupCountUpOnView() {
  const elements = document.querySelectorAll('.stat b[data-count]');
  if (!elements.length) return;
  const animate = (el) => {
    const target = Number(el.getAttribute('data-count'));
    let current = 0;
    const duration = 900; const start = performance.now();
    const step = (t) => {
      const p = Math.min((t - start) / duration, 1);
      current = Math.floor(target * p);
      el.textContent = current.toLocaleString('ru-RU');
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        animate(e.target);
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.6 });
  elements.forEach(el => io.observe(el));
}

function setupCopyOnClick() {
  document.querySelectorAll('.copy').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const text = link.getAttribute('data-copy') || link.textContent;
      navigator.clipboard.writeText(text).then(() => {
        link.textContent = 'Скопировано!';
        setTimeout(() => { link.textContent = text; }, 1200);
      }).catch(() => {
        // ignore
      });
    });
  });
}

function setupHeaderGlassOnScroll() {
  const header = document.querySelector('.site-header');
  if (!header) return;
  const onScroll = () => {
    if (window.scrollY > 20) header.classList.add('scrolled');
    else header.classList.remove('scrolled');
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

function setupHamburgerMenu() {
  const header = document.querySelector('.site-header');
  const toggle = document.createElement('button');
  toggle.className = 'menu-toggle';
  toggle.setAttribute('aria-label', 'Открыть меню');
  toggle.innerHTML = '<span></span><span></span><span></span>';
  const container = header?.querySelector('.header-inner');
  const nav = header?.querySelector('.main-nav');
  if (!header || !container || !nav) return;
  const backdrop = document.createElement('div');
  backdrop.className = 'nav-backdrop';
  container.insertBefore(toggle, nav);
  container.appendChild(backdrop);

  const setOpen = (open) => {
    header.classList.toggle('menu-open', open);
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
  };
  toggle.addEventListener('click', () => setOpen(!header.classList.contains('menu-open')));
  backdrop.addEventListener('click', () => setOpen(false));
  nav.querySelectorAll('a').forEach(a => a.addEventListener('click', () => setOpen(false)));
}

function setupMeetingForm() {
  const form = document.getElementById('meeting-form');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());

    // Simulate form submission
    const result = document.getElementById('meeting-result');
    result.textContent = 'Спасибо! Ваша заявка отправлена. Мы свяжемся с вами в ближайшее время.';
    result.style.color = '#4caf50';

    // Reset form
    form.reset();

    // Close modal after 2 seconds
    setTimeout(() => {
      closeMeetingForm();
      result.textContent = '';
    }, 2000);
  });
}

// Global functions for meeting modal
function openMeetingForm() {
  const modal = document.getElementById('meeting-modal');
  if (modal) {
    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
}

function closeMeetingForm() {
  const modal = document.getElementById('meeting-modal');
  if (modal) {
    modal.classList.remove('open');
    document.body.style.overflow = '';
  }
}


// Ensure meeting modal exists (for pages that forgot to include it)
function ensureMeetingModalExists() {
  let modal = document.getElementById('meeting-modal');
  if (modal) return modal;
  modal = document.createElement('div');
  modal.id = 'meeting-modal';
  modal.className = 'modal';
  modal.innerHTML = `
    <div class="modal-backdrop" onclick="closeMeetingForm()"></div>
    <div class="modal-dialog">
      <button class="modal-close" onclick="closeMeetingForm()">&times;</button>
      <h3>Записаться на встречу</h3>
      <form id="meeting-form" class="meeting-form">
        <label>Имя *<input type="text" name="name" required></label>
        <label>Телефон *<input type="tel" name="phone" required></label>
        <label>Email<input type="email" name="email"></label>
        <label>Предпочтительная дата<input type="date" name="date"></label>
        <label>Время
          <select name="time">
            <option value="">Выберите время</option>
            <option value="09:00">09:00</option>
            <option value="10:00">10:00</option>
            <option value="11:00">11:00</option>
            <option value="12:00">12:00</option>
            <option value="14:00">14:00</option>
            <option value="15:00">15:00</option>
            <option value="16:00">16:00</option>
            <option value="17:00">17:00</option>
            <option value="18:00">18:00</option>
          </select>
        </label>
        <label>Комментарий<textarea name="comment" rows="3" placeholder="Расскажите о ваших пожеланиях..."></textarea></label>
        <button class="btn btn-accent" type="submit">Отправить заявку</button>
        <div id="meeting-result" class="m-result" aria-live="polite"></div>
      </form>
    </div>`;
  document.body.appendChild(modal);
  setupMeetingForm();
  return modal;
}

// Make all "Консультация" clicks open meeting modal (delegated)
function setupConsultButtons() {
  document.addEventListener('click', (e) => {
    const target = e.target;
    if (!(target instanceof Element)) return;
    if (target.closest('.consult-link') || target.closest('.consult-from-apt')) {
      e.preventDefault();
      ensureMeetingModalExists();
      openMeetingForm();
    }
  });
}

// Apartments: open popup with details on card click
function setupApartmentPopup() {
  const grid = document.getElementById('cards-grid');
  if (!grid) return;

  let modal = document.getElementById('apartment-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'apartment-modal';
    modal.className = 'modal';
    modal.innerHTML = `
      <div class="modal-backdrop" data-close></div>
      <div class="modal-dialog">
        <button class="modal-close" data-close>&times;</button>
        <div class="apt-modal">
          <div class="apt-gallery">
            <img id="apt-main" alt="Фото квартиры" style="width:100%;border-radius:12px;"/>
            <div id="apt-thumbs" style="display:flex;gap:8px;margin-top:8px;flex-wrap:wrap;"></div>
          </div>
          <div class="apt-info" style="margin-top:12px">
            <h3 id="apt-title" style="margin:0 0 8px 0;">Квартира</h3>
            <div id="apt-price" class="card-price" style="font-size:20px;font-weight:700"></div>
            <div id="apt-meta" class="card-meta" style="margin-top:6px"></div>
            <div id="apt-deadline" class="card-deadline" style="margin-top:6px"></div>
            <div style="margin-top:12px;display:flex;gap:8px;flex-wrap:wrap;">
              <a class="btn btn-outline" href="jk.html">К проекту</a>
              <button type="button" class="btn btn-accent consult-from-apt">Консультация</button>
            </div>
          </div>
        </div>
      </div>`;
    document.body.appendChild(modal);
    modal.querySelectorAll('[data-close]').forEach(b => b.addEventListener('click', () => closeModal(modal)));
  }

  const mainImg = () => modal.querySelector('#apt-main');
  const thumbsWrap = () => modal.querySelector('#apt-thumbs');

  grid.addEventListener('click', (e) => {
    const t = e.target;
    const card = (t instanceof HTMLElement) ? t.closest('.card') : null;
    if (!card) return;
    e.preventDefault();

    const imgEl = card.querySelector('img');
    const price = card.querySelector('.card-price')?.textContent || '';
    const meta = card.querySelector('.card-meta')?.textContent || '';
    const deadline = card.querySelector('.card-deadline')?.textContent || '';
    const title = card.querySelector('.card-meta')?.textContent?.split(':')[0] || 'Квартира';

    const main = mainImg();
    if (main && imgEl) { main.src = imgEl.getAttribute('src'); main.alt = imgEl.getAttribute('alt') || ''; }
    const tw = thumbsWrap(); if (tw) { tw.innerHTML = ''; }

    // build thumbs: try to guess additional images from dataset or same directory
    const src = imgEl?.getAttribute('src') || '';
    const candidates = [src];
    // naive attempt to add small variations (e.g., numbered files in same folder)
    const m = src.match(/^(.*?)(\d+)(\.[^.]+)$/);
    if (m) {
      const base = m[1]; const num = Number(m[2]); const ext = m[3];
      for (let i = num + 1; i <= num + 3; i++) candidates.push(`${base}${i}${ext}`);
    }
    const unique = Array.from(new Set(candidates));
    unique.forEach((s, i) => {
      const im = document.createElement('img');
      im.src = s; im.alt = `Фото ${i + 1}`; im.style.cssText = 'width:80px;height:64px;object-fit:cover;border-radius:8px;cursor:pointer;';
      im.addEventListener('click', () => { if (main) { main.src = s; main.alt = im.alt; } });
      thumbsWrap().appendChild(im);
    });

    const tEl = modal.querySelector('#apt-title'); if (tEl) tEl.textContent = title;
    const pEl = modal.querySelector('#apt-price'); if (pEl) pEl.textContent = price;
    const mEl = modal.querySelector('#apt-meta'); if (mEl) mEl.textContent = meta;
    const dEl = modal.querySelector('#apt-deadline'); if (dEl) dEl.textContent = deadline;

    // Consultation from inside popup handled by delegated handler

    openModal(modal);
  });
}

