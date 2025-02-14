interface ChartOptions {
    width?: number;
    height?: number;
    colors?: string[];
    title?: string;
    legend?: boolean;
    animate?: boolean;
}

interface ChartData {
    labels: string[];
    datasets: {
        label: string;
        data: number[];
        color?: string;
    }[];
}

interface HeatmapData {
    x: string[];
    y: string[];
    values: number[][];
}

export class Visualizer {
    private readonly DEFAULT_COLORS = [
        '#4285F4', '#34A853', '#FBBC05', '#EA4335',
        '#673AB7', '#3F51B5', '#2196F3', '#03A9F4'
    ];

    /**
     * Line Chart Generation
     */
    generateLineChart(
        data: ChartData,
        options: ChartOptions = {}
    ): { type: 'line'; data: any; options: any } {
        return {
            type: 'line',
            data: this.formatChartData(data),
            options: this.getChartOptions(options)
        };
    }

    /**
     * Bar Chart Generation
     */
    generateBarChart(
        data: ChartData,
        options: ChartOptions = {}
    ): { type: 'bar'; data: any; options: any } {
        return {
            type: 'bar',
            data: this.formatChartData(data),
            options: {
                ...this.getChartOptions(options),
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        };
    }

    /**
     * Heatmap Generation
     */
    generateHeatmap(
        data: HeatmapData,
        options: ChartOptions = {}
    ): { type: 'heatmap'; data: any; options: any } {
        return {
            type: 'heatmap',
            data: {
                x: data.x,
                y: data.y,
                values: data.values
            },
            options: {
                ...this.getChartOptions(options),
                colorScale: {
                    min: Math.min(...data.values.flat()),
                    max: Math.max(...data.values.flat())
                }
            }
        };
    }

    /**
     * Scatter Plot Generation
     */
    generateScatterPlot(
        data: Array<{ x: number; y: number; label?: string }>,
        options: ChartOptions = {}
    ): { type: 'scatter'; data: any; options: any } {
        return {
            type: 'scatter',
            data: {
                datasets: [{
                    data: data.map(point => ({
                        x: point.x,
                        y: point.y,
                        label: point.label
                    }))
                }]
            },
            options: this.getChartOptions(options)
        };
    }

    /**
     * Time Series Visualization
     */
    generateTimeSeriesChart(
        timestamps: Date[],
        values: number[],
        options: ChartOptions = {}
    ): { type: 'line'; data: any; options: any } {
        return {
            type: 'line',
            data: {
                labels: timestamps.map(t => t.toISOString()),
                datasets: [{
                    data: values,
                    fill: false,
                    tension: 0.4
                }]
            },
            options: {
                ...this.getChartOptions(options),
                scales: {
                    x: {
                        type: 'time',
                        time: {
                            unit: 'day'
                        }
                    }
                }
            }
        };
    }

    /**
     * Distribution Visualization
     */
    generateHistogram(
        values: number[],
        bins: number = 10,
        options: ChartOptions = {}
    ): { type: 'bar'; data: any; options: any } {
        const { binEdges, frequencies } = this.calculateHistogram(values, bins);
        
        return {
            type: 'bar',
            data: {
                labels: binEdges.slice(0, -1).map((edge, i) => 
                    `${edge.toFixed(2)}-${binEdges[i + 1].toFixed(2)}`
                ),
                datasets: [{
                    data: frequencies,
                    barPercentage: 1,
                    categoryPercentage: 1
                }]
            },
            options: this.getChartOptions(options)
        };
    }

    private formatChartData(data: ChartData): any {
        return {
            labels: data.labels,
            datasets: data.datasets.map((dataset, index) => ({
                label: dataset.label,
                data: dataset.data,
                borderColor: dataset.color || this.DEFAULT_COLORS[index % this.DEFAULT_COLORS.length],
                backgroundColor: this.adjustOpacity(
                    dataset.color || this.DEFAULT_COLORS[index % this.DEFAULT_COLORS.length],
                    0.2
                )
            }))
        };
    }

    private getChartOptions(options: ChartOptions): any {
        return {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: options.legend !== false
                },
                title: {
                    display: !!options.title,
                    text: options.title
                }
            },
            animation: {
                duration: options.animate ? 1000 : 0
            },
            ...options
        };
    }

    private calculateHistogram(
        values: number[],
        bins: number
    ): { binEdges: number[]; frequencies: number[] } {
        const min = Math.min(...values);
        const max = Math.max(...values);
        const binSize = (max - min) / bins;
        
        const binEdges = Array.from(
            { length: bins + 1 },
            (_, i) => min + i * binSize
        );
        
        const frequencies = new Array(bins).fill(0);
        
        values.forEach(value => {
            const binIndex = Math.min(
                Math.floor((value - min) / binSize),
                bins - 1
            );
            frequencies[binIndex]++;
        });

        return { binEdges, frequencies };
    }

    private adjustOpacity(color: string, opacity: number): string {
        if (color.startsWith('#')) {
            const r = parseInt(color.slice(1, 3), 16);
            const g = parseInt(color.slice(3, 5), 16);
            const b = parseInt(color.slice(5, 7), 16);
            return `rgba(${r}, ${g}, ${b}, ${opacity})`;
        }
        return color;
    }
} 