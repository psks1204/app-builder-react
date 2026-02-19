import React, { useState } from 'react';
import {
  Box, Typography, TextField, Accordion, AccordionSummary, AccordionDetails,
  InputAdornment,
} from '@mui/material';
import { ExpandMore as ExpandMoreIcon, Search as SearchIcon } from '@mui/icons-material';
import { componentRegistry, registryCategories } from '../palette/componentRegistry';
import PaletteItem from '../palette/PaletteItem';

const LEFT_WIDTH = 260;

const LeftSidebar: React.FC = () => {
  const [search, setSearch] = useState('');

  const filtered = search
    ? componentRegistry.filter((c) =>
        c.displayName.toLowerCase().includes(search.toLowerCase()) ||
        c.type.toLowerCase().includes(search.toLowerCase())
      )
    : componentRegistry;

  return (
    <Box
      sx={{
        width: LEFT_WIDTH,
        minWidth: LEFT_WIDTH,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        borderRight: 1,
        borderColor: 'divider',
        bgcolor: 'background.paper',
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <Box sx={{ px: 2, py: 1.5, borderBottom: 1, borderColor: 'divider' }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
          Components
        </Typography>
        <TextField
          placeholder="Search…"
          size="small"
          fullWidth
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment>
              ),
            },
          }}
        />
      </Box>

      {/* Scrollable palette */}
      <Box sx={{ flex: 1, overflowY: 'auto', overflowX: 'hidden' }}>
        {registryCategories.map((cat) => {
          const items = filtered.filter((c) => c.category === cat);
          if (items.length === 0) return null;
          return (
            <Accordion
              key={cat}
              defaultExpanded
              disableGutters
              elevation={0}
              sx={{ '&:before': { display: 'none' }, bgcolor: 'transparent' }}
            >
              <AccordionSummary
                expandIcon={<ExpandMoreIcon fontSize="small" />}
                sx={{ minHeight: 36, px: 2, '& .MuiAccordionSummary-content': { my: 0.5 } }}
              >
                <Typography variant="caption" sx={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5, color: 'text.secondary' }}>
                  {cat} ({items.length})
                </Typography>
              </AccordionSummary>
              <AccordionDetails sx={{ p: 0, px: 1, pb: 1 }}>
                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0.5 }}>
                  {items.map((meta) => (
                    <PaletteItem key={meta.type} meta={meta} />
                  ))}
                </Box>
              </AccordionDetails>
            </Accordion>
          );
        })}
      </Box>
    </Box>
  );
};

export default LeftSidebar;
