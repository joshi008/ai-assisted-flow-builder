import { useState, useCallback, useRef } from 'react';
import { Handle, Position } from '@xyflow/react';
import {
  HiDotsVertical,
  HiPencil,
  HiPlus,
  HiTrash,
  HiVariable,
  HiLink
} from 'react-icons/hi';
import { HiLinkSlash } from 'react-icons/hi2';

export default function PromptNode({ id, data, isConnectable = false, zIndex = 0 }) {
  const [isEditing, setIsEditing] = useState({
    title: false,
    prompt: false,
    transition: null,
  });
  const [showMenu, setShowMenu] = useState(false);
  const [newVariable, setNewVariable] = useState('');
  const [showAddVariable, setShowAddVariable] = useState(false);
  const [availableNodes, setAvailableNodes] = useState([]);
  const titleRef = useRef(null);
  const promptRef = useRef(null);

  const handleUpdate = useCallback((field, value) => {
    if (data.onUpdate) {
      data.onUpdate(id, { [field]: value });
    }
  }, [id, data]);

  const handleKeyPress = (e, field, value) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleUpdate(field, value);
      setIsEditing(prev => ({ ...prev, [field]: false }));
    }
  };

  const handleBlur = (field, value) => {
    handleUpdate(field, value);
    setIsEditing(prev => ({ ...prev, [field]: false }));
  };

  const addTransition = () => {
    const newTransition = { condition: 'New condition', targetNode: null };
    const updatedTransitions = [...(data.transitions || []), newTransition];
    handleUpdate('transitions', updatedTransitions);
  };

  const removeTransition = (index) => {
    const updatedTransitions = data.transitions.filter((_, i) => i !== index);
    handleUpdate('transitions', updatedTransitions);
    
    // Notify parent about transition removal so it can update edge indices
    if (data.onTransitionRemoved) {
      data.onTransitionRemoved(id, index);
    }
  };

  const editTransition = (index, field, newValue) => {
    const updatedTransitions = [...data.transitions];
    updatedTransitions[index] = { ...updatedTransitions[index], [field]: newValue };
    handleUpdate('transitions', updatedTransitions);
  };

  const addVariable = () => {
    if (newVariable.trim() && !data.variables.includes(newVariable.trim())) {
      const updatedVariables = [...(data.variables || []), newVariable.trim()];
      handleUpdate('variables', updatedVariables);

      // Auto-insert variable into prompt
      const currentPrompt = data.prompt || '';
      const updatedPrompt = currentPrompt + ` {{${newVariable.trim()}}}`;
      handleUpdate('prompt', updatedPrompt);

      setNewVariable('');
      setShowAddVariable(false);
    }
  };

  const removeVariable = (variableToRemove) => {
    const updatedVariables = data.variables.filter(v => v !== variableToRemove);
    handleUpdate('variables', updatedVariables);

    // Remove variable from prompt
    const currentPrompt = data.prompt || '';
    const updatedPrompt = currentPrompt.replace(new RegExp(`\\{\\{${variableToRemove}\\}\\}`, 'g'), '');
    handleUpdate('prompt', updatedPrompt);
  };



  return (
    <div className="glass-strong min-w-[300px] max-w-[400px] relative">
      <Handle type="target" position={Position.Left} className="!bg-blue-600 !border-2 !border-white" />

      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-white/20">
        <div className="flex items-center space-x-2 flex-1">
          {isEditing.title ? (
            <input
              ref={titleRef}
              type="text"
              defaultValue={data.title}
              className="glass-input px-2 py-1 text-sm font-semibold flex-1 min-w-0"
              onKeyPress={(e) => handleKeyPress(e, 'title', e.target.value)}
              onBlur={(e) => handleBlur('title', e.target.value)}
              autoFocus
            />
          ) : (
            <h3
              className="text-sm font-semibold text-gray-800 cursor-pointer flex-1 truncate"
              onClick={() => setIsEditing(prev => ({ ...prev, title: true }))}
            >
              {data.title}
            </h3>
          )}
          <button
            onClick={() => setIsEditing(prev => ({ ...prev, title: true }))}
            className="p-1 hover:bg-white/30 rounded transition-colors"
          >
            <HiPencil className="w-3 h-3 text-gray-600" />
          </button>
        </div>

        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-1 hover:bg-white/30 rounded transition-colors"
          >
            <HiDotsVertical className="w-4 h-4 text-gray-600" />
          </button>

          {showMenu && (
            <div className="absolute right-0 top-8 glass-strong border border-white/30 rounded-lg py-1 z-50 min-w-[160px]">
              <button
                onClick={() => {
                  addTransition();
                  setShowMenu(false);
                }}
                className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-white/30 flex items-center space-x-2"
              >
                <HiPlus className="w-4 h-4" />
                <span>Add Transition</span>
              </button>
              <button
                onClick={() => {
                  setShowAddVariable(true);
                  setShowMenu(false);
                }}
                className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-white/30 flex items-center space-x-2"
              >
                <HiVariable className="w-4 h-4" />
                <span>Add Variable</span>
              </button>
              <button
                onClick={() => {
                  if (data.onDelete) data.onDelete(id);
                  setShowMenu(false);
                }}
                className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2"
              >
                <HiTrash className="w-4 h-4" />
                <span>Delete Node</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Prompt Section */}
      <div className="p-3 border-b border-white/20">
        <label className="text-xs font-medium text-gray-600 mb-2 block">Prompt</label>
        <textarea
          value={data.prompt || ''}
          onChange={(e) => handleUpdate('prompt', e.target.value)}
          className="w-full px-4 py-3 glass-input text-sm resize-none h-20"
          placeholder="Enter your prompt here..."
        />
      </div>

      {/* Variables Section */}
      {((data.variables && data.variables.length > 0) || showAddVariable) &&
        <div className="p-3 border-b border-white/20">
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-medium text-gray-600">Variables</label>
            <button
              onClick={() => setShowAddVariable(true)}
              className="p-1 hover:bg-white/30 rounded transition-colors"
              title="Add Variable"
            >
              <HiPlus className="w-3 h-3 text-gray-600 hover:text-blue-600" />
            </button>
          </div>
          <div className="space-y-2">
            {data.variables && data.variables.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {data.variables.map((variable, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-2 py-1 glass-item text-xs rounded-md"
                  >
                    <span className="text-blue-600">{'{{'}</span>
                    <span className="mx-1">{variable}</span>
                    <span className="text-blue-600">{'}}'}</span>
                    <button
                      onClick={() => removeVariable(variable)}
                      className="ml-1 text-red-500 hover:text-red-700"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}

            {/* Add Variable Inline */}
            {showAddVariable && (
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={newVariable}
                  onChange={(e) => setNewVariable(e.target.value)}
                  placeholder="Variable name"
                  className="flex-1 px-2 py-1 glass-input text-xs"
                  onKeyPress={(e) => e.key === 'Enter' && addVariable()}
                  autoFocus
                />
                <button
                  onClick={addVariable}
                  className="px-2 py-1 glass-item text-xs text-blue-600 hover:bg-blue-50 rounded"
                >
                  Add
                </button>
                <button
                  onClick={() => {
                    setShowAddVariable(false);
                    setNewVariable('');
                  }}
                  className="px-2 py-1 glass-item text-xs text-gray-600 hover:bg-gray-50 rounded"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        </div>
      }


      {/* Transitions Section */}
      {data.transitions && data.transitions.length > 0 &&
        <div className="p-3">
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-medium text-gray-600">Transitions</label>
            <button
              onClick={addTransition}
              className="p-1 hover:bg-white/30 rounded transition-colors"
              title="Add Transition"
            >
              <HiPlus className="w-3 h-3 text-gray-600 hover:text-blue-600" />
            </button>
          </div>
          <div className="space-y-2">
            {data.transitions.map((transition, index) => {
              // Handle both old string format and new object format
              const condition = typeof transition === 'string' ? transition : transition.condition;
              const targetNode = typeof transition === 'object' ? transition.targetNode : null;

              return (
                <div key={index} className="glass-item p-2 rounded-lg space-y-2">
                  {/* Condition Row */}
                  <div className="flex items-center space-x-2">
                    {/* Connection Status Icon */}
                    <div className="relative">
                      {targetNode ? (
                        <div className="relative">
                          <div className="absolute inset-0 bg-purple-500 rounded-full opacity-30 blur-sm animate-pulse"></div>
                          <HiLink className="w-3 h-3 text-purple-600 relative z-10" />
                        </div>
                      ) : (
                        <HiLinkSlash className="w-3 h-3 text-gray-400" />
                      )}
                    </div>

                    {isEditing.transition === index ? (
                      <input
                        type="text"
                        defaultValue={condition}
                        className="glass-input text-xs flex-1 px-2 py-1"
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            editTransition(index, 'condition', e.target.value);
                            setIsEditing(prev => ({ ...prev, transition: null }));
                          }
                        }}
                        onBlur={(e) => {
                          editTransition(index, 'condition', e.target.value);
                          setIsEditing(prev => ({ ...prev, transition: null }));
                        }}
                        autoFocus
                      />
                    ) : (
                      <span
                        className="text-xs text-gray-700 flex-1 cursor-pointer"
                        onClick={() => setIsEditing(prev => ({ ...prev, transition: index }))}
                      >
                        {condition}
                      </span>
                    )}
                    <button
                      onClick={() => setIsEditing(prev => ({ ...prev, transition: index }))}
                      className="p-1 hover:bg-white/30 rounded"
                    >
                      <HiPencil className="w-3 h-3 text-gray-600" />
                    </button>
                    <button
                      onClick={() => removeTransition(index)}
                      className="p-1 hover:bg-white/30 rounded"
                    >
                      <HiTrash className="w-3 h-3 text-red-500" />
                    </button>
                    <Handle
                      type="source"
                      position={Position.Right}
                      id={`transition-${index}`}
                      className="transition-handle"
                      style={{
                        transform: 'none'
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      }


      {!data.transitions || data.transitions.length == 0 && (
        <Handle type="source" position={Position.Right} className="!bg-blue-600 !border-2 !border-white" />
      )}
    </div>
  );
}
