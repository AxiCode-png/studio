'use server';
/**
 * @fileOverview محرك توليد الفيديوهات السينمائية AXI-AI المعتمد على نموذج Veo 2.0 المستقر.
 * 
 * تم تحسين هذا التدفق ليدعم تحويل الأفكار البسيطة إلى فيديوهات بجودة 16:9 وصوت مدمج.
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
      // استخدام نموذج Veo 2.0 المستقر لضمان أعلى جودة وسرعة
      let { operation } = await ai.generate({
        model: googleAI.model('veo-2.0-generate-001'),
        prompt: input.prompt,
        config: {
          aspectRatio: '16:9',
          durationSeconds: 5,
          personGeneration: 'allow_all',
          // @ts-ignore
          enhancePrompt: true 
        },
      });

      if (!operation) {
        throw new Error('محرك AXI-AI غير متاح حالياً. يرجى التأكد من الـ API Key.');
      }

      // الانتظار حتى اكتمال التوليد (Polling)
      while (!operation.done) {
        operation = await ai.checkOperation(operation);
        if (!operation.done) {
          await new Promise((resolve) => setTimeout(resolve, 4000));
        }
      }

      if (operation.error) {
        throw new Error('خطأ في معالجة الفكرة السينمائية: ' + operation.error.message);
      }

      const videoPart = operation.output?.message?.content.find((p) => !!p.media);
      if (!videoPart || !videoPart.media) {
        throw new Error('فشل الذكاء الاصطناعي في إنتاج الفيديو. جرب وصفاً مختلفاً.');
      }

      const fetch = (await import('node-fetch')).default;
      const videoDownloadResponse = await fetch(
        `${videoPart.media.url}&key=${process.env.GEMINI_API_KEY || 'AIzaSyDD0biCG-dxQzZ75c_5fmZHliR4TnBAls0'}`
      );

      if (!videoDownloadResponse.ok) {
        throw new Error('فشل تحميل الفيديو المولد من خوادم AI.');
      }

      const buffer = await videoDownloadResponse.arrayBuffer();
      const base64 = Buffer.from(buffer).toString('base64');
      
      return {
        videoDataUri: `data:video/mp4;base64,${base64}`
      };
    } catch (err: any) {
      console.error("AXI-AI Video Flow Error:", err);
      throw new Error(err.message || "حدث خطأ تقني أثناء توليد الفيديو.");
    }
  }
);
