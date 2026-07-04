type SidebarItemProps = {
  active?: boolean;
  icon?: React.ReactNode;
  label: string;
  onClick?: () => void;
};

export function SidebarItem({ active, icon, label, onClick }: SidebarItemProps) {
  return (
    <button
      className={[
        "flex h-8 w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs font-medium leading-4 transition",
        active
          ? "bg-uploy-focus text-uploy-primary"
          : "text-uploy-primary hover:bg-uploy-surface",
      ].join(" ")}
      onClick={onClick}
      type="button"
    >
      {icon}
      <span className="min-w-0 truncate">{label}</span>
    </button>
  );
}
