const STORAGE_KEY = 'jk_projects_v1';
const NEWS_KEY = 'jk_news_v1';
const APARTMENTS_KEY = 'jk_apartments_v1';

document.addEventListener('DOMContentLoaded', async () => {
  console.log('⏳ Загрузка данных...');

  // Универсальная функция загрузки и сохранения
  async function loadAndSave(url, key) {
    try {
      const res = await fetch(url + '?_=' + Date.now()); // обходим кэш
      if (!res.ok) throw new Error('HTTP ' + res.status);
      const data = await res.json();
      localStorage.setItem(key, JSON.stringify(data));
      console.log(`✅ ${key} сохранён (${Array.isArray(data) ? data.length : 0} элементов)`);
    } catch (err) {
      console.warn(`⚠️ Не удалось загрузить ${url}:`, err);
    }
  }

  // Последовательно ждём загрузку всех файлов
  await loadAndSave('/data/projects.json', STORAGE_KEY);
  await loadAndSave('/data/news.json', NEWS_KEY);
  await loadAndSave('/data/apartments.json', APARTMENTS_KEY);

  console.log('📦 Все данные загружены в localStorage');

  // Теперь можно безопасно выполнять остальные функции
  seedDemoProjectsIfEmpty();
  seedDemoApartmentsIfEmpty();
  renderProjectsToCatalog();
  renderProjectsToHome();
  renderNewsToIndex();
  renderApartmentsCarousel();

  console.log('✅ Рендер завершён');
});


function getProjects() { try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); } catch { return []; } }
function getNews() { try { return JSON.parse(localStorage.getItem(NEWS_KEY) || '[]'); } catch { return []; } }
function getApartments() { try { return JSON.parse(localStorage.getItem(APARTMENTS_KEY) || '[]'); } catch { return []; } }
function saveApartments(list) { try { localStorage.setItem(APARTMENTS_KEY, JSON.stringify(list)); } catch { } }

function seedDemoProjectsIfEmpty() {
  const cur = getProjects();
  if (Array.isArray(cur) && cur.length) return;
  const demo = [
    {
      name: 'Arabian Ranches',
      price: 'от 12 026 359 ₽',
      location: 'Ⓜ Нижегородская · 10 мин',
      deadline: 'IV кв. 2026 г.',
      ext: [
        'assets/Arabian Ranches/эктерьер/Arabian Ranches  — yuxarıdan ümumi görünüş.jpg',
        'assets/Arabian Ranches/эктерьер/AR3_View02.jpg',
        'assets/Arabian Ranches/эктерьер/AR3_View03.jpg',
        'assets/Arabian Ranches/эктерьер/Dəniz mənzərəli istirahət zonası olan terras.jpg'
      ],
      int: [
        'assets/Arabian Ranches/интерьер студии/A1_View01.jpg',
        'assets/Arabian Ranches/интерьер студии/A1_View02.jpg'
      ],
      plan: [
        'assets/Arabian Ranches/планировка студии/36.2 kv, studio.jpg'
      ]
    },
    {
      name: 'Marina Village',
      price: 'от 17 001 471 ₽',
      location: 'Ⓜ Прибрежная · 8 мин',
      deadline: 'III кв. 2026 г.',
      ext: [
        'assets/Marina Vilage/экстерьер/Marina Village-ə sahildən görünüş.jpg',
        'assets/Marina Vilage/экстерьер/Marina Village комплексинин фасады.jpg',
        'assets/Marina Vilage/экстерьер/Marina Village - Körpülərlə əsas hovuz.jpg',
        'assets/Marina Vilage/экстерьер/Yatlardan Marina Village görünüşü.jpg'
      ],
      int: [
        'assets/Marina Vilage/интерьер/2.jpg',
        'assets/Marina Vilage/интерьер/3.jpg'
      ],
      plan: [
        'assets/Marina Vilage/планировка/studiya.png',
        'assets/Marina Vilage/планировка/1- yataq otağı.png'
      ]
    },
    {
      name: 'Villa Siena',
      price: 'от 18 765 609 ₽',
      location: 'Ⓜ Центр · 12 мин',
      deadline: 'IV кв. 2026 г.',
      ext: [
        'assets/Vila siena/эктерьер/DSCF3233.jpg',
        'assets/Vila siena/эктерьер/DSCF3243.jpg',
        'assets/Vila siena/эктерьер/DSCF3254.jpg',
        'assets/Vila siena/эктерьер/DSCF3261.jpg'
      ],
      int: [
        'assets/Vila siena/интерьер/DSCF3172.jpg',
        'assets/Vila siena/интерьер/DSCF3178.jpg'
      ],
      plan: [
        'assets/Marina Vilage/планировка/2-yataq otağı.png'
      ]
    }
  ];
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(demo)); } catch { }
}

