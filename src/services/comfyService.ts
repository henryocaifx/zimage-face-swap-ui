import {
    ComfyWorkflow,
    ComfyUploadResponse,
    ComfyPromptResponse,
    ComfyHistoryResponse,
    ComfyImageReference
} from '../types/comfy';

export class ComfyService {
    private baseUrl: string;
    private clientId: string;
    private socket: WebSocket | null = null;

    constructor(baseUrl: string, clientId: string) {
        this.baseUrl = baseUrl.trim().replace(/\/$/, '');
        this.clientId = clientId;
    }

    setBaseUrl(url: string) {
        this.baseUrl = url.trim().replace(/\/$/, '');
    }

    getBaseUrl(): string {
        return this.baseUrl;
    }

    setupWebsocket(onMessage: (msg: any) => void) {
        const wsUrl = this.baseUrl.replace('http://', 'ws://').replace('https://', 'wss://');

        if (this.socket) {
            this.socket.close();
        }

        this.socket = new WebSocket(`${wsUrl}/ws?clientId=${this.clientId}`);

        this.socket.onopen = () => console.log('WebSocket connected');
        this.socket.onmessage = (event) => {
            onMessage(JSON.parse(event.data));
        };

        return this.socket;
    }

    async uploadImage(file: File): Promise<string> {
        const formData = new FormData();
        formData.append('image', file);

        const response = await fetch(`${this.baseUrl}/upload/image`, {
            method: 'POST',
            body: formData
        });

        if (!response.ok) throw new Error('Failed to upload image to ComfyUI');
        const data: ComfyUploadResponse = await response.json();
        return data.name;
    }

    async triggerPrompt(workflow: ComfyWorkflow): Promise<string> {
        const response = await fetch(`${this.baseUrl}/prompt`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt: workflow, client_id: this.clientId })
        });

        if (!response.ok) throw new Error('Failed to start ComfyUI workflow');
        const data: ComfyPromptResponse = await response.json();
        return data.prompt_id;
    }

    async pollHistory(promptId: string): Promise<any> {
        return new Promise((resolve, reject) => {
            let attempts = 0;
            const interval = setInterval(async () => {
                try {
                    attempts++;
                    if (attempts > 600) {
                        clearInterval(interval);
                        reject(new Error("Timeout waiting for generation"));
                    }

                    const response = await fetch(`${this.baseUrl}/history/${promptId}`);
                    if (!response.ok) return;

                    const history: ComfyHistoryResponse = await response.json();
                    if (history[promptId]) {
                        clearInterval(interval);
                        resolve(history[promptId]);
                    }
                } catch (err) {
                    console.error("Polling error:", err);
                }
            }, 3000);
        });
    }

    findOutputImage(historyData: any): ComfyImageReference | null {
        const outputs = historyData.outputs;
        if (outputs["984"] && outputs["984"].images && outputs["984"].images.length > 0) {
            return outputs["984"].images[0];
        }

        for (const key in outputs) {
            if (outputs[key].images && outputs[key].images.length > 0) {
                return outputs[key].images[0];
            }
        }
        return null;
    }

    getViewUrl(imgRef: ComfyImageReference): string {
        const params = new URLSearchParams({
            filename: imgRef.filename,
            type: imgRef.type,
            subfolder: imgRef.subfolder,
            r: Math.random().toString()
        });
        return `${this.baseUrl}/view?${params.toString()}`;
    }
}
