"use client";

import React, { useState } from "react";
import { X, Plus, Trash2, Settings2, Eye, EyeOff } from "lucide-react";
import { useProject } from "@/app/context/ProjectProvider";
import { FieldType } from "@/app/types/models";
import { TRANSLATIONS } from "@/app/i18n";

const FIELD_TYPE_LABEL_KEYS: Record<FieldType, keyof typeof TRANSLATIONS.vi> = {
  TEXT: "fieldTypeText",
  NUMBER: "fieldTypeNumber",
  SELECT: "fieldTypeSelect",
  DATE: "fieldTypeDate",
  CHECKBOX: "fieldTypeCheckbox",
};

const FIELD_TYPES: FieldType[] = ["TEXT", "NUMBER", "SELECT", "DATE", "CHECKBOX"];

/**
 * Jira calls these "custom fields" on a project — extra columns a team
 * defines for their own workflow (e.g. "Story Points", "Môi trường lỗi",
 * "Kênh khách hàng"). Defined per board (per List), rendered dynamically in
 * CreateIssueModal / TaskDetailModal once they exist.
 */
export const CustomFieldsModal: React.FC = () => {
  const {
    isCustomFieldsModalOpen,
    setIsCustomFieldsModalOpen,
    fields,
    createField,
    updateFieldDef,
    deleteFieldDef,
    t,
  } = useProject();

  const [name, setName] = useState("");
  const [type, setType] = useState<FieldType>("TEXT");
  const [optionsText, setOptionsText] = useState("");

  if (!isCustomFieldsModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;

    const config =
      type === "SELECT"
        ? {
            options: optionsText
              .split(",")
              .map((o) => o.trim())
              .filter(Boolean),
          }
        : {};

    createField({ name: trimmed, type, config });
    setName("");
    setOptionsText("");
    setType("TEXT");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="fixed inset-0 bg-[#161311]/50 backdrop-blur-xs"
        onClick={() => setIsCustomFieldsModalOpen(false)}
      />

      <div className="relative w-full max-w-lg rounded-3xl bg-[#FAF8F5] dark:bg-[#181411] border border-[#E5DFD5] dark:border-[#2C241D] shadow-2xl z-10 max-h-[85vh] flex flex-col animate-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between p-5 pb-3.5 border-b border-[#EAE3D8] dark:border-[#28211A]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#EDE5D8] dark:bg-[#28211A] flex items-center justify-center text-[#8C6B4F]">
              <Settings2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-editorial text-base font-bold text-[#2C2723] dark:text-[#EDE8E1]">
                {t.customFields}
              </h3>
              <p className="text-[11px] text-[#8E8378]">
                {t.customFieldsDescription}
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsCustomFieldsModalOpen(false)}
            className="p-1.5 rounded-xl text-[#8E8378] hover:text-[#2C2723] dark:hover:text-[#EDE8E1]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* Existing fields */}
          {fields.length === 0 ? (
            <p className="text-xs text-[#9E9082] text-center py-6">
              {t.noCustomFields}
            </p>
          ) : (
            <ul className="space-y-1.5">
              {fields.map((f) => (
                <li
                  key={f.id}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl border border-[#E5DFD5] dark:border-[#2C241D] bg-white/70 dark:bg-[#1C1712]/70"
                >
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-semibold text-[#2C2723] dark:text-[#EDE8E1] truncate">
                      {f.name}
                    </div>
                    <div className="text-[10px] text-[#9E9082]">
                      {t[FIELD_TYPE_LABEL_KEYS[f.type]]}
                      {f.type === "SELECT" &&
                        Array.isArray((f.config as { options?: string[] })?.options) &&
                        ` · ${((f.config as { options?: string[] }).options ?? []).join(", ")}`}
                    </div>
                  </div>
                  <button
                    onClick={() => updateFieldDef(f.id, { isHidden: !f.isHidden })}
                    title={f.isHidden ? t.fieldHiddenTooltip : t.fieldVisibleTooltip}
                    className="p-1.5 rounded-lg text-[#9E9082] hover:text-[#2C2723] dark:hover:text-[#EDE8E1] hover:bg-[#F2ECE3] dark:hover:bg-[#241E18]"
                  >
                    {f.isHidden ? (
                      <EyeOff className="w-3.5 h-3.5" />
                    ) : (
                      <Eye className="w-3.5 h-3.5" />
                    )}
                  </button>
                  <button
                    onClick={() => deleteFieldDef(f.id)}
                    className="p-1.5 rounded-lg text-[#9E9082] hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </li>
              ))}
            </ul>
          )}

          {/* Add new field */}
          <form
            onSubmit={handleSubmit}
            className="pt-3 border-t border-[#EFE9E0] dark:border-[#241F1A] space-y-2.5"
          >
            <div className="grid grid-cols-2 gap-2.5">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t.fieldNamePlaceholder}
                className="px-3 py-2 rounded-xl bg-white dark:bg-[#1E1915] border border-[#E5DFD5] dark:border-[#2C241D] text-xs text-[#2C2723] dark:text-[#EDE8E1] placeholder-[#9E9082] outline-none focus:border-[#8C6B4F]"
              />
              <select
                value={type}
                onChange={(e) => setType(e.target.value as FieldType)}
                className="px-3 py-2 rounded-xl bg-white dark:bg-[#1E1915] border border-[#E5DFD5] dark:border-[#2C241D] text-xs text-[#2C2723] dark:text-[#EDE8E1] outline-none focus:border-[#8C6B4F]"
              >
                {FIELD_TYPES.map((ft) => (
                  <option key={ft} value={ft}>
                    {t[FIELD_TYPE_LABEL_KEYS[ft]]}
                  </option>
                ))}
              </select>
            </div>

            {type === "SELECT" && (
              <input
                type="text"
                value={optionsText}
                onChange={(e) => setOptionsText(e.target.value)}
                placeholder={t.fieldOptionsPlaceholder}
                className="w-full px-3 py-2 rounded-xl bg-white dark:bg-[#1E1915] border border-[#E5DFD5] dark:border-[#2C241D] text-xs text-[#2C2723] dark:text-[#EDE8E1] placeholder-[#9E9082] outline-none focus:border-[#8C6B4F]"
              />
            )}

            <button
              type="submit"
              disabled={!name.trim()}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-[#2C2723] dark:bg-[#EDE8E1] text-[#FAF8F5] dark:text-[#181512] text-xs font-semibold disabled:opacity-40 transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              {t.addField}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
