import type { CanvasNode, DeviceFrame } from '../store/types';

// ============================================================
// Smart Code Generator â€” produces production-quality React+MUI
// with proper layout (flexbox, grid, flow) instead of absolute.
// ============================================================

/* â”€â”€â”€ Constants â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */

const CONTAINER_TYPES = new Set(['Card', 'Paper', 'Box', 'Stack', 'Grid', 'Container', 'Accordion']);
const MUI_SPACING_UNIT = 8; // MUI default theme.spacing(1) = 8px
const ROW_TOLERANCE = 30;   // px â€“ items within this vertical range are "same row"
const GAP_THRESHOLD = 60;   // px â€“ min gap to insert extra spacing

/* â”€â”€â”€ Import maps â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */

const componentImports: Record<string, string[]> = {
  Button: ['Button'],
  IconButton: ['IconButton'],
  ButtonGroup: ['ButtonGroup', 'Button'],
  TextField: ['TextField'],
  Select: ['FormControl', 'InputLabel', 'Select', 'MenuItem'],
  Checkbox: ['FormControlLabel', 'Checkbox'],
  Radio: ['FormControl', 'FormLabel', 'RadioGroup', 'FormControlLabel', 'Radio'],
  Switch: ['FormControlLabel', 'Switch'],
  Slider: ['Slider', 'Box'],
  Rating: ['Rating'],
  Autocomplete: ['Autocomplete', 'TextField'],
  Fab: ['Fab'],
  Typography: ['Typography'],
  Avatar: ['Avatar'],
  Badge: ['Badge'],
  Chip: ['Chip'],
  Divider: ['Divider'],
  List: ['List', 'ListItem', 'ListItemText'],
  Table: ['Table', 'TableBody', 'TableCell', 'TableContainer', 'TableHead', 'TableRow', 'Paper'],
  Tooltip: ['Tooltip', 'Button'],
  Image: ['Box'],
  Card: ['Card', 'CardHeader', 'CardContent'],
  Paper: ['Paper'],
  Accordion: ['Accordion', 'AccordionSummary', 'AccordionDetails', 'Typography'],
  AppBar: ['AppBar', 'Toolbar', 'Typography', 'Button'],
  Tabs: ['Tabs', 'Tab', 'Box'],
  Breadcrumbs: ['Breadcrumbs', 'Link', 'Typography'],
  Drawer: ['Paper', 'Typography', 'List', 'ListItemButton', 'ListItemText', 'Collapse', 'Divider'],
  Pagination: ['Pagination'],
  Stepper: ['Stepper', 'Step', 'StepLabel'],
  BottomNavigation: ['BottomNavigation', 'BottomNavigationAction'],
  SpeedDial: ['SpeedDial', 'SpeedDialAction'],
  Alert: ['Alert'],
  Snackbar: ['Paper', 'Typography'],
  Dialog: ['Paper', 'Typography', 'Button', 'Box'],
  CircularProgress: ['CircularProgress'],
  LinearProgress: ['LinearProgress'],
  Skeleton: ['Skeleton'],
  Box: ['Box'],
  Stack: ['Stack'],
  Grid: ['Grid'],
  Container: ['Container'],
};

const iconImports: Record<string, string[]> = {
  Accordion: ['ExpandMore'],
  Drawer: ['ExpandMore', 'ExpandLess'],
  Fab: ['Add'],
  IconButton: ['Star'],
  Badge: ['Mail'],
  SpeedDial: ['Add', 'Edit', 'Share', 'Print', 'Mail', 'Favorite'],
  BottomNavigation: ['Restore', 'Favorite', 'LocationOn'],
};

/* â”€â”€â”€ Types for layout tree â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */

interface LayoutNode {
  node: CanvasNode;
  /** Position relative to parent container (or frame origin) */
  relX: number;
  relY: number;
  children: LayoutNode[];
}

type LayoutDirection = 'column' | 'row' | 'wrap';

/* â”€â”€â”€ Step 1: Build containment tree â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */

function isVisuallyInside(child: CanvasNode, parent: CanvasNode): boolean {
  const cx = child.position.x;
  const cy = child.position.y;
  const cRight = cx + child.size.width;
  const cBottom = cy + child.size.height;
  const px = parent.position.x;
  const py = parent.position.y;
  const pRight = px + parent.size.width;
  const pBottom = py + parent.size.height;
  // Child center must be inside parent, and at least 50% overlap
  const centerX = cx + child.size.width / 2;
  const centerY = cy + child.size.height / 2;
  return centerX > px && centerX < pRight && centerY > py && centerY < pBottom;
}

