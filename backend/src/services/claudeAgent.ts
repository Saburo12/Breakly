import Anthropic from '@anthropic-ai/sdk';
import { Response } from 'express';

/**
 * Configuration for Claude code generation
 */
const CLAUDE_CONFIG = {
  model: 'claude-sonnet-4-5-20250929', // Sonnet 4.5 - latest stable model
  maxTokens: 16000, // Increased to prevent code cutoff during generation
  temperature: 0.7,
};

/**
 * System prompt for code generation
 * Instructs Claude to generate production-ready code with proper structure
 */
const SYSTEM_PROMPT = `# ⚠️ CRITICAL: MULTI-FILE PROJECT STRUCTURE - CODE ONLY

Generate a complete, production-ready application with PROPER FILE STRUCTURE.
Output ZERO explanations - ONLY code blocks with file paths.

# PROJECT STRUCTURE REQUIREMENTS

## React/TypeScript Projects (DEFAULT)
Generate a complete React + TypeScript + Vite project with this structure:

\`\`\`json package.json
{
  "name": "generated-app",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "@vitejs/plugin-react": "^4.2.0",
    "typescript": "^5.2.2",
    "vite": "^5.0.0",
    "tailwindcss": "^3.3.0",
    "autoprefixer": "^10.4.0",
    "postcss": "^8.4.0"
  }
}
\`\`\`

\`\`\`typescript vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
})
\`\`\`

\`\`\`json tsconfig.json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
\`\`\`

\`\`\`json tsconfig.node.json
{
  "compilerOptions": {
    "composite": true,
    "skipLibCheck": true,
    "module": "ESNext",
    "moduleResolution": "bundler",
    "allowSyntheticDefaultImports": true
  },
  "include": ["vite.config.ts"]
}
\`\`\`

\`\`\`typescript tailwind.config.ts
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {},
  },
  plugins: [],
}
\`\`\`

\`\`\`css src/index.css
@tailwind base;
@tailwind components;
@tailwind utilities;
\`\`\`

\`\`\`typescript src/main.tsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
\`\`\`

\`\`\`html index.html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Generated App</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
\`\`\`

Then create components in src/components/, pages in src/pages/, etc.

## File Path Format
ALWAYS use full paths with folders:
- ✅ src/pages/Index.tsx
- ✅ src/components/Navbar.tsx
- ✅ src/components/ui/Button.tsx
- ✅ package.json
- ✅ tsconfig.json
- ❌ NOT just "Button.tsx"

# PREMIUM DESIGN REQUIREMENTS

## PROFESSIONAL IMAGES
- Use high-quality images from Unsplash (https://source.unsplash.com/{topic}/{width}x{height})
- Use Pexels API (https://images.pexels.com/photos/...) for stock photos
- Use DiceBear avatars (https://api.dicebear.com/...) for user avatars
- Implement image optimization with lazy loading
- Use appropriate image URLs that match the website theme/purpose
- Replace placeholder images with actual stock photo URLs

## SUPERIOR TYPOGRAPHY
- Use Google Fonts: Inter, Poppins, Playfair Display, Roboto, Open Sans
- Font hierarchy: Display (font-bold text-5xl-7xl), Heading (font-semibold text-2xl-4xl), Body (font-regular text-base-lg), Small (text-sm-xs)
- Line height: 1.6 for body, 1.2 for headings
- Letter spacing: tracking-wide for headings, tracking-normal for body
- Font weights: Use 300, 400, 600, 700, 800
- Proper text contrast ratio (WCAG AAA)

## ELEGANT COLOR SCHEMES
- Primary: Rich, sophisticated colors (deep blues, dark purples, charcoal, navy)
- Secondary: Complementary accent colors (gold, emerald, coral, indigo)
- Neutral palette: Off-white, light gray, dark gray backgrounds
- Use color psychology: trust (blue), luxury (gold/purple), growth (green)
- Implement dark mode with proper contrast

## SUPERIOR LAYOUT
- Generous whitespace and padding (p-12, p-16, space-y-8)
- Grid layouts with proper alignment
- Card-based designs with subtle shadows
- Hero sections with compelling visuals
- Feature sections with icons and descriptions
- CTAs with hover animations
- Footer with links and information

## PREMIUM VISUAL EFFECTS
- Gradient backgrounds (linear, radial with premium colors)
- Glassmorphism (backdrop-blur-md, bg-white/5-10)
- Smooth animations and transitions (duration-300, ease-in-out)
- Hover effects on interactive elements
- Box shadows for depth (shadow-lg, shadow-2xl)
- Border radius for modern feel (rounded-xl, rounded-2xl)

## ADVANCED PREMIUM INTERACTIONS (INSANE POLISH)

### 1. SUBTLE ANIMATED BACKGROUND (Motion Without Noise)
- Add soft animated gradients that shift slowly (use CSS keyframes or Tailwind animate classes)
- Implement particle drift or grid shimmer effects in background
- Use slow parallax abstract shapes that move on scroll
- Background motion must be SLOWER than reading speed for calm, premium feel
- Example: Gradient position animation with 20-30s duration, infinite loop

### 2. INTENTIONAL MICRO-INTERACTIONS (Everything Reacts)
- Button hover: Add glow effect, border beam animation, or subtle scale (hover:scale-105)
- Cards: Lift slightly on hover (hover:shadow-2xl hover:-translate-y-1 transition-all)
- Icons: Animate only on hover (rotate, bounce, scale)
- Cursor-proximity effects where appropriate (subtle)
- All interactive elements must have visual feedback
- Use transform and transition classes: transition-all duration-300 ease-in-out

### 3. PROGRESSIVE REVEAL ON SCROLL (Rhythm + Momentum)
- Implement staggered fade-in animations for sections
- Use slide + fade combo (opacity-0 translate-y-10 → opacity-100 translate-y-0)
- Sequential section reveals with different delays (delay-100, delay-200, delay-300)
- Create visual pacing that guides attention naturally
- Motion should reward scrolling, not compete with content
- Add data-aos or intersection observer patterns for scroll animations

### 4. DEPTH LAYERS (Shadows, Glass, Separation)
- Use soft XL shadows for elevation (shadow-xl, shadow-2xl)
- Implement angled shadows for premium card designs
- Add glass/blur panels sparingly for key elements (backdrop-blur-lg bg-white/10)
- Create clear foreground vs background separation
- Rule: Darker backgrounds → stronger shadows (shadow-2xl), Lighter backgrounds → softer shadows (shadow-md)
- Layered components should have varying z-index and shadow depths

### 5. STRONG TYPOGRAPHY CONTRAST (Instant Authority)
- Use BIG, confident hero typography (text-6xl, text-7xl, text-8xl for headlines)
- Tight heading line-height for impact (leading-tight, leading-none)
- Clear font weight contrast between headings (font-bold, font-extrabold) and body (font-normal, font-medium)
- Simplified body text with generous line-height (leading-relaxed)
- Typography IS design - make it bold and authoritative
- Example: Hero text-7xl font-extrabold, subheading text-2xl font-semibold, body text-lg font-normal leading-relaxed

# CORE REQUIREMENTS FOR REACT PROJECTS
- Use Tailwind CSS utility classes exclusively (configured via tailwind.config.ts)
- Create components in src/components/ folder
- Create pages in src/pages/ folder
- Use TypeScript for type safety
- Implement proper React patterns (hooks, props, state)
- Create gradient backgrounds with premium color combinations
- Include glassmorphism effects and modern aesthetics
- Add smooth animations and micro-interactions
- Create proper component hierarchy
- Include professional icons from lucide-react or heroicons
- Make fully responsive (mobile-first approach with Tailwind breakpoints)
- Implement professional spacing and alignment
- Use premium color palettes based on the user's prompt
- Export components properly (export default or named exports)
- Use React Router for multi-page apps when needed

# CODE BLOCK FORMAT
CRITICAL: ALWAYS include the FULL PATH with folders:
- ✅ \`\`\`typescript src/App.tsx
- ✅ \`\`\`typescript src/components/Navbar.tsx
- ✅ \`\`\`typescript src/pages/Home.tsx
- ✅ \`\`\`json package.json
- ❌ WRONG: \`\`\`typescript App.tsx (missing src/)

Format:
\`\`\`language path/to/file.ext
code content here
\`\`\`

# QUALITY STANDARDS
- Every component must be premium and professional
- No cheap or generic designs
- High attention to visual hierarchy
- Professional spacing and typography
- Use real image URLs from Unsplash/Pexels
- Ensure accessibility (WCAG standards)
- Smooth user experience with animations
- Proper TypeScript types for all props and state
- Clean, maintainable code structure`;


