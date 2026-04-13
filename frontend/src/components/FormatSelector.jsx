const FORMAT_LABELS = {
  pdf: 'PDF Document',
  csv: 'CSV Spreadsheet',
  jpg: 'JPEG Image',
  png: 'PNG Image',
}

function FormatSelector({ targets, value, onChange, sourceFormat }) {
  if (!targets || targets.length === 0) {
    return (
      <p className="text-sm text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3">
        No conversions available for <strong>.{sourceFormat}</strong> files.
      </p>
    )
  }

  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full appearance-none bg-white border-2 border-gray-200 focus:border-indigo-500 rounded-xl px-4 py-3 pr-10 text-gray-800 text-sm font-medium outline-none transition-colors duration-200 cursor-pointer"
      >
        <option value="" disabled>— Select output format —</option>
        {targets.map((fmt) => (
          <option key={fmt} value={fmt}>
            .{fmt.toUpperCase()} — {FORMAT_LABELS[fmt] || fmt}
          </option>
        ))}
      </select>
      <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
        <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </div>
  )
}

export default FormatSelector
