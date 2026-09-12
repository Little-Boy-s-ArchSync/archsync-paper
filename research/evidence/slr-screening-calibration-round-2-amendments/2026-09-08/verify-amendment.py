"""Check public amendment integrity; optionally verify the retained local archive."""
from pathlib import Path
import argparse
import hashlib
import importlib.util
import json
import sys

sys.dont_write_bytecode = True
ROOT = Path(__file__).resolve().parent
PROVENANCE_SHA256 = "45ca6f35cd86406c7624423b6983fa1775c7bae46bea7747178bb2a8e9123861"
ARCHIVE_SUMS_SHA256 = "1bc24cbac21ac479b8773e5dfaf697d8854bcebb0c0c77b2f550a2e2c041fdf9"


def require(condition, message):
    if not condition:
        raise ValueError(message)


def sha(data):
    return hashlib.sha256(data).hexdigest()


def unique_object(pairs):
    result = {}
    for key, value in pairs:
        require(key not in result, "Duplicate JSON key: " + key)
        result[key] = value
    return result


def parse(data):
    return json.loads(data, object_pairs_hook=unique_object)


def read_regular(path):
    require(path.is_file() and not path.is_symlink(), "Expected regular file: " + str(path))
    return path.read_bytes()


def archive_inventory(sums):
    require(sha(sums) == ARCHIVE_SUMS_SHA256, "Retained archive checksum inventory changed")
    inventory = {}
    for line in sums.decode().splitlines():
        digest, relative = line.split("  ", 1)
        path = Path(relative)
        require(not path.is_absolute() and ".." not in path.parts, "Unsafe archive path")
        require(relative not in inventory, "Duplicate archive path")
        inventory[relative] = digest
    return inventory


def verify_repository(root=ROOT):
    provenance_bytes = read_regular(root / "AMENDMENT-PROVENANCE.json")
    # Verify exact raw bytes before parsing: equivalent JSON or duplicate keys
    # must never satisfy the published companion-provenance identity.
    require(sha(provenance_bytes) == PROVENANCE_SHA256, "Delivered provenance bytes changed")
    provenance = parse(provenance_bytes)
    inventory = archive_inventory(read_regular(root / "RETAINED-ARCHIVE-SHA256SUMS"))
    require(provenance["original_preparation_provenance_sha256"] ==
            inventory["proposal/AMENDMENT-PROVENANCE.json"], "Original provenance identity mismatch")
    require(provenance["retained_archive_sha256sums_sha256"] == ARCHIVE_SUMS_SHA256,
            "Retained archive identity mismatch")

    packet = root.parents[2] / "evidence/slr-screening-calibration-round-2-candidates"
    expected_files = {relative.removeprefix("proposal/candidate-packet/")
                      for relative in inventory if relative.startswith("proposal/candidate-packet/")}
    actual_files = {str(path.relative_to(packet)) for path in packet.rglob("*")
                    if path.is_file() or path.is_symlink()}
    require(actual_files == expected_files, "Current candidate file inventory changed")
    for relative in expected_files:
        require(sha(read_regular(packet / relative)) == inventory["proposal/candidate-packet/" + relative],
                "Candidate bytes differ from retained proposal: " + relative)
    require(sha(read_regular(packet / "manifest.json")) == provenance["proposed_packet_manifest_sha256"],
            "Proposed manifest identity mismatch")
    require(inventory["original-packet/manifest.json"] == provenance["original_packet_manifest_sha256"],
            "Original manifest identity mismatch")
    require(sha(read_regular(packet / "README.md")) == provenance["candidate_readme_sha256"],
            "Canonical README identity mismatch")

    for amendment in provenance["amendments"]:
        record_path = "records/" + amendment["record_id"] + ".json"
        record = parse(read_regular(packet / record_path))
        require(inventory["original-packet/" + record_path] == amendment["original_record_sha256"],
                "Original record identity mismatch")
        require(inventory["proposal/candidate-packet/" + record_path] == amendment["proposed_record_sha256"],
                "Proposed record identity mismatch")
        require(sha(record[amendment["field"]].encode()) == amendment["proposed_field_utf8_sha256"],
                "Amended field identity mismatch")
        require(inventory[amendment["source_path"]] == amendment["source_sha256"],
                "Retained source identity mismatch")

    return provenance, inventory, {
        "status": "PASS; public candidate/provenance integrity only",
        "candidate_manifest_sha256": provenance["proposed_packet_manifest_sha256"],
        "delivered_provenance_sha256": sha(provenance_bytes),
        "candidate_files_checked": len(expected_files),
        "raw_sources_checked": False,
        "human_acceptance": "not established",
    }


def verify_archive(archive, provenance, inventory):
    sums = read_regular(archive / "SHA256SUMS")
    require(archive_inventory(sums) == inventory, "Local archive identity mismatch")
    actual_files = {str(path.relative_to(archive)) for path in archive.rglob("*")
                    if path.is_file() or path.is_symlink()}
    require(actual_files == set(inventory) | {"SHA256SUMS"}, "Local archive inventory changed")
    for relative, digest in inventory.items():
        require(sha(read_regular(archive / relative)) == digest, "Local archive bytes changed: " + relative)

    original = parse(read_regular(archive / "proposal/AMENDMENT-PROVENANCE.json"))
    changed_packaging_fields = {"scope", "readme_limitation"}
    require(all(provenance[key] == value for key, value in original.items()
                if key not in changed_packaging_fields), "Original amendment facts changed")
    # Only after exact archive hash verification, run its retained source checker.
    spec = importlib.util.spec_from_file_location("retained_verifier", archive / "scripts/verify-proposal.py")
    verifier = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(verifier)
    verifier.main()
    print(json.dumps({"status": "PASS; complete retained local archive and source re-extraction",
                      "archive_files_checked": len(inventory) + 1,
                      "human_acceptance": "not established"}, indent=2))


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--archive", type=Path, help="Complete retained local preparation archive")
    args = parser.parse_args()
    provenance, inventory, result = verify_repository()
    print(json.dumps(result, indent=2))
    if args.archive is not None:
        verify_archive(args.archive.resolve(), provenance, inventory)


if __name__ == "__main__":
    main()
