'use client';

import React from 'react';
import { X, Filter, RotateCcw, Check, Users, Tag, Calendar } from 'lucide-react';
import { useProject } from '@/app/context/ProjectProvider';
import { Priority } from '@/app/types/types';

export const FilterDrawer: React.FC = () => {
  const {
    isFilterDrawerOpen,
    setIsFilterDrawerOpen,
    filterOptions,
    setFilterOptions,
    members,
    labels,
    themeMode,
    t,
    language,
  } = useProject();

  if (!isFilterDrawerOpen) return null;

  const togglePriority = (p: Priority) => {
    setFilterOptions((prev) => {
      const exists = prev.priorities.includes(p);
      return {
        ...prev,
        priorities: exists ? prev.priorities.filter((x) => x !== p) : [...prev.priorities, p],
      };
    });
  };

  const toggleAssignee = (id: string) => {
    setFilterOptions((prev) => {
      const exists = prev.assigneeIds.includes(id);
      return {
        ...prev,
        assigneeIds: exists ? prev.assigneeIds.filter((x) => x !== id) : [...prev.assigneeIds, id],
      };
    });
  };

  const toggleLabel = (id: string) => {
    setFilterOptions((prev) => {
      const exists = prev.labelIds.includes(id);
      return {
        ...prev,
        labelIds: exists ? prev.labelIds.filter((x) => x !== id) : [...prev.labelIds, id],
      };
    });
  };

  const handleReset = () => {
    setFilterOptions({
      searchQuery: '',
      priorities: [],
      assigneeIds: [],
      labelIds: [],
      hasDueDateOnly: false,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-[#161311]/50 backdrop-blur-xs transition-opacity"
        onClick={() => setIsFilterDrawerOpen(false)}
      />

      <div className="relative w-full max-w-sm h-full bg-[#FAF8F5] dark:bg-[#181411] border-l border-[#E5DFD5] dark:border-[#2C241D] shadow-2xl flex flex-col z-10 animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="p-5 border-b border-[#EAE3D8] dark:border-[#28211A] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Filter className="w-4 h-4 text-[#8C6B4F]" />
            <h3 className="font-editorial text-base font-bold text-[#2C2723] dark:text-[#EDE8E1]">
              {t.filter}
            </h3>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={handleReset}
              className="p-1.5 rounded-xl text-[#8E8378] hover:text-[#2C2723] dark:hover:text-[#EDE8E1] text-xs flex items-center gap-1 font-sans-ui"
              title={t.clearFilters}
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Đặt lại</span>
            </button>
            <button
              onClick={() => setIsFilterDrawerOpen(false)}
              className="p-1.5 rounded-xl text-[#8E8378] hover:text-[#2C2723] dark:hover:text-[#EDE8E1]"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6 text-xs font-sans-ui">
          {/* Priority filter */}
          <div className="space-y-2">
            <h4 className="font-semibold text-[#7A6E62] dark:text-[#A09386] uppercase tracking-widest text-[10px]">
              {t.priority}
            </h4>
            <div className="grid grid-cols-2 gap-2">
              {(['urgent', 'high', 'medium', 'low'] as Priority[]).map((p) => {
                const isSelected = filterOptions.priorities.includes(p);
                return (
                  <button
                    key={p}
                    onClick={() => togglePriority(p)}
                    className={`flex items-center justify-between p-2.5 rounded-2xl border text-left transition-all ${
                      isSelected
                        ? 'bg-[#EDE5D8] dark:bg-[#28211A] text-[#2C2723] dark:text-[#EDE8E1] border-[#CFC3B0] dark:border-[#423528] font-medium'
                        : 'bg-white dark:bg-[#1E1915] text-[#4A4137] dark:text-[#D5CBC1] border-[#E8E1D5] dark:border-[#2C251E] hover:border-[#8C6B4F]'
                    }`}
                  >
                    <span>{t[p]}</span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-[#8C6B4F]" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Members filter */}
          <div className="space-y-2">
            <h4 className="font-semibold text-[#7A6E62] dark:text-[#A09386] uppercase tracking-widest text-[10px] flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-[#8C6B4F]" />
              <span>{t.members}</span>
            </h4>
            <div className="space-y-1.5">
              {members.map((m) => {
                const isSelected = filterOptions.assigneeIds.includes(m.id);
                return (
                  <button
                    key={m.id}
                    onClick={() => toggleAssignee(m.id)}
                    className={`w-full flex items-center justify-between p-2.5 rounded-2xl border text-left transition-all ${
                      isSelected
                        ? 'bg-[#EDE5D8] dark:bg-[#28211A] text-[#2C2723] dark:text-[#EDE8E1] border-[#CFC3B0] dark:border-[#423528] font-medium'
                        : 'bg-white dark:bg-[#1E1915] text-[#4A4137] dark:text-[#D5CBC1] border-[#E8E1D5] dark:border-[#2C251E] hover:border-[#8C6B4F]'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <img
                        src={m.avatar}
                        alt={m.name}
                        referrerPolicy="no-referrer"
                        className="w-5 h-5 rounded-full object-cover ring-1 ring-[#DDD3C3] dark:ring-[#382E25]"
                      />
                      <span className="truncate">{m.name}</span>
                    </div>
                    {isSelected && <Check className="w-3.5 h-3.5 text-[#8C6B4F]" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Labels filter */}
          <div className="space-y-2">
            <h4 className="font-semibold text-[#7A6E62] dark:text-[#A09386] uppercase tracking-widest text-[10px] flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-[#8C6B4F]" />
              <span>{t.labels}</span>
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {labels.map((lbl) => {
                const isSelected = filterOptions.labelIds.includes(lbl.id);
                return (
                  <button
                    key={lbl.id}
                    onClick={() => toggleLabel(lbl.id)}
                    className={`px-3 py-1 rounded-full text-xs font-medium border transition-all ${
                      isSelected
                        ? 'ring-2 ring-[#8C6B4F] shadow-xs'
                        : 'opacity-70 hover:opacity-100'
                    }`}
                    style={{
                      color: lbl.color,
                      backgroundColor: themeMode === 'dark' ? lbl.bgDark : lbl.bgLight,
                      borderColor: `${lbl.color}40`,
                    }}
                  >
                    {lbl.name}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Due date toggle */}
          <div className="pt-3 border-t border-[#EAE3D8] dark:border-[#28211A]">
            <label className="flex items-center justify-between p-3 rounded-2xl bg-white dark:bg-[#1E1915] border border-[#E8E1D5] dark:border-[#2C251E] cursor-pointer">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[#B47012]" />
                <span className="text-[#3D352E] dark:text-[#EDE8E1] font-medium">
                  Chỉ hiện việc có hạn chót
                </span>
              </div>
              <input
                type="checkbox"
                checked={filterOptions.hasDueDateOnly}
                onChange={(e) =>
                  setFilterOptions((prev) => ({ ...prev, hasDueDateOnly: e.target.checked }))
                }
                className="w-4 h-4 rounded text-[#8C6B4F] accent-[#8C6B4F]"
              />
            </label>
          </div>
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-[#EAE3D8] dark:border-[#28211A]">
          <button
            onClick={() => setIsFilterDrawerOpen(false)}
            className="w-full py-2.5 rounded-2xl bg-[#2C2723] dark:bg-[#EDE8E1] text-[#FAF8F5] dark:text-[#181512] font-semibold text-xs shadow-xs"
          >
            {t.save}
          </button>
        </div>
      </div>
    </div>
  );
};
