// Type aliases for better type safety
export type MaterialId = string;
export type TreatmentId = string;
export type DesignId = string;
export type FrameId = string;
export type AvailabilityId = string;

// Frame-related interfaces
export interface FrameRow {
  FRAME_ID: FrameId;
  NAME: string;
  BRAND: string;
  STYLE: string;
  MATERIAL: string;
  EYE_SIZE: number;
  COLOR: string;
  DISCONTINUED: 'Y' | 'N';
  SKU?: string;
  IMAGE_KEY?: string;
}

export interface FrameSpecsRow {
  FRAME_ID: FrameId;
  LENS_WIDTH: number;
  LENS_HEIGHT: number;
  BRIDGE: number;
  TEMPLE: number;
}

// Lens-related interfaces
export interface MaterialRow {
  MATERIAL_ID: MaterialId;
  NAME_DISPLAY: string;
  INDEX: number;
  AVAILABLE: 'Y' | 'N';
  RIMLESS_ALLOWED: 'Y' | 'N';
  NOTES?: string;
}

export interface TreatmentRow {
  TREATMENT_ID: TreatmentId;
  NAME_DISPLAY: string;
  TYPE: string;
  COLORS_ALLOWED?: string;
  RIMLESS_ALLOWED: 'Y' | 'N';
  NOTES?: string;
}

export interface DesignRow {
  DESIGN_ID: DesignId;
  CATEGORY: string;
  TYPE: string;
  SEG_TYPE?: string;
  SEG_SIZE?: number;
  MIN_SEG_HEIGHT_MM: number;
  DISCONTINUED: 'Y' | 'N';
  OUTPUT_LT: string;
  OUTPUT_SG?: string;
  NOTES?: string;
}

export interface AvailabilityRow {
  AVAIL_ID: AvailabilityId;
  DESIGN_ID: DesignId;
  MATERIAL_ID: MaterialId;
  TREATMENT_ID: TreatmentId;
  COLOR?: string;
  IS_AVAILABLE: 'Y' | 'N';
  RIMLESS_ALLOWED: 'Y' | 'N';
  MIN_SEG_HEIGHT_MM?: number;
  OUTPUT_CD: string;
  OUTPUT_LC: string;
  OUTPUT_LMD: string;
  NOTES?: string;
}

// Additional interfaces

export interface InstructionCodeRow {
  CODE: string;
  LABEL: string;
  VALUE_TYPE: 'boolean' | 'enum';
  ALLOWED_VALUES?: string;
  OUTPUT_TEMPLATE: string;
  NOTES?: string;
}

export interface TintRow {
  TINT_ID: string;
  STYLE: 'SOLID' | 'GRADIENT';
  COLOR_NAME: string;
  PCT: number;
  OUTPUT_TOKEN: string;
  NOTES?: string;
}

export interface FresnelOptionRow {
  FRES_ID: string;
  VALUE: string;
  OUTPUT_TOKEN: string;
}

export interface TintCompatibilityRow {
  DESIGN_ID: DesignId;
  MATERIAL_ID: MaterialId;
  TREATMENT_ID: TreatmentId;
  TINT_ID: string;
  ALLOWED: 'Y' | 'N';
  STYLE_REQUIRED?: string;
  PCT_MIN?: number;
  PCT_MAX?: number;
  NOTES?: string;
}

export interface EnumRow {
  ENUM_NAME: string;
  VALUE: string;
}

// Main catalog interface
export interface Catalog {
  frames: FrameRow[];
  frameSpecsById: Record<FrameId, FrameSpecsRow | undefined>;
  materialsById: Record<MaterialId, MaterialRow>;
  treatmentsById: Record<TreatmentId, TreatmentRow>;
  designsById: Record<DesignId, DesignRow>;
  availability: AvailabilityRow[];
  tints: TintRow[];
  fresnelOptions: FresnelOptionRow[];
  instructionCodes: InstructionCodeRow[];
  tintCompatibility: TintCompatibilityRow[];
  enums: EnumRow[];
}

// Rx data interface
export interface RxData {
  // Right Eye
  rightSphere?: number;
  rightCylinder?: number;
  rightAxis?: number;
  rightPrismVertical?: number;
  rightPrismVerticalDirection?: 'up' | 'down';
  rightPrismHorizontal?: number;
  rightPrismHorizontalDirection?: 'in' | 'out';
  rightAdd?: number;
  rightBaseCurve?: number;
  
  // Left Eye
  leftSphere?: number;
  leftCylinder?: number;
  leftAxis?: number;
  leftPrismVertical?: number;
  leftPrismVerticalDirection?: 'up' | 'down';
  leftPrismHorizontal?: number;
  leftPrismHorizontalDirection?: 'in' | 'out';
  leftAdd?: number;
  leftBaseCurve?: number;
}

// Patient measurements interface
export interface PatientMeasurements {
  // SV (Single Vision) measurements
  rightMonoPD?: number;
  leftMonoPD?: number;
  rightOCHeight?: number; // Optional OC (Optical Center) height
  leftOCHeight?: number;
  
  // Multifocal measurements
  rightMonoDistancePD?: number;
  leftMonoDistancePD?: number;
  rightMonoNearPD?: number;
  leftMonoNearPD?: number;
  rightSegmentHeight?: number;
  leftSegmentHeight?: number;
  
  // Progressive measurements
  rightFittingHeight?: number;
  leftFittingHeight?: number;
}

// Selection state interface
export interface SelectionState {
  // Frame selection
  selectedFrameName?: string;
  selectedEyeSize?: number;
  selectedFrameColor?: string;
  selectedFrameId?: FrameId;
  selectedFrameSource?: 'UNCUT' | 'SUPPLIED' | 'TO COME';
  
  // Lens selection
  selectedMaterialId?: MaterialId;
  selectedTreatmentId?: TreatmentId;
  selectedDesignId?: DesignId;
  selectedColor?: string;
  
  // Rx data
  rxData?: RxData;
  
  // Patient measurements
  patientMeasurements?: PatientMeasurements;
  
  // Special instructions
  specialInstructions?: string[];
  specialInstructionValues?: Record<string, string>; // For enum values (e.g., SOLID_TINT -> "GREY_50")
}

// Lab codes interface
export interface LabCodes {
  lt: string;
  sg?: string;
  cd: string;
  lc: string;
  lmd: string;
}

// Validation interface
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}
