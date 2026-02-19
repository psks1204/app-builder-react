# AI Migration Guide: Replacing MUI with a Custom Component Library

> **Target audience:** AI coding assistants (Gemini 2.5 Flash/Pro, Claude Sonnet 4, GPT-4o, etc.)
> 
> **Task:** Replace all MUI (`@mui/material`, `@mui/icons-material`) usage with a custom React component library while preserving all builder functionality.

---

## OVERVIEW — What This Project Is

This is a **visual drag-and-drop UI builder** (like Figma) that lets users:
1. Drag components onto a canvas
2. Edit their properties and styles
3. Preview the result interactively
4. Export clean React code

Currently it uses **MUI (Material UI)** for TWO distinct purposes:
- **Builder UI** — The builder's own interface (toolbar, sidebar, panels, dialogs) uses MUI components
- **Canvas Components** — The 38 component types users drag onto the canvas are MUI components

**You need to replace BOTH.**

---

## CRITICAL CONCEPT: TWO LAYERS OF MUI USAGE

### Layer 1: Builder UI (the app's own interface)
These are normal React component files that use MUI to render the builder interface:
- Toolbar buttons, dialogs, text fields, accordions, etc.
- These imports look like: `import { Button, Dialog, TextField } from '@mui/material'`
- **Location:** All files in `src/components/layout/`, `src/components/canvas/`, `src/components/dialogs/`, `src/components/properties/`, `src/components/palette/`, `src/App.tsx`, `src/theme/`

### Layer 2: Canvas Components (what users build with)
These are the 38 component types that appear in the palette and get rendered on the canvas:
- **Registry:** `src/components/palette/componentRegistry.ts` — defines all component types, their props, defaults
- **Renderer:** `src/components/preview/ComponentRenderer.tsx` — renders each type to actual React elements
- **Code Generator:** `src/codegen/codeGenerator.ts` — generates export code with import statements

**Both layers must be migrated.**

---

## FILES THAT NEED CHANGES — COMPLETE LIST

### MUST CHANGE (Core migration files)

| # | File | Lines | What to Change | Difficulty |
|---|------|-------|---------------|------------|
| 1 | `src/components/palette/componentRegistry.ts` | 675 | Replace all 38 MUI component definitions with your library's components. Change types, default props, default sizes, prop schemas, icons. | **HIGH** |
| 2 | `src/components/preview/ComponentRenderer.tsx` | 750 | Replace the entire rendering switch statement. Every `case` renders a MUI component — replace with your library's equivalent. | **HIGH** |
| 3 | `src/codegen/codeGenerator.ts` | 871 | Replace `componentImports` map (what import statements to generate), `iconImports` map, and all JSX generation in `leafJsx()`, `renderLayoutNode()`, `renderLeafContainer()`. | **HIGH** |
| 4 | `src/components/preview/ExportModal.tsx` | 101 | Change the "How to Use" instructions (install command references `@mui/material @mui/icons-material`). Also uses MUI for its own UI. | MEDIUM |
| 5 | `src/components/layout/AppHeader.tsx` | 180 | Replace MUI components used for the toolbar (AppBar, Toolbar, IconButton, etc.) with your library equivalents. | MEDIUM |
| 6 | `src/components/layout/LeftSidebar.tsx` | 80 | Replace MUI Accordion, TextField, InputAdornment with your library. | MEDIUM |
| 7 | `src/components/layout/MainLayout.tsx` | 81 | Replace Box, Paper, Typography with your library. | LOW |
| 8 | `src/components/layout/RightSidebar.tsx` | 46 | Replace Box, Typography with your library. | LOW |
| 9 | `src/components/canvas/Canvas.tsx` | 124 | Replace Box, Typography with your library. | LOW |
| 10 | `src/components/canvas/CanvasItem.tsx` | 158 | Replace Box with your library. | LOW |
| 11 | `src/components/canvas/DeviceFrame.tsx` | 82 | Replace Box, Typography, DesktopWindows icon. | LOW |
| 12 | `src/components/canvas/GridOverlay.tsx` | 16 | Replace Box with your library (just a styled div). | LOW |
| 13 | `src/components/palette/PaletteItem.tsx` | 63 | Replace Box, Typography. **IMPORTANT:** Remove `import * as MuiIcons from '@mui/icons-material'` — replace with your icon system. | MEDIUM |
| 14 | `src/components/properties/PropertiesPanel.tsx` | 789 | Replace all MUI form components (TextField, Accordion, Slider, Switch, etc.) with your library. | **HIGH** |
| 15 | `src/components/dialogs/SaveDesignDialog.tsx` | 103 | Replace Dialog, TextField, Button, Alert, CircularProgress. | MEDIUM |
| 16 | `src/components/dialogs/OpenDesignDialog.tsx` | 155 | Replace Dialog, List, ListItemButton, Chip, IconButton, etc. | MEDIUM |
| 17 | `src/components/preview/PreviewModal.tsx` | 67 | Replace Dialog, Box, IconButton, Typography. | LOW |
| 18 | `src/App.tsx` | 24 | Replace `ThemeProvider`, `CssBaseline` with your library's theme system. | MEDIUM |
| 19 | `src/theme/theme.ts` | 38 | Replace `createTheme` from MUI with your library's theme builder. **Or delete entirely** if your library handles theming differently. | MEDIUM |
| 20 | `package.json` | 33 | Remove `@mui/material`, `@mui/icons-material`, `@emotion/react`, `@emotion/styled`. Add your library's packages. | LOW |

