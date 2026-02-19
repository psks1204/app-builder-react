import React, { useState, useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button,
  TextField, Typography, Alert, CircularProgress,
} from '@mui/material';
import { useBuilderStore } from '../../store/useBuilderStore';
import { createDesign, updateDesign } from '../../api/designsApi';

interface Props {
  open: boolean;
  onClose: () => void;
}

const SaveDesignDialog: React.FC<Props> = ({ open, onClose }) => {
  const {
    currentDesignId, currentDesignName,
    getStateSnapshot, setCurrentDesign, saveToLocalStorage,
  } = useBuilderStore();

  const [name, setName] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Pre-fill name when dialog opens
  useEffect(() => {
    if (open) {
      setName(currentDesignName ?? '');
      setError(null);
      setSuccess(null);
    }
  }, [open, currentDesignName]);

  const handleSaveNew = async () => {
    if (!name.trim()) { setError('Please enter a design name'); return; }
    setSaving(true);
    setError(null);
    try {
      const state = getStateSnapshot();
      const result = await createDesign(name.trim(), state);
      setCurrentDesign(result.id, result.name);
      saveToLocalStorage();
      setSuccess(`Design "${result.name}" saved successfully!`);
      setTimeout(onClose, 800);
    } catch {
      setError('Failed to save design. Is the server running?');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdate = async () => {
    if (!currentDesignId) return;
    setSaving(true);
    setError(null);
    try {
      const state = getStateSnapshot();
      const result = await updateDesign(currentDesignId, { name: name.trim() || undefined, state });
      setCurrentDesign(result.id, result.name);
      saveToLocalStorage();
      setSuccess(`Design "${result.name}" updated!`);
      setTimeout(onClose, 800);
    } catch {
      setError('Failed to update design. Is the server running?');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Save Design</DialogTitle>
      <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: '8px !important' }}>
        {currentDesignId && (
          <Typography variant="body2" color="text.secondary">
            Currently editing: <strong>{currentDesignName}</strong>
          </Typography>
        )}

        <TextField
          autoFocus
          label="Design Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          fullWidth
          size="small"
          placeholder="e.g. Dashboard Layout, Login Page"
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              currentDesignId ? handleUpdate() : handleSaveNew();
            }
          }}
        />

        {error && <Alert severity="error" variant="outlined" sx={{ py: 0 }}>{error}</Alert>}
        {success && <Alert severity="success" variant="outlined" sx={{ py: 0 }}>{success}</Alert>}
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} disabled={saving}>Cancel</Button>
        {currentDesignId && (
          <Button
            variant="outlined"
            onClick={handleUpdate}
            disabled={saving}
            startIcon={saving ? <CircularProgress size={16} /> : undefined}
          >
            Update
          </Button>
        )}
        <Button
          variant="contained"
          onClick={handleSaveNew}
          disabled={saving || !name.trim()}
          startIcon={saving ? <CircularProgress size={16} /> : undefined}
        >
          {currentDesignId ? 'Save as New' : 'Save'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SaveDesignDialog;
