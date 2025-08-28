import { 
  Catalog, 
  MaterialId, 
  TreatmentId, 
  DesignId, 
  LabCodes, 
  SelectionState 
} from '../types/catalog';

export class LabCodeGenerator {
  constructor(private catalog: Catalog) {}

  getDesignCodes(designId: DesignId): { lt: string; sg?: string } {
    const design = this.catalog.designsById[designId];
    if (!design) {
      return { lt: '', sg: undefined };
    }
    
    return {
      lt: design.OUTPUT_LT || '',
      sg: design.OUTPUT_SG || undefined
    };
  }

  getLabCodes(
    materialId: MaterialId, 
    treatmentId: TreatmentId, 
    designId: DesignId, 
    color?: string
  ): LabCodes | undefined {
    // Get design codes first
    const designCodes = this.getDesignCodes(designId);
    
    // First try to find exact color match
    const exactMatch = this.catalog.availability.find(row =>
      row.MATERIAL_ID === materialId &&
      row.TREATMENT_ID === treatmentId &&
      row.DESIGN_ID === designId &&
      row.COLOR === (color || '') &&
      row.IS_AVAILABLE === 'Y'
    );

    if (exactMatch) {
      return {
        lt: designCodes.lt,
        sg: designCodes.sg,
        cd: exactMatch.OUTPUT_CD,
        lc: exactMatch.OUTPUT_LC,
        lmd: exactMatch.OUTPUT_LMD
      };
    }

    // Fallback to color-blank match
    const fallbackMatch = this.catalog.availability.find(row =>
      row.MATERIAL_ID === materialId &&
      row.TREATMENT_ID === treatmentId &&
      row.DESIGN_ID === designId &&
      !row.COLOR &&
      row.IS_AVAILABLE === 'Y'
    );

    if (fallbackMatch) {
      return {
        lt: designCodes.lt,
        sg: designCodes.sg,
        cd: fallbackMatch.OUTPUT_CD,
        lc: fallbackMatch.OUTPUT_LC,
        lmd: fallbackMatch.OUTPUT_LMD
      };
    }

    return undefined;
  }

  generateLabText(selection: SelectionState): string {
    if (!selection.selectedMaterialId || 
        !selection.selectedTreatmentId || 
        !selection.selectedDesignId) {
      return '';
    }

    const designCodes = this.getDesignCodes(selection.selectedDesignId);
    const labCodes = this.getLabCodes(
      selection.selectedMaterialId,
      selection.selectedTreatmentId,
      selection.selectedDesignId,
      selection.selectedColor
    );

    if (!labCodes) {
      return '';
    }

    const tokens: string[] = [];

    // Add LT code (always required)
    if (designCodes.lt) {
      tokens.push(`\\LT:${designCodes.lt}`);
    }

    // Add SG code (only if present)
    if (designCodes.sg) {
      tokens.push(`\\SG:${designCodes.sg}`);
    }

    // Add CD, LC, and LMD codes
    if (labCodes.cd) {
      tokens.push(`\\CD:${labCodes.cd}`);
    }
    if (labCodes.lc) {
      tokens.push(`\\LC:${labCodes.lc}`);
    }
    if (labCodes.lmd) {
      tokens.push(`\\LMD:${labCodes.lmd}`);
    }

    // Add special instructions
    if (selection.specialInstructions && selection.specialInstructions.length > 0) {
      const specialInstructionTokens = this.generateSpecialInstructionTokens(selection);
      tokens.push(...specialInstructionTokens);
    }

    return tokens.join(' ');
  }

  private generateSpecialInstructionTokens(selection: SelectionState): string[] {
    const tokens: string[] = [];
    
    if (!selection.specialInstructions) return tokens;

    for (const instructionCode of selection.specialInstructions) {
      const instruction = this.catalog.instructionCodes.find(inst => inst.CODE === instructionCode);
      if (!instruction) continue;

      if (instruction.VALUE_TYPE === 'boolean') {
        // For boolean instructions, emit the template verbatim
        tokens.push(instruction.OUTPUT_TEMPLATE);
      } else if (instruction.VALUE_TYPE === 'enum') {
        // For enum instructions, get the selected value and replace {OUTPUT_TOKEN}
        const selectedValue = selection.specialInstructionValues?.[instructionCode];
        if (selectedValue) {
          const outputToken = this.getOutputTokenForEnum(instruction.CODE, selectedValue);
          if (outputToken) {
            const template = instruction.OUTPUT_TEMPLATE.replace('{OUTPUT_TOKEN}', outputToken);
            tokens.push(template);
          }
        }
      }
    }

    return tokens;
  }

  private getOutputTokenForEnum(instructionCode: string, selectedValue: string): string | null {
    switch (instructionCode) {
      case 'SOLID_TINT':
        const solidTint = this.catalog.tints.find(t => t.TINT_ID === selectedValue && t.STYLE === 'SOLID');
        return solidTint?.OUTPUT_TOKEN || null;
      
      case 'GRADIENT_TINT':
        const gradientTint = this.catalog.tints.find(t => t.TINT_ID === selectedValue && t.STYLE === 'GRADIENT');
        return gradientTint?.OUTPUT_TOKEN || null;
      
      case 'FRESNEL_PRISM':
        const fresnelOption = this.catalog.fresnelOptions.find(o => o.FRES_ID === selectedValue);
        return fresnelOption?.OUTPUT_TOKEN || null;
      
      default:
        return null;
    }
  }

  // Helper methods for cascading selections
  listTreatmentsFor(materialId: MaterialId): TreatmentId[] {
    const availableTreatments = new Set<TreatmentId>();
    
    this.catalog.availability.forEach(row => {
      if (row.MATERIAL_ID === materialId && row.IS_AVAILABLE === 'Y') {
        availableTreatments.add(row.TREATMENT_ID);
      }
    });

    return Array.from(availableTreatments).sort();
  }

  listDesignsFor(materialId: MaterialId, treatmentId: TreatmentId): DesignId[] {
    const availableDesigns = new Set<DesignId>();
    
    this.catalog.availability.forEach(row => {
      if (row.MATERIAL_ID === materialId && 
          row.TREATMENT_ID === treatmentId && 
          row.IS_AVAILABLE === 'Y') {
        availableDesigns.add(row.DESIGN_ID);
      }
    });

    return Array.from(availableDesigns).sort();
  }

  listColorsFor(
    materialId: MaterialId, 
    treatmentId: TreatmentId, 
    designId: DesignId
  ): string[] {
    const availableColors = new Set<string>();
    
    this.catalog.availability.forEach(row => {
      if (row.MATERIAL_ID === materialId && 
          row.TREATMENT_ID === treatmentId && 
          row.DESIGN_ID === designId && 
          row.IS_AVAILABLE === 'Y' &&
          row.COLOR) {
        availableColors.add(row.COLOR);
      }
    });

    return Array.from(availableColors).sort();
  }

  isColorRequired(
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
}
