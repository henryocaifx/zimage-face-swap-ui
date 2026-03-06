// FaceSwap Pro Logic

// Hardcoded workflow to avoid CORS/fetch issues when running without a dev server.
const workflowJSON = `{
  "6": {
    "inputs": {
      "text": ["962", 0],
      "clip": ["164", 0]
    },
    "class_type": "CLIPTextEncode",
    "_meta": { "title": "CLIP Text Encode (Positive Prompt)" }
  },
  "7": {
    "inputs": {
      "text": "ugly, deformed, disfigured, poor anatomy\\npoorly drawn hands, feet, face, extra limbs\\nblurry, low quality, jpeg artifacts, low contrast\\nwatermark, signature, out of frame, cut off\\npainting, cartoon, anime, 3d render, illustration",
      "clip": ["164", 0]
    },
    "class_type": "CLIPTextEncode",
    "_meta": { "title": "CLIP Text Encode (Negative Prompt)" }
  },
  "16": {
    "inputs": {
      "unet_name": "z_image_turbo_bf16.safetensors",
      "weight_dtype": "default"
    },
    "class_type": "UNETLoader",
    "_meta": { "title": "Load Diffusion Model" }
  },
  "164": {
    "inputs": {
      "clip_name": "qwen-4b-zimage-heretic-q8.gguf",
      "type": "lumina2"
    },
    "class_type": "CLIPLoaderGGUF",
    "_meta": { "title": "CLIPLoader (GGUF)" }
  },
  "176": {
    "inputs": {
      "vae_name": "zImageTurbo_vae.safetensors"
    },
    "class_type": "VAELoader",
    "_meta": { "title": "Load UltraFlux VAE" }
  },
  "859": {
    "inputs": {
      "shift": 2.75,
      "model": ["16", 0]
    },
    "class_type": "ModelSamplingAuraFlow",
    "_meta": { "title": "ModelSamplingAuraFlow" }
  },
  "860": {
    "inputs": {
      "samples": ["979", 0],
      "vae": ["176", 0]
    },
    "class_type": "VAEDecode",
    "_meta": { "title": "VAE Decode" }
  },
  "866": {
    "inputs": {
      "filename_prefix": "2026-03-06/ComfyUI_Image",
      "images": ["860", 0]
    },
    "class_type": "SaveImage",
    "_meta": { "title": "Output 1 Pre-Face Detail" }
  },
  "939": {
    "inputs": {
      "confidence_threshold": 0.33,
      "text_prompt": "face",
      "max_detections": 1,
      "sam3_model": ["940", 0],
      "image": ["860", 0]
    },
    "class_type": "SAM3Grounding",
    "_meta": { "title": "SAM3 Text Segmentation" }
  },
  "940": {
    "inputs": {
      "precision": "auto",
      "attention": "auto",
      "compile": false
    },
    "class_type": "LoadSAM3Model",
    "_meta": { "title": "(down)Load SAM3 Model" }
  },
  "942": {
    "inputs": {
      "downscale_algorithm": "bilinear",
      "upscale_algorithm": "bicubic",
      "preresize": false,
      "preresize_mode": "ensure minimum resolution",
      "preresize_min_width": 1024,
      "preresize_min_height": 1024,
      "preresize_max_width": 16384,
      "preresize_max_height": 16384,
      "mask_fill_holes": false,
      "mask_expand_pixels": 0,
      "mask_invert": false,
      "mask_blend_pixels": 32,
      "mask_hipass_filter": 0.1,
      "extend_for_outpainting": false,
      "extend_up_factor": 1,
      "extend_down_factor": 1,
      "extend_left_factor": 1,
      "extend_right_factor": 1,
      "context_from_mask_extend_factor": 1.2,
      "output_resize_to_target_size": true,
      "output_target_width": 1080,
      "output_target_height": 720,
      "output_padding": "32",
      "device_mode": "gpu (much faster)",
      "image": ["860", 0],
      "mask": ["939", 0]
    },
    "class_type": "InpaintCropImproved",
    "_meta": { "title": "✂️ Inpaint Crop" }
  },
  "943": {
    "inputs": {
      "noise_mask": true,
      "positive": ["944", 0],
      "negative": ["945", 0],
      "vae": ["957", 0],
      "pixels": ["942", 1],
      "mask": ["942", 2]
    },
    "class_type": "InpaintModelConditioning",
    "_meta": { "title": "InpaintModelConditioning" }
  },
  "944": {
    "inputs": {
      "text": ["975", 0],
      "clip": ["164", 0]
    },
    "class_type": "CLIPTextEncode",
    "_meta": { "title": "CLIP Text Encode (Prompt)" }
  },
  "945": {
    "inputs": {
      "conditioning": ["944", 0]
    },
    "class_type": "ConditioningZeroOut",
    "_meta": { "title": "ConditioningZeroOut" }
  },
  "946": {
    "inputs": {
      "mask": ["942", 2]
    },
    "class_type": "MaskToImage",
    "_meta": { "title": "Convert Mask to Image" }
  },
  "947": {
    "inputs": {
      "samples": ["985", 0],
      "vae": ["957", 0]
    },
    "class_type": "VAEDecode",
    "_meta": { "title": "VAE Decode" }
  },
  "949": {
    "inputs": {
      "strength": 1,
      "model": ["983", 0]
    },
    "class_type": "DifferentialDiffusion",
    "_meta": { "title": "Differential Diffusion" }
  },
  "950": {
    "inputs": {
      "stitcher": ["942", 0],
      "inpainted_image": ["947", 0]
    },
    "class_type": "InpaintStitchImproved",
    "_meta": { "title": "✂️ Inpaint Stitch" }
  },
  "954": {
    "inputs": {
      "images": ["939", 1]
    },
    "class_type": "PreviewImage",
    "_meta": { "title": "Preview Mask for Face" }
  },
  "955": {
    "inputs": {
      "images": ["946", 0]
    },
    "class_type": "PreviewImage",
    "_meta": { "title": "Preview Image" }
  },
  "957": {
    "inputs": {
      "vae_name": "zImageTurbo_vae.safetensors"
    },
    "class_type": "VAELoader",
    "_meta": { "title": "Load VAE" }
  },
  "958": {
    "inputs": {
      "image": "105694312-4ED2-DAVOS-MattDamon-012319.jpg"
    },
    "class_type": "LoadImage",
    "_meta": { "title": "Source Image" }
  },
  "959": {
    "inputs": {
      "vae_name": "zImageTurbo_vae.safetensors"
    },
    "class_type": "VAELoader",
    "_meta": { "title": "Load VAE" }
  },
  "960": {
    "inputs": {
      "pixels": ["973", 0],
      "vae": ["959", 0]
    },
    "class_type": "VAEEncode",
    "_meta": { "title": "VAE Encode" }
  },
  "961": {
    "inputs": {
      "preview": "Automated prompt from UI setup",
      "previewMode": null,
      "source": ["962", 0]
    },
    "class_type": "PreviewAny",
    "_meta": { "title": "Prompt Preview" }
  },
  "962": {
    "inputs": {
      "model_name": "Qwen3-VL-4B-Instruct",
      "quantization": "None (FP16)",
      "attention_mode": "auto",
      "preset_prompt": "🖼️ Ultra Detailed Description",
      "custom_prompt": "Write a prompt about the face and expression of this image using the exact instructions provided:\\n\\nPlease avoid using generic gendered terms such as “man,” “woman,” “boy,” or “girl.” These can introduce model bias.\\nInstead, use specific, fictional but realistic personal descriptors such as:\\n \\n* Louis Koo\\n\\nAll identities must be fictional but grounded in realistic cultural, geographic, and demographic context.\\n\\n\\nFollow this structural order:\\n \\n1. Subject(s)\\n2. Clothing\\n3. Pose & expression\\n4. Environment\\n5. Lighting\\n6. Camera angle / framing\\n7. Material details\\n8. nsfw details and be specific\\n\\n\\n \\n* Do not use stylization tags\\n* Do not add fictional elements\\n* Do not add metaphors or emotions\\n* Do not change the setting unless told\\n* Do not output anything except the final prompt\\n* Do not mention watermarks.\\n* Do not mention mutable traits such as ethnicity, body type, skin colour, hair style, etc.\\n* Do not exclude nsfw elements of the image\\n\\nYou may use terms from this list that correspond to the image: \\n\\nperspective\\ndepth of field\\nfisheye\\nforeshortening\\nvanishing point\\nleading lines\\nrule of thirds\\nclose-up\\ncandid portrait\\nshot on Canon Eos\\nRing LIght\\nRAW photo\\nblurred background\\nbeauty shot\\neye level\\nlow angle\\nhigh angle\\nbird's-eye view\\naerial view\\ntop-down\\nworm's-eye view\\noverhead\\nclose-up\\nextreme close-up\\nmedium shot\\nmedium close-up\\nmedium long shot\\nlong shot\\nwide shot\\nextreme wide shot\\nestablishing shot\\nfull body\\nthree-quarter shot\\nprofile view\\nside view\\nrear view\\nfront view\\nheadshot\\nshoulder-up\\nwaist-up\\nknee-up\\nover-the-shoulder\\nPOV\\nfirst-person\\nmirror shot\\nreflection shot\\ntracking shot\\npan shot\\ntilt shot\\nDutch angle\\nground-level\\nhip-level\\nshoulder-level\\naerial panorama\\nwide-angle\\ntelephoto\\n35mm\\n50mm\\n85mm\\nmacro\\ntabletop\\novertop\\nthree-point perspective\\nRAW photo\\n\\n\\n(ONE block of text, no headings)\\n",
      "max_tokens": 800,
      "keep_model_loaded": true,
      "seed": 3792262109,
      "image": ["958", 0]
    },
    "class_type": "AILab_QwenVL",
    "_meta": { "title": "QwenVL Auto Prompt (reccomend do not change)" }
  },
  "973": {
    "inputs": {
      "width": 1080,
      "height": 720,
      "upscale_method": "nearest-exact",
      "keep_proportion": "crop",
      "pad_color": "0, 0, 0",
      "crop_position": "center",
      "divisible_by": 64,
      "device": "cpu",
      "image": ["958", 0]
    },
    "class_type": "ImageResizeKJv2",
    "_meta": { "title": "Resize Image (choose a common size to crop to)" }
  },
  "975": {
    "inputs": {
      "model_name": "Qwen3-VL-4B-Instruct",
      "quantization": "None (FP16)",
      "attention_mode": "auto",
      "preset_prompt": "🖼️ Simple Description",
      "custom_prompt": "describe the facial expression and direction of the look - absolutely nothing else",
      "max_tokens": 100,
      "keep_model_loaded": true,
      "seed": 2084130030,
      "image": ["958", 0]
    },
    "class_type": "AILab_QwenVL",
    "_meta": { "title": "QwenVL-Mod" }
  },
  "978": {
    "inputs": {
      "randomize_percent": 50,
      "strength": 20,
      "noise_insert": "noise on beginning steps",
      "steps_switchover_percent": 20,
      "seed": 1057614581093802,
      "mask_starts_at": "beginning",
      "mask_percent": 0,
      "log_to_console": false,
      "conditioning": ["6", 0]
    },
    "class_type": "SeedVarianceEnhancer",
    "_meta": { "title": "SeedVarianceEnhancer" }
  },
  "979": {
    "inputs": {
      "eta": 0.52,
      "sampler_name": "exponential/res_3s",
      "scheduler": "linear_quadratic",
      "steps": 9,
      "steps_to_run": 9,
      "denoise": 0.31,
      "cfg": 1,
      "seed": 706618095405219,
      "sampler_mode": "standard",
      "bongmath": true,
      "model": ["983", 0],
      "positive": ["978", 0],
      "negative": ["7", 0],
      "latent_image": ["960", 0]
    },
    "class_type": "ClownsharKSampler_Beta",
    "_meta": { "title": "ClownsharKSampler" }
  },
  "983": {
    "inputs": {
      "lora_name": "nicholas-tse.safetensors",
      "strength_model": 1,
      "model": ["859", 0]
    },
    "class_type": "LoraLoaderModelOnly",
    "_meta": { "title": "Character Lora here" }
  },
  "984": {
    "inputs": {
      "images": ["950", 0]
    },
    "class_type": "PreviewImage",
    "_meta": { "title": "Output 2 Post-Face Detail" }
  },
  "985": {
    "inputs": {
      "eta": 0.52,
      "sampler_name": "exponential/res_3s",
      "scheduler": "linear_quadratic",
      "steps": 9,
      "steps_to_run": 9,
      "denoise": 0.15,
      "cfg": 1,
      "seed": 442827798732825,
      "sampler_mode": "standard",
      "bongmath": true,
      "model": ["949", 0],
      "positive": ["943", 0],
      "negative": ["943", 1],
      "latent_image": ["943", 2]
    },
    "class_type": "ClownsharKSampler_Beta",
    "_meta": { "title": "ClownsharKSampler" }
  }
}`;

