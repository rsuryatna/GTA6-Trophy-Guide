// Progress, notes and settings, kept in this browser's localStorage only.
// Nothing here leaves the device. Export/import moves the same JSON file around.

const KEY = 'leonida-trophy-guide-v1';

function readRaw() {
  try {
    return JSON.parse(localStorage.getItem(KEY)) || {};
  } catch {
    return {};
  }
}

function writeRaw(state) {
  localStorage.setItem(KEY, JSON.stringify(state));
}

export function getState() {
  const s = readRaw();
  return {
    earned: s.earned && typeof s.earned === 'object' ? s.earned : {},
    notes: s.notes && typeof s.notes === 'object' ? s.notes : {},
    settings: {
      theme: 'paper',
      spoilers: false,
      ...(s.settings && typeof s.settings === 'object' ? s.settings : {}),
    },
  };
}

export function setEarned(id, done) {
  const s = getState();
  if (done) s.earned[id] = true;
  else delete s.earned[id];
  writeRaw(s);
  return s;
}

export function setNote(id, text) {
  const s = getState();
  if (text.trim()) s.notes[id] = text;
  else delete s.notes[id];
  writeRaw(s);
  return s;
}

export function setSetting(name, value) {
  const s = getState();
  s.settings[name] = value;
  writeRaw(s);
  return s;
}

export function exportState() {
  return JSON.stringify(getState(), null, 2);
}

export function importState(text) {
  const parsed = JSON.parse(text);
  if (!parsed || typeof parsed !== 'object') throw new Error('not a guide save file');
  const current = getState();
  const next = {
    earned: parsed.earned && typeof parsed.earned === 'object' ? parsed.earned : {},
    notes: parsed.notes && typeof parsed.notes === 'object' ? parsed.notes : {},
    settings: {
      ...current.settings,
      ...(parsed.settings && typeof parsed.settings === 'object' ? parsed.settings : {}),
    },
  };
  writeRaw(next);
  return next;
}

export function resetAll() {
  localStorage.removeItem(KEY);
}
