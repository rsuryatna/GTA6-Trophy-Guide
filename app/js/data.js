// Loads the trophy list (app/data/trophies.json) and gives the app typed access to it.
// The JSON is the official 55-trophy list enriched with a kind, a missable flag, the live
// Exophase earn rate and a guide per trophy. This module never writes anything.

let cache = null;

export async function loadData() {
  if (cache) return cache;
  const res = await fetch('data/trophies.json');
  if (!res.ok) throw new Error('could not load data/trophies.json');
  cache = await res.json();
  return cache;
}

export function byId(data, id) {
  return data.trophies.find((t) => t.id === id);
}

export function missables(data) {
  return data.trophies.filter((t) => t.missable);
}

export function byGrade(data, grade) {
  return data.trophies.filter((t) => t.grade === grade);
}

// A plain-words label for an earn rate, so the checklist reads at a glance.
export function rarityLabel(rate) {
  if (rate >= 20) return 'Very common';
  if (rate >= 5) return 'Common';
  if (rate >= 1) return 'Uncommon';
  if (rate >= 0.1) return 'Rare';
  return 'Very rare';
}

// Roadmap phases in order; each phase names the trophies it covers, in the order to do them.
export function phases(data) {
  return data.roadmap.slice().sort((a, b) => a.phase - b.phase);
}

// Story trophies are the spoiler-sensitive ones: their names give away plot beats.
export function isStory(trophy) {
  return trophy.kind === 'story';
}
