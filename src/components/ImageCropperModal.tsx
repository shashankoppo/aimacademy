import React, { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import { X, Check } from 'lucide-react';
import getCroppedImg from '@/utils/cropImage';

interface ImageCropperModalProps {
  imageSrc: string;
  onCropComplete: (croppedImageBase64: string) => void;
  onClose: () => void;
  aspectRatio?: number;
}

const ImageCropperModal: React.FC<ImageCropperModalProps> = ({
  imageSrc,
  onCropComplete,
  onClose,
  aspectRatio = 1,
}) => {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [currentAspectRatio, setCurrentAspectRatio] = useState(aspectRatio);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

  const onCropCompleteHandler = useCallback((croppedArea: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleSave = async () => {
    try {
      if (croppedAreaPixels) {
        const croppedImage = await getCroppedImg(imageSrc, croppedAreaPixels, 0);
        onCropComplete(croppedImage);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const ratios = [
    { label: 'Square (1:1)', value: 1 },
    { label: 'Portrait (3:4)', value: 3 / 4 },
    { label: 'Landscape (4:3)', value: 4 / 3 },
    { label: 'Banner (16:9)', value: 16 / 9 },
  ];

  return (
    <div className="fixed inset-0 z-[9999] bg-black/80 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl overflow-hidden flex flex-col h-[85vh]">
        <div className="p-4 border-b border-slate-100 flex justify-between items-center">
          <h3 className="font-bold text-lg text-slate-900">Crop Image</h3>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="relative flex-1 w-full bg-black">
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={currentAspectRatio}
            onCropChange={setCrop}
            onCropComplete={onCropCompleteHandler}
            onZoomChange={setZoom}
          />
        </div>
        
        <div className="p-5 bg-white border-t border-slate-100 space-y-5">
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Format:</span>
              <div className="flex gap-2 flex-wrap">
                {ratios.map((r) => (
                  <button
                    key={r.label}
                    onClick={() => setCurrentAspectRatio(r.value)}
                    className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${
                      currentAspectRatio === r.value
                        ? 'bg-primary text-slate-900'
                        : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                    }`}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider w-10">Zoom</span>
              <input
                type="range"
                value={zoom}
                min={1}
                max={3}
                step={0.1}
                onChange={(e) => setZoom(Number(e.target.value))}
                className="flex-1 sm:w-32 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-primary"
              />
            </div>
          </div>
          
          <div className="flex justify-end gap-3 pt-2 border-t border-slate-100 mt-2">
            <button
              onClick={onClose}
              className="px-4 py-2 font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 font-semibold text-slate-900 bg-primary hover:brightness-105 rounded-lg transition-all flex items-center gap-2"
            >
              <Check className="w-4 h-4" /> Apply Crop
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageCropperModal;
