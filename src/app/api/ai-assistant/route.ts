import { getAIProvider } from '@/lib/ai/gateway';
import { streamText, tool } from 'ai';
import { z } from 'zod';

export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages } = await req.json();
  const provider = getAIProvider();

  const result = streamText({
    model: provider('gpt-4o'),
    system: `You are an expert software engineer and UI designer with "v0 powers". 
    You help users build dynamic document and email templates. 
    You can generate React components, HTML, and execute code concepts.
    
    IMPORTANT: You are an "Artifact-based" assistant. 
    When you generate code, it is treated as a persistent artifact that the user can iterate on.
    If the user asks to "change the color" or "add a section", you should generate the FULL updated code for the artifact.
    
    When asked to generate UI or templates, ALWAYS use the 'generate_ui' tool.
    
    For "Document Templates", prefer using HTML/CSS that is suitable for PDF generation.
    For "Email Templates", prefer using HTML with inline styles or React Email components if applicable.
    
    When asked to explain something, just reply with text.`,
    messages,
    tools: {
      generate_ui: tool({
        description: 'Generate a UI component or code snippet',
        inputSchema: z.object({
          code: z.string().describe('The full code to generate'),
          title: z.string().describe('A short title for this artifact (e.g. "Invoice Template")'),
          type: z.enum(['react', 'html']).describe('The type of code'),
          explanation: z.string().describe('Brief explanation of what was changed or created'),
        }),
      }),
    },
  });

  return result.toTextStreamResponse();
}
