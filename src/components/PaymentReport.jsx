import { useState } from "react";
import { useApp } from "../context/AppContext";
import "./PaymentReport.css";

const INTERVIEW_TYPES = ["SDE1", "SDE2", "NET", "NET-2", "Frontend"];

// Actual costs charged to client
const ACTUAL_COSTS = {
  SDE1: 1000,
  SDE2: 1500,
  NET: 1000,
  "NET-2": 1000,
  Frontend: 1200,
};

// X's payment per interview
const X_PAYMENT = {
  SDE1: 300,
  SDE2: 450,
  NET: 300,
  "NET-2": 300,
  Frontend: 0,
};

const PaymentReport = () => {
  const { panelists, interviews, getInterviewsByMonth, calculatePayment } =
    useApp();

  // Get previous month and year based on system date
  const today = new Date();
  const previousMonth = today.getMonth() === 0 ? 12 : today.getMonth();
  const previousYear =
    today.getMonth() === 0 ? today.getFullYear() - 1 : today.getFullYear();

  const [selectedYear, setSelectedYear] = useState(previousYear);
  const [selectedMonth, setSelectedMonth] = useState(previousMonth);
  const [selectedType, setSelectedType] = useState("");

  const years = Array.from(
    { length: 5 },
    (_, i) => new Date().getFullYear() - i
  );
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

  const monthInterviews = getInterviewsByMonth(selectedYear, selectedMonth);

  // Filter by interview type if selected
  const filteredInterviews = selectedType
    ? monthInterviews.filter((i) => i.type === selectedType)
    : monthInterviews;

  // Group interviews by panelist
  const panelistStats = panelists
    .map((panelist) => {
      const panelistInterviews = filteredInterviews.filter(
        (i) => i.panelistId === panelist._id
      );
      const interviewsByType = {};

      panelistInterviews.forEach((interview) => {
        interviewsByType[interview.type] =
          (interviewsByType[interview.type] || 0) + interview.count; // Use count from aggregated record
      });

      // Calculate payment based on filtered interviews
      let totalPayment = 0;
      panelistInterviews.forEach((interview) => {
        const rate = panelist.paymentRates?.[interview.type] || 0;
        totalPayment += rate * interview.count; // Multiply by count
      });

      const totalInterviews = panelistInterviews.reduce(
        (sum, i) => sum + i.count,
        0
      ); // Sum of all counts

      return {
        panelist,
        interviews: panelistInterviews,
        interviewsByType,
        totalInterviews,
        totalPayment,
      };
    })
    .filter((stat) => stat.totalInterviews > 0);

  const grandTotal = panelistStats.reduce(
    (sum, stat) => sum + stat.totalPayment,
    0
  );
  const totalInterviewCount = filteredInterviews.reduce(
    (sum, i) => sum + i.count,
    0
  ); // Sum counts instead of length

  // Calculate profit (same logic as ProfitReport)
  let totalClientRevenue = 0;
  let totalTax10Percent = 0;
  let totalAfterTax = 0;
  let totalXPayment = 0;

  filteredInterviews.forEach((interview) => {
    const clientRevenue = ACTUAL_COSTS[interview.type] * interview.count; // Multiply by count
    const tax10Percent = clientRevenue * 0.1;
    const afterTax = clientRevenue - tax10Percent;

    totalClientRevenue += clientRevenue;
    totalTax10Percent += tax10Percent;
    totalAfterTax += afterTax;
    totalXPayment += X_PAYMENT[interview.type] * interview.count; // Multiply by count
  });

  const profitAfterPayments = totalAfterTax - grandTotal - totalXPayment;
  const pavaniProfit = profitAfterPayments / 2;
  const yaminiProfit = profitAfterPayments / 2;

  return (
    <div className="payment-report-container">
      <div className="report-header">
        <h1>Payment Report</h1>
        <div className="date-selectors">
          <div className="selector-group">
            <label htmlFor="year">Year:</label>
            <select
              id="year"
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              className="selector"
            >
              {years.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>

          <div className="selector-group">
            <label htmlFor="month">Month:</label>
            <select
              id="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
              className="selector"
            >
              {months.map((month) => (
                <option key={month.value} value={month.value}>
                  {month.name}
                </option>
              ))}
            </select>
          </div>

          <div className="selector-group">
            <label htmlFor="type">Interview Type:</label>
            <select
              id="type"
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="selector"
            >
              <option value="">All Types</option>
              {INTERVIEW_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="summary-cards">
        <div className="summary-card">
          <h3>Total Interviews</h3>
          <p className="summary-value">{totalInterviewCount}</p>
        </div>
        <div className="summary-card">
          <h3>Total Payment</h3>
          <p className="summary-value">₹{grandTotal.toFixed(2)}</p>
        </div>
        <div className="summary-card">
          <h3>Panelists Involved</h3>
          <p className="summary-value">{panelistStats.length}</p>
        </div>
        <div className="summary-card profit-card">
          <h3>Pavani's Profit</h3>
          <p className="summary-value">₹{pavaniProfit.toFixed(2)}</p>
        </div>
        <div className="summary-card profit-card">
          <h3>Yamini's Profit</h3>
          <p className="summary-value">₹{yaminiProfit.toFixed(2)}</p>
        </div>
      </div>

      {panelistStats.length === 0 ? (
        <div className="empty-state">
          <p>
            No interviews recorded for {months[selectedMonth - 1].name}{" "}
            {selectedYear}
          </p>
        </div>
      ) : (
        <div className="payment-details">
          <h2>Payment Details by Panelist</h2>
          <div className="payment-table-container">
            <table className="payment-table">
              <thead>
                <tr>
                  <th>Panelist</th>
                  <th>Status</th>
                  <th>Interview Count</th>
                  <th>Breakdown by Type</th>
                  <th>Total Payment</th>
                </tr>
              </thead>
              <tbody>
                {panelistStats.map(
                  ({
                    panelist,
                    totalInterviews,
                    interviewsByType,
                    totalPayment,
                  }) => (
                    <tr key={panelist._id}>
                      <td>
                        <div className="panelist-info">
                          <strong>{panelist.name}</strong>
                          <span className="email">{panelist.email}</span>
                        </div>
                      </td>
                      <td>
                        <span className={`badge badge-${panelist.status}`}>
                          {panelist.status}
                        </span>
                      </td>
                      <td className="count-cell">{totalInterviews}</td>
                      <td>
                        <div className="type-breakdown">
                          {Object.keys(interviewsByType).length === 0 ? (
                            <span className="no-breakdown">-</span>
                          ) : (
                            Object.entries(interviewsByType).map(
                              ([type, count]) => {
                                const rate = panelist.paymentRates?.[type] || 0;
                                return (
                                  <div key={type} className="breakdown-item">
                                    <span className="breakdown-type">
                                      {type}:
                                    </span>
                                    <span className="breakdown-count">
                                      {count} × ₹{rate.toFixed(2)}
                                    </span>
                                  </div>
                                );
                              }
                            )
                          )}
                        </div>
                      </td>
                      <td className="payment-cell">
                        <strong>₹{totalPayment.toFixed(2)}</strong>
                      </td>
                    </tr>
                  )
                )}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan="3">
                    <strong>Grand Total</strong>
                  </td>
                  <td></td>
                  <td className="payment-cell">
                    <strong>₹{grandTotal.toFixed(2)}</strong>
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          <div className="profit-summary-section">
            <h2>Profit Summary</h2>
            <div className="profit-summary-cards">
              <div className="profit-summary-card pavani-card">
                <div className="card-header">
                  <h3>Pavani's Summary</h3>
                </div>
                <div className="card-content">
                  <div className="summary-row">
                    <span className="label">Interview Profit:</span>
                    <span className="value">₹{pavaniProfit.toFixed(2)}</span>
                  </div>
                  <div className="summary-row total-row">
                    <span className="label">Total Earnings:</span>
                    <span className="value total">
                      ₹{pavaniProfit.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="profit-summary-card yamini-card">
                <div className="card-header">
                  <h3>Yamini's Summary</h3>
                </div>
                <div className="card-content">
                  <div className="summary-row">
                    <span className="label">Interview Profit:</span>
                    <span className="value">₹{yaminiProfit.toFixed(2)}</span>
                  </div>
                  <div className="summary-row total-row">
                    <span className="label">Total Earnings:</span>
                    <span className="value total">
                      ₹{yaminiProfit.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="profit-calculation-breakdown">
              <h4>Profit Calculation Breakdown</h4>
              <div className="calculation-items">
                <div className="calc-item">
                  <span className="label">Total Client Revenue:</span>
                  <span className="value">
                    ₹{totalClientRevenue.toFixed(2)}
                  </span>
                </div>
                <div className="calc-item">
                  <span className="label">Less: 10% Tax:</span>
                  <span className="value">₹{totalTax10Percent.toFixed(2)}</span>
                </div>
                <div className="calc-item">
                  <span className="label">After Tax Amount:</span>
                  <span className="value">₹{totalAfterTax.toFixed(2)}</span>
                </div>
                <div className="calc-item">
                  <span className="label">Less: Panelist Payments:</span>
                  <span className="value">₹{grandTotal.toFixed(2)}</span>
                </div>
                <div className="calc-item">
                  <span className="label">Less: X's Payment:</span>
                  <span className="value">₹{totalXPayment.toFixed(2)}</span>
                </div>
                <div className="calc-item divider">
                  <span className="label">Total Profit (50-50 split):</span>
                  <span className="value">
                    ₹{profitAfterPayments.toFixed(2)}
                  </span>
                </div>
                <div className="calc-item final">
                  <span className="label">Each Person's Share:</span>
                  <span className="value">₹{pavaniProfit.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentReport;
