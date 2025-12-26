import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { Project, GeneratedFile } from '../types';
import { StreamingPreview } from './StreamingPreview';
import { ArrowLeft, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

/**
 * ProjectView Component
 * View and edit a specific project
 */
export function ProjectView() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadProject(parseInt(id));
    }
  }, [id]);

  const loadProject = async (projectId: number) => {
    try {
      setLoading(true);
      const data = await api.projects.get(projectId);
      setProject(data);
    } catch (error) {
      toast.error('Failed to load project');
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveFiles = async (files: GeneratedFile[]) => {
    if (!project) return;

    try {
      await api.generate.saveFiles(project.id, files);
      toast.success(`Saved ${files.length} file(s)`);
    } catch (error) {
      toast.error('Failed to save files');
    }
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary-600 animate-spin" />
      </div>
    );
  }

  if (!project) {
    return null;
  }

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <div className="bg-white border-b px-6 py-4 flex items-center gap-4">
        <button
          onClick={() => navigate('/dashboard')}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-gray-900">{project.name}</h1>
          {project.description && (
            <p className="text-sm text-gray-600">{project.description}</p>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        <StreamingPreview projectId={project.id} onSave={handleSaveFiles} />
      </div>
    </div>
  );
}
