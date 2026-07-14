import React, { useState } from 'react';
import apiClient from '../../utils/apiClient';
import Button from '../common/Button';

const FileUpload = ({ onUploadSuccess }) => {
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleUpload = async () => {
    if (!file) return;
    setIsUploading(true);
    
    const formData = new FormData();
    formData.append('document', file); 

    try {
      const res = await apiClient.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      onUploadSuccess(res.data.fileUrl);
      setFile(null);
    } catch (err) {
      alert('File stream to Cloudinary failed.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="flex flex-col gap-2 p-4 border border-dashed border-gray-300 rounded-xl bg-gray-50/50">
      <span className="text-xs font-bold text-gray-500">Upload Professional Assets (PDF/JPG)</span>
      <div className="flex gap-3 items-center">
        <input 
          type="file" 
          onChange={(e) => setFile(e.target.files[0])} 
          className="text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
        />
        <Button variant="primary" size="sm" onClick={handleUpload} disabled={!file || isUploading}>
          {isUploading ? 'Streaming to CDN...' : 'Secure Upload'}
        </Button>
      </div>
    </div>
  );
};

export default FileUpload;