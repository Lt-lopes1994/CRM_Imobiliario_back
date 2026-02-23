# Quick Start - CRM Imobiliário Backend

## Pré-requisitos

- Node.js 20+
- Yarn 1.x
- PostgreSQL

## 1) Instalar dependências

```bash
yarn install
```

## 2) Configurar ambiente

```bash
cp .env.example .env
```

Ajuste no `.env`:

- `DATABASE_URL`
- `API_PORT`
- `CORS_ORIGIN`

## 3) Prisma

```bash
yarn prisma:generate
yarn prisma:migrate:dev
```

## 4) Rodar API

```bash
yarn start:dev
```

API disponível em:

- `http://localhost:4000/v1`
- `http://localhost:4000/v1/health`

## 5) Qualidade

```bash
yarn lint
yarn test
yarn build
```

## 6) Husky (pre-commit)

O projeto usa `husky` + `lint-staged`.
No commit, são validados apenas os arquivos alterados (lint/format).

## 7) Docker

```bash
docker compose up --build
```

API disponível em:

- `http://localhost:4000/v1`
- `http://localhost:4000/v1/health`

## 8) CI/CD

- CI: `.github/workflows/ci.yml` (lint + test + build)
- CD: `.github/workflows/cd.yml` (build e push de imagem no GHCR)

## 9) Git Flow e SemVer

- `main` (estavel) e `develop` (integracao)
- `feature/<descricao-curta>` para novas features
- `hotfix/<descricao-curta>` para correcoes urgentes
- `release/<versao>` para corte de versao

Versionamento com SemVer:

- `yarn release:patch`
- `yarn release:minor`
- `yarn release:major`

## Estrutura arquitetural

- `src/modules/*`: módulos por domínio
- `src/infra/prisma`: persistência ORM
- `src/shared`: contratos reutilizáveis (application/domain/presentation)
