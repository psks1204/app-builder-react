import React from 'react';
// ── ICG Design System components (canvas rendering) ──────────
import {
  Button as IcgButton,
  Input as IcgInput,
  Select as IcgSelect,
  Checkbox as IcgCheckbox,
  Radio as IcgRadio,
  Switch as IcgSwitch,
  Slider as IcgSlider,
  DatePicker as IcgDatePicker,
  Upload as IcgUpload,
  Avatar as IcgAvatar,
  Badge as IcgBadge,
  Tag as IcgTag,
  Carousel as IcgCarousel,
  Card as IcgCard,
  Section as IcgSection,
  Collapse as IcgCollapse,
  Menu as IcgMenu,
  Tabs as IcgTabs,
  Breadcrumb as IcgBreadcrumb,
  Pagination as IcgPagination,
  Stepper as IcgStepper,
  Dropdown as IcgDropdown,
  Alert as IcgAlert,
  Modal as IcgModal,
  Loading as IcgLoading,
  Tooltip as IcgTooltip,
  Popover as IcgPopover,
  Table as IcgTable,
  Icon as IcgIcon,
  // Media as IcgMedia,  // uncomment when available
} from '@citi-icg-172888/icgds-react';

// ── MUI — used ONLY for Layout containers + builder internals ──
import { Box, Stack, Grid, Container, Typography } from '@mui/material';
import type { CanvasNode } from '../../store/types';

// ================================================================
//  Helpers
// ================================================================

/** Convert sx shorthand to React.CSSProperties for ICG style prop */
const sxToStyle = (sx: Record<string, unknown>): React.CSSProperties => {
  const s: React.CSSProperties = {};
  const map: Record<string, keyof React.CSSProperties> = {
    p: 'padding', pt: 'paddingTop', pr: 'paddingRight', pb: 'paddingBottom', pl: 'paddingLeft',
    px: 'paddingLeft', py: 'paddingTop',
    m: 'margin', mt: 'marginTop', mr: 'marginRight', mb: 'marginBottom', ml: 'marginLeft',
    mx: 'marginLeft', my: 'marginTop',
    bgcolor: 'backgroundColor', color: 'color',
    border: 'border', borderRadius: 'borderRadius',
    width: 'width', height: 'height', minWidth: 'minWidth', minHeight: 'minHeight',
    maxWidth: 'maxWidth', maxHeight: 'maxHeight',
    display: 'display', flexDirection: 'flexDirection', alignItems: 'alignItems',
    justifyContent: 'justifyContent', gap: 'gap', flex: 'flex',
    overflow: 'overflow', opacity: 'opacity', boxShadow: 'boxShadow',
    position: 'position', top: 'top', right: 'right', bottom: 'bottom', left: 'left',
    zIndex: 'zIndex', textAlign: 'textAlign',
  };

  for (const [key, val] of Object.entries(sx)) {
    if (val === undefined || val === null || val === '') continue;
    // Skip MUI-specific class override selectors
    if (key.startsWith('&')) continue;

    const cssProp = map[key];
    if (cssProp) {
      // Convert spacing units (MUI uses 8px multiples for p, m, etc.)
      if (['p', 'pt', 'pr', 'pb', 'pl', 'px', 'py', 'm', 'mt', 'mr', 'mb', 'ml', 'mx', 'my'].includes(key) && typeof val === 'number') {
        (s as Record<string, unknown>)[cssProp] = val * 8;
        // Handle px, py, mx, my (set both axes)
        if (key === 'px') s.paddingRight = val * 8;
        if (key === 'py') s.paddingBottom = val * 8;
        if (key === 'mx') s.marginRight = val * 8;
        if (key === 'my') s.marginBottom = val * 8;
      } else {
        (s as Record<string, unknown>)[cssProp] = val;
      }
    }
    // Also pass font-related properties
    if (['fontSize', 'fontWeight', 'fontFamily', 'fontStyle', 'lineHeight', 'letterSpacing', 'textTransform'].includes(key)) {
      (s as Record<string, unknown>)[key as keyof React.CSSProperties] = val;
    }
  }
  return s;
};

