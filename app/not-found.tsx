import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-4 text-center">
      <h1 className="text-xl font-semibold">Không tìm thấy trang</h1>
      <p className="max-w-md text-sm text-muted-foreground">
        Trang bạn tìm không tồn tại hoặc đã bị di chuyển.
      </p>
      <Button render={<Link href="/workspaces" />}>Về trang chủ</Button>
    </div>
  );
}
