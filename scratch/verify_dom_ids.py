import re

with open('app.js', 'r', encoding='utf-8') as f:
    js = f.read()

with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

# Find all getElementById calls
ids_in_js = set(re.findall(r"getElementById\(['\"]([^'\"]+)['\"]\)", js))

print(f"Total unique IDs queried in app.js: {len(ids_in_js)}")

missing = []
for el_id in sorted(ids_in_js):
    # Check if id="el_id" exists in html
    if f'id="{el_id}"' not in html and f"id='{el_id}'" not in html:
        missing.append(el_id)

if missing:
    print(f"WARNING: {len(missing)} IDs in app.js are missing from index.html:")
    for m in missing:
        print(f"  - {m}")
else:
    print("SUCCESS: 100% of the IDs referenced in app.js exist in index.html!")
