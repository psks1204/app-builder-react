import React from 'react';
import {
  Button, IconButton, ButtonGroup,
  TextField, Select, MenuItem, FormControl, InputLabel,
  Checkbox, Radio, RadioGroup, Switch, FormControlLabel, FormLabel,
  Slider, Rating, Autocomplete, Fab,
  Typography, Avatar, Badge, Chip, Divider,
  List, ListItem, ListItemText, ListItemButton, Collapse,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Tooltip, Paper, Card, CardContent, CardHeader,
  Accordion, AccordionSummary, AccordionDetails,
  AppBar, Toolbar, Tabs, Tab, Breadcrumbs, Link,
  Pagination, Stepper, Step, StepLabel,
  BottomNavigation, BottomNavigationAction, SpeedDial, SpeedDialAction,
  Alert, Snackbar, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions,
  CircularProgress, LinearProgress, Skeleton,
  Box, Stack, Grid, Container,
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  ChevronRight as ChevronRightIcon,
  Star as StarIcon,
  Add as AddIcon,
  Restore as RestoreIcon,
  Favorite as FavoriteIcon,
  LocationOn as LocationIcon,
  Edit as EditIcon,
  Share as ShareIcon,
  Print as PrintIcon,
  Mail as MailIcon,
} from '@mui/icons-material';
import type { CanvasNode } from '../../store/types';

/* ── Small stateful wrappers for interactive preview ────── */
const InteractiveTabs: React.FC<{ tabs: string[]; color: string; variant: string; sx: Record<string, unknown> }> = ({ tabs, color, variant, sx }) => {
  const [value, setValue] = React.useState(0);
  return (
    <Box sx={sx}>
      <Tabs value={value} onChange={(_, v) => setValue(v)} textColor={color as 'primary'} indicatorColor={color as 'primary'} variant={variant as 'standard'}>
        {tabs?.map((t, i) => <Tab key={i} label={t} />)}
      </Tabs>
    </Box>
  );
};

const InteractiveBottomNav: React.FC<{ items: string[]; showLabels: boolean; sx: Record<string, unknown> }> = ({ items, showLabels, sx }) => {
  const [value, setValue] = React.useState(0);
  const icons = [<RestoreIcon key="r" />, <FavoriteIcon key="f" />, <LocationIcon key="l" />];
  return (
    <BottomNavigation showLabels={showLabels} value={value} onChange={(_, v) => setValue(v)} sx={sx}>
      {items?.map((item, i) => (
        <BottomNavigationAction key={i} label={item} icon={icons[i % 3]} />
      ))}
    </BottomNavigation>
  );
};

const InteractivePagination: React.FC<{ count: number; color: string; shape: string; variant: string; size: string; sx: Record<string, unknown> }> = ({ count, color, shape, variant, size, sx }) => {
  const [page, setPage] = React.useState(1);
  return (
    <Pagination
      page={page}
      onChange={(_, v) => setPage(v)}
      count={count}
      color={color as 'primary'}
      shape={shape as 'rounded'}
      variant={variant as 'outlined'}
      size={size as 'medium'}
      sx={sx}
    />
  );
};

/* ── Nested menu tree builder ────────────────────────────── */
interface MenuNode {
  label: string;
  children: MenuNode[];
}

const buildMenuTree = (items: string[]): MenuNode[] => {
  const root: MenuNode[] = [];
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
};

