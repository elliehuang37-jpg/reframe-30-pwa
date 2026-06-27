/* =====================================================================
   語言的魔力 · 30 天換框練習  —  app logic
   ===================================================================== */
"use strict";

const STORE_KEY = "reframe30_v1";
const PALETTE = ["--c-indigo","--c-purple","--c-blue","--c-rose","--c-green"];
const colorFor = (n) => `var(${PALETTE[(n-1) % PALETTE.length]})`;

/* ---------- 狀態存取 ---------- */
function loadState(){
  try{ return JSON.parse(localStorage.getItem(STORE_KEY)) || {}; }
  catch(e){ return {}; }
}
function saveState(s){ localStorage.setItem(STORE_KEY, JSON.stringify(s)); }
let state = loadState();
state.responses = state.responses || {};   // { day: text }
state.done = state.done || {};             // { day: true }
state.belief = state.belief || "";         // 使用者的限制性信念
state.currentDay = state.currentDay || 1;

function persist(){ saveState(state); }

/* ---------- 工具 ---------- */
const $ = (sel, el=document) => el.querySelector(sel);
const esc = (s="") => s.replace(/[&<>"]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;"}[c]));
function doneCount(){ return Object.values(state.done).filter(Boolean).length; }
function getDay(n){ return DAYS.find(d => d.day === n); }

/* 連續天數（streak）：以已完成的最大連續日數計 */
function currentStreak(){
  let s = 0;
  for(let i=1;i<=30;i++){ if(state.done[i]) s++; else break; }
  return s;
}

/* ---------- 頂部進度 ---------- */
function renderProgress(){
  const pct = Math.round(doneCount()/30*100);
  $("#progressFill").style.width = pct + "%";
  $("#progressPct").textContent = pct + "%";
  $("#progressDone").textContent = doneCount();
}

/* ===================================================================
   頁面：每日課程
   =================================================================== */
function renderDay(n){
  state.currentDay = n; persist();
  const d = getDay(n);
  const ac = (d.patternId) ? colorFor(d.patternId) : colorFor(d.day);
  const isDone = !!state.done[n];
  const view = $("#view");
  view.style.setProperty("--accent", ac);

  let html = `<div class="fade">`;

  /* 標題卡 */
  html += `<div class="card" style="border-top:4px solid ${ac}">
    <div class="eyebrow">Day ${d.day} ・ 第 ${d.week} 週 ${typeLabel(d.type)}</div>
    <h2 class="day-title">${esc(d.title)}</h2>
    <div class="day-sub">${esc(d.subtitle||"")}</div>
    ${isDone ? `<div class="completed-badge" style="margin-top:10px">✓ 今日已完成</div>`:``}
    <div class="concept">${esc(d.concept)}</div>`;

  /* 句型起手式（單式日） */
  if(d.stems){
    html += `<div class="stems"><h4>句型起手式</h4>` +
      d.stems.map(s=>`<div class="stem">「${esc(s)}」</div>`).join("") + `</div>`;
  }
  html += `</div>`;  // end title card

  /* 範例 / 信念框 */
  if(d.example){
    html += `<div class="card">`;
    html += `<div class="belief-box"><div class="tag">${d.type==='scenario'?'今日情境':'限制性信念'}</div>
      <div class="belief-text">${esc(d.example.belief)}</div></div>`;
    if(d.example.reframe){
      html += `<div class="reframe-box"><div class="tag">✦ 書中示範回應</div>
        <div class="reframe-text">${esc(d.example.reframe)}</div></div>`;
    }
    if(d.example.note){ html += `<div class="note">${esc(d.example.note)}</div>`; }
    html += `</div>`;
  }

  /* 全部 14 式（總演練 / 語庫日） */
  if(d.showAllPatterns){
    html += `<div class="card"><div class="section-title">14 式速查</div>
      <div class="section-desc">同一句話的 14 個出口</div>${patternListHTML(true)}</div>`;
  }

  /* 你自己的信念提醒（非 intro、非 scenario） */
  if(state.belief && d.type!=="intro" && d.type!=="scenario"){
    html += `<div class="card"><div class="belief-box"><div class="tag">你的練習信念（第 1 天設定）</div>
      <div class="belief-text">${esc(state.belief)}</div></div>
      <div class="note">每一式，都回頭套在這句話上練。</div></div>`;
  }

  /* 練習欄 */
  if(d.practice){
    const val = state.responses[n] || "";
    html += `<div class="card practice">
      <div class="label"><span class="dot"></span>${esc(d.practice.instruction)}</div>
      <textarea id="respBox" placeholder="${esc(d.practice.placeholder||'寫下你的練習…')}">${esc(val)}</textarea>
      <div class="save-row">
        <button class="btn btn-ghost" id="saveBtn">儲存草稿</button>
        <span class="saved-hint" id="savedHint">已儲存 ✓</span>
      </div>`;
    if(d.practice.isOnboarding){
      html += `<div class="note">這句話會自動成為你接下來 29 天的練習對象。</div>`;
    }
    html += `</div>`;
  }

  /* 挑戰 */
  if(d.challenge){
    html += `<div class="card"><div class="challenge">
      <span class="ico">🎯</span>
      <div class="txt"><b>今日小挑戰：</b>${esc(d.challenge)}</div></div></div>`;
  }

  /* 完成 / 導航 */
  html += `<div class="card">
    <button class="btn ${isDone?'btn-ghost':'btn-done'} btn-block" id="doneBtn">
      ${isDone ? '↺ 取消完成標記' : '✓ 標記今日已完成'}
    </button>
    <div class="day-nav">
      <button class="btn btn-ghost" id="prevBtn" ${n<=1?'disabled':''}>← 前一天</button>
      <button class="btn btn-primary" id="nextBtn" ${n>=30?'disabled':''}>下一天 →</button>
    </div>
  </div>`;

  html += `</div>`;
  view.innerHTML = html;

  /* 綁定事件 */
  const respBox = $("#respBox");
  if(respBox){
    const save = ()=>{
      state.responses[n] = respBox.value;
      if(d.practice.isOnboarding){ state.belief = respBox.value.trim(); }
      persist();
      const h = $("#savedHint"); if(h){ h.classList.add("show"); setTimeout(()=>h.classList.remove("show"),1400); }
    };
    let t; respBox.addEventListener("input", ()=>{ clearTimeout(t); t=setTimeout(save,600); });
    const sb = $("#saveBtn"); if(sb) sb.addEventListener("click", save);
  }
  $("#doneBtn").addEventListener("click", ()=>{
    state.done[n] = !state.done[n]; persist();
    renderProgress(); renderDay(n);
    if(state.done[n] && n<30) setTimeout(()=>{ /* 鼓勵留在當頁看 badge */ }, 50);
  });
  const pb=$("#prevBtn"); if(pb) pb.addEventListener("click", ()=>{ if(n>1) renderDay(n-1); window.scrollTo(0,0); });
  const nb=$("#nextBtn"); if(nb) nb.addEventListener("click", ()=>{ if(n<30) renderDay(n+1); window.scrollTo(0,0); });

  window.scrollTo({top:0, behavior:"smooth"});
}

