# Data Ingestion Plan

## Overview

The Optical Order App uses a **dual ingestion strategy** to handle Excel workbook data:

1. **Build-time Compiler**: Converts Excel workbook to JSON during CI/CD
2. **Runtime Local Upload**: Admin-only browser-based parsing for temporary use

Both approaches ensure **zero server costs** and **complete data privacy**.

## Build-Time Compiler

### Overview
The build-time compiler runs as part of the GitHub Actions CI/CD pipeline, converting the Excel workbook into a normalized JSON structure that's embedded in the static build.

### Process Flow
```
Excel Workbook → GitHub Actions → Validation → JSON Conversion → Static Build → GitHub Pages
```

### Implementation Details

#### Step 1: Excel Validation
```python
# Validation checks performed during build
def validate_workbook(file_path):
    # Check file exists and is accessible
    # Verify all required tabs are present
    # Validate column structure in each tab
    # Check data types and enum values
    # Verify foreign key relationships
    # Report validation errors
```

#### Step 2: Tab-to-JSON Mapping
Each Excel tab is mapped to a specific JSON structure:

**Frames Tab**
```json
{
  "frames": [
    {
      "id": "FRAME001",
      "name": "Classic Round",
      "brand": "OpticalCo",
      "style": "round",
      "material": "metal",
      "available": true,
      "rimless": false
    }
  ]
}
```

**Materials Tab**
```json
{
  "materials": [
    {
      "id": "MAT001",
      "name": "CR-39",
      "type": "plastic",
      "index": 1.498,
      "density": "low",
      "abbe": 58
    }
  ]
}
```

**Treatments Tab**
```json
{
  "treatments": [
    {
      "id": "TREAT001",
      "name": "Anti-Reflective",
      "type": "coating",
      "layers": 7,
      "compatibility": ["CR-39", "Polycarbonate"]
    }
  ]
}
```

#### Step 3: Schema Validation
```python
# Schema validation rules
REQUIRED_TABS = [
    "README", "Materials", "Treatments", "Designs", 
    "AddPowerRules", "Availability", "Tints", 
    "InstructionCodes", "TintCompatibility", "Frames"
]

TAB_SCHEMAS = {
    "Frames": {
        "required_columns": ["id", "name", "brand", "available"],
        "data_types": {"id": "string", "available": "boolean"}
    },
    "Materials": {
        "required_columns": ["id", "name", "type", "index"],
        "data_types": {"index": "float", "abbe": "integer"}
    }
    # ... additional schemas
}
```

#### Step 4: Output Generation
The compiler generates a single `catalog.json` file:

```json
{
  "metadata": {
    "version": "2.0",
    "lastUpdated": "2025-01-22T10:00:00Z",
    "sourceFile": "Optical_Normalized_Catalog_FULL_v2.xlsx",
    "validationStatus": "valid",
    "buildId": "build-12345",
    "tabCount": 10,
    "totalRecords": 15420
  },
  "frames": [...],
  "materials": [...],
  "treatments": [...],
  "designs": [...],
  "addPowerRules": [...],
  "availability": [...],
  "tints": [...],
  "instructionCodes": [...],
  "tintCompatibility": [...]
}
```

### Failure Reporting
When validation fails, the build process reports detailed errors:

```markdown
## Excel Validation Failed

### Missing Required Tabs
- ❌ "AddPowerRules" tab not found
- ❌ "TintCompatibility" tab not found

### Schema Violations
- ❌ Frames tab: Missing required column "available"
- ❌ Materials tab: Invalid data type for "index" column

### Data Integrity Issues
- ❌ Foreign key violation: Frame "FRAME999" references non-existent material
- ❌ Enum violation: Treatment type "InvalidCoating" not in allowed values

### Action Required
Please fix the Excel workbook and re-run the build.
```

## Runtime Local Upload

### Overview
The runtime local upload feature allows administrators to temporarily use an updated Excel workbook without triggering a full build and deployment.

### Security Model
- **Local Processing**: Files are parsed entirely in the browser
- **No Upload**: Data never leaves the user's machine
- **Temporary Use**: Data exists only for the current browser session
- **Admin Only**: Feature requires admin privileges

### Implementation Details

#### File Input Component
```typescript
interface LocalUploadProps {
  onDataLoaded: (catalog: CatalogData) => void;
  onError: (error: ValidationError) => void;
  isAdmin: boolean;
}
```

#### Browser-Based Parsing
```typescript
// Uses SheetJS or similar library for browser Excel parsing
async function parseExcelInBrowser(file: File): Promise<CatalogData> {
  const workbook = await readExcelFile(file);
  
  // Validate workbook structure
  const validation = validateWorkbookStructure(workbook);
  if (!validation.isValid) {
    throw new ValidationError(validation.errors);
  }
  
  // Convert to normalized format
  return convertWorkbookToCatalog(workbook);
}
```

