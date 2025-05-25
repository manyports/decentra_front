"use client";

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Search, Play, MonitorPlay, ArrowRight, Copy, RefreshCw, Menu, X, ArrowLeftRight } from 'lucide-react';
import StreamForm from '@/components/StreamForm';
import StreamList from '@/components/StreamList';
import RtmpToRtspForm from '@/components/RtmpToRtspForm';
import ConversionList from '@/components/ConversionList';
import { Grid, GridItem } from '@/components/grid';

interface Stream {
  id: string;
  path: string;
  rtmpUrl: string;
  name?: string;
}

interface Conversion {
  id: string;
  rtmpUrl: string;
  rtspUrl: string;
  status: string;
  startTime: string;
  endTime?: string;
}

export default function Home() {
  const [streams, setStreams] = useState<Stream[]>([]);
  const [conversions, setConversions] = useState<Conversion[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingConversions, setLoadingConversions] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001';
  const [refreshing, setRefreshing] = useState(false);
  const [refreshingConversions, setRefreshingConversions] = useState(false);
  const [testServerUrl, setTestServerUrl] = useState<string | null>(null);  
  const [activeSection, setActiveSection] = useState<string>('home');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const homeRef = useRef<HTMLElement>(null);
  const toolsRef = useRef<HTMLElement>(null);
  const streamsRef = useRef<HTMLElement>(null);
  const conversionsRef = useRef<HTMLElement>(null);

  useEffect(() => {
    fetchStreams();
    fetchConversions();
  }, []);
  
  const scrollToSection = (sectionId: string) => {
    setActiveSection(sectionId);
    setMobileMenuOpen(false);
    
    if (sectionId === 'home' && homeRef.current) {
      homeRef.current.scrollIntoView({ behavior: 'smooth' });
    } else if (sectionId === 'tools' && toolsRef.current) {
      toolsRef.current.scrollIntoView({ behavior: 'smooth' });
    } else if (sectionId === 'streams' && streamsRef.current) {
      streamsRef.current.scrollIntoView({ behavior: 'smooth' });
    } else if (sectionId === 'conversions' && conversionsRef.current) {
      conversionsRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const fetchStreams = async () => {
    try {
      setLoading(true);
      setRefreshing(true);
      setError(null);
      const response = await fetch(`${apiUrl}/streams`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`API responded with status: ${response.status}`);
      }
      
      const data = await response.json();
      setStreams(data);
    } catch (error) {
      console.error('Failed to fetch streams:', error);
      setStreams([]);
      setError('Could not connect to server. Please ensure the backend is running.');
    } finally {
      setLoading(false);
      setTimeout(() => setRefreshing(false), 500);
    }
  };

  const fetchConversions = async () => {
    try {
      setLoadingConversions(true);
      setRefreshingConversions(true);
      setError(null);
      const response = await fetch(`${apiUrl}/conversions`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`API responded with status: ${response.status}`);
      }
      
      const data = await response.json();
      setConversions(data);
    } catch (error) {
      console.error('Failed to fetch conversions:', error);
      setConversions([]);
      setError('Could not connect to server. Please ensure the backend is running.');
    } finally {
      setLoadingConversions(false);
      setTimeout(() => setRefreshingConversions(false), 500);
    }
  };

  const createStream = async (streamName: string, customPath?: string) => {
    try {
      setError(null);
      const response = await fetch(`${apiUrl}/streams`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          name: streamName,
          path: customPath || `live/${streamName}`
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to create stream');
      }
      
      const newStream = await response.json();
      setStreams([...streams, newStream]);
      
      setTimeout(() => {
        scrollToSection('streams');
      }, 500);
      
      return newStream;
    } catch (error) {
      console.error('Error creating stream:', error);
      setError('Failed to create stream. Please check backend connection.');
      throw error;
    }
  };

  const stopStream = async (streamId: string) => {
    try {
      setError(null);
      const response = await fetch(`${apiUrl}/streams/${streamId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to stop stream');
      }
      
      setStreams(streams.filter(stream => stream.id !== streamId));
    } catch (error) {
      console.error('Error stopping stream:', error);
      setError('Failed to stop stream. Please check backend connection.');
    }
  };

  const stopConversion = async (conversionId: string) => {
    try {
      setError(null);
      const response = await fetch(`${apiUrl}/conversions/${conversionId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to stop conversion');
      }
      
      setConversions(conversions.map(conversion => 
        conversion.id === conversionId 
          ? {...conversion, status: 'stopped', endTime: new Date().toISOString()} 
          : conversion
      ));
    } catch (error) {
      console.error('Error stopping conversion:', error);
      setError('Failed to stop conversion. Please check backend connection.');
    }
  };

  const handleConversionCreated = (conversion: Conversion) => {
    setConversions([...conversions, conversion]);
    setTimeout(() => {
      scrollToSection('conversions');
    }, 500);
  };

  const handleTestServerCreated = (serverUrl: string) => {
    setTestServerUrl(serverUrl);
  };

  return (
    <div className="bg-white text-black min-h-screen">
      <section ref={homeRef} className="container mx-auto px-4 pt-20">
        <Grid noBorder="bottom">
          <GridItem className="flex flex-col items-center justify-center py-16 md:py-24">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-4xl md:text-6xl font-bold mb-6 text-gray-900">RTMP → RTSP</h1>
              <p className="text-xl md:text-2xl text-gray-600 mb-10">
                Создайте и управляйте потоками с легкостью
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  onClick={fetchStreams} 
                  variant="outline" 
                  className="gap-2 border-gray-200"
                  disabled={refreshing}
                >
                  <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
                  {refreshing ? 'Обновление' : 'Обновить потоки'}
                </Button>
              </div>
              {error && (
                <div className="py-2 px-3 bg-red-50 border-l-2 border-red-500 text-xs text-red-700 mt-4">
                  {error}
                </div>
              )}
            </div>
          </GridItem>
        </Grid>
      </section>
      <section ref={toolsRef} id="tools" className="container mx-auto px-4">
        <Grid columns={1} connectTo="top" noBorder="bottom">
          <GridItem className="md:col-span-2">
            <div className="w-12 h-12 rounded-lg flex items-center justify-center mb-6 bg-blue-50">
              <Play className="h-6 w-6 text-blue-900" />
            </div>
            <h3 className="text-xl font-semibold mb-3 text-gray-900">Создать новый RTMP поток</h3>
            <p className="text-gray-600 mb-6">
              Создайте новый RTMP поток для трансляции контента. Особенно полезно когда вы хотите протестировать наше решение, но у вас нет RTMP сервера
            </p>
            <StreamForm onSubmit={createStream} existingStreams={streams} />
          </GridItem>
      </Grid>
      </section>
      <section className="container mx-auto px-4">
        <Grid columns={3}>
          <GridItem className="md:col-span-2">
            <div className="w-12 h-12 rounded-lg flex items-center justify-center mb-6 bg-purple-50">
              <ArrowLeftRight className="h-6 w-6 text-purple-700" />
            </div>
            <h3 className="text-xl font-semibold mb-3 text-gray-900">RTMP → RTSP</h3>
            <p className="text-gray-600 mb-6">
              Преобразование RTMP в RTSP для совместимости с RTSP плеерами
            </p>
            <RtmpToRtspForm apiUrl={apiUrl} onConversionCreated={handleConversionCreated} />
          </GridItem>
          <GridItem>
            <div className="w-12 h-12 rounded-lg flex items-center justify-center mb-6 bg-purple-50">
              <MonitorPlay className="h-6 w-6 text-purple-700" />
            </div>
            <h3 className="text-xl font-semibold mb-3 text-gray-900">Что такое RTSP?</h3>
            <div className="space-y-4 text-gray-600">
              <p>
                Real Time Streaming Protocol (RTSP) - это сетевой протокол управления, разработанный для использования в системах развлекательной и коммуникационной индустрии для управления серверами потокового мультимедиа.
              </p>
              <p>
                Преобразование RTMP в RTSP позволяет:
              </p>
              <ul className="list-disc list-inside space-y-1 pl-2">
                <li>Использовать RTSP-совместимые системы безопасности и камеры</li>
                <li>Подключаться к устройствам, поддерживающим только RTSP</li>
                <li>Уменьшать задержку для некоторых приложений</li>
              </ul>
            </div>
          </GridItem>
        </Grid>
      </section>
      <section ref={streamsRef} id="streams" className="container mx-auto px-4">
        <Grid connectTo="bottom" noBorder='top'>
          <GridItem className="text-center py-16">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between max-w-2xl mx-auto">
              <div className="mb-4 md:mb-0">
                <h2 className="text-3xl font-bold text-gray-900">Активные потоки</h2>
                <p className="text-xl text-gray-600 mt-2">
                  {streams.length} {streams.length === 1 ? 'поток' : 'потока'} активно
                </p>
              </div>
              <Button 
                onClick={fetchStreams} 
                className="bg-blue-900 hover:bg-blue-800 text-white gap-2 self-center"
                disabled={refreshing}
              >
                <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
                {refreshing ? 'Обновление' : 'Обновить'}
              </Button>
            </div>
          </GridItem>
        </Grid>
        <Grid connectTo="top">
          <GridItem>
            {loading && !refreshing ? (
              <div className="h-48 flex flex-col items-center justify-center">
                <RefreshCw className="h-8 w-8 text-blue-300 animate-spin mb-4" />
                <p className="text-gray-500">Загрузка потоков...</p>
              </div>
            ) : (
              <StreamList streams={streams} onStopStream={stopStream} />
            )}
          </GridItem>
        </Grid>
      </section>
      <section ref={conversionsRef} id="conversions" className="container mx-auto px-4">
        <Grid connectTo="bottom" noBorder='top'>
          <GridItem className="text-center py-16">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between max-w-2xl mx-auto">
              <div className="mb-4 md:mb-0">
                <h2 className="text-3xl font-bold text-gray-900">Активные преобразования</h2>
                <p className="text-xl text-gray-600 mt-2">
                  {conversions.length} {conversions.length === 1 ? 'преобразование' : 'преобразования'} активно
                </p>
              </div>
              <Button 
                onClick={fetchConversions} 
                className="bg-purple-700 hover:bg-purple-800 text-white gap-2 self-center"
                disabled={refreshingConversions}
              >
                <RefreshCw className={`h-4 w-4 ${refreshingConversions ? 'animate-spin' : ''}`} />
                {refreshingConversions ? 'Обновление' : 'Обновить'}
              </Button>
            </div>
          </GridItem>
        </Grid>
        <Grid connectTo="top">
          <GridItem>
            {loadingConversions && !refreshingConversions ? (
              <div className="h-48 flex flex-col items-center justify-center">
                <RefreshCw className="h-8 w-8 text-purple-300 animate-spin mb-4" />
                <p className="text-gray-500">Загрузка преобразований...</p>
              </div>
            ) : (
              <ConversionList conversions={conversions} onStopConversion={stopConversion} />
            )}
          </GridItem>
        </Grid>
      </section>
    </div>
  );
}
