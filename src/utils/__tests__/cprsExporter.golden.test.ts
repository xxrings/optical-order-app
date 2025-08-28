import { buildCprsExport } from '../cprsExporter';
import { Catalog, SelectionState } from '../../types/catalog';

// Golden test data matching the user's example
const goldenCatalog: Catalog = {
  frames: [
    {
      FRAME_ID: '7012R',
      NAME: '7012R',
      BRAND: 'Test Brand',
      STYLE: 'Test Style',
      MATERIAL: 'Test Material',
      EYE_SIZE: 55,
      COLOR: 'GREY',
      DISCONTINUED: 'N',
      IMAGE_KEY: undefined
    }
  ],
  frameSpecsById: {
    '7012R': {
      FRAME_ID: '7012R',
      LENS_WIDTH: 55,
      LENS_HEIGHT: 34,
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
      CATEGORY: 'TRIFOCAL',
      TYPE: '7X28 TRIFOCAL',
      SEG_TYPE: '7X28',
      SEG_SIZE: '7X28',
      MIN_SEG_HEIGHT_MM: 22,
      DISCONTINUED: 'N',
      OUTPUT_LT: '78',
      OUTPUT_SG: '9:78',
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
      MIN_SEG_HEIGHT_MM: 22,
      OUTPUT_CD: '0',
      OUTPUT_LC: '52',
      OUTPUT_LMD: 'CLEAR',
      NOTES: undefined
    }
  ],
  tints: [],
  fresnelOptions: [],
  instructionCodes: [],
  tintCompatibility: [],
  enums: []
};

const goldenSelection: SelectionState = {
  selectedFrameId: '7012R',
  selectedMaterialId: 'MAT001',
  selectedTreatmentId: 'TREAT001',
  selectedDesignId: 'DESIGN001',
  rxData: {
    rightSphere: 0.25,
    rightCylinder: 0.25,
    rightAxis: 1,
    rightPrismVertical: 0.25,
    rightPrismVerticalDirection: 'up',
    rightPrismHorizontal: 0.25,
    rightPrismHorizontalDirection: 'in',
    rightAdd: 0.75,
    rightBaseCurve: 0.50,
    leftSphere: 0.25,
    leftCylinder: 0.25,
    leftAxis: 1,
    leftPrismVertical: 0.25,
    leftPrismVerticalDirection: 'up',
    leftPrismHorizontal: 0.25,
    leftPrismHorizontalDirection: 'in',
    leftAdd: 0.75,
    leftBaseCurve: 0.50
  },
  patientMeasurements: {
    rightMonoDistancePD: 30,
    leftMonoDistancePD: 30,
    rightMonoNearPD: 28,
    leftMonoNearPD: 28,
    rightSegmentHeight: 22,
    leftSegmentHeight: 22
  },
  specialInstructions: [],
  specialInstructionValues: {}
};

describe('CPRS Exporter - Golden Snapshot Test', () => {
  test('produces exact golden CPRS format', () => {
    const orderData = {
      selection: goldenSelection,
      catalog: goldenCatalog
    };

    const result = buildCprsExport(orderData);

    // Force CRLF for comparison
    const normalizeCRLF = (s: string) => s.replace(/\r?\n/g, '\r\n');

    const expected = normalizeCRLF(
`\\EYEGLASS DELIVERY RECOMMENDATIONS:
\\DELIVERY:
\\FRAME:         \\SIZE:      \\COLOR:                \\SKU#:
\\fr:7012R       \\sz:55      \\col:GREY              \\sku:7012R
\\FRAME STATUS:SUPPLIED
\\EYEGLASS ORDERING INFORMATION:

\\RX_EYE:BOTH \\RX:3

\\LENS MATERIAL:CR39 CLEAR CLEAR 7X28 TRIFOCAL 7X28 \\CD:0 \\LC:52 \\LMD:CLEAR
\\LENS TYPE:7X28 TRIFOCAL \\LT:78 \\SG:9:78
\\SEG TYPE:7X28

\\LENS MATERIAL1:
\\LENS TYPE1:
\\SEG TYPE1:

\\SPECTACLE RX:
\\OD1:\\SP:+0.25\\C:+0.25\\AX:001\\PRISM:0.25
\\PR1:UP \\PR2:0.25 \\PR3:IN \\ADD:+0.75
\\SBC:0.50

\\OS1:\\SP1:+0.25\\C1:+0.25\\AX1:001\\PRISM1:0.25
\\PR4:UP \\PR5:0.25 \\PR6:IN \\ADD1:+0.75
\\SBC1:0.50

\\SEGMENT HGT:
\\OD2:22 \\OS2:22

\\PUPILLARY DISTANCE:
\\FAR:\\OD3:30 \\OS3:30
\\NEAR:\\OD4:28 \\OS4:28

\\SPECIAL INSTRUCTIONS:
`);

    expect(result).toBe(expected);
  });
});
