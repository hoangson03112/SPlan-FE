"use client";

import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
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
import { useForgotPassword } from "@/app/hooks/use-auth";
import { ApiError } from "@/app/lib/axios";

const forgotPasswordSchema = z.object({
  email: z.email("Email không hợp lệ"),
});

type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
  const forgotPassword = useForgotPassword();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = handleSubmit((values) => {
    forgotPassword.mutate(values);
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Quên mật khẩu</CardTitle>
        <CardDescription>
          Nhập email đã đăng ký, chúng tôi sẽ gửi hướng dẫn đặt lại mật khẩu.
        </CardDescription>
      </CardHeader>
      {forgotPassword.isSuccess ? (
        <CardContent>
          <p className="text-sm text-muted-foreground">
            {forgotPassword.data.message}
          </p>
        </CardContent>
      ) : (
        <form onSubmit={onSubmit}>
          <CardContent className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                {...register("email")}
              />
              {errors.email && (
                <p className="text-xs text-destructive">
                  {errors.email.message}
                </p>
              )}
            </div>
            {forgotPassword.isError && (
              <p className="text-xs text-destructive">
                {(forgotPassword.error as ApiError).messages?.[0] ??
                  "Có lỗi xảy ra, vui lòng thử lại."}
              </p>
            )}
          </CardContent>
          <CardFooter className="flex flex-col gap-3">
            <Button
              type="submit"
              className="w-full"
              disabled={forgotPassword.isPending}
            >
              {forgotPassword.isPending ? "Đang gửi..." : "Gửi hướng dẫn"}
            </Button>
          </CardFooter>
        </form>
      )}
      <CardFooter className="justify-center pt-0">
        <p className="text-center text-sm text-muted-foreground">
          <Link href="/login" className="text-primary underline">
            Quay lại đăng nhập
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
