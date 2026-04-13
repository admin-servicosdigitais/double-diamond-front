# AI First Ops Frontend

Frontend SaaS premium construído com **Next.js 14**, **TypeScript**, **Tailwind CSS** e base **shadcn/ui** para operar workflows de agentes de IA com aprovação humana por estágio.

## Stack

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- shadcn/ui (base configurada manualmente + `components.json`)
- Lucide React
- Zustand
- TanStack Query
- React Hook Form
- Zod
- Sonner

## Arquitetura

```bash
app/                  # rotas e layouts App Router
components/           # UI e layout reutilizável
features/             # módulos por domínio (dashboard, workflows...)
hooks/                # hooks globais de consumo
lib/                  # utilitários e infra de cliente de query
services/             # cliente API e serviços REST
store/                # estado global com Zustand
types/                # tipagens base da API
mocks/                # fallback isolado para prototipação
```

## Variáveis de ambiente

1. Copie o exemplo:

```bash
cp .env.example .env.local
```

2. Ajuste o endpoint do backend:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:3333
```

## Rodando localmente

```bash
npm install
npm run dev
```

Acesse: `http://localhost:3000`

## Próximos passos sugeridos

- Integrar autenticação e contexto de usuário.
- Implementar listagem real de workflows com filtros.
- Criar página de detalhe do workflow com execução/aprovação por estágio.
- Adicionar editor de artefatos por tipo (markdown/json/texto).
- Incluir testes (unitários e de integração).
