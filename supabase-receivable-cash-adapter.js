/* BIG BROTHER — Daily Receivable Cash Summary Supabase Adapter V1 */
(function(){
  'use strict';
  const URL='https://sjfhlaclgmkwwofzstok.supabase.co';
  const KEY='sb_publishable_w762jR65CWwlO30fKQsYOw_6L9grx8S';
  const SESSION_KEY='BB_SUPABASE_DEV_SESSION_V1';
  let session=null;

  function readSession(){try{return JSON.parse(localStorage.getItem(SESSION_KEY)||'null')}catch(_){return null}}
  function saveSession(v){session=v||null;try{if(!v){localStorage.removeItem(SESSION_KEY);return;}if(!v.expires_at&&v.expires_in)v.expires_at=Math.floor(Date.now()/1000)+Number(v.expires_in);localStorage.setItem(SESSION_KEY,JSON.stringify(v));}catch(_){}}
  async function parse(r){const t=await r.text();let d={};try{d=t?JSON.parse(t):{}}catch(_){d={message:t}}if(!r.ok)throw new Error(d.message||d.error_description||d.error||('Database request failed ('+r.status+')'));return d}
  async function refreshSession(){const c=readSession();if(!c?.refresh_token)throw new Error('Please sign in to BIG BROTHER first.');const r=await fetch(URL+'/auth/v1/token?grant_type=refresh_token',{method:'POST',headers:{apikey:KEY,'Content-Type':'application/json'},body:JSON.stringify({refresh_token:c.refresh_token})});const n=await parse(r);saveSession(n);return n}
  async function ensureSession(){session=readSession();if(!session?.access_token)throw new Error('Please sign in to BIG BROTHER first.');const now=Math.floor(Date.now()/1000);if(session.expires_at&&Number(session.expires_at)<now+30)await refreshSession();return session}
  async function rpc(fn,args={}){await ensureSession();const r=await fetch(URL+'/rest/v1/rpc/'+fn,{method:'POST',headers:{apikey:KEY,Authorization:'Bearer '+session.access_token,'Content-Type':'application/json'},body:JSON.stringify(args||{}),cache:'no-store'});return parse(r)}

  async function fetchJson(_url,params={}){
    const action=String(params.action||'');
    if(action==='dailyReceivableCashCollection')return rpc('bb_daily_receivable_cash_collection');
    throw new Error('Unsupported Daily Receivable Cash action: '+action);
  }

  async function accessProfile(){return rpc('bb_daily_receivable_cash_access_profile');}
  async function locationMap(){
    const d=await rpc('bb_daily_receivable_cash_collection');
    const map={};
    (Array.isArray(d?.locations)?d.locations:[]).forEach(l=>{const c=String(l?.locationCode||'').trim();if(c)map[c.toLowerCase()]=String(l?.locationName||c).trim()||c;});
    return map;
  }

  window.BBDailyReceivableCashAdapter={rpc,fetchJson,ensureSession,accessProfile,locationMap};
})();