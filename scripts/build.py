#!/usr/bin/env python3
"""
Build script — produces a single self-contained dist/index.html.

Cloudflare Pages settings:
  Build command:    python3 scripts/build.py
  Output directory: dist
"""

import re
import json
import os
import shutil


# ── Data extraction ────────────────────────────────────────────────────────────

def extract_data(root):
    verbs_dir = os.path.join(root, 'src', 'Model', 'verbs')

    with open(os.path.join(verbs_dir, 'index.json'), encoding='utf-8') as f:
        verb_names = json.load(f)

    all_problems = []
    for name in verb_names:
        path = os.path.join(verbs_dir, f'{name}.json')
        if os.path.exists(path):
            with open(path, encoding='utf-8') as f:
                all_problems.extend(json.load(f)['problems'])

    with open(os.path.join(root, 'src', 'Model', 'Definitions.json'), encoding='utf-8') as f:
        defs = json.load(f)

    return all_problems, defs['verbsDictionary'], defs['keywords'], verb_names


# ── Minification ───────────────────────────────────────────────────────────────

def minify_css(css):
    css = re.sub(r'/\*.*?\*/', '', css, flags=re.DOTALL)
    css = re.sub(r'\s+', ' ', css)
    css = re.sub(r'\s*([{};,>~+])\s*', r'\1', css)
    css = re.sub(r'\s*:\s*(?=[^:])', ':', css)  # collapse spaces around : (not ::)
    return css.strip()


def minify_js(js):
    lines = js.split('\n')
    out = []
    for line in lines:
        if line.strip().startswith('//'):
            continue
        out.append(line.rstrip())
    result = '\n'.join(out)
    result = re.sub(r'\n{3,}', '\n', result)
    return result.strip()


# ── Build ──────────────────────────────────────────────────────────────────────

def build():
    root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    dist = os.path.join(root, 'dist')
    os.makedirs(dist, exist_ok=True)

    print('Extracting data...', end=' ', flush=True)
    problems, verbs_dict, keywords_dict, verb_names = extract_data(root)
    print(f'{len(problems)} problems, {len(verb_names)} verbs')

    data_js = (
        f'const problemData={json.dumps(problems, ensure_ascii=False, separators=(",", ":"))};'
        f'const verbsDictionaryData={json.dumps(verbs_dict, ensure_ascii=False, separators=(",", ":"))};'
        f'const keywordsData={json.dumps(keywords_dict, ensure_ascii=False, separators=(",", ":"))};'
        f'const allVerbs={json.dumps(verb_names, ensure_ascii=False, separators=(",", ":"))};'
    )

    with open(os.path.join(root, 'app.js'), encoding='utf-8') as f:
        app_js = minify_js(f.read())

    with open(os.path.join(root, 'style.css'), encoding='utf-8') as f:
        css = minify_css(f.read())

    with open(os.path.join(root, 'index.html'), encoding='utf-8') as f:
        html = f.read()

    html = re.sub(r'\s*<link[^>]+href="style\.css"[^>]*>', '', html)
    html = re.sub(r'\s*<script src="data\.js"></script>', '', html)
    html = re.sub(r'\s*<script src="app\.js"></script>', '', html)
    html = html.replace('href="public/favicon.ico"', 'href="favicon.ico"')
    html = html.replace('href="public/logo192.png"', 'href="logo192.png"')
    html = html.replace('</head>', f'  <style>{css}</style>\n</head>')
    html = html.replace('</body>', f'  <script>{data_js}\n{app_js}</script>\n</body>')

    out_html = os.path.join(dist, 'index.html')
    with open(out_html, 'w', encoding='utf-8') as f:
        f.write(html)

    for name in ['favicon.ico', 'logo192.png', 'logo512.png', 'manifest.json', 'sw.js']:
        src = os.path.join(root, 'public', name)
        if os.path.exists(src):
            shutil.copy2(src, os.path.join(dist, name))

    size_kb = os.path.getsize(out_html) // 1024
    print(f'Built dist/index.html ({size_kb} KB)')


if __name__ == '__main__':
    build()
