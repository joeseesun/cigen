#!/usr/bin/env python3
"""Extract word/root/affix learning data from the source PDF."""

from __future__ import annotations

import argparse
import json
import re
from collections import Counter, defaultdict
from datetime import datetime, timezone
from pathlib import Path

import fitz


LINE_PATTERN_BRACKET = re.compile(
    r"^([A-Za-z][A-Za-z\-' ]*)\s*\[([^\]]{2,})\]\s*(.+)$"
)
LINE_PATTERN_PAREN = re.compile(
    r"^([A-Za-z][A-Za-z\-' ]*)\s+([^\[\(]{1,})\s*\(([^)]{2,})\)\s*$"
)
ENGLISH_TOKEN = re.compile(r"([A-Za-z][A-Za-z\-']*)(.*)")


def normalize(text: str) -> str:
    normalized = (
        text.replace("\u3000", " ")
        .replace("\t", " ")
        .replace("（", "(")
        .replace("）", ")")
        .replace("【", "[")
        .replace("】", "]")
        .replace("：", ":")
    )
    return " ".join(normalized.split()).strip()


def normalize_word(word: str) -> str:
    collapsed = re.sub(r"\s+", "", word)
    return collapsed.lower()


def clean_hint(raw: str) -> str:
    hint = raw.strip(" +-:：,，;；。")
    hint = hint.replace("→", " ").replace("+", " ").replace("＋", " ")
    hint = re.sub(r"\b[A-Za-z][A-Za-z\-']*\b", " ", hint)
    hint = re.sub(r"[\\[\\](){}<>]", " ", hint)
    hint = re.sub(r"\s+", " ", hint)
    hint = hint.strip(" +-:：,，;；。")
    return hint


def parse_components(decomposition: str) -> list[dict[str, str]]:
    parts = re.split(r"\+", decomposition)
    if len(parts) == 1:
        parts = re.split(r"[，,;；/]", decomposition)

    components: list[dict[str, str]] = []
    seen: set[str] = set()
    for part in parts:
        piece = normalize(part)
        if not piece:
            continue
        match = ENGLISH_TOKEN.match(piece)
        if not match:
            continue
        morpheme = match.group(1).lower().strip("-'")
        if not morpheme:
            continue
        # Keep a- as a valid single-letter prefix, skip other very short noise.
        if len(morpheme) == 1 and morpheme != "a":
            continue
        if len(morpheme) > 20:
            continue
        if morpheme in seen:
            continue
        seen.add(morpheme)
        hint = clean_hint(match.group(2))
        components.append({"morpheme": morpheme, "hint": hint})
    return components


def is_probably_noise(line: str) -> bool:
    if not line:
        return True
    if re.fullmatch(r"[0-9]+", line):
        return True
    if re.fullmatch(r"[一二三四五六七八九十百千]+", line):
        return True
    return False


def extract_entries(pdf_path: Path) -> list[dict]:
    doc = fitz.open(pdf_path.as_posix())
    entries: list[dict] = []
    seen: set[tuple[str, str, str]] = set()

    for page_index, page in enumerate(doc, start=1):
        for raw_line in page.get_text("text").splitlines():
            line = normalize(raw_line)
            if is_probably_noise(line):
                continue

            word = meaning = decomposition = None

            bracket_match = LINE_PATTERN_BRACKET.match(line)
            if bracket_match:
                word = normalize_word(bracket_match.group(1))
                decomposition = normalize(bracket_match.group(2))
                meaning = normalize(bracket_match.group(3))
            else:
                paren_match = LINE_PATTERN_PAREN.match(line)
                if paren_match:
                    word = normalize_word(paren_match.group(1))
                    meaning = normalize(paren_match.group(2))
                    decomposition = normalize(paren_match.group(3))

            if not word or not decomposition or not meaning:
                continue
            if len(word) < 2:
                continue
            if re.search(r"[^a-z\-']", word):
                continue

            components = parse_components(decomposition)
            if not components:
                continue

            dedupe_key = (word, meaning, decomposition)
            if dedupe_key in seen:
                continue
            seen.add(dedupe_key)

            entries.append(
                {
                    "id": f"e{len(entries) + 1}",
                    "word": word,
                    "meaning": meaning,
                    "decomposition": decomposition,
                    "page": page_index,
                    "components": components,
                }
            )

    return entries


def build_root_index(entries: list[dict]) -> list[dict]:
    root_count: Counter[str] = Counter()
    root_hints: dict[str, Counter[str]] = defaultdict(Counter)
    root_words: dict[str, list[str]] = defaultdict(list)
    root_words_seen: dict[str, set[str]] = defaultdict(set)

    for entry in entries:
        word = entry["word"]
        for component in entry["components"]:
            root = component["morpheme"]
            hint = component["hint"]
            root_count[root] += 1
            if hint:
                root_hints[root][hint] += 1
            if word not in root_words_seen[root]:
                root_words_seen[root].add(word)
                root_words[root].append(word)

    roots: list[dict] = []
    for root, count in root_count.items():
        if count < 2:
            continue
        best_hint = ""
        if root_hints[root]:
            candidates = []
            for hint, freq in root_hints[root].items():
                if not re.search(r"[\u4e00-\u9fff]", hint):
                    continue
                if len(hint) > 18:
                    continue
                if re.search(r"[A-Za-z]", hint):
                    continue
                candidates.append((hint, freq))
            pool = candidates if candidates else list(root_hints[root].items())

            def hint_sort_key(item: tuple[str, int]) -> tuple[int, int, int, str]:
                hint, freq = item
                has_cjk = bool(re.search(r"[\u4e00-\u9fff]", hint))
                return (0 if has_cjk else 1, -freq, len(hint), hint)

            best_hint = sorted(pool, key=hint_sort_key)[0][0]
        roots.append(
            {
                "root": root,
                "gloss": best_hint,
                "wordCount": len(root_words[root]),
                "sampleWords": root_words[root][:12],
            }
        )

    roots.sort(key=lambda item: (-item["wordCount"], item["root"]))
    return roots


def main() -> None:
    parser = argparse.ArgumentParser(description="Extract root/affix data from PDF")
    parser.add_argument(
        "--pdf",
        default="XDF________.pdf",
        help="Path to source PDF",
    )
    parser.add_argument(
        "--out",
        default="data/roots_affixes.json",
        help="Output JSON file",
    )
    args = parser.parse_args()

    pdf_path = Path(args.pdf).resolve()
    out_path = Path(args.out).resolve()

    entries = extract_entries(pdf_path)
    roots = build_root_index(entries)

    payload = {
        "meta": {
            "sourcePdf": pdf_path.name,
            "generatedAt": datetime.now(timezone.utc).isoformat(),
            "entryCount": len(entries),
            "rootCount": len(roots),
        },
        "roots": roots,
        "entries": entries,
    }

    out_path.parent.mkdir(parents=True, exist_ok=True)
    out_path.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"wrote {out_path} with {len(entries)} entries and {len(roots)} roots")


if __name__ == "__main__":
    main()
