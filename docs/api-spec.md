# API Specification - Client-Only Modules

## Overview

The Optical Order App uses **client-only modules** instead of server endpoints. All data processing, validation, and export functionality runs entirely in the browser, ensuring zero server costs and complete data privacy.

## Module Architecture

### Core Modules
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│  CatalogLoader  │    │    Validator    │    │    Exporter     │
│                 │    │                 │    │                 │
│ • Load JSON     │    │ • Validate      │    │ • Generate      │
│ • Parse Excel   │    │ • Format        │    │ • Export        │
│ • Cache Data    │    │ • Error Handle  │    │ • Download      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## CatalogLoader Module

### Purpose
Handles loading and parsing of catalog data from embedded JSON or local Excel files.

### Interface
```typescript
interface CatalogLoader {
  // Load embedded catalog data
  loadEmbeddedCatalog(): Promise<CatalogData>;
  
  // Parse local Excel file
  parseLocalExcel(file: File): Promise<CatalogData>;
  
  // Get catalog metadata
  getCatalogMetadata(): CatalogMetadata;
  
  // Switch data source
  switchDataSource(source: 'embedded' | 'local'): void;
  
  // Clear local data
  clearLocalData(): void;
}
```

### Methods

#### `loadEmbeddedCatalog()`
**Purpose**: Load catalog data from embedded `catalog.json`

**Input**: None

**Output**: `Promise<CatalogData>`

**Example**:
```typescript
const loader = new CatalogLoader();
const catalog = await loader.loadEmbeddedCatalog();
console.log(`Loaded ${catalog.frames.length} frames`);
```

#### `parseLocalExcel(file: File)`
**Purpose**: Parse Excel workbook in browser memory

**Input**: `File` - Excel workbook file

**Output**: `Promise<CatalogData>`

**Example**:
```typescript
const loader = new CatalogLoader();
const fileInput = document.getElementById('excel-file') as HTMLInputElement;
const file = fileInput.files[0];
const catalog = await loader.parseLocalExcel(file);
```

#### `getCatalogMetadata()`
**Purpose**: Get metadata about current catalog

**Input**: None

**Output**: `CatalogMetadata`

**Example**:
```typescript
const metadata = loader.getCatalogMetadata();
console.log(`Catalog version: ${metadata.version}`);
console.log(`Last updated: ${metadata.lastUpdated}`);
```

### Data Types

#### `CatalogData`
```typescript
interface CatalogData {
  metadata: CatalogMetadata;
  frames: Frame[];
  materials: Material[];
  treatments: Treatment[];
  designs: Design[];
  addPowerRules: AddPowerRule[];
  availability: AvailabilityRule[];
  tints: Tint[];
  instructionCodes: InstructionCode[];
  tintCompatibility: TintCompatibility[];
}
```

#### `CatalogMetadata`
```typescript
interface CatalogMetadata {
  version: string;
  lastUpdated: string;
  sourceFile: string;
  validationStatus: 'valid' | 'invalid' | 'unknown';
  buildId: string;
  tabCount: number;
  totalRecords: number;
}
```

## Validator Module

### Purpose
Validates optical orders against business rules and compatibility constraints.

### Interface
```typescript
interface Validator {
  // Validate complete order
  validateOrder(order: Order): ValidationResult;
  
  // Validate individual components
  validateFrame(frameId: string): ValidationResult;
  validateLens(lens: LensConfig): ValidationResult;
  validateTreatments(treatments: string[]): ValidationResult;
  validateTints(tints: string[]): ValidationResult;
  
  // Format values
  formatAxis(axis: number): string;
  formatDiopter(value: number): string;
  formatPrismBase(base: string): string;
  
  // Get suggestions
  getSuggestions(field: string, value: any): ValidationSuggestion[];
}
```

### Methods

#### `validateOrder(order: Order)`
**Purpose**: Validate complete optical order

**Input**: `Order` - Complete order configuration

**Output**: `ValidationResult`

**Example**:
```typescript
const validator = new Validator(catalog);
const order = {
  frameId: 'FRAME001',
  lensConfig: { /* ... */ },
  treatments: ['TREAT001'],
  tints: ['TINT001']
};
const result = validator.validateOrder(order);
if (!result.isValid) {
  console.log('Validation errors:', result.errors);
}
```

#### `validateFrame(frameId: string)`
**Purpose**: Validate frame selection

**Input**: `string` - Frame ID

**Output**: `ValidationResult`

**Example**:
```typescript
const result = validator.validateFrame('FRAME001');
if (result.isValid) {
  console.log('Frame is valid');
} else {
  console.log('Frame errors:', result.errors);
}
```

#### `formatAxis(axis: number)`
**Purpose**: Format axis value with zero-padding

**Input**: `number` - Axis value (0-180)

**Output**: `string` - Formatted axis (e.g., "090")

**Example**:
```typescript
const formatted = validator.formatAxis(90); // "090"
const formatted2 = validator.formatAxis(180); // "000"
```

### Data Types

#### `Order`
```typescript
interface Order {
  frameId: string;
  lensConfig: LensConfig;
  treatments: string[];
  tints: string[];
  specialInstructions: string[];
}
```

#### `LensConfig`
```typescript
interface LensConfig {
  material: string;
  design: string;
  sphere: number;
  cylinder: number;
  axis: number;
  addPower?: number;
  prism?: PrismConfig;
}
```

