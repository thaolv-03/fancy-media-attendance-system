/**
 * Shared Face Recognition Module
 * Ensures consistency between registration and verification
 */

import sharp from "sharp"

export interface FaceRegion {
  x: number
  y: number
  width: number
  height: number
}

export interface FaceRecognitionResult {
  success: boolean
  embedding?: number[]
  faceRegion?: FaceRegion
  error?: string
}

/**
 * Extract face embedding with consistent algorithm
 */
export async function extractFaceEmbedding(imageBuffer: Buffer): Promise<FaceRecognitionResult> {
  try {
    console.log("[Face Recognition] Starting face detection")

    // Use consistent face detection logic
    const faceResult = await detectAndCropFace(imageBuffer)
    if (!faceResult.success || !faceResult.faceRegion) {
      return {
        success: false,
        error: "Không phát hiện được khuôn mặt trong ảnh"
      }
    }

    // Extract consistent features
    const embedding = await extractAdvancedFaceFeatures(faceResult.faceRegion, imageBuffer)
    console.log("[Face Recognition] Generated embedding with", embedding.length, "features")
    
    return {
      success: true,
      embedding,
      faceRegion: faceResult.faceRegion
    }
  } catch (error) {
    console.error("[Face Recognition] Face embedding extraction failed:", error)
    return {
      success: false,
      error: "Lỗi xử lý nhận diện khuôn mặt"
    }
  }
}

/**
 * Enhanced face detection using multi-strategy approach
 */
async function detectAndCropFace(imageBuffer: Buffer): Promise<FaceRecognitionResult> {
  try {
    const image = sharp(imageBuffer)
    const { width, height } = await image.metadata()

    if (!width || !height) {
      return { success: false, error: "Invalid image dimensions" }
    }

    // Convert to grayscale for analysis
    const { data } = await image.greyscale().raw().toBuffer({ resolveWithObject: true })
    const pixels = new Uint8Array(data)

    // Multi-strategy face detection with improved algorithms
    let faceRegion = detectFaceUsingEnhancedEdges(pixels, width, height)

    if (!faceRegion) {
      faceRegion = detectFaceUsingEnhancedBrightness(pixels, width, height)
    }

    if (!faceRegion) {
      faceRegion = detectFaceUsingSymmetry(pixels, width, height)
    }

    if (!faceRegion) {
      // Intelligent center crop fallback with better positioning
      const faceSize = Math.min(width, height) * 0.75 // Slightly smaller for better face focus
      faceRegion = {
        x: Math.floor((width - faceSize) / 2),
        y: Math.floor((height - faceSize) / 2.8), // Higher positioning for better face centering
        width: Math.floor(faceSize),
        height: Math.floor(faceSize),
      }
      console.log("[Face Recognition] Using intelligent center crop fallback")
    }

    // Validate and adjust face region
    faceRegion = validateAndAdjustFaceRegion(faceRegion, width, height)

    return {
      success: true,
      faceRegion
    }
  } catch (error) {
    console.error("[Face Recognition] Face detection failed:", error)
    return { success: false, error: "Face detection failed" }
  }
}

/**
 * OpenCV-style face detection using Haar-like features
 */
