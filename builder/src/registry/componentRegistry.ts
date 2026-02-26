// ============================================================
// ICG Component Registry — All ICG React component definitions
// ============================================================
import type { ComponentDefinition, ComponentCategory } from '../store/types';

export const componentCategories: ComponentCategory[] = [
  'Inputs',
  'Data Display',
  'Surfaces',
  'Navigation',
  'Feedback',
];

export const componentRegistry: ComponentDefinition[] = [
  // ── Inputs ────────────────────────────────────────────────
  {
    type: 'Button', displayName: 'Button', category: 'Inputs', icon: 'poweroff',
    codegenStrategy: 'button',
    defaultProps: { label: 'Button', type: 'primary', size: 'middle', disabled: false, danger: false },
    defaultSize: { width: 120, height: 40 },
    propSchema: [
      { name: 'label', label: 'Label', type: 'text', defaultValue: 'Button' },
      { name: 'type', label: 'Type', type: 'select', options: ['primary', 'default', 'dashed', 'text', 'link'], defaultValue: 'primary' },
      { name: 'size', label: 'Size', type: 'select', options: ['small', 'middle', 'large'], defaultValue: 'middle' },
      { name: 'danger', label: 'Danger', type: 'boolean', defaultValue: false },
      { name: 'disabled', label: 'Disabled', type: 'boolean', defaultValue: false },
      { name: 'block', label: 'Block', type: 'boolean', defaultValue: false },
      { name: 'shape', label: 'Shape', type: 'select', options: ['default', 'circle', 'round'], defaultValue: 'default' },
    ],
  },
  {
    type: 'Input', displayName: 'Input', category: 'Inputs', icon: 'edit',
    codegenStrategy: 'input',
    defaultProps: { placeholder: 'Enter text…', size: 'middle', disabled: false, allowClear: false },
    defaultSize: { width: 240, height: 40 },
    propSchema: [
      { name: 'placeholder', label: 'Placeholder', type: 'text', defaultValue: 'Enter text…' },
      { name: 'size', label: 'Size', type: 'select', options: ['small', 'middle', 'large'], defaultValue: 'middle' },
      { name: 'disabled', label: 'Disabled', type: 'boolean', defaultValue: false },
      { name: 'allowClear', label: 'Allow Clear', type: 'boolean', defaultValue: false },
    ],
  },
  {
    type: 'InputTextArea', displayName: 'Text Area', category: 'Inputs', icon: 'edit',
    codegenStrategy: 'inputTextArea',
    defaultProps: { placeholder: 'Enter text…', rows: 4, disabled: false },
    defaultSize: { width: 240, height: 100 },
    propSchema: [
      { name: 'placeholder', label: 'Placeholder', type: 'text', defaultValue: 'Enter text…' },
      { name: 'rows', label: 'Rows', type: 'number', defaultValue: 4, min: 1, max: 20 },
      { name: 'disabled', label: 'Disabled', type: 'boolean', defaultValue: false },
    ],
  },
  {
    type: 'InputNumber', displayName: 'Number Input', category: 'Inputs', icon: 'number',
    codegenStrategy: 'inputNumber',
    defaultProps: { placeholder: '0', min: 0, max: 100, size: 'middle', disabled: false },
    defaultSize: { width: 160, height: 40 },
    propSchema: [
      { name: 'placeholder', label: 'Placeholder', type: 'text', defaultValue: '0' },
      { name: 'min', label: 'Min', type: 'number', defaultValue: 0 },
      { name: 'max', label: 'Max', type: 'number', defaultValue: 100 },
      { name: 'size', label: 'Size', type: 'select', options: ['small', 'middle', 'large'], defaultValue: 'middle' },
      { name: 'disabled', label: 'Disabled', type: 'boolean', defaultValue: false },
    ],
  },
  {
    type: 'Select', displayName: 'Select', category: 'Inputs', icon: 'down',
    codegenStrategy: 'select',
    defaultProps: { placeholder: 'Select…', options: ['Option 1', 'Option 2', 'Option 3'], size: 'middle', disabled: false, allowClear: false, showSearch: false },
    defaultSize: { width: 240, height: 40 },
    propSchema: [
      { name: 'placeholder', label: 'Placeholder', type: 'text', defaultValue: 'Select…' },
      { name: 'options', label: 'Options', type: 'list', defaultValue: ['Option 1', 'Option 2', 'Option 3'] },
      { name: 'size', label: 'Size', type: 'select', options: ['small', 'middle', 'large'], defaultValue: 'middle' },
      { name: 'disabled', label: 'Disabled', type: 'boolean', defaultValue: false },
      { name: 'allowClear', label: 'Allow Clear', type: 'boolean', defaultValue: false },
      { name: 'showSearch', label: 'Show Search', type: 'boolean', defaultValue: false },
    ],
  },
  {
    type: 'Checkbox', displayName: 'Checkbox', category: 'Inputs', icon: 'check-square',
    codegenStrategy: 'checkbox',
    defaultProps: { label: 'Check me', checked: false, disabled: false },
    defaultSize: { width: 180, height: 32 },
    propSchema: [
      { name: 'label', label: 'Label', type: 'text', defaultValue: 'Check me' },
      { name: 'checked', label: 'Checked', type: 'boolean', defaultValue: false },
      { name: 'disabled', label: 'Disabled', type: 'boolean', defaultValue: false },
    ],
  },
  {
    type: 'Radio', displayName: 'Radio Group', category: 'Inputs', icon: 'check-circle',
    codegenStrategy: 'radio',
    defaultProps: { options: ['Option A', 'Option B', 'Option C'], optionType: 'default', buttonStyle: 'outline' },
    defaultSize: { width: 200, height: 110 },
    propSchema: [
      { name: 'options', label: 'Options', type: 'list', defaultValue: ['Option A', 'Option B', 'Option C'] },
      { name: 'optionType', label: 'Option Type', type: 'select', options: ['default', 'button'], defaultValue: 'default' },
      { name: 'buttonStyle', label: 'Button Style', type: 'select', options: ['outline', 'solid'], defaultValue: 'outline' },
    ],
  },
  {
    type: 'Switch', displayName: 'Switch', category: 'Inputs', icon: 'swap',
    codegenStrategy: 'switch',
    defaultProps: { label: 'Toggle me', checked: false, disabled: false, size: 'default' },
    defaultSize: { width: 180, height: 32 },
    propSchema: [
      { name: 'label', label: 'Label', type: 'text', defaultValue: 'Toggle me' },
      { name: 'checked', label: 'Checked', type: 'boolean', defaultValue: false },
      { name: 'disabled', label: 'Disabled', type: 'boolean', defaultValue: false },
      { name: 'size', label: 'Size', type: 'select', options: ['default', 'small'], defaultValue: 'default' },
    ],
  },
  {
    type: 'Slider', displayName: 'Slider', category: 'Inputs', icon: 'sliders',
    codegenStrategy: 'slider',
    defaultProps: { value: 50, min: 0, max: 100, step: 1, disabled: false },
    defaultSize: { width: 240, height: 44 },
    propSchema: [
      { name: 'value', label: 'Value', type: 'number', defaultValue: 50 },
      { name: 'min', label: 'Min', type: 'number', defaultValue: 0 },
      { name: 'max', label: 'Max', type: 'number', defaultValue: 100 },
      { name: 'step', label: 'Step', type: 'number', defaultValue: 1 },
      { name: 'disabled', label: 'Disabled', type: 'boolean', defaultValue: false },
    ],
  },
  {
    type: 'DatePicker', displayName: 'Date Picker', category: 'Inputs', icon: 'calendar',
    codegenStrategy: 'datePicker',
    defaultProps: { placeholder: 'Select date', size: 'middle', disabled: false, picker: 'date' },
    defaultSize: { width: 240, height: 40 },
    propSchema: [
      { name: 'placeholder', label: 'Placeholder', type: 'text', defaultValue: 'Select date' },
      { name: 'size', label: 'Size', type: 'select', options: ['small', 'middle', 'large'], defaultValue: 'middle' },
      { name: 'disabled', label: 'Disabled', type: 'boolean', defaultValue: false },
      { name: 'picker', label: 'Picker', type: 'select', options: ['date', 'week', 'month', 'quarter', 'year'], defaultValue: 'date' },
    ],
  },
  {
    type: 'Upload', displayName: 'Upload', category: 'Inputs', icon: 'upload',
    codegenStrategy: 'upload',
    defaultProps: { text: 'Click to Upload', hint: 'Support single or bulk upload', listType: 'text' },
    defaultSize: { width: 240, height: 60 },
    propSchema: [
      { name: 'text', label: 'Button Text', type: 'text', defaultValue: 'Click to Upload' },
      { name: 'hint', label: 'Hint Text', type: 'text', defaultValue: 'Support single or bulk upload' },
      { name: 'listType', label: 'List Type', type: 'select', options: ['text', 'picture', 'picture-card'], defaultValue: 'text' },
    ],
  },

  // ── Data Display ──────────────────────────────────────────
  {
    type: 'Avatar', displayName: 'Avatar', category: 'Data Display', icon: 'user',
    codegenStrategy: 'avatar',
    defaultProps: { text: 'AB', shape: 'circle', size: 'default' },
    defaultSize: { width: 48, height: 48 },
    propSchema: [
      { name: 'text', label: 'Initials', type: 'text', defaultValue: 'AB' },
      { name: 'shape', label: 'Shape', type: 'select', options: ['circle', 'square'], defaultValue: 'circle' },
      { name: 'size', label: 'Size', type: 'select', options: ['small', 'default', 'large'], defaultValue: 'default' },
    ],
  },
  {
    type: 'Badge', displayName: 'Badge', category: 'Data Display', icon: 'bell',
    codegenStrategy: 'badge',
    defaultProps: { count: 4, status: 'error', dot: false, showZero: false },
    defaultSize: { width: 52, height: 52 },
    propSchema: [
      { name: 'count', label: 'Count', type: 'number', defaultValue: 4 },
      { name: 'status', label: 'Status', type: 'select', options: ['success', 'processing', 'default', 'error', 'warning'], defaultValue: 'error' },
      { name: 'dot', label: 'Dot', type: 'boolean', defaultValue: false },
      { name: 'showZero', label: 'Show Zero', type: 'boolean', defaultValue: false },
    ],
  },
  {
    type: 'Tag', displayName: 'Tag', category: 'Data Display', icon: 'tag',
    codegenStrategy: 'tag',
    defaultProps: { label: 'Tag', color: 'blue', closable: false, bordered: true },
    defaultSize: { width: 80, height: 28 },
    propSchema: [
      { name: 'label', label: 'Label', type: 'text', defaultValue: 'Tag' },
      { name: 'color', label: 'Color', type: 'select', options: ['blue', 'green', 'red', 'orange', 'gold', 'cyan', 'purple', 'magenta', 'default'], defaultValue: 'blue' },
      { name: 'closable', label: 'Closable', type: 'boolean', defaultValue: false },
      { name: 'bordered', label: 'Bordered', type: 'boolean', defaultValue: true },
    ],
  },
  {
    type: 'Divider', displayName: 'Divider', category: 'Data Display', icon: 'line',
    codegenStrategy: 'divider',
    defaultProps: { type: 'horizontal', dashed: false, text: '', orientation: 'center' },
    defaultSize: { width: 300, height: 20 },
    propSchema: [
      { name: 'type', label: 'Type', type: 'select', options: ['horizontal', 'vertical'], defaultValue: 'horizontal' },
      { name: 'dashed', label: 'Dashed', type: 'boolean', defaultValue: false },
      { name: 'text', label: 'Text', type: 'text', defaultValue: '' },
      { name: 'orientation', label: 'Orientation', type: 'select', options: ['left', 'center', 'right'], defaultValue: 'center' },
    ],
  },
  {
    type: 'List', displayName: 'List', category: 'Data Display', icon: 'unordered-list',
    codegenStrategy: 'list',
    defaultProps: { items: ['Item 1', 'Item 2', 'Item 3'], bordered: false, size: 'default' },
    defaultSize: { width: 280, height: 160 },
    propSchema: [
      { name: 'items', label: 'Items', type: 'list', defaultValue: ['Item 1', 'Item 2', 'Item 3'] },
      { name: 'bordered', label: 'Bordered', type: 'boolean', defaultValue: false },
      { name: 'size', label: 'Size', type: 'select', options: ['small', 'default', 'large'], defaultValue: 'default' },
    ],
  },
  {
    type: 'Table', displayName: 'Table', category: 'Data Display', icon: 'table',
    codegenStrategy: 'table',
    defaultProps: {
      columns: ['Name', 'Email', 'Role'],
      rows: ['Alice,alice@mail.com,Admin', 'Bob,bob@mail.com,User'],
      size: 'middle', bordered: false,
    },
    defaultSize: { width: 420, height: 220 },
    propSchema: [
      { name: 'columns', label: 'Columns', type: 'list', defaultValue: ['Name', 'Email', 'Role'] },
      { name: 'rows', label: 'Rows (comma-separated)', type: 'list', defaultValue: ['Alice,alice@mail.com,Admin', 'Bob,bob@mail.com,User'] },
      { name: 'size', label: 'Size', type: 'select', options: ['small', 'middle', 'large'], defaultValue: 'middle' },
      { name: 'bordered', label: 'Bordered', type: 'boolean', defaultValue: false },
    ],
  },
  {
    type: 'Tooltip', displayName: 'Tooltip', category: 'Data Display', icon: 'info-circle',
    codegenStrategy: 'tooltip',
    defaultProps: { title: 'Tooltip text', placement: 'top' },
    defaultSize: { width: 120, height: 40 },
    propSchema: [
      { name: 'title', label: 'Title', type: 'text', defaultValue: 'Tooltip text' },
      { name: 'placement', label: 'Placement', type: 'select', options: ['top', 'bottom', 'left', 'right', 'topLeft', 'topRight', 'bottomLeft', 'bottomRight'], defaultValue: 'top' },
    ],
  },
  {
    type: 'Image', displayName: 'Image', category: 'Data Display', icon: 'picture',
    codegenStrategy: 'image',
    defaultProps: { src: 'https://via.placeholder.com/300x200', alt: 'placeholder', objectFit: 'cover' },
    defaultSize: { width: 300, height: 200 },
    propSchema: [
      { name: 'src', label: 'Source URL', type: 'text', defaultValue: 'https://via.placeholder.com/300x200' },
      { name: 'alt', label: 'Alt Text', type: 'text', defaultValue: 'placeholder' },
      { name: 'objectFit', label: 'Object Fit', type: 'select', options: ['cover', 'contain', 'fill', 'none'], defaultValue: 'cover' },
    ],
  },
  {
    type: 'Carousel', displayName: 'Carousel', category: 'Data Display', icon: 'play-square',
    codegenStrategy: 'carousel',
    defaultProps: { slides: ['Slide 1', 'Slide 2', 'Slide 3'], autoplay: false, dots: true, effect: 'scrollx' },
    defaultSize: { width: 400, height: 200 },
    propSchema: [
      { name: 'slides', label: 'Slides', type: 'list', defaultValue: ['Slide 1', 'Slide 2', 'Slide 3'] },
      { name: 'autoplay', label: 'Autoplay', type: 'boolean', defaultValue: false },
      { name: 'dots', label: 'Dots', type: 'boolean', defaultValue: true },
      { name: 'effect', label: 'Effect', type: 'select', options: ['scrollx', 'fade'], defaultValue: 'scrollx' },
    ],
  },

  // ── Surfaces ──────────────────────────────────────────────
  {
    type: 'Card', displayName: 'Card', category: 'Surfaces', icon: 'credit-card',
    codegenStrategy: 'card', hasChildren: true,
    defaultProps: { title: 'Card Title', bordered: true, hoverable: false, size: 'default' },
    defaultSize: { width: 320, height: 180 },
    propSchema: [
      { name: 'title', label: 'Title', type: 'text', defaultValue: 'Card Title' },
      { name: 'bordered', label: 'Bordered', type: 'boolean', defaultValue: true },
      { name: 'hoverable', label: 'Hoverable', type: 'boolean', defaultValue: false },
      { name: 'size', label: 'Size', type: 'select', options: ['default', 'small'], defaultValue: 'default' },
    ],
  },
  {
    type: 'Section', displayName: 'Section', category: 'Surfaces', icon: 'border-outer',
    codegenStrategy: 'section', hasChildren: true,
    defaultProps: { title: 'Section Title', bordered: true, size: 'default' },
    defaultSize: { width: 300, height: 200 },
    propSchema: [
      { name: 'title', label: 'Title', type: 'text', defaultValue: 'Section Title' },
      { name: 'bordered', label: 'Bordered', type: 'boolean', defaultValue: true },
      { name: 'size', label: 'Size', type: 'select', options: ['default', 'small', 'large'], defaultValue: 'default' },
    ],
  },
  {
    type: 'Collapse', displayName: 'Collapse', category: 'Surfaces', icon: 'down-square',
    codegenStrategy: 'collapse',
    defaultProps: { title: 'Panel', content: 'Panel content goes here.', defaultExpanded: false, bordered: true },
    defaultSize: { width: 320, height: 56 },
    propSchema: [
      { name: 'title', label: 'Title', type: 'text', defaultValue: 'Panel' },
      { name: 'content', label: 'Content', type: 'text', defaultValue: 'Panel content goes here.' },
      { name: 'defaultExpanded', label: 'Default Expanded', type: 'boolean', defaultValue: false },
      { name: 'bordered', label: 'Bordered', type: 'boolean', defaultValue: true },
    ],
  },

  // ── Navigation ────────────────────────────────────────────
  {
    type: 'Menu', displayName: 'Menu', category: 'Navigation', icon: 'menu',
    codegenStrategy: 'menu',
    defaultProps: { items: ['Home', 'Products', 'About', 'Contact'], mode: 'horizontal', theme: 'light' },
    defaultSize: { width: 400, height: 48 },
    propSchema: [
      { name: 'items', label: 'Items', type: 'list', defaultValue: ['Home', 'Products', 'About', 'Contact'] },
      { name: 'mode', label: 'Mode', type: 'select', options: ['horizontal', 'vertical', 'inline'], defaultValue: 'horizontal' },
      { name: 'theme', label: 'Theme', type: 'select', options: ['light', 'dark'], defaultValue: 'light' },
    ],
  },
  {
    type: 'Tabs', displayName: 'Tabs', category: 'Navigation', icon: 'folder',
    codegenStrategy: 'tabs',
    defaultProps: { tabs: ['Tab 1', 'Tab 2', 'Tab 3'], type: 'line', size: 'default', tabPosition: 'top' },
    defaultSize: { width: 360, height: 48 },
    propSchema: [
      { name: 'tabs', label: 'Tabs', type: 'list', defaultValue: ['Tab 1', 'Tab 2', 'Tab 3'] },
      { name: 'type', label: 'Type', type: 'select', options: ['line', 'card', 'editable-card'], defaultValue: 'line' },
      { name: 'size', label: 'Size', type: 'select', options: ['small', 'default', 'large'], defaultValue: 'default' },
      { name: 'tabPosition', label: 'Position', type: 'select', options: ['top', 'right', 'bottom', 'left'], defaultValue: 'top' },
    ],
  },
  {
    type: 'Breadcrumb', displayName: 'Breadcrumb', category: 'Navigation', icon: 'right',
    codegenStrategy: 'breadcrumb',
    defaultProps: { items: ['Home', 'Category', 'Current'], separator: '/' },
    defaultSize: { width: 280, height: 32 },
    propSchema: [
      { name: 'items', label: 'Items', type: 'list', defaultValue: ['Home', 'Category', 'Current'] },
      { name: 'separator', label: 'Separator', type: 'text', defaultValue: '/' },
    ],
  },
  {
    type: 'Dropdown', displayName: 'Dropdown', category: 'Navigation', icon: 'down',
    codegenStrategy: 'dropdown',
    defaultProps: { label: 'Dropdown', items: ['Action 1', 'Action 2', 'Action 3'], placement: 'bottomLeft', trigger: 'hover' },
    defaultSize: { width: 120, height: 40 },
    propSchema: [
      { name: 'label', label: 'Label', type: 'text', defaultValue: 'Dropdown' },
      { name: 'items', label: 'Items', type: 'list', defaultValue: ['Action 1', 'Action 2', 'Action 3'] },
      { name: 'placement', label: 'Placement', type: 'select', options: ['bottomLeft', 'bottomRight', 'topLeft', 'topRight', 'bottom', 'top'], defaultValue: 'bottomLeft' },
      { name: 'trigger', label: 'Trigger', type: 'select', options: ['hover', 'click'], defaultValue: 'hover' },
    ],
  },
  {
    type: 'Pagination', displayName: 'Pagination', category: 'Navigation', icon: 'ellipsis',
    codegenStrategy: 'pagination',
    defaultProps: { total: 100, pageSize: 10, size: 'default', showSizeChanger: false, showQuickJumper: false, simple: false },
    defaultSize: { width: 320, height: 40 },
    propSchema: [
      { name: 'total', label: 'Total Items', type: 'number', defaultValue: 100 },
      { name: 'pageSize', label: 'Page Size', type: 'number', defaultValue: 10 },
      { name: 'size', label: 'Size', type: 'select', options: ['default', 'small'], defaultValue: 'default' },
      { name: 'showSizeChanger', label: 'Size Changer', type: 'boolean', defaultValue: false },
      { name: 'showQuickJumper', label: 'Quick Jumper', type: 'boolean', defaultValue: false },
      { name: 'simple', label: 'Simple', type: 'boolean', defaultValue: false },
    ],
  },
  {
    type: 'Steps', displayName: 'Steps', category: 'Navigation', icon: 'ordered-list',
    codegenStrategy: 'steps',
    defaultProps: { steps: ['Step 1', 'Step 2', 'Step 3'], current: 0, direction: 'horizontal', size: 'default' },
    defaultSize: { width: 400, height: 72 },
    propSchema: [
      { name: 'steps', label: 'Steps', type: 'list', defaultValue: ['Step 1', 'Step 2', 'Step 3'] },
      { name: 'current', label: 'Current Step', type: 'number', defaultValue: 0 },
      { name: 'direction', label: 'Direction', type: 'select', options: ['horizontal', 'vertical'], defaultValue: 'horizontal' },
      { name: 'size', label: 'Size', type: 'select', options: ['default', 'small'], defaultValue: 'default' },
    ],
  },

  // ── Feedback ──────────────────────────────────────────────
  {
    type: 'Alert', displayName: 'Alert', category: 'Feedback', icon: 'warning',
    codegenStrategy: 'alert',
    defaultProps: { type: 'info', message: 'This is an alert.', closable: false, showIcon: true, banner: false },
    defaultSize: { width: 320, height: 48 },
    propSchema: [
      { name: 'message', label: 'Message', type: 'text', defaultValue: 'This is an alert.' },
      { name: 'type', label: 'Type', type: 'select', options: ['info', 'success', 'warning', 'error'], defaultValue: 'info' },
      { name: 'closable', label: 'Closable', type: 'boolean', defaultValue: false },
      { name: 'showIcon', label: 'Show Icon', type: 'boolean', defaultValue: true },
      { name: 'banner', label: 'Banner', type: 'boolean', defaultValue: false },
    ],
  },
  {
    type: 'Modal', displayName: 'Modal', category: 'Feedback', icon: 'block',
    codegenStrategy: 'modal',
    defaultProps: { title: 'Modal Title', content: 'Modal content text.', okText: 'OK', cancelText: 'Cancel', centered: false },
    defaultSize: { width: 400, height: 200 },
    propSchema: [
      { name: 'title', label: 'Title', type: 'text', defaultValue: 'Modal Title' },
      { name: 'content', label: 'Content', type: 'text', defaultValue: 'Modal content text.' },
      { name: 'okText', label: 'OK Text', type: 'text', defaultValue: 'OK' },
      { name: 'cancelText', label: 'Cancel Text', type: 'text', defaultValue: 'Cancel' },
      { name: 'centered', label: 'Centered', type: 'boolean', defaultValue: false },
    ],
  },
  {
    type: 'Loading', displayName: 'Loading', category: 'Feedback', icon: 'loading',
    codegenStrategy: 'loading',
    defaultProps: { spinning: true, size: 'default', tip: '' },
    defaultSize: { width: 60, height: 60 },
    propSchema: [
      { name: 'spinning', label: 'Spinning', type: 'boolean', defaultValue: true },
      { name: 'size', label: 'Size', type: 'select', options: ['small', 'default', 'large'], defaultValue: 'default' },
      { name: 'tip', label: 'Tip Text', type: 'text', defaultValue: '' },
    ],
  },
  {
    type: 'Popover', displayName: 'Popover', category: 'Feedback', icon: 'message',
    codegenStrategy: 'popover',
    defaultProps: { title: 'Popover', content: 'Popover content here.', trigger: 'hover', placement: 'top' },
    defaultSize: { width: 120, height: 40 },
    propSchema: [
      { name: 'title', label: 'Title', type: 'text', defaultValue: 'Popover' },
      { name: 'content', label: 'Content', type: 'text', defaultValue: 'Popover content here.' },
      { name: 'trigger', label: 'Trigger', type: 'select', options: ['hover', 'click', 'focus'], defaultValue: 'hover' },
      { name: 'placement', label: 'Placement', type: 'select', options: ['top', 'bottom', 'left', 'right', 'topLeft', 'topRight', 'bottomLeft', 'bottomRight'], defaultValue: 'top' },
    ],
  },
];

/** Look up component definition by type. */
export const getComponentDefinition = (type: string): ComponentDefinition | undefined =>
  componentRegistry.find((c) => c.type === type);
