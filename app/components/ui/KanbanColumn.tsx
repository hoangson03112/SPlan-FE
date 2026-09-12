'use client';

import React, { useState } from 'react';
import { 
  Plus, 
  MoreHorizontal, 
  Trash2, 
  Edit2, 
  X,
  Palette
} from 'lucide-react';
import { Column } from '@/app/types/types';
import { useProject } from '@/app/context/ProjectProvider';
import { KanbanCard } from './KanbanCard';

interface KanbanColumnProps {
  column: Column;
}

export const KanbanColumn: React.FC<KanbanColumnProps> = ({ column }) => {
  const {
    getTasksByColumn,
    addTask,
    updateColumn,
    deleteColumn,
    moveTask,
    t,
    language
  } = useProject();

  const [isAddingCard, setIsAddingCard] = useState(false);
  const [newCardTitle, setNewCardTitle] = useState('');
  const [isDragOver, setIsDragOver] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [columnTitle, setColumnTitle] = useState(column.title);

  const tasksInColumn = getTasksByColumn(column.id);

  const handleAddCardSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (newCardTitle.trim()) {
      addTask(column.id, newCardTitle.trim());
      setNewCardTitle('');
      setIsAddingCard(false);
    }
  };

  const handleTitleSubmit = () => {
    if (columnTitle.trim()) {
      updateColumn(column.id, { title: columnTitle.trim() });
    }
    setIsEditingTitle(false);
  };

  // Drag & Drop Handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (!isDragOver) setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    try {
      const dataStr = e.dataTransfer.getData('application/json');
      if (!dataStr) return;
      const { taskId } = JSON.parse(dataStr);
      if (taskId) {
        moveTask(taskId, column.id, tasksInColumn.length);
      }
    } catch (err) {
      console.error('Drop error', err);
    }
  };

  const ACCENT_TONES = [
    '#8C6B4F', // Warm bronze
    '#2D6A4F', // Eucalyptus matcha
    '#B47012', // Amber topaz
    '#9C4153', // Dusty ruby
    '#4A6B82', // Lapis slate
    '#685E55', // Smoked taupe
  ];

  return (
    <div
      id={`kanban-column-${column.id}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`w-72 sm:w-80 flex-shrink-0 flex flex-col rounded-3xl border transition-all duration-200 max-h-full ${
        isDragOver
          ? 'bg-[#EFE7DC]/95 dark:bg-[#251E18]/95 border-[#8C6B4F] shadow-lg ring-2 ring-[#8C6B4F]/25'
          : 'bg-[#FAF7F2]/80 dark:bg-[#181411]/80 backdrop-blur-md border-[#E5DFD5]/90 dark:border-[#2C241D]/90 shadow-[0_4px_24px_-4px_rgba(44,39,35,0.04)]'
      }`}
    >
      {/* Column Header */}
      <div className="p-3.5 pb-2.5 flex items-center justify-between gap-2 border-b border-[#EAE3D8]/80 dark:border-[#28211A]/80">
        <div className="flex items-center gap-2.5 flex-1 min-w-0">
          <span
            className="w-2.5 h-2.5 rounded-full flex-shrink-0 shadow-2xs"
            style={{ backgroundColor: column.colorAccent || '#8C6B4F' }}
          />

          {isEditingTitle ? (
            <input
              type="text"
              value={columnTitle}
              onChange={(e) => setColumnTitle(e.target.value)}
              onBlur={handleTitleSubmit}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleTitleSubmit();
                if (e.key === 'Escape') {
                  setColumnTitle(column.title);
                  setIsEditingTitle(false);
                }
              }}
              autoFocus
              className="px-2 py-0.5 bg-white dark:bg-[#221C16] border border-[#8C6B4F] rounded-lg text-xs font-semibold text-[#2C2723] dark:text-[#EDE8E1] outline-none w-full"
            />
          ) : (
            <h2
              onDoubleClick={() => setIsEditingTitle(true)}
              className="font-sans-ui text-xs font-bold tracking-tight text-[#2C2723] dark:text-[#EDE8E1] truncate cursor-pointer hover:text-[#8C6B4F] dark:hover:text-[#D4B89D] transition-colors"
              title="Nhấn đúp để đổi tên cột"
            >
              {column.title}
            </h2>
          )}

          {/* Card Count Pill */}
          <span className="px-2 py-0.5 rounded-full text-[10px] font-mono-data font-semibold bg-[#EDE5D8]/80 dark:bg-[#28211A] text-[#6E6153] dark:text-[#B5AAA0] border border-[#DDD3C3]/50 dark:border-[#382E25]/50">
            {tasksInColumn.length}
          </span>
        </div>

        {/* Header Actions: Quick Add & Options Menu */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => setIsAddingCard(true)}
            className="p-1 rounded-xl text-[#7E7163] hover:text-[#2C2723] dark:hover:text-[#EDE8E1] hover:bg-[#EDE5D8] dark:hover:bg-[#28211A] transition-colors"
            title={t.newCard}
          >
            <Plus className="w-3.5 h-3.5" />
          </button>

          {/* Column Options Menu */}
          <div className="relative">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-1 rounded-xl text-[#7E7163] hover:text-[#2C2723] dark:hover:text-[#EDE8E1] hover:bg-[#EDE5D8] dark:hover:bg-[#28211A] transition-colors"
            >
              <MoreHorizontal className="w-3.5 h-3.5" />
            </button>

            {isMenuOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setIsMenuOpen(false)} />
                <div className="absolute right-0 mt-1 w-44 rounded-2xl bg-[#FAF8F5] dark:bg-[#181411] border border-[#E2DAD0] dark:border-[#2E261F] shadow-xl p-1.5 z-50 space-y-1">
                  <button
                    onClick={() => {
                      setIsEditingTitle(true);
                      setIsMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-left text-xs text-[#4A4137] dark:text-[#D5CBC1] hover:bg-[#EFE9DF] dark:hover:bg-[#241E18]"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>Đổi tên cột</span>
                  </button>

                  <div className="px-2.5 py-1 text-[9px] font-bold text-[#94877A] dark:text-[#8E8377] uppercase tracking-wider">
                    Điểm nhấn màu
                  </div>
                  <div className="flex items-center gap-1.5 px-2.5 pb-1">
                    {ACCENT_TONES.map((c) => (
                      <button
                        key={c}
                        onClick={() => {
                          updateColumn(column.id, { colorAccent: c });
                          setIsMenuOpen(false);
                        }}
                        className="w-4 h-4 rounded-full border border-white dark:border-[#2C2621] hover:scale-125 transition-transform shadow-2xs"
                        style={{ backgroundColor: c }}
                      />
                    ))}
                  </div>

                  <div className="border-t border-[#EAE3D8] dark:border-[#28211A] pt-1">
                    <button
                      onClick={() => {
                        if (window.confirm(`Xác nhận xóa cột "${column.title}" và toàn bộ thẻ bên trong?`)) {
                          deleteColumn(column.id);
                          setIsMenuOpen(false);
                        }
                      }}
                      className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-left text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>{t.delete}</span>
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Cards List Scrollable Area */}
      <div className="flex-1 overflow-y-auto p-2.5 space-y-2.5 min-h-[140px] max-h-[calc(100vh-230px)]">
        {tasksInColumn.map((task, idx) => (
          <KanbanCard key={task.id} task={task} index={idx} />
        ))}

        {tasksInColumn.length === 0 && !isAddingCard && (
          <div className="py-10 text-center border-2 border-dashed border-[#E5DFD5] dark:border-[#2C241D] rounded-2xl text-[#9E9082] text-xs select-none">
            {language === 'vi' ? 'Thả công việc vào đây' : 'Drop cards here'}
          </div>
        )}

        {/* Inline Card Creator Form */}
        {isAddingCard && (
          <form
            onSubmit={handleAddCardSubmit}
            className="p-3 rounded-2xl bg-white dark:bg-[#201B17] border border-[#8C6B4F] shadow-sm space-y-2 animate-in fade-in zoom-in-95 duration-150"
          >
            <textarea
              placeholder={t.cardTitlePlaceholder}
              value={newCardTitle}
              onChange={(e) => setNewCardTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleAddCardSubmit();
                }
                if (e.key === 'Escape') {
                  setIsAddingCard(false);
                  setNewCardTitle('');
                }
              }}
              rows={2}
              autoFocus
              className="w-full bg-transparent text-xs sm:text-sm text-[#2C2723] dark:text-[#EDE8E1] placeholder-[#9E9082] outline-none resize-none leading-relaxed"
            />
            <div className="flex items-center justify-end gap-1.5 pt-1">
              <button
                type="button"
                onClick={() => {
                  setIsAddingCard(false);
                  setNewCardTitle('');
                }}
                className="px-2.5 py-1 rounded-lg text-[#7E7163] hover:text-[#2C2723] dark:hover:text-[#EDE8E1] text-xs"
              >
                {t.cancel}
              </button>
              <button
                type="submit"
                disabled={!newCardTitle.trim()}
                className="px-3 py-1 rounded-xl bg-[#2C2723] dark:bg-[#EDE8E1] text-[#FAF8F5] dark:text-[#1A1613] text-xs font-semibold hover:opacity-90 disabled:opacity-40 transition-opacity"
              >
                {language === 'vi' ? 'Tạo thẻ' : 'Add Card'}
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Column Footer: Quick Add Button */}
      {!isAddingCard && (
        <div className="p-2.5 border-t border-[#EAE3D8]/80 dark:border-[#28211A]/80">
          <button
            onClick={() => setIsAddingCard(true)}
            className="w-full flex items-center justify-center gap-1.5 py-2 rounded-2xl text-xs font-medium text-[#7E7163] dark:text-[#B5AAA0] hover:bg-white dark:hover:bg-[#221C16] hover:text-[#2C2723] dark:hover:text-[#EDE8E1] border border-dashed border-[#DDD3C3] dark:border-[#382E25] transition-all"
          >
            <Plus className="w-3.5 h-3.5 text-[#8C6B4F]" />
            <span>{t.newCard}</span>
          </button>
        </div>
      )}
    </div>
  );
};
