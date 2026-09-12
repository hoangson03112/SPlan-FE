export type PlanType = "FREE" | "PRO" | "ENTERPRISE";
export type MemberRole = "MEMBER" | "ADMIN" | "OWNER";
export type FieldType = "TEXT" | "NUMBER" | "SELECT" | "DATE" | "CHECKBOX";
export type StatusGroup = "TODO" | "IN_PROGRESS" | "DONE";
export type ViewType = "TABLE" | "KANBAN" | "LIST";
export type AuthProvider = "LOCAL" | "GOOGLE";

export interface User {
  id: string;
  email: string;
  name?: string | null;
}

export interface Workspace {
  id: string;
  name: string;
  slug: string;
  plan: PlanType;
  createdAt: string;
  role?: MemberRole;
  boardsCount?: number;
  tasksCount?: number;
  completedTasksCount?: number;
}

export interface WorkspaceMember {
  userId: string;
  workspaceId: string;
  role: MemberRole;
}

export interface WorkspaceMemberWithUser extends WorkspaceMember {
  user: User;
}

export interface ListSummary {
  id: string;
  name: string;
  position: number;
}

export interface Space {
  id: string;
  workspaceId: string;
  name: string;
  slug: string;
  icon?: string | null;
  color?: string | null;
  description?: string | null;
  category?: string | null;
  createdAt: string;
  lists?: ListSummary[];
}

export interface List extends ListSummary {
  spaceId: string;
  createdAt: string;
}

export interface Field {
  id: string;
  listId: string;
  name: string;
  type: FieldType;
  config: Record<string, unknown>;
  position: number;
  isHidden: boolean;
}

export interface Status {
  id: string;
  listId: string;
  name: string;
  color: string;
  group: StatusGroup;
  position: number;
}

export interface Item {
  id: string;
  listId: string;
  data: Record<string, unknown>;
  title: string;
  statusId?: string | null;
  kanbanOrder: number;
  tableOrder: number;
  createdBy?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface View {
  id: string;
  listId: string;
  name: string;
  type: ViewType;
  config: Record<string, unknown>;
  position: number;
}