### DO NOT CHANGE (No MUI references)

| File | Reason |
|------|--------|
| `src/store/types.ts` | Pure TypeScript interfaces, no MUI imports |
| `src/store/useBuilderStore.ts` | Pure Zustand store, no MUI imports |
| `src/api/designsApi.ts` | Pure fetch client, no MUI |
| `src/hooks/useAutoSave.ts` | Pure hook, no MUI |
| `src/hooks/useKeyboardShortcuts.ts` | Pure hook, no MUI (imports designsApi but not MUI) |
| `src/utils/idGenerator.ts` | Pure utility |
| `src/utils/treeUtils.ts` | Pure utility |
| `src/main.tsx` | Just renders `<App />`, no MUI |
| `server/index.js` | Backend, no frontend dependencies |
| `vite.config.ts` | Build config, no MUI |
| `tsconfig.json` | TypeScript config |

---

## DETAILED MIGRATION INSTRUCTIONS

### Step 1: Update `package.json`

**Remove these dependencies:**
```
@mui/material
@mui/icons-material
@emotion/react
@emotion/styled
```

**Add your library's packages instead.**

Run `npm install` after changes.

---

### Step 2: Replace `src/theme/theme.ts`

Current code creates a MUI theme with `createTheme()`:
```ts
import { createTheme } from '@mui/material/styles';
export function buildTheme(mode: 'light' | 'dark') {
  return createTheme({ palette: { mode }, ... });
}
```

**Replace with:** Your library's theme builder. The `buildTheme(mode)` function must return whatever your library's `ThemeProvider` expects. It receives `'light'` or `'dark'`.

**Update `src/App.tsx`** to use your library's ThemeProvider:
```tsx
// Current:
import { ThemeProvider, CssBaseline } from '@mui/material';
// Replace with your library's equivalents
```

---

### Step 3: Replace Component Registry (`src/components/palette/componentRegistry.ts`)

This file defines ALL 38 draggable component types. Each entry in the `REGISTRY` array has this structure:

```ts
{
  type: 'Button',              // Unique string ID — used everywhere
  displayName: 'Button',       // Shown in palette UI
  category: 'Inputs',          // Category grouping
  icon: 'SmartButton',         // Icon name (currently MUI icon name)
  defaultProps: { label: 'Click Me', variant: 'contained', color: 'primary' },
  defaultSx: {},               // Default MUI sx styles
  defaultSize: { width: 120, height: 40 },
  isContainer: false,          // Can other components be dropped inside?
  propSchema: [                // What controls appear in Properties panel
    { name: 'label', label: 'Label', type: 'text', defaultValue: 'Click Me' },
    { name: 'variant', label: 'Variant', type: 'select', options: ['contained', 'outlined', 'text'], defaultValue: 'contained' },
    { name: 'color', label: 'Color', type: 'select', options: ['primary', 'secondary', 'error', 'warning', 'info', 'success'], defaultValue: 'primary' },
    { name: 'disabled', label: 'Disabled', type: 'boolean', defaultValue: false },
  ],
}
```

