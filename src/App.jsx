import { useState, useEffect, useCallback } from "react";

const T = {
  bg: "#0D1117", sidebar: "#161B22", card: "#1C2128", border: "#30363D",
  text: "#E6EDF3", muted: "#848D97", amber: "#F0A500", amberDim: "#3D2A00",
  amberLight: "#FFC947", green: "#3FB950", red: "#F85149", blue: "#58A6FF",
  purple: "#BC8CFF", teal: "#39D353",
  seg: { "Oil & Gas": "#F0A500", "Construction": "#58A6FF", "Agriculture": "#3FB950" },
  stage: {
    "Lead":        { color: "#848D97", bg: "#21262D" },
    "Qualified":   { color: "#58A6FF", bg: "#0D2847" },
    "Proposal":    { color: "#BC8CFF", bg: "#2D1C4E" },
    "Negotiation": { color: "#F0A500", bg: "#3D2A00" },
    "Won":         { color: "#3FB950", bg: "#0D2A15" },
    "Lost":        { color: "#F85149", bg: "#3D0D0D" },
  },
  act: { "Call": "#F0A500", "Meeting": "#58A6FF", "Email": "#BC8CFF", "Task": "#39D353", "LinkedIn": "#0A66C2" },
};

const SEGMENTS  = ["Oil & Gas", "Construction", "Agriculture"];
const STAGES    = ["Lead","Qualified","Proposal","Negotiation","Won","Lost"];
const ACT_TYPES = ["Call","Meeting","Email","Task","LinkedIn"];
const MKT_TYPES = ["Email Campaign","LinkedIn Post","Event","Cold Call","Referral","Demo"];
const CURRENCIES= ["USD","COP","EUR"];

const uid   = () => Date.now().toString(36) + Math.random().toString(36).slice(2,6);
const fmt   = (d) => d ? new Date(d).toLocaleDateString("es-CO",{day:"2-digit",month:"short",year:"numeric"}) : "—";
const today = () => new Date().toISOString().split("T")[0];

// Storage — localStorage para versión web
function load(key) {
  try { const r = localStorage.getItem(key); return r ? JSON.parse(r) : null; } catch { return null; }
}
function save(key, val) {
  try { localStorage.setItem(key, JSON.stringify(val)); } catch {}
}

const S = {
  col:   { display:"flex", flexDirection:"column", gap:12 },
  row:   { display:"flex", gap:12, alignItems:"flex-start" },
  field: { display:"flex", flexDirection:"column", gap:4, flex:1 },
  label: { fontSize:10, fontWeight:700, letterSpacing:"0.1em", color:"#848D97", textTransform:"uppercase" },
  input: { background:"#0D1117", border:"1px solid #30363D", borderRadius:6, padding:"8px 10px", color:"#E6EDF3", fontSize:13, outline:"none", fontFamily:"inherit", width:"100%", boxSizing:"border-box" },
  btn:   { background:"#F0A500", color:"#000", border:"none", borderRadius:6, padding:"8px 18px", fontSize:13, fontWeight:700, cursor:"pointer", fontFamily:"inherit" },
  ghost: { background:"transparent", color:"#848D97", border:"1px solid #30363D", borderRadius:6, padding:"8px 14px", fontSize:12, cursor:"pointer", fontFamily:"inherit" },
  danger:{ background:"#3D0D0D", color:"#F85149", border:"1px solid #F8514922", borderRadius:6, padding:"5px 12px", fontSize:11, cursor:"pointer", fontFamily:"inherit" },
  card:  { background:"#1C2128", border:"1px solid #30363D", borderRadius:10, padding:16 },
  badge: (c,b) => ({ display:"inline-block", background:b||c+"22", color:c, borderRadius:20, padding:"2px 9px", fontSize:10, fontWeight:700, letterSpacing:"0.04em" }),
};

