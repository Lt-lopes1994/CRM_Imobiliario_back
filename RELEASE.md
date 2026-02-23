# Release e SemVer

## SemVer

Formato: `MAJOR.MINOR.PATCH`

- **MAJOR**: quebra de compatibilidade
- **MINOR**: novas features compatveis
- **PATCH**: correcoes de bugs

## Fluxo de release

1. Atualize `develop` com as features do ciclo.
2. Crie branch `release/x.y.z` a partir de `develop`.
3. Rode o comando de release:
   - `yarn release:patch` ou `yarn release:minor` ou `yarn release:major`
4. Revise o `CHANGELOG.md` gerado e a versao no `package.json`.
5. Merge `release/x.y.z` -> `main` e crie tag `vX.Y.Z`.
6. Merge `main` -> `develop`.

## Observacoes

- `standard-version` gera `CHANGELOG.md` e atualiza a versao.
- Use `yarn release` se ja souber a versao correta.