function buildLayoutTree(nodes: CanvasNode[], frameX: number, frameY: number): LayoutNode[] {
  // Sort by area descending so larger containers come first
  const sorted = [...nodes].sort(
    (a, b) => (b.size.width * b.size.height) - (a.size.width * a.size.height)
  );

  const assigned = new Set<string>();
  const layoutMap = new Map<string, LayoutNode>();

  // Create LayoutNode for each node
  for (const n of sorted) {
    layoutMap.set(n.id, {
      node: n,
      relX: n.position.x - frameX,
      relY: n.position.y - frameY,
      children: [],
    });
  }

  // Assign children to the smallest container that contains them
  // Process from smallest to largest, checking against larger containers
  const byAreaAsc = [...sorted].reverse();

  for (const child of byAreaAsc) {
    if (assigned.has(child.id)) continue;

    // Find the smallest container that contains this child
    let bestParent: CanvasNode | null = null;
    let bestArea = Infinity;

    for (const potential of sorted) {
      if (potential.id === child.id) continue;
      if (!CONTAINER_TYPES.has(potential.type)) continue;
      const area = potential.size.width * potential.size.height;
      if (area >= bestArea) continue;
      if (isVisuallyInside(child, potential)) {
        bestParent = potential;
        bestArea = area;
      }
    }

    if (bestParent) {
      const parentLayout = layoutMap.get(bestParent.id)!;
      const childLayout = layoutMap.get(child.id)!;
      // Make position relative to parent
      childLayout.relX = child.position.x - bestParent.position.x;
      childLayout.relY = child.position.y - bestParent.position.y;
      parentLayout.children.push(childLayout);
      assigned.add(child.id);
    }
  }

  // Root nodes = not assigned to any parent
  const roots: LayoutNode[] = [];
  for (const n of sorted) {
    if (!assigned.has(n.id)) {
      roots.push(layoutMap.get(n.id)!);
    }
  }

  return roots;
}

/* â”€â”€â”€ Step 2: Infer layout direction for siblings â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */

function inferDirection(children: LayoutNode[]): LayoutDirection {
  if (children.length <= 1) return 'column';

  const sorted = [...children].sort((a, b) => a.relY - b.relY || a.relX - b.relX);

  // Check if all items are roughly on the same Y â†’ row
  const yValues = sorted.map(c => c.relY);
  const yRange = Math.max(...yValues) - Math.min(...yValues);
  if (yRange < ROW_TOLERANCE) return 'row';

  // Check if items form distinct rows with multiple items â†’ wrap/grid
  const rows: LayoutNode[][] = [];
  let currentRow: LayoutNode[] = [sorted[0]];
  for (let i = 1; i < sorted.length; i++) {
    if (Math.abs(sorted[i].relY - sorted[i - 1].relY) < ROW_TOLERANCE) {
      currentRow.push(sorted[i]);
    } else {
      rows.push(currentRow);
      currentRow = [sorted[i]];
    }
  }
  rows.push(currentRow);

  // If most rows have >1 item, it's a grid/wrap layout
  const multiItemRows = rows.filter(r => r.length > 1).length;
  if (multiItemRows > rows.length / 2) return 'wrap';

  return 'column';
}

function computeSpacing(children: LayoutNode[], direction: LayoutDirection): number {
  if (children.length < 2) return 2;

  const sorted = [...children].sort((a, b) =>
    direction === 'row' ? a.relX - b.relX : a.relY - b.relY
  );

  const gaps: number[] = [];
  for (let i = 1; i < sorted.length; i++) {
    const prev = sorted[i - 1];
    const curr = sorted[i];
    if (direction === 'row') {
      gaps.push(curr.relX - (prev.relX + prev.node.size.width));
    } else {
      gaps.push(curr.relY - (prev.relY + prev.node.size.height));
    }
  }

  if (gaps.length === 0) return 2;
  const avg = gaps.reduce((s, g) => s + g, 0) / gaps.length;
  const spacing = Math.max(1, Math.round(avg / MUI_SPACING_UNIT));
  return Math.min(spacing, 6); // cap at 6
}

/* â”€â”€â”€ Step 3: Sort children by visual position â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */

function sortByPosition(children: LayoutNode[], direction: LayoutDirection): LayoutNode[] {
  return [...children].sort((a, b) => {
    if (direction === 'row') return a.relX - b.relX;
    if (direction === 'column') return a.relY - b.relY;
    // wrap: sort by Y then X
    const yDiff = a.relY - b.relY;
    if (Math.abs(yDiff) > ROW_TOLERANCE) return yDiff;
    return a.relX - b.relX;
  });
}

/* â”€â”€â”€ Import collector â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */

function collectImports(tree: LayoutNode[]) {
  const mui = new Set<string>();
  const icons = new Set<string>();

  function walk(nodes: LayoutNode[]) {
    for (const ln of nodes) {
      const ci = componentImports[ln.node.type];
      if (ci) ci.forEach((n) => mui.add(n));
      const ii = iconImports[ln.node.type];
      if (ii) ii.forEach((n) => icons.add(n));
      // Containers with children use <Stack> as internal layout wrapper
      if (ln.children.length > 0 && CONTAINER_TYPES.has(ln.node.type)) {
        mui.add('Stack');
      }
      if (ln.children.length > 0) walk(ln.children);
    }
  }
  walk(tree);
  return { mui, icons };
}

/* â”€â”€â”€ SX helper â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */

function sxObj(sx: Record<string, unknown>): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(sx)) {
    if (v !== undefined && v !== '') result[k] = v;
  }
  return result;
}

function sxToInline(sx: Record<string, unknown>, indent: string): string {
  const entries = Object.entries(sx).filter(([, v]) => v !== undefined && v !== '');
  if (entries.length === 0) return '';
  if (entries.length <= 3) {
    const inner = entries.map(([k, v]) => {
      const val = typeof v === 'number' ? String(v) : `'${v}'`;
      return `${k}: ${val}`;
    }).join(', ');
    return ` sx={{ ${inner} }}`;
  }
  const inner = entries.map(([k, v]) => {
    const val = typeof v === 'number' ? String(v) : `'${v}'`;
    return `${indent}  ${k}: ${val}`;
  }).join(',\n');
  return ` sx={{\n${inner}\n${indent}}}`;
}

