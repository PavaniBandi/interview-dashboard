import { useState } from "react";
import "./ProtectedPageModal.css";

// Build API URL based on environment (local vs production)
const buildApi = (path) => {
  const API_URL =
    typeof window !== "undefined" && window.location.hostname === "localhost"
      ? "http://localhost:5000"
      : "";

  if (API_URL === "") return `/api${path}`;
  return `${API_URL}/api${path}`;
};

const ProtectedPageModal = ({
  isOpen,
  pageName,
  onAccessGranted,
  onCancel,
}) => {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      // Verify code with backend instead of client-side check
      const response = await fetch(buildApi("/verify-access"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });

      const data = await response.json();

      if (response.ok && data.valid) {
        setCode("");
        setError("");
        onAccessGranted();
      } else {
        setError("Invalid code. Please try again.");
        setCode("");
      }
    } catch (err) {
      setError("Error verifying code. Please try again.");
      setCode("");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setCode("");
    setError("");
    onCancel();
  };

  if (!isOpen) return null;

  return (
    <div className="protected-modal-overlay">
      <div className="protected-modal">
        <div className="modal-header">
          <h2>Access Required</h2>
          <button
            className="modal-close-btn"
            onClick={handleCancel}
            title="Close"
          >
            ✕
          </button>
        </div>

        <div className="modal-body">
          <p>
            This page (<strong>{pageName}</strong>) is protected. Please enter
            the access code to continue.
          </p>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="access-code">Access Code:</label>
              <input
                type="password"
                id="access-code"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Enter code"
                maxLength="10"
                autoFocus
                disabled={isLoading}
              />
            </div>

            {error && <div className="error-message">{error}</div>}

            <div className="modal-actions">
              <button type="submit" className="btn-submit" disabled={isLoading}>
                {isLoading ? "Verifying..." : "Submit"}
              </button>
              <button
                type="button"
                className="btn-cancel"
                onClick={handleCancel}
                disabled={isLoading}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProtectedPageModal;
