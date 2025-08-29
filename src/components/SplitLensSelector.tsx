import React from 'react';
import { Catalog, SelectionState } from '../types/catalog';

interface SplitLensSelectorProps {
  isSplitLens?: boolean;
  onSplitLensChange: (isSplit: boolean) => void;
  disabled?: boolean;
}

export const SplitLensSelector: React.FC<SplitLensSelectorProps> = ({
  isSplitLens = false,
  onSplitLensChange,
  disabled = false
}) => {
  return (
    <div className="mb-6">
      <label className="flex items-center space-x-2 cursor-pointer">
        <input
          type="checkbox"
          checked={isSplitLens}
          onChange={(e) => onSplitLensChange(e.target.checked)}
          disabled={disabled}
          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
        />
        <span className="text-sm font-medium text-gray-900">Split Lens (Different lens options for each eye)</span>
      </label>
      {isSplitLens && (
        <p className="mt-1 text-sm text-gray-500">
          Select different lens options for each eye below
        </p>
      )}
    </div>
  );
};

interface SplitLensOptionsProps {
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
}

export const SplitLensOptions: React.FC<SplitLensOptionsProps> = ({
  selection,
  availableOptions,
  onSelectionChange,
  catalog
}) => {
  // Helper function to get available options for right eye based on current selections
  const getRightEyeOptions = () => {
    const rightTreatments = [...new Set(
      catalog.availability
        .filter(row => 
          (!selection.rightMaterialId || row.MATERIAL_ID === selection.rightMaterialId) &&
          row.IS_AVAILABLE === 'Y'
        )
        .map(row => row.TREATMENT_ID)
    )].sort();

    const rightDesigns = [...new Set(
      catalog.availability
        .filter(row => 
          (!selection.rightMaterialId || row.MATERIAL_ID === selection.rightMaterialId) &&
          (!selection.rightTreatmentId || row.TREATMENT_ID === selection.rightTreatmentId) &&
          row.IS_AVAILABLE === 'Y'
        )
        .map(row => row.DESIGN_ID)
    )].sort();

    const rightColors = [...new Set(
      catalog.availability
        .filter(row => 
          (!selection.rightMaterialId || row.MATERIAL_ID === selection.rightMaterialId) &&
          (!selection.rightTreatmentId || row.TREATMENT_ID === selection.rightTreatmentId) &&
          (!selection.rightDesignId || row.DESIGN_ID === selection.rightDesignId) &&
          row.IS_AVAILABLE === 'Y' &&
          row.COLOR
        )
        .map(row => row.COLOR!)
    )].sort();

    return { rightTreatments, rightDesigns, rightColors };
  };

  // Helper function to get available options for left eye based on current selections
  const getLeftEyeOptions = () => {
    const leftTreatments = [...new Set(
      catalog.availability
        .filter(row => 
          (!selection.leftMaterialId || row.MATERIAL_ID === selection.leftMaterialId) &&
          row.IS_AVAILABLE === 'Y'
        )
        .map(row => row.TREATMENT_ID)
    )].sort();

    const leftDesigns = [...new Set(
      catalog.availability
        .filter(row => 
          (!selection.leftMaterialId || row.MATERIAL_ID === selection.leftMaterialId) &&
          (!selection.leftTreatmentId || row.TREATMENT_ID === selection.leftTreatmentId) &&
          row.IS_AVAILABLE === 'Y'
        )
        .map(row => row.DESIGN_ID)
    )].sort();

    const leftColors = [...new Set(
      catalog.availability
        .filter(row => 
          (!selection.leftMaterialId || row.MATERIAL_ID === selection.leftMaterialId) &&
          (!selection.leftTreatmentId || row.TREATMENT_ID === selection.leftTreatmentId) &&
          (!selection.leftDesignId || row.DESIGN_ID === selection.leftDesignId) &&
          row.IS_AVAILABLE === 'Y' &&
          row.COLOR
        )
        .map(row => row.COLOR!)
    )].sort();

    return { leftTreatments, leftDesigns, leftColors };
  };

  const { rightTreatments, rightDesigns, rightColors } = getRightEyeOptions();
  const { leftTreatments, leftDesigns, leftColors } = getLeftEyeOptions();

  return (
    <div className="space-y-6">
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
              onChange={(e) => onSelectionChange({ 
                rightMaterialId: e.target.value || undefined,
                rightTreatmentId: undefined,
                rightDesignId: undefined,
                rightColor: undefined
              })}
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
          
          {selection.rightMaterialId && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Treatment
              </label>
              <select
                value={selection.rightTreatmentId || ''}
                onChange={(e) => onSelectionChange({ 
                  rightTreatmentId: e.target.value || undefined,
                  rightDesignId: undefined,
                  rightColor: undefined
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Treatment</option>
                {rightTreatments.map((treatment) => (
                  <option key={treatment} value={treatment}>
                    {treatment}
                  </option>
                ))}
              </select>
            </div>
          )}
          
          {selection.rightMaterialId && selection.rightTreatmentId && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Design
              </label>
              <select
                value={selection.rightDesignId || ''}
                onChange={(e) => onSelectionChange({ 
                  rightDesignId: e.target.value || undefined,
                  rightColor: undefined
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Design</option>
                {rightDesigns.map((design) => (
                  <option key={design} value={design}>
                    {design}
                  </option>
                ))}
              </select>
            </div>
          )}
          
          {selection.rightMaterialId && selection.rightTreatmentId && selection.rightDesignId && rightColors.length > 0 && (
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
                {rightColors.map((color) => (
                  <option key={color} value={color}>
                    {color}
                  </option>
                ))}
              </select>
            </div>
          )}
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
              onChange={(e) => onSelectionChange({ 
                leftMaterialId: e.target.value || undefined,
                leftTreatmentId: undefined,
                leftDesignId: undefined,
                leftColor: undefined
              })}
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
          
          {selection.leftMaterialId && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Treatment
              </label>
              <select
                value={selection.leftTreatmentId || ''}
                onChange={(e) => onSelectionChange({ 
                  leftTreatmentId: e.target.value || undefined,
                  leftDesignId: undefined,
                  leftColor: undefined
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Treatment</option>
                {leftTreatments.map((treatment) => (
                  <option key={treatment} value={treatment}>
                    {treatment}
                  </option>
                ))}
              </select>
            </div>
          )}
          
          {selection.leftMaterialId && selection.leftTreatmentId && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Design
              </label>
              <select
                value={selection.leftDesignId || ''}
                onChange={(e) => onSelectionChange({ 
                  leftDesignId: e.target.value || undefined,
                  leftColor: undefined
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Design</option>
                {leftDesigns.map((design) => (
                  <option key={design} value={design}>
                    {design}
                  </option>
                ))}
              </select>
            </div>
          )}
          
          {selection.leftMaterialId && selection.leftTreatmentId && selection.leftDesignId && leftColors.length > 0 && (
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
                {leftColors.map((color) => (
                  <option key={color} value={color}>
                    {color}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
