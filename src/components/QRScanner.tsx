
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Scan, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const QRScanner: React.FC = () => {
  const [isScanActive, setIsScanActive] = useState(false);
  const [scanSuccess, setScanSuccess] = useState(false);
  const [scanError, setScanError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const navigate = useNavigate();

  // Simulate QR scanning for the demo
  const simulateScan = () => {
    setIsScanActive(true);
    
    // Simulate processing delay
    setTimeout(() => {
      setScanSuccess(true);
      setIsScanActive(false);
      toast.success('QR code detected!');
      
      // Redirect after a short delay
      setTimeout(() => {
        navigate('/name');
      }, 800);
    }, 2000);
  };

  const handleRealScan = async () => {
    try {
      // Request camera access
      setIsScanActive(true);
      setScanError(null);
      
      const constraints = {
        video: { facingMode: 'environment' }
      };
      
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        
        // Start scan loop
        requestAnimationFrame(scanFrame);
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      setScanError('Could not access camera. Please check permissions.');
      setIsScanActive(false);
      toast.error('Camera access denied. Please check your browser permissions.');
    }
  };
  
  const scanFrame = () => {
    if (!isScanActive) return;
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    if (video && canvas && video.readyState === video.HAVE_ENOUGH_DATA) {
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      
      canvas.height = video.videoHeight;
      canvas.width = video.videoWidth;
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      // Here you would normally use a QR code library to detect codes
      // For the demo, we'll just simulate success
      setTimeout(() => {
        setScanSuccess(true);
        setIsScanActive(false);
        
        // Stop all video streams
        const stream = video.srcObject as MediaStream;
        if (stream) {
          const tracks = stream.getTracks();
          tracks.forEach(track => track.stop());
          video.srcObject = null;
        }
        
        toast.success('QR code detected!');
        
        // Redirect to name page
        setTimeout(() => {
          navigate('/name');
        }, 800);
      }, 2000);
    } else {
      requestAnimationFrame(scanFrame);
    }
  };

  // Cleanup function
  useEffect(() => {
    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        const tracks = stream.getTracks();
        tracks.forEach(track => track.stop());
      }
    };
  }, []);

  return (
    <div className="flex flex-col items-center">
      <div className={`relative w-64 h-64 md:w-80 md:h-80 rounded-xl overflow-hidden border-2 ${scanSuccess ? 'border-green-500' : scanError ? 'border-red-500' : 'border-gray-300'} transition-all duration-300`}>
        {isScanActive ? (
          <>
            <video 
              ref={videoRef} 
              className="absolute inset-0 w-full h-full object-cover"
              playsInline
              muted
            />
            <canvas 
              ref={canvasRef} 
              className="absolute inset-0 w-full h-full object-cover"
              style={{ display: 'none' }}
            />
            <div className="absolute inset-0 border-[20px] border-black/30 rounded-xl pointer-events-none">
              <div className="absolute inset-0 border-2 border-white/70 rounded-sm"></div>
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-40 h-40 border-2 border-blue-500 rounded-lg animate-pulse"></div>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full bg-gray-100">
            {scanSuccess ? (
              <CheckCircle className="h-16 w-16 text-green-500 animate-scale-in" />
            ) : scanError ? (
              <AlertCircle className="h-16 w-16 text-red-500 animate-scale-in" />
            ) : (
              <Scan className="h-16 w-16 text-gray-400" />
            )}
            <p className="mt-4 text-sm text-gray-500">
              {scanSuccess ? 'QR code scanned successfully!' : 
               scanError ? scanError : 
               'Position QR code within the frame'}
            </p>
          </div>
        )}
      </div>

      <div className="mt-8">
        <Button 
          onClick={simulateScan} 
          disabled={isScanActive || scanSuccess}
          className="relative overflow-hidden w-40 h-12 bg-primary hover:bg-primary/90 flex items-center justify-center gap-2 transition-all"
        >
          {isScanActive ? (
            <>
              <div className="animate-pulse">Scanning...</div>
            </>
          ) : scanSuccess ? (
            'Scan Complete'
          ) : (
            <>
              <Scan className="h-4 w-4" />
              Start Scan
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default QRScanner;
