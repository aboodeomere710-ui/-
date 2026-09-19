'use strict';
document.addEventListener('DOMContentLoaded',()=>{
    const htmlButton=document.getElementById('download-system-file');
    const zipButton=document.getElementById('download-project-zip');
    const status=document.getElementById('download-status');
    const ready=document.getElementById('download-ready');
    const link=document.getElementById('ready-download-link');
    const details=document.getElementById('download-file-details');
    let activeUrl=null;
    let busy=false;
    async function prepare(kind){
        if(busy)return;
        busy=true;htmlButton.disabled=true;zipButton.disabled=true;ready.hidden=true;
        link.removeAttribute('href');
        if(activeUrl){URL.revokeObjectURL(activeUrl);activeUrl=null;}
        status.dataset.state='preparing';
        status.textContent=kind==='zip'?'جارٍ جمع الملفات وضغطها. سيظهر رابط الحفظ بعد اكتمال التجهيز…':'جارٍ تجهيز ملف HTML…';
        try{
            const result=await DaftarPackage.prepareDownload(kind);
            activeUrl=result.url;link.href=activeUrl;link.download=result.filename;
            link.textContent='تحميل الآن — '+result.filename;
            details.textContent=`${Math.ceil(result.bytes/1024)} KB · ${result.fileCount} ملف${kind==='zip'?' · جاهز للرفع على GitHub Pages':''}`;
            ready.hidden=false;status.dataset.state='ready';
            status.textContent='تم تجهيز الملف بنجاح. اضغط رابط «تحميل الآن» أعلاه لحفظه على جهازك.';
        }catch(error){status.dataset.state='error';status.textContent='تعذر تجهيز الرابط: '+error.message+' اضغط «إعادة تجهيز ZIP» للمحاولة مجددًا.';}
        finally{busy=false;htmlButton.disabled=false;zipButton.disabled=false;}
    }
    // Native link navigation keeps the download inside a real user gesture.
    // Do not automatically click the link or revoke its URL on a timer.
    link.addEventListener('click',()=>{status.textContent='تم طلب حفظ الملف من المتصفح. تحقق من مجلد التنزيلات؛ لا يمكن للموقع تأكيد حفظه على القرص.';});
    htmlButton.addEventListener('click',()=>prepare('html'));
    zipButton.addEventListener('click',()=>prepare('zip'));
    prepare(location.hash==='#html'?'html':'zip');
});
