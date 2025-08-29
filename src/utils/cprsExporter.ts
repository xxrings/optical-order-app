import { Catalog, SelectionState, RxData, PatientMeasurements } from '../types/catalog';
import { getLensType } from './lensTypeHelper';

export interface CprsOrderData {
  selection: SelectionState;
  catalog: Catalog;
}

export function buildCprsExport(orderData: CprsOrderData): string {
  const { selection, catalog } = orderData;
  
  // Helper functions for frame matching
  const normFrameName = (s: string) =>
    (s ?? "").toUpperCase().replace(/\s+/g, "");
  const normColor = (s: string) =>
    (s ?? "").toUpperCase().replace(/\s+/g, " ").trim();
  const toInt = (v: any) => {
    const n = Math.round(Number(v));
    return Number.isFinite(n) ? n : null;
  };

  // Build frames index for SKU lookup
  const framesIndex = new Map<string, string>();
  console.log("Building frames index for SKU lookup...");
  console.log("Total frames in catalog:", catalog.frames.length);
  
  for (const r of catalog.frames) {
    const key = `${normFrameName(r.NAME)}|${toInt(r.EYE_SIZE)}|${normColor(r.COLOR)}`;
    framesIndex.set(key, r.SKU ?? "");
    
    // Log a few sample frames to verify SKU data
    if (catalog.frames.indexOf(r) < 5) {
      console.log("Sample frame:", {
        original: { NAME: r.NAME, EYE_SIZE: r.EYE_SIZE, COLOR: r.COLOR, SKU: r.SKU },
        normalized: { 
          name: normFrameName(r.NAME), 
          eyeSize: toInt(r.EYE_SIZE), 
          color: normColor(r.COLOR) 
        },
        key: key,
        hasSku: Boolean(r.SKU)
      });
    }
  }
  
  console.log("Frames index built with", framesIndex.size, "entries");
  console.log("Sample keys in index:", Array.from(framesIndex.keys()).slice(0, 5));

  // Look up frame using normalized keys
  const frameKey = selection.selectedFrameName && selection.selectedEyeSize && selection.selectedFrameColor 
    ? `${normFrameName(selection.selectedFrameName)}|${toInt(selection.selectedEyeSize)}|${normColor(selection.selectedFrameColor)}`
    : null;
    
  console.log("Frame selection for SKU lookup:", {
    selectedFrameName: selection.selectedFrameName,
    selectedEyeSize: selection.selectedEyeSize,
    selectedFrameColor: selection.selectedFrameColor,
    normalizedName: selection.selectedFrameName ? normFrameName(selection.selectedFrameName) : null,
    normalizedEyeSize: selection.selectedEyeSize ? toInt(selection.selectedEyeSize) : null,
    normalizedColor: selection.selectedFrameColor ? normColor(selection.selectedFrameColor) : null,
    lookupKey: frameKey
  });
  
  const frame = frameKey ? catalog.frames.find(f => 
    normFrameName(f.NAME) === normFrameName(selection.selectedFrameName!) &&
    toInt(f.EYE_SIZE) === toInt(selection.selectedEyeSize!) &&
    normColor(f.COLOR) === normColor(selection.selectedFrameColor!)
  ) : undefined;
  
  // Get SKU from frames index
  const sku = frameKey ? framesIndex.get(frameKey) ?? "" : "";
  
  // Debug logging for SKU lookup
  if (frameKey) {
    console.log("CPRS SKU lookup:", {
      key: frameKey,
      frameName: selection.selectedFrameName,
      eyeSize: selection.selectedEyeSize,
      color: selection.selectedFrameColor,
      found: framesIndex.has(frameKey),
      sku: sku
    });
  }
  
  // Fail-fast logging for SKU lookup misses
  if (frameKey && !framesIndex.has(frameKey)) {
    console.warn("Missing SKU for", frameKey, {
      frameName: selection.selectedFrameName,
      eyeSize: selection.selectedEyeSize,
      color: selection.selectedFrameColor
    });
  }
    
  // Debug: Log frame lookup
  console.log('CPRS frame lookup debug:', {
    selectedFrameName: selection.selectedFrameName,
    selectedEyeSize: selection.selectedEyeSize,
    selectedFrameColor: selection.selectedFrameColor,
    foundFrame: frame ? {
      FRAME_ID: frame.FRAME_ID,
      NAME: frame.NAME,
      EYE_SIZE: frame.EYE_SIZE,
      COLOR: frame.COLOR,
      SKU: frame.SKU
    } : null,
    totalFrames: catalog.frames.length
  });
  const frameSpecs = frame ? catalog.frameSpecsById[frame.FRAME_ID] : undefined;
  const material = selection.selectedMaterialId ? catalog.materialsById[selection.selectedMaterialId] : undefined;
  const treatment = selection.selectedTreatmentId ? catalog.treatmentsById[selection.selectedTreatmentId] : undefined;
  const design = selection.selectedDesignId ? catalog.designsById[selection.selectedDesignId] : undefined;
  
  // Find availability row
  const availability = findAvailabilityRow(catalog, selection);
  
  // Build the lines array
  const lines: string[] = [];
  
  // Frame section - CPRS format with exact spacing
  lines.push('\\EYEGLASS DELIVERY RECOMMENDATIONS:');
  lines.push('\\DELIVERY:');
  lines.push('\\FRAME:         \\SIZE:      \\COLOR:                \\SKU#:');
  
  // Format frame header with exact spacing from gold using normalized values
  const frNoSpace = selection.selectedFrameName ? normFrameName(selection.selectedFrameName) : '';
  const szInt = selection.selectedEyeSize ? toInt(selection.selectedEyeSize) : '';
  const colUpper = selection.selectedFrameColor ? normColor(selection.selectedFrameColor) : '';
  
  // Use exact spacing from gold template
  lines.push(`\\fr:${frNoSpace}       \\sz:${String(szInt)}      \\col:${colUpper}              \\sku:${sku}`);
  
  // Determine frame status based on selection or frame discontinued status
  let frameStatus = 'SUPPLIED'; // default
  if (selection.selectedFrameSource) {
    frameStatus = selection.selectedFrameSource;
  } else if (frame?.DISCONTINUED === 'Y') {
    frameStatus = 'DISCONTINUED';
  }
  
  lines.push(`\\FRAME STATUS:${frameStatus}`);
  lines.push('\\EYEGLASS ORDERING INFORMATION:');
  lines.push('');
  
  // RX section
  const rxEye = getRxEyeText(selection.rxData, selection.isSplitLens);
  const rxCode = getRxCode(rxEye);
  lines.push(`\\RX_EYE:${rxEye} \\RX:${rxCode}`);
  lines.push('');
  
  // Get the appropriate design for measurements (right eye design for split lens, single design otherwise)
  const measurementDesign = selection.isSplitLens 
    ? (selection.rightDesignId ? catalog.designsById[selection.rightDesignId] : undefined)
    : design;
  
  // Lens section - handle split vs single lens
  if (selection.isSplitLens) {
    // Split lens - use right eye for main lens, left eye for lens1
    const rightMaterial = selection.rightMaterialId ? catalog.materialsById[selection.rightMaterialId] : undefined;
    const rightTreatment = selection.rightTreatmentId ? catalog.treatmentsById[selection.rightTreatmentId] : undefined;
    const rightDesign = selection.rightDesignId ? catalog.designsById[selection.rightDesignId] : undefined;
    

    
    // Find right eye availability
    let rightAvailability = undefined;
    if (rightMaterial && rightTreatment && rightDesign) {
      const matchingRows = catalog.availability.filter(row => 
        row.DESIGN_ID === selection.rightDesignId &&
        row.MATERIAL_ID === selection.rightMaterialId &&
        row.TREATMENT_ID === selection.rightTreatmentId &&
        row.IS_AVAILABLE === 'Y'
      );
      
      if (matchingRows.length > 0) {
        // Prefer exact color match, then blank color
        const exactMatch = matchingRows.find(row => row.COLOR === selection.rightColor);
        if (exactMatch) rightAvailability = exactMatch;
        else {
          const blankColorMatch = matchingRows.find(row => !row.COLOR);
          if (blankColorMatch) rightAvailability = blankColorMatch;
          else rightAvailability = matchingRows[0];
        }
      }
    }
    
    const leftMaterial = selection.leftMaterialId ? catalog.materialsById[selection.leftMaterialId] : undefined;
    const leftTreatment = selection.leftTreatmentId ? catalog.treatmentsById[selection.leftTreatmentId] : undefined;
    const leftDesign = selection.leftDesignId ? catalog.designsById[selection.leftDesignId] : undefined;
    
    // Find left eye availability
    let leftAvailability = undefined;
    if (leftMaterial && leftTreatment && leftDesign) {
      const matchingRows = catalog.availability.filter(row => 
        row.DESIGN_ID === selection.leftDesignId &&
        row.MATERIAL_ID === selection.leftMaterialId &&
        row.TREATMENT_ID === selection.leftTreatmentId &&
        row.IS_AVAILABLE === 'Y'
      );
      
      if (matchingRows.length > 0) {
        // Prefer exact color match, then blank color
        const exactMatch = matchingRows.find(row => row.COLOR === selection.leftColor);
        if (exactMatch) leftAvailability = exactMatch;
        else {
          const blankColorMatch = matchingRows.find(row => !row.COLOR);
          if (blankColorMatch) leftAvailability = blankColorMatch;
          else leftAvailability = matchingRows[0];
        }
      }
    }
    
    const rightLensMaterial = formatLensMaterial(rightMaterial, rightTreatment, rightDesign, rightAvailability);
    const rightLensType = formatLensType(rightDesign, rightAvailability);
    const rightSegType = formatSegType(rightDesign, rightDesign);
    
    const leftLensMaterial = formatLensMaterial(leftMaterial, leftTreatment, leftDesign, leftAvailability);
    const leftLensType = formatLensType(leftDesign, leftAvailability);
    const leftSegType = formatSegType(leftDesign, leftDesign);
    

    
    lines.push(`\\LENS MATERIAL:${rightLensMaterial}`);
    lines.push(`\\LENS TYPE:${rightLensType}`);
    lines.push(`\\SEG TYPE:${rightSegType}`);
    lines.push('');
    lines.push(`\\LENS MATERIAL1:${leftLensMaterial}`);
    lines.push(`\\LENS TYPE1:${leftLensType}`);
    lines.push(`\\SEG TYPE1:${leftSegType}`);
    lines.push('');
  } else {
    // Single lens - match gold format exactly
    const lensMaterial = formatLensMaterial(material, treatment, design, availability);
    const lensType = formatLensType(design, availability);
    const segType = formatSegType(design, design);
    
    lines.push(`\\LENS MATERIAL:${lensMaterial}`);
    lines.push(`\\LENS TYPE:${lensType}`);
    lines.push(`\\SEG TYPE:${segType}`);
    lines.push('');
    
    // Lens1 section (always present, may be blank)
    lines.push('\\LENS MATERIAL1:');
    lines.push('\\LENS TYPE1:');
    lines.push('\\SEG TYPE1:');
    lines.push('');
  }
  
  // Spectacle RX section
  lines.push('\\SPECTACLE RX:');
  const rxLines = formatSpectacleRx(selection.rxData);
  lines.push(...rxLines);
  lines.push('');
  
  // Segment height section
  lines.push('\\SEGMENT HGT:');
  const segHeightLines = formatSegmentHeight(selection.patientMeasurements, measurementDesign);
  lines.push(...segHeightLines);
  lines.push('');
  
  // Pupillary distance section
  lines.push('\\PUPILLARY DISTANCE:');
  const pdLines = formatPupillaryDistance(selection.patientMeasurements, measurementDesign);
  lines.push(...pdLines);
  lines.push('');
  
  // Special instructions section
  const specialInstructionsLines = formatSpecialInstructions(selection, catalog);
  lines.push(...specialInstructionsLines);
  
  // Join with CRLF and add final CRLF
  return lines.join('\r\n') + '\r\n';
}

