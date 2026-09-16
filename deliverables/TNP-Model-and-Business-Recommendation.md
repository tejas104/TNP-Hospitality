# TNP model routing and Business-plan recommendation

16 September 2026. Recommendations below are project-specific starting points, not benchmark results for TNP or guarantees about account availability.

## 1. Recommended session arrangement

Your proposed six-chat arrangement is sensible with a narrower role for the prompt generator:

| Session | Default use | Suggested model |
|---|---|---|
| P | On-demand architecture/dependency decisions and TASK contracts | Astra High for difficult work; Sol Medium for routine decomposition |
| A | Client/planner implementation | Sol Medium; High for ambiguous integration |
| B | Public UI, repeatable forms and bounded fixes | Terra Medium; Sol when complexity warrants |
| C | Independent high-risk review and integration analysis | Astra High; Extra High for a difficult unresolved issue |
| D | Claude implementation / opposite-model source review | Sonnet; Medium for simple UI, High for substantive coding/review |
| E | Identity/workforce implementation | Sol Medium/High, with Astra review for sensitive changes |

Normally A/B/D/E are four builders. C and P read/analyze. C may become a fifth builder when deliberately assigned an independent task, but then it is not simultaneously the independent reviewer of that implementation. P does not write application code. Repository-document authoring by P must occupy a declared implementation lane.

## 2. Model choice: quality per accepted change

