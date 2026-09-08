export function futureResultsMarkup(type) {
  const isRestore = type === 'restore';
  return `<section class="future-results" aria-labelledby="results-title">
    <div class="workspace-kicker">Resultados</div><h3 id="results-title">${isRestore ? 'Archivo restaurado' : 'Archivos de anonimización'}</h3>
    <div class="result-placeholder"><span class="result-icon" aria-hidden="true">${isRestore ? '↺' : '↓'}</span><div><strong>${isRestore ? 'Descarga del archivo restaurado' : 'Archivo anonimizado y mapa'}</strong><p>Disponible cuando la API esté conectada.</p></div><button class="workspace-button button-disabled" type="button" disabled>Descargar</button></div>
  </section>`;
}