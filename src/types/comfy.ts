export interface ComfyNode {
    inputs: Record<string, any>;
    class_type: string;
    _meta?: {
        title: string;
    };
}

export type ComfyWorkflow = Record<string, ComfyNode>;

export interface ComfyUploadResponse {
    name: string;
    subfolder: string;
    type: string;
}

export interface ComfyPromptResponse {
    prompt_id: string;
    number: number;
    node_errors: Record<string, any>;
}

export interface ComfyImageReference {
    filename: string;
    subfolder: string;
    type: string;
}

export interface ComfyHistoryItem {
    prompt: any[];
    outputs: Record<string, { images: ComfyImageReference[] }>;
    status: {
        completed: boolean;
        messages: any[];
    };
}

export type ComfyHistoryResponse = Record<string, ComfyHistoryItem>;

export interface ComfyWSMessage {
    type: string;
    data: any;
}

export interface ComfyWSProgressMessage extends ComfyWSMessage {
    type: 'progress';
    data: {
        value: number;
        max: number;
    };
}

export interface ComfyWSExecutingMessage extends ComfyWSMessage {
    type: 'executing';
    data: {
        node: string | null;
    };
}
