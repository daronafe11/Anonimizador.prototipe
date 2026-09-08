export const API_ENDPOINTS = Object.freeze({
  config: '/api/v1/config',
  anonymize: '/api/v1/anonymize',
  restore: '/api/v1/restore',
  job: (jobId) => `/api/v1/jobs/${jobId}`,
});

export const apiClient = Object.freeze({
  getConfig() { throw new Error('La API todavía no está conectada.'); },
  anonymize() { throw new Error('La API todavía no está conectada.'); },
  restore() { throw new Error('La API todavía no está conectada.'); },
  getJob() { throw new Error('La API todavía no está conectada.'); },
});