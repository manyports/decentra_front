"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Copy, X, ArrowRight, Check, AlertTriangle } from "lucide-react";
import { useState } from 'react';

interface Stream {
  id: string;
  path: string;
  rtmpUrl: string;
  name?: string;
}

interface StreamListProps {
  streams: Stream[];
  onStopStream: (streamId: string) => Promise<void>;
}

const StreamList: React.FC<StreamListProps> = ({ streams, onStopStream }) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [confirmingStop, setConfirmingStop] = useState<string | null>(null);
  const [stoppingStream, setStoppingStream] = useState<string | null>(null);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };
  
  const handleStopStream = async (streamId: string) => {
    if (confirmingStop === streamId) {
      try {
        setStoppingStream(streamId);
        await onStopStream(streamId);
      } finally {
        setStoppingStream(null);
        setConfirmingStop(null);
      }
    } else {
      setConfirmingStop(streamId);
      setTimeout(() => {
        setConfirmingStop(state => state === streamId ? null : state);
      }, 5000);
    }
  };

  if (streams.length === 0) {
    return (
      <div className="h-60 flex flex-col items-center justify-center border border-dashed border-gray-200 rounded-lg bg-gray-50 p-8">
        <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center mb-4">
          <AlertTriangle className="h-8 w-8 text-blue-300" />
        </div>
        <h3 className="text-lg font-medium text-gray-700 mb-1">No active streams</h3>
        <p className="text-gray-500 text-center max-w-sm mb-6">
          There are currently no active streams. Create a new stream to start broadcasting.
        </p>
        <Button 
          onClick={() => document.getElementById('tools')?.scrollIntoView({ behavior: 'smooth' })}
          variant="outline"
          className="border-gray-200"
        >
          Create Your First Stream
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {streams.map((stream) => (
        <div key={stream.id} className="p-6 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="text-xl font-semibold text-gray-900">
                {stream.name || `Stream ${stream.id.substring(0, 8)}`}
              </h3>
              <p className="text-sm text-gray-500 mt-1">ID: {stream.id.substring(0, 12)}...</p>
            </div>
            <div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => handleStopStream(stream.id)}
                disabled={stoppingStream === stream.id}
                className={cn(
                  "text-sm transition-all duration-200",
                  confirmingStop === stream.id 
                    ? "bg-red-500 hover:bg-red-600 text-white border-red-500 hover:border-red-600" 
                    : "border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 hover:border-red-300"
                )}
              >
                {stoppingStream === stream.id ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Stopping...
                  </>
                ) : confirmingStop === stream.id ? (
                  'Confirm Stop'
                ) : (
                  'Stop Stream'
                )}
              </Button>
            </div>
          </div>
          <div className="space-y-4">
            <div className="p-4 bg-gray-50 rounded-md border border-gray-100">
              <div className="mb-2 text-sm font-medium text-gray-700">RTMP URL</div>
              <div className="flex items-center">
                <div className="flex-1 font-mono text-sm text-gray-600 truncate overflow-x-auto whitespace-nowrap scrollbar-thin scrollbar-thumb-gray-300 pr-2 py-1">
                  {stream.rtmpUrl}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(stream.rtmpUrl, `rtmp-${stream.id}`)}
                  className="flex-shrink-0 ml-2 h-8 px-3 text-xs text-blue-700 hover:text-blue-900 hover:bg-blue-50 transition-colors"
                >
                  {copiedId === `rtmp-${stream.id}` ? (
                    <span className="flex items-center">
                      <Check className="h-3.5 w-3.5 mr-1 text-green-500" /> 
                      Copied!
                    </span>
                  ) : (
                    <span className="flex items-center">
                      <Copy className="h-3.5 w-3.5 mr-1" /> 
                      Copy
                    </span>
                  )}
                </Button>
              </div>
            </div>
            <div className="p-4 bg-gray-50 rounded-md border border-gray-100">
              <div className="mb-2 text-sm font-medium text-gray-700">Path</div>
              <div className="flex items-center">
                <div className="flex-1 font-mono text-sm text-gray-600 truncate overflow-x-auto whitespace-nowrap scrollbar-thin scrollbar-thumb-gray-300 pr-2 py-1">
                  {stream.path}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(stream.path, `path-${stream.id}`)}
                  className="flex-shrink-0 ml-2 h-8 px-3 text-xs text-blue-700 hover:text-blue-900 hover:bg-blue-50 transition-colors"
                >
                  {copiedId === `path-${stream.id}` ? (
                    <span className="flex items-center">
                      <Check className="h-3.5 w-3.5 mr-1 text-green-500" /> 
                      Copied!
                    </span>
                  ) : (
                    <span className="flex items-center">
                      <Copy className="h-3.5 w-3.5 mr-1" /> 
                      Copy
                    </span>
                  )}
                </Button>
              </div>
            </div>
            
            <div className="p-4 bg-blue-50 rounded-md border border-blue-100">
              <div className="mb-2 text-sm font-medium text-blue-700">Full Stream URL</div>
              <div className="flex items-center">
                <div className="flex-1 font-mono text-sm text-blue-600 truncate overflow-x-auto whitespace-nowrap scrollbar-thin scrollbar-thumb-blue-200 pr-2 py-1">
                  {`${stream.rtmpUrl}/${stream.path}`}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(`${stream.rtmpUrl}/${stream.path}`, `full-${stream.id}`)}
                  className="flex-shrink-0 ml-2 h-8 px-3 text-xs text-blue-700 hover:text-blue-900 hover:bg-blue-100 transition-colors"
                >
                  {copiedId === `full-${stream.id}` ? (
                    <span className="flex items-center">
                      <Check className="h-3.5 w-3.5 mr-1 text-green-500" /> 
                      Copied!
                    </span>
                  ) : (
                    <span className="flex items-center">
                      <Copy className="h-3.5 w-3.5 mr-1" /> 
                      Copy Full URL
                    </span>
                  )}
                </Button>
              </div>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="text-xs text-gray-500">
              Created: {new Date().toLocaleString()} • Status: <span className="text-green-600 font-medium">Active</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default StreamList; 