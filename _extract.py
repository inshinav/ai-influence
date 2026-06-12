# -*- coding: utf-8 -*-
import re, sys, io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

path = sys.argv[1]
raw = open(path, encoding='utf-8', errors='replace').read()
print('FILE SIZE:', len(raw))

# Russian strings in quotes
pat = re.compile(r'"([^"\\]*[Ѐ-ӿ][^"\\]*)"|\'([^\'\\]*[Ѐ-ӿ][^\'\\]*)\'')
seen = []
for m in pat.finditer(raw):
    s = (m.group(1) or m.group(2)).strip()
    if s and s not in seen:
        seen.append(s)
print('RUS STRINGS:', len(seen))
for s in seen:
    print('|', s[:400])

print('--- REL URLS ---')
for u in sorted(set(re.findall(r'["\'](/[a-zA-Z0-9_/${}.-]{2,90})["\']', raw))):
    print(u)

print('--- IMPORTS ---')
for u in sorted(set(re.findall(r'import\("\./([^"]+)"\)|from"\./([^"]+)"', raw))):
    print([x for x in u if x])
