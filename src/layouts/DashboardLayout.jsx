import { Outlet } from "react-router-dom";
import Sidebar from "../components/common/Sidebar.jsx";
import NotificationDropdown from "../components/common/NotificationDropdown.jsx";
export default function DashboardLayout({ title, items }) {
  return <div className="min-h-screen bg-light lg:flex"><Sidebar title={title} items={items}/><main className="min-w-0 flex-1"><header className="sticky top-0 z-20 flex items-center justify-end border-b bg-[#08111f]/85 px-4 py-3 backdrop-blur-xl"><NotificationDropdown/></header><div className="p-4 pt-16 lg:p-8 lg:pt-8"><Outlet/></div></main></div>;
}