/* ─── Nested Drawer menu tree for codegen ──────────────────── */

interface CodegenMenuNode {
  label: string;
  children: CodegenMenuNode[];
}

function buildCodegenMenuTree(items: string[]): CodegenMenuNode[] {
  const root: CodegenMenuNode[] = [];
  for (const raw of items) {
    const parts = raw.split('>').map((s) => s.trim()).filter(Boolean);
    let level = root;
    for (let i = 0; i < parts.length; i++) {
      let existing = level.find((n) => n.label === parts[i]);
      if (!existing) {
        existing = { label: parts[i], children: [] };
        level.push(existing);
      }
      level = existing.children;
    }
  }
  return root;
}

function renderMenuNode(node: CodegenMenuNode, indent: string, statePrefix: string): { jsx: string; states: string[] } {
  const nl = '\n';
  const states: string[] = [];

  if (node.children.length === 0) {
    return {
      jsx: `${indent}<ListItemButton>${nl}${indent}  <ListItemText primary="${node.label}" />${nl}${indent}</ListItemButton>`,
      states,
    };
  }

  const stateVar = `open${statePrefix}${node.label.replace(/\s+/g, '')}`;
  states.push(stateVar);

  const childResults = node.children.map((c, i) => renderMenuNode(c, indent + '    ', statePrefix + node.label.replace(/\s+/g, '')));
  const childStates = childResults.flatMap(r => r.states);
  states.push(...childStates);

  const childJsx = childResults.map(r => r.jsx).join(nl);

  const jsx = [
    `${indent}<ListItemButton onClick={() => set${stateVar.charAt(0).toUpperCase() + stateVar.slice(1)}(o => !o)}>`,
    `${indent}  <ListItemText primary="${node.label}" />`,
    `${indent}  {${stateVar} ? <ExpandLessIcon /> : <ExpandMoreIcon />}`,
    `${indent}</ListItemButton>`,
    `${indent}<Collapse in={${stateVar}} timeout="auto" unmountOnExit>`,
    `${indent}  <List component="div" disablePadding dense sx={{ pl: 2 }}>`,
    childJsx,
    `${indent}  </List>`,
    `${indent}</Collapse>`,
  ].join(nl);

  return { jsx, states };
}

function generateDrawerNested(menuItems: string[], indent: string): string {
  const tree = buildCodegenMenuTree(menuItems);
  const hasNested = tree.some(n => n.children.length > 0);

  if (!hasNested) {
    // Simple flat list
    const nl = '\n';
    return `${indent}<List dense disablePadding>${nl}${tree.map(n => `${indent}  <ListItemButton><ListItemText primary="${n.label}" /></ListItemButton>`).join(nl)}${nl}${indent}</List>`;
  }

  const results = tree.map((n, i) => renderMenuNode(n, indent + '  ', ''));
  const nl = '\n';
  return `${indent}<List dense disablePadding>${nl}${results.map(r => r.jsx).join(nl)}${nl}${indent}</List>`;
}

/* ─── Node → JSX (leaf, no children wrapping) ──────────────── */