#### `ValidationResult`
```typescript
interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
  suggestions: ValidationSuggestion[];
}
```

## Exporter Module

### Purpose
Generates lab-ready text files from validated orders.

### Interface
```typescript
interface Exporter {
  // Generate lab text file
  generateLabText(order: Order): string;
  
  // Download lab text file
  downloadLabText(order: Order, filename?: string): void;
  
  // Preview lab text
  previewLabText(order: Order): string;
  
  // Validate export format
  validateExportFormat(text: string): ValidationResult;
}
```

### Methods

#### `generateLabText(order: Order)`
**Purpose**: Generate lab-ready text content

**Input**: `Order` - Validated order

**Output**: `string` - Lab text content

**Example**:
```typescript
const exporter = new Exporter();
const labText = exporter.generateLabText(order);
console.log('Lab text:', labText);
```

#### `downloadLabText(order: Order, filename?: string)`
**Purpose**: Download lab text file to user's device

**Input**: 
- `Order` - Validated order
- `string` - Optional filename (default: "order.txt")

**Output**: `void` - Triggers file download

**Example**:
```typescript
const exporter = new Exporter();
exporter.downloadLabText(order, 'optical-order-2025-01-22.txt');
```

#### `previewLabText(order: Order)`
**Purpose**: Generate preview of lab text without downloading

**Input**: `Order` - Validated order

**Output**: `string` - Preview text

**Example**:
```typescript
const preview = exporter.previewLabText(order);
document.getElementById('preview').textContent = preview;
```

### Lab Text Format

#### Standard Format
```
ORDER: FRAME001
MATERIAL: CR-39
DESIGN: Single Vision
SPHERE: -2.50
CYLINDER: -1.25
AXIS: 090
TREATMENTS: AR, Scratch
TINTS: None
INSTRUCTIONS: Standard processing
```

#### Custom Format Support
```typescript
interface LabTextFormat {
  template: string;
  placeholders: Record<string, string>;
  validation: ValidationRule[];
}
```

## Module Integration

### Usage Pattern
```typescript
class OpticalOrderApp {
  private catalogLoader: CatalogLoader;
  private validator: Validator;
  private exporter: Exporter;
  
  constructor() {
    this.catalogLoader = new CatalogLoader();
    this.validator = new Validator();
    this.exporter = new Exporter();
  }
  
  async initialize() {
    // Load catalog data
    const catalog = await this.catalogLoader.loadEmbeddedCatalog();
    this.validator.setCatalog(catalog);
  }
  
  async createOrder(orderData: Partial<Order>): Promise<OrderResult> {
    // Validate order
    const order = this.buildOrder(orderData);
    const validation = this.validator.validateOrder(order);
    
    if (!validation.isValid) {
      return { success: false, errors: validation.errors };
    }
    
    // Generate lab text
    const labText = this.exporter.generateLabText(order);
    
    return {
      success: true,
      order,
      labText,
      validation
    };
  }
  
  downloadOrder(order: Order) {
    this.exporter.downloadLabText(order);
  }
}
```

## Error Handling

### Module Errors
```typescript
interface ModuleError {
  module: 'CatalogLoader' | 'Validator' | 'Exporter';
  code: string;
  message: string;
  details?: any;
}
```

### Error Types
```typescript
enum ErrorCode {
  // CatalogLoader errors
  CATALOG_LOAD_FAILED = 'CATALOG_LOAD_FAILED',
  EXCEL_PARSE_ERROR = 'EXCEL_PARSE_ERROR',
  INVALID_FILE_FORMAT = 'INVALID_FILE_FORMAT',
  
  // Validator errors
  VALIDATION_FAILED = 'VALIDATION_FAILED',
  INVALID_ORDER = 'INVALID_ORDER',
  INCOMPATIBLE_COMBINATION = 'INCOMPATIBLE_COMBINATION',
  
  // Exporter errors
  EXPORT_FAILED = 'EXPORT_FAILED',
  INVALID_FORMAT = 'INVALID_FORMAT',
  DOWNLOAD_FAILED = 'DOWNLOAD_FAILED'
}
```

## Performance Considerations

### Caching Strategy
```typescript
interface CacheConfig {
  maxSize: number;
  ttl: number; // Time to live in milliseconds
  strategy: 'lru' | 'fifo';
}
```

### Memory Management
```typescript
interface MemoryConfig {
  maxCatalogSize: number; // MB
  maxValidationCache: number; // entries
  cleanupInterval: number; // milliseconds
}
```

## Testing Interface

### Mock Modules
```typescript
class MockCatalogLoader implements CatalogLoader {
  async loadEmbeddedCatalog(): Promise<CatalogData> {
    return mockCatalogData;
  }
  
  async parseLocalExcel(file: File): Promise<CatalogData> {
    return mockCatalogData;
  }
  
  // ... other methods
}
```

### Test Utilities
```typescript
interface TestUtils {
  createMockOrder(): Order;
  createMockCatalog(): CatalogData;
  createMockValidationResult(): ValidationResult;
}
```

## Future Enhancements

### Advanced Features
- **Plugin System**: Allow custom validation rules
- **Format Templates**: Customizable lab text formats
- **Batch Processing**: Process multiple orders
- **Offline Support**: Work without network connection

### Performance Improvements
- **Web Workers**: Background processing
- **Streaming**: Handle large datasets
- **Compression**: Reduce memory usage
- **Lazy Loading**: Load modules on demand