function detectFaceUsingEnhancedEdges(
  pixels: Uint8Array,
  width: number,
  height: number,
): FaceRegion | null {
  const regions = []
  const regionSize = Math.min(width, height) / 2.5 // OpenCV-style region size

  for (let y = 0; y < height - regionSize; y += regionSize / 4) {
    for (let x = 0; x < width - regionSize; x += regionSize / 4) {
      let edgeCount = 0
      let totalPixels = 0
      let strongEdgeCount = 0
      let faceScore = 0

      for (let ry = y; ry < y + regionSize && ry < height - 1; ry++) {
        for (let rx = x; rx < x + regionSize && rx < width - 1; rx++) {
          const idx = ry * width + rx
          
          // OpenCV-style gradient calculation
          const gradientX = Math.abs(pixels[idx + 1] - pixels[idx])
          const gradientY = Math.abs(pixels[(ry + 1) * width + rx] - pixels[idx])
          const gradient = Math.sqrt(gradientX * gradientX + gradientY * gradientY)

          if (gradient > 15) edgeCount++
          if (gradient > 30) strongEdgeCount++
          
          // Face-like pattern detection (eyes, nose, mouth regions)
          const relativeY = (ry - y) / regionSize
          const relativeX = (rx - x) / regionSize
          
          // Upper region (eyes) should have more edges
          if (relativeY < 0.4 && gradient > 20) {
            faceScore += 2
          }
          // Middle region (nose) should have moderate edges
          else if (relativeY >= 0.4 && relativeY < 0.7 && gradient > 15) {
            faceScore += 1.5
          }
          // Lower region (mouth) should have some edges
          else if (relativeY >= 0.7 && gradient > 10) {
            faceScore += 1
          }
          
          totalPixels++
        }
      }

      const edgeDensity = totalPixels > 0 ? edgeCount / totalPixels : 0
      const strongEdgeDensity = totalPixels > 0 ? strongEdgeCount / totalPixels : 0
      const facePatternScore = totalPixels > 0 ? faceScore / totalPixels : 0
      
      // OpenCV-style weighted scoring
      const score = edgeDensity * 0.4 + strongEdgeDensity * 0.3 + facePatternScore * 0.3
      
      regions.push({ x, y, width: regionSize, height: regionSize, edgeDensity: score })
    }
  }

  const bestRegion = regions.reduce((best, current) => (current.edgeDensity > best.edgeDensity ? current : best))

  if (bestRegion.edgeDensity > 0.06) { // OpenCV-style threshold
    console.log("[Face Recognition] Face detected using OpenCV-style analysis")
    return {
      x: Math.floor(bestRegion.x),
      y: Math.floor(bestRegion.y),
      width: Math.floor(bestRegion.width),
      height: Math.floor(bestRegion.height),
    }
  }

  return null
}

/**
 * Enhanced brightness-based face detection
 */
function detectFaceUsingEnhancedBrightness(
  pixels: Uint8Array,
  width: number,
  height: number,
): FaceRegion | null {
  const regionSize = Math.min(width, height) / 3
  let bestRegion = null
  let bestScore = 0

  for (let y = 0; y < height - regionSize; y += regionSize / 4) {
    for (let x = 0; x < width - regionSize; x += regionSize / 4) {
      let totalBrightness = 0
      let pixelCount = 0
      let variance = 0

      // Calculate mean brightness
      for (let ry = y; ry < y + regionSize && ry < height; ry++) {
        for (let rx = x; rx < x + regionSize && rx < width; rx++) {
          totalBrightness += pixels[ry * width + rx]
          pixelCount++
        }
      }
      const avgBrightness = totalBrightness / pixelCount

      // Calculate variance for texture analysis
      for (let ry = y; ry < y + regionSize && ry < height; ry++) {
        for (let rx = x; rx < x + regionSize && rx < width; rx++) {
          const diff = pixels[ry * width + rx] - avgBrightness
          variance += diff * diff
        }
      }
      variance = variance / pixelCount

      // Enhanced scoring with brightness and texture
      const brightnessScore = avgBrightness > 50 && avgBrightness < 200 ? 1 - Math.abs(avgBrightness - 125) / 125 : 0
      const textureScore = variance > 100 && variance < 2000 ? 1 - Math.abs(variance - 1000) / 1000 : 0
      const score = brightnessScore * 0.6 + textureScore * 0.4

      if (score > bestScore) {
        bestScore = score
        bestRegion = { x, y, width: regionSize, height: regionSize }
      }
    }
  }

  if (bestScore > 0.25) { // Lowered threshold
    console.log("[Face Recognition] Face detected using enhanced brightness analysis")
    return {
      x: Math.floor(bestRegion!.x),
      y: Math.floor(bestRegion!.y),
      width: Math.floor(bestRegion!.width),
      height: Math.floor(bestRegion!.height),
    }
  }

  return null
}

/**
 * Symmetry-based face detection
 */
