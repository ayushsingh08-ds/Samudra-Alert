import React, { useState } from "react";
import SamudraAlertDashboard from "./pages/SamudraAlertDashboard";
import AnalystDashboard from "./pages/analyst";
import AdminDashboard from "./pages/admin";
import "./index.css";

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<
    "citizen" | "analyst" | "admin"
  >("citizen");

  return (
    <div>
      {/* Navigation Bar */}
      <nav
        style={{
          background: "#1e293b",
          padding: "1rem 2rem",
          display: "flex",
          gap: "1rem",
          alignItems: "center",
        }}
      >
        <h1 style={{ color: "white", margin: 0, fontSize: "1.25rem" }}>
          Samudra Network
        </h1>
        <div style={{ display: "flex", gap: "0.5rem", marginLeft: "auto" }}>
          <button
            onClick={() => setCurrentView("citizen")}
            style={{
              padding: "0.5rem 1rem",
              border: "none",
              borderRadius: "4px",
              background: currentView === "citizen" ? "#3b82f6" : "transparent",
              color: "white",
              cursor: "pointer",
              fontSize: "0.875rem",
            }}
          >
            Citizen Dashboard
          </button>
          <button
            onClick={() => setCurrentView("analyst")}
            style={{
              padding: "0.5rem 1rem",
              border: "none",
              borderRadius: "4px",
              background: currentView === "analyst" ? "#3b82f6" : "transparent",
              color: "white",
              cursor: "pointer",
              fontSize: "0.875rem",
            }}
          >
            Analyst Dashboard
          </button>
          <button
            onClick={() => setCurrentView("admin")}
            style={{
              padding: "0.5rem 1rem",
              border: "none",
              borderRadius: "4px",
              background: currentView === "admin" ? "#3b82f6" : "transparent",
              color: "white",
              cursor: "pointer",
              fontSize: "0.875rem",
            }}
          >
            Admin Dashboard
          </button>
        </div>
      </nav>

      {/* Dashboard Content */}
      {currentView === "citizen" ? (
        <SamudraAlertDashboard />
      ) : currentView === "analyst" ? (
        <AnalystDashboard />
      ) : (
        <AdminDashboard />
      )}
    </div>
  );
};

export default App;