function findAvailabilityRow(catalog: Catalog, selection: SelectionState) {
  const { selectedDesignId, selectedMaterialId, selectedTreatmentId, selectedColor } = selection;
  
  if (!selectedDesignId || !selectedMaterialId || !selectedTreatmentId) {
    return undefined;
  }
  
  // Find the most specific availability row
  const matchingRows = catalog.availability.filter(row => 
    row.DESIGN_ID === selectedDesignId &&
    row.MATERIAL_ID === selectedMaterialId &&
    row.TREATMENT_ID === selectedTreatmentId &&
    row.IS_AVAILABLE === 'Y'
  );
  
  if (matchingRows.length === 0) {
    throw new Error(`No availability for DESIGN=${selectedDesignId}, MATERIAL=${selectedMaterialId}, TREATMENT=${selectedTreatmentId}, COLOR=${selectedColor || 'blank'}`);
  }
  
  // Prefer exact color match, then blank color
  const exactMatch = matchingRows.find(row => row.COLOR === selectedColor);
  if (exactMatch) return exactMatch;
  
  const blankColorMatch = matchingRows.find(row => !row.COLOR);
  if (blankColorMatch) return blankColorMatch;
  
  // Return first match if no exact or blank color match
  return matchingRows[0];
}

function getRxEyeText(rxData?: RxData, isSplitLens?: boolean): string {
  if (!rxData) return '';
  
  // If split lens is selected, always return SPLIT
  if (isSplitLens) return 'SPLIT';
  
  const hasRightEye = rxData.rightSphere !== undefined || rxData.rightCylinder !== undefined;
  const hasLeftEye = rxData.leftSphere !== undefined || rxData.leftCylinder !== undefined;
  
  if (hasRightEye && hasLeftEye) return 'BOTH';
  if (hasRightEye) return 'RIGHT';
  if (hasLeftEye) return 'LEFT';
  return '';
}

