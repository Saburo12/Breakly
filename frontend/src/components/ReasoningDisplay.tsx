import React, { useState } from 'react';
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

  // Parse reasoning content (remove XML tags)
  const cleanContent = content
    .replace(/<reasoning>/g, '')
    .replace(/<\/reasoning>/g, '')
    .trim();

  // Don't render if there's no content
  if (!cleanContent && !isGenerating) {
    return null;
  }

  return (
    <div className="w-full mb-6">
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-indigo-50 to-violet-50 border border-indigo-200 rounded-t-xl hover:from-indigo-100 hover:to-violet-100 transition-all duration-200"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white rounded-lg shadow-sm">
            <Brain className="w-5 h-5 text-indigo-600" />
          </div>
          <div className="text-left">
            <h3 className="text-lg font-semibold text-gray-900">Reasoning</h3>
            <p className="text-sm text-gray-600">Claude's planning process</p>
          </div>
          {isGenerating && (
            <div className="flex items-center gap-2 ml-4">
              <Sparkles className="w-4 h-4 text-indigo-600 animate-pulse" />
              <span className="text-sm text-indigo-600 font-medium">Thinking...</span>
            </div>
          )}
        </div>
        <ChevronDown
          className={`w-5 h-5 text-gray-600 transition-transform duration-200 ${
            isExpanded ? 'rotate-180' : ''
          }`}
        />
      </button>

      {/* Content */}
      {isExpanded && (
        <div className="bg-white border-x border-b border-indigo-200 rounded-b-xl p-6">
          <div className="prose prose-sm max-w-none">
            {cleanContent ? (
              <div className="text-gray-700 whitespace-pre-wrap font-normal leading-relaxed">
                {/* Parse markdown-like content */}
                {cleanContent.split('\n').map((line, index) => {
                  // Handle headers (##)
                  if (line.startsWith('## ')) {
                    return (
                      <h2
                        key={index}
                        className="text-xl font-bold text-gray-900 mt-6 mb-3 first:mt-0"
                      >
                        {line.replace('## ', '')}
                      </h2>
                    );
                  }
                  // Handle numbered lists
                  if (line.match(/^\d+\.\s/)) {
                    return (
                      <div key={index} className="ml-4 mb-2">
                        <span className="font-medium text-indigo-600">
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
                        <span className="text-indigo-600 mr-2">•</span>
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
              <div className="flex items-center gap-3 text-gray-500">
                <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce" />
                <div
                  className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce"
                  style={{ animationDelay: '0.1s' }}
                />
                <div
                  className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce"
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
