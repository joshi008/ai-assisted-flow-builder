// Flow layout utilities for better node positioning

export const LAYOUT_CONFIG = {
  NODE_WIDTH: 300,
  NODE_HEIGHT: 200,
  HORIZONTAL_SPACING: 350,
  VERTICAL_SPACING: 350,
  GRID_START_X: 200,
  GRID_START_Y: 100,
  MIN_DISTANCE: 250, // Minimum distance between nodes
};

// Calculate optimal position for a new node
export const calculateOptimalPosition = (existingNodes, preferredPosition = null) => {
  if (!existingNodes || existingNodes.length === 0) {
    return { x: LAYOUT_CONFIG.GRID_START_X, y: LAYOUT_CONFIG.GRID_START_Y };
  }

  // If preferred position is provided and doesn't overlap, use it
  if (preferredPosition && !hasOverlap(preferredPosition, existingNodes)) {
    return preferredPosition;
  }

  // Find the rightmost node to place new node to the right
  const rightmostNode = existingNodes.reduce((max, node) => 
    node.position.x > max.position.x ? node : max
  );

  const newX = rightmostNode.position.x + LAYOUT_CONFIG.HORIZONTAL_SPACING;
  const newY = rightmostNode.position.y;

  // Check if this position would overlap with any existing node
  const candidatePosition = { x: newX, y: newY };
  if (!hasOverlap(candidatePosition, existingNodes)) {
    return candidatePosition;
  }

  // If overlap, try grid positions
  return findNextGridPosition(existingNodes);
};

// Check if a position overlaps with existing nodes
const hasOverlap = (position, existingNodes) => {
  return existingNodes.some(node => {
    const distance = Math.sqrt(
      Math.pow(position.x - node.position.x, 2) + 
      Math.pow(position.y - node.position.y, 2)
    );
    return distance < LAYOUT_CONFIG.MIN_DISTANCE;
  });
};

// Find next available grid position
const findNextGridPosition = (existingNodes) => {
  const gridPositions = generateGridPositions(5, 4); // 5 columns, 4 rows
  
  for (const position of gridPositions) {
    if (!hasOverlap(position, existingNodes)) {
      return position;
    }
  }
  
  // If all grid positions are taken, place at the end
  const maxX = Math.max(...existingNodes.map(n => n.position.x));
  return { 
    x: maxX + LAYOUT_CONFIG.HORIZONTAL_SPACING, 
    y: LAYOUT_CONFIG.GRID_START_Y 
  };
};

// Generate grid positions
const generateGridPositions = (cols, rows) => {
  const positions = [];
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      positions.push({
        x: LAYOUT_CONFIG.GRID_START_X + (col * LAYOUT_CONFIG.HORIZONTAL_SPACING),
        y: LAYOUT_CONFIG.GRID_START_Y + (row * LAYOUT_CONFIG.VERTICAL_SPACING),
      });
    }
  }
  return positions;
};

// Layout nodes in a flow pattern (left to right)
export const layoutNodesInFlow = (nodes) => {
  if (!nodes || nodes.length === 0) return nodes;

  return nodes.map((node, index) => ({
    ...node,
    position: {
      x: LAYOUT_CONFIG.GRID_START_X + (index * LAYOUT_CONFIG.HORIZONTAL_SPACING),
      y: LAYOUT_CONFIG.GRID_START_Y,
    },
  }));
};

// Layout nodes in a tree pattern (for branching flows)
export const layoutNodesInTree = (nodes, edges) => {
  if (!nodes || nodes.length === 0) return nodes;

  // Simple tree layout - can be enhanced for complex hierarchies
  const rootNodes = nodes.filter(node => 
    !edges.some(edge => edge.target === node.id)
  );

  const layoutedNodes = [...nodes];
  let currentLevel = 0;
  let processedNodes = new Set();

  // Position root nodes
  rootNodes.forEach((node, index) => {
    const nodeIndex = layoutedNodes.findIndex(n => n.id === node.id);
    layoutedNodes[nodeIndex] = {
      ...node,
      position: {
        x: LAYOUT_CONFIG.GRID_START_X,
        y: LAYOUT_CONFIG.GRID_START_Y + (index * LAYOUT_CONFIG.VERTICAL_SPACING),
      },
    };
    processedNodes.add(node.id);
  });

  // Position subsequent levels
  while (processedNodes.size < nodes.length) {
    currentLevel++;
    const currentLevelNodes = [];

    // Find nodes that connect from processed nodes
    edges.forEach(edge => {
      if (processedNodes.has(edge.source) && !processedNodes.has(edge.target)) {
        const targetNode = nodes.find(n => n.id === edge.target);
        if (targetNode && !currentLevelNodes.some(n => n.id === targetNode.id)) {
          currentLevelNodes.push(targetNode);
        }
      }
    });

    // Position current level nodes
    currentLevelNodes.forEach((node, index) => {
      const nodeIndex = layoutedNodes.findIndex(n => n.id === node.id);
      layoutedNodes[nodeIndex] = {
        ...node,
        position: {
          x: LAYOUT_CONFIG.GRID_START_X + (currentLevel * LAYOUT_CONFIG.HORIZONTAL_SPACING),
          y: LAYOUT_CONFIG.GRID_START_Y + (index * LAYOUT_CONFIG.VERTICAL_SPACING),
        },
      };
      processedNodes.add(node.id);
    });
  }

  return layoutedNodes;
};

// Auto-layout existing flow for better organization
export const autoLayoutFlow = (nodes, edges) => {
  if (!nodes || nodes.length === 0) return { nodes, edges };

  // Determine if it's a simple flow or complex branching
  const hasComplexBranching = edges.some(edge => 
    edges.filter(e => e.source === edge.source).length > 1
  );

  const layoutedNodes = hasComplexBranching 
    ? layoutNodesInTree(nodes, edges)
    : layoutNodesInFlow(nodes);

  // Ensure edges have proper structure for AI-generated flows
  const enhancedEdges = edges.map((edge, index) => {
    // If edge doesn't have proper transition data, try to infer it
    if (!edge.data?.isTransition && edge.label) {
      const sourceNode = layoutedNodes.find(n => n.id === edge.source);
      if (sourceNode && sourceNode.data?.transitions) {
        // Find matching transition by condition
        const transitionIndex = sourceNode.data.transitions.findIndex(t => 
          (typeof t === 'string' ? t : t.condition) === edge.label
        );
        
        if (transitionIndex !== -1) {
          return {
            ...edge,
            data: {
              ...edge.data,
              isTransition: true,
              condition: edge.label,
              transitionIndex: transitionIndex
            }
          };
        }
      }
    }
    return edge;
  });

  return { nodes: layoutedNodes, edges: enhancedEdges };
};
