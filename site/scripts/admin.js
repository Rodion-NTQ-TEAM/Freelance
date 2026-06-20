const ADMIN_USER = 'iluha';
const ADMIN_PASS = 'Level2026!';
const STORAGE_KEY = 'jk_projects_v1';
const NEWS_KEY = 'jk_news_v1';
const APARTMENTS_KEY = 'jk_apartments_v1';
const API_BASE = '/api.php';
// const API_BASE = localStorage.getItem('jk_api_base') || '';

document.addEventListener('DOMContentLoaded', () => {
  const loginSection = document.getElementById('login-section');
  const panelSection = document.getElementById('panel-section');
  const loginForm = document.getElementById('login-form');
  const msg = document.getElementById('login-msg');

  const savedAuth = sessionStorage.getItem('jk_auth');
  if (savedAuth === '1') {
    loginSection.hidden = true; panelSection.hidden = false; renderProjects();
  }

  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const u = document.getElementById('admin-user').value.trim();
    const p = document.getElementById('admin-pass').value.trim();
    if (u === ADMIN_USER && p === ADMIN_PASS) {
      sessionStorage.setItem('jk_auth', '1');
      loginSection.hidden = true; panelSection.hidden = false; renderProjects();
    } else {
      msg.textContent = 'Неверные данные';
    }
  });

  document.getElementById('add-project').addEventListener('click', () => openDialog());
  document.getElementById('export-json').addEventListener('click', exportJson);
  document.getElementById('import-json').addEventListener('change', importJson);
  document.getElementById('add-news').addEventListener('click', () => openNewsDialog());
  document.getElementById('seed-demo').addEventListener('click', seedFromCurrentSite);
  // Apartments admin
  document.getElementById('add-apartment')?.addEventListener('click', () => openApartmentDialog());
  renderApartmentsAdmin();
  document.getElementById('clear-projects').addEventListener('click', () => {
    if (confirm('Удалить все проекты? Это действие нельзя отменить.')) {
      saveProjects([]); renderProjects();
    }
  });
  renderNewsAdmin();
  if (API_BASE) {
    fetch(API_BASE + '/api/projects').then(r=>r.json()).then(data=>{ try{localStorage.setItem(STORAGE_KEY, JSON.stringify(data));}catch{} renderProjects(); });
    fetch(API_BASE + '/api/news').then(r=>r.json()).then(data=>{ try{localStorage.setItem(NEWS_KEY, JSON.stringify(data));}catch{} renderNewsAdmin(); });
  }
});

function getProjects() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); } catch { return []; }
}
function saveProjects(list) {
  if (API_BASE) {
    // Синхронизируем полным апдейтом: очистка и повторная заливка
    fetch(API_BASE + '/api/projects', { method: 'DELETE' }).then(() => {
      Promise.all(list.map(item => fetch(API_BASE + '/api/projects', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(item)})))
        .then(()=>{ localStorage.setItem(STORAGE_KEY, JSON.stringify(list)); });
    });
    return;
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}
function getNewsList() { try { return JSON.parse(localStorage.getItem(NEWS_KEY)||'[]'); } catch { return []; } }
function saveNewsList(list) {
  if (API_BASE) {
    fetch(API_BASE + '/api/news').then(()=>{
      // полная перезапись
      fetch(API_BASE + '/api/news', { method:'GET'}).then(()=>{
        // очистка
        // нет маршрута очистки всех новостей — перезапишем локально и поштучно
        Promise.all(list.map(item => fetch(API_BASE + '/api/news', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(item)})))
          .then(()=>{ localStorage.setItem(NEWS_KEY, JSON.stringify(list)); });
      });
    });
    return;
  }
  localStorage.setItem(NEWS_KEY, JSON.stringify(list));
}

function getApartmentsList() { try { return JSON.parse(localStorage.getItem(APARTMENTS_KEY)||'[]'); } catch { return []; } }
function saveApartmentsList(list) {
  if (API_BASE) {
    // optional future sync via backend
    localStorage.setItem(APARTMENTS_KEY, JSON.stringify(list));
    return;
  }
  localStorage.setItem(APARTMENTS_KEY, JSON.stringify(list));
}

function renderProjects() {
  const container = document.getElementById('projects-list');
  const list = getProjects();
  container.innerHTML = '';
  list.forEach((p, idx) => {
    const el = document.createElement('div');
    el.className = 'admin-card-item';
    el.innerHTML = `
      <div><b>${p.name || 'Без названия'}</b></div>
      <div><small>${p.location || ''}</small></div>
      <div><small>Цена: ${p.price || ''}</small></div>
      <div class="actions">
        <button class="btn" data-edit="${idx}">Редактировать</button>
        <button class="btn" data-delete="${idx}">Удалить</button>
      </div>
    `;
    el.querySelector('[data-edit]')?.addEventListener('click', () => openDialog(p, idx));
    el.querySelector('[data-delete]')?.addEventListener('click', () => {
      const list2 = getProjects();
      list2.splice(idx, 1); saveProjects(list2); renderProjects();
    });
    container.appendChild(el);
  });
}

