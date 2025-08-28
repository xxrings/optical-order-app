import React from 'react';
import { InstructionCodeRow, TintRow, FresnelOptionRow } from '../types/catalog';

interface SpecialInstructionsProps {
  availableInstructions: InstructionCodeRow[];
  selectedInstructions: string[];
  selectedValues: Record<string, string>;
  onInstructionsChange: (instructions: string[]) => void;
  onInstructionValuesChange: (values: Record<string, string>) => void;
  solidTints: TintRow[];
  gradientTints: TintRow[];
  fresnelOptions: FresnelOptionRow[];
}

export const SpecialInstructions: React.FC<SpecialInstructionsProps> = ({
  availableInstructions,
  selectedInstructions,
  selectedValues,
  onInstructionsChange,
  onInstructionValuesChange,
  solidTints,
  gradientTints,
  fresnelOptions
}) => {
  // Debug logging
  console.log('SpecialInstructions received:', {
    availableInstructionsCount: availableInstructions.length,
    solidTintsCount: solidTints.length,
    gradientTintsCount: gradientTints.length,
    fresnelOptionsCount: fresnelOptions.length
  });
  const handleInstructionToggle = (instructionCode: string) => {
    const newSelection = selectedInstructions.includes(instructionCode)
      ? selectedInstructions.filter(code => code !== instructionCode)
      : [...selectedInstructions, instructionCode];
    
    onInstructionsChange(newSelection);
    
    // Clear the value if removing the instruction
    if (selectedInstructions.includes(instructionCode)) {
      const newValues = { ...selectedValues };
      delete newValues[instructionCode];
      onInstructionValuesChange(newValues);
    }
  };

  const handleValueChange = (instructionCode: string, value: string) => {
    const newValues = { ...selectedValues };
    if (value) {
      newValues[instructionCode] = value;
    } else {
      delete newValues[instructionCode];
    }
    onInstructionValuesChange(newValues);
  };

  const getSelectedInstruction = (code: string) => {
    return availableInstructions.find(instruction => instruction.CODE === code);
  };

  const getBooleanInstructions = () => {
    return availableInstructions.filter(instruction => instruction.VALUE_TYPE === 'boolean');
  };

  const getEnumInstructions = () => {
    return availableInstructions.filter(instruction => instruction.VALUE_TYPE === 'enum');
  };

  const renderEnumDropdown = (instruction: InstructionCodeRow) => {
    let options: { value: string; label: string }[] = [];
    
    switch (instruction.CODE) {
      case 'SOLID_TINT':
        options = solidTints.map(tint => ({
          value: tint.TINT_ID,
          label: `${tint.COLOR_NAME} ${tint.PCT}%`
        }));
        break;
      case 'GRADIENT_TINT':
        options = gradientTints.map(tint => ({
          value: tint.TINT_ID,
          label: `${tint.COLOR_NAME} ${tint.PCT}%`
        }));
        break;
      case 'FRESNEL_PRISM':
        options = fresnelOptions.map(option => ({
          value: option.FRES_ID,
          label: option.VALUE
        }));
        break;
    }

    return (
      <select
        value={selectedValues[instruction.CODE] || ''}
        onChange={(e) => handleValueChange(instruction.CODE, e.target.value)}
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
      >
        <option value="">Select {instruction.LABEL}</option>
        {options.map(option => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    );
  };

  const booleanInstructions = getBooleanInstructions();
  const enumInstructions = getEnumInstructions();

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">
        Special Instructions
      </h2>
      
      {/* Boolean Instructions */}
      {booleanInstructions.length > 0 && (
        <div className="mb-6">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Standard Instructions:</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {booleanInstructions.map((instruction) => (
              <label key={instruction.CODE} className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedInstructions.includes(instruction.CODE)}
                  onChange={() => handleInstructionToggle(instruction.CODE)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-900">{instruction.LABEL}</div>
                  {instruction.NOTES && (
                    <div className="text-xs text-gray-500 mt-1">{instruction.NOTES}</div>
                  )}
                </div>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Enum Instructions */}
      {enumInstructions.length > 0 && (
        <div className="mb-6">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Special Options:</h3>
          <div className="space-y-4">
            {enumInstructions.map((instruction) => (
              <div key={instruction.CODE} className="p-3 border border-gray-200 rounded-lg">
                <div className="flex items-center space-x-3 mb-2">
                  <input
                    type="checkbox"
                    checked={selectedInstructions.includes(instruction.CODE)}
                    onChange={() => handleInstructionToggle(instruction.CODE)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-900">{instruction.LABEL}</div>
                    {instruction.NOTES && (
                      <div className="text-xs text-gray-500 mt-1">{instruction.NOTES}</div>
                    )}
                  </div>
                </div>
                {selectedInstructions.includes(instruction.CODE) && (
                  <div className="ml-7">
                    {renderEnumDropdown(instruction)}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Selected Instructions Summary */}
      {selectedInstructions.length > 0 && (
        <div className="border-t pt-4">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Selected Instructions:</h3>
          <div className="space-y-2">
            {selectedInstructions.map((code) => {
              const instruction = getSelectedInstruction(code);
              const selectedValue = selectedValues[code];
              
              let displayLabel = instruction?.LABEL || code;
              if (instruction?.VALUE_TYPE === 'enum' && selectedValue) {
                let valueLabel = '';
                switch (instruction.CODE) {
                  case 'SOLID_TINT':
                    const solidTint = solidTints.find(t => t.TINT_ID === selectedValue);
                    valueLabel = solidTint ? ` - ${solidTint.COLOR_NAME} ${solidTint.PCT}%` : '';
                    break;
                  case 'GRADIENT_TINT':
                    const gradientTint = gradientTints.find(t => t.TINT_ID === selectedValue);
                    valueLabel = gradientTint ? ` - ${gradientTint.COLOR_NAME} ${gradientTint.PCT}%` : '';
                    break;
                  case 'FRESNEL_PRISM':
                    const fresnelOption = fresnelOptions.find(o => o.FRES_ID === selectedValue);
                    valueLabel = fresnelOption ? ` - ${fresnelOption.VALUE}` : '';
                    break;
                }
                displayLabel += valueLabel;
              }

              return (
                <div key={code} className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div>
                    <div className="text-sm font-medium text-blue-900">{displayLabel}</div>
                    {instruction?.NOTES && (
                      <div className="text-xs text-blue-700 mt-1">{instruction.NOTES}</div>
                    )}
                  </div>
                  <button
                    onClick={() => handleInstructionToggle(code)}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    Remove
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {availableInstructions.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <p>No special instructions available in the catalog.</p>
        </div>
      )}
    </div>
  );
};
