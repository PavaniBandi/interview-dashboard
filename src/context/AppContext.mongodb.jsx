import { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import { normalizePanelist, normalizeInterview, getId } from '../utils/idHelper';

const AppContext = createContext();

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
};

export const AppProvider = ({ children }) => {
  const [panelists, setPanelists] = useState([]);
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load data from MongoDB on mount
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [panelistsData, interviewsData] = await Promise.all([
        api.getPanelists(),
        api.getInterviews(),
      ]);
      // Normalize IDs for compatibility
      setPanelists(panelistsData.map(normalizePanelist));
      setInterviews(interviewsData.map(normalizeInterview));
    } catch (err) {
      console.error('Error loading data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const addPanelist = async (panelist) => {
    try {
      const newPanelist = await api.createPanelist(panelist);
      const normalized = normalizePanelist(newPanelist);
      setPanelists([...panelists, normalized]);
      return normalized;
    } catch (err) {
      console.error('Error adding panelist:', err);
      throw err;
    }
  };

  const updatePanelist = async (id, updates) => {
    try {
      // Find the MongoDB _id
      const panelist = panelists.find(p => getId(p) === id);
      const mongoId = panelist?._id || id;
      const updated = await api.updatePanelist(mongoId, updates);
      const normalized = normalizePanelist(updated);
      setPanelists(panelists.map(p => getId(p) === id ? normalized : p));
      return normalized;
    } catch (err) {
      console.error('Error updating panelist:', err);
      throw err;
    }
  };

  const deletePanelist = async (id) => {
    try {
      // Find the MongoDB _id
      const panelist = panelists.find(p => getId(p) === id);
      const mongoId = panelist?._id || id;
      await api.deletePanelist(mongoId);
      setPanelists(panelists.filter(p => getId(p) !== id));
      setInterviews(interviews.filter(i => getId(i.panelistId) !== id));
    } catch (err) {
      console.error('Error deleting panelist:', err);
      throw err;
    }
  };

  const addInterview = async (interview) => {
    try {
      // Ensure panelistId uses MongoDB _id if available
      const panelist = panelists.find(p => getId(p) === interview.panelistId);
      const panelistId = panelist?._id || interview.panelistId;
      
      const newInterview = await api.createInterview({
        ...interview,
        panelistId,
        date: interview.date || new Date().toISOString().split('T')[0],
      });
      const normalized = normalizeInterview(newInterview);
      // Store with original panelistId for compatibility
      normalized.panelistId = interview.panelistId;
      setInterviews([...interviews, normalized]);
      return normalized;
    } catch (err) {
      console.error('Error adding interview:', err);
      throw err;
    }
  };

  const deleteInterview = async (id) => {
    try {
      // Find the MongoDB _id
      const interview = interviews.find(i => getId(i) === id);
      const mongoId = interview?._id || id;
      await api.deleteInterview(mongoId);
      setInterviews(interviews.filter(i => getId(i) !== id));
    } catch (err) {
      console.error('Error deleting interview:', err);
      throw err;
    }
  };

  const getInterviewsByMonth = (year, month) => {
    return interviews.filter(interview => {
      const interviewDate = new Date(interview.date);
      return interviewDate.getFullYear() === year && 
             interviewDate.getMonth() === month - 1;
    });
  };

  const calculatePayment = (panelistId, year, month) => {
    const panelist = panelists.find(p => getId(p) === panelistId);
    if (!panelist) return 0;

    const monthInterviews = getInterviewsByMonth(year, month).filter(
      i => getId(i.panelistId) === panelistId || i.panelistId === getId(panelist)
    );

    return monthInterviews.reduce((total, interview) => {
      const rates = panelist.paymentRates || {};
      const rateMap = rates instanceof Map ? Object.fromEntries(rates) : rates;
      const rate = rateMap[interview.type] || 0;
      return total + rate;
    }, 0);
  };

  const exportData = () => {
    const data = {
      panelists: panelists.map(p => ({
        ...p,
        _id: undefined,
        id: p._id || p.id,
        paymentRates: p.paymentRates instanceof Map 
          ? Object.fromEntries(p.paymentRates) 
          : p.paymentRates,
      })),
      interviews: interviews.map(i => ({
        ...i,
        _id: undefined,
        id: i._id || i.id,
      })),
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `interview-dashboard-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const importData = async (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const data = JSON.parse(e.target.result);
          
          // Import panelists
          if (data.panelists && Array.isArray(data.panelists)) {
            for (const panelist of data.panelists) {
              try {
                await api.createPanelist(panelist);
              } catch (err) {
                console.warn('Error importing panelist:', err);
              }
            }
          }
          
          // Import interviews
          if (data.interviews && Array.isArray(data.interviews)) {
            for (const interview of data.interviews) {
              try {
                await api.createInterview(interview);
              } catch (err) {
                console.warn('Error importing interview:', err);
              }
            }
          }
          
          // Reload data
          await loadData();
          resolve();
        } catch (error) {
          reject(new Error('Invalid JSON file'));
        }
      };
      reader.onerror = () => reject(new Error('Error reading file'));
      reader.readAsText(file);
    });
  };

  const value = {
    panelists,
    interviews,
    loading,
    error,
    addPanelist,
    updatePanelist,
    deletePanelist,
    addInterview,
    deleteInterview,
    getInterviewsByMonth,
    calculatePayment,
    exportData,
    importData,
    refreshData: loadData,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

