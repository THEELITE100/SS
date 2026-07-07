import React, { useState, useRef } from 'react';

const FileUploadDropzone = ({
  label = 'Upload Document',
  accept = '.pdf,.doc,.docx,.png,.jpg',
  maxSizeMB = 10,
  onFileSelect,
  currentFileUrl = '',
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const processFile = (file) => {
    setError(null);
    if (!file) return;

    const fileSizeMB = file.size / (1024 * 1024);
    if (fileSizeMB > maxSizeMB) {
      setError(`File exceeds maximum allowed size of ${maxSizeMB}MB.`);
      return;
    }

    setSelectedFile(file);

    setUploadProgress(10);
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          const simulatedCdnUrl = `https://cloudinary.skillsphere.io/secure/binaries/${encodeURIComponent(file.name)}`;
          if (onFileSelect) onFileSelect(file, simulatedCdnUrl);
          return 100;
        }
        return prev + 25;
      });
    }, 150);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      processFile(files[0]);
    }
  };

  const handleInputChange = (e) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      processFile(files[0]);
    }
  };

  const handleRemoveFile = (e) => {
    e.stopPropagation();
    setSelectedFile(null);
    setUploadProgress(0);
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (onFileSelect) onFileSelect(null, '');
  };

  return (
    <div className="flex flex-col gap-1.5 w-full">
      <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">
        {label}
      </span>

      <div
        onClick={() => fileInputRef.current?.click()}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`relative p-6 rounded-2xl border-2 border-dashed transition-all cursor-pointer flex flex-col items-center justify-center text-center select-none ${
          isDragging
            ? 'border-black bg-gray-100/80 scale-[0.99]'
            : selectedFile
            ? 'border-emerald-500 bg-emerald-50/20'
            : 'border-gray-300 bg-gray-50/50 hover:border-gray-400 hover:bg-gray-100/50'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          onChange={handleInputChange}
          className="hidden"
        />

        {selectedFile ? (
          <div className="flex flex-col items-center gap-2 w-full max-w-sm">
            <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold">
              ✓
            </div>
            <div className="min-w-0 w-full text-center">
              <p className="text-xs font-extrabold text-black truncate">{selectedFile.name}</p>
              <p className="text-[10px] font-semibold text-gray-400 mt-0.5">
                {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB • Cloudinary Synced
              </p>
            </div>

            {uploadProgress < 100 && (
              <div className="w-full h-1.5 rounded-full bg-gray-200 overflow-hidden mt-1">
                <div
                  style={{ width: `${uploadProgress}%` }}
                  className="h-full bg-emerald-500 transition-all duration-150"
                />
              </div>
            )}

            <button
              type="button"
              onClick={handleRemoveFile}
              className="mt-1 text-[11px] font-bold text-red-600 hover:underline"
            >
              Remove & Upload Another
            </button>
          </div>
        ) : currentFileUrl ? (
          <div className="flex flex-col items-center gap-2">
            <span className="text-xl">📄</span>
            <p className="text-xs font-bold text-black">Current File Attached</p>
            <p className="text-[10px] text-blue-600 truncate max-w-xs">{currentFileUrl}</p>
            <span className="text-[11px] font-extrabold text-gray-500 underline mt-1">
              Click or drag to replace document
            </span>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-gray-200/80 text-gray-600 flex items-center justify-center">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </div>
            <div>
              <p className="text-xs font-bold text-black">
                Click to browse <span className="font-normal text-gray-500">or drag and drop</span>
              </p>
              <p className="text-[10px] font-medium text-gray-400 mt-0.5">
                Supports {accept.replace(/\./g, '').toUpperCase()} (Max {maxSizeMB}MB)
              </p>
            </div>
          </div>
        )}
      </div>

      {error && (
        <span className="text-[11px] font-semibold text-red-600 pl-1">{error}</span>
      )}
    </div>
  );
};

export default FileUploadDropzone;