import { Navigate, Route, Routes } from "react-router-dom";
import { BarChart3, Bell, Building2, Factory, FileCheck, FolderKanban, Handshake, LayoutDashboard, Lightbulb, Search, Settings, ShieldCheck, Users, Wallet, Wrench } from "lucide-react";
import PublicLayout from "../layouts/PublicLayout.jsx";
import DashboardLayout from "../layouts/DashboardLayout.jsx";
import { getUser } from "../utils/auth.js";
import Landing from "../pages/public/Landing.jsx";
import ExploreChallenges from "../pages/public/ExploreChallenges.jsx";
import ChallengeDetails from "../pages/public/ChallengeDetails.jsx";
import SubmitChallenge from "../pages/public/SubmitChallenge.jsx";
import HowItWorks from "../pages/public/HowItWorks.jsx";
import Login from "../pages/public/Login.jsx";
import AdminDashboard from "../pages/admin/AdminDashboard.jsx";
import Challenges from "../pages/admin/Challenges.jsx";
import ValidationQueue from "../pages/admin/ValidationQueue.jsx";
import ChallengeReview from "../pages/admin/ChallengeReview.jsx";
import Institutes from "../pages/admin/Institutes.jsx";
import Industries from "../pages/admin/Industries.jsx";
import Matching from "../pages/admin/Matching.jsx";
import Projects from "../pages/admin/Projects.jsx";
import AdminAnalytics from "../pages/admin/AdminAnalytics.jsx";
import InstituteDashboard from "../pages/institute/InstituteDashboard.jsx";
import AssignedChallenges from "../pages/institute/AssignedChallenges.jsx";
import DiscoverChallenges from "../pages/institute/DiscoverChallenges.jsx";
import InstituteProjects from "../pages/institute/InstituteProjects.jsx";
import ProjectPage from "../pages/institute/ProjectPage.jsx";
import TeamManagement from "../pages/institute/TeamManagement.jsx";
import Proposal from "../pages/institute/Proposal.jsx";
import IndustryDashboard from "../pages/industry/IndustryDashboard.jsx";
import DiscoverProjects from "../pages/industry/DiscoverProjects.jsx";
import Partnerships from "../pages/industry/Partnerships.jsx";
import Funding from "../pages/industry/Funding.jsx";
import Mentorship from "../pages/industry/Mentorship.jsx";
import Pilots from "../pages/industry/Pilots.jsx";
import ProfilePage from "../pages/dashboard/ProfilePage.jsx";

function RequireRole({ role, children }) {
  const user = getUser();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== role) return <Navigate to={`/${user.role}`} replace />;
  return children;
}

const adminItems = [
  ["/admin","Overview",LayoutDashboard],["/admin/challenges","Challenges",Lightbulb],["/admin/validation","Validation Queue",FileCheck],
  ["/admin/institutes","Institutes",Building2],["/admin/industries","Industries",Factory],["/admin/matching","Matching",Handshake],
  ["/admin/projects","Projects",FolderKanban],["/admin/analytics","Analytics",BarChart3],["/admin/impact","Impact",ShieldCheck],
  ["/admin/notifications","Notifications",Bell],["/admin/settings","Settings",Settings]
].map(([to,label,icon])=>({to,label,icon}));
const instituteItems = [
  ["/institute","Dashboard",LayoutDashboard],["/institute/assigned","Assigned Challenges",FileCheck],["/institute/discover","Discover Challenges",Search],
  ["/institute/projects","My Projects",FolderKanban],["/institute/teams","Team Management",Users],["/institute/proposals","Proposals",Lightbulb],
  ["/institute/mentors","Mentors",Users],["/institute/milestones","Milestones",FileCheck],["/institute/research","Research Output",BarChart3],
  ["/institute/impact","Impact",ShieldCheck],["/institute/notifications","Notifications",Bell],["/institute/profile","Profile",Settings]
].map(([to,label,icon])=>({to,label,icon}));
const industryItems = [
  ["/industry","Dashboard",LayoutDashboard],["/industry/discover","Discover Projects",Search],["/industry/recommended","Recommended Projects",Lightbulb],
  ["/industry/partnerships","Partnerships",Handshake],["/industry/mentorship","Mentorship",Users],["/industry/funding","Funding",Wallet],
  ["/industry/pilots","Pilots",Factory],["/industry/impact","Impact",ShieldCheck],["/industry/notifications","Notifications",Bell],
  ["/industry/profile","Company Profile",Settings]
].map(([to,label,icon])=>({to,label,icon}));

