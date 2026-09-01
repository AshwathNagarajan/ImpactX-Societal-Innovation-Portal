import { Link } from "react-router-dom";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, LineChart, Line, PieChart, Pie, Cell, RadarChart, PolarGrid, PolarAngleAxis, Radar } from "recharts";
import { Award, Building2, Factory, Lightbulb, Map, ShieldCheck, Users, Workflow } from "lucide-react";
import { chartData, challenges, industries, institutes, kpis, projects } from "../../data/mockData.js";
import KPICard from "../../components/dashboard/KPICard.jsx";
import ChartCard from "../../components/charts/ChartCard.jsx";
import ChallengeCard from "../../components/challenges/ChallengeCard.jsx";
import ProjectCard from "../../components/dashboard/ProjectCard.jsx";
import InstituteCard from "../../components/dashboard/InstituteCard.jsx";
import IndustryCard from "../../components/dashboard/IndustryCard.jsx";
const colors = ["#38BDF8", "#14B8A6", "#8B5CF6", "#22C55E", "#F59E0B", "#64748B", "#0EA5E9"];
const icons = [Workflow, ShieldCheck, Lightbulb, Award, Building2, Factory, Map, Users];
export default function Landing() {
  return <div>
    <section className="border-b bg-[#08111f]/50">
      <div className="mx-auto grid max-w-7xl items-center gap-6 px-4 py-7 sm:gap-8 sm:py-10 lg:max-h-[65vh] lg:min-h-[520px] lg:grid-cols-[1.05fr_.95fr]">
        <div>
          <span className="rounded-full border border-blue/20 bg-blue/10 px-3 py-1 text-xs font-semibold text-blue sm:text-sm">AI-Powered Societal Innovation</span>
          <h1 className="mt-4 max-w-4xl text-4xl font-semibold leading-[1.05] tracking-tight text-navy sm:mt-5 md:text-6xl">Transforming<br/>Societal Challenges<br/>Into <span className="impact-gradient-text">Real Impact.</span></h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600 sm:mt-5 sm:text-lg sm:leading-8">Connecting communities, institutions, industries and government through one collaborative innovation ecosystem.</p>
          <div className="mt-6 grid gap-3 sm:flex sm:flex-wrap"><Link to="/explore" className="impact-gradient rounded-xl px-5 py-3 text-center font-semibold text-[#041016] shadow-sm">Explore Challenges</Link><Link to="/submit" className="rounded-xl border border-slate-500/20 px-5 py-3 text-center font-semibold text-navy">Submit a Challenge</Link></div>
        </div>
        <div className="premium-surface relative min-h-[310px] overflow-hidden rounded-3xl border p-4 sm:min-h-[430px] sm:p-8">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_35%,rgba(56,189,248,.14),transparent_35%)]"/>
          <div className="relative grid h-full place-items-center">
            <div className="relative h-64 w-64 sm:h-80 sm:w-80">
              {["Citizen","AI Analysis","Government","University","Industry","Impact"].map((n,i)=> {
                const pos = [[38,0],[67,18],[67,60],[38,78],[8,60],[8,18]][i];
                return <div key={n} className="absolute w-24 rounded-2xl border border-blue/20 bg-[#0d1828]/90 p-2 text-center text-xs font-semibold text-navy shadow-lg sm:w-28 sm:p-3 sm:text-sm" style={{left:`${pos[0]}%`,top:`${pos[1]}%`}}><span className="mx-auto mb-2 block h-2 w-2 rounded-full bg-blue"/>{n}</div>
              })}
              <div className="absolute left-1/2 top-1/2 grid h-20 w-20 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border border-blue/30 bg-[#08111f] text-center text-xs font-semibold text-blue shadow-[0_0_40px_rgba(56,189,248,.12)] sm:h-24 sm:w-24 sm:text-sm">IMPACTX<br/>Network</div>
              <div className="absolute inset-10 rounded-full border border-slate-500/10"/>
              <div className="absolute inset-20 rounded-full border border-teal-400/10"/>
            </div>
          </div>
        </div>
      </div>
    </section>
    <section className="mx-auto max-w-7xl px-4 py-8">
      <div className="mb-6 rounded-2xl border border-blue/10 bg-[#08111f]/80 p-4 sm:mb-8 sm:p-5">
        <p className="mb-4 text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Live Impact</p>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 lg:grid-cols-5">{[["1,248+","Challenges"],["64","Institutes"],["41","Industry Partners"],["93","Solutions Implemented"],["2.4L+","Lives Impacted"]].map(([v,l])=><div key={l} className="last:col-span-2 lg:last:col-span-1"><p className="impact-gradient-text text-2xl font-semibold sm:text-3xl">{v}</p><p className="mt-1 text-sm text-slate-500">{l}</p></div>)}</div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{kpis.map(([t,v,n],i)=><KPICard key={t} title={t} value={v} note={n} icon={icons[i]}/>)}</div>
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <ChartCard title="Challenges by Category"><ResponsiveContainer><BarChart data={chartData.category}><XAxis dataKey="name" hide/><YAxis/><Tooltip/><Bar dataKey="value" fill="#38BDF8" radius={[6,6,0,0]}/></BarChart></ResponsiveContainer></ChartCard>
        <ChartCard title="Monthly Challenge Submissions"><ResponsiveContainer><LineChart data={chartData.monthly}><XAxis dataKey="month"/><YAxis/><Tooltip/><Line dataKey="submissions" stroke="#38BDF8" strokeWidth={3}/><Line dataKey="resolved" stroke="#14B8A6" strokeWidth={3}/></LineChart></ResponsiveContainer></ChartCard>
        <ChartCard title="Challenge Status Distribution"><ResponsiveContainer><PieChart><Pie data={chartData.status} dataKey="value" nameKey="name" innerRadius={62} outerRadius={98}>{chartData.status.map((_,i)=><Cell key={i} fill={colors[i%colors.length]}/>)}</Pie><Tooltip/></PieChart></ResponsiveContainer></ChartCard>
        <ChartCard title="Challenges by District"><ResponsiveContainer><BarChart data={chartData.district} layout="vertical" margin={{ left: 30 }}><XAxis type="number"/><YAxis dataKey="name" type="category"/><Tooltip/><Bar dataKey="challenges" fill="#14B8A6" radius={[0,6,6,0]}/></BarChart></ResponsiveContainer></ChartCard>
        <ChartCard title="University vs Industry Participation"><ResponsiveContainer><BarChart data={chartData.participation}><XAxis dataKey="name"/><YAxis/><Tooltip/><Bar dataKey="institutes" fill="#38BDF8"/><Bar dataKey="industries" fill="#8B5CF6"/></BarChart></ResponsiveContainer></ChartCard>
        <ChartCard title="Impact by Sector"><ResponsiveContainer><RadarChart data={chartData.impact}><PolarGrid/><PolarAngleAxis dataKey="sector"/><Radar dataKey="impact" fill="#F59E0B" fillOpacity={0.35} stroke="#F59E0B"/></RadarChart></ResponsiveContainer></ChartCard>
      </div>
      <Section title="Recent Challenges"><div className="grid gap-4 lg:grid-cols-3">{challenges.slice(0,3).map(c=><ChallengeCard key={c.id} challenge={c}/>)}</div></Section>
      <Section title="Featured Solutions"><div className="grid gap-4 lg:grid-cols-3">{projects.slice(0,3).map(p=><ProjectCard key={p.id} project={p}/>)}</div></Section>
      <Section title="Top Performing Institutes"><div className="grid gap-4 lg:grid-cols-3">{institutes.slice(0,3).map(i=><InstituteCard key={i.name} institute={i}/>)}</div></Section>
      <Section title="Industry Collaboration Highlights"><div className="grid gap-4 lg:grid-cols-4">{industries.map(i=><IndustryCard key={i.name} industry={i}/>)}</div></Section>
      <Section title="District-wise Impact Map"><div className="grid min-h-72 place-items-center rounded-xl border bg-white p-6 text-center shadow-sm"><div><Map className="mx-auto mb-3 text-green" size={48}/><h3 className="text-2xl font-bold text-navy">Jharkhand Impact Coverage</h3><p className="mt-2 text-slate-600">Interactive district heat map placeholder showing pilots, beneficiaries and challenge density across 24 districts.</p></div></div></Section>
    </section>
  </div>;
}
function Section({ title, children }) { return <section className="mt-10"><h2 className="mb-4 text-2xl font-bold text-navy">{title}</h2>{children}</section>; }
