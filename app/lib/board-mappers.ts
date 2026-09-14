import {
  Space,
  Status as RealStatus,
  Item as RealItem,
  Workspace as RealWorkspace,
  WorkspaceMemberWithUser,
  MemberRole,
} from "@/app/types/models";
import {
  Board,
  Column,
  Task,
  Member,
  Workspace as MockWorkspace,
  WorkspacePlan,
  WorkspaceRole,
  Priority,
  IssueType,
} from "@/app/types/types";
import { getAvatarUrl } from "./avatar";
import { resolveLabels } from "./labels";

const PLAN_LABELS: Record<string, WorkspacePlan> = {
  FREE: "Free",
  PRO: "Pro",
  ENTERPRISE: "Business",
};

const ROLE_LABELS: Record<MemberRole, WorkspaceRole> = {
  OWNER: "owner",
  ADMIN: "admin",
  MEMBER: "member",
};

const ROLE_DISPLAY_TEXT: Record<MemberRole, string> = {
  OWNER: "Chủ sở hữu",
  ADMIN: "Quản trị viên",
  MEMBER: "Thành viên",
};

const BACKGROUND_STYLES = [
  "paper-white",
  "warm-stone",
  "soft-linen",
  "sage-calm",
  "nordic-sky",
  "rose-terracotta",
  "dark-slate",
  "charcoal-noir",
] as const;

function isBackgroundStyle(
  value: string | null | undefined,
): value is Board["backgroundStyle"] {
  return (
    !!value && (BACKGROUND_STYLES as readonly string[]).includes(value)
  );
}

function isBoardCategory(
  value: string | null | undefined,
): value is Board["category"] {
  return (
    value === "content" ||
    value === "event" ||
    value === "business" ||
    value === "education" ||
    value === "general"
  );
}

/** The backend has no workspace-level decoration (icon/color/star/last-active) —
 * fill in sensible constant defaults so the existing WorkspaceSelector UI has
 * something to render. */
export function mapWorkspace(ws: RealWorkspace): MockWorkspace {
  return {
    id: ws.id,
    name: ws.name,
    slug: ws.slug,
    description: "",
    icon: "🗂️",
    accentColor: "#8C6B4F",
    category: "Không gian làm việc",
    role: ws.role ? ROLE_LABELS[ws.role] : "member",
    plan: PLAN_LABELS[ws.plan] ?? "Free",
    isStarred: false,
    lastActive: "—",
    boardIds: [],
    boardsCount: ws.boardsCount,
    tasksCount: ws.tasksCount,
    completedTasksCount: ws.completedTasksCount,
  };
}

export function mapBoard(space: Space): Board {
  return {
    id: space.id,
    workspaceId: space.workspaceId,
    slug: space.slug,
    key: space.key,
    title: space.name,
    description: space.description ?? "",
    icon: space.icon ?? "📋",
    category: isBoardCategory(space.category) ? space.category : "general",
    backgroundStyle: isBackgroundStyle(space.color)
      ? space.color
      : "paper-white",
    columnIds: [],
    createdAt: space.createdAt,
    itemsCount: space.itemsCount,
    completedItemsCount: space.completedItemsCount,
  };
}

export function mapColumn(status: RealStatus, boardId: string): Column {
  return {
    id: status.id,
    title: status.name,
    boardId,
    colorAccent: status.color,
    order: status.position,
    group: status.group,
  };
}

export function mapMember(wm: WorkspaceMemberWithUser): Member {
  const displayName = wm.user.name || wm.user.email;
  return {
    id: wm.user.id,
    name: displayName,
    avatar: getAvatarUrl(displayName),
    role: ROLE_DISPLAY_TEXT[wm.role],
    email: wm.user.email,
  };
}

/** Shape we choose to store inside `Item.data` — the backend keeps it as a
 * free-form JSON blob, this is our own client-side convention for it. */
export interface ItemDataShape {
  description?: string;
  issueType?: IssueType;
  priority?: Priority;
  assigneeIds?: string[];
  labelIds?: string[];
  dueDate?: string;
  startDate?: string;
  estimate?: string;
  coverImage?: string;
  coverColor?: string;
  customFields?: Record<string, unknown>;
  activities?: {
    id: string;
    authorId: string;
    authorName: string;
    authorAvatar: string;
    action: string;
    timestamp: string;
    comment?: string;
  }[];
}

/** Inverse of `mapItemToTask` — rebuilds the JSON blob to send back to the
 * backend from a (possibly locally-edited) Task, so a partial update never
 * clobbers fields the caller didn't touch. */
export function taskToItemData(task: Task): ItemDataShape {
  return {
    description: task.description,
    issueType: task.issueType,
    priority: task.priority,
    assigneeIds: task.assignees.map((a) => a.id),
    labelIds: task.labels.map((l) => l.id),
    dueDate: task.dueDate,
    startDate: task.startDate,
    estimate: task.estimate,
    coverImage: task.coverImage,
    coverColor: task.coverColor,
    customFields: task.customFields,
    activities: task.activities.map((a) => ({
      id: a.id,
      authorId: a.author.id,
      authorName: a.author.name,
      authorAvatar: a.author.avatar,
      action: a.action,
      timestamp: a.timestamp,
      comment: a.comment,
    })),
  };
}

export function mapItemToTask(
  item: RealItem,
  boardId: string,
  members: Member[],
  boardKey?: string,
): Task {
  const data = (item.data ?? {}) as ItemDataShape;
  const assignees = (data.assigneeIds ?? [])
    .map((id) => members.find((m) => m.id === id))
    .filter((m): m is Member => Boolean(m));

  return {
    id: item.id,
    boardId,
    number: item.number ?? undefined,
    code:
      boardKey && item.number != null ? `${boardKey}-${item.number}` : undefined,
    issueType: data.issueType ?? "task",
    columnId: item.statusId ?? "",
    title: item.title,
    description: data.description ?? "",
    priority: data.priority ?? "medium",
    assignees,
    labels: resolveLabels(data.labelIds),
    subtasks: [],
    dueDate: data.dueDate,
    startDate: data.startDate,
    estimate: data.estimate,
    coverImage: data.coverImage,
    coverColor: data.coverColor,
    customFields: data.customFields ?? {},
    activities: (data.activities ?? []).map((a) => ({
      id: a.id,
      author: {
        id: a.authorId,
        name: a.authorName,
        avatar: a.authorAvatar,
        role: "",
        email: "",
      },
      action: a.action,
      timestamp: a.timestamp,
      comment: a.comment,
    })),
    createdAt: item.createdAt,
    order: item.kanbanOrder,
  };
}
