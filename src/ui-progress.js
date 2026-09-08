import { escapeHtml, formatBytes } from './ui-upload.js';

export function progressMarkup(activeJob) {
  if (!activeJob) return '';
  const operationLabel = activeJob.type === 'restore' ? 'Restauración' : 'Anonimización';
  return `<section class="demo-progress" aria-labelledby="progress-title" aria-live="polite">
    <div class="progress-heading"><div><p class="workspace-kicker">Progreso</p><h3 id="progress-title">${operationLabel} preparada</h3></div><span class="demo-badge">Demostración visual</span></div>
    <div class="progress-meta"><span>${escapeHtml(activeJob.name)}</span><strong>${activeJob.progress}%</strong></div>
    <div class="progress-track" role="progressbar" aria-valuenow="${activeJob.progress}" aria-valuemin="0" aria-valuemax="100" aria-label="Progreso de demostración"><span style="width:${activeJob.progress}%"></span></div>
    <p class="progress-message">${activeJob.message}</p>
    <div class="progress-files">${activeJob.files.map((file) => `<span>${escapeHtml(file.name)} <small>${formatBytes(file.size)}</small></span>`).join('')}</div>
  </section>`;
}

export function startVisualProgress(store, type, files, name) {
  const job = {
    id: `demo-${Date.now().toString(36)}`,
    type,
    name,
    files: files.map(({ name: fileName, size }) => ({ name: fileName, size })),
    progress: 8,
    status: 'processing',
    message: 'Demostración visual. No se han procesado archivos.',
  };
  store.updateState({ activeJob: job });
  const steps = [28, 54, 79, 100];
  let step = 0;
  const timer = window.setInterval(() => {
    const progress = steps[step];
    const status = progress === 100 ? 'completed' : 'processing';
    store.updateState({ activeJob: { ...job, progress, status, message: 'Demostración visual. No se han procesado archivos.' } });
    step += 1;
    if (step === steps.length) {
      window.clearInterval(timer);
      const completedJob = { ...job, progress: 100, status: 'completed' };
      store.updateState({ activeJob: completedJob, jobs: [
        { id: completedJob.id.slice(-8), date: new Date().toLocaleString('es-ES'), files: completedJob.files.length, type, status: 'Completado (demo)' },
        ...store.getState().jobs,
      ] });
    }
  }, 650);
}