function Inp({ label, ...p }) {
  return <div style={S.field}>{label&&<span style={S.label}>{label}</span>}<input style={S.input} {...p}/></div>;
}
function Sel({ label, opts, ...p }) {
  return <div style={S.field}>{label&&<span style={S.label}>{label}</span>}
    <select style={S.input} {...p}>{opts.map(o=><option key={o} value={o}>{o}</option>)}</select></div>;
}
function Txt({ label, ...p }) {
  return <div style={S.field}>{label&&<span style={S.label}>{label}</span>}
    <textarea style={{...S.input, resize:"vertical", minHeight:65}} {...p}/></div>;
}
function Modal({ title, onClose, children }) {
  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.75)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:9999,padding:16}}>
      <div style={{background:"#161B22",border:"1px solid #30363D",borderRadius:12,width:"100%",maxWidth:520,maxHeight:"88vh",overflowY:"auto"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"15px 20px",borderBottom:"1px solid #30363D"}}>
          <span style={{fontWeight:700,fontSize:14,color:"#E6EDF3"}}>{title}</span>
          <button onClick={onClose} style={{background:"none",border:"none",color:"#848D97",fontSize:22,cursor:"pointer",lineHeight:1}}>×</button>
        </div>
        <div style={{padding:20}}>{children}</div>
      </div>
    </div>
  );
}
function Empty({ icon, msg }) {
  return <div style={{textAlign:"center",padding:"40px 20px",color:"#848D97"}}>
    <div style={{fontSize:32,marginBottom:8}}>{icon}</div>
    <div style={{fontSize:13}}>{msg}</div>
  </div>;
}
function Stat({ label, value, color, sub }) {
  return <div style={{...S.card,flex:1,minWidth:100}}>
    <div style={{fontSize:26,fontWeight:800,color:color||"#F0A500",letterSpacing:"-1px"}}>{value}</div>
    <div style={{fontSize:11,fontWeight:600,color:"#E6EDF3",marginTop:2}}>{label}</div>
    {sub&&<div style={{fontSize:10,color:"#848D97",marginTop:1}}>{sub}</div>}
  </div>;
}

function ContactModal({ init={}, onSave, onClose }) {
  const [f,setF] = useState({name:"",company:"",role:"",segment:"Oil & Gas",phone:"",email:"",linkedin:"",notes:"",...init});
  const set = k => e => setF(p=>({...p,[k]:e.target.value}));
  return <Modal title={init.id?"Edit Contact":"New Contact"} onClose={onClose}>
    <div style={S.col}>
      <div style={S.row}><Inp label="Name *" value={f.name} onChange={set("name")} placeholder="John Smith"/><Inp label="Company *" value={f.company} onChange={set("company")} placeholder="Acme S.A."/></div>
      <div style={S.row}><Inp label="Role" value={f.role} onChange={set("role")} placeholder="Project Manager"/><Sel label="Segment" value={f.segment} onChange={set("segment")} opts={SEGMENTS}/></div>
      <div style={S.row}><Inp label="Phone" value={f.phone} onChange={set("phone")} placeholder="+57 300 0000000"/><Inp label="Email" value={f.email} onChange={set("email")} placeholder="john@co.com"/></div>
      <Inp label="LinkedIn" value={f.linkedin} onChange={set("linkedin")} placeholder="linkedin.com/in/john"/>
      <Txt label="Notes" value={f.notes} onChange={set("notes")} placeholder="Context, relationship, key info..."/>
      <div style={{display:"flex",gap:8,justifyContent:"flex-end"}}>
        <button style={S.ghost} onClick={onClose}>Cancel</button>
        <button style={S.btn} onClick={()=>{if(!f.name||!f.company)return;onSave({...f,id:f.id||uid(),createdAt:f.createdAt||today()});}}>Save</button>
      </div>
    </div>
  </Modal>;
}

function OppModal({ init={}, contacts=[], onSave, onClose }) {
  const [f,setF] = useState({title:"",company:"",contactId:"",segment:"Oil & Gas",stage:"Lead",value:"",currency:"USD",dueDate:"",notes:"",...init});
  const set = k => e => setF(p=>({...p,[k]:e.target.value}));
  return <Modal title={init.id?"Edit Opportunity":"New Opportunity"} onClose={onClose}>
    <div style={S.col}>
      <Inp label="Title *" value={f.title} onChange={set("title")} placeholder="Pilot Project – Ecopetrol Block X"/>
      <div style={S.row}><Inp label="Company" value={f.company} onChange={set("company")} placeholder="Company"/><Sel label="Segment" value={f.segment} onChange={set("segment")} opts={SEGMENTS}/></div>
      <div style={S.row}>
        <Sel label="Stage" value={f.stage} onChange={set("stage")} opts={STAGES}/>
        <div style={S.field}><span style={S.label}>Contact</span>
          <select style={S.input} value={f.contactId} onChange={set("contactId")}>
            <option value="">— None —</option>
            {contacts.map(c=><option key={c.id} value={c.id}>{c.name} · {c.company}</option>)}
          </select>
        </div>
      </div>
      <div style={S.row}><Inp label="Value" value={f.value} onChange={set("value")} type="number" placeholder="50000"/><Sel label="Currency" value={f.currency} onChange={set("currency")} opts={CURRENCIES}/><Inp label="Close Date" value={f.dueDate} onChange={set("dueDate")} type="date"/></div>
      <Txt label="Notes" value={f.notes} onChange={set("notes")} placeholder="Requirements, context, status..."/>
      <div style={{display:"flex",gap:8,justifyContent:"flex-end"}}>
        <button style={S.ghost} onClick={onClose}>Cancel</button>
        <button style={S.btn} onClick={()=>{if(!f.title)return;onSave({...f,id:f.id||uid(),createdAt:f.createdAt||today()});}}>Save</button>
      </div>
    </div>
  </Modal>;
}