function leafJsx(node: CanvasNode, indent: string): string {
  const { type, props, sx: rawSx } = node;
  const sx = sxObj(rawSx ?? {});
  const sxStr = sxToInline(sx, indent);
  const nl = '\n';

  switch (type) {
    case 'Button':
      return `${indent}<Button variant="${props.variant}" color="${props.color}" size="${props.size}"${props.disabled ? ' disabled' : ''}${props.fullWidth !== false ? ' fullWidth' : ''}${sxStr}>${props.label}</Button>`;
    case 'IconButton':
      return `${indent}<IconButton color="${props.color}" size="${props.size}"${props.disabled ? ' disabled' : ''}${sxStr}><StarIcon /></IconButton>`;
    case 'ButtonGroup':
      return `${indent}<ButtonGroup variant="${props.variant}" color="${props.color}"${sxStr}>${nl}${(props.buttons as string[]).map(b => `${indent}  <Button>${b}</Button>`).join(nl)}${nl}${indent}</ButtonGroup>`;
    case 'TextField':
      return `${indent}<TextField label="${props.label}" placeholder="${props.placeholder}" variant="${props.variant}" size="${props.size}"${props.disabled ? ' disabled' : ''}${props.fullWidth !== false ? ' fullWidth' : ''}${sxStr} />`;
    case 'Select': {
      const opts = (props.options as string[]) || [];
      return `${indent}<FormControl fullWidth size="small"${sxStr}>${nl}${indent}  <InputLabel>${props.label}</InputLabel>${nl}${indent}  <Select label="${props.label}" defaultValue="">${nl}${opts.map(o => `${indent}    <MenuItem value="${o}">${o}</MenuItem>`).join(nl)}${nl}${indent}  </Select>${nl}${indent}</FormControl>`;
    }
    case 'Checkbox':
      return `${indent}<FormControlLabel control={<Checkbox${props.disabled ? ' disabled' : ''} color="${props.color}" />} label="${props.label}"${sxStr} />`;
    case 'Radio':
      return `${indent}<FormControl${sxStr}>${nl}${indent}  <FormLabel>${props.label}</FormLabel>${nl}${indent}  <RadioGroup${props.row ? ' row' : ''} defaultValue="${(props.options as string[])?.[0]}">${nl}${(props.options as string[]).map(o => `${indent}    <FormControlLabel value="${o}" control={<Radio />} label="${o}" />`).join(nl)}${nl}${indent}  </RadioGroup>${nl}${indent}</FormControl>`;
    case 'Switch':
      return `${indent}<FormControlLabel control={<Switch${props.disabled ? ' disabled' : ''} color="${props.color}" />} label="${props.label}"${sxStr} />`;
    case 'Slider':
      return `${indent}<Slider value={${props.value}} min={${props.min}} max={${props.max}} step={${props.step}}${props.disabled ? ' disabled' : ''} color="${props.color}" valueLabelDisplay="auto"${sxStr} />`;
    case 'Rating':
      return `${indent}<Rating value={${props.value}} max={${props.max}} precision={${props.precision}}${props.readOnly ? ' readOnly' : ''} size="${props.size}"${sxStr} />`;
    case 'Autocomplete':
      return `${indent}<Autocomplete options={${JSON.stringify(props.options)}} renderInput={(params) => <TextField {...params} label="${props.label}" size="small" />} size="small" fullWidth${sxStr} />`;
    case 'Fab':
      return `${indent}<Fab color="${props.color}" size="${props.size}"${sxStr}><AddIcon /></Fab>`;
    case 'Typography':
      return `${indent}<Typography variant="${props.variant}"${props.color && props.color !== 'inherit' ? ` color="${props.color}"` : ''}${props.align && props.align !== 'left' ? ` align="${props.align}"` : ''}${props.gutterBottom ? ' gutterBottom' : ''}${sxStr}>${props.text}</Typography>`;
    case 'Avatar':
      return `${indent}<Avatar variant="${props.variant}" sx={{ bgcolor: '${props.bgColor}' }}>${props.text}</Avatar>`;
    case 'Badge':
      return `${indent}<Badge badgeContent="${props.badgeContent}" color="${props.color}"${sxStr}><MailIcon color="action" /></Badge>`;
    case 'Chip':
      return `${indent}<Chip label="${props.label}" variant="${props.variant}" color="${props.color}" size="${props.size}"${props.clickable ? ' clickable' : ''}${sxStr} />`;
    case 'Divider':
      return props.text
        ? `${indent}<Divider textAlign="${props.textAlign}"${sxStr}>${props.text}</Divider>`
        : `${indent}<Divider${sxStr} />`;
    case 'List':
      return `${indent}<List${props.dense ? ' dense' : ''}${sxStr}>${nl}${(props.items as string[]).map(i => `${indent}  <ListItem><ListItemText primary="${i}" /></ListItem>`).join(nl)}${nl}${indent}</List>`;
    case 'Table': {
      const cols = (props.columns as string[]) || ['#', 'Name', 'Email'];
      const rows = (props.rows as string[]) || ['1,Alice,alice@mail.com'];
      return `${indent}<TableContainer component={Paper}${sxStr}>${nl}${indent}  <Table size="${props.size}">${nl}${indent}    <TableHead>${nl}${indent}      <TableRow>${nl}${cols.map(c => `${indent}        <TableCell>${c}</TableCell>`).join(nl)}${nl}${indent}      </TableRow>${nl}${indent}    </TableHead>${nl}${indent}    <TableBody>${nl}${rows.map(row => {
        const cells = String(row).split(',');
        return `${indent}      <TableRow>${nl}${cols.map((_, ci) => `${indent}        <TableCell>${cells[ci] ?? ''}</TableCell>`).join(nl)}${nl}${indent}      </TableRow>`;
      }).join(nl)}${nl}${indent}    </TableBody>${nl}${indent}  </Table>${nl}${indent}</TableContainer>`;
    }
    case 'Tooltip':
      return `${indent}<Tooltip title="${props.title}" placement="${props.placement}"${props.arrow ? ' arrow' : ''}>${nl}${indent}  <Button variant="outlined" size="small">Hover me</Button>${nl}${indent}</Tooltip>`;
    case 'Image':
      return `${indent}<Box component="img" src="${props.src}" alt="${props.alt}" sx={{ objectFit: '${props.objectFit}', width: '100%', height: 'auto', maxWidth: ${node.size.width} }} />`;
    case 'AppBar': {
      const appActions = (props.actions as string[]) || ['Login'];
      return `${indent}<AppBar position="static" color="${props.color}"${sxStr}>${nl}${indent}  <Toolbar>${nl}${indent}    <Typography variant="h6" sx={{ flexGrow: 1 }}>${props.title}</Typography>${nl}${appActions.map(a => `${indent}    <Button color="inherit">${a}</Button>`).join(nl)}${nl}${indent}  </Toolbar>${nl}${indent}</AppBar>`;
    }
    case 'Tabs':
      return `${indent}<Tabs value={0} textColor="${props.color}" indicatorColor="${props.color}"${sxStr}>${nl}${(props.tabs as string[]).map(t => `${indent}  <Tab label="${t}" />`).join(nl)}${nl}${indent}</Tabs>`;
    case 'Breadcrumbs': {
      const items = props.items as string[];
      return `${indent}<Breadcrumbs${sxStr}>${nl}${items.map((it, i) => i === items.length - 1 ? `${indent}  <Typography color="text.primary">${it}</Typography>` : `${indent}  <Link underline="hover" color="inherit" href="#">${it}</Link>`).join(nl)}${nl}${indent}</Breadcrumbs>`;
    }
    case 'Pagination':
      return `${indent}<Pagination count={${props.count}} color="${props.color}" shape="${props.shape}" variant="${props.variant}" size="${props.size}"${sxStr} />`;
    case 'Stepper':
      return `${indent}<Stepper activeStep={${props.activeStep}} orientation="${props.orientation}"${sxStr}>${nl}${(props.steps as string[]).map(s => `${indent}  <Step><StepLabel>${s}</StepLabel></Step>`).join(nl)}${nl}${indent}</Stepper>`;
    case 'Alert':
      return `${indent}<Alert severity="${props.severity}" variant="${props.variant}"${sxStr}>${props.text}</Alert>`;
    case 'CircularProgress':
      return `${indent}<CircularProgress variant="${props.variant}" color="${props.color}" size={${props.size}}${props.variant === 'determinate' ? ` value={${props.value}}` : ''}${sxStr} />`;
    case 'LinearProgress':
      return `${indent}<LinearProgress variant="${props.variant}" color="${props.color}"${props.variant === 'determinate' ? ` value={${props.value}}` : ''} sx={{ width: '100%'${Object.keys(sx).length ? ', ' + Object.entries(sx).map(([k, v]) => `${k}: ${typeof v === 'number' ? v : `'${v}'`}`).join(', ') : ''} }} />`;
    case 'Skeleton':
      return `${indent}<Skeleton variant="${props.variant}" width="100%" height={${node.size.height}} animation="${props.animation}"${sxStr} />`;
    case 'BottomNavigation':
      return `${indent}<BottomNavigation showLabels value={0}${sxStr}>${nl}${(props.items as string[])?.map((item, i) => `${indent}  <BottomNavigationAction label="${item}" icon={${['<RestoreIcon />', '<FavoriteIcon />', '<LocationIcon />'][i % 3]}} />`).join(nl)}${nl}${indent}</BottomNavigation>`;
    case 'SpeedDial': {
      const sdActions = (props.actions as string[]) || ['Edit', 'Share', 'Print'];
      const sdIcons = ['<EditIcon />', '<ShareIcon />', '<PrintIcon />', '<MailIcon />', '<FavoriteIcon />'];
      const sxInner = Object.keys(sx).length ? ', ' + Object.entries(sx).map(([k, v]) => `${k}: ${typeof v === 'number' ? v : `'${v}'`}`).join(', ') : '';
      return `${indent}<Box sx={{ position: 'relative', height: 80${sxInner} }}>${nl}${indent}  <SpeedDial ariaLabel="Speed Dial" icon={<AddIcon />} direction="${props.direction}" sx={{ position: 'absolute', bottom: 8, right: 8 }}>${nl}${sdActions.map((a, i) => `${indent}    <SpeedDialAction icon={${sdIcons[i % sdIcons.length]}} tooltipTitle="${a}" />`).join(nl)}${nl}${indent}  </SpeedDial>${nl}${indent}</Box>`;
    }
    case 'Snackbar':
      return `${indent}<Paper elevation={6} sx={{ px: 2, py: 1, bgcolor: '#323232', color: '#fff' }}>${nl}${indent}  <Typography variant="body2">${props.message}</Typography>${nl}${indent}</Paper>`;
    case 'Dialog': {
      const dlgActions = (props.actions as string[]) || ['Cancel', 'OK'];
      return `${indent}<Paper variant="outlined" sx={{ p: 3 }}>${nl}${indent}  <Typography variant="h6" gutterBottom>${props.title}</Typography>${nl}${indent}  <Typography variant="body2" color="text.secondary">${props.content}</Typography>${nl}${indent}  <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 2 }}>${nl}${dlgActions.map((a, i) => `${indent}    <Button size="small"${i === dlgActions.length - 1 ? ' variant="contained"' : ''}>${a}</Button>`).join(nl)}${nl}${indent}  </Box>${nl}${indent}</Paper>`;
    }
    case 'Drawer': {
      const drawerTitle = (props.title as string) || 'Drawer';
      const menuItems = (props.menuItems as string[]) || ['Menu 1', 'Menu 2', 'Menu 3'];
      const drawerCode = generateDrawerNested(menuItems, indent + '  ');
      const sxInner = Object.keys(sx).length ? ', ' + Object.entries(sx).map(([k, v]) => `${k}: ${typeof v === 'number' ? v : `'${v}'`}`).join(', ') : '';
      return `${indent}<Paper variant="outlined" sx={{ width: ${props.width}${sxInner} }}>${nl}${indent}  <Typography variant="subtitle2" sx={{ px: 2, pt: 2, pb: 1 }}>${drawerTitle}</Typography>${nl}${indent}  <Divider />${nl}${drawerCode}${nl}${indent}</Paper>`;
    }
    default:
      return `${indent}{/* ${type} */}`;
  }
}

