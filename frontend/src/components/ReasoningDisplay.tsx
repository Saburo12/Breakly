import { useState } from 'react';
import { Brain, ChevronDown, Sparkles } from 'lucide-react';

interface ReasoningDisplayProps {
  content: string;
  isGenerating: boolean;
}

/**
 * ReasoningDisplay Component
 * Displays Claude's reasoning/thinking process before code generation
 */
export function ReasoningDisplay({ content, isGenerating }: ReasoningDisplayProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  // Remove ALL occurrences of the tags using global regex
  let cleanContent = content
    .replace(/<reasoning>/g, '')
    .replace(/<\/reasoning>/g, '')
    .trim();

  // Debug logging
  console.log('[ReasoningDisplay] Raw content length:', content.length);
  console.log('[ReasoningDisplay] Clean content length:', cleanContent.length);
  console.log('[ReasoningDisplay] Raw content preview:', content.substring(0, 100));
  console.log('[ReasoningDisplay] Clean content preview:', cleanContent.substring(0, 100));
  console.log('[ReasoningDisplay] isGenerating:', isGenerating);

  // Don't render if there's no content
  if (!cleanContent && !isGenerating) {
    return null;
  }

  return (
    <div className="w-full">
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-4 bg-[#1a1a1a] border border-[#333] rounded-t-xl hover:bg-[#252525] transition-all duration-200"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[#2a2a2a] rounded-lg">
            <Brain className="w-5 h-5 text-indigo-400" />
          </div>
          <div className="text-left">
            <h3 className="text-lg font-semibold text-white">Reasoning</h3>
            <p className="text-sm text-slate-400">Breakly's planning process</p>
          </div>
          {isGenerating && (
            <div className="flex items-center gap-2 ml-4">
              <Sparkles className="w-4 h-4 text-indigo-400 animate-pulse" />
              <span className="text-sm text-indigo-400 font-medium">Thinking...</span>
            </div>
          )}
        </div>
        <ChevronDown
          className={`w-5 h-5 text-slate-400 transition-transform duration-200 ${
            isExpanded ? 'rotate-180' : ''
          }`}
        />
      </button>

      {/* Content */}
      {isExpanded && (
        <div className="bg-[#1a1a1a] border-x border-b border-[#333] rounded-b-xl p-6 max-h-48 overflow-y-auto" style={{ scrollbarWidth: 'thin', scrollbarColor: '#333 transparent' }}>
          <div className="prose prose-sm max-w-none">
            {cleanContent ? (
              <div className="text-slate-300 whitespace-pre-wrap font-normal leading-relaxed">
                {/* Parse markdown-like content */}
                {cleanContent.split('\n').map((line, index) => {
                  // Handle headers (##)
                  if (line.startsWith('## ')) {
                    return (
                      <h2
                        key={index}
                        className="text-xl font-bold text-white mt-6 mb-3 first:mt-0"
                      >
                        {line.replace('## ', '')}
                      </h2>
                    );
                  }
                  // Handle numbered lists
                  if (line.match(/^\d+\.\s/)) {
                    return (
                      <div key={index} className="ml-4 mb-2">
                        <span className="font-medium text-indigo-400">
                          {line.match(/^\d+\./)?.[0]}
                        </span>
                        <span className="ml-2">{line.replace(/^\d+\.\s/, '')}</span>
                      </div>
                    );
                  }
                  // Handle bullet points
                  if (line.startsWith('- ')) {
                    return (
                      <div key={index} className="ml-4 mb-2 flex items-start">
                        <span className="text-indigo-400 mr-2">•</span>
                        <span>{line.replace('- ', '')}</span>
                      </div>
                    );
                  }
                  // Handle empty lines
                  if (line.trim() === '') {
                    return <div key={index} className="h-3" />;
                  }
                  // Regular text
                  return (
                    <p key={index} className="mb-2">
                      {line}
                    </p>
                  );
                })}
              </div>
            ) : (
              <div className="flex items-center gap-3 text-slate-400">
                <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" />
                <div
                  className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce"
                  style={{ animationDelay: '0.1s' }}
                />
                <div
                  className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce"
                  style={{ animationDelay: '0.2s' }}
                />
                <span className="ml-2">Analyzing your request...</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
