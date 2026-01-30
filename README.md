# Complex High-Level Project

A production-ready full-stack application built with React, Express, and PostgreSQL.

## Features

- **Frontend**: React, Vite, Radix UI, Tailwind CSS
- **Backend**: Express, TypeScript, Passport.js (Local Auth)
- **Database**: PostgreSQL with Drizzle ORM
- **Type Safety**: Full-stack type safety with Zod and TypeScript

## Prerequisites

- Node.js (v20+)

## Quick Start (Windows)
Double-click `setup_and_run.bat` to automatically:
1. Install dependencies
2. Setup and seed the database
3. Build the application
4. Start the production server

## Manual Setup


1.  **Clone the repository**:
    ```bash
    git clone <repository-url>
    cd project-folder
    ```

2.  **Install dependencies**:
    ```bash
    npm install
    ```

3.  **Database Setup**:
    Initialize the local SQLite database:
    ```bash
    npm run db:push
    ```

4.  **Seed Data**:
    Initialize the database with a user and sample data:
    ```bash
    npm run seed
    ```
    > **Default Login**:
    > Username: `admin`
    > Password: `admin123`

## Development

Start the development server:
```bash
npm run dev
```

## Production Build

Build the project for production:
```bash
npm run build
npm start
```
