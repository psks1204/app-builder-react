import React from 'react';
import { Box, Typography } from '@mui/material';
import { useDraggable } from '@dnd-kit/core';
import * as MuiIcons from '@mui/icons-material';
import type { ComponentMeta } from '../../store/types';

interface PaletteItemProps {
  meta: ComponentMeta;
}

const PaletteItem: React.FC<PaletteItemProps> = ({ meta }) => {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `palette-${meta.type}`,
    data: { meta },
  });

  // Dynamically resolve MUI icon
  const IconComponent = (MuiIcons as Record<string, React.ElementType>)[meta.icon] ?? MuiIcons.Widgets;

  return (
    <Box
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 0.5,
        p: 1,
        borderRadius: 1,
        cursor: 'grab',
        border: 1,
        borderColor: 'transparent',
        opacity: isDragging ? 0.4 : 1,
        userSelect: 'none',
        transition: 'all 0.15s',
        '&:hover': {
          bgcolor: 'action.hover',
          borderColor: 'divider',
        },
      }}
    >
      <IconComponent fontSize="small" sx={{ color: 'text.secondary' }} />
      <Typography
        variant="caption"
        sx={{
          fontSize: 10,
          lineHeight: 1.2,
          textAlign: 'center',
          color: 'text.secondary',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          maxWidth: '100%',
        }}
      >
        {meta.displayName}
      </Typography>
    </Box>
  );
};

export default PaletteItem;
