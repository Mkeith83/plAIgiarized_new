'use client';

interface MetricsDisplayProps {
  metrics: Record<string, number>;
  type?: 'standard' | 'percentage' | 'score';
}

export function MetricsDisplay({ metrics, type = 'standard' }: MetricsDisplayProps) {
  const formatValue = (value: number) => {
    switch (type) {
      case 'percentage':
        return `${(value * 100).toFixed(1)}%`;
      case 'score':
        return value.toFixed(2);
      default:
        return value.toString();
    }
  };

  return (
    <div className="grid grid-cols-2 gap-4">
      {Object.entries(metrics).map(([key, value]) => (
        <div key={key} className="text-sm">
          <div className="text-gray-600 capitalize">
            {key.replace(/([A-Z])/g, ' $1').trim()}
          </div>
          <div className="font-medium">
            {formatValue(value)}
          </div>
        </div>
      ))}
    </div>
  );
}
