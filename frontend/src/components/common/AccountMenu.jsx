import { LogOut, Settings, UserCircle } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { getUser, logout } from "../../utils/auth.js";
import { useDismissiblePopover } from "../../hooks/useDismissiblePopover.js";

export default function AccountMenu({ title, dark = false }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { open, setOpen, ref } = useDismissiblePopover();
  const user = getUser();
  const root = location.pathname.startsWith("/admin") ? "/admin" : location.pathname.startsWith("/industry") ? "/industry" : "/institute";
  const profilePath = root === "/admin" ? "/admin/settings" : `${root}/profile`;
  const settingsPath = root === "/admin" ? "/admin/settings" : `${root}/profile`;

  const signOut = () => {
    logout();
    navigate("/login");
  };

  const go = (path) => {
    setOpen(false);
    navigate(path);
  };

  return (
    <div ref={ref} className="relative">
      <button type="button" onClick={() => setOpen((value) => !value)} className={`flex items-center gap-3 rounded-xl border px-3 py-2 shadow-sm ${dark ? "border-white/10 bg-white/5 text-slate-100 hover:bg-white/10" : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"}`} aria-expanded={open}>
        <UserCircle size={21} className={dark ? "text-slate-300" : "text-slate-500"} />
        <span className="hidden text-left sm:block">
          <span className={`block text-sm font-semibold leading-4 ${dark ? "text-white" : "text-navy"}`}>{user?.name || "Demo User"}</span>
          <span className={`text-xs ${dark ? "text-slate-400" : "text-slate-500"}`}>{title}</span>
        </span>
      </button>
      {open && <div className={`absolute right-0 z-50 mt-3 w-72 rounded-2xl border p-3 shadow-xl ${dark ? "border-white/10 bg-slate-800 text-slate-100" : "border-slate-200 bg-white text-slate-700"}`}>
        <div className={`rounded-xl p-3 ${dark ? "bg-white/5" : "bg-slate-50"}`}>
          <p className={`text-sm font-semibold ${dark ? "text-white" : "text-navy"}`}>{user?.name || "Demo User"}</p>
          <p className={`mt-1 break-words text-xs ${dark ? "text-slate-400" : "text-slate-500"}`}>{user?.email || "demo@impactx.in"}</p>
        </div>
        <button onClick={() => go(profilePath)} className={`mt-2 flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium ${dark ? "text-slate-200 hover:bg-white/10" : "text-slate-700 hover:bg-slate-50"}`}><UserCircle size={17}/> Profile</button>
        <button onClick={() => go(settingsPath)} className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium ${dark ? "text-slate-200 hover:bg-white/10" : "text-slate-700 hover:bg-slate-50"}`}><Settings size={17}/> Settings</button>
        <button onClick={signOut} className={`mt-1 flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-semibold ${dark ? "text-red-300 hover:bg-red-500/10" : "text-red-600 hover:bg-red-50"}`}><LogOut size={17}/> Logout</button>
      </div>}
    </div>
  );
}
