'use client';

import React, { useState } from 'react';
import { 
  Calendar, 
  Copy, 
  Trash2, 
  MessageSquare,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { Task, Priority } from '@/app/types/types';
import { useProject } from '@/app/context/ProjectProvider';
import { ISSUE_TYPE_META } from '@/app/lib/issue-type';

interface KanbanCardProps {
  task: Task;
  index: number;
}

export const KanbanCard: React.FC<KanbanCardProps> = ({ task, index }) => {
  const {
    setSelectedTaskId,
    duplicateTask,
    deleteTask,
    moveTask,
    columns,
    themeMode,
    t,
    language
  } = useProject();

  const [isHovered, setIsHovered] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  // Next column for quick advancement
  const currentColumnIndex = columns.findIndex((c) => c.id === task.columnId);
  const nextColumn = currentColumnIndex >= 0 && currentColumnIndex < columns.length - 1 ? columns[currentColumnIndex + 1] : null;

  const handleAdvanceToNextColumn = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (nextColumn) {
      moveTask(task.id, nextColumn.id);
    }
  };

  // Due Date calculation
  const getDueDateStatus = (dateStr?: string) => {
    if (!dateStr) return null;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dueDate = new Date(dateStr);
    dueDate.setHours(0, 0, 0, 0);
    const diffTime = dueDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return { 
        label: 'Quá hạn', 
        color: 'text-[#B9382B] dark:text-[#E87A6E] bg-[#FDF2F0] dark:bg-[#2C1816] border-[#F2D1CC] dark:border-[#522521]' 
      };
    } else if (diffDays === 0) {
      return { 
        label: 'Hôm nay', 
        color: 'text-[#B47012] dark:text-[#E8A749] bg-[#FEF8EC] dark:bg-[#2B2113] border-[#F6E3B8] dark:border-[#503A19]' 
      };
    } else if (diffDays <= 2) {
      return { 
        label: `Còn ${diffDays} ngày`, 
        color: 'text-[#B47012] dark:text-[#E8A749] bg-[#FEF8EC] dark:bg-[#2B2113] border-[#F6E3B8] dark:border-[#503A19]' 
      };
    }
    return {
      label: new Date(dateStr).toLocaleDateString(language === 'vi' ? 'vi-VN' : 'en-US', {
        month: 'short',
        day: 'numeric',
      }),
      color: 'text-[#7A6E62] dark:text-[#B2A596] bg-[#F4EFEA] dark:bg-[#221C17] border-[#E5DDD2] dark:border-[#352C23]',
    };
  };

  const dueDateStatus = getDueDateStatus(task.dueDate);

  // Priority indicator with jewel-like subtlety
  const renderPriorityBadge = (priority: Priority) => {
    switch (priority) {
      case 'urgent':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#FDF2F0] dark:bg-[#2C1816] text-[#B9382B] dark:text-[#E87A6E] border border-[#F2D1CC] dark:border-[#522521]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#B9382B] animate-pulse" />
            {t.urgent}
          </span>
        );
      case 'high':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#FEF8EC] dark:bg-[#2B2113] text-[#B47012] dark:text-[#E8A749] border border-[#F6E3B8] dark:border-[#503A19]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#B47012]" />
            {t.high}
          </span>
        );
      case 'medium':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-[#F1F6F2] dark:bg-[#152319] text-[#2F6D47] dark:text-[#78BE93] border border-[#CCE0D3] dark:border-[#23422F]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#2F6D47]" />
            {t.medium}
          </span>
        );
      case 'low':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-[#F6F2EB] dark:bg-[#241E1A] text-[#716558] dark:text-[#B2A596] border border-[#E3DAD0] dark:border-[#3A312A]">
            {t.low}
          </span>
        );
    }
  };

  // Drag handlers
  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData(
      'application/json',
      JSON.stringify({ taskId: task.id, fromColumnId: task.columnId, index })
    );
    e.dataTransfer.effectAllowed = 'move';
    setIsDragging(true);
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  return (
    <div
      id={`kanban-card-${task.id}`}
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => setSelectedTaskId(task.id)}
      className={`group relative rounded-2xl border bg-white dark:bg-[#201B17] hover:border-[#D6CCBC] dark:hover:border-[#3D332A] cursor-grab active:cursor-grabbing transition-all duration-200 select-none ${
        isDragging
          ? 'opacity-40 scale-95 border-dashed border-[#8C6B4F] shadow-none'
          : 'border-[#E8E2D8] dark:border-[#2C241D] shadow-[0_2px_12px_-2px_rgba(44,39,35,0.04)] hover:shadow-[0_8px_24px_-4px_rgba(44,39,35,0.08)]'
      }`}
    >
      {/* Cover Image or Accent Banner */}
      {task.coverImage ? (
        <div className="h-28 w-full overflow-hidden rounded-t-2xl relative border-b border-[#EFE9DF] dark:border-[#2C241D]">
          <img
            src={task.coverImage}
            alt={task.title}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        </div>
      ) : task.coverColor ? (
        <div
          className="h-1.5 w-full rounded-t-2xl"
          style={{ backgroundColor: task.coverColor }}
        />
      ) : null}

      <div className="p-3.5 space-y-2.5">
        {/* Top: Labels, Priority & Micro Actions */}
        <div className="flex items-center justify-between gap-1.5 flex-wrap">
          <div className="flex items-center gap-1.5 flex-wrap">
            {renderPriorityBadge(task.priority)}
            {task.labels.slice(0, 2).map((label) => (
              <span
                key={label.id}
                className="px-2 py-0.5 rounded-full text-[10px] font-medium border"
                style={{
                  color: label.color,
                  backgroundColor: themeMode === 'dark' ? label.bgDark : label.bgLight,
                  borderColor: `${label.color}40`,
                }}
              >
                {label.name}
              </span>
            ))}
            {task.labels.length > 2 && (
              <span className="text-[10px] text-[#9E9082] font-medium">
                +{task.labels.length - 2}
              </span>
            )}
          </div>

          {/* Quick Actions (Duplicate, Next Stage, Delete) */}
          <div
            className={`flex items-center gap-1 transition-opacity ${
              isHovered ? 'opacity-100' : 'opacity-0'
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            {nextColumn && (
              <button
                onClick={handleAdvanceToNextColumn}
                className="p-1 rounded-lg text-[#8C6B4F] dark:text-[#D4B89D] hover:bg-[#F4EFEA] dark:hover:bg-[#2B231D] transition-colors"
                title={`Chuyển tiếp sang cột: ${nextColumn.title}`}
              >
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
            <button
              onClick={() => duplicateTask(task.id)}
              className="p-1 rounded-lg text-[#9E9082] hover:text-[#2C2723] dark:hover:text-[#EDE8E1] hover:bg-[#F4EFEA] dark:hover:bg-[#2B231D] transition-colors"
              title={t.duplicate}
            >
              <Copy className="w-3 h-3" />
            </button>
            <button
              onClick={() => deleteTask(task.id)}
              className="p-1 rounded-lg text-[#9E9082] hover:text-rose-600 dark:hover:text-rose-400 hover:bg-[#F4EFEA] dark:hover:bg-[#2B231D] transition-colors"
              title={t.delete}
            >
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Issue type + code (Jira-style: "🐞 MKT-42") */}
        <div className="flex items-center gap-1.5 text-[10px] text-[#9E9082]">
          {(() => {
            const meta = ISSUE_TYPE_META[task.issueType];
            const TypeIcon = meta.icon;
            return (
              <TypeIcon
                className="w-3.5 h-3.5 flex-shrink-0"
                style={{ color: meta.color }}
              />
            );
          })()}
          {task.code && <span className="font-mono-data">{task.code}</span>}
        </div>

        {/* Task Title */}
        <h3 className="font-sans-ui text-xs sm:text-sm font-semibold text-[#2C2723] dark:text-[#EDE8E1] leading-snug group-hover:text-[#8C6B4F] dark:group-hover:text-[#D4B89D] transition-colors line-clamp-2">
          {task.title}
        </h3>

        {/* Description Snippet */}
        {task.description && (
          <p className="text-[11px] text-[#7A6F64] dark:text-[#9E9082] line-clamp-3 leading-relaxed">
            {task.description}
          </p>
        )}

        {/* Bottom Metadata: Due Date, Estimate, Comments, Assignees */}
        {(dueDateStatus ||
          task.estimate ||
          task.activities.length > 0 ||
          task.assignees.length > 0) && (
        <div className="pt-2 border-t border-[#EFE8DE]/90 dark:border-[#28211A] flex items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-1.5 flex-wrap">
            {/* Due date */}
            {dueDateStatus && (
              <div
                className={`flex items-center gap-1 text-[10px] font-mono-data px-2 py-0.5 rounded-full border ${dueDateStatus.color}`}
              >
                <Calendar className="w-2.5 h-2.5" />
                <span>{dueDateStatus.label}</span>
              </div>
            )}

            {/* Estimate */}
            {task.estimate && (
              <span
                className="text-[10px] font-mono-data text-[#7A6E62] dark:text-[#9E9082] px-1.5 py-0.5 rounded-md bg-[#F4EFEA] dark:bg-[#221C17] border border-[#E5DDD2] dark:border-[#352C23]"
                title="Thời lượng dự kiến"
              >
                {task.estimate}
              </span>
            )}

            {/* Discussions */}
            {task.activities.length > 0 && (
              <div
                className="flex items-center gap-1 text-[10px] text-[#9E9082]"
                title={`${task.activities.length} thảo luận`}
              >
                <MessageSquare className="w-3 h-3" />
                <span className="font-mono-data">{task.activities.length}</span>
              </div>
            )}
          </div>

          {/* Assignees Avatars with fine rings */}
          <div className="flex items-center -space-x-1.5 overflow-hidden flex-shrink-0">
            {task.assignees.map((assignee) => (
              <img
                key={assignee.id}
                src={assignee.avatar}
                alt={assignee.name}
                title={assignee.name}
                referrerPolicy="no-referrer"
                className="inline-block h-5 w-5 rounded-full ring-2 ring-white dark:ring-[#201B17] object-cover shadow-2xs"
              />
            ))}
          </div>
        </div>
        )}
      </div>
    </div>
  );
};
