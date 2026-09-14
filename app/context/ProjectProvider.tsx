"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Board,
  Column,
  Task,
  Member,
  Label,
  Workspace,
  ViewMode,
  FilterOptions,
  Language,
  Priority,
  ThemeMode,
  IssueType,
  CreateIssueInput,
} from "../types/types";
import { Field, FieldType } from "../types/models";
import { TRANSLATIONS } from "../i18n";
import { useCurrentUser } from "@/app/hooks/use-auth";
import {
  useCreateWorkspace,
  useMyWorkspaces,
  useWorkspaceMembers,
} from "@/app/hooks/use-workspaces";
import {
  useCreateSpace,
  useDeleteSpace,
  useSpaces,
  useUpdateSpace,
} from "@/app/hooks/use-spaces";
import {
  useCreateStatus,
  useDeleteStatus,
  useStatuses,
  useUpdateStatus,
} from "@/app/hooks/use-statuses";
import {
  useCreateItem,
  useDeleteItem,
  useItems,
  useUpdateItem,
} from "@/app/hooks/use-items";
import {
  useCreateField,
  useDeleteField,
  useFields,
  useUpdateField,
} from "@/app/hooks/use-fields";
import { UpdateSpacePayload } from "@/app/services/space.service";
import { UpdateStatusPayload } from "@/app/services/status.service";
import { UpdateItemPayload } from "@/app/services/item.service";
import { getAvatarUrl } from "@/app/lib/avatar";
import {
  mapBoard,
  mapColumn,
  mapItemToTask,
  mapMember,
  mapWorkspace,
  taskToItemData,
} from "@/app/lib/board-mappers";
import { midpointOrder } from "@/app/lib/ordering";
import { LABEL_PALETTE } from "@/app/lib/labels";

/**
 * Data layer for the Kanban UI, backed by the real backend:
 *   Workspace (UI) = Workspace (BE)
 *   Board      (UI) = Space (BE) — each Space auto-creates one hidden List
 *   Column     (UI) = Status (BE), inside that hidden List
 *   Task       (UI) = Item (BE) — everything else (description, priority,
 *                      assignees, labels, dueDate, activities...) lives in
 *                      Item.data as a JSON blob (see board-mappers.ts).
 *
 * A few workspace-management actions the backend has no concept of at all
 * (rename/delete workspace, star, join-by-code) stay as no-ops — see the
 * comments next to them below.
 */
interface ProjectContextType {
  workspaces: Workspace[];
  activeWorkspace: Workspace;
  activeWorkspaceId: string;
  setActiveWorkspaceId: (id: string) => void;
  selectWorkspace: (id: string) => void;
  isWorkspaceSelectorOpen: boolean;
  setIsWorkspaceSelectorOpen: (open: boolean) => void;
  alwaysShowWorkspaceSelector: boolean;
  setAlwaysShowWorkspaceSelector: (value: boolean) => void;

  boards: Board[];
  activeBoard: Board;
  setActiveBoardId: (boardId: string) => void;
  columns: Column[];
  tasks: Task[];
  members: Member[];
  labels: Label[];

  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  language: Language;
  setLanguage: (lang: Language) => void;
  themeMode: ThemeMode;
  toggleThemeMode: () => void;
  zenMode: boolean;
  toggleZenMode: () => void;

  filterOptions: FilterOptions;
  setFilterOptions: React.Dispatch<React.SetStateAction<FilterOptions>>;

  selectedTaskId: string | null;
  setSelectedTaskId: (id: string | null) => void;
  selectedTask: Task | null;

