# Optical Order App - Architecture Plan

## System Overview

The Optical Order App will be a web-based application with a modern frontend and robust backend designed to handle complex optical order creation with real-time validation.

## Technology Stack Recommendations

### Frontend Stack
- **Framework**: Next.js 14+ with React 18
- **Language**: TypeScript for type safety
- **Styling**: Tailwind CSS for rapid UI development
- **State Management**: Zustand or React Context for simple state
- **Form Handling**: React Hook Form with Zod validation
- **UI Components**: Headless UI + custom components
- **Build Tool**: Vite or Next.js built-in bundler

### Backend Stack
- **Framework**: Node.js with Express.js OR Python with FastAPI
- **Language**: TypeScript (Node.js) or Python 3.11+
- **Database**: SQLite for development, PostgreSQL for production
- **Excel Processing**: 
  - Node.js: `xlsx` or `exceljs` library
  - Python: `pandas` and `openpyxl`
- **API Documentation**: Swagger/OpenAPI
- **Validation**: Joi (Node.js) or Pydantic (Python)

### Development Tools
- **Package Manager**: npm/yarn (Node.js) or pip/poetry (Python)
- **Testing**: Jest + React Testing Library (frontend), Jest/Supertest (Node.js) or pytest (Python)
- **Linting**: ESLint + Prettier
- **Git Hooks**: Husky + lint-staged
- **CI/CD**: GitHub Actions

## System Architecture

### High-Level Architecture
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │    Backend      │    │   Data Source   │
│   (Next.js)     │◄──►│   (Express/     │◄──►│   (Excel File)  │
│                 │    │    FastAPI)     │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                              │
                              ▼
                       ┌─────────────────┐
                       │   Database      │
                       │   (SQLite/      │
                       │   PostgreSQL)   │
                       └─────────────────┘
```

### Data Flow Architecture
1. **Excel Ingestion**: Backend loads and parses Excel workbook on startup
2. **Data Caching**: Parsed data cached in memory and database
3. **API Endpoints**: Frontend calls backend APIs for data and validation
4. **Real-time Validation**: Backend validates user inputs against cached rules
5. **Order Generation**: Backend generates lab-ready text files

## Component Architecture

### Frontend Components
```
src/
├── components/
│   ├── ui/                    # Reusable UI components
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Select.tsx
│   │   └── Modal.tsx
│   ├── forms/                 # Form-specific components
│   │   ├── FrameSelector.tsx
│   │   ├── LensConfigurator.tsx
│   │   ├── TreatmentSelector.tsx
│   │   └── OrderSummary.tsx
│   └── layout/                # Layout components
│       ├── Header.tsx
│       ├── Sidebar.tsx
│       └── Footer.tsx
├── pages/                     # Next.js pages
│   ├── index.tsx              # Home page
│   ├── order/                 # Order creation pages
│   │   ├── new.tsx
│   │   ├── [id].tsx
│   │   └── summary.tsx
│   └── api/                   # API routes (if using Next.js API)
├── hooks/                     # Custom React hooks
│   ├── useOrderForm.ts
│   ├── useValidation.ts
│   └── useExcelData.ts
├── stores/                    # State management
│   ├── orderStore.ts
│   └── validationStore.ts
├── types/                     # TypeScript type definitions
│   ├── order.ts
│   ├── excel.ts
│   └── api.ts
└── utils/                     # Utility functions
    ├── validation.ts
    ├── formatters.ts
    └── constants.ts
```

### Backend Structure
```
src/
├── controllers/               # Request handlers
│   ├── orderController.ts
│   ├── validationController.ts
│   └── exportController.ts
├── services/                  # Business logic
│   ├── excelService.ts
│   ├── validationService.ts
│   ├── orderService.ts
│   └── exportService.ts
├── models/                    # Data models
│   ├── Order.ts
│   ├── Frame.ts
│   ├── Lens.ts
│   └── Validation.ts
├── middleware/                # Express/FastAPI middleware
│   ├── validation.ts
│   ├── errorHandler.ts
│   └── cors.ts
├── routes/                    # API routes
│   ├── orders.ts
│   ├── validation.ts
│   └── export.ts
├── utils/                     # Utility functions
│   ├── excelParser.ts
│   ├── validators.ts
│   └── formatters.ts
└── config/                    # Configuration
    ├── database.ts
    └── app.ts
