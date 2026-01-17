import React, { useRef, useEffect, useState, useCallback } from 'react';
import { WhiteboardElement, WhiteboardElementType } from '../types';

interface CanvasBoardProps {
    elements: WhiteboardElement[];
    onAddElement: (element: WhiteboardElement) => void;
    tool: WhiteboardElementType | 'select' | 'eraser';
    color: string;
    strokeWidth: number;
}

const CanvasBoard: React.FC<CanvasBoardProps> = ({
    elements, onAddElement, tool, color, strokeWidth
}) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [currentPath, setCurrentPath] = useState<number[]>([]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Set high DPI scale
        const dpr = window.devicePixelRatio || 1;
        const rect = canvas.getBoundingClientRect();
        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
        ctx.scale(dpr, dpr);

        render();
    }, [elements]);

    const render = useCallback(() => {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        if (!ctx || !canvas) return;

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.lineJoin = 'round';
        ctx.lineCap = 'round';

        elements.forEach(el => {
            ctx.beginPath();
            ctx.strokeStyle = el.stroke || '#000';
            ctx.lineWidth = el.strokeWidth || 2;

            if (el.type === 'pencil' && el.points) {
                const points = el.points;
                ctx.moveTo(points[0], points[1]);
                for (let i = 2; i < points.length; i += 2) {
                    ctx.lineTo(points[i], points[i + 1]);
                }
            } else if (el.type === 'rect') {
                ctx.strokeRect(el.x!, el.y!, el.width!, el.height!);
            } else if (el.type === 'circle') {
                ctx.arc(el.x!, el.y!, el.width! / 2, 0, Math.PI * 2);
            } else if (el.type === 'line' && el.points) {
                ctx.moveTo(el.points[0], el.points[1]);
                ctx.lineTo(el.points[2], el.points[3]);
            }
            ctx.stroke();
        });
    }, [elements]);

    const handleMouseDown = (e: React.MouseEvent) => {
        if (tool === 'select') return;

        setIsDrawing(true);
        const rect = canvasRef.current!.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        if (tool === 'pencil') {
            setCurrentPath([x, y]);
        } else {
            setCurrentPath([x, y, x, y]); // Start/End for shapes
        }
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isDrawing) return;

        const rect = canvasRef.current!.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const ctx = canvasRef.current!.getContext('2d');
        if (!ctx) return;

        // Preview rendering
        render();
        ctx.beginPath();
        ctx.strokeStyle = color;
        ctx.lineWidth = strokeWidth;

        if (tool === 'pencil') {
            const newPath = [...currentPath, x, y];
            setCurrentPath(newPath);

            ctx.moveTo(newPath[0], newPath[1]);
            for (let i = 2; i < newPath.length; i += 2) {
                ctx.lineTo(newPath[i], newPath[i + 1]);
            }
        } else if (tool === 'rect') {
            const startX = currentPath[0];
            const startY = currentPath[1];
            ctx.strokeRect(startX, startY, x - startX, y - startY);
        } else if (tool === 'line') {
            ctx.moveTo(currentPath[0], currentPath[1]);
            ctx.lineTo(x, y);
        }
        ctx.stroke();
    };

    const handleMouseUp = (e: React.MouseEvent) => {
        if (!isDrawing) return;
        setIsDrawing(false);

        const rect = canvasRef.current!.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const id = Math.random().toString(36).substr(2, 9);
        let element: WhiteboardElement;

        if (tool === 'pencil') {
            element = { id, type: 'pencil', points: [...currentPath, x, y], stroke: color, strokeWidth };
        } else if (tool === 'rect') {
            element = {
                id, type: 'rect',
                x: Math.min(currentPath[0], x),
                y: Math.min(currentPath[1], y),
                width: Math.abs(x - currentPath[0]),
                height: Math.abs(y - currentPath[1]),
                stroke: color, strokeWidth
            };
        } else if (tool === 'line') {
            element = { id, type: 'line', points: [currentPath[0], currentPath[1], x, y], stroke: color, strokeWidth };
        } else {
            return;
        }

        onAddElement(element);
        setCurrentPath([]);
    };

    return (
        <canvas
            ref={canvasRef}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            className="w-full h-full bg-white touch-none cursor-crosshair"
            style={{ width: '100%', height: '100%' }}
        />
    );
};

export default CanvasBoard;
