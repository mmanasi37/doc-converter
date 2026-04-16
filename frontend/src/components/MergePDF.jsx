import { useState, useCallback, useRef } from 'react'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || ''
const MAX_FILE_MB = 50

function MergePDF({ darkMode }) {
  const [files, setFiles] = useState([])
  const [status, setStatus] = useState('idle') // idle | merging | success | error
  const [errorMessage, setErrorMessage] = useState('')
  const [downloadUrl, setDownloadUrl] = useState(null)
  const inputRef = useRef(null)

  const addFiles = useCallback((newFiles) => {
    const valid = Array.from(newFiles).filter((f) => {
      if (!f.name.toLowerCase().endsWith('.pdf')) {
        alert(`Only PDF files are supported. Skipping: ${f.name}`)
        return false
      }
      if (f.size > MAX_FILE_MB * 1024 * 1024) {
        alert(`File too large (max ${MAX_FILE_MB} MB): ${f.name}`)
        return false
      }
      return true
    })
    setFiles((prev) => [...prev, ...valid])
  }, [])

  const handleDrop = useCallback((e) => {
    e.preventDefault()
    addFiles(e.dataTransfer.files)
  }, [addFiles])

  const handleInputChange = (e) => addFiles(e.target.files)

  const removeFile = (index) => setFiles((prev) => prev.filter((_, i) => i !== index))

  const moveFile = (index, direction) => {
    setFiles((prev) => {
      const arr = [...prev]
      const target = index + direction
      if (target < 0 || target >= arr.length) return arr
      ;[arr[index], arr[target]] = [arr[target], arr[index]]
      return arr
    })
  }

  const formatBytes = (bytes) => {
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  const handleMerge = async () => {
    if (files.length < 2) return
    setStatus('merging')
    setErrorMessage('')
    setDownloadUrl(null)

    const formData = new FormData()
    files.forEach((f) => formData.append('files', f))

    try {
      const response = await axios.post(`${API_URL}/api/merge-pdf`, formData, {
        responseType: 'blob',
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      const url = URL.createObjectURL(new Blob([response.data]))
      setDownloadUrl(url)
      setStatus('success')
    } catch (err) {
      setStatus('error')
      if (err.response) {
        try {
          const text = await err.response.data.text()
          const json = JSON.parse(text)
          setErrorMessage(json.detail || 'Merge failed.')
        } catch {
          setErrorMessage('Merge failed. Please try again.')
        }
      } else {
        setErrorMessage(err.message || 'Network error.')
      }
    }
  }

  const handleReset = () => {
    setFiles([])
    setStatus('idle')
    setErrorMessage('')
    if (downloadUrl) URL.revokeObjectURL(downloadUrl)
    setDownloadUrl(null)
    if (inputRef.current) inputRef.current.value = ''
  }

  const surface = darkMode
    ? 'bg-brand-surface border-brand-border'
    : 'bg-white border-purple-200'
  const text = darkMode ? 'text-white' : 'text-gray-900'
  const subtext = darkMode ? 'text-zinc-400' : 'text-gray-500'
  const dropzone = darkMode
    ? 'border-zinc-700 hover:border-purple-500 hover:bg-purple-900/20'
    : 'border-gray-300 hover:border-purple-400 hover:bg-purple-50'
  const fileRow = darkMode
    ? 'bg-purple-900/20 border-brand-border'
    : 'bg-purple-50 border-purple-200'

  return (
    <div className={`border rounded-2xl shadow-2xl p-8 ${surface}`}>
      <h2 className={`text-2xl font-semibold mb-6 text-center ${text}`}>Merge PDF Files</h2>

      {/* Drop zone */}
      <div
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        onClick={() => inputRef.current?.click()}
        className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors duration-200 mb-6 ${dropzone}`}
      >
        <svg className={`mx-auto h-10 w-10 mb-3 ${darkMode ? 'text-zinc-600' : 'text-gray-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
            d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <p className={`text-sm font-medium ${darkMode ? 'text-zinc-300' : 'text-gray-700'}`}>
          Drag &amp; drop PDF files, or <span className="text-purple-400 underline">browse</span>
        </p>
        <p className={`text-xs mt-1 ${subtext}`}>PDF only · Max {MAX_FILE_MB} MB each</p>
        <input ref={inputRef} type="file" accept=".pdf" multiple className="hidden" onChange={handleInputChange} />
      </div>

      {/* File list */}
      {files.length > 0 && (
        <div className="mb-6 space-y-2">
          <p className={`text-xs font-semibold uppercase tracking-wider mb-2 ${subtext}`}>
            {files.length} file{files.length > 1 ? 's' : ''} — drag to reorder
          </p>
          {files.map((f, i) => (
            <div key={i} className={`flex items-center gap-3 px-3 py-2 border rounded-lg ${fileRow}`}>
              <div className="flex flex-col gap-0.5">
                <button onClick={() => moveFile(i, -1)} disabled={i === 0}
                  className="text-xs leading-none text-zinc-500 hover:text-purple-400 disabled:opacity-20">▲</button>
                <button onClick={() => moveFile(i, 1)} disabled={i === files.length - 1}
                  className="text-xs leading-none text-zinc-500 hover:text-purple-400 disabled:opacity-20">▼</button>
              </div>
              <span className={`text-xs font-bold w-5 text-center ${darkMode ? 'text-zinc-500' : 'text-gray-400'}`}>{i + 1}</span>
              <span className={`flex-1 text-sm truncate ${text}`}>{f.name}</span>
              <span className={`text-xs shrink-0 ${subtext}`}>{formatBytes(f.size)}</span>
              <button onClick={() => removeFile(i)}
                className={`hover:text-fuchsia-400 transition-colors ${darkMode ? 'text-zinc-500' : 'text-gray-400'}`}>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Merge button */}
      {files.length >= 2 && status !== 'success' && (
        <button
          onClick={handleMerge}
          disabled={status === 'merging'}
          className="w-full bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-purple-500 hover:to-fuchsia-500 disabled:opacity-50 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 flex items-center justify-center gap-2"
        >
          {status === 'merging' ? (
            <>
              <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Merging…
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              Merge {files.length} PDFs
            </>
          )}
        </button>
      )}

      {files.length === 1 && (
        <p className={`text-sm text-center ${darkMode ? 'text-amber-400' : 'text-amber-600'}`}>Add at least one more PDF to merge.</p>
      )}

      {/* Success */}
      {status === 'success' && (
        <div className={`mt-4 p-5 rounded-xl border ${darkMode ? 'bg-emerald-900/20 border-emerald-700/40' : 'bg-emerald-50 border-emerald-200'}`}>
          <p className={`font-semibold mb-3 ${darkMode ? 'text-emerald-300' : 'text-emerald-800'}`}>✓ Merge successful!</p>
          <a
            href={downloadUrl}
            download="merged.pdf"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-purple-500 hover:to-fuchsia-500 text-white text-sm font-semibold px-5 py-2.5 rounded-lg transition-all duration-200"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Download merged.pdf
          </a>
          <button onClick={handleReset} className={`ml-3 text-sm underline ${darkMode ? 'text-zinc-400 hover:text-zinc-200' : 'text-gray-500 hover:text-gray-700'}`}>
            Merge more files
          </button>
        </div>
      )}

      {/* Error */}
      {status === 'error' && (
        <div className={`mt-4 p-5 rounded-xl border ${darkMode ? 'bg-red-900/20 border-red-700/40' : 'bg-red-50 border-red-200'}`}>
          <p className={`font-semibold mb-1 ${darkMode ? 'text-red-300' : 'text-red-800'}`}>Merge failed</p>
          <p className={`text-sm ${darkMode ? 'text-red-400' : 'text-red-700'}`}>{errorMessage}</p>
          <button onClick={() => setStatus('idle')} className={`mt-2 text-sm underline ${darkMode ? 'text-red-400 hover:text-red-300' : 'text-red-600 hover:text-red-800'}`}>Try again</button>
        </div>
      )}
    </div>
  )
}

export default MergePDF
