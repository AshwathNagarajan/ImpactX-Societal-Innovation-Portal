import { Outlet } from "react-router-dom";
import Navbar from "../components/common/Navbar.jsx";
import Footer from "../components/common/Footer.jsx";
export default function PublicLayout() { return <div className="admin-route-shell flex min-h-screen flex-col"><Navbar/><main className="flex-1 bg-transparent"><Outlet/></main><Footer/></div>; }
