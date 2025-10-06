import OpenAI from 'openai';
import { MODEL_CONFIG, AI_PROVIDERS } from './config';

class OpenAIProvider {
    constructor() {
        const apiKey = process.env.OPENAI_API_KEY;
        if (!apiKey) {
            throw new Error('OPENAI_API_KEY is not set');
        }
        this.client = new OpenAI({ apiKey });
        this.config = MODEL_CONFIG[AI_PROVIDERS.OPENAI];
    }

    async chat(messages, options = {}) {
        try {
            const response = await this.client.chat.completions.create({
                model: options.model || this.config.model,
                messages: messages,
                temperature: options.temperature || this.config.temperature,
                max_tokens: options.maxTokens || this.config.maxTokens,
            });

            return {
                content: response.choices[0].message.content,
                role: 'assistant',
                provider: AI_PROVIDERS.OPENAI,
            };
        } catch (error) {
            console.error('OpenAI API Error:', error);
            throw new Error(`OpenAI API Error: ${error.message}`);
        }
    }

    async generateText(prompt, options = {}) {
        try {
            const response = await this.client.chat.completions.create({
                model: options.model || this.config.model,
                messages: [{ role: 'user', content: prompt }],
                temperature: options.temperature || this.config.temperature,
                max_tokens: options.maxTokens || this.config.maxTokens,
            });

            return response.choices[0].message.content;
        } catch (error) {
            console.error('OpenAI generateText Error:', error);
            throw new Error(`OpenAI API Error: ${error.message}`);
        }
    }
}

export default OpenAIProvider;
