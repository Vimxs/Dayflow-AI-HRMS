# Dayflow — Rules.md (AI Coding Agent Ground Rules)

> Read this file, `01-Product-Requirements-Document.md`, `02-Technical-Architecture-Document.md`, `03-Security-And-Access-Document.md`, `04-Frontend-Specification-Document.md`, and `05-Feature-Ticket-List.md` fully before writing any code. If `memory.md` exists, read it first — it reflects the actual current state of the codebase, which may differ from these planning docs.

## 1. Golden Rules
1. **Never skip a phase.** Build `05-Feature-Ticket-List.md` in order. Do not start Phase N+1 until every ticket in Phase N is done and acceptance criteria are met.
2. **Never invent scope.** If a feature isn't in the PRD or ticket list, do not build it — flag it as a suggestion instead and wait for confirmation.
3. **Never guess silently.** If a requirement is ambiguous, state your assumption explicitly in code comments and in `memory.md`, then proceed with the most reasonable interpretation.
4. **Small, verifiable steps.** Implement one ticket at a time. After each ticket, state clearly what was built, what was tested, and what's left — do not silently bundle multiple tickets into one giant change.
5. **Never leave the app in a broken state.** If a change breaks the build or an existing feature, fix it before moving to the next ticket.

## 2. Tech Stack Boundaries
- Stack is fixed per `02-Technical-Architecture-Document.md`: Next.js + TypeScript + Tailwind + shadcn/ui + Prisma + PostgreSQL.
- Do not introduce a new major library/framework (state manager, ORM, CSS framework, auth library) without explicitly flagging it and stating why the current stack can't do it.
- Approved libraries: `zod` (validation), `react-query` (server state), `zustand` (UI state), `lucide-react` (icons), `recharts` (charts), `bcrypt`/`argon2` (hashing), `jsonwebtoken` (JWT), `playwright`/`vitest` (testing).
- No experimental/unmaintained packages. Prefer the most-downloaded, actively-maintained option when a choice exists.

## 3. Coding Conventions
- TypeScript strict mode on; no `any` unless justified with a comment.
- All API inputs validated with `zod` schemas — no exceptions, even for "internal" endpoints.
- Follow the folder structure in `02-Technical-Architecture-Document.md` §3 exactly — don't create ad-hoc top-level folders.
- Component naming: PascalCase for components, camelCase for functions/variables, kebab-case for file names except component files (PascalCase.tsx).
- Every new mutating API route must include: input validation → auth check → RBAC/ownership check → business logic → audit log (where applicable per Security doc) → response.
- Keep components under ~200 lines; extract sub-components rather than growing a single file indefinitely.

## 4. Error Handling Standards
- Every API route wrapped in try/catch; return the standard envelope `{ success, data, error }` — never leak stack traces or internal error messages to the client.
- User-facing errors are actionable and specific ("Password must be at least 8 characters") — never generic "Something went wrong" unless it's a genuine unexpected server error.
- All server-side errors logged with enough context (route, user id if available, error) to debug — but never log passwords, tokens, or full request bodies.
- Frontend: every async action (form submit, check-in, approve/reject) has a loading state, a success state (toast), and an error state (toast + inline message where relevant) — never a silent failure.
- Network/API failures degrade gracefully — no blank white screens; show a retry option.

## 5. Security Boundaries (hard constraints — see `03-Security-And-Access-Document.md` for full detail)
- Never hardcode secrets/credentials — always `.env` with a matching `.env.example` placeholder.
- Never disable or bypass RBAC/auth middleware, even "temporarily for testing" — use seeded test accounts instead.
- Never expose salary/payroll data in list-level API responses — only in explicitly authorized detail endpoints.
- Every Admin write action (profile edit, payroll change, leave approval) must write an audit log entry.
- Never trust client-submitted role/user-id fields for authorization — always derive identity from the verified JWT/session server-side.

## 6. What To Do When Stuck (so the build never stalls mid-way)
If you hit a blocker (ambiguous requirement, missing dependency, failing migration, unclear design), do **not** stop silently or produce partial/broken code and move on. Instead:
1. State exactly what's blocking progress in plain language.
2. State the most reasonable default assumption you'll proceed with, based on the PRD/Architecture/Design docs.
3. Proceed with that assumption, clearly marked (code comment `// ASSUMPTION:` + a line in `memory.md`).
4. Never leave a half-implemented feature merged as if it were complete — either finish the ticket to its acceptance criteria or explicitly mark it `IN PROGRESS` with what remains.
5. If a required external service (email provider, S3, etc.) isn't configured yet, stub it behind an interface so the rest of the app still runs, and note the stub in `memory.md`.

## 7. memory.md — Rules for Maintaining It
`memory.md` is **not** created upfront — create it the moment code-writing begins (start of Phase 0 setup), and update it after **every ticket**, so a new chat/AI session can resume with full context without re-reading the entire codebase (saves tokens, avoids re-litigating decisions).

Each `memory.md` entry should capture, in short bullet form:
- **What was built** (ticket ID + one line)
- **Key decisions/assumptions made** and why
- **Known gaps / stubs / TODOs** left behind
- **Current phase & next ticket to pick up**
- **Anything that deviated from the planning docs**, and why

Format example:
```
## Phase 1 — Authentication (DONE)
- T1.1–T1.7 complete. JWT access(15m)/refresh(7d) implemented per Security doc.
- ASSUMPTION: email verification link expires in 24h (not specified in PRD).
- STUB: email sending uses console.log in dev; real provider wired in T7.1.
- Next: Phase 2, T2.1 Employee Dashboard shell.
```

Keep `memory.md` concise — bullet points, not prose paragraphs. It should always be readable in under 2 minutes.

## 8. Definition of Done (applies to every ticket)
A ticket is DONE only when:
- [ ] Functionality matches its acceptance criteria in `05-Feature-Ticket-List.md`
- [ ] Server-side validation + RBAC check present (if applicable)
- [ ] No `console.log` debug statements left in
- [ ] No TypeScript errors, lint passes
- [ ] Loading/error/empty states handled in the UI (if applicable)
- [ ] `memory.md` updated
