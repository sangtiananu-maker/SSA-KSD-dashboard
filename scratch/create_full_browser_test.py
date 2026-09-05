with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

# Prepend an error collector script right in <head>
head_script = '''
<script>
window.__console_errors = [];
window.onerror = function(msg, url, lineNo, columnNo, error) {
  window.__console_errors.push({ type: 'ONERROR', msg: msg, line: lineNo, col: columnNo, stack: error ? error.stack : '' });
  return false;
};
const origConsoleError = console.error;
console.error = function(...args) {
  window.__console_errors.push({ type: 'CONSOLE_ERROR', args: args.map(a => (a && a.stack) ? a.stack : String(a)) });
  origConsoleError.apply(console, args);
};
</script>
'''

test_script = '''
<div id="automated_test_results" style="padding: 20px; background: #000; color: #0f0; font-family: monospace;">RUNNING TESTS...</div>
<script>
window.addEventListener('load', () => {
  setTimeout(() => {
    const out = [];
    out.push("=== COLLECTED ERRORS ===");
    if (window.__console_errors.length === 0) {
      out.push("No console errors recorded!");
    } else {
      window.__console_errors.forEach((err, idx) => {
        out.push(`Error #${idx+1} [${err.type}]: ${JSON.stringify(err)}`);
      });
    }

    try {
      out.push("=== TESTING FUNCTIONS MANUALLY ===");
      out.push("PAC_DATA keys: " + Object.keys(window.PAC_DATA || {}).join(', '));
      out.push("PAC_DATA.ssa_products_august length: " + (window.PAC_DATA?.ssa_products_august?.length || 'NONE'));
      
      // Check renderSSAAllPacReport directly
      try {
        window.renderSSAAllPacReport();
      } catch (e) {
        out.push("renderSSAAllPacReport threw: " + e.message + " \\n " + e.stack);
      }
    } catch(e) {
      out.push("Manual test error: " + e.message + " \\n " + e.stack);
    }

    document.getElementById('automated_test_results').innerHTML = out.join('<br>');
  }, 1000);
});
</script>
'''

test_html = html.replace('<head>', '<head>\n' + head_script).replace('</body>', test_script + '\n</body>')

with open('scratch/test_index.html', 'w', encoding='utf-8') as f:
    f.write(test_html)

print("Created scratch/test_index.html with error logging!")
