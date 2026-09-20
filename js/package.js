'use strict';
// Package clean project sources in-browser. No accounting data is read here.
window.DaftarPackage = {
    cssFiles:['css/style.css','css/enhancements.css','css/maintenance.css','css/debts.css','css/brand-colors.css'],
    jsFiles:['js/theme.js','js/storage.js','js/package.js','js/maintenance.js','js/debts.js','js/app.js'],
    get projectFiles(){
        return ['index.html','download.html','README.md','SETUP.md','netlify.toml','package.json',
            'netlify/functions/ledger.js','netlify/functions/photo.js',...this.cssFiles,...this.jsFiles,
            'js/download-page.js','js/vendor/fflate.min.js','js/vendor/fflate-LICENSE.txt'];
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
            if(/\.(js|css|json|toml|md)$/.test(path)&&/^\s*(?:<!doctype|<html)/i.test(source))throw new Error('محتوى غير صالح للملف '+path);
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
        files[root+'START-HERE.txt']=zip.strToU8('دفتر — نظام المحاسبة المشترك — ملفات المشروع الكاملة\n(نفس آلية متجر CampusKart: Netlify Functions + Blobs — بدون أي إعداد)\n\nكل ما عليك فعله:\n1. ارفع كل محتوى هذا المجلد إلى مستودع GitHub (بما فيه المجلدات css وjs وnetlify وملفا netlify.toml وpackage.json).\n2. اربط المستودع بموقع على Netlify (أو إن كان مربوطًا فسينشر تلقائيًا).\n3. افتح الرابط. انتهى!\n\nأي تعديل من أي جهاز يظهر لكل من يملك الرابط خلال ثوانٍ.\n\nملاحظات:\n- لا ترفع index.html وحده؛ المجلدات css وjs وnetlify ضرورية.\n- لا توجد متغيرات بيئة ولا كلمة مرور؛ كل من يملك الرابط يستطيع التعديل. شاركه مع من تثق به فقط.\n- لنقل بياناتك القديمة: صدّر نسخة JSON من لوحة التحكم القديمة واستوردها في الموقع الجديد.\n- daftar-system.html نسخة مستقلة للتجربة فقط ولا تتصل بالخادم.\n- التفاصيل في SETUP.md.\n');
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
