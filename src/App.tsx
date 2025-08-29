import React from 'react';
import { useCatalog } from './hooks/useCatalog';
import FrameSelector from './components/FrameSelector';
import { FrameSourceSelector } from './components/FrameSourceSelector';
import { SplitLensSelector, SplitLensOptions } from './components/SplitLensSelector';
import LensSelector from './components/LensSelector';
import { RxInput } from './components/RxInput';
import { PatientMeasurementsComponent } from './components/PatientMeasurements';
import { SpecialInstructions } from './components/SpecialInstructions';
import LabCodeDisplay from './components/LabCodeDisplay';
import ValidationMessages from './components/ValidationMessages';
import './App.css';

function App() {
  const {
    catalog,
    loading,
    error,
    selection,
    validation,
    rxValidation,
    labText,
    cprsText,
    availableOptions,
    updateSelection,
    updateRxData,
    updatePatientMeasurements,
    updateSpecialInstructions,
    updateSpecialInstructionValues,
    updateFrameSource,
    updateSplitLens,
    rxAcknowledged,
    setRxAcknowledged,
    reloadCatalog
  } = useCatalog();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading optical catalog...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="text-red-600 text-6xl mb-4">⚠️</div>
          <h1 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Catalog</h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={reloadCatalog}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!catalog) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">No catalog data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <h1 className="text-2xl font-bold text-gray-900">
              Optical Order App
            </h1>
            <button
              onClick={reloadCatalog}
              className="text-sm text-blue-600 hover:text-blue-800 transition-colors"
            >
              Reload Catalog
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Selection Forms */}
          <div className="space-y-8">
            {/* Frame Selection */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Frame Selection
              </h2>
              <FrameSelector
                selection={selection}
                availableOptions={availableOptions}
                onSelectionChange={updateSelection}
                catalog={catalog}
              />
              
              {/* Frame Source Selection */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <FrameSourceSelector
                  selectedFrameSource={selection.selectedFrameSource}
                  onFrameSourceChange={updateFrameSource}
                  disabled={!selection.selectedFrameName}
                />
              </div>
            </div>

            {/* Lens Selection */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Lens Selection
              </h2>
              <SplitLensSelector
                isSplitLens={selection.isSplitLens}
                onSplitLensChange={updateSplitLens}
                disabled={!selection.selectedFrameName}
              />
              
              {selection.isSplitLens ? (
                <SplitLensOptions
                  selection={selection}
                  availableOptions={availableOptions}
                  onSelectionChange={updateSelection}
                  catalog={catalog}
                />
              ) : (
                <LensSelector
                  selection={selection}
                  availableOptions={availableOptions}
                  onSelectionChange={updateSelection}
                  catalog={catalog}
                />
              )}
            </div>

                               {/* Rx Input */}
                   <RxInput
                     rxData={selection.rxData}
                     onRxChange={updateRxData}
                     validation={rxValidation}
                     onAcknowledgmentChange={setRxAcknowledged}
                   />

                                                               {/* Patient Measurements */}
                    <PatientMeasurementsComponent
                      measurements={selection.patientMeasurements}
                      onMeasurementsChange={updatePatientMeasurements}
                      selectedDesign={selection.isSplitLens 
                        ? catalog?.designsById[selection.rightDesignId || ''] // Use right eye design for split lens
                        : catalog?.designsById[selection.selectedDesignId || '']
                      }
                    />

                                       {/* Special Instructions */}
                    <SpecialInstructions
                      availableInstructions={catalog?.instructionCodes || []}
                      selectedInstructions={selection.specialInstructions || []}
                      selectedValues={selection.specialInstructionValues || {}}
                      onInstructionsChange={updateSpecialInstructions}
                      onInstructionValuesChange={updateSpecialInstructionValues}
                      solidTints={catalog?.tints.filter(t => t.STYLE === 'SOLID') || []}
                      gradientTints={catalog?.tints.filter(t => t.STYLE === 'GRADIENT') || []}
                      fresnelOptions={catalog?.fresnelOptions || []}
                    />

                   {/* Validation Messages */}
                   <ValidationMessages validation={validation} />
          </div>

          {/* Right Column - Lab Code Display */}
          <div className="space-y-8">
                         <LabCodeDisplay
               labText={labText}
               cprsText={cprsText}
               selection={selection}
               catalog={catalog}
               isValid={validation.isValid && rxValidation.isValid && (!rxValidation.requiresAcknowledgment || rxAcknowledged)}
             />
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
