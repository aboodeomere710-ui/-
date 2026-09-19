# دفتر — Daftar, lokaal boekhoudsysteem

## Doel en status
Een volledig Arabischtalige (RTL), responsieve frontend voor dagelijkse inkomsten en uitgaven in USD, TRY en SYP. Gebouwd met statische HTML, CSS en JavaScript; zonder backend, account of API-sleutels. De standaarddatabase is leeg: er zijn geen fictieve boekingen.

## تحديث الألوان وظهور التعديلات للزوار
- مرجع الألوان: https://github.com/maarefmarket/maarefmarket2، وتحديدًا `css/style.css` عند commit `cead415e1c8c9a8d857f0d739594c45fec49bcdc`.
- الأزرق الملكي `#2B5FB3`، الأزرق العميق `#1F4A8F`، البرتقالي `#F39C1F`؛ خلفيات فاتحة `#F4F7FC` وليليّة `#0E1523` مع بطاقات `#161F32`.
- التعديل محصور في الألوان والظلال اللونية. لم تتغير الخطوط أو المقاسات أو ترتيب الأقسام أو الحسابات أو طريقة التخزين. `css/brand-colors.css` طبقة ألوان منفصلة محملة بعد الأنماط الأصلية؛ ألوان الرسوم وشريط المتصفح محدثة أيضًا.
- لم يُستبدل نظام المحاسبة بكود المتجر، ولم تُستورد وظائف البيع أو خدمات Netlify أو نظام تسجيل الدخول الموجود في المستودع المرجعي.
- تغييرات ملفات الموقع تظهر لزوار الرابط المشترك **بعد نشر النسخة المحدثة على نفس الاستضافة** وإعادة تحميل الصفحة. لا يُنشر هذا المشروع تلقائيًا إلى مستودع GitHub المرجعي، ولم يُنفذ نشر حي من خلال هذه التعديلات.
- التبويبات المفتوحة قد تحتاج إعادة تحميل؛ ملفات HTML/ZIP المنزّلة لا تتحدث تلقائيًا.
- **الإعدادات التي يعدلها المستخدم في لوحة التحكم والبيانات المالية ما زالت محلية لكل متصفح وليست مشتركة بين الزوار.** المزامنة اللحظية للبيانات والصلاحيات الآمنة ليست ضمن تعديل الألوان وتحتاج مشروع تخزين/صلاحيات مستقلًا وموافقة واضحة.

## تنزيل ملفات المشروع كاملة — ZIP
- افتح `download.html` (أو رابط ZIP من لوحة التحكم). تُجهّز الصفحة الأرشيف تلقائيًا ثم تعرض رابطًا أصليًا باسم **تحميل الآن — daftar-project.zip**. اضغط الرابط بنفسك لحفظ الملف؛ لا تُستخدم نقرة برمجية متأخرة قد يحظرها المتصفح. يظهر خطأ واضح وزر إعادة تجهيز عند الفشل.
- رابط Blob الجاهز محلي للتبويب الحالي ولا يصلح مشاركته؛ شارك رابط download.html نفسه. الرابط يبقى صالحًا في الصفحة ولا يُلغى بعد دقيقة. عند تعذر التنزيل من معاينة مضمنة، استخدم رابط فتح صفحة التنزيل في تبويب مستقل.
- `download.html#html` يجهز ملف HTML المفرد بدل ZIP، وبنفس أسلوب رابط الحفظ الصريح.
- ينتج `daftar-project.zip` مضغوطًا باستخدام DEFLATE داخل المتصفح، دون أي خادم لإنشاء الملفات.
- يحتوي الأرشيف على مجلد `daftar-project/` وفيه جميع ملفات المصدر: صفحات HTML، ملفات CSS وJavaScript، README، الاختبارات، ومكتبة الضغط المحلية وترخيصها.
- يشمل أيضًا ملف `daftar-system.html` المستقل المُجهز من نفس المصادر وملف تعليمات عربي `START-HERE.txt`.
- لا يتضمن الأرشيف قاعدة IndexedDB أو بيانات المستخدم أو المرفقات المالية، ولا بيانات Git الداخلية. تُنقل البيانات عبر النسخة الاحتياطية JSON بشكل منفصل.
- افتح صفحة التنزيل من رابط HTTP/HTTPS أو خادم محلي لتجميع الأرشيف؛ تجميع ملفات المصدر عبر `file://` قد يُمنع في المتصفح، والنسخة المستقلة لا تحتفظ بملفات المشروع المفصّلة.
- يتم تحميل `fflate 0.8.2` من `js/vendor/fflate.min.js` عند طلب ZIP فقط؛ لا حاجة إلى CDN وقت الاستخدام. الترخيص MIT مرفق في `js/vendor/fflate-LICENSE.txt`.
- قائمة ملفات المصدر موجودة في `DaftarPackage.projectFiles` ويجب تحديثها عند إضافة ملفات للمشروع. يتضمن الأرشيف الحالي 21 ملف مصدر وثلاثة ملفات مُولّدة (24 ملفًا)، بما فيها GITHUB-PAGES.md و.nojekyll ونسخة HTML مستقلة.

