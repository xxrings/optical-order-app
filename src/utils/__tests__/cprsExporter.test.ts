import { buildCprsExport } from '../cprsExporter';
import { excelParser } from '../excelParser';
import { Catalog, SelectionState } from '../../types/catalog';

// Mock catalog data for testing
const mockCatalog: Catalog = {
  frames: [
    {
      FRAME_ID: 'FRAME001',
      NAME: 'Test Frame',
      BRAND: 'Test Brand',
      STYLE: 'Test Style',
      MATERIAL: 'Test Material',
      EYE_SIZE: 54,
      COLOR: 'Black',
      DISCONTINUED: 'N',
      IMAGE_KEY: undefined
    }
  ],
  frameSpecsById: {
    'FRAME001': {
      FRAME_ID: 'FRAME001',
      LENS_WIDTH: 54,
      LENS_HEIGHT: 36,
      BRIDGE: 18,
      TEMPLE: 140
    }
  },
  materialsById: {
    'MAT001': {
      MATERIAL_ID: 'MAT001',
      NAME_DISPLAY: 'CR39 CLEAR',
      INDEX: 1.5,
      AVAILABLE: 'Y',
      RIMLESS_ALLOWED: 'Y',
      NOTES: undefined
    }
  },
  treatmentsById: {
    'TREAT001': {
      TREATMENT_ID: 'TREAT001',
      NAME_DISPLAY: 'CLEAR',
      TYPE: 'CLEAR',
      COLORS_ALLOWED: undefined,
      RIMLESS_ALLOWED: 'Y',
      NOTES: undefined
    }
  },
  designsById: {
    'DESIGN001': {
      DESIGN_ID: 'DESIGN001',
      CATEGORY: 'SV',
      TYPE: 'SV DISTANCE',
      SEG_TYPE: undefined,
      SEG_SIZE: undefined,
      MIN_SEG_HEIGHT_MM: 0,
      DISCONTINUED: 'N',
      OUTPUT_LT: '1',
      OUTPUT_SG: undefined,
      NOTES: undefined
    }
  },
  availability: [
    {
      AVAIL_ID: 'AVAIL001',
      DESIGN_ID: 'DESIGN001',
      MATERIAL_ID: 'MAT001',
      TREATMENT_ID: 'TREAT001',
      COLOR: undefined,
      IS_AVAILABLE: 'Y',
      RIMLESS_ALLOWED: 'Y',
      MIN_SEG_HEIGHT_MM: undefined,
      OUTPUT_CD: '0',
      OUTPUT_LC: '1',
      OUTPUT_LMD: 'CLEAR',
      NOTES: undefined
    }
  ],
  tints: [
    {
      TINT_ID: 'TINT001',
      STYLE: 'SOLID',
      COLOR_NAME: 'BLUE',
      PCT: 50,
      OUTPUT_TOKEN: '1000',
      NOTES: undefined
    }
  ],
  fresnelOptions: [
    {
      FRES_ID: 'FRES001',
      VALUE: '35D',
      OUTPUT_TOKEN: '35D'
    }
  ],
  instructionCodes: [
    {
      CODE: 'TI1',
      LABEL: 'SOLID TINT',
      VALUE_TYPE: 'enum',
      ALLOWED_VALUES: 'TINT001,TINT002',
      OUTPUT_TEMPLATE: '{OUTPUT_TOKEN}',
      NOTES: undefined
    },
    {
      CODE: 'TI13',
      LABEL: 'FRESNEL PRISM',
      VALUE_TYPE: 'enum',
      ALLOWED_VALUES: 'FRES001,FRES002',
      OUTPUT_TEMPLATE: '{OUTPUT_TOKEN}',
      NOTES: undefined
    }
  ],
  tintCompatibility: [],
  enums: []
};

const mockSelection: SelectionState = {
  selectedFrameId: 'FRAME001',
  selectedMaterialId: 'MAT001',
  selectedTreatmentId: 'TREAT001',
  selectedDesignId: 'DESIGN001',
  rxData: {
    rightSphere: -2.50,
    rightCylinder: -1.00,
    rightAxis: 90,
    leftSphere: -2.25,
    leftCylinder: -0.75,
    leftAxis: 85
  },
  patientMeasurements: {
    rightMonoPD: 30.5,
    leftMonoPD: 30.0
  },
  specialInstructions: ['TI1'],
  specialInstructionValues: {
    'TI1': 'TINT001'
  }
};

