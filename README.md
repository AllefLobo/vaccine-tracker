# Vaccine Tracker — Vaccine Cold Chain

REST API for monitoring the **vaccine cold chain**, built with **NestJS**,
**TypeScript**, **PostgreSQL** (via Docker/Podman) and **TypeORM**, following
**Hexagonal Architecture (Ports and Adapters)** with **DDD** principles.

> Demo project.

---

## Table of Contents

- [Vaccine Tracker — Vaccine Cold Chain](#vaccine-tracker--vaccine-cold-chain)
  - [Table of Contents](#table-of-contents)
  - [Overview](#overview)
  - [Business Rule](#business-rule)
  - [Architecture](#architecture)
  - [Folder Structure](#folder-structure)
  - [Stack](#stack)
  - [Getting Started](#getting-started)
    - [Prerequisites](#prerequisites)
    - [Steps](#steps)
  - [Endpoints](#endpoints)
    - [API info and health check](#api-info-and-health-check)
    - [Create a vaccine batch](#create-a-vaccine-batch)
    - [Record a temperature reading (telemetry)](#record-a-temperature-reading-telemetry)
  - [API Documentation (Swagger)](#api-documentation-swagger)
  - [Environment Variables](#environment-variables)
  - [Docker \& Deploy (AWS)](#docker--deploy-aws)
    - [Image build (multi-stage)](#image-build-multi-stage)
    - [PostgreSQL](#postgresql)
  - [Logging (AWS CloudWatch)](#logging-aws-cloudwatch)
  - [Tests](#tests)

---

## Overview

The system tracks **vaccine batches** (`VaccineBatch`) along the cold chain.
Each batch records temperature readings and, if any reading exceeds the safety
threshold, the batch is immediately marked as compromised.

## Business Rule

- **Main entity:** `VaccineBatch`
  - `id` (UUID)
  - `type` (e.g. `mRNA-1273`)
  - `status` (`SAFE` | `COMPROMISED`)
  - `temperatures` (array of temperature readings)
- **Golden rule:** if the recorded temperature is **above -15°C**, the batch
  status changes **immediately** to `COMPROMISED`.

This rule lives **only** in the pure domain (`core/domain/`), with no
dependency on NestJS or TypeORM.

## Architecture

**Hexagonal Architecture (Ports and Adapters)**:

```
        ┌──────────────────────────────────────────────┐
        │                  CORE (pure)                  │
        │  domain ───────────► application              │
        │  (entities, enums,   (use cases + ports)      │
        │   value objects)                              │
        └───────▲──────────────────────────▲────────────┘
                │ ports/in                 │ ports/out
     ┌──────────┴──────────┐     ┌─────────┴───────────┐
     │  INFRA (inbound)     │     │  INFRA (outbound)   │
     │  REST Controllers    │     │  TypeORM / AWS S3   │
     └─────────────────────┘     └─────────────────────┘
```

- The **domain and use cases** depend only on **abstractions** (ports).
- The **concrete implementations** (REST, TypeORM, S3) live in the
  infrastructure layer and are wired to the ports in
  `vaccine-tracker.module.ts`.
- **Dependency inversion:** swapping the database or the storage means changing
  only the binding in the module, without touching any business rule.

## Folder Structure

```
src/vaccine-tracker/
├── core/
│   ├── domain/
│   │   ├── vaccine-batch.entity.ts              # Pure entity + recordTemperature()
│   │   ├── vaccine-batch-status.enum.ts         # SAFE | COMPROMISED
│   │   └── temperature-record.value-object.ts   # Immutable value object
│   ├── application/
│   │   ├── ports/
│   │   │   ├── in/                              # Use cases (driving)
│   │   │   │   ├── create-batch.use-case.ts
│   │   │   │   └── record-telemetry.use-case.ts
│   │   │   └── out/                             # Output ports (driven)
│   │   │       ├── vaccine-batch.repository.port.ts
│   │   │       └── document-storage.port.ts
│   │   ├── services/                            # Use case implementations
│   │   │   ├── create-batch.service.ts
│   │   │   └── record-telemetry.service.ts
│   │   └── tokens.ts                            # Symbols for dependency injection
├── infrastructure/
│   ├── inbound/controllers/                     # REST + DTOs
│   │   ├── vaccine-batch.controller.ts
│   │   └── dto/
│   │       ├── create-batch.dto.ts
│   │       ├── record-telemetry.dto.ts
│   │       └── vaccine-batch.response.dto.ts    # Response DTO for Swagger
│   └── outbound/
│       ├── persistence/typeorm/                 # ORM entity + Adapter
│       │   ├── vaccine-batch.orm-entity.ts
│       │   └── vaccine-batch.adapter.ts
│       └── aws/
│           └── s3-storage.adapter.ts            # Mock AWS S3
└── vaccine-tracker.module.ts                    # Wiring ports <-> adapters
```

## Stack

| Layer         | Technology                            |
| ------------- | ------------------------------------- |
| Runtime       | Node.js 22, TypeScript                |
| Framework     | NestJS 12                             |
| ORM           | TypeORM 1.x                           |
| Database      | PostgreSQL 16 (Docker/Podman)         |
| Validation    | class-validator / class-transformer   |
| Documentation | Swagger (@nestjs/swagger) — OpenAPI 3 |
| Lint          | oxlint                                |

## Getting Started

### Prerequisites

- Node.js 22+
- Docker + Docker Compose **or** Podman (`podman compose`)

### Steps

```bash
# 1. Install dependencies
npm install

# 2. Start PostgreSQL
docker compose up -d      # Docker
# or, with Podman:
podman compose up -d

# 3. Configure environment variables
cp .env.example .env

# 4. Run in development mode (watch)
npm run start:dev
```

The app starts at `http://localhost:3000` and the Swagger documentation is
available at `http://localhost:3000/api`.

## Endpoints

### API info and health check

```bash
GET /
GET /health
```

- `/` returns API metadata: `{ "name": "Vaccine Tracker API", "version": "1.0", "docs": "/api" }`
- `/health` returns `{ "status": "ok" }` (used by AWS ECS/EC2 health checks).

### Create a vaccine batch

```bash
POST /batches
Content-Type: application/json
```

```json
{
  "type": "mRNA-1273",
  "initialTemperatures": [-25, -30]
}
```

### Record a temperature reading (telemetry)

```bash
POST /batches/:id/telemetry
Content-Type: application/json
```

```json
{
  "temperature": -10
}
```

> In the example above, `-10 > -15`, so the batch transitions to `COMPROMISED`.

## API Documentation (Swagger)

The API exposes interactive **OpenAPI 3** documentation, generated
automatically with **@nestjs/swagger**:

| Resource                 | URL                              |
| ------------------------ | -------------------------------- |
| Swagger UI (interactive) | `http://localhost:3000/api`      |
| OpenAPI spec (JSON)      | `http://localhost:3000/api-json` |

The documentation is generated from **decorators** and the **compiler plugin**
(`nest-cli.json`), which extracts DTO types using `classValidatorShim` — so the
`class-validator` rules also show up in the docs without manual duplication.

## Environment Variables

| Variable         | Default           | Description                                |
| ---------------- | ----------------- | ------------------------------------------ |
| `PORT`           | `3000`            | HTTP port of the application               |
| `DB_HOST`        | `localhost`       | PostgreSQL host                            |
| `DB_PORT`        | `5432`            | PostgreSQL port                            |
| `DB_USERNAME`    | `postgres`        | Database user                              |
| `DB_PASSWORD`    | `postgres`        | Database password                          |
| `DB_DATABASE`    | `vaccine_tracker` | Database name                              |
| `DB_SYNCHRONIZE` | `false`           | `true` only in dev (auto-syncs the schema) |

## Docker & Deploy (AWS)

### Image build (multi-stage)

```bash
docker build -t vaccine-tracker .
docker run -p 3000:3000 --env-file .env vaccine-tracker

# or, with Podman:
podman build -t vaccine-tracker .
podman run -p 3000:3000 --env-file .env vaccine-tracker
```

The `Dockerfile` uses a **multi-stage build**: it compiles in the first stage
and produces a slim final image with production dependencies only, ready for
**AWS EC2** or **AWS ECS** (Fargate).

### PostgreSQL

```bash
docker compose up -d
# or, with Podman:
podman compose up -d
```

## Logging (AWS CloudWatch)

The application logger (`main.ts`) is configured to emit **structured JSON**
(`new ConsoleLogger({ json: true })`). Each log line is a JSON document with
`level`, `message`, `context`, `timestamp`, etc., which simplifies **ingestion
and querying in AWS CloudWatch Logs** (filters and CloudWatch Insights by
structured fields).

Example output:

```json
{
  "level": "log",
  "pid": 12345,
  "timestamp": 1710000000000,
  "message": "Application running at: http://localhost:3000",
  "context": "Bootstrap"
}
```

## Tests

```bash
# unit
npm run test

# e2e
npm run test:e2e

# coverage
npm run test:cov
```
