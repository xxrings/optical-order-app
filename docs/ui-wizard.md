# UI Wizard Plan

## Overview

The Optical Order App features a **step-by-step wizard interface** for creating optical orders, with additional **admin functionality** for managing catalog data. The interface is designed for intuitive use by opticians while providing powerful admin tools.

## User Interface Architecture

### Main Application Flow
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frame         │    │   Lens          │    │   Treatments    │
│   Selection     │───►│   Configuration │───►│   & Tints       │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Order         │    │   Export        │    │   Admin         │
│   Summary       │───►│   & Download    │───►│   Panel         │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## Wizard Steps

### Step 1: Frame Selection

#### Interface Components
```typescript
interface FrameSelectionStep {
  // Frame search and filtering
  searchInput: string;
  filters: {
    brand: string[];
    style: string[];
    material: string[];
    priceRange: [number, number];
  };
  
  // Frame display
  frames: Frame[];
  selectedFrame: Frame | null;
  
  // Frame details
  frameDetails: {
    image: string;
    specifications: FrameSpecs;
    compatibility: CompatibilityInfo;
  };
}
```

#### UI Elements
- **Search Bar**: Text search for frame names and brands
- **Filter Panel**: Brand, style, material, price filters
- **Frame Grid**: Visual frame display with images
- **Frame Details**: Specifications and compatibility info
- **Selection Indicator**: Clear visual feedback for selected frame

#### Validation
- Real-time availability checking
- Compatibility warnings for selected materials
- Discontinued frame alerts

### Step 2: Lens Configuration

#### Interface Components
```typescript
interface LensConfigurationStep {
  // Material selection
  materials: Material[];
  selectedMaterial: Material | null;
  
  // Design selection
  designs: Design[];
  selectedDesign: Design | null;
  
  // Prescription inputs
  prescription: {
    sphere: number;
    cylinder: number;
    axis: number;
    addPower?: number;
    prism?: PrismConfig;
  };
  
  // Validation feedback
  validation: ValidationResult;
}
```

#### UI Elements
- **Material Selector**: Dropdown with material options
- **Design Selector**: Dropdown with design options
- **Prescription Form**: Input fields for sphere, cylinder, axis
- **ADD Power Input**: Conditional input for progressive lenses
- **Prism Configuration**: Advanced prism settings
- **Real-time Validation**: Immediate feedback on inputs

#### Validation Features
- Power range validation by material
- Axis range validation (0-180 degrees)
- ADD power validation by design
- Real-time formatting (axis zero-padding)

### Step 3: Treatments & Tints

#### Interface Components
```typescript
interface TreatmentsStep {
  // Available treatments
  treatments: Treatment[];
  selectedTreatments: string[];
  
  // Available tints
  tints: Tint[];
  selectedTints: string[];
  
  // Compatibility matrix
  compatibility: CompatibilityMatrix;
  
  // Special instructions
  specialInstructions: string[];
}
```

#### UI Elements
- **Treatment Checkboxes**: Multi-select treatment options
- **Tint Selector**: Dropdown with tint options
- **Compatibility Display**: Visual compatibility indicators
- **Special Instructions**: Text area for custom instructions
- **Layer Count Display**: Show total treatment layers

#### Validation Features
- Treatment compatibility checking
- Tint combination validation
- Layer count limits
- Material-treatment compatibility

### Step 4: Order Summary

#### Interface Components
```typescript
interface OrderSummaryStep {
  // Complete order details
  order: Order;
  
  // Validation results
  validation: ValidationResult;
  
  // Cost calculation
  pricing: PricingInfo;
  
  // Lab text preview
  labTextPreview: string;
}
```

#### UI Elements
- **Order Summary Card**: Complete order overview
- **Validation Status**: Success/error indicators
- **Pricing Display**: Cost breakdown
- **Lab Text Preview**: Generated lab text preview
- **Edit Buttons**: Quick edit for each section

#### Features
- Complete order validation
- Cost calculation
- Lab text preview
- Edit capabilities

### Step 5: Export & Download

#### Interface Components
```typescript
interface ExportStep {
  // Export options
  exportFormat: 'txt' | 'csv' | 'json';
  filename: string;
  
  // Download actions
  downloadActions: {
    downloadLabText: () => void;
    downloadOrder: () => void;
    copyToClipboard: () => void;
  };
  
  // Export history
  exportHistory: ExportRecord[];
}
```

#### UI Elements
- **Format Selector**: Choose export format
- **Filename Input**: Custom filename
- **Download Button**: Primary download action
- **Copy Button**: Copy to clipboard
- **Export History**: Recent exports

## Admin Panel

### Admin Access
```typescript
interface AdminPanel {
  // Admin authentication
  isAdmin: boolean;
  adminKey: string;
  
  // Admin actions
  actions: {
    uploadWorkbook: (file: File) => Promise<void>;
    showCatalogVersion: () => CatalogMetadata;
    switchDataSource: (source: 'embedded' | 'local') => void;
    clearLocalData: () => void;
  };
}
```

### Admin Actions

#### Upload Workbook (Local)
```typescript
interface LocalUploadAction {
  // File input
  fileInput: HTMLInputElement;
  selectedFile: File | null;
  
  // Upload process
  uploadProcess: {
    isUploading: boolean;
    progress: number;
    status: 'idle' | 'uploading' | 'processing' | 'complete' | 'error';
  };
  
  // Validation results
  validation: ValidationResult;
  
  // Success feedback
  successMessage: string;
}
```

