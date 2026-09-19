'use strict';
// ════════════════════════════════════════════════════════════════════
//  طبقة التخزين المشتركة
// ════════════════════════════════════════════════════════════════════
//  بدل IndexedDB (المحلي لكل متصفح) تُحفظ كل السجلات سحابيًا، فيرى كل من يملك
//  الرابط نفس البيانات وأي تعديل يظهر للجميع.
//
//  يدعم الملف مصدرين للبيانات ويختار تلقائيًا:
//   1) Firebase Realtime Database (REST) — إذا وُضع رابطها في js/config.js.
//      يعمل على أي استضافة ثابتة: GitHub Pages، Netlify، Vercel…
//   2) واجهة tables/ الخاصة بمنصة Genspark — عند ترك الرابط فارغًا.
//
//  يوفر للتطبيق نفس الدوال القديمة: openDatabase / getAll / commit
//  إضافة إلى startLiveSync للتحديث التلقائي من الأجهزة الأخرى.

const SHARED_STORES = ['records', 'history', 'settings', 'debts'];
const CONFIG = Object.assign({ firebaseDatabaseUrl: '', firebaseRoot: 'daftar', liveSyncSeconds: 15 }, window.DAFTAR_CONFIG || {});
const LIVE_SYNC_INTERVAL = Math.max(5, Number(CONFIG.liveSyncSeconds) || 15) * 1000;
let backend = null;       // 'firebase' | 'tables'
let liveSyncBusy = false;
let lastKnownVersion = null;

function friendlyNetworkError() { return new Error('لا يوجد اتصال بالخادم. تحقق من الإنترنت وأعد المحاولة.'); }

// يعيد العنصر إلى شكله الكامل (Firebase يحذف المصفوفات الفارغة والقيم null).
function normalizeItem(store, item) {
    if (!item || typeof item !== 'object') return null;
    if (store === 'records') {
        item.photos = Array.isArray(item.photos) ? item.photos : [];
        item.notes = typeof item.notes === 'string' ? item.notes : '';
        item.title = typeof item.title === 'string' ? item.title : '';
    } else if (store === 'debts') {
        item.notes = typeof item.notes === 'string' ? item.notes : '';
        item.amounts = Object.assign({ USD: 0, TRY: 0, SYP: 0 }, item.amounts || {});
    } else if (store === 'settings') {
        if (item.lastBackup === undefined) item.lastBackup = null;
        if (item.categories) { item.categories.income = item.categories.income || []; item.categories.expense = item.categories.expense || []; }
    }
    return item;
}