function getRxCode(rxEye: string): string {
  switch (rxEye) {
    case 'RIGHT': return '1';
    case 'LEFT': return '2';
    case 'BOTH': return '3';
    case 'SPLIT': return '4';
    default: return '';
  }
}

function formatRxText(rxData?: RxData): string {
  if (!rxData) return '';
  
  const parts: string[] = [];
  
  // Right eye
  if (rxData.rightSphere !== undefined) parts.push(`OD ${rxData.rightSphere.toFixed(2)}`);
  if (rxData.rightCylinder !== undefined) parts.push(`${rxData.rightCylinder.toFixed(2)}`);
  if (rxData.rightAxis !== undefined) parts.push(`${rxData.rightAxis}`);
  
  // Left eye
  if (rxData.leftSphere !== undefined) parts.push(`OS ${rxData.leftSphere.toFixed(2)}`);
  if (rxData.leftCylinder !== undefined) parts.push(`${rxData.leftCylinder.toFixed(2)}`);
  if (rxData.leftAxis !== undefined) parts.push(`${rxData.leftAxis}`);
  
  return parts.join(' ');
}

function formatLensMaterial(material?: any, treatment?: any, design?: any, availability?: any): string {
  const parts: string[] = [];
  
  if (material?.NAME_DISPLAY) parts.push(material.NAME_DISPLAY.toUpperCase());
  if (treatment?.NAME_DISPLAY) parts.push(treatment.NAME_DISPLAY.toUpperCase());
  if (design?.TYPE) parts.push(design.TYPE.toUpperCase());
  if (design?.SEG_TYPE) parts.push(design.SEG_TYPE.toUpperCase());
  
  let result = parts.join(' ');
  
  // Add inline codes in exact order: CD, LC, LMD
  if (availability) {
    const codes: string[] = [];
    if (availability.OUTPUT_CD) codes.push(`\\CD:${availability.OUTPUT_CD}`);
    if (availability.OUTPUT_LC) codes.push(`\\LC:${availability.OUTPUT_LC}`);
    if (availability.OUTPUT_LMD) codes.push(`\\LMD:${availability.OUTPUT_LMD}`);
    if (codes.length > 0) {
      result += ' ' + codes.join(' ');
    }
  }
  
  return result;
}

