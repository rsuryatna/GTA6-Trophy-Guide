// The five views plus the trophy detail dialog. Every view is a function that renders
// into the #view element (or, for the detail, into the <dialog>). Views read the trophy
// data and the saved state, and call back into the app through `app` for state changes.

import { byId, missables, phases, rarityLabel, isStory } from './data.js';

function esc(text) {
  return String(text)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

function medal(trophy) {
  const letter = trophy.grade === 'platinum' ? 'P' : trophy.grade[0].toUpperCase();
  return `<span class="medal ${esc(trophy.grade)}" title="${esc(trophy.grade)}">${letter}</span>`;
}

function hiddenCard(trophy, app) {
  const earned = !!app.state.earned[trophy.id];
  return `<article class="card">
    <div class="card-head"><span class="medal hidden" title="hidden story trophy">?</span><h3>Hidden story trophy</h3></div>
    <p class="desc hidden-story">Spoilers are on. This story trophy stays hidden until you earn it — then its name, description and guide appear here.</p>
    <div class="meta"><span class="chip">story</span></div>
    <div class="card-actions">
      <button type="button" class="earned-btn ${earned ? 'done' : ''}" data-earned="${trophy.id}">${earned ? '✓ Earned' : 'Mark earned'}</button>
    </div>
  </article>`;
}

function trophyCard(trophy, app) {
  const earned = !!app.state.earned[trophy.id];
  const hidden = app.state.settings.spoilers && isStory(trophy) && !earned;
  if (hidden) return hiddenCard(trophy, app);
  const rare = rarityLabel(trophy.rarity);
  return `<article class="card ${earned ? 'earned' : ''}">
    <div class="card-head">${medal(trophy)}<h3>${esc(trophy.name)}</h3></div>
    <p class="desc">${esc(trophy.description)}</p>
    <div class="meta">
      <span class="chip">${esc(trophy.grade)}</span>
      ${trophy.kind !== trophy.grade ? `<span class="chip">${esc(trophy.kind)}</span>` : ''}
      <span class="chip rare">${rare} · ${trophy.rarity}%</span>
      ${trophy.missable ? '<span class="chip miss">Missable</span>' : ''}
    </div>
    <p class="guide-peek">${esc(trophy.guide)}</p>
    <div class="card-actions">
      <button type="button" class="earned-btn ${earned ? 'done' : ''}" data-earned="${trophy.id}">${earned ? '✓ Earned' : 'Mark earned'}</button>
      <button type="button" data-guide="${trophy.id}">Guide</button>
    </div>
  </article>`;
}

function wireCards(root, app) {
  root.querySelectorAll('[data-earned]').forEach((btn) => {
    btn.addEventListener('click', () => app.toggleEarned(Number(btn.dataset.earned)));
  });
  root.querySelectorAll('[data-guide]').forEach((btn) => {
    btn.addEventListener('click', () => app.openDetail(Number(btn.dataset.guide)));
  });
}

export function renderChecklist(root, app) {
  const kinds = [...new Set(app.data.trophies.map((t) => t.kind))].sort();
  root.innerHTML = `
    <h2>Checklist</h2>
    <p class="section-note">All 55 official trophies. Tick each one as you earn it; the guide for a trophy opens from its card. Turn spoilers on (top right) to hide story trophies until you earn them.</p>
    <div class="filters">
      <input type="search" id="q" placeholder="Search trophies…" aria-label="Search trophies">
      <select id="grade" aria-label="Filter by grade">
        <option value="all">All grades</option>
        <option value="platinum">Platinum</option>
        <option value="gold">Gold</option>
        <option value="silver">Silver</option>
        <option value="bronze">Bronze</option>
      </select>
      <select id="kind" aria-label="Filter by kind">
        <option value="all">All kinds</option>
        ${kinds.map((k) => `<option value="${esc(k)}">${esc(k)}</option>`).join('')}
      </select>
      <label><input type="checkbox" id="onlyUnearned"> Only unearned</label>
      <label><input type="checkbox" id="onlyMissable"> Only missable</label>
    </div>
    <div class="cards" id="cards"></div>
    <p class="empty" id="noMatch" hidden>No trophies match these filters.</p>`;

  const apply = () => {
    const q = root.querySelector('#q').value.trim().toLowerCase();
    const grade = root.querySelector('#grade').value;
    const kind = root.querySelector('#kind').value;
    const onlyUnearned = root.querySelector('#onlyUnearned').checked;
    const onlyMissable = root.querySelector('#onlyMissable').checked;
    const shown = app.data.trophies.filter((t) => {
      if (grade !== 'all' && t.grade !== grade) return false;
      if (kind !== 'all' && t.kind !== kind) return false;
      if (onlyUnearned && app.state.earned[t.id]) return false;
      if (onlyMissable && !t.missable) return false;
      if (q && !(t.name + ' ' + t.description + ' ' + t.guide).toLowerCase().includes(q)) return false;
      return true;
    });
    const cards = root.querySelector('#cards');
    cards.innerHTML = shown.map((t) => trophyCard(t, app)).join('');
    root.querySelector('#noMatch').hidden = shown.length > 0;
    wireCards(cards, app);
  };
  root.querySelector('#q').addEventListener('input', apply);
  root.querySelector('#grade').addEventListener('change', apply);
  root.querySelector('#kind').addEventListener('change', apply);
  root.querySelector('#onlyUnearned').addEventListener('change', apply);
  root.querySelector('#onlyMissable').addEventListener('change', apply);
  apply();
}

export function renderRoadmap(root, app) {
  const earnedCount = (ids) => ids.filter((id) => app.state.earned[id]).length;
  root.innerHTML = `
    <h2>Roadmap to the platinum</h2>
    <p class="section-note">The order to play in. Story first — it unlocks everything else — then the strands while they are open, then activities and collectibles, then combat, and the money grind last. The platinum unlocks when every step is done.</p>
    ${phases(app.data).map((p) => {
      const done = earnedCount(p.ids);
      return `<section class="phase">
        <div class="phase-head"><h3>Phase ${p.phase} — ${esc(p.title)}</h3><span class="pct">${done} of ${p.ids.length} done</span></div>
        <p>${esc(p.note)}</p>
        <ol class="steps">
          ${p.ids.map((id, i) => {
            const t = byId(app.data, id);
            const doneT = !!app.state.earned[id];
            const hidden = app.state.settings.spoilers && isStory(t) && !doneT;
            return `<li class="${doneT ? 'done' : ''}">
              <span class="n">${i + 1}</span>
              <span class="t">${hidden ? 'Hidden story trophy' : esc(t.name)}${t.missable ? ' <span class="chip miss">Missable</span>' : ''}</span>
              <span class="g">${hidden ? 'story' : esc(t.grade)}</span>
              <span class="tick">${doneT ? '✓' : ''}</span>
            </li>`;
          }).join('')}
        </ol>
      </section>`;
    }).join('')}`;
}

export function renderMissables(root, app) {
  const list = missables(app.data);
  root.innerHTML = `
    <h2>Missables</h2>
    <p class="section-note">Seven trophies can be missed if you play past the moment they belong to. They are all tied to strands or a story choice: the final mission of a strand only unlocks after its earlier missions, and a strand left until after a later story beat may close. Do these when they appear. None of this has been confirmed in-game yet — the flags come from the official descriptions, and the guide says so where it is unsure.</p>
    <div class="cards">
      ${list.map((t) => trophyCard(t, app)).join('')}
    </div>
    <section class="panel" style="margin-top:14px">
      <h3>How to stay safe</h3>
      <p>1. After every story beat, check the map for new stranger and contact markers and do those missions before the next story mission.<br>
      2. Save before a major story choice — “Actions Speak Louder” is tied to one, and the other option may lock it out until a replay.<br>
      3. Story-mission trophies themselves are not flagged here: they come from missions you play through, and mission replay (if the game offers it) covers a missed one.</p>
    </section>`;
  wireCards(root, app);
}

// The planner: the next story beat, the most urgent missable, then the easiest wins.
export function planNext(app, count = 5) {
  const earned = app.state.earned;
  const order = phases(app.data).flatMap((p) => p.ids);
  const picks = [];
  const add = (t, why) => {
    if (t && !earned[t.id] && !picks.some((p) => p.trophy.id === t.id) && picks.length < count) {
      picks.push({ trophy: t, why });
    }
  };
  const nextStory = order.map((id) => byId(app.data, id)).find((t) => t.kind === 'story' && !earned[t.id]);
  add(nextStory, 'Next story beat — the main story unlocks everything else.');
  const nextMissable = missables(app.data).find((t) => !earned[t.id]);
  add(nextMissable, 'Most urgent missable — do it before the story moves on.');
  const easiest = app.data.trophies
    .filter((t) => !earned[t.id] && t.kind !== 'story' && t.kind !== 'platinum' && t.kind !== 'completion')
    .sort((a, b) => b.rarity - a.rarity);
  for (const t of easiest) add(t, `${rarityLabel(t.rarity)} (${t.rarity}% of players have it) — a quick win.`);
  return picks;
}

export function renderPlanner(root, app) {
  const picks = planNext(app, 5);
  const done = Object.keys(app.state.earned).length;
  root.innerHTML = `
    <h2>Next up</h2>
    <p class="section-note">${done === 0 ? 'You have not earned anything yet — start with the story.' : `You have earned ${done} of 55. Here is what to do next, in order.`} The planner always puts the story and the missables first: the easy wins fill the gaps.</p>
    ${picks.length === 0 ? '<p class="empty">Everything is earned. The platinum should be yours — congratulations, Leonida Legend.</p>' : `
    <ol class="steps">
      ${picks.map((p, i) => {
        const t = p.trophy;
        const hidden = app.state.settings.spoilers && isStory(t);
        return `<li>
          <span class="n">${i + 1}</span>
          <span class="t"><strong>${hidden ? 'Hidden story trophy' : esc(t.name)}</strong> — ${esc(p.why)}</span>
          <span class="g">${hidden ? 'story' : esc(t.grade)}</span>
        </li>`;
      }).join('')}
    </ol>
    <div class="cards" style="margin-top:14px">${picks.map((p) => trophyCard(p.trophy, app)).join('')}</div>`}`;
  wireCards(root, app);
}

export function renderSettings(root, app) {
  root.innerHTML = `
    <h2>Settings &amp; sources</h2>
    <section class="panel">
      <h3>Look</h3>
      <p>Two looks, one coral accent. Paper is the default; night is easier on the eyes after dark.</p>
      <div class="row">
        <button type="button" data-theme-set="paper">Paper (light)</button>
        <button type="button" data-theme-set="night">Night (dark)</button>
      </div>
    </section>
    <section class="panel">
      <h3>Spoilers</h3>
      <p>When spoilers are off, story trophies hide their name, description and guide until you earn them. The roadmap and planner hide them the same way.</p>
      <div class="row">
        <label><input type="checkbox" id="spoilerBox" ${app.state.settings.spoilers ? 'checked' : ''}> Hide story trophies until earned</label>
      </div>
    </section>
    <section class="panel">
      <h3>Save &amp; restore</h3>
      <p>Your progress lives in this browser only. Export it as a file to keep a copy, or to move it to another device.</p>
      <div class="row">
        <button type="button" id="exportBtn">Export progress (.json)</button>
        <label class="import">Import progress <input id="importFile" type="file" accept="application/json"></label>
        <button type="button" class="danger" id="resetBtn">Reset all progress</button>
      </div>
      <p id="saveMsg" role="status"></p>
    </section>
    <section class="panel">
      <h3>Sources</h3>
      <p>Where every fact in this guide comes from:</p>
      <ul class="sources">
        ${app.data.sources.map((s) => `<li>${esc(s)}</li>`).join('')}
        <li>Earn rates are the share of tracked players who earned each trophy — the rarer the trophy, the lower the number.</li>
      </ul>
    </section>`;
  root.querySelectorAll('[data-theme-set]').forEach((btn) => {
    btn.addEventListener('click', () => app.setTheme(btn.dataset.themeSet));
  });
  root.querySelector('#spoilerBox').addEventListener('change', (e) => app.setSpoilers(e.target.checked));
  root.querySelector('#exportBtn').addEventListener('click', () => app.exportProgress());
  root.querySelector('#importFile').addEventListener('change', (e) => app.importProgress(e.target.files[0]));
  root.querySelector('#resetBtn').addEventListener('click', () => {
    if (window.confirm('Reset all earned trophies and notes? This cannot be undone.')) app.resetProgress();
  });
}

export function renderDetail(dialog, body, trophy, app) {
  const earned = !!app.state.earned[trophy.id];
  const note = app.state.notes[trophy.id] || '';
  body.innerHTML = `
    <button type="button" class="close" data-close aria-label="Close">✕</button>
    <div class="card-head">${medal(trophy)}<h2>${esc(trophy.name)}</h2></div>
    <div class="meta">
      <span class="chip">${esc(trophy.grade)}</span>
      <span class="chip">${esc(trophy.kind)}</span>
      <span class="chip rare">${rarityLabel(trophy.rarity)} · ${trophy.rarity}% of players</span>
      ${trophy.missable ? '<span class="chip miss">Missable</span>' : ''}
    </div>
    <p class="desc">${esc(trophy.description)}</p>
    ${trophy.missable && trophy.missable_note ? `<p class="warn-box">⚠ Missable — ${esc(trophy.missable_note)}</p>` : ''}
    <div class="guide"><h3>Guide</h3><p>${esc(trophy.guide)}</p></div>
    <h3>Sources</h3>
    <ul class="sources">${trophy.sources.map((s) => `<li>${esc(s)}</li>`).join('')}</ul>
    <h3>Your note</h3>
    <textarea class="note-area" data-note placeholder="Your own note for this trophy — a location, a loadout, a reminder…">${esc(note)}</textarea>
    <div class="detail-actions">
      <button type="button" class="primary" data-earned-toggle>${earned ? '✓ Earned — tap to unmark' : 'Mark earned'}</button>
      <button type="button" data-close>Close</button>
    </div>`;
  body.querySelectorAll('[data-close]').forEach((b) => b.addEventListener('click', () => dialog.close()));
  body.querySelector('[data-earned-toggle]').addEventListener('click', () => {
    app.toggleEarned(trophy.id);
    renderDetail(dialog, body, trophy, app);
  });
  body.querySelector('[data-note]').addEventListener('input', (e) => app.setNote(trophy.id, e.target.value));
}