/* --- Container rendering with children -------------------- */

function renderLayoutNode(ln: LayoutNode, indent: string): string {
  const { node } = ln;
  const nl = '\n';
  const sx = sxObj(node.sx ?? {});

  // If no children, render as leaf
  if (ln.children.length === 0) {
    return renderLeafContainer(ln, indent);
  }

  const direction = inferDirection(ln.children);
  const spacing = computeSpacing(ln.children, direction);
  const sorted = sortByPosition(ln.children, direction);
  const childIndent = indent + '  ';
  const childCode = sorted.map(c => renderLayoutNode(c, childIndent + '  ')).join(nl);

  switch (node.type) {
    case 'Card': {
      const cardSx = { ...sx };
      delete cardSx.bgcolor; // Card handles its own bg
      const sxStr = sxToInline(cardSx, indent);
      return [
        `${indent}<Card elevation={${node.props.elevation ?? 1}}${sxStr}>`,
        node.props.title ? `${childIndent}<CardHeader title="${node.props.title}" />` : '',
        `${childIndent}<CardContent>`,
        `${childIndent}  <Stack direction="${direction}" spacing={${spacing}}>`,
        childCode,
        `${childIndent}  </Stack>`,
        `${childIndent}</CardContent>`,
        `${indent}</Card>`,
      ].filter(Boolean).join(nl);
    }

    case 'Paper': {
      const sxStr = sxToInline({ p: 2, ...sx }, indent);
      return [
        `${indent}<Paper elevation={${node.props.elevation ?? 1}} variant="${node.props.variant ?? 'elevation'}"${sxStr}>`,
        `${childIndent}<Stack direction="${direction}" spacing={${spacing}}>`,
        childCode,
        `${childIndent}</Stack>`,
        `${indent}</Paper>`,
      ].join(nl);
    }

    case 'Accordion': {
      const sxStr = sxToInline(sx, indent);
      return [
        `${indent}<Accordion${node.props.defaultExpanded ? ' defaultExpanded' : ''}${sxStr}>`,
        `${childIndent}<AccordionSummary expandIcon={<ExpandMoreIcon />}>`,
        `${childIndent}  <Typography>${node.props.title}</Typography>`,
        `${childIndent}</AccordionSummary>`,
        `${childIndent}<AccordionDetails>`,
        `${childIndent}  <Stack direction="${direction}" spacing={${spacing}}>`,
        childCode,
        `${childIndent}  </Stack>`,
        `${childIndent}</AccordionDetails>`,
        `${indent}</Accordion>`,
      ].join(nl);
    }

    case 'Stack': {
      const dir = node.props.direction as string || direction;
      const sp = node.props.spacing as number || spacing;
      const sxStr = sxToInline(sx, indent);
      return [
        `${indent}<Stack direction="${dir}" spacing={${sp}}${node.props.alignItems ? ` alignItems="${node.props.alignItems}"` : ''}${node.props.justifyContent ? ` justifyContent="${node.props.justifyContent}"` : ''}${sxStr}>`,
        childCode,
        `${indent}</Stack>`,
      ].join(nl);
    }

    case 'Grid': {
      const cols = node.props.columns as number || 12;
      const sp = node.props.spacing as number || spacing;
      const itemWidth = Math.round(cols / Math.max(1, estimateColumns(sorted)));
      const sxStr = sxToInline(sx, indent);
      return [
        `${indent}<Grid container spacing={${sp}} columns={${cols}}${sxStr}>`,
        ...sorted.map(c => {
          const inner = renderLayoutNode(c, childIndent + '  ');
          return `${childIndent}<Grid size={${itemWidth}}>${nl}${inner}${nl}${childIndent}</Grid>`;
        }),
        `${indent}</Grid>`,
      ].join(nl);
    }

    case 'Container': {
      const sxStr = sxToInline(sx, indent);
      return [
        `${indent}<Container maxWidth="${node.props.maxWidth ?? 'lg'}"${node.props.fixed ? ' fixed' : ''}${sxStr}>`,
        `${childIndent}<Stack direction="${direction}" spacing={${spacing}}>`,
        childCode,
        `${childIndent}</Stack>`,
        `${indent}</Container>`,
      ].join(nl);
    }

    case 'Box':
    default: {
      const sxStr = sxToInline(sx, indent);
      return [
        `${indent}<Box${sxStr}>`,
        `${childIndent}<Stack direction="${direction}" spacing={${spacing}}>`,
        childCode,
        `${childIndent}</Stack>`,
        `${indent}</Box>`,
      ].join(nl);
    }
  }
}