/** Extract font-related properties from sx into an inline style object. */
const fontStyleFromSx = (sx: Record<string, unknown>): React.CSSProperties => {
  const s: React.CSSProperties = {};
  if (sx.fontSize !== undefined) s.fontSize = typeof sx.fontSize === 'number' ? sx.fontSize : (sx.fontSize as string);
  if (sx.fontWeight !== undefined) s.fontWeight = sx.fontWeight as number;
  if (sx.fontStyle !== undefined) s.fontStyle = sx.fontStyle as string;
  if (sx.lineHeight !== undefined) s.lineHeight = sx.lineHeight as number;
  if (sx.letterSpacing !== undefined) s.letterSpacing = typeof sx.letterSpacing === 'number' ? sx.letterSpacing : (sx.letterSpacing as string);
  if (sx.textAlign !== undefined) s.textAlign = sx.textAlign as React.CSSProperties['textAlign'];
  if (sx.textTransform !== undefined) s.textTransform = sx.textTransform as React.CSSProperties['textTransform'];
  return s;
};

// ================================================================
//  Interactive Wrappers (stateful components for preview)
// ================================================================

/* ── Interactive Tabs using ICG Tabs ──────────────────────── */
const InteractiveTabs: React.FC<{ tabs: string[]; type: string; size: string; style: React.CSSProperties }> = ({ tabs, type, size, style }) => {
  const [activeKey, setActiveKey] = React.useState('0');
  const items = tabs?.map((t, i) => ({ key: String(i), label: t, children: null })) ?? [];
  return (
    <div style={style}>
      <IcgTabs
        activeKey={activeKey}
        onChange={(key: string) => setActiveKey(key)}
        type={type as 'line' | 'card'}
        size={size as 'small' | 'default' | 'large'}
        items={items}
      />
    </div>
  );
};

/* ── Interactive Pagination using ICG Pagination ──────────── */
const InteractivePagination: React.FC<{ total: number; pageSize: number; size: string; simple: boolean; style: React.CSSProperties }> = ({ total, pageSize, size, simple, style }) => {
  const [current, setCurrent] = React.useState(1);
  return (
    <div style={style}>
      <IcgPagination
        current={current}
        onChange={(page: number) => setCurrent(page)}
        total={total}
        pageSize={pageSize}
        size={size as 'default' | 'small'}
        simple={simple}
      />
    </div>
  );
};

/* ── Nested menu tree builder (shared) ────────────────────── */
interface MenuNode {
  label: string;
  key: string;
  children: MenuNode[];
}

const buildMenuTree = (items: string[]): MenuNode[] => {
  const root: MenuNode[] = [];
  let keyCounter = 0;
  for (const raw of items) {
    const parts = raw.split('>').map((s) => s.trim()).filter(Boolean);
    let level = root;
    for (let i = 0; i < parts.length; i++) {
      let existing = level.find((n) => n.label === parts[i]);
      if (!existing) {
        existing = { label: parts[i], key: `menu-${keyCounter++}`, children: [] };
        level.push(existing);
      }
      level = existing.children;
    }
  }
  return root;
};

/** Convert MenuNode tree to ICG Menu items format */
const toMenuItems = (nodes: MenuNode[]): Array<{ key: string; label: string; children?: Array<{ key: string; label: string }> }> => {
  return nodes.map(n => {
    if (n.children.length > 0) {
      return { key: n.key, label: n.label, children: toMenuItems(n.children) };
    }
    return { key: n.key, label: n.label };
  });
};

/* ── Interactive Side Menu using ICG Menu ──────────────────── */
const InteractiveSideMenu: React.FC<{ title: string; menuItems: string[]; mode: string; theme: string; style: React.CSSProperties }> = ({ title, menuItems, mode, theme, style }) => {
  const [selectedKeys, setSelectedKeys] = React.useState<string[]>([]);
  const tree = React.useMemo(() => buildMenuTree(menuItems), [menuItems]);
  const items = React.useMemo(() => toMenuItems(tree), [tree]);
  return (
    <div style={{ height: '100%', overflow: 'auto', ...style }}>
      <div style={{ padding: '12px 16px 8px', fontWeight: 600, fontSize: 14, borderBottom: '1px solid #e8e8e8' }}>{title}</div>
      <IcgMenu
        mode={mode as 'inline' | 'vertical'}
        theme={theme as 'light' | 'dark'}
        selectedKeys={selectedKeys}
        onSelect={(info: { selectedKeys: string[] }) => setSelectedKeys(info.selectedKeys)}
        items={items as any}
        style={{ border: 'none' }}
      />
    </div>
  );
};

