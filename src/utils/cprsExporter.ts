import { Catalog, SelectionState, RxData, PatientMeasurements } from '../types/catalog';
import { getLensType } from './lensTypeHelper';

export interface CprsOrderData {
  selection: SelectionState;
  catalog: Catalog;
}

export function buildCprsExport(orderData: CprsOrderData): string {
  const { selection, catalog } = orderData;
  
  // Resolve all the data we need
  const frame = catalog.frames.find(f => f.FRAME_ID === selection.selectedFrameId);
  const frameSpecs = catalog.frameSpecsById[selection.selectedFrameId || ''];
  const material = selection.selectedMaterialId ? catalog.materialsById[selection.selectedMaterialId] : undefined;
  const treatment = selection.selectedTreatmentId ? catalog.treatmentsById[selection.selectedTreatmentId] : undefined;
  const design = selection.selectedDesignId ? catalog.designsById[selection.selectedDesignId] : undefined;
  
  // Find availability row
  const availability = findAvailabilityRow(catalog, selection);
  
  // Build the lines array
  const lines: string[] = [];
  
  // Frame section
  lines.push(`\\FRAME:${frame?.NAME || ''}`);
  lines.push(`\\SIZE:${frameSpecs ? `${frameSpecs.LENS_WIDTH}x${frameSpecs.LENS_HEIGHT}` : ''}`);
  lines.push(`\\COLOR:${frame?.COLOR || ''}`);
  lines.push(`\\SKU#:${frame?.FRAME_ID || ''}`);
  lines.push(`\\FRAME STATUS:${frame?.DISCONTINUED === 'Y' ? 'DISCONTINUED' : 'ACTIVE'}`);
  lines.push('');
  lines.push('\\EYEGLASS ORDERING INFORMATION:');
  lines.push('');
  
  // RX section
  const rxEye = getRxEyeText(selection.rxData);
  const rxText = formatRxText(selection.rxData);
  lines.push(`\\RX_EYE:${rxEye} \\RX:${rxText}`);
  lines.push('');
  
  // Lens section
  const lensMaterial = formatLensMaterial(material, treatment, design, availability);
  const lensType = formatLensType(design, availability);
  const segType = formatSegType(design);
  
  lines.push(`\\LENS MATERIAL:${lensMaterial}`);
  lines.push(`\\LENS TYPE:${lensType}`);
  lines.push(`\\SEG TYPE:${segType}`);
  lines.push('');
  
  // Lens1 section (always present, may be blank)
  lines.push('\\LENS MATERIAL1:');
  lines.push('\\LENS TYPE1:');
  lines.push('\\SEG TYPE1:');
  lines.push('');
  
  // Spectacle RX section
  lines.push('\\SPECTACLE RX:');
  const rxLines = formatSpectacleRx(selection.rxData);
  lines.push(...rxLines);
  lines.push('');
  
  // Segment height section
  lines.push('\\SEGMENT HGT:');
  const segHeightLines = formatSegmentHeight(selection.patientMeasurements, design);
  lines.push(...segHeightLines);
  lines.push('');
  
  // Pupillary distance section
  lines.push('\\PUPILLARY DISTANCE:');
  const pdLines = formatPupillaryDistance(selection.patientMeasurements, design);
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
    row.TREATMENT_ID === selectedTreatmentId
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

function getRxEyeText(rxData?: RxData): string {
  if (!rxData) return '';
  
  const hasRightEye = rxData.rightSphere !== undefined || rxData.rightCylinder !== undefined;
  const hasLeftEye = rxData.leftSphere !== undefined || rxData.leftCylinder !== undefined;
  
  if (hasRightEye && hasLeftEye) return 'BOTH';
  if (hasRightEye) return 'RIGHT';
  if (hasLeftEye) return 'LEFT';
  return '';
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
  
  if (material?.NAME_DISPLAY) parts.push(material.NAME_DISPLAY);
  if (treatment?.NAME_DISPLAY) parts.push(treatment.NAME_DISPLAY);
  if (design?.TYPE) parts.push(design.TYPE);
  if (design?.SEG_TYPE) parts.push(design.SEG_TYPE);
  
  let result = parts.join(' ');
  
  // Add inline codes if availability exists
  if (availability) {
    if (availability.OUTPUT_CD) result += ` \\CD:${availability.OUTPUT_CD}`;
    if (availability.OUTPUT_LC) result += ` \\LC:${availability.OUTPUT_LC}`;
    if (availability.OUTPUT_LMD) result += ` \\LMD:${availability.OUTPUT_LMD}`;
  }
  
  return result;
}

function formatLensType(design?: any, availability?: any): string {
  if (!design) return '';
  
  let result = design.TYPE || '';
  
  // Add inline codes
  if (design.OUTPUT_LT) result += ` \\LT:${design.OUTPUT_LT}`;
  if (design.OUTPUT_SG) result += ` \\SG:${design.OUTPUT_SG}`;
  
  return result;
}

function formatSegType(design?: any): string {
  if (!design) return '';
  return design.SEG_TYPE || '';
}

function formatSpectacleRx(rxData?: RxData): string[] {
  const lines: string[] = [];
  
  // Right eye (OD)
  const od1 = formatSphereCylinderAxis(rxData?.rightSphere, rxData?.rightCylinder, rxData?.rightAxis);
  const pr1 = formatPrism(rxData?.rightPrismVertical, rxData?.rightPrismVerticalDirection);
  const pr2 = formatPrism(rxData?.rightPrismHorizontal, rxData?.rightPrismHorizontalDirection);
  const pr3 = ''; // Additional prism field
  const addOd = formatAdd(rxData?.rightAdd);
  const sbcOd = formatBaseCurve(rxData?.rightBaseCurve);
  
  lines.push(`\\OD1:${od1}`);
  lines.push(`\\PR1:${pr1}\\PR2:${pr2}\\PR3:${pr3}\\ADD:${addOd}`);
  lines.push(`\\SBC:${sbcOd}`);
  
  // Left eye (OS)
  const os1 = formatSphereCylinderAxis(rxData?.leftSphere, rxData?.leftCylinder, rxData?.leftAxis);
  const pr4 = formatPrism(rxData?.leftPrismVertical, rxData?.leftPrismVerticalDirection);
  const pr5 = formatPrism(rxData?.leftPrismHorizontal, rxData?.leftPrismHorizontalDirection);
  const pr6 = ''; // Additional prism field
  const addOs = formatAdd(rxData?.leftAdd);
  const sbcOs = formatBaseCurve(rxData?.leftBaseCurve);
  
  lines.push(`\\OS1:${os1}`);
  lines.push(`\\PR4:${pr4}\\PR5:${pr5}\\PR6:${pr6}\\ADD1:${addOs}`);
  lines.push(`\\SBC1:${sbcOs}`);
  
  return lines;
}

function formatSphereCylinderAxis(sphere?: number, cylinder?: number, axis?: number): string {
  const parts: string[] = [];
  if (sphere !== undefined) parts.push(sphere.toFixed(2));
  if (cylinder !== undefined) parts.push(cylinder.toFixed(2));
  if (axis !== undefined) parts.push(axis.toString());
  return parts.join(' ');
}

function formatPrism(value?: number, direction?: string): string {
  if (value === undefined || value === 0) return '';
  if (!direction) return value.toFixed(2);
  
  const directionMap: Record<string, string> = {
    'up': 'U',
    'down': 'D',
    'in': 'I',
    'out': 'O'
  };
  
  return `${value.toFixed(2)}${directionMap[direction] || ''}`;
}

function formatAdd(value?: number): string {
  if (value === undefined) return '';
  return value.toFixed(2);
}

function formatBaseCurve(value?: number): string {
  if (value === undefined) return '';
  return value.toFixed(2);
}

function formatSegmentHeight(measurements?: PatientMeasurements, design?: any): string[] {
  const lensType = getLensType(design);
  
  if (lensType === 'MULTIFOCAL') {
    const od2 = measurements?.rightSegmentHeight?.toFixed(1) || '';
    const os2 = measurements?.leftSegmentHeight?.toFixed(1) || '';
    return [`\\OD2:${od2}\\OS2:${os2}`];
  }
  
  return ['\\OD2:\\OS2:'];
}

function formatPupillaryDistance(measurements?: PatientMeasurements, design?: any): string[] {
  const lensType = getLensType(design);
  const lines: string[] = [];
  
  if (lensType === 'SV') {
    // Single vision - mono PDs
    const od3 = measurements?.rightMonoPD?.toFixed(1) || '';
    const os3 = measurements?.leftMonoPD?.toFixed(1) || '';
    lines.push(`\\FAR:\\OD3:${od3}\\OS3:${os3}`);
    lines.push('\\NEAR:\\OD4:\\OS4:');
  } else if (lensType === 'MULTIFOCAL' || lensType === 'PROGRESSIVE') {
    // Multifocal/Progressive - distance and near PDs
    const od3 = measurements?.rightMonoDistancePD?.toFixed(1) || '';
    const os3 = measurements?.leftMonoDistancePD?.toFixed(1) || '';
    const od4 = measurements?.rightMonoNearPD?.toFixed(1) || '';
    const os4 = measurements?.leftMonoNearPD?.toFixed(1) || '';
    lines.push(`\\FAR:\\OD3:${od3}\\OS3:${os3}`);
    lines.push(`\\NEAR:\\OD4:${od4}\\OS4:${os4}`);
  } else {
    // Default
    lines.push('\\FAR:\\OD3:\\OS3:');
    lines.push('\\NEAR:\\OD4:\\OS4:');
  }
  
  return lines;
}

function formatSpecialInstructions(selection: SelectionState, catalog: Catalog): string[] {
  const lines: string[] = [];
  
  // Always start with the header
  lines.push('\\SPECIAL INSTRUCTIONS:');
  
  const selectedInstructions = selection.specialInstructions || [];
  const selectedValues = selection.specialInstructionValues || {};
  
  if (selectedInstructions.length === 0) {
    return lines; // Just the header, no additional lines
  }
  
  // Build summary line
  const summaryParts: string[] = [];
  
  // Process instructions in TI order (TI1-TI13)
  for (let i = 1; i <= 13; i++) {
    const tiCode = `TI${i}`;
    if (selectedInstructions.includes(tiCode)) {
      const instruction = catalog.instructionCodes.find(ic => ic.CODE === tiCode);
      if (instruction) {
        let part = `\\${tiCode}:${instruction.LABEL}`;
        
        // Add SI token if present
        if (instruction.OUTPUT_TEMPLATE) {
          const siValue = selectedValues[tiCode] || '';
          part += ` \\SI${i === 1 ? '' : i}:${siValue}`;
        }
        
        summaryParts.push(part);
      }
    }
  }
  
  if (summaryParts.length > 0) {
    lines.push(summaryParts.join(', '));
  }
  
  // Build detail lines
  for (let i = 1; i <= 13; i++) {
    const tiCode = `TI${i}`;
    if (selectedInstructions.includes(tiCode)) {
      const instruction = catalog.instructionCodes.find(ic => ic.CODE === tiCode);
      if (instruction) {
        // Add the main TI line
        let detailLine = `\\${tiCode}:${instruction.LABEL}`;
        
        // Add SI token if present
        if (instruction.OUTPUT_TEMPLATE) {
          const siValue = selectedValues[tiCode] || '';
          detailLine += ` \\SI${i === 1 ? '' : i}:${siValue}`;
        }
        
        lines.push(detailLine);
        
        // Add dependent lines based on TI type
        if (tiCode === 'TI1' && selectedValues[tiCode]) {
          // Solid tint - find the tint
          const tintId = selectedValues[tiCode];
          const tint = catalog.tints.find(t => t.TINT_ID === tintId);
          if (tint) {
            lines.push(`\\TINT:${tint.COLOR_NAME.toUpperCase()}, ${tint.PCT}`);
          }
        } else if (tiCode === 'TI2' && selectedValues[tiCode]) {
          // Gradient tint
          const tintId = selectedValues[tiCode];
          const tint = catalog.tints.find(t => t.TINT_ID === tintId);
          if (tint) {
            lines.push(`\\TINT2:${tint.COLOR_NAME.toUpperCase()}, ${tint.PCT}`);
          }
        } else if (tiCode === 'TI13' && selectedValues[tiCode]) {
          // Fresnel prism
          const fresId = selectedValues[tiCode];
          const fresnel = catalog.fresnelOptions.find(f => f.FRES_ID === fresId);
          if (fresnel) {
            lines.push(`\\FRES:${fresnel.VALUE}`);
          }
        }
      }
    }
  }
  
  return lines;
}
