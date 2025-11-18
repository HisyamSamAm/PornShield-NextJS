'use client';

import { useState, useEffect } from 'react';
import * as nsfwjs from 'nsfwjs';

interface AnalysisResult {
  url: string;
  predictions: Array<{
    className: string;
    probability: number;
  }>;
}

export default function ImageUploadForm() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [model, setModel] = useState<nsfwjs.NSFWJS | null>(null);
  const [modelLoading, setModelLoading] = useState(true);
  const [isNSFW, setIsNSFW] = useState(false);
  const [nsfwAlert, setNsfwAlert] = useState<string | null>(null);

  useEffect(() => {
    const loadModel = async () => {
      try {
        const loadedModel = await nsfwjs.load();
        setModel(loadedModel);
      } catch (err) {
        console.error('Failed to load NSFW model:', err);
        setError('Failed to load NSFW detection model');
      } finally {
        setModelLoading(false);
      }
    };

    loadModel();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setResult(null);
      setError(null);
      setIsNSFW(false);
      setNsfwAlert(null);
    }
  };

  const analyzeImage = async (file: File): Promise<Array<{ className: string; probability: number }>> => {
    if (!model) throw new Error('Model not loaded');

    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';

      const reader = new FileReader();
      reader.onload = () => {
        img.src = reader.result as string;
      };

      img.onload = async () => {
        try {
          // Resize image if too large for better performance
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          if (!ctx) throw new Error('Canvas context not available');

          // Calculate new dimensions (max 512px)
          const maxSize = 512;
          let { width, height } = img;
          if (width > height) {
            if (width > maxSize) {
              height = (height * maxSize) / width;
              width = maxSize;
            }
          } else {
            if (height > maxSize) {
              width = (width * maxSize) / height;
              height = maxSize;
            }
          }

          canvas.width = width;
          canvas.height = height;
          ctx.drawImage(img, 0, 0, width, height);

          const predictions = await model.classify(canvas);
          resolve(predictions.map(pred => ({
            className: pred.className,
            probability: pred.probability,
          })));
        } catch (err) {
          reject(err);
        }
      };

      img.onerror = () => reject(new Error('Failed to load image for analysis'));
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsDataURL(file);
    });
  };

  const checkNSFWContent = (predictions: Array<{ className: string; probability: number }>) => {
    const highRiskCategories = ['Sexy', 'Porn', 'Hentai'];
    const threshold = 0.2; // 20% threshold for "sangat tinggi"

    const highRiskPredictions = predictions.filter(pred =>
      highRiskCategories.includes(pred.className) && pred.probability > threshold
    );

    if (highRiskPredictions.length > 0) {
      setIsNSFW(true);
      const alertMessage = highRiskPredictions
        .map(pred => `${pred.className}: ${(pred.probability * 100).toFixed(1)}%`)
        .join(', ');

      setNsfwAlert(`⚠️ Gambar mengandung konten NSFW: ${alertMessage}`);
    } else {
      setIsNSFW(false);
      setNsfwAlert(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !model) return;

    setLoading(true);
    setError(null);

    try {
      // First analyze the image locally
      const predictions = await analyzeImage(file);

      // Then upload to Vercel Blob
      const formData = new FormData();
      formData.append('image', file);

      const response = await fetch('/api/analyze', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to upload image');
      }

      const uploadData = await response.json();

      setResult({
        url: uploadData.url,
        predictions,
      });

      // Check for NSFW content and update UI accordingly
      checkNSFWContent(predictions);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (modelLoading) {
    return (
      <div className="max-w-md mx-auto p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p>Loading NSFW detection model...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4 text-center">Upload Image for NSFW Analysis</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="image" className="block text-sm font-medium mb-2">
            Select Image
          </label>
          <input
            type="file"
            id="image"
            accept="image/*"
            onChange={handleFileChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <button
          type="submit"
          disabled={!file || loading || !model}
          className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? 'Analyzing...' : 'Analyze Image'}
        </button>
      </form>

      {error && (
        <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      {nsfwAlert && (
        <div className="mt-4 p-4 bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-600 rounded">
          <div className="flex items-center">
            <span className="text-red-600 dark:text-red-400 text-xl mr-2">⚠️</span>
            <span className="font-semibold text-red-800 dark:text-red-200">NSFW Content Detected</span>
          </div>
          <p className="mt-2 text-red-700 dark:text-red-300">{nsfwAlert}</p>
        </div>
      )}

      {result && (
        <div className={`mt-4 p-4 ${isNSFW ? 'bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800' : 'bg-green-100 dark:bg-green-900 border-green-400 dark:border-green-600'} border rounded`}>
          <h3 className="font-bold mb-2">Analysis Result:</h3>
          <div className="relative">
            <img
              src={result.url}
              alt="Uploaded"
              className={`w-full h-48 object-cover mb-2 rounded ${isNSFW ? 'filter blur-sm' : ''}`}
            />
            {isNSFW && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="bg-black bg-opacity-50 text-white px-4 py-2 rounded font-semibold">
                  NSFW Content Blurred
                </div>
              </div>
            )}
          </div>
          <div className="space-y-1">
            {result.predictions.map((pred, index) => (
              <div key={index} className="flex justify-between">
                <span className={isNSFW && ['Sexy', 'Porn', 'Hentai'].includes(pred.className) && pred.probability > 0.5 ? 'font-bold text-red-600' : ''}>
                  {pred.className}:
                </span>
                <span className={isNSFW && ['Sexy', 'Porn', 'Hentai'].includes(pred.className) && pred.probability > 0.5 ? 'font-bold text-red-600' : ''}>
                  {(pred.probability * 100).toFixed(2)}%
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}