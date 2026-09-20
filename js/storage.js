'use strict';
// ════════════════════════════════════════════════════════════════════
//  طبقة التخزين المشتركة — بنفس آلية متجر CampusKart (Netlify Functions + Blobs)
// ════════════════════════════════════════════════════════════════════
//  بدل IndexedDB (المحلي لكل متصفح) تُحفظ كل السجلات على خادم الموقع نفسه،
//  فيرى كل من يملك الرابط نفس البيانات وأي تعديل يظهر للجميع.
//
//  لا يحتاج أي إعداد: ارفع الملفات إلى GitHub → Netlify ينشرها مع الدوال تلقائيًا.
//
//  المصدر يُكتشف تلقائيًا:
//   1) /api/ledger  — Netlify Function (netlify/functions/ledger.js)      ← الإنتاج
//   2) tables/      — واجهة منصة Genspark (للمعاينة أثناء التطوير فقط)
//
//  يوفر للتطبيق نفس الدوال القديمة: openDatabase / getAll / commit
//  إضافة إلى storePhotos (رفع الصور) و startLiveSync (تحديث تلقائي من الأجهزة الأخرى).

const SHARED_STORES = ['records', 'history', 'settings', 'debts'];
const LIVE_SYNC_INTERVAL = 15000;
let backend = null;          // 'netlify' | 'tables'
let liveSyncBusy = false;
let lastKnownVersion = null;

function friendlyNetworkError() { return new Error('لا يوجد اتصال بالخادم. تحقق من الإنترنت وأعد المحاولة.'); }
function absolute(path) { return new URL(path, document.baseURI).href; }

// يعيد العنصر إلى شكله الكامل بعد القراءة من الخادم.
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
    }
    return item;
}

async function readJson(response) { const text = await response.text(); return text ? JSON.parse(text) : null; }

// ────────────────────────── 1) Netlify Function /api/ledger ──────────────────────────
const netlifyBackend = {
    async request(path, options = {}) {
        let response;
        try { response = await fetch(absolute(path), { cache: 'no-store', ...options, headers: { 'Content-Type': 'application/json', ...(options.headers || {}) } }); }
        catch (_) { throw friendlyNetworkError(); }
        const body = await readJson(response).catch(() => null);
        if (!response.ok) { const error = new Error(body?.error || `تعذر الاتصال بخادم البيانات (${response.status}).`); error.status = response.status; throw error; }
        return body;
    },
    async ping() { const meta = await this.request('api/ledger?store=meta'); if (!meta?.ok) throw Object.assign(new Error('استجابة غير متوقعة'), { status: 404 }); return meta; },
    async getAll(store) {
        const result = await this.request(`api/ledger?store=${store}`);
        return (Array.isArray(result?.items) ? result.items : []).map(item => normalizeItem(store, item)).filter(Boolean);
    },
    async commit(changes) {
        const payload = {};
        for (const [store, items] of Object.entries(changes)) if (SHARED_STORES.includes(store) && items?.length) payload[store] = items;
        if (!Object.keys(payload).length) return;
        const result = await this.request('api/ledger', { method: 'PATCH', body: JSON.stringify({ changes: payload }) });
        lastKnownVersion = result?.version || lastKnownVersion;
    },
    async hasRemoteChanges() {
        const meta = await this.request('api/ledger?store=meta');
        const version = meta?.version || null;
        if (version === lastKnownVersion) return false;
        lastKnownVersion = version; return true;
    },
    async storePhotos(photos) {
        const stored = [];
        for (const photo of photos) {
            if (photo.url) { stored.push(photo); continue; }
            const result = await this.request('api/photo', { method: 'POST', body: JSON.stringify({ name: photo.name, type: photo.type, data: photo.data }) });
            if (!result?.url) throw new Error('تعذر رفع الصورة ' + photo.name);
            stored.push({ name: photo.name, type: photo.type, url: result.url });
        }
        return stored;
    }
};

// ────────────────────────── 2) واجهة tables/ (معاينة Genspark) ──────────────────────────
const tablesBackend = {
    rowIds: Object.fromEntries(SHARED_STORES.map(store => [store, new Map()])),
    async request(path, options = {}) {
        let response;
        try { response = await fetch(absolute('tables/' + path), { cache: 'no-store', ...options, headers: { 'Content-Type': 'application/json' } }); }
        catch (_) { throw friendlyNetworkError(); }
        if (!response.ok) { const error = new Error(`تعذر الاتصال بخادم البيانات (${response.status}).`); error.status = response.status; throw error; }
        if (response.status === 204) return null;
        return readJson(response);
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
    async hasRemoteChanges() { const before = this.currentSignature(); await refreshData(); return this.currentSignature() !== before; },
    async storePhotos(photos) { return photos; } // تبقى base64 داخل السجل في وضع المعاينة
};

// ────────────────────────── الواجهة الموحدة للتطبيق ──────────────────────────
function activeBackend() { return backend === 'netlify' ? netlifyBackend : tablesBackend; }

async function openDatabase() {
    try {
        const meta = await netlifyBackend.ping();
        backend = 'netlify'; lastKnownVersion = meta.version || null;
    } catch (error) {
        if (error.status && error.status !== 404 && error.status !== 405) throw error; // الدالة موجودة لكنها فشلت
        try { await tablesBackend.ping(); backend = 'tables'; }
        catch (inner) {
            if (inner.status === 404 || inner.status === 405 || !error.status) throw new Error('لم يُعثر على خادم البيانات. تأكد أنك رفعت مجلد netlify وملفَي netlify.toml وpackage.json إلى GitHub، وأن الموقع منشور على Netlify (راجع SETUP.md).');
            throw inner;
        }
    }
    return { shared: true, backend, close() {} };
}
async function getAll(store) { return activeBackend().getAll(store); }
async function commit(changes) { return activeBackend().commit(changes); }
async function storePhotos(photos) { return activeBackend().storePhotos(photos); }
function photoSrc(photo) { return photo?.url ? absolute(photo.url.replace(/^\//, '')) : (photo?.data || ''); }

function setStorageStatus(text) { const status = document.getElementById('storage-status'); if (status) status.textContent = text; }
function connectedLabel() { return 'متصل · البيانات مشتركة ومحدثة لكل من يملك الرابط'; }

// مزامنة حية: تتحقق دوريًا من تعديلات قادمة من أجهزة أخرى وتعرضها فورًا.
function startLiveSync() {
    setStorageStatus(connectedLabel());
    const tick = async () => {
        if (liveSyncBusy || !db || document.visibilityState !== 'visible' || document.querySelector('dialog[open]')) return;
        liveSyncBusy = true;
        try {
            const changed = await activeBackend().hasRemoteChanges();
            if (changed) { if (backend === 'netlify') await refreshData(); render(); toast('تم تحديث البيانات: هناك تعديلات جديدة من جهاز آخر.'); }
            setStorageStatus(connectedLabel());
        } catch (_) { setStorageStatus('انقطع الاتصال بالخادم؛ سنعيد المحاولة تلقائيًا'); }
        finally { liveSyncBusy = false; }
    };
    setInterval(tick, LIVE_SYNC_INTERVAL);
    window.addEventListener('online', tick);
}
