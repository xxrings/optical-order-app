# Validation Engine Plan

## Overview

The validation engine runs entirely **client-side** and enforces all business rules for optical order creation. It ensures data integrity, compatibility, and compliance with optical industry standards.

## Architecture

### Client-Side Only
- **No Server Dependencies**: All validation runs in the browser
- **Real-time Feedback**: Immediate validation as user makes selections
- **Deterministic Results**: Same validation logic across all browsers
- **Performance Optimized**: Efficient rule processing for sub-second response

### Data Flow
```
User Selection → Validation Engine → Rule Processing → Result → UI Feedback
```

## Core Validation Rules

### Frame Validation

#### Availability Rules
```typescript
interface FrameValidation {
  // Check if frame is available for ordering
  isAvailable: (frameId: string) => boolean;
  
  // Check if frame is discontinued
  isDiscontinued: (frameId: string) => boolean;
  
  // Check if frame has stock
  hasStock: (frameId: string) => boolean;
}
```

#### Compatibility Rules
```typescript
interface FrameCompatibility {
  // Check frame-material compatibility
  isMaterialCompatible: (frameId: string, materialId: string) => boolean;
  
  // Check frame-treatment compatibility
  isTreatmentCompatible: (frameId: string, treatmentId: string) => boolean;
  
  // Check rimless frame restrictions
  isRimlessCompatible: (frameId: string, materialId: string) => boolean;
}
```

### Lens Validation

#### Prescription Rules
```typescript
interface PrescriptionValidation {
  // Sphere power range validation
  validateSphere: (sphere: number, material: string) => ValidationResult;
  
  // Cylinder power range validation
  validateCylinder: (cylinder: number, material: string) => ValidationResult;
  
  // Axis validation (0-180 degrees)
  validateAxis: (axis: number) => ValidationResult;
  
  // ADD power validation
  validateAddPower: (addPower: number, design: string, material: string) => ValidationResult;
}
```

#### Formatting Rules
```typescript
interface FormattingRules {
  // Axis zero-padding (e.g., 090 instead of 90)
  formatAxis: (axis: number) => string;
  
  // Diopter formatting (2 decimal places)
  formatDiopter: (value: number) => string;
  
  // Prism base formatting
  formatPrismBase: (base: string) => string;
}
```

### Material Validation

#### Index Restrictions
```typescript
interface MaterialValidation {
  // Check material availability
  isAvailable: (materialId: string) => boolean;
  
  // Validate refractive index ranges
  validateIndex: (index: number, materialType: string) => ValidationResult;
  
  // Check material-treatment compatibility
  isTreatmentCompatible: (materialId: string, treatmentId: string) => boolean;
}
```

### Treatment Validation

#### Compatibility Rules
```typescript
interface TreatmentValidation {
  // Check treatment-material compatibility
  isMaterialCompatible: (treatmentId: string, materialId: string) => boolean;
  
  // Check treatment-treatment compatibility
  isTreatmentCompatible: (treatmentId: string, otherTreatmentId: string) => boolean;
  
  // Check layer count restrictions
  validateLayerCount: (treatments: string[]) => ValidationResult;
}
```

### Design Validation

#### ADD Power Rules
```typescript
interface DesignValidation {
  // Validate ADD power ranges by design
  validateAddPowerRange: (addPower: number, design: string) => ValidationResult;
  
  // Check design-material compatibility
  isMaterialCompatible: (designId: string, materialId: string) => boolean;
  
  // Validate minimum segment rules
  validateMinSeg: (sphere: number, cylinder: number, design: string) => ValidationResult;
}
```

### Tint Validation

#### Compatibility Rules
```typescript
interface TintValidation {
  // Check tint-tint compatibility
  isTintCompatible: (tintId: string, otherTintId: string) => boolean;
  
  // Check tint-material compatibility
  isMaterialCompatible: (tintId: string, materialId: string) => boolean;
  
  // Validate tint combinations
  validateTintCombination: (tints: string[]) => ValidationResult;
}
```

## Validation Engine Implementation

