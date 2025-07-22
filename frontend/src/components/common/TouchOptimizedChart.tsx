import React, { useState, useRef, useEffect } from 'react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  ReferenceLine,
  Brush
} from 'recharts';
import { useMobileDetection, useTouchSupported } from '../../hooks/useMobileDetection';

interface TouchOptimizedChartProps {
  data: Array<{
    timestamp: string | number;
    price: number;
    volume?: number;
    [key: string]: any;
  }>;
  height?: number;
  showBrush?: boolean;
  showGrid?: boolean;
  strokeWidth?: number;
  color?: string;
  onDataPointSelect?: (data: any) => void;
}

export const TouchOptimizedChart: React.FC<TouchOptimizedChartProps> = ({
  data,
  height = 300,
  showBrush = false,
  showGrid = true,
  strokeWidth = 2,
  color = '#3B82F6',
  onDataPointSelect,
}) => {
  const { isMobile, touchSupported } = useMobileDetection();
  const touchSupport = useTouchSupported();
  const chartRef = useRef<HTMLDivElement>(null);
  const [selectedPoint, setSelectedPoint] = useState<any>(null);
  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null);
  const [isPanning, setIsPanning] = useState(false);
  const [zoom, setZoom] = useState({ start: 0, end: 100 });

  // Touch event handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    if (!touchSupported) return;
    
    const touch = e.touches[0];
    setTouchStart({ x: touch.clientX, y: touch.clientY });
    setIsPanning(false);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!touchSupported || !touchStart) return;
    
    const touch = e.touches[0];
    const deltaX = Math.abs(touch.clientX - touchStart.x);
    const deltaY = Math.abs(touch.clientY - touchStart.y);
    
    // If movement is significant, consider it panning
    if (deltaX > 10 || deltaY > 10) {
      setIsPanning(true);
    }
  };

  const handleTouchEnd = () => {
    setTouchStart(null);
    setIsPanning(false);
  };

  // Custom tooltip for mobile
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload || !payload.length) return null;

    const data = payload[0].payload;
    
    return (
      <div className={`bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 ${
        isMobile ? 'text-sm' : 'text-base'
      }`}>
        <p className="font-medium text-gray-900 dark:text-gray-100">
          {new Date(label).toLocaleDateString()}
        </p>
        <p className="text-blue-600 dark:text-blue-400">
          Price: ${payload[0].value.toFixed(4)}
        </p>
        {data.volume && (
          <p className="text-gray-600 dark:text-gray-400">
            Volume: {data.volume.toLocaleString()}
          </p>
        )}
      </div>
    );
  };

  // Custom dot for touch interaction
  const CustomDot = (props: any) => {
    if (!touchSupported) return null;
    
    const { cx, cy, payload } = props;
    const isSelected = selectedPoint && selectedPoint.timestamp === payload.timestamp;
    
    return (
      <circle
        cx={cx}
        cy={cy}
        r={isSelected ? 6 : 4}
        fill={isSelected ? '#EF4444' : color}
        stroke="white"
        strokeWidth={2}
        className="cursor-pointer"
        onClick={() => {
          setSelectedPoint(payload);
          onDataPointSelect?.(payload);
        }}
      />
    );
  };

  // Gesture handlers for zoom
  const handlePinchZoom = (e: React.WheelEvent) => {
    if (!isMobile) return;
    
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.1 : -0.1;
    const newRange = Math.max(10, Math.min(100, (zoom.end - zoom.start) + delta * 100));
    const center = (zoom.start + zoom.end) / 2;
    
    setZoom({
      start: Math.max(0, center - newRange / 2),
      end: Math.min(100, center + newRange / 2),
    });
  };

  return (
    <div 
      ref={chartRef}
      className={`w-full ${isMobile ? 'touch-pan-y' : ''}`}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onWheel={handlePinchZoom}
    >
      <ResponsiveContainer width="100%" height={height}>
        <LineChart
          data={data}
          margin={{
            top: isMobile ? 10 : 20,
            right: isMobile ? 10 : 30,
            left: isMobile ? 10 : 20,
            bottom: isMobile ? 10 : 20,
          }}
        >
          {showGrid && (
            <CartesianGrid 
              strokeDasharray="3 3" 
              stroke="#E5E7EB" 
              opacity={0.5}
            />
          )}
          
          <XAxis
            dataKey="timestamp"
            tickFormatter={(value) => {
              const date = new Date(value);
              return isMobile 
                ? date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                : date.toLocaleDateString();
            }}
            tick={{ fontSize: isMobile ? 10 : 12 }}
            axisLine={false}
            tickLine={false}
          />
          
          <YAxis
            tickFormatter={(value) => `$${value.toFixed(2)}`}
            tick={{ fontSize: isMobile ? 10 : 12 }}
            axisLine={false}
            tickLine={false}
            width={isMobile ? 50 : 60}
          />
          
          <Tooltip 
            content={<CustomTooltip />}
            cursor={{ stroke: color, strokeWidth: 1, strokeDasharray: '3 3' }}
          />
          
          <Line
            type="monotone"
            dataKey="price"
            stroke={color}
            strokeWidth={isMobile ? strokeWidth + 1 : strokeWidth}
            dot={touchSupported ? <CustomDot /> : false}
            activeDot={{ 
              r: isMobile ? 6 : 4, 
              stroke: color, 
              strokeWidth: 2, 
              fill: 'white' 
            }}
            connectNulls={false}
          />
          
          {selectedPoint && (
            <ReferenceLine 
              x={selectedPoint.timestamp} 
              stroke="#EF4444" 
              strokeDasharray="2 2" 
            />
          )}
          
          {showBrush && !isMobile && (
            <Brush
              dataKey="timestamp"
              height={30}
              stroke={color}
              startIndex={Math.floor(data.length * zoom.start / 100)}
              endIndex={Math.floor(data.length * zoom.end / 100)}
            />
          )}
        </LineChart>
      </ResponsiveContainer>
      
      {/* Mobile-specific controls */}
      {isMobile && (
        <div className="flex justify-center items-center space-x-4 mt-4">
          <button
            onClick={() => setZoom({ start: 0, end: 100 })}
            className="px-3 py-1 text-xs bg-gray-100 dark:bg-gray-700 rounded-md touch-manipulation"
          >
            Reset Zoom
          </button>
          
          {selectedPoint && (
            <button
              onClick={() => setSelectedPoint(null)}
              className="px-3 py-1 text-xs bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-md touch-manipulation"
            >
              Clear Selection
            </button>
          )}
        </div>
      )}
      
      {/* Touch instructions for first-time users */}
      {touchSupported && data.length > 0 && (
        <div className="text-xs text-gray-500 dark:text-gray-400 text-center mt-2">
          Tap data points to select • Pinch to zoom • Swipe to pan
        </div>
      )}
    </div>
  );
};