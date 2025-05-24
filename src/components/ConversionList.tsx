"use client";

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Copy, X, ArrowRight, Check, AlertTriangle, ExternalLink } from "lucide-react";

interface Conversion {
  id: string;
  rtmpUrl: string;
  rtspUrl: string;
  status: string;
  startTime: string;
  endTime?: string;
}

interface ConversionListProps {
  conversions: Conversion[];
  onStopConversion: (id: string) => void;
}

const ConversionList: React.FC<ConversionListProps> = ({ conversions, onStopConversion }) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const formatUrl = (url: string) => {
    try {
      if (url.startsWith('rtmp://')) {
        const pathParts = url.split('/');
        if (pathParts.length > 3) {
          return `${pathParts[0]}//${pathParts[2]}/${pathParts.slice(3).join('/')}`;
        }
      }
      
      if (url.startsWith('rtsp://')) {
        const pathParts = url.split('/');
        if (pathParts.length > 3) {
          return `${pathParts[0]}//${pathParts[2]}/${pathParts.slice(3).join('/')}`;
        }
      }
      
      return url;
    } catch (e) {
      return url;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running':
        return 'bg-green-500';
      case 'completed':
        return 'bg-blue-500';
      case 'failed':
        return 'bg-red-500';
      case 'stopped':
        return 'bg-yellow-500';
      default:
        return 'bg-gray-500';
    }
  };

  if (conversions.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
        <div className="flex justify-center mb-4">
          <AlertTriangle className="h-12 w-12 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-600 mb-2">Нет активных преобразований</h3>
        <p className="text-gray-500 text-sm max-w-md mx-auto">
          Начните новое преобразование RTMP в RTSP выше, чтобы увидеть его здесь.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {conversions.map((conversion) => (
        <div key={conversion.id} className="p-6 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200">
          <div className="flex justify-between items-start mb-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className={`h-2.5 w-2.5 rounded-full ${getStatusColor(conversion.status)}`}></div>
                <h3 className="font-medium text-gray-900">
                  RTMP → RTSP
                </h3>
              </div>
              <p className="text-sm text-gray-500">
                Начато {formatDate(conversion.startTime)}
                {conversion.endTime && ` • Завершено ${formatDate(conversion.endTime)}`}
              </p>
            </div>
            <div className="flex items-center">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onStopConversion(conversion.id)}
                disabled={conversion.status !== 'running'}
                className={`h-8 px-3 text-xs ${
                  conversion.status === 'running'
                    ? 'text-red-500 hover:text-red-700 hover:bg-red-50'
                    : 'text-gray-400'
                } transition-colors`}
              >
                <X className="h-4 w-4 mr-1" />
                Остановить
              </Button>
            </div>
          </div>
          <div className="space-y-4">
            <div className="p-4 bg-gray-50 rounded-md border border-gray-100">
              <div className="mb-2 text-sm font-medium text-gray-700">Источник (Вход) RTMP</div>
              <div className="flex items-center">
                <div className="flex-1 font-mono text-sm text-gray-600 truncate overflow-x-auto whitespace-nowrap scrollbar-thin scrollbar-thumb-gray-300 pr-2 py-1">
                  {formatUrl(conversion.rtmpUrl)}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(conversion.rtmpUrl, `rtmp-${conversion.id}`)}
                  className="flex-shrink-0 ml-2 h-8 px-3 text-xs text-blue-700 hover:text-blue-900 hover:bg-blue-50 transition-colors"
                >
                  {copiedId === `rtmp-${conversion.id}` ? (
                    <span className="flex items-center">
                      <Check className="h-3.5 w-3.5 mr-1 text-green-500" /> 
                      Скопировано!
                    </span>
                  ) : (
                    <span className="flex items-center">
                      <Copy className="h-3.5 w-3.5 mr-1" /> 
                      Скопировать
                    </span>
                  )}
                </Button>
              </div>
            </div>
            <div className="p-4 bg-blue-50 rounded-md border border-blue-100">
              <div className="mb-2 text-sm font-medium text-blue-700">Выход RTSP</div>
              <div className="flex items-center">
                <div className="flex-1 font-mono text-sm text-blue-600 truncate overflow-x-auto whitespace-nowrap scrollbar-thin scrollbar-thumb-blue-300 pr-2 py-1">
                  {formatUrl(conversion.rtspUrl)}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(conversion.rtspUrl, `rtsp-${conversion.id}`)}
                  className="flex-shrink-0 ml-2 h-8 px-3 text-xs text-blue-700 hover:text-blue-900 hover:bg-blue-50 transition-colors"
                >
                  {copiedId === `rtsp-${conversion.id}` ? (
                    <span className="flex items-center">
                      <Check className="h-3.5 w-3.5 mr-1 text-green-500" /> 
                      Скопировано!
                    </span>
                  ) : (
                    <span className="flex items-center">
                      <Copy className="h-3.5 w-3.5 mr-1" /> 
                      Скопировать
                    </span>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ConversionList; 