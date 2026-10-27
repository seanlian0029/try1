/* Google Identity Services OAuth token flow (same style as attendance example). */
window.ScholarshipAuth=(()=>{
 'use strict';let client=null;
 function connect(){
  const c=window.SCHOLARSHIP_CONFIG;
  if(!window.google?.accounts?.oauth2)throw Error('Google sign-in is still loading. Try again.');
  for(let k of ['apiKey','clientId','recordsSpreadsheetId','informationSpreadsheetId'])if(!c[k]||c[k].includes('PASTE_'))throw Error('Please set '+k+' in config.js.');
  return new Promise((resolve,reject)=>{
   client=google.accounts.oauth2.initTokenClient({client_id:c.clientId,
    scope:'https://www.googleapis.com/auth/spreadsheets https://www.googleapis.com/auth/userinfo.email',
    error_callback:(err)=>reject(Error(err?.message||'Google sign-in was closed or blocked. Check the authorized JavaScript origin.')),
    callback:(result)=>{if(result.error)return reject(Error(result.error_description||result.error));window.ScholarshipAPI.setToken(result.access_token,result.expires_in);resolve();}});
   client.requestAccessToken({prompt:'select_account'});
  });
 }
 function disconnect(){window.ScholarshipAPI.clearToken();}
 return {connect,disconnect};
})();
