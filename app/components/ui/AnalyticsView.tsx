"use client";

import React from "react";
import {
  CheckCircle2,
  Clock,
  TrendingUp,
  Users,
  Target,
  Layers,
  Sparkles,
} from "lucide-react";
import { useProject } from "@/app/context/ProjectProvider";

export const AnalyticsView: React.FC = () => {
  const { tasks, columns, members, activeBoard, t, language } = useProject();

  const boardTasks = tasks.filter((t) => t.boardId === activeBoard.id);
  const totalTasks = boardTasks.length;

  const lastColumnId = columns[columns.length - 1]?.id;
  const completedTasks = boardTasks.filter(
    (t) =>
      t.columnId === lastColumnId ||
      t.columnId.includes("5") ||
      t.columnId.includes("done"),
  );

  const completionRate =
    totalTasks > 0 ? Math.round((completedTasks.length / totalTasks) * 100) : 0;

  // Overdue count
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const overdueTasks = boardTasks.filter((task) => {
    if (!task.dueDate) return false;
    const due = new Date(task.dueDate);
    const isDone =
      task.columnId.includes("done") || task.columnId.includes("5");
    return !isDone && due < today;
  });

  // Priority counts
  const priorityCounts = {
    urgent: boardTasks.filter((t) => t.priority === "urgent").length,
    high: boardTasks.filter((t) => t.priority === "high").length,
    medium: boardTasks.filter((t) => t.priority === "medium").length,
    low: boardTasks.filter((t) => t.priority === "low").length,
  };

  return (
    <div className="flex-1 p-4 sm:p-8 overflow-y-auto space-y-6 max-w-7xl mx-auto w-full">
      {/* 4 Architectural Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Tasks */}
        <div className="p-5 rounded-3xl border border-[#E5DFD5] dark:border-[#2C251E] bg-white/90 dark:bg-[#181411]/90 backdrop-blur-md shadow-[0_4px_24px_-4px_rgba(44,39,35,0.04)]">
          <div className="flex items-center justify-between text-[#8E8378] text-xs font-sans-ui">
            <span className="uppercase tracking-wider text-[10px] font-semibold">
              {t.totalTasks}
            </span>
            <Target className="w-4 h-4 text-[#8C6B4F]" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="font-editorial text-3xl font-bold text-[#2C2723] dark:text-[#EDE8E1]">
              {totalTasks}
            </span>
            <span className="text-xs text-[#8E8378] font-sans-ui">
              {columns.length} chặng
            </span>
          </div>
          <p className="mt-1.5 text-[11px] text-[#9E9082] truncate font-sans-ui">
            {activeBoard.title}
          </p>
        </div>

        {/* Completion Rate */}
        <div className="p-5 rounded-3xl border border-[#E5DFD5] dark:border-[#2C251E] bg-white/90 dark:bg-[#181411]/90 backdrop-blur-md shadow-[0_4px_24px_-4px_rgba(44,39,35,0.04)]">
          <div className="flex items-center justify-between text-[#8E8378] text-xs font-sans-ui">
            <span className="uppercase tracking-wider text-[10px] font-semibold">
              {t.completionRate}
            </span>
            <CheckCircle2 className="w-4 h-4 text-[#2D6A4F] dark:text-[#74C69D]" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="font-editorial text-3xl font-bold text-[#2D6A4F] dark:text-[#74C69D]">
              {completionRate}%
            </span>
            <span className="text-xs text-[#8E8378] font-sans-ui">
              {completedTasks.length}/{totalTasks} mục
            </span>
          </div>
          <div className="mt-2.5 w-full bg-[#EFE9DF] dark:bg-[#28211A] h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-[#2D6A4F] dark:bg-[#74C69D] h-full rounded-full transition-all duration-500"
              style={{ width: `${completionRate}%` }}
            />
          </div>
        </div>

        {/* Deadlines & Attention */}
        <div className="p-5 rounded-3xl border border-[#E5DFD5] dark:border-[#2C251E] bg-white/90 dark:bg-[#181411]/90 backdrop-blur-md shadow-[0_4px_24px_-4px_rgba(44,39,35,0.04)]">
          <div className="flex items-center justify-between text-[#8E8378] text-xs font-sans-ui">
            <span className="uppercase tracking-wider text-[10px] font-semibold">
              Thời hạn & Chú ý
            </span>
            <Clock className="w-4 h-4 text-[#B47012]" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="font-editorial text-3xl font-bold text-[#2C2723] dark:text-[#EDE8E1]">
              {overdueTasks.length}
            </span>
            <span className="text-xs text-[#8E8378] font-sans-ui">
              công việc quá hạn
            </span>
          </div>
          <p className="mt-1.5 text-[11px] text-[#9E9082] font-sans-ui">
            {overdueTasks.length === 0
              ? "Mọi việc đang diễn ra đúng tiến độ"
              : "Cần kiểm tra lại các mốc thời gian"}
          </p>
        </div>

        {/* Collaborators */}
        <div className="p-5 rounded-3xl border border-[#E5DFD5] dark:border-[#2C251E] bg-white/90 dark:bg-[#181411]/90 backdrop-blur-md shadow-[0_4px_24px_-4px_rgba(44,39,35,0.04)]">
          <div className="flex items-center justify-between text-[#8E8378] text-xs font-sans-ui">
            <span className="uppercase tracking-wider text-[10px] font-semibold">
              Nhân sự đồng hành
            </span>
            <Users className="w-4 h-4 text-[#8C6B4F]" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="font-editorial text-3xl font-bold text-[#2C2723] dark:text-[#EDE8E1]">
              {members.length}
            </span>
            <span className="text-xs text-[#8E8378] font-sans-ui">
              thành viên
            </span>
          </div>
          <p className="mt-1.5 text-[11px] text-[#9E9082] font-sans-ui">
            Phân quyền & phân vai linh hoạt
          </p>
        </div>
      </div>

      {/* Visual Breakdowns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Column breakdown */}
        <div className="p-6 rounded-3xl border border-[#E5DFD5] dark:border-[#2C251E] bg-white/90 dark:bg-[#181411]/90 backdrop-blur-md shadow-[0_4px_24px_-4px_rgba(44,39,35,0.04)] space-y-4">
          <div className="flex items-center justify-between border-b border-[#EAE3D8] dark:border-[#28211A] pb-3">
            <h3 className="font-editorial text-base font-bold text-[#2C2723] dark:text-[#EDE8E1] flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#8C6B4F]" />
              <span>Phân bổ theo giai đoạn</span>
            </h3>
            <span className="text-xs text-[#8E8378] font-mono-data">
              {columns.length} cột
            </span>
          </div>

          <div className="space-y-3.5">
            {columns.map((col) => {
              const count = boardTasks.filter(
                (t) => t.columnId === col.id,
              ).length;
              const pct =
                totalTasks > 0 ? Math.round((count / totalTasks) * 100) : 0;
              return (
                <div key={col.id} className="space-y-1.5 font-sans-ui">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-[#4A4137] dark:text-[#D5CBC1] flex items-center gap-2">
                      <span
                        className="w-2 h-2 rounded-full"
                        style={{
                          backgroundColor: col.colorAccent || "#8C6B4F",
                        }}
                      />
                      {col.title}
                    </span>
                    <span className="text-[#8E8378] font-mono-data">
                      {count} việc ({pct}%)
                    </span>
                  </div>
                  <div className="w-full bg-[#EFE9DF] dark:bg-[#28211A] h-2 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-300"
                      style={{
                        width: `${pct}%`,
                        backgroundColor: col.colorAccent || "#8C6B4F",
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Priority breakdown */}
        <div className="p-6 rounded-3xl border border-[#E5DFD5] dark:border-[#2C251E] bg-white/90 dark:bg-[#181411]/90 backdrop-blur-md shadow-[0_4px_24px_-4px_rgba(44,39,35,0.04)] space-y-4">
          <div className="flex items-center justify-between border-b border-[#EAE3D8] dark:border-[#28211A] pb-3">
            <h3 className="font-editorial text-base font-bold text-[#2C2723] dark:text-[#EDE8E1] flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#B47012]" />
              <span>Phân bổ theo mức độ ưu tiên</span>
            </h3>
          </div>

          <div className="grid grid-cols-2 gap-3.5 font-sans-ui">
            <div className="p-4 rounded-2xl bg-[#FDF2F0] dark:bg-[#281716] border border-[#F2D1CC] dark:border-[#4D2320]">
              <div className="text-[10px] font-bold text-[#B9382B] dark:text-[#E87A6E] uppercase tracking-wider">
                Khẩn cấp
              </div>
              <div className="font-editorial text-2xl font-bold text-[#2C2723] dark:text-[#EDE8E1] mt-1">
                {priorityCounts.urgent}
              </div>
              <div className="text-[10px] text-[#8E8378] mt-0.5">
                Xử lý ngay trong ngày
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-[#FEF8EC] dark:bg-[#292012] border border-[#F6E3B8] dark:border-[#4F3917]">
              <div className="text-[10px] font-bold text-[#B47012] dark:text-[#E8A749] uppercase tracking-wider">
                Cao
              </div>
              <div className="font-editorial text-2xl font-bold text-[#2C2723] dark:text-[#EDE8E1] mt-1">
                {priorityCounts.high}
              </div>
              <div className="text-[10px] text-[#8E8378] mt-0.5">
                Tác động đến mục tiêu
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-[#F1F6F2] dark:bg-[#152319] border border-[#CCE0D3] dark:border-[#23422F]">
              <div className="text-[10px] font-bold text-[#2F6D47] dark:text-[#78BE93] uppercase tracking-wider">
                Bình thường
              </div>
              <div className="font-editorial text-2xl font-bold text-[#2C2723] dark:text-[#EDE8E1] mt-1">
                {priorityCounts.medium}
              </div>
              <div className="text-[10px] text-[#8E8378] mt-0.5">
                Lộ trình tiêu chuẩn
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-[#F6F2EB] dark:bg-[#221C17] border border-[#E3DAD0] dark:border-[#382E25]">
              <div className="text-[10px] font-bold text-[#716558] dark:text-[#B2A596] uppercase tracking-wider">
                Thấp
              </div>
              <div className="font-editorial text-2xl font-bold text-[#2C2723] dark:text-[#EDE8E1] mt-1">
                {priorityCounts.low}
              </div>
              <div className="text-[10px] text-[#8E8378] mt-0.5">
                Linh hoạt sắp xếp
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
