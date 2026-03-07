'use server';
/**
 * @fileOverview A robust Genkit flow for generating cinema-quality short videos using the stable Veo 2.0 model.
 * 
 * This flow handles:
 * 1. Initiating the video generation operation.
 * 2. Polling for completion.
 * 3. Fetching the final video and converting it to a base64 data URI for client-side usage.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import {googleAI} from '@genkit-ai/google-genai';

const AIVideoGeneratorInputSchema = z.object({
  prompt: z.string().describe('وصف تفصيلي للفيديو المراد توليده.'),
});
export type AIVideoGeneratorInput = z.infer<typeof AIVideoGeneratorInputSchema>;

const AIVideoGeneratorOutputSchema = z.object({
  videoDataUri: z.string().describe('الفيديو المولد بصيغة data URI.'),
});
export type AIVideoGeneratorOutput = z.infer<typeof AIVideoGeneratorOutputSchema>;

export async function generateAIVideo(input: AIVideoGeneratorInput): Promise<AIVideoGeneratorOutput> {
  return aiVideoGeneratorFlow(input);
}

const aiVideoGeneratorFlow = ai.defineFlow(
  {
    name: 'aiVideoGeneratorFlow',
    inputSchema: AIVideoGeneratorInputSchema,
    outputSchema: AIVideoGeneratorOutputSchema,
  },
  async (input) => {
    try {
      // استخدام نموذج Veo 2.0 المستقر لضمان أعلى جودة وأداء
      let { operation } = await ai.generate({
        model: googleAI.model('veo-2.0-generate-001'),
        prompt: input.prompt,
        config: {
          aspectRatio: '16:9',
          durationSeconds: 5,
          personGeneration: 'allow_all'
        },
      });

      if (!operation) {
        throw new Error('لم يتمكن النظام من بدء عملية التوليد. تأكد من إعداد API Key.');
      }

      // الانتظار حتى اكتمال التوليد
      let attempts = 0;
      const maxAttempts = 30; // 30 * 5 = 150 ثانية كحد أقصى

      while (!operation.done && attempts < maxAttempts) {
        operation = await ai.checkOperation(operation);
        if (!operation.done) {
          await new Promise((resolve) => setTimeout(resolve, 5000));
          attempts++;
        }
      }

      if (operation.error) {
        throw new Error('خطأ في نموذج الذكاء الاصطناعي: ' + operation.error.message);
      }

      const videoPart = operation.output?.message?.content.find((p) => !!p.media);
      if (!videoPart || !videoPart.media) {
        throw new Error('فشل توليد الفيديو. قد يكون الوصف مخالفاً لسياسات السلامة.');
      }

      // تحويل الفيديو إلى Base64 Data URI لضمان عمله عند الجميع
      const fetch = (await import('node-fetch')).default;
      const videoDownloadResponse = await fetch(
        `${videoPart.media.url}&key=${process.env.GEMINI_API_KEY}`
      );

      if (!videoDownloadResponse.ok) {
        throw new Error('فشل تحميل الفيديو المولد من السيرفر.');
      }

      const buffer = await videoDownloadResponse.arrayBuffer();
      const base64 = Buffer.from(buffer).toString('base64');
      
      return {
        videoDataUri: `data:video/mp4;base64,${base64}`
      };
    } catch (err: any) {
      console.error("AI Generation Error:", err);
      throw new Error(err.message || "فشل غير متوقع في توليد الفيديو.");
    }
  }
);
