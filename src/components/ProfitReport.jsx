import { useState } from "react";
import { useApp } from "../context/AppContext";
import "./ProfitReport.css";

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
  Frontend: 0, // Not mentioned, defaulting to 0
};

const ProfitReport = () => {
  const { panelists, interviews, getInterviewsByMonth } = useApp();

  // Get previous month and year based on system date
  const today = new Date();
  const previousMonth = today.getMonth() === 0 ? 12 : today.getMonth();
  const previousYear =
    today.getMonth() === 0 ? today.getFullYear() - 1 : today.getFullYear();

  const [selectedYear, setSelectedYear] = useState(previousYear);
  const [selectedMonth, setSelectedMonth] = useState(previousMonth);

  const years = Array.from({ length: 3 }, (_, i) => 2025 + i);
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

  // Calculate financial breakdown
  let totalClientRevenue = 0;
  let totalTax10Percent = 0;
  let totalAfterTax = 0;
  let totalPanelistPayment = 0;
  let totalXPayment = 0;

  // First, calculate actual panelist payments based on their rates
  monthInterviews.forEach((interview) => {
    const panelist = panelists.find((p) => p._id === interview.panelistId);
    if (panelist) {
      const rate = panelist.paymentRates?.[interview.type] || 0;
      totalPanelistPayment += rate * interview.count; // Multiply by count
    }
  });

  // Group interviews by type
  const interviewsByType = {};
  monthInterviews.forEach((interview) => {
    if (!interviewsByType[interview.type]) {
      interviewsByType[interview.type] = [];
    }
    interviewsByType[interview.type].push(interview);
  });

  const typeBreakdown = INTERVIEW_TYPES.map((type) => {
    const typeInterviews = interviewsByType[type] || [];
    const count = typeInterviews.reduce((sum, i) => sum + i.count, 0); // Sum counts
    if (count === 0) return null;

    const clientRevenue = count * ACTUAL_COSTS[type];
    const tax10Percent = clientRevenue * 0.1;
    const afterTax = clientRevenue - tax10Percent;

    // Calculate actual panelist payment for this type
    let totalPanelistForType = 0;
    typeInterviews.forEach((interview) => {
      const panelist = panelists.find((p) => p._id === interview.panelistId);
      if (panelist) {
        const rate = panelist.paymentRates?.[interview.type] || 0;
        totalPanelistForType += rate * interview.count; // Multiply by count
      }
    });

    // X payment
    const xPaymentForType = count * X_PAYMENT[type];

    totalClientRevenue += clientRevenue;
    totalTax10Percent += tax10Percent;
    totalAfterTax += afterTax;
    totalXPayment += xPaymentForType;

    return {
      type,
      count,
      clientRevenue,
      tax10Percent,
      afterTax,
      totalPanelistForType,
      xPaymentForType,
    };
  }).filter(Boolean);

  // Calculate profit after panelist and X payments
  const profitAfterPayments =
    totalAfterTax - totalPanelistPayment - totalXPayment;
  const pavaniProfit = profitAfterPayments / 2;
  const yaminiProfit = profitAfterPayments / 2;

  return (
    <div className="profit-report-container">
      <div className="report-header">
        <h1>Profit Report & Financial Breakdown</h1>
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
        </div>
      </div>

      {monthInterviews.length === 0 ? (
        <div className="empty-state">
          <p>
            No interviews recorded for {months[selectedMonth - 1].name}{" "}
            {selectedYear}
          </p>
        </div>
      ) : (
        <>
          <div className="breakdown-section">
            <h2>Interview Breakdown by Type</h2>
            <div className="breakdown-table-container">
              <table className="breakdown-table">
                <thead>
                  <tr>
                    <th>Interview Type</th>
                    <th>Count</th>
                    <th>Client Cost Per</th>
                    <th>Total Revenue</th>
                    <th>10% Tax</th>
                    <th>After Tax (90%)</th>
                    <th>Panelist Payment (Actual)</th>
                    <th>X Payment</th>
                    <th>Your Share</th>
                  </tr>
                </thead>
                <tbody>
                  {typeBreakdown.map((breakdown) => (
                    <tr key={breakdown.type}>
                      <td>
                        <strong>{breakdown.type}</strong>
                      </td>
                      <td className="center">{breakdown.count}</td>
                      <td className="right">
                        ₹{ACTUAL_COSTS[breakdown.type].toFixed(2)}
                      </td>
                      <td className="right">
                        ₹{breakdown.clientRevenue.toFixed(2)}
                      </td>
                      <td className="right">
                        ₹{breakdown.tax10Percent.toFixed(2)}
                      </td>
                      <td className="right">
                        ₹{breakdown.afterTax.toFixed(2)}
                      </td>
                      <td className="right">
                        ₹{breakdown.totalPanelistForType.toFixed(2)}
                      </td>
                      <td className="right">
                        ₹{breakdown.xPaymentForType.toFixed(2)}
                      </td>
                      <td className="right profit">
                        ₹
                        {(
                          breakdown.afterTax -
                          breakdown.totalPanelistForType -
                          breakdown.xPaymentForType
                        ).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="summary-row">
                    <td>
                      <strong>TOTAL</strong>
                    </td>
                    <td className="center">
                      <strong>{monthInterviews.length}</strong>
                    </td>
                    <td></td>
                    <td className="right">
                      <strong>₹{totalClientRevenue.toFixed(2)}</strong>
                    </td>
                    <td className="right">
                      <strong>₹{totalTax10Percent.toFixed(2)}</strong>
                    </td>
                    <td className="right">
                      <strong>₹{totalAfterTax.toFixed(2)}</strong>
                    </td>
                    <td className="right">
                      <strong>₹{totalPanelistPayment.toFixed(2)}</strong>
                    </td>
                    <td className="right">
                      <strong>₹{totalXPayment.toFixed(2)}</strong>
                    </td>
                    <td className="right profit">
                      <strong>₹{profitAfterPayments.toFixed(2)}</strong>
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          <div className="profit-distribution-section">
            <h2>Profit Distribution</h2>
            <div className="profit-cards">
              <div className="profit-card">
                <div className="card-label">Total After Tax</div>
                <div className="card-value">₹{totalAfterTax.toFixed(2)}</div>
              </div>
              <div className="profit-card">
                <div className="card-label">Total Panelist Payment</div>
                <div className="card-value">
                  ₹{totalPanelistPayment.toFixed(2)}
                </div>
              </div>
              <div className="profit-card">
                <div className="card-label">Total X Payment</div>
                <div className="card-value">₹{totalXPayment.toFixed(2)}</div>
              </div>
            </div>

            <div className="profit-division">
              <h3>Profit Division (50-50 Split)</h3>
              <div className="profit-split-cards">
                <div className="split-card pavani">
                  <h4>Pavani's Share</h4>
                  <p className="amount">₹{pavaniProfit.toFixed(2)}</p>
                </div>
                <div className="split-card yamini">
                  <h4>Yamini's Share</h4>
                  <p className="amount">₹{yaminiProfit.toFixed(2)}</p>
                </div>
              </div>
              <div className="calculation-note">
                <p>
                  Profit Calculation: (After Tax Amount - Panelist Payments - X
                  Payments) ÷ 2
                </p>
                <p>
                  = (₹{totalAfterTax.toFixed(2)} - ₹
                  {totalPanelistPayment.toFixed(2)} - ₹
                  {totalXPayment.toFixed(2)}) ÷ 2
                </p>
                <p>
                  = ₹{profitAfterPayments.toFixed(2)} ÷ 2 = ₹
                  {pavaniProfit.toFixed(2)} each
                </p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ProfitReport;
