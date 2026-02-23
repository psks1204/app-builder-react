import type { CanvasNode, DeviceFrame } from '../store/types';

// ============================================================
// Smart Code Generator — produces production-quality React code
// with ICG Design System components + MUI layout containers.
// ============================================================

/* ─── Constants ──────────────────────────────────────────── */

const CONTAINER_TYPES = new Set(['Card', 'Paper', 'Box', 'Stack', 'Grid', 'Container', 'Accordion']);
const MUI_SPACING_UNIT = 8; // MUI default theme.spacing(1) = 8px
const ROW_TOLERANCE = 30;   // px — items within this vertical range are "same row"
const GAP_THRESHOLD = 60;   // px — min gap to insert extra spacing

/* ─── Import maps (ICG components + MUI layout) ──────────── */

// ICG library component imports
const icgImports: Record<string, string[]> = {
  Button: ['Button'],
  IconButton: ['Button', 'Icon'],
  ButtonGroup: ['Button'],
  TextField: ['Input'],
  Select: ['Select'],
  Checkbox: ['Checkbox'],
  Radio: ['Radio'],
  Switch: ['Switch'],
  Slider: ['Slider'],
  DatePicker: ['DatePicker'],
  Upload: ['Upload', 'Button'],
  Typography: [],  // rendered as HTML
  Avatar: ['Avatar'],
  Badge: ['Badge'],
  Tag: ['Tag'],
  Divider: [],  // rendered as HTML <hr>
  List: [],  // rendered as HTML divs
  Table: ['Table'],
  Tooltip: ['Tooltip', 'Button'],
  Image: [],  // rendered as HTML <img>
  Carousel: ['Carousel'],
  Card: ['Card'],
  Paper: ['Section'],
  Accordion: ['Collapse'],
  AppBar: ['Menu'],
  Tabs: ['Tabs'],
  Breadcrumbs: ['Breadcrumb'],
  Drawer: ['Menu'],
  Pagination: ['Pagination'],
  Stepper: ['Stepper'],
  Dropdown: ['Dropdown', 'Menu', 'Button'],
  Alert: ['Alert'],
  Notification: [],  // rendered as HTML divs (static preview)
  Modal: ['Button'],  // rendered as HTML card (static preview)
  Loading: ['Loading'],
  Popover: ['Popover', 'Button'],
};

// MUI layout components
const muiLayoutImports: Record<string, string[]> = {
  Box: ['Box'],
  Stack: ['Stack'],
  Grid: ['Grid'],
  Container: ['Container'],
};

/* ─── Types for layout tree ──────────────────────────────── */

interface LayoutNode {
  node: CanvasNode;
  /** Position relative to parent container (or frame origin) */
  relX: number;
  relY: number;
  children: LayoutNode[];
}

type LayoutDirection = 'column' | 'row' | 'wrap';

