# Architecture Design Document

## 1. Introduction

This document outlines the architecture and design of the No Man's Sky Technology Layout Optimizer (Web UI). This tool is a web-based application that allows users to optimize their technology layouts in the game No Man's Sky.

## 2. Architectural Goals

*   **Scalability:** The architecture should be able to handle a large number of users and requests.
*   **Maintainability:** The code should be easy to understand, modify, and extend.
*   **Performance:** The application should be fast and responsive, with compute-heavy operations offloaded to optimized Rust components.
*   **Separation of Concerns:** The frontend and backend services should be decoupled to allow for independent development and deployment.

## 3. System Architecture

The system is composed of three main components:

*   **Frontend:** A single-page web application built with React, Zustand, Tailwind CSS, Vite, and Radix UI.
*   **Backend API:** A Python/Flask service that orchestrates requests, handles API endpoints, and manages data flow.
*   **Optimization Engine:** Rust-based modules that handle compute-intensive operations (simulated annealing, scoring functions).

### 3.1. Frontend Architecture

The frontend is a modern, component-based application that follows the latest best practices in web development. It is responsible for rendering the user interface, handling user input, and communicating with the backend service.

#### 3.1.1. Component Library

The application uses Radix UI for its component library. Radix UI provides a set of accessible, unstyled components that can be easily customized with Tailwind CSS.

#### 3.1.2. State Management

The application uses Zustand for state management. Zustand is a small, fast, and scalable state management library that is easy to use and understand.

#### 3.1.3. Build Tool

The application uses Vite as its build tool. Vite is a fast and modern build tool that provides a great developer experience with Hot Module Replacement (HMR) and optimized production builds.

### 3.2. Backend Architecture

The backend is a Python/Flask service that serves as the main API layer. It is responsible for:
- Receiving layout data from the frontend
- Orchestrating calls to the Rust optimization engine
- Managing API endpoints and request validation
- Returning optimized layouts to the frontend

### 3.3. Optimization Engine (Rust)

The Rust components handle performance-critical operations:
- **Simulated Annealing:** Explores complex layout optimizations to find near-optimal solutions
- **Scoring Functions:** Rapidly calculates pattern-based scores for technology adjacency and bonuses

The Rust engine is compiled and integrated with the Python/Flask backend through native bindings, ensuring maximum performance for compute-intensive calculations.

## 4. Data Flow

1.  The user interacts with the frontend to create or modify a technology layout.
2.  The frontend sends the layout data to the Python/Flask backend service.
3.  The backend API receives the request and validates the input.
4.  The backend delegates compute-heavy operations (scoring, optimization) to the Rust engine.
5.  The Rust engine performs simulated annealing and calculates scores based on game-tested configurations.
6.  The backend API receives the results from the Rust engine and returns the optimized layout to the frontend.
7.  The frontend displays the optimized layout and scoring metrics to the user.

## 5. Deployment

The frontend and backend are containerized using Docker and deployed independently:
- The frontend is served as a static website with optional server-side rendering (SSR) capabilities
- The backend Python/Flask service is deployed as a separate container
- Both components can be scaled independently based on demand

The application supports deployment on multiple platforms including Heroku, Docker-based infrastructure, and cloud container services.