## الرفع إلى GitHub Pages والتحقق من رابط التحميل
- فك ضغط الأرشيف ثم ارفع **محتويات** مجلد daftar-project إلى جذر مستودع جديد، وليس ZIP نفسه. يجب أن يكون index.html في الجذر، بجانبه css/ وjs/ بكل محتوياتهما.
- من Settings → Pages اختر Deploy from a branch ثم main و/ (root)، واضغط Save وانتظر نجاح النشر. الخطوات مكتوبة بالتفصيل في GITHUB-PAGES.md داخل الأرشيف.
- لم يتم رفع ملفات أو تعديل إعدادات GitHub نيابة عن المستخدم. لا يتغير الرابط الحي قبل النشر، ولا تتحول البيانات المحلية إلى مشتركة.
- اجتازت صفحة التحميل الفعلية **25 اختبارًا** في tests/download.html: تجهيز رابط أصلي، قراءة بايتات ZIP من الرابط وفكها، وجود جميع ملفات المصدر ودليل GitHub و.nojekyll، صحة المسارات النسبية للملفات على GitHub Pages، بقاء الرابط صالحًا بعد النقر، ورابط HTML المفرد.
- تمت مراجعة صفحة التنزيل الجاهزة على الكمبيوتر والموبايل بصريًا. الاختبارات تحققت من الملف والرابط ومحتوياتهما، ولا يمكنها تأكيد الحفظ الفعلي على قرص جهاز الزائر.

## Voltooide functies
- Dashboard met onafhankelijke inkomsten, uitgaven en nettobalans per valuta voor de gekozen maand.
- Dagelijkse boekingen met bedrag, valuta, datum, optionele naam/omschrijving, categorie en notities.
- Inkomstenformulier met drie afzonderlijke optionele bedragen (USD, TRY en SYP). Minstens één positief bedrag is nodig; lege velden of nul worden overgeslagen. Alle ingevulde valuta’s worden atomair opgeslagen als gekoppelde regels met één `batchId`.
- Bij bewerken van een inkomstenregel opent de volledige bijbehorende invoer. Bedragen kunnen worden aangepast, toegevoegd of na bevestiging verwijderd.
- Nachtmodus via de maan-/zonknop in de kop. Voorkeur wordt lokaal onthouden; zonder voorkeur wordt aanvankelijk de systeeminstelling gevolgd.
- Numerieke lokale apparaatdatum en -tijd naast ‘lokale opslag’: `DD/MM/YYYY · HH:mm:ss`, elke seconde bijgewerkt.
- Automatische maandberekening; optelling in gehele honderdsten om gebruikelijke afrondingsfouten te beperken.
- Inkomsten- en uitgavenregister met zoeken en filters op maand, valuta en categorie.
- Standaarduitgaven: مصروف عبد الرحمن, مصروف رضا, مصاريف الندوة en أجار عامل.
- Bewerkingen van omschrijving, bedrag, valuta, datum, categorie en notities na het toevoegen.
- Foto's bij uitgaven, miniaturen en openen op volledige grootte. JPG, PNG en WebP; maximaal 5 nieuwe foto's per bewerking, maximaal 4 MiB per foto. Bestaande foto's blijven behouden.
- Zesmaandelijkse inkomsten-/uitgavengrafiek en maandelijkse uitgavenverdeling per categorie, met eigen valutakeuze.
- Detailscherm en wijzigingsgeschiedenis met bewaarde vorige versies. Het opslaan van een boeking en de bijbehorende historie gebeurt in één IndexedDB-transactie.
- Verwijderen met bevestiging: het prullenbakje verwijdert één valutabedrag; het detailscherm en het bewerkformulier bieden ook verwijderen van de volledige inkomsteninvoer. Uitgaven kunnen afzonderlijk worden verwijderd.
- Verwijderen is herstelbaar (`deletedAt`): bedragen verdwijnen uit actieve registers, totalen, grafieken en CSV, maar blijven inclusief foto’s aanwezig in de database, historie en volledige back-up. Herstelknoppen staan bij ‘المحذوفات القابلة للاستعادة’ in het wijzigingslogboek.
- Historie, categorieën en bestaande bijlagen hebben geen definitieve verwijderknoppen. Een herstelactie wordt geblokkeerd als dezelfde invoer al een actief bedrag voor die valuta bevat, om dubbele bedragen te voorkomen.
- Beheerpaneel: naam, dashboardomschrijving, valutaweergaven, categorieën toevoegen/hernoemen en back-upbeheer.
- Complete JSON-back-up en gevalideerde, transactionele herstel-/mergefunctie, inclusief foto's en historie.
- Import overschrijft gelijke boekings-ID's pas na bevestiging; de huidige versie wordt eerst in dezelfde transactie in historie bewaard. Overige boekingen worden niet verwijderd. Categorieën worden samengevoegd. Geïmporteerde instellingen krijgen voorrang.
- CSV-export van de gefilterde maandrapportage, met UTF-8-BOM en bescherming tegen gangbare spreadsheetformule-injectie. CSV bevat geen foto's, verwijderde bedragen of volledige historie. Alleen gevalideerde kalenderdatums worden geëxporteerd als een veilige, gegenereerde spreadsheet-tekstformule (`="2026-09-03"`), met CSV-escaping en kolomkop `التاريخ (YYYY-MM-DD)`. Hiermee blijft Excel de datum tonen als jaar-maand-dag, zonder locale-interpretatie of tijdzoneconversie. Andere tekstvelden behouden bescherming tegen formule-injectie. Een generieke CSV-lezer zonder spreadsheetformules kan de tekstformule letterlijk tonen; CSV kent zelf geen afdwingbare celtypen.
- Browseraanvraag voor persistent storage, met expliciete melding dat de browser deze kan weigeren.
- Responsieve desktop-/mobiele interface, toetsenbordbedienbare native dialogen en Arabische labels.

