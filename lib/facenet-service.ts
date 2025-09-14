/**
 * Facenet512 Service using DeepFace
 * Provides 512-dim embeddings with high accuracy
 */

import { spawn } from 'child_process'
import path from 'path'

export interface FacenetResult {
  success: boolean
  embedding?: number[]
  dimension?: number
  distance?: number
  similarity?: number
  is_match?: boolean
  matches?: Array<{
    index: number
    name: string
    distance: number
    similarity: number
    is_match: boolean
  }>
  best_match?: {
    index: number
    name: string
    distance: number
    similarity: number
    is_match: boolean
  }
  threshold?: number
  error?: string
}

export class FacenetService {
  private pythonPath: string
  private servicePath: string

  constructor() {
    this.pythonPath = path.join(process.cwd(), 'python')
    this.servicePath = path.join(this.pythonPath, 'face_recognition_service.py')
  }

  /**
   * Extract 512-dim embedding from image buffer
   */
  async extractEmbedding(imageBuffer: Buffer): Promise<FacenetResult> {
    try {
      console.log('[Facenet] Extracting 512-dim embedding...')
      
      // Convert buffer to base64
      const base64Image = imageBuffer.toString('base64')
      
      // Prepare request
      const request = {
        type: 'extract_embedding',
        data: {
          image: base64Image
        }
      }

      // Call Python service
      const result = await this.callPythonService(request)
      
      if (result.success) {
        console.log(`[Facenet] Successfully extracted ${result.dimension}-dim embedding`)
      } else {
        console.log(`[Facenet] Failed to extract embedding: ${result.error}`)
      }
      
      return result
    } catch (error) {
      console.error('[Facenet] Error extracting embedding:', error)
      return {
        success: false,
        error: `Facenet service error: ${error}`
      }
    }
  }

  /**
   * Calculate cosine distance between two embeddings
   */
  async calculateDistance(embedding1: number[], embedding2: number[]): Promise<FacenetResult> {
    try {
      console.log('[Facenet] Calculating cosine distance...')
      
      const request = {
        type: 'calculate_distance',
        data: {
          embedding1,
          embedding2
        }
      }

      const result = await this.callPythonService(request)
      
      if (result.success) {
        console.log(`[Facenet] Distance: ${result.distance?.toFixed(4)}, Similarity: ${(result.similarity! * 100).toFixed(2)}%`)
      }
      
      return result
    } catch (error) {
      console.error('[Facenet] Error calculating distance:', error)
      return {
        success: false,
        error: `Distance calculation error: ${error}`
      }
    }
  }

  /**
   * Compare face with multiple stored embeddings
   */
  async compareFaces(
    imageBuffer: Buffer, 
    storedEmbeddings: Array<{ name: string; embedding: number[] }>
  ): Promise<FacenetResult> {
    try {
      console.log(`[Facenet] Comparing face with ${storedEmbeddings.length} stored embeddings...`)
      
      // Convert buffer to base64
      const base64Image = imageBuffer.toString('base64')
      
      const request = {
        type: 'compare_faces',
        data: {
          image: base64Image,
          embeddings: storedEmbeddings
        }
      }

      const result = await this.callPythonService(request)
      
      if (result.success && result.best_match) {
        console.log(`[Facenet] Best match: ${result.best_match.name} (${(result.best_match.similarity * 100).toFixed(2)}%)`)
      }
      
      return result
    } catch (error) {
      console.error('[Facenet] Error comparing faces:', error)
      return {
        success: false,
        error: `Face comparison error: ${error}`
      }
    }
  }

  /**
   * Call Python service with request
   */
  private async callPythonService(request: any): Promise<FacenetResult> {
    return new Promise((resolve, reject) => {
      const scriptPath = path.join(this.pythonPath, 'face_recognition_service.py')
      
      const python = spawn('.venv\\Scripts\\python.exe', [scriptPath], {
        stdio: ['pipe', 'pipe', 'pipe'],
        cwd: process.cwd()
      })

      let output = ''
      let errorOutput = ''
      let isResolved = false

      python.stdout.on('data', (data) => {
        output += data.toString()
      })

      python.stderr.on('data', (data) => {
        errorOutput += data.toString()
      })

      python.on('error', (error) => {
        if (!isResolved) {
          isResolved = true
          console.error('[Facenet] Python service error:', error)
          reject(error)
        }
      })

      python.on('close', (code) => {
        if (isResolved) return
        
        isResolved = true
        
        if (code !== 0) {
          console.error('[Facenet] Python service failed with code:', code)
          console.error('[Facenet] Error output:', errorOutput)
          reject(new Error(`Python service failed with code ${code}`))
          return
        }

        try {
          if (output.trim()) {
            const result = JSON.parse(output)
            resolve(result)
          } else {
            reject(new Error('No output from Python service'))
          }
        } catch (parseError) {
          console.error('[Facenet] Failed to parse Python output:', parseError)
          console.error('[Facenet] Raw output:', output)
          console.error('[Facenet] Error output:', errorOutput)
          reject(new Error('Invalid Python service response'))
        }
      })

      // Send request to Python service
      try {
        python.stdin.write(JSON.stringify(request))
        python.stdin.end()
      } catch (sendError) {
        if (!isResolved) {
          isResolved = true
          reject(sendError)
        }
      }
    })
  }

  /**
   * Check if Python service is available
   */
  async checkService(): Promise<boolean> {
    try {
      // Create a simple test request
      const testRequest = {
        type: 'extract_embedding',
        data: {
          image: 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==' // 1x1 pixel PNG
        }
      }
      
      const result = await this.callPythonService(testRequest)
      return result.success !== undefined // Service responded
    } catch (error) {
      console.error('[Facenet] Service check failed:', error)
      return false
    }
  }
}

// Export singleton instance
export const facenetService = new FacenetService()
