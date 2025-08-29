import { 
  Catalog, 
  SelectionState, 
  ValidationResult,
  MaterialId,
  TreatmentId,
  DesignId
} from '../types/catalog';

export class ValidationEngine {
  constructor(private catalog: Catalog) {}

  validateSelection(selection: SelectionState): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Validate frame selection
    this.validateFrameSelection(selection, errors, warnings);

    // Validate lens selection
    this.validateLensSelection(selection, errors, warnings);

    // Validate combinations
    this.validateCombinations(selection, errors, warnings);

    // Validate special instructions
    this.validateSpecialInstructions(selection, errors, warnings);

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  private validateFrameSelection(
    selection: SelectionState, 
    errors: string[], 
    warnings: string[]
  ): void {
    if (!selection.selectedFrameName) {
      errors.push('Frame name is required');
      return;
    }

    if (!selection.selectedEyeSize) {
      errors.push('Eye size is required');
      return;
    }

    if (!selection.selectedFrameColor) {
      errors.push('Frame color is required');
      return;
    }

    // Validate eye size range
    if (selection.selectedEyeSize < 40 || selection.selectedEyeSize > 80) {
      warnings.push('Eye size should typically be between 40-80mm');
    }

    // Check if frame is discontinued
    const frame = this.catalog.frames.find(f => 
      f.NAME === selection.selectedFrameName &&
      f.EYE_SIZE === selection.selectedEyeSize &&
      f.COLOR === selection.selectedFrameColor
    );

    if (frame && frame.DISCONTINUED === 'Y') {
      warnings.push('Selected frame is discontinued');
    }
  }

  private validateLensSelection(
    selection: SelectionState, 
    errors: string[], 
    warnings: string[]
  ): void {
    if (selection.isSplitLens) {
      // Validate split lens selections
      this.validateSplitLensSelection(selection, errors, warnings);
    } else {
      // Validate single lens selections
      this.validateSingleLensSelection(selection, errors, warnings);
    }
  }

  private validateSingleLensSelection(
    selection: SelectionState, 
    errors: string[], 
    warnings: string[]
  ): void {
    if (!selection.selectedMaterialId) {
      errors.push('Material is required');
      return;
    }

    if (!selection.selectedTreatmentId) {
      errors.push('Treatment is required');
      return;
    }

    if (!selection.selectedDesignId) {
      errors.push('Design is required');
      return;
    }

    // Validate material availability
    const material = this.catalog.materialsById[selection.selectedMaterialId];
    if (material && material.AVAILABLE === 'N') {
      errors.push('Selected material is not available');
    }

    // Validate treatment availability
    const treatment = this.catalog.treatmentsById[selection.selectedTreatmentId];
    if (!treatment) {
      errors.push('Selected treatment is not valid');
    }

    // Validate design availability
    const design = this.catalog.designsById[selection.selectedDesignId];
    if (design && design.DISCONTINUED === 'Y') {
      warnings.push('Selected design is discontinued');
    }

    // Check if color is required but not selected
    if (this.isColorRequired(selection.selectedMaterialId, selection.selectedTreatmentId, selection.selectedDesignId) && 
        !selection.selectedColor) {
      errors.push('Color selection is required for this combination');
    }
  }

  private validateCombinations(
    selection: SelectionState, 
    errors: string[], 
    warnings: string[]
  ): void {
    if (!selection.selectedMaterialId || !selection.selectedTreatmentId || !selection.selectedDesignId) {
      return;
    }

    // Check availability combination
    const availability = this.catalog.availability.find(row =>
      row.MATERIAL_ID === selection.selectedMaterialId &&
      row.TREATMENT_ID === selection.selectedTreatmentId &&
      row.DESIGN_ID === selection.selectedDesignId &&
      (selection.selectedColor ? row.COLOR === selection.selectedColor : !row.COLOR) &&
      row.IS_AVAILABLE === 'Y'
    );

    if (!availability) {
      errors.push('Selected combination is not available');
      return;
    }

    // Check rimless compatibility
    this.validateRimlessCompatibility(selection, availability, errors, warnings);

    // Check minimum segment height
    this.validateSegmentHeight(selection, availability, warnings);
  }

  private validateRimlessCompatibility(
    selection: SelectionState,
    availability: any,
    errors: string[],
    warnings: string[]
  ): void {
    // Check if frame is rimless (this would need to be determined from frame specs)
    // const frameSpecs = selection.selectedFrameId ? 
    //   this.catalog.frameSpecsById[selection.selectedFrameId] : undefined;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    
    // For now, we'll assume non-rimless unless we have specific logic
    const isRimless = false; // TODO: Implement rimless detection logic

    if (isRimless) {
      const material = this.catalog.materialsById[selection.selectedMaterialId!];
      const treatment = this.catalog.treatmentsById[selection.selectedTreatmentId!];

      if (material && material.RIMLESS_ALLOWED === 'N') {
        errors.push('Selected material is not compatible with rimless frames');
      }

      if (treatment && treatment.RIMLESS_ALLOWED === 'N') {
        errors.push('Selected treatment is not compatible with rimless frames');
      }

      if (availability.RIMLESS_ALLOWED === 'N') {
        errors.push('Selected combination is not compatible with rimless frames');
      }
    }
  }

