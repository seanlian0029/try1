(()=>{
 'use strict';
 const c=window.SCHOLARSHIP_CONFIG,a=window.ScholarshipAPI,auth=window.ScholarshipAuth,$=id=>document.getElementById(id);
 let ready=false,busy=false,userEmail='',activeStage='1',stage1Hit=null,stage3Hit=null,stage2Mode='idle',stage2Row=0;
 const stageLabels={1:['STUDENT RECORD STATION','Record Entry','01'],2:['STUDENT INFORMATION STATION','Student Information','02'],3:['RENEWAL CONFIRMATION STATION','Renewal Confirmation','03']};
 const keys=['name','course','year','gender','phone','email','address'];
 const formatId=v=>{let d=String(v||'').replace(/\D/g,'').slice(0,11);return d.slice(0,4)+(d.length>4?'-'+d.slice(4,6):'')+(d.length>6?'-'+d.slice(6):'');};
 function studentId(n){let id=$('id'+n).value;if(!/^\d{4}-\d{2}-\d{5}$/.test(id))throw Error('Enter a complete student ID, for example 2021-07-00227.');return id;}
 function semester(n){const s=$('sem'+n).value.replace(/\s+/g,' ').trim();if(!s)throw Error('Enter the school year / semester.');return s;}
 function status(s,isError=false){$('status').textContent=s;$('status').style.color=isError?'#c03747':'';}
 function fields(n){return {gwa:$('gwa'+n).value.trim(),gratis:$('gratis'+n).value.trim(),fellow:$('fellow'+n).value.trim(),care:$('care'+n).value.trim()};}
 function checkReady(){if(!ready)throw Error('Connect Google first.');}
 function isComplete(f){return ['gwa','gratis','fellow','care'].some(k=>String(f[k]||'').trim());}
 function setBusy(v){busy=v;document.querySelectorAll('button').forEach(b=>{if(b.id==='theme')return;b.disabled=v;});}
 async function task(fn){if(busy)return;setBusy(true);try{await fn();}catch(e){status(e.message||String(e),true);}finally{setBusy(false);}}
 function switchStage(n){activeStage=String(n);document.querySelectorAll('.tab').forEach(b=>b.classList.toggle('active',b.dataset.stage===activeStage));for(let i=1;i<=3;i++)$('stage'+i).classList.toggle('hidden',String(i)!==activeStage||!ready);const [eyebrow,title,num]=stageLabels[activeStage];$('eyebrow').textContent=eyebrow;$('title').textContent=title;$('num').textContent=num;status('');}
 function clearStage(n){for(const k of ['id','name','course','gwa','gratis','fellow','care']){let el=$(k+n);if(el)el.value='';}if(n==='3'){$('remarks3').value='RENEW';$('other3').value='';$('other-wrap').classList.add('hidden');}}
 async function locate(id){
  // Mirrors original Stage 1 lookup: search school year tabs, Student ID column C, Name D, Course F.
  const tabs=(await a.metadata(c.recordsSpreadsheetId)).map(x=>x.properties.title).filter(t=>/^\d{4}-\d{4}$/.test(t));
  const expected=id.slice(0,4)+'-'+(Number(id.slice(0,4))+1);
  // Check expected destination first. The original submit writes to this tab.
  const order=[expected,...tabs.filter(t=>t!==expected)];
  for(const tab of order){if(!tabs.includes(tab))continue;const rows=await a.read(c.recordsSpreadsheetId,tab,'C3:F');for(let i=0;i<rows.length;i++){const r=rows[i];if(String(r[0]||'').trim()===id)return {id,tab,row:i+3,name:r[1]||'',course:r[3]||'',expected};}}
  return null;
 }
 async function semesterColumn(tab,sem){
  // Original submitRenewalRecord checks the MERGED row 2 headers and normalizes spaces/case.
  const meta=(await a.metadata(c.recordsSpreadsheetId)).find(sh=>sh.properties.title===tab);
  if(!meta)throw Error('Missing school-year tab: '+tab);
  const row=await a.read(c.recordsSpreadsheetId,tab,'2:2');const values=row[0]||[];
  for(const m of meta.merges||[]){if(m.startRowIndex!==1||m.endRowIndex!==2)continue;const col=m.startColumnIndex; if(a.norm(values[col]||'')===a.norm(sem))return col+1;}
  throw Error('Semester not found in merged row 2 headings. Type the same semester text used in the records sheet.');
 }
 async function search1(){checkReady();const id=studentId(1);stage1Hit=null;const hit=await locate(id);if(!hit){$('name1').value='';$('course1').value='';throw Error('Student ID not found in school-year records.');}$('name1').value=hit.name;$('course1').value=hit.course;stage1Hit=hit;status('Student found: '+hit.name+' ('+hit.tab+').');}
 async function save1(){checkReady();const id=studentId(1),sem=semester(1),f=fields(1);if(!isComplete(f))throw Error('Enter Stage 1 record information first.');if(!stage1Hit||stage1Hit.id!==id)throw Error('Search for this Student ID first.');if(stage1Hit.tab!==stage1Hit.expected)throw Error('This student is in '+stage1Hit.tab+' but the original submission targets '+stage1Hit.expected+'.');let col=await semesterColumn(stage1Hit.tab,sem);let range=a.column(col)+stage1Hit.row+':'+a.column(col+3)+stage1Hit.row;
  await a.write(c.recordsSpreadsheetId,stage1Hit.tab,range,[[f.gwa,f.gratis,f.fellow,f.care]]);
  clearStage(1);stage1Hit=null;status('✓ Stage 1 record saved to '+stage1HitLabel(id)+' · '+sem+'.');
 }
 function stage1HitLabel(id){return id.slice(0,4)+'-'+(Number(id.slice(0,4))+1);}
 function display2(x){for(const k of keys)$(k+'2').value=x[k]||'';}
 async function search2(){checkReady();const id=studentId(2);stage2Mode='idle';stage2Row=0;display2({});$('addNew2').classList.add('hidden');const rows=await a.read(c.informationSpreadsheetId,c.informationSheet,'A2:H');let hit=null;
  for(let i=0;i<rows.length;i++)if(String(rows[i][0]||'').trim()===id){hit={row:i+2,v:rows[i]};break;}
  if(!hit){stage2Mode='notfound';$('addNew2').classList.remove('hidden');$('stage2hint').textContent='No record found. Click Add New Student to enter student information.';status('No matching student information was found.');return;}
  stage2Row=hit.row;stage2Mode='found';const v=hit.v;display2({name:v[1],course:v[2],year:v[3],gender:v[4],phone:v[5],address:v[6],email:v[7]});$('stage2hint').textContent='Student found. You can complete blank fields or update information.';status('Student information loaded.');
 }
 async function save2(){checkReady();const id=studentId(2);if(!['new','found'].includes(stage2Mode))throw Error('Search first; if no record is found, click Add New Student.');let f=Object.fromEntries(keys.map(k=>[k,$(k+'2').value.trim()]));if(!f.name||!f.course)throw Error('Student name and course are required.');const row=[id,f.name,f.course,f.year,f.gender,f.phone,f.address,f.email];
  // Refresh duplicate check before saving to reduce accidental duplicates across workstations.
  const rows=await a.read(c.informationSpreadsheetId,c.informationSheet,'A2:A');const existing=rows.findIndex(r=>String(r[0]||'').trim()===id);
  if(existing>=0){await a.write(c.informationSpreadsheetId,c.informationSheet,'A'+(existing+2)+':H'+(existing+2),[row]);status('✓ Student information updated.');}
  else {await a.append(c.informationSpreadsheetId,c.informationSheet,'A:H',[row]);status('✓ New student information saved.');}
  stage2Mode='idle';stage2Row=0;$('addNew2').classList.add('hidden');$('stage2hint').textContent='Search Student ID to check for an existing profile.';$('id2').value='';display2({});
 }
 async function search3(){checkReady();const id=studentId(3),sem=semester(3);stage3Hit=null;const hit=await locate(id);if(!hit)throw Error('Student ID not found in Stage 1 records.');if(hit.tab!==hit.expected)throw Error('Student is listed in an unexpected school-year tab: '+hit.tab);let col=await semesterColumn(hit.tab,sem);let v=(await a.read(c.recordsSpreadsheetId,hit.tab,a.column(col)+hit.row+':'+a.column(col+4)+hit.row))[0]||[];
  for(const k of ['gwa','gratis','fellow','care'])$(k+'3').value='';$('name3').value=hit.name;$('course3').value=hit.course;['gwa','gratis','fellow','care'].forEach((k,i)=>$(k+'3').value=v[i]||'');
  if(!isComplete(fields(3)))throw Error('No Stage 1 values found for this student and semester. Confirm Stage 1 was submitted.');
  const r=String(v[4]||'').trim();$('remarks3').value=['RENEW','SKTK','EXIT'].includes(r)?r:r?'OTHERS':'RENEW';$('other3').value=['RENEW','SKTK','EXIT'].includes(r)?'':r;$('other-wrap').classList.toggle('hidden',$('remarks3').value!=='OTHERS');
  stage3Hit={...hit,col,sem};status('Stage 1 record loaded. Review corrections and choose remarks.');
 }
 async function save3(){checkReady();const id=studentId(3),sem=semester(3),f=fields(3);if(!stage3Hit||stage3Hit.id!==id||a.norm(stage3Hit.sem)!==a.norm(sem))throw Error('Search this Student ID and semester first.');
  const choice=$('remarks3').value,remarks=choice==='OTHERS'?$('other3').value.trim():choice;if(!remarks)throw Error('Please specify other remarks.');
  // Preserve original five adjacent semester fields; add ID to column B of RENEWED.
  const existing=await a.read(c.informationSpreadsheetId,c.renewedSheet,'B2:B');const exists=existing.some(row=>String(row[0]||'').trim()===id);
  await a.write(c.recordsSpreadsheetId,stage3Hit.tab,a.column(stage3Hit.col)+stage3Hit.row+':'+a.column(stage3Hit.col+4)+stage3Hit.row,[[f.gwa,f.gratis,f.fellow,f.care,remarks]]);
  if(!exists){
    // Sheets value update to next free row B; doesn't overwrite columns A/C:F.
    const row=existing.length+2;
    try{await a.write(c.informationSpreadsheetId,c.renewedSheet,'B'+row,[[id]]);}catch(e){throw Error('Record corrections saved, but RENEWED column B could not be updated: '+e.message+'; check the spreadsheet before retrying.');}
  }
  clearStage(3);stage3Hit=null;status('✓ Renewal confirmed. Record updated'+(exists?' (already in RENEWED).':' and Student ID saved to RENEWED column B.') );
 }
 function disconnect(s='Disconnected. Connect Google to begin.'){
  auth.disconnect();ready=false;userEmail='';stage1Hit=null;stage3Hit=null;stage2Mode='idle';$('navigation').classList.add('hidden');document.querySelectorAll('section[id^="stage"]').forEach(el=>el.classList.add('hidden'));$('connectBtn').classList.remove('hidden');$('disconnectBtn').classList.add('hidden');$('connectionStatus').textContent=s;status('');
 }
 async function connect(){await auth.connect();try{
   const email=(await a.getAuthEmail()).trim().toLowerCase();
   const allowed=(c.allowedEmails||[]).map(v=>String(v).trim().toLowerCase());
   if(c.requireAllowedEmail&&!allowed.includes(email))throw Error('This account is not permitted to use this portal: '+email);
   // Frontend email checking only affects this UI. Google Sheet sharing is the real access gate.
   userEmail=email;ready=true;$('navigation').classList.remove('hidden');
   document.querySelectorAll('.tab').forEach(b=>b.classList.remove('hidden'));
   $('connectBtn').classList.add('hidden');$('disconnectBtn').classList.remove('hidden');
   $('connectionStatus').textContent='Connected: '+email;
   switchStage('1');
  }catch(e){disconnect(e.message);throw e;}
 }
 document.querySelectorAll('.tab').forEach(b=>b.onclick=()=>{if(ready)switchStage(b.dataset.stage);});
 document.querySelectorAll('.student-id').forEach(el=>el.addEventListener('input',()=>{el.value=formatId(el.value);if(el.id==='id1')stage1Hit=null;if(el.id==='id3')stage3Hit=null;if(el.id==='id2')stage2Mode='idle';}));
 const savedSem=(()=>{try{return localStorage.getItem('scholarship.semester')||'2026-2027 1st Sem';}catch(e){return '2026-2027 1st Sem';}})();
 document.querySelectorAll('.semester').forEach(el=>{el.value=savedSem;el.addEventListener('input',()=>{document.querySelectorAll('.semester').forEach(other=>{if(other!==el)other.value=el.value;});try{localStorage.setItem('scholarship.semester',el.value);}catch(e){};stage3Hit=null;});});
 document.querySelectorAll('[data-search]').forEach(b=>b.onclick=()=>task(()=>({1:search1,2:search2,3:search3})[b.dataset.search]()));
 document.querySelectorAll('[data-save]').forEach(b=>b.onclick=()=>task(()=>({1:save1,2:save2,3:save3})[b.dataset.save]()));
 $('addNew2').onclick=()=>{stage2Mode='new';$('addNew2').classList.add('hidden');$('stage2hint').textContent='New student: complete the fields and click Save Student Information.';$('name2').focus();};
 $('remarks3').onchange=()=>{$('other-wrap').classList.toggle('hidden',$('remarks3').value!=='OTHERS');};
 $('connectBtn').onclick=()=>task(connect);$('disconnectBtn').onclick=()=>disconnect();$('theme').onclick=()=>{document.documentElement.classList.toggle('dark');};
 document.querySelectorAll('input').forEach(el=>el.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();if(el.id==='id1')task(search1);else if(el.id==='id2')task(search2);else if(el.id==='id3')task(search3);}}));
})();