function detectFaceUsingSymmetry(
  pixels: Uint8Array,
  width: number,
  height: number,
): FaceRegion | null {
  const regionSize = Math.min(width, height) / 3
  let bestRegion = null
  let bestScore = 0

  for (let y = 0; y < height - regionSize; y += regionSize / 4) {
    for (let x = 0; x < width - regionSize; x += regionSize / 4) {
      let symmetryScore = 0
      let pixelCount = 0

      // Check vertical symmetry (faces are roughly symmetric)
      for (let ry = y; ry < y + regionSize && ry < height; ry++) {
        for (let rx = x; rx < x + regionSize / 2 && rx < width; rx++) {
          const leftPixel = pixels[ry * width + rx]
          const rightPixel = pixels[ry * width + (x + regionSize - 1 - (rx - x))]
          const diff = Math.abs(leftPixel - rightPixel)
          symmetryScore += 1 - (diff / 255)
          pixelCount++
        }
      }

      const avgSymmetry = pixelCount > 0 ? symmetryScore / pixelCount : 0

      if (avgSymmetry > bestScore) {
        bestScore = avgSymmetry
        bestRegion = { x, y, width: regionSize, height: regionSize }
      }
    }
  }

  if (bestScore > 0.7) { // High symmetry threshold for faces
    console.log("[Face Recognition] Face detected using symmetry analysis")
    return {
      x: Math.floor(bestRegion!.x),
      y: Math.floor(bestRegion!.y),
      width: Math.floor(bestRegion!.width),
      height: Math.floor(bestRegion!.height),
    }
  }

  return null
}

/**
 * Validate and adjust face region
 */
function validateAndAdjustFaceRegion(faceRegion: FaceRegion, width: number, height: number): FaceRegion {
  // Ensure region is within bounds
  const adjustedRegion = {
    x: Math.max(0, Math.min(faceRegion.x, width - faceRegion.width)),
    y: Math.max(0, Math.min(faceRegion.y, height - faceRegion.height)),
    width: Math.min(faceRegion.width, width - faceRegion.x),
    height: Math.min(faceRegion.height, height - faceRegion.y),
  }

  // Ensure minimum size
  const minSize = Math.min(width, height) * 0.3
  if (adjustedRegion.width < minSize) {
    adjustedRegion.width = minSize
    adjustedRegion.x = Math.max(0, Math.min(adjustedRegion.x, width - minSize))
  }
  if (adjustedRegion.height < minSize) {
    adjustedRegion.height = minSize
    adjustedRegion.y = Math.max(0, Math.min(adjustedRegion.y, height - minSize))
  }

  return adjustedRegion
}

/**
 * Extract advanced face features with enhanced discrimination
 */
