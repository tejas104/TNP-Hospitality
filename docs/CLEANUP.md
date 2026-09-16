# Cleanup disposition

User authorized removal of files with no use in TNP. Bootstrap inspected tracked paths, untracked deliverables/tmp and current imports/configuration.

No tracked file was proven safe and useful to delete in this documentation task:
- .openai/hosting.json is imported by vite.config.ts.
- Existing Vercel and Cloudflare/Wrangler configs support different build routes; removing either requires a separate production-build decision.
- components/ui contains reusable primitives; lack of a current import alone is not sufficient reason to erase a supplied library before frontend expansion.
- The eight TNP reference documents provide provenance and are retained with an explicit supersession guide.
- Unrelated AVALON/client deliverables are local user work. They are not copied, staged, moved or deleted.
- Existing tmp/tnp-scope-review contains rendered scope pages; useful audit evidence, left untouched.
- Original node_modules, dist, .next, .vinext, .vercel and .wrangler caches are ignored/reproducible but may support local previews. No active-preview assumption or broad recursive deletion was made.

The new bootstrap worktree contains tracked TNP code and only allowlisted new TNP guidance/references/skills, without the unrelated untracked client files. This achieves a clean review boundary without destructive cleanup.
