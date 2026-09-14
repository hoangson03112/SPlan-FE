"use client";

import { useState } from "react";
import { Minimize2 } from "lucide-react";
import { useProject } from "@/app/context/ProjectProvider";
import { WorkspaceSelector } from "./WorkspaceSelector";
import { ProjectSidebar } from "./ProjectSidebar";
import { Navbar } from "./Navbar";
import { BoardHeader } from "./BoardHeader";
import { KanbanView } from "./KanbanView";
import { BacklogView } from "./BacklogView";
import { TableView } from "./TableView";
import { TimelineView } from "./TimelineView";
import { AnalyticsView } from "./AnalyticsView";
import { TaskDetailModal } from "./TaskDetailModal";
import { CommandPalette } from "./CommandPalette";
import { FilterDrawer } from "./FilterDrawer";
import { NewBoardModal } from "./NewBoardModal";
import { CreateIssueModal } from "./CreateIssueModal";
import { CustomFieldsModal } from "./CustomFieldsModal";
import { MembersModal } from "./MembersModal";

const Board: React.FC = () => {
  const { viewMode, activeBoard, zenMode, toggleZenMode } = useProject();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const getCanvasBackground = (style?: typeof activeBoard.backgroundStyle) => {
    switch (style) {
      case "warm-stone":
        return "bg-[#F7F4EE] dark:bg-[#181512] text-[#2C2723] dark:text-[#EDE8E1]";
      case "soft-linen":
        return "bg-[#F9F6EE] dark:bg-[#1B1713] text-[#2C2723] dark:text-[#EDE8E1]";
      case "sage-calm":
        return "bg-[#EDF4EE] dark:bg-[#121A14] text-[#2C2723] dark:text-[#EDE8E1]";
      case "rose-terracotta":
        return "bg-[#FCF3EE] dark:bg-[#201513] text-[#2C2723] dark:text-[#EDE8E1]";
      case "nordic-sky":
        return "bg-[#EFF5F8] dark:bg-[#111920] text-[#2C2723] dark:text-[#EDE8E1]";
      case "dark-slate":
        return "bg-[#27201B] text-[#EDE8E1]";
      case "charcoal-noir":
        return "bg-[#181411] text-[#EDE8E1]";
      case "paper-white":
      default:
        return "bg-[#FAF8F5] dark:bg-[#14110E] text-[#2C2723] dark:text-[#EDE8E1]";
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Jira-style project rail: Board / Backlog / Reports for this board */}
      {!zenMode && (
        <ProjectSidebar
          mobileOpen={isMobileSidebarOpen}
          onCloseMobile={() => setIsMobileSidebarOpen(false)}
        />
      )}

      <div
        className={`flex-1 min-w-0 flex flex-col transition-colors duration-300 selection:bg-[#8C6B4F] selection:text-white relative ${getCanvasBackground(
          activeBoard.backgroundStyle,
        )}`}
      >
        {/* Zen Mode Exit Button if Zen Mode is active */}
        {zenMode && (
          <div className="fixed top-4 right-6 z-50 animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={toggleZenMode}
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#2C2723]/90 dark:bg-[#EDE8E1]/90 text-[#FAF8F5] dark:text-[#181512] text-xs font-semibold backdrop-blur-md shadow-lg hover:scale-105 transition-all"
              title="Thoát chế độ tập trung (Zen Mode)"
            >
              <Minimize2 className="w-3.5 h-3.5" />
              <span>Thoát Zen Mode</span>
            </button>
          </div>
        )}

        {/* Conditionally render Navbar based on zenMode */}
        {!zenMode && <Navbar onOpenMobileSidebar={() => setIsMobileSidebarOpen(true)} />}

        <BoardHeader />

        <main className="flex-1 flex flex-col min-h-0">
          {viewMode === "kanban" && <KanbanView />}
          {viewMode === "backlog" && <BacklogView />}
          {viewMode === "table" && <TableView />}
          {viewMode === "timeline" && <TimelineView />}
          {viewMode === "analytics" && <AnalyticsView />}
        </main>

        {/* Global Modals & Drawers */}
        <TaskDetailModal />
        <CommandPalette />
        <FilterDrawer />
        <NewBoardModal />
        <CreateIssueModal />
        <CustomFieldsModal />
        <MembersModal />
      </div>
    </div>
  );
};

/**
 * Full Kanban prototype screen: the board itself, or the workspace
 * selector when the user opens it from the Navbar. Everything here is
 * backed by static mock data (see ProjectProvider) — no API calls.
 */
export const BoardContainer: React.FC = () => {
  const { isWorkspaceSelectorOpen } = useProject();
  return isWorkspaceSelectorOpen ? <WorkspaceSelector /> : <Board />;
};
