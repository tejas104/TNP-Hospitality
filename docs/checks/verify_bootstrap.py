"""Read-only bootstrap evidence checks; Python standard library only."""
from pathlib import Path
import hashlib
import json
import re
import subprocess
import argparse

parser = argparse.ArgumentParser(description="Bootstrap snapshot checks, or source provenance only; neither validates a writer launch.")
parser.add_argument("--provenance-only", action="store_true", help="Check the 21 reference/skill/evidence hashes only; safe after app changes and Ready transitions.")
parser.add_argument("--strict-untracked", action="store_true", help="Reject out-of-scope untracked files in a dedicated bootstrap checkout only.")
args = parser.parse_args()

ROOT = Path(__file__).resolve().parents[2]
BASE = "9d58061f2d36514ebc932fa94bb3dc90f4b97a97"
required = ["AGENTS.md", "CLAUDE.md", "TNP-START-HERE.md"] + ["docs/" + x + ".md" for x in
    ["PRODUCT", "DESIGN", "DOMAIN-RULES", "ARCHITECTURE", "STATUS",
     "LANES", "ENVIRONMENTS", "SKILLS", "BASELINE", "F01-F20-AUDIT",
     "DELIVERY-PLAN", "START-HERE", "DISPATCH"]]
errors = []
for rel in required:
    if not (ROOT / rel).is_file():
        errors.append("Missing canonical file: " + rel)
manifest = json.loads((ROOT / "docs/references/MANIFEST.json").read_text(encoding="utf-8"))
for item in manifest["files"]:
    target = ROOT / item["destination"]
    if not target.is_file() or hashlib.sha256(target.read_bytes()).hexdigest() != item["sha256"]:
        errors.append("Provenance mismatch: " + item["destination"])
for item in json.loads((ROOT / "docs/reviews/received/manifest.json").read_text(encoding="utf-8")):
    target = ROOT / item["file"]
    if not target.is_file() or hashlib.sha256(target.read_bytes()).hexdigest() != item["sha256"]:
        errors.append("Received review provenance mismatch: " + item["file"])
if args.provenance_only:
    if errors:
        raise SystemExit("\n".join(errors))
    print("PASS: canonical file presence and %d provenance entries only; launch/application checks NOT performed." % len(manifest["files"]))
    raise SystemExit(0)

audit = (ROOT / "docs/F01-F20-AUDIT.md").read_text(encoding="utf-8")
rows = re.findall(r"^\| (F\d{2}) \|", audit, flags=re.M)
if sorted(rows) != ["F%02d" % n for n in range(1, 21)]:
    errors.append("Audit must have exactly one row per F01-F20")
tasks = sorted((ROOT / "docs/tasks").glob("TNP-*.md"))
for path in tasks:
    body = path.read_text(encoding="utf-8")
    fields = ["Status:", "Responsible human:", "Tool/model/effort:", "Baseline SHA:",
              "Dependencies:", "Mode:", "Risk:", "Opposite-model reviewer:",
              "Independent human reviewer:", "Astra gate:", "Writer lease:"]
    if path.stem != "TNP-BOOT-01":
        fields = ["Status:", "Responsible human:", "Lane/host:", "Tool/model/effort:",
                  "Isolated branch:", "Absolute worktree:", "Implementation baseline SHA:",
                  "Dependencies:", "Merged dependency evidence:", "Mode:", "Risk:",
                  "Opposite-model reviewer:", "Independent human reviewer:",
                  "Astra gate:", "Writer lease:"]
        if "Status: Draft." not in body or "Writer lease: NONE." not in body:
            errors.append("Bootstrap snapshot expects Draft consumers (use --provenance-only after launch changes): " + path.name)
        for dep in re.findall(r"TNP-(?:BOOT-01|S[01]|[ABCD]-\d{2})",
                              next((l for l in body.splitlines() if l.startswith("Dependencies:")), "")):
            if not (ROOT / "docs/tasks" / (dep + ".md")).is_file():
                errors.append("Missing dependency task: " + dep)
    for field in fields:
        if field not in body:
            errors.append("Missing task field " + field + " in " + path.name)
# Verify no baseline tracked blob is deleted or changed, including config/lockfile.
tracked = subprocess.check_output(["git", "ls-tree", "-r", "--name-only", BASE], cwd=ROOT, text=True).splitlines()
for rel in tracked:
    now = ROOT / rel
    if not now.is_file():
        errors.append("Baseline file missing: " + rel)
        continue
    # Git handles CRLF normalization, unlike a raw working-tree byte comparison.
changed = subprocess.check_output(["git", "diff", "--name-only", BASE, "--"], cwd=ROOT, text=True).splitlines()
allowed_refs = {item["destination"] for item in manifest["files"] if item["kind"] == "reference"}
allowed = lambda p: p in ("AGENTS.md", "CLAUDE.md", ".gitattributes", "TNP-START-HERE.md") or p.startswith(("docs/", ".agents/skills/")) or p in allowed_refs
for rel in changed:
    if rel in tracked or not allowed(rel):
        errors.append("Out-of-scope tracked diff: " + rel)
untracked = subprocess.check_output(["git", "ls-files", "--others", "--exclude-standard"], cwd=ROOT, text=True).splitlines()
for rel in untracked:
    if args.strict_untracked and not allowed(rel):
        errors.append("Out-of-scope untracked file: " + rel)
# Reference copies intentionally carry historical text. Current canonical policy must name only H1/H2 as humans.
agents = (ROOT / "AGENTS.md").read_text(encoding="utf-8")
for required_text in ["Anjaneya", "Kartik", "There is no H3", "Pause dispatch at two", "No automatic subagents"]:
    if required_text not in agents:
        errors.append("Missing policy: " + required_text)
for lane, author, reviewer in [("C", "Claude", "fresh Codex"), ("D", "Codex", "fresh Claude")]:
    for path in (ROOT / "docs/tasks").glob("TNP-" + lane + "-*.md"):
        body = path.read_text(encoding="utf-8")
        if "Tool/model/effort: " + author not in body or "Opposite-model reviewer: " + reviewer not in body:
            errors.append("Incorrect confirmed tool/reviewer mapping: " + path.name)
if errors:
    raise SystemExit("\n".join(errors))
print("PASS: canonical files; %d provenance entries; 20 screen sets; %d TASKs; bootstrap snapshot docs-only diff. NOT launch validation." %
      (len(manifest["files"]), len(tasks)))