  isCommandPaletteOpen: boolean;
  setIsCommandPaletteOpen: (open: boolean) => void;
  isFilterDrawerOpen: boolean;
  setIsFilterDrawerOpen: (open: boolean) => void;
  isNewBoardModalOpen: boolean;
  setIsNewBoardModalOpen: (open: boolean) => void;
  isCreateIssueModalOpen: boolean;
  setIsCreateIssueModalOpen: (open: boolean) => void;
  /** Column to preselect the next time the create-issue modal opens — set
   * by a column's own "+" button so it opens straight into that status,
   * instead of always defaulting to the first column. */
  createIssueDefaultColumnId: string | null;
  setCreateIssueDefaultColumnId: (columnId: string | null) => void;
  isCustomFieldsModalOpen: boolean;
  setIsCustomFieldsModalOpen: (open: boolean) => void;
  isMembersModalOpen: boolean;
  setIsMembersModalOpen: (open: boolean) => void;

  fields: Field[];
  createField: (input: {
    name: string;
    type: FieldType;
    config?: Record<string, unknown>;
  }) => void;
  updateFieldDef: (
    fieldId: string,
    updates: Partial<{
      name: string;
      type: FieldType;
      config: Record<string, unknown>;
      isHidden: boolean;
    }>,
  ) => void;
  deleteFieldDef: (fieldId: string) => void;

  filteredTasks: Task[];
  getTasksByColumn: (columnId: string) => Task[];
  t: typeof TRANSLATIONS.vi;

  createWorkspace: (name: string) => void;
  addBoard: (
    title: string,
    description: string,
    icon?: string,
    backgroundStyle?: Board["backgroundStyle"],
    category?: Board["category"],
  ) => void;
  updateBoard: (boardId: string, updates: Partial<Board>) => void;
  deleteBoard: (boardId: string) => void;

  addColumn: (title: string, colorAccent?: string) => void;
  updateColumn: (columnId: string, updates: Partial<Column>) => void;
  deleteColumn: (columnId: string) => void;

  addTask: (
    columnId: string,
    title: string,
    priority?: Priority,
    issueType?: IssueType,
  ) => void;
  createIssue: (input: CreateIssueInput) => void;
  updateTask: (taskId: string, updates: Partial<Task>) => void;
  deleteTask: (taskId: string) => void;
  duplicateTask: (taskId: string) => void;
  moveTask: (
    taskId: string,
    targetColumnId: string,
    targetIndex?: number,
  ) => void;
  addComment: (taskId: string, commentText: string) => void;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

const PLACEHOLDER_WORKSPACE: Workspace = {
  id: "",
  name: "",
  slug: "",
  description: "",
  icon: "🗂️",
  accentColor: "#8C6B4F",
  category: "",
  role: "member",
  plan: "Free",
  isStarred: false,
  lastActive: "—",
  boardIds: [],
};

const PLACEHOLDER_BOARD: Board = {
  id: "",
  workspaceId: "",
  slug: "",
  key: "",
  title: "",
  description: "",
  icon: "📋",
  category: "general",
  backgroundStyle: "paper-white",
  columnIds: [],
  createdAt: new Date(0).toISOString(),
};

export const ProjectProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { data: currentUser } = useCurrentUser();

  // Route params drive selection whenever the current page names a
  // workspace/board slug (/workspaces/[slug] and .../boards/[boardSlug]);
  // the override state below only covers the gap between a click and the
  // navigation it triggers, and the `/workspaces` picker page itself (no
  // slug in the URL there).
  const params = useParams<{ slug?: string; boardSlug?: string }>();
  const router = useRouter();

  // ---- Workspace level -----------------------------------------------
  const { data: realWorkspaces } = useMyWorkspaces();
  const workspaces = useMemo(
    () => (realWorkspaces ?? []).map(mapWorkspace),
    [realWorkspaces],
  );

