import React, { useState, useEffect, useRef } from "react";
import SamudraAlertDashboard from "./pages/SamudraAlertDashboard";
import AnalystDashboard from "./pages/analyst";
import AdminDashboard from "./pages/admin";
import "./index.css";

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<
    "citizen" | "analyst" | "admin"
  >("citizen");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navRef = useRef<HTMLDivElement>(null);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleViewChange = (view: "citizen" | "analyst" | "admin") => {
    setCurrentView(view);
    setIsMobileMenuOpen(false); // Close menu when item is selected
  };

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(event.target as Node)) {
        setIsMobileMenuOpen(false);
      }
    };

    if (isMobileMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isMobileMenuOpen]);

  return (
    <div>
      {/* Navigation Bar */}
      <nav
        ref={navRef}
        style={{
          background: "#1e293b",
          padding: "1rem 2rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          position: "relative",
        }}
      >
        <h1 style={{ color: "white", margin: 0, fontSize: "1.25rem" }}>
          Samudra Network
        </h1>

        {/* Desktop Navigation */}
        <div className="desktop-nav">
          <button
            onClick={() => handleViewChange("citizen")}
            style={{
              padding: "0.5rem 1rem",
              border: "none",
              borderRadius: "4px",
              background: currentView === "citizen" ? "#3b82f6" : "transparent",
              color: "white",
              cursor: "pointer",
              fontSize: "0.875rem",
              transition: "all 0.3s ease",
            }}
          >
            Citizen Dashboard
          </button>
          <button
            onClick={() => handleViewChange("analyst")}
            style={{
              padding: "0.5rem 1rem",
              border: "none",
              borderRadius: "4px",
              background: currentView === "analyst" ? "#3b82f6" : "transparent",
              color: "white",
              cursor: "pointer",
              fontSize: "0.875rem",
              transition: "all 0.3s ease",
            }}
          >
            Analyst Dashboard
          </button>
          <button
            onClick={() => handleViewChange("admin")}
            style={{
              padding: "0.5rem 1rem",
              border: "none",
              borderRadius: "4px",
              background: currentView === "admin" ? "#3b82f6" : "transparent",
              color: "white",
              cursor: "pointer",
              fontSize: "0.875rem",
              transition: "all 0.3s ease",
            }}
          >
            Admin Dashboard
          </button>
        </div>

        {/* Mobile Hamburger Menu */}
        <button
          onClick={toggleMobileMenu}
          style={{
            display: "none",
            flexDirection: "column",
            justifyContent: "space-around",
            width: "24px",
            height: "24px",
            background: "transparent",
            border: "none",
            cursor: "pointer",
            padding: 0,
          }}
          className="mobile-menu-button"
        >
          <span
            style={{
              width: "100%",
              height: "2px",
              background: "white",
              transition: "all 0.3s ease",
              transform: isMobileMenuOpen
                ? "rotate(45deg) translate(6px, 6px)"
                : "none",
            }}
          />
          <span
            style={{
              width: "100%",
              height: "2px",
              background: "white",
              transition: "all 0.3s ease",
              opacity: isMobileMenuOpen ? 0 : 1,
            }}
          />
          <span
            style={{
              width: "100%",
              height: "2px",
              background: "white",
              transition: "all 0.3s ease",
              transform: isMobileMenuOpen
                ? "rotate(-45deg) translate(6px, -6px)"
                : "none",
            }}
          />
        </button>

        {/* Mobile Menu Dropdown */}
        <div className={`mobile-menu ${isMobileMenuOpen ? "open" : ""}`}>
          <button
            onClick={() => handleViewChange("citizen")}
            style={{
              padding: "0.75rem 1rem",
              border: "none",
              borderRadius: "4px",
              background: currentView === "citizen" ? "#3b82f6" : "transparent",
              color: "white",
              cursor: "pointer",
              fontSize: "0.875rem",
              textAlign: "left",
              transition: "all 0.3s ease",
              width: "100%",
            }}
            onMouseEnter={(e) => {
              if (currentView !== "citizen") {
                e.currentTarget.style.background = "#374151";
              }
            }}
            onMouseLeave={(e) => {
              if (currentView !== "citizen") {
                e.currentTarget.style.background = "transparent";
              }
            }}
          >
            Citizen Dashboard
          </button>
          <button
            onClick={() => handleViewChange("analyst")}
            style={{
              padding: "0.75rem 1rem",
              border: "none",
              borderRadius: "4px",
              background: currentView === "analyst" ? "#3b82f6" : "transparent",
              color: "white",
              cursor: "pointer",
              fontSize: "0.875rem",
              textAlign: "left",
              transition: "all 0.3s ease",
              width: "100%",
            }}
            onMouseEnter={(e) => {
              if (currentView !== "analyst") {
                e.currentTarget.style.background = "#374151";
              }
            }}
            onMouseLeave={(e) => {
              if (currentView !== "analyst") {
                e.currentTarget.style.background = "transparent";
              }
            }}
          >
            Analyst Dashboard
          </button>
          <button
            onClick={() => handleViewChange("admin")}
            style={{
              padding: "0.75rem 1rem",
              border: "none",
              borderRadius: "4px",
              background: currentView === "admin" ? "#3b82f6" : "transparent",
              color: "white",
              cursor: "pointer",
              fontSize: "0.875rem",
              textAlign: "left",
              transition: "all 0.3s ease",
              width: "100%",
            }}
            onMouseEnter={(e) => {
              if (currentView !== "admin") {
                e.currentTarget.style.background = "#374151";
              }
            }}
            onMouseLeave={(e) => {
              if (currentView !== "admin") {
                e.currentTarget.style.background = "transparent";
              }
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