/** Render a container that has no children dropped inside it */
function renderLeafContainer(ln: LayoutNode, indent: string): string {
  const { node } = ln;
  const sx = sxObj(node.sx ?? {});
  const nl = '\n';

  switch (node.type) {
    case 'Card': {
      const sxStr = sxToInline(sx, indent);
      return [
        `${indent}<Card elevation={${node.props.elevation ?? 1}}${sxStr}>`,
        node.props.title ? `${indent}  <CardHeader title="${node.props.title}" />` : '',
        `${indent}  <CardContent>`,
        `${indent}    <Typography variant="body2" color="text.secondary">${node.props.content ?? ''}</Typography>`,
        `${indent}  </CardContent>`,
        `${indent}</Card>`,
      ].filter(Boolean).join(nl);
    }
    case 'Paper': {
      const sxStr = sxToInline({ p: 2, ...sx }, indent);
      return `${indent}<Paper elevation={${node.props.elevation ?? 1}} variant="${node.props.variant ?? 'elevation'}"${sxStr} />`;
    }
    case 'Accordion': {
      const sxStr = sxToInline(sx, indent);
      return [
        `${indent}<Accordion${node.props.defaultExpanded ? ' defaultExpanded' : ''}${sxStr}>`,
        `${indent}  <AccordionSummary expandIcon={<ExpandMoreIcon />}>`,
        `${indent}    <Typography>${node.props.title}</Typography>`,
        `${indent}  </AccordionSummary>`,
        `${indent}  <AccordionDetails>`,
        `${indent}    <Typography variant="body2">${node.props.content ?? ''}</Typography>`,
        `${indent}  </AccordionDetails>`,
        `${indent}</Accordion>`,
      ].join(nl);
    }
    case 'Box': {
      const sxStr = sxToInline(sx, indent);
      return `${indent}<Box${sxStr} />`;
    }
    case 'Stack': {
      const sxStr = sxToInline(sx, indent);
      return `${indent}<Stack direction="${node.props.direction ?? 'column'}" spacing={${node.props.spacing ?? 2}}${sxStr} />`;
    }
    case 'Grid': {
      const cols = Number(node.props.cols) || 3;
      const gridCols = (node.props.columns as number) || 12;
      const itemSize = Math.max(1, Math.floor(gridCols / cols));
      const sp = node.props.spacing as number || 2;
      const sxStr = sxToInline(sx, indent);
      return `${indent}<Grid container spacing={${sp}} columns={${gridCols}}${sxStr}>${nl}${Array.from({ length: cols }, (_, i) => `${indent}  <Grid size={${itemSize}}>${nl}${indent}    {/* Column ${i + 1} content */}${nl}${indent}  </Grid>`).join(nl)}${nl}${indent}</Grid>`;
    }
    case 'Container': {
      const sxStr = sxToInline(sx, indent);
      return `${indent}<Container maxWidth="${node.props.maxWidth ?? 'lg'}"${sxStr} />`;
    }
    default:
      return leafJsx(node, indent);
  }
}