/**
 * Interface for generated file
 */
export interface GeneratedFile {
  name: string;
  content: string;
  language: string;
  path: string;
}

/**
 * Interface for SSE chunk
 */
export interface StreamChunk {
  type: 'content' | 'file_start' | 'file_complete' | 'done' | 'error';
  content?: string;
  fileName?: string;
  language?: string;
  fileIndex?: number;
  filesGenerated?: number;
  error?: string;
}

/**
 * Claude service for code generation with streaming
 */
export class ClaudeService {
  private anthropic: Anthropic;

  constructor(apiKey: string) {
    this.anthropic = new Anthropic({ apiKey });
  }

  /**
   * Generate code with streaming SSE response
   */
  async generateCodeStream(prompt: string, res: Response, imageFiles?: any[]): Promise<void> {
    try {
      console.log('🚀 Starting code generation with prompt:', prompt.substring(0, 50) + '...');
      if (imageFiles && imageFiles.length > 0) {
        console.log(`📸 Including ${imageFiles.length} image(s) for analysis`);
      }

      // Set SSE headers
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');

      // Build message content with images if provided
      const messageContent: any[] = [
        {
          type: 'text',
          text: prompt,
        },
      ];

      // Add images to message content if provided
      if (imageFiles && imageFiles.length > 0) {
        for (const imageFile of imageFiles) {
          messageContent.push({
            type: 'image',
            source: {
              type: 'base64',
              media_type: imageFile.mimeType,
              data: imageFile.base64,
            },
          });
        }
      }

      // Create streaming request
      const stream = await this.anthropic.messages.stream({
        model: CLAUDE_CONFIG.model,
        max_tokens: CLAUDE_CONFIG.maxTokens,
        temperature: CLAUDE_CONFIG.temperature,
        messages: [
          {
            role: 'user',
            content: messageContent,
          },
        ],
        system: SYSTEM_PROMPT,
      });

      let fullContent = '';
      let hasCompleted = false;

      // Process stream
      try {
        for await (const chunk of stream) {
          // Handle content deltas
          if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') {
            const text = chunk.delta.text;
            fullContent += text;

            // Send content chunk to client
            this.sendSSE(res, {
              type: 'content',
              content: text,
            });
          }

          // Handle content block start
          if (chunk.type === 'content_block_start') {
            console.log('📥 Content block started');
          }

          // Handle stream completion
          if (chunk.type === 'message_stop') {
            console.log('✅ message_stop event received');
            hasCompleted = true;
            break; // Exit the loop when stream is done
          }
        }

        // Process completion (moved outside loop to ensure it happens)
        if (hasCompleted || fullContent.length > 0) {
          console.log('✅ Stream complete. Parsing files from content...');
          console.log('📝 Full content length:', fullContent.length);
          console.log('📝 First 300 chars of content:', fullContent.substring(0, 300));

          // Debug: check for backticks
          const backtickCount = (fullContent.match(/```/g) || []).length;
          console.log(`🔍 Found ${backtickCount} triple-backtick occurrences (expected: even number, 2+ for at least 1 code block)`);
          const firstBacktickPos = fullContent.indexOf('```');
          if (firstBacktickPos >= 0) {
            console.log(`📍 First backtick at position ${firstBacktickPos}`);
            console.log(`   Context: "${fullContent.substring(Math.max(0, firstBacktickPos - 10), firstBacktickPos + 50)}"`);
          }

          // Parse files from full content
          const files = this.parseFilesFromContent(fullContent);
          console.log('📦 Parsed files:', files.length);
          files.forEach(f => console.log('  -', f.name, `(${f.language})`));

          // Send file information
          files.forEach((file, index) => {
            console.log(`📤 Sending file ${index + 1}/${files.length}:`, file.name);
            this.sendSSE(res, {
              type: 'file_complete',
              fileName: file.name,
              language: file.language,
              content: file.content,
              fileIndex: index,
            });
          });

          // Send completion
          this.sendSSE(res, {
            type: 'done',
            filesGenerated: files.length,
          });
          console.log('🎉 Generation complete!');
        }
      } catch (streamError) {
        console.error('❌ Error during stream processing:', streamError);
        throw streamError;
      }

      res.end();
    } catch (error: any) {
      console.error('Claude streaming error:', error);

      this.sendSSE(res, {
        type: 'error',
        error: error.message || 'Failed to generate code',
      });

      res.end();
    }
  }

  /**
   * Parse generated files from Claude's response
   * Uses regex to extract all code blocks with proper handling
   */
  protected parseFilesFromContent(content: string): GeneratedFile[] {
    const files: GeneratedFile[] = [];

    console.log(`🔍 Parsing content (${content.length} chars total)`);

    // Use regex to find all code blocks with their headers and content
    // Matches: ```language filename\n...content...\n``` OR ```language filename\n...content (end of string)
    // This handles both complete and incomplete code blocks
    const codeBlockRegex = /```([a-zA-Z0-9\-_]*)\s*([^\n]*)\n([\s\S]*?)(?:```|$)/g;

    let match;
    let blockCount = 0;

    while ((match = codeBlockRegex.exec(content)) !== null) {
      blockCount++;
      const language = (match[1] || 'txt').trim() || 'txt';
      let filename = (match[2] || '').trim();
      let codeContent = (match[3] || '').trim();

      // If content ends with ``` due to the regex, remove it
      if (codeContent.endsWith('```')) {
        codeContent = codeContent.slice(0, -3).trim();
      }

      console.log(`📂 Found code block #${blockCount} at char ${match.index}`);
      console.log(`   Language: "${language}", Filename: "${filename}"`);
      console.log(`   Content length: ${codeContent.length} chars`);

      // Generate filename if not provided
      if (!filename || filename.length === 0) {
        filename = `file${files.length}.${this.getExtension(language)}`;
        console.log(`   Generated filename: "${filename}"`);
      }

      if (codeContent.length > 0) {
        console.log(`✅ Adding file: "${filename}"`);
        files.push({
          name: filename,
          content: codeContent,
          language: language,
          path: filename,
        });
      } else {
        console.log(`⚠️  Skipped empty block for: "${filename}"`);
      }
    }

    if (blockCount === 0) {
      console.log(`⚠️  No code blocks found in content!`);
      console.log(`📝 First 500 chars: ${content.substring(0, 500)}`);
    }

    console.log(`📦 Total files parsed: ${files.length}`);
    return files;
  }

