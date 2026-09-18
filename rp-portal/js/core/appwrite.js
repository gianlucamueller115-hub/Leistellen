

const AppwriteDB = {
  endpoint: '',
  projectId: '',
  databaseId: '',
  collectionId: '',
  apiKey: '',
  attribute: 'payload',
  ready: false,

  init() {
    this.endpoint = envValue('APPWRITE_ENDPOINT').replace(/\/+$/, '');
    this.projectId = envValue('APPWRITE_PROJECT_ID');
    this.databaseId = envValue('APPWRITE_DATABASE_ID');
    this.collectionId = envValue('APPWRITE_COLLECTION_ID');
    this.apiKey = envValue('APPWRITE_API_KEY');
    this.attribute = envValue('APPWRITE_PAYLOAD_ATTRIBUTE') || 'payload';
    this.ready = Boolean(this.endpoint && this.projectId && this.databaseId && this.collectionId);
    if (!this.ready) {
      console.info('[EinsatzPORTAL] Appwrite ist nicht konfiguriert – es wird der lokale Speicher genutzt.');
    }
    return this.ready;
  },

  isConfigured() {
    return this.ready;
  },

  headers() {
    const head = {
      'Content-Type': 'application/json',
      'X-Appwrite-Project': this.projectId,
      'X-Appwrite-Response-Format': '1.6.0'
    };
    if (this.apiKey) head['X-Appwrite-Key'] = this.apiKey;
    return head;
  },

  url(documentId) {
    const base = this.endpoint + '/databases/' + encodeURIComponent(this.databaseId) +
      '/collections/' + encodeURIComponent(this.collectionId) + '/documents';
    return documentId ? base + '/' + encodeURIComponent(documentId) : base;
  },

  async request(method, documentId, body, allowMissing) {
    let res;
    try {
      res = await fetch(this.url(documentId), {
        method,
        headers: this.headers(),
        body: body ? JSON.stringify(body) : undefined
      });
    } catch (err) {
      throw new Error('Appwrite nicht erreichbar (Endpunkt falsch, offline, oder die Domain ist ' +
        'im Appwrite-Projekt nicht als Web-Plattform eingetragen).');
    }

    let detail = '';
    if (!res.ok) {
      try { detail = (await res.json()).message || ''; } catch (err) { detail = ''; }
    }

    
    if (res.status === 404 && allowMissing && !/database|collection/i.test(detail)) {
      return { missing: true };
    }
    if (!res.ok) {
      const error = new Error('Appwrite ' + res.status + (detail ? ': ' + detail : ''));
      error.status = res.status;
      throw error;
    }

    return res.status === 204 ? {} : res.json();
  },

  
  async check() {
    try {
      await this.request('GET', null, null, false);
      return { ok: true };
    } catch (err) {
      return { ok: false, message: err.message };
    }
  },

  
  async get(key) {
    const doc = await this.request('GET', key, null, true);
    if (doc.missing) return null;
    const value = doc[this.attribute];
    return typeof value === 'string' ? value : null;
  },

  
  async set(key, value) {
    const data = {};
    data[this.attribute] = value;
    let lastError;

    for (let attempt = 0; attempt < 4; attempt++) {
      try {
        const updated = await this.request('PATCH', key, { data }, true);
        if (!updated.missing) return true;
        await this.request('POST', null, { documentId: key, data }, false);
        return true;
      } catch (err) {
        lastError = err;
        if (err.status !== 409 && err.status !== 429 && err.status < 500) throw err;
        await new Promise(resolve => setTimeout(resolve, 150 * (attempt + 1)));
      }
    }

    throw lastError;
  },

  async remove(key) {
    await this.request('DELETE', key, null, true);
    return true;
  }
};
