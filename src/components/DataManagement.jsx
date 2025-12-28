import { useApp } from "../context/AppContext";
import "./DataManagement.css";

const DataManagement = () => {
  const { exportData } = useApp();

  const handleExportForDefaultData = () => {
    exportData(true);
    alert(
      "defaultData.json file downloaded!\n\nTo update the source file:\n1. Open the downloaded defaultData.json\n2. Copy its contents\n3. Replace src/data/defaultData.json with the copied content\n4. Save the file"
    );
  };

  return (
    <div className="data-management">
      <button
        onClick={handleExportForDefaultData}
        className="btn-export-default"
        title="Export data as defaultData.json format"
      >
        💾 Export for defaultData.json
      </button>
    </div>
  );
};

export default DataManagement;
