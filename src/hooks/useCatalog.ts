import { useState, useEffect, useCallback } from 'react';
import { Catalog, SelectionState, ValidationResult } from '../types/catalog';
import { excelParser } from '../utils/excelParser';
import { LabCodeGenerator } from '../utils/labCodeGenerator';
import { ValidationEngine } from '../utils/validation';
import { RxValidator, RxValidationResult } from '../utils/rxValidation';
import { buildCprsExport } from '../utils/cprsExporter';
import { testFrameData } from '../utils/testFrameData';

interface UseCatalogReturn {
  catalog: Catalog | null;
  loading: boolean;
  error: string | null;
  selection: SelectionState;
  validation: ValidationResult;
  rxValidation: RxValidationResult;
  labText: string;
  cprsText: string;
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
  updatePatientMeasurements: (measurements: any) => void;
  updateSpecialInstructions: (instructions: string[]) => void;
  updateSpecialInstructionValues: (values: Record<string, string>) => void;
  updateFrameSource: (frameSource: 'UNCUT' | 'SUPPLIED' | 'TO COME') => void;
  updateSplitLens: (isSplit: boolean) => void;
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
       const url = `/Optical_Catalog_Master_FRESH.xlsx?v=sku-${timestamp}&r=${randomId}`; // cache-bust in dev
       await excelParser.loadWorkbook(url);
      const catalogData = excelParser.parseCatalog();
      
      // Test frame data parsing
      await testFrameData();
      
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

  // Update patient measurements
  const updatePatientMeasurements = useCallback((measurements: any) => {
    setSelection(prev => ({ ...prev, patientMeasurements: measurements }));
  }, []);

  // Update special instructions
  const updateSpecialInstructions = useCallback((instructions: string[]) => {
    setSelection(prev => ({ ...prev, specialInstructions: instructions }));
  }, []);

  // Update special instruction values
  const updateSpecialInstructionValues = useCallback((values: Record<string, string>) => {
    setSelection(prev => ({ ...prev, specialInstructionValues: values }));
  }, []);

  // Update frame source
  const updateFrameSource = useCallback((frameSource: 'UNCUT' | 'SUPPLIED' | 'TO COME') => {
    setSelection(prev => ({ ...prev, selectedFrameSource: frameSource }));
  }, []);

  // Update split lens selection
  const updateSplitLens = useCallback((isSplit: boolean) => {
    setSelection(prev => ({ 
      ...prev, 
      isSplitLens: isSplit,
      // Clear lens selections when switching modes
      selectedMaterialId: undefined,
      selectedTreatmentId: undefined,
      selectedDesignId: undefined,
      selectedColor: undefined,
      rightMaterialId: undefined,
      rightTreatmentId: undefined,
      rightDesignId: undefined,
      rightColor: undefined,
      leftMaterialId: undefined,
      leftTreatmentId: undefined,
      leftDesignId: undefined,
      leftColor: undefined
    }));
  }, []);

  // Check if Rx warnings are acknowledged (used in validation logic)
  const isRxAcknowledged = rxValidation.requiresAcknowledgment ? rxAcknowledged : true;

  // Get lab text
  const labText = labCodeGenerator?.generateLabText(selection) || '';

  // Get CPRS text
  const cprsText = catalog ? buildCprsExport({ selection, catalog }) : '';

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
  };
};