/* ── Recursive nested menu renderer ─────────────────────── */
const NestedMenuItem: React.FC<{
  node: MenuNode;
  depth: number;
  selected: string;
  onSelect: (label: string) => void;
  interactive?: boolean;
  fontStyle?: React.CSSProperties;
}> = ({ node, depth, selected, onSelect, interactive, fontStyle }) => {
  const [open, setOpen] = React.useState(false);
  const hasChildren = node.children.length > 0;
  const fullKey = node.label;

  if (hasChildren) {
    return (
      <>
        <ListItemButton
          onClick={() => { if (interactive) setOpen((o) => !o); onSelect(fullKey); }}
          sx={{
            pl: 2 + depth * 2,
            bgcolor: selected === fullKey ? 'action.selected' : 'transparent',
            '&:hover': { bgcolor: selected === fullKey ? 'action.selected' : 'action.hover' },
          }}
        >
          <ListItemText primary={node.label} primaryTypographyProps={{ variant: 'body2', style: fontStyle }} />
          {open ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}
        </ListItemButton>
        <Collapse in={open} timeout="auto" unmountOnExit>
          <List component="div" disablePadding dense>
            {node.children.map((child, i) => (
              <NestedMenuItem key={i} node={child} depth={depth + 1} selected={selected} onSelect={onSelect} interactive={interactive} fontStyle={fontStyle} />
            ))}
          </List>
        </Collapse>
      </>
    );
  }

  return (
    <ListItemButton
      onClick={() => onSelect(fullKey)}
      sx={{
        pl: 2 + depth * 2,
        bgcolor: selected === fullKey ? 'action.selected' : 'transparent',
        '&:hover': { bgcolor: selected === fullKey ? 'action.selected' : 'action.hover' },
      }}
    >
      <ListItemText primary={node.label} primaryTypographyProps={{ variant: 'body2', style: fontStyle }} />
    </ListItemButton>
  );
};

const InteractiveDrawer: React.FC<{ title: string; menuItems: string[]; width: number; sx: Record<string, unknown>; fontStyle?: React.CSSProperties }> = ({ title, menuItems, width, sx, fontStyle }) => {
  const [selected, setSelected] = React.useState('');
  const tree = React.useMemo(() => buildMenuTree(menuItems), [menuItems]);
  return (
    <Paper variant="outlined" sx={{ width, height: '100%', overflow: 'auto', ...sx }} style={fontStyle}>
      <Typography variant="subtitle2" sx={{ px: 2, pt: 2, pb: 1 }} style={fontStyle}>{title}</Typography>
      <Divider />
      <List dense disablePadding>
        {tree.map((node, i) => (
          <NestedMenuItem key={i} node={node} depth={0} selected={selected} onSelect={setSelected} interactive fontStyle={fontStyle} />
        ))}
      </List>
    </Paper>
  );
};

interface Props {
  node: CanvasNode;
  interactive?: boolean;
}

/* Extract font-related properties from sx into an inline style object.
   Inline styles guarantee override of MUI variant CSS classes. */
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

/** Build an sx patch that forces font overrides on ALL inner MUI text elements.
 *  This is needed for compound components (Card, Drawer, Dialog, etc.) whose
 *  inner Typography / ListItemText elements set their own font classes. */
const fontSxOverride = (fs: React.CSSProperties): Record<string, unknown> => {
  if (Object.keys(fs).length === 0) return {};
  return {
    '& .MuiTypography-root, & .MuiListItemText-primary, & .MuiListItemText-secondary, & .MuiButton-root, & .MuiTab-root, & .MuiChip-label, & .MuiAlert-message, & .MuiTableCell-root, & .MuiAccordionSummary-content, & .MuiBreadcrumbs-li, & .MuiLink-root': fs,
  };
};