```

## Data Models

### Core Entities
```typescript
// Order Entity
interface Order {
  id: string;
  frameId: string;
  lensConfig: LensConfiguration;
  treatments: Treatment[];
  tints: Tint[];
  specialInstructions: string[];
  createdAt: Date;
  updatedAt: Date;
}

// Lens Configuration
interface LensConfiguration {
  material: Material;
  design: Design;
  sphere: number;
  cylinder: number;
  axis: number;
  addPower?: number;
  prism?: PrismConfiguration;
}

// Validation Rules
interface ValidationRule {
  id: string;
  type: 'combination' | 'range' | 'availability';
  conditions: ValidationCondition[];
  message: string;
  severity: 'error' | 'warning';
}
```

## API Design

### RESTful Endpoints
```
GET    /api/frames              # Get available frames
GET    /api/frames/:id          # Get specific frame
GET    /api/materials           # Get lens materials
GET    /api/designs             # Get lens designs
GET    /api/treatments          # Get treatments
GET    /api/tints               # Get tint options

POST   /api/orders              # Create new order
GET    /api/orders/:id          # Get order details
PUT    /api/orders/:id          # Update order
DELETE /api/orders/:id          # Delete order

POST   /api/validate            # Validate order configuration
POST   /api/export              # Export order to lab format

GET    /api/health              # Health check
```

### WebSocket Endpoints (Optional)
```
/ws/validation                 # Real-time validation updates
/ws/order-updates              # Order status updates
```

## Database Schema

### Core Tables
```sql
-- Orders table
CREATE TABLE orders (
  id UUID PRIMARY KEY,
  frame_id VARCHAR(50) NOT NULL,
  lens_config JSONB NOT NULL,
  treatments JSONB,
  tints JSONB,
  special_instructions TEXT[],
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Validation cache table
CREATE TABLE validation_cache (
  id UUID PRIMARY KEY,
  rule_type VARCHAR(50) NOT NULL,
  rule_data JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Excel data cache table
CREATE TABLE excel_cache (
  sheet_name VARCHAR(100) PRIMARY KEY,
  data JSONB NOT NULL,
  last_updated TIMESTAMP DEFAULT NOW()
);
```

## Security Considerations

### Data Protection
- No patient-identifiable data stored
- Input validation and sanitization
- SQL injection prevention
- XSS protection

### Authentication (Future)
- JWT-based authentication
- Role-based access control
- Session management

## Performance Considerations

### Caching Strategy
- Excel data cached in memory and database
- Validation rules cached for quick access
- API response caching for static data

### Optimization
- Lazy loading of large datasets
- Pagination for frame catalogs
- Debounced validation requests
- Efficient Excel parsing

## Deployment Architecture

### Development Environment
- Local development with hot reload
- SQLite database
- Excel file in project directory

### Production Environment
- Docker containers
- PostgreSQL database
- CDN for static assets
- Load balancer for high availability

## Monitoring and Logging

### Application Monitoring
- Error tracking (Sentry)
- Performance monitoring
- User analytics (anonymized)

### Logging
- Request/response logging
- Error logging with stack traces
- Validation rule execution logging
- Export operation logging

## Testing Strategy

### Frontend Testing
- Unit tests for components
- Integration tests for forms
- E2E tests for order flow

### Backend Testing
- Unit tests for services
- Integration tests for APIs
- Excel parsing tests
- Validation rule tests

## Migration Strategy

### Phase 1: MVP
- Basic order creation
- Core validation rules
- Simple export functionality

### Phase 2: Enhancement
- Advanced validation
- Real-time updates
- Performance optimizations

### Phase 3: Scale
- Multi-user support
- Advanced analytics
- Integration with lab systems

## Risk Mitigation

### Technical Risks
- **Excel Complexity**: Thorough analysis and testing
- **Performance**: Early performance testing and optimization
- **Data Integrity**: Comprehensive validation and error handling

### Operational Risks
- **User Adoption**: Intuitive UI/UX design
- **Maintenance**: Clear documentation and modular architecture
- **Scalability**: Cloud-native architecture design