## تحديث: قسم الديون
- قسم **الديون** في القائمة الرئيسية (`index.html#debts`) مع اسم المدين، تاريخ الدين، ملاحظات اختيارية، ومبالغ مستقلة للدولار والليرة التركية والليرة السورية.
- اسم المدين مطلوب. يمكن ملء عملة واحدة أو أكثر، بحد أقصى منزلتين عشريتين ومبلغ 9,999,999,999 لكل عملة. باقي العملات تُحفظ صفرًا. لا يُحفظ دين بلا أي مبلغ موجب.
- إضافة الدين، تعديل الاسم/التاريخ/الملاحظات/المبالغ، وحذفه بعد التأكيد. يمكن حذف مبلغ إحدى العملات بإفراغه أثناء التعديل ما دامت عملة أخرى تحمل مبلغًا موجبًا.
- الحذف قابل للاستعادة من **سجل التعديلات → الديون المحذوفة القابلة للاستعادة**؛ تُحفظ النسخ السابقة عند التعديل والحذف، في نفس معاملة الحفظ.
- إجمالي الديون لكل عملة يشمل كل الديون النشطة في جميع الفترات، بغض النظر عن البحث بالاسم أو الملاحظات. الجدول قابل للتمرير أفقيًا عند الحاجة على الهاتف.
- الديون سجل مستقل: لا تؤثر على إيرادات/مصروفات الشهر، ولا تدخل في ملف CSV الخاص بالحركات المالية، ولا يشملها زر تصفير الحسابات.
- لا توجد حاليًا أقساط أو تسويات سداد تلقائية أو احتساب فوائد. لتعديل المبلغ المستحق استخدم تعديل الدين؛ لا يولّد ذلك قيدًا نقديًا تلقائيًا.
- البيانات محفوظة محليًا في IndexedDB. تم رفع إصدار قاعدة البيانات من 1 إلى 2 بإضافة مخزن `debts` فقط، دون حذف أو إعادة إنشاء المخازن السابقة. أغلق علامات التبويب القديمة إذا طلب المتصفح ذلك أثناء الترقية.
- النسخة الاحتياطية الجديدة (إصدار 3) تشمل الديون وسجلها، مع استمرار قبول نسخ الإصدارين 1 و2. استيراد نسخة قديمة بدون ديون يحافظ على الديون الحالية. عند تعارض معرفات الديون، يُطلب تأكيد الاستيراد وتُحفظ النسخة الحالية في السجل قبل الاستبدال.
- تنزيل نسخة جديدة من ملف النظام HTML يضمّن وظائف الديون كذلك، دون تضمين البيانات الشخصية في ملف البرنامج.

