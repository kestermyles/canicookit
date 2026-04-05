'use client';

import React, { useState, useRef, forwardRef, useImperativeHandle } from 'react';
import imageCompression from 'browser-image-compression';

const MAX_PHOTOS = 6;

interface PhotoSlot {
  file: File;
  preview: string;
}

function getStepLabels(count: number): string[] {
  if (count === 0) return [];
  if (count === 1) return ['Finished dish'];
  return Array.from({ length: count }, (_, i) =>
    i === count - 1 ? 'Finished dish' : `Step ${i + 1}`
  );
}

export interface PhotoUploadHandle {
  upload: (name: string, recipeSlug: string) => Promise<boolean>;
  hasFile: boolean;
  reset: () => void;
}

const PhotoUpload = forwardRef<PhotoUploadHandle>(function PhotoUpload(_props, ref) {
  const [slots, setSlots] = useState<PhotoSlot[]>([]);
  const [compressing, setCompressing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const labels = getStepLabels(slots.length);

  useImperativeHandle(ref, () => ({
    hasFile: slots.length > 0,
    reset: () => {
      setSlots([]);
      setError(null);
    },
    upload: async (name: string, recipeSlug: string) => {
      if (slots.length === 0) return false;

      const uploadLabels = getStepLabels(slots.length);

      for (let i = 0; i < slots.length; i++) {
        try {
          const formData = new FormData();
          formData.append('file', slots[i].file);
          formData.append('recipeSlug', recipeSlug);
          formData.append('uploaderName', name.trim());
          formData.append('sort_order', String(i + 1));
          formData.append('step_label', uploadLabels[i]);

          const response = await fetch('/api/upload-photo', {
            method: 'POST',
            body: formData,
          });

          const result = await response.json();

          if (!result.success) {
            setError(result.error || `Upload failed for photo ${i + 1}`);
            return false;
          }
        } catch {
          setError(`Network error uploading photo ${i + 1}. Please try again.`);
          return false;
        }
      }

      setSlots([]);
      return true;
    },
  }), [slots]);

  const addPhoto = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    if (slots.length >= MAX_PHOTOS) return;

    setError(null);
    setCompressing(true);

    try {
      const compressed = await imageCompression(file, {
        maxSizeMB: 1,
        maxWidthOrHeight: 1920,
        useWebWorker: true,
      });

      const preview = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(compressed);
      });

      setSlots((prev) => [...prev, { file: compressed as unknown as File, preview }]);
    } catch {
      setError('Could not process image. Please try another file.');
    } finally {
      setCompressing(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) addPhoto(selectedFile);
    // Reset input so the same file can be re-selected
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeSlot = (index: number) => {
    setSlots((prev) => prev.filter((_, i) => i !== index));
  };

  const handleDragStart = (index: number) => {
    setDragIndex(index);
  };

  const handleSlotDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    setDragOverIndex(index);
  };

  const handleSlotDrop = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (dragIndex === null || dragIndex === index) {
      setDragIndex(null);
      setDragOverIndex(null);
      return;
    }
    const newSlots = [...slots];
    const dragged = newSlots[dragIndex];
    newSlots.splice(dragIndex, 1);
    newSlots.splice(index, 0, dragged);
    setSlots(newSlots);
    setDragIndex(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDragIndex(null);
    setDragOverIndex(null);
  };

  return (
    <div className="space-y-2">
      <div className="flex gap-2 overflow-x-auto pb-1">
        {/* Occupied slots */}
        {slots.map((slot, i) => (
          <div
            key={i}
            className={`flex-shrink-0 text-center relative cursor-grab active:cursor-grabbing ${dragOverIndex === i ? 'ring-2 ring-primary rounded-lg' : ''}`}
            draggable={true}
            onDragStart={() => handleDragStart(i)}
            onDragOver={(e) => handleSlotDragOver(e, i)}
            onDrop={(e) => handleSlotDrop(e, i)}
            onDragEnd={handleDragEnd}
          >
            <div className="relative w-20 h-20">
              <span className="absolute top-0.5 left-0.5 text-xs text-gray-300 leading-none select-none z-10">⠿</span>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={slot.preview}
                alt={labels[i]}
                className="w-20 h-20 object-cover rounded-lg border border-gray-200"
              />
              <button
                type="button"
                onClick={() => removeSlot(i)}
                className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center hover:bg-red-600 transition-colors"
                aria-label={`Remove photo ${i + 1}`}
              >
                &times;
              </button>
            </div>
            <p className="text-[10px] text-gray-500 mt-1 leading-tight w-20 truncate">{labels[i]}</p>
          </div>
        ))}

        {/* Add slot */}
        {slots.length < MAX_PHOTOS && (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={compressing}
            className="flex-shrink-0 w-20 h-20 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center text-gray-400 hover:border-primary hover:text-primary transition-colors disabled:opacity-50"
            aria-label="Add photo"
          >
            {compressing ? (
              <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            ) : (
              <span className="text-2xl leading-none">+</span>
            )}
          </button>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleFileChange}
        className="hidden"
        disabled={compressing}
      />

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-2">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}
    </div>
  );
});

export default PhotoUpload;
