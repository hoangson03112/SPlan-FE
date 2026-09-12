'use client';

import React from 'react';
import { 
  Calendar, 
  Trash2, 
  Copy, 
  ChevronDown,
} from 'lucide-react';
import { useProject } from '@/app/context/ProjectProvider';
import { Priority } from '@/app/types/types';

export const TableView: React.FC = () => {
  const {
    filteredTasks,
    columns,
    updateTask,
    deleteTask,
    duplicateTask,
    setSelectedTaskId,
    themeMode,
    t,
    language
  } = useProject();

  const handleStatusChange = (taskId: string, newColId: string) => {
    updateTask(taskId, { columnId: newColId });
  };

  const handlePriorityChange = (taskId: string, newPriority: Priority) => {
    updateTask(taskId, { priority: newPriority });
  };

  if (filteredTasks.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-12 text-center text-[#9E9082]">
        <p className="font-editorial text-lg font-semibold text-[#2C2723] dark:text-[#EDE8E1]">{t.noTasksFound}</p>
        <p className="text-xs text-[#8E8378] mt-1 font-sans-ui">Hãy thử điều chỉnh lại bộ lọc hoặc tạo thêm thẻ mới.</p>
      </div>
    );
  }

  return (
    <div className="flex-1 p-4 sm:p-8 overflow-y-auto">
      <div className="max-w-7xl mx-auto rounded-3xl border border-[#E5DFD5] dark:border-[#2C251E] bg-white/90 dark:bg-[#181411]/90 backdrop-blur-md overflow-hidden shadow-[0_4px_24px_-4px_rgba(44,39,35,0.04)]">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs font-sans-ui">
            <thead>
              <tr className="border-b border-[#EAE3D8] dark:border-[#28211A] bg-[#FAF7F2] dark:bg-[#1C1814] text-[#8E8378] dark:text-[#A09386] font-semibold uppercase tracking-wider text-[10px]">
                <th className="py-3.5 px-5 w-1/3">Công việc</th>
                <th className="py-3.5 px-3">Trạng thái</th>
                <th className="py-3.5 px-3">Mức độ</th>
                <th className="py-3.5 px-3">Phụ trách</th>
                <th className="py-3.5 px-3">Nhãn</th>
                <th className="py-3.5 px-3">Hạn chót</th>
                <th className="py-3.5 px-3">Thời lượng</th>
                <th className="py-3.5 px-3 w-1/4">Ghi chú & Chi tiết</th>
                <th className="py-3.5 px-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EFE8DE] dark:divide-[#241E18] text-[#4A4137] dark:text-[#D5CBC1]">
              {filteredTasks.map((task) => {
                return (
                  <tr
                    key={task.id}
                    className="hover:bg-[#FAF7F2] dark:hover:bg-[#201A15] transition-colors group cursor-pointer"
                    onClick={() => setSelectedTaskId(task.id)}
                  >
                    {/* Task Title */}
                    <td className="py-3.5 px-5 font-medium text-[#2C2723] dark:text-[#EDE8E1]">
                      <div className="flex items-center gap-2.5">
                        {task.coverColor && (
                          <div
                            className="w-2 h-2 rounded-full flex-shrink-0 shadow-2xs"
                            style={{ backgroundColor: task.coverColor }}
                          />
                        )}
                        <span className="group-hover:text-[#8C6B4F] dark:group-hover:text-[#D4B89D] transition-colors line-clamp-1">
                          {task.title}
                        </span>
                      </div>
                    </td>

                    {/* Status dropdown */}
                    <td className="py-3 px-3" onClick={(e) => e.stopPropagation()}>
                      <div className="relative inline-block">
                        <select
                          value={task.columnId}
                          onChange={(e) => handleStatusChange(task.id, e.target.value)}
                          className="appearance-none bg-[#F4EFEA] dark:bg-[#221C16] text-[#3D352E] dark:text-[#EDE8E1] font-medium py-1 pl-2.5 pr-6 rounded-xl border border-[#DDD3C3] dark:border-[#382E25] outline-none cursor-pointer text-xs"
                        >
                          {columns.map((col) => (
                            <option key={col.id} value={col.id}>
                              {col.title}
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="w-3 h-3 text-[#9E9082] absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                      </div>
                    </td>

                    {/* Priority dropdown */}
                    <td className="py-3 px-3" onClick={(e) => e.stopPropagation()}>
                      <div className="relative inline-block">
                        <select
                          value={task.priority}
                          onChange={(e) => handlePriorityChange(task.id, e.target.value as Priority)}
                          className="appearance-none bg-[#F4EFEA] dark:bg-[#221C16] text-[#3D352E] dark:text-[#EDE8E1] font-medium py-1 pl-2.5 pr-6 rounded-xl border border-[#DDD3C3] dark:border-[#382E25] outline-none cursor-pointer text-xs capitalize"
                        >
                          <option value="urgent">● {t.urgent}</option>
                          <option value="high">● {t.high}</option>
                          <option value="medium">● {t.medium}</option>
                          <option value="low">● {t.low}</option>
                        </select>
                        <ChevronDown className="w-3 h-3 text-[#9E9082] absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                      </div>
                    </td>

                    {/* Assignees */}
                    <td className="py-3 px-3">
                      <div className="flex items-center -space-x-1.5">
                        {task.assignees.map((assignee) => (
                          <img
                            key={assignee.id}
                            src={assignee.avatar}
                            alt={assignee.name}
                            title={assignee.name}
                            referrerPolicy="no-referrer"
                            className="w-5 h-5 rounded-full ring-2 ring-white dark:ring-[#201B17] object-cover shadow-2xs"
                          />
                        ))}
                      </div>
                    </td>

                    {/* Labels */}
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {task.labels.map((label) => (
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
                      </div>
                    </td>

                    {/* Due Date */}
                    <td className="py-3 px-3 text-[#7A6E62] dark:text-[#A09386] font-mono-data text-[11px]">
                      {task.dueDate ? (
                        <span className="flex items-center gap-1.5">
                          <Calendar className="w-3 h-3 text-[#9E9082]" />
                          {task.dueDate}
                        </span>
                      ) : (
                        <span className="text-[#C5BAAC] dark:text-[#4A3E31]">—</span>
                      )}
                    </td>

                    {/* Estimate */}
                    <td className="py-3 px-3 text-[#7A6E62] dark:text-[#A09386] font-mono-data text-[11px]">
                      {task.estimate || '—'}
                    </td>

                    {/* Notes / Details */}
                    <td className="py-3 px-3 max-w-[240px]">
                      {task.description ? (
                        <span className="text-[11px] text-[#7A6E62] dark:text-[#A09386] line-clamp-1 group-hover:text-[#2C2723] dark:group-hover:text-[#EDE8E1] transition-colors" title={task.description}>
                          {task.description}
                        </span>
                      ) : (
                        <span className="text-[#C5BAAC] dark:text-[#4A3E31]">—</span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => duplicateTask(task.id)}
                          className="p-1 rounded-lg text-[#9E9082] hover:text-[#2C2723] dark:hover:text-[#EDE8E1] hover:bg-[#EDE5D8] dark:hover:bg-[#28211A] transition-colors"
                          title={t.duplicate}
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => deleteTask(task.id)}
                          className="p-1 rounded-lg text-[#9E9082] hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                          title={t.delete}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