## تحديث: التصفير وتنزيل ملف النظام
- من **لوحة التحكم → تصفير الدخل والخرج والحسابات**: اختر الدخل فقط، المصروفات فقط، أو الاثنين، ثم شهرًا محددًا (الافتراضي: الشهر المعروض) أو كل الفترات.
- يظهر عدد المبالغ وإجمالي كل عملة قبل التنفيذ. يتطلب التصفير كتابة «تصفير» ثم تأكيدًا نهائيًا. لا يتم أي تصفير تلقائيًا عند فتح الصفحة أو تنزيل البرنامج.
- التصفير يستبعد السجلات المحددة من الأرصدة والجداول والتقارير، مع الاحتفاظ بالقيم الأصلية والصور وسجل التعديلات. لا يغيّر التصنيفات أو إعدادات مساحة العمل.
- تصفير الدخل وحده لا يصفر المصروفات، والعكس صحيح؛ لتصفير صافي الحسابات أيضًا اختر الدخل والمصروفات معًا. تصفير شهر واحد لا يمس بقية الأشهر.
- لكل عملية تصفير `resetId`؛ من **سجل التعديلات → مجموعات التصفير القابلة للاستعادة** يمكن استعادة المجموعة دفعة واحدة. يظل الاسترجاع الفردي متاحًا ويزيل ارتباط المبلغ بالمجموعة. يمنع الاسترجاع المبالغ المكررة لنفس العملة في نفس الإدخال.
- عند تغير السجلات منذ عرض ملخص التصفير، يُطلب مراجعة الملخص والتأكيد من جديد. حفظ علامات الحذف والتاريخ يتم في معاملة IndexedDB واحدة.
- من **لوحة التحكم → تنزيل ملف النظام HTML** أو صفحة **`download.html`** يمكن تنزيل `daftar-system.html`.
- ملف البرنامج يجمع HTML وCSS وJavaScript من ملفات المشروع الأصلية داخل المتصفح، وليس من الواجهة المعروضة. لا يحتوي على العمليات أو الصور أو الإعدادات الشخصية ولا يستبدل النسخة الاحتياطية.
- النسخة المستقلة لا تعتمد على خطوط أو مكتبات خارجية. لتشغيلها افتح ملف HTML في متصفح حديث يدعم IndexedDB. قيود ملفات `file://` تختلف بين المتصفحات وخصوصًا الهواتف؛ عند تعذر التخزين استخدم الاستضافة أو خادمًا محليًا. نقل الملف أو تغيير المتصفح قد يغيّر مساحة التخزين المتاحة؛ انقل بياناتك بملف JSON منفصل.
- داخل النسخة المستقلة لا يظهر زر إعادة تجميع البرنامج؛ انسخ ملف HTML الأصلي. بقية وظائف المحاسبة والنسخ الاحتياطي والتصفير تظل متاحة.

## Toegangspaden
| Pad | Functie |
| --- | --- |
| `/` of `/index.html` | Dashboard |
| `/index.html#dashboard` | Overzicht |
| `/index.html#income` | Inkomsten |
| `/index.html#expenses` | Uitgaven |
| `/index.html#debts` | سجل الديون: الإضافة والتعديل والحذف والإجماليات لكل عملة |
| `/index.html#reports` | Maandrapportage en CSV |
| `/index.html#history` | Wijzigingsgeschiedenis |
| `/index.html#settings` | Lokaal beheerpaneel |
| `/download.html` | صفحة تنزيل ملف النظام المستقل وتعليمات نقل البيانات |
| `/tests/accounting.html` | Geïsoleerde functionele tests |

Er zijn geen queryparameters nodig. De maand en overige filters zijn tijdelijke paginastaat; ze worden niet in de URL opgeslagen. Bij het opslaan van een boeking wordt de maand van die boeking actief, zodat de opgeslagen regel zichtbaar is.

## Gegevensmodellen en opslag
**IndexedDB:** database `daftar-local-accounting`, versie 2 (niet-destructieve upgrade van versie 1). Alle stores hebben keyPath `id`.

