import { useState } from "react";
import { useApp } from "../context/AppContext";
import PanelistForm from "./PanelistForm";
import "./PanelistList.css";

const INTERVIEW_TYPES = ["SDE1", "SDE2", "NET", "NET-2", "Frontend"];

const PanelistList = () => {
  const { panelists, deletePanelist, exportPanelists } = useApp();
  const [showForm, setShowForm] = useState(false);
  const [editingPanelist, setEditingPanelist] = useState(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [interviewTypeFilter, setInterviewTypeFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredPanelists = panelists.filter((panelist) => {
    const matchesStatus =
      statusFilter === "all" || panelist.status === statusFilter;
    const matchesType =
      interviewTypeFilter === "all" ||
      Object.keys(panelist.paymentRates || {}).includes(interviewTypeFilter);
    const matchesSearch =
      panelist.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      panelist.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (panelist.phone && panelist.phone.includes(searchQuery));
    return matchesStatus && matchesType && matchesSearch;
  });

  const handleEdit = (panelist) => {
    setEditingPanelist(panelist);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingPanelist(null);
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case "active":
        return "badge-active";
      case "standby":
        return "badge-standby";
      case "inactive":
        return "badge-inactive";
      default:
        return "";
    }
  };

  return (
    <div className="panelist-list-container">
      <div className="list-header">
        <h1>Panelists</h1>
        <div className="header-buttons">
          <button className="btn-primary" onClick={() => setShowForm(true)}>
            + Add Panelist
          </button>
          <button className="btn-secondary" onClick={exportPanelists}>
            📋 Export Panelists
          </button>
        </div>
      </div>

      <div className="filters">
        <div className="filter-group">
          <input
            type="text"
            placeholder="Search by name, email, or phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="filter-group">
          <label>Status:</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="filter-select"
          >
            <option value="all">All</option>
            <option value="active">Active</option>
            <option value="standby">Standby</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        <div className="filter-group">
          <label>Interview Type:</label>
          <select
            value={interviewTypeFilter}
            onChange={(e) => setInterviewTypeFilter(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Types</option>
            {INTERVIEW_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>
      </div>

      {filteredPanelists.length === 0 ? (
        <div className="empty-state">
          <p>No panelists found. Add your first panelist to get started!</p>
        </div>
      ) : (
        <div className="panelist-grid">
          {filteredPanelists.map((panelist) => (
            <div key={panelist._id} className="panelist-card">
              <div className="card-header">
                <div>
                  <h3>{panelist.name}</h3>
                  <p className="email">{panelist.email}</p>
                  {panelist.phone && (
                    <p className="phone">📞 {panelist.phone}</p>
                  )}
                  {panelist.linkedin && (
                    <p className="linkedin">
                      <a
                        href={panelist.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        🔗 LinkedIn Profile
                      </a>
                    </p>
                  )}
                </div>
                <span
                  className={`badge ${getStatusBadgeClass(panelist.status)}`}
                >
                  {panelist.status}
                </span>
              </div>

              <div className="panelist-capabilities">
                <h4>Can Take:</h4>
                {panelist.interviewTypes &&
                panelist.interviewTypes.length > 0 ? (
                  <div className="interview-types-tags">
                    {panelist.interviewTypes.map((type) => (
                      <span key={type} className="type-tag">
                        {type}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="no-types">No interview types assigned</p>
                )}
              </div>

              <div className="payment-rates">
                <h4>Payment Rates:</h4>
                {Object.keys(panelist.paymentRates || {}).length === 0 ? (
                  <p className="no-rates">No rates configured</p>
                ) : (
                  <ul>
                    {Object.entries(panelist.paymentRates || {}).map(
                      ([type, rate]) => (
                        <li key={type}>
                          <span className="type">{type}:</span>
                          <span className="rate">₹{rate.toFixed(2)}</span>
                        </li>
                      )
                    )}
                  </ul>
                )}
              </div>

              <div className="card-actions">
                <button
                  className="btn-edit"
                  onClick={() => handleEdit(panelist)}
                >
                  Edit
                </button>
                <button
                  className="btn-delete"
                  onClick={() => {
                    if (
                      window.confirm(
                        `Are you sure you want to delete ${panelist.name}?`
                      )
                    ) {
                      deletePanelist(panelist._id);
                    }
                  }}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <PanelistForm panelist={editingPanelist} onClose={handleCloseForm} />
      )}
    </div>
  );
};

export default PanelistList;
