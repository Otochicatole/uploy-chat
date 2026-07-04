import { AppIcon } from "@/shared/ui/AppIcon/AppIcon";
import { ArrowUp } from "lucide-react";

type IconButtonProps = {
  disabled?: boolean;
  icon: "more" | "plus" | "send";
  label: string;
  onClick?: () => void;
  type?: "button" | "submit";
  variant?: "ghost" | "send";
};

export function IconButton({
  disabled,
  icon,
  label,
  onClick,
  type = "button",
  variant = "ghost",
}: IconButtonProps) {
  const className =
    variant === "send"
      ? "flex size-8 items-center justify-center rounded-full bg-[linear-gradient(139deg,rgba(124,92,252,.65)_30%,rgba(168,156,255,.65)_75%,rgba(88,184,200,.65)_95%)] text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-45"
      : "flex size-6 items-center justify-center rounded text-uploy-primary transition hover:bg-uploy-surface";

  return (
    <button
      aria-label={label}
      className={className}
      disabled={disabled}
      onClick={onClick}
      type={type}
    >
      {variant === "send" ? (
        <ArrowUp aria-hidden="true" size={15} strokeWidth={1.7} />
      ) : (
        <AppIcon name={icon} size={18} />
      )}
    </button>
  );
}