function ActModal({ init={}, contacts=[], opps=[], onSave, onClose }) {
  const [f,setF] = useState({type:"Call",title:"",contactId:"",oppId:"",date:today(),status:"Pending",notes:"",...init});
  const set = k => e => setF(p=>({...p,[k]:e.target.value}));
  return <Modal title={init.id?"Edit Activity":"Log Activity"} onClose={onClose}>
    <div style={S.col}>
      <div style={S.row}><Sel label="Type" value={f.type} onChange={set("type")} opts={ACT_TYPES}/><Inp label="Title *" value={f.title} onChange={set("title")} placeholder="Call to discuss proposal"/></div>
      <div style={S.row}>
        <div style={S.field}><span style={S.label}>Contact</span>
          <select style={S.input} value={f.contactId} onChange={set("contactId")}>
            <option value="">— None —</option>
            {contacts.map(c=><option key={c.id} value={c.id}>{c.name} · {c.company}</option>)}
          </select>
        </div>
        <div style={S.field}><span style={S.label}>Opportunity</span>
          <select style={S.input} value={f.oppId} onChange={set("oppId")}>
            <option value="">— None —</option>
            {opps.map(o=><option key={o.id} value={o.id}>{o.title}</option>)}
          </select>
        </div>
      </div>
      <div style={S.row}><Inp label="Date" value={f.date} onChange={set("date")} type="date"/><Sel label="Status" value={f.status} onChange={set("status")} opts={["Pending","Done","Cancelled"]}/></div>
      <Txt label="Notes / Outcome" value={f.notes} onChange={set("notes")} placeholder="What happened? Next steps?"/>
      <div style={{display:"flex",gap:8,justifyContent:"flex-end"}}>
        <button style={S.ghost} onClick={onClose}>Cancel</button>
        <button style={S.btn} onClick={()=>{if(!f.title)return;onSave({...f,id:f.id||uid(),createdAt:f.createdAt||today()});}}>Save</button>
      </div>
    </div>
  </Modal>;
}

function MktModal({ init={}, onSave, onClose }) {
  const [f,setF] = useState({type:"LinkedIn Post",title:"",segment:"Oil & Gas",date:today(),status:"Planned",reach:"",notes:"",...init});
  const set = k => e => setF(p=>({...p,[k]:e.target.value}));
  return <Modal title={init.id?"Edit Campaign":"New Marketing Activity"} onClose={onClose}>
    <div style={S.col}>
      <div style={S.row}><Sel label="Type" value={f.type} onChange={set("type")} opts={MKT_TYPES}/><Sel label="Segment" value={f.segment} onChange={set("segment")} opts={["All",...SEGMENTS]}/></div>
      <Inp label="Title *" value={f.title} onChange={set("title")} placeholder="LinkedIn post – IXE for O&G controls"/>
      <div style={S.row}><Inp label="Date" value={f.date} onChange={set("date")} type="date"/><Sel label="Status" value={f.status} onChange={set("status")} opts={["Planned","In Progress","Done","Cancelled"]}/><Inp label="Reached" value={f.reach} onChange={set("reach")} type="number" placeholder="0"/></div>
      <Txt label="Notes / Results" value={f.notes} onChange={set("notes")} placeholder="Objective, audience, outcome..."/>
      <div style={{display:"flex",gap:8,justifyContent:"flex-end"}}>
        <button style={S.ghost} onClick={onClose}>Cancel</button>
        <button style={S.btn} onClick={()=>{if(!f.title)return;onSave({...f,id:f.id||uid(),createdAt:f.createdAt||today()});}}>Save</button>
      </div>
    </div>
  </Modal>;
}

