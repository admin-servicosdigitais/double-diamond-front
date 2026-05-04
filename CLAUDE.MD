# Double Diamond — Frontend

## Visão geral do projeto
Interface web construída com **Next.js 14 App Router** que visualiza e controla o pipeline multi-agente Double Diamond. Organizada por features (agents, dashboard, workflows, health), consome a API REST do backend via TanStack Query e gerencia estado global com Zustand.

## Stack
- **Framework:** Next.js 14.2 (App Router)
- **Linguagem:** TypeScript 5
- **Estilização:** TailwindCSS 3 + tailwindcss-animate
- **Componentes:** shadcn/ui (ver `components.json`)
- **Formulários:** React Hook Form 7 + Zod 4 + @hookform/resolvers
- **Server state:** TanStack Query v5 (React Query)
- **Client state:** Zustand v5
- **Ícones:** Lucide React
- **Notificações:** Sonner
- **Utilitários:** clsx + tailwind-merge + class-variance-authority

## Arquitetura — Feature-based
```
app/
└── (dashboard)/          → Route group com layout compartilhado
    ├── agents/           → Página de gerenciamento de agentes
    ├── dashboard/        → Página principal
    ├── health/           → Status da API
    ├── launchpad/        → Início de workflows
    └── workflows/        → Histórico e acompanhamento

components/
├── layout/               → Header, Sidebar, wrappers de layout
├── providers/            → QueryClientProvider, ThemeProvider, etc.
├── system/               → Componentes de sistema (Loading, Error, etc.)
└── ui/                   → Componentes shadcn/ui (NÃO editar diretamente)

features/
├── agents/components/    → Componentes específicos da feature agents
├── dashboard/components/ → Componentes do dashboard
├── health/components/    → Componentes de health check
└── workflows/components/ → Componentes de workflows

hooks/api/                → Custom hooks de fetch (usam TanStack Query)
services/api/             → Funções de chamada HTTP para o backend
store/                    → Stores Zustand
types/api/                → Tipos TypeScript das respostas da API
lib/workflow/             → Helpers de lógica de workflow
utils/workflow/           → Utilitários puros de workflow
mocks/                    → Mocks para desenvolvimento sem backend
```

## Regras de desenvolvimento

### O que NUNCA fazer
- Não editar arquivos em `components/ui/` — são gerados pelo shadcn/ui
- Não fazer fetch direto com `fetch()` em componentes — usar hooks em `hooks/api/`
- Não usar `useState` para estado que precisa ser compartilhado — usar Zustand
- Não usar `useEffect` para buscar dados — usar TanStack Query
- Não criar tipos duplicados — checar `types/api/` antes de criar novos
- Não alterar `.env`, `.env.example` ou `next.config.mjs` sem task específica
- Não usar `any` em TypeScript — usar tipos explícitos ou `unknown`

### Padrões obrigatórios
- **Novos componentes shadcn:** `npx shadcn@latest add <componente>` (nunca copiar manualmente)
- **Classes CSS:** sempre `cn()` do `lib/utils` para mesclar classes Tailwind
- **Formulários:** sempre React Hook Form + Zod, nunca estado manual
- **Dados do servidor:** sempre TanStack Query (`useQuery`, `useMutation`)
- **Estado global:** sempre Zustand store em `store/`
- **Erros:** usar `Sonner` para toasts de feedback ao usuário

### Onde criar cada coisa
| O que | Onde |
|---|---|
| Nova página | `app/(dashboard)/nova-rota/page.tsx` |
| Componente de feature | `features/<feature>/components/` |
| Componente reutilizável | `components/` (layout, system) |
| Hook de API | `hooks/api/use-<recurso>.ts` |
| Chamada HTTP | `services/api/<recurso>.ts` |
| Tipo de API | `types/api/<recurso>.ts` |
| Store global | `store/<dominio>.store.ts` |

### Convenção de commits (Conventional Commits obrigatório)
```
feat(workflows): adiciona listagem de execuções em andamento
fix(agents): corrige exibição de status quando agente está idle
chore(deps): atualiza tanstack query para 5.1.0
style(dashboard): ajusta espaçamento do card de métricas
refactor(hooks): extrai lógica de polling para hook dedicado
```

## Comandos essenciais
```bash
# Desenvolvimento
npm run dev          # inicia em http://localhost:3000

# Build e verificação
npm run build        # build de produção (deve passar sem erros)
npm run lint         # ESLint — rodar sempre antes do commit

# Adicionar componente shadcn
npx shadcn@latest add <nome-do-componente>

# Verificar tipos
npx tsc --noEmit
```

## Definição de Pronto (DoD) — toda task deve cumprir isso
1. Código implementado seguindo a arquitetura feature-based
2. `npm run lint` sem erros ou warnings
3. `npx tsc --noEmit` sem erros de tipo
4. `npm run build` concluindo com sucesso
5. Componente/página funcionando no browser (`npm run dev`)
6. Commit feito com mensagem Conventional Commits
7. PR aberto via `gh pr create --fill`

## Ao concluir uma task
```bash
# 1. Verificar tipos
npx tsc --noEmit

# 2. Lint
npm run lint

# 3. Build (garante que não quebrou nada)
npm run build

# 4. Commitar
git add -p
git commit -m "feat(escopo): descrição clara do que foi feito"

# 5. Abrir PR
gh pr create --fill --base main
```

## Contexto de integração
- O backend roda em `http://localhost:3333` (desenvolvimento)
- URL base da API configurada via variável de ambiente (ver `.env.example`)
- Em desenvolvimento sem backend: usar mocks em `mocks/`
- O `QueryClientProvider` e demais providers estão em `components/providers/`
- O layout do grupo `(dashboard)` engloba todas as páginas internas