describe('CPRS Exporter', () => {
  test('produces exact CPRS format with CRLF line endings', () => {
    const orderData = {
      selection: mockSelection,
      catalog: mockCatalog
    };

    const result = buildCprsExport(orderData);

    // Check that it ends with CRLF
    expect(result.endsWith('\r\n')).toBe(true);

    // Check that all lines use CRLF
    const lines = result.split('\r\n');
    expect(lines.length).toBeGreaterThan(1);

    // Check specific CPRS format elements
    expect(result).toContain('\\FRAME:Test Frame');
    expect(result).toContain('\\SIZE:54x36');
    expect(result).toContain('\\COLOR:Black');
    expect(result).toContain('\\SKU#:FRAME001');
    expect(result).toContain('\\FRAME STATUS:ACTIVE');
    expect(result).toContain('\\EYEGLASS ORDERING INFORMATION:');
    expect(result).toContain('\\RX_EYE:BOTH \\RX:OD -2.50 -1.00 90 OS -2.25 -0.75 85');
    expect(result).toContain('\\LENS MATERIAL:CR39 CLEAR CLEAR SV DISTANCE \\CD:0 \\LC:1 \\LMD:CLEAR');
    expect(result).toContain('\\LENS TYPE:SV DISTANCE \\LT:1');
    expect(result).toContain('\\SEG TYPE:');
    expect(result).toContain('\\LENS MATERIAL1:');
    expect(result).toContain('\\LENS TYPE1:');
    expect(result).toContain('\\SEG TYPE1:');
    expect(result).toContain('\\SPECTACLE RX:');
    expect(result).toContain('\\OD1:-2.50 -1.00 90');
    expect(result).toContain('\\PR1:\\PR2:\\PR3:\\ADD:');
    expect(result).toContain('\\SBC:');
    expect(result).toContain('\\OS1:-2.25 -0.75 85');
    expect(result).toContain('\\PR4:\\PR5:\\PR6:\\ADD1:');
    expect(result).toContain('\\SBC1:');
    expect(result).toContain('\\SEGMENT HGT:');
    expect(result).toContain('\\OD2:\\OS2:');
    expect(result).toContain('\\PUPILLARY DISTANCE:');
    expect(result).toContain('\\FAR:\\OD3:30.5\\OS3:30.0');
    expect(result).toContain('\\NEAR:\\OD4:\\OS4:');
    expect(result).toContain('\\SPECIAL INSTRUCTIONS:');
    expect(result).toContain('\\TI1:SOLID TINT \\SI1:1000');
    expect(result).toContain('\\TINT:BLUE, 50');
  });

  test('handles empty selection correctly', () => {
    const emptySelection: SelectionState = {};
    const orderData = {
      selection: emptySelection,
      catalog: mockCatalog
    };

    const result = buildCprsExport(orderData);

    // Should still produce the full CPRS structure with empty values
    expect(result).toContain('\\FRAME:');
    expect(result).toContain('\\SIZE:');
    expect(result).toContain('\\COLOR:');
    expect(result).toContain('\\SKU#:');
    expect(result).toContain('\\FRAME STATUS:');
    expect(result).toContain('\\EYEGLASS ORDERING INFORMATION:');
    expect(result).toContain('\\RX_EYE: \\RX:');
    expect(result).toContain('\\LENS MATERIAL:');
    expect(result).toContain('\\LENS TYPE:');
    expect(result).toContain('\\SEG TYPE:');
    expect(result).toContain('\\LENS MATERIAL1:');
    expect(result).toContain('\\LENS TYPE1:');
    expect(result).toContain('\\SEG TYPE1:');
    expect(result).toContain('\\SPECTACLE RX:');
    expect(result).toContain('\\OD1:');
    expect(result).toContain('\\PR1:\\PR2:\\PR3:\\ADD:');
    expect(result).toContain('\\SBC:');
    expect(result).toContain('\\OS1:');
    expect(result).toContain('\\PR4:\\PR5:\\PR6:\\ADD1:');
    expect(result).toContain('\\SBC1:');
    expect(result).toContain('\\SEGMENT HGT:');
    expect(result).toContain('\\OD2:\\OS2:');
    expect(result).toContain('\\PUPILLARY DISTANCE:');
    expect(result).toContain('\\FAR:\\OD3:\\OS3:');
    expect(result).toContain('\\NEAR:\\OD4:\\OS4:');
    expect(result).toContain('\\SPECIAL INSTRUCTIONS:');
  });

  test('handles no special instructions correctly', () => {
    const selectionWithoutSpecialInstructions = {
      ...mockSelection,
      specialInstructions: [],
      specialInstructionValues: {}
    };

    const orderData = {
      selection: selectionWithoutSpecialInstructions,
      catalog: mockCatalog
    };

    const result = buildCprsExport(orderData);

    // Should have SPECIAL INSTRUCTIONS header but no additional lines
    expect(result).toContain('\\SPECIAL INSTRUCTIONS:');
    expect(result).not.toContain('\\TI1:');
    expect(result).not.toContain('\\TINT:');
  });

  test('throws error for missing availability', () => {
    const catalogWithoutAvailability = {
      ...mockCatalog,
      availability: []
    };

    const orderData = {
      selection: mockSelection,
      catalog: catalogWithoutAvailability
    };

    expect(() => buildCprsExport(orderData)).toThrow(
      'No availability for DESIGN=DESIGN001, MATERIAL=MAT001, TREATMENT=TREAT001, COLOR=blank'
    );
  });
});