const ComponentRenderer: React.FC<Props> = ({ node, interactive }) => {
  const { type, props, sx: rawSx } = node;
  const sx = rawSx ?? {};
  const fontStyle = fontStyleFromSx(sx);
  const fontOverrideSx = fontSxOverride(fontStyle);

  switch (type) {
    /* ── Inputs ──────────────────────────────────────────── */
    case 'Button':
      return (
        <Button
          variant={props.variant as 'contained' | 'outlined' | 'text'}
          color={props.color as 'primary'}
          size={props.size as 'small' | 'medium' | 'large'}
          disabled={props.disabled as boolean}
          sx={{ ...sx, textTransform: 'none' }}
          style={fontStyle}
          fullWidth
        >
          {props.label as string}
        </Button>
      );

    case 'IconButton':
      return (
        <IconButton
          color={props.color as 'primary'}
          size={props.size as 'small' | 'medium' | 'large'}
          disabled={props.disabled as boolean}
          sx={sx}
          style={fontStyle}
        >
          <StarIcon />
        </IconButton>
      );

    case 'ButtonGroup':
      return (
        <ButtonGroup
          variant={props.variant as 'outlined'}
          color={props.color as 'primary'}
          sx={{ ...sx, ...fontOverrideSx }}
          style={fontStyle}
        >
          {(props.buttons as string[])?.map((b, i) => (
            <Button key={i} style={fontStyle}>{b}</Button>
          ))}
        </ButtonGroup>
      );

    case 'TextField':
      return (
        <TextField
          label={props.label as string}
          placeholder={props.placeholder as string}
          variant={props.variant as 'outlined' | 'filled' | 'standard'}
          size={props.size as 'small' | 'medium'}
          disabled={props.disabled as boolean}
          fullWidth={props.fullWidth as boolean}
          sx={sx}
          inputProps={{ style: fontStyle }}
        />
      );

    case 'Select':
      return (
        <FormControl fullWidth size="small" sx={sx}>
          <InputLabel>{props.label as string}</InputLabel>
          <Select label={props.label as string} defaultValue="">
            {(props.options as string[])?.map((o, i) => (
              <MenuItem key={i} value={o}>{o}</MenuItem>
            ))}
          </Select>
        </FormControl>
      );

    case 'Checkbox':
      return (
        <FormControlLabel
          control={
            interactive
              ? <Checkbox defaultChecked={props.checked as boolean} disabled={props.disabled as boolean} color={props.color as 'primary'} />
              : <Checkbox checked={props.checked as boolean} disabled={props.disabled as boolean} color={props.color as 'primary'} />
          }
          label={props.label as string}
          sx={sx}
          style={fontStyle}
        />
      );

    case 'Radio':
      return (
        <FormControl sx={sx} style={fontStyle}>
          <FormLabel style={fontStyle}>{props.label as string}</FormLabel>
          <RadioGroup row={props.row as boolean} defaultValue={(props.options as string[])?.[0]}>
            {(props.options as string[])?.map((o, i) => (
              <FormControlLabel key={i} value={o} control={<Radio />} label={o} style={fontStyle} />
            ))}
          </RadioGroup>
        </FormControl>
      );

    case 'Switch':
      return (
        <FormControlLabel
          control={
            interactive
              ? <Switch defaultChecked={props.checked as boolean} disabled={props.disabled as boolean} color={props.color as 'primary'} />
              : <Switch checked={props.checked as boolean} disabled={props.disabled as boolean} color={props.color as 'primary'} />
          }
          label={props.label as string}
          sx={sx}
          style={fontStyle}
        />
      );

    case 'Slider':
      return (
        <Box sx={{ px: 1, ...sx }}>
          <Slider
            {...(interactive ? { defaultValue: props.value as number } : { value: props.value as number })}
            min={props.min as number}
            max={props.max as number}
            step={props.step as number}
            disabled={props.disabled as boolean}
            color={props.color as 'primary'}
            valueLabelDisplay="auto"
          />
        </Box>
      );

    case 'Rating':
      return (
        <Rating
          {...(interactive ? { defaultValue: props.value as number } : { value: props.value as number })}
          max={props.max as number}
          precision={Number(props.precision) || 1}
          readOnly={interactive ? false : (props.readOnly as boolean)}
          disabled={props.disabled as boolean}
          size={props.size as 'small' | 'medium' | 'large'}
          sx={sx}
        />
      );

    case 'Autocomplete':
      return (
        <Autocomplete
          options={props.options as string[]}
          renderInput={(params) => <TextField {...params} label={props.label as string} size="small" />}
          sx={sx}
          size="small"
        />
      );

    case 'Fab':
      return (
        <Fab
          color={props.color as 'primary'}
          size={props.size as 'small' | 'medium' | 'large'}
          sx={sx}
        >
          <AddIcon />
        </Fab>
      );

    /* ── Data Display ────────────────────────────────────── */
    case 'Typography':
      return (
        <Typography
          variant={props.variant as 'body1'}
          color={props.color as string}
          align={props.align as 'left' | 'center' | 'right'}
          gutterBottom={props.gutterBottom as boolean}
          sx={sx}
          style={fontStyle}
        >
          {props.text as string}
        </Typography>
      );

    case 'Avatar':
      return (
        <Avatar
          variant={props.variant as 'circular'}
          sx={{ bgcolor: props.bgColor as string, width: '100%', height: '100%', fontSize: 20, ...sx }}
        >
          {props.text as string}
        </Avatar>
      );

    case 'Badge':
      return (
        <Badge
          badgeContent={props.badgeContent as string}
          color={props.color as 'primary'}
          variant={props.variant as 'standard' | 'dot'}
          sx={sx}
        >
          <MailIcon color="action" />
        </Badge>
      );

    case 'Chip':
      return (
        <Chip
          label={props.label as string}
          variant={props.variant as 'filled' | 'outlined'}
          color={props.color as 'primary'}
          size={props.size as 'small' | 'medium'}
          clickable={props.clickable as boolean}
          onDelete={props.deletable ? () => {} : undefined}
          sx={sx}
          style={fontStyle}
        />
      );

    case 'Divider':
      return props.text ? (
        <Divider textAlign={props.textAlign as 'center'} sx={sx}>{props.text as string}</Divider>
      ) : (
        <Divider
          orientation={props.orientation as 'horizontal' | 'vertical'}
          variant={props.variant as 'fullWidth'}
          sx={{ my: 1, ...sx }}
        />
      );

    case 'List':
      return (
        <List dense={props.dense as boolean} sx={{ bgcolor: 'background.paper', ...sx, ...fontOverrideSx }} style={fontStyle}>
          {(props.items as string[])?.map((item, i) => (
            <ListItem key={i} divider={i < (props.items as string[]).length - 1}>
              <ListItemText primary={item} primaryTypographyProps={{ style: fontStyle }} />
            </ListItem>
          ))}
        </List>
      );

    case 'Table': {
      const columns = (props.columns as string[]) ?? ['#', 'Name', 'Email', 'Role'];
      const rows = (props.rows as string[]) ?? ['1,Alice,alice@mail.com,Admin', '2,Bob,bob@mail.com,User'];
      return (
        <TableContainer component={Paper} sx={{ ...sx, ...fontOverrideSx }} style={fontStyle}>
          <Table size={props.size as 'small' | 'medium'} stickyHeader={props.stickyHeader as boolean}>
            <TableHead>
              <TableRow>
                {columns.map((col, i) => (
                  <TableCell key={i} style={fontStyle}>{col}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((row, ri) => {
                const cells = String(row).split(',');
                return (
                  <TableRow key={ri}>
                    {columns.map((_, ci) => (
                      <TableCell key={ci} style={fontStyle}>{cells[ci] ?? ''}</TableCell>
                    ))}
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      );
    }

    case 'Tooltip':
      return (
        <Tooltip title={props.title as string} placement={props.placement as 'top'} arrow={props.arrow as boolean}>
          <Button variant="outlined" size="small" sx={sx}>Hover me</Button>
        </Tooltip>
      );

    case 'Image':
      return (
        <Box
          component="img"
          src={props.src as string}
          alt={props.alt as string}
          sx={{ width: '100%', height: '100%', objectFit: props.objectFit as string, display: 'block', ...sx }}
        />
      );

    /* ── Surfaces ────────────────────────────────────────── */
    case 'Card':
      return (
        <Card elevation={props.elevation as number} sx={{ height: '100%', ...sx, ...fontOverrideSx }} style={fontStyle}>
          <CardHeader title={props.title as string} titleTypographyProps={{ variant: 'subtitle1', style: fontStyle }} />
          <CardContent>
            <Typography variant="body2" color="text.secondary" style={fontStyle}>{props.content as string}</Typography>
          </CardContent>
        </Card>
      );

    case 'Paper':
      return (
        <Paper
          elevation={props.elevation as number}
          square={props.square as boolean}
          variant={props.variant as 'elevation' | 'outlined'}
          sx={{ height: '100%', ...sx }}
        />
      );

    case 'Accordion':
      return (
        <Box sx={{ ...sx, ...fontOverrideSx }} style={fontStyle}>
          <Accordion defaultExpanded={props.defaultExpanded as boolean}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography style={fontStyle}>{props.title as string}</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="body2" style={fontStyle}>{props.content as string}</Typography>
            </AccordionDetails>
          </Accordion>
        </Box>
      );

    /* ── Navigation ──────────────────────────────────────── */
    case 'AppBar': {
      const actions = (props.actions as string[]) ?? ['Login'];
      return (
        <AppBar position="static" color={props.color as 'primary'} sx={{ ...sx, ...fontOverrideSx }} style={fontStyle}>
          <Toolbar variant="dense">
            <Typography variant="h6" sx={{ flexGrow: 1 }} style={fontStyle}>{props.title as string}</Typography>
            {actions.map((a, i) => (
              <Button key={i} color="inherit" style={fontStyle}>{a}</Button>
            ))}
          </Toolbar>
        </AppBar>
      );
    }

    case 'Tabs':
      if (interactive) {
        return <InteractiveTabs tabs={props.tabs as string[]} color={props.color as string} variant={props.variant as string} sx={sx} />;
      }
      return (
        <Box sx={{ ...sx, ...fontOverrideSx }} style={fontStyle}>
          <Tabs value={0} textColor={props.color as 'primary'} indicatorColor={props.color as 'primary'} variant={props.variant as 'standard'}>
            {(props.tabs as string[])?.map((t, i) => <Tab key={i} label={t} style={fontStyle} />)}
          </Tabs>
        </Box>
      );

    case 'Breadcrumbs':
      return (
        <Breadcrumbs sx={{ ...sx, ...fontOverrideSx }} style={fontStyle}>
          {(props.items as string[])?.map((item, i, arr) =>
            i === arr.length - 1
              ? <Typography key={i} color="text.primary" style={fontStyle}>{item}</Typography>
              : <Link key={i} underline="hover" color="inherit" href="#" style={fontStyle}>{item}</Link>
          )}
        </Breadcrumbs>
      );

    case 'Drawer': {
      const menuItems = (props.menuItems as string[]) ?? ['Menu 1', 'Menu 2', 'Menu 3'];
      const drawerTitle = (props.title as string) ?? 'Drawer';
      if (interactive) {
        return <InteractiveDrawer title={drawerTitle} menuItems={menuItems} width={props.width as number} sx={sx} fontStyle={fontStyle} />;
      }
      const tree = buildMenuTree(menuItems);
      return (
        <Paper variant="outlined" sx={{ width: props.width as number, height: '100%', overflow: 'auto', ...sx, ...fontOverrideSx }} style={fontStyle}>
          <Typography variant="subtitle2" sx={{ px: 2, pt: 2, pb: 1 }} style={fontStyle}>{drawerTitle}</Typography>
          <Divider />
          <List dense disablePadding>
            {tree.map((node, i) => (
              <NestedMenuItem key={i} node={node} depth={0} selected="" onSelect={() => {}} fontStyle={fontStyle} />
            ))}
          </List>
        </Paper>
      );
    }

    case 'Pagination':
      if (interactive) {
        return <InteractivePagination count={props.count as number} color={props.color as string} shape={props.shape as string} variant={props.variant as string} size={props.size as string} sx={sx} />;
      }
      return (
        <Pagination
          count={props.count as number}
          color={props.color as 'primary'}
          shape={props.shape as 'rounded'}
          variant={props.variant as 'outlined'}
          size={props.size as 'medium'}
          sx={sx}
        />
      );

    case 'Stepper':
      return (
        <Stepper activeStep={props.activeStep as number} orientation={props.orientation as 'horizontal'} sx={sx}>
          {(props.steps as string[])?.map((s) => (
            <Step key={s}><StepLabel>{s}</StepLabel></Step>
          ))}
        </Stepper>
      );

    case 'BottomNavigation':
      if (interactive) {
        return <InteractiveBottomNav items={props.items as string[]} showLabels={props.showLabels as boolean} sx={sx} />;
      }
      return (
        <BottomNavigation showLabels={props.showLabels as boolean} value={0} sx={sx}>
          {(props.items as string[])?.map((item, i) => (
            <BottomNavigationAction
              key={i}
              label={item}
              icon={[<RestoreIcon key="r" />, <FavoriteIcon key="f" />, <LocationIcon key="l" />][i % 3]}
            />
          ))}
        </BottomNavigation>
      );

    case 'SpeedDial': {
      const sdActions = (props.actions as string[]) ?? ['Edit', 'Share', 'Print'];
      const sdIcons = [<EditIcon key="e" />, <ShareIcon key="s" />, <PrintIcon key="p" />, <MailIcon key="m" />, <FavoriteIcon key="f" />, <StarIcon key="st" />];
      return (
        <Box sx={{ width: '100%', height: '100%', position: 'relative', ...sx }}>
          <SpeedDial
            ariaLabel="Speed Dial"
            icon={<AddIcon />}
            direction={props.direction as 'up'}
            sx={{ position: 'absolute', bottom: 8, right: 8 }}
            {...(interactive ? {} : { open: false })}
          >
            {sdActions.map((a, i) => (
              <SpeedDialAction key={i} icon={sdIcons[i % sdIcons.length]} tooltipTitle={a} />
            ))}
          </SpeedDial>
        </Box>
      );
    }

    /* ── Feedback ────────────────────────────────────────── */
    case 'Alert':
      return (
        <Alert severity={props.severity as 'info'} variant={props.variant as 'standard'} sx={sx} style={fontStyle}>
          {props.text as string}
        </Alert>
      );

    case 'Snackbar':
      return (
        <Paper elevation={6} sx={{ p: 1.5, px: 2, display: 'flex', alignItems: 'center', ...sx, ...fontOverrideSx }} style={fontStyle}>
          <Typography variant="body2" style={fontStyle}>{props.message as string}</Typography>
        </Paper>
      );

    case 'Dialog': {
      const dialogActions = (props.actions as string[]) ?? ['Cancel', 'OK'];
      return (
        <Paper variant="outlined" sx={{ p: 2, ...sx, ...fontOverrideSx }} style={fontStyle}>
          <Typography variant="h6" gutterBottom style={fontStyle}>{props.title as string}</Typography>
          <Typography variant="body2" color="text.secondary" style={fontStyle}>{props.content as string}</Typography>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 2 }}>
            {dialogActions.map((a, i) => (
              <Button
                key={i}
                size="small"
                variant={i === dialogActions.length - 1 ? 'contained' : 'text'}
                style={fontStyle}
              >
                {a}
              </Button>
            ))}
          </Box>
        </Paper>
      );
    }

    case 'CircularProgress':
      return (
        <CircularProgress
          variant={props.variant as 'indeterminate' | 'determinate'}
          color={props.color as 'primary'}
          size={props.size as number}
          value={props.variant === 'determinate' ? (props.value as number) : undefined}
          sx={sx}
        />
      );

    case 'LinearProgress':
      return (
        <LinearProgress
          variant={props.variant as 'indeterminate' | 'determinate'}
          color={props.color as 'primary'}
          value={props.variant === 'determinate' ? (props.value as number) : undefined}
          sx={{ width: '100%', ...sx }}
        />
      );

    case 'Skeleton':
      return (
        <Skeleton
          variant={props.variant as 'rectangular'}
          animation={props.animation === 'false' ? false : (props.animation as 'pulse' | 'wave')}
          sx={{ width: '100%', height: '100%', ...sx }}
        />
      );

    /* ── Layout ──────────────────────────────────────────── */
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