function formatLensType(design?: any, availability?: any): string {
  if (!design) return '';
  
  let result = design.TYPE?.toUpperCase() || '';
  
  // Add inline codes in exact order: LT only (SG goes on SEG TYPE line)
  const codes: string[] = [];
  if (design.OUTPUT_LT) codes.push(`\\LT:${design.OUTPUT_LT}`);
  
  if (codes.length > 0) {
    result += ' ' + codes.join(' ');
  }
  
  return result;
}

function formatSegType(design?: any, designForSg?: any): string {
  if (!design) return '';
  
  let result = design.SEG_TYPE?.toUpperCase() || '';
  
  // Add SG code if present
  if (designForSg?.OUTPUT_SG) {
    result += ` \\SG:${designForSg.OUTPUT_SG}`;
  }
  
  return result;
}

function formatSpectacleRx(rxData?: RxData): string[] {
  const lines: string[] = [];
  
  // Right eye (OD) - CPRS format with sub-tokens
  const spOd = formatSphere(rxData?.rightSphere);
  const cOd = formatCylinder(rxData?.rightCylinder);
  const axOd = formatAxis(rxData?.rightAxis);
  const prismOd = formatCombinedPrismValue(rxData?.rightPrismVertical, rxData?.rightPrismHorizontal);
  
  const pr1Od = formatPrismDirection(rxData?.rightPrismVerticalDirection);
  const pr2Od = formatPrismValue(rxData?.rightPrismVertical);
  const pr3Od = formatPrismDirection(rxData?.rightPrismHorizontalDirection);
  const addOd = formatAdd(rxData?.rightAdd);
  const sbcOd = formatBaseCurve(rxData?.rightBaseCurve);
  
  lines.push(`\\OD1:\\SP:${spOd}\\C:${cOd}\\AX:${axOd}\\PRISM:${prismOd}`);
  lines.push(`     \\PR1:${pr1Od} \\PR2:${pr2Od} \\PR3:${pr3Od} \\ADD:${addOd}`);
  lines.push(`     \\SBC:${sbcOd}`);
  lines.push('');
  
  // Left eye (OS) - CPRS format with sub-tokens
  const spOs = formatSphere(rxData?.leftSphere);
  const cOs = formatCylinder(rxData?.leftCylinder);
  const axOs = formatAxis(rxData?.leftAxis);
  const prismOs = formatCombinedPrismValue(rxData?.leftPrismVertical, rxData?.leftPrismHorizontal);
  
  const pr4Os = formatPrismDirection(rxData?.leftPrismVerticalDirection);
  const pr5Os = formatPrismValue(rxData?.leftPrismVertical);
  const pr6Os = formatPrismDirection(rxData?.leftPrismHorizontalDirection);
  const addOs = formatAdd(rxData?.leftAdd);
  const sbcOs = formatBaseCurve(rxData?.leftBaseCurve);
  
  lines.push(`\\OS1:\\SP1:${spOs}\\C1:${cOs}\\AX1:${axOs}\\PRISM1:${prismOs}`);
  lines.push(`     \\PR4:${pr4Os} \\PR5:${pr5Os} \\PR6:${pr6Os} \\ADD1:${addOs}`);
  lines.push(`     \\SBC1:${sbcOs}`);
  
  return lines;
}

