#!/usr/bin/env python3
"""Build the Python program from what Maven produced, and add it to the release.

The Maven build (``mvn clean verify`` in ``web/``) is fully independent and knows
nothing about Python: it leaves the bundled viewer in ``web/target/indexer.js``
(where ``Builder.java`` combined ``archive-search.{html,css,js}`` into the
``FINAL_HTML`` string) and writes the HTML+JS release archive to
``shared/releases/release_<version>.zip``.

This script consumes that output. It:
  1. extracts ``FINAL_HTML`` (and the cities + OWL-ViT label data) from
     ``web/target/indexer.js`` and embeds them into a single, self-contained
     ``python/dist/indexer.py``;
  2. adds that program into the existing release zip as ``python/indexer.py``.

So the dependency is one-directional (Python consumes Maven's output), with no
circular build. The bundling logic lives only in ``Builder.java`` -- never
duplicated here -- and ``python/`` keeps no copy of the ``archive-search.*``
files.

Run the Maven build first:

    cd web && mvn clean verify        # produces target/ and the release zip
    cd ../python && python tools/build_embedded.py

Usage:
    python build_embedded.py [--web-dir WEB] [--in INDEXER_PY] [--out OUT_PY]
                             [--no-zip]
"""
from __future__ import annotations
import argparse
import base64
import gzip
import json
import re
import shutil
import tempfile
import zipfile
from pathlib import Path


def js_cities_to_list(path: Path):
    txt = path.read_text(encoding="utf-8")
    txt = txt.split("=", 1)[1].strip()
    if txt.endswith(";"):
        txt = txt[:-1]
    txt = re.sub(r'([{,])\s*(name|altname|lat|lon|country_code|country_name)\s*:', r'\1"\2":', txt)
    # JS treats an unknown escape \x as the literal x; drop backslashes that are
    # not the start of a valid JSON escape so the data parses as JSON.
    txt = re.sub(r'\\(?!["\\/bfnrtu])', '', txt)
    return json.loads(txt)


def load_cities(web: Path):
    cities = (js_cities_to_list(web / "src/main/webapp/z_cities1000_sorted_by_lon_lat_1.js")
              + js_cities_to_list(web / "src/main/webapp/z_cities1000_sorted_by_lon_lat_2.js"))
    return [[c["name"], c.get("altname", ""), c["lat"], c["lon"],
             c["country_code"], c["country_name"]] for c in cities]


def load_owlvit_labels(web: Path):
    # The OWL-ViT label definitions live in a `labelsData: [ ... ]` array inside
    # the (very long) modelInfos definition in indexer.js. Read the file in pure
    # Python -- no external tools -- so the build works on Windows and Linux.
    text = (web / "src/main/webapp/indexer.js").read_text(encoding="utf-8")
    m = re.search(r"labelsData:\s*(\[.*?\}\])", text, re.S)
    if not m:
        raise SystemExit("labelsData array not found in web/src/main/webapp/indexer.js")
    labels = json.loads(m.group(1))
    return [[l["name"], l["def"], l["synonyms"]] for l in labels]


def _js_unescape(s: str) -> str:
    """Decode a JavaScript single-quoted string literal body.

    The Builder escapes the embedded HTML with ``\\`` -> ``\\\\`` then ``'`` ->
    ``\\'``. Reverse that: a backslash takes the following character literally
    (so ``\\\\`` -> ``\\`` and ``\\'`` -> ``'``). This yields the actual HTML the
    browser writes to disk, which is what we embed in the Python program.
    """
    out = []
    i = 0
    n = len(s)
    while i < n:
        c = s[i]
        if c == "\\" and i + 1 < n:
            out.append(s[i + 1])
            i += 2
        else:
            out.append(c)
            i += 1
    return "".join(out)


_RUN_MAVEN_HINT = ("Run the Maven build first: `cd web && mvn clean verify` "
                   "(it produces web/target/ and the release zip).")


def load_final_html(web: Path):
    built = web / "target/indexer.js"
    if not built.is_file():
        raise SystemExit(f"{built} not found. {_RUN_MAVEN_HINT}")
    js = built.read_text(encoding="utf-8")
    # Escape-aware capture: the body is a single-quoted JS string with escaped
    # quotes (\') and backslashes (\\), so a naive non-greedy '(.*?)' would stop
    # at the first \' inside the embedded viewer and truncate the template.
    m = re.search(r"const FINAL_HTML = '((?:[^'\\]|\\.)*)';", js, re.S)
    if not m:
        raise SystemExit(f"FINAL_HTML not found in {built}. {_RUN_MAVEN_HINT}")
    html = _js_unescape(m.group(1))
    if "{source_data}" not in html:
        raise SystemExit(f"FINAL_HTML in {built} has no {{source_data}} placeholder "
                         f"(stale build?). {_RUN_MAVEN_HINT}")
    return html


