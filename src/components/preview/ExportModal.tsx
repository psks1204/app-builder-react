import React, { useMemo, useState } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, IconButton, Typography, Box, Tabs, Tab,
} from '@mui/material';
import {
  Close as CloseIcon,
  ContentCopy as CopyIcon,
  Download as DownloadIcon,
  Check as CheckIcon,
} from '@mui/icons-material';
import { useBuilderStore } from '../../store/useBuilderStore';
import { generateReactCode } from '../../codegen/codeGenerator';

interface ExportModalProps {
  open: boolean;
  onClose: () => void;
}

const ExportModal: React.FC<ExportModalProps> = ({ open, onClose }) => {
  const { getNodesInFrame, deviceFrame } = useBuilderStore();
  const [copied, setCopied] = useState(false);
  const [tab, setTab] = useState(0);

  const code = useMemo(() => (open ? generateReactCode(getNodesInFrame(), deviceFrame) : ''), [open]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = code;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([code], { type: 'text/typescript' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'GeneratedPage.tsx';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        Export React Code
        <IconButton onClick={onClose} size="small"><CloseIcon fontSize="small" /></IconButton>
      </DialogTitle>
      <DialogContent dividers sx={{ p: 0 }}>
        <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ px: 2 }}>
          <Tab label="Generated Code" />
          <Tab label="How to Use" />
        </Tabs>

        {tab === 0 && (
          <Box
            component="pre"
            sx={{
              m: 0, p: 2,
              bgcolor: (t) => t.palette.mode === 'dark' ? '#1a1a1a' : '#f5f5f5',
              overflow: 'auto',
              maxHeight: 400,
              fontSize: 12,
              fontFamily: 'monospace',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
            }}
          >
            <code>{code}</code>
          </Box>
        )}

        {tab === 1 && (
          <Box sx={{ p: 3 }}>
            <Typography variant="subtitle1" gutterBottom>Getting Started</Typography>
            <Typography variant="body2" component="ol" sx={{ pl: 2 }}>
              <li>Create a new React project: <code>npm create vite@latest my-app -- --template react-ts</code></li>
              <li>Install MUI: <code>npm install @mui/material @mui/icons-material @emotion/react @emotion/styled</code></li>
              <li>Copy the generated code into <code>src/GeneratedPage.tsx</code></li>
              <li>Import and render <code>{'<GeneratedPage />'}</code> in your App.tsx</li>
              <li>Run <code>npm run dev</code></li>
            </Typography>
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
        <Button
          startIcon={copied ? <CheckIcon /> : <CopyIcon />}
          onClick={handleCopy}
          variant="outlined"
        >
          {copied ? 'Copied!' : 'Copy'}
        </Button>
        <Button
          startIcon={<DownloadIcon />}
          onClick={handleDownload}
          variant="contained"
        >
          Download .tsx
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ExportModal;
