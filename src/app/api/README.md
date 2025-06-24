# API Documentation

This document provides an overview of the available API endpoints for the AI Use Case Refinement Tool.

## Endpoints

### 1. Write Use Cases

-   **URL**: `/api/write-usecases`
-   **Method**: `POST`
-   **Description**: Creates or updates a use case in the database.
-   **Payload**:

```json
{
  "title": "string",
  "problemStatement": "string",
  "proposedAISolution": "string",
  "currentState": "string",
  "desiredState": "string",
  "primaryStakeholders": ["string"],
  "secondaryStakeholders": ["string"],
  "successCriteria": ["string"],
  "problemValidation": "string",
  "solutionHypothesis": "string",
  "keyAssumptions": ["string"],
  "initialROI": "string",
  "confidenceLevel": "number",
  "operationalImpactScore": "number",
  "productivityImpactScore": "number",
  "revenueImpactScore": "number",
  "implementationComplexity": "number",
  "estimatedTimeline": "string",
  "requiredResources": "string"
}
```

-   **Success Response**:
    -   **Code**: `200 OK`
    -   **Content**: `{ "success": true }`

-   **Error Response**:
    -   **Code**: `500 Internal Server Error`
    -   **Content**: `{ "success": false, "error": "Failed to save use case" }`

### 2. Read Use Cases

-   **URL**: `/api/read-usecases`
-   **Method**: `GET`
-   **Description**: Retrieves all use cases from the database.
-   **Success Response**:
    -   **Code**: `200 OK`
    -   **Content**: An array of use case objects.

-   **Error Response**:
    -   **Code**: `500 Internal Server Error`
    -   **Content**: `{ "success": false, "error": "Failed to fetch use cases" }` 