function Dashboard({ contacts, opps, acts, mkt }) {
  const active  = opps.filter(o=>!["Won","Lost"].includes(o.stage));
  const pipeVal = active.reduce((a,o)=>a+(parseFloat(o.value)||0),0);
  const pending = [...acts].filter(a=>a.status==="Pending").sort((a,b)=>a.date>b.date?1:-1).slice(0,6);
  return <div style={S.col}>
    <div style={{display:"flex",gap:10,flexWrap:"wrap"}}>
      <Stat label="Contacts" value={contacts.length} color={T.blue}/>
      <Stat label="Deals" value={opps.length} color={T.amber} sub={`${active.length} active`}/>
      <Stat label="Pipeline" value={`$${(pipeVal/1000).toFixed(0)}k`} color={T.amberLight}/>
      <Stat label="Won" value={opps.filter(o=>o.stage==="Won").length} color={T.green}/>
      <Stat label="Activities" value={acts.length} color={T.purple} sub={`${pending.length} pending`}/>
      <Stat label="Campaigns" value={mkt.length} color={T.teal}/>
    </div>
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
      <div style={S.card}>
        <div style={{fontSize:11,fontWeight:700,color:T.amber,letterSpacing:"0.1em",marginBottom:10}}>⏰ PENDING FOLLOW-UPS</div>
        {pending.length===0?<Empty icon="✅" msg="All clear!"/>:pending.map(a=>{
          const overdue=a.date<today();
          return <div key={a.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"7px 0",borderBottom:"1px solid #30363D33"}}>
            <div style={{display:"flex",alignItems:"center",gap:6}}>
              <span style={S.badge(T.act[a.type]||T.muted)}>{a.type}</span>
              <span style={{fontSize:12,color:"#E6EDF3"}}>{a.title}</span>
            </div>
            <span style={{fontSize:10,color:overdue?T.red:T.muted,whiteSpace:"nowrap",marginLeft:6}}>{fmt(a.date)}</span>
          </div>;
        })}
      </div>
      <div style={S.card}>
        <div style={{fontSize:11,fontWeight:700,color:T.amber,letterSpacing:"0.1em",marginBottom:10}}>📊 PIPELINE BY STAGE</div>
        {STAGES.filter(st=>!["Won","Lost"].includes(st)).map(st=>{
          const n=opps.filter(o=>o.stage===st).length;
          const pct=opps.length?Math.round(n/opps.length*100):0;
          return <div key={st} style={{marginBottom:8}}>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:3}}>
              <span style={{fontSize:11,color:T.stage[st].color}}>{st}</span>
              <span style={{fontSize:11,color:T.muted}}>{n}</span>
            </div>
            <div style={{height:4,background:"#30363D",borderRadius:99}}>
              <div style={{height:4,borderRadius:99,background:T.stage[st].color,width:`${pct}%`}}/>
            </div>
          </div>;
        })}
        <div style={{display:"flex",gap:6,marginTop:12}}>
          {SEGMENTS.map(seg=><div key={seg} style={{flex:1,textAlign:"center",background:"#0D1117",borderRadius:8,padding:"8px 4px"}}>
            <div style={{fontSize:18,fontWeight:800,color:T.seg[seg]}}>{opps.filter(o=>o.segment===seg).length}</div>
            <div style={{fontSize:9,color:T.muted}}>{seg.split(" ")[0]}</div>
          </div>)}
        </div>
      </div>
    </div>
  </div>;
}

