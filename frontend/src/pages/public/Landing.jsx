import { Link } from "react-router-dom";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, LineChart, Line, PieChart, Pie, Cell, RadarChart, PolarGrid, PolarAngleAxis, Radar } from "recharts";
import { Award, Building2, Factory, Lightbulb, Map, ShieldCheck, Users, Workflow } from "lucide-react";
import { useImpactData } from "../../hooks/useImpactData.js";
import KPICard from "../../components/dashboard/KPICard.jsx";
import ChartCard from "../../components/charts/ChartCard.jsx";
import ChallengeCard from "../../components/challenges/ChallengeCard.jsx";
import ProjectCard from "../../components/dashboard/ProjectCard.jsx";
import InstituteCard from "../../components/dashboard/InstituteCard.jsx";
import IndustryCard from "../../components/dashboard/IndustryCard.jsx";
const colors = ["#2563EB", "#0891B2", "#0D9488", "#7C3AED", "#16A34A", "#D97706", "#64748B"];
const icons = [Workflow, ShieldCheck, Lightbulb, Award, Building2, Factory, Map, Users];
const networkNodes = ["Citizen","AI Analysis","Government","University","Industry","Impact"];
export default function Landing() {
  const { data } = useImpactData();
  const { chartData, challenges, industries, institutes, kpis, projects } = data;
  return <div>
    <section className="border-b border-slate-200 bg-white">
      <div className="mx-auto grid max-w-[1440px] items-center gap-10 px-4 py-12 sm:px-6 sm:py-16 lg:min-h-[70vh] lg:grid-cols-[1.04fr_.96fr] lg:px-10 xl:px-12">
        <div>
          <span className="rounded-full border border-blue/20 bg-blue-50 px-4 py-2 text-xs font-semibold text-blue sm:text-sm">AI-Powered Societal Innovation</span>
          <h1 className="mt-6 max-w-4xl text-[2.5rem] font-semibold leading-[1.05] tracking-tight text-navy min-[420px]:text-[3rem] md:text-6xl lg:text-7xl">Transforming Societal Challenges Into <span className="impact-gradient-text">Real Impact.</span></h1>
          <p className="mt-6 max-w-xl text-base leading-8 text-slate-600 sm:text-lg">Connecting communities, institutions, industries and government through one collaborative innovation ecosystem.</p>
          <div className="mt-8 grid gap-3 sm:flex sm:flex-wrap"><Link to="/explore" className="impact-gradient rounded-xl px-6 py-3.5 text-center font-semibold text-white shadow-sm">Explore Challenges</Link><Link to="/submit" className="rounded-xl border border-slate-300 bg-white px-6 py-3.5 text-center font-semibold text-navy shadow-sm">Submit a Challenge</Link></div>
        </div>
        <div className="premium-surface rounded-3xl border p-5 md:hidden">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Collaboration Flow</p>
          <div className="grid gap-2">
            {["Citizen Submission", "AI Analysis", "Government Validation", "Institute + Industry", "Measured Impact"].map((step, i) => (
              <div key={step} className="flex items-center gap-3 rounded-2xl border bg-white p-4">
                <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-xl text-xs font-semibold ${i === 0 ? "impact-gradient text-white" : "bg-blue-50 text-blue"}`}>{i + 1}</span>
                <span className="text-sm font-semibold text-navy">{step}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="premium-surface relative hidden min-h-[500px] overflow-hidden rounded-3xl border p-10 md:block">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_35%,rgba(37,99,235,.10),transparent_35%)]"/>
          <div className="relative grid h-full place-items-center">
            <div className="impactx-orbit relative h-72 w-72 lg:h-80 lg:w-80">
              <div className="impactx-orbit-ring absolute inset-6 rounded-full border border-slate-500/10"/>
              <div className="absolute inset-14 rounded-full border border-teal-400/10"/>
              <div className="impactx-orbit-shell absolute inset-0">
                {networkNodes.map((n,i)=> (
                  <div key={n} className="impactx-orbit-node" style={{"--orbit-angle": `${i * 60}deg`}}>
                    <div className="impactx-orbit-label w-24 rounded-2xl border border-blue/20 bg-white/95 p-3 text-center text-xs font-semibold text-navy shadow-lg lg:w-28 lg:text-sm">
                      <span className="mx-auto mb-1.5 block h-2 w-2 rounded-full bg-blue"/>{n}
                    </div>
                  </div>
                ))}
              </div>
              <div className="absolute left-1/2 top-1/2 z-10 grid h-24 w-24 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border border-blue/20 bg-white text-center text-sm font-semibold text-blue shadow-lg">IMPACTX<br/>Network</div>
            </div>
          </div>
        </div>
      </div>
    </section>
    <section className="mx-auto max-w-[1440px] px-4 py-12 sm:px-6 md:py-16 lg:px-10 xl:px-12">
      <div className="mb-10 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
        <p className="mb-6 text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Live Impact</p>
        <div className="grid gap-6 min-[440px]:grid-cols-2 lg:grid-cols-5">{kpis.slice(0,5).map(([l,v])=><div key={l} className="border-slate-200 min-[440px]:last:col-span-2 lg:border-r lg:pr-6 lg:last:col-span-1 lg:last:border-r-0"><p className="impact-gradient-text text-3xl font-semibold lg:text-4xl">{v}</p><p className="mt-2 text-sm text-slate-500">{l}</p></div>)}</div>
      </div>
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">{kpis.map(([t,v,n],i)=><KPICard key={t} title={t} value={v} note={n} icon={icons[i]}/>)}</div>
      <div className="mt-12 grid gap-8 xl:grid-cols-2">
        <ChartCard title="Challenges by Category"><ResponsiveContainer><BarChart data={chartData.category}><XAxis dataKey="name" hide/><YAxis/><Tooltip/><Bar dataKey="value" fill="#2563EB" radius={[6,6,0,0]}/></BarChart></ResponsiveContainer></ChartCard>
        <ChartCard title="Monthly Challenge Submissions"><ResponsiveContainer><LineChart data={chartData.monthly}><XAxis dataKey="month"/><YAxis/><Tooltip/><Line dataKey="submissions" stroke="#2563EB" strokeWidth={3}/><Line dataKey="resolved" stroke="#0D9488" strokeWidth={3}/></LineChart></ResponsiveContainer></ChartCard>
        <ChartCard title="Challenge Status Distribution"><ResponsiveContainer><PieChart><Pie data={chartData.status} dataKey="value" nameKey="name" innerRadius={62} outerRadius={98}>{chartData.status.map((_,i)=><Cell key={i} fill={colors[i%colors.length]}/>)}</Pie><Tooltip/></PieChart></ResponsiveContainer></ChartCard>
        <ChartCard title="Challenges by District"><ResponsiveContainer><BarChart data={chartData.district} layout="vertical" margin={{ left: 30 }}><XAxis type="number"/><YAxis dataKey="name" type="category"/><Tooltip/><Bar dataKey="challenges" fill="#0D9488" radius={[0,6,6,0]}/></BarChart></ResponsiveContainer></ChartCard>
        <ChartCard title="University vs Industry Participation"><ResponsiveContainer><BarChart data={chartData.participation}><XAxis dataKey="name"/><YAxis/><Tooltip/><Bar dataKey="institutes" fill="#2563EB"/><Bar dataKey="industries" fill="#7C3AED"/></BarChart></ResponsiveContainer></ChartCard>
        <ChartCard title="Impact by Sector"><ResponsiveContainer><RadarChart data={chartData.impact}><PolarGrid/><PolarAngleAxis dataKey="sector"/><Radar dataKey="impact" fill="#D97706" fillOpacity={0.25} stroke="#D97706"/></RadarChart></ResponsiveContainer></ChartCard>
      </div>
      <Section title="Recent Challenges"><div className="grid gap-6 lg:grid-cols-3">{challenges.slice(0,3).map(c=><ChallengeCard key={c.id} challenge={c}/>)}</div></Section>
      <Section title="Featured Solutions"><div className="grid gap-6 lg:grid-cols-3">{projects.slice(0,3).map(p=><ProjectCard key={p.id} project={p}/>)}</div></Section>
      <Section title="Top Performing Institutes"><div className="grid gap-6 lg:grid-cols-3">{institutes.slice(0,3).map(i=><InstituteCard key={i.name} institute={i}/>)}</div></Section>
      <Section title="Industry Collaboration Highlights"><div className="grid gap-6 lg:grid-cols-4">{industries.map(i=><IndustryCard key={i.name} industry={i}/>)}</div></Section>
      <Section title="District-wise Impact Map"><div className="grid min-h-80 place-items-center rounded-3xl border bg-white p-8 text-center shadow-sm"><div><Map className="mx-auto mb-4 text-green" size={52}/><h3 className="text-2xl font-semibold text-navy">Jharkhand Impact Coverage</h3><p className="mt-3 max-w-2xl text-slate-600">Interactive district heat map placeholder showing pilots, beneficiaries and challenge density across 24 districts.</p></div></div></Section>
    </section>
  </div>;
}
function Section({ title, children }) { return <section className="mt-14 md:mt-16"><h2 className="mb-6 text-2xl font-semibold text-navy md:text-3xl">{title}</h2>{children}</section>; }
