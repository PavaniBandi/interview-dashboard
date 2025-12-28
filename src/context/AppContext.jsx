import { createContext, useContext, useState, useEffect } from "react";
import * as XLSX from "xlsx";
import defaultData from "../data/defaultData.json";

const AppContext = createContext();

// For local development use http://localhost:5000
// For Vercel deployment, API routes are at /api
const API_URL =
  import.meta.env.VITE_API_URL ||
  (typeof window !== "undefined" && window.location.hostname === "localhost"
    ? "http://localhost:5000"
    : "/api");

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within AppProvider");
  }
  return context;
};

export const AppProvider = ({ children }) => {
  const [panelists, setPanelists] = useState([]);
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch data from MongoDB via API on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [panelistsRes, interviewsRes] = await Promise.all([
          fetch(`${API_URL}/panelists`),
          fetch(`${API_URL}/interviews`),
        ]);

        if (!panelistsRes.ok || !interviewsRes.ok) {
          throw new Error("Failed to fetch data from server");
        }

        const panelistsData = await panelistsRes.json();
        const interviewsData = await interviewsRes.json();

        setPanelists(panelistsData);
        setInterviews(interviewsData);
      } catch (error) {
        console.error("Error fetching data from MongoDB:", error);
        // Fallback to default data if API fails
        setPanelists(defaultData.panelists);
        setInterviews(defaultData.interviews);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const addPanelist = async (panelist) => {
    try {
      const response = await fetch(`${API_URL}/panelists`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(panelist),
      });

      if (!response.ok) throw new Error("Failed to add panelist");

      const newPanelist = await response.json();
      setPanelists([...panelists, newPanelist]);
      return newPanelist;
    } catch (error) {
      console.error("Error adding panelist:", error);
      throw error;
    }
  };

  const updatePanelist = async (id, updates) => {
    try {
      const response = await fetch(`${API_URL}/panelists/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });

      if (!response.ok) throw new Error("Failed to update panelist");

      const updatedPanelist = await response.json();
      setPanelists(panelists.map((p) => (p._id === id ? updatedPanelist : p)));
    } catch (error) {
      console.error("Error updating panelist:", error);
      throw error;
    }
  };

  const deletePanelist = async (id) => {
    try {
      const response = await fetch(`${API_URL}/panelists/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete panelist");

      setPanelists(panelists.filter((p) => p._id !== id));
      // Also remove associated interviews
      setInterviews(interviews.filter((i) => i.panelistId !== id));
    } catch (error) {
      console.error("Error deleting panelist:", error);
      throw error;
    }
  };

  const addInterview = async (interview) => {
    try {
      // Convert date to year and month
      const date = new Date(interview.date);
      const year = date.getFullYear();
      const month = date.getMonth() + 1;

      const interviewData = {
        panelistId: interview.panelistId,
        type: interview.type,
        year,
        month,
        count: 1,
      };

      const response = await fetch(`${API_URL}/interviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(interviewData),
      });

      if (!response.ok) throw new Error("Failed to add interview");

      const newInterview = await response.json();
      setInterviews((prev) => [...prev, newInterview]);
      return newInterview;
    } catch (error) {
      console.error("Error adding interview:", error);
      throw error;
    }
  };

  const addInterviews = async (interviewList) => {
    try {
      // Aggregate interviews by panelistId, type, year, month
      const interviewMap = new Map();
      interviewList.forEach((i) => {
        const date = new Date(i.date);
        const year = date.getFullYear();
        const month = date.getMonth() + 1;

        const key = `${i.panelistId}|${i.type}|${year}|${month}`;
        if (interviewMap.has(key)) {
          const existing = interviewMap.get(key);
          existing.count += 1;
        } else {
          interviewMap.set(key, {
            panelistId: i.panelistId,
            type: i.type,
            year,
            month,
            count: 1,
          });
        }
      });

      const aggregatedInterviews = Array.from(interviewMap.values());

      const response = await fetch(`${API_URL}/interviews/bulk`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ interviews: aggregatedInterviews }),
      });

      if (!response.ok) throw new Error("Failed to add interviews");

      const newInterviews = await response.json();
      setInterviews((prev) => [...prev, ...newInterviews]);
      return newInterviews;
    } catch (error) {
      console.error("Error adding interviews:", error);
      throw error;
    }
  };

  const deleteInterview = async (id) => {
    try {
      const response = await fetch(`${API_URL}/interviews/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete interview");

      setInterviews(interviews.filter((i) => i._id !== id));
    } catch (error) {
      console.error("Error deleting interview:", error);
      throw error;
    }
  };

  const deleteInterviews = async (ids) => {
    try {
      const response = await fetch(`${API_URL}/interviews/bulk-delete`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids }),
      });

      if (!response.ok) throw new Error("Failed to delete interviews");

      setInterviews(interviews.filter((i) => !ids.includes(i._id)));
    } catch (error) {
      console.error("Error deleting interviews:", error);
      throw error;
    }
  };

  const getInterviewsByMonth = (year, month) => {
    return interviews.filter((interview) => {
      return interview.year === year && interview.month === month;
    });
  };

  const calculatePayment = (panelistId, year, month) => {
    const panelist = panelists.find((p) => p._id === panelistId);
    if (!panelist) return 0;

    const monthInterviews = getInterviewsByMonth(year, month).filter(
      (i) => i.panelistId === panelistId
    );

    return monthInterviews.reduce((total, interview) => {
      const rate = panelist.paymentRates?.[interview.type] || 0;
      return total + rate * interview.count; // Multiply by count since each record is aggregated
    }, 0);
  };

  const exportData = (forDefaultData = false) => {
    const data = {
      panelists,
      interviews,
    };

    // If exporting for defaultData.json, don't add exportedAt
    if (!forDefaultData) {
      data.exportedAt = new Date().toISOString();
    }

    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = forDefaultData
      ? "defaultData.json"
      : `interview-dashboard-${new Date().toISOString().split("T")[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const exportPanelists = () => {
    // Prepare data for Excel - flatten panelist data for better spreadsheet format
    const excelData = panelists.map((panelist) => ({
      Name: panelist.name,
      Email: panelist.email,
      Phone: panelist.phone || "",
      LinkedIn: panelist.linkedin || "",
      Status: panelist.status,
      "SDE1 Rate": panelist.paymentRates?.SDE1 || "",
      "SDE2 Rate": panelist.paymentRates?.SDE2 || "",
      "NET Rate": panelist.paymentRates?.NET || "",
      "NET-2 Rate": panelist.paymentRates?.["NET-2"] || "",
      "Frontend Rate": panelist.paymentRates?.Frontend || "",
      "Interview Types": (panelist.interviewTypes || []).join(", "),
    }));

    // Create workbook and worksheet
    const ws = XLSX.utils.json_to_sheet(excelData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Panelists");

    // Set column widths
    const columnWidths = [25, 25, 15, 30, 12, 12, 12, 12, 12, 15, 20];
    ws["!cols"] = columnWidths.map((width) => ({ wch: width }));

    // Generate file and download
    const filename = `panelists-${new Date().toISOString().split("T")[0]}.xlsx`;
    XLSX.writeFile(wb, filename);
  };

  const importData = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target.result);
          if (data.panelists && Array.isArray(data.panelists)) {
            setPanelists(data.panelists);
          }
          if (data.interviews && Array.isArray(data.interviews)) {
            setInterviews(data.interviews);
          }
          resolve();
        } catch (error) {
          reject(new Error("Invalid JSON file"));
        }
      };
      reader.onerror = () => reject(new Error("Error reading file"));
      reader.readAsText(file);
    });
  };

  const value = {
    panelists,
    interviews,
    loading,
    addPanelist,
    updatePanelist,
    deletePanelist,
    addInterview,
    addInterviews,
    deleteInterview,
    deleteInterviews,
    getInterviewsByMonth,
    calculatePayment,
    exportData,
    exportPanelists,
    importData,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
