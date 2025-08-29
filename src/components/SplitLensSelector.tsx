import React from 'react';
import { Catalog, SelectionState } from '../types/catalog';

interface SplitLensSelectorProps {
  isSplitLens?: boolean;
  onSplitLensChange: (isSplit: boolean) => void;
  selection: SelectionState;
  availableOptions: {
    frameNames: string[];
    eyeSizes: number[];
    frameColors: string[];
    materials: string[];
    treatments: string[];
    designs: string[];
    colors: string[];
  };
  onSelectionChange: (updates: Partial<SelectionState>) => void;
  catalog: Catalog;
  disabled?: boolean;
}

export const SplitLensSelector: React.FC<SplitLensSelectorProps> = ({
  isSplitLens = false,
  onSplitLensChange,
  selection,
  availableOptions,
  onSelectionChange,
  catalog,
  disabled = false
}) => {
  return (
    <div className="mb-6">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Lens Type
      </label>
      <div className="flex space-x-6 mb-4">
        <label className="flex items-center space-x-2 cursor-pointer">
          <input
            type="radio"
            name="lensType"
            value="single"
            checked={!isSplitLens}
            onChange={() => onSplitLensChange(false)}
            disabled={disabled}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
          />
          <span className="text-sm font-medium text-gray-900">Single Lens</span>
        </label>
        <label className="flex items-center space-x-2 cursor-pointer">
          <input
            type="radio"
            name="lensType"
            value="split"
            checked={isSplitLens}
            onChange={() => onSplitLensChange(true)}
            disabled={disabled}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
          />
          <span className="text-sm font-medium text-gray-900">Split Lens</span>
        </label>
      </div>
      
      {isSplitLens && (
        <div className="space-y-6">
          <p className="text-sm text-gray-500">
            Select different lens options for each eye
          </p>
          
          {/* Right Eye Lens Selection */}
          <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
            <h3 className="text-md font-medium text-gray-900 mb-3">Right Eye Lens</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Material
                </label>
                <select
                  value={selection.rightMaterialId || ''}
                  onChange={(e) => onSelectionChange({ rightMaterialId: e.target.value || undefined })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Material</option>
                  {availableOptions.materials.map((material) => (
                    <option key={material} value={material}>
                      {material}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Treatment
                </label>
                <select
                  value={selection.rightTreatmentId || ''}
                  onChange={(e) => onSelectionChange({ rightTreatmentId: e.target.value || undefined })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Treatment</option>
                  {availableOptions.treatments.map((treatment) => (
                    <option key={treatment} value={treatment}>
                      {treatment}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Design
                </label>
                <select
                  value={selection.rightDesignId || ''}
                  onChange={(e) => onSelectionChange({ rightDesignId: e.target.value || undefined })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Design</option>
                  {availableOptions.designs.map((design) => (
                    <option key={design} value={design}>
                      {design}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Color
                </label>
                <select
                  value={selection.rightColor || ''}
                  onChange={(e) => onSelectionChange({ rightColor: e.target.value || undefined })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Color</option>
                  {availableOptions.colors.map((color) => (
                    <option key={color} value={color}>
                      {color}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
          
          {/* Left Eye Lens Selection */}
          <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
            <h3 className="text-md font-medium text-gray-900 mb-3">Left Eye Lens</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Material
                </label>
                <select
                  value={selection.leftMaterialId || ''}
                  onChange={(e) => onSelectionChange({ leftMaterialId: e.target.value || undefined })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Material</option>
                  {availableOptions.materials.map((material) => (
                    <option key={material} value={material}>
                      {material}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Treatment
                </label>
                <select
                  value={selection.leftTreatmentId || ''}
                  onChange={(e) => onSelectionChange({ leftTreatmentId: e.target.value || undefined })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Treatment</option>
                  {availableOptions.treatments.map((treatment) => (
                    <option key={treatment} value={treatment}>
                      {treatment}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Design
                </label>
                <select
                  value={selection.leftDesignId || ''}
                  onChange={(e) => onSelectionChange({ leftDesignId: e.target.value || undefined })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Design</option>
                  {availableOptions.designs.map((design) => (
                    <option key={design} value={design}>
                      {design}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Color
                </label>
                <select
                  value={selection.leftColor || ''}
                  onChange={(e) => onSelectionChange({ leftColor: e.target.value || undefined })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Color</option>
                  {availableOptions.colors.map((color) => (
                    <option key={color} value={color}>
                      {color}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
