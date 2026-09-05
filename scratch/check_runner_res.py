import sys, io, re
sys.stdout.reconfigure(encoding='utf-8')

with open('scratch/test_runner_output.html', 'r', encoding='utf-8') as f:
    h = f.read()

m = re.search(r'id="test-results"[^>]*>(.*?)</div>', h, re.DOTALL)
if m:
    print("Test Results:\n" + m.group(1).strip())
else:
    print("test-results div not found")