**For each of your library's components:**
1. Add an entry to `REGISTRY` with the correct `type`, `displayName`, `category`, `icon`
2. Set `defaultProps` to match your component's API (prop names, valid values)
3. Set `defaultSize` to a reasonable pixel size
4. Set `isContainer` to `true` if the component can contain children (like Card, Panel, etc.)
5. Define `propSchema` — one entry per editable prop with the correct control type

**The `type` string is the primary key used across the entire app.** Whatever you name it here must match in `ComponentRenderer.tsx` and `codeGenerator.ts`.

**Icon system:** The `icon` field currently references MUI icon names. `PaletteItem.tsx` resolves these via `import * as MuiIcons from '@mui/icons-material'`. Replace this with your icon system.

**Categories:** Current categories are `'Inputs'`, `'Data Display'`, `'Surfaces'`, `'Navigation'`, `'Feedback'`, `'Layout'`. You can keep these or change them — they're defined in `src/store/types.ts` as `ComponentCategory`.

---

### Step 4: Replace Component Renderer (`src/components/preview/ComponentRenderer.tsx`)

This is the core rendering engine. It has a giant `switch (type)` statement with a `case` for each of the 38 component types.

**Structure:**
```tsx
export const ComponentRenderer: React.FC<Props> = ({ node, interactive }) => {
  const { type, props, sx: rawSx } = node;
  // ... font style computation ...
  
  switch (type) {
    case 'Button':
      return <Button variant={...} color={...} sx={...} style={fontStyle}>{label}</Button>;
    case 'TextField':
      return <TextField label={...} variant={...} sx={...} />;
    // ... 36 more cases ...
    default:
      return <Box>Unknown: {type}</Box>;
  }
};
```

**For each component type, you must:**
1. Replace the MUI import at the top with your library's import
2. Replace the JSX in each `case` with your library's component
3. Map props correctly: e.g., MUI's `variant="contained"` might be `appearance="filled"` in your library
4. Handle the `sx` prop: MUI uses `sx={{ ... }}`. Your library might use `style`, `className`, `css`, or its own styling system
5. Handle the `fontStyle` prop: Currently applied as `style={fontStyle}` for inline CSS

**Interactive components** — These 5 component types have special interactive wrappers defined inside this file:
- `InteractiveTabs` — manages tab state with `useState`
- `InteractiveBottomNav` — manages navigation state
- `InteractivePagination` — manages page state
- `InteractiveDrawer` — manages expand/collapse state for nested menu items
- `NestedMenuItem` — recursive menu item with collapse/expand

Each of these is a small React component defined in the same file. Replace with your library's equivalents.

**Key detail:** The function `fontStyleFromSx(sx)` extracts `fontFamily`, `fontSize`, `fontWeight` from the sx object and returns a CSS `style` object. The function `fontSxOverride(sx)` returns nested CSS selectors to override MUI's built-in typography classes. You may need to change `fontSxOverride` if your library uses different CSS class names.

---

### Step 5: Replace Code Generator (`src/codegen/codeGenerator.ts`)

This file generates the React code that users export. It has three key data structures:

#### A. `componentImports` map (line ~18)
Maps component type → array of import names from `@mui/material`:
```ts
const componentImports: Record<string, string[]> = {
  Button: ['Button'],
  Select: ['FormControl', 'InputLabel', 'Select', 'MenuItem'],
  Table: ['Table', 'TableBody', 'TableCell', 'TableContainer', 'TableHead', 'TableRow', 'Paper'],
  // ... etc
};
```

**Replace with your library's import names.** For example:
```ts
const componentImports: Record<string, string[]> = {
  Button: ['Button'],  // from 'your-library'
  Select: ['Select', 'SelectItem'],  // from 'your-library'
  // ... etc
};
```

#### B. `iconImports` map (line ~62)
Maps component type → array of icon import names from `@mui/icons-material`:
```ts
const iconImports: Record<string, string[]> = {
  Fab: ['Add'],
  SpeedDial: ['Add', 'Edit', 'Share', 'Print', 'Mail', 'Favorite'],
  // ... etc
};
```

**Replace with your icon library's imports or remove if your library doesn't use separate icon packages.**