  /**
   * Get file extension for language
   */
  private getExtension(language: string): string {
    const extensionMap: Record<string, string> = {
      typescript: 'ts',
      javascript: 'js',
      tsx: 'tsx',
      jsx: 'jsx',
      python: 'py',
      java: 'java',
      cpp: 'cpp',
      c: 'c',
      css: 'css',
      html: 'html',
      json: 'json',
      yaml: 'yaml',
      yml: 'yml',
      sql: 'sql',
      go: 'go',
      rust: 'rs',
      ruby: 'rb',
      php: 'php',
      swift: 'swift',
      kotlin: 'kt',
    };

    return extensionMap[language.toLowerCase()] || 'txt';
  }

  /**
   * Send SSE message to client
   */
  protected sendSSE(res: Response, data: StreamChunk): void {
    res.write(`data: ${JSON.stringify(data)}\n\n`);
  }

  /**
   * Generate code without streaming (for testing)
   */
  async generateCode(prompt: string, imageFiles?: any[]): Promise<GeneratedFile[]> {
    try {
      // Build message content with images if provided
      const messageContent: any[] = [
        {
          type: 'text',
          text: prompt,
        },
      ];

      // Add images to message content if provided
      if (imageFiles && imageFiles.length > 0) {
        for (const imageFile of imageFiles) {
          messageContent.push({
            type: 'image',
            source: {
              type: 'base64',
              media_type: imageFile.mimeType,
              data: imageFile.base64,
            },
          });
        }
      }

      const message = await this.anthropic.messages.create({
        model: CLAUDE_CONFIG.model,
        max_tokens: CLAUDE_CONFIG.maxTokens,
        temperature: CLAUDE_CONFIG.temperature,
        messages: [
          {
            role: 'user',
            content: messageContent,
          },
        ],
        system: SYSTEM_PROMPT,
      });

      // Extract text content
      const textContent = message.content
        .filter((block) => block.type === 'text')
        .map((block) => ('text' in block ? block.text : ''))
        .join('\n');

      // Parse files
      return this.parseFilesFromContent(textContent);
    } catch (error: any) {
      console.error('Claude generation error:', error);
      throw new Error(`Code generation failed: ${error.message}`);
    }
  }
}

