/**
 * Netlify Function: /api/photo
 * تخزين صور الفواتير والمستندات في Netlify Blobs (منفصلة عن السجلات لتبقى القاعدة سريعة).
 *
 * POST /api/photo        body: {name, type, data:"data:image/...;base64,..."}  → {ok, url:"/api/photo/<id>"}
 * GET  /api/photo/<id>   → الصورة نفسها (كاش طويل لأنها لا تتغير)
 */

import { getStore } from "@netlify/blobs";

const STORE_NAME = "daftar-photos";
const MAX_BYTES = 4 * 1024 * 1024;   // 4MB للصورة
const TYPES = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" };
const MAGIC = {
  "image/jpeg": [0xff, 0xd8, 0xff],
  "image/png": [0x89, 0x50, 0x4e, 0x47],
  "image/webp": [0x52, 0x49, 0x46, 0x46],
};

const json = (data, status = 200) =>
  new Response(JSON.stringify(data), { status, headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" } });

const uid = () => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;

export default async (req) => {
  const method = req.method.toUpperCase();
  const url = new URL(req.url);
  const store = getStore({ name: STORE_NAME, consistency: "strong" });

  /* ------------------------------ GET ------------------------------ */
  if (method === "GET") {
    const key = url.pathname.split("/").pop();
    if (!/^[\w\-]{6,60}\.(jpg|png|webp)$/.test(key)) return json({ error: "غير موجود" }, 404);
    const rec = await store.getWithMetadata(key, { type: "arrayBuffer" }).catch(() => null);
    if (!rec?.data) return json({ error: "غير موجود" }, 404);
    return new Response(rec.data, {
      status: 200,
      headers: {
        "Content-Type": String(rec.metadata?.type || "application/octet-stream"),
        "Cache-Control": "public, max-age=31536000, immutable",
        "X-Content-Type-Options": "nosniff",
        "Content-Disposition": "inline",
      },
    });
  }

  /* ------------------------------ POST ------------------------------ */
  if (method === "POST") {
    let body;
    try { body = JSON.parse(await req.text()); } catch { return json({ error: "JSON غير صالح" }, 400); }
    const match = /^data:(image\/(?:jpeg|png|webp));base64,([A-Za-z0-9+/=\s]+)$/.exec(String(body?.data || ""));
    if (!match) return json({ error: "الصورة يجب أن تكون JPG أو PNG أو WebP" }, 400);
    const type = match[1];
    if (match[2].length * 0.75 > MAX_BYTES) return json({ error: "حجم الصورة يتجاوز 4MB" }, 413);

    let bytes;
    try { bytes = Uint8Array.from(atob(match[2].replace(/\s/g, "")), (c) => c.charCodeAt(0)); }
    catch { return json({ error: "تعذّر قراءة الصورة" }, 400); }
    if (bytes.length > MAX_BYTES) return json({ error: "حجم الصورة يتجاوز 4MB" }, 413);
    if (!MAGIC[type].every((b, i) => bytes[i] === b)) return json({ error: "محتوى الملف لا يطابق نوع الصورة" }, 400);

    const key = `${uid()}.${TYPES[type]}`;
    const name = String(body?.name || key).slice(0, 120);
    try {
      await store.set(key, bytes, { metadata: { type, name } });
      return json({ ok: true, url: `/api/photo/${key}`, name, type, bytes: bytes.length });
    } catch (e) {
      console.error("photo error", e);
      return json({ error: "تعذّر حفظ الصورة" }, 500);
    }
  }

  return json({ error: "Method not allowed" }, 405);
};

export const config = { path: ["/api/photo", "/api/photo/*"] };