// UI Elements
const dropZone = document.getElementById('dropZone');
const imageUpload = document.getElementById('imageUpload');
const imagePreview = document.getElementById('imagePreview');
const uploadContent = document.getElementById('uploadContent');
const form = document.getElementById('swapForm');
const loraInput = document.getElementById('loraInput');
const submitBtn = document.getElementById('submitBtn');
const btnText = document.querySelector('.btn-text');
const loadingSpinner = document.getElementById('loadingSpinner');
const statusPanel = document.getElementById('statusPanel');
const progressBar = document.getElementById('progressBar');
const statusText = document.getElementById('statusText');
const resultPanel = document.getElementById('resultPanel');
const resultImage = document.getElementById('resultImage');
const downloadBtn = document.getElementById('downloadBtn');
const resetBtn = document.getElementById('resetBtn');
const apiUrlInput = document.getElementById('apiUrl');

// State
let selectedFile = null;
let clientId = Math.random().toString(36).substring(2, 15);
let socket = null;

// Helper to disable UI
function setLoading(isLoading) {
  if (isLoading) {
    submitBtn.disabled = true;
    btnText.classList.add('hidden');
    loadingSpinner.classList.remove('hidden');
    statusPanel.classList.remove('hidden');
    resultPanel.classList.add('hidden');
  } else {
    submitBtn.disabled = false;
    btnText.classList.remove('hidden');
    loadingSpinner.classList.add('hidden');
  }
}

