export class StatisticsProcessor {
    /**
     * Basic Statistical Calculations
     */
    mean(values: number[]): number {
        if (values.length === 0) return 0;
        return values.reduce((sum, val) => sum + val, 0) / values.length;
    }

    median(values: number[]): number {
        if (values.length === 0) return 0;
        const sorted = [...values].sort((a, b) => a - b);
        const mid = Math.floor(sorted.length / 2);
        return sorted.length % 2 === 0
            ? (sorted[mid - 1] + sorted[mid]) / 2
            : sorted[mid];
    }

    standardDeviation(values: number[]): number {
        if (values.length < 2) return 0;
        const avg = this.mean(values);
        const squareDiffs = values.map(value => Math.pow(value - avg, 2));
        return Math.sqrt(this.mean(squareDiffs));
    }

    /**
     * Distribution Analysis
     */
    frequencyDistribution(values: number[], bins: number = 10): Map<number, number> {
        const distribution = new Map<number, number>();
        if (values.length === 0) return distribution;

        const min = Math.min(...values);
        const max = Math.max(...values);
        const binSize = (max - min) / bins;

        values.forEach(value => {
            const binIndex = Math.floor((value - min) / binSize);
            const binKey = min + (binIndex * binSize);
            distribution.set(binKey, (distribution.get(binKey) || 0) + 1);
        });

        return distribution;
    }

    /**
     * Correlation Analysis
     */
    pearsonCorrelation(x: number[], y: number[]): number {
        if (x.length !== y.length || x.length === 0) return 0;

        const meanX = this.mean(x);
        const meanY = this.mean(y);
        
        let numerator = 0;
        let denominatorX = 0;
        let denominatorY = 0;

        for (let i = 0; i < x.length; i++) {
            const xDiff = x[i] - meanX;
            const yDiff = y[i] - meanY;
            numerator += xDiff * yDiff;
            denominatorX += xDiff * xDiff;
            denominatorY += yDiff * yDiff;
        }

        return numerator / Math.sqrt(denominatorX * denominatorY);
    }

    /**
     * Outlier Detection
     */
    findOutliers(values: number[], threshold: number = 2): number[] {
        const mean = this.mean(values);
        const std = this.standardDeviation(values);
        
        return values.filter(value => 
            Math.abs(value - mean) > threshold * std
        );
    }

    /**
     * Time Series Analysis
     */
    movingAverage(values: number[], window: number): number[] {
        const result: number[] = [];
        for (let i = window - 1; i < values.length; i++) {
            const windowValues = values.slice(i - window + 1, i + 1);
            result.push(this.mean(windowValues));
        }
        return result;
    }

    /**
     * Trend Analysis
     */
    linearRegression(x: number[], y: number[]): {slope: number; intercept: number} {
        if (x.length !== y.length || x.length === 0) {
            return { slope: 0, intercept: 0 };
        }

        const meanX = this.mean(x);
        const meanY = this.mean(y);
        
        let numerator = 0;
        let denominator = 0;
        
        for (let i = 0; i < x.length; i++) {
            const xDiff = x[i] - meanX;
            numerator += xDiff * (y[i] - meanY);
            denominator += xDiff * xDiff;
        }
        
        const slope = numerator / denominator;
        const intercept = meanY - (slope * meanX);
        
        return { slope, intercept };
    }

    /**
     * Statistical Testing
     */
    zScore(value: number, mean: number, std: number): number {
        return (value - mean) / std;
    }

    confidenceInterval(
        values: number[],
        confidenceLevel: number = 0.95
    ): { lower: number; upper: number } {
        const mean = this.mean(values);
        const std = this.standardDeviation(values);
        const z = 1.96; // 95% confidence level
        const margin = z * (std / Math.sqrt(values.length));

        return {
            lower: mean - margin,
            upper: mean + margin
        };
    }

    /**
     * Probability Calculations
     */
    probability(
        occurrences: number,
        totalObservations: number
    ): number {
        return occurrences / totalObservations;
    }

    conditionalProbability(
        jointOccurrences: number,
        conditionOccurrences: number
    ): number {
        return jointOccurrences / conditionOccurrences;
    }

    /**
     * Data Normalization
     */
    normalize(
        values: number[],
        method: 'minmax' | 'zscore' = 'minmax'
    ): number[] {
        if (values.length === 0) return [];

        if (method === 'minmax') {
            const min = Math.min(...values);
            const max = Math.max(...values);
            const range = max - min;
            return values.map(value => 
                range === 0 ? 0 : (value - min) / range
            );
        } else {
            const mean = this.mean(values);
            const std = this.standardDeviation(values);
            return values.map(value => 
                std === 0 ? 0 : (value - mean) / std
            );
        }
    }
} 