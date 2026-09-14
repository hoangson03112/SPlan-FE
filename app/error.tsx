"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-4 text-center">
      <h1 className="text-xl font-semibold">Đã có lỗi xảy ra</h1>
      <p className="max-w-md text-sm text-muted-foreground">
        Rất tiếc, có gì đó không ổn khi tải trang này. Bạn có thể thử lại hoặc
        quay về trang chủ.
      </p>
      <div className="flex gap-3">
        <Button variant="outline" onClick={() => router.push("/")}>
          Về trang chủ
        </Button>
        <Button onClick={() => reset()}>Thử lại</Button>
      </div>
    </div>
  );
}
