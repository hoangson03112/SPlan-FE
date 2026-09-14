import { Bug, BookOpen, CheckSquare, Zap } from "lucide-react";
import type { IssueType } from "@/app/types/types";

export const ISSUE_TYPE_META: Record<
  IssueType,
  { label: string; labelEn: string; icon: typeof Bug; color: string }
> = {
  task: { label: "Task", labelEn: "Task", icon: CheckSquare, color: "#3b82f6" },
  bug: { label: "Lỗi", labelEn: "Bug", icon: Bug, color: "#dc2626" },
  story: { label: "Story", labelEn: "Story", icon: BookOpen, color: "#16a34a" },
  epic: { label: "Epic", labelEn: "Epic", icon: Zap, color: "#9333ea" },
};

export const ISSUE_TYPES: IssueType[] = ["task", "bug", "story", "epic"];
