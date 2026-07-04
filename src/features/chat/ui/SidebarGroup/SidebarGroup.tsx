import { SidebarItem } from "../SidebarItem/SidebarItem";

type SidebarGroupItem = {
  id: string;
  label: string;
  active?: boolean;
};

type SidebarGroupProps = {
  title: string;
  items: SidebarGroupItem[];
  muted?: boolean;
  onItemSelect?: (itemId: string) => void;
};

export function SidebarGroup({
  title,
  items,
  muted,
  onItemSelect,
}: SidebarGroupProps) {
  return (
    <section className="flex flex-col gap-2">
      <div className="flex items-center gap-1">
        <h2
          className={
            muted
              ? "text-[11px] leading-[14px] text-uploy-muted"
              : "text-[11px] leading-[14px] text-uploy-secondary"
          }
        >
          {title}
        </h2>
        <span className="h-px flex-1 bg-uploy-line" />
      </div>

      <div className="flex flex-col gap-2">
        {items.map((item) => (
          <SidebarItem
            active={item.active}
            key={item.id}
            label={item.label}
            onClick={() => onItemSelect?.(item.id)}
          />
        ))}
      </div>
    </section>
  );
}
