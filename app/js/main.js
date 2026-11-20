// Boot and shell: loads the data, applies the saved theme and spoiler setting, renders
// the progress bar and the active view, and wires the header controls and the tabs.

import { loadData } from './data.js';
import * as store from './store.js';
import {
  renderChecklist,
  renderRoadmap,
  renderMissables,
  renderPlanner,
  renderSettings,
  renderDetail,
} from './views.js';

const VIEWS = {
  checklist: renderChecklist,
  roadmap: renderRoadmap,
  missables: renderMissables,
  planner: renderPlanner,
  settings: renderSettings,
};

const viewEl = document.querySelector('#view');
const dialog = document.querySelector('#detail');
const detailBody = document.querySelector('#detailBody');
const spoilerToggle = document.querySelector('#spoilerToggle');
const themeToggle = document.querySelector('#themeToggle');

const app = {
  data: null,
  state: store.getState(),
  view: 'checklist',

  render() {
    this.renderProgress();
    VIEWS[this.view](viewEl, this);
    document.querySelectorAll('.tabs button').forEach((b) => {
      b.classList.toggle('active', b.dataset.view === this.view);
    });
  },

  renderProgress() {
    const total = this.data.trophies.length;
    const done = Object.keys(this.state.earned).length;
    document.querySelector('#progressText').textContent = `${done} of ${total} earned`;
    const byGrade = ['platinum', 'gold', 'silver', 'bronze']
      .map((g) => {
        const all = this.data.trophies.filter((t) => t.grade === g).length;
        const got = this.data.trophies.filter((t) => t.grade === g && this.state.earned[t.id]).length;
        return `${got}/${all} ${g}`;
      })
      .join(' · ');
    document.querySelector('#progressByGrade').textContent = byGrade;
    const fill = document.querySelector('#progressFill');
    fill.style.width = `${(done / total) * 100}%`;
    const bar = document.querySelector('#progressBar');
    bar.setAttribute('aria-valuenow', String(done));
    const missable = this.data.trophies.filter((t) => t.missable && !this.state.earned[t.id]).length;
    document.querySelector('#missableCount').textContent = missable > 0 ? missable : '';
  },

  toggleEarned(id) {
    const done = !this.state.earned[id];
    this.state = store.setEarned(id, done);
    this.render();
  },

  setNote(id, text) {
    this.state = store.setNote(id, text);
  },

  openDetail(id) {
    const trophy = this.data.trophies.find((t) => t.id === id);
    if (!trophy) return;
    renderDetail(dialog, detailBody, trophy, this);
    dialog.showModal();
  },

  setTheme(theme) {
    document.documentElement.dataset.theme = theme;
    this.state = store.setSetting('theme', theme);
    themeToggle.textContent = theme === 'paper' ? 'Night theme' : 'Paper theme';
    this.render();
  },

  setSpoilers(on) {
    this.state = store.setSetting('spoilers', on);
    spoilerToggle.checked = on;
    spoilerToggle.nextElementSibling.textContent = on ? 'Spoilers on' : 'Spoilers off';
    this.render();
  },

  exportProgress() {
    const blob = new Blob([store.exportState()], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'leonida-trophy-guide-progress.json';
    a.click();
    URL.revokeObjectURL(a.href);
    const msg = document.querySelector('#saveMsg');
    if (msg) msg.textContent = 'Exported. Keep the file somewhere safe.';
  },

  async importProgress(file) {
    const msg = document.querySelector('#saveMsg');
    if (!file) return;
    try {
      this.state = store.importState(await file.text());
      this.applySettings();
      this.render();
      if (msg) msg.textContent = 'Imported — your progress is restored.';
    } catch {
      if (msg) msg.textContent = 'That file is not a guide save. Nothing was changed.';
    }
  },

  resetProgress() {
    store.resetAll();
    this.state = store.getState();
    this.applySettings();
    this.render();
  },

  applySettings() {
    const s = this.state.settings;
    document.documentElement.dataset.theme = s.theme;
    themeToggle.textContent = s.theme === 'paper' ? 'Night theme' : 'Paper theme';
    spoilerToggle.checked = s.spoilers;
    spoilerToggle.nextElementSibling.textContent = s.spoilers ? 'Spoilers on' : 'Spoilers off';
  },
};

document.querySelectorAll('.tabs button').forEach((b) => {
  b.addEventListener('click', () => {
    app.view = b.dataset.view;
    app.render();
  });
});
themeToggle.addEventListener('click', () => {
  app.setTheme(document.documentElement.dataset.theme === 'paper' ? 'night' : 'paper');
});
spoilerToggle.addEventListener('change', () => app.setSpoilers(spoilerToggle.checked));
dialog.addEventListener('click', (e) => {
  if (e.target === dialog) dialog.close();
});

try {
  app.data = await loadData();
  app.applySettings();
  app.render();
} catch (err) {
  viewEl.innerHTML = `<p class="empty">The guide could not load its trophy list (${err.message}). Check that app/data/trophies.json is beside this page and reload.</p>`;
}