function seedDemoApartmentsIfEmpty() {
  const cur = getApartments();
  if (Array.isArray(cur) && cur.length) return;
  const demo = [
    {
      projectId: 0,
      type: 'Студия',
      rooms: 0,
      area: '34.17 м²',
      areaNumber: 34.17,
      price: '12 026 359 ₽',
      priceNumber: 12026359,
      mortgage: 'В ипотеку: от 31 765 ₽/мес.',
      location: 'Arabian Ranches · Корпус 1, 39/45 эт.',
      image: 'assets/Arabian Ranches/интерьер студии/A1_View01.jpg',
      deliveryDate: 'IV кв. 2026 г.'
    },
    {
      projectId: 0,
      type: '1-комн. квартира',
      rooms: 1,
      area: '65.51 м²',
      areaNumber: 65.51,
      price: '17 001 471 ₽',
      priceNumber: 17001471,
      mortgage: 'В ипотеку: от 39 210 ₽/мес.',
      location: 'Arabian Ranches · Корпус 1, 25/45 эт.',
      image: 'assets/Arabian Ranches/интерьер/Copy of 1bdr_View01.jpg',
      deliveryDate: 'IV кв. 2026 г.'
    },
    {
      projectId: 0,
      type: '2-комн. квартира',
      rooms: 2,
      area: '92.05 м²',
      areaNumber: 92.05,
      price: '18 765 609 ₽',
      priceNumber: 18765609,
      mortgage: 'В ипотеку: от 45 110 ₽/мес.',
      location: 'Arabian Ranches · Корпус 2, 15/45 эт.',
      image: 'assets/Arabian Ranches/интерьер/Copy of 1bdr_View03.jpg',
      deliveryDate: 'IV кв. 2026 г.'
    },
    {
      projectId: 1,
      type: 'Студия',
      rooms: 0,
      area: '40.5 м²',
      areaNumber: 40.5,
      price: '17 025 000 ₽',
      priceNumber: 17025000,
      mortgage: 'В ипотеку: от 40 600 ₽/мес.',
      location: 'Marina Village · Корпус 3, 12/25 эт.',
      image: 'assets/Marina Vilage/интерьер/2.jpg',
      deliveryDate: 'III кв. 2026 г.'
    },
    {
      projectId: 2, // ✅ Должен быть 2 для Villa Siena
      type: '3-комн. квартира',
      rooms: 3,
      area: '124.64 м²',
      areaNumber: 124.64,
      price: '72 345 888 ₽',
      priceNumber: 72345888,
      mortgage: 'В ипотеку: от 172 800 ₽/мес.',
      location: 'Villa Siena · Корпус 1, 8/12 эт.',
      image: 'assets/Vila siena/интерьер/DSCF3178.jpg',
      deliveryDate: 'IV кв. 2026 г.'
    }
  ];
  saveApartments(demo);
}
function renderProjectsToCatalog() {
  const grid = document.getElementById('cards-grid');
  if (!grid) return;
  const projects = getProjects();
  if (!projects.length) return;
  projects.forEach((p, idx) => {
    const el = document.createElement('article');
    el.className = 'project-hero-card';
    el.setAttribute('data-id', String(idx));
    const ext = p.ext && p.ext.length ? p.ext : [];
    const first = ext[0] || 'images/placeholder-1.png';
    const second = ext[1] || first; const third = ext[2] || second; const fourth = ext[3] || third;
    el.innerHTML = `
      <div class="phc-slider" role="region" aria-label="Галерея ${escapeHtml(p.name)}">
        <div class="phc-slides">
          <img class="phc-slide active lightboxable" src="${first}" alt="${escapeHtml(p.name)} 1"/>
          <img class="phc-slide lightboxable" src="${second}" alt="${escapeHtml(p.name)} 2"/>
          <img class="phc-slide lightboxable" src="${third}" alt="${escapeHtml(p.name)} 3"/>
          <img class="phc-slide lightboxable" src="${fourth}" alt="${escapeHtml(p.name)} 4"/>
        </div>
        <button class="phc-btn prev" type="button" aria-label="Назад">‹</button>
        <button class="phc-btn next" type="button" aria-label="Вперёд">›</button>
        <div class="phc-counter" aria-hidden="true"><span class="phc-current">1</span>/<span class="phc-total">4</span></div>
      </div>
      <div class="phc-tabs">
        <button class="phc-tab active" data-tab="ext">Экстерьер</button>
        <button class="phc-tab" data-tab="int">Интерьер</button>
        <button class="phc-tab" data-tab="plan">Планировки</button>
      </div>
      <div class="phc-thumbs" data-tab-panel="ext">
        <img data-slide="0" src="${first}" alt="Экстерьер 1"/>
        <img data-slide="1" src="${second}" alt="Экстерьер 2"/>
        <img data-slide="2" src="${third}" alt="Экстерьер 3"/>
        <img data-slide="3" src="${fourth}" alt="Экстерьер 4"/>
      </div>
      <div class="phc-thumbs hidden" data-tab-panel="int">
        ${(p.int || []).slice(0, 4).map(s => `<img data-src="${s}" alt="int">`).join('')}
      </div>
      <div class="phc-thumbs hidden" data-tab-panel="plan">
        ${(p.plan || []).slice(0, 4).map(s => `<img data-src="${s}" alt="plan">`).join('')}
      </div>
      <div class="phc-overlay">
        <div class="phc-header">
          <h2 class="phc-title">${escapeHtml(p.name || 'ЖК')}</h2>
          <div class="phc-price">${escapeHtml(p.price || '')}</div>
        </div>
        <div class="phc-meta">
          <span class="phc-metro">${escapeHtml(p.location || '')}</span>
          <span class="phc-time">${escapeHtml(p.deadline || '')}</span>
        </div>
        <a class="btn btn-outline" href="project.html?id=${idx}">Daha ətraflı</a>
      </div>
    `;
    el.addEventListener('click', (e) => {
      const target = e.target;
      if (!(target instanceof HTMLElement) || target.closest('.phc-btn') || target.closest('.phc-tab') || target.closest('.phc-thumbs')) return;
      window.location.href = `project.html?id=${idx}`;
    });
    grid.appendChild(el);
  });
  // компакт для главной
  grid.classList.add('compact-cards');
  if (window.setupProjectHeroCard) window.setupProjectHeroCard();
  if (window.setupLightbox) window.setupLightbox();
}

