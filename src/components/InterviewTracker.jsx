import { useState, useEffect } from "react";
import { useApp } from "../context/AppContext";
import "./InterviewTracker.css";

const INTERVIEW_TYPES = ["SDE1", "SDE2", "NET", "NET-2", "Frontend"];

const InterviewTracker = () => {
  const { panelists, interviews, addInterviews, deleteInterviews } = useApp();

  // Get previous month and year based on system date
  const today = new Date();
  const previousMonth = today.getMonth() === 0 ? 12 : today.getMonth();
  const previousYear =
    today.getMonth() === 0 ? today.getFullYear() - 1 : today.getFullYear();

  const [selectedMonth, setSelectedMonth] = useState(previousMonth);
  const [selectedYear, setSelectedYear] = useState(previousYear);
  const [selectedType, setSelectedType] = useState("");
  const [panelistCounts, setPanelistCounts] = useState({});
  const [isEditing, setIsEditing] = useState(false);
  const [editingInterviewIds, setEditingInterviewIds] = useState([]);

  // Filter panelists based on selected interview type
  const getAvailablePanelists = () => {
    const active = panelists.filter(
      (p) => p.status === "active" || p.status === "standby"
    );
    if (!selectedType) return active;
    // Only show panelists who can take the selected interview type
    // Standby panelists without interview types assigned are excluded
    return active.filter((p) => {
      // Standby panelists might not have interview types, so exclude them if they don't
      if (
        p.status === "standby" &&
        (!p.interviewTypes || p.interviewTypes.length === 0)
      ) {
        return false;
      }
      return p.interviewTypes && p.interviewTypes.includes(selectedType);
    });
  };

  const availablePanelists = getAvailablePanelists();

  const months = [
    { value: 1, name: "January" },
    { value: 2, name: "February" },
    { value: 3, name: "March" },
    { value: 4, name: "April" },
    { value: 5, name: "May" },
    { value: 6, name: "June" },
    { value: 7, name: "July" },
    { value: 8, name: "August" },
    { value: 9, name: "September" },
    { value: 10, name: "October" },
    { value: 11, name: "November" },
    { value: 12, name: "December" },
  ];

  const years = Array.from({ length: 3 }, (_, i) => 2025 + i);

  const handleCountChange = (panelistId, count) => {
    const numCount = parseInt(count) || 0;
    if (numCount < 0) return;
    setPanelistCounts({
      ...panelistCounts,
      [panelistId]: numCount,
    });
  };

  const handleBulkSubmit = async (e) => {
    e.preventDefault();
    if (!selectedType) {
      alert("Please select an interview type");
      return;
    }

    const hasAnyCount = Object.values(panelistCounts).some(
      (count) => count > 0
    );
    if (!hasAnyCount) {
      alert("Please enter at least one count");
      return;
    }

    // If editing, delete existing interviews first
    if (isEditing && editingInterviewIds.length > 0) {
      deleteInterviews(editingInterviewIds);
    }

    // Create date string for the first day of selected month
    const dateStr = `${selectedYear}-${String(selectedMonth).padStart(
      2,
      "0"
    )}-01`;

    // Create interview records for each panelist with count > 0
    let recordsCreated = 0;
    const interviewsToAdd = [];

    for (const [panelistId, count] of Object.entries(panelistCounts)) {
      if (count > 0) {
        // Create aggregated record with count
        interviewsToAdd.push({
          panelistId,
          type: selectedType,
          date: dateStr,
          count: count,
        });
        recordsCreated += count;
      }
    }

    // Add all interviews at once
    if (interviewsToAdd.length > 0) {
      addInterviews(interviewsToAdd);
    }

    alert(
      `Successfully ${
        isEditing ? "updated" : "recorded"
      } ${recordsCreated} interview(s) for ${
        months[selectedMonth - 1].name
      } ${selectedYear}`
    );

    // Reset form
    resetForm();
  };

  const resetForm = () => {
    setPanelistCounts({});
    setSelectedType("");
    setIsEditing(false);
    setEditingInterviewIds([]);
  };

  const handleEditForMonthType = (year, month, type) => {
    // Find all interviews for this month and type
    const monthInterviews = interviews.filter((interview) => {
      return (
        interview.year === year &&
        interview.month === month &&
        interview.type === type
      );
    });

    // Group by panelist and get counts (they're already aggregated)
    const counts = {};
    const interviewIds = [];

    monthInterviews.forEach((interview) => {
      counts[interview.panelistId] = interview.count; // Use the count directly
      interviewIds.push(interview._id);
    });

    // Set form state for editing
    setSelectedYear(year);
    setSelectedMonth(month);
    setSelectedType(type);
    setPanelistCounts(counts);
    setIsEditing(true);
    setEditingInterviewIds(interviewIds);

    // Scroll to form
    document
      .querySelector(".interview-form-section")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const getPanelistName = (id) => {
    const panelist = panelists.find((p) => p._id === id);
    return panelist ? panelist.name : "Unknown";
  };

  // Group interviews by month and type only (they're already aggregated)
  const groupedInterviews = interviews.reduce((acc, interview) => {
    const key = `${interview.year}-${interview.month}-${interview.type}`;

    if (!acc[key]) {
      acc[key] = {
        year: interview.year,
        month: interview.month,
        type: interview.type,
        count: 0,
        interviewIds: [],
      };
    }
    acc[key].count += interview.count; // Add the count from aggregated record
    acc[key].interviewIds.push(interview._id);
    return acc;
  }, {});

  const sortedGroupedInterviews = Object.values(groupedInterviews).sort(
    (a, b) => {
      if (a.year !== b.year) return b.year - a.year;
      if (a.month !== b.month) return b.month - a.month;
      return a.type.localeCompare(b.type);
    }
  );

  const handleDeleteGroup = (interviewIds) => {
    if (
      window.confirm(
        `Are you sure you want to delete ${interviewIds.length} interview record(s)?`
      )
    ) {
      deleteInterviews(interviewIds);
    }
  };

  // Update panelist counts when type changes
  useEffect(() => {
    if (selectedType && !isEditing) {
      setPanelistCounts({});
    }
  }, [selectedType, isEditing]);

  return (
    <div className="interview-tracker-container">
      <div className="tracker-header">
        <h1>Interview Tracker</h1>
      </div>

      <div className="tracker-content">
        <div className="interview-form-section">
          <h2>{isEditing ? "Edit Interviews" : "Bulk Add Interviews"}</h2>
          {isEditing && (
            <div className="edit-notice">
              <p>
                Editing interviews for {months[selectedMonth - 1].name}{" "}
                {selectedYear} - {selectedType}
              </p>
              <button
                type="button"
                onClick={resetForm}
                className="btn-cancel-edit"
              >
                Cancel Edit
              </button>
            </div>
          )}
          <form onSubmit={handleBulkSubmit} className="interview-form">
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="year">Year *</label>
                <select
                  id="year"
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                  required
                  disabled={isEditing}
                >
                  {years.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="month">Month *</label>
                <select
                  id="month"
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                  required
                  disabled={isEditing}
                >
                  {months.map((month) => (
                    <option key={month.value} value={month.value}>
                      {month.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="type">Interview Type *</label>
                <select
                  id="type"
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  required
                  disabled={isEditing}
                >
                  <option value="">Select Type</option>
                  {INTERVIEW_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="panelist-counts-section">
              <h3>Enter Interview Counts</h3>
              {!selectedType ? (
                <p className="no-panelists">
                  Please select an interview type first
                </p>
              ) : availablePanelists.length === 0 ? (
                <p className="no-panelists">
                  No panelists available for {selectedType} interviews. Add
                  panelists and assign them this interview type.
                </p>
              ) : (
                <div className="panelist-counts-grid">
                  {availablePanelists.map((panelist) => (
                    <div key={panelist._id} className="count-input-row">
                      <label htmlFor={`count-${panelist._id}`}>
                        {panelist.name}
                        <span className="panelist-status">
                          ({panelist.status})
                        </span>
                      </label>
                      <input
                        type="number"
                        id={`count-${panelist._id}`}
                        min="0"
                        value={panelistCounts[panelist._id] || ""}
                        onChange={(e) =>
                          handleCountChange(panelist._id, e.target.value)
                        }
                        placeholder="0"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            <button type="submit" className="btn-primary">
              {isEditing ? "Update Interviews" : "Record Interviews"}
            </button>
          </form>
        </div>

        <div className="interviews-list-section">
          <h2>Interview Records</h2>
          {sortedGroupedInterviews.length === 0 ? (
            <div className="empty-state">
              <p>
                No interviews recorded yet. Start tracking interviews above!
              </p>
            </div>
          ) : (
            <div className="interviews-table">
              <table>
                <thead>
                  <tr>
                    <th>Month</th>
                    <th>Type</th>
                    <th>Count</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedGroupedInterviews.map((group, index) => (
                    <tr key={index}>
                      <td>
                        {months[group.month - 1].name} {group.year}
                      </td>
                      <td>
                        <span className="type-badge">{group.type}</span>
                      </td>
                      <td className="count-cell">{group.count}</td>
                      <td>
                        <div className="action-buttons">
                          <button
                            className="btn-edit-bulk"
                            onClick={() =>
                              handleEditForMonthType(
                                group.year,
                                group.month,
                                group.type
                              )
                            }
                            title="Edit interviews for this month and type"
                          >
                            Edit
                          </button>
                          <button
                            className="btn-delete-small"
                            onClick={() =>
                              handleDeleteGroup(group.interviewIds)
                            }
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InterviewTracker;
