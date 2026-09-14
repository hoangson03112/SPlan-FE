"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  useChangePassword,
  useCurrentUser,
  useUpdateProfile,
} from "@/app/hooks/use-auth";
import { ApiError } from "@/app/lib/axios";

const profileSchema = z.object({
  name: z.string().min(1, "Vui lòng nhập tên").max(100),
});
type ProfileFormValues = z.infer<typeof profileSchema>;

const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(6, "Mật khẩu tối thiểu 6 ký tự"),
    newPassword: z.string().min(6, "Mật khẩu tối thiểu 6 ký tự"),
    confirmPassword: z.string().min(6, "Mật khẩu tối thiểu 6 ký tự"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Mật khẩu xác nhận không khớp",
    path: ["confirmPassword"],
  });
type ChangePasswordFormValues = z.infer<typeof changePasswordSchema>;

function ProfileSection() {
  const { data: currentUser } = useCurrentUser();
  const updateProfile = useUpdateProfile();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProfileFormValues>({ resolver: zodResolver(profileSchema) });

  useEffect(() => {
    if (currentUser) {
      reset({ name: currentUser.name ?? "" });
    }
  }, [currentUser, reset]);

  const onSubmit = handleSubmit((values) => {
    updateProfile.mutate(values);
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Hồ sơ</CardTitle>
        <CardDescription>Thông tin cơ bản của tài khoản.</CardDescription>
      </CardHeader>
      <form onSubmit={onSubmit}>
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="email">Email</Label>
            <Input id="email" value={currentUser?.email ?? ""} disabled />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="name">Tên hiển thị</Label>
            <Input id="name" {...register("name")} />
            {errors.name && (
              <p className="text-xs text-destructive">
                {errors.name.message}
              </p>
            )}
          </div>
          {updateProfile.isSuccess && (
            <p className="text-xs text-emerald-600">Đã lưu thay đổi.</p>
          )}
          {updateProfile.isError && (
            <p className="text-xs text-destructive">
              {(updateProfile.error as ApiError).messages?.[0] ??
                "Có lỗi xảy ra, vui lòng thử lại."}
            </p>
          )}
        </CardContent>
        <CardFooter>
          <Button type="submit" disabled={updateProfile.isPending}>
            {updateProfile.isPending ? "Đang lưu..." : "Lưu thay đổi"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}

function ChangePasswordSection() {
  const changePassword = useChangePassword();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(changePasswordSchema),
  });

  const onSubmit = handleSubmit((values) => {
    changePassword.mutate(
      {
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      },
      { onSuccess: () => reset() },
    );
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Đổi mật khẩu</CardTitle>
        <CardDescription>
          Đổi mật khẩu sẽ đăng xuất khỏi mọi thiết bị khác.
        </CardDescription>
      </CardHeader>
      <form onSubmit={onSubmit}>
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="currentPassword">Mật khẩu hiện tại</Label>
            <Input
              id="currentPassword"
              type="password"
              autoComplete="current-password"
              {...register("currentPassword")}
            />
            {errors.currentPassword && (
              <p className="text-xs text-destructive">
                {errors.currentPassword.message}
              </p>
            )}
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="newPassword">Mật khẩu mới</Label>
            <Input
              id="newPassword"
              type="password"
              autoComplete="new-password"
              {...register("newPassword")}
            />
            {errors.newPassword && (
              <p className="text-xs text-destructive">
                {errors.newPassword.message}
              </p>
            )}
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="confirmPassword">Xác nhận mật khẩu mới</Label>
            <Input
              id="confirmPassword"
              type="password"
              autoComplete="new-password"
              {...register("confirmPassword")}
            />
            {errors.confirmPassword && (
              <p className="text-xs text-destructive">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>
          {changePassword.isSuccess && (
            <p className="text-xs text-emerald-600">Đã đổi mật khẩu.</p>
          )}
          {changePassword.isError && (
            <p className="text-xs text-destructive">
              {(changePassword.error as ApiError).messages?.[0] ??
                "Mật khẩu hiện tại không chính xác."}
            </p>
          )}
        </CardContent>
        <CardFooter>
          <Button type="submit" disabled={changePassword.isPending}>
            {changePassword.isPending ? "Đang lưu..." : "Đổi mật khẩu"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}

export default function SettingsPage() {
  return (
    <div className="mx-auto flex min-h-screen max-w-xl flex-col gap-6 px-4 py-10">
      <Link
        href="/workspaces"
        className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Quay lại
      </Link>
      <h1 className="text-2xl font-semibold">Cài đặt tài khoản</h1>
      <ProfileSection />
      <ChangePasswordSection />
    </div>
  );
}
