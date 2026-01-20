import Anthropic from '@anthropic-ai/sdk';
import { Response } from 'express';

/**
 * Configuration for Claude code generation
 */
const CLAUDE_CONFIG = {
  model: 'claude-sonnet-4-5-20250929', // Sonnet 4.5 - faster and cost-effective
  maxTokens: 16000, // Increased to prevent code cutoff during generation
  temperature: 0.7,
};

/**
 * System prompt for code generation
 * Instructs Claude to generate production-ready code with proper structure
 */
const SYSTEM_PROMPT = `# ⚠️ CRITICAL: TWO-PHASE OUTPUT FORMAT

## PHASE 1 - REASONING (REQUIRED FIRST)
Before generating any code, you MUST output your reasoning wrapped in <reasoning></reasoning> tags.
⚠️ CRITICAL: Keep reasoning CONCISE - maximum 120-150 words total.

<reasoning>
## Approach
[Brief high-level approach - 2-3 sentences max]

## Components to Create
[Concise numbered list of key components - 5-8 items max]
1. Component name - Brief purpose
2. Component name - Brief purpose
...

## Key Decisions
[1-2 critical architectural choices only]
</reasoning>

## PHASE 2 - CODE GENERATION
After the reasoning block, generate a complete, production-ready application with PROPER FILE STRUCTURE.

# IMAGE HANDLING (WHEN USER ATTACHES IMAGES)
When the user provides images:
1. USE the uploaded images directly in the generated code
2. Reference them using relative paths: /assets/imagename.jpg or ./imagename.png
3. Apply proper CSS to fit images appropriately:
   - Use object-fit: cover/contain for proper scaling
   - Use aspect-ratio for maintaining proportions
   - Use max-width: 100% and height: auto for responsive images
   - Apply Tailwind classes: object-cover, object-contain, aspect-video, aspect-square
4. Create responsive image containers with proper dimensions
5. Example: <img src="/assets/hero.jpg" className="w-full h-96 object-cover rounded-xl" alt="Hero" />
6. For backgrounds: style={{backgroundImage: 'url(/assets/bg.jpg)', backgroundSize: 'cover'}}
7. DO NOT use placeholder URLs - use actual uploaded filenames
8. Adjust image sizes to fit the design context (hero: h-96, thumbnail: h-48, avatar: h-12, etc.)

# CODE ORGANIZATION RULES

## Component Structure (CRITICAL)
Create separate files for each component - NO monolithic files!

1. **File Separation**:
   - Create components/ directory for UI components
   - Create hooks/ directory for custom React hooks
   - Create utils/ directory for utility functions
   - Create types/ directory for TypeScript interfaces

2. **Component Breakdown**:
   - Break complex UIs into multiple smaller components
   - Example for landing page, create:
     * components/layout/Navigation.tsx
     * components/layout/Footer.tsx
     * components/home/Hero.tsx
     * components/home/Features.tsx
     * components/home/Testimonials.tsx
     * components/home/Pricing.tsx
     * components/home/CTA.tsx
     * components/ui/Button.tsx
     * components/ui/Card.tsx

3. **Naming Conventions**:
   - Components: PascalCase (Button.tsx, HeroSection.tsx)
   - Hooks: camelCase with 'use' prefix (useAuth.ts, useForm.ts)
   - Utils: camelCase (formatDate.ts, validation.ts)
   - Types: PascalCase interfaces (User.ts, ApiResponse.ts)

4. **Minimum File Count**:
   - Simple apps: At least 8-12 component files
   - Medium apps: At least 15-20 component files
   - Complex apps: 25+ component files
   - Each section of UI should be its own component

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

## PROFESSIONAL COLOR PALETTE (WHITE-BASED DESIGN)
**CRITICAL: Default to white/light backgrounds with dark accents**
- **Background**: White (#FFFFFF) or very light gray (#F9FAFB, #F3F4F6)
- **Text**: Dark gray to black (#111827, #1F2937, #374151)
- **Headings**: Deep black (#000000, #111827)
- **Accents**: Indigo (#6366F1), Violet (#8B5CF6), Purple (#A855F7) - use for CTAs, links, highlights
- **Borders**: Light gray (#E5E7EB, #D1D5DB) for subtle separation
- **Hover States**: Slightly darker shades of accents
- **Secondary Accents**: Emerald (#10B981), Blue (#3B82F6), Rose (#F43F5E)
- Use color psychology: trust (blue), innovation (indigo), growth (emerald)
- Create CONTRAST: light backgrounds + dark text + vibrant accent colors

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

# EXAMPLE COMPONENT STRUCTURES

## Example 1: Landing Page Structure
For a landing page, generate these files:

/src/App.tsx - Main app component with routing
/src/components/layout/Navigation.tsx - Top navigation bar
/src/components/layout/Footer.tsx - Footer with links
/src/components/home/Hero.tsx - Hero section with CTA
/src/components/home/Features.tsx - Features grid
/src/components/home/Testimonials.tsx - Customer testimonials
/src/components/home/Pricing.tsx - Pricing cards
/src/components/home/CTA.tsx - Call-to-action section
/src/components/ui/Button.tsx - Reusable button component
/src/components/ui/Card.tsx - Reusable card component
/src/hooks/useScrollAnimation.ts - Custom scroll animation hook
/src/utils/constants.ts - App constants
/src/types/index.ts - TypeScript interfaces

## Example 2: Professional Hero Component (WHITE BACKGROUND DESIGN)
\`\`\`typescript src/components/home/Hero.tsx
export function Hero() {
  return (
    <section className="relative bg-white py-24 overflow-hidden">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#e5e7eb_1px,transparent_1px),linear-gradient(to_bottom,#e5e7eb_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000,transparent)]" />

      <div className="relative max-w-7xl mx-auto px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-6xl lg:text-7xl font-extrabold text-gray-900 mb-6 leading-tight">
            <span className="block">Build Something</span>
            <span className="block bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 bg-clip-text text-transparent">
              Extraordinary
            </span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed mb-8">
            Create professional, production-ready applications with the power of AI
          </p>
          <div className="flex items-center justify-center gap-4">
            <button className="px-8 py-4 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105">
              Get Started
            </button>
            <button className="px-8 py-4 bg-gray-100 text-gray-900 font-semibold rounded-xl hover:bg-gray-200 transition-all duration-200">
              Learn More
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
\`\`\`

## Example 3: Professional Card Component
\`\`\`typescript src/components/ui/Card.tsx
interface CardProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
}

export function Card({ title, description, icon }: CardProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
      {icon && (
        <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4 text-indigo-600">
          {icon}
        </div>
      )}
      <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 leading-relaxed">{description}</p>
    </div>
  );
}
\`\`\`

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
  type: 'reasoning' | 'content' | 'file_start' | 'file_complete' | 'done' | 'error';
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

      // Set CORS headers for SSE (CRITICAL for cross-origin streaming)
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Credentials', 'true');
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

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
      let inReasoningBlock = false;

      // Process stream
      try {
        for await (const chunk of stream) {
          // Handle content deltas
          if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') {
            const text = chunk.delta.text;
            fullContent += text;

            // Save current state BEFORE modifying it
            const wasInReasoningBlock = inReasoningBlock;

            // Check if we're entering or exiting reasoning block
            if (text.includes('<reasoning>')) {
              inReasoningBlock = true;
              console.log('🧠 Entering reasoning block');
            }
            if (text.includes('</reasoning>')) {
              inReasoningBlock = false;
              console.log('🧠 Exiting reasoning block');
            }

            // Use the PREVIOUS state to determine chunk type
            // This ensures content INSIDE the block gets sent as reasoning
            if (wasInReasoningBlock || text.includes('<reasoning>') || text.includes('</reasoning>')) {
              // Send as reasoning chunk
              this.sendSSE(res, {
                type: 'reasoning',
                content: text,
              });
            } else {
              // Send as regular content chunk
              this.sendSSE(res, {
                type: 'content',
                content: text,
              });
            }
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

          // Add uploaded images to files array
          if (imageFiles && imageFiles.length > 0) {
            console.log(`📸 Adding ${imageFiles.length} uploaded image(s) to files`);
            for (const img of imageFiles) {
              const imageFile: GeneratedFile = {
                name: img.name,
                content: img.base64,
                language: 'base64',
                path: `public/assets/${img.name}`,
              };
              files.push(imageFile);
              console.log(`  - Added image: ${img.name}`);
            }
          }

          // Send file information (code files + images)
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
      const files = this.parseFilesFromContent(textContent);

      // Add uploaded images to files array
      if (imageFiles && imageFiles.length > 0) {
        console.log(`📸 Adding ${imageFiles.length} uploaded image(s) to files`);
        for (const img of imageFiles) {
          const imageFile: GeneratedFile = {
            name: img.name,
            content: img.base64,
            language: 'base64',
            path: `public/assets/${img.name}`,
          };
          files.push(imageFile);
          console.log(`  - Added image: ${img.name}`);
        }
      }

      return files;
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
