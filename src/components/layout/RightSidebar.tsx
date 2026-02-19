import React from 'react';
import { Box, Typography } from '@mui/material';
import { useBuilderStore } from '../../store/useBuilderStore';
import { getComponentMeta } from '../palette/componentRegistry';
import { flattenTree } from '../../utils/treeUtils';
import PropertiesPanel from '../properties/PropertiesPanel';

const RIGHT_WIDTH = 300;

const RightSidebar: React.FC = () => {
  const { canvasNodes, selectedNodeIds } = useBuilderStore();

  // Get first selected node
  const selectedId = selectedNodeIds.size === 1 ? [...selectedNodeIds][0] : null;
  const allNodes = flattenTree(canvasNodes);
  const node = selectedId ? allNodes.find((n) => n.id === selectedId) : undefined;
  const meta = node ? getComponentMeta(node.type) : undefined;

  return (
    <Box
      sx={{
        width: RIGHT_WIDTH,
        minWidth: RIGHT_WIDTH,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        borderLeft: 1,
        borderColor: 'divider',
        bgcolor: 'background.paper',
        overflow: 'hidden',
      }}
    >
      {node && meta ? (
        <PropertiesPanel node={node} meta={meta} />
      ) : (
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1, p: 3 }}>
          <Typography variant="body2" sx={{ color: 'text.disabled', textAlign: 'center' }}>
            {selectedNodeIds.size > 1
              ? `${selectedNodeIds.size} items selected`
              : 'Select a component to edit its properties'}
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default RightSidebar;
