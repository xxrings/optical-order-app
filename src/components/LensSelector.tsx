import React from 'react';
import { SelectionState, Catalog } from '../types/catalog';

interface LensSelectorProps {
  selection: SelectionState;
  availableOptions: {
    materials: string[];
    treatments: string[];
    designs: string[];
    colors: string[];
  };
  onSelectionChange: (updates: Partial<SelectionState>) => void;
  catalog: Catalog;
}

const LensSelector: React.FC<LensSelectorProps> = ({
  selection,
  availableOptions,
  onSelectionChange,
  catalog
}) => {
  const handleMaterialChange = (materialId: string) => {
    onSelectionChange({ selectedMaterialId: materialId });
  };

  const handleTreatmentChange = (treatmentId: string) => {
    onSelectionChange({ selectedTreatmentId: treatmentId });
  };

  const handleDesignChange = (designId: string) => {
    onSelectionChange({ selectedDesignId: designId });
  };

  const handleColorChange = (color: string) => {
    onSelectionChange({ selectedColor: color });
  };

  // Get selected item details for display
  const selectedMaterial = selection.selectedMaterialId ? 
    catalog.materialsById[selection.selectedMaterialId] : null;
  
  const selectedTreatment = selection.selectedTreatmentId ? 
    catalog.treatmentsById[selection.selectedTreatmentId] : null;
  
  const selectedDesign = selection.selectedDesignId ? 
    catalog.designsById[selection.selectedDesignId] : null;

  return (
    <div className="space-y-4">
      {/* Material Selection */}
      <div>
        <label htmlFor="material" className="block text-sm font-medium text-gray-700 mb-2">
          Material
        </label>
        <select
          id="material"
          value={selection.selectedMaterialId || ''}
          onChange={(e) => handleMaterialChange(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="">Select a material</option>
          {availableOptions.materials.map((materialId) => {
            const material = catalog.materialsById[materialId];
            return (
              <option key={materialId} value={materialId}>
                {material ? material.NAME_DISPLAY : materialId}
              </option>
            );
          })}
        </select>
      </div>

      {/* Treatment Selection */}
      {selection.selectedMaterialId && (
        <div>
          <label htmlFor="treatment" className="block text-sm font-medium text-gray-700 mb-2">
            Treatment
          </label>
          <select
            id="treatment"
            value={selection.selectedTreatmentId || ''}
            onChange={(e) => handleTreatmentChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Select a treatment</option>
            {availableOptions.treatments.map((treatmentId) => {
              const treatment = catalog.treatmentsById[treatmentId];
              return (
                <option key={treatmentId} value={treatmentId}>
                  {treatment ? treatment.NAME_DISPLAY : treatmentId}
                </option>
              );
            })}
          </select>
        </div>
      )}

      {/* Design Selection */}
      {selection.selectedMaterialId && selection.selectedTreatmentId && (
        <div>
          <label htmlFor="design" className="block text-sm font-medium text-gray-700 mb-2">
            Design
          </label>
          <select
            id="design"
            value={selection.selectedDesignId || ''}
            onChange={(e) => handleDesignChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Select a design</option>
            {availableOptions.designs.map((designId) => {
              const design = catalog.designsById[designId];
              return (
                <option key={designId} value={designId}>
                  {design ? `${designId} - ${design.CATEGORY}` : designId}
                </option>
              );
            })}
          </select>
        </div>
      )}

      {/* Color Selection (only shown when required) */}
      {selection.selectedMaterialId && 
       selection.selectedTreatmentId && 
       selection.selectedDesignId && 
       availableOptions.colors.length > 0 && (
        <div>
          <label htmlFor="color" className="block text-sm font-medium text-gray-700 mb-2">
            Color
          </label>
          <select
            id="color"
            value={selection.selectedColor || ''}
            onChange={(e) => handleColorChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Select a color</option>
            {availableOptions.colors.map((color) => (
              <option key={color} value={color}>
                {color}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Lens Details Display */}
      {(selectedMaterial || selectedTreatment || selectedDesign) && (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="text-sm font-medium text-gray-900 mb-2">Lens Details</h3>
          
          {selectedMaterial && (
            <div className="mb-3">
              <h4 className="text-xs font-medium text-gray-700 uppercase tracking-wide mb-1">
                Material
              </h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-gray-600">Name:</span>
                  <span className="ml-2 font-medium">{selectedMaterial.NAME_DISPLAY}</span>
                </div>
                <div>
                  <span className="text-gray-600">Index:</span>
                  <span className="ml-2 font-medium">{selectedMaterial.INDEX}</span>
                </div>
                {selectedMaterial.NOTES && (
                  <div className="col-span-2">
                    <span className="text-gray-600">Notes:</span>
                    <span className="ml-2 text-sm">{selectedMaterial.NOTES}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {selectedTreatment && (
            <div className="mb-3">
              <h4 className="text-xs font-medium text-gray-700 uppercase tracking-wide mb-1">
                Treatment
              </h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-gray-600">Name:</span>
                  <span className="ml-2 font-medium">{selectedTreatment.NAME_DISPLAY}</span>
                </div>
                <div>
                  <span className="text-gray-600">Type:</span>
                  <span className="ml-2 font-medium">{selectedTreatment.TYPE}</span>
                </div>
                {selectedTreatment.COLORS_ALLOWED && (
                  <div className="col-span-2">
                    <span className="text-gray-600">Colors:</span>
                    <span className="ml-2 text-sm">{selectedTreatment.COLORS_ALLOWED}</span>
                  </div>
                )}
                {selectedTreatment.NOTES && (
                  <div className="col-span-2">
                    <span className="text-gray-600">Notes:</span>
                    <span className="ml-2 text-sm">{selectedTreatment.NOTES}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {selectedDesign && (
            <div>
              <h4 className="text-xs font-medium text-gray-700 uppercase tracking-wide mb-1">
                Design
              </h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-gray-600">Category:</span>
                  <span className="ml-2 font-medium">{selectedDesign.CATEGORY}</span>
                </div>
                <div>
                  <span className="text-gray-600">Type:</span>
                  <span className="ml-2 font-medium">{selectedDesign.TYPE}</span>
                </div>
                {selectedDesign.SEG_TYPE && (
                  <div>
                    <span className="text-gray-600">Segment Type:</span>
                    <span className="ml-2 font-medium">{selectedDesign.SEG_TYPE}</span>
                  </div>
                )}
                {selectedDesign.SEG_SIZE && (
                  <div>
                    <span className="text-gray-600">Segment Size:</span>
                    <span className="ml-2 font-medium">{selectedDesign.SEG_SIZE}</span>
                  </div>
                )}
                <div>
                  <span className="text-gray-600">Min Seg Height:</span>
                  <span className="ml-2 font-medium">{selectedDesign.MIN_SEG_HEIGHT_MM}mm</span>
                </div>
                {selectedDesign.NOTES && (
                  <div className="col-span-2">
                    <span className="text-gray-600">Notes:</span>
                    <span className="ml-2 text-sm">{selectedDesign.NOTES}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default LensSelector;
