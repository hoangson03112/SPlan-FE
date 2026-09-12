import { Label } from "@/app/types/types";

/**
 * The backend has no Label table — label definitions are a fixed client-side
 * palette. Only which labels are attached to a given task is persisted
 * (as an array of these ids, inside Item.data.labelIds).
 */
export const LABEL_PALETTE: Label[] = [
  { id: "l-1", name: "Quan trọng & Gấp", color: "#e11d48", bgLight: "#ffe4e6", bgDark: "#4c0519" },
  { id: "l-2", name: "Ý tưởng mới", color: "#7c3aed", bgLight: "#ede9fe", bgDark: "#2e1065" },
  { id: "l-3", name: "Ngân sách & Chi phí", color: "#059669", bgLight: "#d1fae5", bgDark: "#064e3b" },
  { id: "l-4", name: "Cần duyệt / Chờ phản hồi", color: "#d97706", bgLight: "#fef3c7", bgDark: "#451a03" },
  { id: "l-5", name: "Nội dung & Hình ảnh", color: "#2563eb", bgLight: "#dbeafe", bgDark: "#1e3a8a" },
  { id: "l-6", name: "Vận hành & Mua sắm", color: "#0d9488", bgLight: "#ccfbf1", bgDark: "#134e4a" },
];

export function resolveLabels(labelIds: string[] | undefined): Label[] {
  if (!labelIds || labelIds.length === 0) return [];
  return LABEL_PALETTE.filter((l) => labelIds.includes(l.id));
}
