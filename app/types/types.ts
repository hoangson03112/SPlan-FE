'use client';

export type Priority = 'urgent' | 'high' | 'medium' | 'low';

export type IssueType = 'task' | 'bug' | 'story' | 'epic';

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
  /** Sequential number within the board, e.g. 42 for issue code "MKT-42". */
  number?: number;
  /** Precomputed "KEY-42" display code — undefined only for legacy items
   * created before issue numbering existed. */
  code?: string;
  issueType: IssueType;
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
  /** Values for this board's custom fields (see Field), keyed by Field id. */
  customFields: Record<string, unknown>;
  activities: Activity[];
  createdAt: string;
  order: number;
}

export type StatusGroup = 'TODO' | 'IN_PROGRESS' | 'DONE';

export interface Column {
  id: string;
  title: string;
  boardId: string;
  colorAccent?: string;
  wipLimit?: number;
  order: number;
  /** Which stage this column represents — drives completion %, overdue
   * checks, etc. Comes straight from the backend Status.group, so it stays
   * correct regardless of column order or naming. */
  group: StatusGroup;
}

export interface Board {
  id: string;
  workspaceId?: string;
  slug: string;
  /** Short project key like "MKT" — see Space.key. Used to render issue
   * codes ("MKT-42") and empty for boards created before issue numbering. */
  key: string;
  title: string;
  description: string;
  icon: string;
  category: 'content' | 'event' | 'business' | 'education' | 'general';
  backgroundStyle: 'paper-white' | 'warm-stone' | 'soft-linen' | 'sage-calm' | 'nordic-sky' | 'rose-terracotta' | 'dark-slate' | 'charcoal-noir';
  columnIds: string[];
  createdAt: string;
  // Only populated from the boards-list endpoint (see mapBoard).
  itemsCount?: number;
  completedItemsCount?: number;
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

export type ViewMode = 'kanban' | 'backlog' | 'table' | 'timeline' | 'analytics';

export type Language = 'vi' | 'en';

export type ThemeMode = 'light' | 'dark';

/** Draft passed to `createIssue` — the Jira-style "Create issue" modal, as
 * opposed to `addTask`'s bare title-only quick-add. */
export interface CreateIssueInput {
  columnId: string;
  title: string;
  description?: string;
  issueType: IssueType;
  priority: Priority;
  assigneeIds?: string[];
  dueDate?: string;
  customFields?: Record<string, unknown>;
}

export interface FilterOptions {
  searchQuery: string;
  priorities: Priority[];
  assigneeIds: string[];
  labelIds: string[];
  hasDueDateOnly?: boolean;
}
