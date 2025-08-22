# Optical Order App - Project Plan

## Project Overview

The Optical Order App is a web application designed to help opticians create eyeglass orders using structured data from an Excel workbook. The primary goal is to eliminate clerical errors by replacing free-form entry with validated, structured data entry.

## Key Objectives

1. **Error Reduction**: Eliminate clerical errors in eyeglass order creation
2. **Structured Data**: Use validated data from Excel workbook instead of free-form entry
3. **Lab Integration**: Generate lab-ready text files compatible with existing systems
4. **No Patient Data**: System does not handle patient-identifiable information

## Data Source Analysis

### Excel Workbook Structure
The application will reference `Optical_Normalized_Catalog_FULL_v2.xlsx` with the following tabs:

- **README**: Schema notes and documentation
- **Materials**: Lens material definitions and properties
- **Treatments**: Surface treatment definitions
- **Designs**: Lens designs with minimum segment rules and discontinued flags
- **AddPowerRules**: ADD ranges and increment restrictions by (Design × Material × Treatment)
- **Availability**: Valid combinations and rules (rimless, substitutions, lead times)
- **Tints**: Base and specialty tint options
- **InstructionCodes**: Mapping to lab's special-instruction codes
- **TintCompatibility**: Explicit allowed tint combinations
- **Frames**: Frame catalog from Excel source

## Architecture Planning

### Frontend Considerations
- **Framework**: React/Next.js with TypeScript
- **Styling**: Tailwind CSS for modern, responsive design
- **State Management**: React Context or Redux for complex state
- **Form Handling**: React Hook Form with validation
- **UI Components**: Custom components for optical-specific inputs

### Backend Considerations
- **Framework**: Node.js/Express or Python/FastAPI
- **Data Processing**: Excel parsing and validation logic
- **API Design**: RESTful endpoints for order creation and validation
- **File Generation**: Lab text file export functionality

### Data Layer Planning
- **Excel Parsing**: Robust parsing of the normalized catalog workbook
- **Validation Engine**: Rule enforcement based on Excel data
- **Caching**: In-memory or database caching of frequently accessed data
- **Error Handling**: Comprehensive error handling for data inconsistencies

## Development Phases

### Phase 1: Repository Setup & Documentation ✅
- [x] Initialize GitHub repository
- [x] Create README and project documentation
- [x] Set up issue templates and contribution guidelines
- [x] Define project structure and goals

### Phase 2: Data Ingestion Planning
- [ ] Analyze Excel workbook structure in detail
- [ ] Define data models and schemas
- [ ] Plan validation rules and error handling
- [ ] Design data access patterns

### Phase 3: Architecture Design
- [ ] Choose technology stack (frontend/backend)
- [ ] Design API endpoints and data flow
- [ ] Plan user interface and user experience
- [ ] Define testing strategy

### Phase 4: Implementation (Awaiting Approval)
- [ ] Build Excel data ingestion system
- [ ] Create order creation interface
- [ ] Implement validation and rule enforcement
- [ ] Build lab text file export functionality
- [ ] Add comprehensive testing

### Phase 5: Testing & Documentation
- [ ] Unit and integration testing
- [ ] User acceptance testing
- [ ] Performance testing
- [ ] Documentation updates

## Technical Requirements

### Data Validation Rules
- Frame availability and compatibility
- Lens material and treatment combinations
- Design restrictions and minimum segment rules
- ADD power ranges and increments
- Tint compatibility and combinations
- Lead time and availability constraints

### User Interface Requirements
- Intuitive order creation workflow
- Real-time validation feedback
- Clear error messages and suggestions
- Responsive design for various screen sizes
- Accessibility compliance

### Export Requirements
- Lab-compatible text file format
- Consistent with existing system output
- Error-free data transmission
- Audit trail and logging

## Risk Assessment

### Technical Risks
- **Excel Data Complexity**: Complex relationships between tabs
- **Validation Rules**: Complex business logic implementation
- **Performance**: Large dataset handling and real-time validation
- **Integration**: Compatibility with existing lab systems

### Mitigation Strategies
- **Thorough Analysis**: Detailed Excel workbook analysis before implementation
- **Modular Design**: Break down validation rules into manageable components
- **Performance Testing**: Early performance testing and optimization
- **Lab Communication**: Regular communication with lab for format requirements

## Success Criteria

1. **Error Reduction**: Significant reduction in clerical errors
2. **User Adoption**: Opticians find the system intuitive and efficient
3. **Data Accuracy**: 100% accurate lab text file generation
4. **Performance**: Sub-second response times for validation
5. **Reliability**: 99.9% uptime and error-free operation

## Next Steps

1. **Detailed Excel Analysis**: Deep dive into workbook structure and relationships
2. **Technology Stack Decision**: Finalize frontend and backend choices
3. **API Design**: Define comprehensive API specification
4. **UI/UX Design**: Create wireframes and user flow diagrams
5. **Implementation Approval**: Await explicit approval to begin coding

## Timeline Estimate

- **Phase 1**: 1 day ✅
- **Phase 2**: 3-5 days
- **Phase 3**: 5-7 days
- **Phase 4**: 4-6 weeks (implementation)
- **Phase 5**: 1-2 weeks

**Total Estimated Duration**: 6-8 weeks (excluding implementation approval wait time)
