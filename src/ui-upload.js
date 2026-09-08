const MAX_FILE_SIZE = 50 * 1024 * 1024;
const DOCUMENT_EXTENSIONS = ['csv', 'xlsx', 'docx', 'md', 'pdf'];

export function getExtension(name) {
  const normalizedName = name.toLowerCase();
  if (normalizedName.endsWith('.key.json')) return 'key.json';
  return normalizedName.includes('.') ? normalizedName.split('.').pop() : '';
}

export function formatBytes(bytes) {
  if (bytes === 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  return `${(bytes / (1024 ** index)).toFixed(index ? 1 : 0)} ${units[index]}`;
}

export function toFileMetadata(file) {
  return {
    file,
    id: `${file.name}-${file.size}-${file.lastModified}`,
    name: file.name,
    extension: getExtension(file.name),
    size: file.size,
    sizeLabel: formatBytes(file.size),
  };
}

export function validateDocumentFiles(fileList, existing = []) {
  const accepted = [];
  const errors = [];
  const knownIds = new Set(existing.map((file) => file.id));

  Array.from(fileList).forEach((file) => {
    const metadata = toFileMetadata(file);
    if (!DOCUMENT_EXTENSIONS.includes(metadata.extension)) {
      errors.push(`${file.name}: formato no permitido.`);
    } else if (file.size === 0) {
      errors.push(`${file.name}: el archivo está vacío.`);
    } else if (file.size > MAX_FILE_SIZE) {
      errors.push(`${file.name}: supera el límite de 50 MB.`);
    } else if (knownIds.has(metadata.id)) {
      errors.push(`${file.name}: ya está seleccionado.`);
    } else {
      knownIds.add(metadata.id);
      accepted.push(metadata);
    }
  });

  return { accepted, errors };
}

export function validateRestoreMap(file) {
  if (!file) return 'Selecciona un mapa de anonimización.';
  if (!file.name.toLowerCase().endsWith('.key.json')) return 'El mapa debe terminar en .key.json.';
  if (file.size === 0) return 'El mapa seleccionado está vacío.';
  if (file.size > MAX_FILE_SIZE) return 'El mapa supera el límite de 50 MB.';
  return '';
}

export function maxFileSizeLabel() {
  return formatBytes(MAX_FILE_SIZE);
}

export function escapeHtml(value) {
  return String(value).replace(/[&<>'"]/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[character]));
}