import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertCircle, Loader2, Info, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TestRTMPServerProps {
  apiUrl: string;
  onServerCreated: (serverUrl: string) => void;
}

export default function TestRTMPServer({ apiUrl, onServerCreated }: TestRTMPServerProps) {
  const [serverName, setServerName] = useState<string>('');
  const [isCreating, setIsCreating] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [showInfo, setShowInfo] = useState<boolean>(false);
  const [touched, setTouched] = useState<boolean>(false);
  
  const validServerName = /^[a-zA-Z0-9_-]+$/.test(serverName);

  const createTestServer = async () => {
    setTouched(true);
    
    if (!serverName.trim()) {
      setError('Please enter a stream name');
      return;
    }
    
    if (!validServerName) {
      setError('Stream name can only contain letters, numbers, underscores and hyphens');
      return;
    }

    try {
      setIsCreating(true);
      setError(null);
      
      const response = await fetch(`${apiUrl}/streams`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: serverName }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to create test stream');
      }
      
      const data = await response.json();
      onServerCreated(data.rtmpUrl);
      setServerName('');
      setTouched(false);
    } catch (error) {
      console.error('Error creating test stream:', error);
      setError('Failed to create test stream. Please check your connection and try again.');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="space-y-4 border border-gray-200 p-6 rounded-lg bg-white">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-lg font-medium mb-2 text-gray-900">Create Test Stream</h3>
          <p className="text-sm text-gray-600">
            Create a test pattern stream for development and testing
          </p>
        </div>
        <button
          onClick={() => setShowInfo(!showInfo)}
          className="text-blue-500 hover:bg-blue-50 rounded-full p-1 transition-colors"
          type="button"
          aria-label="Show information"
        >
          <Info className="h-5 w-5" />
        </button>
      </div>
      {showInfo && (
        <div className="bg-blue-50 text-blue-700 p-4 rounded-md text-sm border border-blue-100">
          <p className="mb-2 font-medium">What is a test stream?</p>
          <p className="mb-2">This will create a test pattern stream that continuously broadcasts a color test pattern.</p>
          <p>Use this for testing your RTMP connection without needing a real video source.</p>
        </div>
      )}
      {error && (
        <div className="flex items-center gap-2 py-3 px-4 bg-red-50 border-l-2 border-red-500 text-sm text-red-700 rounded-md">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}
      <div className="space-y-4">
        <div>
          <Label htmlFor="serverName" className="text-sm text-gray-700 font-medium block mb-2">
            Stream name <span className="text-red-500">*</span>
          </Label>
          <div className="relative">
            <Input
              id="serverName"
              placeholder="test_stream"
              value={serverName}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setServerName(e.target.value)}
              onFocus={() => setTouched(true)}
              className={cn(
                "w-full px-4 py-3 text-sm bg-white border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:border-transparent pr-10",
                touched && serverName && !validServerName ? "border-red-300 focus:ring-red-500" : "focus:ring-blue-900",
                touched && serverName && validServerName && "border-green-300"
              )}
              disabled={isCreating}
            />
            {touched && serverName && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                {validServerName ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-red-500" />
                )}
              </div>
            )}
          </div>
          {touched && serverName && !validServerName && (
            <p className="mt-1 text-red-500 text-xs">Only letters, numbers, underscores and hyphens allowed</p>
          )}
          {touched && !serverName && (
            <p className="mt-1 text-red-500 text-xs">Stream name is required</p>
          )}
        </div>
        <Button 
          onClick={createTestServer} 
          disabled={isCreating}
          className="w-full bg-blue-900 hover:bg-blue-800 text-white relative"
        >
          {isCreating ? (
            <span className="flex items-center justify-center">
              <Loader2 className="h-4 w-4 mr-2 animate-spin" /> 
              Creating...
            </span>
          ) : (
            'Create Test Stream'
          )}
        </Button>
        <p className="text-xs text-gray-500 text-center">
          This will generate a test RTMP stream URL you can use in your testing
        </p>
      </div>
    </div>
  );
} 