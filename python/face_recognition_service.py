#!/usr/bin/env python3
"""
Face Recognition Service using DeepFace Facenet512
Provides 512-dim embeddings with high accuracy
"""

import sys
import json
import base64
import io
import numpy as np
from PIL import Image
from deepface import DeepFace
import cv2

# Configuration
EMBED_MODEL = "Facenet512"  # 512-dim embeddings, robust + light
DETECTOR = "opencv"          # fast and bundled
THRESHOLD_COS_DIST = 0.30    # 0.25~0.35 range works well

def base64_to_image(base64_string):
    """Convert base64 string to PIL Image"""
    try:
        # Remove data URL prefix if present
        if ',' in base64_string:
            base64_string = base64_string.split(',')[1]
        
        # Decode base64
        image_data = base64.b64decode(base64_string)
        image = Image.open(io.BytesIO(image_data))
        
        # Convert to RGB if necessary
        if image.mode != 'RGB':
            image = image.convert('RGB')
            
        return image
    except Exception as e:
        raise ValueError(f"Invalid image data: {e}")

def image_to_numpy(image):
    """Convert PIL Image to numpy array"""
    return np.array(image)

def extract_embedding(image_array):
    """Extract 512-dim embedding using DeepFace Facenet512"""
    try:
        # Use DeepFace to extract embedding
        embedding = DeepFace.represent(
            img_path=image_array,
            model_name=EMBED_MODEL,
            detector_backend=DETECTOR,
            enforce_detection=True
        )
        
        if not embedding:
            return None
            
        # Get the first (largest) face embedding
        face_embedding = embedding[0].get("embedding") or embedding[0].get("face_embedding")
        
        if face_embedding is None:
            return None
            
        return np.array(face_embedding, dtype=np.float32)
        
    except Exception as e:
        print(f"Error extracting embedding: {e}", file=sys.stderr)
        return None

def cosine_distance(a, b):
    """Calculate cosine distance between two embeddings"""
    try:
        # Normalize vectors
        a_norm = a / (np.linalg.norm(a) + 1e-8)
        b_norm = b / (np.linalg.norm(b) + 1e-8)
        
        # Calculate cosine similarity
        similarity = float(np.dot(a_norm, b_norm))
        
        # Convert to distance
        distance = 1.0 - similarity
        
        return distance
    except Exception as e:
        print(f"Error calculating distance: {e}", file=sys.stderr)
        return 1.0

def process_request(request_type, data):
    """Process different types of requests"""
    try:
        if request_type == "extract_embedding":
            # Extract embedding from image
            image = base64_to_image(data["image"])
            image_array = image_to_numpy(image)
            embedding = extract_embedding(image_array)
            
            if embedding is None:
                return {
                    "success": False,
                    "error": "No face detected or embedding extraction failed"
                }
            
            return {
                "success": True,
                "embedding": embedding.tolist(),
                "dimension": len(embedding)
            }
            
        elif request_type == "calculate_distance":
            # Calculate distance between two embeddings
            embedding1 = np.array(data["embedding1"], dtype=np.float32)
            embedding2 = np.array(data["embedding2"], dtype=np.float32)
            
            distance = cosine_distance(embedding1, embedding2)
            similarity = 1.0 - distance
            
            return {
                "success": True,
                "distance": float(distance),
                "similarity": float(similarity),
                "threshold": THRESHOLD_COS_DIST,
                "is_match": distance <= THRESHOLD_COS_DIST
            }
            
        elif request_type == "compare_faces":
            # Compare face with multiple embeddings
            image = base64_to_image(data["image"])
            image_array = image_to_numpy(image)
            query_embedding = extract_embedding(image_array)
            
            if query_embedding is None:
                return {
                    "success": False,
                    "error": "No face detected in query image"
                }
            
            # Compare with all provided embeddings
            matches = []
            for i, embedding_data in enumerate(data["embeddings"]):
                try:
                    stored_embedding = np.array(embedding_data["embedding"], dtype=np.float32)
                    distance = cosine_distance(query_embedding, stored_embedding)
                    similarity = 1.0 - distance
                    
                    matches.append({
                        "index": i,
                        "name": embedding_data.get("name", f"User_{i}"),
                        "distance": float(distance),
                        "similarity": float(similarity),
                        "is_match": distance <= THRESHOLD_COS_DIST
                    })
                except Exception as e:
                    print(f"Error comparing with embedding {i}: {e}", file=sys.stderr)
                    continue
            
            # Sort by similarity (best match first)
            matches.sort(key=lambda x: x["similarity"], reverse=True)
            
            return {
                "success": True,
                "query_embedding": query_embedding.tolist(),
                "matches": matches,
                "best_match": matches[0] if matches else None,
                "threshold": THRESHOLD_COS_DIST
            }
            
        else:
            return {
                "success": False,
                "error": f"Unknown request type: {request_type}"
            }
            
    except Exception as e:
        return {
            "success": False,
            "error": f"Processing error: {str(e)}"
        }

def main():
    """Main function to handle requests"""
    try:
        # Read input from stdin
        input_data = json.loads(sys.stdin.read())
        
        request_type = input_data.get("type")
        data = input_data.get("data", {})
        
        # Process request
        result = process_request(request_type, data)
        
        # Output result to stdout
        print(json.dumps(result))
        
    except Exception as e:
        error_result = {
            "success": False,
            "error": f"Service error: {str(e)}"
        }
        print(json.dumps(error_result))

if __name__ == "__main__":
    main()
