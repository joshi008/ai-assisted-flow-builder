import { useState } from 'react';
import { Handle, Position } from '@xyflow/react';
import { useBaseNode, BaseNodeHeader, BaseNodeContainer } from './BaseNode';

export default function TaskNode({ id, data }) {
  // Use base node functionality
  const {
    isEditing,
    setIsEditing,
    showMenu,
    setShowMenu,
    handleUpdate,
    handleDelete,
    handleKeyPress,
    handleBlur,
  } = useBaseNode(id, data);

  return (
    <BaseNodeContainer className="min-w-[280px] max-w-[350px]">
      <Handle type="target" position={Position.Left} className="!bg-green-600 !border-2 !border-white" />
      
      <BaseNodeHeader
        title={data.title}
        isEditing={isEditing.title}
        onEdit={(field, value) => setIsEditing(prev => ({ ...prev, [field]: value }))}
        onKeyPress={handleKeyPress}
        onBlur={handleBlur}
        showMenu={showMenu}
        setShowMenu={setShowMenu}
        menuItems={[]}
      >
        {{ onDelete: handleDelete }}
      </BaseNodeHeader>

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
    </BaseNodeContainer>
  );
}
