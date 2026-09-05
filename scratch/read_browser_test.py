import sys, io, re
sys.stdout.reconfigure(encoding='utf-8')

with open('scratch/test_verify_output.html', 'r', encoding='utf-8') as f:
    h = f.read()

m = re.search(r'id="automated_test_results"[^>]*>(.*?)</div>', h, re.DOTALL)
if m:
    res = m.group(1).replace('<br>', '\n').strip()
    print("=== AUTOMATED BROWSER TEST RESULTS ===")
    print(res)
else:
    print("automated_test_results not found")
