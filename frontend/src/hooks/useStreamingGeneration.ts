import { useState, useCallback, useRef } from 'react';
import { GeneratedFile, StreamChunk } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

interface UseStreamingGenerationReturn {
  generate: (prompt: string, projectId?: number, files?: File[], existingFiles?: GeneratedFile[]) => Promise<void>;
  isGenerating: boolean;
  currentContent: string;
  reasoningContent: string;
  generatedFiles: GeneratedFile[];
  error: string | null;
  cancel: () => void;
  reset: () => void;
}

/**
 * Custom hook for streaming code generation using SSE
 */
export function useStreamingGeneration(): UseStreamingGenerationReturn {
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentContent, setCurrentContent] = useState('');
  const [reasoningContent, setReasoningContent] = useState('');
  const [generatedFiles, setGeneratedFiles] = useState<GeneratedFile[]>([]);
  const [error, setError] = useState<string | null>(null);

  const abortControllerRef = useRef<AbortController | null>(null);
  const eventSourceRef = useRef<EventSource | null>(null);

  /**
   * Cancel ongoing generation
   */
  const cancel = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
    setIsGenerating(false);
  }, []);

  /**
   * Reset state
   */
  const reset = useCallback(() => {
    setCurrentContent('');
    setReasoningContent('');
    setGeneratedFiles([]);
    setError(null);
  }, []);

  /**
   * Generate code with streaming
   */
  const generate = useCallback(
    async (prompt: string, projectId?: number, files?: File[], existingFiles?: GeneratedFile[]): Promise<void> => {
      // Clear current content and reasoning but keep existing files for context
      setCurrentContent('');
      setReasoningContent('');
      setIsGenerating(true);
      setError(null);

      try {
        // Create abort controller
        abortControllerRef.current = new AbortController();

        // Get auth token (check both possible keys for compatibility)
        const token = localStorage.getItem('authToken') || localStorage.getItem('auth_token');

        // Prepare request body
        let body: string | FormData;
        let contentType: string | undefined;

        if (files && files.length > 0) {
          // Use FormData to send files
          const formData = new FormData();
          formData.append('prompt', prompt);
          if (projectId) {
            formData.append('projectId', projectId.toString());
          }
          if (existingFiles && existingFiles.length > 0) {
            formData.append('existingFiles', JSON.stringify(existingFiles));
          }
          files.forEach((file) => {
            formData.append('files', file);
          });
          body = formData;
          // Don't set Content-Type header for FormData, browser will set it with boundary
          contentType = undefined;
        } else {
          // Use JSON for text-only requests
          body = JSON.stringify({ prompt, projectId, existingFiles });
          contentType = 'application/json';
        }

        // Use fetch with streaming for better control
        const response = await fetch(`${API_URL}/api/generate/stream`, {
          method: 'POST',
          headers: {
            ...(contentType && { 'Content-Type': contentType }),
            ...(token && { Authorization: `Bearer ${token}` }),
          },
          body: body,
          signal: abortControllerRef.current.signal,
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const reader = response.body?.getReader();
        const decoder = new TextDecoder();

        if (!reader) {
          throw new Error('No response body');
        }

        let buffer = '';

        // Read stream
        while (true) {
          const { done, value } = await reader.read();

          if (done) {
            break;
          }

          // Decode chunk
          buffer += decoder.decode(value, { stream: true });

          // Process complete messages
          const lines = buffer.split('\n');
          buffer = lines.pop() || ''; // Keep incomplete line in buffer

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.substring(6);

              try {
                const chunk: StreamChunk = JSON.parse(data);
                console.log('📨 Received chunk:', chunk.type, chunk);

                // Handle different chunk types
                switch (chunk.type) {
                  case 'reasoning':
                    if (chunk.content) {
                      setReasoningContent((prev) => prev + chunk.content);
                    }
                    break;

                  case 'content':
                    if (chunk.content) {
                      setCurrentContent((prev) => prev + chunk.content);
                    }
                    break;

                  case 'file_start':
                    // File generation started
                    break;

                  case 'file_complete':
                    console.log('✅ File complete:', chunk.fileName);
                    if (chunk.fileName && chunk.content && chunk.language) {
                      const file: GeneratedFile = {
                        name: chunk.fileName,
                        content: chunk.content,
                        language: chunk.language,
                        path: chunk.fileName,
                      };
                      setGeneratedFiles((prev) => [...prev, file]);
                    }
                    break;

                  case 'done':
                    console.log('🎉 Generation done!');
                    setIsGenerating(false);
                    break;

                  case 'error':
                    setError(chunk.error || 'Generation failed');
                    setIsGenerating(false);
                    break;
                }
              } catch (parseError) {
                console.error('Failed to parse SSE data:', parseError, 'data:', data);
              }
            }
          }
        }
      } catch (err: any) {
        if (err.name === 'AbortError') {
          console.log('Generation cancelled');
        } else {
          console.error('Generation error:', err);
          setError(err.message || 'Failed to generate code');
        }
        setIsGenerating(false);
      } finally {
        abortControllerRef.current = null;
      }
    },
    [reset]
  );

  return {
    generate,
    isGenerating,
    currentContent,
    reasoningContent,
    generatedFiles,
    error,
    cancel,
    reset,
  };
}
