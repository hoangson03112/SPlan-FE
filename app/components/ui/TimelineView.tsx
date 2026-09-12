'use client';

import React, { useMemo } from 'react';
import { Calendar } from 'lucide-react';
import { useProject } from '@/app/context/ProjectProvider';
import { Task } from '@/app/types/types';

export const TimelineView: React.FC = () => {
  const { filteredTasks, setSelectedTaskId, t, language } = useProject();

  // Generate 21 continuous days around current period
  const timelineDays = useMemo(() => {
    const days: Date[] = [];
    const baseDate = new Date();
    for (let i = -3; i < 18; i++) {
      const d = new Date(baseDate);
      d.setDate(baseDate.getDate() + i);
      days.push(d);
    }
    return days;
  }, []);

  const todayStr = new Date().toISOString().split('T')[0];

  // Calculate task bar position
  const getTaskBarSpan = (task: Task) => {
    const startDate = task.startDate ? new Date(task.startDate) : new Date(task.createdAt);
    const dueDate = task.dueDate ? new Date(task.dueDate) : new Date(startDate.getTime() + 4 * 24 * 60 * 60 * 1000);

    const firstDay = timelineDays[0];
    const totalDays = timelineDays.length;
    const startDiff = (startDate.getTime() - firstDay.getTime()) / (1000 * 60 * 60 * 24);
    const duration = Math.max(1, (dueDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));

    const leftPercent = Math.max(0, Math.min(100, (startDiff / totalDays) * 100));
    const widthPercent = Math.max(5, Math.min(100 - leftPercent, (duration / totalDays) * 100));

    return { left: `${leftPercent}%`, width: `${widthPercent}%` };
  };

  const getPriorityColor = (priority: Task['priority']) => {
    switch (priority) {
      case 'urgent':
        return 'bg-[#B9382B] text-white shadow-2xs';
      case 'high':
        return 'bg-[#B47012] text-white shadow-2xs';
      case 'medium':
        return 'bg-[#8C6B4F] text-white shadow-2xs';
      case 'low':
        return 'bg-[#7A6E62] text-white shadow-2xs';
    }
  };

  return (
    <div className="flex-1 p-4 sm:p-8 overflow-y-auto">
      <div className="max-w-7xl mx-auto rounded-3xl border border-[#E5DFD5] dark:border-[#2C251E] bg-white/90 dark:bg-[#181411]/90 backdrop-blur-md shadow-[0_4px_24px_-4px_rgba(44,39,35,0.04)] overflow-hidden">
        {/* Header bar */}
        <div className="p-4 sm:p-5 border-b border-[#EAE3D8] dark:border-[#28211A] flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <Calendar className="w-4 h-4 text-[#8C6B4F]" />
            <h3 className="font-editorial text-base sm:text-lg font-bold text-[#2C2723] dark:text-[#EDE8E1]">
              {language === 'vi' ? 'Lộ trình thời gian & Điểm mốc' : 'Project Timeline & Milestones'}
            </h3>
          </div>

          <div className="flex items-center gap-2 text-xs font-sans-ui text-[#7A6E62] dark:text-[#A09386]">
            <span className="w-2 h-2 rounded-full bg-[#8C6B4F] inline-block animate-pulse" />
            <span>Hôm nay</span>
          </div>
        </div>

        {/* Timeline Grid */}
        <div className="overflow-x-auto">
          <div className="min-w-[780px]">
            {/* Days header */}
            <div className="grid grid-cols-[240px_1fr] border-b border-[#EAE3D8] dark:border-[#28211A] bg-[#FAF7F2] dark:bg-[#1C1814] text-xs font-sans-ui">
              <div className="p-3.5 font-semibold text-[#8E8378] dark:text-[#A09386] border-r border-[#EAE3D8] dark:border-[#28211A] uppercase tracking-wider text-[10px]">
                {language === 'vi' ? 'Công việc' : 'Task'}
              </div>

              <div className="flex">
                {timelineDays.map((d, i) => {
                  const dayStr = d.toISOString().split('T')[0];
                  const isToday = dayStr === todayStr;
                  return (
                    <div
                      key={i}
                      className={`flex-1 py-2 text-center border-r border-[#EAE3D8]/60 dark:border-[#28211A]/60 last:border-r-0 ${
                        isToday ? 'bg-[#EDE5D8]/80 dark:bg-[#28211A] font-bold text-[#8C6B4F] dark:text-[#D4B89D]' : 'text-[#8E8378]'
                      }`}
                    >
                      <div className="text-[9px] uppercase tracking-wider">
                        {d.toLocaleDateString(language === 'vi' ? 'vi-VN' : 'en-US', { weekday: 'narrow' })}
                      </div>
                      <div className="text-xs font-mono-data">{d.getDate()}</div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Task Rows */}
            <div className="divide-y divide-[#EFE8DE] dark:divide-[#241E18]">
              {filteredTasks.map((task) => {
                const { left, width } = getTaskBarSpan(task);

                return (
                  <div
                    key={task.id}
                    onClick={() => setSelectedTaskId(task.id)}
                    className="grid grid-cols-[240px_1fr] hover:bg-[#FAF7F2] dark:hover:bg-[#201A15] transition-colors cursor-pointer group"
                  >
                    {/* Task Title & Meta */}
                    <div className="p-3 border-r border-[#EAE3D8] dark:border-[#28211A] flex items-center justify-between gap-2 overflow-hidden">
                      <span className="font-sans-ui text-xs font-medium text-[#2C2723] dark:text-[#EDE8E1] group-hover:text-[#8C6B4F] dark:group-hover:text-[#D4B89D] truncate transition-colors">
                        {task.title}
                      </span>
                      {task.estimate && (
                        <span className="font-mono-data text-[10px] text-[#8E8378] flex-shrink-0">
                          {task.estimate}
                        </span>
                      )}
                    </div>

                    {/* Timeline Canvas Bar */}
                    <div className="relative py-2.5 px-1 flex items-center">
                      {/* Vertical Today Line */}
                      <div
                        className="absolute top-0 bottom-0 border-l border-dashed border-[#8C6B4F]/40 z-10 pointer-events-none"
                        style={{ left: '15%' }}
                      />

                      {/* Task Span Bar */}
                      <div
                        className={`h-7 rounded-xl flex items-center px-2.5 text-xs font-medium transition-all shadow-xs group-hover:shadow-md ${getPriorityColor(
                          task.priority
                        )}`}
                        style={{
                          marginLeft: left,
                          width: width,
                        }}
                      >
                        <span className="truncate text-[11px] select-none font-sans-ui">{task.title}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
