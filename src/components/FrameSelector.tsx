import React from 'react';
import { SelectionState, Catalog } from '../types/catalog';

interface FrameSelectorProps {
  selection: SelectionState;
  availableOptions: {
    frameNames: string[];
    eyeSizes: number[];
    frameColors: string[];
  };
  onSelectionChange: (updates: Partial<SelectionState>) => void;
  catalog: Catalog;
}

const FrameSelector: React.FC<FrameSelectorProps> = ({
  selection,
  availableOptions,
  onSelectionChange,
  catalog
}) => {
  const handleFrameNameChange = (frameName: string) => {
    onSelectionChange({ selectedFrameName: frameName });
  };

  const handleEyeSizeChange = (eyeSize: number) => {
    onSelectionChange({ selectedEyeSize: eyeSize });
  };

  const handleFrameColorChange = (color: string) => {
    onSelectionChange({ selectedFrameColor: color });
  };

  // Get frame details for display
  const selectedFrame = selection.selectedFrameId ? 
    catalog.frames.find(f => f.FRAME_ID === selection.selectedFrameId) : null;
  
  const frameSpecs = selection.selectedFrameId ? 
    catalog.frameSpecsById[selection.selectedFrameId] : null;

  return (
    <div className="space-y-4">
      {/* Frame Name Selection */}
      <div>
        <label htmlFor="frameName" className="block text-sm font-medium text-gray-700 mb-2">
          Frame Name
        </label>
        <select
          id="frameName"
          value={selection.selectedFrameName || ''}
          onChange={(e) => handleFrameNameChange(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="">Select a frame name</option>
          {availableOptions.frameNames.map((name) => (
            <option key={name} value={name}>
              {name}
            </option>
          ))}
        </select>
      </div>

      {/* Eye Size Selection */}
      {selection.selectedFrameName && (
        <div>
          <label htmlFor="eyeSize" className="block text-sm font-medium text-gray-700 mb-2">
            Eye Size (mm)
          </label>
          <select
            id="eyeSize"
            value={selection.selectedEyeSize || ''}
            onChange={(e) => handleEyeSizeChange(Number(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Select eye size</option>
            {availableOptions.eyeSizes.map((size) => (
              <option key={size} value={size}>
                {size}mm
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Frame Color Selection */}
      {selection.selectedFrameName && selection.selectedEyeSize && (
        <div>
          <label htmlFor="frameColor" className="block text-sm font-medium text-gray-700 mb-2">
            Frame Color
          </label>
          <select
            id="frameColor"
            value={selection.selectedFrameColor || ''}
            onChange={(e) => handleFrameColorChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Select frame color</option>
            {availableOptions.frameColors.map((color) => (
              <option key={color} value={color}>
                {color}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Frame Details Display */}
      {selectedFrame && (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="text-sm font-medium text-gray-900 mb-2">Frame Details</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Brand:</span>
              <span className="ml-2 font-medium">{selectedFrame.BRAND}</span>
            </div>
            <div>
              <span className="text-gray-600">Style:</span>
              <span className="ml-2 font-medium">{selectedFrame.STYLE}</span>
            </div>
            <div>
              <span className="text-gray-600">Material:</span>
              <span className="ml-2 font-medium">{selectedFrame.MATERIAL}</span>
            </div>
            <div>
              <span className="text-gray-600">Eye Size:</span>
              <span className="ml-2 font-medium">{selectedFrame.EYE_SIZE}mm</span>
            </div>
          </div>

          {/* Frame Specifications */}
          {frameSpecs && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <h4 className="text-sm font-medium text-gray-900 mb-2">Specifications</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Lens Width:</span>
                  <span className="ml-2 font-medium">{frameSpecs.LENS_WIDTH}mm</span>
                </div>
                <div>
                  <span className="text-gray-600">Lens Height:</span>
                  <span className="ml-2 font-medium">{frameSpecs.LENS_HEIGHT}mm</span>
                </div>
                <div>
                  <span className="text-gray-600">Bridge:</span>
                  <span className="ml-2 font-medium">{frameSpecs.BRIDGE}mm</span>
                </div>
                <div>
                  <span className="text-gray-600">Temple:</span>
                  <span className="ml-2 font-medium">{frameSpecs.TEMPLE}mm</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default FrameSelector;