OpenAI describes Astra as its strongest complex-work option, Sol for deeper complex work, Terra for everyday work, and Luna for clear repeatable tasks. Availability depends on sign-in, rollout and client; higher reasoning consumes more time/tokens. [OpenAI model guidance](https://learn.chatgpt.com/docs/models)

**My TNP routing recommendation:**

- **Sol Medium:** default for meaningful feature implementation. Use High for complex API/UI integration. Do not default all tasks to maximum reasoning.
- **Terra Medium:** approved-pattern UI expansion, ordinary forms, straightforward CRUD and bounded defects with clear tests.
- **Luna Low/Medium:** mechanical formatting, approved copy/data transformations, small repetitive changes and structured summaries. Do not make it the sole judge of permissions, concurrency or payments.
- **Astra High:** critical design decisions and independent review of architecture/security/concurrency/payment/financial/cross-module work. Extra High for a reproduced difficult problem where High is insufficient. Max/Ultra are not routine defaults.
- **Claude Sonnet:** default Claude implementation and routine opposite-model review. Start Medium on explicit low-risk UI tasks, High for substantive/intelligence-sensitive work. These are recommendations to evaluate, not claimed quality parity across effort settings.
- **Claude Opus:** difficult Claude-side reasoning or a second opinion when Sonnet cannot resolve the issue. This does not remove the user's required Astra risk-review gate.

Anthropic documents `sonnet` for daily coding and `opus` for complex reasoning, and advises Sonnet for most coding work when managing cost. Aliases resolve by provider, so inspect and record the actual selected version; do not assume an “Opus 5” entitlement from the older manual. [Claude model configuration](https://code.claude.com/docs/en/model-config), [cost guidance](https://code.claude.com/docs/en/costs)

The same effort label does not represent identical reasoning across vendors. Re-check the actual setting when changing models. Avoid Ultra/automatic delegation as a default because it can create extra execution beyond the deliberate five-lane schedule; any spawned writer still needs a human owner, contract, worktree and capacity slot.

## 3. Should Astra generate every prompt?

**No. Use it to make important tasks build-ready.** Rephrasing each instruction before passing it to another capable model spends context and adds a serial bottleneck. A stable TASK file with a clear outcome and testable acceptance is more useful than a long polished prompt.

Use P when:

- A feature spans several domains or its dependencies are unclear.
- A business rule needs a concrete proposal for the human/client.
- A serious failure needs hypothesis-driven investigation.
- A scope change affects several lanes or the deadline.

Skip P for a ready task already covered by canonical contracts. Dispatch with “Implement TASK-123 and its required checks.” The task contract carries the substance.

## 4. Should one Astra chat review, correct and integrate everything?

Use a central **review queue**, not one permanent conversation that accumulates every implementation and then judges its own fixes.

- Fresh task/PR review session or carefully bounded fresh context, exact base/head SHA.
- Review reads code and contract before relying on builder rationale.
- Findings return to the builder and human owner.
- Corrections receive a new SHA and re-review.
- Integration analysis can identify conflicts; a behavior-changing fix is a new implementation task.
- If Astra writes a fix, obtain fresh opposite-model/human review and retain a separate Astra risk-review session.

This preserves practical independence and prevents the most expensive context from becoming the entire project history.

## 5. Business-plan decision

**Business is worth considering for team governance and client work, but it does not itself guarantee enough capacity for four continuous builders plus Astra planning/review.**

The public pricing page currently lists Business at $20/user/month on annual billing, or $25 monthly, with a 2-user minimum. It distinguishes Standard Business from “Business ($100),” whose usage estimates follow Pro 5x. Local/cloud usage is shared and weekly limits may apply. The page does not establish every Premium checkout/mixed-seat term for this team. Confirm actual tier, Astra availability and credit controls before purchasing. [Official pricing](https://learn.chatgpt.com/docs/pricing)

For three actual users, Standard's listed base arithmetic is $75/month on monthly billing, or $720/year on annual billing (equivalent to $60/month), before applicable taxes, extra credits and Claude costs. This is **not** an estimate that Standard can sustain the proposed workload.

Recommended purchase process:

1. Identify the three human users and their account/workspace roles; seat users, not chat windows or laptops.
2. Verify the actual Business offer, model access, usage allowances, credit budgets and billing term in the workspace/checkout.
3. Pilot the planned task mix for two or three working days with existing permitted access. Record accepted tasks, human time, rework, usage and limit interruptions.
4. Increase the constrained owner's tier/credits if the available offer supports it. Do not assume three seats can have a particular mixed-tier arrangement without confirming it.
5. Set a spending budget and review it daily during the sprint. Keep Claude access/costs separate.

Do not purchase annual capacity solely because a three-day demo push is intense. Compare the pilot's observed consumption with the actual offer and expected work after launch. No plan removes dependency, human-review or laptop constraints.

There is a documentation nuance: the models page mentions Astra rollout options for eligible Pro, Business ($100) and Enterprise accounts, while the pricing page includes Standard Business estimates. Therefore confirm **your actual model picker/access**, rather than treating either page as a guarantee that every seat exposes every Astra option. [Model availability guidance](https://learn.chatgpt.com/docs/models)

## 6. Token efficiency without weakening review

- Keep a short root instruction file; load only relevant canonical documents and task source.
- Use bounded tasks and a stable service/DTO contract so smaller models get well-specified work.
- Use concise handoff records rather than pasting whole transcripts into both models.
- Review complete task diffs and relevant surrounding code; token saving must not omit necessary context.
- Ask for actionable findings and concise verification, not long generic explanations.
- Escalate after a reproduced hard issue or repeated unsuccessful approaches; do not spend many cheap retries on sensitive work.
- Use normal speed initially; pay for faster modes only when observed latency is the bottleneck.
- Do not estimate subscription consumption from API dollar prices. Do not assume more chats create more independent allowance.
- Check model/effort/version and consumption per accepted task, including review and rework.

Astra can sometimes reduce total work despite a higher token price, so “smaller is always cheaper per solved task” is not a safe assumption. This is why the decision metric is verified outcome plus human time, not token count alone. [OpenAI Astra guidance](https://developers.openai.com/api/docs/guides/latest-model)

### Pilot record

```text
TASK | risk | tool/model/effort | author lane/human | review model
Usage/credits if reported | elapsed time | human supervision/review minutes
Acceptance passed? | rework rounds | main/staging verified? | limit interruption
```

My starting choice: **Sol for core development, Terra for bounded UI, Sonnet for the Claude lane and routine review, Astra for significant planning and mandatory high-risk review.** Add Luna only for genuinely mechanical work. Tune from evidence, not a promised multiplier.
