'use server';
/**
 * @fileOverview A robust Genkit flow for generating cinema-quality short videos using the stable Veo 2.0 model.
 * 
 * Optimized for speed and "idea-to-video" accuracy.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import {googleAI} from '@genkit-ai/google-genai';

const AIVideoGeneratorInputSchema = z.object({
  prompt: z.string().describe('وصف تفصيلي أو فكرة للفيديو المراد توليده.'),
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
      // استخدام Veo 2.0 المستقر مع تمكين تحسين الوصف تلقائياً
      let { operation } = await ai.generate({
        model: googleAI.model('veo-2.0-generate-001'),
        prompt: input.prompt,
        config: {
          aspectRatio: '16:9',
          durationSeconds: 5,
          personGeneration: 'allow_all',
          // @ts-ignore - Some versions support enhancePrompt
          enhancePrompt: true 
        },
      });

      if (!operation) {
        throw new Error('فشل بدء الاتصال بـ AXI AI. تأكد من إعداد API Key.');
      }

      // الانتظار الذكي (Polling)
      let attempts = 0;
      const maxAttempts = 40; // زيادة وقت الانتظار للفيديوهات المعقدة

      while (!operation.done && attempts < maxAttempts) {
        operation = await ai.checkOperation(operation);
        if (!operation.done) {
          await new Promise((resolve) => setTimeout(resolve, 3000)); // تقليل الفجوة لتسريع الاستجابة
          attempts++;
        }
      }

      if (operation.error) {
        throw new Error('خطأ في معالجة الفكرة: ' + operation.error.message);
      }

      const videoPart = operation.output?.message?.content.find((p) => !!p.media);
      if (!videoPart || !videoPart.media) {
        throw new Error('لم يتمكن الذكاء الاصطناعي من تحويل الفكرة لفيديو. جرب وصفاً مختلفاً.');
      }

      // جلب الفيديو وتحويله بسرعة
      const fetch = (await import('node-fetch')).default;
      const videoDownloadResponse = await fetch(
        `${videoPart.media.url}&key=${process.env.GEMINI_API_KEY || 'AIzaSyDD0biCG-dxQzZ75c_5fmZHliR4TnBAls0'}`
      );

      if (!videoDownloadResponse.ok) {
        throw new Error('فشل تحميل الفيديو المولد.');
      }

      const buffer = await videoDownloadResponse.arrayBuffer();
      const base64 = Buffer.from(buffer).toString('base64');
      
      return {
        videoDataUri: `data:video/mp4;base64,${base64}`
      };
    } catch (err: any) {
      console.error("AI Generation Error:", err);
      throw new Error(err.message || "حدث خطأ أثناء توليد الفيديو.");
    }
  }
);
