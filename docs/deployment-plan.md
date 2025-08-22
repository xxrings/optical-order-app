# Deployment Plan - Static Architecture

## Overview

The Optical Order App will be deployed as a **static web application** hosted on GitHub Pages with **zero server costs**. All data processing happens at build-time, and the application runs entirely in the browser.

## Architecture Summary

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   GitHub Pages  │    │  Build Process  │    │   Excel Source  │
│   (Static Host) │◄───│  (GitHub Actions)│◄───│   (Repository)  │
│                 │    │                 │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Client-Side   │    │  catalog.json   │    │  Optical_Normalized_│
│   Application   │    │  (Embedded Data)│    │  Catalog_FULL_v2.xlsx│
│                 │    │                 │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## GitHub Pages Configuration

### Repository Settings
- **Source**: Deploy from branch `main`
- **Folder**: `/ (root)` - serves the entire repository
- **Custom domain**: Optional (can be added later)
- **HTTPS**: Automatically enabled

### Build Output Structure
```
/
├── index.html              # Main application entry point
├── catalog.json            # Build-time generated catalog data
├── assets/                 # Static assets (CSS, JS, images)
│   ├── css/
│   ├── js/
│   └── images/
└── README.md               # Project documentation
```

## Build Process (GitHub Actions)

### Workflow Overview
The build process runs automatically on every push to `main` and includes:

1. **Excel Validation**: Verify workbook structure and data integrity
2. **Data Conversion**: Transform Excel tabs to normalized JSON
3. **Static Build**: Generate the web application
4. **Deployment**: Push to GitHub Pages

### CI/CD Pipeline Steps

#### Step A: Excel Validation
- Check workbook exists and is accessible
- Validate all required tabs are present
- Verify required columns exist in each tab
- Check data types and enum values
- Report validation errors in PR comments

#### Step B: Data Conversion
- Parse each Excel tab using Python/pandas
- Transform data to normalized JSON schema
- Generate `public/catalog.json` with all catalog data
- Include metadata (version, last updated, validation status)

#### Step C: Static Build
- Run frontend build process (Next.js static export)
- Generate optimized static assets
- Create `index.html` and supporting files
- Optimize for GitHub Pages hosting

#### Step D: Deployment
- Commit generated files to `main` branch
- Trigger GitHub Pages deployment
- Verify deployment success
- Update deployment status

## Build-Time Data Processing

### Excel → JSON Conversion
The build process converts the Excel workbook into a single `catalog.json` file:

```json
{
  "metadata": {
    "version": "2.0",
    "lastUpdated": "2025-01-22T10:00:00Z",
    "sourceFile": "Optical_Normalized_Catalog_FULL_v2.xlsx",
    "validationStatus": "valid"
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

### Data Validation Rules
- **Schema Validation**: Ensure all required fields exist
- **Type Validation**: Verify data types match expected formats
- **Reference Validation**: Check foreign key relationships
- **Business Rule Validation**: Verify business logic constraints

## Runtime Architecture

### Client-Side Only
- **No Backend Services**: All processing happens in the browser
- **No Database**: Data is embedded in the static build
- **No Authentication**: Admin features use local file upload
- **No Persistence**: Orders are temporary (session-based)

### Data Access Patterns
- **Catalog Data**: Loaded from embedded `catalog.json`
- **Validation**: Client-side rule engine
- **Export**: Browser-based text file generation
- **Admin Upload**: Local file parsing (no server upload)

## Performance Considerations

### Build-Time Optimizations
- **Data Compression**: Minimize JSON file size
- **Tree Shaking**: Remove unused catalog data
- **Code Splitting**: Load data on demand
- **Caching**: Leverage browser caching for static assets

### Runtime Optimizations
- **Lazy Loading**: Load catalog sections as needed
- **Search Indexing**: Pre-build search indexes
- **Validation Caching**: Cache validation results
- **Memory Management**: Efficient data structures

## Security Model

### Data Protection
- **No Patient Data**: System never handles patient information
- **No Server Storage**: All data stays in browser memory
- **No Network Transfers**: Admin uploads are local-only
- **Static Content**: No server-side code execution

### Admin Features
- **Local File Processing**: Excel files parsed in browser
- **No Upload**: Files never leave the user's machine
- **Temporary Use**: Data exists only for current session
- **Manual Refresh**: Admin must re-upload for updates

## Deployment Workflow

### Development Workflow
1. **Local Development**: Use local Excel file for testing
2. **Feature Development**: Build and test locally
3. **Pull Request**: Submit changes for review
4. **CI Validation**: Automated Excel validation
5. **Manual Review**: Approve data changes
6. **Merge to Main**: Trigger build and deployment

### Production Deployment
1. **Automatic Trigger**: Push to `main` branch
2. **Build Process**: Run GitHub Actions workflow
3. **Data Validation**: Verify Excel data integrity
4. **Static Generation**: Build web application
5. **Pages Deployment**: Deploy to GitHub Pages
6. **Verification**: Confirm deployment success

## Monitoring and Maintenance

### Build Monitoring
- **GitHub Actions**: Monitor build success/failure
- **Validation Reports**: Review Excel data validation
- **Deployment Status**: Track Pages deployment
- **Performance Metrics**: Monitor build times

### Maintenance Tasks
- **Excel Updates**: Replace workbook file in repository
- **Schema Changes**: Update validation rules
- **Performance Tuning**: Optimize build process
- **Security Updates**: Keep dependencies current

## Cost Analysis

### Zero-Cost Components
- **GitHub Pages**: Free hosting for public repositories
- **GitHub Actions**: Free for public repositories (2000 minutes/month)
- **GitHub Storage**: Free for repository files
- **CDN**: GitHub Pages includes global CDN

### Potential Future Costs
- **Custom Domain**: ~$10-15/year (optional)
- **Private Repository**: $4/month (if needed)
- **Additional Actions**: $0.008/minute (if exceeding free tier)

## Success Criteria

### Technical Metrics
- **Build Time**: < 5 minutes for full deployment
- **Bundle Size**: < 2MB total (including catalog data)
- **Load Time**: < 3 seconds initial page load
- **Validation Speed**: < 1 second for order validation

### Operational Metrics
- **Deployment Success Rate**: > 99%
- **Build Reliability**: < 1% failure rate
- **Data Accuracy**: 100% validation pass rate
- **User Experience**: Sub-second response times

## Risk Mitigation

### Technical Risks
- **Excel File Size**: Monitor and optimize large workbooks
- **Build Timeouts**: Optimize GitHub Actions workflow
- **Browser Compatibility**: Test across major browsers
- **Performance Degradation**: Monitor and optimize

### Operational Risks
- **Data Corruption**: Validate Excel data integrity
- **Deployment Failures**: Automated rollback procedures
- **User Adoption**: Intuitive interface design
- **Maintenance Overhead**: Automated validation and testing
