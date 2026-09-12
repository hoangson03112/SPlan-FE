'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { 
  Search, 
  Kanban, 
  ListTodo, 
  CalendarClock, 
  BarChart3, 
  Plus, 
  ArrowRight,
  Sun,
  Moon,
  X,
  Maximize2
} from 'lucide-react';
import { useProject } from '@/app/context/ProjectProvider';

export const CommandPalette: React.FC = () => {
  const {
    isCommandPaletteOpen,
    setIsCommandPaletteOpen,
    tasks,
    activeBoard,
    setViewMode,
    setSelectedTaskId,
    columns,
    addTask,
    toggleThemeMode,
    themeMode,
    toggleZenMode,
    zenMode,
    t,
    language,
  } = useProject();

  const [query, setQuery] = useState('');

  // Filter tasks based on query
  const searchResults = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return tasks
      .filter((task) => task.boardId === activeBoard.id)
      .filter(
        (task) =>
          task.title.toLowerCase().includes(q) ||
          task.description.toLowerCase().includes(q) ||
          task.labels.some((l) => l.name.toLowerCase().includes(q))
      )
      .slice(0, 5);
  }, [query, tasks, activeBoard.id]);

  // Actions list
  const actions = useMemo(() => {
    const defaultActions = [
      {
        id: 'view-kanban',
        title: `${language === 'vi' ? 'Chuyển sang' : 'Switch view'}: ${t.kanbanView}`,
        icon: Kanban,
        run: () => setViewMode('kanban'),
      },
      {
        id: 'view-table',
        title: `${language === 'vi' ? 'Chuyển sang' : 'Switch view'}: ${t.tableView}`,
        icon: ListTodo,
        run: () => setViewMode('table'),
      },
      {
        id: 'view-timeline',
        title: `${language === 'vi' ? 'Chuyển sang' : 'Switch view'}: ${t.timelineView}`,
        icon: CalendarClock,
        run: () => setViewMode('timeline'),
      },
      {
        id: 'view-analytics',
        title: `${language === 'vi' ? 'Chuyển sang' : 'Switch view'}: ${t.analyticsView}`,
        icon: BarChart3,
        run: () => setViewMode('analytics'),
      },
      {
        id: 'toggle-zen',
        title: zenMode ? 'Tắt Chế độ Tập trung (Zen Mode)' : 'Bật Chế độ Tập trung (Zen Mode)',
        icon: Maximize2,
        run: () => toggleZenMode(),
      },
      {
        id: 'toggle-theme',
        title: themeMode === 'light' ? 'Chuyển sang Giao diện Tối' : 'Chuyển sang Giao diện Sáng',
        icon: themeMode === 'light' ? Moon : Sun,
        run: () => toggleThemeMode(),
      },
      {
        id: 'add-task',
        title: language === 'vi' ? 'Khởi tạo công việc mới' : 'Create new task',
        icon: Plus,
        run: () => {
          if (columns.length > 0) {
            addTask(columns[0].id, language === 'vi' ? 'Công việc mới từ Lệnh nhanh' : 'New task from Cmd+K');
          }
        },
      },
    ];

    if (!query.trim()) return defaultActions;

    return defaultActions.filter((a) =>
      a.title.toLowerCase().includes(query.toLowerCase())
    );
  }, [query, language, t, setViewMode, columns, addTask, themeMode, toggleThemeMode, zenMode, toggleZenMode]);

  // Global shortcut handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen(!isCommandPaletteOpen);
      }
      if (e.key === 'Escape' && isCommandPaletteOpen) {
        setIsCommandPaletteOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isCommandPaletteOpen, setIsCommandPaletteOpen]);

  if (!isCommandPaletteOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-28 px-4">
      {/* Soft dark veil */}
      <div
        className="fixed inset-0 bg-[#161311]/50 backdrop-blur-xs transition-opacity"
        onClick={() => setIsCommandPaletteOpen(false)}
      />

      <div className="relative w-full max-w-xl rounded-3xl bg-[#FAF8F5] dark:bg-[#181411] border border-[#E5DFD5] dark:border-[#2C241D] shadow-2xl overflow-hidden z-10 animate-in zoom-in-95 duration-150">
        {/* Search input bar */}
        <div className="p-4 border-b border-[#EAE3D8] dark:border-[#28211A] flex items-center gap-3">
          <Search className="w-4 h-4 text-[#8C6B4F]" />
          <input
            type="text"
            placeholder={language === 'vi' ? 'Tìm công việc, chuyển chế độ xem, phím tắt...' : t.searchPlaceholder}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
            className="flex-1 bg-transparent text-sm font-medium text-[#2C2723] dark:text-[#EDE8E1] placeholder-[#9E9082] outline-none font-sans-ui"
          />
          <button
            onClick={() => setIsCommandPaletteOpen(false)}
            className="p-1 rounded-lg text-[#8E8378] hover:text-[#2C2723] dark:hover:text-[#EDE8E1]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results List */}
        <div className="max-h-80 overflow-y-auto p-2.5 space-y-1 text-xs font-sans-ui">
          {/* Tasks matches */}
          {searchResults.length > 0 && (
            <div className="mb-2">
              <div className="px-3 py-1.5 text-[10px] font-bold text-[#8E8378] dark:text-[#A09386] uppercase tracking-widest">
                {language === 'vi' ? 'Công việc khớp' : 'Matching Tasks'}
              </div>
              {searchResults.map((task) => (
                <button
                  key={task.id}
                  onClick={() => {
                    setSelectedTaskId(task.id);
                    setIsCommandPaletteOpen(false);
                  }}
                  className="w-full flex items-center justify-between p-2.5 rounded-2xl hover:bg-[#F2ECE3] dark:hover:bg-[#201A15] text-left transition-colors group"
                >
                  <div className="truncate">
                    <div className="font-semibold text-[#2C2723] dark:text-[#EDE8E1] group-hover:text-[#8C6B4F] dark:group-hover:text-[#D4B89D] truncate">
                      {task.title}
                    </div>
                    {task.description && (
                      <div className="text-[11px] text-[#9E9082] truncate">
                        {task.description}
                      </div>
                    )}
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-[#9E9082] group-hover:text-[#8C6B4F] flex-shrink-0" />
                </button>
              ))}
            </div>
          )}

          {/* Actions matches */}
          <div>
            <div className="px-3 py-1.5 text-[10px] font-bold text-[#8E8378] dark:text-[#A09386] uppercase tracking-widest">
              {language === 'vi' ? 'Thao tác điều hướng' : 'Quick Actions'}
            </div>
            {actions.map((act) => {
              const Icon = act.icon;
              return (
                <button
                  key={act.id}
                  onClick={() => {
                    act.run();
                    setIsCommandPaletteOpen(false);
                  }}
                  className="w-full flex items-center gap-3 p-2.5 rounded-2xl hover:bg-[#F2ECE3] dark:hover:bg-[#201A15] text-left text-[#4A4137] dark:text-[#D5CBC1] hover:text-[#2C2723] dark:hover:text-[#EDE8E1] transition-colors"
                >
                  <div className="w-6 h-6 rounded-lg bg-[#EFE8DE] dark:bg-[#251E18] flex items-center justify-center text-[#8C6B4F] dark:text-[#D4B89D] flex-shrink-0">
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <span className="font-medium truncate">{act.title}</span>
                </button>
              );
            })}
          </div>

          {searchResults.length === 0 && actions.length === 0 && (
            <div className="py-8 text-center text-[#9E9082] text-xs font-sans-ui">
              Không tìm thấy thao tác hoặc thẻ tương ứng
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
