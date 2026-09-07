with open('powerbi_app.js', 'r', encoding='utf-8') as f:
    code = f.read()

print(f"powerbi_app.js size: {len(code)} characters")

# Check for unclosed backticks, braces, parentheses
b_count = code.count('{') - code.count('}')
p_count = code.count('(') - code.count(')')
sq_count = code.count('[') - code.count(']')

print(f"Brace diff: {b_count}")
print(f"Paren diff: {p_count}")
print(f"Bracket diff: {sq_count}")

if b_count == 0 and p_count == 0 and sq_count == 0:
    print("Syntax balance: PERFECT!")
else:
    print("Syntax balance WARNING: check balances")
