'use client';

import React, { useState } from 'react';
import { 
  Users, 
  Palette, 
  Share2, 
  MoreHorizontal, 
  Trash2, 
  Edit3, 
  CheckCircle2, 
  X,
  Sparkles,
  TrendingUp,
  Sliders,
  Check
} from 'lucide-react';
import { useProject } from '@/app/context/ProjectProvider';
import { Board } from '@/app/types/types';

export const BoardHeader: React.FC = () => {
  const {
    activeBoard,
    updateBoard,
    deleteBoard,
    boards,
    members,
    columns,
    tasks,
    filterOptions,
    setFilterOptions,
    t,
    language,
  } = useProject();

  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [boardTitle, setBoardTitle] = useState(activeBoard.title);
  const [isThemeMenuOpen, setIsThemeMenuOpen] = useState(false);
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);
  const [shareCopied, setShareCopied] = useState(false);

  const activeBoardTasks = tasks.filter((t) => t.boardId === activeBoard.id);
  const lastColumnId = columns[columns.length - 1]?.id;
  const completedTasks = activeBoardTasks.filter(
    (t) =>
      t.columnId === lastColumnId ||
      t.columnId.includes('5') ||
      t.columnId.includes('done')
  );
  const completionPercentage =
    activeBoardTasks.length > 0
      ? Math.round((completedTasks.length / activeBoardTasks.length) * 100)
      : 0;

  const handleTitleSubmit = () => {
    if (boardTitle.trim() && boardTitle.trim() !== activeBoard.title) {
      updateBoard(activeBoard.id, { title: boardTitle.trim() });
    }
    setIsEditingTitle(false);
  };

  const handleThemeChange = (style: Board['backgroundStyle']) => {
    updateBoard(activeBoard.id, { backgroundStyle: style });
    setIsThemeMenuOpen(false);
  };

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href);
    setShareCopied(true);
    setTimeout(() => setShareCopied(false), 2000);
  };

  const LUXURY_PALETTES: { id: Board['backgroundStyle']; label: string; dotColor: string; description: string }[] = [
    { id: 'paper-white', label: 'Fine Cotton Paper', dotColor: '#FAF9F6', description: 'Trắng sợi bông ngọc trai' },
    { id: 'warm-stone', label: 'Cashmere & Travertine', dotColor: '#F5F1EB', description: 'Đá ấm & len cashmere' },
    { id: 'soft-linen', label: 'Tuscan Linen', dotColor: '#F8F4EC', description: 'Vải lanh tự nhiên mộc mạc' },
    { id: 'sage-calm', label: 'Eucalyptus & Matcha', dotColor: '#F1F5F2', description: 'Xanh xô thơm tĩnh tại' },
    { id: 'nordic-sky', label: 'Glacial Morning', dotColor: '#F1F4F7', description: 'Bầu trời sương sớm Bắc Âu' },
    { id: 'rose-terracotta', label: 'Siena Rose Sand', dotColor: '#F7F2F0', description: 'Cát hồng & đất nung ấm' },
    { id: 'dark-slate', label: 'Mineral Slate', dotColor: '#24282D', description: 'Đá phiến khoáng chất trầm' },
    { id: 'charcoal-noir', label: 'Bronze Velvet Noir', dotColor: '#1A1816', description: 'Nhung đồng hun huyền bí' },
  ];

  return (
    <div className="border-b border-[#E8E2D8]/70 dark:border-[#2A241F]/70 px-4 sm:px-8 py-3.5 transition-colors">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 max-w-7xl mx-auto">
        {/* Left: Atelier Badge, Title & Purpose */}
        <div className="flex items-center gap-3.5 min-w-0 flex-1">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-b from-white to-[#F5EFE6] dark:from-[#26201A] dark:to-[#1B1612] border border-[#E0D7C9] dark:border-[#382E25] shadow-xs flex items-center justify-center text-2xl flex-shrink-0">
            {activeBoard.icon}
          </div>

          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-2.5 flex-wrap">
              {isEditingTitle ? (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleTitleSubmit();
                  }}
                  className="flex items-center gap-1.5"
                >
                  <input
                    type="text"
                    value={boardTitle}
                    onChange={(e) => setBoardTitle(e.target.value)}
                    onBlur={handleTitleSubmit}
                    autoFocus
                    className="font-editorial text-lg sm:text-xl font-bold text-[#2C2723] dark:text-[#EDE8E1] bg-white dark:bg-[#201B16] px-2.5 py-0.5 rounded-xl border border-[#8C6B4F] outline-none shadow-xs"
                  />
                </form>
              ) : (
                <h1
                  onClick={() => setIsEditingTitle(true)}
                  className="font-editorial text-lg sm:text-2xl font-bold tracking-tight text-[#2C2723] dark:text-[#EDE8E1] hover:text-[#8C6B4F] dark:hover:text-[#D4B89D] cursor-pointer flex items-center gap-2 truncate group transition-colors"
                  title="Nhấn để đổi tên dự án"
                >
                  <span>{activeBoard.title}</span>
                  <Edit3 className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 text-[#9E9082] transition-opacity" />
                </h1>
              )}

              {/* Category Pill with luxury aesthetic */}
              <span className="text-[10px] uppercase font-sans-ui tracking-widest px-2.5 py-0.5 rounded-full bg-[#EFE9DF]/80 dark:bg-[#251F19]/80 text-[#6B5E52] dark:text-[#B5AAA0] border border-[#DDD4C7] dark:border-[#352B22]">
                {activeBoard.category === 'content' && 'Sáng tạo nội dung'}
                {activeBoard.category === 'event' && 'Sự kiện & Tiệc'}
                {activeBoard.category === 'business' && 'Vận hành kinh doanh'}
                {activeBoard.category === 'education' && 'Phát triển bản thân'}
                {activeBoard.category === 'general' && 'Quản trị tổng quan'}
              </span>

              {/* Progress Metric Ring Pill */}
              <div className="flex items-center gap-1.5 text-[11px] font-sans-ui font-medium px-2.5 py-0.5 rounded-full bg-[#EAF2ED] dark:bg-[#16231A] text-[#2D6A4F] dark:text-[#74C69D] border border-[#C5DED0] dark:border-[#274632]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#2D6A4F] dark:bg-[#74C69D] animate-pulse" />
                <span>{completionPercentage}% hoàn thành</span>
                <span className="text-[#52B788] text-[10px]">({completedTasks.length}/{activeBoardTasks.length})</span>
              </div>
            </div>

            <p className="text-xs text-[#7A6F64] dark:text-[#9E9082] mt-0.5 truncate max-w-2xl font-sans-ui">
              {activeBoard.description}
            </p>
          </div>
        </div>

        {/* Right: Team Stacks, Palette Couture, Share Link, More */}
        <div className="flex items-center gap-2 sm:gap-3 self-end md:self-center">
          {/* Member Avatars */}
          <div className="flex items-center -space-x-2">
            {members.slice(0, 4).map((member) => (
              <img
                key={member.id}
                src={member.avatar}
                alt={member.name}
                title={`${member.name} — ${member.role}`}
                referrerPolicy="no-referrer"
                className="w-7 h-7 rounded-full object-cover ring-2 ring-[#FAF8F5] dark:ring-[#141210] shadow-2xs"
              />
            ))}
            {members.length > 4 && (
              <div className="w-7 h-7 rounded-full bg-[#E8DEC8] dark:bg-[#2E2721] ring-2 ring-[#FAF8F5] dark:ring-[#141210] flex items-center justify-center text-[10px] font-bold text-[#4A3E31] dark:text-[#E2D5C3]">
                +{members.length - 4}
              </div>
            )}
          </div>

          <div className="h-4 w-px bg-[#E2DAD0] dark:bg-[#2C2620]" />

          {/* Palette Couture Switcher */}
          <div className="relative">
            <button
              onClick={() => setIsThemeMenuOpen(!isThemeMenuOpen)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/90 dark:bg-[#1E1915] hover:bg-[#F5EFE6] dark:hover:bg-[#29221C] border border-[#E2DAD0] dark:border-[#352D26] text-xs font-medium text-[#4A4137] dark:text-[#D5CBC1] shadow-2xs transition-all"
              title="Phối màu không gian"
            >
              <Palette className="w-3.5 h-3.5 text-[#8C6B4F]" />
              <span className="hidden sm:inline">Phối màu</span>
            </button>

            {isThemeMenuOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setIsThemeMenuOpen(false)} />
                <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-[#FAF8F5] dark:bg-[#1A1613] border border-[#E2DAD0] dark:border-[#2F2720] shadow-2xl p-2.5 z-50 space-y-1">
                  <div className="px-2.5 py-1 text-[10px] font-bold text-[#8E8378] uppercase tracking-widest border-b border-[#EFE9E0] dark:border-[#26201A] pb-1.5 mb-1 flex items-center justify-between">
                    <span>Tone màu không gian</span>
                    <Sparkles className="w-3 h-3 text-[#8C6B4F]" />
                  </div>
                  {LUXURY_PALETTES.map((pal) => (
                    <button
                      key={pal.id}
                      onClick={() => handleThemeChange(pal.id)}
                      className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-left text-xs transition-all ${
                        activeBoard.backgroundStyle === pal.id
                          ? 'bg-[#EDE5D8] dark:bg-[#28211A] text-[#2C2723] dark:text-[#EDE8E1] font-semibold shadow-2xs'
                          : 'text-[#5C534A] dark:text-[#B5AAA0] hover:bg-[#F2ECE3] dark:hover:bg-[#201A15]'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span
                          className="w-3.5 h-3.5 rounded-full border border-[#DDD3C3] dark:border-[#42372E] shadow-xs flex-shrink-0"
                          style={{ backgroundColor: pal.dotColor }}
                        />
                        <div className="truncate">
                          <div className="truncate">{pal.label}</div>
                          <div className="text-[10px] text-[#8E8378] truncate font-normal">{pal.description}</div>
                        </div>
                      </div>
                      {activeBoard.backgroundStyle === pal.id && (
                        <Check className="w-3.5 h-3.5 text-[#8C6B4F] dark:text-[#D4B89D] flex-shrink-0" />
                      )}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Share Button */}
          <button
            onClick={handleShare}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#F0EAE1] dark:bg-[#231D18] hover:bg-[#E5DDCF] dark:hover:bg-[#2C241E] text-[#4A4137] dark:text-[#EDE8E1] text-xs font-semibold border border-[#DDD3C3] dark:border-[#382E25] shadow-2xs transition-all"
          >
            <Share2 className="w-3.5 h-3.5 text-[#8C6B4F]" />
            <span>{shareCopied ? 'Đã chép link!' : 'Chia sẻ'}</span>
          </button>

          {/* Board Options */}
          <div className="relative">
            <button
              onClick={() => setIsMoreMenuOpen(!isMoreMenuOpen)}
              className="p-1.5 rounded-xl text-[#7A6F64] dark:text-[#9E9082] hover:bg-[#F0EAE1] dark:hover:bg-[#231D18] border border-transparent hover:border-[#DDD3C3] dark:hover:border-[#382E25] transition-colors"
            >
              <MoreHorizontal className="w-4 h-4" />
            </button>

            {isMoreMenuOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setIsMoreMenuOpen(false)} />
                <div className="absolute right-0 mt-2 w-48 rounded-2xl bg-[#FAF8F5] dark:bg-[#181512] border border-[#E2DAD0] dark:border-[#2C2621] shadow-2xl p-1.5 z-50 text-xs">
                  <button
                    onClick={() => {
                      setIsEditingTitle(true);
                      setIsMoreMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-left text-[#4A4137] dark:text-[#EDE8E1] hover:bg-[#F2ECE3] dark:hover:bg-[#221C17] transition-colors"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Đổi tên bảng</span>
                  </button>
                  {boards.length > 1 && (
                    <button
                      onClick={() => {
                        if (window.confirm(language === 'vi' ? 'Bạn có chắc chắn muốn xóa bảng này?' : 'Delete this board?')) {
                          deleteBoard(activeBoard.id);
                        }
                        setIsMoreMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-left text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Xóa dự án</span>
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
