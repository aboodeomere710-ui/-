'use strict';
const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
const paths = {
 trash:'<path d="M3 6h18M9 6V3h6v3M5 6l1 15h12l1-15M10 10v7m4-7v7"/>',
 dashboard:'<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>',
 income:'<path d="M7 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-2M21 3l-10 10m0-7v7h7"/>',
 expense:'<path d="M7 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-2M11 13 21 3m-7 0h7v7"/>',
 chart:'<path d="M4 3v18h17M9 16v-5m5 5V6m5 10V9"/>',
 history:'<path d="M3 11a9 9 0 1 1 2 7M3 4v7h7M12 7v5l3 2"/>',
 settings:'<path d="m9 3-1 3-3 1-2 4 2 2v4l4 3 3-1 3 1 4-3v-4l2-2-2-4-3-1-1-3z"/><circle cx="12" cy="12" r="3"/>',
 shield:'<path d="M12 3 3 6v6c0 5 9 9 9 9s9-4 9-9V6zM8 12l3 3 5-6"/>',
 download:'<path d="M12 3v12m-4-4 4 4 4-4M4 15v5h16v-5"/>',
 upload:'<path d="M12 16V4m-4 4 4-4 4 4M4 15v5h16v-5"/>',
 calendar:'<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M7 3v4m10-4v4M3 10h18m-13 4h2m4 0h2m-8 3h2"/>',
 plus:'<path d="M12 5v14M5 12h14"/>',minus:'<path d="M5 12h14"/>',
 'chevron-left':'<path d="m14 6-6 6 6 6"/>','chevron-right':'<path d="m10 6 6 6-6 6"/>',
 'arrow-left':'<path d="M20 12H4m6-6-6 6 6 6"/>',
 x:'<path d="m6 6 12 12M6 18 18 6"/>',check:'<path d="m5 12 4 4L19 6"/>',
 image:'<rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="8" cy="8" r="1.5"/><path d="m21 15-6-6L3 21"/>',
 menu:'<path d="M4 6h16M4 12h16M4 18h16"/>',
 edit:'<path d="m15 4 5 5M4 20l5-1L21 7a2 2 0 0 0-4-4L5 15z"/>',
 eye:'<path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/>',
 ledger:'<rect x="5" y="3" width="15" height="18" rx="2"/><path d="M3 7h4m-4 5h4m-4 5h4m4-10h5m-5 5h5m-5 5h3"/>',
 info:'<circle cx="12" cy="12" r="9"/><path d="M12 11v6m0-10v.1"/>'
};
function icon(name){return `<svg viewBox="0 0 24 24" aria-hidden="true">${paths[name] || paths.ledger}</svg>`;}
function paintIcons(){ $$('[data-icon]').forEach(el => {el.innerHTML = icon(el.dataset.icon);el.removeAttribute('data-icon');}); }
function esc(value){return String(value ?? '').replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));}
const defaultSettings = {id:'main',name:'دفتر',description:'كل ما تحتاج معرفته عن حركة أموالك، في لمحة واحدة.',currencies:[{code:'USD',name:'الدولار الأمريكي',symbol:'$',className:'usd'},{code:'TRY',name:'الليرة التركية',symbol:'₺',className:'try'},{code:'SYP',name:'الليرة السورية',symbol:'ل.س',className:'syp'}],categories:{income:[{id:'daily-income',name:'إيرادات يومية'},{id:'other-income',name:'مدخلات أخرى'}],expense:[{id:'abdulrahman',name:'مصروف عبد الرحمن'},{id:'reda',name:'مصروف رضا'},{id:'seminar',name:'مصاريف الندوة'},{id:'worker',name:'أجار عامل'}]},lastBackup:null};
let db, records=[], debts=[], history=[], settings=structuredClone(defaultSettings), currentRoute='dashboard', currentMonth=localDate().slice(0,7), chartCurrency='USD', listSearch='', listCurrency='', listCategory='', pendingPhotos=[], toastTimer;
const palette=['#2B5FB3','#F39C1F','#6A9BE8','#C67C0E','#8AB2F0','#EAC084'];
function localDate(date=new Date()){return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;}
function uid(){return crypto.randomUUID ? crypto.randomUUID() : 'r-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2);}
function money(n){return new Intl.NumberFormat('en-US',{minimumFractionDigits:2,maximumFractionDigits:2}).format(n);}
function currency(code){return settings.currencies.find(c=>c.code===code)||defaultSettings.currencies[0];}
function categoryName(type,id){return settings.categories[type]?.find(c=>c.id===id)?.name || 'تصنيف سابق';}
function monthLabel(month){return new Intl.DateTimeFormat('ar',{month:'long',year:'numeric'}).format(new Date(month+'-15T12:00:00'));}
function dateLabel(date){return new Intl.DateTimeFormat('ar',{day:'numeric',month:'short',year:'numeric'}).format(new Date(date+'T12:00:00'));}
function timeLabel(date){return new Intl.DateTimeFormat('ar',{day:'numeric',month:'short',hour:'numeric',minute:'2-digit'}).format(new Date(date));}
function toast(message){clearTimeout(toastTimer);$('#toast').textContent=message;$('#toast').classList.add('visible');toastTimer=setTimeout(()=>$('#toast').classList.remove('visible'),4500);}
// openDatabase / getAll / commit مُعرَّفة في js/storage.js (تخزين مشترك عبر الخادم بدل IndexedDB).
async function refreshData(){const [r,h,s,d]=await Promise.all([getAll('records'),getAll('history'),getAll('settings'),getAll('debts')]);records=r;history=h;debts=d;settings=s.find(v=>v.id==='main')||structuredClone(defaultSettings);$('#brand-name').textContent=settings.name;document.title=`${settings.name} | نظام المحاسبة المشترك`;}
function monthlyRecords(month=currentMonth){return records.filter(r=>!r.deletedAt&&r.date.startsWith(month));}
function totals(rows,code){const total={income:0,expense:0};rows.filter(r=>!r.deletedAt&&r.currency===code).forEach(r=>total[r.type]+=Math.round(r.amount*100));return {income:total.income/100,expense:total.expense/100,balance:(total.income-total.expense)/100};}
function currencyOptions(selected,all=false){return (all?'<option value="">كل العملات</option>':'')+settings.currencies.map(c=>`<option value="${c.code}" ${c.code===selected?'selected':''}>${esc(c.name)} · ${c.code}</option>`).join('');}
function currencyCards(rows=monthlyRecords()){return `<section class="currency-cards" aria-label="ملخص العملات">${settings.currencies.map(c=>{const t=totals(rows,c.code);return `<article class="currency-card"><div class="currency-heading"><span class="currency-mark ${c.className}">${esc(c.symbol)}</span><div><h2>${esc(c.name)}</h2><div class="currency-code">${c.code}</div></div><span class="currency-tag">هذا الشهر</span></div><div class="balance-label">صافي الرصيد الشهري</div><div class="balance-amount" ${t.balance<0?'style="color:var(--paint-negative)"':''}>${money(t.balance)}<small>${c.code}</small></div><div class="currency-stats"><div><span class="stat-label">${icon('income')}<span>المدخلات</span></span><strong class="stat-number positive">${money(t.income)}</strong></div><div><span class="stat-label">${icon('expense')}<span>المصروفات</span></span><strong class="stat-number negative">${money(t.expense)}</strong></div></div></article>`;}).join('')}</section>`;}
function chartHTML(){const months=[];const end=new Date(currentMonth+'-15T12:00:00');for(let i=5;i>=0;i--){const d=new Date(end.getFullYear(),end.getMonth()-i,15);const key=localDate(d).slice(0,7);months.push({key,label:new Intl.DateTimeFormat('ar',{month:'short'}).format(d),...totals(monthlyRecords(key),chartCurrency)});}const max=Math.max(100,...months.flatMap(m=>[m.income,m.expense]));return `<article class="panel"><header class="panel-header"><div><h2 class="panel-title">حركة الأموال</h2><p class="panel-subtitle">مقارنة المدخلات والمصروفات خلال 6 أشهر</p></div><select id="chart-currency" class="mini-select" aria-label="عملة الرسوم البيانية">${currencyOptions(chartCurrency)}</select></header><div class="chart-legend"><span><i class="legend-square"></i>المدخلات</span><span><i class="legend-square expense"></i>المصروفات</span></div><div class="bar-chart" role="img" aria-label="رسم حركة الأموال، ${chartCurrency}"><div class="chart-grid">${[1,.75,.5,.25,0].map(v=>`<div><span>${new Intl.NumberFormat('en',{notation:'compact',maximumFractionDigits:1}).format(max*v)}</span></div>`).join('')}</div><div class="chart-bars">${months.map(m=>`<div class="bar-group" title="${esc(monthLabel(m.key))}: المدخلات ${money(m.income)}، المصروفات ${money(m.expense)} ${chartCurrency}"><div class="bar" style="height:calc((100% - 25px) * ${m.income/max})"></div><div class="bar expense" style="height:calc((100% - 25px) * ${m.expense/max})"></div><span>${esc(m.label)}</span></div>`).join('')}</div></div><p class="chart-caption">${months.every(m=>!m.income&&!m.expense)?'ستظهر حركة أموالك هنا عند إضافة أول عملية':'تُحسب القيم تلقائيًا من العمليات المسجلة'} · ${chartCurrency}</p></article>`;}
function donutHTML(){const rows=monthlyRecords().filter(r=>r.currency===chartCurrency && r.type==='expense');const cats=settings.categories.expense.map((c,i)=>({...c,value:rows.filter(r=>r.category===c.id).reduce((s,r)=>s+Math.round(r.amount*100),0),color:palette[i%palette.length]}));const total=cats.reduce((s,c)=>s+c.value,0);let start=0;const segments=cats.map(c=>{const end=start+(total?c.value/total*100:0);const out=`${c.color} ${start}% ${end}%`;start=end;return out;});return `<article class="panel"><header class="panel-header"><div><h2 class="panel-title">توزيع المصروفات</h2><p class="panel-subtitle">حسب التصنيف · ${chartCurrency}</p></div><span class="muted">${icon('chart')}</span></header><div class="donut-layout"><div class="donut" style="${total?'background:conic-gradient('+segments.join(',')+')':''}" aria-label="إجمالي المصروفات ${money(total/100)} ${chartCurrency}"><div class="donut-center"><strong style="${total>999999?'font-size:16px':''}">${new Intl.NumberFormat('en-US',{maximumFractionDigits:2,notation:total>99999999?'compact':'standard'}).format(total/100)}</strong><small>إجمالي المصروفات</small></div></div><div class="donut-legend">${cats.map(c=>`<li><i class="legend-dot" style="background:${c.color}"></i><span>${esc(c.name)}</span><b>${total?Math.round(c.value/total*100):0}%</b></li>`).join('')}</div></div><p class="chart-caption">${rows.length} عملية مصروف خلال ${esc(monthLabel(currentMonth))}</p></article>`;}
function displayTitle(r){return r.title || (r.type==='income'?'مدخل بدون اسم':'مصروف بدون اسم');}
function entryGroup(record,includeDeleted=false){return records.filter(r=>(includeDeleted||!r.deletedAt)&&(record.type==='income'&&record.batchId ? r.type==='income'&&r.batchId===record.batchId : r.id===record.id));}
function sortedRows(rows){return [...rows].sort((a,b)=>b.date.localeCompare(a.date)||b.updatedAt.localeCompare(a.updatedAt));}
function tableHTML(rows,kind='all',recent=false){const sorted=sortedRows(rows), shown=recent?sorted.slice(0,5):sorted;return `<div class="table-scroll"><table><thead><tr><th>البيان / التصنيف</th><th>التاريخ</th><th>النوع</th><th>المبلغ</th><th>العملة</th><th>المرفقات</th><th>الإجراءات</th></tr></thead><tbody>${shown.map(r=>`<tr><td class="record-title">${esc(displayTitle(r))}<span class="record-sub">${esc(categoryName(r.type,r.category))}</span></td><td class="muted">${dateLabel(r.date)}</td><td><span class="type-chip ${r.type}">${r.type==='income'?'مدخل':'مصروف'}</span></td><td><span class="money ${r.type==='income'?'positive':'negative'}">${r.type==='income'?'+':'−'} ${money(r.amount)}</span></td><td class="muted">${r.currency}</td><td class="muted">${r.photos?.length?`${icon('image')} ${r.photos.length}`:'—'}</td><td><div class="table-actions"><button class="icon-button" data-detail="${esc(r.id)}" aria-label="عرض ${esc(displayTitle(r))}">${icon('eye')}</button><button class="icon-button" data-edit="${esc(r.id)}" aria-label="تعديل ${esc(displayTitle(r))}">${icon('edit')}</button><button class="icon-button danger" data-delete="${esc(r.id)}" aria-label="حذف مبلغ ${esc(displayTitle(r))} ${r.currency}" title="حذف هذا المبلغ فقط">${icon('trash')}</button></div></td></tr>`).join('')}</tbody></table></div>${!shown.length?`<div class="empty-state"><div class="empty-icon">${icon('ledger')}</div><h3>${listSearch||listCurrency||listCategory?'لا توجد عمليات مطابقة':'بداية مرتّبة لحساباتك'}</h3><p>${listSearch||listCurrency||listCategory?'جرّب تغيير البحث أو عوامل التصفية.':'لا توجد عمليات في هذا الشهر. أضف أول عملية وسنتولى الحسابات.'}</p><button class="button secondary" data-add="${kind==='expense'?'expense':'income'}">${icon('plus')} ${kind==='expense'?'إضافة أول مصروف':'إضافة أول مدخل'}</button></div>`:''}<footer class="table-footer"><span>${recent?`عرض ${shown.length} من ${rows.length} عملية`:`${rows.length} عملية مسجلة`}</span><span>كل عملة مستقلة · دون تحويل تلقائي</span></footer>`;}
function dashboardHTML(){return `${currencyCards()}<section class="analytics-grid">${chartHTML()}${donutHTML()}</section><section class="panel"><header class="panel-header"><div><h2 class="panel-title">أحدث العمليات</h2><p class="panel-subtitle">آخر الحركات المالية خلال الشهر المحدد</p></div><a class="text-link" href="#reports">عرض جميع العمليات ${icon('arrow-left')}</a></header>${tableHTML(monthlyRecords(),'all',true)}</section><aside class="info-banner"><span>${icon('shield')}</span><p><strong>دفترك محفوظ على الخادم ومشترك.</strong> أي تعديل تقوم به يظهر لكل من يملك الرابط، من أي جهاز. احتفظ بنسخة احتياطية بانتظام كإجراء إضافي.</p><button class="backup-trigger">نسخ احتياطي ${icon('arrow-left')}</button></aside>`;}
function filteredRows(kind){return monthlyRecords().filter(r=>(!kind||r.type===kind)&&(!listCurrency||r.currency===listCurrency)&&(!listCategory||r.category===listCategory)&&(!listSearch||(r.title+' '+r.notes+' '+categoryName(r.type,r.category)).toLocaleLowerCase().includes(listSearch.toLocaleLowerCase())));}
function ledgerHTML(kind){const categoryOptions=kind?settings.categories[kind]:[...settings.categories.income,...settings.categories.expense];return `${currencyCards()}<section class="panel"><header class="panel-header"><div><h2 class="panel-title">${kind==='income'?'سجل المدخلات':kind==='expense'?'سجل المصروفات':'جميع العمليات الشهرية'}</h2><p class="panel-subtitle">${esc(monthLabel(currentMonth))} · عرض وتعديل كل عملية</p></div>${!kind?`<button class="button secondary" id="export-csv">${icon('download')} تصدير CSV</button>`:''}</header><div class="search-tools"><input type="search" class="search-input" id="record-search" placeholder="ابحث بالبيان أو الملاحظات…" value="${esc(listSearch)}" aria-label="البحث في العمليات"><select id="list-currency" aria-label="تصفية بالعملة">${currencyOptions(listCurrency,true)}</select><select id="list-category" aria-label="تصفية بالتصنيف"><option value="">كل التصنيفات</option>${categoryOptions.map(c=>`<option value="${esc(c.id)}" ${listCategory===c.id?'selected':''}>${esc(c.name)}</option>`).join('')}</select></div><div id="ledger-table">${tableHTML(filteredRows(kind),kind)}</div>${!kind?'<div class="report-summary">صافي الرصيد = المدخلات − المصروفات للشهر المحدد فقط. لا تُجمع العملات معًا ولا تُحوّل بينها. ملف CSV يشمل العمليات الظاهرة بعد التصفية، ويثبت التاريخ كنص بصيغة YYYY-MM-DD في Excel لتجنب تبديل اليوم والشهر. المحذوفات والصور غير مشمولة؛ استخدم النسخة الاحتياطية لحفظ كل البيانات.</div>':''}</section>`;}
function historyHTML(){return `<section class="panel"><header class="panel-header"><div><h2 class="panel-title">ذاكرة دفتر حساباتك</h2><p class="panel-subtitle">كل إضافة وتعديل محفوظان. يمكنك مراجعة القيم السابقة دون حذف أي سجل.</p></div><span class="currency-tag">${history.length} تغيير</span></header>${resetHistoryHTML()}${deletedHTML()}${deletedDebtsHTML()}${history.length?`<div class="history-list">${[...history].sort((a,b)=>b.at.localeCompare(a.at)).map(h=>`<article class="history-item"><span>${icon(h.action==='create'?'plus':h.action==='backup'?'download':'history')}</span><div><h3>${esc(h.label)}</h3><p>${h.recordId?'رقم العملية: '+esc(h.recordId.slice(0,8)):'إدارة مساحة العمل'}</p>${h.before?`<details><summary>عرض البيانات قبل التعديل</summary><pre>${esc(historySummary(h.before))}</pre></details>`:''}</div><time datetime="${esc(h.at)}">${timeLabel(h.at)}</time></article>`).join('')}</div>`:'<div class="empty-state"><div class="empty-icon">'+icon('history')+'</div><h3>كل تعديل له أثر محفوظ</h3><p>ستظهر هنا العمليات والتغييرات عند البدء باستخدام دفتر.</p></div>'}</section>`;}
function historySummary(obj){if(obj.type==='debt')return debtHistorySummary(obj);if(obj.type)return `${displayTitle(obj)}\n${dateLabel(obj.date)} · ${obj.type==='income'?'مدخل':'مصروف'}\n${money(obj.amount)} ${obj.currency}\n${categoryName(obj.type,obj.category)}\n${obj.notes||'لا توجد ملاحظات'}\n${obj.photos?.length||0} مرفق (محفوظ في النسخة الاحتياطية)`;return JSON.stringify(obj,null,2);}
function settingsHTML(){return `<div class="settings-grid">${maintenanceHTML()}<section class="panel settings-panel"><h2>هوية مساحة العمل</h2><p>عدّل اسم دفتر الحسابات والوصف الذي يظهر في الصفحة الرئيسية.</p><form id="identity-form"><label>اسم دفتر الحسابات<input name="name" maxlength="35" required value="${esc(settings.name)}"></label><label>وصف الصفحة الرئيسية<input name="description" maxlength="160" value="${esc(settings.description)}"></label><button class="button primary" type="submit">${icon('check')} حفظ التغييرات</button></form></section><section class="panel settings-panel"><h2>العملات</h2><p>ثلاثة أرصدة مستقلة. يمكنك تعديل أسماء العملات ورموز عرضها دون تغيير العمليات.</p><form id="currencies-form">${settings.currencies.map(c=>`<label>${c.code}<div class="inline-form"><input name="${c.code}-name" aria-label="اسم ${c.code}" maxlength="40" required value="${esc(c.name)}"><input name="${c.code}-symbol" aria-label="رمز ${c.code}" maxlength="5" style="max-width:65px" required value="${esc(c.symbol)}"></div></label>`).join('')}<button class="button primary" type="submit">حفظ العملات</button></form></section><section class="panel settings-panel"><h2>إدارة التصنيفات</h2><p>أضف تصنيفًا جديدًا أو اضغط على تصنيف لتعديل اسمه. تتحدث جميع العمليات المرتبطة به تلقائيًا.</p>${['income','expense'].map(type=>`<h3>${type==='income'?'تصنيفات المدخلات':'تصنيفات المصروفات'}</h3><div class="category-list">${settings.categories[type].map(c=>`<button class="category-chip" data-category-edit="${esc(c.id)}" data-type="${type}">${esc(c.name)} ${icon('edit')}</button>`).join('')}</div><form class="inline-form category-form" data-type="${type}"><input name="categoryName" aria-label="تصنيف جديد ${type==='income'?'للمدخلات':'للمصروفات'}" maxlength="50" required placeholder="اسم التصنيف الجديد"><button class="button secondary" type="submit">${icon('plus')} إضافة</button></form>`).join('')}</section><section class="panel settings-panel"><h2>النسخ الاحتياطي والاستعادة</h2><p>نسخة كاملة تشمل العمليات والصور والتصنيفات والإعدادات وسجل التعديلات، في ملف JSON واحد.</p><div class="backup-notice">البيانات محفوظة على الخادم ومشتركة بين كل من يملك الرابط؛ مسح بيانات المتصفح لا يؤثر عليها. مع ذلك، احتفظ بنسخة احتياطية دورية على قرص خارجي أو مكان آمن.</div><p>آخر نسخة تم تنزيلها: <strong>${settings.lastBackup?timeLabel(settings.lastBackup):'لم تُنشأ نسخة بعد'}</strong></p><div style="display:flex;gap:8px;flex-wrap:wrap"><button class="button primary backup-trigger">${icon('download')} تصدير نسخة كاملة</button><button class="button secondary" id="import-backup">${icon('upload')} استيراد نسخة</button></div><p style="margin-top:15px">الاستيراد يدمج السجلات ولا يحذف أي عملية. في حال تطابق رقم العملية، تُحفظ النسخة الحالية في سجل التعديلات قبل استبدالها.</p></section><section class="panel settings-panel settings-full"><h2>حول النظام المشترك</h2><p style="margin:0">يمكن تعديل جميع بيانات العمليات: البيان، المبلغ، العملة، التاريخ، التصنيف، الملاحظات، وإضافة المرفقات. يمكن حذف مبلغ منفرد أو عملية إدخال كاملة بعد التأكيد؛ تبقى نسخة في سجل التعديلات للاستعادة، ولا تُحسب المحذوفات في الأرصدة والتقارير. البيانات محفوظة على الخادم ومشتركة: كل تعديل يظهر لكل من يملك الرابط من أي جهاز، وتتحدث الصفحات المفتوحة تلقائيًا كل بضع ثوانٍ. لوحة التحكم غير محمية بكلمة مرور؛ لا تشارك الرابط إلا مع من تثق به. تعديل تصميم البرنامج أو إضافة خصائص جديدة يحتاج إلى تعديل ملفات الموقع.</p></section></div>`;}
function render(){const routes={dashboard:['نظرة عامة','نظرة عامة على حساباتك',settings.description],income:['المدخلات','المدخلات اليومية','سجّل إيراداتك، وتابع مجموع مدخلاتك بكل عملة.'],expenses:['المصروفات','المصروفات اليومية','كل مصروف في مكانه. تابع المصاريف وأرفق فواتيرك.'],debts:['الديون','الديون والمبالغ المستحقة','تابع اسم المدين وقيمة كل دين بالعملات الثلاث، مع إمكانية التعديل والحذف.'],reports:['التقارير الشهرية','الصورة الكاملة لشهرك','راجع كل العمليات، والأرصدة، والتفاصيل المالية.'],history:['سجل التعديلات','لا يضيع أي تعديل','تاريخ واضح لكل إضافة أو تغيير في دفتر حساباتك.'],settings:['لوحة التحكم','مساحة عمل على طريقتك','إدارة الأسماء والتصنيفات والعملات والنسخ الاحتياطية.']};const meta=routes[currentRoute]||routes.dashboard;$('#breadcrumb-title').textContent=meta[0];$('#page-title').textContent=meta[1];$('#page-description').textContent=meta[2];$('#filter-toolbar').hidden=['settings','history','debts'].includes(currentRoute);$('#filter-toolbar').style.display=['settings','history','debts'].includes(currentRoute)?'none':'';$$('[data-route]').forEach(a=>{a.classList.toggle('active',a.dataset.route===currentRoute);if(a.dataset.route===currentRoute)a.setAttribute('aria-current','page');else a.removeAttribute('aria-current');});$('#add-debt').hidden=currentRoute!=='debts';$('#add-income').hidden=currentRoute==='debts';$('#add-expense').hidden=currentRoute==='debts';$('#view-content').innerHTML=currentRoute==='debts'?debtsHTML():currentRoute==='dashboard'?dashboardHTML():currentRoute==='settings'?settingsHTML():currentRoute==='history'?historyHTML():ledgerHTML(currentRoute==='income'?'income':currentRoute==='expenses'?'expense':null);paintIcons();}
function route(){const requested=location.hash.slice(1);currentRoute=['income','expenses','debts','reports','settings','history'].includes(requested)?requested:'dashboard';listSearch='';listCurrency='';listCategory='';debtSearch='';render();closeMenu();}
function closeMenu(){$('#sidebar').classList.remove('open');$('#sidebar-overlay').classList.remove('visible');$('#mobile-menu').setAttribute('aria-expanded','false');}
function fillCategories(type,selected){$('#entry-category').innerHTML=settings.categories[type].map(c=>`<option value="${esc(c.id)}" ${selected===c.id?'selected':''}>${esc(c.name)}</option>`).join('');}
function openEntry(type,id){
    if(!db)return toast('التخزين غير متاح. أعد تحميل الصفحة.');
    const record=id?records.find(r=>r.id===id&&!r.deletedAt):null;
    if(id&&!record)return toast('العملية غير متاحة؛ راجع المحذوفات في سجل التعديلات.');
    type=record?.type||type;
    const income=type==='income', group=record?entryGroup(record):[];
    $('#entry-form').reset();
    $('#entry-id').value=record?.id||'';
    $('#entry-type').value=type;
    $('#entry-title').value=record?.title||'';
    $('#entry-amount').value=record?.amount||'';
    $('#entry-amount').required=!income;
    $('#entry-amount').disabled=income;
    $('#entry-currency').disabled=income;
    $('#single-amount-label').hidden=income;
    $('#single-currency-label').hidden=income;
    $('#income-amounts').hidden=!income;
    $('#income-currency-fields').innerHTML=income?settings.currencies.map(c=>{
        const saved=group.find(r=>r.currency===c.code);
        return `<label>${esc(c.name)} · ${c.code}<input id="income-amount-${c.code}" data-income-currency="${c.code}" type="number" inputmode="decimal" min="0" max="9999999999" step="0.01" placeholder="0.00" dir="ltr" value="${saved?saved.amount:''}"></label>`;
    }).join(''):'';
    $('#income-edit-hint').hidden=!record||!income;
    $('#entry-date').value=record?.date||(currentMonth===localDate().slice(0,7)?localDate():currentMonth+'-01');
    $('#entry-notes').value=record?.notes||'';
    $('#entry-currency').innerHTML=currencyOptions(record?.currency||'USD');
    fillCategories(type,record?.category);
    $('#entry-dialog-title').textContent=record?(income?'تعديل المدخل بكل العملات':'تعديل المصروف'):(income?'إضافة مدخل بثلاث عملات':'إضافة مصروف جديد');
    $('#photo-section').hidden=income;
    $('#delete-entry').hidden=!record;
    $('#delete-entry').textContent=income?'حذف عملية الإدخال كاملة':'حذف المصروف';
    pendingPhotos=[];
    $('#form-error').textContent='';
    $('#photo-preview').innerHTML=(record?.photos||[]).map(p=>`<img src="${esc(photoSrc(p))}" alt="${esc(p.name)}">`).join('');
    $('#entry-dialog').showModal();
}
function detail(id){const r=records.find(x=>x.id===id);if(!r)return;$('#detail-content').innerHTML=`<dl class="detail-grid"><div><dt>البيان</dt><dd>${esc(displayTitle(r))}</dd></div><div><dt>المبلغ</dt><dd class="money">${money(r.amount)} ${r.currency}</dd></div><div><dt>التاريخ</dt><dd>${dateLabel(r.date)}</dd></div><div><dt>النوع والتصنيف</dt><dd>${r.type==='income'?'مدخل':'مصروف'} · ${esc(categoryName(r.type,r.category))}</dd></div><div class="full-width"><dt>ملاحظات</dt><dd class="notes-display">${esc(r.notes)||'لا توجد ملاحظات'}</dd></div></dl><p class="muted" style="font-size:10px">أُضيفت ${timeLabel(r.createdAt)} · آخر تعديل ${timeLabel(r.updatedAt)}</p><div class="attachment-gallery">${(r.photos||[]).map((p,i)=>`<a href="#" data-photo-record="${esc(r.id)}" data-photo-index="${i}" aria-label="فتح ${esc(p.name)}"><img src="${esc(photoSrc(p))}" alt="${esc(p.name)}" loading="lazy"></a>`).join('')}</div><button class="button primary" style="margin-top:22px" data-edit="${esc(r.id)}">${icon('edit')} تعديل العملية</button><div class="detail-actions"><button class="button danger" data-delete="${esc(r.id)}">${icon('trash')} حذف هذا المبلغ</button>${r.type==='income'&&r.batchId?`<button class="button danger" data-delete-group="${esc(r.id)}">حذف عملية الإدخال كاملة (${entryGroup(r).length} مبالغ)</button>`:''}</div>`;$('#detail-dialog').showModal();}
function readPhoto(file){return new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve({name:file.name,data:reader.result,type:file.type});reader.onerror=()=>reject(new Error('تعذر قراءة الصورة'));reader.readAsDataURL(file);});}
function validDate(date){return typeof date==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(date)&&Number.isFinite(Date.parse(date))&&new Date(date+'T12:00:00Z').toISOString().slice(0,10)===date&&Number(date.slice(0,4))>=1900&&Number(date.slice(0,4))<=9998;}
async function saveEntry(event){
    event.preventDefault();
    const button=$('#save-entry');
    button.disabled=true;$('#form-error').textContent='';
    try{
        const id=$('#entry-id').value;
        await refreshData();
        const old=records.find(r=>r.id===id&&!r.deletedAt);
        if(id&&!old)throw new Error('هذه العملية حُذفت في نافذة أخرى. أغلق النموذج وراجع السجل.');
        const date=$('#entry-date').value,title=$('#entry-title').value.trim(),type=$('#entry-type').value;
        if(!validDate(date)||title.length>120)throw new Error('أدخل تاريخًا صالحًا (1900–9998). الاسم اختياري.');
        const notes=$('#entry-notes').value.trim(),category=$('#entry-category').value;
        if(!settings.categories[type]?.some(c=>c.id===category)||notes.length>2000)throw new Error('راجع التصنيف والملاحظات.');
        const inputs=type==='income'?$$('[data-income-currency]').map(el=>({currency:el.dataset.incomeCurrency,amount:Number(el.value)})):[{currency:$('#entry-currency').value,amount:Number($('#entry-amount').value)}];
        if(inputs.some(v=>!Number.isFinite(v.amount)||v.amount<0||v.amount>9999999999||Math.abs(v.amount*100-Math.round(v.amount*100))>.0001))throw new Error('المبالغ يجب أن تكون موجبة وبمنزلتين عشريتين كحد أقصى.');
        const populated=inputs.filter(v=>v.amount>0);
        if(!populated.length)throw new Error('أدخل مبلغًا واحدًا على الأقل. لحذف العملية استخدم زر «حذف العملية».');
        const group=old?entryGroup(old):[];
        const removed=type==='income'?group.filter(r=>!populated.some(v=>v.currency===r.currency)):[];
        if(removed.length&&!confirm(`سيتم حذف ${removed.length} مبلغ من الحسابات: ${removed.map(r=>r.currency).join('، ')}. يمكن استعادتها من سجل التعديلات. هل تتابع؟`))return;
        const now=new Date().toISOString(),batchId=type==='income'?(old?.batchId||uid()):undefined;
        // الصور الجديدة تُرفع إلى الخادم أولًا وتُحفظ كروابط داخل السجل
        const newPhotos=type==='expense'&&pendingPhotos.length?await storePhotos(pendingPhotos):[];
        const updated=[],changes=[];
        for(const value of populated){
            const prior=type==='income'?group.find(r=>r.currency===value.currency):old;
            const record={...(prior||{}),id:prior?.id||uid(),type,title,amount:Math.round(value.amount*100)/100,currency:value.currency,date,category,notes,photos:type==='expense'?[...(prior?.photos||[]),...newPhotos]:(prior?.photos||[]),createdAt:prior?.createdAt||now,updatedAt:now};
            if(batchId)record.batchId=batchId;
            updated.push(record);
            changes.push({id:uid(),action:prior?'edit':'create',at:now,recordId:record.id,label:(prior?'تعديل: ':'إضافة: ')+displayTitle(record)+' · '+record.currency,before:prior||null,after:record});
        }
        for(const prior of removed){
            const record={...prior,deletedAt:now,updatedAt:now};updated.push(record);
            changes.push({id:uid(),action:'delete',at:now,recordId:record.id,label:'حذف مبلغ: '+displayTitle(record)+' · '+record.currency,before:prior,after:record});
        }
        await commit({records:updated,history:changes});
        await refreshData();currentMonth=date.slice(0,7);$('#month-filter').value=currentMonth;
        $('#entry-dialog').close();render();toast('تم حفظ '+populated.length+' مبلغ بنجاح'+(removed.length?' وحفظ المحذوفات للاستعادة':''));
    }catch(error){$('#form-error').textContent=error.name==='QuotaExceededError'?'مساحة التخزين غير كافية. لم تُحفظ العملية. صدّر نسخة احتياطية وحاول دون صور جديدة.':error.message||'تعذر الحفظ. أعد المحاولة.';}
    finally{button.disabled=false;}
}
async function deleteRecord(id,wholeGroup=false){
    await refreshData();
    const record=records.find(r=>r.id===id&&!r.deletedAt);
    if(!record)return;
    const targets=wholeGroup?entryGroup(record):[record];
    const label=wholeGroup?'عملية الإدخال كاملة':'هذا المبلغ فقط';
    const summary=targets.map(r=>`${money(r.amount)} ${r.currency}`).join('، ');
    if(!confirm(`هل تريد حذف ${label}؟\n${summary}\nستُستبعد من الحسابات والتقارير، مع الاحتفاظ بنسخة قابلة للاستعادة في سجل التعديلات.`))return;
    const now=new Date().toISOString();
    const updated=targets.map(r=>({...r,deletedAt:now,updatedAt:now}));
    await commit({records:updated,history:targets.map((r,i)=>({id:uid(),action:'delete',at:now,recordId:r.id,label:'حذف: '+displayTitle(r)+' · '+r.currency,before:r,after:updated[i]}))});
    await refreshData();$('#entry-dialog').close();$('#detail-dialog').close();render();toast('تم الحذف من الحسابات. يمكنك الاستعادة من سجل التعديلات.');
}
async function restoreRecord(id){
    await refreshData();
    const old=records.find(r=>r.id===id&&r.deletedAt);
    if(!old)return;
    if(old.batchId&&records.some(r=>!r.deletedAt&&r.batchId===old.batchId&&r.currency===old.currency))return toast('يوجد مبلغ نشط لهذه العملة في نفس الإدخال. عدّله أو احذفه قبل الاستعادة.');
    if(!confirm(`استعادة ${money(old.amount)} ${old.currency} إلى الحسابات في تاريخ ${old.date}؟`))return;
    const now=new Date().toISOString(),record={...old,updatedAt:now};delete record.deletedAt;delete record.resetId;
    await commit({records:[record],history:[{id:uid(),action:'restore',at:now,recordId:id,label:'استعادة: '+displayTitle(record)+' · '+record.currency,before:old,after:record}]});
    await refreshData();render();toast('تمت استعادة المبلغ إلى شهره الأصلي.');
}
function deletedHTML(){
    const deleted=sortedRows(records.filter(r=>r.deletedAt));
    if(!deleted.length)return '';
    return `<section class="deleted-section"><h3>المحذوفات القابلة للاستعادة · ${deleted.length}</h3><p>هذه المبالغ غير مشمولة في الأرصدة أو التقارير. استعد كل مبلغ عند الحاجة.</p>${deleted.map(r=>`<article class="deleted-item"><div>${esc(displayTitle(r))}<small><bdi>${money(r.amount)} ${r.currency}</bdi> · <bdi>${esc(r.date)}</bdi></small></div><button class="button secondary" data-restore="${esc(r.id)}">${icon('history')} استعادة المبلغ</button></article>`).join('')}</section>`;
}
async function updateSettings(next,label){const old=structuredClone(settings);await commit({settings:[next],history:[{id:uid(),action:'settings',at:new Date().toISOString(),label,before:old}]});await refreshData();render();toast('تم حفظ الإعدادات');}
function download(content,name,type){const blob=new Blob([content],{type});const url=URL.createObjectURL(blob);const link=document.createElement('a');link.href=url;link.download=name;document.body.append(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),60000);}
async function exportBackup(){try{await refreshData();const now=new Date().toISOString();const backup={format:'daftar-backup',version:3,exportedAt:now,settings,records,debts,history};download(JSON.stringify(backup),`daftar-backup-${localDate()}-${Date.now()}.json`,'application/json');await commit({settings:[{...settings,lastBackup:now}]});await refreshData();if(currentRoute==='settings')render();toast('تم بدء تنزيل النسخة. تأكد من حفظ الملف في مكان آمن.');}catch(error){toast('تعذر تصدير النسخة: '+error.message);}}
function validatePhoto(p){if(!p||typeof p.name!=='string')return false;if(typeof p.url==='string')return /^\/api\/photo\/[\w\-]{6,60}\.(jpg|png|webp)$/.test(p.url);return typeof p.data==='string'&&/^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=\r\n]+$/.test(p.data)&&p.data.length<5700000;}
function validateRecord(r){return r&&typeof r.id==='string'&&r.id.length<100&&['income','expense'].includes(r.type)&&typeof r.title==='string'&&r.title.length<=120&&(r.batchId===undefined||(typeof r.batchId==='string'&&r.batchId.length>0&&r.batchId.length<100&&r.type==='income'))&&(r.deletedAt===undefined||(typeof r.deletedAt==='string'&&Number.isFinite(Date.parse(r.deletedAt))))&&(r.resetId===undefined||(typeof r.resetId==='string'&&r.resetId.length>0&&r.resetId.length<100))&&typeof r.amount==='number'&&r.amount>0&&r.amount<=9999999999&&Math.abs(r.amount*100-Math.round(r.amount*100))<.0001&&['USD','TRY','SYP'].includes(r.currency)&&validDate(r.date)&&typeof r.category==='string'&&typeof r.notes==='string'&&r.notes.length<=2000&&Array.isArray(r.photos)&&r.photos.every(validatePhoto)&&typeof r.createdAt==='string'&&Number.isFinite(Date.parse(r.createdAt))&&typeof r.updatedAt==='string'&&Number.isFinite(Date.parse(r.updatedAt));}
function validateSettings(s){return s&&s.id==='main'&&typeof s.name==='string'&&s.name.trim()&&s.name.length<=35&&typeof s.description==='string'&&s.description.length<=160&&(!s.lastBackup||Number.isFinite(Date.parse(s.lastBackup)))&&Array.isArray(s.currencies)&&s.currencies.length===3&&['USD','TRY','SYP'].every(code=>s.currencies.filter(c=>c.code===code).length===1)&&s.currencies.every(c=>typeof c.name==='string'&&c.name.trim()&&c.name.length<=40&&typeof c.symbol==='string'&&c.symbol.length<=5&&c.className===c.code.toLowerCase())&&s.categories&&['income','expense'].every(type=>Array.isArray(s.categories[type])&&s.categories[type].length&&new Set(s.categories[type].map(c=>c.id)).size===s.categories[type].length&&s.categories[type].every(c=>typeof c.id==='string'&&c.id.length<100&&typeof c.name==='string'&&c.name.trim()&&c.name.length<=50));}
function validateBackup(data){if(data?.format!=='daftar-backup'||![1,2,3].includes(data.version)||!validateSettings(data.settings)||!Array.isArray(data.records)||!data.records.every(validateRecord)||new Set(data.records.map(r=>r.id)).size!==data.records.length||!Array.isArray(data.history)||new Set(data.history.map(h=>h?.id)).size!==data.history.length)throw new Error('ملف النسخة غير صالح أو ليس من هذا النظام.');if((data.version===3||data.debts!==undefined)&&(!Array.isArray(data.debts)||!data.debts.every(validateDebt)||new Set(data.debts.map(d=>d.id)).size!==data.debts.length))throw new Error('بيانات الديون في النسخة غير صالحة.');for(const h of data.history){if(!h||typeof h.id!=='string'||h.id.length>100||typeof h.at!=='string'||!Number.isFinite(Date.parse(h.at))||typeof h.label!=='string'||(h.recordId!==undefined&&typeof h.recordId!=='string')||!['create','edit','settings','import','backup','delete','restore'].includes(h.action)||(h.before&&!(h.before.type==='debt'?validateDebt(h.before):h.before.type?validateRecord(h.before):validateSettings(h.before)))||(h.after&&!(h.after.type==='debt'?validateDebt(h.after):validateRecord(h.after))))throw new Error('سجل التعديلات في النسخة غير صالح.');}const activeGroups=new Set();for(const r of data.records){if(!data.settings.categories[r.type].some(c=>c.id===r.category))throw new Error('تصنيف مفقود في النسخة.');if(r.batchId&&!r.deletedAt){const key=r.batchId+'|'+r.currency;if(activeGroups.has(key))throw new Error('مبلغ مكرر لنفس العملة في عملية إدخال واحدة.');activeGroups.add(key);}}}
async function importBackup(file){
    if(!file)return;
    try{
        if(file.size>100*1024*1024)throw new Error('الملف كبير جدًا. الحد الأقصى للاستيراد 100 MB.');
        const data=JSON.parse(await file.text());validateBackup(data);await refreshData();
        const importedDebts=data.debts||[];
        const conflicts=data.records.filter(r=>records.some(old=>old.id===r.id));
        const debtConflicts=importedDebts.filter(d=>debts.some(old=>old.id===d.id));
        if(!confirm(`استيراد ${data.records.length} عملية و${importedDebts.length} دين؟\nسيتم تحديث ${conflicts.length} عملية و${debtConflicts.length} دين بأرقام متطابقة وحفظ النسخ الحالية في سجل التعديلات. السجلات غير الموجودة في الملف تبقى كما هي.\nتُستعاد حالة الحذف كما هي في الملف. ستُدمج التصنيفات وتُستعاد الإعدادات.`))return;
        const now=new Date().toISOString(),next=structuredClone(data.settings);
        for(const type of ['income','expense'])for(const c of settings.categories[type])if(!next.categories[type].some(n=>n.id===c.id))next.categories[type].push(c);
        const oldHistIds=new Set(history.map(h=>h.id));
        const newHistory=data.history.map(h=>oldHistIds.has(h.id)?{...h,id:uid()}:h);
        for(const r of conflicts)newHistory.push({id:uid(),action:'import',at:now,recordId:r.id,label:'استعادة نسخة: '+displayTitle(r),before:records.find(o=>o.id===r.id),after:r});
        for(const d of debtConflicts)newHistory.push({id:uid(),action:'import',at:now,recordId:d.id,label:'استعادة نسخة دين: '+d.name,before:debts.find(o=>o.id===d.id),after:d});
        newHistory.push({id:uid(),action:'import',at:now,label:'استيراد نسخة احتياطية — '+data.records.length+' عملية و'+importedDebts.length+' دين',before:settings});
        const merged=new Map(records.map(r=>[r.id,r]));for(const r of data.records)merged.set(r.id,r);
        const mergedDebts=new Map(debts.map(d=>[d.id,d]));for(const d of importedDebts)mergedDebts.set(d.id,d);
        validateBackup({format:'daftar-backup',version:3,settings:next,records:[...merged.values()],debts:[...mergedDebts.values()],history:[]});
        await commit({records:data.records,debts:importedDebts,settings:[next],history:newHistory});
        await refreshData();render();toast('تم دمج النسخة الاحتياطية، بما فيها الديون، دون محو السجلات الأخرى.');
    }catch(error){toast('لم تُستورد البيانات: '+(error.message||'تعذر قراءة الملف'));}
    finally{$('#backup-file').value='';}
}
function exportCSV(){
    const rows=filteredRows(null);
    const quote=text=>'"'+String(text).replace(/"/g,'""')+'"';
    const safe=value=>{let text=String(value??'');if(/^[\s]*[=+@-]/.test(text))text="'"+text;return quote(text);};
    // Only a strictly validated, application-generated date becomes a spreadsheet
    // text-literal formula. User-controlled text is always sanitized separately.
    const dateCell=date=>{if(!validDate(date))throw new Error('تاريخ غير صالح في التقرير');return quote('="'+date+'"');};
    const header=['الاسم / البيان','التاريخ (YYYY-MM-DD)','النوع','المبلغ','العملة','التصنيف','الملاحظات','عدد المرفقات'];
    const lines=[header.map(safe).join(',')];
    for(const r of sortedRows(rows)){
        lines.push([safe(r.title),dateCell(r.date),safe(r.type==='income'?'مدخل':'مصروف'),safe(r.amount),safe(r.currency),safe(categoryName(r.type,r.category)),safe(r.notes),safe(r.photos.length)].join(','));
    }
    download('\uFEFF'+lines.join('\r\n'),`daftar-report-${currentMonth}.csv`,'text/csv;charset=utf-8');
    toast('تم تصدير '+rows.length+' عملية. التاريخ ثابت بصيغة سنة-شهر-يوم.');
}
function renderLedgerTable(){const kind=currentRoute==='income'?'income':currentRoute==='expenses'?'expense':null;$('#ledger-table').innerHTML=tableHTML(filteredRows(kind),kind);}
function showPhoto(id,index){const photo=records.find(r=>r.id===id)?.photos[index];if(!photo)return;if(photo.url){window.open(photoSrc(photo),'_blank','noopener');return;}const bytes=atob(photo.data.split(',')[1]);const arr=Uint8Array.from(bytes,c=>c.charCodeAt(0));const url=URL.createObjectURL(new Blob([arr],{type:photo.data.slice(5,photo.data.indexOf(';'))}));window.open(url,'_blank','noopener');setTimeout(()=>URL.revokeObjectURL(url),60000);}
function bindEvents(){
 window.addEventListener('hashchange',route);
 $('#add-income').addEventListener('click',()=>openEntry('income'));$('#add-expense').addEventListener('click',()=>openEntry('expense'));
 $('#entry-form').addEventListener('submit',saveEntry);
 $$('.close-dialog').forEach(button=>button.addEventListener('click',()=>button.closest('dialog').close()));
 $('#month-filter').value=currentMonth;$('#month-filter').addEventListener('change',e=>{if(validDate(e.target.value+'-01')){currentMonth=e.target.value;render();}else e.target.value=currentMonth;});
 function shiftMonth(change){const date=new Date(currentMonth+'-15T12:00:00');date.setMonth(date.getMonth()+change);if(date.getFullYear()<1900||date.getFullYear()>9998)return;currentMonth=localDate(date).slice(0,7);$('#month-filter').value=currentMonth;render();}
 $('#previous-month').addEventListener('click',()=>shiftMonth(-1));$('#next-month').addEventListener('click',()=>shiftMonth(1));
 $('#mobile-menu').addEventListener('click',()=>{$('#sidebar').classList.toggle('open');$('#sidebar-overlay').classList.toggle('visible');$('#mobile-menu').setAttribute('aria-expanded',String($('#sidebar').classList.contains('open')));});$('#sidebar-overlay').addEventListener('click',closeMenu);
 document.addEventListener('keydown',e=>{if(e.key==='Escape')closeMenu();});
 $('#entry-photos').addEventListener('change',async e=>{const files=[...e.target.files];pendingPhotos=[];$('#form-error').textContent='';const old=records.find(r=>r.id===$('#entry-id').value);try{if(files.length>5)throw new Error('اختر حتى 5 صور جديدة في كل مرة.');if(files.some(f=>!['image/jpeg','image/png','image/webp'].includes(f.type)||f.size>4*1024*1024))throw new Error('يجب أن تكون الصور JPG أو PNG أو WebP وأقل من 4 MB لكل صورة.');$('#save-entry').disabled=true;pendingPhotos=await Promise.all(files.map(readPhoto));}catch(error){$('#form-error').textContent=error.message;e.target.value='';}finally{$('#save-entry').disabled=false;$('#photo-preview').innerHTML=[...(old?.photos||[]),...pendingPhotos].map(p=>`<img src="${esc(photoSrc(p))}" alt="${esc(p.name)}">`).join('');}});
 document.addEventListener('click',async e=>{const b=e.target.closest('button,a');if(!b)return;try{if(b.matches('.backup-trigger'))await exportBackup();else if(b.dataset.add)openEntry(b.dataset.add);else if(b.dataset.edit){$('#detail-dialog').close();openEntry('',b.dataset.edit);}else if(b.dataset.detail)detail(b.dataset.detail);else if(b.dataset.delete)await deleteRecord(b.dataset.delete);else if(b.dataset.deleteGroup)await deleteRecord(b.dataset.deleteGroup,true);else if(b.dataset.restore)await restoreRecord(b.dataset.restore);else if(b.id==='delete-entry')await deleteRecord($('#entry-id').value,true);else if(b.dataset.photoRecord){e.preventDefault();showPhoto(b.dataset.photoRecord,Number(b.dataset.photoIndex));}else if(b.id==='export-csv')exportCSV();else if(b.id==='import-backup')$('#backup-file').click();else if(b.dataset.categoryEdit){const type=b.dataset.type;const c=settings.categories[type].find(c=>c.id===b.dataset.categoryEdit);const name=prompt('الاسم الجديد للتصنيف:',c.name);if(name===null)return;if(!name.trim()||name.trim().length>50)return toast('أدخل اسمًا بين 1 و50 حرفًا.');if(settings.categories[type].some(x=>x.id!==c.id&&x.name===name.trim()))return toast('يوجد تصنيف بهذا الاسم.');const next=structuredClone(settings);next.categories[type].find(x=>x.id===c.id).name=name.trim();await updateSettings(next,'تعديل تصنيف: '+c.name);}}catch(error){toast('تعذر حفظ التغيير: '+error.message);}});
 document.addEventListener('change',e=>{if(e.target.id==='chart-currency'){chartCurrency=e.target.value;render();}if(e.target.id==='list-currency'){listCurrency=e.target.value;renderLedgerTable();}if(e.target.id==='list-category'){listCategory=e.target.value;renderLedgerTable();}});
 document.addEventListener('input',e=>{if(e.target.id==='record-search'){listSearch=e.target.value;renderLedgerTable();}});
 document.addEventListener('submit',async e=>{const form=e.target;if(!['identity-form','currencies-form'].includes(form.id)&&!form.matches('.category-form'))return;e.preventDefault();const button=$('button[type="submit"]',form);button.disabled=true;try{const values=new FormData(form),next=structuredClone(settings);let label='تعديل إعدادات مساحة العمل';if(form.id==='identity-form'){next.name=values.get('name').trim();next.description=values.get('description').trim();if(!next.name)throw new Error('اكتب اسمًا لمساحة العمل.');}else if(form.id==='currencies-form'){next.currencies.forEach(c=>{c.name=values.get(c.code+'-name').trim();c.symbol=values.get(c.code+'-symbol').trim();if(!c.name||!c.symbol)throw new Error('أكمل أسماء العملات ورموزها.');});label='تعديل أسماء العملات';}else{const name=values.get('categoryName').trim(),type=form.dataset.type;if(!name)throw new Error('اكتب اسم التصنيف.');if(next.categories[type].some(c=>c.name===name))throw new Error('هذا التصنيف موجود بالفعل.');next.categories[type].push({id:uid(),name});label='إضافة تصنيف: '+name;}await updateSettings(next,label);}catch(error){toast(error.message);button.disabled=false;}});
 $('#backup-file').addEventListener('change',e=>importBackup(e.target.files[0]));
 // Reload committed data when returning from another browser tab.
 document.addEventListener('visibilitychange',async()=>{if(document.visibilityState==='visible'&&db&&!$('dialog[open]')){try{await refreshData();render();}catch{toast('تعذر تحديث البيانات. أعد تحميل الصفحة.');}}});
}
async function init(){paintIcons();try{db=await openDatabase();await refreshData();bindEvents();route();setStorageStatus('متصل · البيانات مشتركة ومحدثة');startLiveSync();}catch(error){$('#view-content').innerHTML=`<div class="error-panel"><h2>تعذر الاتصال بخادم البيانات</h2><p>تحقق من اتصالك بالإنترنت ثم أعد تحميل الصفحة. لن ندّعي حفظ أي بيانات عندما يكون الخادم غير متاح.</p><p>${esc(error.message)}</p></div>`;setStorageStatus('الخادم غير متاح');$('#add-income').disabled=true;$('#add-expense').disabled=true;}}
init();
