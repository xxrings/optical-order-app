import React from 'react';
import { ValidationResult } from '../types/catalog';

interface ValidationMessagesProps {
  validation: ValidationResult;
}

const ValidationMessages: React.FC<ValidationMessagesProps> = ({ validation }) => {
  const { errors, warnings } = validation;

  if (errors.length === 0 && warnings.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      {/* Error Messages */}
      {errors.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center mb-2">
            <div className="text-red-600 text-lg mr-2">⚠️</div>
            <h3 className="text-sm font-medium text-red-800">
              Validation Errors ({errors.length})
            </h3>
          </div>
          <ul className="space-y-1">
            {errors.map((error, index) => (
              <li key={index} className="text-sm text-red-700 flex items-start">
                <span className="text-red-500 mr-2">•</span>
                {error}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Warning Messages */}
      {warnings.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center mb-2">
            <div className="text-yellow-600 text-lg mr-2">💡</div>
            <h3 className="text-sm font-medium text-yellow-800">
              Warnings ({warnings.length})
            </h3>
          </div>
          <ul className="space-y-1">
            {warnings.map((warning, index) => (
              <li key={index} className="text-sm text-yellow-700 flex items-start">
                <span className="text-yellow-500 mr-2">•</span>
                {warning}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default ValidationMessages;
