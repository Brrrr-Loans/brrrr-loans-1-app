import { getAIProvider } from "@/lib/ai/gateway";
import { streamText } from "ai";

export const maxDuration = 30;

const SYSTEM_PROMPT = `You are a helpful assistant that generates shadcn/ui theme color palettes. When the user asks for a theme, generate a complete color palette in the following JSON format:

{
  "light": {
    "background": "#ffffff",
    "foreground": "#0a0a0a",
    "card": "#ffffff",
    "card-foreground": "#0a0a0a",
    "popover": "#ffffff",
    "popover-foreground": "#0a0a0a",
    "primary": "#171717",
    "primary-foreground": "#fafafa",
    "secondary": "#f5f5f5",
    "secondary-foreground": "#171717",
    "muted": "#f5f5f5",
    "muted-foreground": "#737373",
    "accent": "#f5f5f5",
    "accent-foreground": "#171717",
    "destructive": "#ef4444",
    "destructive-foreground": "#fafafa",
    "border": "#e5e5e5",
    "input": "#e5e5e5",
    "ring": "#0a0a0a",
    "chart-1": "#e76e50",
    "chart-2": "#2a9d90",
    "chart-3": "#274754",
    "chart-4": "#e8c468",
    "chart-5": "#f4a462",
    "sidebar-background": "#fafafa",
    "sidebar-foreground": "#404040",
    "sidebar-primary": "#171717",
    "sidebar-primary-foreground": "#fafafa",
    "sidebar-accent": "#f5f5f5",
    "sidebar-accent-foreground": "#171717",
    "sidebar-border": "#e5e5e5",
    "sidebar-ring": "#0a0a0a"
  },
  "dark": {
    "background": "#0a0a0a",
    "foreground": "#fafafa",
    "card": "#0a0a0a",
    "card-foreground": "#fafafa",
    "popover": "#0a0a0a",
    "popover-foreground": "#fafafa",
    "primary": "#fafafa",
    "primary-foreground": "#171717",
    "secondary": "#262626",
    "secondary-foreground": "#fafafa",
    "muted": "#262626",
    "muted-foreground": "#a3a3a3",
    "accent": "#262626",
    "accent-foreground": "#fafafa",
    "destructive": "#7f1d1d",
    "destructive-foreground": "#fafafa",
    "border": "#262626",
    "input": "#262626",
    "ring": "#d4d4d4",
    "chart-1": "#2662d9",
    "chart-2": "#2eb88a",
    "chart-3": "#e88c30",
    "chart-4": "#af57db",
    "chart-5": "#e23670",
    "sidebar-background": "#171717",
    "sidebar-foreground": "#d4d4d4",
    "sidebar-primary": "#2662d9",
    "sidebar-primary-foreground": "#fafafa",
    "sidebar-accent": "#262626",
    "sidebar-accent-foreground": "#d4d4d4",
    "sidebar-border": "#262626",
    "sidebar-ring": "#d4d4d4"
  }
}

IMPORTANT RULES:
1. Always respond with ONLY a valid JSON code block containing both light and dark themes
2. Use hex color values (e.g., #ffffff, #0a0a0a)
3. Ensure good contrast between foreground and background colors
4. Make sure chart colors are visually distinct
5. Keep the sidebar colors complementary to the main theme
6. Wrap the JSON in a code block with the language set to "json"

When generating themes, consider:
- The user's description of the desired mood/aesthetic
- Color theory and accessibility
- Ensuring text is readable against backgrounds
- Creating visual harmony between all color tokens`;

export async function POST(req: Request) {
  // Check for API key (either gateway or direct OpenAI)
  if (!process.env.AI_GATEWAY_API_KEY && !process.env.OPENAI_API_KEY) {
    return new Response(
      JSON.stringify({
        error: "AI API key not configured. Please add AI_GATEWAY_API_KEY or OPENAI_API_KEY to your .env.local file.",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  try {
    const { messages } = await req.json();
    const provider = getAIProvider();

    const result = streamText({
      model: provider("gpt-4o-mini"),
      system: SYSTEM_PROMPT,
      messages,
    });

    return result.toTextStreamResponse();
  } catch (error) {
    console.error("Tinte chat error:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Failed to generate theme",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}