function renderApartmentsAdmin() {
    const wrap = document.getElementById('apartments-list');
    if (!wrap) return;
    wrap.innerHTML = '';
    const list = getApartmentsList();
    const projects = getProjects();
    
    list.forEach((a, idx) => {
        const projectName = projects[a.projectId]?.name || `ЖК ${a.projectId}`;
        const el = document.createElement('div');
        el.className = 'admin-card-item';
        el.innerHTML = `
            <div><b>${a.type || 'Квартира'}</b> · ${a.area || ''} · ${a.price || ''}</div>
            <div><small>Проект: ${projectName}</small></div>
            <div class="actions">
                <button class="btn" data-edit-apt="${idx}">Редактировать</button>
                <button class="btn" data-del-apt="${idx}">Удалить</button>
            </div>`;
        el.querySelector('[data-edit-apt]')?.addEventListener('click', () => openApartmentDialog(a, idx));
        el.querySelector('[data-del-apt]')?.addEventListener('click', () => { 
            const l = getApartmentsList(); 
            l.splice(idx, 1); 
            saveApartmentsList(l); 
            renderApartmentsAdmin(); 
        });
        wrap.appendChild(el);
    });
}
function openApartmentDialog(item = null, idx = null) {
    const dlg = document.getElementById('apartment-dialog');
    const form = document.getElementById('apartment-form');
    if (!dlg || !form) return;
    
    // ЗАПОЛНЯЕМ ВЫБОР ЖК ПЕРЕД ОТКРЫТИЕМ ДИАЛОГА
    populateProjectSelect();
    
    form.reset();
    document.getElementById('apt-id').value = idx != null ? String(idx) : '';
    
    // Заполняем поля данными
    if (item) {
        document.getElementById('apt-projectId').value = (item?.projectId != null ? String(item.projectId) : '');
        document.getElementById('apt-type').value = item?.type || '';
        document.getElementById('apt-rooms').value = (item?.rooms != null ? String(item.rooms) : '');
        document.getElementById('apt-area').value = item?.area || '';
        document.getElementById('apt-areaNumber').value = item?.areaNumber != null ? String(item.areaNumber) : '';
        document.getElementById('apt-price').value = item?.price || '';
        document.getElementById('apt-priceNumber').value = item?.priceNumber != null ? String(item.priceNumber) : '';
        document.getElementById('apt-mortgage').value = item?.mortgage || '';
        document.getElementById('apt-location').value = item?.location || '';
        document.getElementById('apt-image').value = item?.image || '';
        document.getElementById('apt-deliveryDate').value = item?.deliveryDate || '';
    }
    
    dlg.showModal();
    form.onsubmit = (e) => {
        e.preventDefault();
        const row = {
            projectId: Number(document.getElementById('apt-projectId').value || '0'),
            type: document.getElementById('apt-type').value.trim(),
            rooms: Number(document.getElementById('apt-rooms').value || '0'),
            area: document.getElementById('apt-area').value.trim(),
            areaNumber: Number(document.getElementById('apt-areaNumber').value || '0'),
            price: document.getElementById('apt-price').value.trim(),
            priceNumber: Number(document.getElementById('apt-priceNumber').value || '0'),
            mortgage: document.getElementById('apt-mortgage').value.trim(),
            location: document.getElementById('apt-location').value.trim(),
            image: document.getElementById('apt-image').value.trim(),
            deliveryDate: document.getElementById('apt-deliveryDate').value.trim()
        };
        const l = getApartmentsList();
        const idStr = document.getElementById('apt-id').value;
        if (idStr) l[Number(idStr)] = row; else l.push(row);
        saveApartmentsList(l); 
        dlg.close(); 
        renderApartmentsAdmin();
    };
}

function openDialog(project = null, index = null) {
  const dlg = document.getElementById('project-dialog');
  const form = document.getElementById('project-form');
  form.reset();
  document.getElementById('dlg-title').textContent = project ? 'Редактировать ЖК' : 'Новый ЖК';
  document.getElementById('project-id').value = index != null ? String(index) : '';
  document.getElementById('project-name').value = project?.name || '';
  document.getElementById('project-specipic').value = project?.specipic || '';
  document.getElementById('project-price').value = project?.price || '';
  document.getElementById('project-location').value = project?.location || '';
  document.getElementById('project-deadline').value = project?.deadline || '';
  document.getElementById('project-ext').value = (project?.ext || []).join('; ');
  document.getElementById('project-int').value = (project?.int || []).join('; ');
  document.getElementById('project-plan').value = (project?.plan || []).join('; ');

  dlg.showModal();
  form.onsubmit = (e) => {
    e.preventDefault();
    const proj = {
      name: document.getElementById('project-name').value.trim(),
      // specipic: document.getElementById('project-specipic').value.trim(),
      specipic: splitPaths2(document.getElementById('project-specipic').value),
      price: document.getElementById('project-price').value.trim(),
      location: document.getElementById('project-location').value.trim(),
      deadline: document.getElementById('project-deadline').value.trim(),
      ext: splitPaths(document.getElementById('project-ext').value),
      int: splitPaths(document.getElementById('project-int').value),
      plan: splitPaths(document.getElementById('project-plan').value)
    };
    const list = getProjects();
    const idStr = document.getElementById('project-id').value;
    if (idStr) list[Number(idStr)] = proj; else list.push(proj);
    saveProjects(list); dlg.close(); renderProjects();
  };
}

