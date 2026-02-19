import React from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, IconButton, Typography, Box,
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import { useBuilderStore } from '../../store/useBuilderStore';
import ComponentRenderer from './ComponentRenderer';

interface PreviewModalProps {
  open: boolean;
  onClose: () => void;
}

const PreviewModal: React.FC<PreviewModalProps> = ({ open, onClose }) => {
  const { getNodesInFrame, deviceFrame } = useBuilderStore();
  const nodes = getNodesInFrame();

  return (
    <Dialog open={open} onClose={onClose} fullScreen>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', py: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="subtitle1">Live Preview</Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            ({deviceFrame.width} × {deviceFrame.height})
          </Typography>
        </Box>
        <IconButton onClick={onClose} size="small"><CloseIcon fontSize="small" /></IconButton>
      </DialogTitle>
      <DialogContent
        dividers
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'flex-start',
          bgcolor: (t) => t.palette.mode === 'dark' ? '#1a1a1a' : '#e0e0e0',
          overflow: 'auto',
          p: 3,
        }}
      >
        <Box
          sx={{
            width: deviceFrame.width,
            minHeight: deviceFrame.height,
            bgcolor: '#ffffff',
            borderRadius: 1,
            position: 'relative',
            boxShadow: '0 4px 24px rgba(0,0,0,0.2)',
            flexShrink: 0,
          }}
        >
          {nodes.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <Typography color="text.disabled">No components inside the Desktop frame</Typography>
              <Typography variant="body2" color="text.disabled">Place components inside the dashed frame on the canvas</Typography>
            </Box>
          ) : (
            nodes.map((node) => (
              <Box
                key={node.id}
                sx={{
                  position: 'absolute',
                  left: node.position.x - deviceFrame.x,
                  top: node.position.y - deviceFrame.y,
                  width: node.size.width,
                  height: node.size.height,
                }}
              >
                <ComponentRenderer node={node} interactive />
              </Box>
            ))
          )}
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default PreviewModal;