#### C. `generateReactCode()` function (line ~817)
Generates the import statements in the exported code:
```ts
code += `import {\n  ${muiArr.join(',\n  ')}\n} from '@mui/material';\n`;
code += `import {\n  ${iconArr.join(',\n  ')}\n} from '@mui/icons-material';\n`;
```

**Change the `from '...'` strings to your library's package name.**

#### D. `leafJsx()` function (line ~370)
Generates JSX string for each component type. This is a huge switch statement:
```ts
case 'Button':
  return `${indent}<Button variant="${variant}" color="${color}">${label}</Button>`;
```

**Replace every case with your library's JSX syntax.**

#### E. `renderLayoutNode()` and `renderLeafContainer()` functions
Generate container JSX (Card, Paper, Accordion, etc.):
```ts
case 'Card':
  return `${indent}<Card elevation={${elevation}}>...`;
```

**Replace with your library's container components.**

---

### Step 6: Replace Builder UI Components

These files use MUI for the builder's own interface. Replace component-by-component:

#### `src/components/layout/AppHeader.tsx`
Current MUI usage:
- `AppBar`, `Toolbar` → Your app bar / header component
- `IconButton`, `Tooltip` → Your icon button with tooltips
- `Chip` → Your badge/tag component (shows zoom level, frame size, design name)
- `Menu`, `MenuItem` → Your dropdown menu (device size presets)
- `TextField` → Your text input (custom width/height entry)
- `Divider` → Your divider component

#### `src/components/layout/LeftSidebar.tsx`
Current MUI usage:
- `Accordion`, `AccordionSummary`, `AccordionDetails` → Your collapsible section component
- `TextField` with `InputAdornment` → Your search input with icon
- `Box`, `Typography` → Your layout/text primitives

#### `src/components/properties/PropertiesPanel.tsx` (789 lines — the biggest file)
This is the **most complex file to migrate**. It contains:
- 3 `Accordion` sections (Position, Props, Style)
- Schema-driven prop editor that renders `TextField`, `Select/MenuItem`, `Switch`, `Slider` based on `propSchema` field types
- Inline `ListEditor` component for editing string arrays (with drag reorder, add/remove)
- Inline `SxEditor` component with sections for:
  - Background color (color picker + hex input)
  - Text color (color picker + hex input)
  - Margin (4 inputs: top, right, bottom, left)
  - Padding (4 inputs)
  - Border (width, style select, color, radius)
  - Font (family text, size number, weight select)
  - Box shadow (text input)
  - Opacity (slider)

Every form control must be replaced with your library's equivalent.

#### `src/components/palette/PaletteItem.tsx`
**Key change:** Currently does `import * as MuiIcons from '@mui/icons-material'` and dynamically resolves icons by name:
```tsx
const IconComp = (MuiIcons as Record<string, React.ElementType>)[meta.icon];
```
Replace with your icon system. You might use a map, a different dynamic import, or inline SVGs.

#### `src/components/dialogs/SaveDesignDialog.tsx` and `OpenDesignDialog.tsx`
Standard dialog replacements: `Dialog`, `DialogTitle`, `DialogContent`, `DialogActions`, `Button`, `TextField`, `Alert`, `List`, `Chip`.

#### `src/components/preview/ExportModal.tsx`
Replace dialog components AND update the "How to Use" tab text that tells users what npm packages to install:
```
npm install @mui/material @mui/icons-material @emotion/react @emotion/styled
```
Change to your library's install command.

#### `src/components/preview/PreviewModal.tsx`
Simple dialog with close button — straightforward replacement.

#### Canvas components (`Canvas.tsx`, `CanvasItem.tsx`, `DeviceFrame.tsx`, `GridOverlay.tsx`)
These mostly use `Box` as a styled `<div>`. Replace with your library's box/container component or plain HTML `<div>` with styles.

---

### Step 7: Update `src/App.tsx`

```tsx
// Current:
import { ThemeProvider, CssBaseline } from '@mui/material';
import { buildTheme } from './theme/theme';

// In render:
<ThemeProvider theme={buildTheme(themeMode)}>
  <CssBaseline />
  <MainLayout />
</ThemeProvider>
```

Replace with your library's theme provider and global reset.

---

### Step 8: The `sx` Prop System

