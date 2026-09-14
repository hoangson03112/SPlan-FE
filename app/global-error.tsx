"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="vi">
      <body>
        <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-4 text-center font-sans">
          <h1 className="text-xl font-semibold">Ứng dụng gặp sự cố</h1>
          <p className="max-w-md text-sm text-muted-foreground">
            Đã có lỗi nghiêm trọng xảy ra. Vui lòng tải lại trang.
          </p>
          <button
            onClick={() => reset()}
            className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white"
          >
            Thử lại
          </button>
        </div>
      </body>
    </html>
  );
}
