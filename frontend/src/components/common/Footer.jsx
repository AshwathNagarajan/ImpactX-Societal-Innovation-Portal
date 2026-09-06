export default function Footer({ compact = false }) {
  return (
    <footer className={`border-t border-white/10 bg-slate-950/80 ${compact ? "mt-10" : ""}`}>
      <div className={`mx-auto flex max-w-[1440px] flex-col gap-3 px-4 text-sm text-slate-400 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-10 xl:px-12 ${compact ? "py-5" : "py-8"}`}>
        <strong className="impact-gradient-text">IMPACTX</strong>
        <span>Societal Challenge & Innovation Platform for citizen-led impact.</span>
        <span>Copyright 2026 c Team AURRAA</span>
      </div>
    </footer>
  );
}
