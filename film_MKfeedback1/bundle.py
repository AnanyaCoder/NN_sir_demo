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
import json
import os
import re


def _js_string(s):
    """Encode a string as a safe JS string literal (also escape </script)."""
    return json.dumps(s).replace("</", "<\\/")

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(os.path.dirname(HERE), "TutorBot_Film_MKfeedback1.html")


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
    clip_lessons = datauri("audio/tts_ashutosh.mp3", "audio/mpeg")
    clip_admin = datauri("audio/tts_priya.mp3", "audio/mpeg")

    reel = inline_images(read("reel.js"))
    app = inline_images(read("app.js"))

    # inline the India map so the closing scene works offline (window.__INDIA_SVG__)
    india = read(os.path.join("assets", "india.svg"))
    india_js = "<script>window.__INDIA_SVG__=" + _js_string(india) + ";</script>"

    html = inline_images(read("index.html"))   # inline the Bodhan logo <img> in the gate/brand
    html = html.replace('<link rel="stylesheet" href="styles.css" />', f"<style>\n{css}\n</style>")
    html = re.sub(r'<audio id="music"[^>]*>', f'<audio id="music" preload="auto" loop src="{music}">', html)
    html = re.sub(r'<audio id="clipLessons"[^>]*>', f'<audio id="clipLessons" preload="auto" src="{clip_lessons}">', html)
    html = re.sub(r'<audio id="clipAdmin"[^>]*>', f'<audio id="clipAdmin" preload="auto" src="{clip_admin}">', html)
    html = html.replace('<script src="reel.js"></script>', india_js + f'\n<script>\n{reel}\n</script>')
    html = html.replace('<script src="app.js"></script>', f'<script>\n{app}\n</script>')

    with open(OUT, "w", encoding="utf-8") as f:
        f.write(html)
    print(f"✓ wrote {OUT}  ({os.path.getsize(OUT) / 1e6:.2f} MB) — open by double-click, no server needed")


if __name__ == "__main__":
    main()
