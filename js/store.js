/* Armazenamento local pesado (percursos GPS, sessão em andamento, memos de áudio) em IndexedDB.
   Tudo fica só neste aparelho. Se IndexedDB não existir, usa memória (e o app avisa que não vai persistir). */
(function () {
  'use strict';
  const NAME = 'calis-local', VER = 1, STORES = ['live', 'tracks', 'audio'];
  let dbp = null, mem = { live: {}, tracks: {}, audio: {} }, ok = typeof indexedDB !== 'undefined';
  function open() {
    if (!ok) return Promise.resolve(null);
    if (dbp) return dbp;
    dbp = new Promise(res => {
      try {
        const r = indexedDB.open(NAME, VER);
        r.onupgradeneeded = () => { const d = r.result; STORES.forEach(s => { if (!d.objectStoreNames.contains(s)) d.createObjectStore(s); }); };
        r.onsuccess = () => res(r.result);
        r.onerror = r.onblocked = () => { ok = false; res(null); };
      } catch (e) { ok = false; res(null); }
    });
    return dbp;
  }
  function tx(store, mode, fn) {
    return open().then(db => new Promise(res => {
      if (!db) { res(fn(null, null, true)); return; }
      try { const t = db.transaction(store, mode), os = t.objectStore(store), r = fn(os, t, false); t.oncomplete = () => res(r && r.result !== undefined ? r.result : r); t.onerror = t.onabort = () => res(undefined); if (r && r.onsuccess === null) r.onsuccess = () => {}; }
      catch (e) { res(undefined); }
    }));
  }
  const Store = {
    persistent: () => ok,
    put: (s, k, v) => tx(s, 'readwrite', (os, t, fallback) => { if (fallback) { mem[s][k] = v; return true; } os.put(v, k); return true; }),
    get: (s, k) => open().then(db => new Promise(res => {
      if (!db) { res(mem[s][k]); return; }
      try { const r = db.transaction(s).objectStore(s).get(k); r.onsuccess = () => res(r.result); r.onerror = () => res(undefined); } catch (e) { res(undefined); }
    })),
    del: (s, k) => tx(s, 'readwrite', (os, t, fallback) => { if (fallback) { delete mem[s][k]; return true; } os.delete(k); return true; }),
    keys: s => open().then(db => new Promise(res => {
      if (!db) { res(Object.keys(mem[s])); return; }
      try { const r = db.transaction(s).objectStore(s).getAllKeys(); r.onsuccess = () => res(r.result); r.onerror = () => res([]); } catch (e) { res([]); }
    })),
    clear: s => tx(s, 'readwrite', (os, t, fallback) => { if (fallback) { mem[s] = {}; return true; } os.clear(); return true; }),
    clearAll: () => Promise.all(STORES.map(s => Store.clear(s))),
  };
  window.Store = Store;
})();