export default function AppRoutes() {
  return <Routes>
    <Route element={<PublicLayout/>}>
      <Route path="/" element={<Landing/>}/>
      <Route path="/explore" element={<ExploreChallenges/>}/>
      <Route path="/challenges/:id" element={<ChallengeDetails/>}/>
      <Route path="/submit" element={<SubmitChallenge/>}/>
      <Route path="/how-it-works" element={<HowItWorks/>}/>
      <Route path="/login" element={<Login/>}/>
    </Route>
    <Route path="/admin" element={<RequireRole role="admin"><DashboardLayout title="Government Admin" items={adminItems}/></RequireRole>}>
      <Route index element={<AdminDashboard/>}/><Route path="challenges" element={<Challenges/>}/><Route path="validation" element={<ValidationQueue/>}/><Route path="review/:id" element={<ChallengeReview/>}/><Route path="institutes" element={<Institutes/>}/><Route path="industries" element={<Industries/>}/><Route path="matching" element={<Matching/>}/><Route path="projects" element={<Projects/>}/><Route path="analytics" element={<AdminAnalytics/>}/><Route path="impact" element={<AdminAnalytics/>}/><Route path="notifications" element={<Utility title="Admin Notifications"/>}/><Route path="settings" element={<Utility title="Admin Settings"/>}/>
    </Route>
    <Route path="/institute" element={<RequireRole role="institute"><DashboardLayout title="Institute Workspace" items={instituteItems}/></RequireRole>}>
      <Route index element={<InstituteDashboard/>}/><Route path="assigned" element={<AssignedChallenges/>}/><Route path="discover" element={<DiscoverChallenges/>}/><Route path="projects" element={<InstituteProjects/>}/><Route path="projects/:id" element={<ProjectPage/>}/><Route path="teams" element={<TeamManagement/>}/><Route path="proposals" element={<Proposal/>}/><Route path="mentors" element={<Utility title="Mentors" variant="mentor"/>}/><Route path="milestones" element={<Utility title="Milestones" variant="milestone"/>}/><Route path="research" element={<Utility title="Research Output" variant="research"/>}/><Route path="impact" element={<AdminAnalytics/>}/><Route path="notifications" element={<Utility title="Institute Notifications"/>}/><Route path="profile" element={<ProfilePage type="institute"/>}/>
    </Route>
    <Route path="/industry" element={<RequireRole role="industry"><DashboardLayout title="Industry Partner" items={industryItems}/></RequireRole>}>
      <Route index element={<IndustryDashboard/>}/><Route path="discover" element={<DiscoverProjects/>}/><Route path="recommended" element={<DiscoverProjects/>}/><Route path="partnerships" element={<Partnerships/>}/><Route path="mentorship" element={<Mentorship/>}/><Route path="funding" element={<Funding/>}/><Route path="pilots" element={<Pilots/>}/><Route path="impact" element={<AdminAnalytics/>}/><Route path="notifications" element={<Utility title="Industry Notifications"/>}/><Route path="profile" element={<ProfilePage type="industry"/>}/>
    </Route>
    <Route path="*" element={<Navigate to="/" replace/>}/>
  </Routes>;
}

function Utility({ title, variant }) {
  const map = {
    mentor: ["Faculty mentor pool: IoT, AI, public health, manufacturing and policy specialists.", "Mentor availability: 42 open slots across current challenge domains.", "Review cadence: fortnightly technical clinics and district check-ins."],
    milestone: ["Field survey complete for 12 projects.", "Prototype reviews scheduled with admin validation teams.", "Pilot readiness checklist active for 6 high-impact projects."],
    research: ["Research papers: 42 submitted or published.", "Patents filed: 18 provisional applications.", "Startups created: 7 incubated ventures."]
  };
  const rows = map[variant] || ["Actionable notification preferences and review summaries.", "Profile and operating details used in mock matching.", "Recent activity, approvals and collaboration notes."];
  return <div className="min-w-0"><h1 className="text-3xl font-semibold tracking-tight text-navy md:text-4xl">{title}</h1><div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">{rows.map((r,i)=><article key={r} className="rounded-2xl border bg-white p-6 shadow-sm"><span className="grid h-12 w-12 place-items-center rounded-2xl bg-blue/10 text-blue"><Wrench size={20}/></span><h2 className="mt-5 text-lg font-semibold text-navy">{r.split(":")[0]}</h2><p className="mt-3 text-sm leading-6 text-slate-600">{r}</p><button className="mt-6 w-full rounded-xl border px-4 py-2.5 text-sm font-semibold text-blue sm:w-auto">Update</button></article>)}</div></div>;
}
