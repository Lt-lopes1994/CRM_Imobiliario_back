# Contributing

## Git Flow

- Branch principal: `main` (sempre estavel)
- Branch de desenvolvimento: `develop`
- Feature: `feature/<descricao-curta>`
- Hotfix: `hotfix/<descricao-curta>`
- Release: `release/<versao>`

## Fluxo padrao

1. Crie uma branch a partir de `develop`:
   - `feature/` para novas funcionalidades
   - `bugfix/` para correcao
2. Abra PR para `develop`.
3. Quando fechar um ciclo, abra PR de `develop` -> `main`.
4. Hotfixes saem de `main` e voltam para `main` e `develop`.

## Padrao de commits

Use mensagens de commit no estilo Conventional Commits:

- `feat: adicionar login`
- `fix: corrigir validacao`
- `chore: atualizar deps`
- `docs: atualizar README`

## Qualidade

- `yarn lint`
- `yarn test`
- `yarn build`

Pre-commit executa `yarn lint-staged`.
