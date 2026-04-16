function ConversionResult({ status, downloadUrl, downloadFilename, errorMessage, onReset }) {
  if (status === 'idle') return null

  if (status === 'success') {
    return (
      <div className="mt-6 p-5 bg-emerald-900/20 border border-emerald-700/40 rounded-xl">
        <div className="flex items-center gap-2 mb-3">
          <svg className="w-5 h-5 text-emerald-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-emerald-300 font-semibold">Conversion successful!</p>
        </div>
        <a
          href={downloadUrl}
          download={downloadFilename}
          className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-purple-500 hover:to-fuchsia-500 text-white text-sm font-semibold px-5 py-2.5 rounded-lg transition-all duration-200"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Download {downloadFilename}
        </a>
        <button
          onClick={onReset}
          className="ml-3 text-sm text-brand-muted hover:text-brand-text underline"
        >
          Convert another file
        </button>
      </div>
    )
  }

  if (status === 'error') {
    return (
      <div className="mt-6 p-5 bg-red-900/20 border border-red-700/40 rounded-xl">
        <div className="flex items-start gap-2">
          <svg className="w-5 h-5 text-red-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <p className="text-red-300 font-semibold mb-1">Conversion failed</p>
            <p className="text-red-400 text-sm">{errorMessage}</p>
          </div>
        </div>
        <button
          onClick={onReset}
          className="mt-3 text-sm text-red-400 hover:text-red-300 underline"
        >
          Try again
        </button>
      </div>
    )
  }

  return null
}

export default ConversionResult
