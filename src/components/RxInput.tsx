import React, { useState } from 'react';
import { RxData } from '../types/catalog';
import { RxValidationResult } from '../utils/rxValidation';

interface RxInputProps {
  rxData: RxData | undefined;
  onRxChange: (rxData: RxData) => void;
  validation: RxValidationResult;
  onAcknowledgmentChange: (acknowledged: boolean) => void;
}

export const RxInput: React.FC<RxInputProps> = ({
  rxData,
  onRxChange,
  validation,
  onAcknowledgmentChange
}) => {
  const [acknowledged, setAcknowledged] = useState(false);

  const handleInputChange = (field: keyof RxData, value: string) => {
    // For direction fields, keep as string. For numeric fields, parse as number
    const isDirectionField = field.includes('Direction');
    const finalValue = isDirectionField ? (value === '' ? undefined : value) : (value === '' ? undefined : parseFloat(value));
    const newRxData = { ...rxData, [field]: finalValue };
    onRxChange(newRxData);
    
    // Reset acknowledgment when data changes
    if (acknowledged) {
      setAcknowledged(false);
      onAcknowledgmentChange(false);
    }
  };

  const handleAcknowledgmentChange = (checked: boolean) => {
    setAcknowledged(checked);
    onAcknowledgmentChange(checked);
  };

  const renderEyeSection = (eye: 'right' | 'left') => {
    const eyeLabel = eye === 'right' ? 'Right Eye' : 'Left Eye';
    const prefix = eye === 'right' ? 'right' : 'left';

    return (
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">{eyeLabel}</h3>
                {/* Line 1: Sphere, Cylinder, Axis */}
        <div className="grid grid-cols-3 gap-4 mb-4">
          {/* Sphere */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Sphere
            </label>
            <input
              type="number"
              step="0.25"
              min="-20"
              max="20"
              value={rxData?.[`${prefix}Sphere` as keyof RxData] || ''}
              onChange={(e) => handleInputChange(`${prefix}Sphere` as keyof RxData, e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="0.00"
            />
          </div>

          {/* Cylinder */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Cylinder
            </label>
            <input
              type="number"
              step="0.25"
              min="-10"
              max="10"
              value={rxData?.[`${prefix}Cylinder` as keyof RxData] || ''}
              onChange={(e) => handleInputChange(`${prefix}Cylinder` as keyof RxData, e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="0.00"
            />
          </div>

          {/* Axis */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Axis
            </label>
            <input
              type="number"
              min="1"
              max="180"
              value={rxData?.[`${prefix}Axis` as keyof RxData] || ''}
              onChange={(e) => handleInputChange(`${prefix}Axis` as keyof RxData, e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="90"
            />
          </div>
        </div>

        {/* Line 2: Prism Vertical and Horizontal */}
        <div className="grid grid-cols-2 gap-4 mb-4">
                     {/* Prism Vertical */}
           <div>
             <label className="block text-sm font-medium text-gray-700 mb-1">
               Prism Vertical
             </label>
             <div className="flex gap-2">
               <input
                 type="number"
                 step="0.25"
                 min="0"
                 value={rxData?.[`${prefix}PrismVertical` as keyof RxData] || ''}
                 onChange={(e) => handleInputChange(`${prefix}PrismVertical` as keyof RxData, e.target.value)}
                 className="w-20 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                 placeholder="0.00"
               />
               <select
                 value={rxData?.[`${prefix}PrismVerticalDirection` as keyof RxData] || ''}
                 onChange={(e) => handleInputChange(`${prefix}PrismVerticalDirection` as keyof RxData, e.target.value)}
                 className="w-24 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
               >
                 <option value="">Dir</option>
                 <option value="up">Up</option>
                 <option value="down">Down</option>
               </select>
             </div>
           </div>

           {/* Prism Horizontal */}
           <div>
             <label className="block text-sm font-medium text-gray-700 mb-1">
               Prism Horizontal
             </label>
             <div className="flex gap-2">
               <input
                 type="number"
                 step="0.25"
                 min="0"
                 value={rxData?.[`${prefix}PrismHorizontal` as keyof RxData] || ''}
                 onChange={(e) => handleInputChange(`${prefix}PrismHorizontal` as keyof RxData, e.target.value)}
                 className="w-20 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                 placeholder="0.00"
               />
               <select
                 value={rxData?.[`${prefix}PrismHorizontalDirection` as keyof RxData] || ''}
                 onChange={(e) => handleInputChange(`${prefix}PrismHorizontalDirection` as keyof RxData, e.target.value)}
                 className="w-24 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
               >
                 <option value="">Dir</option>
                 <option value="in">In</option>
                 <option value="out">Out</option>
               </select>
             </div>
           </div>
        </div>

        {/* Line 3: Add and Base Curve */}
        <div className="grid grid-cols-2 gap-4">
          {/* Add */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Add
            </label>
            <input
              type="number"
              step="0.25"
              min="0.75"
              max="4.00"
              value={rxData?.[`${prefix}Add` as keyof RxData] || ''}
              onChange={(e) => handleInputChange(`${prefix}Add` as keyof RxData, e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="1.25"
            />
          </div>

          {/* Base Curve */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Base Curve
            </label>
            <input
              type="number"
              step="0.50"
              min="0"
              max="9.00"
              value={rxData?.[`${prefix}BaseCurve` as keyof RxData] || ''}
              onChange={(e) => handleInputChange(`${prefix}BaseCurve` as keyof RxData, e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="0.00"
            />
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-gray-50 rounded-lg p-6 mb-6">
      <h2 className="text-xl font-bold text-gray-900 mb-4">Patient Prescription</h2>
      
      {renderEyeSection('right')}
      {renderEyeSection('left')}

      {/* Validation Messages */}
      {(validation.errors.length > 0 || validation.warnings.length > 0) && (
        <div className="mt-4">
          {validation.errors.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-4">
              <h4 className="text-sm font-medium text-red-800 mb-2">Errors:</h4>
              <ul className="text-sm text-red-700 space-y-1">
                {validation.errors.map((error, index) => (
                  <li key={index}>• {error}</li>
                ))}
              </ul>
            </div>
          )}

          {validation.warnings.length > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mb-4">
              <h4 className="text-sm font-medium text-yellow-800 mb-2">Warnings:</h4>
              <ul className="text-sm text-yellow-700 space-y-1">
                {validation.warnings.map((warning, index) => (
                  <li key={index}>• {warning}</li>
                ))}
              </ul>
              
              {validation.requiresAcknowledgment && (
                <div className="mt-3">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={acknowledged}
                      onChange={(e) => handleAcknowledgmentChange(e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-yellow-800">
                      I acknowledge these warnings and wish to proceed
                    </span>
                  </label>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Instructions */}
      <div className="mt-4 text-sm text-gray-600">
        <p className="mb-2"><strong>Instructions:</strong></p>
                 <ul className="space-y-1">
           <li>• Sphere: -20.00 to +20.00 in 0.25 increments</li>
           <li>• Cylinder: 0.00 to ±10.00 in 0.25 increments</li>
           <li>• Axis: 1 to 180 degrees</li>
           <li>• Prism: Positive values in 0.25 increments with direction (up/down for vertical, in/out for horizontal)</li>
           <li>• Add: 0.75 to 4.00 in 0.25 increments</li>
           <li>• Base Curve: 0.00 to 9.00 in 0.50 increments</li>
         </ul>
      </div>
    </div>
  );
};
