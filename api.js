/* OAuth Sheets API client. Does not contain credentials or user records. */
window.ScholarshipAPI = (()=>{
 'use strict';
 const c=window.SCHOLARSHIP_CONFIG;
 let accessToken='',expiresAt=0;
 function setToken(token,seconds){accessToken=token;expiresAt=Date.now()+Math.max(0,(Number(seconds)||3600)-60)*1000;}
 function clearToken(){accessToken='';expiresAt=0;}
 function quote(name){return "'"+String(name).replace(/'/g,"''")+"'";}
 function qrange(name,r){return quote(name)+'!'+r;}
 async function call(spreadsheetId,path,opts={}){
  if(!accessToken||Date.now()>=expiresAt)throw Error('Google authorization expired. Disconnect and connect again.');
  if(!spreadsheetId||spreadsheetId.includes('PASTE_'))throw Error('Enter your spreadsheet IDs in config.js first.');
  const url='https://sheets.googleapis.com/v4/spreadsheets/'+encodeURIComponent(spreadsheetId)+path+(path.includes('?')?'&':'?')+'key='+encodeURIComponent(c.apiKey);
  const res=await fetch(url,{method:opts.method||'GET',headers:{Authorization:'Bearer '+accessToken,'Content-Type':'application/json'},body:opts.body?JSON.stringify(opts.body):undefined});
  const data=await res.json().catch(()=>({}));
  if(!res.ok)throw Error(data.error?.message||'Google Sheets request failed (HTTP '+res.status+').');
  return data;
 }
 async function read(sheetId,tab,rng){return (await call(sheetId,'/values/'+encodeURIComponent(qrange(tab,rng))+'?valueRenderOption=FORMATTED_VALUE')).values||[];}
 async function write(sheetId,tab,rng,values){return call(sheetId,'/values/'+encodeURIComponent(qrange(tab,rng))+'?valueInputOption=RAW',{method:'PUT',body:{values}});}
 async function batch(sheetId,changes){return call(sheetId,'/values:batchUpdate',{method:'POST',body:{valueInputOption:'RAW',data:changes.map(a=>({range:qrange(a.tab,a.range),values:a.values}))}});}
 async function append(sheetId,tab,rng,values){return call(sheetId,'/values/'+encodeURIComponent(qrange(tab,rng))+':append?valueInputOption=RAW&insertDataOption=INSERT_ROWS',{method:'POST',body:{values}});}
 async function metadata(sheetId){const data=await call(sheetId,'?fields=sheets(properties(title,sheetId,gridProperties),merges)');return data.sheets||[];}
 function column(index){let v='';for(let n=index;n>0;n=Math.floor((n-1)/26))v=String.fromCharCode(65+(n-1)%26)+v;return v;}
 function norm(x){return String(x??'').replace(/\s+/g,' ').trim().toLowerCase();}
 function getAuthEmail(){if(!accessToken)throw Error('Connect Google first.');return fetch('https://www.googleapis.com/oauth2/v3/userinfo',{headers:{Authorization:'Bearer '+accessToken}}).then(async r=>{let j=await r.json();if(!r.ok)throw Error(j.error_description||'Unable to verify Google account.');return String(j.email||'').toLowerCase().trim();});}
 return {setToken,clearToken,read,write,batch,append,metadata,column,norm,getAuthEmail};
})();