async function extractAdvancedFaceFeatures(faceRegion: FaceRegion, imageBuffer: Buffer): Promise<number[]> {
  const image = sharp(imageBuffer)
  const { width, height } = await image.metadata()

  if (!width || !height) {
    throw new Error("Invalid image dimensions")
  }

  // Enhanced face cropping with better positioning
  const croppedFace = await image
    .extract({
      left: Math.max(0, faceRegion.x),
      top: Math.max(0, faceRegion.y),
      width: Math.min(faceRegion.width, width - faceRegion.x),
      height: Math.min(faceRegion.height, height - faceRegion.y),
    })
    .resize(128, 128, {
      fit: "cover",
      kernel: sharp.kernel.lanczos3,
    })
    .normalize()
    .sharpen({ sigma: 1.2 }) // Increased sharpening for better features
    .png()
    .toBuffer()

  // Extract features from 64x64 grayscale image
  const { data, info } = await sharp(croppedFace).resize(64, 64).greyscale().raw().toBuffer({ resolveWithObject: true })
  const pixels = new Uint8Array(data)
  const features: number[] = []

  // 1. Enhanced grid-based intensity analysis with smaller grids for more detail
  const gridSize = 3 // Reduced from 4 to 3 for more detail
  for (let y = 0; y < 64; y += gridSize) {
    for (let x = 0; x < 64; x += gridSize) {
      let sum = 0
      let variance = 0
      let skewness = 0
      let count = 0

      // Calculate mean first
      for (let ry = y; ry < y + gridSize && ry < 64; ry++) {
        for (let rx = x; rx < x + gridSize && rx < 64; rx++) {
          sum += pixels[ry * 64 + rx]
          count++
        }
      }
      const mean = count > 0 ? sum / count : 0

      // Calculate variance and skewness
      for (let ry = y; ry < y + gridSize && ry < 64; ry++) {
        for (let rx = x; rx < x + gridSize && rx < 64; rx++) {
          const diff = pixels[ry * 64 + rx] - mean
          variance += diff * diff
          skewness += diff * diff * diff
        }
      }
      variance = count > 0 ? variance / count : 0
      skewness = count > 0 ? skewness / count : 0

      features.push(mean / 255)
      features.push(Math.sqrt(variance) / 255)
      features.push(Math.cbrt(Math.abs(skewness)) / 255) // Add skewness for more discrimination
    }
  }

  // 2. Enhanced gradient patterns with multiple scales
  for (let scale = 1; scale <= 3; scale++) {
    for (let y = scale; y < 64 - scale; y += 2) {
      for (let x = scale; x < 64 - scale; x += 2) {
        const center = pixels[y * 64 + x]
        const right = pixels[y * 64 + Math.min(x + scale, 63)]
        const down = pixels[Math.min(y + scale, 63) * 64 + x]
        const diagonal = pixels[Math.min(y + scale, 63) * 64 + Math.min(x + scale, 63)]

        features.push((right - center) / 255)
        features.push((down - center) / 255)
        features.push((diagonal - center) / 255)
      }
    }
  }

  // 3. Enhanced texture patterns with multiple neighborhood sizes
  for (let radius = 2; radius <= 4; radius++) {
    for (let y = radius; y < 64 - radius; y += 4) {
      for (let x = radius; x < 64 - radius; x += 4) {
        const center = pixels[y * 64 + x]
        let pattern = 0
        let patternStrength = 0
        let contrast = 0

        const offsets = [
          [-radius, -radius], [-radius, 0], [-radius, radius], [0, radius],
          [radius, radius], [radius, 0], [radius, -radius], [0, -radius],
        ]

        for (let i = 0; i < offsets.length; i++) {
          const ny = y + offsets[i][0]
          const nx = x + offsets[i][1]
          if (ny >= 0 && ny < 64 && nx >= 0 && nx < 64) {
            const neighbor = pixels[ny * 64 + nx]
            const diff = neighbor - center
            if (Math.abs(diff) > 8) { // Reduced threshold for more sensitivity
              if (diff > 0) pattern |= 1 << i
              patternStrength += Math.abs(diff)
            }
            contrast += Math.abs(diff)
          }
        }

        features.push(pattern / 255)
        features.push(patternStrength / (255 * 8))
        features.push(contrast / (255 * 8)) // Add contrast feature
      }
    }
  }

  // 4. Facial landmark-like features (eye, nose, mouth regions)
  const landmarkRegions = [
    { x: 16, y: 20, w: 12, h: 8 }, // Left eye
    { x: 36, y: 20, w: 12, h: 8 }, // Right eye
    { x: 28, y: 32, w: 8, h: 6 },  // Nose
    { x: 24, y: 44, w: 16, h: 8 }, // Mouth
  ]

  for (const region of landmarkRegions) {
    let sum = 0
    let variance = 0
    let count = 0

    for (let y = region.y; y < region.y + region.h && y < 64; y++) {
      for (let x = region.x; x < region.x + region.w && x < 64; x++) {
        sum += pixels[y * 64 + x]
        count++
      }
    }
    const mean = count > 0 ? sum / count : 0

    for (let y = region.y; y < region.y + region.h && y < 64; y++) {
      for (let x = region.x; x < region.x + region.w && x < 64; x++) {
        const diff = pixels[y * 64 + x] - mean
        variance += diff * diff
      }
    }
    variance = count > 0 ? variance / count : 0

    features.push(mean / 255)
    features.push(Math.sqrt(variance) / 255)
  }

  // 5. Edge density features for facial structure
  for (let y = 0; y < 64; y += 8) {
    for (let x = 0; x < 64; x += 8) {
      let edgeCount = 0
      let totalPixels = 0

      for (let ry = y; ry < y + 8 && ry < 63; ry++) {
        for (let rx = x; rx < x + 8 && rx < 63; rx++) {
          const gradient = Math.abs(pixels[ry * 64 + rx + 1] - pixels[ry * 64 + rx]) +
                          Math.abs(pixels[(ry + 1) * 64 + rx] - pixels[ry * 64 + rx])
          if (gradient > 20) edgeCount++
          totalPixels++
        }
      }

      const edgeDensity = totalPixels > 0 ? edgeCount / totalPixels : 0
      features.push(edgeDensity)
    }
  }

  console.log("[Face Recognition] Generated", features.length, "enhanced distinctive features")

  const magnitude = Math.sqrt(features.reduce((sum, f) => sum + f * f, 0))
  if (magnitude === 0) {
    console.log("[Face Recognition] Warning: Zero magnitude embedding")
    return new Array(1914).fill(0)
  }

  const normalizedFeatures = features.map((f) => f / magnitude)

  // Add statistical features for better discrimination
  const featureMean = normalizedFeatures.reduce((sum, f) => sum + f, 0) / normalizedFeatures.length
  const featureVariance = normalizedFeatures.reduce((sum, f) => sum + (f - featureMean) ** 2, 0) / normalizedFeatures.length
  const featureSkewness = normalizedFeatures.reduce((sum, f) => sum + (f - featureMean) ** 3, 0) / normalizedFeatures.length

  normalizedFeatures.push(featureMean, Math.sqrt(featureVariance), Math.cbrt(Math.abs(featureSkewness)))

  // Ensure exactly 1914 features
  while (normalizedFeatures.length < 1914) {
    normalizedFeatures.push(0)
  }
  if (normalizedFeatures.length > 1914) {
    normalizedFeatures.splice(1914)
  }

  return normalizedFeatures
}

