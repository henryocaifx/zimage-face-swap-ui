import './style.css';
import { workflow as baseWorkflow } from './workflow';
import { ComfyService } from './services/comfyService';
import { ComfyWSMessage } from './types/comfy';

// UI Elements
const dropZone = document.getElementById('dropZone') as HTMLDivElement;
const imageUpload = document.getElementById('imageUpload') as HTMLInputElement;
const imagePreview = document.getElementById('imagePreview') as HTMLImageElement;
const uploadContent = document.getElementById('uploadContent') as HTMLDivElement;
const form = document.getElementById('swapForm') as HTMLFormElement;
const loraInput = document.getElementById('loraInput') as HTMLSelectElement;
const submitBtn = document.getElementById('submitBtn') as HTMLButtonElement;
const btnText = document.querySelector('.btn-text') as HTMLSpanElement;
const loadingSpinner = document.getElementById('loadingSpinner') as HTMLDivElement;
const statusPanel = document.getElementById('statusPanel') as HTMLDivElement;
const progressBar = document.getElementById('progressBar') as HTMLDivElement;
const statusText = document.getElementById('statusText') as HTMLParagraphElement;
const resultPanel = document.getElementById('resultPanel') as HTMLDivElement;
const resultImage = document.getElementById('resultImage') as HTMLImageElement;
const downloadBtn = document.getElementById('downloadBtn') as HTMLButtonElement;
const resetBtn = document.getElementById('resetBtn') as HTMLButtonElement;
const apiUrlInput = document.getElementById('apiUrl') as HTMLInputElement;

// Constants & State
const DEFAULT_API_URL = import.meta.env.VITE_COMFY_URL || 'http://127.0.0.1:8188';
let selectedFile: File | null = null;
const clientId = Math.random().toString(36).substring(2, 15);
const comfyService = new ComfyService(DEFAULT_API_URL, clientId);

// Initialize UI
window.addEventListener('DOMContentLoaded', () => {
  apiUrlInput.value = DEFAULT_API_URL;
});

// Helper functions (UI logic)
function setLoading(isLoading: boolean) {
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

function updateStatus(text: string, progress: number | null = null) {
  statusText.innerText = text;
  if (progress !== null) {
    progressBar.style.width = `${progress}%`;
  }
}

// Drag & Drop Handlers
dropZone.addEventListener('dragover', (e: DragEvent) => {
  e.preventDefault();
  dropZone.classList.add('drag-over');
});

dropZone.addEventListener('dragleave', () => dropZone.classList.remove('drag-over'));

dropZone.addEventListener('drop', (e: DragEvent) => {
  e.preventDefault();
  dropZone.classList.remove('drag-over');
  if (e.dataTransfer && e.dataTransfer.files.length) {
    handleFileSelection(e.dataTransfer.files[0]);
  }
});

dropZone.addEventListener('click', () => imageUpload.click());

imageUpload.addEventListener('change', (e: Event) => {
  const target = e.target as HTMLInputElement;
  if (target.files && target.files.length) handleFileSelection(target.files[0]);
});

function handleFileSelection(file: File) {
  if (!file.type.startsWith('image/')) {
    alert("Please select a valid image file.");
    return;
  }
  selectedFile = file;
  const reader = new FileReader();
  reader.onload = (e: ProgressEvent<FileReader>) => {
    if (e.target && typeof e.target.result === 'string') {
      imagePreview.src = e.target.result;
      imagePreview.classList.remove('hidden');
      uploadContent.classList.add('hidden');
    }
  };
  reader.readAsDataURL(file);
}

// Socket message handler
const handleSocketMessage = (msg: ComfyWSMessage) => {
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

// Main form submission logic
form.addEventListener('submit', async (e: Event) => {
  e.preventDefault();

  if (!selectedFile) {
    alert("Please upload a source image first.");
    return;
  }

  let baseUrl = apiUrlInput.value.trim().replace(/\/$/, '');

  // Adaptive mapping for other devices
  const hostname = window.location.hostname;
  if (hostname && hostname !== 'localhost' && hostname !== '127.0.0.1' && baseUrl.includes('127.0.0.1')) {
    baseUrl = baseUrl.replace('127.0.0.1', hostname);
    console.log(`Adapting API request to server IP: ${baseUrl}`);
  }

  comfyService.setBaseUrl(baseUrl);
  const loraName = loraInput.value.trim();

  setLoading(true);
  updateStatus("Connecting to ComfyUI...", 5);

  try {
    comfyService.setupWebsocket(handleSocketMessage);

    // 1. Upload the selected file
    updateStatus("Uploading image...", 10);
    const uploadedFilename = await comfyService.uploadImage(selectedFile);

    // 2. Prepare workflow
    updateStatus("Preparing face swap pipeline...", 20);
    const workflow = JSON.parse(JSON.stringify(baseWorkflow)); // Deep copy

    // Modify nodes dynamically
    workflow["958"].inputs.image = uploadedFilename;
    workflow["983"].inputs.lora_name = loraName;

    // Force output to 2K resolution
    workflow["973"].inputs.width = 2560;
    workflow["973"].inputs.height = 1440;
    workflow["942"].inputs.output_target_width = 2560;
    workflow["942"].inputs.output_target_height = 1440;

    // Randomize seeds
    const randomSeed = () => Math.floor(Math.random() * Number.MAX_SAFE_INTEGER);
    workflow["979"].inputs.seed = randomSeed();
    workflow["985"].inputs.seed = randomSeed();
    workflow["978"].inputs.seed = randomSeed() % 100000;
    workflow["962"].inputs.seed = randomSeed() % 100000;
    workflow["975"].inputs.seed = randomSeed() % 100000;

    // 3. Trigger workflow
    updateStatus("Starting execution...", 30);
    const promptId = await comfyService.triggerPrompt(workflow);

    // 4. Poll for results
    const finalHistory = await comfyService.pollHistory(promptId);

    // 5. Retrieve output
    updateStatus("Downloading final result...", 95);
    const outImgRef = comfyService.findOutputImage(finalHistory);

    if (!outImgRef) {
      throw new Error("No output image returned from the workflow history.");
    }

    const finalImgUrl = comfyService.getViewUrl(outImgRef);

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

  } catch (err: any) {
    setLoading(false);
    const errorMsg = `Failed to reach API at: ${baseUrl}\n\nReason: ${err.message}`;
    updateStatus(`Error: ${err.message}`, 0);
    console.error(err);
    alert(errorMsg);
  }
});

resetBtn.addEventListener('click', () => {
  selectedFile = null;
  imagePreview.src = '';
  imagePreview.classList.add('hidden');
  uploadContent.classList.remove('hidden');
  resultPanel.classList.add('hidden');
});

