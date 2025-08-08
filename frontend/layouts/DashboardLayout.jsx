import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import "../styles/index.css";

function DashboardLayout({ children }) {
  return (
    <div className="app-layout">
      <Header />
      <div className="main-content">
        <Sidebar />
        {children}
      </div>
    </div>
  );
}

export default DashboardLayout;