function formatSphere(sphere?: number): string {
  if (sphere === undefined) return '';
  return sphere >= 0 ? `+${sphere.toFixed(2)}` : sphere.toFixed(2);
}

function formatCylinder(cylinder?: number): string {
  if (cylinder === undefined) return '';
  return cylinder >= 0 ? `+${cylinder.toFixed(2)}` : cylinder.toFixed(2);
}

function formatAxis(axis?: number): string {
  if (axis === undefined) return '';
  return axis.toString();
}

function formatPrismValue(prism?: number): string {
  if (prism === undefined || prism === 0) return '';
  return prism.toFixed(2);
}

function formatCombinedPrismValue(verticalPrism?: number, horizontalPrism?: number): string {
  if ((verticalPrism === undefined || verticalPrism === 0) && 
      (horizontalPrism === undefined || horizontalPrism === 0)) {
    return '';
  }
  
  // For CPRS, we'll use the first non-zero prism value
  if (verticalPrism && verticalPrism !== 0) {
    return verticalPrism.toFixed(2);
  }
  if (horizontalPrism && horizontalPrism !== 0) {
    return horizontalPrism.toFixed(2);
  }
  
  return '';
}

function formatPrismDirection(direction?: string): string {
  if (!direction) return '';
  
  const directionMap: Record<string, string> = {
    'up': 'UP',
    'down': 'DOWN',
    'in': 'IN',
    'out': 'OUT'
  };
  
  return directionMap[direction] || '';
}



function formatAdd(value?: number): string {
  if (value === undefined) return '';
  return value >= 0 ? `+${value.toFixed(2)}` : value.toFixed(2);
}

function formatBaseCurve(value?: number): string {
  if (value === undefined) return '';
  return value.toFixed(2);
}

function formatSegmentHeight(measurements?: PatientMeasurements, design?: any): string[] {
  const lensType = getLensType(design);
  
  if (lensType === 'MULTIFOCAL') {
    const od2 = measurements?.rightSegmentHeight ? Math.round(Number(measurements.rightSegmentHeight)).toString() : '';
    const os2 = measurements?.leftSegmentHeight ? Math.round(Number(measurements.leftSegmentHeight)).toString() : '';
    return [`\\OD2:${od2} \\OS2:${os2}`];
  }
  
  return ['\\OD2: \\OS2:'];
}

