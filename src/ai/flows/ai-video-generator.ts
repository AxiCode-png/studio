'use server';
/**
 * @fileOverview A Genkit flow for generating short videos from text descriptions using Veo.
 *
 * - generateAIVideo - A function that handles the video generation process.
 * - AIVideoGeneratorInput - The input type for the generateAIVideo function.
 * - AIVideoGeneratorOutput - The return type for the generateAIVideo function.
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
    // Note: Video generation is resource-intensive and may take up to a minute.
    let { operation } = await ai.generate({
      model: googleAI.model('veo-2.0-generate-001'),
      prompt: input.prompt,
      config: {
        durationSeconds: 5,
        aspectRatio: '16:9',
      },
    });

    if (!operation) {
      throw new Error('Expected the model to return an operation');
    }

    // Polling for completion
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

    // Since we can't easily download and stream back in this prototype, 
    // we assume the media.url is accessible or we'd typically convert to base64.
    // In a real app, you'd download from the temporary URL and upload to Firebase Storage.
    
    // For the sake of the prototype, we return the URL directly or a mock data URI if needed.
    return {
      videoDataUri: videoPart.media.url
    };
  }
);
