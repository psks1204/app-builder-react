# ⚡ App Builder — Visual UI Builder for React

A **Figma-like drag-and-drop UI builder** that generates production-quality React code. Design your pages visually on an infinite canvas, then export clean React+MUI code with proper flexbox layout.

---

## Features

- **40+ MUI Components** — Buttons, TextFields, Cards, Drawers, Tables, Tabs, Steppers, Dialogs, and more
- **Infinite Canvas** — Pan/zoom, dot-grid background, desktop-sized device frame
- **Drag & Drop** — Drag components from the palette onto the canvas (powered by dnd-kit)
- **8-Handle Resize** — Resize any component from corners or edges
- **Container Nesting** — Drop components inside Card, Paper, Box, Stack, Grid, Container
- **Rich Property Editor** — Schema-driven props panel + full sx style editor (colors, spacing, borders, fonts, shadows, opacity)
- **Interactive Preview** — Full-screen preview with working Tabs, Drawers, Pagination, BottomNavigation, SpeedDial
- **Smart Code Export** — Generates clean React+MUI code with flex layout (bands, spacers, margins — no absolute positioning)
- **Save/Load Designs** — Save multiple named designs to the backend server, open and continue later
- **Keyboard Shortcuts** — Ctrl+Z undo, Ctrl+S save, Ctrl+D duplicate, Delete remove, and more
- **Auto-Save** — Saves to localStorage every 30 seconds
- **Dark/Light Theme** — Toggle the builder's own theme

---

## Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Frontend | React | 19.2.4 |
| UI Library | MUI (Material UI) | 7.3.8 |
| State Management | Zustand | 5.0.11 |
| Drag & Drop | @dnd-kit/core | 6.3.1 |
| Build Tool | Vite | 7.3.1 |
| Language | TypeScript | 5.9.3 |
| Backend | Express.js | 4.21.2 |
| Code Formatting | Prettier | 3.8.1 |

---

## Project Structure

```
app-builder/
├── index.html                          # Vite entry HTML
├── package.json                        # Frontend dependencies & scripts
├── tsconfig.json                       # TypeScript configuration
├── vite.config.ts                      # Vite config (dev proxy to backend)
│
├── server/                             # Backend API server
│   ├── index.js                        # Express REST API (port 4000)
│   ├── package.json                    # Server dependencies
│   └── designs/                        # Saved design JSON files
│
├── public/                             # Static assets
│
└── src/
    ├── main.tsx                        # React DOM entry point
    ├── App.tsx                         # Root component (theme, hooks)
    │
    ├── api/
    │   └── designsApi.ts              # Typed fetch client for backend API
    │
    ├── codegen/
    │   └── codeGenerator.ts           # Canvas → React+MUI code generator
    │
    ├── components/
    │   ├── canvas/
    │   │   ├── Canvas.tsx             # Infinite canvas (zoom, pan)
    │   │   ├── CanvasItem.tsx         # Node wrapper (drag, resize, select)
    │   │   ├── DeviceFrame.tsx        # Desktop frame rectangle
    │   │   └── GridOverlay.tsx        # Dot-grid background
    │   │
    │   ├── dialogs/
    │   │   ├── SaveDesignDialog.tsx   # Save/update design dialog
    │   │   └── OpenDesignDialog.tsx   # Open/delete design dialog
    │   │
    │   ├── layout/
    │   │   ├── AppHeader.tsx          # Top toolbar (actions, zoom, etc.)
    │   │   ├── LeftSidebar.tsx        # Component palette panel
    │   │   ├── MainLayout.tsx         # Root layout with DnD context
    │   │   └── RightSidebar.tsx       # Properties panel wrapper
    │   │
    │   ├── palette/
    │   │   ├── componentRegistry.ts   # Component metadata registry (38 types)
    │   │   └── PaletteItem.tsx        # Draggable palette tile
    │   │
    │   ├── preview/
    │   │   ├── ComponentRenderer.tsx  # Renders all component types
    │   │   ├── ExportModal.tsx        # Code export dialog
    │   │   └── PreviewModal.tsx       # Full-screen interactive preview
    │   │
    │   └── properties/
    │       └── PropertiesPanel.tsx     # Props editor + sx style editor
    │
    ├── hooks/
    │   ├── useAutoSave.ts             # Auto-save to localStorage
    │   └── useKeyboardShortcuts.ts    # Global keyboard shortcuts
    │
    ├── store/
    │   ├── types.ts                   # All TypeScript interfaces
    │   └── useBuilderStore.ts         # Zustand state management
    │
    ├── theme/
    │   └── theme.ts                   # MUI theme builder (dark/light)
    │
    └── utils/
        ├── idGenerator.ts             # UUID generator
        └── treeUtils.ts               # Immutable tree operations
```

