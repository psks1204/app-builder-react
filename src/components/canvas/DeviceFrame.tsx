import React from 'react';
import { Box, Typography } from '@mui/material';
import { DesktopWindows as DesktopIcon } from '@mui/icons-material';
import { useBuilderStore } from '../../store/useBuilderStore';

const DeviceFrame: React.FC = () => {
  const { deviceFrame } = useBuilderStore();
  const { x, y, width, height, bgColor } = deviceFrame;

  return (
    <>
      {/* ── Frame label ──────────────────────────────────── */}
      <Box
        sx={{
          position: 'absolute',
          left: x,
          top: y - 28,
          display: 'flex',
          alignItems: 'center',
          gap: 0.5,
          pointerEvents: 'none',
          userSelect: 'none',
        }}
      >
        <DesktopIcon sx={{ fontSize: 14, color: 'primary.main' }} />
        <Typography
          variant="caption"
          sx={{ color: 'primary.main', fontWeight: 600, letterSpacing: 0.5 }}
        >
          Desktop — {width} × {height}
        </Typography>
      </Box>

      {/* ── White background (the "page") ────────────────── */}
      <Box
        sx={{
          position: 'absolute',
          left: x,
          top: y,
          width,
          height,
          bgcolor: bgColor || '#ffffff',
          borderRadius: '4px',
          boxShadow: '0 2px 20px rgba(0,0,0,0.15)',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />

      {/* ── Border frame (rendered ABOVE nodes) ──────────── */}
      <Box
        sx={{
          position: 'absolute',
          left: x,
          top: y,
          width,
          height,
          border: '2px dashed',
          borderColor: 'primary.main',
          borderRadius: '4px',
          pointerEvents: 'none',
          zIndex: 9999,
          opacity: 0.5,
        }}
      />

      {/* ── Drop-here hint when canvas is empty ──────────── */}
      <Box
        sx={{
          position: 'absolute',
          left: x,
          top: y,
          width,
          height,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          pointerEvents: 'none',
          zIndex: 1,
        }}
      >
        <Typography variant="body2" sx={{ color: 'rgba(0,0,0,0.2)', fontWeight: 500 }}>
          Drop components inside this frame for preview & export
        </Typography>
      </Box>
    </>
  );
};

export default DeviceFrame;
