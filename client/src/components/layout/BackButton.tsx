import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

interface BackButtonProps {
  fallbackTo: string;
  label: string;
  className?: string;
}

export default function BackButton({
  fallbackTo,
  label,
  className,
}: BackButtonProps) {
  const navigate = useNavigate();

  function goBack() {
    const historyIndex = window.history.state?.idx;
    if (typeof historyIndex === "number" && historyIndex > 0) {
      navigate(-1);
    } else {
      navigate(fallbackTo, { replace: true });
    }
  }

  return (
    <Button
      type="button"
      variant="outline"
      onClick={goBack}
      className={`gap-2 bg-surface/80 border-border/70 hover:bg-surface-alt hover:border-brand-border/60 text-text-muted hover:text-text rounded-xl transition-all duration-200 shadow-sm ${
        className ?? ""
      }`}
    >
      <ArrowLeft aria-hidden="true" className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
      {label}
    </Button>
  );
}