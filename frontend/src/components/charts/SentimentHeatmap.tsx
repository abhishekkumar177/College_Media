import React from 'react';
import { ResponsiveContainer } from 'recharts';

// Since Recharts doesn't have a native "Heatmap" component, we simulate it with ScatterChart or create a custom grid.
// A simpler approach for a heatmap is a grid of divs for 24 hours (x) by 7 days (y) or just 24 hours.
// The user asked for Recharts or D3. Let's build a custom hourly activity heatmap using standard div grid for better control or simulate with Scatter.
// Let's use a BarChart for hourly distribution if heatmap is tricky in Recharts without external libs.
// Actually, standard heatmap is just a grid. I'll make a nice semantic grid.

interface HeatmapProps {
    data: { _id: number, count: number, positive: number, negative: number }[];
}

// Data comes as array of hours [0..23].
const SentimentHeatmap: React.FC<HeatmapProps> = ({ data }) => {
    // Fill gaps
    const fullData = Array.from({ length: 24 }, (_, i) => {
        const found = data.find(d => d._id === i);
        return found || { _id: i, count: 0, positive: 0, negative: 0 };
    });

    const getMax = () => Math.max(...fullData.map(d => d.count)) || 1;

    const getColor = (item: any) => {
        if (item.count === 0) return 'bg-gray-100';

        // Calculate sentiment ratio
        const sentimentScore = (item.positive - item.negative) / item.count; // -1 to 1

        // Intensity based on volume
        const intensity = Math.min(item.count / getMax(), 1);

        if (sentimentScore > 0.3) return `bg-green-500`; // Simplify opacity handling via style
        if (sentimentScore < -0.3) return `bg-red-500`;
        return `bg-blue-500`;
    };

    return (
        <div className="w-full">
            <h3 className="text-sm font-bold text-gray-500 mb-4 uppercase tracking-wider">Hourly Activity & Sentiment (24h)</h3>
            <div className="grid grid-cols-12 md:grid-cols-24 gap-1">
                {fullData.map((item) => (
                    <div key={item._id} className="group relative flex flex-col items-center">
                        <div
                            className={`w-full h-24 rounded-sm transition-all hover:scale-110 hover:z-10 cursor-pointer ${getColor(item)}`}
                            style={{
                                opacity: item.count === 0 ? 1 : 0.3 + (item.count / getMax()) * 0.7
                            }}
                        />
                        <span className="text-[10px] text-gray-400 mt-1">{item._id}:00</span>

                        {/* Tooltip */}
                        <div className="absolute bottom-full mb-2 hidden group-hover:block bg-black text-white text-xs p-2 rounded z-20 whitespace-nowrap">
                            <div className="font-bold">{item._id}:00 - {item._id + 1}:00</div>
                            <div>Posts: {item.count}</div>
                            <div className="text-green-400">Pos: {item.positive}</div>
                            <div className="text-red-400">Neg: {item.negative}</div>
                        </div>
                    </div>
                ))}
            </div>
            <div className="flex justify-between mt-2 text-xs text-gray-400">
                <span>12 AM</span>
                <span>6 AM</span>
                <span>12 PM</span>
                <span>6 PM</span>
                <span>11 PM</span>
            </div>
            <div className="flex gap-4 mt-4 text-xs justify-center">
                <span className="flex items-center gap-1"><div className="w-3 h-3 bg-green-500 rounded-sm" /> Positive Sentiment</span>
                <span className="flex items-center gap-1"><div className="w-3 h-3 bg-blue-500 rounded-sm" /> Neutral</span>
                <span className="flex items-center gap-1"><div className="w-3 h-3 bg-red-500 rounded-sm" /> Negative Sentiment</span>
                <span className="flex items-center gap-1 ml-4 text-gray-400">Opacity = Volume</span>
            </div>
        </div>
    );
};

export default SentimentHeatmap;