def read_project_version(web: Path) -> str:
    """Read <version> from web/pom.xml (to locate the matching release zip)."""
    pom = (web / "pom.xml").read_text(encoding="utf-8")
    m = re.search(r"<version>\s*([^<]+?)\s*</version>", pom)
    if not m:
        raise SystemExit("could not read <version> from web/pom.xml")
    return m.group(1)


def add_to_release_zip(zip_path: Path, program: Path, arcname: str = "python/indexer.py") -> None:
    """Add (or replace) ``program`` inside an existing release zip as ``arcname``.

    Maven builds the HTML+JS-only release zip; this drops the Python program in
    afterwards, so the Maven and Python builds stay decoupled.
    """
    if not zip_path.is_file():
        raise SystemExit(f"Release zip {zip_path} not found. {_RUN_MAVEN_HINT}")
    # Rewrite the archive without any existing python/ entry, then append ours.
    tmp_fd, tmp_name = tempfile.mkstemp(suffix=".zip", dir=str(zip_path.parent))
    import os
    os.close(tmp_fd)
    tmp = Path(tmp_name)
    try:
        with zipfile.ZipFile(zip_path, "r") as zin, \
                zipfile.ZipFile(tmp, "w", zipfile.ZIP_DEFLATED) as zout:
            for item in zin.infolist():
                if item.filename == arcname or item.filename.startswith("python/"):
                    continue
                zout.writestr(item, zin.read(item.filename))
            zout.write(program, arcname)
        shutil.move(str(tmp), str(zip_path))
    finally:
        if tmp.exists():
            tmp.unlink()
    print(f"Added {arcname} to {zip_path}")


def gz_b64(data) -> str:
    if isinstance(data, str):
        data = data.encode("utf-8")
    elif not isinstance(data, (bytes, bytearray)):
        data = json.dumps(data, separators=(",", ":"), ensure_ascii=False).encode("utf-8")
    return base64.b64encode(gzip.compress(data, 9)).decode("ascii")


def replace_assignment(src: str, name: str, b64: str) -> str:
    # Emit the literal as adjacent string fragments so no single source line is
    # absurdly long.
    fragments = '"\n"'.join(b64[i:i + 16000] for i in range(0, len(b64), 16000))
    literal = f'{name} = (\n"{fragments}"\n)'
    pattern = re.compile(rf'^{name} = ""$', re.M)
    if not pattern.search(src):
        raise SystemExit(f"placeholder for {name} not found")
    return pattern.sub(lambda _m: literal, src, count=1)


def main():
    here = Path(__file__).resolve()
    ap = argparse.ArgumentParser()
    ap.add_argument("--web-dir", default=str(here.parents[2] / "web"))
    ap.add_argument("--in", dest="infile",
                    default=str(here.parents[1] / "src/ml_media_archive/indexer.py"))
    ap.add_argument("--out", dest="outfile",
                    default=str(here.parents[1] / "dist/indexer.py"))
    ap.add_argument("--no-zip", action="store_true",
                    help="Only generate dist/indexer.py; do not add it to the release zip.")
    args = ap.parse_args()

    web = Path(args.web_dir)
    src = Path(args.infile).read_text(encoding="utf-8")

    print("Loading cities ...")
    cities = load_cities(web)
    print("Loading OWL-ViT labels ...")
    labels = load_owlvit_labels(web)
    print("Loading FINAL_HTML ...")
    final_html = load_final_html(web)

    # Embed the data (gzip + base64) into the single, self-contained program.
    src = replace_assignment(src, "CITIES_GZ_B64", gz_b64(cities))
    src = replace_assignment(src, "OWLVIT_LABELS_GZ_B64", gz_b64(labels))
    src = replace_assignment(src, "FINAL_HTML_GZ_B64", gz_b64(final_html))

    out = Path(args.outfile)
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(src, encoding="utf-8")
    print(f"Wrote {out} ({out.stat().st_size / 1e6:.2f} MB)")

    if not args.no_zip:
        version = read_project_version(web)
        zip_path = web.parent / "shared" / "releases" / f"release_{version}.zip"
        add_to_release_zip(zip_path, out)


if __name__ == "__main__":
    main()