/**
 * Mock service for local/demo use without external API
 */
export class MockClaudeService extends ClaudeService {
  constructor() {
    super('');
  }
  async generateCodeStream(prompt: string, res: Response, imageFiles?: any[]): Promise<void> {
    // Basic SSE headers
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    // CODE ONLY - no text descriptions as per system prompt
    const demoContent =
      '```html index.html\n<!doctype html>\n<html>\n  <head>\n    <meta charset="utf-8" />\n    <meta name="viewport" content="width=device-width, initial-scale=1" />\n    <title>Demo App</title>\n    <link rel="stylesheet" href="styles.css" />\n  </head>\n  <body>\n    <div id="app">Hello from Mock Generator</div>\n    <script src="app.js"></script>\n  </body>\n</html>\n```\n\n' +
      '```css styles.css\nbody {\n  font-family: system-ui, sans-serif;\n  margin: 0;\n  padding: 3rem;\n  background: #0f172a;\n  color: #e2e8f0;\n}\n#app {\n  font-size: 1.125rem;\n}\n```\n\n' +
      '```javascript app.js\nconsole.log("Mock generator ready");\n```';

    // Stream it in chunks for effect
    for (const chunk of demoContent.match(/.{1,80}/g) || []) {
      this.sendSSE(res as any, { type: 'content', content: chunk });
      await new Promise((r) => setTimeout(r, 10));
    }

    // Send parsed file blocks as completion
    const files = this.parseFilesFromContent(demoContent);
    console.log('[MOCK] Sending file_complete messages for', files.length, 'files');
    files.forEach((file: GeneratedFile, index: number) => {
      console.log('[MOCK] Sending file_complete:', file.name);
      this.sendSSE(res as any, {
        type: 'file_complete',
        fileName: file.name,
        language: file.language,
        content: file.content,
        fileIndex: index,
      });
    });
    console.log('[MOCK] Sending done event');
    this.sendSSE(res as any, { type: 'done', filesGenerated: files.length });
    res.end();
  }

