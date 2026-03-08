'use client';

import React, { useState, forwardRef, useImperativeHandle } from 'react';
import NoPhotoPlaceholder from './NoPhotoPlaceholder';
import imageCompression from 'browser-image-compression';

export interface PhotoUploadHandle {
  upload: (name: string, recipeSlug: string) => Promise<boolean>;
  hasFile: boolean;
  reset: () => void;
}

const PhotoUpload = forwardRef<PhotoUploadHandle>(function PhotoUpload(_props, ref) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [compressing, setCompressing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useImperativeHandle(ref, () => ({
    hasFile: !!file,
    reset: () => {
      setFile(null);
      setPreview(null);
      setError(null);
    },
    upload: async (name: string, recipeSlug: string) => {
      if (!file) return false;

      try {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('recipeSlug', recipeSlug);
        formData.append('uploaderName', name.trim());

        const response = await fetch('/api/upload-photo', {
          method: 'POST',
          body: formData,
        });

        const result = await response.json();

        if (!result.success) {
          setError(result.error || 'Upload failed');
          return false;
        }

        setFile(null);
        setPreview(null);
        return true;
      } catch {
        setError('Network error. Please try again.');
        return false;
      }
    },
  }), [file]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    if (!selectedFile.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    setError(null);
    setCompressing(true);

    try {
      const options = {
        maxSizeMB: 1,
        maxWidthOrHeight: 1920,
        useWebWorker: true,
      };
      const compressed = await imageCompression(selectedFile, options);
      setFile(compressed as unknown as File);

      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result as string);
      reader.readAsDataURL(compressed);
    } catch {
      setError('Could not process image. Please try another file.');
    } finally {
      setCompressing(false);
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
    <div className="space-y-2">
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:border-primary transition-colors"
        onClick={() => document.getElementById('photoInput')?.click()}
      >
        {compressing ? (
          <p className="text-sm text-primary">Compressing image...</p>
        ) : preview ? (
          <div className="space-y-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={preview}
              alt="Preview"
              className="max-h-48 mx-auto rounded-lg"
            />
            <p className="text-xs text-gray-500">Tap to change photo</p>
          </div>
        ) : (
          <div className="space-y-1">
            <NoPhotoPlaceholder size="small" className="bg-transparent h-auto" />
            <p className="text-sm text-gray-600">
              Add a photo of your cook (optional)
            </p>
            <p className="text-xs text-gray-400">
              JPG, PNG, or WebP
            </p>
          </div>
        )}
        <input
          id="photoInput"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleFileChange}
          className="hidden"
          disabled={compressing}
        />
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-2">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}
    </div>
  );
});

export default PhotoUpload;
