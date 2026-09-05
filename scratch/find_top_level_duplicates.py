import re

with open('app.js', 'r', encoding='utf-8') as f:
    lines = f.readlines()

declarations = {}
for i, line in enumerate(lines):
    # Match declarations at function scope (2 spaces indentation)
    m = re.match(r'^\s{2}(?:const|let|var)\s+([a-zA-Z0-9_$]+)\s*=', line)
    if m:
        var_name = m.group(1)
        if var_name not in declarations:
            declarations[var_name] = []
        declarations[var_name].append(i + 1)

duplicates = {k: v for k, v in declarations.items() if len(v) > 1}
if duplicates:
    print("FATAL SYNTAX ERRORS: Duplicate declarations at 2-space scope:")
    for k, v in duplicates.items():
        print(f"  '{k}' declared at lines: {v}")
else:
    print("SUCCESS: Zero duplicate declarations at 2-space scope!")
