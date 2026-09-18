

const STORAGE_PREFIX = 'rp-portal:';
const writeQueues = new Map();
const pendingWrites = new Set();

const Store = {
  hasPendingWrite(key) {
    return pendingWrites.has(key);
  },

  localGet(key) {
    try { return localStorage.getItem(STORAGE_PREFIX + key); } catch (err) { return null; }
  },
  localSet(key, value) {
    try { localStorage.setItem(STORAGE_PREFIX + key, value); } catch (err) {  }
  },
  localRemove(key) {
    try { localStorage.removeItem(STORAGE_PREFIX + key); } catch (err) {  }
  },

  async get(key, shared = false) {
    if (shared && AppwriteDB.isConfigured()) {
      try {
        const value = await AppwriteDB.get(key);
        if (value !== null) {
          this.localSet(key, value);
          return { key, value };
        }
        return null;
      } catch (err) {
        console.warn('[EinsatzPORTAL] Laden aus Appwrite fehlgeschlagen (' + key + '):', err.message);
      }
    }
    const local = this.localGet(key);
    return local === null ? null : { key, value: local };
  },

  async set(key, value, shared = false) {
    this.localSet(key, value);
    if (!shared || !AppwriteDB.isConfigured()) return true;

    const previous = writeQueues.get(key) || Promise.resolve();
    pendingWrites.add(key);
    const current = previous
      .catch(() => {})
      .then(() => AppwriteDB.set(key, value));
    writeQueues.set(key, current);
    try {
      await current;
      return true;
    } finally {
      if (writeQueues.get(key) === current) writeQueues.delete(key);
      if (!writeQueues.has(key)) pendingWrites.delete(key);
    }
  },

  async delete(key, shared = false) {
    this.localRemove(key);
    if (shared && AppwriteDB.isConfigured()) {
      try { await AppwriteDB.remove(key); } catch (err) {  }
    }
    return true;
  }
};
