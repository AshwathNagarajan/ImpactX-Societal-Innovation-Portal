import { Outlet } from "react-router-dom";
import Navbar from "../components/common/Navbar.jsx";
import Footer from "../components/common/Footer.jsx";
export default function PublicLayout() { return <div className="admin-route-shell min-h-screen"><Navbar/><main className="bg-transparent"><Outlet/></main><Footer/></div>; }
