import React from 'react';

interface FrameSourceSelectorProps {
  selectedFrameSource?: 'UNCUT' | 'SUPPLIED' | 'TO COME';
  onFrameSourceChange: (frameSource: 'UNCUT' | 'SUPPLIED' | 'TO COME') => void;
  disabled?: boolean;
}

export const FrameSourceSelector: React.FC<FrameSourceSelectorProps> = ({
  selectedFrameSource,
  onFrameSourceChange,
  disabled = false
}) => {
  const frameSourceOptions: Array<{ value: 'UNCUT' | 'SUPPLIED' | 'TO COME'; label: string; description: string }> = [
    { value: 'UNCUT', label: 'UNCUT', description: 'Frame needs to be cut' },
    { value: 'SUPPLIED', label: 'SUPPLIED', description: 'Frame is already supplied' },
    { value: 'TO COME', label: 'TO COME', description: 'Frame will be provided later' }
  ];

  return (
    <div className="mb-6">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Frame Source
      </label>
      <div className="flex space-x-6">
        {frameSourceOptions.map((option) => (
          <label key={option.value} className="flex items-center space-x-2 cursor-pointer">
            <input
              type="radio"
              name="frameSource"
              value={option.value}
              checked={selectedFrameSource === option.value}
              onChange={() => onFrameSourceChange(option.value)}
              disabled={disabled}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
            />
            <span className="text-sm font-medium text-gray-900">{option.label}</span>
          </label>
        ))}
      </div>
      {!selectedFrameSource && (
        <p className="mt-1 text-sm text-gray-500">
          Select the frame source to determine the CPRS Frame Status
        </p>
      )}
    </div>
  );
};
