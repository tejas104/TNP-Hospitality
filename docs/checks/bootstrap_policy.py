"""Current bootstrap contract consistency, not runtime task authorization."""
from pathlib import Path
import json
import re


def validate_policy(root: Path) -> list[str]:
    errors = []
    try:
        policy = json.loads((root / "docs/OPERATING-POLICY.json").read_text(encoding="utf-8"))
    except (OSError, ValueError) as exc:
        return ["Operating policy unavailable: " + str(exc)]
    if policy.get("source_reviewer") != "Sonnet" or policy.get("architecture_reviewer") != "Sol":
        errors.append("Operating policy must use the user-approved Sonnet/Sol pair")
    if policy.get("foundation_task") != "TNP-FOUND-01" or policy.get("phase_dispatch") is not False:
        errors.append("Operating policy must have one foundation with non-dispatched phases")
    if policy.get("initial_consumers") != ["TNP-A-01", "TNP-B-01", "TNP-C-01", "TNP-D-01"]:
        errors.append("Initial consumer policy differs from the registered lanes")
    bodies = {p.stem: p.read_text(encoding="utf-8") for p in (root / "docs/tasks").glob("TNP-*.md")}
    graph = {}
    for name, body in bodies.items():
        line = next((x for x in body.splitlines() if x.startswith("Dependencies:")), "")
        deps = re.findall(r"\bTNP-[A-Z][A-Z0-9]*(?:-\d{2})?\b", line)
        graph[name] = deps
        for dep in deps:
            if dep not in bodies:
                errors.append("Missing dependency task: " + dep)
    def visit(name, chain):
        if name in chain:
            errors.append("Dependency cycle: " + " -> ".join(chain + [name]))
            return
        for dep in graph.get(name, []):
            if dep in bodies:
                visit(dep, chain + [name])
    for name in bodies:
        visit(name, [])
    for name in ["TNP-A-01", "TNP-B-01", "TNP-C-01", "TNP-D-01"]:
        if graph.get(name) != ["TNP-FOUND-01"]:
            errors.append("Initial consumer must depend on TNP-FOUND-01: " + name)
    for name in ["TNP-S0", "TNP-S1"]:
        if "Dispatchable: NO; phase checklist owned by TNP-FOUND-01 only." not in bodies.get(name, ""):
            errors.append("Phase must be non-dispatchable: " + name)
    if "Dispatchable: YES after Ready launch gates; sole S0/S1 implementation milestone." not in bodies.get("TNP-FOUND-01", ""):
        errors.append("Foundation milestone missing or not designated sole dispatch")
    if graph.get("TNP-FOUND-01") != ["TNP-BOOT-01"]:
        errors.append("Foundation must depend on bootstrap only; phases are internal")
    marker = "Current candidate: %s. Review pair: Sonnet + independent Sol. Foundation milestone: TNP-FOUND-01." % policy.get("candidate_tag")
    for name in policy.get("active_documents", []):
        file = root / name
        if not file.is_file():
            errors.append("Missing active policy document: " + name)
            continue
        body = file.read_text(encoding="utf-8")
        if marker not in body:
            errors.append("Active candidate/model/milestone marker mismatch: " + name)
        if "Astra" in body or re.search(r"tnp-bootstrap-review-(?!04\b)\d+", body):
            errors.append("Obsolete live reviewer/candidate instruction: " + name)
    for name, body in bodies.items():
        gate = next((x for x in body.splitlines() if x.startswith("Astra gate:")), "")
        if "REQUIRED" in gate and "Sol" not in gate:
            errors.append("Obsolete mandatory reviewer gate: " + name)
    i01 = root / "docs/contracts/I01-INTEGRATED-PREVIEW.md"
    if not i01.is_file() or "Dependencies: integrated TNP-FOUND-01," not in i01.read_text(encoding="utf-8"):
        errors.append("I01 must depend on the integrated foundation milestone")
    return errors
