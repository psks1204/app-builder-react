import React, { useState, useEffect, useCallback } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button,
  List, ListItemButton, ListItemText, ListItemSecondaryAction,
  IconButton, Typography, Alert, CircularProgress, Box, Chip, Tooltip,
  DialogContentText,
} from '@mui/material';
import {
  Delete as DeleteIcon,
  FolderOpen as OpenIcon,
} from '@mui/icons-material';
import { useBuilderStore } from '../../store/useBuilderStore';
import { listDesigns, loadDesign, deleteDesign, type DesignSummary } from '../../api/designsApi';

interface Props {
  open: boolean;
  onClose: () => void;
}

const OpenDesignDialog: React.FC<Props> = ({ open, onClose }) => {
  const { setCurrentDesign, loadDesignState } = useBuilderStore();

  const [designs, setDesigns] = useState<DesignSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<DesignSummary | null>(null);

  const fetchDesigns = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const list = await listDesigns();
      setDesigns(list);
    } catch {
      setError('Failed to load designs. Is the server running?');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (open) fetchDesigns();
  }, [open, fetchDesigns]);

  const handleOpen = async (design: DesignSummary) => {
    setActionLoading(design.id);
    setError(null);
    try {
      const data = await loadDesign(design.id);
      loadDesignState(data.state);
      setCurrentDesign(data.id, data.name);
      onClose();
    } catch {
      setError('Failed to load design');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async () => {
    if (!confirmDelete) return;
    setActionLoading(confirmDelete.id);
    try {
      await deleteDesign(confirmDelete.id);
      setDesigns((prev) => prev.filter((d) => d.id !== confirmDelete.id));
      setConfirmDelete(null);
    } catch {
      setError('Failed to delete design');
    } finally {
      setActionLoading(null);
    }
  };

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString(undefined, {
      month: 'short', day: 'numeric', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  };

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
        <DialogTitle>Open Design</DialogTitle>
        <DialogContent sx={{ minHeight: 200 }}>
          {error && (
            <Alert severity="error" variant="outlined" sx={{ mb: 2, py: 0 }}>
              {error}
            </Alert>
          )}

          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : designs.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography color="text.secondary">No saved designs yet.</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Use Save to create your first design.
              </Typography>
            </Box>
          ) : (
            <List disablePadding>
              {designs.map((d) => (
                <ListItemButton
                  key={d.id}
                  onClick={() => handleOpen(d)}
                  disabled={actionLoading === d.id}
                  sx={{
                    borderRadius: 1, mb: 0.5,
                    '&:hover': { bgcolor: 'action.hover' },
                  }}
                >
                  <OpenIcon sx={{ mr: 2, color: 'primary.main', fontSize: 20 }} />
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="subtitle2">{d.name}</Typography>
                        <Chip
                          label={`${d.nodeCount} items`}
                          size="small"
                          variant="outlined"
                          sx={{ height: 20, fontSize: 11 }}
                        />
                        {d.frameWidth && d.frameHeight && (
                          <Chip
                            label={`${d.frameWidth}×${d.frameHeight}`}
                            size="small"
                            variant="outlined"
                            sx={{ height: 20, fontSize: 11, fontVariantNumeric: 'tabular-nums' }}
                          />
                        )}
                      </Box>
                    }
                    secondary={`Last saved: ${formatDate(d.updatedAt)}`}
                  />
                  <ListItemSecondaryAction>
                    {actionLoading === d.id ? (
                      <CircularProgress size={20} />
                    ) : (
                      <Tooltip title="Delete">
                        <IconButton
                          edge="end"
                          size="small"
                          color="error"
                          onClick={(e) => {
                            e.stopPropagation();
                            setConfirmDelete(d);
                          }}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    )}
                  </ListItemSecondaryAction>
                </ListItemButton>
              ))}
            </List>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={onClose}>Cancel</Button>
        </DialogActions>
      </Dialog>

      {/* Delete confirmation dialog */}
      <Dialog open={!!confirmDelete} onClose={() => setConfirmDelete(null)} maxWidth="xs">
        <DialogTitle>Delete Design?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete &ldquo;<strong>{confirmDelete?.name}</strong>&rdquo;?
            This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDelete(null)}>Cancel</Button>
          <Button color="error" variant="contained" onClick={handleDelete}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default OpenDesignDialog;
