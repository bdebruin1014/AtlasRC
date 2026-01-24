// src/components/ContractUploadModal.jsx
// Modal for uploading purchase contract documents

import React, { useState, useCallback } from 'react';
import { X, Upload, FileText, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { uploadContractDocument } from '@/services/contractParsingService';

const ContractUploadModal = ({ isOpen, onClose, projectId, onUploadComplete }) => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState(null); // 'success' | 'error'
  const [errorMessage, setErrorMessage] = useState('');
  const [dragOver, setDragOver] = useState(false);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setDragOver(false);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setDragOver(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && (droppedFile.type === 'application/pdf' || droppedFile.name.endsWith('.pdf'))) {
      setFile(droppedFile);
      setUploadStatus(null);
    }
  }, []);

  const handleFileSelect = (e) => {
    const selected = e.target.files[0];
    if (selected) {
      setFile(selected);
      setUploadStatus(null);
    }
  };

  const handleUpload = async () => {
    if (!file || !projectId) return;

    setUploading(true);
    setUploadStatus(null);
    setErrorMessage('');

    try {
      const result = await uploadContractDocument(projectId, file);
      setUploadStatus('success');
      onUploadComplete?.(result);
      setTimeout(() => onClose(), 1500);
    } catch (err) {
      setUploadStatus('error');
      setErrorMessage(err.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg">
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 className="text-lg font-semibold text-gray-900">Upload Purchase Contract</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              dragOver ? 'border-[#2F855A] bg-green-50' : 'border-gray-300 hover:border-gray-400'
            }`}
          >
            {file ? (
              <div className="flex items-center justify-center gap-3">
                <FileText className="w-8 h-8 text-[#2F855A]" />
                <div className="text-left">
                  <p className="font-medium text-gray-900">{file.name}</p>
                  <p className="text-sm text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
              </div>
            ) : (
              <>
                <Upload className="w-10 h-10 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600 mb-1">Drag and drop your contract PDF here</p>
                <p className="text-sm text-gray-400 mb-3">or</p>
                <label className="cursor-pointer">
                  <span className="px-4 py-2 bg-[#2F855A] hover:bg-[#276749] text-white rounded-lg text-sm font-medium">
                    Browse Files
                  </span>
                  <input type="file" accept=".pdf" onChange={handleFileSelect} className="hidden" />
                </label>
              </>
            )}
          </div>

          {uploadStatus === 'success' && (
            <div className="mt-4 flex items-center gap-2 text-green-700 bg-green-50 p-3 rounded-lg">
              <CheckCircle className="w-5 h-5" />
              <span>Contract uploaded and parsing initiated</span>
            </div>
          )}

          {uploadStatus === 'error' && (
            <div className="mt-4 flex items-center gap-2 text-red-700 bg-red-50 p-3 rounded-lg">
              <AlertCircle className="w-5 h-5" />
              <span>{errorMessage || 'Upload failed. Please try again.'}</span>
            </div>
          )}

          <p className="mt-4 text-xs text-gray-500">
            Supported format: PDF. The contract will be parsed using AI to extract key terms and dates.
          </p>
        </div>

        <div className="px-6 py-4 bg-gray-50 border-t flex justify-end gap-3">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button
            className="bg-[#2F855A] hover:bg-[#276749]"
            onClick={handleUpload}
            disabled={!file || uploading}
          >
            {uploading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Uploading...</> : 'Upload & Parse'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ContractUploadModal;