  async generateCode(prompt: string, imageFiles?: any[]): Promise<GeneratedFile[]> {
    // CODE ONLY - no text descriptions as per system prompt
    const demoContent =
      '```html index.html\n<!doctype html>\n<html>\n  <head>\n    <meta charset="utf-8" />\n    <meta name="viewport" content="width=device-width, initial-scale=1" />\n    <title>Demo App</title>\n    <link rel="stylesheet" href="styles.css" />\n  </head>\n  <body>\n    <div id="app">Hello from Mock Generator</div>\n    <script src="app.js"></script>\n  </body>\n</html>\n```\n\n' +
      '```css styles.css\nbody {\n  font-family: system-ui, sans-serif;\n  margin: 0;\n  padding: 3rem;\n  background: #0f172a;\n  color: #e2e8f0;\n}\n#app {\n  font-size: 1.125rem;\n}\n```\n\n' +
      '```javascript app.js\nconsole.log("Mock generator ready");\n```';

    return this.parseFilesFromContent(demoContent);
  }
}

/**
 * Create Claude service instance
 */
export function createClaudeService(): ClaudeService {
  console.log('🔧 Creating Claude service...');
  console.log('   MOCK_CLAUDE:', process.env.MOCK_CLAUDE);
  console.log('   API Key exists:', !!process.env.ANTHROPIC_API_KEY);

  // Allow mock mode for local demos
  if (process.env.MOCK_CLAUDE === 'true') {
    console.log('⚠️  Using MOCK Claude service');
    // @ts-ignore - returned type is compatible with usage sites
    return new MockClaudeService() as unknown as ClaudeService;
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey || apiKey === 'REPLACE_WITH_YOUR_API_KEY') {
    console.log('❌ No valid API key found, falling back to mock');
    // @ts-ignore - returned type is compatible with usage sites
    return new MockClaudeService() as unknown as ClaudeService;
  }
  console.log('✅ Using REAL Claude service');
  return new ClaudeService(apiKey);
}
