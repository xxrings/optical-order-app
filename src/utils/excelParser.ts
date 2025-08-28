import * as XLSX from 'xlsx';
import { 
  Catalog, 
  FrameRow, 
  FrameSpecsRow, 
  MaterialRow, 
  TreatmentRow, 
  DesignRow, 
  AvailabilityRow,
  TintRow,
  FresnelOptionRow,
  InstructionCodeRow,
  TintCompatibilityRow,
  EnumRow
} from '../types/catalog';

export class ExcelParser {
  private workbook: XLSX.WorkBook | null = null;

  async loadWorkbook(filePath: string): Promise<void> {
    try {
      console.log('CATALOG:: Loading file:', filePath);
      const response = await fetch(filePath);
      const arrayBuffer = await response.arrayBuffer();
      this.workbook = XLSX.read(arrayBuffer, { type: 'array' });
      console.log('CATALOG:: Sheet names:', Object.keys(this.workbook.Sheets));
    } catch (error) {
      console.error('Error loading workbook:', error);
      throw new Error('Failed to load catalog workbook');
    }
  }

  parseCatalog(): Catalog {
    if (!this.workbook) {
      throw new Error('Workbook not loaded');
    }

    // Debug: List all available sheets
    console.log('Available sheets in workbook:', Object.keys(this.workbook.Sheets));
    
    // Validate required sheets exist
    const REQUIRED_SHEETS = ["InstructionCodes", "Tints"];
    const availableSheets = Object.keys(this.workbook.Sheets);
    for (const sheet of REQUIRED_SHEETS) {
      if (!availableSheets.includes(sheet)) {
        throw new Error(`Catalog missing required sheet: ${sheet}. Found: ${availableSheets.join(", ")}`);
      }
    }
    
    // Check for optional FresnelOptions sheet
    const hasFresnelOptions = availableSheets.includes("FresnelOptions");
    if (!hasFresnelOptions) {
      console.warn('FresnelOptions sheet not found - FRESNEL_PRISM instruction will not be available');
    }

    const frames = this.parseSheet<FrameRow>('Frames');
    const tints = this.parseSheet<TintRow>('Tints');
    const fresnelOptions = this.parseSheet<FresnelOptionRow>('FresnelOptions');
    const instructionCodes = this.parseSheet<InstructionCodeRow>('InstructionCodes');

    // Debug logging
    console.log('Parsed catalog data:', {
      framesCount: frames.length,
      tintsCount: tints.length,
      fresnelOptionsCount: fresnelOptions.length,
      instructionCodesCount: instructionCodes.length,
      instructionCodes: instructionCodes.map(ic => ({ code: ic.CODE, type: ic.VALUE_TYPE, label: ic.LABEL }))
    });
    
    // Show detailed instruction codes
    console.log('Detailed instruction codes:', instructionCodes);
    console.log('Instruction codes raw data:', instructionCodes.map(ic => ({
      CODE: ic.CODE,
      LABEL: ic.LABEL,
      VALUE_TYPE: ic.VALUE_TYPE,
      OUTPUT_TEMPLATE: ic.OUTPUT_TEMPLATE
    })));
    
    // Show detailed tints
    console.log('Detailed tints:', tints);
    console.log('Tints raw data:', tints.map(t => ({
      TINT_ID: t.TINT_ID,
      STYLE: t.STYLE,
      COLOR_NAME: t.COLOR_NAME,
      PCT: t.PCT,
      OUTPUT_TOKEN: t.OUTPUT_TOKEN
    })));

    const catalog: Catalog = {
      frames,
      frameSpecsById: this.createFrameSpecsMap(),
      materialsById: this.createMaterialsMap(),
      treatmentsById: this.createTreatmentsMap(),
      designsById: this.createDesignsMap(),
      availability: this.parseSheet<AvailabilityRow>('Availability'),
      tints,
      fresnelOptions,
      instructionCodes,
      tintCompatibility: this.parseSheet<TintCompatibilityRow>('TintCompatibility'),
      enums: this.parseSheet<EnumRow>('Enums')
    };

    // Validate data counts
    console.log('CATALOG:: InstructionCodes count:', instructionCodes.length);
    console.log('CATALOG:: Tints count:', tints.length);
    console.log('CATALOG:: Fresnel options count:', fresnelOptions.length);
    
    // Validate required instruction codes exist
    const requiredCodes = ["SOLID_TINT", "GRADIENT_TINT", "ARMAR_AR", "SLAB_LENS"];
    const haveCodes = new Set(instructionCodes.map(r => String(r.CODE).trim()));
    for (const code of requiredCodes) {
      if (!haveCodes.has(code)) {
        console.warn(`InstructionCodes missing required CODE: ${code}`);
      }
    }
    
    // Check for FRESNEL_PRISM code
    if (!haveCodes.has("FRESNEL_PRISM")) {
      console.warn('FRESNEL_PRISM instruction code not found - Fresnel prism options will not be available');
    }

    // Add fallback data if insufficient data found
    if (instructionCodes.length < 5) {
      console.log('Adding fallback instruction codes for testing');
      catalog.instructionCodes = [
        {
          CODE: 'ARMAR_AR',
          LABEL: 'ARMAR AR',
          VALUE_TYPE: 'boolean',
          OUTPUT_TEMPLATE: '\\TI1:ARMAR AR \\SI:ARC',
          NOTES: 'Anti-reflective coating'
        },
        {
          CODE: 'SLAB_LENS',
          LABEL: 'Slab Lens',
          VALUE_TYPE: 'boolean',
          OUTPUT_TEMPLATE: '\\TI4:SLAB LENS \\SI4:90',
          NOTES: 'Slab lens with 90 degree edge'
        },
        {
          CODE: 'SOLID_TINT',
          LABEL: 'Solid Tint',
          VALUE_TYPE: 'enum',
          OUTPUT_TEMPLATE: '\\TI1:SOLID TINT \\SI1:1000 \\TINT:{OUTPUT_TOKEN}',
          NOTES: 'Solid tint option'
        },
        {
          CODE: 'GRADIENT_TINT',
          LABEL: 'Gradient Tint',
          VALUE_TYPE: 'enum',
          OUTPUT_TEMPLATE: '\\TI1:GRADIENT TINT \\SI1:1000 \\TINT:{OUTPUT_TOKEN}',
          NOTES: 'Gradient tint option'
        },
        {
          CODE: 'FRESNEL_PRISM',
          LABEL: 'Fresnel Prism',
          VALUE_TYPE: 'enum',
          OUTPUT_TEMPLATE: '\\TI1:FRESNEL PRISM \\SI1:1000 \\PRISM:{OUTPUT_TOKEN}',
          NOTES: 'Fresnel prism option'
        }
      ];
    }

    if (tints.length < 5) {
      console.log('Adding fallback tints for testing');
      catalog.tints = [
        {
          TINT_ID: 'GREY_50',
          STYLE: 'SOLID',
          COLOR_NAME: 'GREY',
          PCT: 50,
          OUTPUT_TOKEN: 'GREY50',
          NOTES: '50% grey solid tint'
        },
        {
          TINT_ID: 'BROWN_75',
          STYLE: 'SOLID',
          COLOR_NAME: 'BROWN',
          PCT: 75,
          OUTPUT_TOKEN: 'BROWN75',
          NOTES: '75% brown solid tint'
        },
        {
          TINT_ID: 'GREY_GRADIENT',
          STYLE: 'GRADIENT',
          COLOR_NAME: 'GREY GRADIENT',
          PCT: 80,
          OUTPUT_TOKEN: 'GREYGRAD',
          NOTES: 'Grey gradient tint'
        },
        {
          TINT_ID: 'BROWN_GRADIENT',
          STYLE: 'GRADIENT',
          COLOR_NAME: 'BROWN GRADIENT',
          PCT: 85,
          OUTPUT_TOKEN: 'BROWGRAD',
          NOTES: 'Brown gradient tint'
        }
      ];
    }

    if (fresnelOptions.length === 0) {
      console.log('Adding fallback fresnel options for testing');
      catalog.fresnelOptions = [
        {
          FRES_ID: '1D',
          VALUE: '1 Diopter',
          OUTPUT_TOKEN: '1D'
        },
        {
          FRES_ID: '2D',
          VALUE: '2 Diopter',
          OUTPUT_TOKEN: '2D'
        },
        {
          FRES_ID: '3D',
          VALUE: '3 Diopter',
          OUTPUT_TOKEN: '3D'
        }
      ];
    }

    return catalog;
  }

