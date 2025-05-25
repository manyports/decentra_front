"use client";

import { useState } from 'react';
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ArrowRight, AlertCircle, Info, Check, Loader2, FileText } from "lucide-react";

interface StreamFormProps {
  onSubmit: (streamName: string, customPath?: string) => Promise<void>;
  existingStreams: { name?: string; path: string }[];
}

const StreamForm: React.FC<StreamFormProps> = ({ onSubmit, existingStreams }) => {
  const [streamName, setStreamName] = useState('');
  const [customPath, setCustomPath] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [showPathInfo, setShowPathInfo] = useState(false);
  
  const [touched, setTouched] = useState({
    streamName: false,
    customPath: false
  });
  
  const validStreamName = /^[a-zA-Z0-9_-]+$/.test(streamName);
  const validCustomPath = !customPath || /^[a-zA-Z0-9_/.-]+$/.test(customPath);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    
    setTouched({
      streamName: true,
      customPath: true
    });
    
    if (!streamName) {
      setError('Название потока обязательно');
      return;
    }
    
    if (!validStreamName) {
      setError('Название потока может содержать только буквы, цифры, подчеркивания и дефисы');
      return;
    }
    
    if (customPath && !validCustomPath) {
      setError('Путь потока содержит недопустимые символы');
      return;
    }

    const isDuplicateName = existingStreams.some(stream => 
      stream.name?.toLowerCase() === streamName.toLowerCase()
    );
    
    if (isDuplicateName) {
      setError('Поток с таким именем уже существует. Пожалуйста, используйте другое имя.');
      return;
    }

    if (customPath) {
      const isDuplicatePath = existingStreams.some(stream => 
        stream.path.toLowerCase() === customPath.toLowerCase()
      );
      
      if (isDuplicatePath) {
        setError('Путь потока уже используется. Пожалуйста, укажите другой путь.');
        return;
      }
    }
    
    try {
      setLoading(true);
      await onSubmit(streamName, customPath || undefined);
      setStreamName('');
      setCustomPath('');
      setSuccess(true);
      setTouched({
        streamName: false,
        customPath: false
      });
      setTimeout(() => setSuccess(false), 5000);
    } catch (error) {
      setError('Не удалось создать поток. Проверьте соединение и попробуйте снова.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleFocus = (field: 'streamName' | 'customPath') => {
    setTouched(prev => ({...prev, [field]: true}));
  };
  
  const getExamplePathName = () => {
    if (streamName) {
      return `live/${streamName}`;
    }
    return 'live/my_stream';
  };

  return (
    <div className="space-y-4">
      {success && (
        <div className="py-3 px-4 bg-green-50 border-l-2 border-green-500 text-sm text-green-700 rounded-md flex items-center">
          <Check className="h-4 w-4 mr-2 text-green-500" />
          <span>Поток успешно создан! Готов к трансляции.</span>
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-5">
          <div>
            <div className="flex justify-between items-center mb-2">
              <Label htmlFor="streamName" className="text-sm text-gray-700 font-medium">
                Имя потока <span className="text-red-500">*</span>
              </Label>
              <button 
                type="button" 
                onClick={() => setStreamName("test_stream")}
                className="text-xs text-blue-700 hover:text-blue-900 font-medium flex items-center gap-1"
              >
                Использовать пример
                <ArrowRight className="h-3 w-3" />
              </button>
            </div>
            <div className="relative">
              <input
                id="streamName"
                type="text"
                value={streamName}
                onChange={(e) => setStreamName(e.target.value)}
                onFocus={() => handleFocus('streamName')}
                placeholder="my_stream"
                className={cn(
                  "w-full px-4 py-3 text-sm bg-white border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:border-transparent",
                  !touched.streamName ? "focus:ring-blue-900" : 
                  validStreamName ? "border-green-300 focus:ring-green-500" : "border-red-300 focus:ring-red-500",
                  error && "border-red-300 focus:ring-red-500"
                )}
                disabled={loading}
              />
              {touched.streamName && streamName && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  {validStreamName ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-red-500" />
                  )}
                </div>
              )}
            </div>
            {touched.streamName && streamName && !validStreamName && (
              <div className="mt-2 text-red-500 text-sm flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                <span>Имя потока может содержать только буквы, цифры, подчеркивания и дефисы</span>
              </div>
            )}
            {!streamName && touched.streamName && (
              <div className="mt-2 text-red-500 text-sm flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                <span>Имя потока обязательно</span>
              </div>
            )}
          </div>
          <div>
            <div className="flex justify-between items-center mb-2">
              <Label htmlFor="customPath" className="block text-sm text-gray-700 font-medium">
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
                  <p className="mb-1">Путь потока определяет структуру URL вашего потока.</p>
                  <p>По умолчанию используется <code className="bg-blue-100 px-1 py-0.5 rounded">{getExamplePathName()}</code></p>
                </div>
              </div>
            )}
            <div className="relative">
              <input
                id="customPath"
                type="text"
                value={customPath}
                onChange={(e) => setCustomPath(e.target.value)}
                onFocus={() => handleFocus('customPath')}
                placeholder={getExamplePathName()}
                className={cn(
                  "w-full px-4 py-3 text-sm bg-white border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:border-transparent",
                  !touched.customPath || !customPath ? "focus:ring-blue-900" : 
                  validCustomPath ? "border-green-300 focus:ring-green-500" : "border-red-300 focus:ring-red-500"
                )}
                disabled={loading}
              />
              {touched.customPath && customPath && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  {validCustomPath ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-red-500" />
                  )}
                </div>
              )}
            </div>
            {touched.customPath && customPath && !validCustomPath && (
              <div className="mt-2 text-red-500 text-sm flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                <span>Путь потока содержит недопустимые символы</span>
              </div>
            )}
            <p className="mt-1 text-xs text-gray-500">
              Если не указан, будет использован "{getExamplePathName()}"
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
                  Создание...
                </>
              ) : (
                'Создать поток'
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

export default StreamForm; 