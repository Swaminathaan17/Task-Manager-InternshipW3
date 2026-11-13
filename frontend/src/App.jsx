import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, Circle, ClipboardList, LogOut, Plus, Search, Trash2, CalendarDays, X, Sparkles } from "lucide-react";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
const token = () => localStorage.getItem("taskflow_token");

async function api(path, options = {}) {
  const res = await fetch(API + path, {
    ...options,
    headers: { "Content-Type": "application/json", ...(token() ? { Authorization: "Bearer " + token() } : {}), ...(options.headers || {}) }
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || "Request failed");
  return data;
}

function Auth({ onLogin }) {
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e) {
    e.preventDefault(); setError(""); setLoading(true);
    try {
      const data = await api("/auth/" + mode, { method: "POST", body: JSON.stringify(form) });
      localStorage.setItem("taskflow_token", data.token);
      localStorage.setItem("taskflow_user", JSON.stringify(data.user));
      onLogin(data.user);
    } catch (err) { setError(err.message); } finally { setLoading(false); }
  }

  return <main className="auth">
    <section className="auth-hero">
      <div className="brand"><span className="brand-mark"><CheckCircle2 size={19}/></span> TaskFlow</div>
      <div className="hero-copy">
        <span className="eyebrow"><Sparkles size={13}/> Focus on what matters</span>
        <h1>Turn busy days into <em>clear progress.</em></h1>
        <p>A focused workspace for planning, prioritising and finishing your work without the noise.</p>
      </div>
      <div className="preview">
        <div><Circle size={15}/> Review project changes <b>Today</b></div>
        <div><CheckCircle2 size={15}/> Ship the update <b>Done</b></div>
        <div><Circle size={15}/> Plan next sprint <b>Tomorrow</b></div>
      </div>
    </section>
    <section className="auth-panel">
      <div className="auth-card">
        <div className="mobile-brand"><span className="brand-mark"><CheckCircle2 size={19}/></span> TaskFlow</div>
        <h2>{mode === "login" ? "Welcome back" : "Create your account"}</h2>
        <p className="muted">{mode === "login" ? "Sign in to continue to your workspace." : "Start organising your work in minutes."}</p>
        {error && <div className="alert">{error}</div>}
        <form onSubmit={submit}>
          {mode === "register" && <label>Name<input required value={form.name} onChange={e=>setForm({...form,name:e.target.value})} placeholder="Your name"/></label>}
          <label>Email<input required type="email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} placeholder="you@example.com"/></label>
          <label>Password<input required minLength="6" type="password" value={form.password} onChange={e=>setForm({...form,password:e.target.value})} placeholder="At least 6 characters"/></label>
          <button className="primary full" disabled={loading}>{loading ? "Please wait..." : mode === "login" ? "Sign in" : "Create account"}</button>
        </form>
        <button className="switch" onClick={()=>{setMode(mode==="login"?"register":"login");setError("")}}>{mode==="login"?"New here? Create an account":"Already have an account? Sign in"}</button>
      </div>
    </section>
  </main>;
}

function TaskModal({ task, close, save }) {
  const [form,setForm]=useState(task || {title:"",description:"",priority:"medium",dueDate:""});
  return <div className="modal-bg" onMouseDown={e=>e.target===e.currentTarget&&close()}>
    <div className="modal">
      <div className="modal-head"><div><span className="eyebrow">Task details</span><h3>{task?"Edit task":"Create a task"}</h3></div><button className="icon" onClick={close}><X/></button></div>
      <form onSubmit={e=>{e.preventDefault();save(form)}}>
        <label>Title<input autoFocus required value={form.title} onChange={e=>setForm({...form,title:e.target.value})} placeholder="What needs to be done?"/></label>
        <label>Description<textarea rows="4" value={form.description} onChange={e=>setForm({...form,description:e.target.value})} placeholder="Add a little context..."/></label>
        <div className="grid2">
          <label>Priority<select value={form.priority} onChange={e=>setForm({...form,priority:e.target.value})}><option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option></select></label>
          <label>Due date<input type="date" value={form.dueDate?String(form.dueDate).slice(0,10):""} onChange={e=>setForm({...form,dueDate:e.target.value})}/></label>
        </div>
        <div className="modal-actions"><button type="button" className="secondary" onClick={close}>Cancel</button><button className="primary">{task?"Save changes":"Add task"}</button></div>
      </form>
    </div>
  </div>;
}

