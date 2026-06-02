"""Python equivalent of the JavaScript ``IndexerTest.fullIndexingCycleTest``.

The Java test (web/src/test/java/.../IndexerTest.java) drives the web app in a
headless browser, indexes ``src/test/resources/test-media`` with all three
models and the eng/fra/nld OCR languages, downloads the resulting archive and
compares its ``sourceData`` against ``test-archive/ml-media-archive-test.html``
using a shift-tolerant cosine-similarity check (threshold 0.985).

This test does the same thing for the Python implementation: it runs the real
ML pipeline over the same media and compares the produced ``sourceData`` to the
same reference archive with the same similarity functions (ported below).

Like the Java test (``@EnabledIfSystemProperty(named="fullIndexingCycleTest")``)
it is **disabled by default** because it downloads ~2 GB of models and takes
several minutes on CPU. Enable it with::

    MEDIA_ARCHIVE_RUN_FULL_CYCLE=1 pytest tests/test_full_indexing_cycle.py

``previewData`` is normalised to a placeholder in both archives before
comparison: the base64 JPEG bytes legitimately differ between the browser's and
Pillow's JPEG encoders, so they are not part of the semantic comparison (this
mirrors the intent of the Java test, whose tolerance absorbs detection drift).
"""
import importlib.util
import json
import math
import os
import re
from collections import Counter
from pathlib import Path

import pytest

_HERE = Path(__file__).resolve().parent
_REPO = _HERE.parents[1]
# Use the built, self-contained program (it has the data embedded).
_DIST = _REPO / "python" / "dist" / "indexer.py"
_SRC = _REPO / "python" / "src" / "ml_media_archive" / "indexer.py"
_MODULE_PATH = _DIST if _DIST.is_file() else _SRC
_TEST_MEDIA = _REPO / "web" / "src" / "test" / "resources" / "test-media"
_REFERENCE = _REPO / "web" / "src" / "test" / "resources" / "test-archive" / "ml-media-archive-test.html"

_ENABLED = os.environ.get("MEDIA_ARCHIVE_RUN_FULL_CYCLE") == "1"
pytestmark = pytest.mark.skipif(
    not _ENABLED,
    reason="full indexing cycle is slow; set MEDIA_ARCHIVE_RUN_FULL_CYCLE=1 to enable",
)


def _load_indexer():
    spec = importlib.util.spec_from_file_location("ml_media_archive_indexer_full", _MODULE_PATH)
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod


# --- similarity helpers, ported verbatim from IndexerTest.java --------------
def _normalize(text: str) -> str:
    return re.sub(r"\s+", " ", text.lower()).strip()


def _ngram_freq(text: str, n: int = 3) -> Counter:
    if not text:
        return Counter()
    if len(text) < n:
        return Counter([text])
    return Counter(text[i:i + n] for i in range(len(text) - n + 1))


def _token_freq(text: str) -> Counter:
    return Counter(t for t in re.split(r"[^a-z0-9_]+", text) if t)


def _cosine(a: Counter, b: Counter) -> float:
    if not a and not b:
        return 1.0
    dot = sum(a[k] * b.get(k, 0) for k in a)
    na = math.sqrt(sum(v * v for v in a.values()))
    nb = math.sqrt(sum(v * v for v in b.values()))
    if na == 0 or nb == 0:
        return 0.0
    return dot / (na * nb)


def _effective_similarity(expected: str, actual: str) -> float:
    en, an = _normalize(expected), _normalize(actual)
    trigram = _cosine(_ngram_freq(en, 3), _ngram_freq(an, 3))
    token = _cosine(_token_freq(en), _token_freq(an))
    max_len = max(len(en), len(an))
    length = 1.0 if max_len == 0 else 1.0 - abs(len(en) - len(an)) / max_len
    best = max(trigram, token)
    return best * 0.9 + length * 0.1


def _extract_source_data(html: str):
    m = re.search(r"sourceData\s*=\s*(\[.*?\])\s*,\s*DUMMY_REPLACEMENT_CONST", html, re.S)
    assert m, "sourceData section not found in archive"
    return json.loads(m.group(1))


def _normalize_previews(records):
    for rec in records:
        if isinstance(rec, dict):
            if rec.get("previewData"):
                rec["previewData"] = "<preview>"
    return records


def test_full_indexing_cycle(tmp_path):
    assert _TEST_MEDIA.is_dir(), f"missing test media: {_TEST_MEDIA}"
    assert _REFERENCE.is_file(), f"missing reference archive: {_REFERENCE}"

    idx = _load_indexer()
    output = tmp_path / "produced_archive.html"
    rc = idx.main([
        "-i", str(_TEST_MEDIA),
        "-o", str(output),
        "--models", ",".join(idx.ALL_MODEL_NAMES),
        "--ocr-enabled", "true",
        "--ocr-languages", "eng,fra,nld",
        "--log-level", "WARNING",
    ])
    assert rc == 0
    assert output.is_file()

    expected = _normalize_previews(_extract_source_data(_REFERENCE.read_text(encoding="utf-8")))
    actual = _normalize_previews(_extract_source_data(output.read_text(encoding="utf-8")))

    # Same number of indexed files.
    assert len(actual) == len(expected)

    expected_str = json.dumps(expected, ensure_ascii=False, separators=(",", ":"))
    actual_str = json.dumps(actual, ensure_ascii=False, separators=(",", ":"))

    similarity = _effective_similarity(expected_str, actual_str)
    assert similarity >= 0.985, f"sourceData differs too much: effectiveSimilarity={similarity:.4f}"