### Core Engine
```typescript
class ValidationEngine {
  private catalog: CatalogData;
  private cache: ValidationCache;
  
  constructor(catalog: CatalogData) {
    this.catalog = catalog;
    this.cache = new ValidationCache();
  }
  
  // Validate complete order
  validateOrder(order: Order): ValidationResult {
    const results: ValidationResult[] = [];
    
    // Frame validation
    results.push(this.validateFrame(order.frameId));
    
    // Lens validation
    results.push(this.validateLens(order.lensConfig));
    
    // Treatment validation
    results.push(this.validateTreatments(order.treatments));
    
    // Tint validation
    results.push(this.validateTints(order.tints));
    
    // Combination validation
    results.push(this.validateCombinations(order));
    
    return this.aggregateResults(results);
  }
  
  // Individual validation methods
  private validateFrame(frameId: string): ValidationResult { /* ... */ }
  private validateLens(lens: LensConfig): ValidationResult { /* ... */ }
  private validateTreatments(treatments: string[]): ValidationResult { /* ... */ }
  private validateTints(tints: string[]): ValidationResult { /* ... */ }
  private validateCombinations(order: Order): ValidationResult { /* ... */ }
}
```

### Validation Result Structure
```typescript
interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
  suggestions: ValidationSuggestion[];
}

interface ValidationError {
  code: string;
  message: string;
  field: string;
  severity: 'error' | 'critical';
  suggestion?: string;
}

interface ValidationWarning {
  code: string;
  message: string;
  field: string;
  severity: 'warning';
  suggestion?: string;
}

interface ValidationSuggestion {
  code: string;
  message: string;
  field: string;
  alternatives?: string[];
}
```

## Performance Optimizations

### Caching Strategy
```typescript
class ValidationCache {
  private cache = new Map<string, ValidationResult>();
  private maxSize = 1000;
  
  get(key: string): ValidationResult | null {
    return this.cache.get(key) || null;
  }
  
  set(key: string, result: ValidationResult): void {
    if (this.cache.size >= this.maxSize) {
      this.evictOldest();
    }
    this.cache.set(key, result);
  }
  
  private evictOldest(): void {
    const firstKey = this.cache.keys().next().value;
    this.cache.delete(firstKey);
  }
}
```

### Lazy Loading
```typescript
class LazyValidator {
  private loadedRules = new Set<string>();
  
  async loadRule(ruleType: string): Promise<void> {
    if (this.loadedRules.has(ruleType)) return;
    
    // Load rule logic dynamically
    const rule = await import(`./rules/${ruleType}`);
    this.loadedRules.add(ruleType);
  }
}
```

### Indexed Lookups
```typescript
class IndexedCatalog {
  private indexes = new Map<string, Map<string, any>>();
  
  buildIndexes(catalog: CatalogData): void {
    // Build frame-material compatibility index
    this.indexes.set('frameMaterial', this.buildFrameMaterialIndex(catalog));
    
    // Build treatment compatibility index
    this.indexes.set('treatmentCompatibility', this.buildTreatmentIndex(catalog));
    
    // Build other indexes...
  }
  
  getCompatibleMaterials(frameId: string): string[] {
    return this.indexes.get('frameMaterial')?.get(frameId) || [];
  }
}
```

## Deterministic Formatting

### Axis Formatting
```typescript
function formatAxis(axis: number): string {
  // Ensure axis is 0-180 range
  const normalized = ((axis % 180) + 180) % 180;
  
  // Zero-pad to 3 digits
  return normalized.toString().padStart(3, '0');
}

// Examples:
// formatAxis(90) → "090"
// formatAxis(180) → "000"
// formatAxis(270) → "090"
```

### Diopter Formatting
```typescript
function formatDiopter(value: number): string {
  // Round to 2 decimal places
  const rounded = Math.round(value * 100) / 100;
  
  // Format with 2 decimal places
  return rounded.toFixed(2);
}

// Examples:
// formatDiopter(1.5) → "1.50"
// formatDiopter(-2.25) → "-2.25"
// formatDiopter(0) → "0.00"
```

### Prism Base Formatting
```typescript
function formatPrismBase(base: string): string {
  const normalized = base.toLowerCase().trim();
  
  // Standardize prism base notation
  const baseMap: Record<string, string> = {
    'in': 'IN',
    'out': 'OUT',
    'up': 'UP',
    'down': 'DOWN',
    'in/out': 'IN/OUT',
    'up/down': 'UP/DOWN'
  };
  
  return baseMap[normalized] || base.toUpperCase();
}
```

## Error Handling

