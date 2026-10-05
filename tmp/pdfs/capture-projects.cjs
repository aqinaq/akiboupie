const {chromium}=require('/Users/aruispan/tourism/node_modules/playwright');
(async()=>{const b=await chromium.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true});
for(const [name,url] of [['akanki','http://127.0.0.1:4310'],['joryq','http://127.0.0.1:4311'],['mammamia','http://127.0.0.1:4312'],['bagyt','http://127.0.0.1:4313'],['aielts','http://127.0.0.1:4314'],['dos-optics','https://dosoptics.vercel.app/']]){
const p=await b.newPage({viewport:{width:1440,height:1000},deviceScaleFactor:1});try{await p.goto(url,{waitUntil:'networkidle',timeout:20000});await p.evaluate(()=>document.fonts.ready);await p.screenshot({path:`tmp/pdfs/${name}.png`});console.log(name,await p.title())}catch(e){console.log(name,e.message.slice(0,150))}await p.close()}
await b.close()})();
