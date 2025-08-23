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
        alert('Cannot create connection: This would create a circular dependency.');
        return;
      }
      setEdges((eds) => addEdge({ ...params, type: 'default' }, eds));
    },
    [edges, nodes, setEdges]
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
            alert('Cannot add transition: This would create a circular dependency.');
          }
        },
      },
    };
    setNodes((nds) => [...nds, newNode]);
  }, [setNodes, setEdges, edges, nodes]);

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
      console.log('Flow saved to localStorage');
    }
  }, [reactFlowInstance, nodes, edges]);

  const clearFlow = useCallback(() => {
    setNodes([]);
    setEdges([]);
    localStorage.removeItem('promptinator-flow');
    console.log('Flow cleared');
  }, [setNodes, setEdges]);

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
        
        if (reactFlowInstance && flowData.viewport) {
          reactFlowInstance.setViewport(flowData.viewport);
        }
      }
    } catch (error) {
      console.error('Error loading flow:', error);
    }
  }, [setNodes, setEdges, reactFlowInstance]);

  useEffect(() => {
    if (reactFlowInstance) {
      loadFlow();
    }
  }, [reactFlowInstance, loadFlow]);

  // Pass functions to parent component
  useEffect(() => {
    if (onNodesChange) onNodesChange({ addPromptNode, addTaskNode });
    if (onEdgesChange) onEdgesChange({ saveFlow, clearFlow });
  }, [addPromptNode, addTaskNode, saveFlow, clearFlow, onNodesChange, onEdgesChange]);

  const handleNodesChange = useCallback(
    (changes) => {
      onNodesStateChange(changes);
    },
    [onNodesStateChange]
  );

  const handleEdgesChange = useCallback(
    (changes) => {
      onEdgesStateChange(changes);
    },
    [onEdgesStateChange]
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
