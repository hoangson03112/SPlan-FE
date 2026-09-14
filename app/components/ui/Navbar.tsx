"use client";

import React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Search,
  SlidersHorizontal,
  Plus,
  Download,
  RotateCcw,
  ChevronRight,
  Sun,
  Moon,
  Maximize2,
  Minimize2,
  Menu,
  Settings,
  LogOut,
} from "lucide-react";
import { useProject } from "@/app/context/ProjectProvider";
import { useCurrentUser, useLogout } from "@/app/hooks/use-auth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface NavbarProps {
  /** Opens the mobile sidebar drawer — the Board/Backlog/Table/Timeline
   * switcher moved into ProjectSidebar, which is desktop-only, so mobile
   * needs this hamburger to reach it at all. */
  onOpenMobileSidebar?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenMobileSidebar }) => {
  const router = useRouter();
  const { data: currentUser } = useCurrentUser();
  const logout = useLogout();
  const {
    activeWorkspace,
    setIsWorkspaceSelectorOpen,
    activeBoard,
    language,
    setLanguage,
    themeMode,
    toggleThemeMode,
    zenMode,
    toggleZenMode,
    filterOptions,
    setIsCommandPaletteOpen,
    setIsFilterDrawerOpen,
    setIsCreateIssueModalOpen,
    t,
  } = useProject();

  // Count active filters
  const activeFilterCount =
    (filterOptions.priorities.length > 0 ? 1 : 0) +
    (filterOptions.assigneeIds.length > 0 ? 1 : 0) +
    (filterOptions.labelIds.length > 0 ? 1 : 0) +
    (filterOptions.hasDueDateOnly ? 1 : 0) +
    (filterOptions.searchQuery ? 1 : 0);

  return (
    <header className="sticky top-0 z-30 border-b border-[#E8E2D8]/80 dark:border-[#2A241F]/80 bg-[#FAF8F5]/85 dark:bg-[#141210]/85 backdrop-blur-xl px-3.5 sm:px-6 py-2.5 transition-colors duration-200">
      <div className="flex items-center justify-between gap-2 sm:gap-4 max-w-9xl mx-auto">
        {/* Left: mobile menu (reaches ProjectSidebar, hidden on mobile) + breadcrumb */}
        <div className="flex items-center gap-1.5 min-w-0 text-xs sm:text-sm">
          <button
            onClick={onOpenMobileSidebar}
            className="md:hidden p-1.5 -ml-1 rounded-xl text-[#7C7063] dark:text-[#8E8377] hover:bg-[#F2ECE3] dark:hover:bg-[#1E1915] flex-shrink-0"
            title="Menu"
          >
            <Menu className="w-4 h-4" />
          </button>
          <button
            onClick={() => setIsWorkspaceSelectorOpen(true)}
            className="font-semibold text-[#7C7063] dark:text-[#8E8377] hover:text-[#8C6B4F] dark:hover:text-[#D4B89D] truncate max-w-[110px] sm:max-w-[160px] transition-colors"
            title="Đổi không gian làm việc"
          >
            {activeWorkspace.name}
          </button>
          <ChevronRight className="w-3.5 h-3.5 text-[#C7BCAE] flex-shrink-0" />
          <span className="font-editorial font-semibold text-[#2C2723] dark:text-[#EDE8E1] truncate max-w-[140px] sm:max-w-[220px]">
            {activeBoard.title}
          </span>
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

          {/* Create Issue Button — opens the full Jira-style create modal */}
          <button
            onClick={() => setIsCreateIssueModalOpen(true)}
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

          {/* User menu: account settings + logout */}
          <DropdownMenu>
            <DropdownMenuTrigger
              className="w-7 h-7 rounded-full bg-[#8C6B4F] text-white text-xs font-semibold flex items-center justify-center flex-shrink-0 outline-none"
              title={currentUser?.name || currentUser?.email}
            >
              {(currentUser?.name || currentUser?.email || "?")
                .charAt(0)
                .toUpperCase()}
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <div className="px-2 py-1.5 text-xs text-[#9E9082] truncate max-w-[200px]">
                {currentUser?.email}
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                render={<Link href="/settings" />}
                className="flex items-center gap-2 cursor-pointer"
              >
                <Settings className="w-3.5 h-3.5" />
                {language === "vi" ? "Cài đặt tài khoản" : "Account settings"}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() =>
                  logout.mutate(undefined, {
                    onSuccess: () => {
                      router.push("/login");
                      router.refresh();
                    },
                  })
                }
                className="flex items-center gap-2 cursor-pointer text-red-600 focus:text-red-600"
              >
                <LogOut className="w-3.5 h-3.5" />
                {language === "vi" ? "Đăng xuất" : "Log out"}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};
