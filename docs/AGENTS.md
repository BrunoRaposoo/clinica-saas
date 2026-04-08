# AGENTS.md - Documentação

## Escopo

Este arquivo define as regras para a documentação do projeto.

## Estrutura

```
docs/
├── specs/              # Especificações de features (SPEC-XXX.md)
├── *.md                # Documentos gerais (ARCHITECTURE.md, DOMAIN.md, etc)
└── AGENTS.md           # Este arquivo
```

## Regras

### Specs
- Nomear como `001-nome-da-feature.md`, `002-outra-feature.md`
- Formato: Markdown
- Incluir: contexto, objetivo, escopo, requisitos, model, contratos, critérios
- Versionar no rodapé (1.0.0, data, descrição)

### Documentação Geral
- Arquivos em kebab-case: `architecture.md`, `domain-model.md`
- Conteúdo: visão geral, decisões técnicas, guias
- Manter atualizado com mudanças relevantes

### Conteúdo
- Em português (preferencialmente) ou inglês consistente
- Código em blocos com syntax highlighting
- Diagramas em texto (Mermaid) ou imagem (se necessário)

## Relacionamento

- Specs guiam implementação de features
- AGENTS.md global herda regras daqui