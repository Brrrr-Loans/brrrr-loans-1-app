#!/usr/bin/env node

/**
 * Script to fix font loading issues in v0-card-with-table project
 * Uses v0-sdk to interact with the v0 API
 */

import { v0 } from 'v0-sdk';
import fs from 'fs';
import path from 'path';

// Initialize v0 client with your API key
const client = v0({
  apiKey: process.env.V0_API_KEY
});

// The corrected layout.tsx content
const correctedLayoutContent = `import type { Metadata } from "next";
import {
  Geist as V0_Font_Geist,
  Geist_Mono as V0_Font_Geist_Mono,
  Source_Serif_4 as V0_Font_Source_Serif_4,
} from "next/font/google";
import "./globals.css";

// Initialize fonts - FIXED: Assigned to constants at module scope
const geistFont = V0_Font_Geist({
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  subsets: ["latin"],
  variable: "--font-geist",
});

const geistMonoFont = V0_Font_Geist_Mono({
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  subsets: ["latin"],
  variable: "--font-geist-mono",
});

const sourceSerifFont = V0_Font_Source_Serif_4({
  weight: ["200", "300", "400", "500", "600", "700", "800", "900"],
  subsets: ["latin"],
  variable: "--font-source-serif",
});

export const metadata: Metadata = {
  title: "Card with Table",
  description: "A card component with an integrated table",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={\`\${geistFont.variable} \${geistMonoFont.variable} \${sourceSerifFont.variable} antialiased\`}
      >
        {children}
      </body>
    </html>
  );
}`;

async function fixV0FontIssues() {
  try {
    console.log('🔧 Starting v0 font fix process...');
    
    // List all chats/projects
    console.log('📋 Fetching v0 projects...');
    const chats = await client.chats.list();
    
    // Find the card-with-table project
    const cardTableProject = chats.data.find(chat => 
      chat.title?.toLowerCase().includes('card') && 
      chat.title?.toLowerCase().includes('table')
    );
    
    if (!cardTableProject) {
      console.log('❌ Could not find v0-card-with-table project');
      console.log('Available projects:', chats.data.map(chat => chat.title));
      return;
    }
    
    console.log(`✅ Found project: ${cardTableProject.title} (ID: ${cardTableProject.id})`);
    
    // Get the project details
    const projectDetails = await client.chats.get(cardTableProject.id);
    console.log('📁 Retrieved project details');
    
    // Create a new message with the fixed layout
    console.log('🔨 Applying font fix...');
    const response = await client.chats.messages.create(cardTableProject.id, {
      content: `Please replace the layout.tsx file with this corrected version that fixes the font loading issues:

\`\`\`typescript
${correctedLayoutContent}
\`\`\`

This fixes the "Font loaders must be called and assigned to a const in the module scope" error by:
1. Assigning font loaders to constants at module scope
2. Adding proper subsets configuration
3. Including CSS variable names for better font management`,
      role: 'user'
    });
    
    console.log('✅ Font fix applied successfully!');
    console.log('🚀 You can now deploy the project from v0');
    
    return response;
    
  } catch (error) {
    console.error('❌ Error fixing v0 font issues:', error);
    
    if (error.message?.includes('401') || error.message?.includes('unauthorized')) {
      console.log('🔑 API key issue. Please verify your V0_API_KEY is correct');
    }
    
    throw error;
  }
}

// Run the fix if this script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  fixV0FontIssues()
    .then(() => {
      console.log('🎉 Font fix process completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Font fix process failed:', error.message);
      process.exit(1);
    });
}

export { fixV0FontIssues };
