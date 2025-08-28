import { buildCprsExport } from '../cprsExporter';

// Minimal test data
const minimalCatalog = {
  frames: [],
  frameSpecsById: {},
  materialsById: {},
  treatmentsById: {},
  designsById: {},
  availability: [],
  tints: [],
  fresnelOptions: [],
  instructionCodes: [],
  tintCompatibility: [],
  enums: []
};

const minimalSelection = {};

describe('CPRS Exporter - Minimal Test', () => {
  test('produces CPRS format with empty data', () => {
    const orderData = {
      selection: minimalSelection,
      catalog: minimalCatalog
    };

    const result = buildCprsExport(orderData);

    // Should contain all required CPRS sections
    expect(result).toContain('\\EYEGLASS DELIVERY RECOMMENDATIONS:');
    expect(result).toContain('\\DELIVERY:');
    expect(result).toContain('\\FRAME:         \\SIZE:      \\COLOR:                \\SKU#:');
    expect(result).toContain('\\fr:       \\sz:      \\col:              \\sku:');
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
    expect(result).toContain('\\OD1:\\SP:\\C:\\AX:\\PRISM:');
    expect(result).toContain('\\PR1: \\PR2: \\PR3: \\ADD:');
    expect(result).toContain('\\SBC:');
    expect(result).toContain('\\OS1:\\SP1:\\C1:\\AX1:\\PRISM1:');
    expect(result).toContain('\\PR4: \\PR5: \\PR6: \\ADD1:');
    expect(result).toContain('\\SBC1:');
    expect(result).toContain('\\SEGMENT HGT:');
    expect(result).toContain('\\OD2:\\OS2:');
    expect(result).toContain('\\PUPILLARY DISTANCE:');
    expect(result).toContain('\\FAR:\\OD3:\\OS3:');
    expect(result).toContain('\\NEAR:\\OD4:\\OS4:');
    expect(result).toContain('\\SPECIAL INSTRUCTIONS:');

    // Should end with CRLF
    expect(result.endsWith('\r\n')).toBe(true);

    // Should use CRLF for line endings
    const lines = result.split('\r\n');
    expect(lines.length).toBeGreaterThan(1);
  });
});