  // `null` means "no explicit choice yet" — derive from the loaded data
  // instead of syncing it in an effect, so there's nothing to do once the
  // workspaces/boards queries resolve.
  const [workspaceIdOverride, setWorkspaceIdOverride] = useState<string | null>(
    null,
  );
  const [boardIdOverride, setBoardIdOverride] = useState<string | null>(null);
  // `null` = "follow the route": open on the bare `/workspaces` picker,
  // closed on any page that names a workspace slug. Explicit true/false
  // (from the Navbar's "Đổi" button / picking a workspace) overrides that
  // without needing a navigation, since the selector is an overlay on top
  // of whatever board route is currently active.
  //
  // The override is tagged with the `boardSlug` it was set for. Landing on
  // a *different* board's URL (a real navigation, e.g. clicking a board
  // link) makes the tag stale, so it's ignored and the state falls back to
  // "follow the route" — otherwise, once the selector was opened even once
  // (e.g. via "Đổi"), every later board link would keep reopening it
  // instead of showing the board the user just clicked.
  const [selectorOverride, setSelectorOverride] = useState<{
    value: boolean;
    forBoardSlug: string | undefined;
  } | null>(null);
  const isWorkspaceSelectorOpen =
    selectorOverride && selectorOverride.forBoardSlug === params?.boardSlug
      ? selectorOverride.value
      : !params?.slug;
  const setIsWorkspaceSelectorOpen = useCallback(
    (open: boolean) => {
      setSelectorOverride({ value: open, forBoardSlug: params?.boardSlug });
    },
    [params?.boardSlug],
  );
  const [alwaysShowWorkspaceSelector, setAlwaysShowWorkspaceSelector] =
    useState(false);

  const workspaceFromRoute = params?.slug
    ? workspaces.find((w) => w.slug === params.slug)
    : undefined;

  const activeWorkspaceId =
    workspaceFromRoute?.id ?? workspaceIdOverride ?? workspaces[0]?.id ?? "";

  const activeWorkspace =
    workspaceFromRoute ??
    workspaces.find((w) => w.id === activeWorkspaceId) ??
    workspaces[0] ??
    PLACEHOLDER_WORKSPACE;

  const setActiveWorkspaceId = useCallback(
    (id: string) => {
      setWorkspaceIdOverride(id);
      setBoardIdOverride(null);
      const ws = workspaces.find((w) => w.id === id);
      if (ws) router.push(`/workspaces/${ws.slug}`);
    },
    [workspaces, router],
  );

  const selectWorkspace = useCallback(
    (id: string) => {
      setWorkspaceIdOverride(id);
      setBoardIdOverride(null);
      setIsWorkspaceSelectorOpen(false);
      const ws = workspaces.find((w) => w.id === id);
      if (ws) router.push(`/workspaces/${ws.slug}`);
    },
    [workspaces, router, setIsWorkspaceSelectorOpen],
  );

  // ---- Board (= Space) level -------------------------------------------
  const { data: realSpaces } = useSpaces(activeWorkspaceId);
  const spaces = useMemo(() => realSpaces ?? [], [realSpaces]);
  const boards = useMemo(() => spaces.map(mapBoard), [spaces]);

  const boardFromRoute = params?.boardSlug
    ? boards.find((b) => b.slug === params.boardSlug)
    : undefined;

  const activeBoardId =
    boardFromRoute?.id ?? boardIdOverride ?? boards[0]?.id ?? "";

  const setActiveBoardId = useCallback(
    (boardId: string) => {
      setBoardIdOverride(boardId);
      const board = boards.find((b) => b.id === boardId);
      if (board && activeWorkspace.slug) {
        router.push(`/workspaces/${activeWorkspace.slug}/boards/${board.slug}`);
      }
    },
    [boards, activeWorkspace.slug, router],
  );

  const activeBoard =
    boards.find((b) => b.id === activeBoardId) ??
    boards[0] ??
    PLACEHOLDER_BOARD;
  const activeSpace = spaces.find((s) => s.id === activeBoard.id);
  const listId = activeSpace?.lists?.[0]?.id ?? "";

