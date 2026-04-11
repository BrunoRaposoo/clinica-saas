'use client';

import { useState, useEffect } from 'react';

interface DrillDownModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  fetchData: () => Promise<any>;
  columns: { key: string; label: string }[];
  type: 'charges' | 'appointments' | 'patients' | 'communications' | 'tasks';
}

export function DrillDownModal({ open, onClose, title, fetchData, columns, type }: DrillDownModalProps) {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    if (open) {
      setLoading(true);
      fetchData()
        .then((res) => {
          setData(res.items);
          setTotalPages(res.pagination.totalPages);
        })
        .finally(() => setLoading(false));
    }
  }, [open, page]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[80vh] overflow-hidden">
        <div className="p-4 border-b flex justify-between items-center">
          <h2 className="text-lg font-semibold">{title}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            ✕
          </button>
        </div>
        <div className="p-4 overflow-auto max-h-[60vh]">
          {loading ? (
            <p>Carregando...</p>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  {columns.map((col) => (
                    <th key={col.key} className="text-left p-2">
                      {col.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.map((item, idx) => (
                  <tr key={idx} className="border-b hover:bg-gray-50">
                    {columns.map((col) => (
                      <td key={col.key} className="p-2">
                        {item[col.key]}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        <div className="p-4 border-t flex justify-between">
          <button
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            Anterior
          </button>
          <span>
            Página {page} de {totalPages}
          </span>
          <button
            disabled={page === totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            Próxima
          </button>
        </div>
      </div>
    </div>
  );
}