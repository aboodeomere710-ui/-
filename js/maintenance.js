'use strict';
let resetPreview = null;
let resetBusy = false;
function maintenanceHTML(){
    const standalone=Boolean(document.querySelector('meta[name="daftar-standalone"]'));
    return `<section class="panel settings-panel maintenance-panel"><span class="maintenance-icon">${icon('history')}</span><h2>تصفير الدخل والخرج والحسابات</h2><p>صفّر الدخل فقط أو المصروفات فقط أو الحسابات بالكامل، لشهر محدد أو لكل الفترات. لن تُمحى السجلات نهائيًا، والديون لا تتأثر بهذا التصفير.</p><button class="button danger" data-reset-open>اختيار نطاق التصفير</button><a class="text-link maintenance-link" href="#history">عرض المحذوفات واستعادتها ${icon('arrow-left')}</a></section><section class="panel settings-panel maintenance-panel"><span class="maintenance-icon">${icon('download')}</span><h2>ملف النظام على جهازك</h2><p>نزّل ملفات المشروع كاملة في ZIP مضغوط، أو البرنامج كملف HTML واحد، مع الوضع الليلي والحسابات بالعملات الثلاث. ملف البرنامج لا يحتوي على بياناتك الشخصية.</p>${standalone?'<p class="reset-notice">أنت تستخدم النسخة المستقلة بالفعل. احتفظ بملف HTML الأصلي وانسخه لنقل البرنامج؛ بياناتك تُنقل بملف النسخة الاحتياطية.</p>':'<a class="button primary" data-download-zip href="download.html">تنزيل المشروع كاملًا ZIP</a><a class="button secondary" data-download-system href="download.html#html">تنزيل ملف النظام HTML</a><a class="text-link maintenance-link" href="download.html">صفحة التنزيل والتعليمات</a>'}<button class="button secondary backup-trigger">تنزيل نسخة من بياناتي</button><p class="field-help" data-package-status aria-live="polite">البيانات محفوظة على الخادم المشترك، وليست داخل ملف البرنامج. النسخة المستقلة (HTML) تعمل فقط مع الرابط المستضاف؛ لنقل البيانات إلى موقع آخر استخدم النسخة الاحتياطية.</p></section>`;
}
function selectedResetOptions(){
    return {kind:$('#reset-kind').value,scope:$('#reset-scope').value,month:$('#reset-month').value};
}
function resetTargets(options){
    if(!['all','income','expense'].includes(options.kind)||!['all','month'].includes(options.scope)||(options.scope==='month'&&!validDate(options.month+'-01')))throw new Error('حدد نوع التصفير والفترة بشكل صحيح.');
    return records.filter(r=>!r.deletedAt&&(options.kind==='all'||r.type===options.kind)&&(options.scope==='all'||r.date.startsWith(options.month)));
}
function resetSignature(rows){return rows.map(r=>r.id+'|'+r.updatedAt).sort().join('\n');}
function resetSummary(options,rows){
    const label=options.kind==='income'?'الدخل فقط':options.kind==='expense'?'المصروفات فقط':'الدخل والمصروفات والحسابات';
    return `<h3>${label} · ${options.scope==='all'?'كل الفترات':esc(monthLabel(options.month))}</h3><p>${rows.length} مبلغ سيتوقف احتسابه؛ كل عملة مستقلة.</p><div class="table-scroll"><table><thead><tr><th>العملة</th><th>الدخل المستبعد</th><th>المصروفات المستبعدة</th></tr></thead><tbody>${settings.currencies.map(c=>{const t=totals(rows,c.code);return `<tr><td>${c.code}</td><td><bdi>${money(t.income)}</bdi></td><td><bdi>${money(t.expense)}</bdi></td></tr>`;}).join('')}</tbody></table></div>${!rows.length?'<p class="field-help">لا توجد مبالغ نشطة في هذا النطاق لتصفيرها.</p>':''}`;
}
function updateResetPreview(){
    $('#reset-confirmation').value='';$('#reset-error').textContent='';
    const options=selectedResetOptions();
    $('#reset-month-label').hidden=options.scope==='all';$('#reset-month').disabled=options.scope==='all';
    try{
        const rows=resetTargets(options);
        resetPreview={options,signature:resetSignature(rows)};
        $('#reset-summary').innerHTML=resetSummary(options,rows);
        $('#reset-submit').disabled=!rows.length||resetBusy;
    }catch(error){resetPreview=null;$('#reset-summary').textContent='';$('#reset-error').textContent=error.message;$('#reset-submit').disabled=true;}
}
async function openResetDialog(){
    await refreshData();
    $('#reset-form').reset();$('#reset-month').value=currentMonth;resetBusy=false;
    updateResetPreview();$('#reset-dialog').showModal();
}
async function submitReset(event){
    event.preventDefault();
    if(resetBusy)return;
    $('#reset-error').textContent='';
    if($('#reset-confirmation').value.trim()!=='تصفير'){$('#reset-error').textContent='اكتب كلمة «تصفير» لتأكيد اختيارك.';return;}
    resetBusy=true;$('#reset-submit').disabled=true;
    try{
        const options=selectedResetOptions();
        await refreshData();const targets=resetTargets(options);
        if(!resetPreview||JSON.stringify(options)!==JSON.stringify(resetPreview.options)||resetSignature(targets)!==resetPreview.signature){
            updateResetPreview();throw new Error('تغيرت العمليات أو الفترة. راجع الملخص الجديد واكتب كلمة التأكيد مرة أخرى.');
        }
        if(!targets.length)throw new Error('لا توجد عمليات تحتاج إلى تصفير.');
        const typeLabel=options.kind==='income'?'الدخل':options.kind==='expense'?'المصروفات':'الدخل والمصروفات والحسابات';
        const periodLabel=options.scope==='all'?'كل الفترات':monthLabel(options.month);
        if(!confirm(`تأكيد تصفير ${typeLabel} — ${periodLabel}؟\nسيتم استبعاد ${targets.length} مبلغ من الحسابات مع حفظ نسخة قابلة للاستعادة.`))return;
        const at=new Date().toISOString(),resetId=uid();
        const updated=targets.map(r=>({...r,deletedAt:at,updatedAt:at,resetId}));
        const changes=targets.map((r,i)=>({id:uid(),action:'delete',at,recordId:r.id,resetId,label:'تصفير '+typeLabel+' — '+periodLabel+' · '+r.currency,before:r,after:updated[i]}));
        await commit({records:updated,history:changes});
        await refreshData();$('#reset-dialog').close();render();toast('تم التصفير محليًا. يمكنك استعادة المجموعة من سجل التعديلات، واضغط «رفع التعديلات» للنشر.');
    }catch(error){$('#reset-error').textContent=error.name==='QuotaExceededError'?'لم يتم التصفير: مساحة التخزين غير كافية لحفظ السجل.':error.message;}
    finally{resetBusy=false;$('#reset-submit').disabled=!resetPreview||!resetTargets(resetPreview.options).length;}
}
function resetHistoryHTML(){
    const groups=new Map();
    for(const r of records.filter(r=>r.deletedAt&&r.resetId)){if(!groups.has(r.resetId))groups.set(r.resetId,[]);groups.get(r.resetId).push(r);}
    if(!groups.size)return '';
    return `<section class="deleted-section"><h3>مجموعات التصفير القابلة للاستعادة</h3><p>استعد كل المبالغ المتبقية من عملية تصفير واحدة دفعة واحدة.</p>${[...groups].map(([id,rows])=>`<article class="deleted-item"><div>تصفير ${timeLabel(rows[0].deletedAt)}<small>${rows.length} مبلغ محفوظ بالعملات الأصلية</small></div><button class="button secondary" data-restore-reset="${esc(id)}">استعادة المجموعة</button></article>`).join('')}</section>`;
}
async function restoreResetGroup(id){
    await refreshData();const targets=records.filter(r=>r.deletedAt&&r.resetId===id);
    if(!targets.length)return;
    const next=targets.map(r=>{const item={...r,updatedAt:new Date().toISOString()};delete item.deletedAt;delete item.resetId;return item;});
    const merged=new Map(records.map(r=>[r.id,r]));next.forEach(r=>merged.set(r.id,r));
    validateBackup({format:'daftar-backup',version:2,settings,records:[...merged.values()],history:[]});
    if(!confirm(`استعادة ${targets.length} مبلغ من مجموعة التصفير إلى تواريخها وعملاتها الأصلية؟`))return;
    await commit({records:next,history:targets.map((r,i)=>({id:uid(),action:'restore',at:next[i].updatedAt,recordId:r.id,label:'استعادة مجموعة تصفير · '+r.currency,before:r,after:next[i]}))});
    await refreshData();render();toast('تمت استعادة مجموعة التصفير محليًا. اضغط «رفع التعديلات» ليراها الجميع.');
}
document.addEventListener('DOMContentLoaded',()=>{
    $('#reset-form').addEventListener('submit',submitReset);
    ['#reset-kind','#reset-scope','#reset-month'].forEach(selector=>$(selector).addEventListener('change',updateResetPreview));
    document.addEventListener('click',async event=>{
        const button=event.target.closest('button');if(!button)return;
        try{
            if(button.hasAttribute('data-reset-open'))await openResetDialog();
            if(button.dataset.restoreReset)await restoreResetGroup(button.dataset.restoreReset);
            if(button.hasAttribute('data-download-system')||button.hasAttribute('data-download-zip')){
                button.disabled=true;const status=$('[data-package-status]');
                if(status)status.textContent='جارٍ تجهيز ملف النظام…';
                try{const result=button.hasAttribute('data-download-zip')?await DaftarPackage.downloadZip():await DaftarPackage.download();if(status)status.textContent='بدأ تنزيل '+result.filename+'. احتفظ بالملف وصدّر بياناتك في نسخة منفصلة.';}
                finally{button.disabled=false;}
            }
        }catch(error){toast(error.message||'تعذر إتمام العملية.');const status=$('[data-package-status]');if((button.hasAttribute('data-download-system')||button.hasAttribute('data-download-zip'))&&status)status.textContent='لم يتم تجهيز الملف. '+error.message;}
    });
});
