#!/usr/bin/env python3
"""
bundle.py — inline the whole TutorBot film into one portable, double-click-
openable HTML.

Reads tutorbot/{index.html,styles.css,reel.js,app.js,fonts/*.woff2,
images/*.png,audio/music.mp3} and writes ../TutorBot_Film.html with every
asset embedded as a base64 data URI (audio, fonts, screenshots) or inline
text (css/js). No server or network needed to play it.

Run:  python3 tutorbot/bundle.py
"""
import base64
import os
import re

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(os.path.dirname(HERE), "TutorBot_Film.html")


def read(p):
    return open(os.path.join(HERE, p), encoding="utf-8").read()


def datauri(path, mime):
    with open(os.path.join(HERE, path), "rb") as f:
        return f"data:{mime};base64," + base64.b64encode(f.read()).decode()


def inline_images(js):
    """Replace every images/NAME.png string reference with a data URI."""
    def repl(m):
        rel = m.group(1)
        if os.path.exists(os.path.join(HERE, rel)):
            return '"' + datauri(rel, "image/png") + '"'
        return m.group(0)
    return re.sub(r'"(images/[^"]+\.png)"', repl, js)


def main():
    # css with fonts inlined
    css = read("styles.css")
    for fn in os.listdir(os.path.join(HERE, "fonts")):
        if fn.endswith(".woff2"):
            css = css.replace(f'url("fonts/{fn}")', f'url("{datauri("fonts/" + fn, "font/woff2")}")')

    music = datauri("audio/music.mp3", "audio/mpeg")

    reel = inline_images(read("reel.js"))
    app = inline_images(read("app.js"))

    html = read("index.html")
    html = html.replace('<link rel="stylesheet" href="styles.css" />', f"<style>\n{css}\n</style>")
    html = re.sub(r'<audio id="music"[^>]*>', f'<audio id="music" preload="auto" loop src="{music}">', html)
    html = html.replace('<script src="reel.js"></script>', f'<script>\n{reel}\n</script>')
    html = html.replace('<script src="app.js"></script>', f'<script>\n{app}\n</script>')

    with open(OUT, "w", encoding="utf-8") as f:
        f.write(html)
    print(f"✓ wrote {OUT}  ({os.path.getsize(OUT) / 1e6:.2f} MB) — open by double-click, no server needed")


if __name__ == "__main__":
    main()