// ================================================================
//  Main Renderer
// ================================================================

interface Props {
  node: CanvasNode;
  interactive?: boolean;
}

const ComponentRenderer: React.FC<Props> = ({ node, interactive }) => {
  const { type, props, sx: rawSx } = node;
  const sx = rawSx ?? {};
  const convertedStyle = sxToStyle(sx);
  const fontStyle = fontStyleFromSx(sx);
  const mergedStyle = { ...convertedStyle, ...fontStyle };

  switch (type) {
    /* ── Inputs ──────────────────────────────────────────── */
    case 'Button':
      return (
        <IcgButton
          type={props.type as 'primary' | 'default' | 'dashed' | 'text' | 'link'}
          size={props.size as 'small' | 'middle' | 'large'}
          disabled={props.disabled as boolean}
          danger={props.danger as boolean}
          block={props.block as boolean}
          shape={props.shape as 'default' | 'circle' | 'round'}
          style={mergedStyle}
        >
          {props.label as string}
        </IcgButton>
      );

    case 'IconButton':
      return (
        <IcgButton
          type={props.type as 'primary' | 'default'}
          shape={props.shape as 'circle' | 'round'}
          size={props.size as 'small' | 'middle' | 'large'}
          disabled={props.disabled as boolean}
          icon={<IcgIcon type={props.iconType as string} />}
          style={mergedStyle}
        />
      );

    case 'ButtonGroup':
      return (
        <IcgButton.Group size={props.size as 'small' | 'middle' | 'large'} style={mergedStyle}>
          {(props.buttons as string[])?.map((b, i) => (
            <IcgButton key={i}>{b}</IcgButton>
          ))}
        </IcgButton.Group>
      );

    case 'TextField':
      return (
        <IcgInput
          placeholder={props.placeholder as string}
          size={props.size as 'small' | 'middle' | 'large'}
          disabled={props.disabled as boolean}
          allowClear={props.allowClear as boolean}
          style={{ width: '100%', ...mergedStyle }}
        />
      );

    case 'Select':
      return (
        <IcgSelect
          placeholder={props.placeholder as string}
          size={props.size as 'small' | 'middle' | 'large'}
          disabled={props.disabled as boolean}
          allowClear={props.allowClear as boolean}
          showSearch={props.showSearch as boolean}
          options={(props.options as string[])?.map(o => ({ value: o, label: o }))}
          style={{ width: '100%', ...mergedStyle }}
        />
      );

    case 'Checkbox':
      return (
        <div style={mergedStyle}>
          <IcgCheckbox
            {...(interactive ? { defaultChecked: props.checked as boolean } : { checked: props.checked as boolean })}
            disabled={props.disabled as boolean}
          >
            {props.label as string}
          </IcgCheckbox>
        </div>
      );

    case 'Radio': {
      const radioOptions = (props.options as string[])?.map(o => o) ?? [];
      return (
        <div style={mergedStyle}>
          <div style={{ marginBottom: 4, fontWeight: 500 }}>{props.label as string}</div>
          <IcgRadio.Group
            options={radioOptions}
            optionType={props.optionType as 'default' | 'button'}
            buttonStyle={props.buttonStyle as 'outline' | 'solid'}
            {...(interactive ? { defaultValue: radioOptions[0] } : { value: radioOptions[0] })}
          />
        </div>
      );
    }

    case 'Switch':
      return (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, ...mergedStyle }}>
          <IcgSwitch
            {...(interactive ? { defaultChecked: props.checked as boolean } : { checked: props.checked as boolean })}
            disabled={props.disabled as boolean}
            size={props.size as 'default' | 'small'}
          />
          <span>{props.label as string}</span>
        </div>
      );

    case 'Slider':
      return (
        <div style={{ padding: '0 8px', ...mergedStyle }}>
          <IcgSlider
            {...(interactive ? { defaultValue: props.value as number } : { value: props.value as number })}
            min={props.min as number}
            max={props.max as number}
            step={props.step as number}
            disabled={props.disabled as boolean}
          />
        </div>
      );

    case 'DatePicker':
      return (
        <div style={mergedStyle}>
          <IcgDatePicker
            placeholder={props.placeholder as string}
            size={props.size as 'small' | 'middle' | 'large'}
            disabled={props.disabled as boolean}
            picker={props.picker as 'date' | 'week' | 'month' | 'year'}
            style={{ width: '100%' }}
          />
        </div>
      );

    case 'Upload':
      return (
        <div style={mergedStyle}>
          <IcgUpload listType={props.listType as 'text' | 'picture' | 'picture-card'}>
            <IcgButton>
              {props.text as string}
            </IcgButton>
          </IcgUpload>
          {(props.hint as string) && (
            <div style={{ color: '#999', fontSize: 12, marginTop: 4 }}>{props.hint as string}</div>
          )}
        </div>
      );

    /* ── Data Display ────────────────────────────────────── */
    case 'Typography': {
      const level = props.level as string;
      const tagMap: Record<string, keyof JSX.IntrinsicElements> = {
        h1: 'h1', h2: 'h2', h3: 'h3', h4: 'h4', h5: 'h5', body: 'p', caption: 'span',
      };
      const sizeMap: Record<string, number> = {
        h1: 32, h2: 28, h3: 24, h4: 20, h5: 16, body: 14, caption: 12,
      };
      const weightMap: Record<string, number> = {
        h1: 700, h2: 700, h3: 600, h4: 600, h5: 500, body: 400, caption: 400,
      };
      const Tag = (tagMap[level] || 'p') as keyof JSX.IntrinsicElements;
      return React.createElement(Tag, {
        style: {
          margin: 0,
          fontSize: fontStyle.fontSize || sizeMap[level] || 14,
          fontWeight: fontStyle.fontWeight || weightMap[level] || 400,
          textAlign: (props.align as React.CSSProperties['textAlign']) || 'left',
          ...mergedStyle,
        },
      }, props.text as string);
    }

    case 'Avatar':
      return (
        <IcgAvatar
          shape={props.shape as 'circle' | 'square'}
          size={props.size as 'small' | 'default' | 'large'}
          style={{ backgroundColor: props.bgColor as string, ...mergedStyle }}
        >
          {props.text as string}
        </IcgAvatar>
      );

    case 'Badge':
      return (
        <div style={mergedStyle}>
          <IcgBadge
            count={props.dot ? undefined : (props.count as number)}
            dot={props.dot as boolean}
            status={props.status as 'success' | 'processing' | 'default' | 'error' | 'warning'}
            showZero={props.showZero as boolean}
          >
            <div style={{ width: 32, height: 32, borderRadius: 4, backgroundColor: '#e8e8e8' }} />
          </IcgBadge>
        </div>
      );

    case 'Tag':
      return (
        <IcgTag
          color={props.color as string}
          closable={props.closable as boolean}
          bordered={props.bordered as boolean}
          style={mergedStyle}
        >
          {props.label as string}
        </IcgTag>
      );

    case 'Divider': {
      const divText = props.text as string;
      if (divText) {
        return (
          <div style={{ width: '100%', ...mergedStyle }}>
            <hr style={{
              border: 'none',
              borderTop: props.dashed ? '1px dashed #d9d9d9' : '1px solid #d9d9d9',
              margin: '12px 0',
              position: 'relative',
            }} />
            <span style={{
              position: 'absolute',
              background: '#fff',
              padding: '0 8px',
              fontSize: 14,
              color: '#666',
              left: props.orientation === 'left' ? '5%' : props.orientation === 'right' ? 'auto' : '50%',
              right: props.orientation === 'right' ? '5%' : 'auto',
              transform: props.orientation === 'center' ? 'translateX(-50%)' : 'none',
              top: -10,
            }}>
              {divText}
            </span>
          </div>
        );
      }
      return (
        <div style={{ width: props.type === 'vertical' ? 'auto' : '100%', height: props.type === 'vertical' ? '100%' : 'auto', ...mergedStyle }}>
          <hr style={{
            border: 'none',
            borderTop: props.type === 'vertical' ? 'none' : (props.dashed ? '1px dashed #d9d9d9' : '1px solid #d9d9d9'),
            borderLeft: props.type === 'vertical' ? (props.dashed ? '1px dashed #d9d9d9' : '1px solid #d9d9d9') : 'none',
            margin: props.type === 'vertical' ? '0 8px' : '12px 0',
            height: props.type === 'vertical' ? '100%' : 'auto',
          }} />
        </div>
      );
    }

    case 'List': {
      const listItems = (props.items as string[]) ?? ['Item 1', 'Item 2', 'Item 3'];
      return (
        <div style={{ border: (props.bordered as boolean) ? '1px solid #d9d9d9' : 'none', borderRadius: 4, ...mergedStyle }}>
          {listItems.map((item, i) => (
            <div
              key={i}
              style={{
                padding: (props.size as string) === 'small' ? '8px 16px' : (props.size as string) === 'large' ? '16px 24px' : '12px 16px',
                borderBottom: i < listItems.length - 1 ? '1px solid #f0f0f0' : 'none',
                fontSize: 14,
              }}
            >
              {item}
            </div>
          ))}
        </div>
      );
    }

    case 'Table': {
      const columns = (props.columns as string[]) ?? ['#', 'Name', 'Email', 'Role'];
      const rows = (props.rows as string[]) ?? ['1,Alice,alice@mail.com,Admin', '2,Bob,bob@mail.com,User'];
      const tableColumns = columns.map((col, i) => ({
        title: col,
        dataIndex: `col${i}`,
        key: `col${i}`,
      }));
      const tableData = rows.map((row, ri) => {
        const cells = String(row).split(',');
        const record: Record<string, string> = { key: String(ri) };
        columns.forEach((_, ci) => {
          record[`col${ci}`] = cells[ci] ?? '';
        });
        return record;
      });
      return (
        <div style={mergedStyle}>
          <IcgTable
            columns={tableColumns as any}
            dataSource={tableData}
            size={props.size as 'small' | 'middle' | 'large'}
            bordered={props.bordered as boolean}
            pagination={false}
          />
        </div>
      );
    }

    case 'Tooltip':
      return (
        <IcgTooltip title={props.title as string} placement={props.placement as 'top'}>
          <IcgButton type="default" size="small" style={mergedStyle}>Hover me</IcgButton>
        </IcgTooltip>
      );

    case 'Image':
      return (
        <img
          src={props.src as string}
          alt={props.alt as string}
          style={{
            width: '100%',
            height: '100%',
            objectFit: props.objectFit as React.CSSProperties['objectFit'],
            display: 'block',
            ...mergedStyle,
          }}
        />
      );

    case 'Carousel': {
      const slides = (props.slides as string[]) ?? ['Slide 1', 'Slide 2', 'Slide 3'];
      return (
        <div style={mergedStyle}>
          <IcgCarousel
            autoplay={props.autoplay as boolean}
            dots={props.dots as boolean}
            effect={props.effect as 'scrollx' | 'fade'}
          >
            {slides.map((slide, i) => (
              <div key={i}>
                <div style={{
                  height: 160,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: `hsl(${(i * 60 + 200) % 360}, 50%, 85%)`,
                  fontSize: 18,
                  fontWeight: 500,
                }}>
                  {slide}
                </div>
              </div>
            ))}
          </IcgCarousel>
        </div>
      );
    }

    /* ── Surfaces ────────────────────────────────────────── */
    case 'Card':
      return (
        <IcgCard
          title={props.title as string}
          bordered={props.bordered as boolean}
          hoverable={props.hoverable as boolean}
          size={props.size as 'default' | 'small'}
          style={{ height: '100%', ...mergedStyle }}
        >
          {/* Children will be rendered by CanvasItem */}
        </IcgCard>
      );

    case 'Paper':
      return (
        <IcgSection
          title={props.title as string}
          bordered={props.bordered as boolean}
          size={props.size as 'default' | 'small' | 'large'}
          style={{ height: '100%', ...mergedStyle }}
        >
          {/* Children will be rendered by CanvasItem */}
        </IcgSection>
      );

    case 'Accordion': {
      const defaultExpanded = props.defaultExpanded as boolean;
      return (
        <div style={mergedStyle}>
          <IcgCollapse
            defaultActiveKey={defaultExpanded ? ['1'] : []}
            bordered={props.bordered as boolean}
          >
            <IcgCollapse.Panel header={props.title as string} key="1">
              <p>{props.content as string}</p>
            </IcgCollapse.Panel>
          </IcgCollapse>
        </div>
      );
    }

    /* ── Navigation ──────────────────────────────────────── */
    case 'AppBar': {
      const menuItems = (props.items as string[]) ?? ['Home', 'Products', 'About'];
      const items = menuItems.map((item, i) => ({ key: String(i), label: item }));
      return (
        <div style={mergedStyle}>
          <IcgMenu
            mode={props.mode as 'horizontal' | 'vertical' | 'inline'}
            theme={props.theme as 'light' | 'dark'}
            defaultSelectedKeys={['0']}
            items={items as any}
          />
        </div>
      );
    }

    case 'Tabs': {
      const tabs = (props.tabs as string[]) ?? ['Tab 1', 'Tab 2', 'Tab 3'];
      const items = tabs.map((t, i) => ({ key: String(i), label: t, children: null }));
      if (interactive) {
        return <InteractiveTabs tabs={tabs} type={props.type as string} size={props.size as string} style={mergedStyle} />;
      }
      return (
        <div style={mergedStyle}>
          <IcgTabs
            defaultActiveKey="0"
            type={props.type as 'line' | 'card'}
            size={props.size as 'small' | 'default' | 'large'}
            tabPosition={props.tabPosition as 'top' | 'right' | 'bottom' | 'left'}
            items={items}
          />
        </div>
      );
    }

    case 'Breadcrumbs': {
      const bcItems = (props.items as string[]) ?? ['Home', 'Category', 'Current'];
      return (
        <div style={mergedStyle}>
          <IcgBreadcrumb separator={props.separator as string}>
            {bcItems.map((item, i) => (
              <IcgBreadcrumb.Item key={i}>{item}</IcgBreadcrumb.Item>
            ))}
          </IcgBreadcrumb>
        </div>
      );
    }

    case 'Drawer': {
      const menuItems = (props.menuItems as string[]) ?? ['Menu 1', 'Menu 2', 'Menu 3'];
      const drawerTitle = (props.title as string) ?? 'Menu';
      if (interactive) {
        return <InteractiveSideMenu title={drawerTitle} menuItems={menuItems} mode={props.mode as string} theme={props.theme as string} style={mergedStyle} />;
      }
      const tree = buildMenuTree(menuItems);
      const items = toMenuItems(tree);
      return (
        <div style={{ height: '100%', overflow: 'auto', border: '1px solid #f0f0f0', borderRadius: 4, ...mergedStyle }}>
          <div style={{ padding: '12px 16px 8px', fontWeight: 600, fontSize: 14, borderBottom: '1px solid #f0f0f0' }}>{drawerTitle}</div>
          <IcgMenu
            mode={props.mode as 'inline' | 'vertical'}
            theme={props.theme as 'light' | 'dark'}
            items={items as any}
            style={{ border: 'none' }}
          />
        </div>
      );
    }

    case 'Pagination':
      if (interactive) {
        return <InteractivePagination total={props.total as number} pageSize={props.pageSize as number} size={props.size as string} simple={props.simple as boolean} style={mergedStyle} />;
      }
      return (
        <div style={mergedStyle}>
          <IcgPagination
            total={props.total as number}
            pageSize={props.pageSize as number}
            size={props.size as 'default' | 'small'}
            simple={props.simple as boolean}
            current={1}
          />
        </div>
      );

    case 'Stepper': {
      const steps = (props.steps as string[]) ?? ['Step 1', 'Step 2', 'Step 3'];
      const stepItems = steps.map(s => ({ title: s }));
      return (
        <div style={mergedStyle}>
          <IcgStepper
            current={props.current as number}
            direction={props.direction as 'horizontal' | 'vertical'}
            size={props.size as 'default' | 'small'}
            items={stepItems}
          />
        </div>
      );
    }

    case 'Dropdown': {
      const dropItems = (props.items as string[]) ?? ['Action 1', 'Action 2'];
      const menuItems = dropItems.map((item, i) => ({ key: String(i), label: item }));
      return (
        <div style={mergedStyle}>
          <IcgDropdown
            overlay={
              <IcgMenu items={menuItems as any} />
            }
            placement={props.placement as 'bottomLeft'}
            trigger={[props.trigger as 'hover' | 'click']}
          >
            <IcgButton>
              {props.label as string} ▾
            </IcgButton>
          </IcgDropdown>
        </div>
      );
    }

    /* ── Feedback ────────────────────────────────────────── */
    case 'Alert':
      return (
        <IcgAlert
          type={props.type as 'info' | 'success' | 'warning' | 'danger'}
          closable={props.closable as boolean}
          showIcon={props.showIcon as boolean}
          banner={props.banner as boolean}
          style={mergedStyle}
        >
          {props.text as string}
        </IcgAlert>
      );

    case 'Notification':
      return (
        <div style={{
          border: '1px solid #d9d9d9',
          borderRadius: 8,
          padding: 16,
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          ...mergedStyle,
        }}>
          <div style={{ fontWeight: 600, marginBottom: 4 }}>{props.message as string}</div>
          <div style={{ color: '#666', fontSize: 13 }}>{props.description as string}</div>
        </div>
      );

    case 'Modal':
      return (
        <div style={{
          border: '1px solid #d9d9d9',
          borderRadius: 8,
          padding: 20,
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          backgroundColor: '#fff',
          ...mergedStyle,
        }}>
          <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 12 }}>{props.title as string}</div>
          <div style={{ color: '#666', fontSize: 14, marginBottom: 20 }}>{props.content as string}</div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
            <IcgButton>{props.cancelText as string || 'Cancel'}</IcgButton>
            <IcgButton type="primary">{props.okText as string || 'OK'}</IcgButton>
          </div>
        </div>
      );

    case 'Loading':
      return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%', height: '100%', ...mergedStyle }}>
          <IcgLoading
            spinning={props.spinning as boolean}
            size={props.size as 'small' | 'default' | 'large'}
            tip={(props.tip as string) || undefined}
          />
        </div>
      );

    case 'Popover':
      return (
        <IcgPopover
          title={props.title as string}
          content={props.content as string}
          trigger={props.trigger as 'hover' | 'click' | 'focus'}
          placement={props.placement as 'top'}
        >
          <IcgButton type="default" size="small" style={mergedStyle}>Hover me</IcgButton>
        </IcgPopover>
      );

    /* ── Layout (MUI — unchanged) ────────────────────────── */
    case 'Box':
      return (
        <Box sx={{ width: '100%', height: '100%', ...sx }} />
      );

    case 'Stack':
      return (
        <Stack
          direction={props.direction as 'column'}
          spacing={props.spacing as number}
          alignItems={props.alignItems as string}
          justifyContent={props.justifyContent as string}
          sx={{ width: '100%', height: '100%', ...sx }}
        >
          <Box sx={{ flex: 1, border: '1px dashed', borderColor: 'divider', borderRadius: 1, minHeight: 30, minWidth: 30 }} />
          <Box sx={{ flex: 1, border: '1px dashed', borderColor: 'divider', borderRadius: 1, minHeight: 30, minWidth: 30 }} />
        </Stack>
      );

    case 'Grid': {
      const cols = Number(props.cols) || 3;
      const gridColumns = (props.columns as number) || 12;
      const itemSize = Math.max(1, Math.floor(gridColumns / cols));
      return (
        <Grid container spacing={props.spacing as number} columns={gridColumns} sx={{ width: '100%', height: '100%', ...sx }}>
          {Array.from({ length: cols }, (_, i) => (
            <Grid key={i} size={itemSize}>
              <Box sx={{ height: '100%', minHeight: 40, border: '1px dashed', borderColor: 'divider', borderRadius: 1 }} />
            </Grid>
          ))}
        </Grid>
      );
    }

    case 'Container':
      return (
        <Container maxWidth={props.maxWidth === 'false' ? false : (props.maxWidth as 'lg')} fixed={props.fixed as boolean} sx={{ height: '100%', ...sx }} />
      );

    default:
      return (
        <Box sx={{ p: 1, border: '1px dashed', borderColor: 'divider' }}>
          <Typography variant="caption" color="text.disabled">Unknown: {type}</Typography>
        </Box>
      );
  }
};

export default ComponentRenderer;
