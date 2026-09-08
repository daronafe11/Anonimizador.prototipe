import { getState, jurisdictionOptions, selectedJurisdictions, selectedJobCount, subscribe, updateState } from './state.js';
import { formatBytes, maxFileSizeLabel, validateDocumentFiles, validateRestoreMap } from './ui-upload.js';
import { progressMarkup, startVisualProgress } from './ui-progress.js';
import { futureResultsMarkup } from './ui-results.js';

const store = { getState, updateState };

export function mountWorkspace(root) {
  root.innerHTML = workspaceMarkup();
  bindWorkspaceEvents(root);
  subscribe(() => renderWorkspace(root));
  renderWorkspace(root);
  let wasWorkspace = false;
  syncHashRoute();
  window.addEventListener('hashchange', syncHashRoute);

  function syncHashRoute() {
    const isWorkspace = window.location.hash === '#area-trabajo';
    const changedView = isWorkspace !== wasWorkspace;
    root.hidden = !isWorkspace;
    document.body.classList.toggle('workspace-mode', isWorkspace);
    document.querySelectorAll('.site-header, #inicio, .site-footer').forEach((element) => {
      element.hidden = isWorkspace;
    });
    if (isWorkspace) {
      document.title = 'Área de trabajo | Anonimizador';
      root.querySelector('[data-workspace-view="anonymize"]').focus({ preventScroll: true });
    } else {
      document.title = 'Anonimizador | Protege antes de compartir';
    }
    if (changedView) window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    wasWorkspace = isWorkspace;
  }
}