### `records`
- `id`: unieke UUID
- `type`: `income` of `expense`
- `title`: optionele omschrijving, maximaal 120 tekens; leeg wordt in de interface weergegeven als ‘مدخل بدون اسم’ of ‘مصروف بدون اسم’
- `amount`: positief getal met maximaal twee decimalen; maximaal 9.999.999.999 per boeking
- `currency`: `USD`, `TRY` of `SYP`
- `date`: lokale kalenderdatum `YYYY-MM-DD`, jaren 1900–9998
- `category`: stabiele categorie-ID
- `notes`: maximaal 2000 tekens
- `photos`: array `{name, data, type}`; gebruikersbijlagen worden lokaal als data-URL opgeslagen en opgenomen in de JSON-back-up, niet in projectbestanden
- `createdAt`, `updatedAt`: ISO-tijdstempels
- `batchId`: optionele gedeelde UUID voor inkomstenbedragen die samen zijn ingevoerd. Oude éénvalutaregels blijven zonder migratie geldig en krijgen bij bewerken een groep.
- `deletedAt`: optioneel ISO-tijdstip van herstelbare verwijdering. Afwezig betekent actief; herstel verwijdert deze markering.
- `resetId`: optionele UUID die herstelbaar verwijderde regels van één reset groepeert. Herstel verwijdert deze markering eveneens. Back-upversie 2 bewaart deze extra metadata; geen IndexedDB-schemamigratie nodig.

### `debts`
- `id`: UUID، و`type`: القيمة الثابتة `debt`.
- `name`: اسم المدين، مطلوب حتى 120 حرفًا.
- `amounts`: كائن `{USD: number, TRY: number, SYP: number}` بأرقام غير سالبة ومبلغ موجب واحد على الأقل.
- `date`: تاريخ `YYYY-MM-DD`، و`notes`: ملاحظات حتى 2000 حرف.
- `createdAt`, `updatedAt`: توقيت ISO؛ `deletedAt`: علامة حذف اختيارية قابلة للاستعادة.
- `history.before` و`history.after` يدعمان الآن لقطات الديون بالإضافة إلى العمليات النقدية؛ مخزن الديون مستقل عن `records`.

### `history`
`id`, `action`, `at`, `label`, optioneel `recordId`, `before` en `after`. Acties omvatten ook `delete` en `restore`. Vorige volledige boekingsversies, inclusief bijlagen, blijven beschikbaar in de database en back-up. De geschiedenisinterface toont een leesbare samenvatting van de vorige versie.

### `settings`
Eén rij met `id: main`: `name`, `description`, drie `currencies` met `code/name/symbol/className`, `categories.income`, `categories.expense` en `lastBackup`. Valutacodes en boekingstypen zijn vast; namen, symbolen en categorieën zijn aanpasbaar.

### Back-upformaat
`{format: "daftar-backup", version: 3, exportedAt, settings, records, debts, history}`. De huidige importer accepteert versies 1, 2 en 3. Versie 3 vereist een gevalideerde debts-array; oudere bestanden zonder debts behouden alle bestaande schulden. Download de bijgewerkte applicatie voor versie-3-back-ups. Versie 2 ondersteunt lege namen, gekoppelde valuta’s en verwijder-/herstelstatus. Gebruik de bijgewerkte applicatie om versie 2-bestanden te herstellen. Import neemt de verwijderstatus uit het bestand over bij gelijke ID’s; hierdoor kan een oudere back-up een later verwijderd bedrag reactiveren, na de algemene importbevestiging en met bewaring van de huidige versie in historie. De importlimiet is 100 MiB. Herhaald importeren kan historie dupliceren met nieuwe ID's om bestaande historie niet te overschrijven. Back-ups zijn niet versleuteld; behandel ze als vertrouwelijke financiële documenten. De laatst vermelde back-updatum betekent dat de download is gestart, niet dat de browser kan controleren waar of of het bestand uiteindelijk is bewaard.

