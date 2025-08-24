import { useState, useCallback, useRef } from 'react';
import { Handle, Position } from '@xyflow/react';
import { HiDotsVertical, HiPencil, HiTrash, HiPlus } from 'react-icons/hi';

// Base node hook for common functionality
export const useBaseNode = (id, data) => {
  const [isEditing, setIsEditing] = useState({
    title: false,
  });
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef(null);

  const handleUpdate = useCallback((field, value) => {
    if (data.onUpdate) {
      data.onUpdate(id, { [field]: value });
    }
  }, [id, data]);

  const handleDelete = useCallback(() => {
    if (data.onDelete) {
      data.onDelete(id);
    }
  }, [id, data]);

  const handleKeyPress = useCallback((e, field, value) => {
    if (e.key === 'Enter') {
      handleUpdate(field, value);
      setIsEditing(prev => ({ ...prev, [field]: false }));
    }
  }, [handleUpdate]);

  const handleBlur = useCallback((field, value) => {
    handleUpdate(field, value);
    setIsEditing(prev => ({ ...prev, [field]: false }));
  }, [handleUpdate]);

  return {
    isEditing,
    setIsEditing,
    showMenu,
    setShowMenu,
    menuRef,
    handleUpdate,
    handleDelete,
    handleKeyPress,
    handleBlur,
  };
};

// Base node header component
export const BaseNodeHeader = ({ 
  title, 
  isEditing, 
  onEdit, 
  onKeyPress, 
  onBlur,
  showMenu,
  setShowMenu,
  menuItems = [],
  children 
}) => {
  return (
    <div className="flex items-center justify-between p-3 border-b border-white/20">
      <div className="flex items-center space-x-2 flex-1 min-w-0">
        {isEditing ? (
          <input
            type="text"
            defaultValue={title}
            className="glass-input px-2 py-1 text-sm font-semibold flex-1 min-w-0"
            onKeyPress={(e) => onKeyPress(e, 'title', e.target.value)}
            onBlur={(e) => onBlur('title', e.target.value)}
            autoFocus
          />
        ) : (
          <h3
            className="text-sm font-semibold text-gray-800 cursor-pointer flex-1 truncate"
            onClick={() => onEdit('title', true)}
          >
            {title}
          </h3>
        )}
        <button
          onClick={() => onEdit('title', true)}
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
            {menuItems.map((item, index) => (
              <button
                key={index}
                onClick={() => {
                  item.onClick();
                  setShowMenu(false);
                }}
                className="w-full px-3 py-2 text-left text-xs text-gray-700 hover:bg-white/20 flex items-center space-x-2"
              >
                {item.icon && <item.icon className="w-3 h-3" />}
                <span>{item.label}</span>
              </button>
            ))}
            
            <hr className="my-1 border-white/20" />
            
            <button
              onClick={() => {
                children?.onDelete?.();
                setShowMenu(false);
              }}
              className="w-full px-3 py-2 text-left text-xs text-red-600 hover:bg-red-50 flex items-center space-x-2"
            >
              <HiTrash className="w-3 h-3" />
              <span>Delete Node</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// Base node container
export const BaseNodeContainer = ({ children, className = "", hasSourceHandle = true, hasTargetHandle = true }) => {
  return (
    <div className={`glass-strong min-w-[300px] max-w-[400px] relative ${className}`}>
      {hasTargetHandle && (
        <Handle type="target" position={Position.Left} className="!bg-blue-600 !border-2 !border-white" />
      )}
      
      {children}
      
      {hasSourceHandle && (
        <Handle type="source" position={Position.Right} className="!bg-blue-600 !border-2 !border-white" />
      )}
    </div>
  );
};

// Section header with optional add button
export const SectionHeader = ({ label, onAdd, addLabel }) => {
  return (
    <div className="flex items-center justify-between mb-2">
      <label className="text-xs font-medium text-gray-600">{label}</label>
      {onAdd && (
        <button
          onClick={onAdd}
          className="p-1 hover:bg-white/30 rounded transition-colors"
          title={addLabel}
        >
          <HiPlus className="w-3 h-3 text-gray-600 hover:text-blue-600" />
        </button>
      )}
    </div>
  );
};
