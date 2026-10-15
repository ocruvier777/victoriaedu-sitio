"""Build a fully standalone platica-standalone.html from platica.html.

platica.html is now a normal site page: it mounts the shared header/footer via
ui.js and loads the JS bundle. The standalone version can't do either, so this
script:

  1. swaps <header data-vic-header> / <footer data-vic-footer> for the minimal
     chrome (whose CSS already lives in platica.html's <style>),
  2. strips the <script src="assets/js/..."> tags,
  3. inlines both CSS files into a <style> block,
  4. resizes and base64-embeds the images.

Google Fonts stays external (public CDN).
"""
import base64
import io
import re
from pathlib import Path

from PIL import Image

ROOT = Path("/home/ocruvier/landing")
SRC = ROOT / "platica.html"
OUT = ROOT / "platica-standalone.html"

CSS_FILES = [
    ROOT / "assets/css/victoria.css",
    ROOT / "assets/css/victoria-marca.css",
]

IMAGES = {
    "uploads/victoriaedu_logo_transparent.png": ("icon", 64, "PNG"),
    "uploads/victoriaedu_logo_light.png": ("logo", 160, "PNG"),
    "uploads/oscar.jpeg": ("profe", 220, "JPEG"),
    "uploads/brando.jpeg": ("profe", 220, "JPEG"),
    "uploads/emiliano.jpeg": ("profe", 220, "JPEG"),
}

CHROME = """<!-- Chrome mínimo (solo en la versión suelta): el header de marca necesita
     ui.js, que aquí no se carga. -->
<header class="platica-chrome">
  <div class="vic-container platica-chrome__inner">
    <a class="platica-chrome__logo" href="#top" aria-label="VictoriaEDU">
      <img src="uploads/victoriaedu_logo_light.png" alt="VictoriaEDU">
    </a>
    <span class="platica-chrome__nota">Plática gratis · Zoom</span>
  </div>
</header>"""

FOOT = """<footer class="platica-foot">
  <div class="vic-container">
    <p>© <span id="year">2026</span> VictoriaEDU · Plataforma educativa independiente, no afiliada al IPN.</p>
    <p>La preparación no garantiza admisión.</p>
  </div>
</footer>"""


def encode_image(path: Path, kind: str, target: int, fmt: str) -> str:
    img = Image.open(path)
    if kind == "profe":
        w, h = img.size
        side = min(w, h)
        left, top = (w - side) // 2, (h - side) // 2
        img = img.crop((left, top, left + side, top + side)).resize((target, target), Image.LANCZOS)
    elif kind == "logo":
        w, h = img.size
        if w > target:
            img = img.resize((target, int(h * target / w)), Image.LANCZOS)
    elif kind == "icon":
        img = img.resize((target, target), Image.LANCZOS)

    buf = io.BytesIO()
    if fmt == "JPEG":
        img.convert("RGB").save(buf, "JPEG", quality=82, optimize=True)
        mime = "image/jpeg"
    else:
        img.save(buf, "PNG", optimize=True)
        mime = "image/png"
    return f"data:{mime};base64,{base64.b64encode(buf.getvalue()).decode('ascii')}"


def sub1(pattern, repl, text, what):
    """re.sub that insists on exactly one replacement, so a markup change in
    platica.html fails the build loudly instead of silently shipping a broken
    standalone file."""
    out, n = re.subn(pattern, lambda _m: repl, text, count=1)
    assert n == 1, f"{what}: expected 1 replacement, got {n}"
    return out


def main() -> None:
    html = SRC.read_text(encoding="utf-8")

    # 0. this file duplicates platica.html, so keep it out of the index in case
    #    it ever gets hosted instead of just emailed.
    html = sub1(
        r'<meta name="description" content="[^"]*">',
        '<meta name="description" content="Plática gratuita por Zoom con tres ingenieros del IPN: '
        'qué esperar el día del examen, qué estudiar y cómo organizarte para la admisión 2027.">\n'
        '<meta name="robots" content="noindex, follow">',
        html,
        "description/robots",
    )

    # 1. shared chrome -> minimal chrome
    html = sub1(r'<!--[^<]*?-->\s*<header data-vic-header[^>]*></header>', CHROME, html, "header")
    html = sub1(r'<footer data-vic-footer></footer>', FOOT, html, "footer")

    # 2. drop the site's JS bundle
    html, n = re.subn(r'\s*<script src="assets/js/[^"]*"></script>', "", html)
    assert n >= 4, f"expected the JS bundle, removed {n} tags"

    # 3. the two stylesheet links -> one inline <style>
    css_blob = ""
    for f in CSS_FILES:
        css_blob += f"\n\n/* ============== inline from {f.name} ============== */\n"
        css_blob += f.read_text(encoding="utf-8")
    html = sub1(
        r'<link rel="stylesheet" href="assets/css/victoria\.css[^>]*>\s*'
        r'<link rel="stylesheet" href="assets/css/victoria-marca\.css[^>]*>',
        f"<style>\n{css_blob}\n</style>",
        html,
        "css links",
    )

    # 4. images -> data: URIs
    for src, (kind, target, fmt) in IMAGES.items():
        data = encode_image(ROOT / src, kind, target, fmt)
        pattern = re.compile(r'(href|src)="' + re.escape(src) + r'"')
        html, n = pattern.subn(lambda m: f'{m.group(1)}="{data}"', html)
        assert n >= 1, f"no replacements for {src}"

    leftover = re.findall(r'(?:href|src)="(?:assets/|uploads/)[^"]*"', html)
    assert not leftover, f"still references local files: {leftover[:5]}"

    OUT.write_text(html, encoding="utf-8")
    print(f"wrote {OUT} ({OUT.stat().st_size // 1024} KB)")


if __name__ == "__main__":
    main()
