# How to Update defaultData.json

Since this is a browser-based application, data is stored in localStorage. To update `defaultData.json` with the current data from the UI, follow these steps:

## Method 1: Using Export Feature (Recommended)

1. **Export the data:**
   - Click the "📥 Export Data" button in the app header
   - A JSON file will be downloaded

2. **Update defaultData.json:**
   - Open the downloaded JSON file
   - Copy its contents
   - Replace the content of `src/data/defaultData.json` with the copied data
   - Save the file

## Method 2: Using Browser Console

1. **Open the app in your browser**

2. **Open Developer Tools:**
   - Press `F12` or right-click → Inspect
   - Go to the "Console" tab

3. **Run this code:**
   ```javascript
   const panelists = JSON.parse(localStorage.getItem('interview-dashboard-panelists') || '[]');
   const interviews = JSON.parse(localStorage.getItem('interview-dashboard-interviews') || '[]');
   const data = { panelists, interviews };
   console.log(JSON.stringify(data, null, 2));
   ```

4. **Copy the output:**
   - The JSON will be printed in the console
   - Copy the entire output

5. **Update the file:**
   - Open `src/data/defaultData.json`
   - Replace all content with the copied JSON
   - Save the file

## Method 3: Using the Update Script

1. **Open the app in your browser**

2. **Open Developer Tools Console (F12)**

3. **Copy and paste the code from `scripts/updateDefaultData.js`**

4. **Follow the instructions shown in the console**

## Important Notes

- **Browser Limitation**: Web browsers cannot directly write to files in your codebase for security reasons
- **LocalStorage**: All data is stored in the browser's localStorage
- **Deployment**: When deploying, users will start with `defaultData.json` as initial data, then their changes will be stored in their browser's localStorage
- **Sharing Data**: Use the Export/Import feature to share data between users or deployments

## Automatic Sync (Future Enhancement)

For automatic syncing, you would need:
- A backend server to handle file writes
- Or a database (like Firebase, Supabase, etc.)
- Or a file hosting service with API access

The current implementation uses localStorage for simplicity and works entirely client-side.