function workspaceMarkup() {
  return `<div class="workspace-shell">
    <header class="workspace-header">
      <div class="workspace-brand-row">
        <a class="brand workspace-brand" href="#inicio" aria-label="Volver al inicio de Anonimizador"><span class="brand-mark" aria-hidden="true"><span></span><span></span><span></span></span><span>Anonimizador</span></a>
        <a class="back-home" href="#inicio">← Volver al inicio</a>
      </div>
      <div class="workspace-title-row"><div><p class="workspace-kicker">Espacio privado</p><h2 class="workspace-title">Área de trabajo</h2></div><span class="demo-badge"><span class="demo-dot" aria-hidden="true"></span> Modo demostración</span></div>
      <nav class="workspace-nav" aria-label="Secciones del área de trabajo">
        <button type="button" class="workspace-tab is-active" data-workspace-view="anonymize">Anonimizar documentos</button>
        <button type="button" class="workspace-tab" data-workspace-view="restore">Restaurar documentos</button>
        <button type="button" class="workspace-tab" data-workspace-view="jobs">Trabajos recientes</button>
        <button type="button" class="workspace-tab" data-workspace-view="security">Seguridad</button>
      </nav>
    </header>

    <div class="workspace-content">
      <div class="workspace-alert" id="workspace-alert" role="alert" aria-live="assertive" hidden></div>
      <section class="workspace-view is-visible" data-workspace-panel="anonymize" aria-labelledby="anonymize-title">
        <div class="workspace-intro"><p class="workspace-kicker">Preparar anonimización</p><h2 id="anonymize-title">Protege un documento<br /><em>antes de compartirlo.</em></h2><p>Selecciona archivos, define el contexto legal y revisa la protección. En esta fase todo permanece en modo demostración.</p></div>
        <div class="workspace-columns"><form class="workspace-flow" id="anonymize-form" novalidate>
          <fieldset class="workspace-block"><legend><span>01</span> Añadir documentos</legend><p class="block-help">Admite CSV, XLSX, DOCX, MD y PDF. Hasta ${maxFileSizeLabel()} por archivo.</p><div class="dropzone" id="document-dropzone" role="button" tabindex="0" aria-controls="document-input"><span class="dropzone-icon" aria-hidden="true">↑</span><strong>Suelta tus documentos aquí</strong><span>o selecciona archivos desde tu equipo</span><label class="workspace-button button-secondary" for="document-input">Seleccionar archivos</label><input id="document-input" class="visually-hidden" type="file" accept=".csv,.xlsx,.docx,.md,.pdf" multiple /></div><div class="file-list" id="document-file-list"></div></fieldset>
          <fieldset class="workspace-block"><legend><span>02</span> Elegir jurisdicciones</legend><p class="block-help">Las reglas se aplicarán según el marco legal seleccionado. No hay ninguna opción elegida por defecto.</p><label class="check-row select-all-row"><input type="checkbox" id="select-all-jurisdictions" /><span class="custom-check" aria-hidden="true"></span><strong>Seleccionar todas</strong><small id="jurisdiction-count">0 de 8 seleccionadas</small></label><div class="jurisdiction-grid" id="jurisdiction-list"></div></fieldset>
          <fieldset class="workspace-block"><legend><span>03</span> Configurar protección</legend><label class="check-row"><input type="checkbox" id="encrypt-map" /><span class="custom-check" aria-hidden="true"></span><span><strong>Cifrar el mapa de anonimización</strong><small>Recomendado cuando el documento contiene información sensible.</small></span></label><div class="passphrase-panel" id="passphrase-panel" hidden><label for="map-passphrase">Passphrase</label><input id="map-passphrase" type="password" autocomplete="new-password" /><label for="map-passphrase-confirm">Confirmar passphrase</label><input id="map-passphrase-confirm" type="password" autocomplete="new-password" /><p class="security-note"><span aria-hidden="true">!</span> El mapa contiene los valores originales y debe protegerse adecuadamente.</p></div></fieldset>
          <fieldset class="workspace-block"><legend><span>04</span> Revisar e iniciar</legend><p class="block-help">Comprueba el resumen antes de preparar la operación. No se leerán ni procesarán los contenidos.</p><button class="workspace-button button-primary workspace-submit" type="submit">Iniciar anonimización <span aria-hidden="true">→</span></button></fieldset>
        </form><aside class="workspace-aside" aria-label="Resumen de anonimización"><div class="summary-panel"><p class="workspace-kicker">Resumen</p><div class="summary-stat"><span>Archivos</span><strong id="summary-files">0</strong></div><div class="summary-stat"><span>Jurisdicciones</span><strong id="summary-jurisdictions">0</strong></div><div class="summary-stat"><span>Cifrado</span><strong id="summary-encryption">No</strong></div><div class="summary-files" id="summary-file-names"><span>Aún no hay archivos seleccionados.</span></div><p class="demo-disclaimer">Modo demostración. No se generarán archivos ni mapas reales.</p></div><div id="anonymize-progress"></div>${futureResultsMarkup('anonymize')}</aside></div>
      </section>

      <section class="workspace-view" data-workspace-panel="restore" aria-labelledby="restore-title" hidden><div class="workspace-intro"><p class="workspace-kicker">Preparar restauración</p><h2 id="restore-title">Vuelve al documento<br /><em>cuando lo necesites.</em></h2><p>Selecciona el archivo anonimizado y su mapa seguro. El contenido del mapa nunca se mostrará en el navegador.</p></div><div class="workspace-columns"><form class="workspace-flow" id="restore-form" novalidate><fieldset class="workspace-block"><legend><span>01</span> Archivo anonimizado</legend><div class="compact-dropzone" id="restore-document-dropzone" role="button" tabindex="0" aria-controls="restore-document-input"><span class="dropzone-icon" aria-hidden="true">▤</span><strong>Seleccionar archivo anonimizado</strong><span>CSV, XLSX, DOCX, MD o PDF</span><input id="restore-document-input" class="visually-hidden" type="file" accept=".csv,.xlsx,.docx,.md,.pdf" /></div><div id="restore-document-summary"></div></fieldset><fieldset class="workspace-block"><legend><span>02</span> Mapa seguro</legend><div class="compact-dropzone" id="restore-map-dropzone" role="button" tabindex="0" aria-controls="restore-map-input"><span class="dropzone-icon" aria-hidden="true">⌁</span><strong>Seleccionar mapa .key.json</strong><span>No se mostrará su contenido</span><input id="restore-map-input" class="visually-hidden" type="file" accept=".key.json,application/json" /></div><div id="restore-map-summary"></div></fieldset><fieldset class="workspace-block"><legend><span>03</span> Passphrase opcional</legend><label for="restore-passphrase">Passphrase del mapa</label><input id="restore-passphrase" class="text-input" type="password" autocomplete="new-password" /><p class="field-help">Se utilizará solo durante la demostración y no se guardará.</p><button class="workspace-button button-primary workspace-submit" type="submit">Iniciar restauración <span aria-hidden="true">→</span></button></fieldset></form><aside class="workspace-aside" aria-label="Resumen de restauración"><div class="summary-panel"><p class="workspace-kicker">Resumen</p><div class="summary-stat"><span>Documento</span><strong id="restore-summary-document">Pendiente</strong></div><div class="summary-stat"><span>Mapa</span><strong id="restore-summary-map">Pendiente</strong></div><p class="demo-disclaimer">Restauración preparada en modo demostración. No se mostrarán datos del mapa.</p></div><div id="restore-notice" class="workspace-notice" hidden></div><div id="restore-progress"></div>${futureResultsMarkup('restore')}</aside></div></section>

      <section class="workspace-view" data-workspace-panel="jobs" aria-labelledby="jobs-title" hidden><div class="workspace-intro"><p class="workspace-kicker">Memoria de esta sesión</p><h2 id="jobs-title">Trabajos<br /><em>recientes.</em></h2><p>Solo mostramos metadatos creados durante esta sesión. Al recargar la página, esta lista desaparece.</p></div><div class="jobs-panel" id="jobs-list"></div></section>

      <section class="workspace-view" data-workspace-panel="security" aria-labelledby="workspace-security-title" hidden><div class="workspace-intro"><p class="workspace-kicker">Decisiones claras</p><h2 id="workspace-security-title">La seguridad<br /><em>también es contexto.</em></h2><p>Estas son las garantías previstas para el producto, diferenciando lo que ya ocurre en el navegador de lo que dependerá de la API futura.</p></div><div class="workspace-security-grid"><article><span class="security-icon" aria-hidden="true">◇</span><h3>Sin herramientas de IA</h3><p>Los documentos no se envían a servicios de IA durante la anonimización.</p></article><article><span class="security-icon" aria-hidden="true">⌁</span><h3>Mapas protegidos</h3><p>Los mapas contienen valores originales y deben protegerse adecuadamente.</p></article><article><span class="security-icon" aria-hidden="true">⊙</span><h3>Passphrases efímeras</h3><p>Las passphrases no se guardan en el navegador, ni en almacenamiento local o de sesión.</p></article><article><span class="security-icon" aria-hidden="true">◌</span><h3>Backend pendiente</h3><p>El procesamiento y la política de expiración se definirán cuando exista la API.</p></article></div></section>
    </div>
  </div>`;
}

