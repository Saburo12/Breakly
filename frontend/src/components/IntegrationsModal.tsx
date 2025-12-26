import React, { useState, useEffect } from 'react';
import { X, Github, Database, FileText, CreditCard, MoreVertical, Check } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface IntegrationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGitHubConnected?: (accessToken: string, username: string) => void;
}

interface Integration {
  id: string;
  name: string;
  icon: React.ReactNode;
  description: string;
  isConnected: boolean;
  username?: string;
}

export function IntegrationsModal({ isOpen, onClose, onGitHubConnected }: IntegrationsModalProps) {
  const [integrations, setIntegrations] = useState<Integration[]>([
    {
      id: 'github',
      name: 'GitHub',
      icon: <Github className="w-6 h-6" />,
      description: 'Connect your GitHub account to deploy and sync repositories',
      isConnected: false,
    },
    {
      id: 'supabase',
      name: 'Supabase',
      icon: <Database className="w-6 h-6" />,
      description: 'Integrate Supabase for backend and database management',
      isConnected: false,
    },
    {
      id: 'notion',
      name: 'Notion',
      icon: <FileText className="w-6 h-6" />,
      description: 'Sync your projects and documentation with Notion',
      isConnected: false,
    },
    {
      id: 'stripe',
      name: 'Stripe',
      icon: <CreditCard className="w-6 h-6" />,
      description: 'Add payment processing to your applications',
      isConnected: false,
    },
  ]);

  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      checkGitHubConnection();
    }
  }, [isOpen]);

  const checkGitHubConnection = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.provider_token && session?.user?.user_metadata?.user_name) {
        setIntegrations(prev =>
          prev.map(integration =>
            integration.id === 'github'
              ? {
                  ...integration,
                  isConnected: true,
                  username: session.user.user_metadata.user_name,
                }
              : integration
          )
        );
      }
    } catch (error) {
      console.error('Error checking GitHub connection:', error);
    }
  };

  const handleConnect = async (id: string) => {
    if (id === 'github') {
      try {
        // Store a flag to know we're connecting GitHub
        localStorage.setItem('github_oauth_initiated', 'true');

        const { error } = await supabase.auth.signInWithOAuth({
          provider: 'github',
          options: {
            redirectTo: `${window.location.origin}/generate`,
            scopes: 'repo user',
          },
        });

        if (error) {
          console.error('GitHub OAuth error:', error);
          alert('Failed to connect GitHub. Please try again.');
        }
      } catch (error) {
        console.error('Error connecting to GitHub:', error);
        alert('Failed to connect GitHub. Please try again.');
      }
    } else {
      // For other integrations, just mark as connected (placeholder)
      setIntegrations(prev =>
        prev.map(integration =>
          integration.id === id
            ? { ...integration, isConnected: true, username: `user_${id}` }
            : integration
        )
      );
    }
  };

  const handleDisconnect = async (id: string) => {
    if (id === 'github') {
      try {
        // Sign out from Supabase (this will clear the GitHub token)
        await supabase.auth.signOut();
        setIntegrations(prev =>
          prev.map(integration =>
            integration.id === id
              ? { ...integration, isConnected: false, username: undefined }
              : integration
          )
        );
      } catch (error) {
        console.error('Error disconnecting GitHub:', error);
      }
    } else {
      setIntegrations(prev =>
        prev.map(integration =>
          integration.id === id
            ? { ...integration, isConnected: false, username: undefined }
            : integration
        )
      );
    }
    setOpenDropdown(null);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/70 backdrop-blur-sm" style={{ zIndex: 9999 }}>
      <div className="bg-[#0F0F14] border border-white/10 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/10">
          <div>
            <h2 className="text-2xl font-bold text-white">Integrations</h2>
            <p className="text-sm text-white/50 mt-1">Connect your favorite tools and services</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-white/10 transition-colors text-white/70 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-100px)]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {integrations.map((integration) => (
              <div
                key={integration.id}
                className="bg-[#1a1a1a] border border-white/10 rounded-xl p-5 hover:border-white/20 transition-all"
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg bg-white/5 flex items-center justify-center text-white border border-white/10">
                      {integration.icon}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white">{integration.name}</h3>
                      {integration.isConnected && (
                        <div className="flex items-center gap-1.5 mt-1">
                          <div className="w-2 h-2 rounded-full bg-green-500"></div>
                          <span className="text-xs font-medium text-green-400">Enabled</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Dropdown Menu (only for connected integrations) */}
                  {integration.isConnected && (
                    <div className="relative">
                      <button
                        onClick={() => setOpenDropdown(openDropdown === integration.id ? null : integration.id)}
                        className="p-1.5 rounded-lg hover:bg-white/10 transition-colors text-white/70 hover:text-white"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>

                      {openDropdown === integration.id && (
                        <>
                          {/* Backdrop to close dropdown */}
                          <div
                            className="fixed inset-0 z-10"
                            onClick={() => setOpenDropdown(null)}
                          ></div>

                          {/* Dropdown Menu */}
                          <div className="absolute right-0 top-8 z-20 bg-[#2a2a2a] border border-white/20 rounded-lg shadow-xl min-w-[160px] py-1">
                            <button
                              onClick={() => handleDisconnect(integration.id)}
                              className="w-full px-4 py-2 text-left text-sm text-red-400 hover:bg-white/10 transition-colors"
                            >
                              Disconnect
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </div>

                {/* Description */}
                <p className="text-sm text-white/50 mb-4">{integration.description}</p>

                {/* Action Button */}
                {integration.isConnected ? (
                  <div className="flex items-center gap-2 px-3 py-2 bg-white/5 border border-white/10 rounded-lg">
                    <Check className="w-4 h-4 text-green-400" />
                    <span className="text-sm text-white/70">
                      Connected as <span className="text-white font-medium">@{integration.username}</span>
                    </span>
                  </div>
                ) : (
                  <button
                    onClick={() => handleConnect(integration.id)}
                    className="w-full px-4 py-2 bg-white/10 hover:bg-white/15 border border-white/20 hover:border-white/30 text-white rounded-lg transition-all text-sm font-medium"
                  >
                    Connect
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
