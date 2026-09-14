"use client";

import Link from "next/link";
import {
  Kanban,
  Rows3,
  ListTodo,
  CalendarClock,
  BarChart3,
  Building2,
  Plus,
  ChevronsLeft,
  ChevronsRight,
  X,
} from "lucide-react";
import { useState } from "react";
import { useProject } from "@/app/context/ProjectProvider";
import { ViewMode } from "@/app/types/types";

interface SidebarContentProps {
  collapsed: boolean;
  onNavigate?: () => void;
}

/** Shared between the persistent desktop rail and the mobile drawer, so the
 * two never drift out of sync with each other. */
const SidebarContent: React.FC<SidebarContentProps> = ({ collapsed, onNavigate }) => {
  const {
    activeWorkspace,
    activeBoard,
    viewMode,
    setViewMode,
    setIsNewBoardModalOpen,
    t,
  } = useProject();

  const navItems: {
    id: ViewMode;
    label: string;
    icon: React.FC<{ className?: string }>;
  }[] = [
    { id: "kanban", label: t.kanbanView, icon: Kanban },
    { id: "backlog", label: t.backlogView, icon: Rows3 },
    { id: "table", label: t.tableView, icon: ListTodo },
    { id: "timeline", label: t.timelineView, icon: CalendarClock },
    { id: "analytics", label: t.reports, icon: BarChart3 },
  ];

  return (
    <>
      {/* Project identity */}
      <div className="p-4 border-b border-[#EFE9E0] dark:border-[#221C17]">
        <Link
          href={`/workspaces/${activeWorkspace.slug}`}
          onClick={onNavigate}
          className="flex items-center gap-2.5 min-w-0 group"
          title={t.allBoardsInWorkspace}
        >
          <span className="text-xl leading-none flex-shrink-0">{activeBoard.icon}</span>
          {!collapsed && (
            <div className="min-w-0">
              <div className="text-sm font-editorial font-bold truncate text-[#2C2723] dark:text-[#EDE8E1] group-hover:text-[#8C6B4F] dark:group-hover:text-[#D4B89D] transition-colors">
                {activeBoard.title}
              </div>
              <div className="text-[10px] font-mono-data text-[#9E9082] truncate">
                {activeBoard.key || "—"}
              </div>
            </div>
          )}
        </Link>
      </div>

      {/* Board/Backlog/Reports nav */}
      <nav className="flex-1 p-2.5 space-y-0.5">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = viewMode === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                setViewMode(item.id);
                onNavigate?.();
              }}
              title={item.label}
              className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs font-medium transition-all ${
                isActive
                  ? "bg-[#EFE5D6] dark:bg-[#251F19] text-[#2C2723] dark:text-[#EDE8E1] font-semibold"
                  : "text-[#7C7063] dark:text-[#8E8377] hover:bg-[#F2ECE3] dark:hover:bg-[#1C1712] hover:text-[#2C2723] dark:hover:text-[#EDE8E1]"
              }`}
            >
              <Icon
                className={`w-4 h-4 flex-shrink-0 ${isActive ? "text-[#8C6B4F] dark:text-[#D4B89D]" : ""}`}
              />
              {!collapsed && <span className="truncate">{item.label}</span>}
            </button>
          );
        })}
      </nav>

      {/* Footer: new board + workspace link + collapse toggle */}
      <div className="p-2.5 border-t border-[#EFE9E0] dark:border-[#221C17] space-y-0.5">
        <button
          onClick={() => {
            setIsNewBoardModalOpen(true);
            onNavigate?.();
          }}
          title={t.newBoard}
          className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs font-medium text-[#8C6B4F] dark:text-[#D4B89D] hover:bg-[#F2ECE3] dark:hover:bg-[#1C1712] transition-colors"
        >
          <Plus className="w-4 h-4 flex-shrink-0" />
          {!collapsed && <span className="truncate">{t.newBoard}</span>}
        </button>
        <Link
          href={`/workspaces/${activeWorkspace.slug}`}
          onClick={onNavigate}
          title={t.allWorkspaces}
          className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs font-medium text-[#7C7063] dark:text-[#8E8377] hover:bg-[#F2ECE3] dark:hover:bg-[#1C1712] hover:text-[#2C2723] dark:hover:text-[#EDE8E1] transition-colors"
        >
          <Building2 className="w-4 h-4 flex-shrink-0" />
          {!collapsed && (
            <span className="truncate">
              {t.allBoards}
            </span>
          )}
        </Link>
      </div>
    </>
  );
};

/**
 * Left rail navigation, the Jira-style counterpart to its project sidebar
 * (Board / Backlog / Reports). Owns switching between the views for the
 * *current* board; switching to a different board/project happens via the
 * "Tất cả bảng" link back to the BoardsDashboard, kept as a single place to
 * do that instead of duplicating a board-switcher here too.
 *
 * Renders twice: a persistent rail on desktop (`md:` and up), and — driven
 * by `mobileOpen`/`onCloseMobile` from the Navbar's hamburger button — a
 * slide-in drawer below that breakpoint, since the rail is hidden there.
 */
interface ProjectSidebarProps {
  mobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export const ProjectSidebar: React.FC<ProjectSidebarProps> = ({
  mobileOpen = false,
  onCloseMobile,
}) => {
  const [collapsed, setCollapsed] = useState(false);
  const { t } = useProject();

  return (
    <>
      {/* Desktop persistent rail */}
      <aside
        className={`hidden md:flex flex-col shrink-0 border-r border-[#E8E2D8] dark:border-[#26201B] bg-[#FAF8F5] dark:bg-[#12100E] transition-all duration-200 ${
          collapsed ? "w-16" : "w-60"
        }`}
      >
        <SidebarContent collapsed={collapsed} />
        <div className="p-2.5 pt-0">
          <button
            onClick={() => setCollapsed((c) => !c)}
            className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs font-medium text-[#9E9082] hover:bg-[#F2ECE3] dark:hover:bg-[#1C1712] transition-colors"
          >
            {collapsed ? (
              <ChevronsRight className="w-4 h-4 flex-shrink-0" />
            ) : (
              <>
                <ChevronsLeft className="w-4 h-4 flex-shrink-0" />
                <span className="truncate">{t.collapse}</span>
              </>
            )}
          </button>
        </div>
      </aside>

      {/* Mobile drawer — the Board/Backlog/Table/Timeline/Analytics switcher
       * has nowhere else to live on small screens now that it moved out of
       * the Navbar, so it must be reachable here too. */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-40">
          <div className="fixed inset-0 bg-[#161311]/50 backdrop-blur-xs" onClick={onCloseMobile} />
          <div className="relative w-64 h-full bg-[#FAF8F5] dark:bg-[#12100E] flex flex-col animate-in slide-in-from-left duration-200 shadow-2xl">
            <div className="flex items-center justify-end p-2">
              <button
                onClick={onCloseMobile}
                className="p-1.5 rounded-xl text-[#8E8378] hover:text-[#2C2723] dark:hover:text-[#EDE8E1]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <SidebarContent collapsed={false} onNavigate={onCloseMobile} />
          </div>
        </div>
      )}
    </>
  );
};