  private validateSegmentHeight(
    selection: SelectionState,
    availability: any,
    warnings: string[]
  ): void {
    const design = this.catalog.designsById[selection.selectedDesignId!];
    if (!design) return;

    const minSegHeight = Math.max(
      design.MIN_SEG_HEIGHT_MM,
      availability.MIN_SEG_HEIGHT_MM || 0
    );

    if (minSegHeight > 0) {
      // TODO: Get actual segment height from frame specs or user input
      const actualSegHeight = 0; // Placeholder
      
      if (actualSegHeight < minSegHeight) {
        warnings.push(`Minimum segment height should be ${minSegHeight}mm for this design`);
      }
    }
  }

  private validateSplitLensSelection(
    selection: SelectionState, 
    errors: string[], 
    warnings: string[]
  ): void {
    // Validate right eye selections
    if (!selection.rightMaterialId) {
      errors.push('Right eye material is required');
      return;
    }

    if (!selection.rightTreatmentId) {
      errors.push('Right eye treatment is required');
      return;
    }

    if (!selection.rightDesignId) {
      errors.push('Right eye design is required');
      return;
    }

    // Validate left eye selections
    if (!selection.leftMaterialId) {
      errors.push('Left eye material is required');
      return;
    }

    if (!selection.leftTreatmentId) {
      errors.push('Left eye treatment is required');
      return;
    }

    if (!selection.leftDesignId) {
      errors.push('Left eye design is required');
      return;
    }

    // Validate right eye material availability
    const rightMaterial = this.catalog.materialsById[selection.rightMaterialId];
    if (rightMaterial && rightMaterial.AVAILABLE === 'N') {
      errors.push('Selected right eye material is not available');
    }

    // Validate left eye material availability
    const leftMaterial = this.catalog.materialsById[selection.leftMaterialId];
    if (leftMaterial && leftMaterial.AVAILABLE === 'N') {
      errors.push('Selected left eye material is not available');
    }

    // Validate right eye treatment availability
    const rightTreatment = this.catalog.treatmentsById[selection.rightTreatmentId];
    if (rightTreatment && rightTreatment.AVAILABLE === 'N') {
      errors.push('Selected right eye treatment is not available');
    }

    // Validate left eye treatment availability
    const leftTreatment = this.catalog.treatmentsById[selection.leftTreatmentId];
    if (leftTreatment && leftTreatment.AVAILABLE === 'N') {
      errors.push('Selected left eye treatment is not available');
    }

    // Validate right eye design availability
    const rightDesign = this.catalog.designsById[selection.rightDesignId];
    if (rightDesign && rightDesign.DISCONTINUED === 'Y') {
      warnings.push('Selected right eye design is discontinued');
    }

    // Validate left eye design availability
    const leftDesign = this.catalog.designsById[selection.leftDesignId];
    if (leftDesign && leftDesign.DISCONTINUED === 'Y') {
      warnings.push('Selected left eye design is discontinued');
    }

    // Validate availability combinations
    const rightAvailability = this.catalog.availability.find(row =>
      row.MATERIAL_ID === selection.rightMaterialId &&
      row.TREATMENT_ID === selection.rightTreatmentId &&
      row.DESIGN_ID === selection.rightDesignId &&
      row.IS_AVAILABLE === 'Y'
    );

    if (!rightAvailability) {
      errors.push('Right eye lens combination is not available');
    }

    const leftAvailability = this.catalog.availability.find(row =>
      row.MATERIAL_ID === selection.leftMaterialId &&
      row.TREATMENT_ID === selection.leftTreatmentId &&
      row.DESIGN_ID === selection.leftDesignId &&
      row.IS_AVAILABLE === 'Y'
    );

    if (!leftAvailability) {
      errors.push('Left eye lens combination is not available');
    }
  }

  private isColorRequired(
    materialId: MaterialId, 
    treatmentId: TreatmentId, 
    designId: DesignId
  ): boolean {
    return this.catalog.availability.some(row =>
      row.MATERIAL_ID === materialId &&
      row.TREATMENT_ID === treatmentId &&
      row.DESIGN_ID === designId &&
      row.IS_AVAILABLE === 'Y' &&
      row.COLOR
    );
  }

