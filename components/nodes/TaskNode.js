import { useState, useCallback } from 'react';
import { Handle, Position } from '@xyflow/react';
import { 
  HiDotsVertical, 
  HiPencil, 
  HiTrash
} from 'react-icons/hi';

export default function TaskNode({ id, data }) {
  const [isEditing, setIsEditing] = useState({
    title: false,
    description: false,
  });
  const [showMenu, setShowMenu] = useState(false);

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

  return (
    <div className="glass-strong min-w-[280px] max-w-[350px] relative">
      <Handle type="target" position={Position.Left} className="!bg-green-600 !border-2 !border-white" />
      
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-white/20">
        <div className="flex items-center space-x-2 flex-1">
          {isEditing.title ? (
            <input
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
            <div className="absolute right-0 top-8 glass-strong border border-white/30 rounded-lg py-1 z-50 min-w-[140px]">
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

      {/* Task Type Badge */}
      <div className="px-3 pt-2">
        <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
          Task Node
        </span>
      </div>

      {/* Description Section */}
      <div className="p-3">
        <label className="text-xs font-medium text-gray-600 mb-2 block">Description</label>
        <textarea
          value={data.description || ''}
          onChange={(e) => handleUpdate('description', e.target.value)}
          className="w-full glass-input text-sm resize-none h-16"
          placeholder="Enter task description..."
        />
      </div>

      <Handle type="source" position={Position.Right} className="!bg-green-600 !border-2 !border-white" />
    </div>
  );
}
