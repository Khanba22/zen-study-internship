"use client"
import { useState, useCallback } from 'react'


export function UploadPopup({ onClose, onUpload }) {
  const [dragActive, setDragActive] = useState(false)
  const [uploadedFiles, setUploadedFiles] = useState([])

  const handleDrag = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const newFiles = Array.from(e.dataTransfer.files)
      setUploadedFiles(prev => [...prev, ...newFiles])
    }
  }, [])

  const handleUpload = useCallback(() => {
    onUpload(uploadedFiles)
    setUploadedFiles([])
  }, [uploadedFiles, onUpload])

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">Upload Videos</h2>
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-lg p-8 text-center ${
            dragActive ? 'border-blue-500 bg-blue-500 bg-opacity-10' : 'border-gray-600'
          }`}
        >
          <p>Drag and drop video files here, or click to select files</p>
          <input
            type="file"
            multiple
            accept="video/*"
            onChange={(e) => {
              if (e.target.files) {
                const newFiles = Array.from(e.target.files)
                setUploadedFiles(prev => [...prev, ...newFiles])
              }
            }}
            className="hidden"
            id="fileInput"
          />
          <label htmlFor="fileInput" className="block mt-4 bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded cursor-pointer">
            Select Files
          </label>
        </div>
        {uploadedFiles.length > 0 && (
          <div className="mt-4">
            <h3 className="font-bold mb-2">Selected Files:</h3>
            <ul className="list-disc pl-5">
              {uploadedFiles.map((file, index) => (
                <li key={index}>{file.name}</li>
              ))}
            </ul>
          </div>
        )}
        <div className="flex justify-end mt-6 gap-2">
          <button
            onClick={onClose}
            className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
          >
            Cancel
          </button>
          <button
            onClick={handleUpload}
            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
            disabled={uploadedFiles.length === 0}
          >
            Upload
          </button>
        </div>
      </div>
    </div>
  )
}