  // Helper method to get available options for cascading dropdowns
  getAvailableOptions(selection: SelectionState): {
    frameNames: string[];
    eyeSizes: number[];
    frameColors: string[];
    materials: MaterialId[];
    treatments: TreatmentId[];
    designs: DesignId[];
    colors: string[];
  } {
    const frameNames = [...new Set(
      this.catalog.frames
        .filter(f => f.DISCONTINUED === 'N')
        .map(f => f.NAME)
    )].sort();

    const eyeSizes = [...new Set(
      this.catalog.frames
        .filter(f => !selection.selectedFrameName || f.NAME === selection.selectedFrameName)
        .map(f => f.EYE_SIZE)
    )].sort((a, b) => a - b);

    const frameColors = [...new Set(
      this.catalog.frames
        .filter(f => 
          (!selection.selectedFrameName || f.NAME === selection.selectedFrameName) &&
          (!selection.selectedEyeSize || f.EYE_SIZE === selection.selectedEyeSize)
        )
        .map(f => f.COLOR)
    )].sort();

    const materials = Object.keys(this.catalog.materialsById)
      .filter(id => this.catalog.materialsById[id].AVAILABLE === 'Y')
      .sort();

    // For split lens, we need to handle both right and left eye selections
    if (selection.isSplitLens) {
      // For split lens, show all available options since each eye can have different selections
      const treatments = [...new Set(
        this.catalog.availability
          .filter(row => row.IS_AVAILABLE === 'Y')
          .map(row => row.TREATMENT_ID)
      )].sort();

      const designs = [...new Set(
        this.catalog.availability
          .filter(row => row.IS_AVAILABLE === 'Y')
          .map(row => row.DESIGN_ID)
      )].sort();

      const colors = [...new Set(
        this.catalog.availability
          .filter(row => row.IS_AVAILABLE === 'Y' && row.COLOR)
          .map(row => row.COLOR!)
      )].sort();

      return {
        frameNames,
        eyeSizes,
        frameColors,
        materials,
        treatments,
        designs,
        colors
      };
    } else {
      // For single lens, use the original cascading logic
      const treatments = [...new Set(
        this.catalog.availability
          .filter(row => 
            (!selection.selectedMaterialId || row.MATERIAL_ID === selection.selectedMaterialId) &&
            row.IS_AVAILABLE === 'Y'
          )
          .map(row => row.TREATMENT_ID)
      )].sort();

      const designs = [...new Set(
        this.catalog.availability
          .filter(row => 
            (!selection.selectedMaterialId || row.MATERIAL_ID === selection.selectedMaterialId) &&
            (!selection.selectedTreatmentId || row.TREATMENT_ID === selection.selectedTreatmentId) &&
            row.IS_AVAILABLE === 'Y'
          )
          .map(row => row.DESIGN_ID)
      )].sort();

      const colors = [...new Set(
        this.catalog.availability
          .filter(row => 
            (!selection.selectedMaterialId || row.MATERIAL_ID === selection.selectedMaterialId) &&
            (!selection.selectedTreatmentId || row.TREATMENT_ID === selection.selectedTreatmentId) &&
            (!selection.selectedDesignId || row.DESIGN_ID === selection.selectedDesignId) &&
            row.IS_AVAILABLE === 'Y' &&
            row.COLOR
          )
          .map(row => row.COLOR!)
      )].sort();

      return {
        frameNames,
        eyeSizes,
        frameColors,
        materials,
        treatments,
        designs,
        colors
      };
    }
  }

  private validateSpecialInstructions(
    selection: SelectionState, 
    errors: string[], 
    warnings: string[]
  ): void {
    if (!selection.specialInstructions || selection.specialInstructions.length === 0) {
      return;
    }

    for (const instructionCode of selection.specialInstructions) {
      // Validate that the instruction code exists in the catalog
      const instruction = this.catalog.instructionCodes.find(inst => inst.CODE === instructionCode);
      if (!instruction) {
        errors.push(`Invalid special instruction: ${instructionCode}`);
        continue;
      }

      // For enum instructions, validate that a value is selected
      if (instruction.VALUE_TYPE === 'enum') {
        const selectedValue = selection.specialInstructionValues?.[instructionCode];
        if (!selectedValue) {
          errors.push(`${instruction.LABEL} requires a selection`);
          continue;
        }

        // Validate that the selected value exists in the appropriate catalog
        let isValidValue = false;
        switch (instruction.CODE) {
          case 'SOLID_TINT':
            isValidValue = this.catalog.tints.some(t => t.TINT_ID === selectedValue && t.STYLE === 'SOLID');
            break;
          case 'GRADIENT_TINT':
            isValidValue = this.catalog.tints.some(t => t.TINT_ID === selectedValue && t.STYLE === 'GRADIENT');
            break;
          case 'FRESNEL_PRISM':
            isValidValue = this.catalog.fresnelOptions.some(o => o.FRES_ID === selectedValue);
            break;
        }

        if (!isValidValue) {
          errors.push(`Invalid selection for ${instruction.LABEL}`);
        }
      }
    }
  }
}
