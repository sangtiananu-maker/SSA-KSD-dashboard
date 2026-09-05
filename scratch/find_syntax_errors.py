import re

with open('app.js', 'r', encoding='utf-8') as f:
    code = f.read()

# Find top-level or DOMContentLoaded-level const / let declarations
pattern = r'(?:const|let|var)\s+([a-zA-Z0-9_$]+)\s*='
matches = re.findall(pattern, code)

counts = {}
for m in matches:
    counts[m] = counts.get(m, 0) + 1

duplicates = {k: v for k, v in counts.items() if v > 1}
print("Variables declared more than once:")
for k, v in duplicates.items():
    print(f"  {k}: declared {v} times")
