"use client";

import React, { useState } from "react";
import { X, UserPlus, Copy, Check, LogOut, Trash2 } from "lucide-react";
import { useProject } from "@/app/context/ProjectProvider";
import { useCurrentUser } from "@/app/hooks/use-auth";
import {
  useInviteMember,
  useLeaveWorkspace,
  useRemoveMember,
  useUpdateMemberRole,
  useWorkspaceMembers,
} from "@/app/hooks/use-workspaces";
import { getAvatarUrl } from "@/app/lib/avatar";
import { MemberRole } from "@/app/types/models";
import { ApiError } from "@/app/lib/axios";
import { TRANSLATIONS } from "@/app/i18n";

const ROLE_LABEL_KEYS: Record<MemberRole, keyof typeof TRANSLATIONS.vi> = {
  OWNER: "roleOwner",
  ADMIN: "roleAdmin",
  MEMBER: "roleMember",
};

/**
 * "Mời vào Space" — since a Space always belongs to exactly one Workspace
 * and there's no separate space-level membership, inviting someone here
 * adds them as a Workspace member (made explicit in the copy below) so
 * they can see every board in this workspace, not just this one.
 */
export const MembersModal: React.FC = () => {
  const {
    isMembersModalOpen,
    setIsMembersModalOpen,
    activeWorkspace,
    activeBoard,
    t,
  } = useProject();
  const { data: currentUser } = useCurrentUser();

  const { data: members } = useWorkspaceMembers(activeWorkspace.id);
  const inviteMutation = useInviteMember(activeWorkspace.id);
  const updateRoleMutation = useUpdateMemberRole(activeWorkspace.id);
  const removeMutation = useRemoveMember(activeWorkspace.id);
  const leaveMutation = useLeaveWorkspace();

  const [email, setEmail] = useState("");
  const [feedback, setFeedback] = useState<{ type: "ok" | "err"; text: string } | null>(null);
  const [linkCopied, setLinkCopied] = useState(false);

  if (!isMembersModalOpen) return null;

  const isOwner = activeWorkspace.role === "owner";
  const ownerCount = (members ?? []).filter((m) => m.role === "OWNER").length;

  const handleClose = () => {
    setIsMembersModalOpen(false);
    setEmail("");
    setFeedback(null);
  };

  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = email.trim();
    if (!trimmed) return;
    setFeedback(null);
    inviteMutation.mutate(trimmed, {
      onSuccess: () => {
        setFeedback({ type: "ok", text: t.inviteSuccess.replace("{email}", trimmed) });
        setEmail("");
      },
      onError: (err) => {
        const message = err instanceof ApiError ? err.messages[0] : t.inviteFailed;
        setFeedback({ type: "err", text: message });
      },
    });
  };

  const handleCopyLink = () => {
    navigator.clipboard?.writeText(window.location.href);
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2000);
  };

  const handleRoleChange = (userId: string, role: MemberRole) => {
    updateRoleMutation.mutate(
      { userId, role },
      {
        onError: (err) => {
          const message = err instanceof ApiError ? err.messages[0] : t.roleChangeFailed;
          setFeedback({ type: "err", text: message });
        },
      },
    );
  };

  const handleRemove = (userId: string, name: string) => {
    if (!window.confirm(t.removeMemberConfirm.replace("{name}", name))) return;
    removeMutation.mutate(userId, {
      onError: (err) => {
        const message = err instanceof ApiError ? err.messages[0] : t.removeFailed;
        setFeedback({ type: "err", text: message });
      },
    });
  };

  const handleLeave = () => {
    if (!window.confirm(t.leaveWorkspaceConfirm)) return;
    leaveMutation.mutate(activeWorkspace.id, {
      onSuccess: () => handleClose(),
      onError: (err) => {
        const message = err instanceof ApiError ? err.messages[0] : t.leaveFailed;
        setFeedback({ type: "err", text: message });
      },
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-[#161311]/50 backdrop-blur-xs" onClick={handleClose} />

      <div className="relative w-full max-w-lg rounded-3xl bg-[#FAF8F5] dark:bg-[#181411] border border-[#E5DFD5] dark:border-[#2C241D] shadow-2xl z-10 max-h-[85vh] flex flex-col animate-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between p-5 pb-3.5 border-b border-[#EAE3D8] dark:border-[#28211A]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#EDE5D8] dark:bg-[#28211A] flex items-center justify-center text-[#8C6B4F]">
              <UserPlus className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-editorial text-base font-bold text-[#2C2723] dark:text-[#EDE8E1]">
                {t.inviteToBoard.replace("{board}", activeBoard.title)}
              </h3>
              <p className="text-[11px] text-[#8E8378]">
                {t.inviteDescription.replace("{workspace}", activeWorkspace.name)}
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 rounded-xl text-[#8E8378] hover:text-[#2C2723] dark:hover:text-[#EDE8E1]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-4 text-xs">
          {/* Invite by email */}
          <form onSubmit={handleInvite} className="flex items-center gap-2">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t.emailPlaceholder}
              className="flex-1 px-3.5 py-2 rounded-xl bg-white dark:bg-[#1E1915] border border-[#E5DFD5] dark:border-[#2C241D] text-[#2C2723] dark:text-[#EDE8E1] placeholder-[#9E9082] outline-none focus:border-[#8C6B4F]"
            />
            <button
              type="submit"
              disabled={!email.trim() || inviteMutation.isPending}
              className="px-4 py-2 rounded-xl bg-[#2C2723] dark:bg-[#EDE8E1] text-[#FAF8F5] dark:text-[#181512] font-semibold disabled:opacity-40 flex-shrink-0"
            >
              {t.invite}
            </button>
          </form>

          {feedback && (
            <p
              className={
                feedback.type === "ok"
                  ? "text-[#2D6A4F] dark:text-[#78BE93]"
                  : "text-rose-600 dark:text-rose-400"
              }
            >
              {feedback.text}
            </p>
          )}

          {/* Member list */}
          <div className="pt-2 border-t border-[#EFE9E0] dark:border-[#241F1A] space-y-1.5">
            <span className="text-[10px] font-bold text-[#94877A] uppercase tracking-widest">
              {t.members} ({members?.length ?? 0})
            </span>
            {(members ?? []).map((m) => {
              const isSelf = m.userId === currentUser?.id;
              const displayName = m.user.name || m.user.email;
              return (
                <div
                  key={m.userId}
                  className="flex items-center gap-2.5 px-2 py-1.5 rounded-xl hover:bg-white/60 dark:hover:bg-[#1E1915]/60"
                >
                  <img
                    src={getAvatarUrl(displayName)}
                    alt={displayName}
                    referrerPolicy="no-referrer"
                    className="w-7 h-7 rounded-full object-cover flex-shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="font-medium text-[#2C2723] dark:text-[#EDE8E1] truncate">
                      {displayName} {isSelf && <span className="text-[#9E9082] font-normal">({t.you})</span>}
                    </div>
                    <div className="text-[10px] text-[#9E9082] truncate">{m.user.email}</div>
                  </div>

                  {isOwner && !isSelf ? (
                    <>
                      <select
                        value={m.role}
                        onChange={(e) => handleRoleChange(m.userId, e.target.value as MemberRole)}
                        className="text-[11px] rounded-lg border border-[#E5DFD5] dark:border-[#2C241D] bg-transparent px-1.5 py-1 text-[#5C534A] dark:text-[#B5AAA0] outline-none flex-shrink-0"
                      >
                        {(Object.keys(ROLE_LABEL_KEYS) as MemberRole[]).map((r) => (
                          <option key={r} value={r}>
                            {t[ROLE_LABEL_KEYS[r]]}
                          </option>
                        ))}
                      </select>
                      {m.role !== "OWNER" && (
                        <button
                          onClick={() => handleRemove(m.userId, displayName)}
                          className="p-1.5 rounded-lg text-[#9E9082] hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 flex-shrink-0"
                          title={t.removeFromWorkspace}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </>
                  ) : (
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#EFE9E0] dark:bg-[#241E19] text-[#786C60] dark:text-[#A6998C] flex-shrink-0">
                      {t[ROLE_LABEL_KEYS[m.role]]}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="p-5 pt-3.5 border-t border-[#EAE3D8] dark:border-[#28211A] flex items-center justify-between gap-2.5">
          <button
            onClick={handleCopyLink}
            className="flex items-center gap-1.5 text-[#7E7163] hover:text-[#2C2723] dark:hover:text-[#EDE8E1]"
          >
            {linkCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{linkCopied ? t.linkCopied : t.copyLink}</span>
          </button>

          {!(isOwner && ownerCount <= 1) && (
            <button
              onClick={handleLeave}
              className="flex items-center gap-1.5 text-rose-600 dark:text-rose-400 hover:opacity-80"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>{t.leaveWorkspace}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