  private parseSheet<T>(sheetName: string): T[] {
    if (!this.workbook) {
      throw new Error('Workbook not loaded');
    }

    const worksheet = this.workbook.Sheets[sheetName];
    if (!worksheet) {
      console.warn(`Sheet "${sheetName}" not found`);
      return [];
    }

    const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
    if (jsonData.length < 2) {
      console.warn(`Sheet "${sheetName}" has insufficient data`);
      return [];
    }

    const headers = jsonData[0] as string[];
    const rows = jsonData.slice(1) as any[][];

    // Debug: Show raw Excel data for key sheets
    if (sheetName === 'InstructionCodes' || sheetName === 'Tints') {
      console.log(`Raw Excel data for ${sheetName}:`, {
        headers,
        rowCount: rows.length,
        firstRow: rows[0],
        secondRow: rows[1]
      });
      
      // Show the actual parsed objects
      const parsedObjects = rows.map(row => {
        const obj: any = {};
        headers.forEach((header, index) => {
          if (header && row[index] !== undefined) {
            obj[header] = row[index];
          }
        });
        return obj;
      });
      console.log(`Parsed ${sheetName} objects:`, parsedObjects);
    }

    return rows.map(row => {
      const obj: any = {};
      headers.forEach((header, index) => {
        if (header && row[index] !== undefined) {
          obj[header] = row[index];
        }
      });
      return obj as T;
    });
  }

  private createFrameSpecsMap(): Record<string, FrameSpecsRow | undefined> {
    const frameSpecs = this.parseSheet<FrameSpecsRow>('FrameSpecs');
    const map: Record<string, FrameSpecsRow | undefined> = {};
    
    frameSpecs.forEach(spec => {
      map[spec.FRAME_ID] = spec;
    });
    
    return map;
  }

  private createMaterialsMap(): Record<string, MaterialRow> {
    const materials = this.parseSheet<MaterialRow>('Materials');
    const map: Record<string, MaterialRow> = {};
    
    materials.forEach(material => {
      map[material.MATERIAL_ID] = material;
    });
    
    return map;
  }

  private createTreatmentsMap(): Record<string, TreatmentRow> {
    const treatments = this.parseSheet<TreatmentRow>('Treatments');
    const map: Record<string, TreatmentRow> = {};
    
    treatments.forEach(treatment => {
      map[treatment.TREATMENT_ID] = treatment;
    });
    
    return map;
  }

  private createDesignsMap(): Record<string, DesignRow> {
    const designs = this.parseSheet<DesignRow>('Designs');
    const map: Record<string, DesignRow> = {};
    
    designs.forEach(design => {
      map[design.DESIGN_ID] = design;
    });
    
    return map;
  }

  // Helper method to reload catalog (for development)
  async reloadCatalog(filePath: string): Promise<Catalog> {
    await this.loadWorkbook(filePath);
    return this.parseCatalog();
  }
}

// Singleton instance
export const excelParser = new ExcelParser();
