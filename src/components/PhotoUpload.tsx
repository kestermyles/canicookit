'use client';

import React, { useState } from 'react';

interface PhotoUploadProps {
  recipeSlug: string;
  onUploadSuccess?: (photoUrl: string) => void;
}

export default function PhotoUpload({
  recipeSlug,
  onUploadSuccess,
}: PhotoUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [uploaderName, setUploaderName] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    // Validate file type
    if (!selectedFile.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    // Validate file size (2MB limit)
    if (selectedFile.size > 2 * 1024 * 1024) {
      setError('Image must be less than 2MB');
      return;
    }

    setFile(selectedFile);
    setError(null);
    setSuccess(false);

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(selectedFile);
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a photo first');
      return;
    }

    if (!uploaderName.trim()) {
      setError('Please enter your name');
      return;
    }

    setUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('recipeSlug', recipeSlug);
      formData.append('uploaderName', uploaderName.trim());

      const response = await fetch('/api/upload-photo', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (!result.success) {
        setError(result.error || 'Upload failed');
        return;
      }

      setSuccess(true);
      setFile(null);
      setPreview(null);
      setUploaderName('');

      if (onUploadSuccess && result.photoUrl) {
        onUploadSuccess(result.photoUrl);
      }

      // Reset success message after 5 seconds
      setTimeout(() => setSuccess(false), 5000);
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && droppedFile.type.startsWith('image/')) {
      const fakeEvent = {
        target: { files: [droppedFile] },
      } as unknown as React.ChangeEvent<HTMLInputElement>;
      handleFileChange(fakeEvent);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <div className="space-y-4">
        {/* Name Input */}
        <div>
          <label
            htmlFor="uploaderName"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Your Name
          </label>
          <input
            type="text"
            id="uploaderName"
            value={uploaderName}
            onChange={(e) => setUploaderName(e.target.value)}
            placeholder="e.g., Jamie"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            disabled={uploading}
          />
        </div>

        {/* File Input / Drop Zone */}
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-primary transition-colors"
          onClick={() => document.getElementById('photoInput')?.click()}
        >
          {preview ? (
            <div className="space-y-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={preview}
                alt="Preview"
                className="max-h-64 mx-auto rounded-lg"
              />
              <p className="text-sm text-gray-500">{file?.name}</p>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="text-4xl">📸</div>
              <p className="text-gray-700">
                Click to select or drag & drop your photo
              </p>
              <p className="text-sm text-gray-500">
                Max 2MB • JPG, PNG, or WebP
              </p>
            </div>
          )}
          <input
            id="photoInput"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleFileChange}
            className="hidden"
            disabled={uploading}
          />
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-3">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* Success Message */}
        {success && (
          <div className="bg-green-50 border border-green-200 rounded-md p-3">
            <p className="text-sm text-green-700">
              ✓ Photo uploaded successfully! It will be reviewed and may become
              the recipe's main image.
            </p>
          </div>
        )}

        {/* Upload Button */}
        <button
          onClick={handleUpload}
          disabled={!file || uploading || !uploaderName.trim()}
          className="w-full bg-primary text-white py-3 px-4 rounded-lg font-medium hover:bg-primary-dark disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
        >
          {uploading ? 'Uploading...' : 'Upload Photo'}
        </button>

        <p className="text-xs text-gray-500 text-center">
          Your photo will be analyzed for quality. High-scoring photos may
          become the recipe's featured image!
        </p>
      </div>
    </div>
  );
}
