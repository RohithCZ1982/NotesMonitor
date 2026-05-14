import { useState, useEffect } from 'react';
import { X, Download, ChevronLeft, ChevronRight, ZoomIn } from 'lucide-react';
import { FileRecord } from '../../types';

interface FilePreviewProps {
  files: FileRecord[];
  initialIndex?: number;
  onClose: () => void;
  onDownload?: (file: FileRecord) => void;
}

export default function FilePreview({
  files, initialIndex = 0, onClose, onDownload,
}: FilePreviewProps) {
  const [current, setCurrent] = useState(initialIndex);
  const file = files[current];

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft')  setCurrent((c) => Math.max(0, c - 1));
      if (e.key === 'ArrowRight') setCurrent((c) => Math.min(files.length - 1, c + 1));
      if (e.key === 'Escape')     onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [files.length, onClose]);

  const isImage = file.mimetype.startsWith('image/');
  const isVideo = file.mimetype.startsWith('video/');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 animate-fade-in">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-6 py-4 bg-gradient-to-b from-black/60 to-transparent z-10">
        <div className="text-white">
          <p className="text-sm font-medium line-clamp-2 max-w-xs md:max-w-md">
            {file.originalName}
          </p>
          <p className="text-xs text-gray-400 mt-0.5">
            {current + 1} / {files.length} &nbsp;·&nbsp;{' '}
            {(file.size / 1024 / 1024).toFixed(1)} MB
          </p>
        </div>
        <div className="flex items-center gap-2">
          {onDownload && (
            <button
              onClick={() => onDownload(file)}
              className="p-2 rounded-lg text-white hover:bg-white/10 transition-colors"
              title="Download"
            >
              <Download size={18} />
            </button>
          )}
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-white hover:bg-white/10 transition-colors"
            title="Close (Esc)"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex items-center justify-center w-full h-full px-16 py-20">
        {isImage && (
          <img
            key={file._id}
            src={file.url}
            alt={file.originalName}
            className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
          />
        )}
        {isVideo && (
          <video
            key={file._id}
            src={file.url}
            controls
            autoPlay
            className="max-w-full max-h-full rounded-lg shadow-2xl"
            style={{ maxHeight: 'calc(100vh - 10rem)' }}
          />
        )}
        {!isImage && !isVideo && (
          <div className="flex flex-col items-center gap-4 text-white">
            <div className="w-24 h-24 bg-white/10 rounded-2xl flex items-center justify-center">
              <ZoomIn size={40} className="text-white/50" />
            </div>
            <p className="text-lg font-medium">{file.originalName}</p>
            <p className="text-sm text-gray-400">Preview not available</p>
          </div>
        )}
      </div>

      {/* Arrow navigation */}
      {files.length > 1 && (
        <>
          <button
            onClick={() => setCurrent((c) => Math.max(0, c - 1))}
            disabled={current === 0}
            className="absolute left-3 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors disabled:opacity-30"
          >
            <ChevronLeft size={22} />
          </button>
          <button
            onClick={() => setCurrent((c) => Math.min(files.length - 1, c + 1))}
            disabled={current === files.length - 1}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors disabled:opacity-30"
          >
            <ChevronRight size={22} />
          </button>
        </>
      )}

      {/* Thumbnail strip */}
      {files.length > 1 && (
        <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 px-4 overflow-x-auto">
          {files.map((f, idx) => (
            <button
              key={f._id}
              onClick={() => setCurrent(idx)}
              className={`shrink-0 w-12 h-12 rounded-lg overflow-hidden border-2 transition-all ${
                idx === current ? 'border-teal-400 scale-110' : 'border-transparent opacity-60 hover:opacity-100'
              }`}
            >
              {f.mimetype.startsWith('image/') ? (
                <img src={f.url} alt={f.originalName} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gray-700 flex items-center justify-center">
                  <span className="text-white text-xs">▶</span>
                </div>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
