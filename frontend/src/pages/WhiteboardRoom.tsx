import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useWhiteboard } from '../hooks/useWhiteboard';
import CanvasBoard from '../components/CanvasBoard';
import Toolbar from '../components/Toolbar';
import { FaUsers, FaCircle, FaShareAlt } from 'react-icons/fa';
import { toast } from 'react-hot-toast';

const WhiteboardRoom: React.FC = () => {
    const { roomId = 'default' } = useParams<{ roomId: string }>();
    const { elements, participants, isConnected, addElement, clearBoard } = useWhiteboard(roomId);

    const [tool, setTool] = useState<any>('pencil');
    const [color, setColor] = useState('#000000');
    const [strokeWidth, setStrokeWidth] = useState(2);

    const handleShare = () => {
        navigator.clipboard.writeText(window.location.href);
        toast.success('Room link copied to clipboard!');
    };

    const handleDownload = () => {
        const canvas = document.querySelector('canvas') as HTMLCanvasElement;
        if (canvas) {
            const dataUrl = canvas.toDataURL('image/png');
            const link = document.createElement('a');
            link.download = `whiteboard-${roomId}.png`;
            link.href = dataUrl;
            link.click();
        }
    };

    return (
        <div className="relative w-full h-[calc(100vh-64px)] overflow-hidden bg-bg-primary">
            {/* Header / Info */}
            <div className="absolute top-6 left-1/2 -translate-x-1/2 flex items-center gap-6 bg-bg-secondary px-6 py-3 rounded-2xl shadow-xl border border-border z-10 transition-all hover:shadow-2xl">
                <div className="flex items-center gap-2">
                    <FaCircle className={`text-[10px] animate-pulse ${isConnected ? 'text-green-500' : 'text-red-500'}`} />
                    <h1 className="text-sm font-bold text-text-primary capitalize">{roomId.replace(/-/g, ' ')}</h1>
                </div>

                <div className="h-4 w-px bg-border" />

                <div className="flex items-center gap-2 text-text-secondary">
                    <FaUsers className="text-brand-primary" />
                    <span className="text-xs font-medium">{participants.length} Active</span>
                </div>

                <button
                    onClick={handleShare}
                    className="flex items-center gap-2 text-brand-primary hover:bg-brand-primary/10 px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
                >
                    <FaShareAlt /> Share
                </button>
            </div>

            {/* Main Canvas Area */}
            <div className="w-full h-full pt-16">
                <CanvasBoard
                    elements={elements}
                    onAddElement={addElement}
                    tool={tool}
                    color={color}
                    strokeWidth={strokeWidth}
                />
            </div>

            {/* Floating Toolbar */}
            <Toolbar
                tool={tool}
                setTool={setTool}
                color={color}
                setColor={setColor}
                strokeWidth={strokeWidth}
                setStrokeWidth={setStrokeWidth}
                onClear={clearBoard}
                onDownload={handleDownload}
            />

            {/* Participants Overlay (Bottom Left) */}
            <div className="absolute bottom-6 left-6 flex flex-col gap-2">
                {participants.slice(0, 3).map((p, i) => (
                    <div
                        key={i}
                        className="flex items-center gap-2 bg-bg-secondary p-2 pr-4 rounded-full border border-border shadow-lg animate-in fade-in slide-in-from-left-2"
                    >
                        <div className="w-8 h-8 rounded-full bg-brand-primary/20 flex items-center justify-center text-brand-primary font-bold text-xs uppercase">
                            {p.username?.[0] || 'U'}
                        </div>
                        <span className="text-xs font-semibold text-text-primary">{p.username || 'Anonymous'}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default WhiteboardRoom;