function bindWorkspaceEvents(root) {
  root.querySelectorAll('[data-workspace-view]').forEach((tab) => tab.addEventListener('click', () => {
    setWorkspaceView(root, tab.dataset.workspaceView);
  }));

  const documentInput = root.querySelector('#document-input');
  const documentDropzone = root.querySelector('#document-dropzone');
  documentInput.addEventListener('change', (event) => addDocuments(root, event.target.files));
  bindDropzone(documentDropzone, documentInput, (files) => addDocuments(root, files));
  root.addEventListener('click', handleWorkspaceClick);
  root.querySelector('#select-all-jurisdictions').addEventListener('change', (event) => {
    const jurisdictions = Object.fromEntries(jurisdictionOptions.map(({ key }) => [key, event.target.checked]));
    updateState({ jurisdictions });
  });
  root.querySelector('#jurisdiction-list').addEventListener('change', (event) => {
    if (!event.target.matches('input[data-jurisdiction]')) return;
    updateState({ jurisdictions: { ...getState().jurisdictions, [event.target.dataset.jurisdiction]: event.target.checked } });
  });
  root.querySelector('#encrypt-map').addEventListener('change', (event) => updateState({ encryptMap: event.target.checked }));
  root.querySelector('#anonymize-form').addEventListener('submit', (event) => submitAnonymize(root, event));

  const restoreDocumentInput = root.querySelector('#restore-document-input');
  const restoreMapInput = root.querySelector('#restore-map-input');
  restoreDocumentInput.addEventListener('change', (event) => setRestoreFile(root, 'document', event.target.files[0]));
  restoreMapInput.addEventListener('change', (event) => setRestoreFile(root, 'map', event.target.files[0]));
  bindDropzone(root.querySelector('#restore-document-dropzone'), restoreDocumentInput, (files) => setRestoreFile(root, 'document', files[0]));
  bindDropzone(root.querySelector('#restore-map-dropzone'), restoreMapInput, (files) => setRestoreFile(root, 'map', files[0]));
  root.querySelector('#restore-form').addEventListener('submit', (event) => submitRestore(root, event));
}

function bindDropzone(dropzone, input, onFiles) {
  dropzone.addEventListener('click', (event) => {
    if (event.target !== input) input.click();
  });
  dropzone.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); input.click(); }
  });
  ['dragenter', 'dragover'].forEach((eventName) => dropzone.addEventListener(eventName, (event) => {
    event.preventDefault(); dropzone.classList.add('is-dragging');
  }));
  ['dragleave', 'drop'].forEach((eventName) => dropzone.addEventListener(eventName, (event) => {
    event.preventDefault(); dropzone.classList.remove('is-dragging');
  }));
  dropzone.addEventListener('drop', (event) => onFiles(event.dataTransfer.files));
}

