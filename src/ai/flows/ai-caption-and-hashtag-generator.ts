'use server';
/**
 * @fileOverview A Genkit flow for generating engaging titles and relevant hashtags for short videos.
 *
 * - generateCaptionAndHashtags - A function that handles the generation of video captions and hashtags.
 * - AICaptionAndHashtagGeneratorInput - The input type for the generateCaptionAndHashtags function.
 * - AICaptionAndHashtagGeneratorOutput - The return type for the generateCaptionAndHashtags function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AICaptionAndHashtagGeneratorInputSchema = z.object({
  videoDescription: z
    .string()
    .describe('A brief description of the video content.'),
});
export type AICaptionAndHashtagGeneratorInput = z.infer<
  typeof AICaptionAndHashtagGeneratorInputSchema
>;

const AICaptionAndHashtagGeneratorOutputSchema = z.object({
  title: z.string().describe('An engaging and catchy title for the video.'),
  hashtags: z
    .array(z.string())
    .describe('A list of relevant hashtags for the video, without the # symbol.'),
});
export type AICaptionAndHashtagGeneratorOutput = z.infer<
  typeof AICaptionAndHashtagGeneratorOutputSchema
>;

export async function generateCaptionAndHashtags(
  input: AICaptionAndHashtagGeneratorInput
): Promise<AICaptionAndHashtagGeneratorOutput> {
  return aiCaptionAndHashtagGeneratorFlow(input);
}

const prompt = ai.definePrompt({
  name: 'aiCaptionAndHashtagGeneratorPrompt',
  input: {schema: AICaptionAndHashtagGeneratorInputSchema},
  output: {schema: AICaptionAndHashtagGeneratorOutputSchema},
  prompt: `You are an expert social media manager specializing in short-form video content creation. Your task is to generate a highly engaging and catchy title, along with a list of relevant and trending hashtags, for a video based on its description.

Ensure the title grabs attention and encourages clicks. The hashtags should maximize discoverability.

Video Description: {{{videoDescription}}}`,
});

const aiCaptionAndHashtagGeneratorFlow = ai.defineFlow(
  {
    name: 'aiCaptionAndHashtagGeneratorFlow',
    inputSchema: AICaptionAndHashtagGeneratorInputSchema,
    outputSchema: AICaptionAndHashtagGeneratorOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    return output!;
  }
);
