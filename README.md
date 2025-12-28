# Interview Dashboard

A React application for tracking interviews taken by your team and managing their payments. Built with Vite and React.

## Features

- 👥 **Panelist Management**: Add, edit, and manage panelists with contact information
- 📝 **Interview Tracking**: Bulk add interviews by month with counts for all panelists
- 💰 **Payment Reports**: Automatic payment calculations based on interview counts and rates
- 🔍 **Filtering & Search**: Filter panelists by status and interview type
- 📋 **Interview Type Assignment**: Mark which interview types each panelist can take
- 💾 **Data Export/Import**: Export data to JSON file and import it back
- 📱 **Responsive Design**: Works on desktop and mobile devices

## Tech Stack

- **React 18** - UI framework
- **Vite** - Build tool
- **localStorage** - Browser storage (with JSON export/import for sharing)
- **CSS3** - Styling with dark mode support

## Getting Started

### Prerequisites

- Node.js 16+ and npm

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd interview-dashboard
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open [http://localhost:5173](http://localhost:5173) in your browser

## Usage

### Adding Panelists

1. Go to the "Panelists" tab
2. Click "+ Add Panelist"
3. Fill in:
   - Name and email (required)
   - Phone number and LinkedIn profile (optional)
   - Status (Active, Standby, or Inactive)
   - **Select which interview types this panelist can take** (required)
   - Set payment rates for each assigned interview type (SDE1, SDE2, NET, NET-2, Frontend)
4. Click "Add Panelist"

### Recording Interviews

1. Go to the "Interviews" tab
2. Select Year, Month, and Interview Type
3. **Only panelists who can take the selected interview type will be shown**
4. Enter counts for each panelist
5. Click "Record Interviews"

### Viewing Payments

1. Go to the "Payments" tab
2. Select Year and Month
3. View total payments and breakdown by panelist

### Exporting and Importing Data

- **Export**: Click "📥 Export Data" in the header to download all data as a JSON file
- **Import**: Click "📤 Import Data" in the header to upload a previously exported JSON file
- This allows you to share data between deployments or backup your data

## Data Storage

### Option 1: MongoDB (Recommended for Production)

The app now supports MongoDB for shared, persistent storage. See [MONGODB_SETUP.md](./MONGODB_SETUP.md) for setup instructions.

**Benefits:**
- ✅ Shared data across all users
- ✅ No manual file updates needed
- ✅ Persistent storage
- ✅ Better for production deployments

**To use MongoDB:**
1. Set up MongoDB (see MONGODB_SETUP.md)
2. Install server dependencies: `cd server && npm install`
3. Configure `.env` file in `server/` directory
4. Start the server: `npm run dev` (in server directory)
5. Update `src/App.jsx` to use `AppContext.mongodb.jsx` instead of `AppContext.jsx`

### Option 2: LocalStorage (Current Default)

- **Primary Storage**: Data is stored in browser's localStorage
- **Sharing Data**: Use Export/Import functionality to share data across deployments
- **Default Data**: Initial data structure is defined in `src/data/defaultData.json`
- **Updating Default Data**: See [UPDATE_DEFAULT_DATA.md](./UPDATE_DEFAULT_DATA.md) for instructions on updating `defaultData.json` with UI data

## Project Structure

```
interview-dashboard/
├── src/
│   ├── components/          # React components
│   │   ├── PanelistForm.jsx
│   │   ├── PanelistList.jsx
│   │   ├── InterviewTracker.jsx
│   │   ├── PaymentReport.jsx
│   │   └── DataManagement.jsx
│   ├── context/             # React Context for state management
│   │   └── AppContext.jsx
│   ├── data/                # Default data structure
│   │   └── defaultData.json
│   ├── App.jsx              # Main app component
│   └── main.jsx             # Entry point
└── package.json
```

## Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Import project in [Vercel](https://vercel.com)
3. Deploy!

### Deploy to Netlify

1. Push your code to GitHub
2. Import project in [Netlify](https://netlify.com)
3. Deploy!

**Note**: Since data is stored in localStorage, each user will have their own data. To share data across users, use the Export/Import functionality to distribute a JSON file.

## Key Features Explained

### Interview Type Assignment

Not all panelists take all types of interviews. When adding a panelist:
- Check the interview types they can take (SDE1, SDE2, NET, NET-2, Frontend)
- Only set payment rates for the types they're assigned to
- When recording interviews, only panelists who can take that type will appear

### Data Management

- **Export**: Creates a JSON file with all panelists and interviews
- **Import**: Replaces current data with imported data
- **Backup**: Regularly export your data as a backup
- **Sharing**: Export data and share the JSON file with your team

## License

MIT

## Support

For issues or questions, please open an issue on GitHub.
