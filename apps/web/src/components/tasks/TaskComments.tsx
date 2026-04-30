'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { tasksApi } from '@/lib/api/tasks';
import { TaskComment } from '@clinica-saas/contracts';
import { useSession } from '@/providers/session-provider';

interface TaskCommentsProps {
  taskId: string;
  comments: TaskComment[];
}

export function TaskComments({ taskId, comments }: TaskCommentsProps) {
  const queryClient = useQueryClient();
  const { user } = useSession();
  const [newComment, setNewComment] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');

  const createMutation = useMutation({
    mutationFn: (content: string) => tasksApi.addComment(taskId, { content }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      setNewComment('');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ commentId, content }: { commentId: string; content: string }) =>
      tasksApi.updateComment(taskId, commentId, { content }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      setEditingId(null);
      setEditContent('');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (commentId: string) => tasksApi.deleteComment(taskId, commentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });

  const handleSubmit = () => {
    if (newComment.trim()) {
      createMutation.mutate(newComment.trim());
    }
  };

  const handleEdit = (comment: TaskComment) => {
    setEditingId(comment.id);
    setEditContent(comment.content);
  };

  const handleSaveEdit = () => {
    if (editContent.trim() && editingId) {
      updateMutation.mutate({ commentId: editingId, content: editContent.trim() });
    }
  };

  const handleDelete = (commentId: string) => {
    if (confirm('Excluir este comentário?')) {
      deleteMutation.mutate(commentId);
    }
  };

  const isOwnComment = (comment: TaskComment) => user?.id === comment.userId;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="bg-pink-50 rounded-lg p-4">
      <h3 className="text-sm font-semibold text-pink-800 mb-3">COMENTÁRIOS ({comments.length})</h3>

      <div className="space-y-3 mb-4">
        {comments.map((comment) => (
          <div key={comment.id} className="bg-white rounded p-3 shadow-sm">
            {editingId === comment.id ? (
              <div className="space-y-2">
                <textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className="w-full px-2 py-1 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-pink-500"
                  rows={2}
                />
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleSaveEdit}
                    className="px-2 py-1 bg-pink-600 text-white text-xs rounded hover:bg-pink-700"
                  >
                    Salvar
                  </button>
                  <button
                    type="button"
                    onClick={() => { setEditingId(null); setEditContent(''); }}
                    className="px-2 py-1 text-gray-600 text-xs rounded hover:bg-gray-100"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex justify-between items-start mb-1">
                  <span className="text-xs font-medium text-gray-700">{comment.user.name}</span>
                  <span className="text-xs text-gray-400">{formatDate(comment.createdAt)}</span>
                </div>
                <p className="text-sm text-gray-600 whitespace-pre-wrap">{comment.content}</p>
                {isOwnComment(comment) && (
                  <div className="flex gap-2 mt-2">
                    <button
                      type="button"
                      onClick={() => handleEdit(comment)}
                      className="text-xs text-gray-500 hover:text-gray-700"
                    >
                      Editar
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(comment.id)}
                      className="text-xs text-red-500 hover:text-red-700"
                    >
                      Excluir
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        ))}
        {comments.length === 0 && (
          <p className="text-sm text-gray-400 italic">Nenhum comentário</p>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-2">
        <input
          type="text"
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Escrever comentário..."
          className="flex-1 px-3 py-2 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-pink-500"
          onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSubmit()}
        />
        <button
          type="button"
          onClick={handleSubmit}
          disabled={!newComment.trim()}
          className="px-4 py-2 bg-pink-600 text-white text-sm rounded hover:bg-pink-700 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
        >
          Enviar
        </button>
      </div>
    </div>
  );
}