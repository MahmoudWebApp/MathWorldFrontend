// Local fixture-only responsive smoke test. Never uses real accounts or production data.
const {createServer}=require('node:http');
const {createRequire}=require('node:module');
const assert=require('node:assert/strict');
const base='http://127.0.0.1:4173';
const track={Id:1,StageId:1,Code:'grade-1',Kind:'Grade',NameAr:'الصف الأول',NameEn:'Grade one',DescriptionAr:'تدريب',DescriptionEn:'Practice'};
const topic={Id:1,NameAr:'الأعداد والعمليات الحسابية',NameEn:'Numbers and arithmetic operations',DescriptionAr:'تدريب الأعداد',DescriptionEn:'Number practice',Icon:'',IsFree:true,ProblemsCount:20};
const practice={TrackId:1,CategoryId:1,Total:2,Page:1,PageSize:10,Items:[{Id:1,CategoryId:1,TitleAr:'جمع الأعداد',TitleEn:'Addition',Points:10,IsSolved:false},{Id:2,CategoryId:1,TitleAr:'طرح الأعداد',TitleEn:'Subtraction',Points:10,IsSolved:false}]};
function token(role){return ['eyJhbGciOiJub25lIn0',Buffer.from(JSON.stringify({role,exp:Math.floor(Date.now()/1000)+3600})).toString('base64url'),'fixture'].join('.')}
function roleOf(req){try{return JSON.parse(Buffer.from((req.headers.authorization||'').split('.')[1],'base64url')).role}catch{return 'Student'}}
function fixture(req){
 const path=new URL(req.url,'http://localhost').pathname.replace(/^\/api/,'');
 const role=roleOf(req);
 const user={Id:1,FullName:'Responsive Fixture Student',Email:'responsive-fixture@example.invalid',Role:role,SubscriptionType:'Premium',CurrentStageId:1};
 const solvedFixture=id=>({Id:id,PracticeScopeId:1,Title:'Fixture internal title '+id,QuestionText:'Fixture question '+id,StageId:1,StageName:'Primary',CategoryId:1,CategoryName:'Numbers',Points:10,ViewsCount:0,IsSolved:true,HasAttempted:true,WasCorrect:true,SelectedOptionId:id*10,CorrectOptionId:id*10,IsFavorite:false,AttemptCount:1,FirstAttemptCorrect:true,CanRetry:false,MasteryStatus:'Mastered',IsInErrorNotebook:false,IsErrorNotebookArchived:false,DetailedSolution:'$1+1=2$',Options:[{Id:id*10,LatexCode:'2',Order:1},{Id:id*10+1,LatexCode:'3',Order:2}]});
 const routes={
  '/users/profile':user,
  '/users/onboarding':{NextStep:'Complete'},
  '/users/subscription':{IsPremium:true,SubscriptionType:'Premium'},
  '/users/learning-stage':{StageId:1,NameAr:'الابتدائية',NameEn:'Primary'},
  '/users/learning-track':{Enabled:true,StageId:1,TrackId:1,Track:track},
  '/stages/1/tracks':{Enabled:true,Items:[{...track,ProblemsCount:20,CategoriesCount:1,SkillsCount:1,FreeProblemsCount:20}]},
  '/learning-tracks/1':{Track:track,Categories:[topic],Skills:[],Examples:[]},
  '/users/learning-tracks/1/progress':{TrackId:1,StageId:1,TrackPracticeIsolationEnabled:true,ProblemsCount:20,Solved:0,CompletionPercent:0,Categories:[{CategoryId:1,ProblemsCount:20,IsLocked:false,Solved:0,Attempted:0,Mastered:0}]},
  '/users/learning-tracks/1/categories/1/problems':practice,
  '/users/learning-tracks/continue':{TrackId:1,Problem:null},
  '/problems/1':solvedFixture(1),
  '/problems/2':solvedFixture(2),
  '/users/learning-tracks/1/categories/1/next':new URL(req.url,'http://localhost').searchParams.get('afterProblemId')==='1'?{TrackId:1,CategoryId:1,HasNext:true,Problem:{Id:2,CategoryId:1,TitleAr:'طرح',TitleEn:'Subtraction',RequiresRetry:false}}:{TrackId:1,CategoryId:1,HasNext:false},

  '/users/dashboard':{...user,SolvedProblemsCount:0,FavoriteProblemsCount:0,TotalPoints:0,SuccessRate:0,RecentSolved:[],RecentFavorites:[],RecentActivities:[]},
  '/users/journey':{StageId:1,TrackId:1,StageNameAr:'الابتدائية',StageNameEn:'Primary',Categories:[],SolvedProblems:0,TotalProblems:20,TotalPoints:0,AttemptedProblems:0,CompletionPercent:0,LearningSessionsEnabled:false},
  '/stages/1/free-categories':{StageId:1,FreeCategoryIds:[1],Categories:[]},
  '/users/custom-exams/availability':{Enabled:true},
  '/users/custom-exams/setup':{Track:track,Categories:[{...topic,Count:20,DifficultyCounts:[{Level:1,Count:20}]}],Counts:[5,10,15,20],PassPercent:70},
  '/users/custom-exams':{Items:[],Total:0,PageSize:10,HasUnfinished:false},
  '/users/certificates':{IssuanceEnabled:false,Items:[]},
  '/admin/engagement/overview':{TotalStudents:0,NewStudents:0,ActiveSolvers:0,OnlineLearners:0,DailyActivity:[],Stages:[]},
  '/stages':[], '/categories':[],
 };
 return Object.prototype.hasOwnProperty.call(routes,path)?routes[path]:undefined;
}
if(process.argv.includes('--api')){
 createServer((req,res)=>{
  res.setHeader('Access-Control-Allow-Origin','*');
  res.setHeader('Access-Control-Allow-Headers','*');
  res.setHeader('Access-Control-Allow-Methods','GET, POST, OPTIONS');
  res.setHeader('Content-Type','application/json');
  if(req.method==='OPTIONS'){res.writeHead(204);return res.end()}
  if(req.method==='POST'&&new URL(req.url,'http://localhost').pathname==='/api/auth/forgot-password'){
   let body='';req.on('data',chunk=>body+=chunk);req.on('end',()=>{
    let email;try{email=JSON.parse(body).Email}catch{}
    if(email==='not-registered@example.invalid'){res.writeHead(404);res.end(JSON.stringify({Success:false,Errors:{Email:['RecoveryEmailNotRegistered']}}));}
    else{res.writeHead(202);res.end(JSON.stringify({Success:true,Data:{Accepted:true}}));}
   });return;
  }
  if(req.method!=='GET'){res.writeHead(405);return res.end(JSON.stringify({Message:'Fixture is read-only'}))}
  const data=fixture(req);
  res.writeHead(data===undefined?503:200);
  res.end(JSON.stringify(data===undefined?{Message:'Fixture endpoint not implemented'}:{Success:true,Data:data}));
 }).listen(4174,'127.0.0.1');
}else{
 const load=createRequire(process.env.PLAYWRIGHT_HOME+'/package.json');
 const {chromium}=load('playwright');
 const fs=require('node:fs');
 const errors=[];
 async function run(){
  const browser=await chromium.launch({headless:true});
  fs.mkdirSync('mobile-browser-results',{recursive:true});
  try{
   for(const [locale,width,scheme] of [['ar',320,'light'],['ar',390,'dark'],['ar',430,'light'],['en',320,'dark'],['en',390,'light'],['en',430,'dark']]){
    for(const role of ['public','Student','Admin']){
     const context=await browser.newContext({viewport:{width,height:844},isMobile:true,hasTouch:true,deviceScaleFactor:1,colorScheme:scheme});
     // Block all external network requests; fixtures only.
     await context.route('**/*',route=>{const u=new URL(route.request().url());return u.hostname==='127.0.0.1'?route.continue():route.abort()});
     if(role!=='public')await context.addCookies([{name:'token',value:token(role),url:base}]);
     const page=await context.newPage();
     const pageErrors=[];
     page.on('pageerror',error=>pageErrors.push(error.message));
     const paths=role==='public'?['/','/login','/register','/stages','/contact','/premium','/about','/forgot-password']:role==='Student'?['/dashboard','/dashboard/categories','/dashboard/categories/1/1','/dashboard/problems','/dashboard/favorites','/dashboard/solved','/dashboard/daily-challenge','/dashboard/exams','/dashboard/certificates','/dashboard/analytics','/dashboard/settings']:['/admin','/admin/users','/admin/categories','/admin/problems','/admin/learning-tracks','/admin/editorial','/admin/analytics','/admin/activity','/admin/settings'];
     for(const path of paths){
      const tag=[locale,width,scheme,role,path.replaceAll('/','_')].join('-');
      try{
       pageErrors.length=0;
       const response=await page.goto(base+'/'+locale+(path==='/'?'':path),{waitUntil:'domcontentloaded',timeout:25000});
       assert(response&&response.ok(),'HTTP '+response?.status());
       await page.waitForTimeout(650);
       assert(!page.url().includes('/login')||path==='/login','Unexpected authentication redirect');
       if(path==='/dashboard/categories/1/1')await page.getByText(locale==='ar'?topic.NameAr:topic.NameEn,{exact:true}).last().waitFor({timeout:10000});
       if(path==='/dashboard/exams')await page.getByRole('button',{name:locale==='ar'?'إنشاء امتحان':'New exam',exact:true}).waitFor({timeout:10000});
       const size=await page.evaluate(()=>({width:document.documentElement.clientWidth,scroll:document.documentElement.scrollWidth}));
       assert(size.scroll<=size.width+2,'Horizontal overflow '+JSON.stringify(size));
       assert.equal(pageErrors.length,0,pageErrors.join('; '));
       if(path==='/forgot-password'){
        const email=page.locator('input[type=email]');
        await email.fill('not-registered@example.invalid');
        const submit=page.getByRole('button',{name:locale==='ar'?'طلب رابط الاستعادة':'Request recovery link',exact:true});
        assert(await submit.isEnabled(),'Local recovery fixture must be ready without external CAPTCHA');
        {
         await submit.click();
         await page.getByRole('alert').filter({hasText:locale==='ar'?'البريد الإلكتروني غير مستخدم في المنصة.':'This email is not registered on the platform.'}).waitFor({timeout:10000});
         assert.equal(await email.inputValue(),'not-registered@example.invalid');
         console.log('PASS recovery unknown email',locale,width,scheme);
        }
       }
       if(path==='/dashboard/categories'){
        const card=page.getByRole('link',{name:locale==='ar'?topic.NameAr:topic.NameEn,exact:true});
        await card.waitFor({timeout:10000});
        await card.click();
        await page.waitForURL('**/dashboard/categories/1/1');
       }
       if(path==='/dashboard/exams'){
        await page.getByRole('button',{name:locale==='ar'?'امتحاناتي وشهاداتي':'My exams and certificates',exact:true}).click();
        await page.getByText(locale==='ar'?'لا توجد امتحانات سابقة.':'No previous exams.',{exact:true}).waitFor({timeout:10000});
       }
       if(path==='/dashboard/categories/1/1'){
        const crumb=page.getByRole('navigation',{name:locale==='ar'?'مسار التنقل':'Breadcrumb',exact:true});
        await crumb.getByRole('link',{name:locale==='ar'?'الفئات':'Topics',exact:true}).waitFor({timeout:10000});
        assert.equal(await page.getByRole('link',{name:locale==='ar'?'العودة للفئات':'Back to topics',exact:true}).count(),0,'Duplicate category back action');
        await crumb.getByRole('link',{name:locale==='ar'?'الفئات':'Topics',exact:true}).click();
        await page.waitForURL('**/dashboard/categories');
        await page.goto(base+'/'+locale+'/dashboard/problems/1?trackId=1&categoryId=1',{waitUntil:'domcontentloaded'});
        const next=page.getByRole('link',{name:locale==='ar'?'المسألة التالية':'Next problem',exact:true});
        await next.waitFor({timeout:15000});
        assert.equal(await page.getByText('Fixture internal title 1',{exact:true}).count(),0,'Duplicate question title visible');
        await next.click();
        await page.waitForURL('**/dashboard/problems/2?trackId=1&categoryId=1');
        await page.getByText(locale==='ar'?'لا توجد مسائل أخرى غير محلولة ومتاحة في هذه الفئة.':'No other available unsolved problems in this topic.',{exact:true}).waitFor({timeout:15000});
        assert.equal(await next.count(),0,'Next link should not exist at end of category');
        await page.getByRole('navigation',{name:locale==='ar'?'مسار التنقل':'Breadcrumb',exact:true}).getByRole('link',{name:'Numbers',exact:true}).click();
        await page.waitForURL('**/dashboard/categories/1/1');
        assert.equal(pageErrors.length,0,pageErrors.join('; '));
        console.log('PASS continuation',locale,width,scheme);
       }
       console.log('PASS',tag);
      }catch(e){errors.push(tag+': '+e.message);console.error('FAIL',tag,e.message);await page.screenshot({path:'mobile-browser-results/'+tag+'.png',fullPage:true}).catch(()=>{});}
     }
     await context.close();
    }
   }
  }finally{await browser.close();fs.writeFileSync('mobile-browser-results/report.json',JSON.stringify({errors},null,2))}
  assert.equal(errors.length,0,errors.join('\n'));
 }
 run().catch(error=>{console.error(error);process.exitCode=1});
}
