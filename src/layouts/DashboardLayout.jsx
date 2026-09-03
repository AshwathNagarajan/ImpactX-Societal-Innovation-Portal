import { Outlet } from "react-router-dom";
import Sidebar from "../components/common/Sidebar.jsx";
import NotificationDropdown from "../components/common/NotificationDropdown.jsx";
export default function DashboardLayout({ title, items }) {
  return <div className="min-h-screen bg-light lg:flex"><Sidebar title={title} items={items}/><main className="min-w-0 flex-1"><header className="sticky top-0 z-20 flex items-center justify-end border-b border-slate-200 bg-white/90 px-4 py-3 backdrop-blur-xl sm:px-6 lg:px-8"><NotificationDropdown/></header><div className="mx-auto max-w-[1440px] px-4 py-6 pt-20 sm:px-6 md:py-8 lg:px-10 lg:py-10 lg:pt-10 xl:px-12"><Outlet/></div></main></div>;
}