## Belangrijke bewaarbeperkingen
- Gegevens bestaan uitsluitend in de huidige browser, het browserprofiel, apparaat en de site-origin. Er is geen serveropslag of automatische synchronisatie.
- Gewoon herladen/sluiten van de pagina wist de opgeslagen database niet. Browserdata wissen, privémodus, opslagquota, browserbeleid of verlies van het apparaat kunnen wel dataverlies veroorzaken.
- Er is **geen garantie dat nooit iets verloren kan gaan**. Maak regelmatig een volledige JSON-back-up op een tweede veilige locatie en test herstel.
- Een nieuw domein, andere preview-origin of publicatie toont niet automatisch de gegevens van de eerdere origin. Exporteer op de oude locatie en importeer op de nieuwe.
- Foto's in historische versies verhogen het opslaggebruik. Bij een mislukte transactie meldt de app een fout; de app meldt dan niet dat de boeking is opgeslagen.
- Het systeem is bedoeld voor één lokale beheerder. Gelijktijdige bewerkingen in meerdere tabbladen hebben geen geavanceerde conflictresolutie.
- Het beheerpaneel is **geen beveiligde beheeromgeving**. Iedereen met toegang tot dezelfde browser kan de gegevens bekijken en bewerken. Historie is bedoeld voor herstel/inzicht, niet als juridisch onveranderbaar auditlog.

## Niet geïmplementeerd
- Cloudopslag, serverback-ups, gebruikersaccounts, beveiligde login, rollen of meerdere gelijktijdige gebruikers.
- Valutaconversie, koersen, samengevoegde totalen van verschillende valuta's of overdracht van openingsbalans tussen maanden.
- Dubbel boekhouden, btw-/belastingaangiften, facturatie of wettelijke boekhoudcertificering.
- Automatische back-ups naar een map of cloudopslag, versleutelde back-ups.
- Een visuele websitebouwer: ontwerp, navigatie en programmacode zijn niet vanuit het beheerpaneel te herschrijven.
- Geen PWA/service worker of offline herstartgarantie voor de gehoste URL. De downloadbare zelfstandige HTML bevat wel alle code en stijlen en werkt zonder netwerk waar de browser lokale HTML en IndexedDB toestaat. Opslag bij file:// wordt niet in elke browser ondersteund.

## Bestanden en afhankelijkheden
- `index.html`: shell, zijbalk, formulier- en detaildialogen.
- `css/style.css`: oorspronkelijke responsieve huisstijl.
- `css/enhancements.css`: nachtmodus, responsieve kop met klok, drievalutaformulier en herstelbare verwijdering.
- `js/theme.js`: vroege themavoorkeur, omschakeling en numerieke klok. Gebruikt uitsluitend de UI-sleutel `daftar-theme` in localStorage; financiële gegevens blijven in IndexedDB.
- `js/app.js`: routes, IndexedDB, administratie, grafieken, beheer, imports/exports.
- `js/debts.js`, `css/debts.css`: الديون والإجماليات والبحث والإضافة والتعديل والحذف والاستعادة والتحقق.
- `js/maintenance.js`: resetselectie, bevestigingen, groepsherstel en beheerkaarten.
- `js/package.js`: bundeling/download van zelfstandige HTML én volledige gecomprimeerde project-ZIP, zonder privégegevens.
- `js/vendor/fflate.min.js`, `js/vendor/fflate-LICENSE.txt`: lokale ZIP/DEFLATE-bibliotheek en MIT-licentie.
- `css/brand-colors.css`: طبقة الألوان فقط، مستوحاة من المستودع المرجعي؛ مضمنة في HTML المستقل وZIP.
- `css/maintenance.css`: resetdialogen, nieuwe beheerkaarten en downloadpagina.
- `download.html`, `js/download-page.js`: downloadinstructies, downloadactie en foutmeldingen.
- `tests/accounting.html` en `tests/accounting.js`: geautomatiseerde browserintegratietests.
- Google Fonts: IBM Plex Sans Arabic, met lokale sans-serif fallback. Geen externe afbeeldingen; fflate wordt alleen voor ZIP-export lokaal geladen. Het boekhouden en de zelfstandige HTML vereisen geen externe bibliotheken.

