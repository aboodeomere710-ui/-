'use strict';
// ════════════════════════════════════════════════════════════════════
//  الحسابات الرئيسية + حاسبة حقول المبالغ
// ════════════════════════════════════════════════════════════════════

// القسمان الرئيسيان لكل مدخل ومصروف.
const ACCOUNTS=[{id:'sham',name:'شام كاش'},{id:'cash',name:'كاش'}];
function accountName(id){return ACCOUNTS.find(a=>a.id===id)?.name||ACCOUNTS[1].name;}
function accountOptions(selected,all=false){return (all?'<option value="">كل الحسابات</option>':'')+ACCOUNTS.map(a=>`<option value="${a.id}" ${a.id===selected?'selected':''}>${esc(a.name)}</option>`).join('');}

// ── حاسبة آمنة: تدعم + − × ÷ والأقواس والأرقام العربية، دون eval ──
function normalizeMath(raw){
    return String(raw??'')
        .replace(/[٠-٩]/g,d=>'٠١٢٣٤٥٦٧٨٩'.indexOf(d))
        .replace(/[۰-۹]/g,d=>'۰۱۲۳۴۵۶۷۸۹'.indexOf(d))
        .replace(/[×xX*]/g,'*').replace(/[÷:]/g,'/').replace(/[−–—]/g,'-')
        .replace(/٫/g,'.').replace(/[،,٬\s]/g,'');
}
function evaluateExpression(raw){
    const s=normalizeMath(raw);
    if(!s||!/^[\d.+\-*/()]+$/.test(s)||/[+\-*/]{2,}/.test(s.replace(/([*/(])-/g,'$1')))return NaN;
    let i=0;
    const num=()=>{const m=/^(\d+\.?\d*|\.\d+)/.exec(s.slice(i));if(!m)throw 0;i+=m[0].length;return parseFloat(m[0]);};
    const factor=()=>{if(s[i]==='-'){i++;return -factor();}if(s[i]==='+'){i++;return factor();}if(s[i]==='('){i++;const v=expr();if(s[i]!==')')throw 0;i++;return v;}return num();};
    const term=()=>{let v=factor();while(s[i]==='*'||s[i]==='/'){const op=s[i++];const r=factor();v=op==='*'?v*r:v/r;}return v;};
    const expr=()=>{let v=term();while(s[i]==='+'||s[i]==='-'){const op=s[i++];const r=term();v=op==='+'?v+r:v-r;}return v;};
    try{const v=expr();if(i!==s.length||!Number.isFinite(v))return NaN;return Math.round(v*100)/100;}catch{return NaN;}
}
function isExpression(raw){return /[+*/×÷()x:]|.-/.test(normalizeMath(raw).replace(/^-/,''));}
// يقرأ قيمة حقل مبلغ: رقمًا عاديًا أو تعبيرًا حسابيًا. الفارغ = 0، غير الصالح = NaN.
function amountFrom(input){const raw=(input?.value??'').trim();if(!raw)return 0;return evaluateExpression(raw);}
function calcInputAttrs(){return 'type="text" inputmode="decimal" autocomplete="off" data-calc dir="ltr"';}

// معاينة حية للنتيجة تحت الحقل، وتحويل التعبير إلى ناتجه عند مغادرة الحقل.
function calcPreviewFor(input){
    let hint=input.nextElementSibling;
    if(!hint||!hint.classList.contains('calc-preview')){hint=document.createElement('span');hint.className='calc-preview';input.after(hint);}
    return hint;
}
function updateCalcPreview(input){
    const hint=calcPreviewFor(input),raw=input.value.trim();
    if(!raw){hint.textContent='';hint.classList.remove('invalid');return;}
    const value=evaluateExpression(raw);
    if(Number.isNaN(value)){hint.textContent='تعبير غير صالح';hint.classList.add('invalid');return;}
    hint.classList.remove('invalid');
    hint.textContent=isExpression(raw)?'= '+money(value):'';
}
document.addEventListener('input',e=>{if(e.target.matches('input[data-calc]'))updateCalcPreview(e.target);});
document.addEventListener('focusout',e=>{
    const input=e.target;if(!input.matches?.('input[data-calc]'))return;
    const raw=input.value.trim();if(!raw||!isExpression(raw))return;
    const value=evaluateExpression(raw);
    if(!Number.isNaN(value)){input.value=String(value);updateCalcPreview(input);}
});
