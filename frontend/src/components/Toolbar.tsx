import React from 'react';
import {
    FaPencilAlt, FaSquare, FaCircle,
    FaSlash, FaFont, FaEraser,
    FaTrash, FaDownload, FaMousePointer
} from 'react-icons/fa';
import { WhiteboardElementType } from '../types';

interface ToolbarProps {
    tool: WhiteboardElementType | 'select' | 'eraser';
    setTool: (tool: any) => void;
    color: string;
    setColor: (color: string) => void;
    strokeWidth: number;
    setStrokeWidth: (width: number) => void;
    onClear: () => void;
    onDownload: () => void;
}

const Toolbar: React.FC<ToolbarProps> = ({
    tool, setTool, color, setColor,
    strokeWidth, setStrokeWidth, onClear, onDownload
}) => {
    const tools = [
        { id: 'select', icon: <FaMousePointer />, label: 'Select' },
        { id: 'pencil', icon: <FaPencilAlt />, label: 'Pencil' },
        { id: 'rect', icon: <FaSquare />, label: 'Rectangle' },
        { id: 'circle', icon: <FaCircle />, label: 'Circle' },
        { id: 'line', icon: <FaSlash />, label: 'Line' },
        { id: 'text', icon: <FaFont />, label: 'Text' },
        { id: 'eraser', icon: <FaEraser />, label: 'Eraser' },
    ];

    const colors = ['#000000', '#ef4444', '#22c55e', '#3b82f6', '#f59e0b', '#8b5cf6'];

    return (
        <div className="absolute left-6 top-1/2 -translate-y-1/2 flex flex-col gap-4 bg-bg-secondary p-3 rounded-2xl shadow-2xl border border-border z-10">
            {/* Tools */}
            <div className="flex flex-col gap-2">
                {tools.map((t) => (
                    <button
                        key={t.id}
                        title={t.label}
                        onClick={() => setTool(t.id)}
                        className={`p-3 rounded-xl transition-all ${tool === t.id
                                ? 'bg-brand-primary text-white shadow-lg'
                                : 'text-text-secondary hover:bg-bg-tertiary'
                            }`}
                    >
                        {t.icon}
                    </button>
                ))}
            </div>

            <div className="h-px bg-border mx-2" />

            {/* Colors */}
            <div className="grid grid-cols-2 gap-2">
                {colors.map((c) => (
                    <button
                        key={c}
                        onClick={() => setColor(c)}
                        className={`w-6 h-6 rounded-full border-2 transition-all ${color === c ? 'border-brand-primary scale-110' : 'border-transparent'
                            }`}
                        style={{ backgroundColor: c }}
                    />
                ))}
            </div>

            <div className="h-px bg-border mx-2" />

            {/* Actions */}
            <div className="flex flex-col gap-2">
                <button
                    onClick={onClear}
                    title="Clear Board"
                    className="p-3 text-red-500 hover:bg-red-500/10 rounded-xl transition-all"
                >
                    <FaTrash />
                </button>
                <button
                    onClick={onDownload}
                    title="Download Image"
                    className="p-3 text-brand-primary hover:bg-brand-primary/10 rounded-xl transition-all"
                >
                    <FaDownload />
                </button>
            </div>
        </div>
    );
};

export default Toolbar;