function splitPaths2(v) {
  return v.split(',').map(s => s.trim()).filter(Boolean);
}
function splitPaths(v) {
  return v.split(';').map(s => s.trim()).filter(Boolean);
}

function exportJson() {
  const data = JSON.stringify(getProjects(), null, 2);
  const blob = new Blob([data], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = 'projects.json'; a.click();
  URL.revokeObjectURL(url);
}

function importJson(e) {
  const file = e.target.files?.[0]; if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    try { const data = JSON.parse(String(reader.result || '[]')); saveProjects(data); renderProjects(); } catch { /* noop */ }
  };
  reader.readAsText(file);
}

function seedFromCurrentSite() {
  const demo = [
    {
      name: 'Arabian Ranches',
      price: 'от 12 026 359 ₽',
      location: 'Ⓜ Нижегородская · 10 мин',
      deadline: 'IV кв. 2026 г.',
      ext: ['assets/Arabian Ranches/эктерьер/Arabian Ranches  — yuxarıdan ümumi görünüş.jpg'],
      int: ['assets/Arabian Ranches/интерьер студии/A1_View01.jpg'],
      plan: ['assets/Arabian Ranches/планировка студии/36.2 kv, studio.jpg']
    },
    {
      name: 'Marina Village', 
      price: 'от 17 001 471 ₽',
      location: 'Ⓜ Прибрежная · 8 мин',
      deadline: 'III кв. 2026 г.',
      ext: ['assets/Marina Vilage/экстерьер/Marina Village-ə sahildən görünüş.jpg'],
      int: ['assets/Marina Vilage/интерьер/2.jpg'],
      plan: ['assets/Marina Vilage/планировка/studiya.png']
    },
    {
      name: 'Villa Siena',
      price: 'от 18 765 609 ₽', 
      location: 'Ⓜ Центр · 12 мин',
      deadline: 'IV кв. 2026 г.',
      ext: ['assets/Vila siena/эктерьер/DSCF3233.jpg'],
      int: ['assets/Vila siena/интерьер/DSCF3172.jpg'],
      plan: ['assets/Marina Vilage/планировка/2-yataq otağı.png']
    }
  ];
  
  const current = getProjects();
  
  // ФИЛЬТРУЕМ - добавляем только те ЖК, которых еще нет
  const newProjects = demo.filter(demoProject => 
    !current.some(existingProject => existingProject.name === demoProject.name)
  );
  
  if (newProjects.length > 0) {
    saveProjects(current.concat(newProjects));
    alert(`Добавлено ${newProjects.length} новых ЖК`);
  } else {
    alert('Все демо-ЖК уже есть в списке');
  }
  
  renderProjects();
}
function renderNewsAdmin() {
  const wrap = document.getElementById('news-list-admin');
  if (!wrap) return;
  const list = getNewsList();
  wrap.innerHTML = '';
  list.forEach((n, idx) => {
    const el = document.createElement('div');
    el.className = 'admin-card-item';
    el.innerHTML = `
      <div><b>${n.title || 'Без заголовка'}</b></div>
      <div><small>${n.date || ''}</small></div>
      <div class="actions">
        <button class="btn" data-edit-news="${idx}">Редактировать</button>
        <button class="btn" data-del-news="${idx}">Удалить</button>
      </div>`;
    el.querySelector('[data-edit-news]')?.addEventListener('click', () => openNewsDialog(n, idx));
    el.querySelector('[data-del-news]')?.addEventListener('click', () => { const l=getNewsList(); l.splice(idx,1); saveNewsList(l); renderNewsAdmin(); });
    wrap.appendChild(el);
  });
}

function openNewsDialog(item=null, idx=null) {
  const dlg = document.getElementById('news-dialog');
  const form = document.getElementById('news-form');
  form.reset();
  document.getElementById('news-id').value = idx!=null ? String(idx) : '';
  document.getElementById('news-date').value = item?.date || '';
  document.getElementById('news-title').value = item?.title || '';
  document.getElementById('news-text').value = item?.text || '';
  dlg.showModal();
  form.onsubmit = (e) => {
    e.preventDefault();
    const l = getNewsList();
    const row = {
      date: document.getElementById('news-date').value.trim(),
      title: document.getElementById('news-title').value.trim(),
      text: document.getElementById('news-text').value.trim()
    };
    const idStr = document.getElementById('news-id').value;
    if (idStr) l[Number(idStr)] = row; else l.unshift(row);
    saveNewsList(l); dlg.close(); renderNewsAdmin();
  };
}

function populateProjectSelect() {
    const select = document.getElementById('apt-projectId');
    if (!select) return;
    
    const projects = getProjects();
    select.innerHTML = '<option value="">Выберите ЖК</option>';
    
    projects.forEach((project, index) => {
        const option = document.createElement('option');
        option.value = index;
        option.textContent = project.name || `ЖК ${index}`;
        select.appendChild(option);
    });
}
