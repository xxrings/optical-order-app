import React, { useState } from 'react';
import { SelectionState, Catalog } from '../types/catalog';

interface LabCodeDisplayProps {
  labText: string;
  cprsText: string;
  selection: SelectionState;
  catalog: Catalog;
  isValid: boolean;
}

const LabCodeDisplay: React.FC<LabCodeDisplayProps> = ({
  labText,
  cprsText,
  selection,
  catalog,
  isValid
}) => {
  const [copied, setCopied] = useState(false);
  const [copiedCprs, setCopiedCprs] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(labText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text:', err);
    }
  };

  const handleCopyCprs = async () => {
    try {
      await navigator.clipboard.writeText(cprsText);
      setCopiedCprs(true);
      setTimeout(() => setCopiedCprs(false), 2000);
    } catch (err) {
      console.error('Failed to copy CPRS text:', err);
    }
  };

  const hasCompleteSelection = selection.selectedFrameName && 
                              selection.selectedMaterialId && 
                              selection.selectedTreatmentId && 
                              selection.selectedDesignId;

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">
        Output Formats
      </h2>

      {!hasCompleteSelection ? (
        <div className="text-center py-8">
          <div className="text-gray-400 text-6xl mb-4">📋</div>
          <p className="text-gray-500">
            Complete your selections to generate lab codes
          </p>
        </div>
      ) : !isValid ? (
        <div className="text-center py-8">
          <div className="text-red-400 text-6xl mb-4">⚠️</div>
          <p className="text-red-500">
            Please fix validation errors to generate lab codes
          </p>
        </div>
      ) : labText ? (
        <div className="space-y-6">
          {/* Lab Text Display */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Lab Code Format
            </label>
            <div className="relative">
              <textarea
                value={labText}
                readOnly
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 font-mono text-sm"
              />
              <button
                onClick={handleCopy}
                className="absolute top-2 right-2 px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
              >
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
          </div>

          {/* CPRS Text Display */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              CPRS Format (Exact Text)
            </label>
            <div className="relative">
              <textarea
                value={cprsText}
                readOnly
                rows={12}
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 font-mono text-xs"
              />
              <button
                onClick={handleCopyCprs}
                className="absolute top-2 right-2 px-3 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
              >
                {copiedCprs ? 'Copied!' : 'Copy'}
              </button>
            </div>
          </div>

          {/* Individual Code Breakdown */}
          <div>
            <h3 className="text-sm font-medium text-gray-900 mb-2">
              Code Breakdown
            </h3>
            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
              {labText.split(' ').map((token, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <span className="text-gray-500 text-xs">•</span>
                  <code className="text-sm font-mono bg-white px-2 py-1 rounded border">
                    {token}
                  </code>
                </div>
              ))}
            </div>
          </div>

          {/* Selection Summary */}
          <div>
            <h3 className="text-sm font-medium text-gray-900 mb-2">
              Selection Summary
            </h3>
            <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm">
              {selection.selectedFrameName && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Frame:</span>
                  <span className="font-medium">{selection.selectedFrameName}</span>
                </div>
              )}
              {selection.selectedEyeSize && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Eye Size:</span>
                  <span className="font-medium">{selection.selectedEyeSize}mm</span>
                </div>
              )}
              {selection.selectedFrameColor && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Frame Color:</span>
                  <span className="font-medium">{selection.selectedFrameColor}</span>
                </div>
              )}
              {selection.selectedMaterialId && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Material:</span>
                  <span className="font-medium">
                    {catalog.materialsById[selection.selectedMaterialId]?.NAME_DISPLAY || selection.selectedMaterialId}
                  </span>
                </div>
              )}
              {selection.selectedTreatmentId && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Treatment:</span>
                  <span className="font-medium">
                    {catalog.treatmentsById[selection.selectedTreatmentId]?.NAME_DISPLAY || selection.selectedTreatmentId}
                  </span>
                </div>
              )}
              {selection.selectedDesignId && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Design:</span>
                  <span className="font-medium">
                    {catalog.designsById[selection.selectedDesignId]?.CATEGORY || selection.selectedDesignId}
                  </span>
                </div>
              )}
              {selection.selectedColor && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Color:</span>
                  <span className="font-medium">{selection.selectedColor}</span>
                </div>
              )}
                             {selection.specialInstructions && selection.specialInstructions.length > 0 && (
                 <div className="border-t pt-2 mt-2">
                   <div className="text-gray-600 mb-2">Special Instructions:</div>
                   <div className="space-y-1">
                     {selection.specialInstructions.map((code) => {
                       const instruction = catalog.instructionCodes.find(inst => inst.CODE === code);
                       const selectedValue = selection.specialInstructionValues?.[code];
                       
                       let displayLabel = instruction?.LABEL || code;
                       if (instruction?.VALUE_TYPE === 'enum' && selectedValue) {
                         let valueLabel = '';
                         switch (instruction.CODE) {
                           case 'SOLID_TINT':
                             const solidTint = catalog.tints.find(t => t.TINT_ID === selectedValue && t.STYLE === 'SOLID');
                             valueLabel = solidTint ? ` - ${solidTint.COLOR_NAME} ${solidTint.PCT}%` : '';
                             break;
                           case 'GRADIENT_TINT':
                             const gradientTint = catalog.tints.find(t => t.TINT_ID === selectedValue && t.STYLE === 'GRADIENT');
                             valueLabel = gradientTint ? ` - ${gradientTint.COLOR_NAME} ${gradientTint.PCT}%` : '';
                             break;
                           case 'FRESNEL_PRISM':
                             const fresnelOption = catalog.fresnelOptions.find(o => o.FRES_ID === selectedValue);
                             valueLabel = fresnelOption ? ` - ${fresnelOption.VALUE}` : '';
                             break;
                         }
                         displayLabel += valueLabel;
                       }
                       
                       return (
                         <div key={code} className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                           {displayLabel}
                         </div>
                       );
                     })}
                   </div>
                 </div>
               )}
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-8">
          <div className="text-yellow-400 text-6xl mb-4">🔍</div>
          <p className="text-yellow-600">
            No lab codes available for this combination
          </p>
        </div>
      )}
    </div>
  );
};

export default LabCodeDisplay;