/** Estimate how many columns a group of items forms */
function estimateColumns(items: LayoutNode[]): number {
  if (items.length <= 1) return 1;
  const rows: number[][] = [];
  let currentRowY = items[0].relY;
  let currentCount = 1;
  for (let i = 1; i < items.length; i++) {
    if (Math.abs(items[i].relY - currentRowY) < ROW_TOLERANCE) {
      currentCount++;
    } else {
      rows.push([currentCount]);
      currentRowY = items[i].relY;
      currentCount = 1;
    }
  }
  rows.push([currentCount]);
  return Math.max(...rows.map(r => r[0]));
}

/* --- Main generator ----------------------------------------- */

function collectDrawerStates(tree: LayoutNode[]): string[] {
  const states: string[] = [];
  function walk(nodes: LayoutNode[]) {
    for (const ln of nodes) {
      if (ln.node.type === 'Drawer') {
        const menuItems = (ln.node.props.menuItems as string[]) || [];
        const menuTree = buildCodegenMenuTree(menuItems);
        for (const n of menuTree) {
          const result = renderMenuNode(n, '', '');
          states.push(...result.states);
        }
      }
      if (ln.children.length > 0) walk(ln.children);
    }
  }
  walk(tree);
  return states;
}

/* ─── Band-based flex layout helpers ───────────────────────── */

interface Band {
  top: number;
  bottom: number;
  nodes: LayoutNode[];
}

/** Group root nodes into bands by vertical overlap so side-by-side items share a row */
function groupIntoBands(tree: LayoutNode[]): Band[] {
  if (tree.length === 0) return [];
  const sorted = [...tree].sort((a, b) => a.relY - b.relY);
  const bands: Band[] = [];

  for (const ln of sorted) {
    const nTop = ln.relY;
    const nBot = nTop + ln.node.size.height;
    let merged = false;
    for (const band of bands) {
      if (nTop < band.bottom + ROW_TOLERANCE && nBot > band.top - ROW_TOLERANCE) {
        band.nodes.push(ln);
        band.top = Math.min(band.top, nTop);
        band.bottom = Math.max(band.bottom, nBot);
        merged = true;
        break;
      }
    }
    if (!merged) {
      bands.push({ top: nTop, bottom: nBot, nodes: [ln] });
    }
  }

  bands.sort((a, b) => a.top - b.top);
  for (const b of bands) b.nodes.sort((a, b) => a.relX - b.relX);
  return bands;
}

/** Convert px to MUI spacing units (1 unit = 8px), clamped ≥ 0 */
function pxToSpacing(px: number): number {
  return Math.max(0, Math.round(px / MUI_SPACING_UNIT));
}

/** Determine horizontal alignment relative to the frame */
function inferAlign(ln: LayoutNode, fw: number): 'left' | 'center' | 'right' {
  const cx = ln.relX + ln.node.size.width / 2;
  const half = fw / 2;
  if (Math.abs(cx - half) <= fw * 0.15) return 'center';
  if (cx > fw * 0.65) return 'right';
  return 'left';
}

