import React from 'react';
import { Box } from '@mui/material';

const GridOverlay: React.FC = () => (
  <Box
    sx={{
      position: 'absolute',
      inset: 0,
      pointerEvents: 'none',
      zIndex: 0,
      backgroundSize: '20px 20px',
      backgroundImage: 'radial-gradient(circle, rgba(128,128,128,0.15) 1px, transparent 1px)',
    }}
  />
);

export default GridOverlay;