function updateStatus(text, progress = null) {
  statusText.innerText = text;
  if (progress !== null) {
    progressBar.style.width = `${progress}%`;
  }
}

// Drag & Drop Handlers
dropZone.addEventListener('dragover', (e) => {
  e.preventDefault();
  dropZone.classList.add('drag-over');
});
dropZone.addEventListener('dragleave', () => dropZone.classList.remove('drag-over'));
dropZone.addEventListener('drop', (e) => {
  e.preventDefault();
  dropZone.classList.remove('drag-over');
  if (e.dataTransfer.files.length) {
    handleFileSelection(e.dataTransfer.files[0]);
  }
});
dropZone.addEventListener('click', () => imageUpload.click());
imageUpload.addEventListener('change', (e) => {
  if (e.target.files.length) handleFileSelection(e.target.files[0]);
});

function handleFileSelection(file) {
  if (!file.type.startsWith('image/')) {
    alert("Please select a valid image file.");
    return;
  }
  selectedFile = file;
  const reader = new FileReader();
  reader.onload = (e) => {
    imagePreview.src = e.target.result;
    imagePreview.classList.remove('hidden');
    uploadContent.classList.add('hidden');
  };
  reader.readAsDataURL(file);
}

// Websocket Setup
function setupWebsocket(baseUrl) {
  // Generate clean URL for WS
  const wsUrl = baseUrl.replace('http://', 'ws://').replace('https://', 'wss://');

  if (socket) socket.close();

  socket = new WebSocket(`${wsUrl}/ws?clientId=${clientId}`);

  socket.onopen = () => console.log('WebSocket connected');

  socket.onmessage = (event) => {
    const msg = JSON.parse(event.data);
    if (msg.type === 'progress') {
      const { value, max } = msg.data;
      const percentage = Math.round((value / max) * 100);
      updateStatus(`Processing nodes... (${percentage}%)`, percentage);
    } else if (msg.type === 'execution_start') {
      updateStatus('Started execution...', 5);
    } else if (msg.type === 'executing') {
      if (msg.data.node === null) {
        updateStatus('Execution complete. Fetching final image...', 100);
      } else {
        updateStatus(`Processing node ${msg.data.node}...`, null);
      }
    } else if (msg.type === 'execution_cached') {
      updateStatus('Restoring previous state from cache...', 20);
    }
  };
}

