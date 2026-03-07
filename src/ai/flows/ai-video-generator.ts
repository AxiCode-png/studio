'use server';
/**
 * @fileOverview A Genkit flow for generating high-quality short videos using the latest Veo 3 model.
 *
 * - generateAIVideo - A function that handles the video generation process with Veo 3.
 * - AIVideoGeneratorInput - The input type for the function.
 * - AIVideoGeneratorOutput - The return type.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import {googleAI} from '@genkit-ai/google-genai';

const AIVideoGeneratorInputSchema = z.object({
  prompt: z.string().describe('A detailed description of the video you want to generate.'),
});
export type AIVideoGeneratorInput = z.infer<typeof AIVideoGeneratorInputSchema>;

const AIVideoGeneratorOutputSchema = z.object({
  videoDataUri: z.string().describe('The generated video as a data URI.'),
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
    // استخدام Veo 3.0 المطور لتوليد فيديوهات سينمائية مع الصوت
    let { operation } = await ai.generate({
      model: googleAI.model('veo-3.0-generate-preview'),
      prompt: input.prompt,
      config: {
        aspectRatio: '16:9',
      },
    });

    if (!operation) {
      throw new Error('Expected the model to return an operation');
    }

    // الانتظار حتى اكتمال التوليد (قد يستغرق حوالي دقيقة)
    while (!operation.done) {
      operation = await ai.checkOperation(operation);
      await new Promise((resolve) => setTimeout(resolve, 5000));
    }

    if (operation.error) {
      throw new Error('Failed to generate video: ' + operation.error.message);
    }

    const videoPart = operation.output?.message?.content.find((p) => !!p.media);
    if (!videoPart || !videoPart.media) {
      throw new Error('Failed to find the generated video in the output');
    }
    
    return {
      videoDataUri: videoPart.media.url
    };
  }
);
