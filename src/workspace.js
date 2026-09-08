const MAX_SIZE = 50 * 1024 * 1024;
const EXTENSIONS = ['csv', 'xlsx', 'docx', 'md'];
const DOCUMENT_ACCEPT = '.csv,.xlsx,.docx,.md';
const JURISDICTIONS = [
  ['rgpd', 'Europa / RGPD-GDPR'], ['chile', 'Chile'], ['brasil', 'Brasil'], ['mexico', 'México'],
  ['colombia', 'Colombia'], ['argentina', 'Argentina'], ['uk', 'UK GDPR'], ['ccpa', 'CCPA / CPRA'],
];

export function mountWorkspace(root) {
  const state = { view: 'anonymize', files: [], jurisdictions: new Set(), restoreDocument: null, restoreMap: null, encrypt: false, jobs: [] };
  root.innerHTML = markup();
  root.querySelectorAll('#file-input, #restore-document-input').forEach((input) => input.setAttribute('accept', DOCUMENT_ACCEPT));
  root.querySelector('[data-drop="documents"] span').textContent = 'CSV, XLSX, DOCX o MD · máximo 50 MB';
  const publicShell = document.querySelectorAll('.site-header, #inicio, .site-footer');

  root.addEventListener('click', (event) => {
    const viewButton = event.target.closest('[data-view]');
    if (viewButton) {
      event.preventDefault();
      state.view = viewButton.dataset.view;
      render();
      return;
    }
    const remove = event.target.closest('[data-remove]');
    if (remove) {
      state.files = state.files.filter((file) => file.id !== remove.dataset.remove);
      render();
    }
    const removeRestore = event.target.closest('[data-remove-restore]');
    if (removeRestore) {
      state[removeRestore.dataset.removeRestore] = null;
      render();
    }
  });

  root.addEventListener('change', (event) => {
    if (event.target.id === 'file-input') addFiles(event.target.files);
    if (event.target.id === 'restore-document-input') addRestore('restoreDocument', event.target.files[0]);
    if (event.target.id === 'restore-map-input') addRestore('restoreMap', event.target.files[0]);
    if (event.target.id === 'encrypt-map') { state.encrypt = event.target.checked; render(); }
    if (event.target.id === 'select-all') {
      state.jurisdictions = event.target.checked ? new Set(JURISDICTIONS.map(([key]) => key)) : new Set();
      render();
    }
    if (event.target.dataset.jurisdiction) {
      event.target.checked ? state.jurisdictions.add(event.target.dataset.jurisdiction) : state.jurisdictions.delete(event.target.dataset.jurisdiction);
      render();
    }
  });

  root.addEventListener('submit', (event) => {
    if (event.target.id === 'anonymize-form') startAnonymize(event);
    if (event.target.id === 'restore-form') startRestore(event);
  });

  root.addEventListener('dragover', (event) => { const zone = event.target.closest('[data-drop]'); if (zone) { event.preventDefault(); zone.classList.add('is-dragging'); } });
  root.addEventListener('dragleave', (event) => event.target.closest('[data-drop]')?.classList.remove('is-dragging'));
  root.addEventListener('drop', (event) => { const zone = event.target.closest('[data-drop]'); if (!zone) return; event.preventDefault(); zone.classList.remove('is-dragging'); if (zone.dataset.drop === 'documents') addFiles(event.dataTransfer.files); else addRestore(zone.dataset.drop, event.dataTransfer.files[0]); });

  function syncRoute() {
    const active = window.location.hash === '#area-trabajo';
    root.hidden = !active;
    document.body.classList.toggle('workspace-mode', active);
    publicShell.forEach((element) => { element.hidden = active; });
    if (active) window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }

  function addFiles(fileList) {
    const errors = [];
    Array.from(fileList).forEach((file) => {
      const extension = file.name.toLowerCase().split('.').pop();
      const id = `${file.name}-${file.size}-${file.lastModified}`;
      if (!EXTENSIONS.includes(extension)) errors.push(`${file.name}: formato no permitido.`);
      else if (!file.size) errors.push(`${file.name}: el archivo está vacío.`);
      else if (file.size > MAX_SIZE) errors.push(`${file.name}: supera el límite de 50 MB.`);
      else if (state.files.some((item) => item.id === id)) errors.push(`${file.name}: ya está seleccionado.`);
      else state.files.push({ id, name: file.name, extension, size: file.size });
    });
    render(errors);
  }

  function addRestore(type, file) {
    if (!file) return;
    const validMap = type === 'restoreMap' && file.name.toLowerCase().endsWith('.key.json');
    const validDocument = type === 'restoreDocument' && EXTENSIONS.includes(file.name.toLowerCase().split('.').pop());
    if ((!validMap && !validDocument) || !file.size || file.size > MAX_SIZE) { render(['El archivo seleccionado no es válido.']); return; }
    const id = `${file.name}-${file.size}-${file.lastModified}`;
    if (state.restoreDocument?.id === id || state.restoreMap?.id === id) { render(['El documento y el mapa deben ser archivos distintos.']); return; }
    state[type] = { id, name: file.name, size: file.size, extension: file.name.split('.').pop() };
    render();
  }

  function startAnonymize(event) {
    event.preventDefault();
    const errors = [];
    if (!state.files.length) errors.push('Añade al menos un documento.');
    if (!state.jurisdictions.size) errors.push('Selecciona al menos una jurisdicción.');
    if (state.encrypt) {
      const pass = root.querySelector('#passphrase').value;
      const confirmation = root.querySelector('#passphrase-confirm').value;
      if (!pass) errors.push('Introduce una passphrase.');
      if (pass !== confirmation) errors.push('Las passphrases no coinciden.');
    }
    if (errors.length) { render(errors); return; }
    demoJob('Anonimización', state.files);
  }

  function startRestore(event) {
    event.preventDefault();
    if (!state.restoreDocument || !state.restoreMap) { render(['Selecciona el documento anonimizado y el mapa .key.json.']); return; }
    root.querySelector('#restore-message').textContent = 'Restauración preparada en modo demostración. La API todavía no está conectada.';
    demoJob('Restauración', [state.restoreDocument, state.restoreMap]);
  }

  function demoJob(type, files) {
    const job = { type, progress: 0, files, message: 'Demostración visual. No se han procesado archivos.' };
    const timer = window.setInterval(() => {
      job.progress = Math.min(job.progress + 25, 100);
      render();
      if (job.progress === 100) { window.clearInterval(timer); state.jobs.unshift({ id: `demo-${Date.now().toString(36).slice(-6)}`, type, files: files.length, status: 'Completado (demo)' }); }
    }, 450);
    state.job = job;
    render();
  }

  function render(errors = []) {
    root.querySelectorAll('[data-panel]').forEach((panel) => { panel.hidden = panel.dataset.panel !== state.view; });
    root.querySelectorAll('[data-view]').forEach((button) => { button.classList.toggle('is-active', button.dataset.view === state.view); });
    root.querySelector('#alert').hidden = !errors.length;
    root.querySelector('#alert').textContent = errors.join(' ');
    root.querySelector('#file-list').innerHTML = state.files.map((file) => `<div class="workspace-file"><strong>${escapeHtml(file.name)}</strong><small>${file.extension.toUpperCase()} · ${bytes(file.size)}</small><button type="button" data-remove="${escapeHtml(file.id)}" aria-label="Eliminar ${escapeHtml(file.name)}">×</button></div>`).join('');
    root.querySelector('#jurisdictions').innerHTML = JURISDICTIONS.map(([key, label]) => `<label><input type="checkbox" data-jurisdiction="${key}" ${state.jurisdictions.has(key) ? 'checked' : ''} /> ${label}</label>`).join('');
    root.querySelector('#select-all').checked = state.jurisdictions.size === JURISDICTIONS.length;
    root.querySelector('#jurisdiction-total').textContent = `${state.jurisdictions.size} seleccionadas`;
    root.querySelector('#encrypt-map').checked = state.encrypt;
    root.querySelector('#passphrase-fields').hidden = !state.encrypt;
    renderRestoreFile('#restore-document', state.restoreDocument, 'restoreDocument');
    renderRestoreFile('#restore-map', state.restoreMap, 'restoreMap');
    root.querySelector('#summary').textContent = `${state.files.length} archivos · ${state.jurisdictions.size} jurisdicciones · Cifrado: ${state.encrypt ? 'sí' : 'no'}`;
    root.querySelector('#progress').innerHTML = state.job ? `<div class="workspace-progress"><strong>${state.job.type}</strong><span>${state.job.progress}%</span><progress max="100" value="${state.job.progress}"></progress><small>${state.job.message}</small></div>` : '';
    root.querySelector('#jobs').innerHTML = state.jobs.length ? state.jobs.map((job) => `<li>${job.id} · ${job.type} · ${job.files} archivos · ${job.status}</li>`).join('') : '<li>Aún no hay trabajos en esta sesión.</li>';
    if (state.encrypt && state.job) { root.querySelector('#passphrase').value = ''; root.querySelector('#passphrase-confirm').value = ''; }
  }

  function renderRestoreFile(selector, file, type) {
    root.querySelector(selector).innerHTML = file ? `<span>${escapeHtml(file.name)} · ${bytes(file.size)}</span><button type="button" data-remove-restore="${type}" aria-label="Eliminar ${escapeHtml(file.name)}">×</button>` : '<span>Pendiente</span>';
  }

  syncRoute();
  window.addEventListener('hashchange', syncRoute);
  render();
}

