import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "../components/common/Sidebar.jsx";
import NotificationDropdown from "../components/common/NotificationDropdown.jsx";
export default function DashboardLayout({ title, items }) {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith("/admin");

  return <div className={`min-h-screen lg:flex ${isAdmin ? "admin-route-shell" : "bg-light"}`}>
    <Sidebar title={title} items={items} dark={isAdmin}/>
    <main className="min-w-0 flex-1 lg:ml-72">
      <header className={`sticky top-0 z-20 flex items-center justify-end border-b px-4 py-3 backdrop-blur-xl sm:px-6 lg:px-8 ${isAdmin ? "border-white/10 bg-slate-950/85" : "border-slate-200 bg-white/90"}`}>
        <NotificationDropdown/>
      </header>
      <div className="mx-auto max-w-[1440px] px-4 py-6 pt-20 sm:px-6 md:py-8 lg:px-10 lg:py-10 lg:pt-10 xl:px-12">
        <Outlet/>
      </div>
    </main>
  </div>;
}