#### Data Flow
```
User Upload → Browser Parse → Validation → Memory Storage → UI Update
```

### User Interface

#### Admin Panel
```typescript
interface AdminPanel {
  // Upload new Excel workbook
  uploadWorkbook: (file: File) => Promise<void>;
  
  // Show current catalog version
  showCatalogVersion: () => CatalogMetadata;
  
  // Switch between embedded and local data
  switchDataSource: (source: 'embedded' | 'local') => void;
  
  // Clear local data
  clearLocalData: () => void;
}
```

#### Upload Workflow
1. **File Selection**: Admin selects Excel file from local system
2. **Validation**: Browser validates file format and structure
3. **Parsing**: File is parsed in browser memory
4. **Conversion**: Data is converted to normalized format
5. **Storage**: Data is stored in browser memory (not persisted)
6. **UI Update**: Application switches to use local data

### Error Handling

#### Validation Errors
```typescript
interface ValidationError {
  type: 'schema' | 'data' | 'format';
  message: string;
  details: {
    tab?: string;
    column?: string;
    row?: number;
    expected?: any;
    actual?: any;
  };
}
```

#### User Feedback
- **Success**: "Workbook loaded successfully. Using local data."
- **Warning**: "Some validation warnings found. Review before proceeding."
- **Error**: "Failed to load workbook. Check file format and structure."

## Data Schema

### Core Data Types

#### Frame
```typescript
interface Frame {
  id: string;
  name: string;
  brand: string;
  style: 'round' | 'square' | 'rectangular' | 'cat-eye' | 'aviator';
  material: 'metal' | 'plastic' | 'titanium' | 'wood';
  available: boolean;
  rimless: boolean;
  size: {
    width: number;
    height: number;
    bridge: number;
  };
}
```

#### Material
```typescript
interface Material {
  id: string;
  name: string;
  type: 'plastic' | 'glass' | 'polycarbonate' | 'high-index';
  index: number; // Refractive index
  density: 'low' | 'medium' | 'high';
  abbe: number; // Abbe number
  impactResistant: boolean;
}
```

#### Treatment
```typescript
interface Treatment {
  id: string;
  name: string;
  type: 'coating' | 'tint' | 'polarized' | 'photochromic';
  layers: number;
  compatibility: string[]; // Material IDs
  properties: {
    uvProtection: boolean;
    scratchResistant: boolean;
    antiReflective: boolean;
  };
}
```

### Relationship Mapping

#### Foreign Key Relationships
```typescript
interface Relationships {
  // Frame -> Material compatibility
  frameMaterials: Record<string, string[]>;
  
  // Material -> Treatment compatibility
  materialTreatments: Record<string, string[]>;
  
  // Design -> Material restrictions
  designMaterials: Record<string, string[]>;
  
  // Tint -> Tint compatibility
  tintCompatibility: Record<string, string[]>;
}
```

## Performance Considerations

### Build-Time Optimizations
- **Incremental Processing**: Only process changed tabs
- **Parallel Processing**: Process multiple tabs simultaneously
- **Memory Management**: Stream large datasets
- **Caching**: Cache validation results

### Runtime Optimizations
- **Lazy Loading**: Load catalog sections on demand
- **Indexing**: Pre-build search indexes
- **Compression**: Compress JSON data
- **Caching**: Cache parsed data in memory

### Size Limitations
- **GitHub Pages**: 1GB repository limit
- **Browser Memory**: ~50MB for catalog data
- **File Upload**: ~100MB Excel file limit
- **Build Time**: < 10 minutes for CI/CD

## Error Recovery

### Build-Time Failures
1. **Validation Errors**: Fix Excel file and re-commit
2. **Schema Changes**: Update validation rules
3. **Build Timeouts**: Optimize processing pipeline
4. **Memory Issues**: Stream large datasets

### Runtime Failures
1. **File Format Errors**: Provide clear error messages
2. **Memory Issues**: Implement data streaming
3. **Browser Compatibility**: Fallback to embedded data
4. **Network Issues**: Work offline with local data

## Monitoring and Maintenance

### Build Monitoring
- **Validation Success Rate**: Track validation failures
- **Build Time**: Monitor processing performance
- **Data Quality**: Track schema violations
- **Error Patterns**: Identify common issues

### Runtime Monitoring
- **Upload Success Rate**: Track local upload failures
- **Memory Usage**: Monitor browser memory consumption
- **User Feedback**: Collect error reports
- **Performance Metrics**: Track parsing speed

## Future Enhancements

### Potential Improvements
- **Incremental Updates**: Update only changed data
- **Data Versioning**: Track catalog versions
- **Advanced Validation**: More sophisticated business rules
- **Performance Optimization**: Better compression and caching

### Scalability Considerations
- **Large Datasets**: Handle workbooks with 100k+ records
- **Complex Relationships**: Optimize relationship lookups
- **Real-time Updates**: Consider WebSocket updates
- **Offline Support**: Progressive Web App features
