# Technical Design Document

## 1. Introduction

This document outlines the technical design and implementation details of the No Man's Sky Technology Layout Optimizer AI (Web UI). This tool is a web-based application that allows users to optimize their technology layouts in the game No Man's Sky.

## 2. Frontend

### 2.1. Project Structure

The project is organized into the following directories:

*   `public`: Contains the static assets of the application, such as `index.html`, images, and fonts.
*   `src`: Contains the source code of the application.
    *   `assets`: Contains the assets that are imported into the application, such as CSS files and images.
    *   `components`: Contains the React components of the application.
    *   `hooks`: Contains the custom React hooks of the application.
    *   `store`: Contains the Zustand store of the application.
    *   `types`: Contains the TypeScript types of the application.
    *   `utils`: Contains the utility functions of the application.

### 2.2. Components

The application is composed of the following main components:

*   `App`: The root component of the application.
*   `Grid`: The component that renders the technology grid.
*   `Technology`: The component that represents a single technology on the grid.
*   `Toolbar`: The component that contains the controls for the application, such as the "Optimize" button.

### 2.3. State Management

The application uses Zustand for state management. The store is organized into the following slices:

*   `grid`: Contains the state of the technology grid.
*   `technologies`: Contains the state of the available technologies.
*   `ui`: Contains the state of the user interface, such as the current theme.

## 3. Backend

The backend is a Python-based service that provides the optimization logic. It is built with Flask and uses the following libraries:

*   `numpy`: For numerical operations.
*   `tensorflow`: For machine learning.
*   `simanneal`: For simulated annealing.

### 3.1. API

The backend exposes a single API endpoint:

*   `POST /api/optimize`: Accepts a JSON payload with the user's technology layout and returns a JSON payload with the optimized layout.

## 4. Deployment

The application is deployed on Heroku. The frontend is deployed as a static website and the backend is deployed as a separate service.