---

## Getting Started

### Prerequisites

- **Node.js** 18+ (recommended 20+)
- **npm** 9+

### Installation

```bash
# Clone or download the project
cd app-builder

# Install frontend dependencies
npm install

# Install backend dependencies
cd server
npm install
cd ..
```

### Running in Development

You need **two terminals**:

```bash
# Terminal 1 — Start the backend API server
npm run server
# → ✅ App Builder API running on http://localhost:4000

# Terminal 2 — Start the Vite dev server
npm run dev
# → http://localhost:5173
```

The Vite dev server automatically proxies `/api/*` requests to the backend at `localhost:4000`.

### Building for Production

```bash
npm run build
```

Output goes to `dist/`. Serve with any static file server, but you still need the Express backend running for save/load functionality.

---

## How It Works

### 1. Drag & Drop
Components are dragged from the **left sidebar palette** onto the **canvas**. The `MainLayout.tsx` DnD context converts screen coordinates to canvas coordinates and creates a `CanvasNode` with the component's default props, size, and position.

### 2. Canvas
The infinite canvas supports **scroll-wheel zoom** (0.2x–3x), **middle-click pan**, and a **device frame** (configurable desktop size). Each node is rendered as a `CanvasItem` with drag-to-move and 8-handle resize.

### 3. Properties Panel
Selecting a node shows the **Properties Panel** on the right with:
- **Position & Size** — X, Y, Width, Height inputs
- **Props** — Schema-driven controls from `componentRegistry.ts` (text, number, select, boolean, color, slider, list)
- **Style (sx)** — Background color, text color, margins, padding, border, border-radius, font family/size/weight, box shadow, opacity

### 4. Preview
The **Preview Modal** renders all in-frame nodes at their canvas positions using `ComponentRenderer` in interactive mode — Tabs switch, Drawers expand/collapse, Pagination changes pages.

### 5. Code Export
The **Export Modal** generates production-quality React+MUI code:
- Builds a **containment tree** (components nested inside containers)
- Groups root nodes into **visual bands** (vertically overlapping items share a flex row)
- Uses **flexbox**, **margins**, **alignment**, and **flex spacers** — never absolute positioning
- Produces clean, idiomatic code that a real developer would write

### 6. Save/Load
Designs are saved to the **Express backend** as JSON files. Users can:
- **Save** with a custom name (Save as New or Update existing)
- **Open** any previously saved design from a list
- **Delete** designs they no longer need
- **Ctrl+S** quick-saves to both localStorage and the server

---

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/designs` | List all saved designs (id, name, dates, metadata) |
| `GET` | `/api/designs/:id` | Load a specific design with full state |
| `POST` | `/api/designs` | Create a new design |
| `PUT` | `/api/designs/:id` | Update an existing design |
| `DELETE` | `/api/designs/:id` | Delete a saved design |

---

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+Z` | Undo |
| `Ctrl+Shift+Z` / `Ctrl+Y` | Redo |
| `Ctrl+S` | Save (localStorage + server if connected) |
| `Ctrl+A` | Select all nodes |
| `Ctrl+D` | Duplicate selected node(s) |
| `Delete` / `Backspace` | Delete selected node(s) |
| `Escape` | Deselect |
| `Ctrl+=` | Zoom in |
| `Ctrl+-` | Zoom out |
| `Ctrl+0` | Reset zoom |

---

## Supported Components (38)

### Inputs
Button, IconButton, ButtonGroup, TextField, Select, Checkbox, Radio, Switch, Slider, Rating, Autocomplete, FAB

### Data Display
Typography, Avatar, Badge, Chip, Divider, List, Table, Tooltip, Image

### Surfaces
Card, Paper, Accordion

### Navigation
AppBar, Tabs, Breadcrumbs, Drawer, Pagination, Stepper, BottomNavigation, SpeedDial

### Feedback
Alert, Snackbar, Dialog, CircularProgress, LinearProgress, Skeleton

### Layout (Containers)
Box, Stack, Grid, Container

---

## License

Private / Internal Use
