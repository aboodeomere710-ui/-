/**
 * Netlify Function: /api/ledger
 * قاعدة بيانات نظام «دفتر» المشتركة عبر Netlify Blobs — بنفس آلية متجر CampusKart.
 *
 * GET   /api/ledger?store=records|debts|history|settings  → كل عناصر المجموعة
 * GET   /api/ledger?store=meta                             → {version} لاكتشاف التعديلات الجديدة
 * PATCH /api/ledger   body: {changes:{records:[...],history:[...],...}}
 *        يدمج العناصر حسب id (إضافة أو استبدال) ويحدّث رقم النسخة.
 *
 * لا توجد كلمة مرور: كل من يملك الرابط يقرأ ويعدّل (حسب طلب صاحب المشروع).
 */

import { getStore } from "@netlify/blobs";

const STORE_NAME = "daftar-ledger";
const STORES = ["records", "history", "settings", "debts"];
const MAX_BODY = 5 * 1024 * 1024;        // 5MB للطلب الواحد
const MAX_ITEM = 400 * 1024;             // 400KB للعنصر الواحد (الصور تُخزَّن منفصلة)
const HISTORY_KEEP = 6000;               // أقصى عدد لأحداث سجل التعديلات
const ID_RE = /^[\w.\-:]{1,100}$/;

const HEADERS = {
  "Content-Type": "application/json; charset=utf-8",
  "Cache-Control": "no-store",
  "X-Content-Type-Options": "nosniff",
};

const json = (data, status = 200, extra = {}) =>
  new Response(JSON.stringify(data), { status, headers: { ...HEADERS, ...extra } });

const blobs = () => getStore({ name: STORE_NAME, consistency: "strong" });

async function readStore(store, name) {
  const data = await store.get(`${name}.json`, { type: "json" }).catch(() => null);
  return data && typeof data === "object" && !Array.isArray(data) ? data : {};
}

function pruneHistory(map) {
  const keys = Object.keys(map);
  if (keys.length <= HISTORY_KEEP) return map;
  const sorted = keys.sort((a, b) => String(map[a]?.at || "").localeCompare(String(map[b]?.at || "")));
  for (const key of sorted.slice(0, keys.length - HISTORY_KEEP)) delete map[key];
  return map;
}

export default async (req) => {
  const method = req.method.toUpperCase();
  const url = new URL(req.url);

  if (method === "OPTIONS") return new Response(null, { status: 204, headers: HEADERS });

  const store = blobs();

  /* ------------------------------ GET ------------------------------ */
  if (method === "GET") {
    const name = url.searchParams.get("store") || "";
    try {
      if (name === "meta") {
        const meta = await store.get("meta.json", { type: "json" }).catch(() => null);
        return json({ ok: true, version: meta?.version || null, updatedAt: meta?.updatedAt || null });
      }
      if (!STORES.includes(name)) return json({ error: "مجموعة غير معروفة" }, 400);
      const map = await readStore(store, name);
      return json({ ok: true, store: name, items: Object.values(map) });
    } catch (e) {
      console.error("GET error", e);
      return json({ error: "تعذّر قراءة البيانات" }, 500);
    }
  }

  /* --------------------------- PATCH / POST --------------------------- */
  if (method === "PATCH" || method === "POST" || method === "PUT") {
    const len = Number(req.headers.get("content-length") || 0);
    if (len > MAX_BODY) return json({ error: "حجم البيانات كبير جداً (الحدّ 5MB)" }, 413);

    let raw;
    try { raw = await req.text(); } catch { return json({ error: "تعذّر قراءة الطلب" }, 400); }
    if (raw.length > MAX_BODY) return json({ error: "حجم البيانات كبير جداً (الحدّ 5MB)" }, 413);

    let body;
    try { body = JSON.parse(raw); } catch { return json({ error: "JSON غير صالح" }, 400); }
    const changes = body?.changes;
    if (!changes || typeof changes !== "object") return json({ error: "بنية الطلب غير صالحة" }, 400);

    // تحقق مسبق من كل العناصر قبل أي كتابة
    for (const [name, items] of Object.entries(changes)) {
      if (!STORES.includes(name)) return json({ error: `مجموعة غير معروفة: ${name}` }, 400);
      if (!Array.isArray(items)) return json({ error: "العناصر يجب أن تكون قائمة" }, 400);
      for (const item of items) {
        if (!item || typeof item !== "object" || Array.isArray(item)) return json({ error: "عنصر غير صالح" }, 400);
        if (typeof item.id !== "string" || !ID_RE.test(item.id)) return json({ error: "معرّف عنصر غير صالح" }, 400);
        if (JSON.stringify(item).length > MAX_ITEM) return json({ error: "عنصر كبير جداً؛ الصور تُرفع منفصلة عبر /api/photo" }, 413);
      }
    }

    try {
      const counts = {};
      for (const [name, items] of Object.entries(changes)) {
        if (!items.length) continue;
        let map = await readStore(store, name);
        for (const item of items) map[item.id] = item;
        if (name === "history") map = pruneHistory(map);
        await store.setJSON(`${name}.json`, map);
        counts[name] = Object.keys(map).length;
      }
      const version = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      const updatedAt = new Date().toISOString();
      await store.setJSON("meta.json", { version, updatedAt });
      return json({ ok: true, version, updatedAt, counts });
    } catch (e) {
      console.error("PATCH error", e);
      return json({ error: "تعذّر حفظ البيانات" }, 500);
    }
  }

  return json({ error: "Method not allowed" }, 405);
};

export const config = { path: "/api/ledger" };
