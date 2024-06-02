import * as React from "react";
import { Badge } from "~/components/ui/badge";
import {
  Command,
  CommandGroup,
  CommandItem,
  CommandList,
} from "~/components/ui/command";
import { Command as CommandPrimitive } from "cmdk";

type UnitType = { value: string; label: string };

interface MultiSelectProps {
  unitTypes: UnitType[];
  selected: UnitType[];
  setSelected: React.Dispatch<React.SetStateAction<UnitType[]>>;
}

export function MultiSelect({
  unitTypes,
  selected,
  setSelected,
}: MultiSelectProps) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [inputValue, setInputValue] = React.useState("");
  const [isOpen, setIsOpen] = React.useState(false);
  const [hoveredBadge, setHoveredBadge] = React.useState<string | null>(null);

  const handleUnselect = (unitType: UnitType) => {
    setSelected((prev) => prev.filter((s) => s.value !== unitType.value));
  };

  const handleSelect = (unitType: UnitType) => {
    if (!selected.find((s) => s.value === unitType.value)) {
      setSelected((prev) => [...prev, unitType]);
      setInputValue("");
      inputRef.current?.focus();
      setIsOpen(true);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const input = inputRef.current;
    if (input) {
      if (e.key === "Delete" || e.key === "Backspace") {
        if (input.value === "") {
          setSelected((prev) => {
            const newSelected = [...prev];
            newSelected.pop();
            return newSelected;
          });
        }
      }
      if (e.key === "Escape") {
        input.blur();
      }
    }
  };

  const filteredUnitTypes = unitTypes.filter(
    (unitType) =>
      !selected.some((s) => s.value === unitType.value) &&
      unitType.label.toLowerCase().includes(inputValue.toLowerCase()),
  );

  return (
    <Command
      onKeyDown={handleKeyDown}
      className="overflow-visible bg-transparent"
    >
      <div className="group rounded-md border border-input px-3 py-2 text-sm ring-offset-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2">
        <div className="flex flex-wrap gap-1">
          {selected.map((unitType) => {
            const isHovered = hoveredBadge === unitType.value;
            return (
              <Badge
                key={unitType.value}
                variant={isHovered ? "destructive" : "secondary"}
                onMouseDown={() => handleUnselect(unitType)}
                onMouseEnter={() => setHoveredBadge(unitType.value)}
                onMouseLeave={() => setHoveredBadge(null)}
                style={{ cursor: "pointer" }}
              >
                {unitType.label}
              </Badge>
            );
          })}
          <CommandPrimitive.Input
            ref={inputRef}
            value={inputValue}
            onValueChange={setInputValue}
            onFocus={() => setIsOpen(true)}
            onBlur={(e) => {
              // Delay closing to allow click to register
              setTimeout(() => {
                if (
                  !e.relatedTarget ||
                  !e.relatedTarget.closest(".cmdk-item")
                ) {
                  setIsOpen(false);
                }
              }, 100);
            }}
            placeholder={
              selected.length > 0 ? "Click to delete" : "Select Unit Types..."
            }
            className="ml-2 flex-1 bg-transparent outline-none placeholder:text-muted-foreground"
          />
        </div>
      </div>
      {isOpen && filteredUnitTypes.length > 0 && (
        <div className="relative mt-2">
          <div className="absolute top-0 z-10 w-full rounded-md border border-gray-200 bg-white shadow-lg">
            <CommandList>
              <CommandGroup>
                {filteredUnitTypes.map((unitType) => (
                  <CommandItem
                    key={unitType.value}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleSelect(unitType);
                    }}
                    className="cursor-pointer"
                  >
                    {unitType.label}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </div>
        </div>
      )}
    </Command>
  );
}
