import { useState, useEffect, useCallback } from 'react';
import { Catalog, SelectionState, ValidationResult } from '../types/catalog';
import { excelParser } from '../utils/excelParser';
import { LabCodeGenerator } from '../utils/labCodeGenerator';
import { ValidationEngine } from '../utils/validation';
import { RxValidator, RxValidationResult } from '../utils/rxValidation';

interface UseCatalogReturn {
  catalog: Catalog | null;
  loading: boolean;
  error: string | null;
  selection: SelectionState;
  validation: ValidationResult;
  rxValidation: RxValidationResult;
  labText: string;
  availableOptions: {
    frameNames: string[];
    eyeSizes: number[];
    frameColors: string[];
    materials: string[];
    treatments: string[];
    designs: string[];
    colors: string[];
  };
  updateSelection: (updates: Partial<SelectionState>) => void;
  updateRxData: (rxData: any) => void;
  updateSpecialInstructions: (instructions: string[]) => void;
  updateSpecialInstructionValues: (values: Record<string, string>) => void;
  rxAcknowledged: boolean;
  setRxAcknowledged: (acknowledged: boolean) => void;
  reloadCatalog: () => Promise<void>;
}

export const useCatalog = (): UseCatalogReturn => {
  const [catalog, setCatalog] = useState<Catalog | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selection, setSelection] = useState<SelectionState>({});
  const [rxAcknowledged, setRxAcknowledged] = useState(false);

  // Initialize utilities when catalog is loaded
  const [labCodeGenerator, setLabCodeGenerator] = useState<LabCodeGenerator | null>(null);
  const [validationEngine, setValidationEngine] = useState<ValidationEngine | null>(null);

  const loadCatalog = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Force cache busting with a more aggressive approach
      const timestamp = new Date().getTime();
      const randomId = Math.random().toString(36).substring(7);
      await excelParser.loadWorkbook(`/Optical_Catalog_Master_FRESH.xlsx?v=${timestamp}&r=${randomId}`);
      const catalogData = excelParser.parseCatalog();
      
      setCatalog(catalogData);
      setLabCodeGenerator(new LabCodeGenerator(catalogData));
      setValidationEngine(new ValidationEngine(catalogData));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load catalog');
      console.error('Error loading catalog:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Load catalog on mount
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    loadCatalog();
  }, []);

  const reloadCatalog = useCallback(async () => {
    await loadCatalog();
  }, [loadCatalog]);

  // Update selection with cascading reset logic
  const updateSelection = useCallback((updates: Partial<SelectionState>) => {
    setSelection(prevSelection => {
      const newSelection = { ...prevSelection, ...updates };

      // Reset dependent selections when parent selection changes
      if (updates.selectedFrameName !== undefined && updates.selectedFrameName !== prevSelection.selectedFrameName) {
        newSelection.selectedEyeSize = undefined;
        newSelection.selectedFrameColor = undefined;
        newSelection.selectedFrameId = undefined;
      }

      if (updates.selectedEyeSize !== undefined && updates.selectedEyeSize !== prevSelection.selectedEyeSize) {
        newSelection.selectedFrameColor = undefined;
        newSelection.selectedFrameId = undefined;
      }

      if (updates.selectedFrameColor !== undefined && updates.selectedFrameColor !== prevSelection.selectedFrameColor) {
        // Find the frame ID for the selected combination
        const frame = catalog?.frames.find(f => 
          f.NAME === newSelection.selectedFrameName &&
          f.EYE_SIZE === newSelection.selectedEyeSize &&
          f.COLOR === newSelection.selectedFrameColor
        );
        newSelection.selectedFrameId = frame?.FRAME_ID;
      }

      if (updates.selectedMaterialId !== undefined && updates.selectedMaterialId !== prevSelection.selectedMaterialId) {
        newSelection.selectedTreatmentId = undefined;
        newSelection.selectedDesignId = undefined;
        newSelection.selectedColor = undefined;
      }

      if (updates.selectedTreatmentId !== undefined && updates.selectedTreatmentId !== prevSelection.selectedTreatmentId) {
        newSelection.selectedDesignId = undefined;
        newSelection.selectedColor = undefined;
      }

      if (updates.selectedDesignId !== undefined && updates.selectedDesignId !== prevSelection.selectedDesignId) {
        newSelection.selectedColor = undefined;
      }

      return newSelection;
    });
  }, [catalog]);

  // Get validation result
  const validation = validationEngine?.validateSelection(selection) || {
    isValid: false,
    errors: [],
    warnings: []
  };

  // Get Rx validation result
  const rxValidation = RxValidator.validateRx(selection.rxData || {});

  // Update Rx data
  const updateRxData = useCallback((rxData: any) => {
    setSelection(prev => ({ ...prev, rxData }));
  }, []);

  // Update special instructions
  const updateSpecialInstructions = useCallback((instructions: string[]) => {
    setSelection(prev => ({ ...prev, specialInstructions: instructions }));
  }, []);

  // Update special instruction values
  const updateSpecialInstructionValues = useCallback((values: Record<string, string>) => {
    setSelection(prev => ({ ...prev, specialInstructionValues: values }));
  }, []);

  // Check if Rx warnings are acknowledged (used in validation logic)
  const isRxAcknowledged = rxValidation.requiresAcknowledgment ? rxAcknowledged : true;

  // Get lab text
  const labText = labCodeGenerator?.generateLabText(selection) || '';

  // Get available options for cascading dropdowns
  const availableOptions = validationEngine?.getAvailableOptions(selection) || {
    frameNames: [],
    eyeSizes: [],
    frameColors: [],
    materials: [],
    treatments: [],
    designs: [],
    colors: []
  };

  return {
    catalog,
    loading,
    error,
    selection,
    validation,
    rxValidation,
    labText,
    availableOptions,
    updateSelection,
    updateRxData,
    updateSpecialInstructions,
    updateSpecialInstructionValues,
    rxAcknowledged,
    setRxAcknowledged,
    reloadCatalog
  };
};
