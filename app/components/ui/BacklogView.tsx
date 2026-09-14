"use client";

import { Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { useProject } from "@/app/context/ProjectProvider";
import { ISSUE_TYPE_META } from "@/app/lib/issue-type";
import { Priority } from "@/app/types/types";

const PRIORITY_DOT: Record<Priority, string> = {
  urgent: "#B9382B",
  high: "#B47012",
  medium: "#2F6D47",
  low: "#8E8378",
};

/**
 * Jira's classic Backlog: every task in the board, in one flat ranked list
 * (not split into per-status columns like the Kanban board), so triaging
 * priority doesn't require dragging cards between columns first.
 */
export const BacklogView: React.FC = () => {
  const {
    filteredTasks,
    columns,
    updateTask,
    deleteTask,
    setSelectedTaskId,
    addTask,
    t,
  } = useProject();
  const [newTitle, setNewTitle] = useState("");

  const rankedTasks = [...filteredTasks].sort((a, b) => a.order - b.order);

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const title = newTitle.trim();
    if (!title) return;
    const firstColumn = columns[0];
    if (firstColumn) addTask(firstColumn.id, title);
    setNewTitle("");
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-editorial text-lg font-bold text-[#2C2723] dark:text-[#EDE8E1]">
            {t.backlogView}
          </h2>
          <span className="text-xs text-[#8E8378] font-mono-data">
            {rankedTasks.length} {t.issuesCount}
          </span>
        </div>

        <div className="rounded-2xl border border-[#E5DFD5] dark:border-[#2C241D] bg-white/70 dark:bg-[#181411]/70 overflow-hidden">
          {rankedTasks.length === 0 ? (
            <div className="py-14 text-center text-xs text-[#9E9082]">
              {t.backlogEmpty}
            </div>
          ) : (
            <ul className="divide-y divide-[#EFE9E0] dark:divide-[#241F1A]">
              {rankedTasks.map((task) => {
                const typeMeta = ISSUE_TYPE_META[task.issueType];
                const TypeIcon = typeMeta.icon;
                const column = columns.find((c) => c.id === task.columnId);

                return (
                  <li
                    key={task.id}
                    className="flex items-center gap-3 px-4 py-2.5 hover:bg-[#F7F4EE] dark:hover:bg-[#1C1712] transition-colors group"
                  >
                    <TypeIcon
                      className="w-4 h-4 flex-shrink-0"
                      style={{ color: typeMeta.color }}
                    />
                    <span className="text-[11px] font-mono-data text-[#9E9082] w-14 flex-shrink-0">
                      {task.code ?? "—"}
                    </span>

                    <button
                      onClick={() => setSelectedTaskId(task.id)}
                      className="flex-1 min-w-0 text-left text-xs sm:text-sm font-medium text-[#2C2723] dark:text-[#EDE8E1] truncate hover:text-[#8C6B4F] dark:hover:text-[#D4B89D] transition-colors"
                    >
                      {task.title}
                    </button>

                    <span
                      className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                      title={t.priority}
                      style={{ backgroundColor: PRIORITY_DOT[task.priority] }}
                    />

                    <select
                      value={task.columnId}
                      onChange={(e) =>
                        updateTask(task.id, { columnId: e.target.value })
                      }
                      className="text-[11px] rounded-lg border border-[#E5DFD5] dark:border-[#2C241D] bg-transparent px-1.5 py-1 text-[#5C534A] dark:text-[#B5AAA0] outline-none flex-shrink-0 max-w-[110px]"
                    >
                      {columns.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.title}
                        </option>
                      ))}
                    </select>

                    {task.assignees[0] && (
                      <img
                        src={task.assignees[0].avatar}
                        alt={task.assignees[0].name}
                        title={task.assignees[0].name}
                        referrerPolicy="no-referrer"
                        className="w-6 h-6 rounded-full object-cover flex-shrink-0"
                      />
                    )}

                    <button
                      onClick={() => deleteTask(task.id)}
                      className="p-1 rounded-lg text-[#B5AAA0] hover:text-rose-600 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                      title={t.delete}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>

                    {!column && (
                      <span className="text-[10px] text-[#B5AAA0] flex-shrink-0">
                        {t.noColumn}
                      </span>
                    )}
                  </li>
                );
              })}
            </ul>
          )}

          <form
            onSubmit={handleAddSubmit}
            className="flex items-center gap-2 px-4 py-2.5 border-t border-[#EFE9E0] dark:border-[#241F1A]"
          >
            <Plus className="w-4 h-4 text-[#8C6B4F] flex-shrink-0" />
            <input
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder={t.addToBacklogPlaceholder}
              className="flex-1 min-w-0 bg-transparent text-xs sm:text-sm text-[#2C2723] dark:text-[#EDE8E1] placeholder-[#9E9082] outline-none"
            />
          </form>
        </div>
      </div>
    </div>
  );
};
