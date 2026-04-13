# Double Diamond Frontend

Frontend da plataforma **AI First Ops** para gestão de workflows de agentes de IA com acompanhamento de estágios, outputs e aprovação humana.

---

## Visão geral do produto

O projeto entrega uma interface moderna para operação de workflows orientados por agentes, com foco em:

- visibilidade do progresso por estágio;
- execução e aprovação de etapas;
- consulta de outputs e artefatos gerados;
- monitoramento de saúde do sistema;
- catálogo de agentes disponíveis.

A aplicação foi desenhada para consumir uma API REST e oferecer experiência consistente para times de operação e produto.

---

## Stack

- **Next.js 14** (App Router)
- **React 18** + **TypeScript**
- **Tailwind CSS** + **tailwindcss-animate**
- **shadcn/ui** (base de componentes)
- **TanStack Query** (fetch/cache de dados)
- **Zustand** (estado global de UI)
- **React Hook Form** + **Zod** (formulários e validação)
- **Sonner** (toasts)
- **Lucide React** (ícones)

---

## Estrutura de pastas

```bash
app/                       # rotas, layouts e páginas (App Router)
  (dashboard)/             # área autenticada/operacional principal
components/                # componentes reutilizáveis de UI, layout e sistema
features/                  # módulos por domínio (dashboard, workflows, agents)
hooks/                     # hooks de integração e estado derivado
lib/                       # utilitários e configurações compartilhadas
mocks/                     # dados mock para prototipação/desacoplamento
services/api/              # client HTTP e serviços por recurso da API
store/                     # stores globais (Zustand)
types/api/                 # contratos e tipagens de domínio da API
```

---

## Como configurar `.env`

1. Copie o arquivo de exemplo:

```bash
cp .env.example .env.local
```

2. Defina a URL base da API:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:3333
```

> A variável `NEXT_PUBLIC_API_BASE_URL` é obrigatória para o frontend resolver corretamente os endpoints REST.

---

## Como rodar localmente

```bash
npm install
npm run dev
```

Aplicação disponível em: [http://localhost:3000](http://localhost:3000)

### Scripts úteis

```bash
npm run dev      # desenvolvimento
npm run build    # build de produção
npm run start    # start do build
npm run lint     # lint com Next.js
```

---

## Como apontar para o backend

Você pode trocar o backend alterando apenas a variável `NEXT_PUBLIC_API_BASE_URL` no `.env.local`.

### Exemplos

```env
# Backend local
NEXT_PUBLIC_API_BASE_URL=http://localhost:3333

# Backend remoto (staging)
NEXT_PUBLIC_API_BASE_URL=https://staging-api.seu-dominio.com
```

Após alterar, reinicie o servidor (`npm run dev`) para garantir recarga das variáveis.

---

## Principais rotas

- `/` e `/dashboard` → visão geral operacional
- `/launchpad` → ponto de entrada para ações rápidas
- `/workflows` → listagem de workflows
- `/workflows/new` → criação de novo workflow
- `/workflows/[workflowId]` → detalhe do workflow
- `/workflows/[workflowId]/stages/[stageId]` → detalhe do estágio
- `/workflows/[workflowId]/stages/[stageId]/outputs` → outputs do estágio
- `/workflows/[workflowId]/stages/[stageId]/outputs/[artifactName]` → detalhe do artefato
- `/agents` → catálogo de agentes
- `/agents/[agentId]` → detalhe de agente
- `/health` → status de saúde do sistema

---

## Principais features

- Dashboard com visão resumida dos fluxos
- Criação e acompanhamento de workflows
- Navegação por estágios com stepper/jornada visual
- Ações por estágio (rodar, avançar, aprovar)
- Listagem e inspeção de outputs por estágio
- Visualização/edição de artefatos gerados
- Catálogo e detalhe de agentes
- Tela de health check da plataforma
- Estados de loading/erro/empty state padronizados

---

## Observações sobre integrações com a API

- O client central (`services/api/client.ts`) concentra:
  - URL base via variável de ambiente;
  - serialização JSON;
  - tratamento de erros com mensagens amigáveis por status HTTP;
  - `cache: "no-store"` para evitar dados obsoletos em operações críticas.
- Serviços especializados:
  - `workflows-service.ts`: criação, listagem, detalhe, ações de estágio e artefatos;
  - `agents-service.ts`: listagem e detalhe de agentes;
  - `health-service.ts`: endpoint de saúde.
- O frontend espera respostas JSON e já suporta cenários de lista no formato array simples ou estrutura paginada (`ApiListResponse`).
- Recomenda-se padronizar contratos de erro da API com campo `message` para melhor UX.

---

## Próximos passos sugeridos

1. Implementar autenticação/autorização (ex.: JWT + guards de rota).
2. Adicionar observabilidade (Sentry, tracing e métricas de UX).
3. Cobrir fluxos críticos com testes (unitário, integração e e2e).
4. Evoluir estratégia de cache/revalidação com TanStack Query.
5. Formalizar versionamento de contrato da API (OpenAPI/Swagger).
6. Estruturar pipeline de CI com lint, type-check e build.
7. Definir tema/design tokens avançados (dark mode e acessibilidade).

---

## Licença

Uso interno / proprietário (ajuste conforme a política do produto).
