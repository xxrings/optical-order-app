import React from 'react';
import { PatientMeasurements } from '../types/catalog';
import { getLensType, getRequiredMeasurements, getLensTypeDisplayName, LensType } from '../utils/lensTypeHelper';
import { DesignRow } from '../types/catalog';

interface PatientMeasurementsProps {
  measurements: PatientMeasurements | undefined;
  onMeasurementsChange: (measurements: PatientMeasurements) => void;
  selectedDesign: DesignRow | undefined;
}

export const PatientMeasurementsComponent: React.FC<PatientMeasurementsProps> = ({
  measurements,
  onMeasurementsChange,
  selectedDesign
}) => {
  const lensType = getLensType(selectedDesign);
  const requiredMeasurements = getRequiredMeasurements(lensType);
  const lensTypeDisplayName = getLensTypeDisplayName(lensType);

  const handleInputChange = (field: keyof PatientMeasurements, value: string) => {
    const finalValue = value === '' ? undefined : parseFloat(value);
    const newMeasurements = { ...measurements, [field]: finalValue };
    onMeasurementsChange(newMeasurements);
  };

  const renderSVMeasurements = () => (
    <div className="grid grid-cols-2 gap-4">
      {/* Mono PDs */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Right Mono PD <span className="text-red-500">*</span>
        </label>
        <input
          type="number"
          step="0.5"
          min="0"
          max="50"
          value={measurements?.rightMonoPD || ''}
          onChange={(e) => handleInputChange('rightMonoPD', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="30.0"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Left Mono PD <span className="text-red-500">*</span>
        </label>
        <input
          type="number"
          step="0.5"
          min="0"
          max="50"
          value={measurements?.leftMonoPD || ''}
          onChange={(e) => handleInputChange('leftMonoPD', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="30.0"
        />
      </div>
      
      {/* Optional OC Heights */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Right OC Height (Optional)
        </label>
        <input
          type="number"
          step="0.5"
          min="0"
          max="50"
          value={measurements?.rightOCHeight || ''}
          onChange={(e) => handleInputChange('rightOCHeight', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="28.0"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Left OC Height (Optional)
        </label>
        <input
          type="number"
          step="0.5"
          min="0"
          max="50"
          value={measurements?.leftOCHeight || ''}
          onChange={(e) => handleInputChange('leftOCHeight', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="28.0"
        />
      </div>
    </div>
  );

  const renderMultifocalMeasurements = () => (
    <div className="grid grid-cols-2 gap-4">
      {/* Distance PDs */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Right Distance PD <span className="text-red-500">*</span>
        </label>
        <input
          type="number"
          step="0.5"
          min="0"
          max="50"
          value={measurements?.rightMonoDistancePD || ''}
          onChange={(e) => handleInputChange('rightMonoDistancePD', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="30.0"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Left Distance PD <span className="text-red-500">*</span>
        </label>
        <input
          type="number"
          step="0.5"
          min="0"
          max="50"
          value={measurements?.leftMonoDistancePD || ''}
          onChange={(e) => handleInputChange('leftMonoDistancePD', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="30.0"
        />
      </div>
      
      {/* Near PDs */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Right Near PD <span className="text-red-500">*</span>
        </label>
        <input
          type="number"
          step="0.5"
          min="0"
          max="50"
          value={measurements?.rightMonoNearPD || ''}
          onChange={(e) => handleInputChange('rightMonoNearPD', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="28.0"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Left Near PD <span className="text-red-500">*</span>
        </label>
        <input
          type="number"
          step="0.5"
          min="0"
          max="50"
          value={measurements?.leftMonoNearPD || ''}
          onChange={(e) => handleInputChange('leftMonoNearPD', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="28.0"
        />
      </div>
      
      {/* Segment Heights */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Right Segment Height <span className="text-red-500">*</span>
        </label>
        <input
          type="number"
          step="0.5"
          min="0"
          max="50"
          value={measurements?.rightSegmentHeight || ''}
          onChange={(e) => handleInputChange('rightSegmentHeight', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="22.0"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Left Segment Height <span className="text-red-500">*</span>
        </label>
        <input
          type="number"
          step="0.5"
          min="0"
          max="50"
          value={measurements?.leftSegmentHeight || ''}
          onChange={(e) => handleInputChange('leftSegmentHeight', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="22.0"
        />
      </div>
    </div>
  );

  const renderProgressiveMeasurements = () => (
    <div className="grid grid-cols-2 gap-4">
      {/* Distance PDs */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Right Distance PD <span className="text-red-500">*</span>
        </label>
        <input
          type="number"
          step="0.5"
          min="0"
          max="50"
          value={measurements?.rightMonoDistancePD || ''}
          onChange={(e) => handleInputChange('rightMonoDistancePD', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="30.0"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Left Distance PD <span className="text-red-500">*</span>
        </label>
        <input
          type="number"
          step="0.5"
          min="0"
          max="50"
          value={measurements?.leftMonoDistancePD || ''}
          onChange={(e) => handleInputChange('leftMonoDistancePD', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="30.0"
        />
      </div>
      
      {/* Fitting Heights */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Right Fitting Height <span className="text-red-500">*</span>
        </label>
        <input
          type="number"
          step="0.5"
          min="0"
          max="50"
          value={measurements?.rightFittingHeight || ''}
          onChange={(e) => handleInputChange('rightFittingHeight', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="28.0"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Left Fitting Height <span className="text-red-500">*</span>
        </label>
        <input
          type="number"
          step="0.5"
          min="0"
          max="50"
          value={measurements?.leftFittingHeight || ''}
          onChange={(e) => handleInputChange('leftFittingHeight', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="28.0"
        />
      </div>
    </div>
  );

  const renderMeasurements = () => {
    switch (lensType) {
      case 'SV':
        return renderSVMeasurements();
      case 'MULTIFOCAL':
        return renderMultifocalMeasurements();
      case 'PROGRESSIVE':
        return renderProgressiveMeasurements();
      default:
        return renderSVMeasurements();
    }
  };

  return (
    <div className="bg-gray-50 rounded-lg p-6 mb-6">
      <h2 className="text-xl font-bold text-gray-900 mb-4">Patient Measurements</h2>
      
      {selectedDesign ? (
        <div>
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
            <p className="text-sm text-blue-800">
              <strong>Lens Type:</strong> {lensTypeDisplayName}
            </p>
            <p className="text-sm text-blue-700 mt-1">
              {requiredMeasurements.requiredFields.length} required measurement(s)
            </p>
          </div>
          
          {renderMeasurements()}
          
          <div className="mt-4 text-sm text-gray-600">
            <p className="mb-2"><strong>Instructions:</strong></p>
            <ul className="space-y-1">
              <li>• All measurements in millimeters (mm)</li>
              <li>• PD values typically range from 25-35mm per eye</li>
              <li>• Heights typically range from 20-35mm</li>
              <li>• Use 0.5mm increments for precision</li>
              <li>• <span className="text-red-500">*</span> Required fields</li>
            </ul>
          </div>
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-gray-500">Please select a lens design to see required measurements</p>
        </div>
      )}
    </div>
  );
};