function formatPupillaryDistance(measurements?: PatientMeasurements, design?: any): string[] {
  const lensType = getLensType(design);
  const lines: string[] = [];
  
  if (lensType === 'SV') {
    // Single vision - mono PDs
    const od3 = measurements?.rightMonoPD?.toString() || '';
    const os3 = measurements?.leftMonoPD?.toString() || '';
    lines.push(`\\FAR:\\OD3:${od3} \\OS3:${os3} `);
    lines.push('\\NEAR:\\OD4: \\OS4:');
  } else if (lensType === 'MULTIFOCAL' || lensType === 'PROGRESSIVE') {
    // Multifocal/Progressive - distance and near PDs
    const od3 = measurements?.rightMonoDistancePD?.toString() || '';
    const os3 = measurements?.leftMonoDistancePD?.toString() || '';
    const od4 = measurements?.rightMonoNearPD?.toString() || '';
    const os4 = measurements?.leftMonoNearPD?.toString() || '';
    lines.push(`\\FAR:\\OD3:${od3} \\OS3:${os3} `);
    lines.push(`\\NEAR:\\OD4:${od4} \\OS4:${os4}`);
  } else {
    // Default
    lines.push('\\FAR:\\OD3: \\OS3: ');
    lines.push('\\NEAR:\\OD4: \\OS4:');
  }
  
  return lines;
}

function formatSpecialInstructions(selection: SelectionState, catalog: Catalog): string[] {
  const lines: string[] = [];
  
  const selectedInstructions = selection.specialInstructions || [];
  const selectedValues = selection.specialInstructionValues || {};
  
  // Build TI items in the correct order
  const tiItems: string[] = [];
  
  // Map UI selections to TI items using InstructionCodes sheet
  // ARMAR_AR → \TI:ARMAR AR \SI:ARC (always ARC)
  if (selectedInstructions.includes('ARMAR_AR')) {
    tiItems.push(`\\TI:ARMAR AR \\SI:ARC`);
  }
  
  // RUSH → \TI10:RUSH
  if (selectedInstructions.includes('RUSH')) {
    tiItems.push(`\\TI10:RUSH`);
  }
  
  // SLAB_LENS → \TI4:SLAB LENS \SI4:90
  if (selectedInstructions.includes('SLAB_LENS')) {
    tiItems.push(`\\TI4:SLAB LENS \\SI4:90`);
  }
  
  // ROLL_POLISH → \TI5:ROLL AND POLISH \SI5:POL
  if (selectedInstructions.includes('ROLL_POLISH')) {
    tiItems.push(`\\TI5:ROLL AND POLISH \\SI5:POL`);
  }
  
  // SOLID_TINT → \TI1:SOLID TINT \SI1:{value}
  if (selectedInstructions.includes('SOLID_TINT')) {
    const tintValue = selectedValues['SOLID_TINT'] || '';
    tiItems.push(`\\TI1:SOLID TINT \\SI1:${tintValue}`);
  }
  
  // GRADIENT_TINT → \TI2:GRADIENT TINT \SI2:{value}
  if (selectedInstructions.includes('GRADIENT_TINT')) {
    const tintValue = selectedValues['GRADIENT_TINT'] || '';
    tiItems.push(`\\TI2:GRADIENT TINT \\SI2:${tintValue}`);
  }
  
  // FRESNEL_PRISM → \TI13:FRESNEL PRISM \SI13:{value}
  if (selectedInstructions.includes('FRESNEL_PRISM')) {
    const prismValue = selectedValues['FRESNEL_PRISM'] || '';
    tiItems.push(`\\TI13:FRESNEL PRISM \\SI13:${prismValue}`);
  }
  
  // Add other TI items in numeric order (TI6-TI12) as needed
  for (let i = 6; i <= 12; i++) {
    const tiCode = `TI${i}`;
    if (selectedInstructions.includes(tiCode)) {
      const instruction = catalog.instructionCodes.find(ic => ic.CODE === tiCode);
      if (instruction) {
        let part = `\\TI${i}:${instruction.LABEL}`;
        
        // Add SI token if present
        if (instruction.OUTPUT_TEMPLATE) {
          const siValue = selectedValues[tiCode] || '';
          part += ` \\SI${i}:${siValue}`;
        }
        
        tiItems.push(part);
      }
    }
  }
  
  // Create the inline header with summary (no extra newline after colon)
  const siLine = `\\SPECIAL INSTRUCTIONS:${tiItems.length ? tiItems.join(", ") : ""}`;
  lines.push(siLine);
  
  return lines;
}