function Dashboard({ user, logout }) {
  const [tasks,setTasks]=useState([]), [status,setStatus]=useState("all"), [priority,setPriority]=useState("all"), [search,setSearch]=useState(""), [modal,setModal]=useState(null), [error,setError]=useState("");
  async function load() {
    try {
      const q=new URLSearchParams({status,priority,search});
      setTasks(await api("/tasks?"+q)); setError("");
    } catch(e){setError(e.message)}
  }
  useEffect(()=>{load()},[status,priority]);
  useEffect(()=>{const t=setTimeout(load,250);return()=>clearTimeout(t)},[search]);

  const stats=useMemo(()=>({total:tasks.length,done:tasks.filter(t=>t.status==="completed").length,pending:tasks.filter(t=>t.status==="pending").length,high:tasks.filter(t=>t.priority==="high").length}),[tasks]);

  async function save(form) {
    try {
      await api(modal?.task?"/tasks/"+modal.task._id:"/tasks",{method:modal?.task?"PUT":"POST",body:JSON.stringify(form)});
      setModal(null);load();
    } catch(e){setError(e.message)}
  }
  async function toggle(t){await api("/tasks/"+t._id+"/status",{method:"PATCH",body:JSON.stringify({status:t.status==="completed"?"pending":"completed"})});load()}
  async function remove(t){if(confirm('Delete "'+t.title+'"?')){await api("/tasks/"+t._id,{method:"DELETE"});load()}}

  return <div className="shell">
    <header className="topbar"><div className="brand"><span className="brand-mark dark"><CheckCircle2 size={19}/></span> TaskFlow</div><div className="top-actions"><span>Hi, {user.name.split(" ")[0]}</span><button onClick={logout}><LogOut size={15}/> Logout</button></div></header>
    <main className="dashboard">
      <div className="dash-head"><div><span className="eyebrow">Your workspace</span><h1>Good to see you, {user.name.split(" ")[0]}.</h1><p className="muted">Keep momentum. One task at a time.</p></div><button className="primary" onClick={()=>setModal({task:null})}><Plus size={17}/> New task</button></div>
      {error&&<div className="alert">{error}</div>}
      <section className="stats">
        <Stat icon={<ClipboardList/>} value={stats.total} label="Total tasks"/>
        <Stat icon={<CheckCircle2/>} value={stats.done} label="Completed" cls="success"/>
        <Stat icon={<Circle/>} value={stats.pending} label="Pending" cls="pending"/>
        <Stat icon="!" value={stats.high} label="High priority" cls="danger"/>
      </section>
      <section className="tasks">
        <div className="toolbar"><div className="search"><Search size={16}/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search tasks..."/></div><div className="filters"><select value={status} onChange={e=>setStatus(e.target.value)}><option value="all">All status</option><option value="pending">Pending</option><option value="completed">Completed</option></select><select value={priority} onChange={e=>setPriority(e.target.value)}><option value="all">All priority</option><option value="high">High priority</option><option value="medium">Medium priority</option><option value="low">Low priority</option></select></div></div>
        <div className="list">{tasks.length===0?<div className="empty"><ClipboardList size={36}/><h3>No tasks found</h3><p>Create a task or adjust your filters to get started.</p><button className="secondary" onClick={()=>setModal({task:null})}>Create first task</button></div>:tasks.map(t=><article className={"task "+(t.status==="completed"?"done":"")} key={t._id}>
          <button className="check" onClick={()=>toggle(t)}>{t.status==="completed"?<CheckCircle2/>:<Circle/>}</button>
          <div className="task-body"><div className="task-title"><h3>{t.title}</h3><span className={"priority "+t.priority}>{t.priority}</span></div>{t.description&&<p>{t.description}</p>}<div className="meta">{t.dueDate&&<span><CalendarDays size={13}/>{new Date(t.dueDate).toLocaleDateString()}</span>}<span className={t.status}>{t.status}</span></div></div>
          <div className="actions"><button onClick={()=>setModal({task:t})}>Edit</button><button className="icon danger" onClick={()=>remove(t)}><Trash2 size={16}/></button></div>
        </article>)}</div>
      </section>
    </main>
    {modal&&<TaskModal task={modal.task} close={()=>setModal(null)} save={save}/>}
  </div>;
}

function Stat({icon,value,label,cls=""}){return <div className="stat"><span className={"stat-icon "+cls}>{icon}</span><div><b>{value}</b><span>{label}</span></div></div>}
export default function App(){
  const [user,setUser]=useState(()=>JSON.parse(localStorage.getItem("taskflow_user")||"null"));
  function logout(){localStorage.removeItem("taskflow_token");localStorage.removeItem("taskflow_user");setUser(null)}
  return user?<Dashboard user={user} logout={logout}/>:<Auth onLogin={setUser}/>;
}