MUI's `sx` prop is used extensively throughout the app. It's a shorthand CSS-in-JS system:
```tsx
<Box sx={{ mt: 2, p: 1, bgcolor: 'primary.main', borderRadius: 1 }}>
```

Your library might use:
- `style={{ marginTop: 16, padding: 8 }}` — inline CSS
- `className="mt-2 p-1 bg-primary rounded"` — utility classes (like Tailwind)
- `css={{ ... }}` — its own CSS-in-JS

**Affected areas:**
1. **Builder UI files** — All layout/styling of the builder interface uses `sx`
2. **User-applied styles** — The `PropertiesPanel.tsx` SxEditor lets users set sx properties (bgcolor, margin, padding, border, font, etc.) which are stored in `node.sx` and applied in `ComponentRenderer.tsx`
3. **Code Generator** — `sxToInline()` function serializes sx objects to JSX string `sx={{ ... }}`

**Decision:** You can either:
- Convert all `sx` usage to your library's equivalent
- Keep an adapter that translates `sx` objects to your styling format
- Store styles in a different format in `node.sx` (requires changing PropertiesPanel and ComponentRenderer)

---

## THE `type` STRING IS KING

The component `type` string (e.g., `'Button'`, `'Card'`, `'TextField'`) is the primary key that links everything together:

```
componentRegistry.ts   →  type: 'Button'
                           ↓
ComponentRenderer.tsx  →  case 'Button': return <Button ... />
                           ↓
codeGenerator.ts       →  componentImports['Button'] = ['Button']
                       →  leafJsx() case 'Button': return '<Button ...>'
```

**If you change the type string in one file, you MUST change it in all three.**

**If your library has a component named differently** (e.g., MUI's `TextField` → your library's `TextInput`):
- In `componentRegistry.ts`: Set `type: 'TextInput'` (or keep `'TextField'` as the internal type and just change the rendering)
- In `ComponentRenderer.tsx`: Change `case 'TextField'` to `case 'TextInput'` (or keep the case name and just change the JSX)
- In `codeGenerator.ts`: Change the `componentImports` key and the `leafJsx()` case

**Recommendation:** Keep the same `type` strings internally and only change the rendered output. This minimizes changes to the store, persistence, and existing saved designs.

---

## SAVED DESIGNS COMPATIBILITY

Saved designs (in `server/designs/*.json` and localStorage) store `node.type` strings. If you change type strings, existing saved designs will break.

**Options:**
1. **Keep same type strings** — Safest. Just change rendering/code-gen, not type names.
2. **Add a migration** — In `useBuilderStore.ts` → `loadDesignState()`, map old type names to new ones.
3. **Clear old designs** — If you're starting fresh, just delete `server/designs/` contents.

---

## TESTING YOUR MIGRATION

After making changes, verify each of these works:

1. **Palette** — All components appear in the left sidebar with correct icons and names
2. **Drag & Drop** — Components can be dragged onto the canvas
3. **Canvas Rendering** — Components render correctly on the canvas (via ComponentRenderer)
4. **Properties Panel** — Selecting a component shows the correct prop controls
5. **Style Editor** — Changing sx values (color, padding, etc.) updates the component
6. **Preview** — Preview modal shows components at correct positions
7. **Interactive Preview** — Tabs switch, Drawers open, Pagination works
8. **Code Export** — Generated code uses your library's imports and components
9. **Save/Load** — Designs save to server and load back correctly
10. **Theme Toggle** — Light/dark mode works

---

## COMMON PITFALLS

1. **Don't forget `PaletteItem.tsx`** — It dynamically imports ALL MUI icons. Replace the dynamic resolution.
2. **Don't forget the code generator** — Users will see `@mui/material` in exported code if you don't update `codeGenerator.ts`.
3. **Don't forget ExportModal.tsx** — The "How to Use" tab has a hardcoded npm install command.
4. **Container types** — `CONTAINER_TYPES` in `codeGenerator.ts` is a Set of type strings that can contain children. Update if your container component names differ.
5. **The `sx` prop** — It's stored in every canvas node and used in rendering, properties panel, AND code generation. Plan your replacement strategy carefully.
6. **Font override** — `fontSxOverride()` in ComponentRenderer uses MUI-specific CSS selectors like `'& .MuiTypography-root'`. Replace with your library's selectors.
