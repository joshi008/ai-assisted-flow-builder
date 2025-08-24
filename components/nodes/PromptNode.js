import { useState } from 'react';
import { Handle, Position } from '@xyflow/react';
import { HiPlus, HiVariable, HiLink, HiPencil, HiTrash } from 'react-icons/hi';
import { HiLinkSlash } from 'react-icons/hi2';
import { useBaseNode, BaseNodeHeader, BaseNodeContainer, SectionHeader } from './BaseNode';

export default function PromptNode({ id, data, isConnectable = false, zIndex = 0 }) {
  // Use base node functionality
  const baseNode = useBaseNode(id, data);
  
  // Extend base editing state with PromptNode-specific fields
  const [isEditing, setIsEditing] = useState({
    ...baseNode.isEditing,
    prompt: false,
    transition: null,
  });
  
  // PromptNode specific state
  const [newVariable, setNewVariable] = useState('');
  const [showAddVariable, setShowAddVariable] = useState(false);

  // Use base handlers
  const { handleUpdate, handleDelete } = baseNode;
  
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

  const menuItems = [
    {
      icon: HiPlus,
      label: 'Add Transition',
      onClick: addTransition,
    },
    {
      icon: HiVariable,
      label: 'Add Variable',
      onClick: () => setShowAddVariable(true),
    },
  ];

  return (
    <BaseNodeContainer hasSourceHandle={!data.transitions || data.transitions.length === 0}>
      <BaseNodeHeader
        title={data.title}
        isEditing={isEditing.title}
        onEdit={(field, value) => setIsEditing(prev => ({ ...prev, [field]: value }))}
        onKeyPress={handleKeyPress}
        onBlur={handleBlur}
        showMenu={baseNode.showMenu}
        setShowMenu={baseNode.setShowMenu}
        menuItems={menuItems}
      >
        {{ onDelete: handleDelete }}
      </BaseNodeHeader>

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
      {((data.variables && data.variables.length > 0) || showAddVariable) && (
        <div className="p-3 border-b border-white/20">
          <SectionHeader
            label="Variables"
            onAdd={() => setShowAddVariable(true)}
            addLabel="Add Variable"
          />
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
      )}

      {/* Transitions Section */}
      {data.transitions && data.transitions.length > 0 && (
        <div className="p-3">
          <SectionHeader
            label="Transitions"
            onAdd={addTransition}
            addLabel="Add Transition"
          />
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
      )}
    </BaseNodeContainer>
  );
}
