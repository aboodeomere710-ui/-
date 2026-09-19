'use strict';
(async()=>{
    const output=document.getElementById('download-test-result');
    const frame=document.getElementById('download-frame');
    const lines=[];
    function check(value,message){if(!value)throw new Error(message);lines.push('PASS: '+message);console.log(lines.at(-1));}
    async function wait(fn){for(let i=0;i<450;i++){if(fn())return;await new Promise(r=>setTimeout(r,100));}throw new Error('انتهت مهلة تجهيز رابط التنزيل');}
    try{
        await wait(()=>['ready','error'].includes(frame.contentDocument.querySelector('#download-status')?.dataset.state));
        const doc=frame.contentDocument,win=frame.contentWindow;
        const status=doc.querySelector('#download-status');
        check(status.dataset.state==='ready',status.textContent);
        const link=doc.querySelector('#ready-download-link');
        check(link.tagName==='A'&&link.href.startsWith('blob:')&&link.download==='daftar-project.zip'&&!doc.querySelector('#download-ready').hidden,'رابط ZIP فعلي ظاهر ويتطلب نقرة المستخدم');
        const bytes=new Uint8Array(await (await win.fetch(link.href)).arrayBuffer());
        const files=win.fflate.unzipSync(bytes);
        check(bytes[0]===80&&bytes[1]===75,'الرابط يعيد ملف ZIP صالحًا وليس صفحة HTML');
        check(Boolean(files['daftar-project/index.html'])&&Boolean(files['daftar-project/.nojekyll'])&&Boolean(files['daftar-project/GITHUB-PAGES.md']),'ملف البداية وتعليمات GitHub و.nojekyll موجودة');
        check(win.DaftarPackage.projectFiles.every(path=>files['daftar-project/'+path]),'كل ملفات المصدر موجودة في الأرشيف');
        for(const page of ['index.html','download.html']){
            const parsed=new DOMParser().parseFromString(win.fflate.strFromU8(files['daftar-project/'+page]),'text/html');
            for(const node of parsed.querySelectorAll('script[src],link[rel="stylesheet"][href]')){
                const ref=node.getAttribute('src')||node.getAttribute('href');
                if(/^https?:/.test(ref))continue;
                check(!ref.startsWith('/')&&Boolean(files['daftar-project/'+ref]),'مسار نسبي صالح على GitHub Pages: '+ref);
            }
        }
        let requests=0;link.addEventListener('click',event=>{event.preventDefault();requests++;},{once:true});link.click();
        check(requests===1&&status.textContent.includes('تم طلب حفظ'),'الرابط يقبل نقرة فعلية دون محاولة تنزيل آلية');
        check((await win.fetch(link.href)).ok,'الرابط يبقى صالحًا بعد النقر ولا يُلغى مباشرة');
        doc.querySelector('#download-system-file').click();
        await wait(()=>status.dataset.state==='ready'&&link.download==='daftar-system.html');
        const html=await (await win.fetch(link.href)).text();
        check(html.includes('daftar-standalone')&&html.includes('debt-form'),'رابط HTML المستقل يعمل كذلك');
        const url=new URL('../download.html',location.href).href;
        output.textContent='ALL DOWNLOAD TESTS PASSED: '+lines.length+'\nDOWNLOAD PAGE: '+url+'\nZIP FILES: '+Object.keys(files).length+'\nZIP BYTES: '+bytes.length+'\n\n'+lines.join('\n');
        output.dataset.done='true';console.log('ALL DOWNLOAD TESTS PASSED: '+lines.length);console.log('DOWNLOAD PAGE: '+url);console.log('ZIP FILES: '+Object.keys(files).length);
    }catch(error){output.textContent='FAIL: '+error.message+'\n'+lines.join('\n');output.dataset.done='failed';console.error(error);}
})();
