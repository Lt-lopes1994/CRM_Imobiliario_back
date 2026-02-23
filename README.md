# CRM Imobiliário Backend

Backend em NestJS com arquitetura modular, foco em SOLID e ORM Prisma.

## Stack

- NestJS + TypeScript
- Prisma + PostgreSQL
- Yarn
- Husky + lint-staged
- Docker + Docker Compose
- GitHub Actions (CI/CD)
- Git Flow + SemVer

## Scripts principais

- `yarn start:dev`
- `yarn lint`
- `yarn test`
- `yarn build`
- `yarn prisma:generate`
- `yarn prisma:migrate:dev`

## Execução local

1. `yarn install`
2. `cp .env.example .env`
3. `yarn prisma:generate`
4. `yarn prisma:migrate:dev`
5. `yarn start:dev`

## Docker

- Subir API + PostgreSQL: `docker compose up --build`

## Qualidade no commit

- Hook de pre-commit via Husky executa `yarn lint-staged`.

## CI/CD

- CI: `.github/workflows/ci.yml` (lint, test, build)
- CD: `.github/workflows/cd.yml` (build/push da imagem Docker para GHCR)

## Git Flow e SemVer

- Branch principal: `main`
- Branch de desenvolvimento: `develop`
- Feature: `feature/<descricao-curta>`
- Hotfix: `hotfix/<descricao-curta>`
- Release: `release/<versao>`

Versionamento:

- `yarn release:patch`
- `yarn release:minor`
- `yarn release:major`

## Endpoints iniciais

- `GET /v1`
- `GET /v1/health`
- `POST /v1/auth/register`
- `POST /v1/auth/login`
- `GET /v1/auth/profile`