  // ---- Column (= Status) level -----------------------------------------
  const { data: realStatuses } = useStatuses(listId);
  const columns = useMemo(
    () => (realStatuses ?? []).map((s) => mapColumn(s, activeBoard.id)),
    [realStatuses, activeBoard.id],
  );

  // ---- Custom fields (per-board field definitions) -----------------------
  const { data: realFields } = useFields(listId);
  const fields = useMemo(() => realFields ?? [], [realFields]);

  // ---- Members (workspace members) --------------------------------------
  const { data: realMembers } = useWorkspaceMembers(activeWorkspaceId);
  const members = useMemo(() => {
    const mapped = (realMembers ?? []).map(mapMember);
    if (mapped.length > 0) {
      if (currentUser) {
        mapped.sort((a, b) => {
          if (a.id === currentUser.id) return -1;
          if (b.id === currentUser.id) return 1;
          return 0;
        });
      }
      return mapped;
    }
    if (currentUser) {
      const displayName = currentUser.name || currentUser.email;
      return [
        {
          id: currentUser.id,
          name: displayName,
          avatar: getAvatarUrl(displayName),
          role: "Thành viên",
          email: currentUser.email,
        },
      ];
    }
    return [];
  }, [realMembers, currentUser]);

  // ---- Tasks (= Items) ---------------------------------------------------
  const { data: realItems } = useItems(listId);
  const tasks = useMemo(
    () =>
      (realItems ?? []).map((item) =>
        mapItemToTask(item, activeBoard.id, members, activeBoard.key),
      ),
    [realItems, activeBoard.id, activeBoard.key, members],
  );

