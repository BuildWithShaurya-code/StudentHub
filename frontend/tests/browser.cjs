// Run against an isolated MySQL backend only. No production records are changed.
const assert = require('node:assert/strict');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const base = process.env.TEST_FRONTEND_URL || 'http://localhost:3010';
const api = process.env.TEST_API_URL || 'http://127.0.0.1:5011/api';
const fs = require('node:fs/promises');
const artifact = process.env.TEST_ARTIFACT_DIR || '../audit/artifacts';
const checks = [];
async function apiCall(path, options = {}) {
  const response = await fetch(api+path, {headers: {'Content-Type':'application/json'}, ...options});
  return {status:response.status, data:await response.json()};
}
async function main() {
  assert.equal((await apiCall('/health')).data.target_database,'studenthub_audit_test', 'Unsafe test target');
  await fs.mkdir(artifact,{recursive:true});
  const browser = await chromium.launch({headless:true, ...(process.env.CHROME_PATH ? {executablePath:process.env.CHROME_PATH} : {})});
  const page = await browser.newPage({viewport:{width:1440,height:1000}});
  await page.route('**/api/**', route => route.request().url().startsWith(api+'/') ? route.continue() : route.abort());
  await page.addInitScript(() => { window.print = () => { window.__printCalls = (window.__printCalls || 0) + 1; }; });
  const errors = [];
  const requests = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('response', response => {if(response.url().startsWith(api)) requests.push({url:response.url().replace(api,''),status:response.status()});});
  const ids = [];
  const suffix = Date.now().toString(36);
  const roll = 'BROWSER-'+suffix;
  let id;
  const check = async (name, fn) => {try { await fn(); checks.push({name,status:'PASS'}); console.log('PASS '+name); } catch(error) {checks.push({name,status:'FAIL',error:error.message});throw error;} };
  const navigate = async (screen) => {await page.goto(base+'/#/'+screen); await page.getByRole('status').waitFor({state:'hidden'}).catch(()=>{});};
  try {
    await check('Dashboard renders real empty database metrics',async()=>{
      await navigate('dashboard');
      await page.getByText('Welcome back, Administrator').waitFor();
      assert.equal((await apiCall('/students')).data.total,0);
      await page.screenshot({path:artifact+'/dashboard-desktop.png',fullPage:true});
    });
    await check('Dashboard to directory, empty state and add navigation',async()=>{
      await page.getByRole('button',{name:'Students',exact:true}).first().click();
      await page.getByText(/No students/).first().waitFor();
      await page.getByRole('button',{name:'Add Student',exact:true}).first().click();
      await page.getByRole('heading',{name:'Add New Student'}).waitFor();
    });
    await check('Form validation rejects empty student',async()=>{
      await page.getByRole('button',{name:'Save Student Record'}).click();
      await page.getByText('Roll number is required.',{exact:true}).waitFor();
      assert.equal((await apiCall('/students')).data.total,0);
    });
    await check('Create student through form; confirmed response and numeric ID route',async()=>{
      await page.getByLabel('Roll Number',{exact:true}).fill(roll);
      await page.getByLabel('Full Legal Name',{exact:true}).fill('Browser Synthetic Student');
      await page.getByLabel('Email Address',{exact:true}).fill(suffix+'@example.invalid');
      await page.getByLabel('Academic Marks',{exact:true}).fill('88.5');
      const saved = page.waitForResponse(r=>r.url()===api+'/students'&&r.request().method()==='POST');
      await page.getByRole('button',{name:'Save Student Record'}).click();
      const response = await saved; assert.equal(response.status(),201);
      const body = await response.json(); id=body.student.id; ids.push(id);
      await page.waitForURL('**/#/students/'+id);
      await page.getByRole('button',{name:'Edit Student'}).waitFor();
      assert.equal((await apiCall('/students/'+id)).data.student.marks,88.5);
      await page.screenshot({path:artifact+'/student-details-desktop.png',fullPage:true});
    });
    await check('Directory search and combined department/semester filters',async()=>{
      await page.getByRole('button',{name:'Back to Students',exact:true}).click();
      await page.getByLabel('Search students').fill(roll);
      await page.getByLabel('Filter by department').selectOption('Computer Science');
      await page.getByLabel('Filter by semester').selectOption('Semester 4');
      await page.getByRole('button',{name:'View',exact:true}).first().waitFor();
      await page.getByLabel('Search students').fill('NO-SUCH-AUDIT-RECORD');
      await page.getByText(/No students/).first().waitFor();
      await page.getByLabel('Search students').fill(roll);
      await page.getByRole('button',{name:'View',exact:true}).first().click();
      await page.getByRole('button',{name:'Edit Student'}).waitFor();
    });
    await check('Cancel edit preserves persisted data',async()=>{
      await page.getByRole('button',{name:'Edit Student'}).click();
      await page.getByLabel('Full Legal Name').fill('Unsaved Name');
      await page.getByRole('button',{name:/Cancel/}).last().click();
      await page.getByRole('button',{name:'Edit Student'}).waitFor();
      assert.equal((await apiCall('/students/'+id)).data.student.full_name,'Browser Synthetic Student');
    });
    await check('Edit saves to MySQL and returns updated details',async()=>{
      await page.getByRole('button',{name:'Edit Student'}).click();
      await page.getByLabel('Full Legal Name').fill('Browser Updated Student');
      await page.getByLabel('Academic Marks').fill('94.5');
      const saved = page.waitForResponse(r=>r.request().method()==='PUT');
      await page.getByRole('button',{name:'Save Changes'}).click();
      assert.equal((await saved).status(),200);
      await page.getByRole('button',{name:'Edit Student'}).waitFor();
      assert.equal((await apiCall('/students/'+id)).data.student.full_name,'Browser Updated Student');
      await page.reload(); await page.getByRole('button',{name:'Edit Student'}).waitFor();
      await page.getByText('94.5/100',{exact:true}).waitFor();
    });
    await check('Cancel delete preserves record',async()=>{
      await page.getByRole('button',{name:'Delete Student Record',exact:true}).click();
      const dialog = page.getByRole('dialog'); await dialog.waitFor();
      await dialog.getByRole('button',{name:'Cancel',exact:true}).click();
      await dialog.waitFor({state:'hidden'});
      assert.equal((await apiCall('/students/'+id)).status,200);
    });
    await check('Results show real metrics, CSV downloads, results open correct ID',async()=>{
      await navigate('results');
      assert.ok(!(await page.locator('body').innerText()).includes('1,248'));
      await page.getByLabel('Search students').fill(roll);
      await page.getByLabel('Filter by semester').selectOption('Semester 4');
      const download = page.waitForEvent('download');
      await page.getByRole('button',{name:/Export/}).click();
      const file = await download; await file.saveAs(artifact+'/results.csv');
      assert.match(await fs.readFile(artifact+'/results.csv','utf8'),/Browser Updated Student/);
      await page.getByText('Browser Updated Student',{exact:true}).click();
      await page.waitForURL('**/#/students/'+id);
      await page.getByRole('button',{name:'Edit Student'}).waitFor();
    });
    await check('Phone edit unavailable, absent coursework explicitly identified',async()=>{
      await page.getByText('Coursework is not recorded in the current database.').waitFor();
      await page.getByRole('button',{name:'Edit Student'}).click();
      assert.equal(await page.getByLabel('Phone number (not recorded)').isDisabled(),true);
    });
    await check('Print actions dispatch; notifications and demo are explicit',async()=>{
      await navigate('students/'+id);
      await page.getByRole('button',{name:/Print/}).click();
      assert.equal(await page.evaluate(()=>window.__printCalls),1);
      await page.getByLabel('View notifications').click();
      await page.getByText('No notifications available.',{exact:true}).waitFor();
      await navigate('feedback-states');
      await page.getByText(/UI demonstration only/).waitFor();
      assert.equal((await apiCall('/students/'+id)).status,200);
    });
    await check('Keyboard delete dialog traps focus and Escape cancels',async()=>{
      await navigate('students/'+id);
      await page.getByRole('button',{name:'Delete Student Record',exact:true}).click();
      await page.getByRole('dialog').waitFor();
      assert.equal(await page.evaluate(()=>document.activeElement.textContent.trim()),'Cancel');
      await page.keyboard.press('Tab');
      assert.equal(await page.evaluate(()=>document.activeElement.textContent.trim()),'Delete Student');
      await page.keyboard.press('Shift+Tab');
      assert.equal(await page.evaluate(()=>document.activeElement.textContent.trim()),'Cancel');
      await page.keyboard.press('Escape');
      await page.getByRole('dialog').waitFor({state:'hidden'});
      assert.equal((await apiCall('/students/'+id)).status,200);
    });
    await check('Directory/results pagination and result status filter',async()=>{
      for(let i=0;i<8;i++){
        const record = await apiCall('/students',{method:'POST',body:JSON.stringify({roll_number:'PAGE-'+suffix+'-'+i,full_name:'Pagination Synthetic '+i,email:'page-'+suffix+'-'+i+'@example.invalid',department:'Computer Science',semester:8,marks:i===0?20:70})});
        assert.equal(record.status,201);ids.push(record.data.student.id);
      }
      await navigate('students');
      await page.getByRole('button',{name:'Next page',exact:true}).click();
      assert.equal(await page.getByRole('button',{name:'Previous page',exact:true}).isEnabled(),true);
      await page.getByLabel('Search students').fill(roll);
      await page.getByRole('button',{name:'View',exact:true}).first().waitFor();
      await navigate('results');
      await page.getByRole('button',{name:'Next page',exact:true}).click();
      assert.equal(await page.getByRole('button',{name:'Previous page',exact:true}).isEnabled(),true);
      await page.getByLabel('Filter by semester').selectOption('Semester 8');
      await page.getByLabel('Filter by result status').selectOption('Fail / Backlog');
      await page.getByText('Pagination Synthetic 0',{exact:true}).waitFor();
      assert.equal(await page.getByText('Pagination Synthetic 1',{exact:true}).count(),0);
      for(const identifier of ids.filter(other=>other!==id)) await apiCall('/students/'+identifier,{method:'DELETE'});
    });
    await check('Mobile layout and navigation, no horizontal page overflow',async()=>{
      await page.setViewportSize({width:390,height:844});
      for(const screen of ['dashboard','students','add-student','students/'+id,'students/'+id+'/edit','results']){
        await navigate(screen);
        assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth <= window.innerWidth+1),screen+' overflows mobile viewport');
        await page.screenshot({path:artifact+'/mobile-'+screen.replaceAll('/','-')+'.png',fullPage:true});
      }
      await page.getByLabel('Toggle Navigation Menu').click();
      await page.getByRole('button',{name:'Dashboard',exact:true}).last().click();
      await page.getByText('Welcome back, Administrator').waitFor();
      await page.setViewportSize({width:1440,height:1000});
    });
    await check('Loading indicator and failure states for dashboard/directory/results',async()=>{
      for(const screen of ['dashboard','students','results']){
        let release; const gate = new Promise(resolve=>release=resolve);
        const route = async r=>{await gate; await r.fulfill({status:503,contentType:'application/json',body:JSON.stringify({message:'Simulated database unavailable'})});};
        await page.route(api+'/**',route);
        console.log('CHECK loading '+screen);
        await page.goto(base+'/?loading='+screen+'#/'+screen, {waitUntil:'domcontentloaded'});
        try { await page.getByRole('status').waitFor(); } finally { release(); }
        await page.getByRole('alert').filter({hasText:'Unable to load records'}).waitFor();
        await page.unroute(api+'/**',route);
      }
    });
    await check('Mutation failure displays error without success or phantom record',async()=>{
      await navigate('add-student');
      await page.getByLabel('Roll Number',{exact:true}).fill(roll+'-FAIL');
      await page.getByLabel('Full Legal Name').fill('Rejected Synthetic Student');
      await page.getByLabel('Email Address').fill('rejected-'+suffix+'@example.invalid');
      const route = async r=> r.request().method()==='POST' ? r.fulfill({status:503,contentType:'application/json',body:JSON.stringify({message:'Simulated save failure'})}):r.continue();
      await page.route(api+'/students',route);
      await page.getByRole('button',{name:'Save Student Record'}).click();
      await page.getByText('Simulated save failure',{exact:true}).waitFor();
      assert.ok(page.url().endsWith('/add-student'));
      await page.unroute(api+'/students',route);
    });
    await check('Missing student route shows explicit error and permits directory navigation',async()=>{
      await navigate('students/9223372036854775807');
      await page.getByRole('alert').filter({hasText:'Student not found'}).waitFor();
      await page.getByRole('button',{name:'Students',exact:true}).first().click();
      await page.getByRole('button',{name:'View',exact:true}).first().waitFor();
    });
    await check('Delete designated test student; final MySQL/API state',async()=>{
      await navigate('students/'+id);
      await page.getByRole('button',{name:'Delete Student Record',exact:true}).click();
      const deleted = page.waitForResponse(r=>r.request().method()==='DELETE');
      await page.getByRole('dialog').getByRole('button',{name:'Delete Student',exact:true}).click();
      assert.equal((await deleted).status(),200);
      await page.waitForURL('**/#/students');
      assert.equal((await apiCall('/students/'+id)).status,404);
    });
    await check('No uncaught browser JavaScript errors',async()=>assert.deepEqual(errors,[]));
  } finally {
    for (const identifier of ids) { if((await apiCall('/students/'+identifier)).status===200) await apiCall('/students/'+identifier,{method:'DELETE'}); }
    await fs.writeFile(artifact+'/browser-tests.json',JSON.stringify({checks,errors,requests},null,2));
    await browser.close();
  }
}
main().catch(error=>{console.error(error);process.exitCode=1;});