### Validation Error Types
```typescript
enum ValidationErrorType {
  // Frame errors
  FRAME_NOT_AVAILABLE = 'FRAME_NOT_AVAILABLE',
  FRAME_DISCONTINUED = 'FRAME_DISCONTINUED',
  FRAME_MATERIAL_INCOMPATIBLE = 'FRAME_MATERIAL_INCOMPATIBLE',
  
  // Lens errors
  SPHERE_OUT_OF_RANGE = 'SPHERE_OUT_OF_RANGE',
  CYLINDER_OUT_OF_RANGE = 'CYLINDER_OUT_OF_RANGE',
  AXIS_INVALID = 'AXIS_INVALID',
  ADD_POWER_INVALID = 'ADD_POWER_INVALID',
  
  // Material errors
  MATERIAL_NOT_AVAILABLE = 'MATERIAL_NOT_AVAILABLE',
  MATERIAL_TREATMENT_INCOMPATIBLE = 'MATERIAL_TREATMENT_INCOMPATIBLE',
  
  // Treatment errors
  TREATMENT_INCOMPATIBLE = 'TREATMENT_INCOMPATIBLE',
  TOO_MANY_LAYERS = 'TOO_MANY_LAYERS',
  
  // Tint errors
  TINT_INCOMPATIBLE = 'TINT_INCOMPATIBLE',
  TINT_MATERIAL_INCOMPATIBLE = 'TINT_MATERIAL_INCOMPATIBLE',
  
  // Combination errors
  INVALID_COMBINATION = 'INVALID_COMBINATION',
  BUSINESS_RULE_VIOLATION = 'BUSINESS_RULE_VIOLATION'
}
```

### Error Messages
```typescript
const ERROR_MESSAGES: Record<ValidationErrorType, string> = {
  [ValidationErrorType.FRAME_NOT_AVAILABLE]: 'Selected frame is not available for ordering',
  [ValidationErrorType.SPHERE_OUT_OF_RANGE]: 'Sphere power must be between -20.00 and +20.00',
  [ValidationErrorType.AXIS_INVALID]: 'Axis must be between 0 and 180 degrees',
  [ValidationErrorType.TREATMENT_INCOMPATIBLE]: 'Selected treatments are not compatible',
  // ... more error messages
};
```

## Testing Strategy

### Unit Tests
```typescript
describe('ValidationEngine', () => {
  let engine: ValidationEngine;
  
  beforeEach(() => {
    engine = new ValidationEngine(mockCatalog);
  });
  
  test('validates frame availability', () => {
    const result = engine.validateFrame('FRAME001');
    expect(result.isValid).toBe(true);
  });
  
  test('validates sphere power range', () => {
    const result = engine.validateSphere(25.0, 'CR-39');
    expect(result.isValid).toBe(false);
    expect(result.errors[0].code).toBe('SPHERE_OUT_OF_RANGE');
  });
});
```

### Integration Tests
```typescript
describe('Order Validation', () => {
  test('validates complete order', () => {
    const order = createValidOrder();
    const result = engine.validateOrder(order);
    expect(result.isValid).toBe(true);
  });
  
  test('detects incompatible combinations', () => {
    const order = createIncompatibleOrder();
    const result = engine.validateOrder(order);
    expect(result.isValid).toBe(false);
    expect(result.errors.some(e => e.code === 'INVALID_COMBINATION')).toBe(true);
  });
});
```

## Performance Benchmarks

### Target Performance Metrics
- **Single Field Validation**: < 10ms
- **Complete Order Validation**: < 100ms
- **Memory Usage**: < 50MB for full catalog
- **Cache Hit Rate**: > 90%

### Optimization Techniques
- **Rule Pre-compilation**: Compile validation rules at startup
- **Result Caching**: Cache validation results for repeated checks
- **Lazy Loading**: Load validation rules on demand
- **Indexed Lookups**: Pre-build lookup tables for fast access

## Future Enhancements

### Advanced Features
- **Custom Rule Engine**: Allow custom validation rules
- **Rule Versioning**: Track validation rule changes
- **Performance Monitoring**: Track validation performance
- **Rule Analytics**: Analyze validation patterns

### Scalability Improvements
- **Web Workers**: Run validation in background threads
- **Incremental Validation**: Validate only changed fields
- **Predictive Validation**: Pre-validate likely combinations
- **Offline Validation**: Work without network connection
