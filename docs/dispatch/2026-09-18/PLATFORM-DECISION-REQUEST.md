# TNP platform foundation — owner decision request

This resolves ADR-0002 only. It does not authorize deployment, production data, provider activation or secrets in Git.

Recommended decision set for the Day-5 foundation:

1. **Persistence:** MongoDB Atlas. Name the owner for development, staging and production projects.
2. **Authentication/session:** opaque, revocable, database-backed sessions in `Secure`, `HttpOnly`, `SameSite=Lax` cookies, with CSRF protection for browser mutations. Name the identity/account owner. A managed identity provider may replace this only if explicitly named.
3. **Tenancy/membership:** `organizationId` is the tenant boundary. Initial roles: `platform_admin`, `organization_admin`, `operations`, `finance`, `planner`, `client`, `worker`; membership status: `invited`, `active`, `suspended`, `revoked`. Authorization uses server-derived membership only. Approve or amend.
4. **Deployment:** name the Vercel project owner and domain/DNS owner.
5. **Secrets:** name one accountable owner for each of development, staging and production. Values stay out of source, fixtures, logs and this response.
6. **Documents:** keep identity/document upload disabled for this milestone unless a retention period, deletion owner and access/audit policy are approved now.
7. **External providers:** keep email, WhatsApp and payment adapters disabled until their separate account approval, template/webhook security and UAT gates pass.
8. **Backup/restore:** daily Atlas backups for production, a documented staging restore drill before go-live, and a named restore operator. Approve or amend the recovery target.
9. **Rollback:** additive/backward-compatible schema only; feature-disable and application rollback must work without destructive database rollback. No destructive migration in this milestone.

Copy, complete and return:

```text
ADR-0002 DECISION: APPROVE / AMEND
Atlas: APPROVE / alternative; dev owner=; staging owner=; production owner=
Session/auth: APPROVE / alternative; account owner=
Membership roles/statuses: APPROVE / amendments=
Deployment: Vercel project owner=; domain/DNS owner=
Secrets: dev owner=; staging owner=; production owner=
Documents: DISABLED / retention and policy=
Providers: email DISABLED/ENABLED; WhatsApp DISABLED/ENABLED; payments DISABLED/ENABLED; approvals/UAT evidence if enabled=
Backup/restore: APPROVE / amendments=; restore operator=; recovery target=
Rollback: APPROVE / amendments=
Anjaneya product/deployment approval: name + APPROVE/CHANGES REQUESTED
Kartik platform/security/data approval: name + APPROVE/CHANGES REQUESTED
```

P will reconcile the response into ADR-0002 and a complete Ready contract with exact dependencies, source/launch SHAs, ownership, worktree, port and reviewers before any platform source edit begins.
