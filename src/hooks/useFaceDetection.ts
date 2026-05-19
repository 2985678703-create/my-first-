import { useState, useEffect, useRef, useCallback } from 'react';
import * as faceapi from 'face-api.js';
import { EmotionType, EmotionResult } from '../types/game';

const MODEL_URL = 'https://cdn.jsdelivr.net/npm/@vladmandic/face-api@1.7.12/model';

interface UseFaceDetectionOptions {
  enabled: boolean;
  onEmotionDetected?: (emotion: EmotionResult) => void;
  confidenceThreshold?: number;
  stableFrames?: number;
  targetFps?: number;
}

interface UseFaceDetectionReturn {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  isModelLoading: boolean;
  isModelLoaded: boolean;
  isCameraReady: boolean;
  currentEmotion: EmotionResult | null;
  error: string | null;
  startDetection: () => void;
  stopDetection: () => void;
  loadModels: () => Promise<void>;
}

let modelLoadPromise: Promise<void> | null = null;
let isModelLoadedGlobal = false;

export function useFaceDetection({
  enabled,
  onEmotionDetected,
  confidenceThreshold = 0.3,
  stableFrames = 3,
  targetFps = 15,
}: UseFaceDetectionOptions): UseFaceDetectionReturn {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationRef = useRef<number>(0);
  const stableCountRef = useRef<number>(0);
  const lastEmotionRef = useRef<EmotionType | null>(null);
  const detectionActiveRef = useRef<boolean>(false);
  const hasTriggeredRef = useRef<boolean>(false);
  const lastFrameTimeRef = useRef<number>(0);
  const frameIntervalRef = useRef<number>(1000 / targetFps);
  const onEmotionDetectedRef = useRef(onEmotionDetected);
  const confidenceThresholdRef = useRef(confidenceThreshold);
  const stableFramesRef = useRef(stableFrames);
  const cameraStartedRef = useRef<boolean>(false);

  const [isModelLoading, setIsModelLoading] = useState(false);
  const [isModelLoaded, setIsModelLoaded] = useState(isModelLoadedGlobal);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [currentEmotion, setCurrentEmotion] = useState<EmotionResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    onEmotionDetectedRef.current = onEmotionDetected;
    confidenceThresholdRef.current = confidenceThreshold;
    stableFramesRef.current = stableFrames;
  }, [onEmotionDetected, confidenceThreshold, stableFrames]);

  const loadModels = useCallback(async () => {
    if (isModelLoadedGlobal) {
      setIsModelLoaded(true);
      return;
    }
    
    if (modelLoadPromise) {
      setIsModelLoading(true);
      await modelLoadPromise;
      setIsModelLoading(false);
      setIsModelLoaded(true);
      return;
    }
    
    setIsModelLoading(true);
    setError(null);
    
    modelLoadPromise = (async () => {
      try {
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
          faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL),
        ]);
        isModelLoadedGlobal = true;
      } catch (err) {
        console.error('Failed to load face-api models:', err);
        throw err;
      }
    })();
    
    try {
      await modelLoadPromise;
      setIsModelLoaded(true);
    } catch {
      setError('表情识别模型加载失败，请检查网络连接');
    } finally {
      setIsModelLoading(false);
    }
  }, []);

  const detectLoop = useCallback(async function loop() {
    if (!detectionActiveRef.current || !videoRef.current || !isModelLoadedGlobal) {
      return;
    }

    const now = performance.now();
    const elapsed = now - lastFrameTimeRef.current;
    
    if (elapsed < frameIntervalRef.current) {
      animationRef.current = requestAnimationFrame(loop);
      return;
    }
    
    lastFrameTimeRef.current = now;

    try {
      const video = videoRef.current;
      if (!video || video.readyState < 2) {
        animationRef.current = requestAnimationFrame(loop);
        return;
      }

      const detections = await faceapi
        .detectSingleFace(video, new faceapi.TinyFaceDetectorOptions({
          inputSize: 224,
          scoreThreshold: 0.4,
        }))
        .withFaceExpressions();

      if (detections && detectionActiveRef.current) {
        const expressions = detections.expressions;
        
        const emotionEntries = Object.entries(expressions) as [EmotionType, number][];
        const sorted = emotionEntries.sort((a, b) => b[1] - a[1]);
        const [dominant, confidence] = sorted[0];
        
        const allEmotions: Record<EmotionType, number> = {
          neutral: expressions.neutral,
          happy: expressions.happy,
          sad: expressions.sad,
          angry: expressions.angry,
          fearful: expressions.fearful,
          disgusted: expressions.disgusted,
          surprised: expressions.surprised,
        };

        const result: EmotionResult = {
          dominant,
          confidence,
          all: allEmotions,
        };

        setCurrentEmotion(result);

        if (dominant === lastEmotionRef.current) {
          stableCountRef.current++;
        } else {
          stableCountRef.current = 0;
          lastEmotionRef.current = dominant;
        }

        if (
          stableCountRef.current >= stableFramesRef.current &&
          confidence >= confidenceThresholdRef.current &&
          !hasTriggeredRef.current &&
          onEmotionDetectedRef.current
        ) {
          hasTriggeredRef.current = true;
          onEmotionDetectedRef.current(result);
        }

        if (canvasRef.current && video) {
          try {
            const dims = faceapi.matchDimensions(canvasRef.current, video, true);
            const resized = faceapi.resizeResults(detections, dims);
            
            const ctx = canvasRef.current.getContext('2d');
            if (ctx) {
              ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
              faceapi.draw.drawDetections(canvasRef.current, [resized]);
            }
          } catch {
            // Canvas drawing error - ignore
          }
        }
      }
    } catch {
      // Detection frame error - ignore
    }

    if (detectionActiveRef.current) {
      animationRef.current = requestAnimationFrame(loop);
    }
  }, []);

  const startCamera = useCallback(async () => {
    if (cameraStartedRef.current) return;
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 320 },
          height: { ideal: 240 },
          facingMode: 'user',
          frameRate: { ideal: 15, max: 30 },
        },
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await new Promise<void>((resolve) => {
          if (videoRef.current) {
            videoRef.current.onloadedmetadata = () => {
              videoRef.current?.play().then(() => {
                cameraStartedRef.current = true;
                setIsCameraReady(true);
                resolve();
              });
            };
          }
        });
      }
    } catch (err) {
      console.error('Failed to access camera:', err);
      setError('无法访问摄像头，请确保已授予摄像头权限');
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (videoRef.current?.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    cameraStartedRef.current = false;
    setIsCameraReady(false);
  }, []);

  const startDetection = useCallback(() => {
    hasTriggeredRef.current = false;
    stableCountRef.current = 0;
    lastEmotionRef.current = null;
    detectionActiveRef.current = true;
    lastFrameTimeRef.current = 0;
    animationRef.current = requestAnimationFrame(detectLoop);
  }, [detectLoop]);

  const stopDetection = useCallback(() => {
    detectionActiveRef.current = false;
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = 0;
    }
  }, []);

  useEffect(() => {
    if (enabled && isModelLoaded) {
      startCamera().then(() => {
        startDetection();
      });
    } else if (!enabled) {
      stopDetection();
      stopCamera();
    }

    return () => {
      stopDetection();
    };
  }, [enabled, isModelLoaded, startCamera, stopCamera, startDetection, stopDetection]);

  useEffect(() => {
    return () => {
      stopDetection();
      stopCamera();
    };
  }, [stopDetection, stopCamera]);

  return {
    videoRef,
    canvasRef,
    isModelLoading,
    isModelLoaded,
    isCameraReady,
    currentEmotion,
    error,
    startDetection,
    stopDetection,
    loadModels,
  };
}

export function preloadModels(): Promise<void> {
  if (isModelLoadedGlobal) return Promise.resolve();
  if (modelLoadPromise) return modelLoadPromise;
  
  modelLoadPromise = (async () => {
    await Promise.all([
      faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
      faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL),
    ]);
    isModelLoadedGlobal = true;
  })();
  
  return modelLoadPromise;
}
