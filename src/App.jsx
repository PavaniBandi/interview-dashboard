import { useState } from "react";
import { AppProvider, useApp } from "./context/AppContext";
import PanelistList from "./components/PanelistList";
import InterviewTracker from "./components/InterviewTracker";
import PaymentReport from "./components/PaymentReport";
import ProfitReport from "./components/ProfitReport";
import DataManagement from "./components/DataManagement";
import ProtectedPageModal from "./components/ProtectedPageModal";
import "./App.css";

function AppContent() {
  const [activeTab, setActiveTab] = useState("panelists");
  const [protectedModal, setProtectedModal] = useState({
    isOpen: false,
    page: null,
    requestedPage: null,
  });
  const { loading, apiError } = useApp();

  const PROTECTED_PAGES = ["payments", "profit"];

  const tabs = [
    { id: "panelists", label: "Panelists", icon: "👥" },
    { id: "interviews", label: "Interviews", icon: "📝" },
    { id: "payments", label: "Payments", icon: "💰" },
    { id: "profit", label: "Profit Report", icon: "📊" },
  ];

  const handleTabClick = (tabId) => {
    if (PROTECTED_PAGES.includes(tabId)) {
      setProtectedModal({
        isOpen: true,
        page: tabId,
        requestedPage: tabId,
      });
    } else {
      setActiveTab(tabId);
    }
  };

  const handleAccessGranted = () => {
    if (protectedModal.requestedPage) {
      setActiveTab(protectedModal.requestedPage);
    }
    setProtectedModal({ isOpen: false, page: null, requestedPage: null });
  };

  const handleAccessDenied = () => {
    setProtectedModal({ isOpen: false, page: null, requestedPage: null });
  };

  if (loading) {
    return (
      <div className="app">
        <header className="app-header">
          <h1 className="app-title">Interview Dashboard</h1>
          <p className="app-subtitle">Track interviews and manage payments</p>
        </header>
        <div
          style={{ textAlign: "center", padding: "60px 20px", color: "#666" }}
        >
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-content">
          <div>
            <h1 className="app-title">Interview Dashboard</h1>
            <p className="app-subtitle">Track interviews and manage payments</p>
          </div>
          <DataManagement />
        </div>
      </header>

      {apiError && (
        <div
          className="api-error-banner"
          style={{
            background: "#ffe6e6",
            color: "#900",
            padding: "8px 12px",
            textAlign: "center",
          }}
        >
          <strong>API Error:</strong> {apiError}. Ensure the backend is running
          and MONGODB_URI is set.
        </div>
      )}

      <nav className="app-nav">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`nav-tab ${activeTab === tab.id ? "active" : ""}`}
            onClick={() => handleTabClick(tab.id)}
          >
            <span className="nav-icon">{tab.icon}</span>
            <span className="nav-label">{tab.label}</span>
          </button>
        ))}
      </nav>

      <ProtectedPageModal
        isOpen={protectedModal.isOpen}
        pageName={
          tabs.find((t) => t.id === protectedModal.page)?.label || "Page"
        }
        onAccessGranted={handleAccessGranted}
        onCancel={handleAccessDenied}
      />

      <main className="app-main">
        {activeTab === "panelists" && <PanelistList />}
        {activeTab === "interviews" && <InterviewTracker />}
        {activeTab === "payments" && <PaymentReport />}
        {activeTab === "profit" && <ProfitReport />}
      </main>
    </div>
  );
}

function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App;
