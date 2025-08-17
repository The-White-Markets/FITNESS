# Overview

FitTrack Pro is a full-stack workout tracking application built with React, Express, and PostgreSQL. The application allows users to manage structured workout routines with detailed exercise tracking, progression monitoring, and performance analytics. It features a modern, responsive interface with comprehensive exercise data including sets, reps, RPE (Rate of Perceived Exertion), progression rules, and instructional video links.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **React 18** with TypeScript for the user interface
- **Vite** for fast development and optimized production builds
- **Wouter** for lightweight client-side routing
- **TanStack Query** for server state management and caching
- **Tailwind CSS** with custom CSS variables for styling
- **shadcn/ui** component library with Radix UI primitives
- **Component Structure**: Modular components organized in `/client/src/components/` with reusable UI components in `/client/src/components/ui/`

## Backend Architecture
- **Express.js** server with TypeScript
- **RESTful API** design with structured route handlers in `/server/routes.ts`
- **Memory Storage**: In-memory data storage implementation with interface-based design for easy database migration
- **Middleware**: Request logging, JSON parsing, and error handling
- **Development Integration**: Vite middleware integration for seamless development experience

## Data Layer
- **Drizzle ORM** with PostgreSQL dialect for database operations
- **Schema Definition**: Shared schema in `/shared/schema.ts` using Drizzle and Zod for validation
- **Type Safety**: Full TypeScript integration with inferred types from database schema
- **Database Structure**:
  - `workout_days` table: Stores workout day information (day number, title, focus)
  - `exercises` table: Stores exercise details with foreign key to workout days
  - JSON fields for tracking completed sets and progression data

## State Management
- **TanStack Query**: Server state management with automatic caching and synchronization
- **React Hooks**: Local component state management
- **Form Handling**: React Hook Form integration with Zod validation

## UI/UX Design System
- **Design Tokens**: CSS custom properties for consistent theming
- **Component Variants**: Class Variance Authority for component styling variants
- **Responsive Design**: Mobile-first approach with Tailwind breakpoints
- **Accessibility**: ARIA labels and keyboard navigation support

## Development Workflow
- **TypeScript**: Strict type checking across frontend, backend, and shared code
- **Path Aliases**: Configured for clean imports (`@/`, `@shared/`)
- **Hot Reload**: Vite HMR for fast development iteration
- **Error Handling**: Comprehensive error boundaries and API error handling

# External Dependencies

## Database
- **Neon Database**: Serverless PostgreSQL with `@neondatabase/serverless` driver
- **Drizzle Kit**: Database migration and schema management tool

## UI Framework
- **Radix UI**: Headless component primitives for accessibility and behavior
- **Tailwind CSS**: Utility-first CSS framework with PostCSS processing
- **Lucide React**: Icon library for consistent iconography

## Development Tools
- **Vite**: Build tool with React plugin and development server
- **TypeScript**: Static type checking and enhanced developer experience
- **ESBuild**: Fast bundling for production builds

## Form and Validation
- **React Hook Form**: Performant form library with minimal re-renders
- **Zod**: Schema validation for type-safe data handling
- **Drizzle-Zod**: Integration between Drizzle ORM and Zod validation

## Styling and Animation
- **Class Variance Authority**: Component variant management
- **CLSX/Tailwind Merge**: Conditional class name utilities
- **Embla Carousel**: Touch-friendly carousel component

## Date and Utility Libraries
- **date-fns**: Date manipulation and formatting
- **nanoid**: Unique ID generation for development logging