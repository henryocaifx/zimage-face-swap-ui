# AIFX Cast - AI Face Swapping UI

A sleek, high-fidelity web interface for AI face swapping, powered by **ComfyUI**. This project allows users to upload source images, select character models (LoRAs), and generate high-resolution face swaps with a single click.

## ✨ Features

- **Drag & Drop Upload**: Easily upload source images for swapping.
- **Character Selection**: Choose from a variety of pre-configured LoRA characters.
- **Real-time Progress**: Track execution status and node processing via WebSockets.
- **High Resolution**: Automatically scales and inpaints results for 2K quality.
- **Modular Architecture**: Clean separation between UI, Services, and Workflow definitions.
- **Modern Tech Stack**: Built with TypeScript and Vite for a fast, type-safe development experience.

## 🛠️ Tech Stack

- **Runtime**: [Node.js](https://nodejs.org/)
- **Bundler**: [Vite](https://vitejs.dev/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: Vanilla CSS (Modern glassmorphism design)
- **Backend**: [ComfyUI API](https://github.com/comfyanonymous/ComfyUI)

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v16 or higher)
- A running instance of [ComfyUI](http://127.0.0.1:8188) with relevant models installed.

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/henryocaifx/zimage-face-swap-ui.git
   cd zimage-face-swap-ui
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables:
   Copy `.env.example` to `.env` and adjust the `VITE_COMFY_URL` if necessary:
   ```bash
   cp .env.example .env
   ```

### Development

Start the development server with Hot Module Replacement (HMR):
```bash
npm run dev
```
By default, the UI runs at [http://localhost:3000](http://localhost:3000).

### Production Build

Compile and bundle the project for production:
```bash
npm run build
```
The output will be in the `/dist` directory.

## 📂 Project Structure

```text
src/
├── services/       # Service logic for talking to ComfyUI
├── types/          # TypeScript interfaces for API and Workflow
├── main.ts         # UI logic and event handlers
├── workflow.ts     # ComfyUI workflow JSON definition
└── style.css       # App styling (Glassmorphism)
```

## ⚙️ Configuration

- **API Endpoint**: Set the `VITE_COMFY_URL` in your `.env` file to point to your ComfyUI instance.
- **Workflow**: The generation logic is defined in `src/workflow.ts`. You can modify the JSON structure there to update the pipeline.

## 📄 License

&copy; 2026 One Cool AIFX. All rights reserved.

