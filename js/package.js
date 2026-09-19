'use strict';
// Package clean project sources in-browser. No accounting data is read here.
window.DaftarPackage = {
    cssFiles:['css/style.css','css/enhancements.css','css/maintenance.css','css/debts.css','css/brand-colors.css'],
    jsFiles:['js/theme.js','js/package.js','js/maintenance.js','js/debts.js','js/app.js'],
    get projectFiles(){
        return ['index.html','download.html','README.md','GITHUB-PAGES.md',...this.cssFiles,...this.jsFiles,
            'js/download-page.js','js/vendor/fflate.min.js','js/vendor/fflate-LICENSE.txt',
            'tests/accounting.html','tests/accounting.js','tests/download.html','tests/download.js'];
    },
    assertHostedSource(){
        if(document.querySelector('meta[name="daftar-standalone"]'))throw new Error('أنت تستخدم الملف المستقل. لتنزيل ملفات المشروع، افتح صفحة التنزيل في نسخة الموقع أو انسخ الأرشيف الأصلي.');
        if(location.protocol==='file:')throw new Error('لتجميع ملفات المشروع افتح صفحة التنزيل عبر رابط الموقع أو خادم محلي، وليس مباشرة عبر file://.');
    },
    async readSources(paths){
        const entries=await Promise.all(paths.map(async path=>{
            const response=await fetch(new URL(path,document.baseURI),{cache:'no-store'});
            if(!response.ok)throw new Error('تعذر تحميل '+path+'؛ تأكد من اتصالك وأعد المحاولة.');
            const source=await response.text();
            if(!path.endsWith('.html')&&/^\s*(?:<!doctype|<html)/i.test(source))throw new Error('محتوى غير صالح للملف '+path);
            return [path,source];
        }));
        return Object.fromEntries(entries);
    },
    async build(sources){
        this.assertHostedSource();
        const source=sources||await this.readSources(['index.html',...this.cssFiles,...this.jsFiles]);
        const doc=new DOMParser().parseFromString(source['index.html'],'text/html');
        if(!doc.querySelector('#entry-form')||!doc.querySelector('#reset-form')||!doc.querySelector('#debt-form'))throw new Error('لم يتم العثور على النسخة الكاملة من النظام.');
        doc.querySelectorAll('script,link,base,style,meta[http-equiv]').forEach(node=>node.remove());
        const marker=doc.createElement('meta');marker.name='daftar-standalone';marker.content='1';doc.head.append(marker);
        const style=doc.createElement('style');style.textContent=this.cssFiles.map(path=>source[path]).join('\n');doc.head.append(style);
        const forbidden=new RegExp('<'+'/?script|<'+'!--','i');
        for(const path of this.jsFiles){
            const code=source[path];
            if(forbidden.test(code))throw new Error('تعذر تضمين '+path+' بأمان؛ استخدم نسخة الموقع الحالية.');
            const script=doc.createElement('script');script.textContent=code;
            if(path==='js/theme.js')doc.head.append(script);else doc.body.append(script);
        }
        return '<!DOCTYPE html>\n'+doc.documentElement.outerHTML;
    },
    saveFile(content,filename,type){
        const blob=new Blob([content],{type});
        const url=URL.createObjectURL(blob),link=document.createElement('a');
        link.href=url;link.download=filename;document.body.append(link);link.click();link.remove();
        setTimeout(()=>URL.revokeObjectURL(url),60000);
        return {filename,bytes:blob.size};
    },
    async download(){return this.saveFile(await this.build(),'daftar-system.html','text/html;charset=utf-8');},
    async loadZipLibrary(){
        if(window.fflate?.zipSync)return window.fflate;
        if(!this.zipLibraryPromise){
            this.zipLibraryPromise=new Promise((resolve,reject)=>{
                const script=document.createElement('script');
                const timer=setTimeout(()=>{script.remove();reject(new Error('انتهت مهلة تحميل أداة الضغط. أعد المحاولة.'));},20000);
                script.src=new URL('js/vendor/fflate.min.js',document.baseURI).href;
                script.onload=()=>{clearTimeout(timer);window.fflate?.zipSync?resolve(window.fflate):reject(new Error('تعذر تشغيل أداة الضغط.'));};
                script.onerror=()=>{clearTimeout(timer);script.remove();reject(new Error('تعذر تحميل أداة الضغط. تحقق من الاتصال.'));};
                document.head.append(script);
            }).catch(error=>{this.zipLibraryPromise=null;throw error;});
        }
        return this.zipLibraryPromise;
    },
    async buildZip(){
        this.assertHostedSource();
        const [source,zip]=await Promise.all([this.readSources(this.projectFiles),this.loadZipLibrary()]);
        const root='daftar-project/';
        const files=Object.fromEntries(Object.entries(source).map(([path,text])=>[root+path,zip.strToU8(text)]));
        files[root+'daftar-system.html']=zip.strToU8(await this.build(source));
        files[root+'START-HERE.txt']=zip.strToU8('دفتر — ملفات المشروع الكاملة\n\n1. فك ضغط الأرشيف كاملًا.\n2. افتح daftar-system.html لتجربة النسخة المستقلة في متصفح يدعم IndexedDB.\n3. للتطوير والنشر استخدم index.html ومجلدي css وjs؛ لا ترفع ملف index.html وحده.\n4. افتح README.md لمعرفة الوظائف وطريقة التخزين والاختبارات.\n5. البيانات المالية ليست داخل هذا الأرشيف. صدّر نسخة JSON من لوحة التحكم واستوردها على العنوان أو الجهاز الجديد.\n6. ظهور الألوان للجميع يتطلب نشر الملفات المحدثة على نفس الرابط. ملفات HTML المنزلة والتبويبات المفتوحة لا تتحدث تلقائيًا.\n7. التعديلات الإدارية والبيانات ما زالت محلية، وليست مشتركة أو لحظية بين الزوار.\n8. لا توجد كلمة مرور آمنة أو صلاحيات مستخدمين في هذه النسخة المحلية.\n');
        files[root+'.nojekyll']=new Uint8Array(0);
        const bytes=zip.zipSync(files,{level:6});
        return {bytes,fileCount:Object.keys(files).length};
    },
    async prepareDownload(kind='zip'){
        const result=kind==='zip'?await this.buildZip():{html:await this.build()};
        const filename=kind==='zip'?'daftar-project.zip':'daftar-system.html';
        const blob=new Blob([kind==='zip'?result.bytes:result.html],{type:kind==='zip'?'application/zip':'text/html;charset=utf-8'});
        return {url:URL.createObjectURL(blob),filename,bytes:blob.size,fileCount:result.fileCount||1};
    },
    async downloadZip(){
        const result=await this.buildZip();
        return {...this.saveFile(result.bytes,'daftar-project.zip','application/zip'),fileCount:result.fileCount};
    }
};
