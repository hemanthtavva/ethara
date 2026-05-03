import { Link } from 'react-router-dom';
import { FolderKanban, Users, ListTodo, Calendar } from 'lucide-react';

const ProjectCard = ({ project }) => {
  return (
    <Link
      to={`/projects/${project.id}`}
      className="block p-5 rounded-xl border border-gray-200 bg-white hover:border-indigo-200 hover:shadow-md transition-all group"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600 group-hover:bg-indigo-100 transition-colors">
          <FolderKanban className="h-5 w-5" />
        </div>
      </div>

      <h3 className="font-semibold text-gray-900 text-lg mb-1">{project.name}</h3>
      {project.description && (
        <p className="text-sm text-gray-500 mb-4 line-clamp-2">{project.description}</p>
      )}

      <div className="flex items-center gap-4 text-xs text-gray-500 mt-auto pt-3 border-t border-gray-100">
        <span className="flex items-center gap-1">
          <ListTodo className="h-3.5 w-3.5" />
          {project._count?.tasks ?? project.tasks?.length ?? 0} tasks
        </span>
        <span className="flex items-center gap-1">
          <Users className="h-3.5 w-3.5" />
          {project._count?.members ?? project.members?.length ?? 0} members
        </span>
        <span className="flex items-center gap-1 ml-auto">
          <Calendar className="h-3.5 w-3.5" />
          {new Date(project.createdAt).toLocaleDateString()}
        </span>
      </div>
    </Link>
  );
};

export default ProjectCard;
