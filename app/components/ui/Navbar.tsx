"use client";

import React from "react";
import {
  Kanban,
  ListTodo,
  CalendarClock,
  BarChart3,
  Search,
  SlidersHorizontal,
  Plus,
  Download,
  RotateCcw,
  ChevronDown,
  Sun,
  Moon,
  Check,
  Sparkles,
  Maximize2,
  Minimize2,
  Building2,
  ExternalLink,
} from "lucide-react";
import { useProject } from "@/app/context/ProjectProvider";
import { ViewMode } from "@/app/types/types";

export const Navbar: React.FC = () => {
  const {
    activeWorkspace,
    setIsWorkspaceSelectorOpen,
    boards,
    activeBoard,
    setActiveBoardId,
    viewMode,
    setViewMode,
    language,
    setLanguage,
    themeMode,
    toggleThemeMode,
    zenMode,
    toggleZenMode,
    filterOptions,
    setIsCommandPaletteOpen,
    setIsFilterDrawerOpen,
    setIsNewBoardModalOpen,
    addTask,
    columns,
    t,
  } = useProject();

  const [isBoardDropdownOpen, setIsBoardDropdownOpen] = React.useState(false);

  // Count active filters
  const activeFilterCount =
    (filterOptions.priorities.length > 0 ? 1 : 0) +
    (filterOptions.assigneeIds.length > 0 ? 1 : 0) +
    (filterOptions.labelIds.length > 0 ? 1 : 0) +
    (filterOptions.hasDueDateOnly ? 1 : 0) +
    (filterOptions.searchQuery ? 1 : 0);

  const handleQuickAdd = () => {
    if (columns.length > 0) {
      addTask(columns[0].id, language === 'vi' ? 'Công việc mới' : 'New Task');
    }
  };

  const navItems: {
    id: ViewMode;
    label: string;
    icon: React.FC<{ className?: string }>;
  }[] = [
    { id: "kanban", label: t.kanbanView, icon: Kanban },
    { id: "table", label: t.tableView, icon: ListTodo },
    { id: "timeline", label: t.timelineView, icon: CalendarClock },
    { id: "analytics", label: t.analyticsView, icon: BarChart3 },
  ];

  return (
    <header className="sticky top-0 z-30 border-b border-[#E8E2D8]/80 dark:border-[#2A241F]/80 bg-[#FAF8F5]/85 dark:bg-[#141210]/85 backdrop-blur-xl px-3.5 sm:px-6 py-2.5 transition-colors duration-200">
      <div className="flex items-center justify-between gap-2 sm:gap-4 max-w-9xl mx-auto">
        {/* Left Section: Board Selector & Collection */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* Active Workspace Selector Trigger */}
          <button
            id="navbar-workspace-hub-btn"
            onClick={() => setIsWorkspaceSelectorOpen(true)}
            className="flex items-center gap-1.5 sm:gap-2 px-2.5 py-1.5 rounded-2xl border border-[#DDD3C3] dark:border-[#382F26] bg-[#F4EDE3] dark:bg-[#1E1915] hover:bg-[#EFE5D6] dark:hover:bg-[#28211B] text-[#5A4D41] dark:text-[#CBBDB0] text-xs font-semibold shadow-2xs transition-all hover:scale-[1.02] group"
            title="Mở màn hình chọn không gian làm việc (Workspace Hub)"
          >
            <span className="text-sm flex-shrink-0">
              {activeWorkspace.icon}
            </span>
            <span className="max-w-[85px] sm:max-w-[130px] truncate font-editorial">
              {activeWorkspace.name}
            </span>
            <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-[#E5DACB] dark:bg-[#2D241C] text-[#8C6B4F] dark:text-[#D4B89D] uppercase tracking-wider font-bold group-hover:bg-[#8C6B4F] group-hover:text-white transition-colors">
              Đổi
            </span>
          </button>

          <div className="h-4 w-px bg-[#E2DAD0] dark:bg-[#2E2822]" />

          {/* Board Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsBoardDropdownOpen(!isBoardDropdownOpen)}
              className="flex items-center gap-2 px-2.5 py-1.5 rounded-2xl hover:bg-[#F0EAE1] dark:hover:bg-[#201C18] border border-transparent hover:border-[#E2DAD0] dark:hover:border-[#352D26] transition-all text-left group"
            >
              <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-[#EDE5D8] to-[#E2D6C5] dark:from-[#2A241F] dark:to-[#1E1915] border border-[#DDD3C3] dark:border-[#3A322A] flex items-center justify-center text-sm shadow-2xs">
                {activeBoard.icon}
              </div>
              <div className="flex flex-col text-left">
                <div className="flex items-center gap-1">
                  <span className="font-editorial text-xs sm:text-sm font-semibold tracking-tight text-[#2C2723] dark:text-[#EDE8E1] group-hover:text-[#8C6B4F] dark:group-hover:text-[#D4B89D] transition-colors max-w-[110px] sm:max-w-[170px] truncate">
                    {activeBoard.title}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-[#8E8378] group-hover:text-[#2C2723] dark:group-hover:text-[#EDE8E1] transition-transform duration-200 group-hover:translate-y-0.5" />
                </div>
              </div>
            </button>

            {/* Board Selector Dropdown */}
            {isBoardDropdownOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setIsBoardDropdownOpen(false)}
                />
                <div className="absolute left-0 mt-2 w-72 sm:w-84 rounded-2xl bg-[#FAF8F5] dark:bg-[#181512] border border-[#E5DFD5] dark:border-[#2C2621] shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-3 py-2 text-[10px] font-bold text-[#94877A] dark:text-[#8F8174] uppercase tracking-widest border-b border-[#EFE9E0] dark:border-[#241F1A] mb-1.5 flex items-center justify-between">
                    <span>
                      {language === "vi"
                        ? "Dự án trong không gian"
                        : "Projects in workspace"}
                    </span>
                    <span className="font-mono text-[10px] text-[#A6998C]">
                      {boards.length} bảng
                    </span>
                  </div>

                  <div className="space-y-1 my-1 max-h-72 overflow-y-auto pr-1">
                    {boards.map((b) => {
                      const isActive = b.id === activeBoard.id;
                      return (
                        <button
                          key={b.id}
                          onClick={() => {
                            setActiveBoardId(b.id);
                            setIsBoardDropdownOpen(false);
                          }}
                          className={`w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl text-left text-xs transition-all ${
                            isActive
                              ? "bg-[#EFE8DD] dark:bg-[#25201A] text-[#2C2723] dark:text-[#EDE8E1] font-semibold shadow-2xs"
                              : "text-[#5C534A] dark:text-[#B5AAA0] hover:bg-[#F4EFE7] dark:hover:bg-[#1F1A16]"
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <span className="text-base flex-shrink-0">
                              {b.icon}
                            </span>
                            <div className="truncate">
                              <div className="truncate font-medium text-[#2C2723] dark:text-[#EDE8E1]">
                                {b.title}
                              </div>
                              <div className="text-[10px] text-[#8E8378] truncate">
                                {b.description}
                              </div>
                            </div>
                          </div>
                          {isActive && (
                            <Check className="w-3.5 h-3.5 text-[#8C6B4F] dark:text-[#D4B89D] flex-shrink-0" />
                          )}
                        </button>
                      );
                    })}
                  </div>

                  <div className="pt-2 mt-1 border-t border-[#EFE9E0] dark:border-[#241F1A] space-y-1">
                    <button
                      id="dropdown-workspace-hub-link"
                      onClick={() => {
                        setIsBoardDropdownOpen(false);
                        setIsWorkspaceSelectorOpen(true);
                      }}
                      className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-[#5A4D41] dark:text-[#CBBDB0] hover:bg-[#F2ECE3] dark:hover:bg-[#241E18] transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <Building2 className="w-3.5 h-3.5 text-[#8C6B4F]" />
                        <span>Màn hình Chọn Workspace</span>
                      </div>
                      <ExternalLink className="w-3 h-3 text-[#A09285]" />
                    </button>
                    <button
                      onClick={() => {
                        setIsBoardDropdownOpen(false);
                        setIsNewBoardModalOpen(true);
                      }}
                      className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-[#8C6B4F] dark:text-[#D4B89D] hover:bg-[#F2ECE3] dark:hover:bg-[#241E18] transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>{t.newBoard}</span>
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>

          <div className="h-4 w-px bg-[#E2DAD0] dark:bg-[#2E2822] hidden md:block" />

          {/* View Modes Switcher */}
          <nav className="flex items-center gap-0.5 bg-[#EFE9DF] dark:bg-[#1E1915] p-1 rounded-2xl border border-[#E2DAD0]/60 dark:border-[#2A231C]/60">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = viewMode === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setViewMode(item.id)}
                  className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-xl text-xs font-medium transition-all ${
                    isActive
                      ? "bg-white dark:bg-[#2B251E] text-[#2C2723] dark:text-[#EDE8E1] shadow-2xs font-semibold"
                      : "text-[#7C7063] dark:text-[#8E8377] hover:text-[#2C2723] dark:hover:text-[#EDE8E1]"
                  }`}
                  title={item.label}
                >
                  <Icon
                    className={`w-3.5 h-3.5 ${isActive ? "text-[#8C6B4F] dark:text-[#D4B89D]" : ""}`}
                  />
                  <span className="hidden lg:inline">{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Right Section: Zen Mode, Search, Filters, Theme, Language */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Zen Focus Mode Button */}
          <button
            onClick={toggleZenMode}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-medium border transition-all ${
              zenMode
                ? "bg-[#8C6B4F] text-white border-[#8C6B4F] shadow-2xs"
                : "bg-[#F2ECE3] dark:bg-[#1E1915] text-[#5C534A] dark:text-[#B5AAA0] border-[#E2DAD0] dark:border-[#2C251E] hover:border-[#8C6B4F]"
            }`}
            title={
              zenMode ? "Thoát chế độ tập trung" : "Chế độ tập trung Zen Mode"
            }
          >
            {zenMode ? (
              <Minimize2 className="w-3.5 h-3.5" />
            ) : (
              <Maximize2 className="w-3.5 h-3.5" />
            )}
            <span className="hidden xl:inline">
              {zenMode ? "Tập trung: Bật" : "Zen Focus"}
            </span>
          </button>

          {/* Command Palette Trigger */}
          <button
            onClick={() => setIsCommandPaletteOpen(true)}
            className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-[#F2ECE3] dark:bg-[#1E1915] hover:bg-[#E8E0D5] dark:hover:bg-[#26201A] text-[#7C7063] dark:text-[#8E8377] text-xs border border-[#E2DAD0]/70 dark:border-[#2C251E] transition-colors"
            title={t.quickCommands}
          >
            <Search className="w-3.5 h-3.5" />
            <span className="hidden lg:inline">
              {t.searchPlaceholder.slice(0, 15)}...
            </span>
            <kbd className="hidden sm:inline text-[9px] font-mono px-1 py-0.5 rounded bg-white dark:bg-[#2A241F] border border-[#DDD3C3] dark:border-[#382F26] text-[#8E8378]">
              ⌘K
            </kbd>
          </button>

          {/* Filter Drawer Trigger */}
          <button
            onClick={() => setIsFilterDrawerOpen(true)}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-medium border transition-all ${
              activeFilterCount > 0
                ? "bg-[#8C6B4F]/10 dark:bg-[#8C6B4F]/20 text-[#8C6B4F] dark:text-[#D4B89D] border-[#8C6B4F]/40"
                : "bg-[#F2ECE3] dark:bg-[#1E1915] text-[#5C534A] dark:text-[#B5AAA0] border-[#E2DAD0]/70 dark:border-[#2C251E] hover:bg-[#E8E0D5] dark:hover:bg-[#26201A]"
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{t.filter}</span>
            {activeFilterCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-[#8C6B4F] text-white text-[9px] font-bold flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
          </button>

          {/* Light / Dark Mode Toggle */}
          <button
            onClick={toggleThemeMode}
            className="p-2 rounded-xl text-[#7C7063] dark:text-[#B5AAA0] hover:bg-[#F0EAE1] dark:hover:bg-[#201C18] border border-transparent hover:border-[#E2DAD0] dark:hover:border-[#2E2721] transition-all"
            title={themeMode === "light" ? t.darkMode : t.lightMode}
          >
            {themeMode === "light" ? (
              <Moon className="w-4 h-4 text-[#7C7063]" />
            ) : (
              <Sun className="w-4 h-4 text-[#D4B89D]" />
            )}
          </button>

          {/* Language Switcher */}
          <button
            onClick={() => setLanguage(language === "vi" ? "en" : "vi")}
            className="px-2 py-1 rounded-xl text-[11px] font-bold text-[#7C7063] dark:text-[#B5AAA0] hover:bg-[#F0EAE1] dark:hover:bg-[#201C18] transition-colors uppercase font-mono tracking-wider"
            title="Đổi ngôn ngữ / Switch language"
          >
            {language === "vi" ? "EN" : "VI"}
          </button>

          {/* Quick Add Task Button */}
          <button
            onClick={handleQuickAdd}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#2C2723] hover:bg-[#1A1715] text-[#FAF8F5] dark:bg-[#EDE8E1] dark:hover:bg-[#FFFFFF] dark:text-[#1A1715] text-xs font-semibold shadow-xs hover:shadow-sm transition-all">
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{t.newCard}</span>
          </button>

          {/* Export & Reset (visual only — no data mutation wired up yet) */}
          <div className="flex items-center">
            <button
              className="p-1.5 rounded-xl text-[#8E8378] hover:text-[#2C2723] dark:hover:text-[#EDE8E1] hover:bg-[#F0EAE1] dark:hover:bg-[#201C18] transition-colors"
              title={t.exportData}
            >
              <Download className="w-3.5 h-3.5" />
            </button>
            <button
              className="p-1.5 rounded-xl text-[#8E8378] hover:text-[#2C2723] dark:hover:text-[#EDE8E1] hover:bg-[#F0EAE1] dark:hover:bg-[#201C18] transition-colors"
              title={t.resetDefault}
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