function markup() {
  return `<div class="workspace-shell"><header class="workspace-header"><div class="workspace-brand-row"><a class="brand workspace-brand" href="#inicio"><span class="brand-mark" aria-hidden="true"><span></span><span></span><span></span></span><span>Anonimizador</span></a><a class="back-home" href="#inicio">← Volver al inicio</a></div><div class="workspace-title-row"><div><p class="workspace-kicker">Espacio privado</p><h1 class="workspace-title">Área de trabajo</h1></div><span class="demo-badge">Modo demostración</span></div><nav class="workspace-nav" aria-label="Navegación del área de trabajo"><button type="button" data-view="anonymize" class="workspace-tab is-active">Anonimizar documentos</button><button type="button" data-view="restore" class="workspace-tab">Restaurar documentos</button><button type="button" data-view="jobs" class="workspace-tab">Trabajos recientes</button><button type="button" data-view="security" class="workspace-tab">Seguridad</button></nav></header><main class="workspace-content"><div id="alert" class="workspace-alert" role="alert" aria-live="assertive" hidden></div><section data-panel="anonymize" class="workspace-panel"><form id="anonymize-form" class="workspace-flow"><fieldset class="workspace-block"><legend>01 Añadir documentos</legend><label class="dropzone" data-drop="documents" for="file-input"><strong>Seleccionar archivos</strong><span>CSV, XLSX, DOCX, MD o PDF · máximo 50 MB</span><input id="file-input" type="file" accept=".csv,.xlsx,.docx,.md,.pdf" multiple /></label><div id="file-list" class="workspace-file-list"></div></fieldset><fieldset class="workspace-block"><legend>02 Elegir jurisdicciones</legend><label><input id="select-all" type="checkbox" /> Seleccionar todas <small id="jurisdiction-total">0 seleccionadas</small></label><div id="jurisdictions" class="jurisdiction-grid"></div></fieldset><fieldset class="workspace-block"><legend>03 Configurar protección</legend><label><input id="encrypt-map" type="checkbox" /> Cifrar el mapa de anonimización</label><div id="passphrase-fields" hidden><label for="passphrase">Passphrase</label><input id="passphrase" type="password" autocomplete="new-password" /><label for="passphrase-confirm">Confirmar passphrase</label><input id="passphrase-confirm" type="password" autocomplete="new-password" /><p class="security-note">El mapa contiene los valores originales y debe protegerse adecuadamente.</p></div></fieldset><button class="workspace-button button-primary" type="submit">Iniciar anonimización</button></form><aside class="workspace-aside"><div class="summary-panel"><strong>Resumen</strong><p id="summary">0 archivos · 0 jurisdicciones · Cifrado: no</p><small>Modo demostración. No se procesan archivos.</small></div><div id="progress"></div></aside></section><section data-panel="restore" class="workspace-panel" hidden><form id="restore-form" class="workspace-flow"><fieldset class="workspace-block"><legend>01 Archivo anonimizado</legend><label class="dropzone" data-drop="restoreDocument" for="restore-document-input"><strong>Seleccionar archivo anonimizado</strong><input id="restore-document-input" type="file" accept=".csv,.xlsx,.docx,.md,.pdf" /></label><div id="restore-document" class="workspace-file"></div></fieldset><fieldset class="workspace-block"><legend>02 Mapa .key.json</legend><label class="dropzone" data-drop="restoreMap" for="restore-map-input"><strong>Seleccionar mapa seguro</strong><input id="restore-map-input" type="file" accept=".key.json,application/json" /></label><div id="restore-map" class="workspace-file"></div></fieldset><fieldset class="workspace-block"><legend>03 Passphrase opcional</legend><label for="restore-passphrase">Passphrase</label><input id="restore-passphrase" type="password" autocomplete="new-password" /></fieldset><button class="workspace-button button-primary" type="submit">Iniciar restauración</button><p id="restore-message" class="workspace-notice" aria-live="polite"></p></form></section><section data-panel="jobs" class="workspace-panel" hidden><h2>Trabajos recientes</h2><p>Solo se conservan metadatos durante esta sesión.</p><ul id="jobs" class="workspace-jobs"></ul></section><section data-panel="security" class="workspace-panel" hidden><h2>Seguridad</h2><div class="workspace-security-grid"><article><h3>Sin herramientas de IA</h3><p>No se envían documentos a servicios de IA durante la demostración.</p></article><article><h3>Passphrases efímeras</h3><p>No se guardan passphrases en el navegador.</p></article><article><h3>Backend pendiente</h3><p>El procesamiento y la expiración dependerán de la API futura.</p></article></div></section></main></div>`;
}

function bytes(value) { return `${(value / 1024 / 1024).toFixed(1)} MB`; }
function escapeHtml(value) { return String(value).replace(/[&<>'"]/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[character])); }