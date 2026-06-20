import { useCallback, useRef } from 'react'

const ACCEPTED_EXTENSIONS = ['.docx', '.xlsx', '.pdf', '.jpg', '.jpeg', '.png']
const MAX_FILE_MB = 4

function FileUpload({ file, onFileChange }) {
  const inputRef = useRef(null)

  const validateAndSet = (f) => {
    if (!f) return
    const ext = '.' + f.name.split('.').pop().toLowerCase()
    if (!ACCEPTED_EXTENSIONS.includes(ext)) {
      alert(`Unsupported file type: ${ext}.\nAccepted: ${ACCEPTED_EXTENSIONS.join(', ')}`)
      return
    }
    if (f.size > MAX_FILE_MB * 1024 * 1024) {
      alert(`File is too large. Maximum size is ${MAX_FILE_MB} MB.`)
      return
    }
    onFileChange(f)
  }

  const handleDrop = useCallback((e) => {
    e.preventDefault()
    const dropped = e.dataTransfer.files[0]
    validateAndSet(dropped)
  }, [onFileChange])

  const handleDragOver = (e) => e.preventDefault()

  const handleInputChange = (e) => {
    validateAndSet(e.target.files[0])
  }

  const formatBytes = (bytes) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  if (file) {
    return (
      <div className="flex items-center gap-3 p-4 border-2 border-purple-700/60 bg-purple-900/20 rounded-xl">
        <div className="flex-shrink-0 w-10 h-10 bg-purple-900/50 rounded-lg flex items-center justify-center">
          <svg className="w-5 h-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-brand-text truncate">{file.name}</p>
          <p className="text-xs text-brand-muted">{formatBytes(file.size)}</p>
        </div>
        <button
          onClick={() => { onFileChange(null); if (inputRef.current) inputRef.current.value = '' }}
          className="text-zinc-500 hover:text-fuchsia-400 transition-colors"
          title="Remove file"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    )
  }

  return (
    <div
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onClick={() => inputRef.current?.click()}
      className="border-2 border-dashed border-zinc-700 hover:border-purple-500 rounded-xl p-8 text-center cursor-pointer transition-colors duration-200 hover:bg-purple-900/20"
    >
      <svg className="mx-auto h-10 w-10 text-zinc-600 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
          d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
      </svg>
      <p className="text-sm font-medium text-brand-muted dark:text-zinc-300">
        Drag &amp; drop a file here, or <span className="text-purple-400 underline">browse</span>
      </p>
      <p className="text-xs text-zinc-500 mt-1">
        Supports: {ACCEPTED_EXTENSIONS.join(', ')} · Max {MAX_FILE_MB} MB
      </p>
      <input
        ref={inputRef}
        type="file"
        className="hidden"
        accept={ACCEPTED_EXTENSIONS.join(',')}
        onChange={handleInputChange}
      />
    </div>
  )
}

export default FileUpload
