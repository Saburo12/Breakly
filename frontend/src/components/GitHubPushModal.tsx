import { useState, useEffect } from 'react';
import { X, Loader2, Github, ChevronDown } from 'lucide-react';
import { GitHubService } from '../services/github';
import { GeneratedFile } from '../types';

interface GitHubPushModalProps {
  isOpen: boolean;
  onClose: () => void;
  files: GeneratedFile[];
  accessToken: string;
  onSuccess: (repoUrl: string) => void;
  onError: (error: string) => void;
}

interface Repo {
  id: number;
  name: string;
  full_name: string;
  html_url: string;
  default_branch: string;
}

interface Branch {
  name: string;
}

export function GitHubPushModal({
  isOpen,
  onClose,
  files,
  accessToken,
  onSuccess,
  onError,
}: GitHubPushModalProps) {
  const [mode, setMode] = useState<'new' | 'existing'>('new');
  const [isLoading, setIsLoading] = useState(false);
  const [isPushing, setIsPushing] = useState(false);

  // New repo fields
  const [repoName, setRepoName] = useState('');
  const [repoDescription, setRepoDescription] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);

  // Existing repo fields
  const [repos, setRepos] = useState<Repo[]>([]);
  const [selectedRepo, setSelectedRepo] = useState<Repo | null>(null);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [selectedBranch, setSelectedBranch] = useState('main');
  const [customBranch, setCustomBranch] = useState('');
  const [isCustomBranch, setIsCustomBranch] = useState(false);

  const [username, setUsername] = useState('');

  useEffect(() => {
    if (isOpen && accessToken) {
      loadUserAndRepos();
    }
  }, [isOpen, accessToken]);

  useEffect(() => {
    if (selectedRepo && mode === 'existing') {
      loadBranches();
    }
  }, [selectedRepo]);

  const loadUserAndRepos = async () => {
    setIsLoading(true);
    try {
      const github = new GitHubService(accessToken);
      const [user, reposList] = await Promise.all([
        github.getUser(),
        github.listRepos(),
      ]);
      setUsername(user.login);
      setRepos(reposList);
      if (reposList.length > 0) {
        setSelectedRepo(reposList[0]);
        setSelectedBranch(reposList[0].default_branch || 'main');
      }
    } catch (error: any) {
      onError(error.message || 'Failed to load GitHub data');
    } finally {
      setIsLoading(false);
    }
  };

  const loadBranches = async () => {
    if (!selectedRepo) return;
    try {
      const github = new GitHubService(accessToken);
      const owner = selectedRepo.full_name.split('/')[0];
      const branchList = await github.listBranches(owner, selectedRepo.name);
      setBranches(branchList);
      setSelectedBranch(selectedRepo.default_branch || 'main');
    } catch (error) {
      console.error('Failed to load branches:', error);
    }
  };

  const handlePush = async () => {
    setIsPushing(true);
    try {
      const github = new GitHubService(accessToken);
      const projectFiles = GitHubService.generateProjectStructure(files);

      let repoUrl: string;
      let owner: string;
      let repoNameToUse: string;
      let branchToUse: string;

      if (mode === 'new') {
        if (!repoName.trim()) {
          onError('Please enter a repository name');
          setIsPushing(false);
          return;
        }
        // Create new repo
        const newRepo = await github.createRepo(
          repoName,
          repoDescription || `Generated with BREAKLY`,
          isPrivate
        );
        repoUrl = newRepo.html_url;
        owner = username;
        repoNameToUse = newRepo.name;
        branchToUse = 'main';

        // Wait for GitHub to finish initializing the repository
        // GitHub needs time to create the initial README commit
        console.log('[GitHub] Waiting for repository initialization...');
        await new Promise(resolve => setTimeout(resolve, 3000)); // 3 second delay
      } else {
        if (!selectedRepo) {
          onError('Please select a repository');
          setIsPushing(false);
          return;
        }
        repoUrl = selectedRepo.html_url;
        owner = selectedRepo.full_name.split('/')[0];
        repoNameToUse = selectedRepo.name;
        branchToUse = isCustomBranch ? customBranch : selectedBranch;

        if (!branchToUse.trim()) {
          onError('Please enter a branch name');
          setIsPushing(false);
          return;
        }
      }

      // Push files with retry logic for new repos
      let pushSuccess = false;
      let lastError: any = null;
      const maxRetries = mode === 'new' ? 3 : 1; // Retry for new repos only

      for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
          console.log(`[GitHub] Push attempt ${attempt}/${maxRetries}...`);
          await github.pushFiles(
            owner,
            repoNameToUse,
            branchToUse,
            projectFiles,
            'Initial commit from BREAKLY'
          );
          pushSuccess = true;
          console.log('[GitHub] ✅ Push successful!');
          break;
        } catch (error: any) {
          lastError = error;
          console.error(`[GitHub] Push attempt ${attempt} failed:`, error.message);

          // If it's a new repo and still initializing, wait and retry
          if (mode === 'new' && attempt < maxRetries &&
              (error.message?.includes('empty') || error.message?.includes('Not Found'))) {
            console.log(`[GitHub] Repository still initializing, waiting ${attempt * 2}s before retry...`);
            await new Promise(resolve => setTimeout(resolve, attempt * 2000)); // Progressive delay
          } else {
            throw error; // Don't retry for other errors
          }
        }
      }

      if (!pushSuccess) {
        throw lastError;
      }

      onSuccess(`${repoUrl}/tree/${branchToUse}`);
      onClose();
    } catch (error: any) {
      console.error('[GitHub] ❌ Final error:', error);
      onError(error.message || 'Failed to push to GitHub');
    } finally {
      setIsPushing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="bg-[#0F0F14] border border-white/10 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center border border-white/10">
              <Github className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Push to GitHub</h2>
              <p className="text-sm text-white/50 mt-0.5">Deploy your generated code</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-white/10 transition-colors text-white/70 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
            </div>
          ) : (
            <>
              {/* Mode Selector */}
              <div className="flex gap-3 mb-6">
                <button
                  onClick={() => setMode('new')}
                  className={`flex-1 px-4 py-3 rounded-lg border transition-all ${
                    mode === 'new'
                      ? 'bg-indigo-500/10 border-indigo-500/50 text-white'
                      : 'bg-white/5 border-white/10 text-white/50 hover:bg-white/10'
                  }`}
                >
                  <div className="font-semibold mb-1">Create New Repo</div>
                  <div className="text-xs opacity-70">Start fresh with a new repository</div>
                </button>
                <button
                  onClick={() => setMode('existing')}
                  className={`flex-1 px-4 py-3 rounded-lg border transition-all ${
                    mode === 'existing'
                      ? 'bg-indigo-500/10 border-indigo-500/50 text-white'
                      : 'bg-white/5 border-white/10 text-white/50 hover:bg-white/10'
                  }`}
                >
                  <div className="font-semibold mb-1">Use Existing Repo</div>
                  <div className="text-xs opacity-70">Push to an existing repository</div>
                </button>
              </div>

              {/* New Repo Form */}
              {mode === 'new' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-white/70 mb-2">
                      Repository Name *
                    </label>
                    <input
                      type="text"
                      value={repoName}
                      onChange={(e) => setRepoName(e.target.value)}
                      placeholder="my-portfolio"
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/30 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white/70 mb-2">
                      Description (optional)
                    </label>
                    <input
                      type="text"
                      value={repoDescription}
                      onChange={(e) => setRepoDescription(e.target.value)}
                      placeholder="My awesome portfolio website"
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/30 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50"
                    />
                  </div>

                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="private"
                      checked={isPrivate}
                      onChange={(e) => setIsPrivate(e.target.checked)}
                      className="w-4 h-4 rounded bg-white/5 border-white/10 text-indigo-500 focus:ring-indigo-500/50"
                    />
                    <label htmlFor="private" className="text-sm text-white/70">
                      Make repository private
                    </label>
                  </div>
                </div>
              )}

              {/* Existing Repo Form */}
              {mode === 'existing' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-white/70 mb-2">
                      Select Repository *
                    </label>
                    <div className="relative">
                      <select
                        value={selectedRepo?.id || ''}
                        onChange={(e) => {
                          const repo = repos.find(r => r.id === parseInt(e.target.value));
                          setSelectedRepo(repo || null);
                        }}
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white appearance-none focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 pr-10"
                      >
                        {repos.map(repo => (
                          <option key={repo.id} value={repo.id} className="bg-[#1a1a1a]">
                            {repo.full_name}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/50 pointer-events-none" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white/70 mb-2">
                      Branch *
                    </label>
                    <div className="space-y-2">
                      <div className="relative">
                        <select
                          value={isCustomBranch ? 'custom' : selectedBranch}
                          onChange={(e) => {
                            if (e.target.value === 'custom') {
                              setIsCustomBranch(true);
                            } else {
                              setIsCustomBranch(false);
                              setSelectedBranch(e.target.value);
                            }
                          }}
                          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white appearance-none focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 pr-10"
                        >
                          {branches.map(branch => (
                            <option key={branch.name} value={branch.name} className="bg-[#1a1a1a]">
                              {branch.name}
                            </option>
                          ))}
                          <option value="custom" className="bg-[#1a1a1a]">Create new branch...</option>
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/50 pointer-events-none" />
                      </div>

                      {isCustomBranch && (
                        <input
                          type="text"
                          value={customBranch}
                          onChange={(e) => setCustomBranch(e.target.value)}
                          placeholder="feature/new-design"
                          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/30 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50"
                        />
                      )}
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-white/10 bg-white/5">
          <p className="text-sm text-white/50">
            {files.length} file{files.length !== 1 ? 's' : ''} will be pushed
          </p>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-white transition-all"
            >
              Cancel
            </button>
            <button
              onClick={handlePush}
              disabled={isPushing || isLoading}
              className="px-6 py-2 rounded-lg bg-indigo-500 hover:bg-indigo-600 disabled:bg-white/10 disabled:cursor-not-allowed text-white transition-all flex items-center gap-2"
            >
              {isPushing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Pushing...
                </>
              ) : (
                <>
                  <Github className="w-4 h-4" />
                  Push to GitHub
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
