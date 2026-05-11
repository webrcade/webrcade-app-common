import { getProxyToUrl } from '../app/fetch';
import { settings } from '../settings';
import * as LOG from '../log';

const RA_API_URL = 'https://retroachievements.org/dorequest.php';

class RetroAchievements {
  constructor() {
    this.gameHasAchievements = false;
    this.patchAchievements = [];
    this.unlockedIds = new Set();
    this.gameTitle = null;
    this.gameBadgeName = null;
    this.gameTags = [];
    this._patchReceived = false;
    this._unlocksReceived = false;
    this._onUnlock = null;
    this._onGameLoaded = null;
    this._onMastery = null;
    this._masteryFired = false;
  }

  setUnlockCallback(cb) {
    this._onUnlock = cb;
  }

  setGameLoadedCallback(cb) {
    this._onGameLoaded = cb;
  }

  setMasteryCallback(cb) {
    this._onMastery = cb;
  }

  hasAchievements() {
    return this.gameHasAchievements;
  }

  resetGameState() {
    this.gameHasAchievements = false;
    this.patchAchievements = [];
    this.unlockedIds = new Set();
    this.gameTitle = null;
    this.gameBadgeName = null;
    this.gameTags = [];
    this._patchReceived = false;
    this._unlocksReceived = false;
    this._masteryFired = false;
  }

  _tryFireGameLoaded() {
    if (this._patchReceived && this._unlocksReceived && this.gameHasAchievements && this._onGameLoaded) {
      const unlockedCount = this.getUnlockedCount();
      const totalCount = this.patchAchievements.length;
      const unlockedPoints = this.getUnlockedPoints();
      const totalPoints = this.getTotalPoints();
      this._onGameLoaded(this.gameTitle, this.gameBadgeName, unlockedCount, totalCount, unlockedPoints, totalPoints, this.gameTags);
    }
  }

  getAchievements() {
    return this.patchAchievements;
  }

  isUnlocked(id) {
    return this.unlockedIds.has(id);
  }

  getTotalPoints() {
    return this.patchAchievements.reduce((s, a) => s + a.points, 0);
  }

  getUnlockedPoints() {
    return this.patchAchievements
      .filter(a => this.isUnlocked(a.id))
      .reduce((s, a) => s + a.points, 0);
  }

  getUnlockedCount() {
    return this.patchAchievements.filter(a => this.isUnlocked(a.id)).length;
  }

  getBadgeUrl(badgeName) {
    return getProxyToUrl(
      `https://media.retroachievements.org/Badge/${badgeName}.png`
    );
  }

