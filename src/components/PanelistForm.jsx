import { useState } from "react";
import { useApp } from "../context/AppContext";
import "./PanelistForm.css";

const INTERVIEW_TYPES = ["SDE1", "SDE2", "NET", "NET-2", "Frontend"];

const PanelistForm = ({ panelist = null, onClose }) => {
  const { addPanelist, updatePanelist } = useApp();
  const [formData, setFormData] = useState({
    name: panelist?.name || "",
    email: panelist?.email || "",
    phone: panelist?.phone || "",
    linkedin: panelist?.linkedin || "",
    status: panelist?.status || "active",
    paymentRates: panelist?.paymentRates || {},
    interviewTypes: panelist?.interviewTypes || [], // Array of interview types this panelist can take
  });

  const [rateInputs, setRateInputs] = useState(
    INTERVIEW_TYPES.reduce((acc, type) => {
      acc[type] = panelist?.paymentRates?.[type] || "";
      return acc;
    }, {})
  );

  const [selectedTypes, setSelectedTypes] = useState(
    panelist?.interviewTypes || []
  );

  const handleSubmit = (e) => {
    e.preventDefault();

    const paymentRates = {};
    INTERVIEW_TYPES.forEach((type) => {
      const rate = parseFloat(rateInputs[type]);
      if (!isNaN(rate) && rate > 0) {
        paymentRates[type] = rate;
      }
    });

    const panelistData = {
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      linkedin: formData.linkedin,
      status: formData.status,
      paymentRates,
      interviewTypes: selectedTypes, // Store which interview types this panelist can take
    };

    if (panelist) {
      updatePanelist(panelist._id, panelistData);
    } else {
      addPanelist(panelistData);
    }

    onClose();
  };

  const handleRateChange = (type, value) => {
    setRateInputs({ ...rateInputs, [type]: value });
  };

  const handleTypeToggle = (type) => {
    setSelectedTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  const handleStatusChange = (status) => {
    setFormData({ ...formData, status });
    // Clear interview types when switching to standby or inactive
    if (status === "standby" || status === "inactive") {
      setSelectedTypes([]);
    }
  };

  const isStandby = formData.status === "standby";
  const isInactive = formData.status === "inactive";
  const requiresInterviewTypes = formData.status === "active";

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{panelist ? "Edit Panelist" : "Add New Panelist"}</h2>
          <button className="close-btn" onClick={onClose}>
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="panelist-form">
          <div className="form-group">
            <label htmlFor="name">Name *</label>
            <input
              type="text"
              id="name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email *</label>
            <input
              type="email"
              id="email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="phone">Phone Number</label>
            <input
              type="tel"
              id="phone"
              value={formData.phone}
              onChange={(e) =>
                setFormData({ ...formData, phone: e.target.value })
              }
              placeholder="+91 1234567890"
            />
          </div>

          <div className="form-group">
            <label htmlFor="linkedin">LinkedIn Profile</label>
            <input
              type="url"
              id="linkedin"
              value={formData.linkedin}
              onChange={(e) =>
                setFormData({ ...formData, linkedin: e.target.value })
              }
              placeholder="https://linkedin.com/in/username"
            />
          </div>

          <div className="form-group">
            <label htmlFor="status">Status *</label>
            <select
              id="status"
              value={formData.status}
              onChange={(e) => handleStatusChange(e.target.value)}
              required
            >
              <option value="active">Active</option>
              <option value="standby">Standby</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          {requiresInterviewTypes && (
            <div className="form-group">
              <label>Interview Types This Panelist Can Take *</label>
              <div className="interview-types-checkboxes">
                {INTERVIEW_TYPES.map((type) => (
                  <label key={type} className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={selectedTypes.includes(type)}
                      onChange={() => handleTypeToggle(type)}
                    />
                    <span>{type}</span>
                  </label>
                ))}
              </div>
              {selectedTypes.length === 0 && (
                <p className="form-hint">
                  Please select at least one interview type
                </p>
              )}
            </div>
          )}

          {!requiresInterviewTypes && (
            <div className="form-group">
              <label>Interview Types This Panelist Can Take (Optional)</label>
              <div className="interview-types-checkboxes">
                {INTERVIEW_TYPES.map((type) => (
                  <label key={type} className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={selectedTypes.includes(type)}
                      onChange={() => handleTypeToggle(type)}
                    />
                    <span>{type}</span>
                  </label>
                ))}
              </div>
              <p className="form-hint-info">
                {isStandby &&
                  "Standby panelists don't need interview types assigned"}
                {isInactive &&
                  "Inactive panelists don't need interview types assigned"}
              </p>
            </div>
          )}

          <div className="form-group">
            <label>Payment Rates per Interview Type</label>
            <div className="rates-grid">
              {INTERVIEW_TYPES.map((type) => (
                <div key={type} className="rate-input">
                  <label htmlFor={`rate-${type}`}>
                    {type}
                    {requiresInterviewTypes &&
                      !selectedTypes.includes(type) && (
                        <span className="rate-disabled"> (not assigned)</span>
                      )}
                  </label>
                  <input
                    type="number"
                    id={`rate-${type}`}
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    value={rateInputs[type]}
                    onChange={(e) => handleRateChange(type, e.target.value)}
                    disabled={
                      requiresInterviewTypes && !selectedTypes.includes(type)
                    }
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="form-actions">
            <button type="button" onClick={onClose} className="btn-secondary">
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={requiresInterviewTypes && selectedTypes.length === 0}
            >
              {panelist ? "Update" : "Add"} Panelist
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PanelistForm;
