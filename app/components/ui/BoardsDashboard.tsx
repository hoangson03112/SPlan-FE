"use client";

import Link from "next/link";
import { Building2, FolderKanban, Plus } from "lucide-react";
import { useProject } from "@/app/context/ProjectProvider";
import { NewBoardModal } from "./NewBoardModal";
import type { Board } from "@/app/types/types";

const CATEGORY_LABELS: Record<Board["category"], string> = {
  general: "Quản lý tổng hợp",
  content: "Sáng tạo & Truyền thông",
  event: "Sự kiện & Đời sống",
  business: "Kinh doanh & Khởi nghiệp",
  education: "Học tập & Nghiên cứu",
};

/**
 * Landing screen for `/workspaces/[slug]` — the workspace here stands for a
 * whole company/organization, and each board (Space) is one of its
 * departments or projects. This screen is the org's front door: an
 * at-a-glance roster of those departments/projects before diving into one,
 * instead of being dropped straight into board #1 with no visible siblings.
 */
export const BoardsDashboard: React.FC = () => {
  const { activeWorkspace, boards, members, setIsWorkspaceSelectorOpen, setIsNewBoardModalOpen } =
    useProject();

  return (
    <div className="min-h-screen bg-[#FAF8F5] dark:bg-[#12100E] text-[#2C2723] dark:text-[#EDE8E1] transition-colors duration-200">
      <header className="border-b border-[#E8E2D8]/80 dark:border-[#26201B]/80 bg-[#FAF8F5]/85 dark:bg-[#12100E]/85 backdrop-blur-xl px-4 sm:px-8 py-5">
        <div className="max-w-6xl mx-auto">
          <button
            onClick={() => setIsWorkspaceSelectorOpen(true)}
            className="flex items-center gap-1.5 text-xs font-semibold text-[#8E8378] hover:text-[#8C6B4F] dark:hover:text-[#D4B89D] transition-colors mb-3"
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>Tất cả không gian làm việc</span>
          </button>

          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              <span className="text-3xl leading-none">{activeWorkspace.icon}</span>
              <div>
                <h1 className="font-editorial text-2xl font-bold tracking-tight">
                  {activeWorkspace.name}
                </h1>
                <p className="text-sm text-[#8E8378]">
                  {boards.length > 0
                    ? `${boards.length} phòng ban / dự án trong tổ chức này`
                    : "Tổ chức này chưa có phòng ban hay dự án nào"}
                </p>
              </div>
            </div>

            {/* Team roster */}
            {members.length > 0 && (
              <div className="flex items-center -space-x-2">
                {members.slice(0, 5).map((m) => (
                  <img
                    key={m.id}
                    src={m.avatar}
                    alt={m.name}
                    title={`${m.name} — ${m.role}`}
                    referrerPolicy="no-referrer"
                    className="w-8 h-8 rounded-full object-cover ring-2 ring-[#FAF8F5] dark:ring-[#12100E]"
                  />
                ))}
                {members.length > 5 && (
                  <div className="w-8 h-8 rounded-full bg-[#E8DEC8] dark:bg-[#2E2721] ring-2 ring-[#FAF8F5] dark:ring-[#12100E] flex items-center justify-center text-[10px] font-bold text-[#4A3E31] dark:text-[#E2D5C3]">
                    +{members.length - 5}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-8 py-8">
        {boards.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center py-20 rounded-3xl border border-dashed border-[#DDD5C7] dark:border-[#332A22]">
            <div className="w-14 h-14 rounded-2xl bg-[#EFE9E0] dark:bg-[#241E19] flex items-center justify-center text-2xl mb-4">
              <FolderKanban className="w-6 h-6 text-[#8C6B4F]" />
            </div>
            <h2 className="font-editorial text-lg font-bold">
              Chưa có phòng ban hay dự án nào
            </h2>
            <p className="mt-1 text-sm text-[#8E8378] max-w-sm">
              Mỗi bảng đại diện cho 1 phòng ban hoặc dự án riêng trong{" "}
              {activeWorkspace.name}. Tạo bảng đầu tiên để bắt đầu.
            </p>
            <button
              onClick={() => setIsNewBoardModalOpen(true)}
              className="mt-5 flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-[#2C2723] dark:bg-[#EDE8E1] text-[#FAF8F5] dark:text-[#181512] hover:scale-105 transition-all"
            >
              <Plus className="w-4 h-4" />
              Tạo phòng ban / dự án đầu tiên
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {boards.map((board) => {
              const total = board.itemsCount ?? 0;
              const completed = board.completedItemsCount ?? 0;
              const progress = total > 0 ? Math.round((completed / total) * 100) : 0;

              return (
                <Link
                  key={board.id}
                  href={`/workspaces/${activeWorkspace.slug}/boards/${board.slug}`}
                  className="group rounded-2xl p-5 border border-[#E8E2D8] dark:border-[#2C2621] bg-white/80 dark:bg-[#181411]/80 hover:bg-white dark:hover:bg-[#1C1814] hover:border-[#D1C7BA] dark:hover:border-[#403730] shadow-xs hover:shadow-md transition-all flex flex-col"
                >
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-11 h-11 rounded-xl bg-[#EFE9E0] dark:bg-[#241E19] flex items-center justify-center text-xl flex-shrink-0">
                      {board.icon}
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-editorial text-base font-bold truncate group-hover:text-[#8C6B4F] dark:group-hover:text-[#D4B89D] transition-colors">
                        {board.title}
                      </h3>
                      <span className="text-[11px] text-[#8E8378]">
                        {CATEGORY_LABELS[board.category]}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-[#6B5F54] dark:text-[#A89C8F] line-clamp-2 min-h-[32px] mb-3">
                    {board.description}
                  </p>

                  <div className="mt-auto pt-3 border-t border-[#EFE9E0] dark:border-[#26201B] space-y-1.5">
                    <div className="flex items-center justify-between text-[11px] text-[#8E8378]">
                      <span>
                        {completed}/{total} công việc hoàn thành
                      </span>
                      <span className="font-mono-data font-semibold text-[#6B5F54] dark:text-[#B0A396]">
                        {progress}%
                      </span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-[#EFE9E0] dark:bg-[#26201B] overflow-hidden">
                      <div
                        className="h-full rounded-full bg-[#8C6B4F] transition-all duration-300"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                </Link>
              );
            })}

            {/* Tạo bảng mới — luôn đứng cuối lưới */}
            <button
              onClick={() => setIsNewBoardModalOpen(true)}
              className="flex flex-col items-center justify-center gap-2 rounded-2xl p-5 border-2 border-dashed border-[#DDD5C7] dark:border-[#332A22] text-[#8E8378] hover:border-[#8C6B4F] hover:text-[#8C6B4F] transition-all min-h-[128px]"
            >
              <Plus className="w-5 h-5" />
              <span className="text-sm font-semibold">
                Tạo phòng ban / dự án mới
              </span>
            </button>
          </div>
        )}
      </main>

      <NewBoardModal />
    </div>
  );
};
