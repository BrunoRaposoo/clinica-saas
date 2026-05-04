'use client';

import { useState, useEffect } from 'react';
import { documentsApi, type Document, type DocumentCategory } from '@/lib/api/documents';

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filter, setFilter] = useState({
    category: '' as DocumentCategory | '',
    type: '',
    search: '',
  });

  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = async () => {
    setLoading(true);
    try {
      const apiFilter = {
        page,
        limit: 20,
        ...(filter.category !== '' && { category: filter.category }),
        ...(filter.type && { type: filter.type }),
        ...(filter.search && { search: filter.search }),
      };
      const response = await documentsApi.list(apiFilter);
      setDocuments(response.items);
      setTotalPages(response.pagination.totalPages);
    } catch (error) {
      console.error('Failed to load documents', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este documento?')) return;
    try {
      await documentsApi.delete(id);
      loadDocuments();
    } catch (error) {
      console.error('Failed to delete document', error);
    }
  };

  const getCategoryBadge = (category: DocumentCategory) => {
    const colors: Record<string, string> = {
      identity: 'bg-blue-100 text-blue-800',
      exams: 'bg-green-100 text-green-800',
      prescriptions: 'bg-purple-100 text-purple-800',
      reports: 'bg-orange-100 text-orange-800',
      administrative: 'bg-gray-100 text-gray-800',
      other: 'bg-pink-100 text-pink-800',
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Documentos</h1>
          <p className="text-muted-foreground">Gerencie arquivos e anexos</p>
        </div>
        <a
          href="/documents/upload"
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
        >
          Novo Documento
        </a>
      </div>

      <div className="flex flex-wrap gap-4">
        <select
          value={filter.category}
          onChange={(e) => setFilter({ ...filter, category: e.target.value as DocumentCategory })}
          className="px-3 py-2 border rounded-md"
        >
          <option value="">Todas as categorias</option>
          <option value="identity">Identidade</option>
          <option value="exams">Exames</option>
          <option value="prescriptions">Receitas</option>
          <option value="reports">Laudos</option>
          <option value="administrative">Administrativo</option>
          <option value="other">Outros</option>
        </select>

        <input
          type="text"
          placeholder="Buscar..."
          value={filter.search}
          onChange={(e) => setFilter({ ...filter, search: e.target.value })}
          className="px-3 py-2 border rounded-md"
        />

        <button
          onClick={loadDocuments}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
        >
          Filtrar
        </button>
      </div>

      {loading ? (
        <div className="text-center py-8">Carregando...</div>
      ) : documents.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          Nenhum documento encontrado
        </div>
      ) : (
        <div className="border rounded-md">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="px-4 py-3 text-left">Nome</th>
                <th className="px-4 py-3 text-left">Categoria</th>
                <th className="px-4 py-3 text-left">Tipo</th>
                <th className="px-4 py-3 text-left">Tamanho</th>
                <th className="px-4 py-3 text-left">Data</th>
                <th className="px-4 py-3 text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {documents.map((doc) => (
                <tr key={doc.id} className="border-b">
                  <td className="px-4 py-3">{doc.name}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs ${getCategoryBadge(doc.category)}`}>
                      {doc.category}
                    </span>
                  </td>
                  <td className="px-4 py-3">{doc.type}</td>
                  <td className="px-4 py-3">{formatFileSize(doc.fileSize)}</td>
                  <td className="px-4 py-3">{formatDate(doc.createdAt)}</td>
                  <td className="px-4 py-3 text-right space-x-2">
                    <a
                      href={`/documents/${doc.id}`}
                      className="text-primary hover:underline"
                    >
                      Ver
                    </a>
                    <button
                      onClick={() => handleDelete(doc.id)}
                      className="text-red-600 hover:underline"
                    >
                      Excluir
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-3 py-1 border rounded-md disabled:opacity-50"
          >
            Anterior
          </button>
          <span className="px-3 py-1">
            Página {page} de {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-3 py-1 border rounded-md disabled:opacity-50"
          >
            Próxima
          </button>
        </div>
      )}
    </div>
  );
}