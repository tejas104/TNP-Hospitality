# Cleanup disposition

User authorized removal of files with no use in TNP. Bootstrap inspected tracked paths, untracked deliverables/tmp and current imports/configuration.

No tracked file was proven safe and useful to delete in this documentation task:
- .openai/hosting.json is imported by vite.config.ts.
- Existing Vercel and Cloudflare/Wrangler configs support different build routes; removing either requires a separate production-build decision.
- components/ui contains reusable primitives; lack of a current import alone is not sufficient reason to erase a supplied library before frontend expansion.
- The eight TNP reference documents provide provenance and are retained with an explicit supersession guide.
- Unrelated client quotation artifacts were originally preserved. The explicit 2026-09-17 removal request supersedes that historical preservation decision; see the completed cleanup below.
- Existing tmp/tnp-scope-review contains rendered scope pages; useful audit evidence, left untouched.
- Original node_modules, dist, .next, .vinext, .vercel and .wrangler caches are ignored/reproducible but may support local previews. No active-preview assumption or broad recursive deletion was made.

The new bootstrap worktree contains tracked TNP code and only allowlisted new TNP guidance/references/skills, without the unrelated untracked client files. This achieves a clean review boundary without destructive cleanup.

## Completed user-authorized unrelated quotation cleanup

At 2026-09-17T03:16:30.5970256+05:30, P removed exactly three untracked quotation work folders (deliverables/annual_quotes_work, deliverables/client_quotes_2200_work, deliverables/word_work) and two untracked verification scripts (deliverables/verify_estimate.py, deliverables/verify_startup_estimate.py): 156 files, 37339983 bytes. The explicitly named final quotation documents were already absent at inspection; P does not claim to have deleted those earlier. Before recursive deletion, every resolved target was confirmed inside D:\TNP Hospitality\deliverables, no tracked files or reparse points were present, and all eight tracked TNP reference hashes were captured. The same eight hashes matched after deletion. No source/config/library/cache or TNP tmp evidence was deleted. Working-tree Git status afterward showed only pre-existing tmp/ as untracked. Git history and files outside this project were not rewritten or removed.