function Contacts({ contacts, onAdd, onEdit, onDel }) {
  const [seg,setSeg]=useState("All");
  const [q,setQ]=useState("");
  const list=contacts.filter(c=>seg==="All"||c.segment===seg).filter(c=>!q||(c.name+c.company+c.role).toLowerCase().includes(q.toLowerCase()));
  return <div style={S.col}>
    <div style={{display:"flex",gap:8,flexWrap:"wrap",alignItems:"center"}}>
      <input style={{...S.input,maxWidth:220}} placeholder="🔍 Search..." value={q} onChange={e=>setQ(e.target.value)}/>
      <div style={{display:"flex",gap:4}}>
        {["All",...SEGMENTS].map(s=><button key={s} onClick={()=>setSeg(s)} style={{...S.ghost,borderColor:seg===s?(T.seg[s]||T.amber):T.border,color:seg===s?(T.seg[s]||T.amber):T.muted,padding:"6px 12px"}}>{s}</button>)}
      </div>
      <button style={{...S.btn,marginLeft:"auto"}} onClick={onAdd}>+ Contact</button>
    </div>
    {list.length===0?<Empty icon="👤" msg="No contacts yet!"/>:
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(260px,1fr))",gap:10}}>
        {list.map(c=><div key={c.id} style={{...S.card,borderTop:`3px solid ${T.seg[c.segment]||T.muted}`}}>
          <div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}>
            <div style={{width:34,height:34,borderRadius:"50%",background:T.seg[c.segment]+"33",border:`2px solid ${T.seg[c.segment]}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:15,fontWeight:800,color:T.seg[c.segment]}}>{c.name[0]?.toUpperCase()}</div>
            <span style={S.badge(T.seg[c.segment]||T.muted)}>{c.segment.split(" ")[0]}</span>
          </div>
          <div style={{fontSize:14,fontWeight:700,color:T.text}}>{c.name}</div>
          <div style={{fontSize:11,color:T.amber,fontWeight:600}}>{c.role}</div>
          <div style={{fontSize:11,color:T.muted,marginBottom:6}}>{c.company}</div>
          {c.email&&<div style={{fontSize:10,color:T.blue}}>✉ {c.email}</div>}
          {c.phone&&<div style={{fontSize:10,color:T.muted}}>📞 {c.phone}</div>}
          {c.notes&&<div style={{fontSize:10,color:T.muted,marginTop:6,fontStyle:"italic",borderTop:"1px solid #30363D",paddingTop:6}}>{c.notes.slice(0,75)}{c.notes.length>75?"...":""}</div>}
          <div style={{display:"flex",gap:6,marginTop:10}}>
            <button style={{...S.ghost,fontSize:11,padding:"4px 10px",flex:1}} onClick={()=>onEdit(c)}>Edit</button>
            <button style={{...S.danger,flex:1}} onClick={()=>onDel(c.id)}>Delete</button>
          </div>
        </div>)}
      </div>}
  </div>;
}

function Opps({ opps, contacts, onAdd, onEdit, onDel }) {
  const [seg,setSeg]=useState("All");
  const [view,setView]=useState("kanban");
  const list=opps.filter(o=>seg==="All"||o.segment===seg);
  const ct=id=>contacts.find(c=>c.id===id);
  return <div style={S.col}>
    <div style={{display:"flex",gap:8,flexWrap:"wrap",alignItems:"center"}}>
      <div style={{display:"flex",gap:4}}>
        {["All",...SEGMENTS].map(s=><button key={s} onClick={()=>setSeg(s)} style={{...S.ghost,borderColor:seg===s?(T.seg[s]||T.amber):T.border,color:seg===s?(T.seg[s]||T.amber):T.muted,padding:"6px 11px"}}>{s}</button>)}
      </div>
      <div style={{display:"flex",gap:4,marginLeft:"auto"}}>
        <button style={{...S.ghost,borderColor:view==="kanban"?T.amber:T.border,color:view==="kanban"?T.amber:T.muted,padding:"6px 11px"}} onClick={()=>setView("kanban")}>⬛ Kanban</button>
        <button style={{...S.ghost,borderColor:view==="list"?T.amber:T.border,color:view==="list"?T.amber:T.muted,padding:"6px 11px"}} onClick={()=>setView("list")}>☰ List</button>
      </div>
      <button style={S.btn} onClick={onAdd}>+ Deal</button>
    </div>
    {view==="kanban"?
      <div style={{display:"flex",gap:10,overflowX:"auto",paddingBottom:8}}>
        {STAGES.map(stage=>{
          const cols=list.filter(o=>o.stage===stage);
          return <div key={stage} style={{minWidth:190,flex:"0 0 190px"}}>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}>
              <span style={{fontSize:10,fontWeight:700,color:T.stage[stage].color,letterSpacing:"0.06em"}}>{stage.toUpperCase()}</span>
              <span style={S.badge(T.stage[stage].color,T.stage[stage].bg)}>{cols.length}</span>
            </div>
            <div style={S.col}>
              {cols.map(o=>{
                const c=ct(o.contactId);
                return <div key={o.id} style={{background:T.card,border:"1px solid #30363D",borderRadius:8,padding:12,borderLeft:`3px solid ${T.seg[o.segment]||T.muted}`}}>
                  <div style={{fontSize:12,fontWeight:700,color:T.text,marginBottom:3}}>{o.title}</div>
                  {o.company&&<div style={{fontSize:10,color:T.amber}}>{o.company}</div>}
                  {c&&<div style={{fontSize:10,color:T.muted}}>👤 {c.name}</div>}
                  {o.value&&<div style={{fontSize:13,fontWeight:800,color:T.green,marginTop:4}}>{o.currency} {parseFloat(o.value).toLocaleString()}</div>}
                  {o.dueDate&&<div style={{fontSize:9,color:o.dueDate<today()?T.red:T.muted,marginTop:2}}>📅 {fmt(o.dueDate)}</div>}
                  <div style={{display:"flex",gap:4,marginTop:8}}>
                    <button style={{...S.ghost,fontSize:10,padding:"3px 8px",flex:1}} onClick={()=>onEdit(o)}>Edit</button>
                    <button style={{...S.danger,padding:"3px 8px"}} onClick={()=>onDel(o.id)}>✕</button>
                  </div>
                </div>;
              })}
              {cols.length===0&&<div style={{padding:"14px 8px",textAlign:"center",color:"#30363D",fontSize:11,border:"1px dashed #30363D",borderRadius:8}}>Empty</div>}
            </div>
          </div>;
        })}
      </div>:
      <div style={S.col}>
        {list.length===0?<Empty icon="💼" msg="No deals yet!"/>:list.map(o=>{
          const c=ct(o.contactId); const st=T.stage[o.stage];
          return <div key={o.id} style={{...S.card,display:"flex",alignItems:"center",gap:12}}>
            <div style={{width:4,height:44,borderRadius:99,background:T.seg[o.segment]||T.muted,flexShrink:0}}/>
            <div style={{flex:1,minWidth:0}}>
              <div style={{fontSize:13,fontWeight:700,color:T.text}}>{o.title}</div>
              <div style={{fontSize:11,color:T.muted}}>{o.company}{c?` · 👤 ${c.name}`:""}</div>
            </div>
            <span style={S.badge(st.color,st.bg)}>{o.stage}</span>
            {o.value&&<span style={{fontSize:13,fontWeight:700,color:T.green,whiteSpace:"nowrap"}}>{o.currency} {parseFloat(o.value).toLocaleString()}</span>}
            {o.dueDate&&<span style={{fontSize:10,color:o.dueDate<today()?T.red:T.muted,whiteSpace:"nowrap"}}>{fmt(o.dueDate)}</span>}
            <div style={{display:"flex",gap:4}}>
              <button style={{...S.ghost,fontSize:11,padding:"4px 10px"}} onClick={()=>onEdit(o)}>Edit</button>
              <button style={S.danger} onClick={()=>onDel(o.id)}>✕</button>
            </div>
          </div>;
        })}
      </div>}
  </div>;
}

function Activities({ acts, contacts, opps, onAdd, onEdit, onDel }) {
  const [f,setF]=useState("All");
  const ct=id=>contacts.find(c=>c.id===id);
  const op=id=>opps.find(o=>o.id===id);
  const list=[...acts].filter(a=>f==="All"||(f==="Pending"?a.status==="Pending":f==="Done"?a.status==="Done":a.type===f)).sort((a,b)=>a.date>b.date?1:-1);
  return <div style={S.col}>
    <div style={{display:"flex",gap:8,flexWrap:"wrap",alignItems:"center"}}>
      <div style={{display:"flex",gap:4,flexWrap:"wrap"}}>
        {["All","Pending","Done",...ACT_TYPES].map(x=><button key={x} onClick={()=>setF(x)} style={{...S.ghost,borderColor:f===x?(T.act[x]||T.amber):T.border,color:f===x?(T.act[x]||T.amber):T.muted,padding:"5px 10px",fontSize:11}}>{x}</button>)}
      </div>
      <button style={{...S.btn,marginLeft:"auto"}} onClick={onAdd}>+ Activity</button>
    </div>
    {list.length===0?<Empty icon="📋" msg="No activities logged yet!"/>:
      <div style={S.col}>
        {list.map(a=>{
          const c=ct(a.contactId); const o=op(a.oppId);
          const overdue=a.status==="Pending"&&a.date<today();
          return <div key={a.id} style={{...S.card,display:"flex",gap:10,alignItems:"flex-start",borderLeft:`3px solid ${overdue?T.red:T.act[a.type]||T.muted}`}}>
            <div style={{width:34,height:34,borderRadius:8,background:(T.act[a.type]||T.muted)+"22",display:"flex",alignItems:"center",justifyContent:"center",fontSize:15,flexShrink:0}}>
              {a.type==="Call"?"📞":a.type==="Meeting"?"🤝":a.type==="Email"?"✉️":a.type==="LinkedIn"?"💼":"✅"}
            </div>
            <div style={{flex:1}}>
              <div style={{fontSize:13,fontWeight:700,color:T.text}}>{a.title}</div>
              <div style={{fontSize:10,color:T.muted,marginTop:2}}>
                {c&&<span>👤 {c.name} · </span>}
                {o&&<span>💼 {o.title} · </span>}
                <span style={{color:overdue?T.red:T.muted}}>📅 {fmt(a.date)}</span>
              </div>
              {a.notes&&<div style={{fontSize:10,color:T.muted,marginTop:3,fontStyle:"italic"}}>{a.notes}</div>}
            </div>
            <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:4}}>
              <span style={S.badge(a.status==="Done"?T.green:a.status==="Cancelled"?T.red:T.amber)}>{a.status}</span>
              <span style={S.badge(T.act[a.type]||T.muted)}>{a.type}</span>
            </div>
            <div style={{display:"flex",gap:4}}>
              <button style={{...S.ghost,fontSize:11,padding:"4px 9px"}} onClick={()=>onEdit(a)}>Edit</button>
              <button style={S.danger} onClick={()=>onDel(a.id)}>✕</button>
            </div>
          </div>;
        })}
      </div>}
  </div>;
}

function Marketing({ mkt, onAdd, onEdit, onDel }) {
  const [f,setF]=useState("All");
  const totalReach=mkt.reduce((a,m)=>a+(parseInt(m.reach)||0),0);
  const list=[...mkt].filter(m=>f==="All"||m.segment===f||m.status===f).sort((a,b)=>b.date>a.date?1:-1);
  return <div style={S.col}>
    <div style={{display:"flex",gap:10,flexWrap:"wrap"}}>
      <Stat label="Campaigns" value={mkt.length} color={T.teal}/>
      <Stat label="Done" value={mkt.filter(m=>m.status==="Done").length} color={T.amber}/>
      <Stat label="Reached" value={totalReach.toLocaleString()} color={T.blue}/>
    </div>
    <div style={{display:"flex",gap:8,flexWrap:"wrap",alignItems:"center"}}>
      <div style={{display:"flex",gap:4,flexWrap:"wrap"}}>
        {["All",...SEGMENTS,"Planned","Done"].map(x=><button key={x} onClick={()=>setF(x)} style={{...S.ghost,borderColor:f===x?(T.seg[x]||T.amber):T.border,color:f===x?(T.seg[x]||T.amber):T.muted,padding:"5px 10px",fontSize:11}}>{x}</button>)}
      </div>
      <button style={{...S.btn,marginLeft:"auto"}} onClick={onAdd}>+ Campaign</button>
    </div>
    {list.length===0?<Empty icon="📣" msg="No campaigns yet!"/>:
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(260px,1fr))",gap:10}}>
        {list.map(m=>{
          const sc=m.status==="Done"?T.green:m.status==="In Progress"?T.amber:m.status==="Cancelled"?T.red:T.muted;
          return <div key={m.id} style={{...S.card,borderTop:`3px solid ${T.seg[m.segment]||T.muted}`}}>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}>
              <span style={S.badge(T.seg[m.segment]||T.muted)}>{m.segment==="All"?"All":m.segment.split(" ")[0]}</span>
              <span style={S.badge(sc)}>{m.status}</span>
            </div>
            <div style={{fontSize:13,fontWeight:700,color:T.text,marginBottom:3}}>{m.title}</div>
            <div style={{fontSize:11,color:T.amber,marginBottom:4}}>{m.type}</div>
            <div style={{fontSize:10,color:T.muted}}>📅 {fmt(m.date)}{m.reach?` · 👥 ${m.reach} reached`:""}</div>
            {m.notes&&<div style={{fontSize:10,color:T.muted,marginTop:6,fontStyle:"italic",borderTop:"1px solid #30363D",paddingTop:6}}>{m.notes.slice(0,90)}{m.notes.length>90?"...":""}</div>}
            <div style={{display:"flex",gap:6,marginTop:10}}>
              <button style={{...S.ghost,fontSize:11,padding:"4px 10px",flex:1}} onClick={()=>onEdit(m)}>Edit</button>
              <button style={{...S.danger,flex:1}} onClick={()=>onDel(m.id)}>Delete</button>
            </div>
          </div>;
        })}
      </div>}
  </div>;
}

export default function App() {
  const [tab,setTab]           = useState("dashboard");
  const [contacts,setContacts] = useState([]);
  const [opps,setOpps]         = useState([]);
  const [acts,setActs]         = useState([]);
  const [mkt,setMkt]           = useState([]);
  const [modal,setModal]       = useState(null);

  useEffect(()=>{
    setContacts(load("crm-contacts")||[]);
    setOpps(load("crm-opps")||[]);
    setActs(load("crm-acts")||[]);
    setMkt(load("crm-mkt")||[]);
  },[]);

  const upsert = (set,key) => item => {
    set(prev=>{
      const next=prev.find(x=>x.id===item.id)?prev.map(x=>x.id===item.id?item:x):[item,...prev];
      save(key,next); return next;
    });
    setModal(null);
  };
  const remove = (set,key) => id => {
    if(!window.confirm("Delete?")) return;
    set(prev=>{ const next=prev.filter(x=>x.id!==id); save(key,next); return next; });
  };

  const nav=[
    {id:"dashboard",label:"Dashboard",icon:"◈"},
    {id:"contacts", label:"Contacts",  icon:"◉", n:contacts.length},
    {id:"opps",     label:"Deals",     icon:"◆", n:opps.length},
    {id:"acts",     label:"Activities",icon:"◷", n:acts.filter(a=>a.status==="Pending").length||0},
    {id:"mkt",      label:"Marketing", icon:"◎", n:mkt.length},
  ];

  return (
    <div style={{display:"flex",height:"100vh",background:T.bg,color:T.text,fontFamily:"'DM Sans',system-ui,sans-serif",overflow:"hidden"}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');
        *{box-sizing:border-box}
        ::-webkit-scrollbar{width:4px;height:4px}
        ::-webkit-scrollbar-thumb{background:#30363D;border-radius:99px}
        button:hover{opacity:.85}
      `}</style>
      <div style={{width:190,background:T.sidebar,borderRight:"1px solid #30363D",display:"flex",flexDirection:"column",flexShrink:0}}>
        <div style={{padding:"18px 16px 12px",borderBottom:"1px solid #30363D33"}}>
          <div style={{fontSize:13,fontWeight:800,letterSpacing:"0.12em",color:T.amber}}>IXE CRM</div>
          <div style={{fontSize:10,color:T.muted,marginTop:1}}>Commercial Pipeline</div>
        </div>
        <nav style={{flex:1,padding:"8px"}}>
          {nav.map(n=>(
            <button key={n.id} onClick={()=>setTab(n.id)} style={{display:"flex",alignItems:"center",gap:8,width:"100%",padding:"9px 10px",borderRadius:7,border:"none",background:tab===n.id?"#3D2A00":"transparent",color:tab===n.id?T.amber:T.muted,cursor:"pointer",fontSize:13,fontWeight:tab===n.id?700:400,marginBottom:1,textAlign:"left",fontFamily:"inherit"}}>
              <span>{n.icon}</span>
              <span style={{flex:1}}>{n.label}</span>
              {n.n>0&&<span style={{background:tab===n.id?"#F0A50044":"#30363D",color:tab===n.id?T.amber:T.muted,borderRadius:20,padding:"1px 7px",fontSize:9,fontWeight:700}}>{n.n}</span>}
            </button>
          ))}
        </nav>
        <div style={{padding:"10px 14px",borderTop:"1px solid #30363D",fontSize:9,color:"#484F58",lineHeight:1.6}}>
          {contacts.length} contacts · {opps.length} deals<br/>
          {acts.length} activities · localStorage
        </div>
      </div>
      <div style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden"}}>
        <div style={{padding:"14px 20px",borderBottom:"1px solid #30363D",background:T.sidebar,display:"flex",alignItems:"center",justifyContent:"space-between",flexShrink:0}}>
          <div>
            <h1 style={{margin:0,fontSize:17,fontWeight:800,color:T.text}}>{nav.find(n=>n.id===tab)?.label}</h1>
            <div style={{fontSize:10,color:T.muted,marginTop:1}}>
              {tab==="dashboard"&&"Commercial overview"}
              {tab==="contacts"&&`${contacts.length} contacts · Oil & Gas · Construction · Agriculture`}
              {tab==="opps"&&`${opps.filter(o=>!["Won","Lost"].includes(o.stage)).length} active deals in pipeline`}
              {tab==="acts"&&`${acts.filter(a=>a.status==="Pending").length} pending follow-ups`}
              {tab==="mkt"&&`${mkt.length} marketing activities`}
            </div>
          </div>
          <div>
            {tab==="contacts" &&<button style={S.btn} onClick={()=>setModal({t:"contact",d:{}})}>+ Contact</button>}
            {tab==="opps"     &&<button style={S.btn} onClick={()=>setModal({t:"opp",d:{}})}>+ Deal</button>}
            {tab==="acts"     &&<button style={S.btn} onClick={()=>setModal({t:"act",d:{}})}>+ Activity</button>}
            {tab==="mkt"      &&<button style={S.btn} onClick={()=>setModal({t:"mkt",d:{}})}>+ Campaign</button>}
          </div>
        </div>
        <div style={{flex:1,overflowY:"auto",padding:18}}>
          {tab==="dashboard"&&<Dashboard contacts={contacts} opps={opps} acts={acts} mkt={mkt}/>}
          {tab==="contacts" &&<Contacts contacts={contacts} onAdd={()=>setModal({t:"contact",d:{}})} onEdit={c=>setModal({t:"contact",d:c})} onDel={remove(setContacts,"crm-contacts")}/>}
          {tab==="opps"     &&<Opps opps={opps} contacts={contacts} onAdd={()=>setModal({t:"opp",d:{}})} onEdit={o=>setModal({t:"opp",d:o})} onDel={remove(setOpps,"crm-opps")}/>}
          {tab==="acts"     &&<Activities acts={acts} contacts={contacts} opps={opps} onAdd={()=>setModal({t:"act",d:{}})} onEdit={a=>setModal({t:"act",d:a})} onDel={remove(setActs,"crm-acts")}/>}
          {tab==="mkt"      &&<Marketing mkt={mkt} onAdd={()=>setModal({t:"mkt",d:{}})} onEdit={m=>setModal({t:"mkt",d:m})} onDel={remove(setMkt,"crm-mkt")}/>}
        </div>
      </div>
      {modal?.t==="contact"&&<ContactModal init={modal.d} onSave={upsert(setContacts,"crm-contacts")} onClose={()=>setModal(null)}/>}
      {modal?.t==="opp"    &&<OppModal     init={modal.d} contacts={contacts} onSave={upsert(setOpps,"crm-opps")} onClose={()=>setModal(null)}/>}
      {modal?.t==="act"    &&<ActModal     init={modal.d} contacts={contacts} opps={opps} onSave={upsert(setActs,"crm-acts")} onClose={()=>setModal(null)}/>}
      {modal?.t==="mkt"    &&<MktModal     init={modal.d} onSave={upsert(setMkt,"crm-mkt")} onClose={()=>setModal(null)}/>}
    </div>
  );
}
