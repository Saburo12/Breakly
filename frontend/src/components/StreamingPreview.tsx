import React, { useEffect, useState, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useStreamingGeneration } from '../hooks/useStreamingGeneration';
import { Loader2, X, Plus, ArrowUp } from 'lucide-react';
import { GeneratedFile, Message } from '../types';
import { CodeWorkspace } from './CodeWorkspace';
import { LivePreview } from './LivePreview';
import { ConversationThread } from './ConversationThread';
import { UpgradeButton } from './UpgradeButton';
import { PricingModal } from './PricingModal';
import { IntegrationsModal } from './IntegrationsModal';
import { GitHubPushModal } from './GitHubPushModal';
import { Toast } from './Toast';
import { supabase } from '../lib/supabase';
import { IntegrationService } from '../services/integrations';

interface StreamingPreviewProps {
  projectId?: number;
  onSave?: (files: GeneratedFile[]) => void;
}

/**
 * StreamingPreview Component
 * Split screen interface with prompt input and live code preview
 */
export function StreamingPreview({ projectId }: StreamingPreviewProps) {
  const location = useLocation();
  const [prompt, setPrompt] = useState('');
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
  const [activeTab, setActiveTab] = useState<'code' | 'preview'>('code');
  const [conversationHistory, setConversationHistory] = useState<Message[]>([]);
  const [isPricingModalOpen, setIsPricingModalOpen] = useState(false);
  const [pricingTriggeredByLimit, setPricingTriggeredByLimit] = useState(false);
  const [isIntegrationsModalOpen, setIsIntegrationsModalOpen] = useState(false);
  const [isGitHubPushModalOpen, setIsGitHubPushModalOpen] = useState(false);
  const [githubAccessToken, setGithubAccessToken] = useState<string>('');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error'; link?: string } | null>(null);
  const [generationCount, setGenerationCount] = useState(0);
  const [isAdmin, setIsAdmin] = useState(false);
  const conversationEndRef = useRef<HTMLDivElement>(null);

  const FREE_GENERATION_LIMIT = 2;
  const ADMIN_EMAILS = ['awesoham27@gmail.com']; // Replace with your actual Gmail

  // Check if user is admin
  useEffect(() => {
    const checkAdmin = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user && ADMIN_EMAILS.includes(user.email || '')) {
        setIsAdmin(true);
        console.log('🔑 Admin mode activated - unlimited generations');
      }
    };
    checkAdmin();
  }, []);

  // Handle initial prompt and files from landing page navigation
  useEffect(() => {
    // First, check navigation state (for email/password auth)
    const state = location.state as { initialPrompt?: string; attachedFiles?: File[] } | null;
    if (state?.initialPrompt) {
      setPrompt(state.initialPrompt);
      console.log('✅ Loaded prompt from navigation state:', state.initialPrompt);
    }
    if (state?.attachedFiles) {
      setAttachedFiles(state.attachedFiles);
      console.log('✅ Loaded files from navigation state:', state.attachedFiles.length, 'files');
    }

    // Also check localStorage (for Google OAuth which redirects)
    const savedPrompt = localStorage.getItem('breakly_pending_prompt');
    if (savedPrompt && !state?.initialPrompt) {
      setPrompt(savedPrompt);
      localStorage.removeItem('breakly_pending_prompt'); // Clear after using
      console.log('✅ Loaded prompt from localStorage (OAuth):', savedPrompt);
    }

    const savedFileNames = localStorage.getItem('breakly_pending_files');
    if (savedFileNames && !state?.attachedFiles) {
      const fileNames = JSON.parse(savedFileNames);
      localStorage.removeItem('breakly_pending_files'); // Clear after using
      console.log('✅ Loaded file names from localStorage (OAuth):', fileNames);
      // Note: Can't restore actual File objects, only names
    }
  }, [location.state]);

  // Load generation count from localStorage on mount
  useEffect(() => {
    const savedCount = localStorage.getItem('generation_count');
    if (savedCount) {
      setGenerationCount(parseInt(savedCount, 10));
    }
  }, []);

  // Persist generation count to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('generation_count', generationCount.toString());
  }, [generationCount]);

  const { generate, isGenerating, generatedFiles, error } =
    useStreamingGeneration();

  const handleGenerate = async () => {
    if (!prompt.trim()) return;

    // Check rate limit BEFORE generating (skip for admins)
    if (!isAdmin && generationCount >= FREE_GENERATION_LIMIT) {
      setPricingTriggeredByLimit(true);
      setIsPricingModalOpen(true);
      return; // Block generation
    }

    // Add user message to conversation
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: prompt,
      timestamp: new Date(),
    };
    setConversationHistory(prev => [...prev, userMessage]);

    // Clear prompt for next message
    const currentPrompt = prompt;
    setPrompt('');

    // Increment counter BEFORE API call
    setGenerationCount(prev => prev + 1);

    // Pass existing files for iterative editing
    await generate(
      currentPrompt,
      projectId,
      attachedFiles.length > 0 ? attachedFiles : undefined,
      generatedFiles.length > 0 ? generatedFiles : undefined
    );
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      handleGenerate();
    }
  };

  // Add AI response to conversation when generation completes
  useEffect(() => {
    if (!isGenerating && generatedFiles.length > 0 && conversationHistory.length > 0) {
      // Check if we already added this response
      const lastMessage = conversationHistory[conversationHistory.length - 1];
      if (lastMessage.role === 'user') {
        const aiMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: `Generated ${generatedFiles.length} file${generatedFiles.length > 1 ? 's' : ''}`,
          timestamp: new Date(),
          files: generatedFiles,
        };
        setConversationHistory(prev => [...prev, aiMessage]);
        setActiveTab('preview'); // Auto-switch to preview
        // Clear attached files after successful generation
        setAttachedFiles([]);
        console.log('[Attach] Cleared attached files after generation');
      }
    }
  }, [isGenerating, generatedFiles, conversationHistory]);

  // Auto-scroll conversation to bottom
  useEffect(() => {
    conversationEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversationHistory]);

  // Check GitHub connection on mount
  useEffect(() => {
    checkGitHubConnection();
  }, []);

  const checkGitHubConnection = async () => {
    try {
      const token = await IntegrationService.getGitHubToken();
      if (token) {
        setGithubAccessToken(token);
      }
    } catch (error) {
      console.error('Error checking GitHub connection:', error);
    }
  };

  const handlePublishClick = async () => {
    if (!generatedFiles.length) {
      setToast({ message: 'No code generated yet. Generate some code first!', type: 'error' });
      return;
    }

    // Check if GitHub is connected
    const token = await IntegrationService.getGitHubToken();

    if (!token) {
      // Not connected, show integrations modal
      setIsIntegrationsModalOpen(true);
    } else {
      // Connected, show push modal
      setGithubAccessToken(token);
      setIsGitHubPushModalOpen(true);
    }
  };

  const handleGitHubPushSuccess = (repoUrl: string) => {
    setToast({
      message: '✓ Successfully pushed to GitHub!',
      type: 'success',
      link: repoUrl,
    });
  };

  const handleGitHubPushError = (error: string) => {
    setToast({
      message: error,
      type: 'error',
    });
  };

  return (
    <div className="flex flex-col h-full bg-[#0a0a0a]">
      {/* Header */}
      <div className="bg-[#0a0a0a] border-b border-[#333] px-6 py-4 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Breakly</h2>
          <p className="text-sm text-slate-400 mt-1">
            Describe what you want to build and watch the code generate in real-time
          </p>
        </div>
        <UpgradeButton
          onClick={() => {
            setPricingTriggeredByLimit(false);
            setIsPricingModalOpen(true);
          }}
          onIntegrationsClick={() => setIsIntegrationsModalOpen(true)}
          onPublishClick={handlePublishClick}
        />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel - Prompt Input */}
        <div className="w-1/3 border-r border-[#333] bg-[#0a0a0a] p-6 flex flex-col overflow-hidden">
          <label className="block text-sm font-semibold text-slate-300 mb-2 tracking-wide">
            {conversationHistory.length > 0 ? 'Continue the conversation' : 'What do you want to build?'}
          </label>

          {/* Generation Counter */}
          {isAdmin ? (
            <div className="mb-2 text-xs text-green-400 font-semibold">
              🔑 Admin Mode - Unlimited Generations
            </div>
          ) : generationCount < FREE_GENERATION_LIMIT ? (
            <div className="mb-2 text-xs text-slate-400">
              {FREE_GENERATION_LIMIT - generationCount} free generation{FREE_GENERATION_LIMIT - generationCount === 1 ? '' : 's'} remaining
            </div>
          ) : null}

          {/* Conversation History */}
          {conversationHistory.length > 0 && (
            <div className="flex-1 overflow-y-auto mb-3 pr-2">
              <ConversationThread messages={conversationHistory} />
              <div ref={conversationEndRef} />
            </div>
          )}

          {/* Input Container */}
          <div className="bg-[#1a1a1a] rounded-2xl border border-[#333] overflow-hidden">
            {/* Text Input Area */}
            <div className="p-6">
              <input
                type="text"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask Breakly..."
                className="w-full bg-transparent border-none outline-none text-white placeholder:text-slate-500"
                disabled={isGenerating}
              />
            </div>

            {/* Action Bar */}
            <div className="flex items-center justify-between px-4 py-3 border-t border-[#333]">
              <div className="flex items-center gap-3">
                {/* Add Button (File Attachment) */}
                <label className="cursor-pointer">
                  <input
                    type="file"
                    multiple
                    accept="image/*,text/*,.json,.js,.jsx,.ts,.tsx,.py,.html,.css,.md,.csv"
                    onChange={(e) => {
                      if (e.target.files && e.target.files.length > 0) {
                        const newFiles = Array.from(e.target.files);
                        console.log('[Attach] Selected files:', newFiles.map(f => f.name));
                        // Append new files to existing ones
                        setAttachedFiles(prev => [...prev, ...newFiles]);
                        // Clear the input so the same file can be selected again if needed
                        e.target.value = '';
                      }
                    }}
                    className="hidden"
                    disabled={isGenerating}
                  />
                  <div className="w-8 h-8 rounded-lg bg-[#2a2a2a] hover:bg-[#333] flex items-center justify-center transition-colors">
                    <Plus className="w-4 h-4 text-white" />
                  </div>
                </label>
              </div>

              <div className="flex items-center gap-2">
                {/* Generate Button (ArrowUp) */}
                <button
                  onClick={handleGenerate}
                  disabled={isGenerating || !prompt.trim()}
                  className="w-8 h-8 rounded-lg bg-[#2a2a2a] hover:bg-[#333] flex items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isGenerating ? (
                    <Loader2 className="w-4 h-4 text-white animate-spin" />
                  ) : (
                    <ArrowUp className="w-4 h-4 text-white" />
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Attached Files Display */}
          {attachedFiles.length > 0 && (
            <div className="mt-4 p-3 bg-[#1a1a1a] border border-[#333] rounded-lg">
              <p className="text-xs font-semibold text-slate-300 mb-2">📎 Attached Files:</p>
              <div className="flex flex-wrap gap-2">
                {attachedFiles.map((file, index) => (
                  <div
                    key={index}
                    className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg bg-[#2a2a2a] border border-[#333] text-xs text-slate-300"
                  >
                    <span className="truncate max-w-xs">{file.name}</span>
                    <button
                      onClick={() => {
                        setAttachedFiles(prev => prev.filter((_, i) => i !== index));
                      }}
                      className="hover:text-red-400 transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Error Display */}
          {error && (
            <div className="mt-4 p-4 bg-red-600/10 border border-red-500/50 rounded-xl">
              <p className="text-sm text-red-400 font-semibold">Error</p>
              <p className="text-sm text-red-300 mt-1">{error}</p>
            </div>
          )}
        </div>

        {/* Right Panel - Code/Preview */}
        <div className="flex-1 flex flex-col bg-[#0a0a0a]">
          {/* Tab Switcher */}
          {generatedFiles.length > 0 && (
            <div className="flex items-center gap-2 bg-[#0a0a0a] border-b border-[#333] px-4 py-2">
              <button
                onClick={() => setActiveTab('code')}
                className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-all ${
                  activeTab === 'code'
                    ? 'bg-[#2a2a2a] text-white border border-[#333]'
                    : 'bg-transparent text-slate-400 hover:bg-[#1a1a1a]'
                }`}
              >
                Code
              </button>
              <button
                onClick={() => setActiveTab('preview')}
                className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-all ${
                  activeTab === 'preview'
                    ? 'bg-[#2a2a2a] text-white border border-[#333]'
                    : 'bg-transparent text-slate-400 hover:bg-[#1a1a1a]'
                }`}
              >
                Preview
              </button>
            </div>
          )}

          {/* Loading State */}
          {isGenerating && generatedFiles.length === 0 && (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <Loader2 className="w-12 h-12 text-slate-300 animate-spin mx-auto mb-4" />
                <p className="text-slate-300 font-semibold">Generating code...</p>
                <p className="text-slate-400 text-sm mt-2">This may take a few moments</p>
              </div>
            </div>
          )}

          {/* Code Tab - Workspace with Vertical File Tree */}
          {activeTab === 'code' && generatedFiles.length > 0 && (
            <CodeWorkspace files={generatedFiles} readOnly={true} />
          )}

          {/* Preview Tab - Live Preview */}
          {activeTab === 'preview' && generatedFiles.length > 0 && (
            <div className="flex-1 overflow-hidden" style={{ height: '100%', minHeight: 0 }}>
              <LivePreview files={generatedFiles} />
            </div>
          )}

          {/* Empty State */}
          {!isGenerating && generatedFiles.length === 0 && (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center text-slate-400">
                <img
                  src="/logo.png"
                  alt="Breakly Logo"
                  className="w-32 h-32 mx-auto mb-4 object-contain"
                />
                <p className="text-lg font-semibold text-slate-300">No code generated yet</p>
                <p className="text-sm mt-2 text-slate-500">Enter a prompt on the left to get started</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Pricing Modal */}
      <PricingModal
        isOpen={isPricingModalOpen}
        onClose={() => setIsPricingModalOpen(false)}
        triggeredByLimit={pricingTriggeredByLimit}
      />

      {/* Integrations Modal */}
      <IntegrationsModal
        isOpen={isIntegrationsModalOpen}
        onClose={() => setIsIntegrationsModalOpen(false)}
        onGitHubConnected={(accessToken) => {
          setGithubAccessToken(accessToken);
          setIsIntegrationsModalOpen(false);
          // After connecting, show the push modal
          setTimeout(() => setIsGitHubPushModalOpen(true), 500);
        }}
      />

      {/* GitHub Push Modal */}
      {githubAccessToken && (
        <GitHubPushModal
          isOpen={isGitHubPushModalOpen}
          onClose={() => setIsGitHubPushModalOpen(false)}
          files={generatedFiles}
          accessToken={githubAccessToken}
          onSuccess={handleGitHubPushSuccess}
          onError={handleGitHubPushError}
        />
      )}

      {/* Toast Notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          link={toast.link}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}
