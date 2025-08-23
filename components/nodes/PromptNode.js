import { useState, useCallback, useRef } from 'react';
import { Handle, Position } from '@xyflow/react';
import { 
  HiDotsVertical, 
  HiPencil, 
  HiPlus, 
  HiTrash, 
  HiVariable,
  HiArrowRight
} from 'react-icons/hi';

export default function PromptNode({ id, data }) {
  const [isEditing, setIsEditing] = useState({
    title: false,
    prompt: false,
    transition: null,
  });
  const [showMenu, setShowMenu] = useState(false);
  const [showTransitionDialog, setShowTransitionDialog] = useState(false);
  const [showVariableDialog, setShowVariableDialog] = useState(false);
  const [newTransition, setNewTransition] = useState('');
  const [newVariable, setNewVariable] = useState('');
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
    if (newTransition.trim()) {
      const updatedTransitions = [...(data.transitions || []), newTransition.trim()];
      handleUpdate('transitions', updatedTransitions);
      setNewTransition('');
      setShowTransitionDialog(false);
    }
  };

  const removeTransition = (index) => {
    const updatedTransitions = data.transitions.filter((_, i) => i !== index);
    handleUpdate('transitions', updatedTransitions);
  };

  const editTransition = (index, newValue) => {
    const updatedTransitions = [...data.transitions];
    updatedTransitions[index] = newValue;
    handleUpdate('transitions', updatedTransitions);
    setIsEditing(prev => ({ ...prev, transition: null }));
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
      setShowVariableDialog(false);
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
              className="glass-input text-sm font-semibold flex-1 min-w-0"
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
                  setShowTransitionDialog(true);
                  setShowMenu(false);
                }}
                className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-white/30 flex items-center space-x-2"
              >
                <HiPlus className="w-4 h-4" />
                <span>Add Transition</span>
              </button>
              <button
                onClick={() => {
                  setShowVariableDialog(true);
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
          className="w-full glass-input text-sm resize-none h-20"
          placeholder="Enter your prompt here..."
        />
      </div>

      {/* Variables Section */}
      {data.variables && data.variables.length > 0 && (
        <div className="p-3 border-b border-white/20">
          <label className="text-xs font-medium text-gray-600 mb-2 block">Variables</label>
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
        </div>
      )}

      {/* Transitions Section */}
      {data.transitions && data.transitions.length > 0 && (
        <div className="p-3">
          <label className="text-xs font-medium text-gray-600 mb-2 block">Transitions</label>
          <div className="space-y-2">
            {data.transitions.map((transition, index) => (
              <div key={index} className="flex items-center space-x-2 glass-item p-2 rounded-lg">
                {isEditing.transition === index ? (
                  <input
                    type="text"
                    defaultValue={transition}
                    className="glass-input text-xs flex-1"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        editTransition(index, e.target.value);
                      }
                    }}
                    onBlur={(e) => editTransition(index, e.target.value)}
                    autoFocus
                  />
                ) : (
                  <span 
                    className="text-xs text-gray-700 flex-1 cursor-pointer"
                    onClick={() => setIsEditing(prev => ({ ...prev, transition: index }))}
                  >
                    {transition}
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
                <HiArrowRight className="w-3 h-3 text-gray-400" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add Transition Dialog */}
      {showTransitionDialog && (
        <div className="absolute inset-0 glass-strong border border-white/30 rounded-2xl p-4 z-50">
          <h4 className="text-sm font-semibold text-gray-800 mb-3">Add Transition</h4>
          <input
            type="text"
            value={newTransition}
            onChange={(e) => setNewTransition(e.target.value)}
            placeholder="Enter condition (e.g., 'user says yes')"
            className="w-full glass-input text-sm mb-3"
            onKeyPress={(e) => e.key === 'Enter' && addTransition()}
            autoFocus
          />
          <div className="flex space-x-2">
            <button
              onClick={addTransition}
              className="px-3 py-1 glass-item text-sm text-blue-600 hover:bg-blue-50 rounded"
            >
              Add
            </button>
            <button
              onClick={() => {
                setShowTransitionDialog(false);
                setNewTransition('');
              }}
              className="px-3 py-1 glass-item text-sm text-gray-600 hover:bg-gray-50 rounded"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Add Variable Dialog */}
      {showVariableDialog && (
        <div className="absolute inset-0 glass-strong border border-white/30 rounded-2xl p-4 z-50">
          <h4 className="text-sm font-semibold text-gray-800 mb-3">Add Variable</h4>
          <input
            type="text"
            value={newVariable}
            onChange={(e) => setNewVariable(e.target.value)}
            placeholder="Enter variable name (e.g., 'user_name')"
            className="w-full glass-input text-sm mb-3"
            onKeyPress={(e) => e.key === 'Enter' && addVariable()}
            autoFocus
          />
          <div className="flex space-x-2">
            <button
              onClick={addVariable}
              className="px-3 py-1 glass-item text-sm text-blue-600 hover:bg-blue-50 rounded"
            >
              Add
            </button>
            <button
              onClick={() => {
                setShowVariableDialog(false);
                setNewVariable('');
              }}
              className="px-3 py-1 glass-item text-sm text-gray-600 hover:bg-gray-50 rounded"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <Handle type="source" position={Position.Right} className="!bg-blue-600 !border-2 !border-white" />
    </div>
  );
}
