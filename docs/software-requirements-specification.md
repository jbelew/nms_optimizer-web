# Software Requirements Specification

## 1. Introduction

This document specifies the software requirements for the No Man's Sky Technology Layout Optimizer AI (Web UI). This tool is a web-based application that allows users to optimize their technology layouts in the game No Man's Sky.

### 1.1. Purpose

The purpose of this software is to provide a user-friendly interface for the NMS Optimizer, a tool that calculates the optimal placement of technologies to maximize in-game bonuses.

### 1.2. Scope

This document covers the functional and non-functional requirements of the web UI. The backend solver is a separate project and is not covered by this document.

### 1.3. Definitions, Acronyms, and Abbreviations

*   **NMS:** No Man's Sky
*   **UI:** User Interface
*   **AI:** Artificial Intelligence
*   **ML:** Machine Learning

## 2. Overall Description

### 2.1. Product Perspective

The NMS Optimizer Web UI is a single-page web application that interacts with a Python-based backend solver. It provides a graphical interface for users to input their technology layouts and view the optimized results.

### 2.2. Product Features

*   **Grid-based layout editor:** Allows users to place technologies on a grid that represents their in-game inventory.
*   **Technology selection:** Provides a list of available technologies for users to choose from.
*   **Optimization:** Sends the user's layout to the backend solver and displays the optimized layout.
*   **Supercharged slot support:** Allows users to designate slots as "supercharged" for enhanced bonuses.
*   **Pattern-based scoring:** Uses a weighted scoring system to evaluate the effectiveness of different layouts.
*   **Simulated annealing and ML-driven solves:** Employs advanced algorithms to find the best possible layouts.

### 2.3. User Classes and Characteristics

The primary users of this application are players of the game No Man's Sky who want to optimize their technology layouts.

### 2.4. Operating Environment

The application is a web-based tool that runs in any modern web browser. It is designed to be responsive and work on a variety of screen sizes.

### 2.5. Design and Implementation Constraints

*   The frontend is built with React, Zustand, Tailwind CSS, Vite, and Radix UI.
*   The backend is a separate Python-based service.
*   The application must be able to communicate with the backend service to perform optimizations.

## 3. System Features

### 3.1. Functional Requirements

#### 3.1.1. Grid Editor

*   The user shall be able to place technologies on a grid.
*   The user shall be able to remove technologies from the grid.
*   The user shall be able to designate slots as supercharged.

#### 3.1.2. Technology Selection

*   The user shall be able to select from a list of available technologies.
*   The list of technologies shall be searchable and filterable.

#### 3.1.3. Optimization

*   The user shall be able to initiate the optimization process.
*   The application shall send the user's layout to the backend solver.
*   The application shall display the optimized layout returned by the solver.

### 3.2. Non-Functional Requirements

#### 3.2.1. Performance

*   The application shall be responsive and provide a smooth user experience.
*   The optimization process shall be completed in a timely manner.

#### 3.2.2. Usability

*   The application shall be easy to use and understand.
*   The user interface shall be intuitive and visually appealing.

#### 3.2.3. Reliability

*   The application shall be reliable and available to users.
*   The application shall handle errors gracefully.
