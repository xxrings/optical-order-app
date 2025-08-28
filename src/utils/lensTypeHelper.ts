import { DesignRow } from '../types/catalog';

export type LensType = 'SV' | 'MULTIFOCAL' | 'PROGRESSIVE';

export interface RequiredMeasurements {
  lensType: LensType;
  requiredFields: string[];
  optionalFields: string[];
}

export function getLensType(design: DesignRow | undefined): LensType {
  if (!design) return 'SV';
  
  const category = design.CATEGORY?.toUpperCase() || '';
  const type = design.TYPE?.toUpperCase() || '';
  
  // Check for progressive indicators
  if (category.includes('PROGRESSIVE') || type.includes('PROGRESSIVE') || 
      category.includes('FREE FORM') || type.includes('FREE FORM')) {
    return 'PROGRESSIVE';
  }
  
  // Check for multifocal indicators
  if (category.includes('MULTIFOCAL') || type.includes('MULTIFOCAL') ||
      category.includes('BIFOCAL') || type.includes('BIFOCAL') ||
      category.includes('TRIFOCAL') || type.includes('TRIFOCAL') ||
      design.SEG_TYPE) {
    return 'MULTIFOCAL';
  }
  
  // Default to SV (Single Vision)
  return 'SV';
}

export function getRequiredMeasurements(lensType: LensType): RequiredMeasurements {
  switch (lensType) {
    case 'SV':
      return {
        lensType: 'SV',
        requiredFields: ['rightMonoPD', 'leftMonoPD'],
        optionalFields: ['rightOCHeight', 'leftOCHeight']
      };
    
    case 'MULTIFOCAL':
      return {
        lensType: 'MULTIFOCAL',
        requiredFields: ['rightMonoDistancePD', 'leftMonoDistancePD', 'rightMonoNearPD', 'leftMonoNearPD', 'rightSegmentHeight', 'leftSegmentHeight'],
        optionalFields: []
      };
    
    case 'PROGRESSIVE':
      return {
        lensType: 'PROGRESSIVE',
        requiredFields: ['rightMonoDistancePD', 'leftMonoDistancePD', 'rightFittingHeight', 'leftFittingHeight'],
        optionalFields: []
      };
    
    default:
      return {
        lensType: 'SV',
        requiredFields: ['rightMonoPD', 'leftMonoPD'],
        optionalFields: ['rightOCHeight', 'leftOCHeight']
      };
  }
}

export function getLensTypeDisplayName(lensType: LensType): string {
  switch (lensType) {
    case 'SV':
      return 'Single Vision';
    case 'MULTIFOCAL':
      return 'Lined Multifocal';
    case 'PROGRESSIVE':
      return 'Progressive';
    default:
      return 'Single Vision';
  }
}