  // ---- UI-only state ------------------------------------------------------
  const [viewMode, setViewMode] = useState<ViewMode>("kanban");
  const [language, setLanguage] = useState<Language>("vi");
  const [themeMode, setThemeMode] = useState<ThemeMode>("light");
  const [zenMode, setZenMode] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);
  const [isNewBoardModalOpen, setIsNewBoardModalOpen] = useState(false);
  const [isCreateIssueModalOpen, setIsCreateIssueModalOpen] = useState(false);
  const [createIssueDefaultColumnId, setCreateIssueDefaultColumnId] =
    useState<string | null>(null);
  const [isCustomFieldsModalOpen, setIsCustomFieldsModalOpen] = useState(false);
  const [isMembersModalOpen, setIsMembersModalOpen] = useState(false);
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    searchQuery: "",
    priorities: [],
    assigneeIds: [],
    labelIds: [],
    hasDueDateOnly: false,
  });

  const selectedTask = useMemo(
    () => tasks.find((t) => t.id === selectedTaskId) ?? null,
    [tasks, selectedTaskId],
  );

  const t = useMemo(() => TRANSLATIONS[language], [language]);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", themeMode === "dark");
  }, [themeMode]);

  const toggleThemeMode = useCallback(() => {
    setThemeMode((prev) => (prev === "light" ? "dark" : "light"));
  }, []);

  const toggleZenMode = useCallback(() => {
    setZenMode((prev) => !prev);
  }, []);

  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      if (task.boardId !== activeBoard.id) return false;

      if (filterOptions.searchQuery.trim()) {
        const query = filterOptions.searchQuery.toLowerCase();
        const matchesTitle = task.title.toLowerCase().includes(query);
        const matchesDesc = task.description.toLowerCase().includes(query);
        const matchesLabel = task.labels.some((l) =>
          l.name.toLowerCase().includes(query),
        );
        const matchesAssignee = task.assignees.some((a) =>
          a.name.toLowerCase().includes(query),
        );
        if (
          !matchesTitle &&
          !matchesDesc &&
          !matchesLabel &&
          !matchesAssignee
        ) {
          return false;
        }
      }

      if (
        filterOptions.priorities.length > 0 &&
        !filterOptions.priorities.includes(task.priority)
      ) {
        return false;
      }

      if (filterOptions.assigneeIds.length > 0) {
        const hasMatchingAssignee = task.assignees.some((a) =>
          filterOptions.assigneeIds.includes(a.id),
        );
        if (!hasMatchingAssignee) return false;
      }

      if (filterOptions.labelIds.length > 0) {
        const hasMatchingLabel = task.labels.some((l) =>
          filterOptions.labelIds.includes(l.id),
        );
        if (!hasMatchingLabel) return false;
      }

      if (filterOptions.hasDueDateOnly && !task.dueDate) {
        return false;
      }

      return true;
    });
  }, [tasks, activeBoard.id, filterOptions]);

  const getTasksByColumn = useCallback(
    (columnId: string) => {
      return filteredTasks
        .filter((task) => task.columnId === columnId)
        .sort((a, b) => a.order - b.order);
    },
    [filteredTasks],
  );

  // ---- Mutations ------------------------------------------------------------
  const createWorkspaceMutation = useCreateWorkspace();
  const createSpaceMutation = useCreateSpace(activeWorkspaceId);
  const updateSpaceMutation = useUpdateSpace(activeWorkspaceId);
  const deleteSpaceMutation = useDeleteSpace(activeWorkspaceId);
  const createStatusMutation = useCreateStatus(listId);
  const updateStatusMutation = useUpdateStatus(listId);
  const deleteStatusMutation = useDeleteStatus(listId);
  const createItemMutation = useCreateItem(listId);
  const updateItemMutation = useUpdateItem(listId);
  const deleteItemMutation = useDeleteItem(listId);
  const createFieldMutation = useCreateField(listId);
  const updateFieldMutation = useUpdateField(listId);
  const deleteFieldMutation = useDeleteField(listId);

  const createWorkspace = useCallback(
    (name: string) => {
      createWorkspaceMutation.mutate(name, {
        onSuccess: (ws) => {
          setWorkspaceIdOverride(ws.id);
          setBoardIdOverride(null);
          router.push(`/workspaces/${ws.slug}`);
        },
      });
    },
    [createWorkspaceMutation, router],
  );

  const addBoard = useCallback(
    (
      title: string,
      description: string,
      icon = "📋",
      backgroundStyle: Board["backgroundStyle"] = "paper-white",
      category: Board["category"] = "general",
    ) => {
      createSpaceMutation.mutate(
        { name: title, description, icon, color: backgroundStyle, category },
        {
          onSuccess: (space) => {
            setBoardIdOverride(space.id);
            if (activeWorkspace.slug) {
              router.push(
                `/workspaces/${activeWorkspace.slug}/boards/${space.slug}`,
              );
            }
          },
        },
      );
    },
    [createSpaceMutation, activeWorkspace.slug, router],
  );

  const updateBoard = useCallback(
    (boardId: string, updates: Partial<Board>) => {
      const payload: UpdateSpacePayload = {};
      if (updates.title !== undefined) payload.name = updates.title;
      if (updates.description !== undefined)
        payload.description = updates.description;
      if (updates.icon !== undefined) payload.icon = updates.icon;
      if (updates.backgroundStyle !== undefined)
        payload.color = updates.backgroundStyle;
      if (updates.category !== undefined) payload.category = updates.category;
      updateSpaceMutation.mutate({ spaceId: boardId, payload });
    },
    [updateSpaceMutation],
  );

  const deleteBoard = useCallback(
    (boardId: string) => {
      deleteSpaceMutation.mutate(boardId, {
        onSuccess: () => {
          setBoardIdOverride((prev) => (prev === boardId ? null : prev));
        },
      });
    },
    [deleteSpaceMutation],
  );

  const addColumn = useCallback(
    (title: string, colorAccent = "#3b82f6") => {
      createStatusMutation.mutate({ name: title, color: colorAccent });
    },
    [createStatusMutation],
  );

  const updateColumn = useCallback(
    (columnId: string, updates: Partial<Column>) => {
      const payload: UpdateStatusPayload = {};
      if (updates.title !== undefined) payload.name = updates.title;
      if (updates.colorAccent !== undefined)
        payload.color = updates.colorAccent;
      updateStatusMutation.mutate({ statusId: columnId, payload });
    },
    [updateStatusMutation],
  );

  const deleteColumn = useCallback(
    (columnId: string) => {
      deleteStatusMutation.mutate(columnId);
    },
    [deleteStatusMutation],
  );

  const addTask = useCallback(
    (
      columnId: string,
      title: string,
      priority: Priority = "medium",
      issueType: IssueType = "task",
    ) => {
      const tasksInColumn = tasks.filter((tk) => tk.columnId === columnId);
      const maxOrder = tasksInColumn.reduce(
        (max, tk) => Math.max(max, tk.order),
        -1,
      );
      createItemMutation.mutate({
        title,
        statusId: columnId,
        kanbanOrder: maxOrder + 1,
        data: { priority, issueType },
      });
    },
    [tasks, createItemMutation],
  );

  const createIssue = useCallback(
    (input: CreateIssueInput) => {
      const tasksInColumn = tasks.filter((tk) => tk.columnId === input.columnId);
      const maxOrder = tasksInColumn.reduce(
        (max, tk) => Math.max(max, tk.order),
        -1,
      );
      createItemMutation.mutate({
        title: input.title,
        statusId: input.columnId,
        kanbanOrder: maxOrder + 1,
        data: {
          description: input.description ?? "",
          issueType: input.issueType,
          priority: input.priority,
          assigneeIds: input.assigneeIds ?? [],
          dueDate: input.dueDate,
          customFields: input.customFields ?? {},
        },
      });
    },
    [tasks, createItemMutation],
  );

  const createField = useCallback(
    (input: { name: string; type: FieldType; config?: Record<string, unknown> }) => {
      createFieldMutation.mutate(input);
    },
    [createFieldMutation],
  );

  const updateFieldDef = useCallback(
    (
      fieldId: string,
      updates: Partial<{
        name: string;
        type: FieldType;
        config: Record<string, unknown>;
        isHidden: boolean;
      }>,
    ) => {
      updateFieldMutation.mutate({ fieldId, payload: updates });
    },
    [updateFieldMutation],
  );

  const deleteFieldDef = useCallback(
    (fieldId: string) => {
      deleteFieldMutation.mutate(fieldId);
    },
    [deleteFieldMutation],
  );

  const updateTask = useCallback(
    (taskId: string, updates: Partial<Task>) => {
      const current = tasks.find((tk) => tk.id === taskId);
      if (!current) return;
      const merged: Task = { ...current, ...updates };

      const payload: UpdateItemPayload = {
        data: taskToItemData(merged) as unknown as Record<string, unknown>,
      };
      if (updates.title !== undefined) payload.title = updates.title;
      if (updates.columnId !== undefined) payload.statusId = updates.columnId;
      if (updates.order !== undefined) payload.kanbanOrder = updates.order;

      updateItemMutation.mutate({ itemId: taskId, payload });
    },
    [tasks, updateItemMutation],
  );

  const deleteTask = useCallback(
    (taskId: string) => {
      deleteItemMutation.mutate(taskId, {
        onSuccess: () => {
          setSelectedTaskId((prev) => (prev === taskId ? null : prev));
        },
      });
    },
    [deleteItemMutation],
  );

  const duplicateTask = useCallback(
    (taskId: string) => {
      const original = tasks.find((tk) => tk.id === taskId);
      if (!original) return;
      createItemMutation.mutate({
        title: `${original.title} (Bản sao)`,
        statusId: original.columnId,
        data: taskToItemData(original) as unknown as Record<string, unknown>,
      });
    },
    [tasks, createItemMutation],
  );

  const moveTask = useCallback(
    (taskId: string, targetColumnId: string, targetIndex?: number) => {
      const targetColumnTasks = tasks
        .filter((tk) => tk.columnId === targetColumnId && tk.id !== taskId)
        .sort((a, b) => a.order - b.order);

      let newOrder: number;
      if (
        targetIndex === undefined ||
        targetIndex >= targetColumnTasks.length
      ) {
        newOrder = midpointOrder(
          targetColumnTasks[targetColumnTasks.length - 1]?.order,
          undefined,
        );
      } else if (targetIndex <= 0) {
        newOrder = midpointOrder(undefined, targetColumnTasks[0]?.order);
      } else {
        newOrder = midpointOrder(
          targetColumnTasks[targetIndex - 1]?.order,
          targetColumnTasks[targetIndex]?.order,
        );
      }

      updateItemMutation.mutate({
        itemId: taskId,
        payload: { statusId: targetColumnId, kanbanOrder: newOrder },
      });
    },
    [tasks, updateItemMutation],
  );

  const addComment = useCallback(
    (taskId: string, commentText: string) => {
      if (!commentText.trim()) return;
      const current = tasks.find((tk) => tk.id === taskId);
      if (!current) return;

      const me = members[0];
      const merged: Task = {
        ...current,
        activities: [
          {
            id: `act-${Date.now()}`,
            author: me ?? {
              id: "",
              name: "Ẩn danh",
              avatar: getAvatarUrl("?"),
              role: "",
              email: "",
            },
            action: "bình luận",
            comment: commentText.trim(),
            timestamp: new Date().toLocaleString("vi-VN"),
          },
          ...current.activities,
        ],
      };

      updateItemMutation.mutate({
        itemId: taskId,
        payload: {
          data: taskToItemData(merged) as unknown as Record<string, unknown>,
        },
      });
    },
    [tasks, members, updateItemMutation],
  );

  // The backend has no Label table (see app/lib/labels.ts) — FilterDrawer /
  // TaskDetailModal read the full fixed palette from `labels`.
  const labels: Label[] = LABEL_PALETTE;

  const value: ProjectContextType = {
    workspaces,
    activeWorkspace,
    activeWorkspaceId,
    setActiveWorkspaceId,
    selectWorkspace,
    isWorkspaceSelectorOpen,
    setIsWorkspaceSelectorOpen,
    alwaysShowWorkspaceSelector,
    setAlwaysShowWorkspaceSelector,

    boards,
    activeBoard,
    setActiveBoardId,
    columns,
    tasks,
    members,
    labels,

    viewMode,
    setViewMode,
    language,
    setLanguage,
    themeMode,
    toggleThemeMode,
    zenMode,
    toggleZenMode,

    filterOptions,
    setFilterOptions,

    selectedTaskId,
    setSelectedTaskId,
    selectedTask,

    isCommandPaletteOpen,
    setIsCommandPaletteOpen,
    isFilterDrawerOpen,
    setIsFilterDrawerOpen,
    isNewBoardModalOpen,
    setIsNewBoardModalOpen,
    isCreateIssueModalOpen,
    setIsCreateIssueModalOpen,
    createIssueDefaultColumnId,
    setCreateIssueDefaultColumnId,
    isCustomFieldsModalOpen,
    setIsCustomFieldsModalOpen,
    isMembersModalOpen,
    setIsMembersModalOpen,

    fields,
    createField,
    updateFieldDef,
    deleteFieldDef,

    filteredTasks,
    getTasksByColumn,
    t,

    createWorkspace,
    addBoard,
    updateBoard,
    deleteBoard,
    addColumn,
    updateColumn,
    deleteColumn,
    addTask,
    createIssue,
    updateTask,
    deleteTask,
    duplicateTask,
    moveTask,
    addComment,
  };

  return (
    <ProjectContext.Provider value={value}>{children}</ProjectContext.Provider>
  );
};

export const useProject = () => {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error("useProject must be used within a ProjectProvider");
  }
  return context;
};