function handleWorkspaceClick(event) {
  const viewTrigger = event.target.closest('[data-workspace-view]');
  if (viewTrigger) {
    setWorkspaceView(event.currentTarget, viewTrigger.dataset.workspaceView);
    return;
  }
  const removeFile = event.target.closest('[data-remove-file]');
  if (removeFile) {
    updateState({ files: getState().files.filter(({ id }) => id !== removeFile.dataset.removeFile) });
    return;
  }
  const removeRestore = event.target.closest('[data-remove-restore]');
  if (removeRestore) {
    updateState({ restore: { ...getState().restore, [removeRestore.dataset.removeRestore]: null } });
  }
}

function addDocuments(root, fileList) {
  const result = validateDocumentFiles(fileList, getState().files);
  updateState({ files: [...getState().files, ...result.accepted] });
  showAlert(root, result.errors);
}

function setRestoreFile(root, type, file) {
  if (!file) return;
  const state = getState();
  let error = '';
  if (type === 'document') error = validateDocumentFiles([file]).errors.join(' ');
  if (type === 'map') error = validateRestoreMap(file);
  if (!error && type === 'map' && state.restore.document && state.restore.document.id === `${file.name}-${file.size}-${file.lastModified}`) error = 'El archivo anonimizado y el mapa deben ser distintos.';
  if (error) { showAlert(root, [error]); return; }
  updateState({ restore: { ...state.restore, [type]: { file, id: `${file.name}-${file.size}-${file.lastModified}`, name: file.name, extension: file.name.split('.').pop(), size: file.size } } });
  showAlert(root, []);
}

function submitAnonymize(root, event) {
  event.preventDefault();
  const state = getState();
  const errors = [];
  if (!state.files.length) errors.push('Añade al menos un documento.');
  if (!selectedJobCount()) errors.push('Selecciona al menos una jurisdicción.');
  if (state.encryptMap) {
    const passphrase = root.querySelector('#map-passphrase').value;
    const confirmation = root.querySelector('#map-passphrase-confirm').value;
    if (!passphrase) errors.push('Introduce una passphrase para cifrar el mapa.');
    if (passphrase !== confirmation) errors.push('La confirmación de la passphrase no coincide.');
  }
  if (errors.length) { showAlert(root, errors); return; }
  showAlert(root, []);
  startVisualProgress(store, 'anonymize', state.files, `${state.files.length} documento${state.files.length === 1 ? '' : 's'} preparado${state.files.length === 1 ? '' : 's'}`);
}

function submitRestore(root, event) {
  event.preventDefault();
  const { document: source, map } = getState().restore;
  const errors = [];
  if (!source) errors.push('Selecciona el archivo anonimizado.');
  if (!map) errors.push('Selecciona el mapa .key.json.');
  if (source && map && source.id === map.id) errors.push('El archivo anonimizado y el mapa deben ser distintos.');
  if (errors.length) { showAlert(root, errors); return; }
  showAlert(root, []);
  root.querySelector('#restore-notice').hidden = false;
  root.querySelector('#restore-notice').textContent = 'Restauración preparada en modo demostración. La API todavía no está conectada.';
  startVisualProgress(store, 'restore', [source, map], source.name);
}

function setWorkspaceView(root, view) {
  updateState({ view });
  root.querySelectorAll('[data-workspace-panel]').forEach((panel) => {
    const active = panel.dataset.workspacePanel === view;
    panel.hidden = !active;
    panel.classList.toggle('is-visible', active);
  });
  root.querySelectorAll('[data-workspace-view]').forEach((tab) => {
    const active = tab.dataset.workspaceView === view;
    tab.classList.toggle('is-active', active);
    tab.setAttribute('aria-current', active ? 'page' : 'false');
  });
}

function renderWorkspace(root) {
  const state = getState();
  root.querySelector('#jurisdiction-list').innerHTML = jurisdictionOptions.map(({ key, label }) => `<label class="check-row jurisdiction-option"><input type="checkbox" data-jurisdiction="${key}" ${state.jurisdictions[key] ? 'checked' : ''} /><span class="custom-check" aria-hidden="true"></span><span>${label}</span></label>`).join('');
  root.querySelector('#select-all-jurisdictions').checked = selectedJobCount() === jurisdictionOptions.length;
  root.querySelector('#jurisdiction-count').textContent = `${selectedJobCount()} de ${jurisdictionOptions.length} seleccionadas`;
  root.querySelector('#encrypt-map').checked = state.encryptMap;
  root.querySelector('#passphrase-panel').hidden = !state.encryptMap;
  renderDocumentList(root, state);
  renderSummary(root, state);
  renderRestore(root, state);
  root.querySelector('#anonymize-progress').innerHTML = progressMarkup(state.activeJob?.type === 'anonymize' ? state.activeJob : null);
  root.querySelector('#restore-progress').innerHTML = progressMarkup(state.activeJob?.type === 'restore' ? state.activeJob : null);
  renderJobs(root, state);
  setWorkspaceView(root, state.view);
}