// ComfyUI API Handlers
async function uploadImage(file, baseUrl) {
  const formData = new FormData();
  formData.append('image', file);

  const response = await fetch(`${baseUrl}/upload/image`, {
    method: 'POST',
    body: formData
  });

  if (!response.ok) throw new Error('Failed to upload image to ComfyUI');
  const data = await response.json();
  return data.name;
}

async function triggerPrompt(promptWorkflow, baseUrl) {
  const response = await fetch(`${baseUrl}/prompt`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt: promptWorkflow, client_id: clientId })
  });

  if (!response.ok) throw new Error('Failed to start ComfyUI workflow');
  const data = await response.json();
  return data.prompt_id;
}

async function pollHistory(promptId, baseUrl) {
  // We will poll /history with an interval until the prompt_id appears
  return new Promise((resolve, reject) => {
    let attempts = 0;
    const interval = setInterval(async () => {
      try {
        attempts++;
        if (attempts > 600) { // arbitrary timeout of 10 minutes (600 seconds)
          clearInterval(interval);
          reject(new Error("Timeout waiting for generation"));
        }

        const response = await fetch(`${baseUrl}/history/${promptId}`);
        if (!response.ok) return; // continue polling

        const history = await response.json();
        if (history[promptId]) {
          clearInterval(interval);
          resolve(history[promptId]);
        }
      } catch (err) {
        console.error("Polling error:", err);
      }
    }, 3000); // Polling every 3 seconds
  });
}

