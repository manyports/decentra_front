"use client";

import { useState } from 'react';
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ArrowRight, AlertCircle, Info, Check, Loader2, FileText } from "lucide-react";

interface RtmpToRtspFormProps {
  apiUrl: string;
  onConversionCreated: (conversion: any) => void;
}

const RtmpToRtspForm: React.FC<RtmpToRtspFormProps> = ({ apiUrl, onConversionCreated }) => {
  const [rtmpUrl, setRtmpUrl] = useState('');
  const [streamPath, setStreamPath] = useState('');
  const [rtspPort, setRtspPort] = useState('8554');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [showPathInfo, setShowPathInfo] = useState(false);
  
  const [touched, setTouched] = useState({
    rtmpUrl: false,
    streamPath: false,
    rtspPort: false
  });
  
  const validRtmpUrl = rtmpUrl.startsWith('rtmp://');
  const validStreamPath = !streamPath || /^[a-zA-Z0-9_/.-]+$/.test(streamPath);
  const validRtspPort = /^\d+$/.test(rtspPort) && parseInt(rtspPort) > 0 && parseInt(rtspPort) < 65536;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    
    setTouched({
      rtmpUrl: true,
      streamPath: true,
      rtspPort: true
    });
    
    if (!rtmpUrl) {
      setError('RTMP URL обязателен');
      return;
    }
    
    if (!validRtmpUrl) {
      setError('RTMP URL должен начинаться с rtmp://');
      return;
    }
    
    if (streamPath && !validStreamPath) {
      setError('Путь потока содержит недопустимые символы');
      return;
    }
    
    if (!validRtspPort) {
      setError('RTSP порт должен быть действительным номером порта (1-65535)');
      return;
    }
    
    try {
      setLoading(true);
      const response = await fetch(`${apiUrl}/conversions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          rtmpUrl: rtmpUrl,
          streamPath: streamPath || undefined,
          rtspPort: parseInt(rtspPort)
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Не удалось начать преобразование');
      }
      
      const conversion = await response.json();
      onConversionCreated(conversion);
      setRtmpUrl('');
      setStreamPath('');
      setRtspPort('8554');
      setSuccess(true);
      setTouched({
        rtmpUrl: false,
        streamPath: false,
        rtspPort: false
      });
      setTimeout(() => setSuccess(false), 5000);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Не удалось начать преобразование. Проверьте соединение и попробуйте снова.');
      console.error('Conversion error:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleFocus = (field: 'rtmpUrl' | 'streamPath' | 'rtspPort') => {
    setTouched(prev => ({...prev, [field]: true}));
  };
  
  const getExampleStreamPath = () => {
    return 'stream';
  };

  return (
    <div className="space-y-4">
      {success && (
        <div className="py-3 px-4 bg-green-50 border-l-2 border-green-500 text-sm text-green-700 rounded-md flex items-center">
          <Check className="h-4 w-4 mr-2 text-green-500" />
          <span>Преобразование успешно начато!</span>
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-5">
          <div>
            <div className="flex justify-between items-center mb-2">
              <Label htmlFor="rtmpUrl" className="text-sm text-gray-700 font-medium">
                RTMP URL <span className="text-red-500">*</span>
              </Label>
              <button 
                type="button" 
                onClick={() => setRtmpUrl("rtmp://localhost:1935/live/stream")}
                className="text-xs text-blue-700 hover:text-blue-900 font-medium flex items-center gap-1"
              >
                Использовать пример
                <ArrowRight className="h-3 w-3" />
              </button>
            </div>
            <div className="relative">
              <input
                id="rtmpUrl"
                type="text"
                value={rtmpUrl}
                onChange={(e) => setRtmpUrl(e.target.value)}
                onFocus={() => handleFocus('rtmpUrl')}
                placeholder="rtmp://сервер/путь/поток"
                className={cn(
                  "w-full px-4 py-3 text-sm bg-white border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:border-transparent",
                  !touched.rtmpUrl ? "focus:ring-blue-900" : 
                  validRtmpUrl ? "border-green-300 focus:ring-green-500" : "border-red-300 focus:ring-red-500",
                  error && !validRtmpUrl && "border-red-300 focus:ring-red-500"
                )}
                disabled={loading}
              />
              {touched.rtmpUrl && rtmpUrl && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  {validRtmpUrl ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-red-500" />
                  )}
                </div>
              )}
            </div>
            {touched.rtmpUrl && rtmpUrl && !validRtmpUrl && (
              <div className="mt-2 text-red-500 text-sm flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                <span>RTMP URL должен начинаться с rtmp://</span>
              </div>
            )}
            {!rtmpUrl && touched.rtmpUrl && (
              <div className="mt-2 text-red-500 text-sm flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                <span>RTMP URL обязателен</span>
              </div>
            )}
          </div>
          <div>
            <div className="flex justify-between items-center mb-2">
              <Label htmlFor="rtspPort" className="block text-sm text-gray-700 font-medium">
                RTSP порт <span className="text-gray-400">(необязательно)</span>
              </Label>
            </div>
            <div className="relative">
              <input
                id="rtspPort"
                type="text"
                value={rtspPort}
                onChange={(e) => setRtspPort(e.target.value)}
                onFocus={() => handleFocus('rtspPort')}
                placeholder="8554"
                className={cn(
                  "w-full px-4 py-3 text-sm bg-white border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:border-transparent",
                  !touched.rtspPort ? "focus:ring-blue-900" : 
                  validRtspPort ? "border-green-300 focus:ring-green-500" : "border-red-300 focus:ring-red-500"
                )}
                disabled={loading}
              />
              {touched.rtspPort && rtspPort && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  {validRtspPort ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-red-500" />
                  )}
                </div>
              )}
            </div>
            {touched.rtspPort && rtspPort && !validRtspPort && (
              <div className="mt-2 text-red-500 text-sm flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                <span>RTSP порт должен быть действительным номером порта (1-65535)</span>
              </div>
            )}
            <p className="mt-1 text-xs text-gray-500">
              По умолчанию 8554, если не указан
            </p>
          </div>
          <div>
            <div className="flex justify-between items-center mb-2">
              <Label htmlFor="streamPath" className="block text-sm text-gray-700 font-medium">
                Путь потока <span className="text-gray-400">(необязательно)</span>
              </Label>
              <button
                type="button"
                onClick={() => setShowPathInfo(!showPathInfo)}
                className="text-xs text-gray-500 hover:text-gray-700 flex items-center gap-1"
              >
                <Info className="h-3 w-3" />
                <span>Что это?</span>
              </button>
            </div>
            {showPathInfo && (
              <div className="mb-2 text-xs bg-blue-50 text-blue-700 p-3 rounded-md flex items-start gap-2">
                <FileText className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="mb-1">Путь потока определяет структуру RTSP URL.</p>
                  <p>По умолчанию <code className="bg-blue-100 px-1 py-0.5 rounded">{getExampleStreamPath()}</code></p>
                </div>
              </div>
            )}
            <div className="relative">
              <input
                id="streamPath"
                type="text"
                value={streamPath}
                onChange={(e) => setStreamPath(e.target.value)}
                onFocus={() => handleFocus('streamPath')}
                placeholder={getExampleStreamPath()}
                className={cn(
                  "w-full px-4 py-3 text-sm bg-white border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:border-transparent",
                  !touched.streamPath || !streamPath ? "focus:ring-blue-900" : 
                  validStreamPath ? "border-green-300 focus:ring-green-500" : "border-red-300 focus:ring-red-500"
                )}
                disabled={loading}
              />
              {touched.streamPath && streamPath && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  {validStreamPath ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-red-500" />
                  )}
                </div>
              )}
            </div>
            {touched.streamPath && streamPath && !validStreamPath && (
              <div className="mt-2 text-red-500 text-sm flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                <span>Путь потока содержит недопустимые символы</span>
              </div>
            )}
            <p className="mt-1 text-xs text-gray-500">
              Если не указан, будет сгенерирован уникальный путь потока
            </p>
          </div>

          <div className="pt-4">
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-900 hover:bg-blue-800 text-white py-5 relative"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Начало преобразования...
                </>
              ) : (
                'Начать преобразование RTMP в RTSP'
              )}
            </Button>
            {error && (
              <div className="mt-3 text-red-500 text-sm flex items-center justify-center gap-1">
                <AlertCircle className="h-4 w-4" />
                <span>{error}</span>
              </div>
            )}
          </div>
        </div>
      </form>
    </div>
  );
};

export default RtmpToRtspForm; 