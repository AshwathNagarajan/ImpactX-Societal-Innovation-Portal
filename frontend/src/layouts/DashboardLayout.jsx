import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../components/common/Sidebar.jsx";
import NotificationDropdown from "../components/common/NotificationDropdown.jsx";
import AccountMenu from "../components/common/AccountMenu.jsx";
export default function DashboardLayout({ title, items }) {
  const isAdmin = true;
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return <div className="admin-route-shell min-h-screen lg:flex">
    <Sidebar title={title} items={items} dark={isAdmin} open={sidebarOpen} onClose={() => setSidebarOpen(false)}/>
    <main className="min-w-0 flex-1">
      <header className={`sticky top-0 z-20 flex min-h-[68px] items-center justify-between gap-3 border-b px-4 py-3 backdrop-blur-xl sm:px-6 lg:px-8 ${isAdmin ? "border-white/10 bg-slate-900/85" : "border-slate-200 bg-white/90"}`}>
        <div className={`min-w-0 transition duration-150 ${sidebarOpen ? "pointer-events-none opacity-0" : "opacity-100"}`}>
          <button type="button" onClick={() => setSidebarOpen(true)} className="group flex min-w-0 items-center gap-3 rounded-2xl px-2 py-1.5 text-left transition hover:bg-white/5" aria-label="Open navigation">
            <img src="/impactx-logo.png" alt="IMPACTX" className="h-10 w-10 shrink-0 rounded-xl bg-white object-contain p-1" />
            <div className="min-w-0">
              <p className="text-base font-semibold leading-5 tracking-tight text-white sm:text-lg">IMPACTX</p>
              <p className="truncate text-xs text-slate-400 sm:text-sm">{title}</p>
            </div>
          </button>
        </div>
        <div className="ml-auto flex shrink-0 items-center gap-3">
          <NotificationDropdown dark={isAdmin}/>
          <AccountMenu title={title} dark={isAdmin}/>
        </div>
      </header>
      <div className="mx-auto max-w-[1440px] px-4 py-6 pt-20 sm:px-6 md:py-8 lg:px-10 lg:py-10 lg:pt-10 xl:px-12">
        <Outlet/>
      </div>
    </main>
  </div>;
}