function renderProjectsToHome() {
  const grid = document.getElementById('home-projects');
  if (!grid) return;
  grid.innerHTML = '';
  const projects = getProjects();
  if (!projects.length) return;
  
  grid.classList.remove('compact-cards');
  grid.classList.add('mini-cards');
  
  projects.forEach((p, index) => {  // Добавляем index параметр
    const cover = (p.ext && p.ext[0]) || 'images/placeholder-1.png';
    const a = document.createElement('a');
    a.className = 'mini-card';
    a.href = `project.html?id=${index}`;  // Добавляем ссылку на страницу ЖК
    a.innerHTML = `
      <img src="${cover}" alt="${escapeHtml(p.name || 'ЖК')}"/>
      <div class="mini-info">
        <h3 class="mini-title">${escapeHtml(p.name || 'ЖК')}</h3>
        <div class="mini-price">${escapeHtml(p.price || '')}</div>
      </div>`;
    grid.appendChild(a);
  });
}

function renderNewsToIndex() {
  const container = document.getElementById('news-list');
  if (!container) return;
  let list = getNews();
  if (!list.length) {
    list = [
      { date: '01.10.2025', title: 'Интересный факт: башни с вертикальными садами', text: 'Вертикальные сады снижают температуру фасада до 7°C и улучшают качество воздуха.' },
      { date: '28.09.2025', title: 'Смарт-квартиры и энергосбережение', text: 'Системы умного дома экономят до 20% расходов на электричество и отопление.' }
    ];
  }
  container.innerHTML = list.map(n => `
    <article class="news-item">
      <div class="news-date">${escapeHtml(n.date || '')}</div>
      <h3 class="news-title">${escapeHtml(n.title || '')}</h3>
      <p class="news-text">${escapeHtml(n.text || '')}</p>
    </article>
  `).join('');
}

