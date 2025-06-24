# Backend Documentation

This document provides an overview of the backend architecture, focusing on the database schema and data models.

## Overview

The backend uses [Prisma](https://www.prisma.io/) as its Object-Relational Mapper (ORM) to interact with the PostgreSQL database hosted on [Supabase](https://supabase.com/).

## Schema

The database schema is defined in the `schema.prisma` file. It contains a single model:

-   **UseCase**: Represents a single AI use case and all its associated data points, from the initial idea to the final scoring.

### Running Migrations

When you make changes to the `schema.prisma` file, you need to run a migration to apply those changes to the database.

Use the following command to create a new migration:

```bash
npx prisma migrate dev --name <migration-name>
```

This will generate a new SQL migration file and apply it to the database. 