'use client';

import React, { useState } from 'react';
import { 
  X, 
  Trash2, 
  Copy, 
  Calendar, 
  MessageSquare, 
  Send, 
  Tag, 
  Users, 
  Clock, 
  ChevronDown,
  ListOrdered,
  List,
  CheckCircle2,
  FileText
} from 'lucide-react';
import { useProject } from '@/app/context/ProjectProvider';
import { IssueType, Label, Member, Priority } from '@/app/types/types';
import { ISSUE_TYPE_META, ISSUE_TYPES } from '@/app/lib/issue-type';

export const TaskDetailModal: React.FC = () => {
  const { selectedTask } = useProject();

  if (!selectedTask) return null;

  // Remount when the selected task changes so local input state
  // (title/description/estimate) always starts from the right task.
  return <TaskDetailModalContent key={selectedTask.id} />;
};

const TaskDetailModalContent: React.FC = () => {
  const {
    selectedTask,
    setSelectedTaskId,
    updateTask,
    deleteTask,
    duplicateTask,
    columns,
    members,
    labels,
    fields,
    addComment,
    themeMode,
    t,
    language,
  } = useProject();

  const task = selectedTask!;

  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description);
  const [estimate, setEstimate] = useState(task.estimate || '');
  const [commentText, setCommentText] = useState('');
  const [isLabelMenuOpen, setIsLabelMenuOpen] = useState(false);
  const [isAssigneeMenuOpen, setIsAssigneeMenuOpen] = useState(false);

  const handleTitleBlur = () => {
    if (title.trim() && title !== task.title) {
      updateTask(task.id, { title: title.trim() });
    }
  };

  const handleDescriptionBlur = () => {
    if (description !== task.description) {
      updateTask(task.id, { description });
    }
  };

  const handleEstimateBlur = () => {
    if (estimate !== task.estimate) {
      updateTask(task.id, { estimate: estimate.trim() });
    }
  };

  const insertFormatIntoDescription = (prefix: string) => {
    setDescription((prev) => {
      const trimmed = prev ? prev.trimEnd() : '';
      const separator = trimmed ? '\n' : '';
      const updated = `${trimmed}${separator}${prefix}`;
      updateTask(task.id, { description: updated });
      return updated;
    });
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (commentText.trim()) {
      addComment(task.id, commentText.trim());
      setCommentText('');
    }
  };

  const toggleAssignee = (member: Member) => {
    const exists = task.assignees.some((a) => a.id === member.id);
    const updated = exists
      ? task.assignees.filter((a) => a.id !== member.id)
      : [...task.assignees, member];
    updateTask(task.id, { assignees: updated });
  };

  const toggleLabel = (label: Label) => {
    const exists = task.labels.some((l) => l.id === label.id);
    const updated = exists
      ? task.labels.filter((l) => l.id !== label.id)
      : [...task.labels, label];
    updateTask(task.id, { labels: updated });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-[#161311]/60 backdrop-blur-sm transition-opacity"
        onClick={() => setSelectedTaskId(null)}
      />

      <div className="relative w-full max-w-3xl rounded-3xl bg-[#FAF8F5] dark:bg-[#181411] border border-[#E5DFD5] dark:border-[#2C241D] shadow-2xl flex flex-col max-h-[90vh] overflow-hidden z-10 animate-in zoom-in-95 duration-150">
        {/* Cover Photo or Cover Color */}
        {task.coverImage ? (
          <div className="h-44 sm:h-52 w-full relative overflow-hidden flex-shrink-0">
            <img
              src={task.coverImage}
              alt={task.title}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
            <button
              onClick={() => updateTask(task.id, { coverImage: undefined })}
              className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-[#181411]/70 hover:bg-[#181411]/90 text-white text-xs backdrop-blur-md transition-colors font-sans-ui"
            >
              Gỡ ảnh bìa
            </button>
          </div>
        ) : task.coverColor ? (
          <div
            className="h-3 w-full flex-shrink-0"
            style={{ backgroundColor: task.coverColor }}
          />
        ) : null}

        {/* Modal Header */}
        <div className="p-4 sm:p-6 pb-3 border-b border-[#EAE3D8] dark:border-[#28211A] flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 flex-wrap">
            {/* Issue type selector + code */}
            <div className="relative">
              <select
                value={task.issueType}
                onChange={(e) =>
                  updateTask(task.id, { issueType: e.target.value as IssueType })
                }
                className="appearance-none pl-7 pr-7 py-1.5 rounded-xl text-xs font-semibold bg-[#EFE9DF] dark:bg-[#251E18] text-[#3D352E] dark:text-[#EDE8E1] border border-[#DDD3C3] dark:border-[#382E25] outline-none cursor-pointer hover:border-[#8C6B4F]"
              >
                {ISSUE_TYPES.map((it) => (
                  <option key={it} value={it}>
                    {language === "vi" ? ISSUE_TYPE_META[it].label : ISSUE_TYPE_META[it].labelEn}
                  </option>
                ))}
              </select>
              {(() => {
                const TypeIcon = ISSUE_TYPE_META[task.issueType].icon;
                return (
                  <TypeIcon
                    className="w-3.5 h-3.5 absolute left-2.5 top-2 pointer-events-none"
                    style={{ color: ISSUE_TYPE_META[task.issueType].color }}
                  />
                );
              })()}
              <ChevronDown className="w-3.5 h-3.5 text-[#8E8378] absolute right-2 top-2.5 pointer-events-none" />
            </div>

            {task.code && (
              <span className="text-xs font-mono-data text-[#9E9082]">
                {task.code}
              </span>
            )}

            {/* Column badge */}
            <div className="relative">
              <select
                value={task.columnId}
                onChange={(e) => updateTask(task.id, { columnId: e.target.value })}
                className="appearance-none pl-3 pr-7 py-1.5 rounded-xl text-xs font-semibold bg-[#EFE9DF] dark:bg-[#251E18] text-[#3D352E] dark:text-[#EDE8E1] border border-[#DDD3C3] dark:border-[#382E25] outline-none cursor-pointer hover:border-[#8C6B4F]"
              >
                {columns.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.title}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-[#8E8378] absolute right-2 top-2.5 pointer-events-none" />
            </div>

            {/* Priority Selector */}
            <div className="relative">
              <select
                value={task.priority}
                onChange={(e) => updateTask(task.id, { priority: e.target.value as Priority })}
                className="appearance-none pl-3 pr-7 py-1.5 rounded-xl text-xs font-semibold bg-[#EFE9DF] dark:bg-[#251E18] text-[#3D352E] dark:text-[#EDE8E1] border border-[#DDD3C3] dark:border-[#382E25] outline-none cursor-pointer hover:border-[#8C6B4F]"
              >
                <option value="urgent">● {t.urgent}</option>
                <option value="high">● {t.high}</option>
                <option value="medium">● {t.medium}</option>
                <option value="low">● {t.low}</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-[#8E8378] absolute right-2 top-2.5 pointer-events-none" />
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-1 sm:gap-2">
            <button
              onClick={() => {
                duplicateTask(task.id);
                setSelectedTaskId(null);
              }}
              className="p-1.5 rounded-xl text-[#7E7163] hover:text-[#2C2723] dark:hover:text-[#EDE8E1] hover:bg-[#EFE9DF] dark:hover:bg-[#251E18]"
              title={t.duplicate}
            >
              <Copy className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                if (window.confirm('Bạn có chắc chắn muốn xóa công việc này?')) {
                  deleteTask(task.id);
                }
              }}
              className="p-1.5 rounded-xl text-[#7E7163] hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30"
              title={t.delete}
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <div className="h-4 w-px bg-[#EAE3D8] dark:bg-[#28211A]" />
            <button
              onClick={() => setSelectedTaskId(null)}
              className="p-1.5 rounded-xl text-[#7E7163] hover:text-[#2C2723] dark:hover:text-[#EDE8E1] hover:bg-[#EFE9DF] dark:hover:bg-[#251E18]"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-7 space-y-6">
          {/* Title Editor */}
          <div>
            <textarea
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={handleTitleBlur}
              rows={2}
              className="w-full bg-transparent font-editorial text-xl sm:text-2xl font-bold text-[#2C2723] dark:text-[#EDE8E1] outline-none resize-none border-b border-transparent focus:border-[#8C6B4F] transition-colors leading-snug placeholder-[#9E9082]"
              placeholder={t.cardTitlePlaceholder}
            />
          </div>

          {/* Properties Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3.5 p-4 rounded-2xl bg-[#FAF6F0] dark:bg-[#1E1915] border border-[#E8E1D5] dark:border-[#2F2720] text-xs font-sans-ui">
            {/* Assignees */}
            <div className="space-y-1">
              <span className="text-[10px] font-semibold text-[#8E8378] dark:text-[#A09386] uppercase tracking-wider flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-[#8C6B4F]" />
                {t.members}
              </span>
              <div className="flex items-center gap-1 flex-wrap">
                {task.assignees.map((a) => (
                  <img
                    key={a.id}
                    src={a.avatar}
                    alt={a.name}
                    title={a.name}
                    referrerPolicy="no-referrer"
                    className="w-6 h-6 rounded-full object-cover ring-2 ring-white dark:ring-[#1E1915]"
                  />
                ))}
                <div className="relative">
                  <button
                    onClick={() => setIsAssigneeMenuOpen((p) => !p)}
                    className="w-6 h-6 rounded-full bg-[#EDE5D8] dark:bg-[#2B231D] hover:bg-[#E2D8C8] dark:hover:bg-[#382E25] flex items-center justify-center text-[#4A4137] dark:text-[#D5CBC1] text-xs font-bold"
                    title="Thêm phụ trách"
                  >
                    +
                  </button>
                  {isAssigneeMenuOpen && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setIsAssigneeMenuOpen(false)} />
                      <div className="absolute left-0 mt-1.5 w-52 rounded-2xl bg-[#FAF8F5] dark:bg-[#181411] border border-[#E2DAD0] dark:border-[#2C241D] shadow-2xl p-1.5 z-50 space-y-0.5">
                        {members.map((m) => {
                          const assigned = task.assignees.some((a) => a.id === m.id);
                          return (
                            <button
                              key={m.id}
                              onClick={() => toggleAssignee(m)}
                              className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-left text-xs ${
                                assigned
                                  ? 'bg-[#EDE5D8] dark:bg-[#28211A] text-[#2C2723] dark:text-[#EDE8E1] font-medium'
                                  : 'text-[#4A4137] dark:text-[#D5CBC1] hover:bg-[#F2ECE3] dark:hover:bg-[#201A15]'
                              }`}
                            >
                              <img src={m.avatar} className="w-5 h-5 rounded-full object-cover" />
                              <span className="truncate">{m.name}</span>
                              {assigned && <span className="ml-auto text-[#8C6B4F]">✓</span>}
                            </button>
                          );
                        })}
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Labels */}
            <div className="space-y-1">
              <span className="text-[10px] font-semibold text-[#8E8378] dark:text-[#A09386] uppercase tracking-wider flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-[#8C6B4F]" />
                {t.labels}
              </span>
              <div className="flex items-center gap-1.5 flex-wrap">
                {task.labels.map((l) => (
                  <span
                    key={l.id}
                    className="px-2 py-0.5 rounded-full text-[10px] font-medium border"
                    style={{
                      color: l.color,
                      backgroundColor: themeMode === 'dark' ? l.bgDark : l.bgLight,
                      borderColor: `${l.color}40`,
                    }}
                  >
                    {l.name}
                  </span>
                ))}
                <div className="relative">
                  <button
                    onClick={() => setIsLabelMenuOpen((p) => !p)}
                    className="px-2 py-0.5 rounded-full bg-[#EDE5D8] dark:bg-[#2B231D] hover:bg-[#E2D8C8] text-[#4A4137] dark:text-[#D5CBC1] text-[10px] font-bold"
                  >
                    +
                  </button>
                  {isLabelMenuOpen && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setIsLabelMenuOpen(false)} />
                      <div className="absolute left-0 mt-1.5 w-48 rounded-2xl bg-[#FAF8F5] dark:bg-[#181411] border border-[#E2DAD0] dark:border-[#2C241D] shadow-2xl p-1.5 z-50 space-y-0.5">
                        {labels.map((lbl) => {
                          const active = task.labels.some((l) => l.id === lbl.id);
                          return (
                            <button
                              key={lbl.id}
                              onClick={() => toggleLabel(lbl)}
                              className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-left text-xs ${
                                active
                                  ? 'bg-[#EDE5D8] dark:bg-[#28211A] text-[#2C2723] dark:text-[#EDE8E1] font-medium'
                                  : 'text-[#4A4137] dark:text-[#D5CBC1] hover:bg-[#F2ECE3] dark:hover:bg-[#201A15]'
                              }`}
                            >
                              <span style={{ color: lbl.color }}>● {lbl.name}</span>
                              {active && <span className="text-[#8C6B4F]">✓</span>}
                            </button>
                          );
                        })}
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Due Date */}
            <div className="space-y-1">
              <span className="text-[10px] font-semibold text-[#8E8378] dark:text-[#A09386] uppercase tracking-wider flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-[#B47012]" />
                {t.dueDate}
              </span>
              <input
                type="date"
                value={task.dueDate || ''}
                onChange={(e) => updateTask(task.id, { dueDate: e.target.value })}
                className="w-full bg-white dark:bg-[#221C16] border border-[#DDD3C3] dark:border-[#382E25] rounded-xl px-2.5 py-1 text-xs text-[#2C2723] dark:text-[#EDE8E1] outline-none focus:border-[#8C6B4F]"
              />
            </div>

            {/* Estimate */}
            <div className="space-y-1">
              <span className="text-[10px] font-semibold text-[#8E8378] dark:text-[#A09386] uppercase tracking-wider flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-[#2D6A4F]" />
                Thời lượng / Quy mô
              </span>
              <input
                type="text"
                value={estimate}
                onChange={(e) => setEstimate(e.target.value)}
                onBlur={handleEstimateBlur}
                placeholder="VD: 3 ngày, 2 giờ..."
                className="w-full bg-white dark:bg-[#221C16] border border-[#DDD3C3] dark:border-[#382E25] rounded-xl px-2.5 py-1 text-xs text-[#2C2723] dark:text-[#EDE8E1] outline-none focus:border-[#8C6B4F]"
              />
            </div>
          </div>

          {/* Custom Fields (per-board field definitions) */}
          {fields.filter((f) => !f.isHidden).length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3.5 p-4 rounded-2xl bg-[#FAF6F0] dark:bg-[#1E1915] border border-[#E8E1D5] dark:border-[#2F2720] text-xs font-sans-ui">
              {fields
                .filter((f) => !f.isHidden)
                .map((field) => {
                  const options = Array.isArray(
                    (field.config as { options?: string[] })?.options,
                  )
                    ? ((field.config as { options?: string[] }).options ?? [])
                    : [];
                  const value = task.customFields[field.id];
                  const setValue = (v: unknown) =>
                    updateTask(task.id, {
                      customFields: { ...task.customFields, [field.id]: v },
                    });

                  return (
                    <div key={field.id} className="space-y-1">
                      <span className="text-[10px] font-semibold text-[#8E8378] dark:text-[#A09386] uppercase tracking-wider truncate block">
                        {field.name}
                      </span>
                      {field.type === 'TEXT' && (
                        <input
                          type="text"
                          value={(value as string) ?? ''}
                          onChange={(e) => setValue(e.target.value)}
                          className="w-full bg-white dark:bg-[#221C16] border border-[#DDD3C3] dark:border-[#382E25] rounded-xl px-2.5 py-1 text-xs text-[#2C2723] dark:text-[#EDE8E1] outline-none focus:border-[#8C6B4F]"
                        />
                      )}
                      {field.type === 'NUMBER' && (
                        <input
                          type="number"
                          value={(value as number) ?? ''}
                          onChange={(e) =>
                            setValue(e.target.value === '' ? '' : Number(e.target.value))
                          }
                          className="w-full bg-white dark:bg-[#221C16] border border-[#DDD3C3] dark:border-[#382E25] rounded-xl px-2.5 py-1 text-xs text-[#2C2723] dark:text-[#EDE8E1] outline-none focus:border-[#8C6B4F]"
                        />
                      )}
                      {field.type === 'DATE' && (
                        <input
                          type="date"
                          value={(value as string) ?? ''}
                          onChange={(e) => setValue(e.target.value)}
                          className="w-full bg-white dark:bg-[#221C16] border border-[#DDD3C3] dark:border-[#382E25] rounded-xl px-2.5 py-1 text-xs text-[#2C2723] dark:text-[#EDE8E1] outline-none focus:border-[#8C6B4F]"
                        />
                      )}
                      {field.type === 'CHECKBOX' && (
                        <input
                          type="checkbox"
                          checked={Boolean(value)}
                          onChange={(e) => setValue(e.target.checked)}
                          className="w-4 h-4 rounded accent-[#8C6B4F]"
                        />
                      )}
                      {field.type === 'SELECT' && (
                        <select
                          value={(value as string) ?? ''}
                          onChange={(e) => setValue(e.target.value)}
                          className="w-full bg-white dark:bg-[#221C16] border border-[#DDD3C3] dark:border-[#382E25] rounded-xl px-2.5 py-1 text-xs text-[#2C2723] dark:text-[#EDE8E1] outline-none focus:border-[#8C6B4F]"
                        >
                          <option value="">—</option>
                          {options.map((opt) => (
                            <option key={opt} value={opt}>
                              {opt}
                            </option>
                          ))}
                        </select>
                      )}
                    </div>
                  );
                })}
            </div>
          )}

          {/* Description & Work Notes Section */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#8C6B4F]" />
                <h4 className="text-[11px] font-bold text-[#7A6E62] dark:text-[#A09386] uppercase tracking-widest font-sans-ui">
                  {language === 'vi' ? 'Ghi chú & Chi tiết công việc' : 'Notes & Work Details'}
                </h4>
              </div>

              {/* Quick Formatting Tools to add checklist / steps into notes */}
              <div className="flex items-center gap-1.5 text-[11px] font-sans-ui">
                <span className="text-[10px] text-[#9E9082] hidden sm:inline">Chèn nhanh:</span>
                <button
                  type="button"
                  onClick={() => insertFormatIntoDescription('- [ ] ')}
                  className="flex items-center gap-1 px-2 py-1 rounded-lg bg-white dark:bg-[#201A15] hover:bg-[#EDE5D8] dark:hover:bg-[#2C241D] text-[#5A4E42] dark:text-[#D5CBC1] border border-[#E5DFD5] dark:border-[#2C251E] transition-colors"
                  title="Thêm mục checklist vào ghi chú"
                >
                  <CheckCircle2 className="w-3 h-3 text-[#2D6A4F]" />
                  <span>Ô kiểm [-]</span>
                </button>
                <button
                  type="button"
                  onClick={() => insertFormatIntoDescription('• ')}
                  className="flex items-center gap-1 px-2 py-1 rounded-lg bg-white dark:bg-[#201A15] hover:bg-[#EDE5D8] dark:hover:bg-[#2C241D] text-[#5A4E42] dark:text-[#D5CBC1] border border-[#E5DFD5] dark:border-[#2C251E] transition-colors"
                  title="Thêm đầu dòng vào ghi chú"
                >
                  <List className="w-3 h-3 text-[#8C6B4F]" />
                  <span>Gạch đầu dòng (•)</span>
                </button>
                <button
                  type="button"
                  onClick={() => insertFormatIntoDescription('1. ')}
                  className="flex items-center gap-1 px-2 py-1 rounded-lg bg-white dark:bg-[#201A15] hover:bg-[#EDE5D8] dark:hover:bg-[#2C241D] text-[#5A4E42] dark:text-[#D5CBC1] border border-[#E5DFD5] dark:border-[#2C251E] transition-colors"
                  title="Thêm bước có thứ tự vào ghi chú"
                >
                  <ListOrdered className="w-3 h-3 text-[#3B82F6]" />
                  <span>Bước (1.)</span>
                </button>
              </div>
            </div>

            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              onBlur={handleDescriptionBlur}
              placeholder={
                language === 'vi'
                  ? 'Nhập ghi chú chi tiết, định hướng sản phẩm, checklist từng bước nhỏ, tài liệu tham khảo...'
                  : 'Add detailed notes, steps, checklist, references...'
              }
              rows={7}
              className="w-full p-4 bg-white dark:bg-[#1C1713] border border-[#E5DFD5] dark:border-[#2C251E] rounded-2xl text-xs sm:text-sm text-[#2C2723] dark:text-[#EDE8E1] placeholder-[#9E9082] outline-none focus:border-[#8C6B4F] resize-y leading-relaxed font-sans-ui shadow-2xs font-normal"
            />
            <p className="text-[11px] text-[#9E9082] dark:text-[#807466] italic">
              * Mẹo: Bạn có thể lưu các đầu việc nhỏ, các bước thực hiện hoặc checklist trực tiếp tại đây để thẻ gọn gàng và liền mạch.
            </p>
          </div>

          {/* Activity / Comments Section */}
          <div className="space-y-3 pt-3 border-t border-[#EAE3D8] dark:border-[#28211A]">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-[#8C6B4F]" />
              <h4 className="text-[11px] font-bold text-[#7A6E62] dark:text-[#A09386] uppercase tracking-widest font-sans-ui">
                {t.activity} ({task.activities.length})
              </h4>
            </div>

            {/* Add Comment Input */}
            <form onSubmit={handleAddComment} className="flex items-start gap-2.5">
              <img
                src={members[0].avatar}
                alt={members[0].name}
                referrerPolicy="no-referrer"
                className="w-7 h-7 rounded-full object-cover ring-2 ring-[#FAF8F5] dark:ring-[#181411] mt-1 shadow-2xs"
              />
              <div className="flex-1 flex gap-2">
                <input
                  type="text"
                  placeholder={t.commentPlaceholder}
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  className="flex-1 px-3.5 py-2 bg-white dark:bg-[#1E1915] border border-[#E5DFD5] dark:border-[#2C251E] rounded-xl text-xs text-[#2C2723] dark:text-[#EDE8E1] placeholder-[#9E9082] outline-none focus:border-[#8C6B4F] font-sans-ui"
                />
                <button
                  type="submit"
                  disabled={!commentText.trim()}
                  className="px-3.5 py-2 rounded-xl bg-[#2C2723] dark:bg-[#EDE8E1] text-[#FAF8F5] dark:text-[#181512] text-xs font-semibold disabled:opacity-40 flex items-center gap-1.5 transition-all shadow-xs"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">{t.postComment}</span>
                </button>
              </div>
            </form>

            {/* Activities List */}
            <div className="space-y-2.5 pt-1">
              {task.activities.map((act) => (
                <div key={act.id} className="flex items-start gap-3 text-xs font-sans-ui">
                  <img
                    src={act.author.avatar}
                    alt={act.author.name}
                    referrerPolicy="no-referrer"
                    className="w-6 h-6 rounded-full object-cover ring-1 ring-[#DDD3C3] dark:ring-[#382E25] mt-0.5"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-[#2C2723] dark:text-[#EDE8E1]">
                        {act.author.name}
                      </span>
                      <span className="text-[#8E8378]">{act.action}</span>
                      <span className="text-[10px] text-[#A6998C] font-mono-data">{act.timestamp}</span>
                    </div>
                    {act.comment && (
                      <div className="mt-1 p-3 rounded-2xl bg-white dark:bg-[#1E1915] border border-[#E8E1D5] dark:border-[#2C251E] text-[#3D352E] dark:text-[#D5CBC1] text-xs leading-relaxed">
                        {act.comment}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
