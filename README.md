# دفتر — نظام المحاسبة المشترك (V 2.0)

نظام محاسبة عربي (RTL) بثلاث عملات مستقلة (USD / TRY / SYP) لإدارة المدخلات والمصروفات والديون، مع تقارير شهرية وسجل تعديلات كامل قابل للاستعادة.

**يعمل بنفس الآلية التقنية لمتجر CampusKart:** Netlify Functions + Netlify Blobs.
البيانات محفوظة على خادم Netlify نفسه، لذا **أي تعديل من أي جهاز يظهر لكل من يملك الرابط** — بدون أي إعداد أو متغيرات بيئة.

## 🚀 النشر (لا يحتاج أي إعداد)
1. ارفع كل الملفات إلى GitHub (بما فيها مجلدات `css` `js` `netlify` وملفَي `netlify.toml` `package.json`).
2. اربط المستودع بـ Netlify — ينشر تلقائيًا.
3. افتح الرابط. التفاصيل في **[SETUP.md](SETUP.md)**.

## الميزات المكتملة
- نظرة عامة: بطاقات الأرصدة لكل عملة، رسم حركة الأموال لـ 6 أشهر، توزيع المصروفات، أحدث العمليات.
- المدخلات (بعدة عملات في إدخال واحد) والمصروفات (مع إرفاق حتى 5 صور تُرفع للخادم).
- الديون: سجل مستقل لكل مدين بالعملات الثلاث، مع تعديل/حذف/استعادة.
- التقارير الشهرية مع بحث وتصفية وتصدير CSV.
- سجل التعديلات: كل إضافة/تعديل/حذف محفوظ، مع استعادة المحذوفات ومجموعات التصفير.
- لوحة التحكم: اسم مساحة العمل، أسماء العملات، التصنيفات، تصفير الحسابات، النسخ الاحتياطي (تصدير/استيراد JSON).
- **تخزين مشترك على الخادم** + **مزامنة حية** كل 15 ثانية وعند العودة للتبويب أو عودة الاتصال.
- الوضع الليلي، تصميم متجاوب للجوال.
- صفحة `download.html` لتنزيل المشروع كاملًا كـ ZIP منظم جاهز للرفع.

## المداخل (URIs)
| المسار | الوصف |
|---|---|
| `index.html` | التطبيق. مسارات داخلية: `#dashboard` `#income` `#expenses` `#debts` `#reports` `#history` `#settings` |
| `download.html` | تنزيل ملفات المشروع (ZIP / HTML مستقل) |
| `GET /api/ledger?store=records\|debts\|history\|settings` | كل عناصر المجموعة |
| `GET /api/ledger?store=meta` | `{version}` لاكتشاف التعديلات الجديدة |
| `PATCH /api/ledger` | body `{changes:{records:[…],history:[…],…}}` — دمج حسب `id` |
| `POST /api/photo` | body `{name,type,data(base64)}` → `{url}` |
| `GET /api/photo/<id>` | الصورة نفسها |

## البنية
```
index.html, download.html, netlify.toml, package.json, README.md, SETUP.md
css/   style.css, enhancements.css, maintenance.css, debts.css, brand-colors.css
js/    storage.js (طبقة التخزين المشتركة), theme.js, package.js, maintenance.js,
       debts.js, app.js, download-page.js, vendor/fflate.min.js
netlify/functions/
       ledger.js   /api/ledger — السجلات في Netlify Blobs (store: daftar-ledger)
       photo.js    /api/photo  — الصور في Netlify Blobs (store: daftar-photos)
```

## نموذج البيانات
في Netlify Blobs أربعة ملفات JSON (`records.json` `debts.json` `history.json` `settings.json`) كل منها خريطة `id → عنصر`، إضافة إلى `meta.json` يحمل رقم النسخة. العناصر بنفس بنية النسخة المحلية الأصلية (متوافقة مع النسخ الاحتياطية القديمة). الصور: `{name,type,url:"/api/photo/…"}` للجديدة، أو `{name,type,data:base64}` للقديمة المستوردة.

`js/storage.js` يكتشف المصدر تلقائيًا: `/api/ledger` على Netlify، أو `tables/` أثناء المعاينة على منصة Genspark.

الحذف في التطبيق منطقي (`deletedAt`) وقابل للاستعادة.

## ملاحظات
- **الأمان:** لا كلمة مرور؛ كل من يملك الرابط يستطيع التعديل (حسب المطلوب). الموقع `noindex`. شارك الرابط مع من تثق به فقط.
- **نقل البيانات القديمة:** صدّر JSON من النسخة القديمة واستورده من لوحة التحكم في الجديدة.

## غير منفّذ بعد
- تسجيل دخول / صلاحيات (يمكن إضافة `ADMIN_PASSWORD` كما في CampusKart لاحقًا).
- مزامنة لحظية (WebSocket) — حاليًا دورية كل 15 ثانية.
- قفل تفاؤلي عند التعديل المتزامن لنفس العنصر من جهازين.

## خطوات مقترحة
1. الرفع والنشر حسب SETUP.md.
2. استيراد النسخة الاحتياطية القديمة.
3. لاحقًا: إضافة كلمة مرور للوحة كما في المتجر.