/* ─── Step 1: Build containment tree ─────────────────────── */

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
  const byAreaAsc = [...sorted].reverse();

  for (const child of byAreaAsc) {
    if (assigned.has(child.id)) continue;

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

/* ─── Step 2: Infer layout direction for siblings ──────────── */

function inferDirection(children: LayoutNode[]): LayoutDirection {
  if (children.length <= 1) return 'column';

  const sorted = [...children].sort((a, b) => a.relY - b.relY || a.relX - b.relX);

  // Check if all items are roughly on the same Y → row
  const yValues = sorted.map(c => c.relY);
  const yRange = Math.max(...yValues) - Math.min(...yValues);
  if (yRange < ROW_TOLERANCE) return 'row';

  // Check if items form distinct rows with multiple items → wrap/grid
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

/* ─── Step 3: Sort children by visual position ─────────────── */

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

/* ─── Import collector ───────────────────────────────────── */

function collectImports(tree: LayoutNode[]) {
  const icg = new Set<string>();
  const mui = new Set<string>();

  function walk(nodes: LayoutNode[]) {
    for (const ln of nodes) {
      const type = ln.node.type;
      // ICG components
      const ci = icgImports[type];
      if (ci) ci.forEach((n) => icg.add(n));
      // MUI layout components
      const mi = muiLayoutImports[type];
      if (mi) mi.forEach((n) => mui.add(n));
      // Containers with children use <Stack> as internal layout wrapper
      if (ln.children.length > 0 && CONTAINER_TYPES.has(type)) {
        mui.add('Stack');
      }
      if (ln.children.length > 0) walk(ln.children);
    }
  }
  walk(tree);
  return { icg, mui };
}

/* ─── SX helper ──────────────────────────────────────────── */

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

/** Convert sx-like object to inline style string for ICG components */
function styleToInline(sx: Record<string, unknown>, indent: string): string {
  const map: Record<string, string> = {
    p: 'padding', pt: 'paddingTop', pr: 'paddingRight', pb: 'paddingBottom', pl: 'paddingLeft',
    m: 'margin', mt: 'marginTop', mr: 'marginRight', mb: 'marginBottom', ml: 'marginLeft',
    bgcolor: 'backgroundColor', color: 'color',
    border: 'border', borderRadius: 'borderRadius',
    width: 'width', height: 'height', display: 'display',
    flexDirection: 'flexDirection', alignItems: 'alignItems', justifyContent: 'justifyContent',
    gap: 'gap', overflow: 'overflow', opacity: 'opacity', boxShadow: 'boxShadow',
  };
  const spacingKeys = new Set(['p', 'pt', 'pr', 'pb', 'pl', 'm', 'mt', 'mr', 'mb', 'ml']);
  const entries = Object.entries(sx).filter(([k, v]) => v !== undefined && v !== '' && !k.startsWith('&'));
  if (entries.length === 0) return '';

  const parts: string[] = [];
  for (const [k, v] of entries) {
    const cssProp = map[k] || k;
    if (spacingKeys.has(k) && typeof v === 'number') {
      parts.push(`${cssProp}: ${v * 8}`);
    } else if (typeof v === 'number') {
      parts.push(`${cssProp}: ${v}`);
    } else {
      parts.push(`${cssProp}: '${v}'`);
    }
  }

  if (parts.length <= 3) {
    return ` style={{ ${parts.join(', ')} }}`;
  }
  return ` style={{\n${parts.map(p => `${indent}  ${p}`).join(',\n')}\n${indent}}}`;
}

/* ─── Nested menu tree for Drawer codegen ──────────────────── */

interface CodegenMenuNode {
  label: string;
  key: string;
  children: CodegenMenuNode[];
}

let _menuKeyCounter = 0;

function buildCodegenMenuTree(items: string[]): CodegenMenuNode[] {
  _menuKeyCounter = 0;
  const root: CodegenMenuNode[] = [];
  for (const raw of items) {
    const parts = raw.split('>').map((s) => s.trim()).filter(Boolean);
    let level = root;
    for (let i = 0; i < parts.length; i++) {
      let existing = level.find((n) => n.label === parts[i]);
      if (!existing) {
        existing = { label: parts[i], key: `menu-${_menuKeyCounter++}`, children: [] };
        level.push(existing);
      }
      level = existing.children;
    }
  }
  return root;
}

/** Convert menu tree to ICG Menu items array string for codegen */
function menuItemsToCode(nodes: CodegenMenuNode[], indent: string): string {
  const items = nodes.map(n => {
    if (n.children.length > 0) {
      return `${indent}  { key: '${n.key}', label: '${n.label}', children: [\n${menuItemsToCode(n.children, indent + '    ')}\n${indent}  ] }`;
    }
    return `${indent}  { key: '${n.key}', label: '${n.label}' }`;
  });
  return items.join(',\n');
}

/* ─── Node → JSX (leaf, no children wrapping) ──────────────── */

function leafJsx(node: CanvasNode, indent: string): string {
  const { type, props, sx: rawSx } = node;
  const sx = sxObj(rawSx ?? {});
  const sxStr = sxToInline(sx, indent);
  const styleStr = styleToInline(sx, indent);
  const nl = '\n';

  switch (type) {
    case 'Button':
      return `${indent}<Button type="${props.type}" size="${props.size}"${props.danger ? ' danger' : ''}${props.disabled ? ' disabled' : ''}${props.block ? ' block' : ''}${props.shape && props.shape !== 'default' ? ` shape="${props.shape}"` : ''}${styleStr}>${props.label}</Button>`;

    case 'IconButton':
      return `${indent}<Button type="${props.type}" shape="${props.shape}" size="${props.size}" icon={<Icon type="${props.iconType}" />}${props.disabled ? ' disabled' : ''}${styleStr} />`;

    case 'ButtonGroup':
      return `${indent}<Button.Group size="${props.size}"${styleStr}>${nl}${(props.buttons as string[]).map(b => `${indent}  <Button>${b}</Button>`).join(nl)}${nl}${indent}</Button.Group>`;

    case 'TextField':
      return `${indent}<Input placeholder="${props.placeholder}" size="${props.size}"${props.disabled ? ' disabled' : ''}${props.allowClear ? ' allowClear' : ''} style={{ width: '100%' }} />`;

    case 'Select': {
      const opts = (props.options as string[]) || [];
      const optionsCode = opts.map(o => `{ value: '${o}', label: '${o}' }`).join(', ');
      return `${indent}<Select placeholder="${props.placeholder}" size="${props.size}" options={[${optionsCode}]}${props.disabled ? ' disabled' : ''}${props.allowClear ? ' allowClear' : ''}${props.showSearch ? ' showSearch' : ''} style={{ width: '100%' }} />`;
    }

    case 'Checkbox':
      return `${indent}<Checkbox${props.disabled ? ' disabled' : ''}>${props.label}</Checkbox>`;

    case 'Radio': {
      const radioOpts = (props.options as string[]) || [];
      return `${indent}<Radio.Group options={${JSON.stringify(radioOpts)}} optionType="${props.optionType}" buttonStyle="${props.buttonStyle}" defaultValue="${radioOpts[0]}" />`;
    }

    case 'Switch':
      return `${indent}<div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>${nl}${indent}  <Switch${props.disabled ? ' disabled' : ''} size="${props.size}" />${nl}${indent}  <span>${props.label}</span>${nl}${indent}</div>`;

    case 'Slider':
      return `${indent}<Slider defaultValue={${props.value}} min={${props.min}} max={${props.max}} step={${props.step}}${props.disabled ? ' disabled' : ''} />`;

    case 'DatePicker':
      return `${indent}<DatePicker placeholder="${props.placeholder}" size="${props.size}"${props.disabled ? ' disabled' : ''} picker="${props.picker}" style={{ width: '100%' }} />`;

    case 'Upload':
      return `${indent}<Upload listType="${props.listType}">${nl}${indent}  <Button>${props.text}</Button>${nl}${indent}</Upload>`;

    case 'Typography': {
      const level = props.level as string;
      const tagMap: Record<string, string> = { h1: 'h1', h2: 'h2', h3: 'h3', h4: 'h4', h5: 'h5', body: 'p', caption: 'span' };
      const tag = tagMap[level] || 'p';
      const align = props.align && props.align !== 'left' ? ` style={{ textAlign: '${props.align}' }}` : '';
      return `${indent}<${tag}${align}>${props.text}</${tag}>`;
    }

    case 'Avatar':
      return `${indent}<Avatar shape="${props.shape}" size="${props.size}" style={{ backgroundColor: '${props.bgColor}' }}>${props.text}</Avatar>`;

    case 'Badge':
      return `${indent}<Badge count={${props.count}}${props.dot ? ' dot' : ''} status="${props.status}">${nl}${indent}  <div style={{ width: 32, height: 32, borderRadius: 4, backgroundColor: '#e8e8e8' }} />${nl}${indent}</Badge>`;

    case 'Tag':
      return `${indent}<Tag color="${props.color}"${props.closable ? ' closable' : ''}${!props.bordered ? ' bordered={false}' : ''}>${props.label}</Tag>`;

    case 'Divider':
      return props.text
        ? `${indent}<hr style={{ borderTop: '${props.dashed ? '1px dashed #d9d9d9' : '1px solid #d9d9d9'}', margin: '12px 0' }} />`
        : `${indent}<hr style={{ borderTop: '${props.dashed ? '1px dashed #d9d9d9' : '1px solid #d9d9d9'}', margin: '12px 0' }} />`;

    case 'List': {
      const items = (props.items as string[]) || [];
      return `${indent}<div style={{ border: ${props.bordered ? "'1px solid #d9d9d9'" : "'none'"}, borderRadius: 4 }}>${nl}${items.map(item => `${indent}  <div style={{ padding: '12px 16px', borderBottom: '1px solid #f0f0f0' }}>${item}</div>`).join(nl)}${nl}${indent}</div>`;
    }

    case 'Table': {
      const cols = (props.columns as string[]) || ['#', 'Name', 'Email'];
      const rows = (props.rows as string[]) || ['1,Alice,alice@mail.com'];
      const columnsCode = cols.map((c, i) => `{ title: '${c}', dataIndex: 'col${i}', key: 'col${i}' }`).join(`,\n${indent}    `);
      const dataCode = rows.map((row, ri) => {
        const cells = String(row).split(',');
        const fields = cols.map((_, ci) => `col${ci}: '${cells[ci] ?? ''}'`).join(', ');
        return `{ key: '${ri}', ${fields} }`;
      }).join(`,\n${indent}    `);
      return `${indent}<Table${nl}${indent}  columns={[${nl}${indent}    ${columnsCode}${nl}${indent}  ]}${nl}${indent}  dataSource={[${nl}${indent}    ${dataCode}${nl}${indent}  ]}${nl}${indent}  size="${props.size}"${props.bordered ? ' bordered' : ''}${nl}${indent}  pagination={false}${nl}${indent}/>`;
    }

    case 'Tooltip':
      return `${indent}<Tooltip title="${props.title}" placement="${props.placement}">${nl}${indent}  <Button type="default" size="small">Hover me</Button>${nl}${indent}</Tooltip>`;

    case 'Image':
      return `${indent}<img src="${props.src}" alt="${props.alt}" style={{ objectFit: '${props.objectFit}', width: '100%', height: 'auto', maxWidth: ${node.size.width} }} />`;

    case 'Carousel': {
      const slides = (props.slides as string[]) || ['Slide 1', 'Slide 2'];
      return `${indent}<Carousel${props.autoplay ? ' autoplay' : ''}${!props.dots ? ' dots={false}' : ''} effect="${props.effect}">${nl}${slides.map((s, i) => `${indent}  <div><div style={{ height: 160, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'hsl(${(i * 60 + 200) % 360}, 50%, 85%)', fontSize: 18, fontWeight: 500 }}>${s}</div></div>`).join(nl)}${nl}${indent}</Carousel>`;
    }

    case 'AppBar': {
      const menuItems = (props.items as string[]) || ['Home', 'Products', 'About'];
      const itemsCode = menuItems.map((item, i) => `{ key: '${i}', label: '${item}' }`).join(', ');
      return `${indent}<Menu mode="${props.mode}" theme="${props.theme}" defaultSelectedKeys={['0']} items={[${itemsCode}]} />`;
    }

    case 'Tabs': {
      const tabs = (props.tabs as string[]) || ['Tab 1', 'Tab 2', 'Tab 3'];
      const itemsCode = tabs.map((t, i) => `{ key: '${i}', label: '${t}' }`).join(', ');
      return `${indent}<Tabs defaultActiveKey="0" type="${props.type}" size="${props.size}"${props.tabPosition && props.tabPosition !== 'top' ? ` tabPosition="${props.tabPosition}"` : ''} items={[${itemsCode}]} />`;
    }

    case 'Breadcrumbs': {
      const items = (props.items as string[]) || ['Home', 'Category', 'Current'];
      return `${indent}<Breadcrumb separator="${props.separator}">${nl}${items.map(it => `${indent}  <Breadcrumb.Item>${it}</Breadcrumb.Item>`).join(nl)}${nl}${indent}</Breadcrumb>`;
    }

    case 'Drawer': {
      const menuItems = (props.menuItems as string[]) || ['Dashboard', 'Settings'];
      const tree = buildCodegenMenuTree(menuItems);
      const itemsCode = menuItemsToCode(tree, indent + '  ');
      return `${indent}<div style={{ border: '1px solid #f0f0f0', borderRadius: 4 }}>${nl}${indent}  <div style={{ padding: '12px 16px', fontWeight: 600, borderBottom: '1px solid #f0f0f0' }}>${props.title}</div>${nl}${indent}  <Menu mode="${props.mode}" theme="${props.theme}" style={{ border: 'none' }} items={[${nl}${itemsCode}${nl}${indent}  ]} />${nl}${indent}</div>`;
    }

    case 'Pagination':
      return `${indent}<Pagination total={${props.total}} pageSize={${props.pageSize}} size="${props.size}"${props.showSizeChanger ? ' showSizeChanger' : ''}${props.showQuickJumper ? ' showQuickJumper' : ''}${props.simple ? ' simple' : ''} />`;

    case 'Stepper': {
      const steps = (props.steps as string[]) || ['Step 1', 'Step 2', 'Step 3'];
      const itemsCode = steps.map(s => `{ title: '${s}' }`).join(', ');
      return `${indent}<Stepper current={${props.current}} direction="${props.direction}" size="${props.size}" items={[${itemsCode}]} />`;
    }

    case 'Dropdown': {
      const items = (props.items as string[]) || ['Action 1', 'Action 2'];
      const itemsCode = items.map((item, i) => `{ key: '${i}', label: '${item}' }`).join(', ');
      return `${indent}<Dropdown overlay={<Menu items={[${itemsCode}]} />} placement="${props.placement}" trigger={['${props.trigger}']}>${nl}${indent}  <Button>${props.label} ▾</Button>${nl}${indent}</Dropdown>`;
    }

    case 'Alert':
      return `${indent}<Alert type="${props.type}"${props.closable ? ' closable' : ''} showIcon${props.banner ? ' banner' : ''}>${props.text}</Alert>`;

    case 'Notification':
      return `${indent}<div style={{ border: '1px solid #d9d9d9', borderRadius: 8, padding: 16, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>${nl}${indent}  <div style={{ fontWeight: 600, marginBottom: 4 }}>${props.message}</div>${nl}${indent}  <div style={{ color: '#666', fontSize: 13 }}>${props.description}</div>${nl}${indent}</div>`;

    case 'Modal':
      return `${indent}<div style={{ border: '1px solid #d9d9d9', borderRadius: 8, padding: 20, boxShadow: '0 4px 12px rgba(0,0,0,0.15)', backgroundColor: '#fff' }}>${nl}${indent}  <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 12 }}>${props.title}</div>${nl}${indent}  <div style={{ color: '#666', fontSize: 14, marginBottom: 20 }}>${props.content}</div>${nl}${indent}  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>${nl}${indent}    <Button>${props.cancelText || 'Cancel'}</Button>${nl}${indent}    <Button type="primary">${props.okText || 'OK'}</Button>${nl}${indent}  </div>${nl}${indent}</div>`;

    case 'Loading':
      return `${indent}<Loading spinning size="${props.size}"${props.tip ? ` tip="${props.tip}"` : ''} />`;

    case 'Popover':
      return `${indent}<Popover title="${props.title}" content="${props.content}" trigger="${props.trigger}" placement="${props.placement}">${nl}${indent}  <Button type="default" size="small">Hover me</Button>${nl}${indent}</Popover>`;

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
      const styleStr = styleToInline(sx, indent);
      return [
        `${indent}<Card title="${node.props.title ?? ''}"${node.props.bordered !== false ? ' bordered' : ''}${node.props.hoverable ? ' hoverable' : ''}${styleStr}>`,
        `${childIndent}<Stack direction="${direction}" spacing={${spacing}}>`,
        childCode,
        `${childIndent}</Stack>`,
        `${indent}</Card>`,
      ].filter(Boolean).join(nl);
    }

    case 'Paper': {
      const styleStr = styleToInline({ padding: 16, ...sx }, indent);
      return [
        `${indent}<Section title="${node.props.title ?? ''}"${node.props.bordered !== false ? ' bordered' : ''}${styleStr}>`,
        `${childIndent}<Stack direction="${direction}" spacing={${spacing}}>`,
        childCode,
        `${childIndent}</Stack>`,
        `${indent}</Section>`,
      ].join(nl);
    }

    case 'Accordion': {
      return [
        `${indent}<Collapse${node.props.defaultExpanded ? ' defaultActiveKey={["1"]}' : ''}${node.props.bordered !== false ? ' bordered' : ''}>`,
        `${childIndent}<Collapse.Panel header="${node.props.title}" key="1">`,
        `${childIndent}  <Stack direction="${direction}" spacing={${spacing}}>`,
        childCode,
        `${childIndent}  </Stack>`,
        `${childIndent}</Collapse.Panel>`,
        `${indent}</Collapse>`,
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
      return [
        `${indent}<Card title="${node.props.title ?? ''}"${node.props.bordered !== false ? ' bordered' : ''}${node.props.hoverable ? ' hoverable' : ''}>`,
        `${indent}  {/* Card content */}`,
        `${indent}</Card>`,
      ].filter(Boolean).join(nl);
    }
    case 'Paper': {
      const styleStr = styleToInline({ padding: 16, ...sx }, indent);
      return `${indent}<Section title="${node.props.title ?? ''}"${node.props.bordered !== false ? ' bordered' : ''}${styleStr} />`;
    }
    case 'Accordion': {
      return [
        `${indent}<Collapse${node.props.defaultExpanded ? ' defaultActiveKey={["1"]}' : ''}${node.props.bordered !== false ? ' bordered' : ''}>`,
        `${indent}  <Collapse.Panel header="${node.props.title}" key="1">`,
        `${indent}    <p>${node.props.content ?? ''}</p>`,
        `${indent}  </Collapse.Panel>`,
        `${indent}</Collapse>`,
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
          const ml = pxToSpacing(ln.relX);
          if (ml > 0) itemSx.push(`ml: ${ml}`);
        } else {
          const gapFromPrev = ln.relX - prevRight;
          const remainingSpace = frameW - prevRight;

          if (gapFromPrev > remainingSpace * 0.4) {
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
  const { icg, mui } = collectImports(tree);
  // Always need Box for layout wrapper
  mui.add('Box');

  // Build code
  let code = `import React from 'react';\n`;

  // ICG imports
  const icgArr = Array.from(icg).sort();
  if (icgArr.length > 0) {
    code += `import {\n  ${icgArr.join(',\n  ')}\n} from '@citi-icg-172888/icgds-react';\n`;
  }

  // MUI layout imports
  const muiArr = Array.from(mui).sort();
  if (muiArr.length > 0) {
    code += `import {\n  ${muiArr.join(',\n  ')}\n} from '@mui/material';\n`;
  }

  code += `\nconst GeneratedPage: React.FC = () => {\n`;
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
