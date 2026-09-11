// ==============================================================================
// Gemma 3 270M In-Browser AI Engine (WebGPU / Transformers.js v3)
// 100% Client-Side, Serverless, Privacy-First, Zero Backend Server Required
// ==============================================================================

(function(window) {
  'use strict';

  const MODEL_ID = 'onnx-community/gemma-3-270m-it-ONNX';
  const CACHE_FLAG_KEY = 'pac_gemma_cached_v1';
  let transformersLib = null;
  let pipelineInstance = null;
  let isInitializing = false;

  // 1. Check if model is already downloaded in browser cache
  async function checkModelCached() {
    try {
      if (localStorage.getItem(CACHE_FLAG_KEY) === 'true') {
        return true;
      }
      if ('caches' in window) {
        const keys = await caches.keys();
        for (const key of keys) {
          if (key.includes('transformers') || key.includes('onnx')) {
            const cache = await caches.open(key);
            const requests = await cache.keys();
            const hasGemma = requests.some(r => r.url.includes('gemma-3-270m') || r.url.includes('onnx-community'));
            if (hasGemma) {
              localStorage.setItem(CACHE_FLAG_KEY, 'true');
              return true;
            }
          }
        }
      }
      return false;
    } catch (e) {
      console.warn('[GemmaEngine] Error checking cache:', e);
      return localStorage.getItem(CACHE_FLAG_KEY) === 'true';
    }
  }

  // 2. Check device hardware capabilities
  function getDeviceCapabilities() {
    const hasWebGPU = typeof navigator !== 'undefined' && 'gpu' in navigator;
    return {
      hasWebGPU: hasWebGPU,
      recommendedDevice: hasWebGPU ? 'webgpu' : 'wasm',
      recommendedDtype: hasWebGPU ? 'q4f16' : 'q4'
    };
  }

  // 3. Download & Initialize Pipeline (with progress callback)
  async function loadGemmaPipeline(onProgress, onStatus) {
    if (pipelineInstance) return pipelineInstance;
    if (isInitializing) throw new Error('กำลังโหลดโมเดลอยู่แล้ว กรุณารอสักครู่');

    isInitializing = true;
    try {
      if (onStatus) onStatus('กำลังเตรียมไลบรารี Transformers.js WebGPU...');
      
      // Dynamic import of Transformers.js (v4.2.0+ self-contained with ONNX runtime bundled)
      if (!transformersLib) {
        transformersLib = await import('https://cdn.jsdelivr.net/npm/@huggingface/transformers@4.2.0/dist/transformers.js');
        transformersLib.env.allowLocalModels = false;
        transformersLib.env.useBrowserCache = true;
      }

      const caps = getDeviceCapabilities();
      if (onStatus) {
        onStatus(`กำลังเริ่มต้นโมเดล Gemma 3 270M (อุปกรณ์: ${caps.hasWebGPU ? 'WebGPU เร่งความเร็วฮาร์ดแวร์' : 'WASM (CPU)'})...`);
      }

      // Track multi-file downloads
      const fileProgressMap = {};
      const handleProgress = (progressData) => {
        if (!progressData) return;
        if (progressData.status === 'progress' && progressData.file) {
          fileProgressMap[progressData.file] = {
            loaded: progressData.loaded || 0,
            total: progressData.total || 0,
            progress: progressData.progress || 0
          };
          
          let totalLoaded = 0;
          let totalSize = 0;
          let maxPct = 0;
          
          for (const k in fileProgressMap) {
            totalLoaded += fileProgressMap[k].loaded;
            totalSize += fileProgressMap[k].total;
            if (fileProgressMap[k].progress > maxPct) {
              maxPct = fileProgressMap[k].progress;
            }
          }

          let overallPercent = totalSize > 0 ? Math.round((totalLoaded / totalSize) * 100) : Math.round(maxPct);
          if (isNaN(overallPercent)) overallPercent = 0;
          if (overallPercent > 100) overallPercent = 100;

          if (onProgress) {
            onProgress({
              percent: overallPercent,
              loadedMB: (totalLoaded / (1024 * 1024)).toFixed(1),
              totalMB: (totalSize / (1024 * 1024)).toFixed(1),
              file: progressData.file
            });
          }
        } else if (progressData.status === 'ready' || progressData.status === 'done') {
          if (onStatus) onStatus(`โหลด ${progressData.file || 'ไฟล์'} สำเร็จแล้ว`);
        }
      };

      // Load text-generation pipeline with auto-fallback
      try {
        pipelineInstance = await transformersLib.pipeline('text-generation', MODEL_ID, {
          device: caps.recommendedDevice,
          dtype: caps.recommendedDtype,
          progress_callback: handleProgress
        });
      } catch (gpuErr) {
        console.warn('[GemmaEngine] WebGPU init failed, falling back to wasm/q4:', gpuErr);
        if (onStatus) onStatus('กำลังสลับไปใช้ WASM (CPU) สำรอง...');
        pipelineInstance = await transformersLib.pipeline('text-generation', MODEL_ID, {
          device: 'wasm',
          dtype: 'q4',
          progress_callback: handleProgress
        });
      }

      localStorage.setItem(CACHE_FLAG_KEY, 'true');
      isInitializing = false;
      if (onStatus) onStatus('โมเดล Gemma 3 270M พร้อมใช้งานแล้ว!');
      return pipelineInstance;
    } catch (err) {
      isInitializing = false;
      console.error('[GemmaEngine] Initialization failed:', err);
      throw err;
    }
  }

  // 4. Generate text with streaming callback
  async function generateResponse(prompt, systemContext, onToken) {
    if (!pipelineInstance) {
      throw new Error('โมเดลยังไม่ได้ถูกโหลด กรุณาเปิดใช้งานก่อน');
    }

    // Build Gemma 3 prompt format
    let fullPrompt = '';
    if (systemContext) {
      fullPrompt += `<start_of_turn>user\n[ข้อมูลและบริบทระบบ]\n${systemContext}\n\n[คำถามของผู้ใช้]\n${prompt}<end_of_turn>\n<start_of_turn>model\n`;
    } else {
      fullPrompt += `<start_of_turn>user\n${prompt}<end_of_turn>\n<start_of_turn>model\n`;
    }

    let fullGeneratedText = '';
    
    // Custom streamer via Transformers.js TextStreamer if available
    let streamer = null;
    if (transformersLib && transformersLib.TextStreamer) {
      streamer = new transformersLib.TextStreamer(pipelineInstance.tokenizer, {
        skip_prompt: true,
        callback_function: (chunk) => {
          fullGeneratedText += chunk;
          if (onToken) onToken(chunk, fullGeneratedText);
        }
      });
    }

    const output = await pipelineInstance(fullPrompt, {
      max_new_tokens: 512,
      temperature: 0.3,
      top_p: 0.9,
      repetition_penalty: 1.1,
      streamer: streamer
    });

    if (!streamer && output && output[0] && output[0].generated_text) {
      let raw = output[0].generated_text;
      const modelMarker = '<start_of_turn>model\n';
      const lastIdx = raw.lastIndexOf(modelMarker);
      if (lastIdx !== -1) {
        fullGeneratedText = raw.substring(lastIdx + modelMarker.length).replace(/<end_of_turn>.*$/s, '').trim();
      } else {
        fullGeneratedText = raw;
      }
      if (onToken) onToken(fullGeneratedText, fullGeneratedText);
    }

    return fullGeneratedText;
  }

  // 5. Clear Browser Cache for Model
  async function clearModelCache() {
    try {
      if ('caches' in window) {
        const keys = await caches.keys();
        for (const key of keys) {
          if (key.includes('transformers') || key.includes('onnx')) {
            await caches.delete(key);
          }
        }
      }
      localStorage.removeItem(CACHE_FLAG_KEY);
      pipelineInstance = null;
      return true;
    } catch (e) {
      console.error('[GemmaEngine] Failed to clear cache:', e);
      return false;
    }
  }

  // 6. Build Rich Context Helpers for Executive Briefing & Store Visit
  function buildExecutiveContext(pacData) {
    if (!pacData) return 'ไม่พบข้อมูลยอดขาย';
    const kpi = pacData.summary_kpis || {};
    const branches = pacData.branches || [];
    const branchNames = pacData.branch_names_th || {};
    const bTotals = pacData.branch_totals_lak || {};
    const bQty = pacData.branch_totals_qty || {};
    
    let summaryText = `สรุปยอดขายร้านยา SSA ประจำเดือน ส.ค. 2026:\n`;
    summaryText += `- ยอดขายรวมทุกสาขา: ${Math.round(kpi.ssa_total_lak || 0).toLocaleString()} กีบ (รวม ${kpi.ssa_total_units || 0} ชิ้น)\n`;
    summaryText += `- ยอดค่าเชียร์รวมล่าสุด: ${Math.round(kpi.latest_official_incentive_thb || 0).toLocaleString()} บาท (${kpi.latest_official_incentive_units || 0} ชิ้น)\n`;
    summaryText += `ยอดขายแยกรายสาขา:\n`;
    branches.forEach(b => {
      const name = branchNames[b] || b;
      const lak = Math.round(bTotals[b] || 0).toLocaleString();
      const qty = (bQty[b] || 0).toLocaleString();
      summaryText += `  * ${name}: ${lak} กีบ (${qty} ชิ้น)\n`;
    });

    // Top 5 Products August
    if (pacData.ssa_products_august && pacData.ssa_products_august.length > 0) {
      const sorted = [...pacData.ssa_products_august].sort((a,b) => (b.total_qty || 0) - (a.total_qty || 0));
      summaryText += `Top 5 ยา PAC ขายดีที่สุดในร้านยา SSA:\n`;
      sorted.slice(0, 5).forEach((p, idx) => {
        summaryText += `  ${idx+1}. ${p.english_name || p.name}: ${p.total_qty || 0} ชิ้น (มูลค่า ${(p.total_lak || 0).toLocaleString()} กีบ)\n`;
      });
    }

    return summaryText;
  }

  function buildStoreVisitContext(pacData, branchId) {
    if (!pacData) return 'ไม่พบข้อมูล';
    const bName = (pacData.branch_names_th && pacData.branch_names_th[branchId]) || branchId;
    const bTotalLak = Math.round((pacData.branch_totals_lak && pacData.branch_totals_lak[branchId]) || 0).toLocaleString();
    const bTotalQty = ((pacData.branch_totals_qty && pacData.branch_totals_qty[branchId]) || 0).toLocaleString();

    let text = `ข้อมูลตรวจเยี่ยมร้านยา ${bName} (${branchId}):\n`;
    text += `- ยอดขายรวมเดือน ส.ค. 2026: ${bTotalLak} กีบ (${bTotalQty} ชิ้น)\n`;

    // Find top products for this branch
    if (pacData.ssa_products_august) {
      const branchItems = pacData.ssa_products_august.map(p => ({
        name: p.english_name || p.name,
        qty: (p.branch_qtys && p.branch_qtys[branchId]) || 0,
        lak: (p.branch_totals_lak && p.branch_totals_lak[branchId]) || 0
      })).filter(p => p.qty > 0).sort((a,b) => b.qty - a.qty);

      text += `สินค้าขายดีเด่นประจำสาขานี้ (Top 5):\n`;
      branchItems.slice(0, 5).forEach((item, idx) => {
        text += `  ${idx+1}. ${item.name}: ${item.qty.toLocaleString()} ชิ้น (${Math.round(item.lak).toLocaleString()} กีบ)\n`;
      });

      // Find Strategic items with 0 sales at this branch (White Space)
      const zeroStrategic = pacData.ssa_products_august.filter(p => {
        const isStrat = p.is_strategic || p.is_pac_star || (p.incentive_rate && p.incentive_rate > 0);
        const qty = (p.branch_qtys && p.branch_qtys[branchId]) || 0;
        return isStrat && qty === 0;
      });

      if (zeroStrategic.length > 0) {
        text += `สินค้ากลยุทธ์/มีค่าเชียร์ ที่สาขานี้ยังไม่มียอดขายเลย (โอกาสขยายยอด White Space):\n`;
        zeroStrategic.slice(0, 5).forEach((p, idx) => {
          text += `  * ${p.english_name || p.name} (ค่าเชียร์ ${p.incentive_rate || '-'} บาท/ชิ้น)\n`;
        });
      }
    }

    return text;
  }

  // Export to window
  window.GemmaEngine = {
    checkModelCached,
    getDeviceCapabilities,
    loadGemmaPipeline,
    generateResponse,
    clearModelCache,
    buildExecutiveContext,
    buildStoreVisitContext,
    isReady: () => !!pipelineInstance
  };

})(window);
