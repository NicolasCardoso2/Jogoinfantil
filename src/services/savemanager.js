// Gerenciador de salvamento simples baseado em localStorage.
// Mantém um state em memória e garante defaults/migração defensiva.
const STORAGE_KEY = 'jogo_infantil_save_v1';
const SCHEMA_VERSION = 1;
const PHASE_ORDER = ['B', 'C', 'D', 'F'];

function createActivitiesDefaults() {
  const activities = {};
  for (let i = 1; i <= 9; i += 1) {
    activities[String(i)] = {
      completed: false,
      bestStars: 0,
      bestCorrect: 0,
      bestWrong: 0
    };
  }
  return activities;
}

function createPhaseDefaults(letter, unlocked = false) {
  return {
    unlocked,
    bestStars: 0,
    totalCompletions: 0,
    activities: createActivitiesDefaults(),
    badgeUnlocked: false
  };
}

function createDefaultState() {
  return {
    version: SCHEMA_VERSION,
    updatedAt: new Date().toISOString(),
    settings: {
      musicVolume: 0.8,
      sfxVolume: 1.0,
      voiceVolume: 1.0,
      voiceEnabled: true
    },
    progress: {
      B: createPhaseDefaults('B', true), // Primeira fase sempre desbloqueada
      C: createPhaseDefaults('C', false),
      D: createPhaseDefaults('D', false),
      F: createPhaseDefaults('F', false)
    }
  };
}

function deepMergeDefaults(state) {
  const base = createDefaultState();
  const merged = { ...base, ...state };
  merged.settings = { ...base.settings, ...(state?.settings || {}) };
  merged.progress = { ...base.progress, ...(state?.progress || {}) };

  // Garante que cada fase tenha estrutura completa
  PHASE_ORDER.forEach((letter, idx) => {
    const phase = merged.progress[letter] || createPhaseDefaults(letter, idx === 0);
    merged.progress[letter] = {
      ...createPhaseDefaults(letter, idx === 0),
      ...phase,
      activities: { ...createActivitiesDefaults(), ...(phase.activities || {}) }
    };
  });

  merged.version = SCHEMA_VERSION;
  merged.updatedAt = new Date().toISOString();
  return merged;
}

class SaveManager {
  constructor() {
    this.state = createDefaultState();
  }

  load() {
    try {
      const raw = window.localStorage?.getItem(STORAGE_KEY);
      if (!raw) {
        this.state = createDefaultState();
        this.save(this.state);
        return this.state;
      }

      let parsed = null;
      try {
        parsed = JSON.parse(raw);
      } catch (e) {
        // JSON corrompido
        this.state = createDefaultState();
        this.save(this.state);
        return this.state;
      }

      // Migração simples: se version ausente ou diferente, força defaults e mescla
      if (!parsed.version || parsed.version !== SCHEMA_VERSION) {
        parsed.version = SCHEMA_VERSION;
      }

      this.state = deepMergeDefaults(parsed);
      return this.state;
    } catch (err) {
      console.warn('[SaveManager] Falha ao carregar, usando defaults', err);
      this.state = createDefaultState();
      return this.state;
    }
  }

  save(data = null) {
    try {
      if (data) this.state = deepMergeDefaults(data);
      this.state.updatedAt = new Date().toISOString();
      window.localStorage?.setItem(STORAGE_KEY, JSON.stringify(this.state));
      return true;
    } catch (err) {
      console.error('[SaveManager] Falha ao salvar', err);
      return false;
    }
  }

  getProgress(letter) {
    const l = String(letter || '').toUpperCase();
    if (!PHASE_ORDER.includes(l)) return createPhaseDefaults(l, false);
    if (!this.state?.progress) this.load();
    return this.state.progress[l] || createPhaseDefaults(l, l === 'B');
  }

  updateActivity(letter, activityNumber, data = {}) {
    const l = String(letter || '').toUpperCase();
    const num = String(activityNumber || '1');
    const state = this.state?.progress ? this.state : this.load();
    const phase = this.getProgress(l);
    const act = { ...phase.activities[num] };

    if (data.completed) act.completed = true;
    if (typeof data.stars === 'number') {
      act.bestStars = Math.max(act.bestStars || 0, Math.max(0, Math.min(3, data.stars)));
    }
    if (typeof data.correct === 'number') {
      act.bestCorrect = Math.max(act.bestCorrect || 0, data.correct);
    }
    if (typeof data.wrong === 'number') {
      act.bestWrong = Math.max(act.bestWrong || 0, data.wrong);
    }

    phase.activities[num] = act;
    this.state.progress[l] = phase;
    this.save(this.state);
    return phase.activities[num];
  }

  updatePhase(letter, { starsEarnedThisRun = 0 } = {}) {
    const l = String(letter || '').toUpperCase();
    const state = this.state?.progress ? this.state : this.load();
    const phase = this.getProgress(l);

    const gained = Math.max(0, Math.min(3, starsEarnedThisRun || 0));
    phase.bestStars = Math.max(phase.bestStars || 0, gained);
    phase.totalCompletions = (phase.totalCompletions || 0) + 1;

    if (phase.bestStars >= 1) {
      phase.badgeUnlocked = true;
    }

    this.state.progress[l] = phase;

    // Desbloqueia próxima fase quando houver pelo menos 1 estrela
    if (phase.bestStars >= 1) {
      const idx = PHASE_ORDER.indexOf(l);
      const nextLetter = PHASE_ORDER[idx + 1];
      if (nextLetter && this.state.progress[nextLetter]) {
        this.state.progress[nextLetter].unlocked = true;
      }
    }

    this.save(this.state);
    return phase;
  }

  unlockPhase(letter) {
    const l = String(letter || '').toUpperCase();
    const state = this.state?.progress ? this.state : this.load();
    if (!state.progress[l]) state.progress[l] = createPhaseDefaults(l, true);
    state.progress[l].unlocked = true;
    this.save(state);
    return state.progress[l];
  }

  resetAll() {
    this.state = createDefaultState();
    this.save(this.state);
    return this.state;
  }

  exportJSON() {
    if (!this.state) this.load();
    return JSON.stringify(this.state, null, 2);
  }

  importJSON(jsonString) {
    try {
      const parsed = JSON.parse(jsonString);
      const merged = deepMergeDefaults(parsed);
      this.state = merged;
      this.save(this.state);
      return this.state;
    } catch (err) {
      console.warn('[SaveManager] importJSON falhou, mantendo state atual', err);
      return this.state;
    }
  }
}

const singleton = new SaveManager();
export default singleton;