// ────────────────────────── 1) Firebase Realtime Database ──────────────────────────
const firebaseBackend = {
    base() { return CONFIG.firebaseDatabaseUrl.replace(/\/+$/, '') + '/' + CONFIG.firebaseRoot.replace(/^\/+|\/+$/g, ''); },
    async request(path, options = {}) {
        let response;
        try { response = await fetch(`${this.base()}${path ? '/' + path : ''}.json`, { cache: 'no-store', ...options }); }
        catch (_) { throw friendlyNetworkError(); }
        if (response.status === 401 || response.status === 403) throw new Error('قاعدة البيانات ترفض الوصول. افتح Firebase Console → Realtime Database → Rules واجعل القراءة والكتابة true (راجع SETUP.md).');
        if (!response.ok) throw new Error(`تعذر الاتصال بقاعدة البيانات (${response.status}).`);
        const text = await response.text();
        return text ? JSON.parse(text) : null;
    },
    async ping() { await this.request('meta'); },
    async getAll(store) {
        const data = await this.request(store);
        if (!data || typeof data !== 'object') return [];
        return Object.entries(data).map(([key, item]) => normalizeItem(store, { ...item, id: item?.id || key })).filter(Boolean);
    },
    async commit(changes) {
        // تحديث متعدد المسارات في طلب واحد: كل التغييرات تُحفظ معًا أو لا تُحفظ.
        const body = {};
        for (const [store, items] of Object.entries(changes)) {
            if (!SHARED_STORES.includes(store)) continue;
            for (const item of items || []) body[`${store}/${encodeKey(item.id)}`] = item;
        }
        if (!Object.keys(body).length) return;
        const version = new Date().toISOString();
        body['meta/version'] = version;
        await this.request('', { method: 'PATCH', body: JSON.stringify(body) });
        lastKnownVersion = version;
    },
    async hasRemoteChanges() {
        const meta = await this.request('meta');
        const version = meta?.version || null;
        if (version === lastKnownVersion) return false;
        lastKnownVersion = version;
        return true;
    }
};
function encodeKey(id) { return String(id).replace(/[.$#[\]/]/g, '_'); }

// ────────────────────────── 2) واجهة tables/ (منصة Genspark) ──────────────────────────
const tablesBackend = {
    rowIds: Object.fromEntries(SHARED_STORES.map(store => [store, new Map()])),
    async request(path, options = {}) {
        let response;
        try { response = await fetch(new URL('tables/' + path, document.baseURI).href, { cache: 'no-store', ...options, headers: { 'Content-Type': 'application/json' } }); }
        catch (_) { throw friendlyNetworkError(); }
        if (!response.ok) { const error = new Error(`تعذر الاتصال بخادم البيانات (${response.status}).`); error.status = response.status; throw error; }
        if (response.status === 204) return null;
        const text = await response.text();
        return text ? JSON.parse(text) : null;
    },
    async ping() { await this.request('settings?page=1&limit=1'); },
    parse(store, row) {
        if (!row || row.deleted) return null;
        let item = row.payload;
        if (typeof item === 'string') { try { item = JSON.parse(item); } catch (_) { return null; } }
        if (!item || typeof item !== 'object') return null;
        if (!item.id) item.id = row.id;
        return normalizeItem(store, item);
    },
    async getAll(store) {
        const items = [], map = new Map(); let page = 1, total = Infinity;
        while (items.length < total && page <= 400) {
            const result = await this.request(`${store}?page=${page}&limit=500`);
            const rows = Array.isArray(result?.data) ? result.data : [];
            total = Number.isFinite(result?.total) ? result.total : rows.length;
            for (const row of rows) {
                const item = this.parse(store, row); if (!item) continue;
                const index = items.findIndex(x => x.id === item.id);
                if (index >= 0) { if ((item.updatedAt || item.at || '') >= (items[index].updatedAt || items[index].at || '')) items[index] = item; else continue; }
                else items.push(item);
                map.set(item.id, row.id);
            }
            if (rows.length < 500) break; page++;
        }
        this.rowIds[store] = map;
        return items;
    },
    toRow(store, item) {
        const kind = store === 'settings' ? 'settings' : store === 'history' ? (item.action || 'event') : (item.type || store);
        const title = store === 'debts' ? item.name : store === 'history' ? item.label : item.name || item.title;
        return { id: item.id, kind: String(kind || ''), title: String(title || '').slice(0, 200), date: String((store === 'history' ? item.at : item.date) || ''), payload: JSON.stringify(item), updated: item.updatedAt || item.at || new Date().toISOString() };
    },
    async save(store, item) {
        const row = this.toRow(store, item), existing = this.rowIds[store].get(item.id);
        const create = async () => { const created = await this.request(store, { method: 'POST', body: JSON.stringify(row) }); this.rowIds[store].set(item.id, created?.id || item.id); };
        if (!existing) return create();
        try { await this.request(`${store}/${encodeURIComponent(existing)}`, { method: 'PUT', body: JSON.stringify({ ...row, id: existing }) }); }
        catch (error) { if (error.status === 404) { this.rowIds[store].delete(item.id); return create(); } throw error; }
    },
    async commit(changes) {
        const stores = Object.keys(changes).filter(s => SHARED_STORES.includes(s)).sort((a, b) => (a === 'history') - (b === 'history'));
        for (const store of stores) { const items = changes[store] || []; for (let i = 0; i < items.length; i += 6) await Promise.all(items.slice(i, i + 6).map(item => this.save(store, item))); }
    },
    currentSignature() { const stamp = list => list.map(x => x.id + ':' + (x.updatedAt || x.at || '')).sort().join('|'); return [stamp(records), stamp(debts), history.length, JSON.stringify(settings)].join('#'); },
    async hasRemoteChanges() { const before = this.currentSignature(); await refreshData(); return this.currentSignature() !== before; }
};

// ────────────────────────── الواجهة الموحدة للتطبيق ──────────────────────────
function activeBackend() { return backend === 'firebase' ? firebaseBackend : tablesBackend; }

async function openDatabase() {
    if (CONFIG.firebaseDatabaseUrl && /^https:\/\//.test(CONFIG.firebaseDatabaseUrl)) {
        backend = 'firebase';
        const meta = await firebaseBackend.request('meta');
        lastKnownVersion = meta?.version || null;
    } else {
        backend = 'tables';
        try { await tablesBackend.ping(); }
        catch (error) {
            if (error.status === 404 || error.status === 405) throw new Error('هذه الاستضافة لا توفر خادم بيانات. ضع رابط Firebase Realtime Database في js/config.js (راجع SETUP.md) ثم أعد رفع الملفات.');
            throw error;
        }
    }
    return { shared: true, backend, close() {} };
}
async function getAll(store) { return activeBackend().getAll(store); }
async function commit(changes) { return activeBackend().commit(changes); }

function setStorageStatus(text) { const status = document.getElementById('storage-status'); if (status) status.textContent = text; }
function connectedLabel() { return backend === 'firebase' ? 'متصل بـ Firebase · البيانات مشتركة ومحدثة' : 'متصل · البيانات مشتركة ومحدثة'; }

// مزامنة حية: تتحقق دوريًا من تعديلات قادمة من أجهزة أخرى وتعرضها فورًا.
function startLiveSync() {
    setStorageStatus(connectedLabel());
    const tick = async () => {
        if (liveSyncBusy || !db || document.visibilityState !== 'visible' || document.querySelector('dialog[open]')) return;
        liveSyncBusy = true;
        try {
            const changed = await activeBackend().hasRemoteChanges();
            if (changed) { if (backend === 'firebase') await refreshData(); render(); toast('تم تحديث البيانات: هناك تعديلات جديدة من جهاز آخر.'); }
            setStorageStatus(connectedLabel());
        } catch (_) { setStorageStatus('انقطع الاتصال بالخادم؛ سنعيد المحاولة تلقائيًا'); }
        finally { liveSyncBusy = false; }
    };
    setInterval(tick, LIVE_SYNC_INTERVAL);
    window.addEventListener('online', tick);
}