  async login(username, password) {
    LOG.info(`RetroAchievements: attempting login for user: ${username}`);
    const proxyUrl = getProxyToUrl(RA_API_URL);
    const body = new URLSearchParams({ r: 'login2', u: username, p: password });
    const response = await fetch(proxyUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: body.toString(),
    });
    const data = await response.json();
    if (data.Success) {
      settings.setRaToken(data.Token);
      settings.setRaUsername(data.User);
      await settings.save();
      LOG.info(`RetroAchievements: login successful for user: ${data.User}`);
      return { success: true, username: data.User };
    } else {
      LOG.info(`RetroAchievements: login failed: ${data.Error}`);
      return { success: false, error: data.Error || 'Login failed' };
    }
  }

  async logout() {
    LOG.info('RetroAchievements: logging out.');
    settings.setRaToken(null);
    settings.setRaUsername(null);
    await settings.save();
  }

  isLoggedIn() {
    return settings.getRaToken() !== null;
  }

  getUsername() {
    return settings.getRaUsername();
  }

  getToken() {
    return settings.getRaToken();
  }

  async httpRequest(Module, reqId, url, postData) {
    // Badge images are only needed for the in-engine widget renderer which we
    // don't use. Drop them silently to avoid flooding the network/logs.
    if (url.includes('/Badge/') && url.endsWith('.png')) {
      Module.ccall('rcheevos_wrc_response', null,
        ['number', 'number', 'number', 'number'],
        [reqId, 200, 0, 0]);
      return;
    }
    try {
      // Skip award requests for achievements already unlocked this session
      if (postData && postData.includes('r=awardachievement')) {
        const match = /(?:^|&)a=(\d+)/.exec(postData);
        if (match) {
          const id = parseInt(match[1], 10);
          if (this.unlockedIds.has(id)) {
            LOG.info(`RetroAchievements: achievement id=${id} already unlocked, skipping network call`);
            const remaining = Math.max(0, this.patchAchievements.length - this.unlockedIds.size);
            const body = `{"Success":true,"Score":0,"SoftcoreScore":0,"AchievementID":${id},"AchievementsRemaining":${remaining}}`;
            const encoded = new TextEncoder().encode(body);
            const ptr = Module._malloc(encoded.length + 1);
            Module.HEAPU8.set(encoded, ptr);
            Module.HEAPU8[ptr + encoded.length] = 0;
            Module.ccall('rcheevos_wrc_response', null,
              ['number', 'number', 'number', 'number'],
              [reqId, 200, ptr, encoded.length]);
            Module._free(ptr);
            return;
          }
          this.unlockedIds.add(id);
        }
      }
      const proxyUrl = getProxyToUrl(url);
      const opts = postData
        ? { method: 'POST', body: postData,
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
        : { method: 'GET' };
      const response = await fetch(proxyUrl, opts);
      const text = await response.text();
      if (postData && postData.includes('r=patch') && response.status === 200) {
        try {
          const json = JSON.parse(text);
          const patchData = json && json.PatchData;
          const achievements = patchData && patchData.Achievements;
          if (patchData) {
            const rawTitle = patchData.Title || '';
            this.gameTags = (rawTitle.match(/~([^~]+)~/g) || []).map(t => t.replace(/~/g, ''));
            this.gameTitle = rawTitle.replace(/~[^~]+~/g, '').trim() || null;
            this.gameBadgeName = patchData.ImageIcon ? patchData.ImageIcon.replace(/^\/Images\//, '') : null;
          }
          if (achievements) {
            this.patchAchievements = achievements
              .filter(a => a.Flags === 3 && a.BadgeName !== '00000')
              .map(a => ({
                id: a.ID,
                title: a.Title,
                description: a.Description,
                points: a.Points || 0,
                badgeName: a.BadgeName || '',
              }));
          }
          const count = this.patchAchievements ? this.patchAchievements.length : 0;
          this.gameHasAchievements = count > 0;
          LOG.info(`RetroAchievements: game has ${count} achievements`);
        } catch (e) {
          this.gameHasAchievements = false;
        }
        this._patchReceived = true;
        this._tryFireGameLoaded();
      }
      if (response.status === 200) {
        // r=unlocks: initial set of already-earned achievement IDs
        if (postData && postData.includes('r=unlocks')) {
          try {
            const json = JSON.parse(text);
            const ids = json && json.UserUnlocks;
            if (Array.isArray(ids)) {
              ids.forEach(id => this.unlockedIds.add(id));
              LOG.info(`RetroAchievements: ${ids.length} pre-existing unlocks loaded`);
            }
          } catch (e) { /* ignore */ }
          this._unlocksReceived = true;
          this._tryFireGameLoaded();
        }
        // r=awardachievement: new unlock during this session
        if (postData && postData.includes('r=awardachievement')) {
          const match = /(?:^|&)a=(\d+)/.exec(postData);
          if (match) {
            const id = parseInt(match[1], 10);
            LOG.info(`RetroAchievements: achievement unlocked id=${id}`);
            if (this._onUnlock) {
              const ach = this.patchAchievements.find(a => a.id === id);
              if (ach) this._onUnlock(ach.title, ach.description, ach.badgeName);
            }
            if (!this._masteryFired && this.patchAchievements.length > 0 &&
                this.patchAchievements.every(a => this.unlockedIds.has(a.id))) {
              this._masteryFired = true;
              LOG.info(`RetroAchievements: mastery achieved for ${this.gameTitle}`);
              if (this._onMastery) {
                const totalCount = this.patchAchievements.length;
                const totalPoints = this.getTotalPoints();
                const username = settings.getRaUsername();
                this._onMastery(this.gameTitle, this.gameBadgeName, totalCount, totalPoints, username, this.gameTags);
              }
            }
          }
        }
      }
      const encoded = new TextEncoder().encode(text);
      const ptr = Module._malloc(encoded.length + 1);
      Module.HEAPU8.set(encoded, ptr);
      Module.HEAPU8[ptr + encoded.length] = 0;
      Module.ccall('rcheevos_wrc_response', null,
        ['number', 'number', 'number', 'number'],
        [reqId, response.status, ptr, encoded.length]);
      Module._free(ptr);
    } catch (e) {
      LOG.error(`RetroAchievements: [${reqId}] HTTP error for ${url}: ${e}`);
      Module.ccall('rcheevos_wrc_response', null,
        ['number', 'number', 'number', 'number'],
        [reqId, 0, 0, 0]);
    }
  }
}

const achievements = new RetroAchievements();
export { achievements };
