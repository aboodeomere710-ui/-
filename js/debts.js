'use strict';
let debtSearch='';
let debtSaving=false;
let debtEditStamp=null;
const debtCodes=['USD','TRY','SYP'];
function validDebtAmount(value){return typeof value==='number'&&Number.isFinite(value)&&value>=0&&value<=9999999999&&Math.abs(value*100-Math.round(value*100))<.0001;}
function validateDebt(d){
    return Boolean(d&&typeof d.id==='string'&&d.id.length>0&&d.id.length<100&&d.type==='debt'&&typeof d.name==='string'&&d.name.trim()&&d.name.length<=120&&validDate(d.date)&&typeof d.notes==='string'&&d.notes.length<=2000&&d.amounts&&debtCodes.every(code=>validDebtAmount(d.amounts[code]))&&debtCodes.some(code=>d.amounts[code]>0)&&typeof d.createdAt==='string'&&Number.isFinite(Date.parse(d.createdAt))&&typeof d.updatedAt==='string'&&Number.isFinite(Date.parse(d.updatedAt))&&(d.deletedAt===undefined||(typeof d.deletedAt==='string'&&Number.isFinite(Date.parse(d.deletedAt)))));
}
function debtTotal(code){return debts.filter(d=>!d.deletedAt).reduce((sum,d)=>sum+Math.round(d.amounts[code]*100),0)/100;}
function debtHistorySummary(d){return `دين على: ${d.name}\nالتاريخ: ${d.date}\n${debtCodes.map(code=>money(d.amounts[code])+' '+code).join('\n')}\n${d.notes||'لا توجد ملاحظات'}${d.deletedAt?'\nالحالة: محذوف قابل للاستعادة':''}`;}
function debtCardsHTML(){
    return `<section class="currency-cards debt-summary-cards" aria-label="إجمالي الديون بكل العملات">${settings.currencies.map(c=>`<article class="currency-card debt-summary-card"><div class="currency-heading"><span class="currency-mark ${c.className}">${esc(c.symbol)}</span><div><h2>${esc(c.name)}</h2><div class="currency-code">${c.code}</div></div><span class="currency-tag">كل الفترات</span></div><div class="balance-label">إجمالي الديون المسجلة</div><div class="balance-amount" title="${money(debtTotal(c.code))} ${c.code}">${money(debtTotal(c.code))}<small>${c.code}</small></div><p class="debt-currency-caption">${debts.filter(d=>!d.deletedAt&&d.amounts[c.code]>0).length} دين بهذه العملة</p></article>`).join('')}</section>`;
}
function debtRowsHTML(){
    const query=debtSearch.trim().toLocaleLowerCase();
    const rows=sortedRows(debts.filter(d=>!d.deletedAt&&(!query||(d.name+' '+d.notes).toLocaleLowerCase().includes(query))));
    return `<div class="table-scroll" tabindex="0" aria-label="جدول الديون، يمكن التمرير أفقيًا عند الحاجة"><table class="debts-table"><thead><tr><th>اسم المدين</th><th>تاريخ الدين</th>${settings.currencies.map(c=>`<th>${esc(c.name)} <span class="record-sub">${c.code}</span></th>`).join('')}<th>الإجراءات</th></tr></thead><tbody>${rows.map(d=>`<tr><td class="debt-name-cell"><strong>${esc(d.name)}</strong>${d.notes?`<span class="debt-note-preview" title="${esc(d.notes)}">${esc(d.notes)}</span>`:''}</td><td><bdi>${esc(d.date)}</bdi></td>${settings.currencies.map(c=>`<td><bdi class="money">${d.amounts[c.code]>0?money(d.amounts[c.code]):'—'}</bdi></td>`).join('')}<td><div class="table-actions"><button type="button" class="button secondary debt-row-button" data-debt-edit="${esc(d.id)}" aria-label="تعديل دين ${esc(d.name)}">${icon('edit')} تعديل</button><button type="button" class="button danger debt-row-button" data-debt-delete="${esc(d.id)}" aria-label="حذف دين ${esc(d.name)}">${icon('trash')} حذف</button></div></td></tr>`).join('')}</tbody></table></div>${!rows.length?`<div class="empty-state"><div class="empty-icon">${icon('ledger')}</div><h3>${query?'لا توجد ديون مطابقة':'كل دين مسجل، وكل مبلغ واضح'}</h3><p>${query?'جرّب البحث باسم آخر أو امسح البحث.':'أضف اسم المدين والمبالغ المستحقة عليه، بعملة واحدة أو أكثر.'}</p>${!query?`<button class="button secondary" data-debt-add>${icon('plus')} إضافة أول دين</button>`:''}</div>`:''}<footer class="table-footer"><span>${rows.length} دين ظاهر من ${debts.filter(d=>!d.deletedAt).length}</span><span>المحذوفات متاحة في سجل التعديلات</span></footer>`;
}
function debtsHTML(){
    return `${debtCardsHTML()}<section class="panel" id="debts-register"><header class="panel-header"><div><h2 class="panel-title">سجل الديون</h2><p class="panel-subtitle">كل الفترات · قيمة كل دين في سطر واحد، دون تحويل بين العملات</p></div><span class="type-chip">${debts.filter(d=>!d.deletedAt).length} دين</span></header><div class="search-tools"><input type="search" id="debt-search" class="search-input" value="${esc(debtSearch)}" placeholder="ابحث باسم المدين أو الملاحظات…" aria-label="البحث في الديون"></div><div id="debt-table-content">${debtRowsHTML()}</div></section><aside class="info-banner"><span>${icon('info')}</span><p><strong>سجل مستقل للديون.</strong> الإجماليات تشمل كل الديون غير المحذوفة في جميع الفترات، بغض النظر عن البحث. لا تؤثر الديون على الدخل أو المصروفات، ولا يشملها تصفير الحسابات.</p></aside>`;
}
function openDebt(id){
    if(!db)return toast('التخزين غير متاح. أعد تحميل الصفحة.');
    const old=id?debts.find(d=>d.id===id&&!d.deletedAt):null;
    if(id&&!old)return toast('الدين غير متاح. راجع المحذوفات في سجل التعديلات.');
    $('#debt-form').reset();debtEditStamp=old?.updatedAt||null;
    $('#debt-id').value=old?.id||'';$('#debt-name').value=old?.name||'';
    $('#debt-date').value=old?.date||localDate();$('#debt-notes').value=old?.notes||'';
    $('#debt-dialog-title').textContent=old?'تعديل الدين':'إضافة دين جديد';
    $('#debt-currency-fields').innerHTML=settings.currencies.map(c=>`<label>${esc(c.name)} · ${c.code}<input id="debt-amount-${c.code}" data-debt-currency="${c.code}" type="number" min="0" max="9999999999" step="0.01" inputmode="decimal" placeholder="0.00" dir="ltr" value="${old?.amounts[c.code]||''}"></label>`).join('');
    $('#delete-debt').hidden=!old;$('#debt-error').textContent='';$('#save-debt').disabled=false;
    $('#debt-dialog').showModal();
}
async function saveDebt(event){
    event.preventDefault();if(debtSaving)return;
    debtSaving=true;$('#save-debt').disabled=true;$('#debt-error').textContent='';
    try{
        const id=$('#debt-id').value;await refreshData();
        const old=debts.find(d=>d.id===id&&!d.deletedAt);
        if(id&&(!old||old.updatedAt!==debtEditStamp))throw new Error('هذا الدين تغير أو حُذف في نافذة أخرى. أغلق النموذج وأعد فتحه للمراجعة.');
        const name=$('#debt-name').value.trim(),date=$('#debt-date').value,notes=$('#debt-notes').value.trim();
        const amounts=Object.fromEntries(debtCodes.map(code=>[code,Number($('#debt-amount-'+code).value)]));
        if(!name||name.length>120)throw new Error('أدخل اسم المدين (حتى 120 حرفًا).');
        if(!validDate(date))throw new Error('أدخل تاريخًا صالحًا.');
        if(!debtCodes.every(code=>validDebtAmount(amounts[code])))throw new Error('أدخل مبالغ غير سالبة وبمنزلتين عشريتين كحد أقصى.');
        if(!debtCodes.some(code=>amounts[code]>0))throw new Error('أدخل مبلغًا في عملة واحدة على الأقل. لحذف الدين استخدم زر الحذف.');
        for(const code of debtCodes)amounts[code]=Math.round(amounts[code]*100)/100;
        const now=new Date().toISOString();
        const item={id:id||uid(),type:'debt',name,date,notes,amounts,createdAt:old?.createdAt||now,updatedAt:now};
        if(!validateDebt(item))throw new Error('راجع بيانات الدين وحاول مرة أخرى.');
        await commit({debts:[item],history:[{id:uid(),action:old?'edit':'create',at:now,recordId:item.id,label:(old?'تعديل دين: ':'إضافة دين: ')+name,before:old||null,after:item}]});
        await refreshData();$('#debt-dialog').close();debtSearch='';render();toast(old?'تم تعديل الدين وحفظ نسخته السابقة.':'تم حفظ الدين بالعملات المحددة.');
    }catch(error){$('#debt-error').textContent=error.name==='QuotaExceededError'?'تعذر الحفظ: مساحة التخزين غير كافية. لم يتم تعديل الدين.':error.message;}
    finally{debtSaving=false;$('#save-debt').disabled=false;}
}
async function deleteDebt(id){
    await refreshData();const old=debts.find(d=>d.id===id&&!d.deletedAt);if(!old)return;
    const amounts=debtCodes.filter(c=>old.amounts[c]>0).map(c=>money(old.amounts[c])+' '+c).join('، ');
    if(!confirm(`حذف دين ${old.name}؟\n${amounts}\nسيُستبعد من إجمالي الديون، مع إمكانية استعادته من سجل التعديلات.`))return;
    const now=new Date().toISOString(),item={...old,deletedAt:now,updatedAt:now};
    await commit({debts:[item],history:[{id:uid(),action:'delete',at:now,recordId:id,label:'حذف دين: '+old.name,before:old,after:item}]});
    await refreshData();$('#debt-dialog').close();render();toast('تم حذف الدين من الإجماليات. يمكنك استعادته من سجل التعديلات.');
}
async function restoreDebt(id){
    await refreshData();const old=debts.find(d=>d.id===id&&d.deletedAt);if(!old)return;
    if(!confirm('استعادة دين '+old.name+' بمبالغه الأصلية؟'))return;
    const now=new Date().toISOString(),item={...old,updatedAt:now};delete item.deletedAt;
    await commit({debts:[item],history:[{id:uid(),action:'restore',at:now,recordId:id,label:'استعادة دين: '+old.name,before:old,after:item}]});
    await refreshData();render();toast('تمت استعادة الدين.');
}
function deletedDebtsHTML(){
    const rows=sortedRows(debts.filter(d=>d.deletedAt));if(!rows.length)return '';
    return `<section class="deleted-section"><h3>الديون المحذوفة القابلة للاستعادة · ${rows.length}</h3>${rows.map(d=>`<article class="deleted-item"><div>${esc(d.name)}<small>${debtCodes.filter(c=>d.amounts[c]>0).map(c=>`<bdi>${money(d.amounts[c])} ${c}</bdi>`).join(' · ')}</small></div><button class="button secondary" data-debt-restore="${esc(d.id)}">${icon('history')} استعادة الدين</button></article>`).join('')}</section>`;
}
document.addEventListener('DOMContentLoaded',()=>{
    $('#debt-form').addEventListener('submit',saveDebt);
    document.addEventListener('input',event=>{if(event.target.id==='debt-search'){debtSearch=event.target.value;$('#debt-table-content').innerHTML=debtRowsHTML();}});
    document.addEventListener('click',async event=>{
        const button=event.target.closest('button');if(!button)return;
        try{
            if(button.hasAttribute('data-debt-add'))openDebt();
            else if(button.dataset.debtEdit)openDebt(button.dataset.debtEdit);
            else if(button.dataset.debtDelete)await deleteDebt(button.dataset.debtDelete);
            else if(button.dataset.debtRestore)await restoreDebt(button.dataset.debtRestore);
            else if(button.id==='delete-debt')await deleteDebt($('#debt-id').value);
        }catch(error){toast('تعذر إتمام العملية: '+error.message);}
    });
});
