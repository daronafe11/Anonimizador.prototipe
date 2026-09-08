const listeners = new Set();

const state = {
  view: 'anonymize',
  files: [],
  jurisdictions: {},
  encryptMap: false,
  restore: { document: null, map: null },
  jobs: [],
  activeJob: null,
};

export const jurisdictionOptions = [
  { key: 'rgpd', label: 'Europa / RGPD-GDPR' },
  { key: 'chile', label: 'Chile' },
  { key: 'brasil', label: 'Brasil' },
  { key: 'mexico', label: 'México' },
  { key: 'colombia', label: 'Colombia' },
  { key: 'argentina', label: 'Argentina' },
  { key: 'uk', label: 'UK GDPR' },
  { key: 'ccpa', label: 'CCPA / CPRA' },
];

export function getState() {
  return state;
}

export function subscribe(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function updateState(changes) {
  Object.assign(state, changes);
  listeners.forEach((listener) => listener(state));
}

export function selectedJurisdictions() {
  return jurisdictionOptions.filter(({ key }) => state.jurisdictions[key]);
}

export function selectedJobCount() {
  return selectedJurisdictions().length;
}