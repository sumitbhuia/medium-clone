// backend/src/lib/tagGen.ts
import { GoogleGenAI } from "@google/genai";

interface TagGenRes {
  tags: string[];
  success: boolean;
  error?: string;
}

export class TagGen {
  private ai: GoogleGenAI;

  constructor(apiKey: string) {
    if (!apiKey) {
      throw new Error('Gemini API key is required');
    }
    // Initialize with API key for Cloudflare Workers
    this.ai = new GoogleGenAI({ 
      apiKey: apiKey 
    });
  }

  async generateTags(articleContent: string, title?: string): Promise<TagGenRes> {
    try {
      const prompt = `
        Analyze the following article and generate exactly 3 relevant tags that best describe the content.
        The tags should be:
        - Single words or short phrases (max 2-3 words)
        - Relevant to the main topics discussed
        - Suitable for categorization and search
        - Lowercase
        
        Article Title: ${title || 'N/A'}
        
        Article Content: ${articleContent}
        
        Return only the 3 tags separated by commas, nothing else.
        Example format: javascript, web development, programming
      `;

      const response = await this.ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
      });

      const text = (response.text ?? "").trim();

      if (!text) {
        throw new Error('Empty response from Gemini API');
      }

      // Parse the tags
      const tags = text
        .split(',')
        .map((tag: string) => tag.trim().toLowerCase())
        .filter((tag: string) => tag.length > 0)
        .slice(0, 3); // Ensure only 3 tags

      return {
        tags,
        success: true
      };

    } catch (error) {
      console.error('Error generating tags:', error);
      return {
        tags: [],
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Fallback method with default tags if AI fails
  generateFallbackTags(content: string): string[] {
    const commonWords = content
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 3)
      .slice(0, 10);

    // Simple frequency analysis for fallback
    const wordCount = commonWords.reduce((acc, word) => {
      acc[word] = (acc[word] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(wordCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([word]) => word);
  }
}