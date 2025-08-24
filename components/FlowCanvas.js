import { useCallback, useState, useEffect } from 'react';
import {
  ReactFlow,
  useNodesState,
  useEdgesState,
  addEdge,
  Background,
  Controls,
  MiniMap,
  ConnectionMode,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import PromptNode from './nodes/PromptNode';
import TaskNode from './nodes/TaskNode';
import { showToast } from '../utils/toast';
import { autoLayoutFlow } from '../utils/flowLayout';

// Helper function to clean up duplicate edges and ensure proper transition-edge mapping
const cleanupEdges = (nodes, edges) => {
  const cleanedEdges = [];
  const processedTransitions = new Set();

  edges.forEach(edge => {
    if (edge.data?.isTransition && typeof edge.data.transitionIndex === 'number') {
      const transitionKey = `${edge.source}-${edge.data.transitionIndex}`;
      
      // Skip if we've already processed this transition
      if (processedTransitions.has(transitionKey)) {
        return;
      }
      processedTransitions.add(transitionKey);
      
      // Verify the transition still exists in the source node
      const sourceNode = nodes.find(n => n.id === edge.source);
      if (sourceNode && sourceNode.data.transitions && sourceNode.data.transitions[edge.data.transitionIndex]) {
        const transition = sourceNode.data.transitions[edge.data.transitionIndex];
        const condition = typeof transition === 'string' ? transition : transition.condition;
        
        // Create cleaned edge with correct condition
        cleanedEdges.push({
          ...edge,
          label: condition,
          data: {
            ...edge.data,
            condition: condition,
          }
        });
      }
    } else {
      // Non-transition edge, keep as is
      cleanedEdges.push(edge);
    }
  });

  return cleanedEdges;
};

const nodeTypes = {
  promptNode: PromptNode,
  taskNode: TaskNode,
};

const initialNodes = [];
const initialEdges = [];

export default function FlowCanvas({ onNodesChange, onEdgesChange, onSave, onClear }) {
  const [nodes, setNodes, onNodesStateChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesStateChange] = useEdgesState(initialEdges);
  const [reactFlowInstance, setReactFlowInstance] = useState(null);

  const onConnect = useCallback(
    (params) => {
      // Validate for circular dependencies
      if (wouldCreateCircularDependency(params, edges, nodes)) {
        showToast.error('Cannot create connection: This would create a circular dependency.');
        return;
      }

      // Check if this is a transition connection
      if (params.sourceHandle && params.sourceHandle.startsWith('transition-')) {
        const transitionIndex = parseInt(params.sourceHandle.replace('transition-', ''));
        const sourceNode = nodes.find(n => n.id === params.source);
        
        if (sourceNode && sourceNode.data.transitions[transitionIndex]) {
          // Check if this transition is already connected to the target node
          const existingTransition = sourceNode.data.transitions[transitionIndex];
          if (existingTransition.targetNode === params.target) {
            showToast.warning('This transition is already connected to that node.');
            return;
          }
          // Update the transition with the target node
          setNodes((nds) =>
            nds.map((node) => {
              if (node.id === params.source) {
                const updatedTransitions = [...node.data.transitions];
                updatedTransitions[transitionIndex] = {
                  ...updatedTransitions[transitionIndex],
                  targetNode: params.target
                };
                return { 
                  ...node, 
                  data: { 
                    ...node.data, 
                    transitions: updatedTransitions 
                  } 
                };
              }
              return node;
            })
          );

          // Create the edge with the transition condition as label
          const transition = sourceNode.data.transitions[transitionIndex];
          const condition = typeof transition === 'string' ? transition : transition.condition;
          
          const newEdge = {
            ...params,
            type: 'default',
            label: condition,
            data: { 
              isTransition: true, 
              condition: condition,
              transitionIndex: transitionIndex
            },
          };
          
          setEdges((eds) => addEdge(newEdge, eds));
        }
      } else {
        // Regular connection (not from a transition)
        setEdges((eds) => addEdge({ ...params, type: 'default' }, eds));
      }
    },
    [edges, nodes, setEdges, setNodes]
  );

  const wouldCreateCircularDependency = (newConnection, currentEdges, currentNodes) => {
    // Simple cycle detection using DFS
    const { source, target } = newConnection;
    if (source === target) return true;

    const adjacencyList = {};
    currentNodes.forEach(node => {
      adjacencyList[node.id] = [];
    });

    // Add existing edges
    currentEdges.forEach(edge => {
      if (!adjacencyList[edge.source]) adjacencyList[edge.source] = [];
      adjacencyList[edge.source].push(edge.target);
    });

    // Add the new connection temporarily
    if (!adjacencyList[source]) adjacencyList[source] = [];
    adjacencyList[source].push(target);

    // Check for cycles using DFS
    const visited = new Set();
    const recursionStack = new Set();

    const hasCycle = (node) => {
      if (recursionStack.has(node)) return true;
      if (visited.has(node)) return false;

      visited.add(node);
      recursionStack.add(node);

      for (const neighbor of (adjacencyList[node] || [])) {
        if (hasCycle(neighbor)) return true;
      }

      recursionStack.delete(node);
      return false;
    };

    return hasCycle(source);
  };

  const onTransitionRemoved = useCallback((nodeId, removedIndex) => {
    // Update edge indices for transitions after the removed one
    setEdges((currentEdges) => {
      return currentEdges.map((edge) => {
        if (edge.data?.isTransition && 
            edge.source === nodeId && 
            typeof edge.data.transitionIndex === 'number' &&
            edge.data.transitionIndex > removedIndex) {
          return {
            ...edge,
            data: {
              ...edge.data,
              transitionIndex: edge.data.transitionIndex - 1
            },
            sourceHandle: `transition-${edge.data.transitionIndex - 1}`
          };
        }
        return edge;
      });
    });
  }, [setEdges]);

  const addPromptNode = useCallback(() => {
    const newNode = {
      id: `prompt-${Date.now()}`,
      type: 'promptNode',
      position: { x: Math.random() * 400 + 100, y: Math.random() * 400 + 100 },
      data: {
        title: 'New Prompt Node',
        prompt: 'Enter your prompt here...',
        variables: [],
        transitions: [],

        onUpdate: (id, newData) => {
          setNodes((nds) =>
            nds.map((node) =>
              node.id === id ? { ...node, data: { ...node.data, ...newData } } : node
            )
          );
        },
        onDelete: (id) => {
          setNodes((nds) => nds.filter((node) => node.id !== id));
          setEdges((eds) => eds.filter((edge) => edge.source !== id && edge.target !== id));
        },
        onTransitionRemoved: onTransitionRemoved,
        onAddTransition: (id, condition, targetNodeId) => {
          // Add transition-based edge
          const newEdge = {
            id: `transition-${Date.now()}`,
            source: id,
            target: targetNodeId,
            type: 'default',
            label: condition,
            data: { isTransition: true, condition },
          };
          
          if (!wouldCreateCircularDependency(newEdge, edges, nodes)) {
            setEdges((eds) => [...eds, newEdge]);
          } else {
            showToast.error('Cannot add transition: This would create a circular dependency.');
          }
        },

      },
    };
    setNodes((nds) => [...nds, newNode]);
  }, [setNodes, setEdges, edges, nodes, onTransitionRemoved]);

  const addTaskNode = useCallback(() => {
    const newNode = {
      id: `task-${Date.now()}`,
      type: 'taskNode',
      position: { x: Math.random() * 400 + 100, y: Math.random() * 400 + 100 },
      data: {
        title: 'New Task Node',
        description: 'Enter task description...',
        onUpdate: (id, newData) => {
          setNodes((nds) =>
            nds.map((node) =>
              node.id === id ? { ...node, data: { ...node.data, ...newData } } : node
            )
          );
        },
        onDelete: (id) => {
          setNodes((nds) => nds.filter((node) => node.id !== id));
          setEdges((eds) => eds.filter((edge) => edge.source !== id && edge.target !== id));
        },
      },
    };
    setNodes((nds) => [...nds, newNode]);
  }, [setNodes, setEdges]);

  const saveFlow = useCallback(() => {
    if (reactFlowInstance) {
      const flowData = {
        nodes: nodes.map(node => ({
          ...node,
          data: {
            ...node.data,
            // Remove function references for JSON serialization
            onUpdate: undefined,
            onDelete: undefined,
            onAddTransition: undefined,
          }
        })),
        edges: edges,
        viewport: reactFlowInstance.getViewport(),
      };
      localStorage.setItem('promptinator-flow', JSON.stringify(flowData));
      showToast.success('Flow saved to local storage! 💾');
    }
  }, [reactFlowInstance, nodes, edges]);

  const clearFlow = useCallback(() => {
    setNodes([]);
    setEdges([]);
    localStorage.removeItem('promptinator-flow');
    // Success message is handled by the calling function
  }, [setNodes, setEdges]);

  const fitView = useCallback(() => {
    if (reactFlowInstance) {
      reactFlowInstance.fitView({ 
        padding: 0.1,
        includeHiddenNodes: false,
        minZoom: 0.1,
        maxZoom: 1.5
      });
      showToast.success('View adjusted to fit all nodes');
    }
  }, [reactFlowInstance]);

  const loadFlow = useCallback(() => {
    try {
      const savedFlow = localStorage.getItem('promptinator-flow');
      if (savedFlow) {
        const flowData = JSON.parse(savedFlow);
        
        // Restore function references
        const restoredNodes = flowData.nodes.map(node => ({
          ...node,
          data: {
            ...node.data,
            onUpdate: (id, newData) => {
              setNodes((nds) =>
                nds.map((n) =>
                  n.id === id ? { ...n, data: { ...n.data, ...newData } } : n
                )
              );
            },
            onDelete: (id) => {
              setNodes((nds) => nds.filter((n) => n.id !== id));
              setEdges((eds) => eds.filter((edge) => edge.source !== id && edge.target !== id));
            },
            onTransitionRemoved: onTransitionRemoved,
            onAddTransition: node.type === 'promptNode' ? (id, condition, targetNodeId) => {
              const newEdge = {
                id: `transition-${Date.now()}`,
                source: id,
                target: targetNodeId,
                type: 'default',
                label: condition,
                data: { isTransition: true, condition },
              };
              setEdges((eds) => [...eds, newEdge]);
            } : undefined,

          },
        }));

        setNodes(restoredNodes);
        setEdges(flowData.edges || []);
        
        // Use fitView instead of restoring old viewport to handle canvas size changes
        if (reactFlowInstance && flowData.nodes && flowData.nodes.length > 0) {
          setTimeout(() => {
            reactFlowInstance.fitView({ 
              padding: 0.1,
              includeHiddenNodes: false,
              minZoom: 0.1,
              maxZoom: 1.5
            });
          }, 100);
          showToast.info(`Flow loaded with ${flowData.nodes.length} nodes`);
        }
      }
    } catch (error) {
      console.error('Error loading flow:', error);
      showToast.error('Failed to load saved flow');
    }
  }, [setNodes, setEdges, reactFlowInstance, onTransitionRemoved]);

  useEffect(() => {
    if (reactFlowInstance) {
      loadFlow();
    }
  }, [reactFlowInstance, loadFlow]);

  // Handle viewport adjustment when canvas size changes
  useEffect(() => {
    if (reactFlowInstance && nodes.length > 0) {
      // Small delay to ensure canvas has resized
      const timer = setTimeout(() => {
        reactFlowInstance.fitView({ 
          padding: 0.1,
          includeHiddenNodes: false,
          minZoom: 0.1,
          maxZoom: 1.5
        });
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [reactFlowInstance, nodes.length]);

  // Handle window resize to adjust viewport
  useEffect(() => {
    if (!reactFlowInstance) return;

    const handleResize = () => {
      if (nodes.length > 0) {
        setTimeout(() => {
          reactFlowInstance.fitView({ 
            padding: 0.1,
            includeHiddenNodes: false,
            minZoom: 0.1,
            maxZoom: 1.5
          });
        }, 100);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [reactFlowInstance, nodes.length]);



  const applyAIFlow = useCallback((aiFlow) => {
    try {
      // Apply auto-layout to improve node positioning
      const { nodes: layoutedNodes, edges: layoutedEdges } = autoLayoutFlow(aiFlow.nodes, aiFlow.edges || []);
      
      // Clean up duplicate edges and ensure proper transition mapping
      const cleanedEdges = cleanupEdges(layoutedNodes, layoutedEdges || []);
      
      // Ensure all transition nodes have proper targetNode references
      const finalNodes = layoutedNodes.map(node => {
        if (node.type === 'promptNode' && node.data.transitions) {
          const updatedTransitions = node.data.transitions.map((transition, index) => {
            // Find corresponding edge for this transition
            const correspondingEdge = cleanedEdges.find(edge => 
              edge.source === node.id && 
              edge.data?.isTransition &&
              edge.data.transitionIndex === index
            );
            
            return {
              condition: typeof transition === 'string' ? transition : transition.condition,
              targetNode: correspondingEdge ? correspondingEdge.target : (
                typeof transition === 'object' ? transition.targetNode : null
              )
            };
          });
          
          return {
            ...node,
            data: {
              ...node.data,
              transitions: updatedTransitions
            }
          };
        }
        return node;
      });
      
      // Restore function references for AI-generated nodes
      const restoredNodes = finalNodes.map(node => ({
        ...node,
        data: {
          ...node.data,
          onUpdate: (id, newData) => {
            setNodes((nds) =>
              nds.map((n) =>
                n.id === id ? { ...n, data: { ...n.data, ...newData } } : n
              )
            );
          },
          onDelete: (id) => {
            setNodes((nds) => nds.filter((n) => n.id !== id));
            setEdges((eds) => eds.filter((edge) => edge.source !== id && edge.target !== id));
          },
          onTransitionRemoved: onTransitionRemoved,
          onAddTransition: node.type === 'promptNode' ? (id, condition, targetNodeId) => {
            const newEdge = {
              id: `transition-${Date.now()}`,
              source: id,
              target: targetNodeId,
              type: 'default',
              label: condition,
              data: { isTransition: true, condition },
            };
            
            if (!wouldCreateCircularDependency(newEdge, edges, nodes)) {
              setEdges((eds) => [...eds, newEdge]);
            } else {
              showToast.error('Cannot add transition: This would create a circular dependency.');
            }
          } : undefined,

        },
      }));

      setNodes(restoredNodes);
      setEdges(cleanedEdges);
      
      // Fit view to show all AI-generated nodes properly
      if (reactFlowInstance && restoredNodes.length > 0) {
        setTimeout(() => {
          reactFlowInstance.fitView({ 
            padding: 0.1,
            includeHiddenNodes: false,
            minZoom: 0.1,
            maxZoom: 1.5
          });
        }, 100);
      }
      
      return true;
    } catch (error) {
      console.error('Error applying AI flow:', error);
      return false;
    }
  }, [setNodes, setEdges, edges, nodes, onTransitionRemoved]);

  const getCurrentFlow = useCallback(() => {
    return {
      nodes: nodes.map(node => ({
        ...node,
        data: {
          ...node.data,
          // Remove function references for JSON serialization
          onUpdate: undefined,
          onDelete: undefined,
          onAddTransition: undefined,
        }
      })),
      edges: edges,
      viewport: reactFlowInstance ? reactFlowInstance.getViewport() : { x: 0, y: 0, zoom: 1 },
    };
  }, [nodes, edges, reactFlowInstance]);

  // Sync edges with transition changes and clean up orphaned edges
  useEffect(() => {
    setEdges((currentEdges) => {
      let edgesUpdated = false;
      const validEdges = [];
      
      // Check each edge for validity and updates
      currentEdges.forEach((edge) => {
        if (edge.data?.isTransition && typeof edge.data.transitionIndex === 'number') {
          const sourceNode = nodes.find(n => n.id === edge.source);
          
          if (sourceNode && sourceNode.data.transitions && sourceNode.data.transitions[edge.data.transitionIndex]) {
            const transition = sourceNode.data.transitions[edge.data.transitionIndex];
            const newCondition = typeof transition === 'string' ? transition : transition.condition;
            
            // Check if this transition is still connected to the same target
            const targetNode = typeof transition === 'object' ? transition.targetNode : null;
            const edgeStillValid = targetNode === edge.target;
            
            if (edgeStillValid) {
              // Update edge if condition has changed
              if (edge.label !== newCondition || edge.data.condition !== newCondition) {
                edgesUpdated = true;
                validEdges.push({
                  ...edge,
                  label: newCondition,
                  data: {
                    ...edge.data,
                    condition: newCondition
                  }
                });
              } else {
                validEdges.push(edge);
              }
            } else {
              // Transition target changed or disconnected, remove edge
              edgesUpdated = true;
            }
          } else {
            // Transition no longer exists, remove edge
            edgesUpdated = true;
          }
        } else {
          // Non-transition edge, keep as is
          validEdges.push(edge);
        }
      });
      
      return edgesUpdated ? validEdges : currentEdges;
    });
  }, [nodes, setEdges]);

  // Pass functions to parent component
  useEffect(() => {
    if (onNodesChange) onNodesChange({ addPromptNode, addTaskNode, getCurrentFlow, applyAIFlow });
    if (onEdgesChange) onEdgesChange({ saveFlow, clearFlow, fitView });
  }, [addPromptNode, addTaskNode, saveFlow, clearFlow, fitView, getCurrentFlow, applyAIFlow, onNodesChange, onEdgesChange]);

  const handleNodesChange = useCallback(
    (changes) => {
      onNodesStateChange(changes);
    },
    [onNodesStateChange]
  );

  const handleEdgesChange = useCallback(
    (changes) => {
      // Handle edge deletions to clean up transition data
      changes.forEach(change => {
        if (change.type === 'remove') {
          const edge = edges.find(e => e.id === change.id);
          if (edge && edge.data?.isTransition && typeof edge.data.transitionIndex === 'number') {
            // Clear the targetNode from the corresponding transition
            setNodes((nds) =>
              nds.map((node) => {
                if (node.id === edge.source) {
                  const updatedTransitions = [...node.data.transitions];
                  if (updatedTransitions[edge.data.transitionIndex]) {
                    updatedTransitions[edge.data.transitionIndex] = {
                      ...updatedTransitions[edge.data.transitionIndex],
                      targetNode: null
                    };
                  }
                  return { 
                    ...node, 
                    data: { 
                      ...node.data, 
                      transitions: updatedTransitions 
                    } 
                  };
                }
                return node;
              })
            );
          }
        }
      });
      
      onEdgesStateChange(changes);
    },
    [onEdgesStateChange, edges, setNodes]
  );

  return (
    <div className="w-full h-full glass rounded-2xl overflow-hidden">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={handleNodesChange}
        onEdgesChange={handleEdgesChange}
        onConnect={onConnect}
        onInit={setReactFlowInstance}
        nodeTypes={nodeTypes}
        connectionMode={ConnectionMode.Loose}
        fitView
        className="bg-transparent"
      >
        <Background 
          color="rgba(156, 146, 172, 0.2)" 
          gap={20} 
          size={1}
          className="opacity-30"
        />
        <Controls className="glass-item" />
        <MiniMap 
          className="glass !bg-white/20" 
          nodeColor="rgba(59, 130, 246, 0.8)"
          maskColor="rgba(255, 255, 255, 0.1)"
        />
      </ReactFlow>
    </div>
  );
}