function typeLabel(t){
  return ({intro:"・導論",pattern:"・單式精修",review:"・週回顧",fourteen:"・總演練",
    scenario:"・情境演練",rapidfire:"・速度訓練",combo:"・組合技",deep:"・深度突破",
    teach:"・教學實作",phrasebook:"・語庫整理",capstone:"・結業"}[t]||"");
}

/* ===================================================================
   頁面：行事曆（30 天總覽）
   =================================================================== */
function renderCalendar(){
  const view = $("#view");
  let html = `<div class="fade"><div class="card">
    <div class="section-title">30 天旅程</div>
    <div class="section-desc">點任一天直接前往。✓ 為已完成。</div>`;

  const weeks = [
    {n:1, label:"第一週 · 地基 + 前五式", days:[1,2,3,4,5,6,7]},
    {n:2, label:"第二週 · 鬆動邏輯的工具箱", days:[8,9,10,11,12,13,14]},
    {n:3, label:"第三週 · 最後三式 + 整合演練", days:[15,16,17,18,19,20,21]},
    {n:4, label:"第四週 · 應用 · 組合 · 精通", days:[22,23,24,25,26,27,28,29,30]}
  ];
  weeks.forEach(w=>{
    html += `<div class="week-label">${w.label}</div><div class="cal-grid">`;
    w.days.forEach(dn=>{
      const d = getDay(dn);
      const done = state.done[dn] ? "done":"";
      const today = dn===state.currentDay ? "today":"";
      html += `<div class="cal-cell ${done} ${today}" data-day="${dn}">
        <div class="cd">${dn}</div><div class="cw">${shortType(d.type)}</div></div>`;
    });
    html += `</div>`;
  });
  html += `</div></div>`;
  view.innerHTML = html;
  view.querySelectorAll(".cal-cell").forEach(c=>{
    c.addEventListener("click", ()=>{ setTab("day"); renderDay(+c.dataset.day); });
  });
  window.scrollTo({top:0,behavior:"smooth"});
}
function shortType(t){
  return ({intro:"導論",pattern:"練習",review:"回顧",fourteen:"總演練",scenario:"情境",
    rapidfire:"速度",combo:"組合",deep:"突破",teach:"實作",phrasebook:"語庫",capstone:"結業"}[t]||"");
}

/* ===================================================================
   頁面：14 式速查
   =================================================================== */
