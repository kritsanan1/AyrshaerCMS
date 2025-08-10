import { GoogleGenAI } from "@google/genai";

// This API key is from Gemini Developer API Key, not vertex AI API Key
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function summarizeArticle(text: string): Promise<string> {
    const prompt = `Please summarize the following text concisely while maintaining key points:\n\n${text}`;

    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
    });

    return response.text || "Something went wrong";
}

export interface Sentiment {
    rating: number;
    confidence: number;
}

export async function analyzeSentiment(text: string): Promise<Sentiment> {
    try {
        const systemPrompt = `You are a sentiment analysis expert. 
Analyze the sentiment of the text and provide a rating
from 1 to 5 stars and a confidence score between 0 and 1.
Respond with JSON in this format: 
{'rating': number, 'confidence': number}`;

        const response = await ai.models.generateContent({
            model: "gemini-2.5-pro",
            config: {
                systemInstruction: systemPrompt,
                responseMimeType: "application/json",
                responseSchema: {
                    type: "object",
                    properties: {
                        rating: { type: "number" },
                        confidence: { type: "number" },
                    },
                    required: ["rating", "confidence"],
                },
            },
            contents: text,
        });

        const rawJson = response.text;

        if (rawJson) {
            const data: Sentiment = JSON.parse(rawJson);
            return data;
        } else {
            throw new Error("Empty response from model");
        }
    } catch (error) {
        throw new Error(`Failed to analyze sentiment: ${error}`);
    }
}

export async function generateContentSuggestions(topic: string, type: string = 'article'): Promise<string[]> {
    try {
        const prompt = `Generate 5 creative and engaging ${type} ideas about "${topic}". 
        Each suggestion should be a complete title or concept that would appeal to readers.
        Return as a JSON array of strings.`;

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: "array",
                    items: { type: "string" }
                },
            },
            contents: prompt,
        });

        const rawJson = response.text;
        if (rawJson) {
            return JSON.parse(rawJson);
        } else {
            throw new Error("Empty response from model");
        }
    } catch (error) {
        throw new Error(`Failed to generate content suggestions: ${error}`);
    }
}

export async function generateAIInsight(userStats: any): Promise<{
    type: string;
    title: string;
    content: string;
    priority: string;
}> {
    try {
        const prompt = `Based on these user content statistics: ${JSON.stringify(userStats)}
        Generate a helpful insight for the content creator. This could be a suggestion, 
        performance insight, or optimization tip. 
        
        Respond with JSON in this format:
        {
            "type": "suggestion|insight|tip",
            "title": "Brief insight title",
            "content": "Detailed explanation or recommendation",
            "priority": "low|medium|high"
        }`;

        const response = await ai.models.generateContent({
            model: "gemini-2.5-pro",
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: "object",
                    properties: {
                        type: { type: "string" },
                        title: { type: "string" },
                        content: { type: "string" },
                        priority: { type: "string" },
                    },
                    required: ["type", "title", "content", "priority"],
                },
            },
            contents: prompt,
        });

        const rawJson = response.text;
        if (rawJson) {
            return JSON.parse(rawJson);
        } else {
            throw new Error("Empty response from model");
        }
    } catch (error) {
        throw new Error(`Failed to generate AI insight: ${error}`);
    }
}
