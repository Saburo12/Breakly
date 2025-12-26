import { GeneratedFile } from '../types';

interface GitHubRepo {
  id: number;
  name: string;
  full_name: string;
  private: boolean;
  html_url: string;
  default_branch: string;
}

interface GitHubBranch {
  name: string;
  commit: {
    sha: string;
  };
}

export class GitHubService {
  private accessToken: string;

  constructor(accessToken: string) {
    this.accessToken = accessToken;
  }

  private async fetch(url: string, options: RequestInit = {}) {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Accept': 'application/vnd.github+json',
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'GitHub API request failed');
    }

    return response.json();
  }

  async getUser() {
    return this.fetch('https://api.github.com/user');
  }

  async listRepos(): Promise<GitHubRepo[]> {
    return this.fetch('https://api.github.com/user/repos?sort=updated&per_page=100');
  }

  async listBranches(owner: string, repo: string): Promise<GitHubBranch[]> {
    return this.fetch(`https://api.github.com/repos/${owner}/${repo}/branches`);
  }

  async createRepo(name: string, description: string, isPrivate: boolean): Promise<GitHubRepo> {
    return this.fetch('https://api.github.com/user/repos', {
      method: 'POST',
      body: JSON.stringify({
        name,
        description,
        private: isPrivate,
        auto_init: false,
      }),
    });
  }

  async pushFiles(
    owner: string,
    repo: string,
    branch: string,
    files: GeneratedFile[],
    commitMessage: string
  ): Promise<string> {
    // Get the latest commit SHA for the branch
    let baseTreeSha: string | null = null;
    let parentSha: string | null = null;

    try {
      const refData = await this.fetch(
        `https://api.github.com/repos/${owner}/${repo}/git/refs/heads/${branch}`
      );
      parentSha = refData.object.sha;

      const commitData = await this.fetch(
        `https://api.github.com/repos/${owner}/${repo}/git/commits/${parentSha}`
      );
      baseTreeSha = commitData.tree.sha;
    } catch (error) {
      // Branch doesn't exist, we'll create it
      console.log('Branch does not exist, will create it');
    }

    // Create blobs for each file
    const blobs = await Promise.all(
      files.map(async (file) => {
        const blob = await this.fetch(`https://api.github.com/repos/${owner}/${repo}/git/blobs`, {
          method: 'POST',
          body: JSON.stringify({
            content: file.content,
            encoding: 'utf-8',
          }),
        });
        return {
          path: file.path,
          mode: '100644',
          type: 'blob',
          sha: blob.sha,
        };
      })
    );

    // Create tree
    const tree = await this.fetch(`https://api.github.com/repos/${owner}/${repo}/git/trees`, {
      method: 'POST',
      body: JSON.stringify({
        base_tree: baseTreeSha,
        tree: blobs,
      }),
    });

    // Create commit
    const commit = await this.fetch(`https://api.github.com/repos/${owner}/${repo}/git/commits`, {
      method: 'POST',
      body: JSON.stringify({
        message: commitMessage,
        tree: tree.sha,
        parents: parentSha ? [parentSha] : [],
      }),
    });

    // Update reference
    if (parentSha) {
      await this.fetch(`https://api.github.com/repos/${owner}/${repo}/git/refs/heads/${branch}`, {
        method: 'PATCH',
        body: JSON.stringify({
          sha: commit.sha,
          force: false,
        }),
      });
    } else {
      // Create new branch
      await this.fetch(`https://api.github.com/repos/${owner}/${repo}/git/refs`, {
        method: 'POST',
        body: JSON.stringify({
          ref: `refs/heads/${branch}`,
          sha: commit.sha,
        }),
      });
    }

    return commit.sha;
  }

  // Generate proper React project structure
  static generateProjectStructure(files: GeneratedFile[]): GeneratedFile[] {
    const projectFiles: GeneratedFile[] = [...files];

    // Add package.json if not present
    if (!files.find(f => f.path === 'package.json')) {
      projectFiles.push({
        name: 'package.json',
        path: 'package.json',
        language: 'json',
        content: JSON.stringify({
          name: 'breakly-project',
          version: '0.1.0',
          private: true,
          type: 'module',
          scripts: {
            dev: 'vite',
            build: 'tsc && vite build',
            preview: 'vite preview',
          },
          dependencies: {
            react: '^18.2.0',
            'react-dom': '^18.2.0',
          },
          devDependencies: {
            '@types/react': '^18.2.0',
            '@types/react-dom': '^18.2.0',
            '@vitejs/plugin-react': '^4.0.0',
            typescript: '^5.0.0',
            vite: '^4.4.0',
          },
        }, null, 2),
      });
    }

    // Add README.md if not present
    if (!files.find(f => f.path === 'README.md')) {
      projectFiles.push({
        name: 'README.md',
        path: 'README.md',
        language: 'markdown',
        content: `# BREAKLY Project

This project was generated with [BREAKLY](https://breakly.app).

## Getting Started

\`\`\`bash
npm install
npm run dev
\`\`\`

## Build

\`\`\`bash
npm run build
\`\`\`
`,
      });
    }

    return projectFiles;
  }
}