function patternListHTML(compact){
  return `<div class="pattern-list">` + PATTERNS.map(p=>{
    const c = colorFor(p.id);
    return `<div class="pattern-item" style="border-left-color:${c}">
      <div><span class="pnum" style="background:${c}">${p.id}</span>
      <span class="pname">${esc(p.zh)}</span> <span class="pen">${esc(p.en)}</span></div>
      <div class="pone">${esc(p.oneLine)}</div>
      ${compact?``:`<div class="pone" style="color:var(--ink-soft)">${esc(p.detail)}</div>`}
      <div class="pbook">✦ ${esc(p.bookReframe)}</div>
    </div>`;
  }).join("") + `</div>`;
}
function renderReference(){
  const view = $("#view");
  view.innerHTML = `<div class="fade"><div class="card">
    <div class="eyebrow">Sleight of Mouth</div>
    <div class="section-title">14 式語言魔術速查</div>
    <div class="section-desc">面對同一句抱怨，14 個拆解槓桿。書中示範以「${esc(MASTER_BELIEF)}」為例。</div>
    ${patternListHTML(false)}
  </div></div>`;
  window.scrollTo({top:0,behavior:"smooth"});
}

/* ===================================================================
   頁面：我的進度 / 統計
   =================================================================== */
function renderStats(){
  const view = $("#view");
  const done = doneCount();
  const streak = currentStreak();
  const written = Object.values(state.responses).filter(v=>v && v.trim()).length;

  let html = `<div class="fade">`;
  html += `<div class="card center">
    <div class="breath"></div>
    <div class="section-title">你的換框旅程</div>
    <div class="section-desc">深呼吸。每一天，你都在長出新的彈性。</div>
    <div class="stat-row">
      <div class="stat"><div class="num">${done}</div><div class="lbl">完成天數 / 30</div></div>
      <div class="stat"><div class="num">${streak}</div><div class="lbl">連續天數</div></div>
      <div class="stat"><div class="num">${written}</div><div class="lbl">練習筆記</div></div>
    </div>
  </div>`;

  /* 我的信念 */
  html += `<div class="card">
    <div class="label" style="font-weight:700;font-size:14px;margin-bottom:8px">🎯 我正在練習的信念</div>
    <textarea id="beliefEdit" placeholder="尚未設定。可在第 1 天設定，或在此直接輸入。">${esc(state.belief)}</textarea>
    <div class="save-row"><button class="btn btn-ghost" id="beliefSave">更新信念</button>
      <span class="saved-hint" id="beliefHint">已更新 ✓</span></div>
  </div>`;

  /* 我的練習筆記彙整 */
  const notes = DAYS.filter(d=>state.responses[d.day] && state.responses[d.day].trim());
  html += `<div class="card"><div class="section-title">我的練習筆記</div>`;
  if(notes.length===0){
    html += `<div class="section-desc">還沒有筆記。完成任一天的練習後，會自動收錄在這裡。</div>`;
  }else{
    notes.forEach(d=>{
      html += `<div class="belief-box" style="margin-top:12px;cursor:pointer" data-day="${d.day}">
        <div class="tag">Day ${d.day} · ${esc(d.title)}</div>
        <div class="reframe-text" style="white-space:pre-wrap;margin-top:6px;color:#3a3357">${esc(state.responses[d.day])}</div></div>`;
    });
  }
  html += `</div>`;

  /* 資料管理 */
  html += `<div class="card">
    <div class="section-desc" style="margin-bottom:10px">你的所有紀錄都只儲存在這支裝置的瀏覽器中（離線可用），不會上傳。</div>
    <button class="btn btn-ghost btn-block" id="resetBtn" style="color:var(--c-rose)">清除所有進度與筆記</button>
  </div>`;

  html += `</div>`;
  view.innerHTML = html;

  const be = $("#beliefEdit");
  $("#beliefSave").addEventListener("click", ()=>{
    state.belief = be.value.trim(); persist();
    const h=$("#beliefHint"); h.classList.add("show"); setTimeout(()=>h.classList.remove("show"),1400);
  });
  view.querySelectorAll("[data-day]").forEach(el=>{
    el.addEventListener("click", ()=>{ setTab("day"); renderDay(+el.dataset.day); });
  });
  $("#resetBtn").addEventListener("click", ()=>{
    if(confirm("確定要清除所有進度與練習筆記嗎？此動作無法復原。")){
      localStorage.removeItem(STORE_KEY);
      state = {responses:{},done:{},belief:"",currentDay:1};
      renderProgress(); renderStats();
    }
  });
  window.scrollTo({top:0,behavior:"smooth"});
}

/* ===================================================================
   Tab 切換
   =================================================================== */
let activeTab = "day";
function setTab(tab){
  activeTab = tab;
  document.querySelectorAll(".tab").forEach(t=>t.classList.toggle("active", t.dataset.tab===tab));
}
function go(tab){
  setTab(tab);
  if(tab==="day") renderDay(state.currentDay);
  else if(tab==="calendar") renderCalendar();
  else if(tab==="reference") renderReference();
  else if(tab==="stats") renderStats();
}

/* ---------- 初始化 ---------- */
function init(){
  document.querySelectorAll(".tab").forEach(t=>{
    t.addEventListener("click", ()=>go(t.dataset.tab));
  });
  renderProgress();
  go("day");

  /* 註冊 Service Worker（離線 / 可安裝） */
  if("serviceWorker" in navigator){
    window.addEventListener("load", ()=>{
      navigator.serviceWorker.register("./service-worker.js").catch(()=>{});
    });
  }
}
document.addEventListener("DOMContentLoaded", init);
