/* 无职转生 · 随身终端加载器 v1.0.0（开源发布版）
   架构参考 Counterfeit 手机助手：酒馆助手脚本在独立沙箱执行，UI 挂载到宿主文档；
   srcdoc iframe（与宿主同源）承载终端界面；可拖动悬浮球启动器在宿主页面。
   数据边界：只读 stat_data 用于展示；只写消息楼层变量「手机终端」记录传讯会话；
   不修改任何业务变量；传讯不直接改动亲密度与关系阶段。 */
console.info('[无职·随身终端] eval');

(() => {
  'use strict';

  const BTN_ID = 'mushoku-phone-launcher-root';
  const IFRAME_ID = 'mushoku-phone-iframe';
  const STYLE_ID = 'mushoku-phone-loader-style';
  const INSTANCE_KEY = '__MUSHOKU_PHONE_INSTANCE__';
  const POS_KEY = 'mushoku.phone.launcher.pos';
  const SANDBOX_NAME = '__mushoku_phone_sandbox__';

  // 给沙箱命名：终端 iframe 里的 API 桥靠这个名字找回沙箱（那里有酒馆运行时 API）
  try { window.name = SANDBOX_NAME; } catch { /* 忽略 */ }

  const hostWindow = (() => {
    try { if (window.top && window.top.document) return window.top; } catch (e) { /* 跨域时回退 */ }
    return window;
  })();
  const hostDocument = hostWindow.document;

  // ─────────────────────────── 终端页面（srcdoc） ───────────────────────────
  // 约定：内层代码不使用反引号与 ${}，便于整体嵌入；</script> 一律写作 <\/script>。
  const PHONE_HTML = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>随身终端</title>
<script>
(function(){
  var N=['getVariables','updateVariablesWith','insertOrAssignVariables','replaceVariables',
         'generateRaw','getCharWorldbookNames','getWorldbook','getChatMessages',
         'getWorldbookNames','createWorldbook','createWorldbookEntries','updateWorldbookWith','rebindCharWorldbooks','getModelList',
         'eventOn','eventOff','tavern_events','mvu_events','SillyTavern','_','$'];
  function pick(host){
    for(var i=0;i<N.length;i++){
      var k=N[i];
      try{ if(typeof window[k]==='undefined' && typeof host[k]!=='undefined'){ window[k]=host[k]; } }catch(e){}
    }
  }
  try{
    var host=window.parent;
    if(!host||host===window){ return; }
    var sandbox=null;
    try{
      for(var i=0;i<host.frames.length;i++){
        var f=host.frames[i];
        try{ if(f && f.name==='__mushoku_phone_sandbox__'){ sandbox=f; break; } }catch(e){}
      }
    }catch(e){}
    pick(sandbox||host);
  }catch(e){}
})();
<\/script>
<style>
  :root{
    --bg:#12171a; --panel:#1a2226; --panel2:#212b30; --line:#2c3a40;
    --text:#e8e6df; --dim:#9aa7a3; --accent:#69a97c; --accent2:#8fc7a1;
    --mine:#2e5b46; --theirs:#26313a; --danger:#b3695f;
  }
  *{ box-sizing:border-box; margin:0; padding:0; }
  html,body{ height:100%; }
  body{
    background:var(--bg); color:var(--text);
    font-family:-apple-system,'Segoe UI','Microsoft YaHei',sans-serif;
    font-size:14px; overflow:hidden; user-select:none;
  }
  #phone{ position:relative; display:flex; flex-direction:column; height:100%; }
  #topbar{
    display:flex; align-items:center; gap:6px;
    padding:10px 12px; background:var(--panel); border-bottom:1px solid var(--line);
    flex:0 0 auto;
  }
  #topbar .title{ flex:1; text-align:center; font-weight:600; letter-spacing:1px; }
  .ibtn{
    width:32px; height:32px; border:none; border-radius:8px; cursor:pointer;
    background:transparent; color:var(--dim); display:flex; align-items:center; justify-content:center;
  }
  .ibtn:hover{ background:var(--panel2); color:var(--text); }
  .ibtn svg{ width:18px; height:18px; }
  #errbox{
    margin:8px 12px 0; padding:8px 10px; border-radius:8px; font-size:12px;
    background:rgba(179,105,95,.16); color:#e5b1a8; border:1px solid rgba(179,105,95,.35);
  }
  #statusStrip{
    display:flex; flex-wrap:wrap; gap:4px 10px; justify-content:center;
    padding:7px 10px; font-size:11.5px; color:var(--dim);
    background:var(--panel); border-bottom:1px solid var(--line); flex:0 0 auto;
  }
  #view{ flex:1; overflow-y:auto; overscroll-behavior:contain; }
  #view::-webkit-scrollbar{ width:4px; } #view::-webkit-scrollbar-thumb{ background:var(--line); border-radius:2px; }

  .pad{ padding:12px; }
  .grid{ display:grid; grid-template-columns:1fr 1fr; gap:10px; }
  .tile{
    display:flex; flex-direction:column; align-items:center; gap:8px;
    padding:16px 8px; background:var(--panel); border:1px solid var(--line);
    border-radius:14px; cursor:pointer; color:var(--text);
  }
  .tile:hover{ background:var(--panel2); }
  .tile svg{ width:26px; height:26px; color:var(--accent2); }
  .tile .tlabel{ font-size:13px; letter-spacing:2px; }

  .row{
    display:flex; align-items:center; gap:10px; padding:11px 12px;
    background:var(--panel); border:1px solid var(--line); border-radius:12px;
    margin-bottom:8px; cursor:pointer;
  }
  .row:hover{ background:var(--panel2); }
  .row .grow{ flex:1; min-width:0; }
  .row .name{ font-weight:600; }
  .row .sub{ font-size:11.5px; color:var(--dim); margin-top:2px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
  .bar{ width:56px; height:5px; background:var(--line); border-radius:3px; overflow:hidden; flex:0 0 auto; }
  .bar i{ display:block; height:100%; background:var(--accent); }
  .tag{
    display:inline-block; padding:1px 7px; font-size:10.5px; border-radius:8px;
    background:rgba(105,169,124,.16); color:var(--accent2); margin-right:4px;
  }
  .kv{ display:flex; gap:8px; padding:6px 0; font-size:12.5px; border-bottom:1px dashed var(--line); }
  .kv .k{ color:var(--dim); flex:0 0 72px; }
  .kv .v{ flex:1; word-break:break-all; }
  .card{ background:var(--panel); border:1px solid var(--line); border-radius:12px; padding:11px 12px; margin-bottom:8px; }
  .card h4{ font-size:13px; margin-bottom:6px; color:var(--accent2); }
  .card p{ font-size:12.5px; line-height:1.55; color:var(--text); }
  .card .meta{ font-size:11px; color:var(--dim); margin-top:5px; }
  .sect{ font-size:11.5px; color:var(--dim); letter-spacing:2px; margin:14px 0 8px 2px; }
  .empty{ text-align:center; color:var(--dim); padding:36px 12px; font-size:12.5px; }

  #chatWrap{ display:flex; flex-direction:column; height:100%; }
  #msgs{ flex:1; overflow-y:auto; padding:12px; display:flex; flex-direction:column; gap:8px; }
  .bubble{ max-width:78%; padding:8px 11px; border-radius:12px; font-size:13px; line-height:1.5; word-break:break-all; user-select:text; }
  .bubble.me{ align-self:flex-end; background:var(--mine); border-bottom-right-radius:4px; }
  .bubble.them{ align-self:flex-start; background:var(--theirs); border-bottom-left-radius:4px; }
  .bubble.sys{ align-self:center; background:transparent; color:var(--dim); font-size:11px; }
  .bubble.err{ align-self:center; background:rgba(179,105,95,.14); color:#e5b1a8; font-size:12px; }
  #inputRow[hidden], #statusStrip[hidden], #errbox[hidden]{ display:none; }
  #inputRow{
    display:flex; gap:8px; padding:10px; background:var(--panel);
    border-top:1px solid var(--line); flex:0 0 auto;
  }
  #inputRow textarea{
    flex:1; resize:none; height:40px; padding:9px 11px; border-radius:10px;
    border:1px solid var(--line); background:var(--bg); color:var(--text);
    font-family:inherit; font-size:13px; outline:none;
  }
  #inputRow textarea:focus{ border-color:var(--accent); }
  #sendBtn{
    width:44px; border:none; border-radius:10px; cursor:pointer;
    background:var(--accent); color:#0d130f; display:flex; align-items:center; justify-content:center;
  }
  #sendBtn:disabled{ background:var(--panel2); color:var(--dim); cursor:default; }
  #sendBtn svg{ width:18px; height:18px; }

  .album{ display:grid; grid-template-columns:1fr 1fr; gap:10px; }
  .tile{ position:relative; }
  .tile.span2{ grid-column:span 2; }
  .badge{
    position:absolute; top:8px; right:10px; width:8px; height:8px; border-radius:50%;
    background:#b3695f;
  }
  .cg{
    position:relative; border:1px solid var(--line); border-radius:12px; overflow:hidden;
    background:var(--panel); cursor:pointer;
  }
  .cg .thumb{
    width:100%; aspect-ratio:3/2; display:flex; align-items:center; justify-content:center;
    color:var(--dim); background:var(--panel2);
  }
  .cg .thumb svg{ width:26px; height:26px; }
  .cg .thumb img{ width:100%; height:100%; object-fit:cover; display:block; }
  .cg .cap{ padding:7px 8px; font-size:11.5px; line-height:1.45; }
  .cg .cap .ct{ font-weight:600; color:var(--text); }
  .cg.locked .thumb{ color:#57655f; }
  .cg.locked .cap .ct{ color:var(--dim); }
  .cg .lockbadge{
    position:absolute; top:6px; right:6px; width:20px; height:20px; border-radius:50%;
    background:rgba(0,0,0,.45); display:flex; align-items:center; justify-content:center; color:#cfd8d3;
  }
  .cg .lockbadge svg{ width:11px; height:11px; }
  .cgDetail .big{
    width:100%; min-height:180px; border-radius:12px; border:1px solid var(--line);
    background:var(--panel2); display:flex; align-items:center; justify-content:center; color:var(--dim);
  }
  .cgDetail .big img{ width:100%; display:block; border-radius:12px; }
  .cgDetail .big svg{ width:34px; height:34px; }
  .tabs{ display:flex; gap:6px; padding:10px 12px 0; }
  .tab{ flex:1; text-align:center; padding:7px 0; border-radius:8px; font-size:12px;
    background:var(--panel); color:var(--dim); cursor:pointer; border:1px solid var(--line); }
  .tab.on{ background:var(--mine); color:var(--text); border-color:var(--accent); }
  .checklist{ background:var(--panel); border:1px solid var(--line); border-radius:12px; padding:6px 0; margin-bottom:8px; }
  .checklist h4{ font-size:12.5px; color:var(--accent2); padding:6px 12px 2px; }
  .citem{ display:flex; gap:8px; padding:5px 12px; font-size:12.5px; line-height:1.55; color:var(--text); }
  .citem .no{ color:var(--dim); flex:0 0 auto; }
  .memoItem{ display:flex; align-items:flex-start; gap:8px; padding:9px 11px; background:var(--panel);
    border:1px solid var(--line); border-radius:10px; margin-bottom:7px; }
  .memoItem .mt{ flex:1; font-size:13px; line-height:1.5; word-break:break-all; user-select:text; }
  .memoItem .md{ font-size:10.5px; color:var(--dim); margin-top:3px; }
  .delBtn{ border:none; background:transparent; color:var(--dim); cursor:pointer; padding:2px; }
  .delBtn:hover{ color:var(--danger); }
  .delBtn svg{ width:14px; height:14px; }
  .memoAdd{ display:flex; gap:8px; padding:10px 0 2px; }
  .memoAdd input{ flex:1; padding:9px 11px; border-radius:10px; border:1px solid var(--line);
    background:var(--bg); color:var(--text); font-family:inherit; font-size:13px; outline:none; }
  .memoAdd input:focus{ border-color:var(--accent); }
  .addBtn{ width:40px; border:none; border-radius:10px; background:var(--accent); color:#0d130f;
    display:flex; align-items:center; justify-content:center; cursor:pointer; }
  .addBtn svg{ width:16px; height:16px; }
  .flag{ display:flex; align-items:center; justify-content:space-between; padding:6px 0; font-size:12.5px; border-bottom:1px dashed var(--line); }
  .flag .st{ font-size:11px; }
  .flag .ok{ color:var(--accent2); }
  .flag .no2{ color:var(--dim); }
  .form{ background:var(--panel); border:1px solid var(--line); border-radius:12px; padding:4px 12px 12px; margin-bottom:10px; }
  .formRow{ padding:8px 0; }
  .formRow label{ display:block; font-size:11.5px; color:var(--dim); margin-bottom:5px; }
  .formRow input{ width:100%; padding:9px 11px; border-radius:10px; border:1px solid var(--line);
    background:var(--bg); color:var(--text); font-family:inherit; font-size:12.5px; outline:none; }
  .formRow input:focus{ border-color:var(--accent); }
  .quickRow{ display:flex; gap:6px; margin-top:6px; }
  .quickBtn{ padding:5px 10px; border-radius:8px; border:1px solid var(--line); background:var(--panel2); color:var(--dim); font-size:11px; cursor:pointer; }
  .quickBtn:hover{ color:var(--text); border-color:var(--accent); }
  .formBtns{ display:flex; gap:8px; margin-top:10px; }
  .saveBtn{ flex:1; padding:9px 0; border:none; border-radius:10px; background:var(--accent); color:#0d130f; font-size:13px; cursor:pointer; }
  .testBtn{ flex:1; padding:9px 0; border:1px solid var(--line); border-radius:10px; background:var(--panel2); color:var(--text); font-size:13px; cursor:pointer; }
  .ctabs{ display:flex; gap:6px; padding:10px 12px 0; }
  .ctab{ flex:1; text-align:center; padding:7px 0; border-radius:8px; font-size:12.5px;
    background:var(--panel); color:var(--dim); cursor:pointer; border:1px solid var(--line); }
  .ctab.on{ background:var(--mine); color:var(--text); border-color:var(--accent); }
  .gsend{ align-self:flex-start; font-size:10.5px; color:var(--dim); margin:4px 0 -4px 6px; }
  .memRow{ display:flex; align-items:center; gap:10px; padding:10px 12px; background:var(--panel);
    border:1px solid var(--line); border-radius:10px; margin-bottom:7px; cursor:pointer; }
  .memRow .ck{ width:18px; height:18px; border-radius:5px; border:1.5px solid var(--line); flex:0 0 auto;
    display:flex; align-items:center; justify-content:center; color:transparent; }
  .memRow.sel .ck{ background:var(--accent); border-color:var(--accent); color:#0d130f; }
  .memRow.sel .ck svg{ width:12px; height:12px; }
  .modelSelect{ width:100%; margin-top:6px; padding:8px 10px; border-radius:10px; border:1px solid var(--line);
    background:var(--bg); color:var(--text); font-size:12.5px; outline:none; }
  .formNote{ font-size:11px; color:var(--dim); line-height:1.6; margin-top:8px; }
  .wbRow{ display:flex; align-items:center; gap:8px; padding:10px 12px; background:var(--panel);
    border:1px solid var(--line); border-radius:10px; margin-bottom:7px; cursor:pointer; }
  .wbRow:hover{ background:var(--panel2); }
  .wbRow .grow{ flex:1; min-width:0; }
  .wbRow .wn{ font-weight:600; font-size:13px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
  .wbRow .wm{ font-size:11px; color:var(--dim); margin-top:2px; }
  .lockTag{ font-size:10px; padding:1px 6px; border-radius:7px; flex:0 0 auto; }
  .lockTag.auto{ background:rgba(105,169,124,.14); color:var(--accent2); }
  .lockTag.man{ background:rgba(240,165,58,.16); color:#f0c06a; }
  .offTag{ font-size:10px; padding:1px 6px; border-radius:7px; background:rgba(255,255,255,.06); color:var(--dim); flex:0 0 auto; }
  .wbEdit textarea{
    width:100%; min-height:46vh; resize:vertical; padding:10px; border-radius:10px;
    border:1px solid var(--line); background:var(--bg); color:var(--text);
    font-family:Consolas,monospace; font-size:12px; line-height:1.55; outline:none; user-select:text;
  }
  .wbEdit textarea:focus{ border-color:var(--accent); }
  .wbTools{ display:flex; flex-wrap:wrap; gap:7px; margin:10px 0; }
  .wbTools .tb{ padding:7px 11px; border-radius:9px; border:1px solid var(--line); background:var(--panel2);
    color:var(--text); font-size:11.5px; cursor:pointer; }
  .wbTools .tb.warn{ color:#e5b1a8; border-color:rgba(179,105,95,.4); }
  .wbTools .tb.on{ background:var(--mine); border-color:var(--accent); }
  #toast{
    position:absolute; left:50%; bottom:70px; transform:translateX(-50%);
    background:rgba(18,24,20,.94); color:var(--text); border:1px solid var(--accent);
    padding:8px 14px; border-radius:20px; font-size:12px; z-index:50; white-space:nowrap;
  }
</style>
</head>
<body>
<svg style="display:none" xmlns="http://www.w3.org/2000/svg">
  <symbol id="i-chat" viewBox="0 0 24 24"><path d="M21 11.5a8.4 8.4 0 0 1-8.5 8.3 9 9 0 0 1-3.8-.8L3 20l1.2-4.3a8 8 0 0 1-.7-3.2A8.4 8.4 0 0 1 12 4.2a8.4 8.4 0 0 1 9 7.3z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></symbol>
  <symbol id="i-users" viewBox="0 0 24 24"><circle cx="9" cy="8" r="3.4" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M3.5 20a5.5 5.5 0 0 1 11 0M16 5a3.2 3.2 0 0 1 0 6.2M17.5 14.6a5.4 5.4 0 0 1 3 4.9" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></symbol>
  <symbol id="i-bag" viewBox="0 0 24 24"><path d="M5.5 8h13l-1 12h-11z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><path d="M9 10V6.5a3 3 0 0 1 6 0V10" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></symbol>
  <symbol id="i-book" viewBox="0 0 24 24"><path d="M5 4.5A2.5 2.5 0 0 1 7.5 2H19v17.5H7.5A2.5 2.5 0 0 0 5 22z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><path d="M5 19.5A2.5 2.5 0 0 1 7.5 17H19" fill="none" stroke="currentColor" stroke-width="1.8"/></symbol>
  <symbol id="i-task" viewBox="0 0 24 24"><path d="M4 6.5l2 2 3.5-3.8M4 15.5l2 2 3.5-3.8" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/><path d="M12.5 6.5H20M12.5 15.5H20" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></symbol>
  <symbol id="i-globe" viewBox="0 0 24 24"><circle cx="12" cy="12" r="8.5" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M3.5 12h17M12 3.5c2.6 2.3 4 5.2 4 8.5s-1.4 6.2-4 8.5c-2.6-2.3-4-5.2-4-8.5s1.4-6.2 4-8.5z" fill="none" stroke="currentColor" stroke-width="1.8"/></symbol>
  <symbol id="i-back" viewBox="0 0 24 24"><path d="M14.5 5.5L8 12l6.5 6.5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></symbol>
  <symbol id="i-close" viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></symbol>
  <symbol id="i-refresh" viewBox="0 0 24 24"><path d="M19.5 12a7.5 7.5 0 1 1-2.2-5.3L19.5 9M19.5 4v5h-5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></symbol>
  <symbol id="i-send" viewBox="0 0 24 24"><path d="M4 12l16-7-4.5 16-4-6.5z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><path d="M11.5 14.5L20 5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></symbol>
  <symbol id="i-image" viewBox="0 0 24 24"><rect x="3.5" y="4.5" width="17" height="15" rx="2" fill="none" stroke="currentColor" stroke-width="1.8"/><circle cx="9" cy="10" r="1.6" fill="currentColor"/><path d="M5 18l5-5 3 3 3.5-4 4 6z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></symbol>
  <symbol id="i-lock" viewBox="0 0 24 24"><rect x="6" y="10.5" width="12" height="9.5" rx="2" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M8.5 10.5V8a3.5 3.5 0 0 1 7 0v2.5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></symbol>
  <symbol id="i-note" viewBox="0 0 24 24">
    <path d="M5 4.5A2.5 2.5 0 0 1 7.5 2H19v17.5H7.5A2.5 2.5 0 0 0 5 22z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/>
    <path d="M9 7.5h6M9 11h6M9 14.5h3.5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
  </symbol>
  <symbol id="i-plus" viewBox="0 0 24 24"><path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></symbol>
  <symbol id="i-trash" viewBox="0 0 24 24"><path d="M4.5 6.5h15M9.5 6V4.5h5V6M7 6.5l.8 13h8.4l.8-13" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></symbol>
  <symbol id="i-check2" viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></symbol>
  <symbol id="i-gear" viewBox="0 0 24 24"><circle cx="12" cy="12" r="3.2" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M12 2.8v3M12 18.2v3M21.2 12h-3M5.8 12h-3M18.5 5.5l-2.1 2.1M7.6 16.4l-2.1 2.1M18.5 18.5l-2.1-2.1M7.6 7.6L5.5 5.5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></symbol>
  <symbol id="i-store" viewBox="0 0 24 24"><rect x="3.5" y="4" width="17" height="4.5" rx="1" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M5.5 8.5V19a1 1 0 0 0 1 1h11a1 1 0 0 0 1-1V8.5M10 12.5h4" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></symbol>
  <symbol id="i-phone" viewBox="0 0 24 24"><rect x="7" y="2.5" width="10" height="19" rx="2.5" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M10.5 18.5h3" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></symbol>
</svg>

<div id="phone">
  <div id="topbar">
    <button class="ibtn" id="backBtn" style="visibility:hidden"><svg><use href="#i-back"/></svg></button>
    <span class="title" id="titleBar">随身终端</span>
    <button class="ibtn" id="refreshBtn" title="刷新"><svg><use href="#i-refresh"/></svg></button>
    <button class="ibtn" id="gearBtn" title="设置"><svg><use href="#i-gear"/></svg></button>
    <button class="ibtn" id="closeBtn" title="关闭"><svg><use href="#i-close"/></svg></button>
  </div>
  <div id="errbox" hidden></div>
  <div id="statusStrip" hidden></div>
  <div id="view"></div>
  <div id="inputRow" hidden>
    <textarea id="chatInput" placeholder="输入传讯内容"></textarea>
    <button id="sendBtn" title="发送"><svg><use href="#i-send"/></svg></button>
  </div>
</div>

<script>
(function(){
  'use strict';

  var CHAR_ORDER = ['洛琪希','希露菲','艾莉丝','保罗','塞妮丝','莉莉雅','诺伦','爱夏','瑞杰路德','克里夫','艾莉娜丽洁'];
  var state = { view:'home', data:null, contact:null, generating:false, personaCache:{}, chatDraft:'', cgDetail:null, wbCache:{}, memoTab:'list', ctTab:'direct', gname:null, gDraft:{name:'', members:[]} };

  // ── 独立API配置：默认走用户自己的OpenAI兼容端点，密钥只存本机浏览器 ──
  var API_LS_KEY = 'mushoku.phone.api';
  var API_DEFAULT = { apiurl: 'https://gcli.ggchan.dev/v1', key: '', model: 'gemini-3-flash-preview' };
  function loadApiCfg(){
    try {
      var raw = localStorage.getItem(API_LS_KEY);
      if (raw){
        var o = JSON.parse(raw) || {};
        return { apiurl: String(o.apiurl || API_DEFAULT.apiurl).trim(), key: String(o.key || '').trim(), model: String(o.model || API_DEFAULT.model).trim(), name: String(o.name || '') };
      }
    } catch (e) { /* 忽略 */ }
    return { apiurl: API_DEFAULT.apiurl, key: API_DEFAULT.key, model: API_DEFAULT.model, name: '默认·GCLI' };
  }
  function saveApiCfg(cfg){
    try { localStorage.setItem(API_LS_KEY, JSON.stringify(cfg)); return true; } catch (e) { return false; }
  }
  var API_LIST_KEY = 'mushoku.phone.apiPresets';
  function loadPresets(){
    try {
      var raw = localStorage.getItem(API_LIST_KEY);
      if (raw === null){
        var seed = [{ name: '默认·GCLI', apiurl: API_DEFAULT.apiurl, key: API_DEFAULT.key, model: API_DEFAULT.model }];
        localStorage.setItem(API_LIST_KEY, JSON.stringify(seed));
        return seed;
      }
      var l = JSON.parse(raw);
      return Array.isArray(l) ? l : [];
    } catch (e) { return []; }
  }
  function savePresetList(list){
    try { localStorage.setItem(API_LIST_KEY, JSON.stringify(list)); return true; } catch (e) { return false; }
  }

  // 图集清单：解锁条件只引用卡内真实存在的变量路径（已完成节点/当前章节/事件旗标）。
  // file 留空时显示占位图；补图时填图片 URL 或可访问路径即可，不改脚本其余部分。
  var CG_MANIFEST = { items: [
    { id:'cg-001', title:'布耶纳村的重生', tag:'主线', file:'',
      desc:'鲁迪乌斯在塞妮丝怀中睁开眼，前世孤独化作新生第一声啼哭。',
      unlock:{ type:'node', node:'第001章-节点05' } },
    { id:'cg-002', title:'蓝发家庭教师', tag:'洛琪希', file:'',
      desc:'一场水圣级魔术演示确立师徒之缘，洛琪希第一次在这里感到被需要。',
      unlock:{ type:'node', node:'第004章-节点05' } },
    { id:'cg-003', title:'诗与远方的离别', tag:'洛琪希', file:'',
      desc:'洛琪希留下诗与表白，踏上离村的路。',
      unlock:{ type:'node', node:'第006章-节点05' } },
    { id:'cg-004', title:'藏不住的真相', tag:'主线', file:'',
      desc:'怀孕真相揭开，家的形状悄然改变。',
      unlock:{ type:'node', node:'第009章-节点05' } },
    { id:'cg-005', title:'初见的暴打', tag:'艾莉丝', file:'',
      desc:'火之下的大小姐，艾莉丝的登场方式独此一份。',
      unlock:{ type:'node', node:'第014章-节点05' } },
    { id:'cg-006', title:'剑舞的生辰', tag:'艾莉丝', file:'',
      desc:'艾莉丝生日夜的剑舞，与那一夜的温度。',
      unlock:{ type:'node', node:'第022章-节点05' } },
    { id:'cg-007', title:'红光之夜', tag:'主线', file:'',
      desc:'灾厄降临布耶纳村，大转移撕开一切。',
      unlock:{ type:'event', path:'事件.大转移.已发生' } },
    { id:'cg-008', title:'魔大陆的承诺', tag:'主线', file:'',
      desc:'咬破肩膀立下的归乡之约，Dead End 的第一夜。',
      unlock:{ type:'node', node:'第026章-节点05' } },
    { id:'cg-009', title:'赤龙下颚·龙神', tag:'龙神', file:'',
      desc:'奥尔斯帝德贯穿胸膛的一击，与那份冷酷的致敬。',
      unlock:{ type:'chapter', chapter:39 } },
    { id:'cg-010', title:'月下直球', tag:'艾莉丝', file:'',
      desc:'罗亚重建期的月下，艾莉丝的直球表白。',
      unlock:{ type:'event', path:'事件.关键关系.鲁迪与艾莉丝已确认恋人' } },
    { id:'cg-011', title:'完美离别', tag:'艾莉丝', file:'',
      desc:'剑之圣地前夜的誓言，为了以对等的姿态重逢。',
      unlock:{ type:'node', node:'第045章-节点05' } },
    { id:'cg-012', title:'雨夜·三份真心', tag:'希露菲', file:'',
      desc:'碎裂的墨镜与三份坦白，希露菲回到鲁迪身边。',
      unlock:{ type:'event', path:'事件.关键关系.鲁迪与希露菲已确认恋人' } },
    { id:'cg-013', title:'天降神兵', tag:'洛琪希', file:'',
      desc:'迷宫深处的白马王子，救出洛琪希的瞬间。',
      unlock:{ type:'node', node:'第065章-节点05' } },
    { id:'cg-014', title:'三妻盛世婚礼', tag:'主线', file:'',
      desc:'三场只属于她们的仪式之后，盛大的婚礼。',
      unlock:{ type:'event', path:'事件.关键关系.三人婚礼已完成' } },
    { id:'cg-015', title:'时光答卷', tag:'主线', file:'',
      desc:'被真实爱过的人不会只剩遗憾——岁月静好的答卷。',
      unlock:{ type:'chapter', chapter:87 } }
  ] };

  var NL2 = String.fromCharCode(10);
  var NLJ = String.fromCharCode(10);
  function api(n){ return typeof window[n] === 'function' ? window[n] : null; }
  function ev(n){ return (window.tavern_events && window.tavern_events[n]) || null; }

  function el(tag, cls, text){
    var node = document.createElement(tag);
    if (cls) node.className = cls;
    if (text !== undefined && text !== null) node.textContent = String(text);
    return node;
  }
  function icon(id){
    var svg = document.createElementNS('http://www.w3.org/2000/svg','svg');
    var use = document.createElementNS('http://www.w3.org/2000/svg','use');
    use.setAttribute('href', '#' + id);
    svg.appendChild(use);
    return svg;
  }
  function showErr(msg){
    var box = document.getElementById('errbox');
    box.textContent = msg;
    box.hidden = false;
  }
  function clearErr(){ document.getElementById('errbox').hidden = true; }

  // ── 数据读取 ──
  async function load(){
    clearErr();
    var getVars = api('getVariables');
    if (!getVars){ showErr('终端无法连接酒馆环境：未获取到变量接口，请确认脚本已通过酒馆助手启用。'); state.data = null; render(); return; }
    try {
      var vars = getVars({ type:'message', message_id:'latest' }) || {};
      state.data = { stat: vars.stat_data || {}, phone: vars['手机终端'] || {} };
    } catch (e) {
      state.data = null;
      showErr('读取变量失败：' + (e && e.message ? e.message : e));
    }
    try {
      var freshCount = await syncCgUnlocks();
      if (freshCount > 0) showToast('图集新增 ' + freshCount + ' 项收录');
    } catch (e) { /* 收录失败不阻塞显示 */ }
    try { await syncMemoWorldbook(); } catch (e) { /* 同步失败不阻塞显示 */ }
    render();
  }

  function stat(){ return (state.data && state.data.stat) || {}; }
  function phoneData(){ return (state.data && state.data.phone) || {}; }

  function convList(){
    var rel = stat()['关系'] || {};
    var names = Object.keys(rel);
    names.sort(function(a,b){
      var ia = CHAR_ORDER.indexOf(a), ib = CHAR_ORDER.indexOf(b);
      if (ia === -1 && ib === -1) return a.localeCompare(b, 'zh');
      if (ia === -1) return 1;
      if (ib === -1) return -1;
      return ia - ib;
    });
    return names;
  }

  async function personaOf(name){
    if (state.personaCache[name] !== undefined) return state.personaCache[name];
    var text = '';
    try {
      var getNames = api('getCharWorldbookNames'), getWb = api('getWorldbook');
      if (getNames && getWb){
        var binding = await getNames('current');
        var wbName = binding && (binding.primary || (binding.additional && binding.additional[0]));
        if (wbName){
          var entries = await getWb(wbName);
          var want = name + '_通用人设';
          for (var i = 0; i < entries.length; i++){
            if (entries[i] && entries[i].name === want){
              text = String(entries[i].content || '').slice(0, 1400);
              break;
            }
          }
        }
      }
    } catch (e) { text = ''; }
    state.personaCache[name] = text;
    return text;
  }

  // ── 传讯持久化：只写「手机终端」，不触碰 stat_data ──
  async function saveConv(name, msgs){
    var upd = api('updateVariablesWith'), ins = api('insertOrAssignVariables');
    try {
      if (upd){
        await upd(function(v){
          var p = v['手机终端'] || {};
          p['会话'] = p['会话'] || {};
          p['会话'][name] = msgs;
          v['手机终端'] = p;
          return v;
        }, { type:'message', message_id:'latest' });
      } else if (ins){
        var vars = api('getVariables')({ type:'message', message_id:'latest' }) || {};
        var p2 = vars['手机终端'] || {};
        p2['会话'] = p2['会话'] || {};
        p2['会话'][name] = msgs;
        await ins({ '手机终端': p2 }, { type:'message', message_id:'latest' });
      } else {
        showErr('终端无法写入会话：缺少变量写入接口。');
      }
    } catch (e) {
      showErr('保存传讯失败：' + (e && e.message ? e.message : e));
    }
  }

  // ── 渲染 ──
  var viewEl, titleEl, backBtn, inputRow, chatInput, sendBtn, statusStrip;

  function setChrome(title, showBack, showInput, showStrip){
    titleEl.textContent = title;
    backBtn.style.visibility = showBack ? 'visible' : 'hidden';
    inputRow.hidden = !showInput;
    statusStrip.hidden = !showStrip;
  }

  function statusBits(){
    var w = stat()['世界'] || {};
    var bits = [];
    if (w['地点']) bits.push(w['地点']);
    if (w['甲龙历时间']) bits.push(w['甲龙历时间']);
    if (w['天气']) bits.push(w['天气']);
    if (w['危机等级'] !== undefined && w['危机等级'] !== null) bits.push('危机等级 ' + w['危机等级']);
    if (!plotOn()) bits.push('自由探索中');
    return bits;
  }

  function render(){
    viewEl.textContent = '';
    if (state.view === 'home') renderHome();
    else if (state.view === 'contacts') renderContacts();
    else if (state.view === 'chat') renderChat();
    else if (state.view === 'gchat') renderGroupChat();
    else if (state.view === 'groupNew') renderGroupNew();
    else if (state.view === 'person') renderPerson(state.contact);
    else if (state.view === 'album') renderAlbum();
    else if (state.view === 'albumDetail') renderCgDetail();
    else if (state.view === 'memo') renderMemo();
    else if (state.view === 'settings') renderSettings();
    else if (state.view === 'wb') renderWbList();
    else if (state.view === 'wbEdit') renderWbEdit();
    else if (state.view === 'bag') renderBag();
    else if (state.view === 'diary') renderDiary();
    else if (state.view === 'task') renderTask();
    else if (state.view === 'world') renderWorld();
  }

  function renderHome(){
    setChrome('随身终端', false, false, true);
    var bits = statusBits();
    if (bits.length){
      statusStrip.textContent = '';
      bits.forEach(function(b, i){
        if (i > 0) statusStrip.appendChild(document.createTextNode('  ·  '));
        statusStrip.appendChild(document.createTextNode(b));
      });
    } else { statusStrip.hidden = true; }

    var pad = el('div','pad');
    var grid = el('div','grid');
    var apps = [
      { id:'contacts', icon:'i-chat',  label:'传讯' },
      { id:'person',   icon:'i-users', label:'人物' },
      { id:'album',    icon:'i-image', label:'相册' },
      { id:'bag',      icon:'i-bag',   label:'背包' },
      { id:'diary',    icon:'i-book',  label:'手记' },
      { id:'task',     icon:'i-task',  label:'课题' },
      { id:'memo',     icon:'i-note',  label:'备忘' },
      { id:'world',    icon:'i-globe', label:'世界' },
      { id:'wb',       icon:'i-store', label:'世界书' }
    ];
    apps.forEach(function(a){
      var tile = el('div','tile');
      tile.appendChild(icon(a.icon));
      tile.appendChild(el('div','tlabel', a.label));
      if (a.id === 'album'){
        var fresh = unlockedIds().filter(function(id){ return seenIds().indexOf(id) === -1; });
        if (fresh.length) tile.appendChild(el('i','badge'));
      }
      tile.addEventListener('click', function(){
        if (a.id === 'contacts'){ state.view = 'contacts'; state.personMode = false; }
        else if (a.id === 'person'){ state.view = 'contacts'; state.personMode = true; }
        else { state.view = a.id; }
        if (a.id === 'album') markSeen();
        render();
      });
      grid.appendChild(tile);
    });
    pad.appendChild(grid);
    viewEl.appendChild(pad);
  }

  function relOf(name){ return (stat()['关系'] || {})[name] || {}; }

  function renderContacts(){
    if (state.personMode){
      setChrome('人物', true, false, false);
      var pad0 = el('div','pad');
      var names0 = convList();
      if (!names0.length){
        pad0.appendChild(el('div','empty','尚无人物关系记录'));
        viewEl.appendChild(pad0); return;
      }
      names0.forEach(function(name){
        var rel = relOf(name);
        var row = el('div','row');
        var grow = el('div','grow');
        grow.appendChild(el('div','name', name));
        var subBits = [];
        if (rel['关系阶段']) subBits.push(rel['关系阶段']);
        if (rel['当前状态']) subBits.push(rel['当前状态']);
        grow.appendChild(el('div','sub', subBits.join(' · ') || '暂无关系记录'));
        row.appendChild(grow);
        if (rel['亲密度'] !== undefined){
          var wrap = el('div'); wrap.style.textAlign = 'right';
          wrap.appendChild(el('div','sub', '亲密度 ' + rel['亲密度']));
          var bar = el('div','bar');
          var fill = el('i');
          var v = Number(rel['亲密度']) || 0;
          fill.style.width = Math.max(0, Math.min(100, v)) + '%';
          bar.appendChild(fill);
          wrap.appendChild(bar);
          row.appendChild(wrap);
        }
        row.addEventListener('click', function(){
          state.contact = name; state.view = 'person'; render();
        });
        pad0.appendChild(row);
      });
      viewEl.appendChild(pad0);
      return;
    }
    setChrome('传讯', true, false, true);
    var pad = el('div','pad');
    var tabs = el('div','ctabs');
    var t1 = el('div','ctab' + (state.ctTab !== 'group' ? ' on' : ''), '私聊');
    var t2 = el('div','ctab' + (state.ctTab === 'group' ? ' on' : ''), '群聊');
    t1.addEventListener('click', function(){ state.ctTab = 'direct'; render(); });
    t2.addEventListener('click', function(){ state.ctTab = 'group'; render(); });
    tabs.appendChild(t1);
    tabs.appendChild(t2);
    pad.appendChild(tabs);
    var groups = phoneData()['群聊'] || {};
    if (state.ctTab === 'group'){
      var gnames = Object.keys(groups);
      var addRow = el('div','wbTools');
      var addBtn = el('button','tb on','新建群聊');
      addBtn.addEventListener('click', function(){
        state.gDraft = { name: '', members: [] };
        state.view = 'groupNew'; render();
      });
      addRow.appendChild(addBtn);
      pad.appendChild(addRow);
      if (!gnames.length){
        pad.appendChild(el('div','empty','还没有群聊。新建一个，把家人拉进来'));
      }
      gnames.forEach(function(gn){
        var g = groups[gn] || {};
        var members = g['成员'] || [];
        var msgs = g['消息'] || [];
        var last = msgs.length ? msgs[msgs.length - 1] : null;
        var row = el('div','row');
        var grow = el('div','grow');
        grow.appendChild(el('div','name', gn));
        var sub = members.join('、') + ' · ' + members.length + '人';
        if (last) sub = (last['r'] === 'u' ? '我：' : (last['from'] || '') + '：') + String(last['t'] || '').slice(0, 24) + ' · ' + sub;
        grow.appendChild(el('div','sub', sub));
        row.appendChild(grow);
        row.appendChild(el('span','tag', '群聊'));
        row.addEventListener('click', function(){
          state.gname = gn; state.view = 'gchat'; render();
        });
        pad.appendChild(row);
      });
    } else {
      var names = convList();
      if (!names.length){
        pad.appendChild(el('div','empty','尚无人物关系记录'));
        viewEl.appendChild(pad); return;
      }
      names.forEach(function(name){
        var rel = relOf(name);
        var row = el('div','row');
        var grow = el('div','grow');
        grow.appendChild(el('div','name', name));
        var subBits = [];
        if (rel['关系阶段']) subBits.push(rel['关系阶段']);
        if (rel['当前状态']) subBits.push(rel['当前状态']);
        grow.appendChild(el('div','sub', subBits.join(' · ') || '暂无关系记录'));
        row.appendChild(grow);
        if (rel['亲密度'] !== undefined){
          var wrap = el('div'); wrap.style.textAlign = 'right';
          wrap.appendChild(el('div','sub', '亲密度 ' + rel['亲密度']));
          var bar = el('div','bar');
          var fill = el('i');
          var v = Number(rel['亲密度']) || 0;
          fill.style.width = Math.max(0, Math.min(100, v)) + '%';
          bar.appendChild(fill);
          wrap.appendChild(bar);
          row.appendChild(wrap);
        }
        row.addEventListener('click', function(){
          state.contact = name; state.view = 'chat'; render();
        });
        pad.appendChild(row);
      });
    }
    viewEl.appendChild(pad);
  }

    function renderChat(){
    setChrome(state.contact || '传讯', true, true, false);
    var wrap = el('div'); wrap.id = 'chatWrap';
    var msgs = el('div'); msgs.id = 'msgs';
    var conv = ((phoneData()['会话'] || {})[state.contact]) || [];
    if (!conv.length){
      msgs.appendChild(el('div','empty','还没有传讯记录，发一条消息吧'));
    }
    conv.forEach(function(m){
      var cls = m.r === 'u' ? 'me' : 'them';
      msgs.appendChild(el('div','bubble ' + cls, m.t));
    });
    if (state.generating){
      msgs.appendChild(el('div','bubble sys','对方正在输入…'));
    }
    wrap.appendChild(msgs);
    viewEl.textContent = '';
    viewEl.appendChild(wrap);
    msgs.scrollTop = msgs.scrollHeight;
    state._msgsEl = msgs;
  }

  async function send(){
    if (state.generating || !state.contact) return;
    var text = (chatInput.value || '').trim();
    if (!text) return;
    var gen = api('generateRaw');
    if (!gen){ showErr('终端无法传讯：缺少生成接口。'); return; }
    chatInput.value = '';
    var conv = (((phoneData()['会话'] || {})[state.contact]) || []).slice();
    conv.push({ r:'u', t:text, ts: Date.now() });
    state.generating = true;
    renderChat();
    try {
      var rel = relOf(state.contact);
      var persona = await personaOf(state.contact);
      var sysBits = [
        '你在《无职转生》同人角色卡中扮演「' + state.contact + '」，正通过随身魔导终端与鲁迪乌斯（玩家）文字传讯。',
        '当前关系：亲密度 ' + (rel['亲密度'] !== undefined ? rel['亲密度'] : '未知') +
          '，关系阶段「' + (rel['关系阶段'] || '未知') + '」' +
          (rel['当前状态'] ? '，当前状态：' + rel['当前状态'] : '') +
          (rel['承诺'] ? '，已有承诺：' + rel['承诺'] : '') + '。'
      ];
      if (persona) sysBits.push('人物设定参考（ absorb 神韵，不要照念原文）：' + persona);
      sysBits.push('传讯规则：直接以「' + state.contact + '」的口吻回复，简短自然（一到三句），符合当前关系与性格；不要旁白与描写，不要加引号，不要复述本规则。');
      var hist = conv.slice(-12).map(function(m){ return (m.r === 'u' ? '鲁迪乌斯' : state.contact) + '：' + m.t; }).join('\\n');
      var ordered = [{ role:'system', content: sysBits.join('\\n') }];
      if (hist) ordered.push({ role:'system', content: '近期传讯记录：\\n' + hist });
      ordered.push('user_input');
      var genCfg = { user_input: text, ordered_prompts: ordered };
      var ac = loadApiCfg();
      if (ac.key && ac.apiurl && ac.model) genCfg.custom_api = { apiurl: ac.apiurl, key: ac.key, model: ac.model, source: 'openai' };
      var reply = await gen(genCfg);
      reply = cleanReply(reply, state.contact);
      if (reply){
        conv.push({ r:'c', t: reply, ts: Date.now() });
      } else {
        conv.push({ r:'c', t:'（对方没有回复，稍后再试试）', ts: Date.now() });
      }
    } catch (e) {
      state._chatErr = '传讯失败：' + (e && e.message ? e.message : e);
    }
    state.generating = false;
    if (state.view === 'chat' && state.contact){
      await saveConv(state.contact, conv);
      await load();
    } else {
      await saveConv(state.contact, conv);
    }
    if (state._chatErr){
      showErr(state._chatErr);
      state._chatErr = null;
    }
  }

  function cleanReply(text, name){
    var t = String(text == null ? '' : text).trim();
    t = t.replace(/^[「『"']+/, '').replace(/[」』"']+$/, '');
    t = t.replace(new RegExp('^' + name + '[：:]\\s*'), '');
    return t.trim();
  }

  function renderPerson(name){
    setChrome(name || '人物', true, false, false);
    var pad = el('div','pad');
    var rel = relOf(name);
    if (!name || !Object.keys(rel).length){
      pad.appendChild(el('div','empty','暂无该人物的关系记录'));
      viewEl.appendChild(pad); return;
    }
    var card = el('div','card');
    card.appendChild(el('h4','' , name));
    [['亲密度', rel['亲密度']], ['关系阶段', rel['关系阶段']], ['承诺', rel['承诺']], ['当前状态', rel['当前状态']]]
      .forEach(function(kv){
        if (kv[1] === undefined || kv[1] === '') return;
        var line = el('div','kv');
        line.appendChild(el('span','k', kv[0]));
        line.appendChild(el('span','v', kv[1]));
        card.appendChild(line);
      });
    pad.appendChild(card);

    var memo = rel['私人记忆'] || {};
    var keys = Object.keys(memo).sort(function(a,b){
      return (Number(memo[b] && memo[b]['重要性']) || 0) - (Number(memo[a] && memo[a]['重要性']) || 0);
    });
    if (keys.length){
      pad.appendChild(el('div','sect','私人记忆'));
      keys.forEach(function(k){
        var m = memo[k] || {};
        var c = el('div','card');
        c.appendChild(el('h4','', m['标题'] || k));
        c.appendChild(el('p','', m['内容'] || ''));
        var metaBits = [];
        if (m['发生时间']) metaBits.push(m['发生时间']);
        if (m['发生地点']) metaBits.push(m['发生地点']);
        if (m['情感标签']) metaBits.push(m['情感标签']);
        if (m['重要性'] !== undefined) metaBits.push('重要性 ' + m['重要性'] + '/5');
        if (metaBits.length) c.appendChild(el('div','meta', metaBits.join(' · ')));
        pad.appendChild(c);
      });
    }
    viewEl.appendChild(pad);
  }

  function renderBag(){
    setChrome('背包', true, false, false);
    var pad = el('div','pad');
    var bag = stat()['背包'] || {};
    var keys = Object.keys(bag);
    if (!keys.length){
      pad.appendChild(el('div','empty','背包里还没有东西'));
      viewEl.appendChild(pad); return;
    }
    keys.sort(function(a,b){ return (Number(bag[a] && bag[a].$time) || 0) - (Number(bag[b] && bag[b].$time) || 0); });
    keys.forEach(function(k){
      var it = bag[k] || {};
      var row = el('div','row'); row.style.cursor = 'default';
      var grow = el('div','grow');
      var nameLine = el('div','name', k + (it['数量'] !== undefined ? '  ×' + it['数量'] : ''));
      grow.appendChild(nameLine);
      if (it['描述']) grow.appendChild(el('div','sub', it['描述']));
      var metaBits = [];
      if (it['获得时间']) metaBits.push('获得于 ' + it['获得时间']);
      if (it['获得地点']) metaBits.push(it['获得地点']);
      if (it['相关人物']) metaBits.push('相关：' + it['相关人物']);
      if (metaBits.length) grow.appendChild(el('div','sub', metaBits.join(' · ')));
      row.appendChild(grow);
      if (it['重要性'] && it['重要性'] !== '普通'){
        row.appendChild(el('span','tag', it['重要性']));
      }
      pad.appendChild(row);
    });
    viewEl.appendChild(pad);
  }

  function renderDiary(){
    setChrome('手记', true, false, false);
    var pad = el('div','pad');
    var diary = (stat()['日记'] || {})['已完成'] || {};
    var keys = Object.keys(diary);
    var ch = chapterNow();
    pad.appendChild(el('div','sect','已写下 ' + keys.length + ' 篇'));
    if (!keys.length){
      pad.appendChild(el('div','empty','还没有写下日记。下面是写日记之前想做的事：'));
    }
    keys.sort(function(a,b){ return (Number(diary[a] && diary[a].$time) || 0) - (Number(diary[b] && diary[b].$time) || 0); });
    keys.forEach(function(k){
      var dd = diary[k] || {};
      var c = el('div','card');
      c.appendChild(el('h4','', dd['标题'] || k));
      c.appendChild(el('p','', dd['内容'] || ''));
      var metaBits = [];
      if (dd['完成时间']) metaBits.push(dd['完成时间']);
      if (dd['见证者']) metaBits.push('见证：' + dd['见证者']);
      if (metaBits.length) c.appendChild(el('div','meta', metaBits.join(' · ')));
      pad.appendChild(c);
    });
    if (keys.length) pad.appendChild(el('div','sect','想做的事（100件事清单）'));
    renderChecklists(pad, DIARY_LISTS, ch);
    viewEl.appendChild(pad);
  }

  function renderTask(){
    setChrome('课题', true, false, false);
    var pad = el('div','pad');
    var done = ((stat()['课题'] || {})['已完成']) || {};
    var cats = Object.keys(done);
    if (!cats.length){
      pad.appendChild(el('div','empty','课题尚未开始'));
      viewEl.appendChild(pad); return;
    }
    cats.forEach(function(cat){
      var items = done[cat] || {};
      pad.appendChild(el('div','sect', cat + '（' + Object.keys(items).length + '）'));
      Object.keys(items).forEach(function(id){
        var t = items[id] || {};
        var c = el('div','card');
        c.appendChild(el('h4','', t['标题'] || id));
        var metaBits = [];
        if (t['完成时间']) metaBits.push(t['完成时间']);
        if (t['完成地点']) metaBits.push(t['完成地点']);
        if (metaBits.length) c.appendChild(el('div','meta', metaBits.join(' · ')));
        if (t['评价']) c.appendChild(el('p','', t['评价']));
        pad.appendChild(c);
      });
    });
    if (chapterNow() >= 69) pad.appendChild(el('div','sect','家人留下的课题清单'));
    renderChecklists(pad, TASK_LISTS, chapterNow());
    viewEl.appendChild(pad);
  }

  function kvCard(title, obj, fields){
    var card = el('div','card');
    card.appendChild(el('h4','', title));
    (fields || Object.keys(obj)).forEach(function(f){
      var v = obj[f];
      if (v === undefined || v === null || v === '' ) return;
      if (typeof v === 'object') return;
      var line = el('div','kv');
      line.appendChild(el('span','k', f));
      line.appendChild(el('span','v', v));
      card.appendChild(line);
    });
    return card;
  }

  function renderWorld(){
    setChrome('世界', true, false, false);
    var pad = el('div','pad');
    var s = stat();
    var on = plotOn();
    var toggleCard = el('div','card');
    toggleCard.appendChild(el('h4','','剧情推进'));
    toggleCard.appendChild(el('p','', on ? '主线推进中：AI按章节大纲与节点推进剧情。' : '自由探索中：无章节压力，随时可回主线。'));
    var tbtn = el('button', on ? 'testBtn' : 'saveBtn', on ? '关闭剧情·进入自由探索' : '开启剧情·回到主线');
    tbtn.style.width = '100%';
    tbtn.style.marginTop = '8px';
    tbtn.addEventListener('click', async function(){
      tbtn.disabled = true;
      tbtn.textContent = '切换中…';
      await setPlotMode(!on);
    });
    toggleCard.appendChild(tbtn);
    pad.appendChild(toggleCard);
    pad.appendChild(kvCard('世界', s['世界'] || {}));
    pad.appendChild(kvCard('鲁迪乌斯', s['鲁迪'] || {}));
    var plot = Object.assign({}, s['剧情'] || {});
    plot['已完成节点'] = undefined;
    pad.appendChild(kvCard('剧情', plot));
    var free = s['自由探索'] || {};
    if (free['正在做什么'] || (free['身边NPC'] && free['身边NPC'].length)){
      var card = el('div','card');
      card.appendChild(el('h4','','自由探索'));
      if (free['正在做什么']) card.appendChild(el('p','', '正在做什么：' + free['正在做什么']));
      if (free['身边NPC'] && free['身边NPC'].length) card.appendChild(el('p','', '身边：' + free['身边NPC'].join('、')));
      var moods = free['NPC心情'] || {};
      Object.keys(moods).forEach(function(n){ card.appendChild(el('p','', n + '：' + moods[n])); });
      pad.appendChild(card);
    }
    var pending = (s['剧情'] || {})['待处理事件'] || {};
    var pkeys = Object.keys(pending);
    if (pkeys.length){
      pad.appendChild(el('div','sect','待处理事件'));
      pkeys.forEach(function(id){
        var ev0 = pending[id] || {};
        var c = el('div','card');
        c.appendChild(el('h4','', ev0['摘要'] || id));
        var bits = [];
        if (ev0['状态']) bits.push('状态：' + ev0['状态']);
        if (ev0['优先级'] !== undefined && ev0['优先级'] !== null) bits.push('优先级 ' + ev0['优先级'] + '/5');
        if (bits.length) c.appendChild(el('div','meta', bits.join(' · ')));
        pad.appendChild(c);
      });
    }
    var flags = s['事件'] || {};
    var flagTitles = { '灾前准备': '灾前准备', '家庭危机': '家庭危机', '大转移': '大转移', '关键关系': '关键关系' };
    var anyFlag = Object.keys(flags).some(function(k){ return flags[k] && typeof flags[k] === 'object'; });
    if (anyFlag){
      pad.appendChild(el('div','sect','事件脉络'));
      var fc = el('div','card');
      Object.keys(flagTitles).forEach(function(k){
        var group = flags[k];
        if (!group || typeof group !== 'object') return;
        fc.appendChild(el('h4','', flagTitles[k]));
        Object.keys(group).forEach(function(fk){
          var line = el('div','flag');
          line.appendChild(el('span','', fk));
          line.appendChild(el('span','st ' + (group[fk] === true ? 'ok' : 'no2'), group[fk] === true ? '已发生' : '未发生'));
          fc.appendChild(line);
        });
      });
      pad.appendChild(fc);
    }
    var extra = (s['剧情'] || {})['番外'];
    if (extra && (extra['当前状态'] !== '未选择' || extra['当前ID'])){
      var ec = el('div','card');
      ec.appendChild(el('h4','','番外'));
      if (extra['当前分类']) ec.appendChild(el('p','', '分类：' + extra['当前分类']));
      if (extra['当前ID']) ec.appendChild(el('p','', '编号：' + extra['当前ID']));
      if (extra['当前状态']) ec.appendChild(el('p','', '状态：' + extra['当前状态']));
      var done0 = extra['已完成'] || {};
      var dn = Object.keys(done0).filter(function(k){ return done0[k] === true; }).length;
      if (dn) ec.appendChild(el('p','', '已完成番外 ' + dn + ' 个'));
      pad.appendChild(ec);
    }
    viewEl.appendChild(pad);
  }

  // ── 群聊：多成员会话 + AI路由判定（参考 world-backstage 社交终端）──
  function groupMap(){ return phoneData()['群聊'] || {}; }
  function groupOf(gn){ return (phoneData()['群聊'] || {})[gn] || null; }
  function saveGroup(gn, g){
    var upd = api('updateVariablesWith'), ins = api('insertOrAssignVariables');
    var payload = {};
    payload['群聊'] = payload['群聊'] || {};
    return (async function(){
      try {
        if (upd){
          await upd(function(v){
            var p = v['手机终端'] || {};
            p['群聊'] = p['群聊'] || {};
            p['群聊'][gn] = g;
            v['手机终端'] = p;
            return v;
          }, { type: 'message', message_id: 'latest' });
        } else if (ins){
          var vars = api('getVariables')({ type: 'message', message_id: 'latest' }) || {};
          var p2 = vars['手机终端'] || {};
          p2['群聊'] = p2['群聊'] || {};
          p2['群聊'][gn] = g;
          await ins({ '手机终端': p2 }, { type: 'message', message_id: 'latest' });
        }
      } catch (e) { showErr('保存群聊失败：' + (e && e.message ? e.message : e)); }
    })();
  }
  function renderGroupNew(){
    setChrome('新建群聊', true, false, false);
    var pad = el('div','pad wbEdit');
    var nameRow = el('div','formRow');
    nameRow.appendChild(el('label','','群聊名称（留空用默认）'));
    var nameInp = document.createElement('input');
    nameInp.value = state.gDraft.name || '';
    nameInp.placeholder = '例如：格雷拉特家';
    nameRow.appendChild(nameInp);
    pad.appendChild(nameRow);
    pad.appendChild(el('div','sect','选择成员（至少2人）'));
    convList().forEach(function(name){
      var sel = state.gDraft.members.indexOf(name) !== -1;
      var row = el('div','memRow' + (sel ? ' sel' : ''));
      var ck = el('span','ck');
      ck.appendChild(icon('i-check2'));
      row.appendChild(ck);
      var rel = relOf(name);
      var grow = el('div','grow');
      grow.appendChild(el('div','name', name));
      if (rel['关系阶段']) grow.appendChild(el('div','sub', rel['关系阶段']));
      row.appendChild(grow);
      row.addEventListener('click', function(){
        var i = state.gDraft.members.indexOf(name);
        if (i === -1) state.gDraft.members.push(name);
        else state.gDraft.members.splice(i, 1);
        render();
      });
      pad.appendChild(row);
    });
    var mk = el('button','saveBtn','创建群聊');
    mk.style.width = '100%';
    mk.style.marginTop = '8px';
    mk.addEventListener('click', function(){
      var gn = (nameInp.value || '').trim() || ('群聊·' + state.gDraft.members[0] + '等');
      if (state.gDraft.members.length < 2){ showErr('至少选择2名成员'); return; }
      var groups = phoneData()['群聊'] || {};
      if (groups[gn]){ showErr('已有同名群聊'); return; }
      saveGroup(gn, { '成员': state.gDraft.members.slice(), '消息': [] }).then(function(){
        state.gname = gn; state.view = 'gchat';
        load();
      });
    });
    pad.appendChild(mk);
    viewEl.appendChild(pad);
  }
  function renderGroupChat(){
    var g = groupOf(state.gname);
    if (!g){ state.view = 'contacts'; render(); return; }
    setChrome(state.gname, true, true, false);
    var wrap = el('div'); wrap.id = 'chatWrap';
    var msgs = el('div'); msgs.id = 'msgs';
    var list = g['消息'] || [];
    if (!list.length){
      msgs.appendChild(el('div','empty','群聊已建立。发一条消息，家人们会各自决定要不要回应'));
    }
    list.forEach(function(m){
      if (m['r'] !== 'u' && m['from']){
        msgs.appendChild(el('div','gsend', m['from']));
      }
      var cls = m['r'] === 'u' ? 'me' : 'them';
      msgs.appendChild(el('div','bubble ' + cls, m['t']));
    });
    if (state.generating){
      msgs.appendChild(el('div','bubble sys','家人们正在看消息…'));
    }
    wrap.appendChild(msgs);
    viewEl.textContent = '';
    viewEl.appendChild(wrap);
    msgs.scrollTop = msgs.scrollHeight;
  }
  async function sendGroup(){
    if (state.generating || !state.gname) return;
    var g = groupOf(state.gname);
    if (!g) return;
    var text = (chatInput.value || '').trim();
    if (!text) return;
    var gen = api('generateRaw');
    if (!gen){ showErr('终端无法传讯：缺少生成接口。'); return; }
    chatInput.value = '';
    var members = g['成员'] || [];
    var list = (g['消息'] || []).slice();
    list.push({ r: 'u', t: text, ts: Date.now() });
    state.generating = true;
    renderGroupChat();
    try {
      var ac = loadApiCfg();
      var personaBits = [];
      for (var pi = 0; pi < members.length; pi++){
        var pn = members[pi];
        var pp = await personaOf(pn);
        var rel = relOf(pn);
        personaBits.push('【' + pn + '】关系：亲密度' + (rel['亲密度'] !== undefined ? rel['亲密度'] : '?') + '，' + (rel['关系阶段'] || '未知') + '；' + (pp ? pp.slice(0, 500) : '无更多资料'));
      }
      var hist = list.slice(-14).map(function(m){
        return (m['r'] === 'u' ? '鲁迪乌斯' : (m['from'] || '?')) + '：' + m['t'];
      }).join(NLJ);
      var roster = members.map(function(mn, mi){ return (mi + 1) + '.' + mn; }).join(' ');
      var sys = '[群聊路由]' + NLJ +
        '你在《无职转生》同人卡中模拟一个群聊。群名：' + state.gname + '。' + NLJ +
        '成员名单（member字段必须使用以下序号）：' + roster + NLJ +
        '成员资料：' + NLJ + personaBits.join(NLJ) + NLJ +
        '路由规则：每个成员独立判断是否回复——saw（在场或能收到）、knows（与自己的事相关）、willing（按性格与关系愿意开口）；任一不满足就沉默。允许零人回复；最多3人回复；每条回复1-3句，符合各自性格与关系。' + NLJ +
        '只输出单行紧凑JSON数组，形如 [{"member":2,"text":"回复"}]，member用名单序号；没有成员回复则输出 []，不要任何多余文字。';
      var ordered = [{ role: 'system', content: sys }];
      if (hist) ordered.push({ role: 'system', content: '近期群聊记录：' + NLJ + hist });
      ordered.push('user_input');
      var genCfg = { user_input: text, ordered_prompts: ordered };
      if (ac.key && ac.apiurl && ac.model) genCfg.custom_api = { apiurl: ac.apiurl, key: ac.key, model: ac.model, source: 'openai' };
      var raw = await gen(genCfg);
      var replies = parseGroupReplies(raw, members);
      replies.forEach(function(it){
        list.push({ r: 'c', from: it.name, t: it.text, ts: Date.now() });
      });
      if (!replies.length){
        list.push({ r: 'c', from: '系统', t: '（大家都没说话，也许这个话题该当面聊）', ts: Date.now() });
      }
    } catch (e) {
      state._chatErr = '群聊失败：' + (e && e.message ? e.message : e);
    }
    state.generating = false;
    if (list.length > 400) list = list.slice(-400);
    await saveGroup(state.gname, { '成员': members, '消息': list });
    await load();
    if (state._chatErr){ showErr(state._chatErr); state._chatErr = null; }
  }
  function parseGroupReplies(raw, members){
    var t = String(raw == null ? '' : raw).trim();
    var fence = String.fromCharCode(96) + String.fromCharCode(96) + String.fromCharCode(96);
    t = t.replace(new RegExp('^' + fence + '(?:json)?', 'i'), '').replace(new RegExp(fence + '$'), '').trim();
    var m = t.match(/\\[[\\s\\S]*\\]/);
    if (m) t = m[0];
    var arr;
    try { arr = JSON.parse(t); } catch (e) { return []; }
    if (!Array.isArray(arr)) return [];
    var seen = {};
    var out = [];
    arr.forEach(function(it){
      if (!it || typeof it !== 'object') return;
      var tx = String(it.text || '').trim();
      if (!tx) return;
      var nm = null;
      var idx = Number(it.member);
      if (isFinite(idx) && idx >= 1 && idx <= members.length) nm = members[idx - 1];
      if (!nm){
        var given = String(it.name || it.member || '').trim();
        if (given){
          members.forEach(function(mn){
            if (!nm && (mn.indexOf(given) !== -1 || given.indexOf(mn) !== -1)) nm = mn;
          });
        }
      }
      if (!nm || seen[nm]) return;
      seen[nm] = true;
      out.push({ name: nm, text: tx.slice(0, 1600) });
    });
    return out.slice(0, 3);
  }

  // ── 世界书应用：浏览/编辑《无职转生-专属记忆》全部条目 ──
  var MANAGED_ENTRIES = ['洛琪希专属记忆', '希露菲专属记忆', '艾莉丝专属记忆', '想做的100件事', '家人留下的课题', '日记与课题记录'];
  var WB_LOCK_KEY = 'mushoku.phone.wb.locks';
  function lockedNames(){
    try { return JSON.parse(localStorage.getItem(WB_LOCK_KEY) || '[]') || []; }
    catch (e) { return []; }
  }
  function setLocked(name, on){
    var l = lockedNames();
    var i = l.indexOf(name);
    if (on && i === -1){ l.push(name); }
    if (!on && i !== -1){ l.splice(i, 1); }
    try { localStorage.setItem(WB_LOCK_KEY, JSON.stringify(l)); } catch (e) { /* 忽略 */ }
  }
  function isManaged(name){ return MANAGED_ENTRIES.indexOf(name) !== -1; }
  function renderWbList(){
    setChrome('世界书', true, false, false);
    var pad = el('div','pad');
    var addRow = el('div','wbTools');
    var addBtn = el('button','tb','新增条目');
    addBtn.addEventListener('click', function(){
      state.wbEditName = null;
      state.view = 'wbEdit';
      render();
    });
    addRow.appendChild(addBtn);
    pad.appendChild(addRow);
    var info = el('div','sect','《无职转生-专属记忆》全部条目');
    pad.appendChild(info);
    var getWb = api('getWorldbook');
    if (!getWb){ pad.appendChild(el('div','empty','缺少世界书读取接口')); viewEl.appendChild(pad); return; }
    getWb(MEMO_WB_NAME).then(function(list){
      pad.textContent = '';
      pad.appendChild(addRow);
      pad.appendChild(info);
      if (!list || !list.length){
        pad.appendChild(el('div','empty','世界书还没有条目'));
        viewEl.appendChild(pad);
        return;
      }
      var locks = lockedNames();
      list.forEach(function(e){
        var managed = isManaged(e.name);
        var locked = locks.indexOf(e.name) !== -1;
        var row = el('div','wbRow');
        var grow = el('div','grow');
        grow.appendChild(el('div','wn', e.name));
        var meta = [];
        meta.push(managed ? '终端维护' : '手动条目');
        meta.push((e.content || '').length + ' 字');
        if (locked) meta.push('已锁定');
        grow.appendChild(el('div','wm', meta.join(' · ')));
        row.appendChild(grow);
        if (!e.enabled) row.appendChild(el('span','offTag','停用'));
        var lt = el('span','lockTag ' + (locked || !managed ? 'man' : 'auto'), locked ? '锁定' : (managed ? '自动' : '自由'));
        row.appendChild(lt);
        row.addEventListener('click', function(){
          state.wbEditName = e.name;
          state.view = 'wbEdit';
          render();
        });
        pad.appendChild(row);
      });
      viewEl.appendChild(pad);
    });
  }
  function renderWbEdit(){
    var name = state.wbEditName;
    setChrome(name || '编辑条目', true, false, false);
    var pad = el('div','pad wbEdit');
    var getWb = api('getWorldbook');
    if (!getWb){ pad.appendChild(el('div','empty','缺少世界书接口')); viewEl.appendChild(pad); return; }
    getWb(MEMO_WB_NAME).then(function(list){
      var e = null;
      (list || []).forEach(function(x){ if (x.name === name) e = x; });
      var isNew = !e;
      var ta = document.createElement('textarea');
      ta.value = e ? (e.content || '') : '';
      ta.placeholder = '条目内容（发给AI的提示词）';
      var tools = el('div','wbTools');
      var saveBtn = el('button','tb on','保存');
      var lockBtn = el('button','tb','');
      var enBtn = el('button','tb','');
      var delBtn = el('button','tb warn','删除条目');
      function refreshTools(){
        var locks = lockedNames();
        var locked = locks.indexOf(name) !== -1;
        lockBtn.textContent = locked ? '解锁（恢复自动维护）' : '锁定（不被自动覆盖）';
        lockBtn.className = 'tb' + (locked ? '' : ' on');
        enBtn.textContent = (isNew ? false : e.enabled) ? '停用条目' : '启用条目';
        delBtn.style.display = isManaged(name) ? 'none' : '';
      }
      refreshTools();
      if (isManaged(name)){
        pad.appendChild(el('div','empty','此条目由终端自动维护。编辑保存后会自动锁定，不再被自动覆盖；解锁后恢复自动维护。'));
      }
      tools.appendChild(saveBtn);
      tools.appendChild(lockBtn);
      tools.appendChild(enBtn);
      tools.appendChild(delBtn);
      pad.appendChild(tools);
      pad.appendChild(ta);
      viewEl.textContent = '';
      viewEl.appendChild(pad);
      function writeWb(mutator, done){
        var upd = api('updateWorldbookWith');
        if (!upd){ showErr('缺少世界书写入接口'); return; }
        upd(MEMO_WB_NAME, function(wb){
          mutator(wb);
          return wb;
        }).then(done);
      }
      saveBtn.addEventListener('click', function(){
        var content = ta.value;
        if (isNew){
          if (!name){ name = '新条目-' + Date.now() % 10000; state.wbEditName = name; }
          writeWb(function(wb){ wb.push({ name: name, enabled: true, content: content }); }, function(){
            setLocked(name, true);
            showToast('条目已创建并锁定');
            state.view = 'wb'; render();
          });
        } else {
          writeWb(function(wb){
            wb.forEach(function(x){ if (x.name === name){ x.content = content; } });
            return wb;
          }, function(){
            setLocked(name, true);
            showToast('已保存并锁定');
          });
        }
      });
      lockBtn.addEventListener('click', function(){
        var locks = lockedNames();
        var locked = locks.indexOf(name) !== -1;
        setLocked(name, !locked);
        showToast(locked ? '已解锁：恢复自动维护' : '已锁定：不会被自动覆盖');
        refreshTools();
      });
      enBtn.addEventListener('click', function(){
        writeWb(function(wb){
          wb.forEach(function(x){ if (x.name === name) x.enabled = !x.enabled; });
          return wb;
        }, function(){ showToast('已更新启用状态'); if (e) e.enabled = !e.enabled; refreshTools(); });
      });
      delBtn.addEventListener('click', function(){
        if (delBtn.textContent === '删除条目'){ delBtn.textContent = '再点一次确认删除'; return; }
        writeWb(function(wb){
          var i = -1;
          for (var k = 0; k < wb.length; k++){ if (wb[k].name === name){ i = k; break; } }
          if (i !== -1) wb.splice(i, 1);
          return wb;
        }, function(){
          setLocked(name, false);
          showToast('条目已删除');
          state.view = 'wb'; render();
        });
      });
    });
  }

  // ── 记忆世界书同步：把 stat_data 私人记忆写成独立世界书的纯文本常驻条目 ──
  var MEMO_WB_NAME = '无职转生-专属记忆';
  var MEMO_CHARS = ['洛琪希', '希露菲', '艾莉丝'];
  var MEMO_WB_ORDER = 20;
  var __lastMemoSig = '';
  var __memoWbReady = false;
  function memoBlock(char){
    var memo = ((stat()['关系'] || {})[char] || {})['私人记忆'] || {};
    var keys = Object.keys(memo).sort(function(a, b){
      return (Number(memo[b] && memo[b]['重要性']) || 0) - (Number(memo[a] && memo[a]['重要性']) || 0);
    });
    if (!keys.length) return '';
    var lines = keys.map(function(k){
      var m = memo[k] || {};
      return '- [重要性' + (m['重要性'] !== undefined ? m['重要性'] : '?') + '/5｜' + (m['情感标签'] || '温馨') + '] '
        + (m['标题'] || k) + '（' + (m['发生时间'] || '?') + '·' + (m['发生地点'] || '?') + '）：' + (m['内容'] || '');
    });
    return '<' + char + '_专属记忆>' + NL2 + lines.join(NL2) + NL2 + '</' + char + '_专属记忆>';
  }
  async function ensureMemoWorldbook(){
    if (__memoWbReady) return true;
    var listFn = api('getWorldbookNames'), create = api('createWorldbook'),
        getNames = api('getCharWorldbookNames'), rebind = api('rebindCharWorldbooks');
    if (!listFn || !create || !getNames || !rebind) return false;
    var all = await listFn();
    if (!all || all.indexOf(MEMO_WB_NAME) === -1){
      await create(MEMO_WB_NAME, ['洛琪希专属记忆', '希露菲专属记忆', '艾莉丝专属记忆', '想做的100件事', '家人留下的课题', '日记与课题记录'].map(function(en){
        return { name: en, enabled: false, content: '',
          strategy: { type: 'constant', keys: [], keys_secondary: { logic: 'and_any', keys: [] }, scan_depth: 'same_as_global' },
          position: { type: 'after_character_definition', role: 'system', depth: 0, order: MEMO_WB_ORDER },
          probability: 100 };
      }));
    }
    var binding = await getNames('current');
    var additional = (binding.additional || []).slice();
    if (additional.indexOf(MEMO_WB_NAME) === -1){
      additional.push(MEMO_WB_NAME);
      await rebind('current', { primary: binding.primary, additional: additional });
    }
    __memoWbReady = true;
    return true;
  }
  // ── 剧情推进开关：切主线/自由探索，剧情控制器按推进模式自门控 ──
  function plotOn(){
    return ((stat()['剧情'] || {})['推进模式'] || '主线推进') !== '自由探索';
  }
  async function setPlotMode(on){
    var upd = api('updateVariablesWith');
    if (upd){
      await upd(function(v){
        var sd = v['stat_data'];
        if (sd == null || typeof sd !== 'object') sd = v['stat_data'] = {};
        var pj = sd['剧情'];
        if (pj == null || typeof pj !== 'object') pj = sd['剧情'] = {};
        pj['推进模式'] = on ? '主线推进' : '自由探索';
        return v;
      }, { type: 'message', message_id: 'latest' });
    }
    showToast(on ? '剧情推进已开启' : '已进入自由探索');
    __lastMemoSig = '';
    await load();
  }

  var __extrasMigrated = false;
  async function migrateExtras(){
    if (__extrasMigrated) return;
    var getNames = api('getCharWorldbookNames'), getWb = api('getWorldbook'),
        updateWb = api('updateWorldbookWith'), createEntries = api('createWorldbookEntries');
    if (!getNames || !getWb || !updateWb || !createEntries) return;
    var binding = await getNames('current');
    var primary = binding && binding.primary;
    if (!primary) return;
    var pb = await getWb(primary);
    var extras = pb.filter(function(e){
      return e && (String(e.name).indexOf('[mvu_extra]') === 0 || e.name === '番外_通用规则');
    });
    if (!extras.length){ __extrasMigrated = true; return; }
    var mb = await getWb(MEMO_WB_NAME);
    var have = {};
    mb.forEach(function(e){ have[e.name] = true; });
    var toAdd = extras.filter(function(e){ return !have[e.name]; });
    if (toAdd.length){
      await createEntries(MEMO_WB_NAME, toAdd.map(function(e){
        return { name: e.name, enabled: e.enabled, content: e.content,
          strategy: e.strategy, position: e.position, recursion: e.recursion,
          effect: e.effect, probability: e.probability };
      }));
    }
    var mb2 = await getWb(MEMO_WB_NAME);
    var have2 = {};
    mb2.forEach(function(e){ have2[e.name] = true; });
    await updateWb(primary, function(wb){
      return wb.filter(function(e){
        return !(have2[e.name] && (String(e.name).indexOf('[mvu_extra]') === 0 || e.name === '番外_通用规则'));
      });
    });
    __extrasMigrated = true;
    if (window.console && console.info) console.info('[随身终端] 番外迁移完成:', extras.length, '条 ->', MEMO_WB_NAME);
  }

  async function syncMemoWorldbook(){
    try {
      var updateWb = api('updateWorldbookWith');
      if (!updateWb || !state.data) return;
      if (!await ensureMemoWorldbook()) return;
      await migrateExtras();
      var chNow = chapterNow();
      var blocks = {}, sig = '';
      MEMO_CHARS.forEach(function(ch){
        blocks[ch + '专属记忆'] = memoBlock(ch);
        sig += blocks[ch + '专属记忆'].length + '|';
      });
      var wishParts = [];
      for (var wi = 0; wi < DIARY_LISTS.length; wi++){
        var wcfg = DIARY_LISTS[wi];
        if (chNow < wcfg.need) continue;
        var wtext = await wbTextOf(wcfg.name);
        var wp = parseListText(wtext);
        if (wp) wishParts.push('# ' + wp.title + NL2 + wp.items.join(NL2));
      }
      blocks['想做的100件事'] = wishParts.join(NL2 + NL2);
      var taskParts = [];
      if (chNow >= 69){
        for (var ti = 0; ti < TASK_LISTS.length; ti++){
          var tcfg = TASK_LISTS[ti];
          var ttext = await wbTextOf(tcfg.name);
          var tp = parseListText(ttext);
          if (tp) taskParts.push('# ' + tp.title + NL2 + tp.items.join(NL2));
        }
      }
      blocks['家人留下的课题'] = taskParts.join(NL2 + NL2);
      var recLines = [];
      var diaryDone = (stat()['日记'] || {})['已完成'] || {};
      var dkeys = Object.keys(diaryDone).sort(function(a, b){ return (Number(diaryDone[a] && diaryDone[a].$time) || 0) - (Number(diaryDone[b] && diaryDone[b].$time) || 0); });
      dkeys.slice(-20).forEach(function(k){
        var dd = diaryDone[k] || {};
        recLines.push('- [日记] ' + (dd['标题'] || k) + '（' + (dd['完成时间'] || '?') + (dd['见证者'] ? '·见证:' + dd['见证者'] : '') + '）：' + (dd['内容'] || ''));
      });
      var questDone = ((stat()['课题'] || {})['已完成']) || {};
      Object.keys(questDone).forEach(function(cat){
        var items = questDone[cat] || {};
        Object.keys(items).forEach(function(id){
          var t = items[id] || {};
          recLines.push('- [课题·' + cat + '] ' + (t['标题'] || id) + '（' + (t['完成时间'] || '?') + '）' + (t['评价'] ? '评价:' + t['评价'] : ''));
        });
      });
      blocks['日记与课题记录'] = recLines.length ? ('<日记与课题记录>' + NL2 + recLines.join(NL2) + NL2 + '</日记与课题记录>') : '';
      sig += blocks['想做的100件事'].length + '|' + blocks['家人留下的课题'].length + '|' + blocks['日记与课题记录'].length;
      if (sig === __lastMemoSig) return;
      var entryNames = ['洛琪希专属记忆', '希露菲专属记忆', '艾莉丝专属记忆', '想做的100件事', '家人留下的课题', '日记与课题记录'];
      var wbLocks = lockedNames();
      await updateWb(MEMO_WB_NAME, function(wb){
        entryNames.forEach(function(en){
          if (wbLocks.indexOf(en) !== -1) return;  // 手动锁定的条目：以世界书为准，不自动覆盖
          var content = blocks[en] || '';
          var hit = null;
          for (var i = 0; i < wb.length; i++){ if (wb[i].name === en) hit = wb[i]; }
          if (hit){
            if (hit.content !== content){ hit.content = content; hit.enabled = content !== ''; }
          } else if (content !== ''){
            wb.push({ name: en, enabled: true, content: content,
              strategy: { type: 'constant', keys: [], keys_secondary: { logic: 'and_any', keys: [] }, scan_depth: 'same_as_global' },
              position: { type: 'after_character_definition', role: 'system', depth: 0, order: MEMO_WB_ORDER },
              probability: 100 });
          }
        });
        return wb;
      });
      __lastMemoSig = sig;
    } catch (e) {
      if (window.console && console.warn) console.warn('[随身终端] 记忆世界书同步失败:', e);
    }
  }

  // ── 图集：解锁判定、收录与相册视图 ──
  function getPath(obj, path){
    var cur = obj;
    var parts = String(path).split('.');
    for (var i = 0; i < parts.length; i++){
      if (cur == null || typeof cur !== 'object') return undefined;
      cur = cur[parts[i]];
    }
    return cur;
  }
  function unlockedMap(){
    return ((stat()['图集'] || {})['已解锁']) || {};
  }
  function unlockedIds(){
    var u = unlockedMap(), ids = [];
    Object.keys(u).forEach(function(k){ if (u[k] === true) ids.push(k); });
    return ids;
  }
  function seenIds(){
    try { return JSON.parse(localStorage.getItem('mushoku.phone.cg.seen') || '[]') || []; }
    catch (e) { return []; }
  }
  function markSeen(){
    try { localStorage.setItem('mushoku.phone.cg.seen', JSON.stringify(unlockedIds())); } catch (e) { /* 忽略 */ }
  }
  function satisfied(item){
    var s = stat();
    var u = item.unlock || {};
    if (u.type === 'node') return ((s['剧情'] || {})['已完成节点'] || {})[u.node] === true;
    if (u.type === 'chapter') return (Number((s['剧情'] || {})['当前章节']) || 0) >= u.chapter;
    if (u.type === 'event') return getPath(s, u.path) === true;
    if (u.type === 'year') return (Number((s['世界'] || {})['甲龙历年份']) || 0) >= u.year;
    return false;
  }
  function conditionText(item){
    var u = item.unlock || {};
    if (u.type === 'node') return '完成节点 ' + u.node;
    if (u.type === 'chapter') return '剧情推进至第 ' + u.chapter + ' 章';
    if (u.type === 'event') return '达成事件：' + String(u.path).split('.').pop();
    if (u.type === 'year') return '时间推进至 ' + u.year + '年';
    return '未知条件';
  }
  // 收录器：对当前 stat_data 纯函数判定，幂等写入 stat_data.图集.已解锁；
  // AI 无权写该字段（更新规则已声明），写入失败不影响展示，下次打开重算自愈。
  async function syncCgUnlocks(){
    var upd = api('updateVariablesWith');
    if (!upd || !state.data) return 0;
    var done = unlockedMap();
    var newly = [];
    CG_MANIFEST.items.forEach(function(it){
      if (satisfied(it) && done[it.id] !== true) newly.push(it.id);
    });
    if (!newly.length) return 0;
    await upd(function(v){
      var sd = v['stat_data'];
      if (sd == null || typeof sd !== 'object') sd = v['stat_data'] = {};
      var coll = sd['图集'];
      if (coll == null || typeof coll !== 'object') coll = sd['图集'] = {};
      var d2 = coll['已解锁'];
      if (d2 == null || typeof d2 !== 'object') d2 = coll['已解锁'] = {};
      newly.forEach(function(id){ if (d2[id] !== true) d2[id] = true; });
      return v;
    }, { type:'message', message_id:'latest' });
    return newly.length;
  }
  function showToast(text){
    var old = document.getElementById('toast');
    if (old && old.parentNode) old.parentNode.removeChild(old);
    var t = el('div','', text);
    t.id = 'toast';
    document.getElementById('phone').appendChild(t);
    setTimeout(function(){ if (t.parentNode) t.parentNode.removeChild(t); }, 2600);
  }
  function thumbNode(item, unlocked){
    var thumb = el('div','thumb');
    if (unlocked && item.file){
      var img = document.createElement('img');
      img.src = item.file;
      img.alt = item.title;
      img.loading = 'lazy';
      img.addEventListener('error', function(){
        thumb.textContent = '';
        thumb.appendChild(icon('i-image'));
      });
      thumb.appendChild(img);
    } else {
      thumb.appendChild(icon('i-image'));
    }
    return thumb;
  }
  function renderAlbum(){
    setChrome('相册', true, false, false);
    var pad = el('div','pad');
    var ids = unlockedIds();
    pad.appendChild(el('div','sect','已收集 ' + ids.length + ' / ' + CG_MANIFEST.items.length));
    var grid = el('div','album');
    var seen = seenIds();
    CG_MANIFEST.items.forEach(function(item){
      var unlocked = ids.indexOf(item.id) !== -1;
      var cardEl = el('div','cg' + (unlocked ? '' : ' locked'));
      cardEl.appendChild(thumbNode(item, unlocked));
      if (!unlocked){
        var lb = el('span','lockbadge');
        lb.appendChild(icon('i-lock'));
        cardEl.appendChild(lb);
      }
      var cap = el('div','cap');
      cap.appendChild(el('div','ct', unlocked ? item.title : '？？？'));
      cap.appendChild(el('div','meta', unlocked ? (item.tag || '') + ' · 已收录' : conditionText(item)));
      if (unlocked && seen.indexOf(item.id) === -1){
        var nb = el('span','tag','新收录');
        cap.appendChild(nb);
      }
      cardEl.appendChild(cap);
      cardEl.addEventListener('click', function(){
        if (!unlocked){ showToast('尚未解锁：' + conditionText(item)); return; }
        state.cgDetail = item.id;
        state.view = 'albumDetail';
        render();
      });
      grid.appendChild(cardEl);
    });
    pad.appendChild(grid);
    viewEl.appendChild(pad);
  }
  function renderCgDetail(){
    var item = null;
    CG_MANIFEST.items.forEach(function(it){ if (it.id === state.cgDetail) item = it; });
    if (!item){ state.view = 'album'; render(); return; }
    setChrome(item.title, true, false, false);
    var pad = el('div','pad cgDetail');
    var big = el('div','big');
    if (item.file){
      var img = document.createElement('img');
      img.src = item.file;
      img.alt = item.title;
      img.addEventListener('error', function(){ big.textContent = ''; big.appendChild(icon('i-image')); });
      big.appendChild(img);
    } else {
      big.appendChild(icon('i-image'));
    }
    pad.appendChild(big);
    if (!item.file) pad.appendChild(el('div','empty','这张图还没有补上，把图片地址填进终端脚本的图集清单即可'));
    var card = el('div','card');
    card.appendChild(el('h4','', item.title));
    card.appendChild(el('p','', item.desc || ''));
    var metaBits = [item.tag || '图集', conditionText(item)];
    card.appendChild(el('div','meta', metaBits.join(' · ')));
    pad.appendChild(card);
    viewEl.appendChild(pad);
  }

  // ── 备忘：玩家自己的便签，存「手机终端.备忘」，AI 经上下文条目可读 ──
  function memoList(){
    var m = phoneData()['备忘'];
    return (m && m.length) ? m : [];
  }
  async function saveMemos(list){
    var upd = api('updateVariablesWith'), ins = api('insertOrAssignVariables');
    try {
      if (upd){
        await upd(function(v){
          var p = v['手机终端'] || {};
          p['备忘'] = list;
          v['手机终端'] = p;
          return v;
        }, { type:'message', message_id:'latest' });
      } else if (ins){
        await ins({ '手机终端': { '备忘': list } }, { type:'message', message_id:'latest' });
      }
    } catch (e) {
      showErr('保存备忘失败：' + (e && e.message ? e.message : e));
    }
  }
  function fmtTime(ts){
    try {
      var dt = new Date(Number(ts) || 0);
      if (!dt.getTime()) return '';
      return (dt.getMonth() + 1) + '月' + dt.getDate() + '日';
    } catch (e) { return ''; }
  }
  function renderMemo(){
    setChrome('备忘', true, false, false);
    var pad = el('div','pad');
    var list = memoList();
    var add = el('div','memoAdd');
    var inp = document.createElement('input');
    inp.placeholder = '记一条打算或提醒';
    inp.maxLength = 120;
    var btn = el('button','addBtn');
    btn.appendChild(icon('i-plus'));
    btn.addEventListener('click', async function(){
      var t = (inp.value || '').trim();
      if (!t) return;
      if (list.length >= 50){ showToast('备忘最多 50 条'); return; }
      list.push({ t: t, ts: Date.now() });
      inp.value = '';
      await saveMemos(list);
      render();
    });
    inp.addEventListener('keydown', function(e){
      if (e.key === 'Enter'){ e.preventDefault(); btn.click(); }
    });
    add.appendChild(inp);
    add.appendChild(btn);
    pad.appendChild(add);
    if (!list.length){
      pad.appendChild(el('div','empty','还没有备忘。写下的内容会出现在剧情里，作为鲁迪乌斯自己的打算'));
    }
    list.slice().reverse().forEach(function(m, idx){
      var row = el('div','memoItem');
      var wrap = el('div');
      wrap.style.flex = '1';
      wrap.style.minWidth = '0';
      wrap.appendChild(el('div','mt', m.t));
      var t = fmtTime(m.ts);
      if (t) wrap.appendChild(el('div','md', t));
      row.appendChild(wrap);
      var del = el('button','delBtn');
      del.title = '删除';
      del.appendChild(icon('i-trash'));
      del.addEventListener('click', async function(){
        list.splice(list.length - 1 - idx, 1);
        await saveMemos(list);
        render();
      });
      row.appendChild(del);
      pad.appendChild(row);
    });
    viewEl.appendChild(pad);
  }

  // ── 数据迁移：按C卡约定——导出下载 / 导入前自动备份 / 结构校验后应用 ──
  function dateStr(){
    var dt = new Date();
    return dt.getFullYear() + '-' + (dt.getMonth() + 1) + '-' + dt.getDate();
  }
  function buildExport(){
    var s = stat();
    var pj = s['剧情'] || {};
    var payload = {
      来源: 'mushoku-phone-export',
      导出时间: new Date().toISOString(),
      进度: { 章节: pj['当前章节'] || null, 回合: (s['系统'] || {})['回合数'] || null },
      stat_data: s,
      手机终端: phoneData()
    };
    return JSON.stringify(payload, null, 2);
  }
  function downloadJson(filename, text){
    var blob = new Blob([text], { type: 'application/json' });
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    setTimeout(function(){ URL.revokeObjectURL(a.href); a.remove(); }, 300);
  }
  function validateBackup(data){
    var errs = [];
    if (!data || typeof data !== 'object' || Array.isArray(data)) { errs.push('不是有效的备份对象'); return errs; }
    if (!data.stat_data || typeof data.stat_data !== 'object') { errs.push('缺少 stat_data'); return errs; }
    var sd = data.stat_data;
    if (!sd['关系'] || typeof sd['关系'] !== 'object') errs.push('缺少 关系 数据');
    if (!sd['剧情'] || typeof sd['剧情'] !== 'object') errs.push('缺少 剧情 数据');
    if (data.来源 && data.来源 !== 'mushoku-phone-export') errs.push('来源标记为「' + data.来源 + '」，不是本终端导出的备份');
    return errs;
  }
  function onImportFile(file){
    if (!file) return;
    var reader = new FileReader();
    reader.onload = async function(){
      var data;
      try { data = JSON.parse(String(reader.result)); }
      catch (e) { showErr('导入失败：文件不是有效的JSON'); return; }
      var errs = validateBackup(data);
      if (errs.length){ showErr('备份文件无效：' + errs.join('；')); return; }
      if (window.console && console.info) console.info('[随身终端·迁移] 导入前自动备份当前数据');
      downloadJson('随身终端导入前备份-' + dateStr() + '.json', buildExport());
      var upd = api('updateVariablesWith');
      if (!upd){ showErr('缺少变量写入接口，无法导入'); return; }
      try {
        await upd(function(v){
          v['stat_data'] = data.stat_data;
          if (data['手机终端']) v['手机终端'] = data['手机终端'];
          return v;
        }, { type: 'message', message_id: 'latest' });
        __lastMemoSig = '';
        state.personaCache = {};
        await load();
        var ch = ((stat()['剧情'] || {})['当前章节']);
        showToast('导入完成：第' + (ch || '?') + '章·回合' + (((stat()['系统'] || {})['回合数']) || '?'));
      } catch (e) {
        showErr('导入失败：' + (e && e.message ? e.message : e));
      }
    };
    reader.readAsText(file);
  }

  // ── 设置：独立API配置 ──
  function renderSettings(){
    setChrome('设置', true, false, false);
    var cfg = loadApiCfg();
    var pad = el('div','pad');
    var presetList = loadPresets();
    var pcard = el('div','card');
    pcard.appendChild(el('h4','','API方案'));
    var pSel = document.createElement('select');
    pSel.id = 'presetSelect';
    pSel.className = 'modelSelect';
    presetList.forEach(function(p){
      var opt = document.createElement('option');
      opt.value = p.name;
      opt.textContent = p.name + ' · ' + p.model;
      if (cfg.name && cfg.name === p.name) opt.selected = true;
      pSel.appendChild(opt);
    });
    var customOpt = document.createElement('option');
    customOpt.value = '__custom';
    customOpt.textContent = '自定义（未存为方案）';
    if (!cfg.name) customOpt.selected = true;
    pSel.appendChild(customOpt);
    pcard.appendChild(pSel);
    var prow = el('div','quickRow');
    prow.style.marginTop = '6px';
    var nameInp = document.createElement('input');
    nameInp.id = 'presetName';
    nameInp.className = 'modelSelect';
    nameInp.style.flex = '1';
    nameInp.placeholder = '方案名（存为方案用）';
    nameInp.value = cfg.name || '';
    prow.appendChild(nameInp);
    var psave = el('button','quickBtn','存为方案');
    psave.addEventListener('click', function(){
      var nm = nameInp.value.trim();
      if (!nm){ showErr('先填方案名再保存'); return; }
      var cfg2 = {
        name: nm,
        apiurl: document.getElementById('setApi').value.trim(),
        key: document.getElementById('setKey').value.trim(),
        model: document.getElementById('setModel').value.trim()
      };
      if (!cfg2.apiurl || !cfg2.model){ showErr('地址和模型都要填写'); return; }
      var pl = loadPresets();
      var hit = false;
      pl.forEach(function(p, i){ if (p.name === nm){ pl[i] = cfg2; hit = true; } });
      if (!hit) pl.push(cfg2);
      savePresetList(pl);
      saveApiCfg(cfg2);
      showToast('方案已保存：' + nm);
      render();
    });
    prow.appendChild(psave);
    var pdel = el('button','quickBtn','删除方案');
    pdel.addEventListener('click', function(){
      var nm = (nameInp.value || '').trim();
      var pl = loadPresets();
      var next = pl.filter(function(p){ return p.name !== nm; });
      if (next.length === pl.length){ showErr('方案名不存在：' + nm); return; }
      savePresetList(next);
      showToast('方案已删除：' + nm);
      render();
    });
    prow.appendChild(pdel);
    pcard.appendChild(prow);
    pcard.appendChild(el('div','formNote','下拉切换方案立即生效并记忆；字段改动后点「保存」更新当前方案，或在上方填新名字「存为方案」。'));
    pad.appendChild(pcard);
    var form = el('div','form');
    function frow(label, id, val, isPw){
      var r = el('div','formRow');
      r.appendChild(el('label','', label));
      var inp = document.createElement('input');
      inp.id = id;
      inp.value = val;
      if (isPw) inp.type = 'password';
      r.appendChild(inp);
      return r;
    }
    form.appendChild(frow('接口地址（OpenAI 兼容 /v1）', 'setApi', cfg.apiurl));
    form.appendChild(frow('接口密钥（留空则跟随酒馆当前连接）', 'setKey', cfg.key, true));
    var mr = frow('模型', 'setModel', cfg.model);
    var quick = el('div','quickRow');
    [['3 Flash', 'gemini-3-flash-preview'], ['3.5 Flash', 'gemini-3.5-flash']].forEach(function(qb){
      var b = el('button','quickBtn', qb[0]);
      b.addEventListener('click', function(){
        document.getElementById('setModel').value = qb[1];
      });
      quick.appendChild(b);
    });
    var fetchBtn = el('button','quickBtn','拉取模型');
    fetchBtn.addEventListener('click', async function(){
      var apiurl = document.getElementById('setApi').value.trim();
      var key = document.getElementById('setKey').value.trim();
      var gm = api('getModelList');
      if (typeof gm !== 'function'){ showErr('缺少模型列表接口（getModelList）'); return; }
      if (!apiurl){ showErr('请先填写接口地址再拉取模型'); return; }
      fetchBtn.textContent = '拉取中…';
      var list = [];
      try {
        list = await gm({ apiurl: apiurl, key: key || undefined }) || [];
      } catch (e) {
        list = [];
        if (window.console && console.info) console.info('[随身终端·设置] 拉取模型列表失败', e);
        showErr('拉取模型列表失败：' + (e && e.message ? e.message : e));
      }
      fetchBtn.textContent = '拉取模型';
      var sel = document.getElementById('modelSelect');
      var st = document.getElementById('modelStatus');
      if (!list.length){ if (st) st.textContent = '未拉取到模型，请检查地址与密钥'; return; }
      sel.textContent = '';
      list.forEach(function(mid){
        var opt = document.createElement('option');
        opt.value = mid;
        opt.textContent = mid;
        sel.appendChild(opt);
      });
      var cur = document.getElementById('setModel').value;
      if (cur && list.indexOf(cur) !== -1) sel.value = cur;
      sel.style.display = 'block';
      if (st) st.textContent = '已拉取 ' + list.length + ' 个模型，下拉选择后自动填入';
    });
    quick.appendChild(fetchBtn);
    mr.appendChild(quick);
    var msel = document.createElement('select');
    msel.id = 'modelSelect';
    msel.className = 'modelSelect';
    msel.style.display = 'none';
    msel.addEventListener('change', function(){
      document.getElementById('setModel').value = msel.value;
    });
    mr.appendChild(msel);
    var mstat = el('div','formNote','');
    mstat.id = 'modelStatus';
    mr.appendChild(mstat);
    form.appendChild(mr);
    pad.appendChild(form);

    var btns = el('div','formBtns');
    var save = el('button','saveBtn','保存');
    save.addEventListener('click', function(){
      var cfg2 = {
        apiurl: document.getElementById('setApi').value.trim(),
        key: document.getElementById('setKey').value.trim(),
        model: document.getElementById('setModel').value.trim(),
        name: cfg.name || ''
      };
      if (cfg2.name){
        var pl = loadPresets();
        pl.forEach(function(p, i){ if (p.name === cfg2.name){ pl[i] = { name: cfg2.name, apiurl: cfg2.apiurl, key: cfg2.key, model: cfg2.model }; } });
        savePresetList(pl);
      }
      if (saveApiCfg(cfg2)) showToast('设置已保存' + (cfg2.name ? '（方案：' + cfg2.name + '）' : '')); else showErr('保存失败：浏览器存储不可用');
      render();
    });
    var test = el('button','testBtn','测试连接');
    var gen0 = api('generateRaw');
    test.addEventListener('click', async function(){
      var c = loadApiCfg();
      if (!gen0){ showErr('缺少生成接口，无法测试'); return; }
      if (!c.key || !c.apiurl || !c.model){ showErr('地址、密钥、模型都需要填写才能测试'); return; }
      test.textContent = '测试中…';
      try {
        var reply = await gen0({
          user_input: '只回复两个字：正常',
          custom_api: { apiurl: c.apiurl, key: c.key, model: c.model, source: 'openai' }
        });
        showToast('连接正常：' + String(reply == null ? '' : reply).trim().slice(0, 24));
      } catch (e) {
        showErr('连接失败：' + (e && e.message ? e.message : e));
      }
      test.textContent = '测试连接';
    });
    btns.appendChild(save);
    btns.appendChild(test);
    pad.appendChild(btns);
    pSel.addEventListener('change', function(){
      var nm = pSel.value;
      if (nm === '__custom') return;
      var hit = null;
      presetList.forEach(function(p){ if (p.name === nm) hit = p; });
      if (!hit) return;
      saveApiCfg({ name: hit.name, apiurl: hit.apiurl, key: hit.key, model: hit.model });
      showToast('已切换方案：' + hit.name);
      render();
    });
    var mig = el('div','card');
    mig.appendChild(el('h4','','数据迁移'));
    mig.appendChild(el('p','','导出当前存档（记忆、关系、剧情进度、传讯与备忘），或从备份文件导入到当前聊天。导入前会自动下载当前数据的备份，误导入可从备份恢复。'));
    var migBtns = el('div','formBtns');
    var expBtn = el('button','saveBtn','导出存档');
    expBtn.addEventListener('click', function(){
      downloadJson('随身终端存档-' + dateStr() + '.json', buildExport());
      showToast('存档已导出下载');
    });
    var impBtn = el('button','testBtn','导入备份');
    impBtn.addEventListener('click', function(){ fileInput.click(); });
    migBtns.appendChild(expBtn);
    migBtns.appendChild(impBtn);
    mig.appendChild(migBtns);
    pad.appendChild(mig);
        var fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = '.json,application/json';
    fileInput.style.display = 'none';
    fileInput.addEventListener('change', function(){ onImportFile(fileInput.files && fileInput.files[0]); fileInput.value = ''; });
    pad.appendChild(fileInput);
        pad.appendChild(el('div','formNote','传讯默认使用上面的独立接口，不消耗酒馆当前连接；密钥留空时自动改走酒馆当前连接。密钥只保存在本机浏览器，不写入聊天存档；分享卡片前请先在脚本里清空默认密钥。'));
    viewEl.appendChild(pad);
  }

  // ── 世界书清单读取（心愿清单/课题清单正文，来自禁用仓库条目）──
  async function wbTextOf(entryName){
    var diag = { entry: entryName };
    window.__wbdiag = diag;
    if (state.wbCache[entryName] !== undefined){ diag.hit = 'cache'; return state.wbCache[entryName]; }
    var text = '';
    try {
      var getNames = api('getCharWorldbookNames'), getWb = api('getWorldbook');
      diag.apiN = typeof getNames; diag.apiW = typeof getWb;
      if (getNames && getWb){
        var binding = await getNames('current');
        diag.binding = binding ? (binding.primary + '|' + (binding.additional || []).length) : 'null';
        var wbName = binding && (binding.primary || (binding.additional && binding.additional[0]));
        diag.wbName = String(wbName);
        if (wbName){
          var entries = await getWb(wbName);
          diag.entryCount = entries ? entries.length : -1;
          for (var i = 0; i < entries.length; i++){
            if (entries[i] && entries[i].name === entryName){
              text = String(entries[i].content || '');
              break;
            }
          }
          diag.found = text.length > 0;
        }
      }
    } catch (e) {
      text = '';
      diag.err = String(e && e.message || e);
      if (window.console && console.warn) console.warn('[随身终端] 清单读取失败:', entryName, e);
    }
    if (text) state.wbCache[entryName] = text;
    diag.textLen = text.length;
    return text;
  }
  function parseListText(text){
    // 返回 { title, items: ['1. xxx', ...] }；只保留序号行
    if (!text) return null;
    var lines = text.split('\\n');
    var out = { title: '', items: [] };
    for (var i = 0; i < lines.length; i++){
      var line = lines[i].trim();
      if (!out.title && line.indexOf('# ') === 0){ out.title = line.slice(2).trim(); continue; }
      if (/^\\d+\\./.test(line)) out.items.push(line);
    }
    return out.items.length ? out : null;
  }
  function chapterNow(){
    return Number((stat()['剧情'] || {})['当前章节']) || 1;
  }
  var DIARY_LISTS = [
    { name: '鲁迪日记_洛琪希30件事', need: 4 },
    { name: '鲁迪日记_希露菲30件事', need: 7 },
    { name: '鲁迪日记_艾莉丝30件事', need: 14 },
    { name: '鲁迪日记_共同家庭10件事', need: 68 }
  ];
  var TASK_LISTS = [
    { name: '鲁迪课题_洛琪希50个课题', need: 69 },
    { name: '鲁迪课题_希露菲30个课题', need: 69 }
  ];
  function renderChecklists(pad, lists, ch){
    lists.forEach(function(cfg, idx){
      var box = el('div','checklist');
      box.appendChild(el('h4','', (idx + 1) + '. ' + cfg.name.replace(/^鲁迪(日记|课题)_/, '') + (ch >= cfg.need ? '' : '（第' + cfg.need + '章后写下）')));
      if (ch < cfg.need){
        box.lastChild.style.color = 'var(--dim)';
        pad.appendChild(box);
        return;
      }
      wbTextOf(cfg.name).then(function(text){
        var parsed = parseListText(text);
        if (!parsed){
          box.appendChild(el('div','empty','清单内容读取中…'));
          return;
        }
        box.textContent = '';
        box.appendChild(el('h4','', parsed.title || cfg.name));
        parsed.items.slice(0, 60).forEach(function(it){
          var row = el('div','citem');
          var m = /^(\\d+\\.)(.*)$/.exec(it);
          row.appendChild(el('span','no', m ? m[1] + '.' : '·'));
          row.appendChild(el('span','', m ? m[2].trim() : it));
          box.appendChild(row);
        });
      });
      pad.appendChild(box);
    });
  }

  // ── 事件绑定 ──
  function boot(){
    viewEl = document.getElementById('view');
    titleEl = document.getElementById('titleBar');
    backBtn = document.getElementById('backBtn');
    statusStrip = document.getElementById('statusStrip');
    inputRow = document.getElementById('inputRow');
    chatInput = document.getElementById('chatInput');
    sendBtn = document.getElementById('sendBtn');

    backBtn.addEventListener('click', function(){
      if (state.view === 'chat' || state.view === 'person' || state.view === 'gchat' || state.view === 'groupNew'){ state.view = 'contacts'; render(); }
      else if (state.view !== 'home'){ state.view = 'home'; render(); }
    });
    document.getElementById('refreshBtn').addEventListener('click', load);
    document.getElementById('gearBtn').addEventListener('click', function(){ state.view = 'settings'; render(); });
    document.getElementById('closeBtn').addEventListener('click', function(){
      try { if (window.parent && window.parent.__MUSHOKU_PHONE_CLOSE__) window.parent.__MUSHOKU_PHONE_CLOSE__(); } catch(e){}
    });
    function submitCurrent(){
      if (state.view === 'gchat') sendGroup(); else send();
    }
    sendBtn.addEventListener('click', submitCurrent);
    chatInput.maxLength = 1600;
    chatInput.addEventListener('keydown', function(e){
      if (e.key === 'Enter' && !e.shiftKey){ e.preventDefault(); submitCurrent(); }
    });

    var onMsg = ev('MESSAGE_RECEIVED'), onChat = ev('CHAT_CHANGED');
    var eo = api('eventOn');
    if (eo && onMsg) eo(onMsg, function(){ load(); });
    if (eo && onChat) eo(onChat, function(){ state.personaCache = {}; state.wbCache = {}; load(); });
    var mv = window['mvu_events'];
    var onMvuEnd = mv && mv['VARIABLE_UPDATE_ENDED'];
    if (eo && onMvuEnd) eo(onMvuEnd, function(){ load(); });

    load();
  }

  function bootCatched(){ try { boot(); } catch (e) { if (window.console && console.error) console.error('[随身终端] 初始化失败:', e); } }
  if (document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', bootCatched);
  } else {
    bootCatched();
  }
})();
<\/script>
</body>
</html>`;

  // ─────────────────────────── 悬浮球与挂载 ───────────────────────────
  const BALL_SVG = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="26" height="26"><rect x="7" y="2.5" width="10" height="19" rx="2.5" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M10.5 18.5h3" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>';

  function injectStyle(){
    if (hostDocument.getElementById(STYLE_ID)) return;
    const style = hostDocument.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      #${BTN_ID}{
        position:fixed; z-index:99998; width:52px; height:52px; border-radius:50%;
        background:linear-gradient(150deg,#2c4438,#1a2a22); color:#a9d6b8;
        border:1px solid #3f5c4c; box-shadow:0 4px 14px rgba(0,0,0,.45);
        display:flex; align-items:center; justify-content:center; cursor:pointer;
        touch-action:none; transition:box-shadow .15s;
      }
      #${BTN_ID}:hover{ box-shadow:0 6px 18px rgba(0,0,0,.6); }
      #${BTN_ID}.dragging{ opacity:.85; transition:none; }
      #${IFRAME_ID}{
        position:fixed; z-index:99999; left:50%; top:50%; transform:translate(-50%,-50%);
        width:min(380px,94vw); height:min(680px,92vh);
        border:1px solid #3f5c4c; border-radius:22px; background:#12171a;
        box-shadow:0 18px 60px rgba(0,0,0,.6);
      }
    `;
    hostDocument.head.appendChild(style);
  }

  function placeInViewport(node, x, y){
    node.style.left = Math.round(x) + 'px';
    node.style.top = Math.round(y) + 'px';
  }

  function measuredViewport(){
    try {
      return { width: hostWindow.innerWidth || 0, height: hostWindow.innerHeight || 0 };
    } catch (e) {
      return { width: 0, height: 0 };
    }
  }

  const instance = { disposed: false, btn: null, iframe: null, onKey: null };

  function removeIframe(){
    if (instance.iframe && instance.iframe.parentNode) instance.iframe.parentNode.removeChild(instance.iframe);
    instance.iframe = null;
  }

  function closePhone(){
    removeIframe();
    try { delete hostWindow.__MUSHOKU_PHONE_CLOSE__; } catch (e) { hostWindow.__MUSHOKU_PHONE_CLOSE__ = undefined; }
  }

  function openPhone(){
    if (instance.iframe) return;
    const frame = hostDocument.createElement('iframe');
    frame.id = IFRAME_ID;
    frame.srcdoc = PHONE_HTML;
    frame.setAttribute('title', '随身终端');
    hostDocument.body.appendChild(frame);
    instance.iframe = frame;
    try { hostWindow.__MUSHOKU_PHONE_CLOSE__ = closePhone; } catch (e) { /* 忽略 */ }
  }

  function keepBallInView(){
    const node = instance.btn;
    if (!node) return;
    const { width, height } = measuredViewport();
    if (width <= 0 || height <= 0) return;
    const w = node.offsetWidth || 52;
    const h = node.offsetHeight || 52;
    const x = Math.min(Math.max(0, parseFloat(node.style.left) || 0), Math.max(0, width - w));
    const y = Math.min(Math.max(0, parseFloat(node.style.top) || 0), Math.max(0, height - h));
    placeInViewport(node, x, y);
  }

  function mountBall(){
    injectStyle();
    const btn = hostDocument.createElement('div');
    btn.id = BTN_ID;
    btn.title = '随身终端';
    btn.innerHTML = BALL_SVG;
    hostDocument.body.appendChild(btn);
    instance.btn = btn;

    // 位置：优先恢复上次保存，否则停靠右下角
    const { width, height } = measuredViewport();
    let pos = { x: Math.max(0, width - 76), y: Math.max(0, height - 90) };
    try {
      const saved = JSON.parse(hostWindow.localStorage.getItem(POS_KEY) || 'null');
      if (saved && isFinite(saved.x) && isFinite(saved.y)) pos = saved;
    } catch (e) { /* 忽略 */ }
    placeInViewport(btn, pos.x, pos.y);

    let drag = null;
    btn.addEventListener('pointerdown', (e) => {
      drag = { startX: e.clientX, startY: e.clientY, baseX: parseFloat(btn.style.left) || 0, baseY: parseFloat(btn.style.top) || 0, moved: false };
      try { btn.setPointerCapture(e.pointerId); } catch (err) { /* 忽略 */ }
      e.preventDefault();
    });
    btn.addEventListener('pointermove', (e) => {
      if (!drag) return;
      const dx = e.clientX - drag.startX;
      const dy = e.clientY - drag.startY;
      if (!drag.moved && Math.hypot(dx, dy) > 6) drag.moved = true;
      if (drag.moved){
        const { width: vw, height: vh } = measuredViewport();
        const w = btn.offsetWidth || 52, h = btn.offsetHeight || 52;
        pos = {
          x: Math.min(Math.max(0, drag.baseX + dx), Math.max(0, vw - w)),
          y: Math.min(Math.max(0, drag.baseY + dy), Math.max(0, vh - h)),
        };
        placeInViewport(btn, pos.x, pos.y);
      }
    });
    btn.addEventListener('pointerup', () => {
      if (!drag) return;
      const wasDrag = drag.moved;
      drag = null;
      if (wasDrag){
        // 吸附到最近的左右边缘
        const { width: vw } = measuredViewport();
        const w = btn.offsetWidth || 52;
        pos = { x: pos.x + w / 2 < vw / 2 ? 12 : Math.max(12, vw - w - 12), y: pos.y };
        placeInViewport(btn, pos.x, pos.y);
        try { hostWindow.localStorage.setItem(POS_KEY, JSON.stringify(pos)); } catch (e) { /* 忽略 */ }
      } else {
        if (instance.iframe) closePhone(); else openPhone();
      }
    });
    btn.addEventListener('pointercancel', () => { drag = null; });

    hostWindow.addEventListener('resize', keepBallInView);
  }

  function dispose(){
    if (instance.disposed) return;
    instance.disposed = true;
    closePhone();
    if (instance.btn && instance.btn.parentNode) instance.btn.parentNode.removeChild(instance.btn);
    instance.btn = null;
    try { hostWindow.removeEventListener('resize', keepBallInView); } catch (e) { /* 忽略 */ }
    try { hostDocument.getElementById(STYLE_ID)?.remove(); } catch (e) { /* 忽略 */ }
    try { delete window[INSTANCE_KEY]; } catch (e) { window[INSTANCE_KEY] = undefined; }
  }

  // 幂等挂载：重复执行时先清理旧实例
  const prev = window[INSTANCE_KEY];
  if (prev && typeof prev.dispose === 'function'){
    try { prev.dispose(); } catch (e) { console.warn('[无职·随身终端] 清理旧实例失败:', e); }
  }
  window[INSTANCE_KEY] = { dispose };

  const start = () => {
    if (instance.disposed) return;
    if (!hostDocument || !hostDocument.body){
      setTimeout(start, 400);
      return;
    }
    mountBall();
  };
  start();

  // 沙箱卸载时清理宿主页面上的 UI
  window.addEventListener('pagehide', () => { dispose(); }, { once: true });
})();
