"use client";

import React, { useState } from "react";
import { X, FolderPlus, ChevronDown, UserPlus, ListOrdered, List, CheckCircle2 } from "lucide-react";
import { useProject } from "@/app/context/ProjectProvider";
import { IssueType, Priority } from "@/app/types/types";
import { ISSUE_TYPE_META, ISSUE_TYPES } from "@/app/lib/issue-type";

/**
 * Jira's "Create issue" modal, reproduced field-for-field: Project context
 * at top, Issue type as an icon-prefixed dropdown (not big chips), a
 * Reporter row (read-only — always the current user), "Assign to me", and
 * the "Create another" checkbox that keeps the form open for rapid entry.
 * Whatever custom fields this board has defined render automatically below
 * the fixed fields, same as Jira renders a project's custom fields.
 */
export const CreateIssueModal: React.FC = () => {
  const {
    isCreateIssueModalOpen,
    setIsCreateIssueModalOpen,
    createIssueDefaultColumnId,
    setCreateIssueDefaultColumnId,
    activeBoard,
    columns,
    members,
    fields,
    createIssue,
    language,
    t,
  } = useProject();

  const reporter = members[0];

  const [issueType, setIssueType] = useState<IssueType>("task");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<Priority>("medium");
  const [assigneeId, setAssigneeId] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [customFieldValues, setCustomFieldValues] = useState<
    Record<string, unknown>
  >({});
  const [createAnother, setCreateAnother] = useState(false);
  const [justCreated, setJustCreated] = useState(false);

  if (!isCreateIssueModalOpen) return null;

  const effectiveColumnId = createIssueDefaultColumnId || columns[0]?.id || "";
  const visibleFields = fields.filter((f) => !f.isHidden);

  const resetForm = (full: boolean) => {
    setTitle("");
    setDescription("");
    setCustomFieldValues({});
    if (full) {
      setIssueType("task");
      setPriority("medium");
      setAssigneeId("");
      setDueDate("");
    }
  };

  const handleClose = () => {
    setIsCreateIssueModalOpen(false);
    setCreateIssueDefaultColumnId(null);
    resetForm(true);
    setCreateAnother(false);
    setJustCreated(false);
  };

  const insertFormatIntoDescription = (prefix: string) => {
    setDescription((prev) => {
      const trimmed = prev ? prev.trimEnd() : "";
      const separator = trimmed ? "\n" : "";
      return `${trimmed}${separator}${prefix}`;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = title.trim();
    if (!trimmed || !effectiveColumnId) return;

    createIssue({
      columnId: effectiveColumnId,
      title: trimmed,
      description: description.trim() || undefined,
      issueType,
      priority,
      assigneeIds: assigneeId ? [assigneeId] : [],
      dueDate: dueDate || undefined,
      customFields: customFieldValues,
    });

    if (createAnother) {
      // Jira keeps type/status/priority/assignee "sticky" across successive
      // creates in the same sitting, and only clears summary/description.
      resetForm(false);
      setJustCreated(true);
      setTimeout(() => setJustCreated(false), 1600);
    } else {
      handleClose();
    }
  };

  const setCustomFieldValue = (fieldId: string, value: unknown) => {
    setCustomFieldValues((prev) => ({ ...prev, [fieldId]: value }));
  };

  const issueTypeMeta = ISSUE_TYPE_META[issueType];
  const IssueTypeIcon = issueTypeMeta.icon;

  const fieldRowLabel = "w-32 flex-shrink-0 font-semibold text-[#5A4E42] dark:text-[#C5BAAD] pt-2";
  const fieldRowInput = "flex-1 min-w-0";
  const inputClass =
    "w-full px-3 py-2 rounded-xl bg-white dark:bg-[#1E1915] border border-[#E5DFD5] dark:border-[#2C241D] outline-none focus:border-[#8C6B4F]";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-[#161311]/50 backdrop-blur-xs" onClick={handleClose} />

      <form
        onSubmit={handleSubmit}
        className="relative w-full max-w-2xl rounded-3xl bg-[#FAF8F5] dark:bg-[#181411] border border-[#E5DFD5] dark:border-[#2C241D] shadow-2xl z-10 max-h-[88vh] flex flex-col animate-in zoom-in-95 duration-150"
      >
        {/* Header: project context, matching Jira's "Project" row at the top */}
        <div className="p-5 pb-3.5 border-b border-[#EAE3D8] dark:border-[#28211A]">
          <div className="flex items-center justify-between">
            <h3 className="font-editorial text-base font-bold text-[#2C2723] dark:text-[#EDE8E1]">
              {t.createIssue}
            </h3>
            <button
              type="button"
              onClick={handleClose}
              className="p-1.5 rounded-xl text-[#8E8378] hover:text-[#2C2723] dark:hover:text-[#EDE8E1]"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="mt-2.5 flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-[#F2ECE3] dark:bg-[#1E1915] w-fit">
            <span className="text-base leading-none">{activeBoard.icon}</span>
            <span className="text-xs font-semibold text-[#4A4137] dark:text-[#D5CBC1]">
              {activeBoard.title}
            </span>
            <span className="text-[10px] font-mono-data text-[#9E9082]">
              {activeBoard.key}
            </span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-3.5 text-xs">
          {/* Issue type — icon-prefixed dropdown, same pattern as TaskDetailModal */}
          <div className="flex items-start gap-3">
            <label className={fieldRowLabel}>{t.issueType}</label>
            <div className={`${fieldRowInput} relative`}>
              <select
                value={issueType}
                onChange={(e) => setIssueType(e.target.value as IssueType)}
                className={`${inputClass} appearance-none pl-8 pr-7`}
              >
                {ISSUE_TYPES.map((it) => (
                  <option key={it} value={it}>
                    {language === "vi" ? ISSUE_TYPE_META[it].label : ISSUE_TYPE_META[it].labelEn}
                  </option>
                ))}
              </select>
              <IssueTypeIcon
                className="w-3.5 h-3.5 absolute left-2.5 top-2.5 pointer-events-none"
                style={{ color: issueTypeMeta.color }}
              />
              <ChevronDown className="w-3.5 h-3.5 text-[#8E8378] absolute right-2 top-2.5 pointer-events-none" />
            </div>
          </div>

          {/* Status */}
          <div className="flex items-start gap-3">
            <label className={fieldRowLabel}>{t.status}</label>
            <select
              value={effectiveColumnId}
              onChange={(e) => setCreateIssueDefaultColumnId(e.target.value)}
              className={`${fieldRowInput} ${inputClass}`}
            >
              {columns.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title}
                </option>
              ))}
            </select>
          </div>

          {/* Summary */}
          <div className="flex items-start gap-3">
            <label className={fieldRowLabel}>{t.summaryLabel}</label>
            <input
              type="text"
              required
              autoFocus
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={t.titlePlaceholderExample}
              className={`${fieldRowInput} ${inputClass}`}
            />
          </div>

          {/* Description with the same quick-insert toolbar as TaskDetailModal */}
          <div className="flex items-start gap-3">
            <label className={fieldRowLabel}>{t.description}</label>
            <div className={fieldRowInput}>
              <div className="flex items-center gap-1.5 mb-1.5">
                <button
                  type="button"
                  onClick={() => insertFormatIntoDescription("- [ ] ")}
                  className="flex items-center gap-1 px-2 py-1 rounded-lg bg-white dark:bg-[#201A15] hover:bg-[#EDE5D8] dark:hover:bg-[#2C241D] border border-[#E5DFD5] dark:border-[#2C251E]"
                  title={t.addCheckbox}
                >
                  <CheckCircle2 className="w-3 h-3 text-[#2D6A4F]" />
                </button>
                <button
                  type="button"
                  onClick={() => insertFormatIntoDescription("• ")}
                  className="flex items-center gap-1 px-2 py-1 rounded-lg bg-white dark:bg-[#201A15] hover:bg-[#EDE5D8] dark:hover:bg-[#2C241D] border border-[#E5DFD5] dark:border-[#2C251E]"
                  title={t.bulletList}
                >
                  <List className="w-3 h-3 text-[#8C6B4F]" />
                </button>
                <button
                  type="button"
                  onClick={() => insertFormatIntoDescription("1. ")}
                  className="flex items-center gap-1 px-2 py-1 rounded-lg bg-white dark:bg-[#201A15] hover:bg-[#EDE5D8] dark:hover:bg-[#2C241D] border border-[#E5DFD5] dark:border-[#2C251E]"
                  title={t.orderedList}
                >
                  <ListOrdered className="w-3 h-3 text-[#3B82F6]" />
                </button>
              </div>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                placeholder={t.descriptionPlaceholder}
                className={`${inputClass} resize-y`}
              />
            </div>
          </div>

          {/* Reporter — read-only, always the current user, like Jira */}
          {reporter && (
            <div className="flex items-center gap-3">
              <label className={`${fieldRowLabel} pt-0`}>{t.reporter}</label>
              <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-[#F2ECE3] dark:bg-[#1E1915] w-fit">
                <img
                  src={reporter.avatar}
                  alt={reporter.name}
                  referrerPolicy="no-referrer"
                  className="w-5 h-5 rounded-full object-cover"
                />
                <span className="text-[#4A4137] dark:text-[#D5CBC1] font-medium">
                  {reporter.name}
                </span>
              </div>
            </div>
          )}

          {/* Assignee with "assign to me" shortcut */}
          <div className="flex items-start gap-3">
            <label className={fieldRowLabel}>{t.assignee}</label>
            <div className={`${fieldRowInput} flex items-center gap-2`}>
              <select
                value={assigneeId}
                onChange={(e) => setAssigneeId(e.target.value)}
                className={inputClass}
              >
                <option value="">{t.unassigned}</option>
                {members.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
              </select>
              {reporter && assigneeId !== reporter.id && (
                <button
                  type="button"
                  onClick={() => setAssigneeId(reporter.id)}
                  className="flex items-center gap-1 px-2.5 py-2 rounded-xl text-[#8C6B4F] dark:text-[#D4B89D] hover:bg-[#F2ECE3] dark:hover:bg-[#1E1915] whitespace-nowrap flex-shrink-0"
                  title={t.assignToMe}
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">{t.assignToMe}</span>
                </button>
              )}
            </div>
          </div>

          {/* Priority + Due date */}
          <div className="flex items-start gap-3">
            <label className={fieldRowLabel}>{t.priority}</label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as Priority)}
              className={`${fieldRowInput} ${inputClass}`}
            >
              <option value="urgent">{t.urgent}</option>
              <option value="high">{t.high}</option>
              <option value="medium">{t.medium}</option>
              <option value="low">{t.low}</option>
            </select>
          </div>
          <div className="flex items-start gap-3">
            <label className={fieldRowLabel}>{t.dueDate}</label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className={`${fieldRowInput} ${inputClass}`}
            />
          </div>

          {/* Dynamic custom fields — same row layout as the fixed fields above */}
          {visibleFields.length > 0 && (
            <div className="pt-3 border-t border-[#EFE9E0] dark:border-[#241F1A] space-y-3.5">
              <span className="text-[10px] font-bold text-[#94877A] uppercase tracking-widest">
                {t.customFields}
              </span>
              {visibleFields.map((field) => {
                const options = Array.isArray(
                  (field.config as { options?: string[] })?.options,
                )
                  ? ((field.config as { options?: string[] }).options ?? [])
                  : [];

                return (
                  <div key={field.id} className="flex items-start gap-3">
                    <label className={fieldRowLabel}>{field.name}</label>
                    <div className={fieldRowInput}>
                      {field.type === "TEXT" && (
                        <input
                          type="text"
                          value={(customFieldValues[field.id] as string) ?? ""}
                          onChange={(e) => setCustomFieldValue(field.id, e.target.value)}
                          className={inputClass}
                        />
                      )}
                      {field.type === "NUMBER" && (
                        <input
                          type="number"
                          value={(customFieldValues[field.id] as number) ?? ""}
                          onChange={(e) =>
                            setCustomFieldValue(
                              field.id,
                              e.target.value === "" ? "" : Number(e.target.value),
                            )
                          }
                          className={inputClass}
                        />
                      )}
                      {field.type === "DATE" && (
                        <input
                          type="date"
                          value={(customFieldValues[field.id] as string) ?? ""}
                          onChange={(e) => setCustomFieldValue(field.id, e.target.value)}
                          className={inputClass}
                        />
                      )}
                      {field.type === "CHECKBOX" && (
                        <input
                          type="checkbox"
                          checked={Boolean(customFieldValues[field.id])}
                          onChange={(e) => setCustomFieldValue(field.id, e.target.checked)}
                          className="w-4 h-4 rounded accent-[#8C6B4F]"
                        />
                      )}
                      {field.type === "SELECT" && (
                        <select
                          value={(customFieldValues[field.id] as string) ?? ""}
                          onChange={(e) => setCustomFieldValue(field.id, e.target.value)}
                          className={inputClass}
                        >
                          <option value="">{t.selectPlaceholder}</option>
                          {options.map((opt) => (
                            <option key={opt} value={opt}>
                              {opt}
                            </option>
                          ))}
                        </select>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer: "Create another" — the classic Jira rapid-entry checkbox */}
        <div className="p-5 pt-3.5 border-t border-[#EAE3D8] dark:border-[#28211A] flex items-center justify-between gap-2.5">
          <label className="flex items-center gap-2 text-xs text-[#5A4E42] dark:text-[#C5BAAD] cursor-pointer select-none">
            <input
              type="checkbox"
              checked={createAnother}
              onChange={(e) => setCreateAnother(e.target.checked)}
              className="w-3.5 h-3.5 rounded accent-[#8C6B4F]"
            />
            <span>{t.createAnotherIssue}</span>
            {justCreated && (
              <span className="text-[#2D6A4F] dark:text-[#78BE93] font-semibold animate-in fade-in">
                ✓ {t.taskCreated}
              </span>
            )}
          </label>
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 rounded-xl text-[#7E7163] hover:text-[#2C2723] dark:hover:text-[#EDE8E1]"
            >
              {t.cancel}
            </button>
            <button
              type="submit"
              disabled={!title.trim()}
              className="px-5 py-2 rounded-xl bg-[#2C2723] dark:bg-[#EDE8E1] text-[#FAF8F5] dark:text-[#181512] font-semibold disabled:opacity-40 shadow-xs flex items-center gap-1.5"
            >
              <FolderPlus className="w-3.5 h-3.5" />
              {t.createIssue}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
