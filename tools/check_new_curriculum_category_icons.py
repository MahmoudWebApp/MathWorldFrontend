#!/usr/bin/env python3
"""Only approved MathWorld original category pictograms; no changes to core logos."""
from pathlib import Path
from xml.etree import ElementTree
ROOT=Path(__file__).resolve().parents[1]
EXPECTED={
 "number-sense","measurement-units","signed-rationals","linear-inequalities",
 "probability-compound","exponential-logarithms","analytic-geometry","vectors",
 "mathematical-statistics","numerical-analysis","optimization",
}
for slug in sorted(EXPECTED):
    path=ROOT/"public"/"category-icons"/f"{slug}.svg"
    assert path.is_file(),f"Missing category icon: {path}"
    src=path.read_text(encoding="utf-8")
    svg=ElementTree.fromstring(src)
    assert svg.tag=="{http://www.w3.org/2000/svg}svg"
    assert svg.get("viewBox")=="0 0 64 64"
    assert svg.get("role")=="img"
    assert "MathWorld" in svg.get("aria-label","")
    assert 'fill="url(#mw)"' in src
    assert '#125142' in src and '#21785F' in src and '#3FA784' in src
    assert "<script" not in src and "<image" not in src and "href=" not in src
    assert len(svg.findall(".//{http://www.w3.org/2000/svg}path"))>=2
print(f"PASS: {len(EXPECTED)} original SVG category icons with aligned branding and valid XML")
