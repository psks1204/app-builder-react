# App Builder — Developer Documentation

> **For:** Human developers who want to understand, maintain, modify, or extend this project.

---

## Table of Contents

1. [Architecture Overview](#1-architecture-overview)
2. [Data Flow — How Everything Connects](#2-data-flow--how-everything-connects)
3. [The CanvasNode — The Core Data Model](#3-the-canvasnode--the-core-data-model)
4. [Component Lifecycle — From Palette to Export](#4-component-lifecycle--from-palette-to-export)
5. [File-by-File Reference](#5-file-by-file-reference)
6. [How to Add a New Component](#6-how-to-add-a-new-component)
7. [How to Modify an Existing Component](#7-how-to-modify-an-existing-component)
8. [How to Change the Styling System](#8-how-to-change-the-styling-system)
9. [How to Change the UI Library](#9-how-to-change-the-ui-library)
10. [How to Add New Features](#10-how-to-add-new-features)
11. [Backend API Reference](#11-backend-api-reference)
12. [State Management Deep Dive](#12-state-management-deep-dive)
13. [Code Generator Deep Dive](#13-code-generator-deep-dive)
14. [Troubleshooting](#14-troubleshooting)

---

## 1. Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                    App (React 19)                        │
│  ┌─────────────┐  ┌──────────────┐  ┌────────────────┐ │
│  │ Left Sidebar │  │   Canvas     │  │ Right Sidebar  │ │
│  │  (Palette)   │  │  (CanvasItem │  │ (Properties    │ │
│  │              │  │   per node)  │  │  Panel)        │ │
│  └──────┬───────┘  └──────┬───────┘  └───────┬────────┘ │
│         │                 │                   │          │
│         ▼                 ▼                   ▼          │
│  ┌─────────────────────────────────────────────────────┐│
│  │            Zustand Store (useBuilderStore)           ││
│  │  canvasNodes[] | selectedNodeIds | viewport | ...   ││
│  └────────────────────────┬────────────────────────────┘│
│                           │                              │
│         ┌─────────────────┼──────────────────┐          │
│         ▼                 ▼                   ▼          │
│  ┌────────────┐  ┌────────────────┐  ┌──────────────┐  │
│  │  Preview    │  │ Code Generator │  │  REST API    │  │
│  │  Modal      │  │ (Export)       │  │  (Save/Load) │  │
│  └────────────┘  └────────────────┘  └──────┬───────┘  │
│                                              │          │
└──────────────────────────────────────────────┼──────────┘
                                               │
                                    ┌──────────▼──────────┐
                                    │  Express Server     │
                                    │  (port 4000)        │
                                    │  JSON file storage  │
                                    └─────────────────────┘
```

**Key principle:** The Zustand store is the single source of truth. Every component reads from and writes to the store. There's no prop drilling beyond one level.

---

## 2. Data Flow — How Everything Connects

### Drag & Drop Flow
```
PaletteItem (useDraggable)
    ↓  drag starts
MainLayout (DndContext: onDragStart)
    ↓  stores active component type
MainLayout (DndContext: onDragEnd)
    ↓  converts screen coords → canvas coords
    ↓  looks up ComponentMeta from registry
    ↓  creates CanvasNode with defaults
useBuilderStore.addNode(node)
    ↓  adds to canvasNodes[]
Canvas re-renders
    ↓  maps canvasNodes → CanvasItem components
CanvasItem renders ComponentRenderer
```

### Editing Flow
```
User clicks CanvasItem
    ↓
useBuilderStore.selectNode(id)
    ↓
RightSidebar sees selectedNodeIds.size === 1
    ↓
PropertiesPanel renders with selected node's props/sx
    ↓
User changes a prop value
    ↓
useBuilderStore.updateNodeProps(id, { label: 'New' })
    ↓
CanvasItem re-renders with new props
```

### Export Flow
```
User clicks Export button
    ↓
ExportModal opens
    ↓
useBuilderStore.getNodesInFrame()
    ↓  filters nodes overlapping device frame
codeGenerator.generateReactCode(nodes, frame)
    ↓  builds containment tree
    ↓  groups into visual bands
    ↓  generates JSX with flex layout
    ↓  generates import statements
Returns React code string
    ↓
ExportModal displays code with copy/download
```

### Save/Load Flow
```
User clicks Save → SaveDesignDialog opens
    ↓
User enters name → clicks Save
    ↓
store.getStateSnapshot() → { canvasNodes, deviceFrame, themeMode }
    ↓
API: POST /api/designs { name, state }
    ↓
Server writes JSON file to server/designs/{uuid}.json
    ↓
store.setCurrentDesign(id, name)

User clicks Open → OpenDesignDialog opens
    ↓
API: GET /api/designs → list of summaries
    ↓
User clicks a design
    ↓
API: GET /api/designs/:id → full state
    ↓
store.loadDesignState(data.state)
    ↓
Canvas re-renders with loaded nodes
```

---

## 3. The CanvasNode — The Core Data Model

Every component on the canvas is a `CanvasNode`:

```typescript
interface CanvasNode {
  id: string;            // UUID — unique identifier
  type: string;          // Component type key: 'Button', 'Card', 'TextField', etc.
  props: Record<string, unknown>;  // Component-specific props (label, variant, color, etc.)
  sx: Record<string, unknown>;     // MUI sx styles (bgcolor, padding, margin, etc.)
  position: Position;    // { x: number, y: number } — canvas coordinates (px)
  size: ComponentSize;   // { width: number, height: number } — dimensions (px)
  children: CanvasNode[];  // Nested children (for containers)
  parentId: string | null; // Parent container ID (if nested)
  isContainer: boolean;    // Whether other nodes can be dropped inside
  zIndex: number;          // Rendering order
  locked: boolean;         // Prevents editing (not currently used in UI)
}
```

**Where `type` is used:**
- `componentRegistry.ts` — defines metadata for each type
- `ComponentRenderer.tsx` — switches on type to render the right component
- `codeGenerator.ts` — switches on type to generate the right JSX code
- `PropertiesPanel.tsx` — uses type to look up prop schema from registry
- `MainLayout.tsx` — uses type from the palette to create new nodes

**Where `props` come from:**
- Initial values: `componentRegistry.ts` → `defaultProps`
- User edits: `PropertiesPanel.tsx` → `updateNodeProps()`
- The props object is open-ended — any key/value pair is allowed

**Where `sx` comes from:**
- Initial values: `componentRegistry.ts` → `defaultSx` (usually empty `{}`)
- User edits: `PropertiesPanel.tsx` SxEditor → `updateNodeSx()`
- Used in rendering: `ComponentRenderer.tsx` applies as MUI `sx` prop
- Used in code gen: `codeGenerator.ts` → `sxToInline()` serializes to JSX

---

## 4. Component Lifecycle — From Palette to Export

### Phase 1: Registration (`componentRegistry.ts`)

Every component type must be registered here with:

| Field | Purpose | Example |
|-------|---------|---------|
| `type` | Unique string key | `'Button'` |
| `displayName` | Shown in palette | `'Button'` |
| `category` | Palette grouping | `'Inputs'` |
| `icon` | MUI icon name for palette | `'SmartButton'` |
| `defaultProps` | Initial prop values | `{ label: 'Click Me', variant: 'contained' }` |
| `defaultSx` | Initial style values | `{}` |
| `defaultSize` | Initial dimensions | `{ width: 120, height: 40 }` |
| `isContainer` | Can contain children? | `false` |
| `propSchema` | Prop editor controls | `[{ name: 'label', type: 'text', ... }]` |

### Phase 2: Palette Display (`LeftSidebar.tsx` → `PaletteItem.tsx`)

- `LeftSidebar` groups registry entries by category into accordions
- Each `PaletteItem` shows the icon + name and is a dnd-kit `useDraggable`
- Icon resolution: `PaletteItem` imports ALL MUI icons and resolves by name string

### Phase 3: Drop onto Canvas (`MainLayout.tsx`)

- `onDragEnd` creates a `CanvasNode` from the registry metadata
- Position is calculated by converting screen coordinates to canvas coordinates (accounting for zoom + pan)
- Node is added to the store via `addNode()`

### Phase 4: Canvas Rendering (`Canvas.tsx` → `CanvasItem.tsx` → `ComponentRenderer.tsx`)

- `Canvas` maps `canvasNodes[]` to `CanvasItem` components
- `CanvasItem` handles drag-to-move, 8-handle resize, selection highlight
- Inside each `CanvasItem`, `ComponentRenderer` renders the actual component

### Phase 5: Property Editing (`PropertiesPanel.tsx`)

- Reads the selected node from the store
- Looks up `propSchema` from registry
- Renders appropriate form controls for each schema field
- On change, calls `updateNodeProps()` or `updateNodeSx()`

### Phase 6: Preview (`PreviewModal.tsx` → `ComponentRenderer.tsx`)

- Renders all in-frame nodes at their canvas positions (absolute positioning)
- Uses `ComponentRenderer` in `interactive` mode — enables state management for tabs, drawers, pagination, etc.

### Phase 7: Code Export (`ExportModal.tsx` → `codeGenerator.ts`)

- Calls `generateReactCode(nodes, frame)`
- Builds a containment tree from canvas positions (which components are inside which containers)
- Groups root nodes into "bands" (vertically overlapping items share a flex row)
- Generates clean React+MUI code with proper imports

---

## 5. File-by-File Reference

### Core Files (Where Most Logic Lives)

| File | Lines | What It Does | When You'd Change It |
|------|-------|-------------|---------------------|
| `src/components/palette/componentRegistry.ts` | 675 | Defines ALL 38 component types with metadata | Adding/removing/modifying component types |
| `src/components/preview/ComponentRenderer.tsx` | 750 | Renders any component type to actual React elements | Changing how components look on canvas/preview |
| `src/codegen/codeGenerator.ts` | 871 | Generates export code from canvas state | Changing exported code format/style |
| `src/components/properties/PropertiesPanel.tsx` | 789 | Properties editor with props + styles | Adding new prop types, style controls |
| `src/store/useBuilderStore.ts` | 220 | Zustand store — all state + actions | Adding new features that need state |
| `src/store/types.ts` | 143 | TypeScript interfaces | Adding new data types |

### UI Shell Files

| File | Lines | What It Does | When You'd Change It |
|------|-------|-------------|---------------------|
| `src/components/layout/AppHeader.tsx` | 180 | Toolbar with all top-level actions | Adding toolbar buttons, zoom UI, etc. |
| `src/components/layout/LeftSidebar.tsx` | 80 | Component palette with search | Changing palette layout/search |
| `src/components/layout/MainLayout.tsx` | 81 | Root layout + DnD context | Changing overall app layout, drop behavior |
| `src/components/layout/RightSidebar.tsx` | 46 | Properties panel wrapper | Changing right sidebar behavior |

### Canvas Files

| File | Lines | What It Does | When You'd Change It |
|------|-------|-------------|---------------------|
| `src/components/canvas/Canvas.tsx` | 124 | Infinite canvas (zoom, pan, click) | Changing zoom behavior, canvas interactions |
| `src/components/canvas/CanvasItem.tsx` | 158 | Node wrapper (drag, resize, select) | Changing resize handles, selection visuals |
| `src/components/canvas/DeviceFrame.tsx` | 82 | Device frame rectangle | Changing frame appearance |
| `src/components/canvas/GridOverlay.tsx` | 16 | Dot grid background | Changing grid pattern |

### Dialog Files

| File | Lines | What It Does | When You'd Change It |
|------|-------|-------------|---------------------|
| `src/components/dialogs/SaveDesignDialog.tsx` | 103 | Save design with name | Changing save UI/behavior |
| `src/components/dialogs/OpenDesignDialog.tsx` | 155 | Open/delete designs | Changing open UI/behavior |
| `src/components/preview/ExportModal.tsx` | 101 | Code export dialog | Changing export UI, instructions |
| `src/components/preview/PreviewModal.tsx` | 67 | Full-screen preview | Changing preview behavior |

### Hooks

| File | Lines | What It Does | When You'd Change It |
|------|-------|-------------|---------------------|
| `src/hooks/useAutoSave.ts` | 17 | Auto-save every 30s | Changing auto-save interval |
| `src/hooks/useKeyboardShortcuts.ts` | 49 | Global keyboard shortcuts | Adding/changing shortcuts |

### Utilities

| File | Lines | What It Does | When You'd Change It |
|------|-------|-------------|---------------------|
| `src/utils/idGenerator.ts` | 4 | UUID generation | Never (unless changing ID format) |
| `src/utils/treeUtils.ts` | 120 | Immutable tree operations | Adding new tree operations |
| `src/api/designsApi.ts` | 81 | Backend API client | Adding new API endpoints |

### Backend

| File | Lines | What It Does | When You'd Change It |
|------|-------|-------------|---------------------|
| `server/index.js` | 155 | Express REST API | Adding endpoints, changing storage |

---

## 6. How to Add a New Component

**Example:** Adding a "DatePicker" component.

### Step 1: Register it in `componentRegistry.ts`

Add an entry to the `REGISTRY` array:

```typescript
{
  type: 'DatePicker',
  displayName: 'Date Picker',
  category: 'Inputs',
  icon: 'DateRange',            // MUI icon name
  defaultProps: {
    label: 'Select Date',
    variant: 'outlined',
  },
  defaultSx: {},
  defaultSize: { width: 240, height: 56 },
  isContainer: false,
  propSchema: [
    { name: 'label', label: 'Label', type: 'text', defaultValue: 'Select Date' },
    { name: 'variant', label: 'Variant', type: 'select', options: ['outlined', 'filled', 'standard'], defaultValue: 'outlined' },
    { name: 'disabled', label: 'Disabled', type: 'boolean', defaultValue: false },
  ],
},
```

### Step 2: Render it in `ComponentRenderer.tsx`

Add the import at the top:
```tsx
import { DatePicker } from '@mui/x-date-pickers';
```

Add a case in the switch statement:
```tsx
case 'DatePicker': {
  const label = props.label as string || 'Select Date';
  const variant = props.variant as string || 'outlined';
  return (
    <DatePicker
      label={label}
      slotProps={{ textField: { variant, fullWidth: true, sx: { ...sxWithOverrides }, style: fontStyle } }}
    />
  );
}
```

### Step 3: Generate code in `codeGenerator.ts`

Add to `componentImports`:
```typescript
DatePicker: ['DatePicker'],  // Note: Actually from @mui/x-date-pickers
```

Add a case in `leafJsx()`:
```typescript
case 'DatePicker': {
  const label = props.label as string || 'Select Date';
  const variant = props.variant as string || 'outlined';
  return `${indent}<DatePicker label="${label}" slotProps={{ textField: { variant: '${variant}', fullWidth: true } }} />`;
}
```

**Note:** You may need to adjust the import statement generation in `generateReactCode()` if the component comes from a different package than `@mui/material`.

### Step 4: Verify

1. Component appears in the Inputs palette section
2. Drag onto canvas — renders correctly
3. Select — properties panel shows Label, Variant, Disabled controls
4. Export — generated code includes correct import and JSX

---

## 7. How to Modify an Existing Component

### Changing Default Props

In `componentRegistry.ts`, find the component entry and modify `defaultProps`:
```typescript
// Before:
defaultProps: { label: 'Click Me', variant: 'contained', color: 'primary' },
// After:
defaultProps: { label: 'Submit', variant: 'outlined', color: 'secondary' },
```

This only affects **newly created** nodes. Existing nodes on the canvas keep their current props.

### Adding a New Prop to an Existing Component

1. In `componentRegistry.ts`, add to `propSchema`:
```typescript
propSchema: [
  // existing props...
  { name: 'size', label: 'Size', type: 'select', options: ['small', 'medium', 'large'], defaultValue: 'medium' },
],
```

2. In `ComponentRenderer.tsx`, read and use the prop:
```tsx
case 'Button': {
  const size = props.size as string || 'medium';
  return <Button size={size} ...>
}
```

3. In `codeGenerator.ts` → `leafJsx()`, include it in the generated code:
```tsx
case 'Button': {
  const size = props.size as string || 'medium';
  return `${indent}<Button size="${size}" ...>`;
}
```

### Changing How a Component Renders

Only modify `ComponentRenderer.tsx`. The other files don't need changes unless the prop structure changes.

---

## 8. How to Change the Styling System

The current styling system uses MUI's `sx` prop. Here's where it's implemented:

### Where styles are stored
Every `CanvasNode` has an `sx` field: `Record<string, unknown>`.

Example: `{ bgcolor: '#ff0000', p: 2, borderRadius: 1, fontFamily: 'Arial', fontSize: 16 }`

### Where styles are edited
`PropertiesPanel.tsx` → the `SxEditor` section (defined inline, not a separate file).

The SxEditor has sections for:
- **Background** — `bgcolor` (color picker + hex text input)
- **Text Color** — `color` (color picker + hex text input)
- **Margin** — `mt`, `mr`, `mb`, `ml` (4 number inputs)
- **Padding** — `pt`, `pr`, `pb`, `pl` (4 number inputs)
- **Border** — `borderWidth`, `borderStyle`, `borderColor`, `borderRadius` (various inputs)
- **Font** — `fontFamily` (text), `fontSize` (number), `fontWeight` (select)
- **Box Shadow** — `boxShadow` (text input)
- **Opacity** — `opacity` (slider)

Each change calls `updateNodeSx(nodeId, { key: value })`.

### Where styles are applied
1. **Canvas rendering:** `ComponentRenderer.tsx` applies `sx={sxWithOverrides}` where `sxWithOverrides` merges user sx + font overrides
2. **Code export:** `codeGenerator.ts` → `sxToInline()` converts the sx object to a JSX attribute string

### To add a new style property:
1. Add UI controls in `PropertiesPanel.tsx` → SxEditor section
2. The control should call `updateSx({ newPropName: value })`
3. It will automatically be applied in `ComponentRenderer.tsx` (sx passthrough)
4. It will automatically be exported in `codeGenerator.ts` (sxToInline passthrough)

### To change from sx to CSS classes or inline styles:
1. Change `PropertiesPanel.tsx` SxEditor to store styles in a different format in `node.sx` (or add a new field to CanvasNode)
2. Change `ComponentRenderer.tsx` to read and apply styles in the new format
3. Change `codeGenerator.ts` → `sxToInline()` to output the new format

---

## 9. How to Change the UI Library

If you want to replace MUI with another component library (e.g., Ant Design, Chakra UI, Radix, your own library):

### Summary of scope:

| Area | Files to Change | Complexity |
|------|----------------|------------|
| Canvas components (38 types) | `componentRegistry.ts`, `ComponentRenderer.tsx`, `codeGenerator.ts` | HIGH |
| Builder UI | All files in `layout/`, `canvas/`, `dialogs/`, `properties/`, `palette/` | MEDIUM |
| Theme system | `theme.ts`, `App.tsx` | LOW |
| Icon system | `PaletteItem.tsx`, `ComponentRenderer.tsx`, `AppHeader.tsx`, etc. | MEDIUM |
| Package deps | `package.json` | LOW |

### Detailed steps:

**1. `package.json`** — Remove `@mui/material`, `@mui/icons-material`, `@emotion/react`, `@emotion/styled`. Add your library.

**2. `src/theme/theme.ts`** — Replace `createTheme()` with your library's theme builder.

**3. `src/App.tsx`** — Replace `<ThemeProvider>` and `<CssBaseline>`.

**4. `src/components/palette/componentRegistry.ts`** — Update all 38 entries:
- Change `defaultProps` to match your library's prop APIs
- Change `propSchema` options (e.g., if your library uses `appearance` instead of `variant`)
- Change `icon` to use your icon system names
- Change `defaultSize` if your components have different natural sizes

**5. `src/components/preview/ComponentRenderer.tsx`** — Replace all rendering:
- Change imports from `@mui/material` to your library
- Change each `case` to render your library's component
- Replace `fontSxOverride()` CSS selectors with your library's class names

**6. `src/codegen/codeGenerator.ts`** — Replace all code generation:
- Change `componentImports` map to your library's import names
- Change `iconImports` to your icon library
- Change `from '@mui/material'` / `from '@mui/icons-material'` strings in `generateReactCode()`
- Change every `case` in `leafJsx()`, `renderLayoutNode()`, `renderLeafContainer()`
- Change `sxToInline()` if your library uses a different styling system

**7. All builder UI files** — Replace MUI components with your library's equivalents:
- `Box` → your div/container component
- `Typography` → your text component
- `Button`, `IconButton` → your button components
- `TextField` → your input component
- `Select`, `MenuItem` → your select/dropdown
- `Dialog`, `DialogTitle`, `DialogContent`, `DialogActions` → your modal components
- `Accordion` → your collapsible sections
- `AppBar`, `Toolbar` → your app header
- `Chip` → your tag/badge
- `Tooltip` → your tooltip
- `Menu` → your dropdown menu
- `List`, `ListItem`, `ListItemButton` → your list components
- `Alert` → your alert/notification
- `CircularProgress` → your loading spinner
- `Slider` → your slider
- `Switch` → your toggle
- `Divider` → your divider

**8. `src/components/palette/PaletteItem.tsx`** — Replace the icon resolution system:
```tsx
// Current: imports ALL MUI icons
import * as MuiIcons from '@mui/icons-material';
const IconComp = (MuiIcons as Record<string, React.ElementType>)[meta.icon];
// Replace with your icon system
```

**9. `src/components/preview/ExportModal.tsx`** — Update the "How to Use" instructions:
```
// Current: npm install @mui/material @mui/icons-material @emotion/react @emotion/styled
// Change to your library's install command
```

### See also: `docs/AI_MIGRATION_GUIDE.md` — a more detailed guide written specifically for AI assistants performing this migration.

---

## 10. How to Add New Features

### Adding a New Toolbar Button

1. Open `src/components/layout/AppHeader.tsx`
2. Add a state variable if needed: `const [showMyDialog, setShowMyDialog] = useState(false);`
3. Add the button in the toolbar JSX (after the spacer `<Box sx={{ flex: 1 }} />`):
```tsx
<Tooltip title="My Feature">
  <IconButton onClick={() => setShowMyDialog(true)}><MyIcon fontSize="small" /></IconButton>
</Tooltip>
```
4. Add the dialog component at the bottom (before `</>`)

### Adding a New Keyboard Shortcut

Open `src/hooks/useKeyboardShortcuts.ts` and add a new handler:
```typescript
if (e.ctrlKey && e.key === 'p') { e.preventDefault(); /* your action */; return; }
```

### Adding a New Store Action

1. Add the type in `src/store/types.ts` → `BuilderState` interface:
```typescript
myNewAction: (param: string) => void;
```

2. Implement in `src/store/useBuilderStore.ts`:
```typescript
myNewAction: (param) => {
  const state = get();
  state.pushHistory(); // if it should be undoable
  set({ /* new state */ });
},
```

### Adding a New API Endpoint

1. Add the route in `server/index.js`:
```javascript
app.post('/api/myfeature', (req, res) => { ... });
```

2. Add the client function in `src/api/designsApi.ts`:
```typescript
export async function myFeature(data: unknown): Promise<unknown> {
  const res = await fetch(`${API_BASE}/myfeature`, { method: 'POST', ... });
  return res.json();
}
```

### Adding a New Panel/Sidebar

1. Create the component in an appropriate directory
2. Add it to `MainLayout.tsx` in the desired position
3. Add toggle state/button in `AppHeader.tsx` if needed

---

## 11. Backend API Reference

**Base URL:** `http://localhost:4000` (development)

### GET `/api/designs`

List all saved designs.

**Response:**
```json
[
  {
    "id": "uuid-string",
    "name": "My Dashboard",
    "createdAt": "2026-02-19T10:30:00.000Z",
    "updatedAt": "2026-02-19T11:45:00.000Z",
    "nodeCount": 12,
    "frameWidth": 1280,
    "frameHeight": 800
  }
]
```

### GET `/api/designs/:id`

Load a specific design with full state.

**Response:**
```json
{
  "id": "uuid-string",
  "name": "My Dashboard",
  "createdAt": "2026-02-19T10:30:00.000Z",
  "updatedAt": "2026-02-19T11:45:00.000Z",
  "state": {
    "canvasNodes": [ /* CanvasNode[] */ ],
    "deviceFrame": { "x": 100, "y": 80, "width": 1280, "height": 800, "bgColor": "#ffffff" },
    "themeMode": "dark"
  }
}
```

### POST `/api/designs`

Create a new design.

**Request body:**
```json
{
  "name": "My Dashboard",
  "state": {
    "canvasNodes": [ /* CanvasNode[] */ ],
    "deviceFrame": { /* DeviceFrame */ },
    "themeMode": "dark"
  }
}
```

### PUT `/api/designs/:id`

Update an existing design. Both fields are optional.

**Request body:**
```json
{
  "name": "Renamed Dashboard",
  "state": { /* full state */ }
}
```

### DELETE `/api/designs/:id`

Delete a design. Returns `{ "success": true }`.

### Storage

Designs are stored as JSON files in `server/designs/{uuid}.json`. Each file contains the full design payload (id, name, timestamps, state).

---

## 12. State Management Deep Dive

### Store Structure (`useBuilderStore.ts`)

The Zustand store is created with `create<BuilderState>()`. All state and actions are in a single flat object.

#### State Fields

| Field | Type | Default | Purpose |
|-------|------|---------|---------|
| `canvasNodes` | `CanvasNode[]` | `[]` | All components on the canvas |
| `selectedNodeIds` | `Set<string>` | `new Set()` | Currently selected nodes |
| `viewport` | `{ zoom, panX, panY }` | `{ 1, 0, 0 }` | Canvas zoom and pan offset |
| `themeMode` | `'light' \| 'dark'` | `'dark'` | Builder theme |
| `history` | `HistoryEntry[]` | `[]` | Undo/redo stack (max 50) |
| `historyIndex` | `number` | `-1` | Current position in history |
| `nextZIndex` | `number` | `1` | Auto-incrementing z-index |
| `deviceFrame` | `DeviceFrame` | `{ x:100, y:80, w:1280, h:800, bg:#fff }` | Frame bounds |
| `currentDesignId` | `string \| null` | `null` | Active server design |
| `currentDesignName` | `string \| null` | `null` | Active design name |

#### Undo/Redo System

- `pushHistory()` snapshots current `canvasNodes` into the `history` array
- `undo()` restores `history[historyIndex]` and decrements index
- `redo()` restores `history[historyIndex + 2]` and increments index
- Max 50 history entries (oldest are dropped)
- Called automatically before: `addNode`, `removeNode`, `clearCanvas`, `duplicateNode`
- NOT called for: position/size changes (too frequent), prop/sx changes

#### Tree Operations

`canvasNodes` is a flat array at the top level, but each node has `children[]` for nesting. All mutations go through `src/utils/treeUtils.ts`:

- `updateNodeInTree(nodes, id, updater)` — finds node by ID (recursively) and applies updater function
- `removeNodeFromTree(nodes, id)` — removes node from tree
- `flattenTree(nodes)` — flattens tree to flat array (for searching)
- `cloneTree(nodes)` — deep clone for history snapshots

---

## 13. Code Generator Deep Dive

### Architecture

The code generator (`src/codegen/codeGenerator.ts`) converts the canvas state into exportable React code through these stages:

#### Stage 1: Build Containment Tree
`buildLayoutTree(nodes, frameX, frameY)` creates a hierarchy:
- Sorts nodes by area (largest first = potential containers)
- For each node, finds the smallest container that visually contains it
- Computes `relX`, `relY` — position relative to parent (or frame origin for root nodes)

#### Stage 2: Group into Bands
`groupIntoBands(tree)` groups root nodes that overlap vertically:
- Nodes at similar Y positions share a "band" (row)
- Nodes at different Y positions are separate bands
- Tolerance: 30px vertical overlap counts as same band

#### Stage 3: Render Bands
`renderBands(bands, frameW, indent)` generates flex layout:
- **Single-item band:** Uses alignment (`mx: 'auto'` for center, `ml: 'auto'` for right, `ml: X` for left)
- **Multi-item band:** Uses `display: 'flex'` row with `<Box sx={{ flex: 1 }} />` spacers between distant items
- Vertical spacing between bands: `mt: X` (margin-top in MUI spacing units, 1 unit = 8px)

#### Stage 4: Render Components
- `leafJsx(node, indent)` — generates JSX for non-container components
- `renderLayoutNode(ln, indent)` — generates JSX for containers with children (Card → CardContent → Stack, etc.)
- `renderLeafContainer(ln, indent)` — generates JSX for empty containers

#### Stage 5: Assemble
`generateReactCode(nodes, frame)`:
1. Builds containment tree
2. Collects all needed imports (MUI components + icons)
3. Generates import statements
4. Generates state declarations (for Drawer collapse states)
5. Generates root `<Box>` with frame dimensions
6. Renders all bands inside the root box
7. Exports as default component

### Key Maps

**`componentImports`** — Maps component type → MUI import names:
```typescript
'Button' → ['Button']
'Select' → ['FormControl', 'InputLabel', 'Select', 'MenuItem']
'Table' → ['Table', 'TableBody', 'TableCell', 'TableContainer', 'TableHead', 'TableRow', 'Paper']
```

**`iconImports`** — Maps component type → icon import names:
```typescript
'Fab' → ['Add']
'SpeedDial' → ['Add', 'Edit', 'Share', 'Print', 'Mail', 'Favorite']
```

### The `sx` Serialization

`sxToInline(sx, indent)` converts an sx object to a JSX attribute:
- ≤3 entries: inline `sx={{ key: value, ... }}`
- 3+ entries: multi-line with indentation
- Numbers stay as numbers, strings get quoted

---

## 14. Troubleshooting

### "Cannot find module '@mui/icons-material'"
The export code tells users to install `@mui/material @mui/icons-material @emotion/react @emotion/styled`. Check `ExportModal.tsx` → "How to Use" tab.

### Saved design loads with wrong positions
Check `loadDesignState()` in `useBuilderStore.ts`. It sanitizes nodes but doesn't validate positions. If the device frame size changed, positions may be off.

### New component doesn't appear in palette
1. Check `componentRegistry.ts` — is it in the `REGISTRY` array?
2. Check the `category` value — must match a `ComponentCategory` type in `types.ts`
3. Check the `icon` name — must be a valid MUI icon name

### Component renders on canvas but not in export
Check `codeGenerator.ts`:
1. Is it in `componentImports`?
2. Is there a `case` in `leafJsx()` or `renderLeafContainer()`?

### Ctrl+S doesn't save to server
The keyboard shortcut only auto-saves to server if `currentDesignId` is set (i.e., you've previously saved or opened a design). Use the Save dialog for the first save.

### Server won't start
```bash
cd server
npm install    # Make sure dependencies are installed
node index.js  # Must run from the server directory
```
Default port: 4000. Check for conflicts.

### Vite proxy not working
Check `vite.config.ts` — the `/api` proxy must point to `http://localhost:4000`. Both the Vite dev server AND the Express server must be running.
