# dxspec

Fonte da verdade de engenharia do Aqua360, no padrão SDD.

| Arquivo | Papel |
|---------|-------|
| `STATE.md` | Board das frentes de trabalho. Roteador fino, carregado pelo hook `SessionStart`. |
| `journal.md` | Ledger cronológico append-only do projeto. Uma entrada curta por handoff. |
| `specs/NNNN-<nome>/` | Uma pasta por feature: `spec.md`, `tasks.md`, `STATE.md` e `journal/`. |

Aqui é onde o projeto se constrói: contratos, decisões e memória entre sessões. Documentação de API
publicada ou gerada (Swagger, OpenAPI) não mora aqui, vai em `api-docs/` ou sai do build.

O board é um snapshot e pode ser podado. O `journal.md` acumula e nunca é reescrito: correção do que
já foi registrado vira entrada nova no fim.
