'use server';
/**
 * @fileOverview A Genkit flow for generating high-quality short videos using the stable Veo 2.0 model.
 *
 * - generateAIVideo - A function that handles the video generation process.
 * - AIVideoGeneratorInput - The input type for the function.
 * - AIVideoGeneratorOutput - The return type.
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
      // التغيير لنموذج Veo 2.0 المستقر لحل مشكلة predictLongRunning
      let { operation } = await ai.generate({
        model: googleAI.model('veo-2.0-generate-001'),
        prompt: input.prompt,
        config: {
          aspectRatio: '16:9',
          durationSeconds: 5,
        },
      });

      if (!operation) {
        throw new Error('لم يتمكن النظام من بدء عملية التوليد. تأكد من إعداد API Key.');
      }

      // الانتظار حتى اكتمال التوليد (بحد أقصى دقيقتين)
      let attempts = 0;
      const maxAttempts = 24; 

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
        throw new Error('فشل توليد الفيديو. قد يكون المحتوى مخالفاً لسياسات السلامة.');
      }
      
      return {
        videoDataUri: videoPart.media.url
      };
    } catch (err: any) {
      console.error("AI Generation Error:", err);
      throw new Error(err.message || "فشل غير متوقع في توليد الفيديو.");
    }
  }
);
