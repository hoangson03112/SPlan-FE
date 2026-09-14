"use client";

import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Building2,
  Plus,
  Search,
  Star,
  Users,
  ArrowRight,
  CheckCircle2,
  Clock,
  FolderKanban,
  Grid3X3,
  List,
  Sun,
  Moon,
  Check,
  Copy,
  MoreHorizontal,
  KeyRound,
  ShieldCheck,
  Sparkles,
  X,
  Mail,
  Globe,
  Trash2,
  Edit3,
  ChevronRight,
  Briefcase,
} from "lucide-react";
import { useProject } from "@/app/context/ProjectProvider";
import { Workspace } from "@/app/types/types";
import Link from "next/link";

export const WorkspaceSelector: React.FC = () => {
  const {
    workspaces,
    activeWorkspaceId,
    selectWorkspace,
    createWorkspace,
    alwaysShowWorkspaceSelector,
    setAlwaysShowWorkspaceSelector,
    boards,
    members,
    themeMode,
    toggleThemeMode,
    language,
    setLanguage,
  } = useProject();

  // Search & Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<
    "all" | "starred" | "owner" | "shared"
  >("all");
  const [viewStyle, setViewStyle] = useState<"grid" | "list">("grid");

  // Modals & Popovers
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
  const [editingWorkspace, setEditingWorkspace] = useState<Workspace | null>(
    null,
  );
  const [activeMenuWorkspaceId, setActiveMenuWorkspaceId] = useState<
    string | null
  >(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Form states for Create Workspace
  const [newWsName, setNewWsName] = useState("");
  const [newWsDesc, setNewWsDesc] = useState("");
  const [newWsIcon, setNewWsIcon] = useState("🚀");
  const [newWsAccent, setNewWsAccent] = useState("#D97706");
  const [newWsCategory, setNewWsCategory] = useState("Truyền thông & Nội dung");
  const [newWsInvites, setNewWsInvites] = useState("");

  // Form state for Join Code
  const [joinCode, setJoinCode] = useState("");
  const [joinError, setJoinError] = useState("");

  // Toast feedback helper
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3200);
  };

  // Emojis and Colors palette for creation
  const ICON_CHOICES = [
    "🎬",
    "🎉",
    "☕",
    "📚",
    "🚀",
    "💼",
    "🎨",
    "🔬",
    "🌿",
    "🎯",
    "⚡",
    "🏗️",
  ];
  const ACCENT_CHOICES = [
    { label: "Hổ phách", color: "#D97706" },
    { label: "Tím thạch anh", color: "#6366F1" },
    { label: "Xanh lục bảo", color: "#059669" },
    { label: "Xanh biển trời", color: "#0284C7" },
    { label: "Hồng thạch đào", color: "#DB2777" },
    { label: "Than đá", color: "#4B5563" },
  ];
  const CATEGORY_CHOICES = [
    "Truyền thông & Nội dung",
    "Sự kiện & Agency",
    "Kinh doanh & Vận hành",
    "Cá nhân & Phát triển",
    "Công nghệ & Phần mềm",
    "Giáo dục & Nghiên cứu",
  ];

  // Per-workspace stats come straight from the backend (WorkspaceService.
  // getWorkspacesOfMe) — `boards`/`tasks` in context only ever hold the
  // *active* workspace's data, so they can't be used to compute this for
  // every workspace in the grid.
  const workspaceStats = useMemo(() => {
    const stats: Record<
      string,
      {
        boardsCount: number;
        tasksCount: number;
        completedTasksCount: number;
        progressPercent: number;
        workspaceBoards: typeof boards;
      }
    > = {};

    workspaces.forEach((ws) => {
      const boardsCount = ws.boardsCount ?? 0;
      const tasksCount = ws.tasksCount ?? 0;
      const completedTasksCount = ws.completedTasksCount ?? 0;
      const isActiveWorkspace = ws.id === activeWorkspaceId;

      stats[ws.id] = {
        boardsCount,
        tasksCount,
        completedTasksCount,
        progressPercent:
          tasksCount > 0
            ? Math.round((completedTasksCount / tasksCount) * 100)
            : 0,
        workspaceBoards: isActiveWorkspace ? boards : [],
      };
    });

    return stats;
  }, [workspaces, boards, activeWorkspaceId]);

  // Filtered & Sorted Workspaces
  const filteredWorkspaces = useMemo(() => {
    return workspaces
      .filter((ws) => {
        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchName = ws.name.toLowerCase().includes(q);
          const matchDesc = ws.description.toLowerCase().includes(q);
          const matchCat = ws.category.toLowerCase().includes(q);
          if (!matchName && !matchDesc && !matchCat) return false;
        }

        // Role / Star filter
        if (roleFilter === "starred") {
          return ws.isStarred;
        }
        if (roleFilter === "owner") {
          return ws.role === "owner";
        }
        if (roleFilter === "shared") {
          return ws.role !== "owner";
        }
        return true;
      })
      .sort((a, b) => {
        // Starred items first
        if (a.isStarred && !b.isStarred) return -1;
        if (!a.isStarred && b.isStarred) return 1;
        return 0;
      });
  }, [workspaces, searchQuery, roleFilter]);

  // Overall metrics summary — summed across every workspace, from the same
  // backend-provided per-workspace counts used in `workspaceStats` above.
  const totalTasksCount = useMemo(
    () => workspaces.reduce((sum, ws) => sum + (ws.tasksCount ?? 0), 0),
    [workspaces],
  );
  const totalBoardsCount = useMemo(
    () => workspaces.reduce((sum, ws) => sum + (ws.boardsCount ?? 0), 0),
    [workspaces],
  );

  // The backend only accepts a name when creating a workspace today — the
  // icon/description/category/invite fields below are collected for parity
  // with the design but aren't persisted anywhere yet.
  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWsName.trim()) return;

    createWorkspace(newWsName.trim());
    setIsCreateModalOpen(false);
    setNewWsName("");
    setNewWsDesc("");
    setNewWsInvites("");
  };

  // Visual only — no workspace mutation wired up yet.
  const handleJoinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setJoinError("");
    if (!joinCode.trim()) {
      setJoinError("Vui lòng nhập mã lời mời.");
      return;
    }

    setIsJoinModalOpen(false);
    setJoinCode("");
  };

  // Quick copy slug link
  const handleCopyLink = (ws: Workspace) => {
    navigator.clipboard.writeText(`https://kanban.studio/w/${ws.slug}`);
    showToast(`Đã sao chép liên kết không gian "${ws.name}"`);
    setActiveMenuWorkspaceId(null);
  };

  return (
    <div
      id="workspace-selection-screen"
      className="min-h-screen bg-[#FAF8F5] dark:bg-[#12100E] text-[#2C2723] dark:text-[#EDE8E1] transition-colors duration-200 flex flex-col relative selection:bg-[#8C6B4F] selection:text-white"
    >
      {/* Subtle Atelier Ambient Gradient */}
      <div
        className="pointer-events-none absolute inset-0 opacity-45 dark:opacity-25"
        style={{
          backgroundImage: `
            radial-gradient(at 0% 0%, rgba(217, 119, 6, 0.08) 0px, transparent 50%),
            radial-gradient(at 100% 0%, rgba(99, 102, 241, 0.08) 0px, transparent 50%),
            radial-gradient(at 50% 100%, rgba(5, 150, 105, 0.06) 0px, transparent 50%)
          `,
        }}
      />

      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-5 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-full bg-[#2C2723] dark:bg-[#EDE8E1] text-[#FAF8F5] dark:text-[#141210] text-xs font-semibold shadow-xl flex items-center gap-2"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#F59E0B] flex-shrink-0" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top Application Header */}
      <header
        id="workspace-header"
        className="relative z-20 border-b border-[#E8E2D8]/80 dark:border-[#26201B]/80 bg-[#FAF8F5]/85 dark:bg-[#12100E]/85 backdrop-blur-xl px-4 sm:px-8 py-3"
      >
        <div className="max-w-8xl mx-auto flex items-center justify-between gap-4">
          {/* Brand Logo & Identifier */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#8C6B4F] to-[#5A4330] text-white flex items-center justify-center font-editorial text-lg font-bold shadow-sm">
              K
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-editorial text-base sm:text-lg font-bold tracking-tight text-[#2C2723] dark:text-[#EDE8E1]">
                  Kanban Studio
                </span>
                <span className="px-2 py-0.5 rounded-full bg-[#EFE9E0] dark:bg-[#26201B] text-[#786C60] dark:text-[#A6998C] text-[10px] font-mono-data tracking-wide font-medium">
                  Gateway v2.6
                </span>
              </div>
              <p className="text-[11px] text-[#8E8378] dark:text-[#9E9082]">
                Không gian làm việc & Điều phối dự án
              </p>
            </div>
          </div>

          {/* Right utility buttons & User Profile */}
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Language Switcher */}
            <button
              id="btn-switch-lang"
              onClick={() => setLanguage(language === "vi" ? "en" : "vi")}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-[#E5DFD5] dark:border-[#2C2621] text-xs font-medium text-[#6B5F54] dark:text-[#B0A396] hover:bg-[#F2ECE3] dark:hover:bg-[#1E1915] transition-all"
              title="Đổi ngôn ngữ"
            >
              <Globe className="w-3.5 h-3.5" />
              <span className="uppercase">{language}</span>
            </button>

            {/* Theme Toggle */}
            <button
              id="btn-toggle-theme"
              onClick={toggleThemeMode}
              className="p-2 rounded-xl border border-[#E5DFD5] dark:border-[#2C2621] text-[#6B5F54] dark:text-[#B0A396] hover:bg-[#F2ECE3] dark:hover:bg-[#1E1915] transition-all"
              title={
                themeMode === "light"
                  ? "Chuyển sang giao diện Tối"
                  : "Chuyển sang giao diện Sáng"
              }
            >
              {themeMode === "light" ? (
                <Moon className="w-4 h-4" />
              ) : (
                <Sun className="w-4 h-4 text-amber-400" />
              )}
            </button>

            <div className="h-5 w-px bg-[#E5DFD5] dark:bg-[#2C2621] hidden sm:block" />

            {/* Current Logged-in User Profile Chip */}
            <div
              id="user-profile-chip"
              className="flex items-center gap-2.5 px-3 py-1.5 rounded-2xl bg-[#F2ECE3]/80 dark:bg-[#1C1814]/80 border border-[#E5DFD5] dark:border-[#2C2621]"
            >
              <img
                src={
                  members[0]?.avatar ||
                  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"
                }
                alt={members[0]?.name || "User"}
                className="w-7 h-7 rounded-full object-cover border border-[#DDD3C3] dark:border-[#382F27]"
              />
              <div className="hidden sm:block text-left">
                <div className="text-xs font-semibold text-[#2C2723] dark:text-[#EDE8E1] leading-tight">
                  {members[0]?.name || "Mai Anh"}
                </div>
                <div className="text-[10px] text-[#8E8378] dark:text-[#9E9082]">
                  {members[0]?.email || "maianh@example.com"}
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Selection Area */}
      <main className="relative z-10 flex-1 max-w-7xl mx-auto w-full px-4 sm:px-8 py-6 sm:py-10 flex flex-col">
        {/* Welcome Section */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#EFE7DC] dark:bg-[#241E18] text-[#8C6B4F] dark:text-[#D4B89D] border border-[#E0D5C7] dark:border-[#362D24]">
                  <Sparkles className="w-3 h-3" />
                  <span>Sẵn sàng làm việc</span>
                </span>
                <span className="text-xs text-[#8E8378]">
                  • Cập nhật {workspaces.length} không gian
                </span>
              </div>
              <h1 className="font-editorial text-3xl sm:text-4xl font-bold tracking-tight text-[#2C2723] dark:text-[#EDE8E1]">
                Chọn Không Gian Làm Việc
              </h1>
              <p className="mt-1.5 text-sm sm:text-base text-[#6B5F54] dark:text-[#A89C8F] max-w-2xl leading-relaxed">
                Chào mừng bạn trở lại! Hãy chọn không gian tương ứng để truy cập
                các bảng kế hoạch, theo dõi tiến độ và điều phối thành viên.
              </p>
            </div>

            {/* Quick Global Summary Badges */}
            <div className="flex items-center gap-3">
              <div className="px-4 py-2.5 rounded-2xl bg-white/70 dark:bg-[#191512]/70 border border-[#E8E2D8] dark:border-[#28221C] shadow-xs text-left">
                <div className="text-[11px] font-medium text-[#8E8378]">
                  Tổng số dự án
                </div>
                <div className="text-lg font-bold font-mono-data text-[#2C2723] dark:text-[#EDE8E1]">
                  {totalBoardsCount}{" "}
                  <span className="text-xs font-normal text-[#8E8378]">
                    bảng
                  </span>
                </div>
              </div>
              <div className="px-4 py-2.5 rounded-2xl bg-white/70 dark:bg-[#191512]/70 border border-[#E8E2D8] dark:border-[#28221C] shadow-xs text-left">
                <div className="text-[11px] font-medium text-[#8E8378]">
                  Nhiệm vụ đang xử lý
                </div>
                <div className="text-lg font-bold font-mono-data text-[#8C6B4F] dark:text-[#D4B89D]">
                  {totalTasksCount}{" "}
                  <span className="text-xs font-normal text-[#8E8378]">
                    việc
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Toolbar: Search, Role Filter, View Switch, Actions */}
        <div
          id="workspace-toolbar"
          className="mb-6 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3.5 p-2.5 sm:p-3 rounded-2xl bg-white/60 dark:bg-[#181411]/60 border border-[#E8E2D8] dark:border-[#28221C] backdrop-blur-md shadow-xs"
        >
          {/* Search Input & Role Pills */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 flex-1 min-w-0">
            {/* Search Input */}
            <div className="relative flex-1 min-w-[200px]">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9E9082]" />
              <input
                id="search-workspaces-input"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm không gian theo tên, mô tả hoặc danh mục..."
                className="w-full pl-9 pr-8 py-2 text-xs sm:text-sm rounded-xl bg-[#FAF8F5] dark:bg-[#1F1A15] border border-[#E5DFD5] dark:border-[#2C2621] text-[#2C2723] dark:text-[#EDE8E1] placeholder-[#A09285] focus:outline-none focus:border-[#8C6B4F] transition-colors"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#9E9082] hover:text-[#2C2723] dark:hover:text-[#EDE8E1]"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Filter Chips */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
              <button
                id="filter-role-all"
                onClick={() => setRoleFilter("all")}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  roleFilter === "all"
                    ? "bg-[#2C2723] text-[#FAF8F5] dark:bg-[#EDE8E1] dark:text-[#181512] shadow-xs"
                    : "text-[#6B5F54] dark:text-[#B0A396] hover:bg-[#EFE9E0] dark:hover:bg-[#201C18]"
                }`}
              >
                Tất cả ({workspaces.length})
              </button>
              <button
                id="filter-role-starred"
                onClick={() => setRoleFilter("starred")}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  roleFilter === "starred"
                    ? "bg-[#2C2723] text-[#FAF8F5] dark:bg-[#EDE8E1] dark:text-[#181512] shadow-xs"
                    : "text-[#6B5F54] dark:text-[#B0A396] hover:bg-[#EFE9E0] dark:hover:bg-[#201C18]"
                }`}
              >
                <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                <span>
                  Yêu thích ({workspaces.filter((w) => w.isStarred).length})
                </span>
              </button>
              <button
                id="filter-role-owner"
                onClick={() => setRoleFilter("owner")}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  roleFilter === "owner"
                    ? "bg-[#2C2723] text-[#FAF8F5] dark:bg-[#EDE8E1] dark:text-[#181512] shadow-xs"
                    : "text-[#6B5F54] dark:text-[#B0A396] hover:bg-[#EFE9E0] dark:hover:bg-[#201C18]"
                }`}
              >
                Của tôi ({workspaces.filter((w) => w.role === "owner").length})
              </button>
              <button
                id="filter-role-shared"
                onClick={() => setRoleFilter("shared")}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  roleFilter === "shared"
                    ? "bg-[#2C2723] text-[#FAF8F5] dark:bg-[#EDE8E1] dark:text-[#181512] shadow-xs"
                    : "text-[#6B5F54] dark:text-[#B0A396] hover:bg-[#EFE9E0] dark:hover:bg-[#201C18]"
                }`}
              >
                Được chia sẻ (
                {workspaces.filter((w) => w.role !== "owner").length})
              </button>
            </div>
          </div>

          {/* View Toggle & Action Buttons */}
          <div className="flex items-center justify-between sm:justify-end gap-2.5 pt-2 lg:pt-0 border-t lg:border-t-0 border-[#EFE9E0] dark:border-[#26201B]">
            {/* View Mode Toggle */}
            <div className="flex items-center p-1 rounded-xl bg-[#EFE9E0] dark:bg-[#201B17] border border-[#E5DFD5] dark:border-[#2C2621]">
              <button
                id="btn-view-grid"
                onClick={() => setViewStyle("grid")}
                className={`p-1.5 rounded-lg text-xs transition-all ${
                  viewStyle === "grid"
                    ? "bg-white dark:bg-[#2C2621] text-[#2C2723] dark:text-[#EDE8E1] shadow-2xs"
                    : "text-[#8E8378] hover:text-[#2C2723] dark:hover:text-[#EDE8E1]"
                }`}
                title="Dạng lưới thẻ"
              >
                <Grid3X3 className="w-3.5 h-3.5" />
              </button>
              <button
                id="btn-view-list"
                onClick={() => setViewStyle("list")}
                className={`p-1.5 rounded-lg text-xs transition-all ${
                  viewStyle === "list"
                    ? "bg-white dark:bg-[#2C2621] text-[#2C2723] dark:text-[#EDE8E1] shadow-2xs"
                    : "text-[#8E8378] hover:text-[#2C2723] dark:hover:text-[#EDE8E1]"
                }`}
                title="Dạng danh sách gọn"
              >
                <List className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Join by Code Button */}
            <button
              id="btn-open-join-modal"
              onClick={() => {
                setJoinError("");
                setIsJoinModalOpen(true);
              }}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border border-[#DDD5C7] dark:border-[#382F27] bg-[#F7F2E9] dark:bg-[#1E1915] text-[#5C5146] dark:text-[#C7B9AC] hover:bg-[#EFE8DC] dark:hover:bg-[#26201B] transition-all"
            >
              <KeyRound className="w-3.5 h-3.5 text-[#8C6B4F]" />
              <span className="hidden sm:inline">Nhập mã mời</span>
              <span className="sm:hidden">Mã mời</span>
            </button>

            {/* Create Workspace Button */}
            <button
              id="btn-open-create-modal"
              onClick={() => setIsCreateModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-[#2C2723] dark:bg-[#EDE8E1] text-[#FAF8F5] dark:text-[#141210] hover:bg-[#433C36] dark:hover:bg-white shadow-sm transition-all hover:scale-[1.02]"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Tạo Workspace mới</span>
            </button>
          </div>
        </div>

        {/* Workspaces List / Grid */}
        {filteredWorkspaces.length === 0 ? (
          <div
            id="workspace-empty-state"
            className="flex-1 flex flex-col items-center justify-center p-12 text-center rounded-3xl border border-dashed border-[#DDD5C7] dark:border-[#332A22] bg-white/40 dark:bg-[#181411]/40 my-6"
          >
            <div className="w-14 h-14 rounded-2xl bg-[#EFE9E0] dark:bg-[#241E19] flex items-center justify-center text-2xl mb-4">
              🔍
            </div>
            <h3 className="font-editorial text-lg font-bold text-[#2C2723] dark:text-[#EDE8E1]">
              Không tìm thấy không gian làm việc phù hợp
            </h3>
            <p className="mt-1 text-xs text-[#8E8378] max-w-sm">
              Không có kết quả nào khớp với &quot;{searchQuery}&quot;. Hãy thử
              tìm với từ khóa khác hoặc tạo không gian mới.
            </p>
            <div className="mt-5 flex items-center gap-3">
              <button
                onClick={() => {
                  setSearchQuery("");
                  setRoleFilter("all");
                }}
                className="px-4 py-2 rounded-xl text-xs font-semibold border border-[#DDD5C7] dark:border-[#332A22] text-[#5C5146] dark:text-[#C7B9AC] hover:bg-[#EFE9E0] dark:hover:bg-[#201A15] transition-all"
              >
                Đặt lại bộ lọc
              </button>
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#2C2723] dark:bg-[#EDE8E1] text-[#FAF8F5] dark:text-[#141210] hover:scale-105 transition-all"
              >
                + Tạo Workspace mới
              </button>
            </div>
          </div>
        ) : viewStyle === "grid" ? (
          /* Grid View Layout */
          <div
            id="workspace-grid-container"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-5"
          >
            {filteredWorkspaces.map((ws, idx) => {
              const stats = workspaceStats[ws.id] || {
                boardsCount: 0,
                tasksCount: 0,
                completedTasksCount: 0,
                progressPercent: 0,
                workspaceBoards: [],
              };
              const isCurrentActive = ws.id === activeWorkspaceId;
              const isMenuOpen = activeMenuWorkspaceId === ws.id;

              return (
                <motion.div
                  key={ws.id}
                  id={`workspace-card-${ws.id}`}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, delay: idx * 0.04 }}
                  className={`group relative rounded-2xl p-5 transition-all duration-200 flex flex-col justify-between border ${
                    isCurrentActive
                      ? "bg-white dark:bg-[#1A1613] border-[#8C6B4F] dark:border-[#D4B89D] ring-2 ring-[#8C6B4F]/20 dark:ring-[#D4B89D]/20 shadow-md"
                      : "bg-white/80 dark:bg-[#181411]/80 hover:bg-white dark:hover:bg-[#1C1814] border-[#E8E2D8] dark:border-[#2C2621] hover:border-[#D1C7BA] dark:hover:border-[#403730] shadow-xs hover:shadow-md"
                  }`}
                >
                  {/* Top Row: Icon, Title, Role, Pin, Menu */}
                  <div>
                    <div className="flex items-start justify-between gap-3 mb-3.5">
                      <div className="flex items-center gap-3 min-w-0">
                        {/* Custom Styled Workspace Icon Badge */}
                        <div
                          className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl border shadow-2xs flex-shrink-0 transition-transform group-hover:scale-105"
                          style={{
                            backgroundColor: `${ws.accentColor}18`,
                            borderColor: `${ws.accentColor}35`,
                          }}
                        >
                          {ws.icon}
                        </div>

                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <h2 className="font-editorial text-base sm:text-lg font-bold text-[#2C2723] dark:text-[#EDE8E1] truncate group-hover:text-[#8C6B4F] dark:group-hover:text-[#D4B89D] transition-colors">
                              {ws.name}
                            </h2>
                            {isCurrentActive && (
                              <span className="flex-shrink-0 px-2 py-0.5 rounded-full text-[9px] font-bold tracking-wider uppercase bg-[#EAE2D5] dark:bg-[#2C241D] text-[#8C6B4F] dark:text-[#D4B89D] border border-[#DDD3C3] dark:border-[#3E342B]">
                                Đang chọn
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="text-[11px] font-mono-data text-[#8E8378] dark:text-[#9E9082]">
                              /{ws.slug}
                            </span>
                            <span className="text-[10px] text-[#A89C8F]">
                              •
                            </span>
                            <span className="text-[11px] text-[#8E8378] dark:text-[#9E9082] truncate max-w-[130px]">
                              {ws.category}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Card Action Controls: Star & Context Menu */}
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <button
                          id={`star-btn-${ws.id}`}
                          onClick={(e) => e.stopPropagation()}
                          className={`p-1.5 rounded-xl border border-transparent hover:border-[#E5DFD5] dark:hover:border-[#2C2621] transition-colors ${
                            ws.isStarred
                              ? "text-amber-500 fill-amber-500"
                              : "text-[#A09285] hover:text-[#2C2723] dark:hover:text-[#EDE8E1]"
                          }`}
                          title={ws.isStarred ? "Bỏ ghim" : "Ghim lên đầu"}
                        >
                          <Star
                            className={`w-4 h-4 ${ws.isStarred ? "fill-current" : ""}`}
                          />
                        </button>

                        {/* More Menu Popover Trigger */}
                        <div className="relative">
                          <button
                            id={`menu-trigger-${ws.id}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveMenuWorkspaceId(
                                isMenuOpen ? null : ws.id,
                              );
                            }}
                            className="p-1.5 rounded-xl text-[#A09285] hover:text-[#2C2723] dark:hover:text-[#EDE8E1] hover:bg-[#F2ECE3] dark:hover:bg-[#201B17] transition-colors"
                          >
                            <MoreHorizontal className="w-4 h-4" />
                          </button>

                          {/* Context Dropdown Menu */}
                          {isMenuOpen && (
                            <>
                              <div
                                className="fixed inset-0 z-30"
                                onClick={() => setActiveMenuWorkspaceId(null)}
                              />
                              <div
                                id={`menu-dropdown-${ws.id}`}
                                className="absolute right-0 mt-1.5 w-48 rounded-xl bg-white dark:bg-[#1A1613] border border-[#E5DFD5] dark:border-[#2C2621] shadow-xl p-1.5 z-40 animate-in fade-in zoom-in-95 duration-100 text-xs"
                              >
                                <button
                                  onClick={() => handleCopyLink(ws)}
                                  className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-left text-[#5C5146] dark:text-[#C7B9AC] hover:bg-[#F4EFE7] dark:hover:bg-[#241E18]"
                                >
                                  <Copy className="w-3.5 h-3.5" />
                                  <span>Sao chép liên kết</span>
                                </button>
                                <button
                                  onClick={() => {
                                    setEditingWorkspace(ws);
                                    setActiveMenuWorkspaceId(null);
                                  }}
                                  className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-left text-[#5C5146] dark:text-[#C7B9AC] hover:bg-[#F4EFE7] dark:hover:bg-[#241E18]"
                                >
                                  <Edit3 className="w-3.5 h-3.5" />
                                  <span>Đổi tên & mô tả</span>
                                </button>
                                {workspaces.length > 1 && (
                                  <button
                                    onClick={() =>
                                      setActiveMenuWorkspaceId(null)
                                    }
                                    className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-left text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                    <span>Xóa không gian</span>
                                  </button>
                                )}
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Workspace Description */}
                    <p className="text-xs text-[#6B5F54] dark:text-[#A89C8F] line-clamp-2 leading-relaxed mb-4 min-h-[36px]">
                      {ws.description}
                    </p>

                    {/* Role and Plan Badges */}
                    <div className="flex items-center gap-2 mb-4">
                      <span
                        className="px-2.5 py-1 rounded-lg text-[10px] font-bold tracking-wide uppercase flex items-center gap-1.5"
                        style={{
                          backgroundColor: `${ws.accentColor}15`,
                          color: ws.accentColor,
                        }}
                      >
                        <ShieldCheck className="w-3 h-3" />
                        <span>
                          {ws.role === "owner"
                            ? "Chủ sở hữu"
                            : ws.role === "admin"
                              ? "Quản trị viên"
                              : "Thành viên"}
                        </span>
                      </span>

                      <span className="px-2 py-0.5 rounded-lg text-[10px] font-semibold bg-[#EFE9E0] dark:bg-[#241E18] text-[#786C60] dark:text-[#A6998C] border border-[#E0D5C7] dark:border-[#352C23]">
                        Gói {ws.plan}
                      </span>

                      <span className="text-[11px] text-[#8E8378] ml-auto flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>{ws.lastActive}</span>
                      </span>
                    </div>

                    {/* Project Metrics Box */}
                    <div className="p-3 rounded-xl bg-[#FAF7F2] dark:bg-[#14110E] border border-[#EBE4D8] dark:border-[#26201B] mb-4 space-y-2.5">
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2 text-[#6B5F54] dark:text-[#B0A396]">
                          <FolderKanban className="w-3.5 h-3.5 text-[#8C6B4F]" />
                          <span className="font-medium">
                            {stats.boardsCount} Bảng dự án
                          </span>
                        </div>
                        <div className="text-[#8E8378] text-[11px] font-mono-data">
                          {stats.completedTasksCount}/{stats.tasksCount} hoàn
                          tất
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div>
                        <div className="w-full h-1.5 rounded-full bg-[#E5DFD5] dark:bg-[#26201B] overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-300"
                            style={{
                              width: `${stats.progressPercent}%`,
                              backgroundColor: ws.accentColor,
                            }}
                          />
                        </div>
                        <div className="flex justify-between items-center mt-1 text-[10px] text-[#8E8378]">
                          <span>Tiến độ tổng thể</span>
                          <span className="font-mono-data font-semibold">
                            {stats.progressPercent}%
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Bottom Footer: Members & Enter Button */}
                  <div className="pt-3 border-t border-[#EFE9E0] dark:border-[#241E19] flex items-center justify-between gap-3">
                    {/* Stacked Member Avatars */}
                    <div className="flex items-center -space-x-2 overflow-hidden">
                      {members.slice(0, 3).map((m, i) => (
                        <img
                          key={m.id}
                          src={m.avatar}
                          alt={m.name}
                          title={m.name}
                          className="inline-block h-6 w-6 rounded-full ring-2 ring-white dark:ring-[#181411] object-cover"
                        />
                      ))}
                      {members.length > 3 && (
                        <span className="inline-flex items-center justify-center h-6 w-6 rounded-full ring-2 ring-white dark:ring-[#181411] bg-[#E5DFD5] dark:bg-[#28221C] text-[9px] font-bold text-[#6B5F54] dark:text-[#B0A396]">
                          +{members.length - 3}
                        </span>
                      )}
                    </div>

                    {/* Enter Workspace Button */}
                    <Link
                      id={`enter-ws-${ws.id}`}
                      href={`/workspaces/${ws.slug}`}
                      className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-[#2C2723] dark:bg-[#EDE8E1] text-[#FAF8F5] dark:text-[#181512] hover:bg-[#433C36] dark:hover:bg-white group/btn transition-all hover:scale-[1.03]"
                    >
                      <span>Chi tiết</span>
                      <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover/btn:translate-x-1" />
                    </Link>
                  </div>
                </motion.div>
              );
            })}
          </div>
        ) : (
          /* List View Layout */
          <div id="workspace-list-container" className="space-y-3">
            {filteredWorkspaces.map((ws) => {
              const stats = workspaceStats[ws.id] || {
                boardsCount: 0,
                tasksCount: 0,
                completedTasksCount: 0,
                progressPercent: 0,
                workspaceBoards: [],
              };
              const isCurrentActive = ws.id === activeWorkspaceId;

              return (
                <div
                  key={ws.id}
                  id={`workspace-row-${ws.id}`}
                  onClick={() => selectWorkspace(ws.id)}
                  className={`group p-4 rounded-2xl border transition-all duration-150 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer ${
                    isCurrentActive
                      ? "bg-white dark:bg-[#1A1613] border-[#8C6B4F] dark:border-[#D4B89D] ring-1 ring-[#8C6B4F]/20 shadow-xs"
                      : "bg-white/80 dark:bg-[#181411]/80 hover:bg-white dark:hover:bg-[#1C1814] border-[#E8E2D8] dark:border-[#2C2621] hover:border-[#D1C7BA] dark:hover:border-[#3D342D]"
                  }`}
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div
                      className="w-11 h-11 rounded-xl flex items-center justify-center text-2xl border shadow-2xs flex-shrink-0"
                      style={{
                        backgroundColor: `${ws.accentColor}18`,
                        borderColor: `${ws.accentColor}35`,
                      }}
                    >
                      {ws.icon}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h2 className="font-editorial text-base font-bold text-[#2C2723] dark:text-[#EDE8E1] truncate group-hover:text-[#8C6B4F] dark:group-hover:text-[#D4B89D] transition-colors">
                          {ws.name}
                        </h2>
                        {ws.isStarred && (
                          <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500 flex-shrink-0" />
                        )}
                        <span className="text-[10px] px-2 py-0.5 rounded-md font-semibold bg-[#EFE9E0] dark:bg-[#221C17] text-[#786C60] dark:text-[#A6998C]">
                          {ws.category}
                        </span>
                      </div>
                      <p className="text-xs text-[#786C60] dark:text-[#9E9082] truncate max-w-md mt-0.5">
                        {ws.description}
                      </p>
                    </div>
                  </div>

                  {/* List View Meta & Action */}
                  <div className="flex items-center justify-between sm:justify-end gap-5 flex-shrink-0">
                    <div className="flex items-center gap-4 text-xs text-[#8E8378]">
                      <div className="flex items-center gap-1.5">
                        <FolderKanban className="w-3.5 h-3.5 text-[#8C6B4F]" />
                        <span>{stats.boardsCount} bảng</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#10B981]" />
                        <span className="font-mono-data">
                          {stats.progressPercent}%
                        </span>
                      </div>
                      <div className="hidden md:flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{ws.lastActive}</span>
                      </div>
                    </div>

                    <button
                      id={`list-enter-btn-${ws.id}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        selectWorkspace(ws.id);
                      }}
                      className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-[#2C2723] dark:bg-[#EDE8E1] text-[#FAF8F5] dark:text-[#181512] hover:bg-[#433C36] dark:hover:bg-white transition-all flex items-center gap-1.5"
                    >
                      <span>Vào</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Footer Preferences & Tips */}
        <div
          id="workspace-footer-banner"
          className="mt-10 pt-6 border-t border-[#E8E2D8] dark:border-[#26201B] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#8E8378]"
        >
          {/* Always Show Workspace Selector Checkbox */}
          <label className="flex items-center gap-2 cursor-pointer hover:text-[#2C2723] dark:hover:text-[#EDE8E1] transition-colors select-none">
            <input
              id="checkbox-always-show-selector"
              type="checkbox"
              checked={alwaysShowWorkspaceSelector}
              onChange={(e) => setAlwaysShowWorkspaceSelector(e.target.checked)}
              className="w-4 h-4 rounded border-[#D1C7BA] text-[#8C6B4F] focus:ring-[#8C6B4F] accent-[#8C6B4F]"
            />
            <span>Luôn hiển thị màn hình chọn Workspace khi mở ứng dụng</span>
          </label>

          {/* Quick Shortcuts & Navigation Tip */}
          <div className="flex items-center gap-3 text-[11px]">
            <span>
              Mẹo: Bạn có thể đổi workspace bất cứ lúc nào từ thanh Menu trên
              cùng
            </span>
          </div>
        </div>
      </main>

      {/* ========================================================= */}
      {/* Modal 1: Tạo Workspace Mới */}
      {/* ========================================================= */}
      <AnimatePresence>
        {isCreateModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-xs"
              onClick={() => setIsCreateModalOpen(false)}
            />

            <motion.div
              id="create-workspace-modal"
              initial={{ opacity: 0, scale: 0.96, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 15 }}
              className="relative z-10 w-full max-w-3xl rounded-3xl bg-[#FAF8F5] dark:bg-[#181411] border border-[#E5DFD5] dark:border-[#2C2621] shadow-2xl p-6 sm:p-7 overflow-hidden"
            >
              {/* Close button */}
              <button
                id="close-create-modal"
                onClick={() => setIsCreateModalOpen(false)}
                className="absolute top-5 right-5 p-1.5 rounded-full hover:bg-[#EFE9E0] dark:hover:bg-[#241E19] text-[#8E8378] hover:text-[#2C2723] dark:hover:text-[#EDE8E1] transition-colors"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-3 mb-5">
                <div
                  className="w-18 h-12 rounded-2xl flex items-center justify-center text-2xl border shadow-xs"
                  style={{
                    backgroundColor: `${newWsAccent}20`,
                    borderColor: `${newWsAccent}40`,
                  }}
                >
                  {newWsIcon}
                </div>
                <div>
                  <h3 className="font-editorial text-xl font-bold text-[#2C2723] dark:text-[#EDE8E1]">
                    Tạo Không Gian Làm Việc Mới
                  </h3>
                  <p className="text-xs text-[#8E8378]">
                    Tổ chức các bảng kế hoạch, phân loại đầu việc và mời đồng
                    nghiệp.
                  </p>
                </div>
              </div>

              <form onSubmit={handleCreateSubmit} className="space-y-4">
                {/* Name */}
                <div>
                  <label className="block text-xs font-semibold text-[#5C5146] dark:text-[#B5AAA0] mb-1.5">
                    Tên không gian làm việc{" "}
                    <span className="text-rose-500">*</span>
                  </label>
                  <input
                    id="input-ws-name"
                    type="text"
                    required
                    value={newWsName}
                    onChange={(e) => setNewWsName(e.target.value)}
                    placeholder="VD: Dự Án Quảng Cáo Mùa Hè 2026..."
                    className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-[#1F1A15] border border-[#E0D7CB] dark:border-[#2C2621] text-xs sm:text-sm text-[#2C2723] dark:text-[#EDE8E1] placeholder-[#A09285] focus:outline-none focus:border-[#8C6B4F]"
                  />
                  {newWsName && (
                    <p className="mt-1 text-[11px] font-mono-data text-[#8E8378]">
                      Liên kết: kanban.studio/w/
                      {newWsName.toLowerCase().replace(/[^a-z0-9]+/g, "-")}
                    </p>
                  )}
                </div>

                {/* Category & Icon Picker */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-[#5C5146] dark:text-[#B5AAA0] mb-1.5">
                      Lĩnh vực hoạt động
                    </label>
                    <select
                      id="select-ws-category"
                      value={newWsCategory}
                      onChange={(e) => setNewWsCategory(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-white dark:bg-[#1F1A15] border border-[#E0D7CB] dark:border-[#2C2621] text-xs text-[#2C2723] dark:text-[#EDE8E1] focus:outline-none focus:border-[#8C6B4F]"
                    >
                      {CATEGORY_CHOICES.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#5C5146] dark:text-[#B5AAA0] mb-1.5">
                      Tông màu nhận diện
                    </label>
                    <div className="flex items-center gap-1.5 pt-1">
                      {ACCENT_CHOICES.map((item) => (
                        <button
                          key={item.color}
                          type="button"
                          onClick={() => setNewWsAccent(item.color)}
                          className={`w-6 h-6 rounded-full transition-transform ${
                            newWsAccent === item.color
                              ? "scale-125 ring-2 ring-offset-2 ring-[#2C2723] dark:ring-[#EDE8E1]"
                              : "hover:scale-110"
                          }`}
                          style={{ backgroundColor: item.color }}
                          title={item.label}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                {/* Icon Emojis */}
                <div>
                  <label className="block text-xs font-semibold text-[#5C5146] dark:text-[#B5AAA0] mb-1.5">
                    Biểu tượng đại diện
                  </label>
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                    {ICON_CHOICES.map((emoji) => (
                      <button
                        key={emoji}
                        type="button"
                        onClick={() => setNewWsIcon(emoji)}
                        className={`w-9 h-9 rounded-xl flex items-center justify-center text-lg transition-all ${
                          newWsIcon === emoji
                            ? "bg-[#EFE9E0] dark:bg-[#2E2721] border-2 border-[#8C6B4F] scale-105"
                            : "hover:bg-[#EFE9E0] dark:hover:bg-[#201B17]"
                        }`}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-xs font-semibold text-[#5C5146] dark:text-[#B5AAA0] mb-1.5">
                    Mô tả mục tiêu
                  </label>
                  <textarea
                    id="textarea-ws-desc"
                    rows={2}
                    value={newWsDesc}
                    onChange={(e) => setNewWsDesc(e.target.value)}
                    placeholder="VD: Không gian điều phối các chiến dịch truyền thông và phân công quay chụp..."
                    className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-[#1F1A15] border border-[#E0D7CB] dark:border-[#2C2621] text-xs sm:text-sm text-[#2C2723] dark:text-[#EDE8E1] placeholder-[#A09285] focus:outline-none focus:border-[#8C6B4F]"
                  />
                </div>

                {/* Email Invites */}
                <div>
                  <label className="block text-xs font-semibold text-[#5C5146] dark:text-[#B5AAA0] mb-1.5">
                    Mời thành viên (tùy chọn)
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#9E9082]" />
                    <input
                      id="input-ws-invites"
                      type="text"
                      value={newWsInvites}
                      onChange={(e) => setNewWsInvites(e.target.value)}
                      placeholder="email1@congty.com, email2@agency.vn..."
                      className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-white dark:bg-[#1F1A15] border border-[#E0D7CB] dark:border-[#2C2621] text-xs text-[#2C2723] dark:text-[#EDE8E1] placeholder-[#A09285] focus:outline-none focus:border-[#8C6B4F]"
                    />
                  </div>
                </div>

                {/* Submit Actions */}
                <div className="pt-3 flex items-center justify-end gap-3 border-t border-[#EFE9E0] dark:border-[#241E19]">
                  <button
                    type="button"
                    onClick={() => setIsCreateModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-[#6B5F54] dark:text-[#B0A396] hover:bg-[#EFE9E0] dark:hover:bg-[#201B17] transition-colors"
                  >
                    Hủy bỏ
                  </button>
                  <button
                    id="submit-create-workspace-btn"
                    type="submit"
                    className="px-5 py-2 rounded-xl text-xs font-semibold bg-[#2C2723] dark:bg-[#EDE8E1] text-[#FAF8F5] dark:text-[#181512] hover:bg-[#433C36] dark:hover:bg-white shadow-sm transition-all hover:scale-105"
                  >
                    Tạo Không Gian & Khởi Đầu
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================================= */}
      {/* Modal 2: Tham Gia Bằng Mã Mời */}
      {/* ========================================================= */}
      <AnimatePresence>
        {isJoinModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-xs"
              onClick={() => setIsJoinModalOpen(false)}
            />

            <motion.div
              id="join-workspace-modal"
              initial={{ opacity: 0, scale: 0.96, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 15 }}
              className="relative z-10 w-full max-w-md rounded-3xl bg-[#FAF8F5] dark:bg-[#181411] border border-[#E5DFD5] dark:border-[#2C2621] shadow-2xl p-6 sm:p-7"
            >
              <button
                id="close-join-modal"
                onClick={() => setIsJoinModalOpen(false)}
                className="absolute top-5 right-5 p-1.5 rounded-full hover:bg-[#EFE9E0] dark:hover:bg-[#241E19] text-[#8E8378] hover:text-[#2C2723] dark:hover:text-[#EDE8E1] transition-colors"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-3 mb-4">
                <div className="w-11 h-11 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-xl text-amber-600">
                  <KeyRound className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-editorial text-lg font-bold text-[#2C2723] dark:text-[#EDE8E1]">
                    Tham Gia Không Gian Bằng Mã Mời
                  </h3>
                  <p className="text-xs text-[#8E8378]">
                    Nhập mã mời được quản trị viên hoặc đồng nghiệp cung cấp.
                  </p>
                </div>
              </div>

              <form onSubmit={handleJoinSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-[#5C5146] dark:text-[#B5AAA0] mb-1.5">
                    Mã mời hoặc đường dẫn
                  </label>
                  <input
                    id="input-join-code"
                    type="text"
                    required
                    value={joinCode}
                    onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                    placeholder="VD: DEV-TEAM hoặc CREATIVE-99..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-[#1F1A15] border border-[#E0D7CB] dark:border-[#2C2621] text-sm uppercase font-mono-data font-semibold text-[#2C2723] dark:text-[#EDE8E1] placeholder-[#A09285] tracking-wider focus:outline-none focus:border-[#8C6B4F]"
                  />
                  {joinError && (
                    <p className="mt-1.5 text-xs text-rose-500 font-medium">
                      {joinError}
                    </p>
                  )}
                </div>

                {/* Quick Code Samples for Testing */}
                <div>
                  <div className="text-[11px] text-[#8E8378] mb-1.5">
                    Mã mẫu thử nghiệm nhanh:
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {["DEV-TEAM", "CREATIVE-99", "AURA-26"].map((sample) => (
                      <button
                        key={sample}
                        type="button"
                        onClick={() => setJoinCode(sample)}
                        className="px-2.5 py-1 rounded-lg bg-[#EFE9E0] dark:bg-[#201B17] hover:bg-[#E5DFD5] dark:hover:bg-[#28221C] text-[11px] font-mono-data font-semibold text-[#5C5146] dark:text-[#C7B9AC] border border-[#DDD5C7] dark:border-[#2E2620] transition-colors"
                      >
                        {sample}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-3 flex items-center justify-end gap-3 border-t border-[#EFE9E0] dark:border-[#241E19]">
                  <button
                    type="button"
                    onClick={() => setIsJoinModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-[#6B5F54] dark:text-[#B0A396] hover:bg-[#EFE9E0] dark:hover:bg-[#201B17] transition-colors"
                  >
                    Hủy
                  </button>
                  <button
                    id="submit-join-code-btn"
                    type="submit"
                    className="px-5 py-2 rounded-xl text-xs font-semibold bg-[#2C2723] dark:bg-[#EDE8E1] text-[#FAF8F5] dark:text-[#181512] hover:bg-[#433C36] dark:hover:bg-white shadow-sm transition-all"
                  >
                    Xác Nhận & Tham Gia
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================================= */}
      {/* Modal 3: Chỉnh sửa Workspace */}
      {/* ========================================================= */}
      <AnimatePresence>
        {editingWorkspace && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-xs"
              onClick={() => setEditingWorkspace(null)}
            />

            <motion.div
              id="edit-workspace-modal"
              initial={{ opacity: 0, scale: 0.96, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 15 }}
              className="relative z-10 w-full max-w-md rounded-3xl bg-[#FAF8F5] dark:bg-[#181411] border border-[#E5DFD5] dark:border-[#2C2621] shadow-2xl p-6 sm:p-7"
            >
              <button
                onClick={() => setEditingWorkspace(null)}
                className="absolute top-5 right-5 p-1.5 rounded-full hover:bg-[#EFE9E0] dark:hover:bg-[#241E19] text-[#8E8378] hover:text-[#2C2723] dark:hover:text-[#EDE8E1] transition-colors"
              >
                <X className="w-4 h-4" />
              </button>

              <h3 className="font-editorial text-lg font-bold text-[#2C2723] dark:text-[#EDE8E1] mb-4">
                Chỉnh Sửa Không Gian
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-[#5C5146] dark:text-[#B5AAA0] mb-1.5">
                    Tên không gian
                  </label>
                  <input
                    type="text"
                    value={editingWorkspace.name}
                    onChange={(e) =>
                      setEditingWorkspace({
                        ...editingWorkspace,
                        name: e.target.value,
                      })
                    }
                    className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-[#1F1A15] border border-[#E0D7CB] dark:border-[#2C2621] text-xs sm:text-sm text-[#2C2723] dark:text-[#EDE8E1]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#5C5146] dark:text-[#B5AAA0] mb-1.5">
                    Mô tả
                  </label>
                  <textarea
                    rows={3}
                    value={editingWorkspace.description}
                    onChange={(e) =>
                      setEditingWorkspace({
                        ...editingWorkspace,
                        description: e.target.value,
                      })
                    }
                    className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-[#1F1A15] border border-[#E0D7CB] dark:border-[#2C2621] text-xs sm:text-sm text-[#2C2723] dark:text-[#EDE8E1]"
                  />
                </div>

                <div className="pt-3 flex items-center justify-end gap-3 border-t border-[#EFE9E0] dark:border-[#241E19]">
                  <button
                    onClick={() => setEditingWorkspace(null)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-[#6B5F54] dark:text-[#B0A396] hover:bg-[#EFE9E0] dark:hover:bg-[#201B17]"
                  >
                    Hủy
                  </button>
                  <button
                    onClick={() => setEditingWorkspace(null)}
                    className="px-5 py-2 rounded-xl text-xs font-semibold bg-[#2C2723] dark:bg-[#EDE8E1] text-[#FAF8F5] dark:text-[#181512] hover:bg-[#433C36] dark:hover:bg-white transition-all"
                  >
                    Lưu Thay Đổi
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