function findOutputImage(historyData) {
  // Finds the output image from PreviewImage node 984, or SaveImage node 866.
  const outputs = historyData.outputs;

  if (outputs["984"] && outputs["984"].images && outputs["984"].images.length > 0) {
    return outputs["984"].images[0];
  }

  // Backup search if 984 is changed
  for (const key in outputs) {
    if (outputs[key].images && outputs[key].images.length > 0) {
      return outputs[key].images[0];
    }
  }
  return null;
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  if (!selectedFile) {
    alert("Please upload a source image first.");
    return;
  }

  let baseUrl = apiUrlInput.value.trim().replace(/\/$/, '');
  const loraName = loraInput.value.trim();

  setLoading(true);
  updateStatus("Connecting to ComfyUI...", 5);

  try {
    setupWebsocket(baseUrl);

    // 1. Upload the selected file to ComfyUI Server
    updateStatus("Uploading image...", 10);
    const uploadedFilename = await uploadImage(selectedFile, baseUrl);

    // 2. Manipulate JSON logic
    updateStatus("Preparing face swap pipeline...", 20);
    const workflow = JSON.parse(workflowJSON);

    // Modify nodes dynamically based on User Settings
    workflow["958"].inputs.image = uploadedFilename;
    workflow["983"].inputs.lora_name = loraName;

    // Force output to 2K resolution (2560x1440)
    workflow["973"].inputs.width = 2560;
    workflow["973"].inputs.height = 1440;
    workflow["942"].inputs.output_target_width = 2560;
    workflow["942"].inputs.output_target_height = 1440;

    // Randomize seeds to ensure fresh generation
    workflow["979"].inputs.seed = Math.floor(Math.random() * Number.MAX_SAFE_INTEGER);
    workflow["985"].inputs.seed = Math.floor(Math.random() * Number.MAX_SAFE_INTEGER);
    workflow["978"].inputs.seed = Math.floor(Math.random() * Number.MAX_SAFE_INTEGER) % 100000;
    workflow["962"].inputs.seed = Math.floor(Math.random() * Number.MAX_SAFE_INTEGER) % 100000;
    workflow["975"].inputs.seed = Math.floor(Math.random() * Number.MAX_SAFE_INTEGER) % 100000;

    // 3. Send Prompt Request
    updateStatus("Starting execution...", 30);
    const promptId = await triggerPrompt(workflow, baseUrl);

    // 4. Poll / Wait for complete
    const finalHistory = await pollHistory(promptId, baseUrl);

    // 5. Retrieve output
    updateStatus("Downloading final result...", 95);
    const outImgRef = findOutputImage(finalHistory);

    if (!outImgRef) {
      throw new Error("No output image returned from the workflow history.");
    }

    const finalImgUrl = `${baseUrl}/view?filename=${encodeURIComponent(outImgRef.filename)}&type=${encodeURIComponent(outImgRef.type)}&subfolder=${encodeURIComponent(outImgRef.subfolder)}&r=${Math.random()}`;

    // Setup Result screen
    resultImage.src = finalImgUrl;

    downloadBtn.onclick = async () => {
      const resp = await fetch(finalImgUrl);
      const blob = await resp.blob();
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `FaceSwap-${promptId}.png`;
      a.click();
      URL.revokeObjectURL(a.href);
    };

    setLoading(false);
    statusPanel.classList.add('hidden');
    resultPanel.classList.remove('hidden');

  } catch (err) {
    setLoading(false);
    updateStatus(`Error: ${err.message}`, 0);
    console.error(err);
    alert(`Failed: ${err.message}. Please insure ComfyUI is running exactly at the given URL with --enable-cors-header=*`);
  }
});

resetBtn.addEventListener('click', () => {
  selectedFile = null;
  imagePreview.src = '';
  imagePreview.classList.add('hidden');
  uploadContent.classList.remove('hidden');
  resultPanel.classList.add('hidden');

  // Optionally trigger form reset for loras, etc. We probably want to keep the LORA.
  // form.reset();
});
