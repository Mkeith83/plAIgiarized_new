import { AIModel } from '../interfaces/ai/models';
import { Logger } from '../services/logger';

interface ModelConfig {
    name: string;
    version: string;
    type: 'transformer' | 'lstm' | 'ensemble';
    config: Record<string, unknown>;
}

export class ModelRegistry {
    private models: Map<string, AIModel>;
    private logger: Logger;

    constructor() {
        this.models = new Map();
        this.logger = new Logger();
    }

    async registerModel(config: ModelConfig): Promise<void> {
        try {
            const model = await this.initializeModel(config);
            this.models.set(config.name, model);
            this.logger.info(`Model ${config.name} registered successfully`);
        } catch (error) {
            this.logger.error(`Failed to register model ${config.name}:`, error);
            throw error;
        }
    }

    async getModel(name: string): Promise<AIModel | null> {
        const model = this.models.get(name);
        if (!model) {
            this.logger.warn(`Model ${name} not found in registry`);
            return null;
        }
        return model;
    }

    async unregisterModel(name: string): Promise<void> {
        const model = this.models.get(name);
        if (model) {
            await model.cleanup?.();
            this.models.delete(name);
            this.logger.info(`Model ${name} unregistered successfully`);
        }
    }

    getRegisteredModels(): string[] {
        return Array.from(this.models.keys());
    }

    private async initializeModel(config: ModelConfig): Promise<AIModel> {
        // Implementation for model initialization
        return {
            name: config.name,
            version: config.version,
            type: config.type,
            config: config.config
        };
    }
} 