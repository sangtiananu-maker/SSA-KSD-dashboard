with open('app.js', 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Verify boundaries
print("Line 527:", repr(lines[526]))
print("Line 528:", repr(lines[527]))
print("Line 737:", repr(lines[736]))
print("Line 738:", repr(lines[737]))
print("Line 739:", repr(lines[738]))

# We want to keep lines up to index 526 (line 526: };) and from index 738 (line 739: const processSSAData = () => {)
cleaned_lines = lines[:526] + ['\n'] + lines[738:]

with open('app.js', 'w', encoding='utf-8') as f:
    f.writelines(cleaned_lines)

print("Removed duplicate block successfully!")