**UI Elements**:
- **File Input**: Drag-and-drop or file picker
- **Upload Progress**: Progress bar and status
- **Validation Display**: Show validation results
- **Success Message**: Confirm successful upload
- **Error Display**: Show validation errors

**Workflow**:
1. Admin clicks "Upload Workbook" button
2. File picker opens for Excel file selection
3. File is validated in browser
4. Progress bar shows processing status
5. Validation results are displayed
6. Success/error message is shown
7. Application switches to use local data

#### Show Catalog Version
```typescript
interface CatalogVersionDisplay {
  // Current catalog info
  currentCatalog: CatalogMetadata;
  
  // Data source info
  dataSource: 'embedded' | 'local';
  
  // Version comparison
  versionComparison: {
    embeddedVersion: string;
    localVersion: string;
    isDifferent: boolean;
  };
}
```

**UI Elements**:
- **Version Card**: Display current catalog version
- **Source Indicator**: Show data source (embedded/local)
- **Last Updated**: Show last update timestamp
- **Record Count**: Show total records
- **Validation Status**: Show validation status

**Features**:
- Display embedded catalog version
- Show local catalog version (if uploaded)
- Compare versions
- Show metadata (build ID, record count)

### Admin Panel UI

#### Admin Toggle
```typescript
interface AdminToggle {
  // Admin mode
  isAdminMode: boolean;
  
  // Admin key input
  adminKey: string;
  
  // Toggle actions
  actions: {
    enterAdminMode: (key: string) => boolean;
    exitAdminMode: () => void;
  };
}
```

**UI Elements**:
- **Admin Button**: Toggle admin mode
- **Key Input**: Enter admin key
- **Admin Indicator**: Show admin status
- **Exit Button**: Exit admin mode

#### Admin Dashboard
```typescript
interface AdminDashboard {
  // Catalog management
  catalogManagement: {
    currentVersion: CatalogMetadata;
    uploadWorkbook: () => void;
    clearLocalData: () => void;
  };
  
  // Data source control
  dataSourceControl: {
    currentSource: 'embedded' | 'local';
    switchSource: (source: 'embedded' | 'local') => void;
  };
  
  // System status
  systemStatus: {
    validationStatus: 'valid' | 'invalid' | 'unknown';
    recordCount: number;
    lastValidation: string;
  };
}
```

## Responsive Design

### Mobile Optimization
```typescript
interface MobileOptimization {
  // Touch-friendly inputs
  touchTargets: {
    minSize: '44px';
    spacing: '8px';
  };
  
  // Simplified navigation
  navigation: {
    stepIndicator: boolean;
    backButton: boolean;
    nextButton: boolean;
  };
  
  // Adaptive layout
  layout: {
    singleColumn: boolean;
    collapsiblePanels: boolean;
    swipeNavigation: boolean;
  };
}
```

### Desktop Enhancement
```typescript
interface DesktopEnhancement {
  // Multi-panel layout
  layout: {
    sidebar: boolean;
    mainContent: boolean;
    previewPanel: boolean;
  };
  
  // Keyboard shortcuts
  shortcuts: {
    nextStep: 'Ctrl+Enter';
    previousStep: 'Ctrl+Backspace';
    saveOrder: 'Ctrl+S';
  };
  
  // Advanced features
  features: {
    dragAndDrop: boolean;
    keyboardNavigation: boolean;
    contextMenus: boolean;
  };
}
```

## Accessibility Features

### WCAG Compliance
```typescript
interface AccessibilityFeatures {
  // Screen reader support
  screenReader: {
    ariaLabels: boolean;
    liveRegions: boolean;
    focusManagement: boolean;
  };
  
  // Keyboard navigation
  keyboard: {
    tabOrder: boolean;
    shortcuts: boolean;
    focusIndicators: boolean;
  };
  
  // Color and contrast
  visual: {
    highContrast: boolean;
    colorBlindFriendly: boolean;
    fontSize: boolean;
  };
}
```

## Error Handling

### User Feedback
```typescript
interface UserFeedback {
  // Error display
  errors: {
    inlineErrors: ValidationError[];
    toastNotifications: ToastMessage[];
    errorBoundary: ErrorBoundary;
  };
  
  // Success feedback
  success: {
    successMessages: string[];
    progressIndicators: boolean;
    completionCelebration: boolean;
  };
  
  // Loading states
  loading: {
    skeletonScreens: boolean;
    progressBars: boolean;
    loadingSpinners: boolean;
  };
}
```

## Performance Optimization

### Lazy Loading
```typescript
interface LazyLoading {
  // Component lazy loading
  components: {
    stepComponents: boolean;
    adminPanel: boolean;
    validationEngine: boolean;
  };
  
  // Data lazy loading
  data: {
    catalogSections: boolean;
    validationRules: boolean;
    exportFormats: boolean;
  };
}
```

### Caching Strategy
```typescript
interface CachingStrategy {
  // UI state caching
  uiState: {
    formData: boolean;
    validationResults: boolean;
    userPreferences: boolean;
  };
  
  // Data caching
  data: {
    catalogData: boolean;
    validationCache: boolean;
    exportTemplates: boolean;
  };
}
```

## Future Enhancements

### Advanced Features
- **Order Templates**: Save and reuse order configurations
- **Batch Processing**: Create multiple orders simultaneously
- **Order History**: Track previous orders
- **Advanced Search**: Full-text search across catalog
- **Custom Validation**: User-defined validation rules

### Integration Features
- **Lab Integration**: Direct integration with lab systems
- **Inventory Sync**: Real-time inventory updates
- **Pricing Integration**: Dynamic pricing from external systems
- **Patient Management**: Integration with patient records (future)
