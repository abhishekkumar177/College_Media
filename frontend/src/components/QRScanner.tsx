import React, { useEffect, useRef, useState } from 'react';
import jsQR from 'jsqr';
import { toast } from 'react-hot-toast';
import { FaCamera, FaTimes } from 'react-icons/fa';

interface QRScannerProps {
    onScan: (data: string) => void;
    onClose: () => void;
}

const QRScanner: React.FC<QRScannerProps> = ({ onScan, onClose }) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [scanning, setScanning] = useState(true);

    useEffect(() => {
        let stream: MediaStream | null = null;
        let animationFrameId: number;

        const startCamera = async () => {
            try {
                stream = await navigator.mediaDevices.getUserMedia({
                    video: { facingMode: 'environment' }
                });
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                    videoRef.current.setAttribute('playsinline', 'true');
                    videoRef.current.play();
                    requestAnimationFrame(tick);
                }
            } catch (err) {
                toast.error('Camera access denied');
                onClose();
            }
        };

        const tick = () => {
            if (!videoRef.current || !canvasRef.current || !scanning) return;

            if (videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA) {
                const video = videoRef.current;
                const canvas = canvasRef.current;

                canvas.height = video.videoHeight;
                canvas.width = video.videoWidth;

                const ctx = canvas.getContext('2d');
                if (ctx) {
                    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

                    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                    const code = jsQR(imageData.data, imageData.width, imageData.height, {
                        inversionAttempts: 'dontInvert',
                    });

                    if (code) {
                        setScanning(false);
                        onScan(code.data);
                        return; // Stop loop
                    }
                }
            }
            animationFrameId = requestAnimationFrame(tick);
        };

        startCamera();

        return () => {
            setScanning(false);
            cancelAnimationFrame(animationFrameId);
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }
        };
    }, []);

    return (
        <div className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center">
            <button
                onClick={onClose}
                className="absolute top-6 right-6 text-white text-2xl"
            >
                <FaTimes />
            </button>
            <div className="text-white font-bold mb-4 text-center">
                <FaCamera className="text-4xl mx-auto mb-2" />
                <p>Align QR Code within the frame</p>
            </div>

            <div className="relative w-[300px] h-[300px] border-4 border-green-500 rounded-3xl overflow-hidden shadow-[0_0_100px_rgba(34,197,94,0.3)]">
                <video
                    ref={videoRef}
                    className="absolute inset-0 w-full h-full object-cover"
                />
                <canvas ref={canvasRef} className="hidden" />
                {/* Scan Line Animation */}
                <div className="absolute top-0 left-0 w-full h-1 bg-green-500 shadow-[0_0_10px_#22c55e] animate-scan" />
            </div>
            <style>{`
                @keyframes scan {
                    0% { top: 0%; opacity: 0; }
                    10% { opacity: 1; }
                    90% { opacity: 1; }
                    100% { top: 100%; opacity: 0; }
                }
                .animate-scan {
                    animation: scan 2s linear infinite;
                }
            `}</style>
        </div>
    );
};

export default QRScanner;
