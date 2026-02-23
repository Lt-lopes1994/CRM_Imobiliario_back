# Instruções do projeto CRM Imobiliário Backend

- Stack obrigatória: NestJS + TypeScript + Yarn.
- Arquitetura por módulo em camadas: `application`, `domain`, `infrastructure`, `presentation`.
- Seguir SOLID: controllers finos, regras de negócio em services/use-cases, persistência isolada.
- ORM padrão: Prisma.
- Rotas versionadas com prefixo global `/v1`.
- Validação global com `ValidationPipe` (whitelist, forbidNonWhitelisted, transform).
- Segurança mínima obrigatória: `helmet`, CORS controlado e throttling.
- Sempre criar DTOs para payloads de entrada/saída nos módulos.
- Evitar lógica de negócio em controllers.
