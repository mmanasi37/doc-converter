import { useState, useCallback } from 'react'
import axios from 'axios'
import FileUpload from './components/FileUpload'
import FormatSelector from './components/FormatSelector'
import ConversionResult from './components/ConversionResult'

const SUPPORTED_FORMATS = {
  docx: ['pdf', 'xlsx'],
  xlsx: ['csv', 'pdf', 'docx'],
  pdf: ['jpg', 'png', 'docx'],
  jpg: ['png', 'pdf'],
  jpeg: ['png', 'pdf'],
  png: ['jpg', 'pdf'],
}

const API_URL = import.meta.env.VITE_API_URL || ''

function App() {
  const [file, setFile] = useState(null)
  const [targetFormat, setTargetFormat] = useState('')
  const [status, setStatus] = useState('idle') // idle | converting | success | error
  const [errorMessage, setErrorMessage] = useState('')
  const [downloadUrl, setDownloadUrl] = useState(null)
  const [downloadFilename, setDownloadFilename] = useState('')

  const sourceExt = file
    ? file.name.split('.').pop().toLowerCase().replace('jpeg', 'jpg')
    : null

  const availableTargets = sourceExt ? SUPPORTED_FORMATS[sourceExt] || [] : []

  const handleFileChange = useCallback((selectedFile) => {
    setFile(selectedFile)
    setTargetFormat('')
    setStatus('idle')
    setErrorMessage('')
    setDownloadUrl(null)
  }, [])

  const handleConvert = async () => {
    if (!file || !targetFormat) return

    setStatus('converting')
    setErrorMessage('')
    setDownloadUrl(null)

    const formData = new FormData()
    formData.append('file', file)
    formData.append('target_format', targetFormat)

    try {
      const response = await axios.post(`${API_URL}/api/convert`, formData, {
        responseType: 'blob',
        headers: { 'Content-Type': 'multipart/form-data' },
      })

      const blob = new Blob([response.data])
      const url = URL.createObjectURL(blob)
      const baseName = file.name.replace(/\.[^/.]+$/, '')
      setDownloadUrl(url)
      setDownloadFilename(`${baseName}.${targetFormat}`)
      setStatus('success')
    } catch (err) {
      setStatus('error')
      if (err.response) {
        try {
          const text = await err.response.data.text()
          const json = JSON.parse(text)
          setErrorMessage(json.detail || 'Conversion failed.')
        } catch {
          setErrorMessage('Conversion failed. Please try again.')
        }
      } else {
        setErrorMessage(err.message || 'Network error. Is the backend running?')
      }
    }
  }

  const handleReset = () => {
    setFile(null)
    setTargetFormat('')
    setStatus('idle')
    setErrorMessage('')
    if (downloadUrl) URL.revokeObjectURL(downloadUrl)
    setDownloadUrl(null)
    setDownloadFilename('')
  }

  return (
    <div className="min-h-screen bg-brand-bg">
      {/* Header */}
      <header className="bg-brand-surface border-b border-brand-border shadow-lg">
        <div className="max-w-4xl mx-auto px-4 py-5 flex items-center gap-3">
          <div className="w-9 h-9 bg-gradient-to-br from-purple-600 to-fuchsia-600 rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Doc Converter</h1>
            <p className="text-xs text-brand-muted">Convert between Word, Excel, PDF and images</p>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-4xl mx-auto px-4 py-10">
        <div className="bg-brand-surface border border-brand-border rounded-2xl shadow-2xl p-8">
          <h2 className="text-2xl font-semibold text-white mb-6 text-center">
            Convert Your Document
          </h2>

          {/* Step 1 – Upload */}
          <div className="mb-6">
            <p className="text-sm font-medium text-zinc-400 mb-2">
              <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-gradient-to-br from-purple-600 to-fuchsia-600 text-white text-xs mr-2">1</span>
              Select a file to convert
            </p>
            <FileUpload file={file} onFileChange={handleFileChange} />
          </div>

          {/* Step 2 – Format */}
          {file && (
            <div className="mb-6">
              <p className="text-sm font-medium text-zinc-400 mb-2">
                <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-gradient-to-br from-purple-600 to-fuchsia-600 text-white text-xs mr-2">2</span>
                Choose output format
              </p>
              <FormatSelector
                targets={availableTargets}
                value={targetFormat}
                onChange={setTargetFormat}
                sourceFormat={sourceExt}
              />
            </div>
          )}

          {/* Convert button */}
          {file && targetFormat && (
            <div className="flex gap-3 mt-4">
              <button
                onClick={handleConvert}
                disabled={status === 'converting'}
                className="flex-1 bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-purple-500 hover:to-fuchsia-500 disabled:opacity-50 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 flex items-center justify-center gap-2"
              >
                {status === 'converting' ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Converting…
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Convert to .{targetFormat}
                  </>
                )}
              </button>
              <button
                onClick={handleReset}
                className="px-4 py-3 border border-brand-border text-zinc-400 hover:bg-purple-900/30 hover:text-white rounded-xl transition-colors duration-200"
                title="Start over"
              >
                ✕
              </button>
            </div>
          )}

          {/* Result / Error */}
          <ConversionResult
            status={status}
            downloadUrl={downloadUrl}
            downloadFilename={downloadFilename}
            errorMessage={errorMessage}
            onReset={handleReset}
          />
        </div>

        {/* Supported conversions table */}
        <div className="mt-8 bg-brand-surface border border-brand-border rounded-2xl shadow p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Supported Conversions</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {Object.entries(SUPPORTED_FORMATS).map(([src, targets]) =>
              targets.map((tgt) => (
                <div
                  key={`${src}-${tgt}`}
                  className="flex items-center gap-2 bg-purple-900/20 border border-brand-border rounded-lg px-3 py-2 text-sm"
                >
                  <span className="font-mono font-semibold text-purple-400 uppercase">.{src}</span>
                  <svg className="w-4 h-4 text-zinc-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                  <span className="font-mono font-semibold text-fuchsia-400 uppercase">.{tgt}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </main>

      <footer className="text-center text-sm text-brand-muted py-6">
        Developed by <a href="https://github.com/mmanasi37" className="text-purple-400 hover:text-fuchsia-400 hover:underline">Manasi M</a>
      </footer>
    </div>
  )
}

export default App