## Testresultaten
96 functionele controles geslaagd in de browser; de volledige einduitslag is visueel bevestigd op de testpagina (ALL TESTS PASSED: 96). De extra kleur-/ZIP-controles toetsen de referentiekleuren, ongewijzigde elementafmetingen/posities, kleuren in de zelfstandige HTML, echte ZIP-compressie en decompressie, alle 20 archiefbestanden, licentie en Arabische instructies. De lichtgekleurde dashboardweergave is gecontroleerd op desktop en mobiel, en de ZIP-downloadpagina op mobiel. Nieuwe screenshots van de donkere kleurvariant konden door tijdelijke browsercapaciteit niet worden afgerond; de donkere paneelkleur en themawissel zijn wel functioneel getest. Tijdelijke visuele testselecties zijn verwijderd. تشمل الاختبارات الجديدة: حقول الدين المطلوبة، العملات الثلاث، التعديل وسجل النسخ، البحث، إلغاء الحذف والحذف والاستعادة، نسخ الديون وتحققها واستيرادها، حفظ الديون عند استيراد نسخة قديمة وعند تصفير الحسابات، تشغيل الديون داخل الملف المستقل دون شبكة، وترقية قاعدة بيانات إصدار 1 مع بقاء القيد المالي القديم وقيمته. De extra controles dekken bevestigingswoord, annuleren, reset per type/per maand/alle perioden, behoud van instellingen/records/foto’s, groepsherstel, lege perioden, geldige back-ups na reset, bundeling zonder privégegevens, en werking van het daadwerkelijke HTML-pakket bij geblokkeerde fetch-aanroepen. De pakkettest gebruikt een geïsoleerd iframe met het gegenereerde HTML; dit is geen garantie voor alle file://-implementaties of opslag op schijf. Eerdere controles omvatten: bestaande administratie, foto's, instellingen en back-ups, plus drie optionele valutavelden, lege naam, weigeren van volledig lege invoer, groepsbewerking, verwijderen van één bedrag of hele invoer, annulering, herstel, behoud van foto's, versie-1-compatibiliteit, versie-2-back-up/import met verwijderstatus, CSV-datumtekst en uitsluiting van verwijderde regels, nachtmodus/terugschakelen/voorkeur en numerieke klok.

De testpagina laadt de werkelijke app in een iframe en leidt de databaseverbinding om naar een unieke tijdelijke testdatabase. Er worden geen gebruikersboekingen gewijzigd; de testdatabase wordt na afloop verwijderd. De tests bootsen de download aanroep na om de geëxporteerde inhoud te controleren; daadwerkelijke opslag op schijf hangt van de browser af.

Desktop (1280px) en mobiel (390px) visueel gecontroleerd op de echte `index.html`, zowel de dag-/nachtweergave van het dashboard als het nieuwe drievalutaformulier in nachtmodus: geen overlappende onderdelen, zichtbare broncode of horizontale pagina-overflow. Na verwijdering van de tijdelijke visuele testselectie zijn alle 66 functionele controles opnieuw geslaagd. De reset-/downloadkaarten in de instellingen, de resetdialoog en download.html zijn op desktop én mobiel visueel gecontroleerd. Tijdelijke instellingen voor het automatisch openen van beheer of de resetdialoog zijn verwijderd; de definitieve app respecteert weer de normale hashroute. De definitieve mobiele startpagina is opnieuw gecontroleerd: het dashboard opent normaal, zonder automatisch geopend invoerformulier of geforceerde nachtmodus. De standaardpagina heeft geen consolefouten.

مراجعة قسم الديون بصريًا: تم التحقق من صفحة السجل على الكمبيوتر (1280px) والموبايل (390px)، ومن نموذج إضافة الدين بالوضع الليلي على الموبايل. إعدادات المعاينة المؤقتة أُزيلت؛ لا يفتح قسم الديون أو النموذج تلقائيًا ولا يُفرض الوضع الليلي.

## Openbare URL's en API's
- Productie-URL: nog niet gepubliceerd / niet bekend; رابط الموقع الذي يشاركه المستخدم لم يُقدَّم بعد.
- GitHub-kleurreferentie (niet automatisch bijgewerkt door dit project): https://github.com/maarefmarket/maarefmarket2
- API-endpoints: geen; er worden geen financiële gegevens naar een API gestuurd.
- Geen Table API, Cloudflare D1, R2 of andere opslagdiensten gebruikt.

## Aanbevolen vervolgstappen
1. Open de preview, voeg een echte boeking toe en sla direct een eerste JSON-back-up op.
2. Gebruik steeds dezelfde browser en origin; maak dagelijks of na belangrijke wijzigingen een back-up.
3. Publiceer desgewenst via de Publish-tab. Zet bestaande lokale gegevens over met export/import.
4. Overweeg later een PWA voor offline herstarten, versleutelde back-ups en paginering voor zeer grote administraties.
5. Voor gedeeld gebruik of gegarandeerde serverback-ups is een afzonderlijke beveiligde backendoplossing nodig.
