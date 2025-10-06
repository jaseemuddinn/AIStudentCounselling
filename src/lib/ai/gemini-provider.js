import { GoogleGenerativeAI } from '@google/generative-ai';
import { MODEL_CONFIG, AI_PROVIDERS } from './config';

class GeminiProvider {
    constructor() {
        const apiKey = process.env.GOOGLE_GEMINI_API_KEY;
        if (!apiKey) {
            throw new Error('GOOGLE_GEMINI_API_KEY is not set');
        }
        this.genAI = new GoogleGenerativeAI(apiKey);
        this.config = MODEL_CONFIG[AI_PROVIDERS.GEMINI];
    }

    async chat(messages, options = {}) {
        try {
            const model = this.genAI.getGenerativeModel({
                model: options.model || this.config.model,
            });

            // Convert messages to Gemini format
            const geminiMessages = this.formatMessages(messages);

            const generationConfig = {
                temperature: options.temperature || this.config.temperature,
                topP: options.topP || this.config.topP,
                maxOutputTokens: options.maxTokens || this.config.maxTokens,
            };

            // Start chat session
            const chat = model.startChat({
                generationConfig,
                history: geminiMessages.history,
            });

            // Send the latest message
            const result = await chat.sendMessage(geminiMessages.currentMessage);
            const response = await result.response;
            const text = response.text();

            return {
                content: text,
                role: 'assistant',
                provider: AI_PROVIDERS.GEMINI,
            };
        } catch (error) {
            console.error('Gemini API Error:', error);
            throw new Error(`Gemini API Error: ${error.message}`);
        }
    }

    formatMessages(messages) {
        // Separate system message, history, and current message
        const systemMessage = messages.find(m => m.role === 'system');
        const conversationMessages = messages.filter(m => m.role !== 'system');

        // Gemini doesn't have a system role, so we prepend it to the first user message
        const history = [];

        for (let i = 0; i < conversationMessages.length - 1; i++) {
            const msg = conversationMessages[i];
            history.push({
                role: msg.role === 'assistant' ? 'model' : 'user',
                parts: [{ text: msg.content }],
            });
        }

        // Last message is the current one
        const lastMessage = conversationMessages[conversationMessages.length - 1];
        let currentMessage = lastMessage.content;

        // If this is the first user message and we have a system message, prepend it
        if (history.length === 0 && systemMessage) {
            currentMessage = `${systemMessage.content}\n\nUser: ${currentMessage}`;
        }

        return {
            history,
            currentMessage,
        };
    }

    async generateText(prompt, options = {}) {
        try {
            const model = this.genAI.getGenerativeModel({
                model: options.model || this.config.model,
            });

            const generationConfig = {
                temperature: options.temperature || this.config.temperature,
                topP: options.topP || this.config.topP,
                maxOutputTokens: options.maxTokens || this.config.maxTokens,
            };

            const result = await model.generateContent({
                contents: [{ role: 'user', parts: [{ text: prompt }] }],
                generationConfig,
            });

            const response = await result.response;
            return response.text();
        } catch (error) {
            console.error('Gemini generateText Error:', error);
            throw new Error(`Gemini API Error: ${error.message}`);
        }
    }
}

export default GeminiProvider;
