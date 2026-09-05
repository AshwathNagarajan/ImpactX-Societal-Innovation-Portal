import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, BarChart, Bar, CartesianGrid } from "recharts";
import { Building2, CheckCircle, ClipboardList, Factory, FolderKanban, Hourglass, ListChecks, Trophy } from "lucide-react";
import { useImpactData } from "../../hooks/useImpactData.js";
import KPICard from "../../components/dashboard/KPICard.jsx";
import ChartCard from "../../components/charts/ChartCard.jsx";

const iconMap = [ClipboardList, Hourglass, CheckCircle, ListChecks, FolderKanban, Trophy, Building2, Factory];
const neon = ["#22d3ee", "#a78bfa", "#34d399", "#fbbf24", "#fb7185"];

export default function AdminDashboard(){
  const { data } = useImpactData();
  const { chartData } = data;
  const cards = data.kpis.map((k,i)=>[k[0],k[1],k[2],iconMap[i] || ClipboardList]);
  const statusLine = chartData.status.map((item, index) => ({ name: item.name, value: item.value, target: Math.max(1, item.value + index + 1) }));
  const districtLine = chartData.district.map((item, index) => ({ name: item.name, challenges: item.challenges, active: Math.max(0, item.challenges - (index % 2)) }));

  return <div className="admin-dark-shell -m-4 rounded-[2rem] p-4 sm:-m-6 sm:p-6 lg:-m-8 lg:p-8">
    <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">{cards.map(c=><KPICard key={c[0]} title={c[0]} value={c[1]} note={c[2]} icon={c[3]}/>)}</div>
    <div className="mt-10 grid gap-8 xl:grid-cols-[1fr_.72fr]">
      <section className="rounded-3xl border border-amber-300/20 bg-slate-950/80 p-6 shadow-[0_20px_50px_rgba(251,191,36,.08)] md:p-7">
        <h2 className="text-lg font-semibold text-white md:text-xl">Requires Attention</h2>
        <div className="mt-5 grid gap-4 md:grid-cols-3">{[`${data.challenges.filter(c=>c.priority==="Critical"||c.priority==="High").length} High Priority Challenges`,`${data.challenges.filter(c=>["Submitted","Under Review"].includes(c.status)).length} Awaiting Validation`,`${data.projects.filter(p=>p.progress<60).length} Projects Delayed`].map((x,i)=><div key={x} className={`rounded-2xl border border-white/10 bg-white/5 p-5 ${i===0?"text-rose-300":"text-amber-300"}`}><p className="text-3xl font-semibold">{x.split(" ")[0]}</p><p className="mt-2 text-sm text-slate-300">{x.replace(x.split(" ")[0],"")}</p></div>)}</div>
      </section>
      <ImpactScore/>
    </div>
    <div className="mt-10 grid gap-8 xl:grid-cols-2">
      <ChartCard title="Challenge Activity"><ResponsiveContainer><LineChart data={chartData.monthly}><CartesianGrid strokeDasharray="3 3"/><XAxis dataKey="month"/><YAxis/><Tooltip/><Line type="monotone" dataKey="submissions" stroke={neon[0]} strokeWidth={4} dot={{r:4, fill:neon[0]}}/><Line type="monotone" dataKey="resolved" stroke={neon[2]} strokeWidth={3} dot={{r:3, fill:neon[2]}}/></LineChart></ResponsiveContainer></ChartCard>
      <ChartCard title="Category Intelligence"><ResponsiveContainer><LineChart data={chartData.category}><CartesianGrid strokeDasharray="3 3"/><XAxis dataKey="name" hide/><YAxis/><Tooltip/><Line type="monotone" dataKey="value" stroke={neon[1]} strokeWidth={4} dot={{r:4, fill:neon[1]}}/></LineChart></ResponsiveContainer></ChartCard>
      <ChartCard title="District Momentum"><ResponsiveContainer><LineChart data={districtLine}><CartesianGrid strokeDasharray="3 3"/><XAxis dataKey="name"/><YAxis/><Tooltip/><Line type="monotone" dataKey="challenges" stroke={neon[0]} strokeWidth={4}/><Line type="monotone" dataKey="active" stroke={neon[3]} strokeWidth={3}/></LineChart></ResponsiveContainer></ChartCard>
      <ChartCard title="Project Pipeline"><ResponsiveContainer><LineChart data={statusLine}><CartesianGrid strokeDasharray="3 3"/><XAxis dataKey="name" hide/><YAxis/><Tooltip/><Line type="monotone" dataKey="value" stroke={neon[4]} strokeWidth={4} dot={{r:4, fill:neon[4]}}/><Line type="monotone" dataKey="target" stroke={neon[2]} strokeWidth={2} strokeDasharray="5 5"/></LineChart></ResponsiveContainer></ChartCard>
    </div>
  </div>
}

function ImpactScore(){return <section className="rounded-3xl border border-slate-300/20 bg-slate-950/80 p-6 shadow-[0_20px_50px_rgba(148,163,184,.10)] md:p-7"><div className="flex flex-col gap-6 min-[380px]:flex-row min-[380px]:items-center"><div className="grid h-28 w-28 shrink-0 place-items-center rounded-full border border-slate-300/30 bg-[conic-gradient(#94a3b8_0_87%,rgba(255,255,255,.12)_87%)]"><div className="grid h-20 w-20 place-items-center rounded-full bg-slate-950"><span className="text-3xl font-semibold text-white">87</span></div></div><div className="min-w-0"><p className="text-xs uppercase tracking-[0.2em] text-slate-300">Impact Score</p>{["Community Reach 92","Sustainability 84","Scalability 88","Innovation 85"].map(x=><p key={x} className="mt-3 text-sm text-slate-300">{x}</p>)}</div></div></section>}
