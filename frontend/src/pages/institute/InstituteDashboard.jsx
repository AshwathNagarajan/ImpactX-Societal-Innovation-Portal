import { useEffect, useState } from "react";
import { GraduationCap, Handshake, Lightbulb, Medal, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getLifecycleProgress } from "../../utils/projectLifecycle.js";
import AIRecommendationCard from "../../components/ai/AIRecommendationCard.jsx";
import { useImpactData } from "../../hooks/useImpactData.js";
import KPICard from "../../components/dashboard/KPICard.jsx";
import ChallengeCard from "../../components/challenges/ChallengeCard.jsx";
import ProjectCard from "../../components/dashboard/ProjectCard.jsx";
import { instituteService } from "../../services/instituteService.js";

export default function InstituteDashboard() {
  const { data } = useImpactData();
  const navigate = useNavigate();
  const [assigned, setAssigned] = useState([]);
  const [requests, setRequests] = useState([]);
  const [recommended, setRecommended] = useState([]);
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    let active = true;
    Promise.all([
      instituteService.assignedChallenges(),
      instituteService.assignmentRequests(),
      instituteService.recommendedChallenges(),
      instituteService.projects(),
    ]).then(([assignedRes, requestRes, recommendedRes, projectRes]) => {
      if (!active) return;
      setAssigned(assignedRes.items || []);
      setRequests(requestRes.items || []);
      setRecommended(recommendedRes.items || []);
      setProjects(projectRes.items || []);
    }).catch(() => {});
    return () => { active = false; };
  }, []);

  const acceptedProjects = projects.filter((project) => getLifecycleProgress(project) < 100);
  const cards = [
    ["Recommended", recommended.length.toString(), "ready to request", Lightbulb],
    ["Requested", requests.filter((item) => item.status === "REQUESTED").length.toString(), "awaiting admin", Medal],
    ["Assigned", assigned.length.toString(), "approved by admin", GraduationCap],
    ["Accepted Projects", acceptedProjects.length.toString(), "in lifecycle", Users],
    ["Industry Collaborations", data.industries.length.toString(), "active", Handshake],
    ["Research Outputs", "11", "filed or published", Medal],
  ];
  const top = recommended[0] || data.challenges.find((challenge) => challenge.status === "Validated") || data.challenges[0];

  return (
    <div className="min-w-0 space-y-10">
      {top && <section>
        <div className="mb-6 flex flex-col gap-2">
          <p className="text-sm font-semibold text-blue">AI Challenge Matching</p>
          <h2 className="text-xl font-semibold text-navy md:text-2xl">Recommended For Your Institute</h2>
        </div>
        <AIRecommendationCard title={top.title} subtitle={`${top.category} | ${top.district} | ${top.priority || top.urgency || "Medium"} priority`} match={top.ai_match || 94} reason={top.why_recommended || "Open this challenge to request assignment from the admin review team."} tags={top.matching_expertise || ["AI", "IoT", top.category, "Field Research"].filter(Boolean)} actionLabel="View Matched Challenge" onAction={() => navigate(`/challenges/${top.challenge_id || top.id}`)} />
      </section>}
      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">{cards.map((card) => <KPICard key={card[0]} title={card[0]} value={card[1]} note={card[2]} icon={card[3]} />)}</div>
      <WorkflowSection title="Requested Challenges" empty="No assignment requests are waiting for admin review.">
        {requests.filter((item) => item.status === "REQUESTED").slice(0, 4).map((item) => <StatusCard key={item.id} title={item.challenge_id} body={item.comment || "Assignment request sent to admin."} status="Requested" />)}
      </WorkflowSection>
      <WorkflowSection title="Assigned Challenges" empty="No approved assignments yet.">
        {assigned.slice(0, 4).map((challenge) => <ChallengeCard key={challenge.challenge_id || challenge.id} challenge={{ ...challenge, id: challenge.challenge_id || challenge.id }} />)}
      </WorkflowSection>
      <WorkflowSection title="Accepted Projects" empty="Accept an assigned challenge to create a project workspace.">
        {acceptedProjects.slice(0, 4).map((project) => <ProjectCard key={project.project_id || project.id} project={project} />)}
      </WorkflowSection>
    </div>
  );
}

function WorkflowSection({ title, empty, children }) {
  const items = Array.isArray(children) ? children.filter(Boolean) : children;
  const hasItems = Array.isArray(items) ? items.length > 0 : Boolean(items);
  return <section><h2 className="mb-6 text-xl font-semibold text-navy md:text-2xl">{title}</h2>{hasItems ? <div className="grid gap-6 xl:grid-cols-2">{items}</div> : <div className="rounded-2xl border bg-white p-6 text-sm font-semibold text-slate-500 shadow-sm">{empty}</div>}</section>;
}

function StatusCard({ title, body, status }) {
  return <article className="rounded-2xl border bg-white p-6 shadow-sm"><span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue">{status}</span><h3 className="mt-4 text-lg font-semibold text-navy">{title}</h3><p className="mt-3 text-sm leading-6 text-slate-600">{body}</p></article>;
}
