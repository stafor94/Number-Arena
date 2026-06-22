const NICKNAME_KEY = 'na.nickname';
const RANKINGS_KEY = 'na.rankings';

export const storage = {
  get nickname() {
    return localStorage.getItem(NICKNAME_KEY) || '';
  },
  set nickname(value) {
    localStorage.setItem(NICKNAME_KEY, (value || '').trim() || 'Player');
  },
  scores() {
    return JSON.parse(localStorage.getItem(RANKINGS_KEY) || '{}');
  },
  saveScores(value) {
    localStorage.setItem(RANKINGS_KEY, JSON.stringify(value));
  },
  list(gameId) {
    const rows = this.scores()[gameId] || [];
    return Array.isArray(rows) ? rows : [rows].filter(Boolean);
  },
  best(gameId) {
    const nickname = this.nickname || 'Player';
    return this.list(gameId).find((row) => row.nickname === nickname)?.score || 0;
  },
  record(gameId, score, maxLevel, combo) {
    const all = this.scores();
    const nickname = this.nickname || 'Player';
    const rows = this.list(gameId);
    const old = rows.find((row) => row.nickname === nickname);
    const record = { nickname, gameId, score, maxLevel, combo, playedAt: new Date().toISOString() };

    if (!old || score > old.score) {
      all[gameId] = [record, ...rows.filter((row) => row.nickname !== nickname)]
        .sort((a, b) => b.score - a.score)
        .slice(0, 20);
      this.saveScores(all);
      return true;
    }
    return false;
  },
  total(gameIds) {
    return gameIds.reduce((sum, gameId) => sum + this.best(gameId), 0);
  },
};
