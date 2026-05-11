import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { ImagePlus, UploadCloud, X } from 'lucide-react';
import { Button } from '../ui/button';

export function DropzoneUploader({ files, setFiles }) {
  const onDrop = useCallback((acceptedFiles) => {
    setFiles((current) => [...current, ...acceptedFiles].slice(0, 8));
  }, [setFiles]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.png', '.jpg', '.jpeg', '.webp'] },
    maxFiles: 8,
  });

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={`grid min-h-64 cursor-pointer place-items-center rounded-2xl border border-dashed p-8 text-center transition ${
          isDragActive ? 'border-emerald-300 bg-emerald-300/10' : 'border-white/15 bg-white/[.04] hover:bg-white/[.07]'
        }`}
      >
        <input {...getInputProps()} />
        <div>
          <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-gradient-to-br from-emerald-300/20 to-sky-400/20 text-emerald-200">
            <UploadCloud className="h-8 w-8" />
          </div>
          <p className="mt-4 text-lg font-bold text-white">Drop luxury property media</p>
          <p className="mt-2 text-sm text-slate-400">Images upload to Pinata first, then TERRALINK mints with the final metadata CID.</p>
        </div>
      </div>
      {files.length > 0 && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {files.map((file, index) => (
            <div key={`${file.name}-${index}`} className="relative overflow-hidden rounded-xl border border-white/10 bg-white/[.05]">
              <img src={URL.createObjectURL(file)} alt={file.name} className="h-28 w-full object-cover" />
              <Button
                size="icon"
                variant="danger"
                className="absolute right-2 top-2 h-8 w-8"
                onClick={() => setFiles((current) => current.filter((_, itemIndex) => itemIndex !== index))}
                aria-label="Remove image"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
          <div className="grid h-28 place-items-center rounded-xl border border-white/10 bg-white/[.035] text-slate-500">
            <ImagePlus className="h-6 w-6" />
          </div>
        </div>
      )}
    </div>
  );
}
