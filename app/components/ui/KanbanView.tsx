'use client';

import React, { useState } from 'react';
import { Plus, X } from 'lucide-react';
import { useProject } from '@/app/context/ProjectProvider';
import { KanbanColumn } from './KanbanColumn';

export const KanbanView: React.FC = () => {
  const { columns, addColumn, t, language } = useProject();
  const [isAddingColumn, setIsAddingColumn] = useState(false);
  const [newColumnTitle, setNewColumnTitle] = useState('');

  const handleAddColumnSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newColumnTitle.trim()) {
      addColumn(newColumnTitle.trim());
      setNewColumnTitle('');
      setIsAddingColumn(false);
    }
  };

  return (
    <div className="flex-1 overflow-x-auto p-4 sm:p-8 select-none">
      <div className="flex items-stretch gap-5 pb-8 h-[calc(100vh-180px)]">
        {/* Render Columns */}
        {columns.map((column) => (
          <KanbanColumn key={column.id} column={column} />
        ))}

        {/* Add New Column Button / Composer */}
        <div className="w-72 sm:w-80 flex-shrink-0 self-start">
          {isAddingColumn ? (
            <form
              onSubmit={handleAddColumnSubmit}
              className="p-3.5 rounded-3xl bg-white dark:bg-[#1C1814] border border-[#8C6B4F] shadow-xl space-y-2.5 animate-in fade-in zoom-in-95 duration-150"
            >
              <input
                type="text"
                placeholder={language === 'vi' ? 'Tiêu đề cột mới...' : 'New column title...'}
                value={newColumnTitle}
                onChange={(e) => setNewColumnTitle(e.target.value)}
                autoFocus
                className="w-full px-3 py-2 bg-[#FAF7F2] dark:bg-[#14120F] border border-[#E2DAD0] dark:border-[#2C241D] rounded-xl text-xs font-semibold text-[#2C2723] dark:text-[#EDE8E1] placeholder-[#9E9082] outline-none focus:border-[#8C6B4F]"
              />
              <div className="flex items-center gap-2">
                <button
                  type="submit"
                  className="px-3.5 py-1.5 rounded-xl bg-[#2C2723] dark:bg-[#EDE8E1] text-[#FAF8F5] dark:text-[#181512] text-xs font-semibold shadow-xs"
                >
                  {t.newColumn}
                </button>
                <button
                  type="button"
                  onClick={() => setIsAddingColumn(false)}
                  className="p-1.5 rounded-lg text-[#8E8378] hover:text-[#2C2723] dark:hover:text-[#EDE8E1]"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </form>
          ) : (
            <button
              onClick={() => setIsAddingColumn(true)}
              className="w-full flex items-center justify-center gap-2 p-4 rounded-3xl bg-[#FAF7F2]/60 dark:bg-[#181411]/50 hover:bg-[#F2ECE2] dark:hover:bg-[#201A16] text-[#7E7163] dark:text-[#B5AAA0] border border-dashed border-[#DDD3C3] dark:border-[#382E25] text-xs font-semibold transition-all hover:border-[#8C6B4F]"
            >
              <Plus className="w-4 h-4 text-[#8C6B4F]" />
              <span>{t.newColumn}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
