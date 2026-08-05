import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Home, RefreshCw, WifiOff } from "lucide-react";

export const metadata = {
  title: "Mất kết nối – VStory",
};

export default function OfflinePage() {
  return (
    <main className="flex min-h-[80vh] flex-col items-center justify-center gap-4 px-4 text-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted">
        <WifiOff className="h-10 w-10 text-muted-foreground" />
      </div>
      <h1 className="text-display-sm">Bạn đang ngoại tuyến</h1>
      <p className="max-w-md text-body-md text-muted-foreground">
        VStory không thể kết nối internet ngay bây giờ. Vui lòng kiểm tra đường truyền hoặc thử lại sau.
      </p>
      <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
        <Button onClick={() => typeof window !== "undefined" && window.location.reload()}>
          <RefreshCw className="h-4 w-4" /> Thử lại
        </Button>
        <Button asChild variant="outline">
          <Link href="/">
            <Home className="h-4 w-4" /> Về trang chủ
          </Link>
        </Button>
      </div>
    </main>
  );
}
