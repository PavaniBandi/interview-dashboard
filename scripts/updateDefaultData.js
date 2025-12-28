/**
 * Script to update defaultData.json from localStorage data
 * Run this script in the browser console after the app has been used
 * 
 * Instructions:
 * 1. Open your app in the browser
 * 2. Open browser DevTools (F12)
 * 3. Go to Console tab
 * 4. Copy and paste the code below, then press Enter
 * 5. Copy the output JSON
 * 6. Replace the content of src/data/defaultData.json with the output
 */

// Get data from localStorage
const panelists = JSON.parse(localStorage.getItem('interview-dashboard-panelists') || '[]');
const interviews = JSON.parse(localStorage.getItem('interview-dashboard-interviews') || '[]');

// Create the data structure
const data = {
  panelists,
  interviews
};

// Output as formatted JSON
console.log(JSON.stringify(data, null, 2));

// Also copy to clipboard if possible
if (navigator.clipboard) {
  navigator.clipboard.writeText(JSON.stringify(data, null, 2)).then(() => {
    console.log('\n✅ Data copied to clipboard!');
    console.log('Now paste it into src/data/defaultData.json');
  }).catch(err => {
    console.log('\n⚠️ Could not copy to clipboard. Please copy the JSON above manually.');
  });
} else {
  console.log('\n⚠️ Clipboard API not available. Please copy the JSON above manually.');
}

