import { Routes, Route, Navigate } from "react-router-dom";
import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import Dashboard from "./components/Dashboard";
import Login from "./pages/Login";
import Signup from "./pages/Signup";

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />

      {/* Main app layout only visible after login */}
      <Route
        path="/dashboard"
        element={
          <div className="app-layout">
            <Header />
            <div className="main-content">
              <Sidebar />
              <Dashboard />
            </div>
          </div>
        }
      />

      {/* Default route → redirect to login */}
      <Route path="*" element={<Navigate to="/login" />} />
    </Routes>
  );
}

export default App;
