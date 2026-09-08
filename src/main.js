import './style.css';
import { mountWorkspace } from './workspace.js';

document.querySelector('#app').innerHTML = `
  <header class="site-header">
    <div class="shell header-inner">
      <a class="brand" href="#inicio" aria-label="Anonimizador, ir al inicio">
        <span class="brand-mark" aria-hidden="true"><span></span><span></span><span></span></span>
        <span>Anonimizador</span>
      </a>
      <nav class="main-nav" aria-label="Navegación principal">
        <a href="#como-funciona">Cómo funciona</a>
        <a href="#seguridad">Seguridad</a>
        <a class="nav-cta" href="#area-trabajo">Iniciar sesión <span aria-hidden="true">↗</span></a>
      </nav>
    </div>
  </header>

  <main id="inicio">
    <section class="hero shell" aria-labelledby="hero-title">
      <div class="hero-copy reveal">
        <p class="eyebrow"><span class="status-dot" aria-hidden="true"></span> Privacidad antes de la conversación</p>
        <h1 id="hero-title">Comparte tus ideas.<br /><em>Protege tus datos</em></h1>
        <p class="hero-lead">Anonimiza documentos sensibles antes de enviarlos a cualquier herramienta de IA. Mantén el contexto útil y deja fuera lo que debe permanecer privado.</p>
        <div class="hero-actions">
          <a class="button button-primary" href="#area-trabajo">Comenzar a anonimizar <span aria-hidden="true">→</span></a>
          <a class="button button-quiet" href="#como-funciona">Ver cómo funciona <span aria-hidden="true">↓</span></a>
        </div>
        <p class="hero-note"><span aria-hidden="true">◌</span> Sin llamadas a servicios de IA durante el proceso</p>
      </div>

      <div class="flow-visual reveal" aria-label="Flujo de anonimización: documento, anonimización y documento protegido">
        <div class="flow-orbit orbit-one"></div>
        <div class="flow-orbit orbit-two"></div>
        <div class="document-card document-source">
          <div class="document-top"><span class="file-icon" aria-hidden="true">▤</span><span>contrato.docx</span><span class="file-size">2.4 MB</span></div>
          <div class="document-lines" aria-hidden="true"><i></i><i></i><i></i><i class="short"></i></div>
          <span class="document-label">Datos sensibles</span>
        </div>
        <div class="flow-arrow arrow-one" aria-hidden="true">→</div>
        <div class="shield-core" aria-hidden="true"><span>✦</span></div>
        <div class="flow-arrow arrow-two" aria-hidden="true">→</div>
        <div class="document-card document-protected">
          <div class="document-top"><span class="file-icon protected-icon" aria-hidden="true">✓</span><span>contrato_seguro.docx</span></div>
          <div class="document-lines" aria-hidden="true"><i></i><i></i><i class="masked"></i><i class="short"></i></div>
          <span class="document-label">Listo para compartir</span>
        </div>
        <div class="flow-caption"><span>01</span> El contexto permanece. La identidad desaparece.</div>
      </div>
    </section>

    <section class="trust-strip" aria-label="Principios de Anonimizador">
      <div class="shell trust-grid"><span>Diseñado para información delicada</span><span>Sin dependencia de proveedores de IA</span><span>Preparado para múltiples jurisdicciones</span></div>
    </section>

    <section class="steps-section shell" id="como-funciona" aria-labelledby="steps-title">
      <div class="section-heading reveal"><p class="eyebrow">El proceso</p><h2 id="steps-title">Tres pasos. <em>Una capa menos</em> de exposición.</h2><p>Elige qué proteger, mantén el sentido del documento y recupera el original cuando lo necesites mediante su mapa seguro.</p></div>
      <ol class="steps-list">
        <li class="step reveal"><span class="step-number">01</span><div><span class="step-icon" aria-hidden="true">↑</span><h3>Carga tu documento</h3><p>Prepara el archivo que quieres revisar. La pantalla de carga se incorporará en la siguiente fase.</p></div><span class="step-arrow" aria-hidden="true">↗</span></li>
        <li class="step reveal"><span class="step-number">02</span><div><span class="step-icon" aria-hidden="true">⌖</span><h3>Elige la jurisdicción</h3><p>Aplica el conjunto de reglas que corresponde al contexto legal de tus datos.</p></div><span class="step-arrow" aria-hidden="true">↗</span></li>
        <li class="step reveal"><span class="step-number">03</span><div><span class="step-icon" aria-hidden="true">↓</span><h3>Descarga el anonimizado</h3><p>Obtén un archivo listo para compartir. Su restauración se gestiona mediante un mapa seguro.</p></div><span class="step-arrow" aria-hidden="true">↗</span></li>
      </ol>
    </section>

    <section class="compatibility-section shell" aria-labelledby="compatibility-title">
      <div class="section-heading compact reveal"><p class="eyebrow">A tu medida</p><h2 id="compatibility-title">Tu formato. <em>Tu jurisdicción.</em></h2></div>
      <div class="compatibility-grid reveal"><div><p class="label">Formatos compatibles</p><div class="tag-list"><span>CSV</span><span>XLSX</span><span>DOCX</span><span>Markdown</span></div></div><div><p class="label">Jurisdicciones</p><p class="jurisdictions">RGPD <b>·</b> Chile <b>·</b> Brasil <b>·</b> México <b>·</b> Colombia <b>·</b> Argentina <b>·</b> UK GDPR <b>·</b> CCPA/CPRA</p></div></div>
    </section>

    <section class="security-section" id="seguridad" aria-labelledby="security-title">
      <div class="shell security-layout"><div class="security-intro reveal"><p class="eyebrow">Protección por diseño</p><h2 id="security-title">La privacidad no es una opción avanzada.</h2><p>Es el punto de partida de cada documento.</p></div><ul class="security-list"><li class="reveal"><span class="security-icon" aria-hidden="true">◇</span><div><h3>Sin IA en la anonimización</h3><p>El documento no se envía a servicios de inteligencia artificial durante el proceso.</p></div></li><li class="reveal"><span class="security-icon" aria-hidden="true">⌁</span><div><h3>Sin rastros en el navegador</h3><p>Los mapas y las claves no se guardan en tu navegador.</p></div></li><li class="reveal"><span class="security-icon" aria-hidden="true">⊙</span><div><h3>Infraestructura controlada</h3><p>El procesamiento está pensado para ejecutarse localmente o en un entorno bajo tu control.</p></div></li></ul></div>
    </section>

    <section class="start-section shell" id="comenzar" aria-labelledby="start-title"><div class="start-panel reveal"><div><p class="eyebrow">Siguiente paso</p><h2 id="start-title">Tu documento merece<br /><em>un momento de cuidado.</em></h2></div><div class="start-action"><p>La carga de documentos estará disponible en la próxima versión.</p><a class="button button-primary" href="mailto:hola@anonimizador.local">Preparar mi espacio <span aria-hidden="true">→</span></a></div></div></section>
  </main>

  <footer class="site-footer"><div class="shell footer-inner"><a class="brand" href="#inicio"><span class="brand-mark" aria-hidden="true"><span></span><span></span><span></span></span><span>Anonimizador</span></a><p>Privacidad para el trabajo que aún no quieres compartir.</p><nav aria-label="Enlaces del pie de página"><a href="#seguridad">Seguridad</a><a href="#seguridad">Privacidad</a><a href="mailto:hola@anonimizador.local">Contacto</a></nav></div></footer>
  <div id="area-trabajo" aria-label="Área de trabajo"></div>
`;

const revealItems = document.querySelectorAll('.reveal');
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (prefersReducedMotion) {
  revealItems.forEach((item) => item.classList.add('is-visible'));
} else {
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.14 });
  revealItems.forEach((item) => revealObserver.observe(item));
}

mountWorkspace(document.querySelector('#area-trabajo'));