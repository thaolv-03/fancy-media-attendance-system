/**
 * Basic Anti-Spoofing Module using ONNX Model
 * This version does not use face detection before liveness check.
 */

import * as ort from "onnxruntime-node";
import sharp from "sharp";
import { promises as fs } from "fs";
import path from "path";

// Simplified interfaces
interface AntiSpoofingDetails {
  modelScore: number;
  threshold: number;
  processingTime: number;
}

interface AntiSpoofingResult {
  isLive: boolean;
  confidence: number;
  reasons: string[];
  details: AntiSpoofingDetails;
}

export class AntiSpoofingDetector {
  private session: ort.InferenceSession | null = null;
  private readonly MODEL_URL = "https://github.com/hairymax/Face-AntiSpoofing/raw/main/saved_models/AntiSpoofing_bin_128.onnx";
  private readonly MODEL_PATH = path.join(process.cwd(), "models", "AntiSpoofing_bin_128.onnx");
  private readonly INPUT_SIZE = 128;
  private isModelReady = false;
  private readyPromise: Promise<void>;
  private readonly LIVENESS_THRESHOLD: number = 0.5;

  constructor() {
    this.readyPromise = this.initializeModels();
  }

  private async initializeModels(): Promise<void> {
    try {
      console.log("[AntiSpoofing-Simple] Initializing model...");
      await fs.mkdir(path.dirname(this.MODEL_PATH), { recursive: true });

      if (!(await this.fileExists(this.MODEL_PATH))) {
        console.log("[AntiSpoofing-Simple] Downloading anti-spoofing model...");
        await this.downloadModel(this.MODEL_URL, this.MODEL_PATH);
      }

      this.session = await ort.InferenceSession.create(this.MODEL_PATH, {
        executionProviders: ["cpu"],
        graphOptimizationLevel: "all",
      });

      this.isModelReady = true;
      console.log("[AntiSpoofing-Simple] Model loaded successfully.");
    } catch (error) {
      console.error("[AntiSpoofing-Simple] Failed to initialize model:", error);
      this.isModelReady = false;
      throw error;
    }
  }

  private async downloadModel(url: string, filePath: string): Promise<void> {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Failed to download model from ${url}`);
    const buffer = await response.arrayBuffer();
    await fs.writeFile(filePath, Buffer.from(buffer));
  }

  private async fileExists(filePath: string): Promise<boolean> {
    try {
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }

  async detectLiveness(imageBuffer: Buffer): Promise<AntiSpoofingResult> {
    const startTime = Date.now();
    await this.readyPromise;

    if (!this.isModelReady || !this.session) {
      // Correctly call buildResult with 4 arguments
      return this.buildResult(false, 0, ["Model không sẵn sàng"], startTime);
    }

    try {
      const preprocessedData = await this.preprocessImage(imageBuffer);
      const modelScore = await this.runONNXInference(preprocessedData);
      const isLive = modelScore >= this.LIVENESS_THRESHOLD;
      const reasons = isLive ? [] : ["Model phát hiện có dấu hiệu giả mạo"];

      return this.buildResult(isLive, modelScore, reasons, startTime);
    } catch (error) {
      console.error("[AntiSpoofing-Simple] Error during liveness detection:", error);
      // Correctly call buildResult with 4 arguments
      return this.buildResult(false, 0, ["Lỗi hệ thống trong quá trình kiểm tra"], startTime);
    }
  }

  private async preprocessImage(imageBuffer: Buffer): Promise<Float32Array> {
    const resizedBuffer = await sharp(imageBuffer)
      .resize(this.INPUT_SIZE, this.INPUT_SIZE, { fit: 'fill' })
      .raw()
      .toBuffer();

    const pixels = new Uint8Array(resizedBuffer);
    const float32Data = new Float32Array(3 * this.INPUT_SIZE * this.INPUT_SIZE);
    const mean = 0.5 * 255;
    const std = 0.5 * 255;

    for (let i = 0; i < this.INPUT_SIZE * this.INPUT_SIZE; i++) {
      float32Data[i] = (pixels[i * 3] - mean) / std; // R
      float32Data[i + this.INPUT_SIZE * this.INPUT_SIZE] = (pixels[i * 3 + 1] - mean) / std; // G
      float32Data[i + 2 * this.INPUT_SIZE * this.INPUT_SIZE] = (pixels[i * 3 + 2] - mean) / std; // B
    }

    return float32Data;
  }

  private async runONNXInference(preprocessedImage: Float32Array): Promise<number> {
    if (!this.session) throw new Error("ONNX session not initialized");

    const inputName = this.session.inputNames[0];
    const outputName = this.session.outputNames[0];
    const inputTensor = new ort.Tensor("float32", preprocessedImage, [1, 3, this.INPUT_SIZE, this.INPUT_SIZE]);

    const results = await this.session.run({ [inputName]: inputTensor });
    const rawScore = (results[outputName].data as Float32Array)[0];
    const probability = 1 / (1 + Math.exp(-rawScore)); // Sigmoid

    return probability;
  }

  private buildResult(isLive: boolean, modelScore: number, reasons: string[], startTime: number): AntiSpoofingResult {
    const processingTime = Date.now() - startTime;
    return {
      isLive,
      confidence: modelScore,
      reasons,
      details: {
        modelScore,
        threshold: this.LIVENESS_THRESHOLD,
        processingTime,
      },
    };
  }
}

export const antiSpoofingDetector = new AntiSpoofingDetector();
