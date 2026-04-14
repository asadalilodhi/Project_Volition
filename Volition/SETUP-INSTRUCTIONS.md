# Knowledge Void Dashboard - Setup Instructions

## Prerequisites
- Node.js 18+ installed
- npm or pnpm package manager

## Installation Steps

### 1. Extract the ZIP file
```bash
unzip knowledge-void-dashboard.zip
cd knowledge-void-dashboard
```

### 2. Install Dependencies

**Using npm:**
```bash
npm install
```

**Using pnpm (recommended for faster installation):**
```bash
pnpm install
```

### 3. Install Required 3D/External Libraries

These are the critical dependencies for the 3D canvas and routing:

```bash
npm install react-force-graph-3d three three-spritetext surrealdb
```

Or with pnpm:
```bash
pnpm add react-force-graph-3d three three-spritetext surrealdb
```

### 4. Verify React Version

This project REQUIRES React 18.3.1 (NOT React 19) for 3D library compatibility.

Check your installed version:
```bash
npm list react react-dom
```

You should see:
- react@18.3.1
- react-dom@18.3.1

### 5. Start Development Server

```bash
npm run dev
```

Or with pnpm:
```bash
pnpm dev
```

The app should open at `http://localhost:5173`

---

## Tech Stack

- **Framework:** Vite + React 18.3.1 + TypeScript
- **Styling:** Tailwind CSS v4.1
- **Routing:** React Router v7.13
- **3D Graphics:** Three.js + React-Force-Graph-3D
- **Database:** SurrealDB
- **Icons:** Lucide React
- **Fonts:** Syncopate, Share Tech Mono (Google Fonts)

---

## Project Structure

```
/src
  /app
    App.tsx                    # RouterProvider entry point
    routes.tsx                 # Route configuration
    /pages
      Dashboard.tsx            # Main dashboard (default route "/")
      VolitionScreen.tsx       # AI dialogue screen ("/volition")
      CalendarInteraction.tsx  # Calendar page ("/calendar")
      DocumentIngest.tsx       # Document page ("/document")
    /components
      ThreeDCanvasViewport.tsx # 3D Layer 0 canvas
      BottomHUD.tsx            # Bottom command HUD
      MonologueBanner.tsx      # Right-side banner (30vw)
      Navigation.tsx           # Top navigation component
      [other components...]
  /styles
    fonts.css                  # Google Fonts imports
    theme.css                  # Tailwind theme tokens
```

---

## Environment Variables (Optional)

If using SurrealDB backend, create a `.env` file:

```env
VITE_SURREALDB_URL=http://localhost:8000/rpc
VITE_SURREALDB_NAMESPACE=your_namespace
VITE_SURREALDB_DATABASE=your_database
```

---

## Troubleshooting

### Issue: "Cannot find module 'react-force-graph-3d'"
**Solution:** Run the installation command from Step 3 above

### Issue: React version conflicts
**Solution:** This project requires React 18.3.1. If you have React 19, downgrade:
```bash
npm install react@18.3.1 react-dom@18.3.1
```

### Issue: TypeScript errors with Three.js
**Solution:** Install type definitions:
```bash
npm install --save-dev @types/three
```

### Issue: Routing doesn't work
**Solution:** Make sure you're using `react-router` (not `react-router-dom`):
```bash
npm install react-router@7.13.0
```

---

## Additional Setup (Backend)

If you want to connect to SurrealDB:

1. Install SurrealDB: https://surrealdb.com/install
2. Start SurrealDB server:
```bash
surreal start --log trace --user root --pass root memory
```

3. Update API endpoints in your components to match your SurrealDB instance

---

## Features

- ✅ Full-screen 3D canvas background (Layer 0)
- ✅ Cyberpunk + Windows Vista glassmorphism aesthetic
- ✅ Zero rounded corners, strict monochromatic dark mode
- ✅ Terminal fonts (Syncopate, Share Tech Mono)
- ✅ Floating bottom HUD with liquid calendar interaction
- ✅ 30vw collapsible "Internal Monologue" banner
- ✅ Zen Mode toggle
- ✅ Volition AI dialogue screen
- ✅ Mobile responsive (PWA-ready)
- ✅ Drag-and-drop task/list reordering
- ✅ Node Inspector for 3D canvas interactions

---

## Build for Production

```bash
npm run build
```

Output will be in `/dist` directory.

---

## Support

For issues or questions, refer to:
- React: https://react.dev/
- Vite: https://vitejs.dev/
- Tailwind CSS v4: https://tailwindcss.com/
- Three.js: https://threejs.org/
- SurrealDB: https://surrealdb.com/
