import React, { useState } from 'react';
import { X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../lib/supabase';
import toast from 'react-hot-toast';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialPrompt?: string;
  attachedFiles?: File[];
}

/**
 * AuthModal Component
 * Supabase-powered authentication modal
 */
export function AuthModal({ isOpen, onClose, initialPrompt = '', attachedFiles = [] }: AuthModalProps) {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [authMode, setAuthMode] = useState<'signin' | 'signup' | 'magic'>('signin');

  if (!isOpen) return null;

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setError('');

    try {
      const { error } = await auth.signInWithOAuth('google');

      if (error) throw error;

      console.log('✅ Google authentication initiated');
      // OAuth will redirect automatically
    } catch (err: any) {
      console.error('Google login error:', err);
      setError(err.message || 'Google authentication failed');
      setIsLoading(false);
      toast.error('Google authentication failed');
    }
  };


  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim()) {
      setError('Please enter your email');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      if (authMode === 'magic') {
        // Magic link authentication
        const { error } = await auth.signInWithMagicLink(email);

        if (error) throw error;

        toast.success('Check your email for the magic link!');
        console.log('✅ Magic link sent to:', email);
      } else if (authMode === 'signup') {
        // Email/password signup
        if (!password || password.length < 6) {
          setError('Password must be at least 6 characters');
          setIsLoading(false);
          return;
        }

        const { error } = await auth.signUp(email, password);

        if (error) throw error;

        toast.success('Account created! Check your email to verify.');
        console.log('✅ Signup successful for:', email);

        // Auto sign in after signup
        const { error: signInError } = await auth.signIn(email, password);
        if (signInError) throw signInError;

        toast.success('Welcome! 🎉');
        navigate('/generate', { state: { initialPrompt, attachedFiles } });
      } else {
        // Email/password signin
        if (!password) {
          setError('Please enter your password');
          setIsLoading(false);
          return;
        }

        const { error } = await auth.signIn(email, password);

        if (error) throw error;

        toast.success('Welcome back! 🎉');
        console.log('✅ Sign in successful for:', email);
        navigate('/generate', { state: { initialPrompt, attachedFiles } });
      }

      setIsLoading(false);
    } catch (err: any) {
      console.error('Email auth error:', err);
      setError(err.message || 'Authentication failed');
      setIsLoading(false);
      toast.error(err.message || 'Authentication failed');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="relative bg-[#0F0F14] rounded-2xl border border-white/10 p-8 w-full max-w-md shadow-2xl">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 hover:bg-white/5 rounded-lg transition-colors"
        >
          <X className="w-5 h-5 text-white/60" />
        </button>

        {/* Logo */}
        <div className="flex items-center justify-center mb-6">
          <img src="/logo.png" alt="Breakly" className="w-12 h-12 rounded-xl object-cover" />
        </div>

        {/* Heading */}
        <h2 className="text-2xl font-bold text-white text-center mb-2" style={{fontFamily: 'Space Grotesk, sans-serif'}}>
          {authMode === 'signup' ? 'Create Account' : 'Welcome Back'}
        </h2>
        <p className="text-white/50 text-center mb-6">
          {authMode === 'signup' ? 'Sign up to start building' : 'Sign in to continue'}
        </p>

        {/* OAuth Buttons */}
        <div className="space-y-3 mb-4">
          <button
            onClick={handleGoogleLogin}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </button>
        </div>

        {/* Divider */}
        <div className="flex items-center gap-3 mb-4">
          <div className="flex-1 h-px bg-white/10" />
          <span className="text-white/40 text-sm">OR</span>
          <div className="flex-1 h-px bg-white/10" />
        </div>

        {/* Email Form */}
        <form onSubmit={handleEmailAuth} className="space-y-3">
          <input
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setError('');
            }}
            placeholder="Email address"
            disabled={isLoading}
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          />

          {authMode !== 'magic' && (
            <input
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError('');
              }}
              placeholder="Password"
              disabled={isLoading}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            />
          )}

          {error && <p className="text-red-400 text-sm">{error}</p>}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full px-4 py-3 bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 text-white font-semibold rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Please wait...' : authMode === 'magic' ? 'Send Magic Link' : authMode === 'signup' ? 'Create Account' : 'Sign In'}
          </button>
        </form>

        {/* Toggle Auth Mode */}
        <div className="mt-4 text-center space-y-2">
          {authMode === 'signin' ? (
            <>
              <button
                onClick={() => setAuthMode('signup')}
                className="text-sm text-white/60 hover:text-white transition-colors"
              >
                Don't have an account? <span className="text-indigo-400 font-medium">Sign up</span>
              </button>
              <br />
              <button
                onClick={() => setAuthMode('magic')}
                className="text-sm text-white/60 hover:text-white transition-colors"
              >
                Or use <span className="text-indigo-400 font-medium">Magic Link</span>
              </button>
            </>
          ) : authMode === 'signup' ? (
            <>
              <button
                onClick={() => setAuthMode('signin')}
                className="text-sm text-white/60 hover:text-white transition-colors"
              >
                Already have an account? <span className="text-indigo-400 font-medium">Sign in</span>
              </button>
              <br />
              <button
                onClick={() => setAuthMode('magic')}
                className="text-sm text-white/60 hover:text-white transition-colors"
              >
                Or use <span className="text-indigo-400 font-medium">Magic Link</span>
              </button>
            </>
          ) : (
            <button
              onClick={() => setAuthMode('signin')}
              className="text-sm text-white/60 hover:text-white transition-colors"
            >
              Back to <span className="text-indigo-400 font-medium">Sign in</span>
            </button>
          )}
        </div>

        {/* Terms */}
        <p className="text-xs text-white/30 text-center mt-6">
          By continuing, you agree to our{' '}
          <a href="#" className="underline hover:text-white/50">
            Terms
          </a>{' '}
          and{' '}
          <a href="#" className="underline hover:text-white/50">
            Privacy Policy
          </a>
        </p>
      </div>
    </div>
  );
}
