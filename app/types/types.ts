'use client';

export type Priority = 'urgent' | 'high' | 'medium' | 'low';

export interface Member {
  id: string;
  name: string;
  avatar: string;
  role: string;
  email: string;
}

export interface Label {
  bg?: string;
  id: string;
  name: string;
  color: string;
  bgLight: string;
  bgDark: string;
}

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
}

export interface Activity {
  id: string;
  author: Member;
  action: string;
  timestamp: string;
  comment?: string;
}

export interface Task {
  storyPoints?: number;
  id: string;
  title: string;
  description: string;
  columnId: string;
  boardId: string;
  priority: Priority;
  assignees: Member[];
  labels: Label[];
  subtasks: Subtask[];
  dueDate?: string; // YYYY-MM-DD
  startDate?: string; // YYYY-MM-DD
  estimate?: string; // e.g. "2 giờ", "1 ngày", "500k", "3 điểm"
  coverImage?: string;
  coverColor?: string;
  activities: Activity[];
  createdAt: string;
  order: number;
}

export interface Column {
  id: string;
  title: string;
  boardId: string;
  colorAccent?: string;
  wipLimit?: number;
  order: number;
}

export interface Board {
  id: string;
  workspaceId?: string;
  title: string;
  description: string;
  icon: string;
  category: 'content' | 'event' | 'business' | 'education' | 'general';
  backgroundStyle: 'paper-white' | 'warm-stone' | 'soft-linen' | 'sage-calm' | 'nordic-sky' | 'rose-terracotta' | 'dark-slate' | 'charcoal-noir';
  columnIds: string[];
  createdAt: string;
}

export type WorkspaceRole = 'owner' | 'admin' | 'member';

export type WorkspacePlan = 'Free' | 'Pro' | 'Business';

export interface Workspace {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  accentColor: string;
  category: string;
  role: WorkspaceRole;
  plan: WorkspacePlan;
  isStarred: boolean;
  lastActive: string;
  boardIds: string[];
  // Real stats from the backend (see WorkspaceService.getWorkspacesOfMe) —
  // used by WorkspaceSelector instead of recomputing from `boards`/`tasks`,
  // since those only ever hold the *active* workspace's data.
  boardsCount?: number;
  tasksCount?: number;
  completedTasksCount?: number;
}

export type ViewMode = 'kanban' | 'table' | 'timeline' | 'analytics';

export type Language = 'vi' | 'en';

export type ThemeMode = 'light' | 'dark';

export interface FilterOptions {
  searchQuery: string;
  priorities: Priority[];
  assigneeIds: string[];
  labelIds: string[];
  hasDueDateOnly?: boolean;
}
