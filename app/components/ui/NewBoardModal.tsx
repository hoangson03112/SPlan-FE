'use client';

import React, { useState } from 'react';
import { X, FolderKanban } from 'lucide-react';
import { useProject } from '@/app/context/ProjectProvider';
import { Board } from '@/app/types/types';

export const NewBoardModal: React.FC = () => {
  const {
    isNewBoardModalOpen,
    setIsNewBoardModalOpen,
    addBoard,
    t,
    language,
  } = useProject();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('📋');
  const [selectedCategory, setSelectedCategory] = useState<Board['category']>('general');
  const [selectedBackgroundStyle, setSelectedBackgroundStyle] = useState<Board['backgroundStyle']>('warm-stone');

  if (!isNewBoardModalOpen) return null;

  const ICONS = ['📋', '🎬', '🎉', '☕', '📚', '🎯', '💡', '🌱', '🏆', '✈️', '🎨', '🚀'];

  const CATEGORIES: { id: Board['category']; label: string }[] = [
    { id: 'general', label: 'Quản lý tổng hợp' },
    { id: 'content', label: 'Sáng tạo & Truyền thông' },
    { id: 'event', label: 'Sự kiện & Đời sống' },
    { id: 'business', label: 'Kinh doanh & Khởi nghiệp' },
    { id: 'education', label: 'Học tập & Nghiên cứu' },
  ];

  const STYLES: { id: Board['backgroundStyle']; label: string; color: string }[] = [
    { id: 'warm-stone', label: 'Đá ấm tự nhiên', color: '#F7F4EE' },
    { id: 'soft-linen', label: 'Vải lanh nhã', color: '#F8F3E6' },
    { id: 'sage-calm', label: 'Xanh xô thơm', color: '#EDF4EE' },
    { id: 'rose-terracotta', label: 'Đất nung & Hoa hồng', color: '#FDF1EC' },
    { id: 'nordic-sky', label: 'Bắc Âu sương mây', color: '#EFF5F8' },
    { id: 'dark-slate', label: 'Đá phiến trầm', color: '#27201B' },
    { id: 'charcoal-noir', label: 'Than củi Atelier', color: '#181411' },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    addBoard(
      title.trim(),
      description.trim() || (language === 'vi' ? 'Không gian công việc & kế hoạch cao cấp' : 'High-craft project workspace'),
      selectedIcon,
      selectedBackgroundStyle,
      selectedCategory
    );
    setIsNewBoardModalOpen(false);
    setTitle('');
    setDescription('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-[#161311]/50 backdrop-blur-xs transition-opacity"
        onClick={() => setIsNewBoardModalOpen(false)}
      />

      <div className="relative w-full max-w-md rounded-3xl bg-[#FAF8F5] dark:bg-[#181411] border border-[#E5DFD5] dark:border-[#2C241D] shadow-2xl p-6 z-10 space-y-5 animate-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-3.5 border-b border-[#EAE3D8] dark:border-[#28211A]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#EDE5D8] dark:bg-[#28211A] flex items-center justify-center text-[#8C6B4F]">
              <FolderKanban className="w-4 h-4" />
            </div>
            <h3 className="font-editorial text-base font-bold text-[#2C2723] dark:text-[#EDE8E1]">{t.newBoard}</h3>
          </div>
          <button
            onClick={() => setIsNewBoardModalOpen(false)}
            className="p-1.5 rounded-xl text-[#8E8378] hover:text-[#2C2723] dark:hover:text-[#EDE8E1]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs font-sans-ui">
          {/* Title */}
          <div className="space-y-1.5">
            <label className="font-semibold text-[#5A4E42] dark:text-[#C5BAAD]">
              {language === 'vi' ? 'Tên bảng dự án' : 'Board Title'} *
            </label>
            <input
              type="text"
              required
              placeholder={language === 'vi' ? 'VD: Mở xưởng Gốm & Cafe, Bộ sưu tập Thu Đông, Xuất bản Sách...' : 'e.g., Studio Launch, Creative Direction...'}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-white dark:bg-[#1E1915] border border-[#E5DFD5] dark:border-[#2C241D] rounded-2xl text-[#2C2723] dark:text-[#EDE8E1] placeholder-[#9E9082] outline-none focus:border-[#8C6B4F]"
            />
          </div>

          {/* Category */}
          <div className="space-y-1.5">
            <label className="font-semibold text-[#5A4E42] dark:text-[#C5BAAD]">
              {language === 'vi' ? 'Lĩnh vực công việc' : 'Field / Category'}
            </label>
            <div className="grid grid-cols-2 gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  type="button"
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`p-2.5 rounded-2xl text-left border transition-all ${
                    selectedCategory === cat.id
                      ? 'bg-[#EDE5D8] dark:bg-[#28211A] text-[#2C2723] dark:text-[#EDE8E1] border-[#CFC3B0] dark:border-[#423528] font-semibold'
                      : 'bg-white dark:bg-[#1E1915] text-[#5A4E42] dark:text-[#A09386] border-[#E8E1D5] dark:border-[#2C241D] hover:border-[#8C6B4F]'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="font-semibold text-[#5A4E42] dark:text-[#C5BAAD]">
              {language === 'vi' ? 'Mô tả mục tiêu' : 'Description'}
            </label>
            <input
              type="text"
              placeholder={language === 'vi' ? 'Mục tiêu chiến lược, thời hạn hoàn thành...' : 'Goal or purpose...'}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2 bg-white dark:bg-[#1E1915] border border-[#E5DFD5] dark:border-[#2C241D] rounded-2xl text-[#2C2723] dark:text-[#EDE8E1] placeholder-[#9E9082] outline-none focus:border-[#8C6B4F]"
            />
          </div>

          {/* Icon picker */}
          <div className="space-y-1.5">
            <label className="font-semibold text-[#5A4E42] dark:text-[#C5BAAD]">
              {language === 'vi' ? 'Biểu tượng bảng' : 'Icon'}
            </label>
            <div className="flex items-center gap-1.5 flex-wrap">
              {ICONS.map((icon) => (
                <button
                  type="button"
                  key={icon}
                  onClick={() => setSelectedIcon(icon)}
                  className={`w-8 h-8 rounded-xl flex items-center justify-center text-base transition-all ${
                    selectedIcon === icon
                      ? 'bg-[#EDE5D8] dark:bg-[#28211A] border border-[#8C6B4F] scale-105 shadow-2xs'
                      : 'bg-white dark:bg-[#1E1915] border border-[#E8E1D5] dark:border-[#2C241D] hover:scale-105'
                  }`}
                >
                  {icon}
                </button>
              ))}
            </div>
          </div>

          {/* Style */}
          <div className="space-y-1.5">
            <label className="font-semibold text-[#5A4E42] dark:text-[#C5BAAD]">
              Tông màu không gian
            </label>
            <div className="grid grid-cols-2 gap-2">
              {STYLES.map((st) => (
                <button
                  type="button"
                  key={st.id}
                  onClick={() => setSelectedBackgroundStyle(st.id)}
                  className={`flex items-center gap-2 p-2 rounded-2xl text-left border transition-all ${
                    selectedBackgroundStyle === st.id
                      ? 'bg-[#EDE5D8] dark:bg-[#28211A] text-[#2C2723] dark:text-[#EDE8E1] border-[#CFC3B0] dark:border-[#423528] font-semibold'
                      : 'bg-white dark:bg-[#1E1915] text-[#5A4E42] dark:text-[#A09386] border-[#E8E1D5] dark:border-[#2C241D] hover:border-[#8C6B4F]'
                  }`}
                >
                  <span className="w-3.5 h-3.5 rounded-full border border-[#DDD3C3] shadow-2xs flex-shrink-0" style={{ backgroundColor: st.color }} />
                  <span className="truncate text-[11px]">{st.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Submit */}
          <div className="pt-3 border-t border-[#EAE3D8] dark:border-[#28211A] flex justify-end gap-2.5">
            <button
              type="button"
              onClick={() => setIsNewBoardModalOpen(false)}
              className="px-4 py-2 rounded-xl text-[#7E7163] hover:text-[#2C2723] dark:hover:text-[#EDE8E1]"
            >
              {t.cancel}
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-2xl bg-[#2C2723] dark:bg-[#EDE8E1] text-[#FAF8F5] dark:text-[#181512] font-semibold shadow-xs hover:opacity-90 transition-opacity"
            >
              {language === 'vi' ? 'Khởi tạo không gian' : 'Create Board'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
