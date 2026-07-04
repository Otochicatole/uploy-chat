type DropdownMenuProps = {
  options: string[];
};

export function DropdownMenu({ options }: DropdownMenuProps) {
  return (
    <div className="w-[212px] rounded-lg border border-uploy-line bg-uploy-surface p-1 shadow-2xl">
      {options.map((option, index) => (
        <button
          className="flex h-8 w-full items-center rounded px-2 text-left text-xs leading-4 text-[#cccccc] hover:bg-uploy-focus"
          key={`${option}-${index}`}
          type="button"
        >
          {option}
        </button>
      ))}
    </div>
  );
}
