# Frontend Documentation

This document provides an overview of the frontend architecture for the AI Use Case Refinement Tool.

## Overview

The frontend is built with [Next.js](https://nextjs.org/), a React framework that enables features like server-side rendering and generating static websites. It uses [Tailwind CSS](https://tailwindcss.com/) for styling and [Shadcn/UI](https://ui.shadcn.com/) for the component library.

## File Structure

-   **/src/app**: Contains the main application pages and routing.
    -   **/api**: API routes for backend communication.
    -   **/dashboard-test**: The main pipeline view for tracking use cases.
    -   **page.tsx**: The main form for creating and editing use cases.
-   **/src/components**: Reusable UI components.
-   **/src/lib**: Utility functions.

## Getting Started

To run the frontend development server, use the following command:

```bash
npm run dev
```

This will start the server on `http://localhost:3000`. 