/** Render root-level bands using flex layout – produces clean, idiomatic code */
function renderBands(bands: Band[], frameW: number, baseIndent: string): string {
  const nl = '\n';
  const lines: string[] = [];
  let prevBottom = 0;

  for (let bi = 0; bi < bands.length; bi++) {
    const band = bands[bi];
    const gap = bi === 0 ? band.top : Math.max(0, band.top - prevBottom);
    const mt = pxToSpacing(gap);

    if (band.nodes.length === 1) {
      /* ── Single-item band: use alignment + margin ── */
      const ln = band.nodes[0];
      const align = inferAlign(ln, frameW);
      const w = ln.node.size.width;

      const sxParts: string[] = [`width: ${w}`];
      if (mt > 0) sxParts.push(`mt: ${mt}`);

      if (align === 'center') {
        sxParts.push(`mx: 'auto'`);
      } else if (align === 'right') {
        sxParts.push(`ml: 'auto'`);
        const mr = pxToSpacing(frameW - (ln.relX + w));
        if (mr > 0 && mr < pxToSpacing(frameW * 0.35)) sxParts.push(`mr: ${mr}`);
      } else {
        const ml = pxToSpacing(ln.relX);
        if (ml > 0) sxParts.push(`ml: ${ml}`);
      }

      const inner = renderLayoutNode(ln, baseIndent + '  ');
      lines.push(`${baseIndent}<Box sx={{ ${sxParts.join(', ')} }}>`);
      lines.push(inner);
      lines.push(`${baseIndent}</Box>`);
    } else {
      /* ── Multi-item band: flex row with spacers ── */
      const rowSx: string[] = [`display: 'flex'`, `alignItems: 'flex-start'`];
      if (mt > 0) rowSx.push(`mt: ${mt}`);

      lines.push(`${baseIndent}<Box sx={{ ${rowSx.join(', ')} }}>`);

      let prevRight = 0;
      for (let ci = 0; ci < band.nodes.length; ci++) {
        const ln = band.nodes[ci];
        const w = ln.node.size.width;
        const vertOffset = pxToSpacing(ln.relY - band.top);
        const itemSx: string[] = [`width: ${w}`];
        if (vertOffset > 0) itemSx.push(`mt: ${vertOffset}`);

        if (ci === 0) {
          // First item — offset from left edge
          const ml = pxToSpacing(ln.relX);
          if (ml > 0) itemSx.push(`ml: ${ml}`);
        } else {
          const gapFromPrev = ln.relX - prevRight;
          const remainingSpace = frameW - prevRight;

          if (gapFromPrev > remainingSpace * 0.4) {
            // Large gap → insert a flex spacer (real-world pattern)
            lines.push(`${baseIndent}  <Box sx={{ flex: 1 }} />`);
            const mr = pxToSpacing(frameW - (ln.relX + w));
            if (mr > 0 && mr < pxToSpacing(frameW * 0.35)) itemSx.push(`mr: ${mr}`);
          } else {
            const ml = pxToSpacing(gapFromPrev);
            if (ml > 0) itemSx.push(`ml: ${ml}`);
          }
        }

        const inner = renderLayoutNode(ln, baseIndent + '    ');
        lines.push(`${baseIndent}  <Box sx={{ ${itemSx.join(', ')} }}>`);
        lines.push(inner);
        lines.push(`${baseIndent}  </Box>`);
        prevRight = ln.relX + w;
      }

      lines.push(`${baseIndent}</Box>`);
    }
    prevBottom = band.bottom;
  }

  return lines.join(nl);
}

/* --- Main generator ----------------------------------------- */

export function generateReactCode(nodes: CanvasNode[], frame?: DeviceFrame): string {
  const ox = frame?.x ?? 0;
  const oy = frame?.y ?? 0;

  // Build the layout tree (containment hierarchy)
  const tree = buildLayoutTree(nodes, ox, oy);

  // Collect imports from the tree
  const { mui, icons } = collectImports(tree);
  // Always need Box for layout wrapper
  mui.add('Box');

  // Build code
  let code = `import React from 'react';\n`;
  const muiArr = Array.from(mui).sort();
  if (muiArr.length > 0) {
    code += `import {\n  ${muiArr.join(',\n  ')}\n} from '@mui/material';\n`;
  }
  const iconArr = Array.from(icons).sort();
  if (iconArr.length > 0) {
    code += `import {\n  ${iconArr.map(i => `${i} as ${i}Icon`).join(',\n  ')}\n} from '@mui/icons-material';\n`;
  }

  // Collect any nested drawer state variables needed
  const drawerStates = collectDrawerStates(tree);

  code += `\nconst GeneratedPage: React.FC = () => {\n`;
  if (drawerStates.length > 0) {
    for (const s of drawerStates) {
      code += `  const [${s}, set${s.charAt(0).toUpperCase() + s.slice(1)}] = React.useState(false);\n`;
    }
    code += `\n`;
  }
  code += `  return (\n`;
  const frameW = frame?.width ?? 1280;
  const frameH = frame?.height ?? 800;
  const frameBg = frame?.bgColor && frame.bgColor !== '#ffffff' ? `, bgcolor: '${frame.bgColor}'` : '';

  // Root container uses flex column — clean, production-quality layout
  code += `    <Box sx={{ width: ${frameW}, minHeight: ${frameH}, mx: 'auto', display: 'flex', flexDirection: 'column'${frameBg} }}>\n`;

  // Group root nodes into visual bands and render with flex layout
  const bands = groupIntoBands(tree);
  if (bands.length === 0) {
    code += `      {/* No components */}\n`;
  } else {
    code += renderBands(bands, frameW, '      ') + '\n';
  }

  code += `    </Box>\n`;
  code += `  );\n`;
  code += `};\n\nexport default GeneratedPage;\n`;

  return code;
}
