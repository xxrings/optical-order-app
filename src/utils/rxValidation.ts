import { RxData } from '../types/catalog';

export interface RxValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  requiresAcknowledgment: boolean;
}

export class RxValidator {
  static validateRx(rxData: RxData): RxValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    let requiresAcknowledgment = false;

    // Validate each field
    this.validateSphere(rxData.rightSphere, 'Right', errors, warnings, () => requiresAcknowledgment = true);
    this.validateSphere(rxData.leftSphere, 'Left', errors, warnings, () => requiresAcknowledgment = true);
    
    this.validateCylinder(rxData.rightCylinder, 'Right', errors, warnings, () => requiresAcknowledgment = true);
    this.validateCylinder(rxData.leftCylinder, 'Left', errors, warnings, () => requiresAcknowledgment = true);
    
    this.validateAxis(rxData.rightAxis, 'Right', errors, warnings, () => requiresAcknowledgment = true);
    this.validateAxis(rxData.leftAxis, 'Left', errors, warnings, () => requiresAcknowledgment = true);
    
    this.validatePrism(rxData.rightPrismVertical, rxData.rightPrismVerticalDirection, 'Right Vertical', errors, warnings, () => requiresAcknowledgment = true);
    this.validatePrism(rxData.rightPrismHorizontal, rxData.rightPrismHorizontalDirection, 'Right Horizontal', errors, warnings, () => requiresAcknowledgment = true);
    this.validatePrism(rxData.leftPrismVertical, rxData.leftPrismVerticalDirection, 'Left Vertical', errors, warnings, () => requiresAcknowledgment = true);
    this.validatePrism(rxData.leftPrismHorizontal, rxData.leftPrismHorizontalDirection, 'Left Horizontal', errors, warnings, () => requiresAcknowledgment = true);
    
    this.validateAdd(rxData.rightAdd, 'Right', errors, warnings, () => requiresAcknowledgment = true);
    this.validateAdd(rxData.leftAdd, 'Left', errors, warnings, () => requiresAcknowledgment = true);
    
    this.validateBaseCurve(rxData.rightBaseCurve, 'Right', errors, warnings, () => requiresAcknowledgment = true);
    this.validateBaseCurve(rxData.leftBaseCurve, 'Left', errors, warnings, () => requiresAcknowledgment = true);

    // Validate cylinder sign consistency
    this.validateCylinderSignConsistency(rxData, errors, warnings, () => requiresAcknowledgment = true);

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      requiresAcknowledgment
    };
  }

  private static validateSphere(value: number | undefined, eye: string, errors: string[], warnings: string[], setAcknowledgment: () => void): void {
    if (value === undefined) return;
    
    // Check increment
    if (!this.isValidIncrement(value, 0.25)) {
      errors.push(`${eye} Sphere must be in 0.25 increments`);
      return;
    }
    
    // Check range
    if (value < -20.00 || value > 20.00) {
      warnings.push(`${eye} Sphere (${value}) is outside typical range (-20.00 to +20.00). Please verify.`);
      setAcknowledgment();
    }
  }

  private static validateCylinder(value: number | undefined, eye: string, errors: string[], warnings: string[], setAcknowledgment: () => void): void {
    if (value === undefined) return;
    
    // Check increment
    if (!this.isValidIncrement(value, 0.25)) {
      errors.push(`${eye} Cylinder must be in 0.25 increments`);
      return;
    }
    
    // Check range
    if (Math.abs(value) > 10.00) {
      warnings.push(`${eye} Cylinder (${value}) is outside typical range (0.00 to ±10.00). Please verify.`);
      setAcknowledgment();
    }
  }

  private static validateAxis(value: number | undefined, eye: string, errors: string[], warnings: string[], setAcknowledgment: () => void): void {
    if (value === undefined) return;
    
    // Check range
    if (value < 1 || value > 180) {
      warnings.push(`${eye} Axis (${value}) is outside valid range (1-180). Please verify.`);
      setAcknowledgment();
    }
  }

  private static validatePrism(value: number | undefined, direction: string | undefined, prism: string, errors: string[], warnings: string[], setAcknowledgment: () => void): void {
    if (value === undefined) return;
    
    // Check increment
    if (!this.isValidIncrement(value, 0.25)) {
      errors.push(`${prism} Prism must be in 0.25 increments`);
      return;
    }
    
    // Check if positive
    if (value < 0) {
      errors.push(`${prism} Prism must be positive`);
      return;
    }
    
    // Check if direction is selected when prism value is present
    if (value > 0 && !direction) {
      errors.push(`${prism} Prism direction is required when prism value is present`);
    }
  }

  private static validateAdd(value: number | undefined, eye: string, errors: string[], warnings: string[], setAcknowledgment: () => void): void {
    if (value === undefined) return;
    
    // Check increment
    if (!this.isValidIncrement(value, 0.25)) {
      errors.push(`${eye} Add must be in 0.25 increments`);
      return;
    }
    
    // Check if positive
    if (value < 0) {
      errors.push(`${eye} Add must be positive`);
      return;
    }
    
    // Check range
    if (value < 0.75 || value > 4.00) {
      warnings.push(`${eye} Add (${value}) is outside typical range (0.75 to 4.00). Please verify.`);
      setAcknowledgment();
    }
  }

  private static validateBaseCurve(value: number | undefined, eye: string, errors: string[], warnings: string[], setAcknowledgment: () => void): void {
    if (value === undefined) return;
    
    // Check increment
    if (!this.isValidIncrement(value, 0.25)) {
      errors.push(`${eye} Base Curve must be in 0.25 increments`);
      return;
    }
    
    // Check range
    if (value < 0 || value > 9.00) {
      warnings.push(`${eye} Base Curve (${value}) is outside typical range (0.00 to 9.00). Please verify.`);
      setAcknowledgment();
    }
  }

  private static validateCylinderSignConsistency(rxData: RxData, errors: string[], warnings: string[], setAcknowledgment: () => void): void {
    const rightCyl = rxData.rightCylinder;
    const leftCyl = rxData.leftCylinder;
    
    if (rightCyl !== undefined && leftCyl !== undefined) {
      const rightSign = Math.sign(rightCyl);
      const leftSign = Math.sign(leftCyl);
      
      if (rightSign !== 0 && leftSign !== 0 && rightSign !== leftSign) {
        warnings.push('Cylinder signs should be consistent between eyes. Please verify.');
        setAcknowledgment();
      }
    }
  }

  private static isValidIncrement(value: number, increment: number): boolean {
    return Math.abs(value % increment) < 0.001; // Using small epsilon for floating point comparison
  }

  // Helper method to format Rx values for display
  static formatRxValue(value: number | undefined): string {
    if (value === undefined) return '';
    return value.toFixed(2);
  }

  // Helper method to get step value for input fields
  static getStepValue(): number {
    return 0.25;
  }
}