function renderDocumentList(root, state) {
  const list = root.querySelector('#document-file-list');
  list.replaceChildren();
  state.files.forEach((file) => {
    const item = document.createElement('div');
    item.className = 'selected-file';
    item.innerHTML = `<span class="selected-file-icon" aria-hidden="true">▤</span><span class="selected-file-data"><strong></strong><small>${file.extension.toUpperCase()} · ${file.sizeLabel}</small></span><button type="button" class="icon-button" data-remove-file="${escapeHtml(file.id)}" aria-label="Eliminar ${escapeHtml(file.name)}">×</button>`;
    item.querySelector('strong').textContent = file.name;
    list.append(item);
  });
}

function renderSummary(root, state) {
  root.querySelector('#summary-files').textContent = state.files.length;
  root.querySelector('#summary-jurisdictions').textContent = selectedJobCount();
  root.querySelector('#summary-encryption').textContent = state.encryptMap ? 'Sí' : 'No';
  const names = root.querySelector('#summary-file-names');
  names.replaceChildren();
  if (!state.files.length) { names.innerHTML = '<span>Aún no hay archivos seleccionados.</span>'; return; }
  state.files.forEach(({ name }) => { const item = document.createElement('span'); item.textContent = name; names.append(item); });
}

function renderRestore(root, state) {
  renderRestoreSummary(root, '#restore-document-summary', state.restore.document, 'document');
  renderRestoreSummary(root, '#restore-map-summary', state.restore.map, 'map');
  root.querySelector('#restore-summary-document').textContent = state.restore.document ? state.restore.document.name : 'Pendiente';
  root.querySelector('#restore-summary-map').textContent = state.restore.map ? state.restore.map.name : 'Pendiente';
}

function renderRestoreSummary(root, selector, file, type) {
  const target = root.querySelector(selector);
  target.replaceChildren();
  if (!file) return;
  const item = document.createElement('div');
  item.className = 'selected-file restore-file';
  item.innerHTML = `<span class="selected-file-icon" aria-hidden="true">${type === 'map' ? '⌁' : '▤'}</span><span class="selected-file-data"><strong></strong><small>${file.extension.toUpperCase()} · ${formatBytes(file.size)}</small></span><button type="button" class="icon-button" data-remove-restore="${type}" aria-label="Eliminar ${escapeHtml(file.name)}">×</button>`;
  item.querySelector('strong').textContent = file.name;
  target.append(item);
}

function renderJobs(root, state) {
  const list = root.querySelector('#jobs-list');
  if (!state.jobs.length) { list.innerHTML = '<div class="empty-state"><span class="empty-icon" aria-hidden="true">◌</span><h3>Aún no hay trabajos</h3><p>Los trabajos creados durante esta sesión aparecerán aquí como metadatos temporales.</p><button class="workspace-button button-secondary" type="button" data-workspace-view="anonymize">Preparar un documento</button></div>'; return; }
  list.innerHTML = `<div class="jobs-table" role="table" aria-label="Trabajos recientes"><div class="jobs-row jobs-header" role="row"><span>ID</span><span>Fecha</span><span>Operación</span><span>Archivos</span><span>Estado</span></div>${state.jobs.map((job) => `<div class="jobs-row" role="row"><strong>${job.id}</strong><span>${job.date}</span><span>${job.type === 'restore' ? 'Restauración' : 'Anonimización'}</span><span>${job.files}</span><span class="status-label">${job.status}</span></div>`).join('')}</div>`;
}

function showAlert(root, errors) {
  const alert = root.querySelector('#workspace-alert');
  alert.hidden = !errors.length;
  alert.replaceChildren();
  if (errors.length) {
    const heading = document.createElement('strong');
    heading.textContent = 'Revisa estos datos:';
    const list = document.createElement('ul');
    errors.forEach((error) => { const item = document.createElement('li'); item.textContent = error; list.append(item); });
    alert.append(heading, list);
  }
}

function escapeHtml(value) {
  return String(value).replace(/[&<>'"]/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[character]));
}