import { Loader2 } from "lucide-react";

interface LoaderProps {
  size?: number;
  className?: string;
  text?: string;
  fullScreen?: boolean;
}

export function Loader({ size = 24, className = "", text = "Loading...", fullScreen = false }: LoaderProps) {
  const container = fullScreen 
    ? "fixed inset-0 flex items-center justify-center bg-black/50 z-50"
    : "flex flex-col items-center justify-center p-8";

  return (
    <div className={container}>
      <div className="flex flex-col items-center gap-2">
        <Loader2 className={`h-${size} w-${size} animate-spin text-primary ${className}`} />
        {text && <p className="text-sm text-gray-400">{text}</p>}
      </div>
    </div>
  );
}
