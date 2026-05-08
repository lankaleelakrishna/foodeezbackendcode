import { GoogleGenerativeAI } from '@google/generative-ai';
import { IMenuScanProvider } from './interface';
import { MenuScanResult } from '../types';
import { MENU_EXTRACTION_PROMPT } from '../prompt';
import { parseJsonResponse } from '../response-parser';

export class GeminiMenuScanProvider implements IMenuScanProvider {
  readonly name = 'gemini';
  private readonly genAI: GoogleGenerativeAI;

  constructor(apiKey: string) {
    this.genAI = new GoogleGenerativeAI(apiKey);
  }

  async scan(imageBase64: string, mimeType: string): Promise<MenuScanResult> {
    const model = this.genAI.getGenerativeModel({
      model: 'gemini-3.1-flash-lite-preview',
      generationConfig: { maxOutputTokens: 2048, temperature: 0 },
    });
    const result = await model.generateContent([
      { inlineData: { data: imageBase64, mimeType: mimeType || 'image/jpeg' } },
      MENU_EXTRACTION_PROMPT,
    ]);
    return parseJsonResponse(result.response.text());
  }
}
