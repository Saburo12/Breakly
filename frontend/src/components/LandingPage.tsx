import React, { useState, useRef } from 'react';
import { Plus, Paperclip, Send, X } from 'lucide-react';
import { AuthModal } from './AuthModal';
import { PricingModal } from './PricingModal';

/**
 * LandingPage Component
 * Premium professional landing page
 */
export function LandingPage() {
  const [prompt, setPrompt] = useState('');
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showPricingModal, setShowPricingModal] = useState(false);
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (prompt.trim()) {
      setShowAuthModal(true);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      handleSubmit(e as unknown as React.FormEvent);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setAttachedFiles(prev => [...prev, ...Array.from(e.target.files || [])]);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const removeFile = (index: number) => {
    setAttachedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleAttachClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="min-h-screen w-full bg-[#0A0A0F] text-white overflow-x-hidden relative">
      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        initialPrompt={prompt}
        attachedFiles={attachedFiles}
      />

      {/* Pricing Modal */}
      <PricingModal
        isOpen={showPricingModal}
        onClose={() => setShowPricingModal(false)}
      />

      {/* Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none w-full h-full">
        {/* Grid Pattern */}
        <div className="absolute inset-0 w-full h-full bg-[linear-gradient(rgba(99,102,241,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(99,102,241,0.03)_1px,transparent_1px)] bg-[size:72px_72px] [mask-image:radial-gradient(ellipse_90%_60%_at_50%_50%,black,transparent)]"></div>

        {/* Top Gradient */}
        <div className="absolute top-0 left-0 right-0 w-full h-px bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent"></div>
      </div>

      {/* Header */}
      <header className="relative z-20 border-b border-white/5 backdrop-blur-xl w-full">
        <div className="w-full px-6 sm:px-8 lg:px-12 xl:px-16 2xl:px-24">
          <div className="flex items-center justify-between h-16 max-w-[1600px] mx-auto">
            <div className="flex items-center gap-3">
              <img src="/logo.png" alt="Breakly" className="w-10 h-10 rounded-lg object-cover" />
              <span className="text-2xl font-bold bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent" style={{fontFamily: 'DM Sans, sans-serif'}}>Breakly</span>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowPricingModal(true)}
                className="text-sm font-medium text-white/80 hover:text-white transition-colors px-4 py-2"
              >
                Pricing
              </button>
              <button
                onClick={() => setShowAuthModal(true)}
                className="text-sm font-medium bg-white/10 hover:bg-white/15 border border-white/20 text-white px-4 py-2 rounded-lg transition-all"
              >
                Sign In
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] w-full px-6 sm:px-8 lg:px-12 xl:px-16 2xl:px-24 py-20">
        {/* Hero Heading */}
        <div className="text-center mb-16 w-full max-w-6xl mx-auto">
          <h1 className="text-6xl sm:text-7xl lg:text-8xl font-bold mb-7 leading-[1.1] tracking-tight" style={{fontFamily: 'Space Grotesk, sans-serif'}}>
            <span className="bg-gradient-to-b from-white via-white to-white/70 bg-clip-text text-transparent">
              Build Anything
            </span>
            <br />
            <span className="bg-gradient-to-r from-indigo-400 via-violet-400 to-purple-400 bg-clip-text text-transparent">
              Ship Instantly
            </span>
          </h1>

          <p className="text-xl sm:text-2xl text-white/50 max-w-3xl mx-auto font-normal leading-relaxed">
            Transform your ideas into production-ready applications with AI-powered code generation.
            <br className="hidden sm:block" />
            <span className="text-white/40">No coding required. Just describe what you want to build.</span>
          </p>
        </div>

        {/* Input Section */}
        <div className="w-full max-w-5xl mx-auto mb-20">
          <form onSubmit={handleSubmit} className="relative group">
            {/* Premium Glow Effect */}
            <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 via-violet-500 to-purple-500 rounded-2xl opacity-20 group-hover:opacity-30 blur-xl transition-all duration-500"></div>

            <div className="relative bg-[#0F0F14] backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden hover:border-white/20 transition-all duration-300 shadow-2xl">
              <div className="flex flex-col">
                <div className="flex items-center gap-3 p-5">
                  {/* Left Actions */}
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/50 hover:text-white/90 transition-all duration-200 border border-white/10 hover:border-white/20"
                      title="Add new file"
                    >
                      <Plus className="w-4.5 h-4.5" />
                    </button>

                    <button
                      type="button"
                      onClick={handleAttachClick}
                      className="px-3.5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/50 hover:text-white/90 transition-all duration-200 border border-white/10 hover:border-white/20 flex items-center gap-2 text-sm font-medium"
                      title="Attach files"
                    >
                      <Paperclip className="w-4 h-4" />
                      <span className="hidden sm:inline">Attach</span>
                    </button>
                  </div>

                  {/* Input Field */}
                  <input
                    type="text"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Describe your app idea..."
                    className="flex-1 bg-transparent text-white placeholder-white/30 focus:outline-none text-base px-3 py-2.5 transition-colors font-medium"
                  />

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={!prompt.trim()}
                    className="p-3 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 disabled:from-white/5 disabled:to-white/5 disabled:cursor-not-allowed text-white transition-all duration-200 shadow-lg hover:shadow-indigo-500/30 disabled:shadow-none disabled:text-white/30 group/btn"
                  >
                    <Send className="w-5 h-5 group-hover/btn:translate-x-0.5 transition-transform" />
                  </button>
                </div>

                {/* Attached Files Preview */}
                {attachedFiles.length > 0 && (
                  <div className="border-t border-white/10 px-5 py-3 bg-white/5">
                    <div className="flex flex-wrap gap-2">
                      {attachedFiles.map((file, index) => (
                        <div
                          key={index}
                          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-sm text-indigo-200"
                        >
                          <span className="truncate max-w-xs">{file.name}</span>
                          <button
                            type="button"
                            onClick={() => removeFile(index)}
                            className="ml-1 hover:text-indigo-100 transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              multiple
              onChange={handleFileSelect}
              className="hidden"
              accept="*"
            />

            {/* Hint text */}
            <p className="text-center text-sm text-white/30 mt-5 font-medium">
              Press <kbd className="px-2.5 py-1.5 bg-white/5 rounded-lg border border-white/10 text-white/40 text-xs font-mono mx-1">⌘</kbd> + <kbd className="px-2.5 py-1.5 bg-white/5 rounded-lg border border-white/10 text-white/40 text-xs font-mono mx-1">Enter</kbd> to submit
            </p>
          </form>
        </div>

      </div>
    </div>
  );
}