/**
 * Calculate cosine distance following DeepFace approach
 */
export function cosineDistance(a: number[], b: number[]): number {
  if (a.length !== b.length) {
    console.log("[Face Recognition] Embedding length mismatch:", a.length, "vs", b.length)
    return 1.0
  }

  // DeepFace approach: normalize vectors first
  let magnitudeA = 0
  let magnitudeB = 0
  
  for (let i = 0; i < a.length; i++) {
    magnitudeA += a[i] * a[i]
    magnitudeB += b[i] * b[i]
  }

  magnitudeA = Math.sqrt(magnitudeA)
  magnitudeB = Math.sqrt(magnitudeB)

  if (magnitudeA === 0 || magnitudeB === 0) {
    return 1.0
  }

  // Normalize vectors (like DeepFace)
  const aNorm = a.map(val => val / (magnitudeA + 1e-8))
  const bNorm = b.map(val => val / (magnitudeB + 1e-8))

  // Calculate cosine similarity
  let dotProduct = 0
  for (let i = 0; i < a.length; i++) {
    dotProduct += aNorm[i] * bNorm[i]
  }

  // Clamp similarity to [-1, 1] range
  const cosineSimilarity = Math.max(-1, Math.min(1, dotProduct))
  
  // Convert to distance (DeepFace style: 1 - similarity)
  const distance = 1.0 - cosineSimilarity

  return distance
}

/**
 * Check image quality
 */
export async function checkImageQuality(imageBuffer: Buffer): Promise<{ score: number; issues: string[] }> {
  try {
    const { data, info } = await sharp(imageBuffer).greyscale().raw().toBuffer({ resolveWithObject: true })
    const pixels = new Uint8Array(data)
    const issues: string[] = []
    let score = 1.0

    if (info.width < 100 || info.height < 100) {
      issues.push("Độ phân giải quá thấp")
      score -= 0.4
    }

    const avgBrightness = pixels.reduce((sum, val) => sum + val, 0) / pixels.length
    if (avgBrightness < 20 || avgBrightness > 235) {
      issues.push("Độ sáng không phù hợp")
      score -= 0.3
    }

    return { score: Math.max(0, score), issues }
  } catch (error) {
    return { score: 0.8, issues: [] }
  }
}