function escapeHtml(s) { return String(s).replace(/[&<>"']/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', '\'': '&#39;' }[m])); }

function renderApartmentsCarousel() {
  const track = document.getElementById('apartments-track');
  if (!track) return;

  const apartments = getApartments();
  const projects = getProjects();
    
console.log('=== ДЕБАГ КАРУСЕЛИ ===');
  console.log('Всего квартир:', apartments.length);
  apartments.forEach((apt, i) => {
    console.log(`${i + 1}. ${apt.type} - ${apt.location}`);
  });    

  track.innerHTML = apartments.map(apt => {
    const rooms = typeof apt.rooms === 'number' ? apt.rooms : null;
    const priceNum = typeof apt.priceNumber === 'number' ? apt.priceNumber : null;
    const areaNum = typeof apt.areaNumber === 'number' ? apt.areaNumber : null;
    const projectName = projects[Number(apt.projectId)]?.name || '';
    const loc = String(apt.location || '');
    
    // УЛУЧШЕННЫЙ ПАРСИНГ ЛОКАЦИИ
    let building = '';
    let floor = '';
    
    // Пробуем разные форматы локации
    if (loc.includes('Корпус') && loc.includes('эт')) {
      // Формат: "Villa Siena · Корпус 1, 8/12 эт."
      const bMatch = loc.match(/Корпус\s*(\S+)/i);
      const fMatch = loc.match(/(\d+\s*\/\s*\d+)\s*эт/i);
      building = bMatch ? bMatch[1].replace(/[,.;].*$/, '') : '';
      floor = fMatch ? fMatch[1] : '';
    } else if (loc.includes('/')) {
      // Формат с этажами: "8/12"
      const fMatch = loc.match(/(\d+\s*\/\s*\d+)/);
      floor = fMatch ? fMatch[1] : '';
      // Ищем корпус в другом месте
      const bMatch = loc.match(/(?:Корпус|Korpus)\s*(\S+)/i);
      building = bMatch ? bMatch[1] : '';
    } else {
      // Если не удалось распарсить, используем исходную локацию
      building = loc;
    }
    
    const mortgage = (apt.mortgage || '').replace(/^İpoteka ilə:\s*/i, '');
    
    // ФОРМИРУЕМ ОТОБРАЖЕНИЕ ЛОКАЦИИ
    let locationDisplay = '';
    if (building && floor) {
      locationDisplay = `${building}${building&&floor?' , ':''}${floor?`mərtəbə ${floor.replace('/',' -dan ')}`:''}`;
    } else if (building) {
      locationDisplay = building;
    } else if (floor) {
      locationDisplay = `mərtəbə ${floor.replace('/',' -dan ')}`;
    } else {
      locationDisplay = loc; // Используем исходную локацию если не удалось распарсить
    }
    
    return `
      <article class="card" ${rooms!=null?`data-rooms="${rooms}"`:''} ${priceNum!=null?`data-price="${priceNum}"`:''} ${areaNum!=null?`data-area="${areaNum}"`:''}>
        <img class="card-img" src="${apt.image}" alt="${apt.type}" />
        <div class="card-body">
          <div style="display:grid;gap:6px;">
            <div>🏠 <b>${apt.type} ${projectName ? `в YK «${projectName}»` : ''}</b></div>
            <div>📐 <b>Ümumi sahə:</b> ${apt.area}</div>
            ${apt.price ? `<div>💰 <b>Qiymət:</b> ${apt.price}</div>` : ''}
            ${mortgage ? `<div>🏦 <b>İpoteka:</b> ${mortgage}</div>` : ''}
            ${apt.deliveryDate ? `<div>🗓️ <b>Təhvilvermə taixi:</b> ${apt.deliveryDate} (Açarların verilməsi)</div>` : ''}
            ${locationDisplay ? `<div>📍 <b>Məkan:</b> ${locationDisplay}</div>` : ''}
          </div>
        </div>
      </article>`;
  }).join('');

  // Setup carousel navigation
  const prevBtn = document.getElementById('apartments-prev');
  const nextBtn = document.getElementById('apartments-next');
  
  if (!apartments.length) return;
  
  let currentIndex = 0;
  const slideWidth = 300; // УМЕНЬШИЛИ с 320 до 300 чтобы больше поместилось
  const containerWidth = track.parentElement.offsetWidth;
  const visibleSlides = Math.floor(containerWidth / slideWidth);
  const maxIndex = Math.max(0, apartments.length - 1); // Показываем все кроме одной

  function updateCarousel() {
    // ПРОКРУЧИВАЕМ НА ЦЕЛУЮ КАРТОЧКУ
    track.style.transform = `translateX(-${currentIndex * slideWidth}px)`;
    if (prevBtn) prevBtn.style.opacity = currentIndex === 0 ? '0.5' : '1';
    if (nextBtn) nextBtn.style.opacity = currentIndex >= maxIndex ? '0.5' : '1';
  }

  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      if (currentIndex > 0) {
        currentIndex--; // ПРОКРУЧИВАЕМ НА 1 КВАРТИРУ НАЗАД
        updateCarousel();
      }
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      if (currentIndex < maxIndex) {
        currentIndex++; // ПРОКРУЧИВАЕМ НА 1 КВАРТИРУ ВПЕРЕД
        updateCarousel();
      } else {
        // Если достигли конца, возвращаемся к началу
        currentIndex = 0;
        updateCarousel();
      }
    });
  }

  // Автопрокрутка карусели - ТОЖЕ ПРОКРУЧИВАЕМ ПО 1 КВАРТИРЕ
  let autoScroll = setInterval(() => {
    if (currentIndex < maxIndex) {
      currentIndex++; // ПРОКРУЧИВАЕМ НА 1 КВАРТИРУ
    } else {
      currentIndex = 0; // Возврат к началу
    }
    updateCarousel();
  }, 4000);

  // Останавливаем автопрокрутку при наведении
  const carouselContainer = track.parentElement;
  carouselContainer.addEventListener('mouseenter', () => {
    clearInterval(autoScroll);
  });
  
  carouselContainer.addEventListener('mouseleave', () => {
    autoScroll = setInterval(() => {
      if (currentIndex < maxIndex) {
        currentIndex++;
      } else {
        currentIndex = 0;
      }
      updateCarousel();
    }, 4000);
  });

  updateCarousel();
}
