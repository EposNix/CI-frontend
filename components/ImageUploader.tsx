
import React, { useCallback, useRef } from 'react';
import type { ImageData } from '../types';

interface ImageUploaderProps {
  title: string;
  icon: React.ReactNode;
  onImageSelect: (imageData: ImageData) => void;
  imageData: ImageData | null;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ title, icon, onImageSelect, imageData }) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const url = reader.result as string;
        const base64String = url.split(',')[1];
        onImageSelect({
          base64: base64String,
          mimeType: file.type,
          url: url,
        });
      };
      reader.readAsDataURL(file);
    }
  }, [onImageSelect]);

  const handleClick = () => {
    inputRef.current?.click();
  };

  return (
    <div className="w-full h-full flex flex-col items-center">
      {title && <h3 className="text-xl font-semibold text-gray-200 mb-3">{title}</h3>}
      <input
        type="file"
        ref={inputRef}
        onChange={handleFileChange}
        className="hidden"
        accept="image/*"
      />
      <button
        onClick={handleClick}
        className="w-full h-64 rounded-xl border-2 border-dashed border-gray-600 hover:border-fuchsia-500 transition-all duration-300 bg-white/5 flex justify-center items-center overflow-hidden focus:outline-none focus:ring-2 focus:ring-fuchsia-500 focus:ring-offset-2 focus:ring-offset-gray-900"
      >
        {imageData ? (
          <img src={imageData.url} alt="Preview" className="w-full h-full object-cover" />
        ) : (
          <div className="text-center text-gray-500">
            <div className="mx-auto h-16 w-16">{icon}</div>
            <p className="mt-2">Click to upload</p>
          </div>
        )}
      </button>
    </div>
  );
};

export default ImageUploader;
