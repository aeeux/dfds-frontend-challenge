import { Badge } from "~/components/ui/badge";
import {
  Command,
  CommandGroup,
  CommandItem,
  CommandList,
} from "~/components/ui/command";
import { Command as CommandPrimitive } from "cmdk";
import {
  useRef,
  useState,
  KeyboardEvent,
  Dispatch,
  SetStateAction,
} from "react";

type UnitType = { value: string; label: string };

interface MultiSelectProps {
  unitTypes: UnitType[];
  selected: UnitType[];
  setSelected: Dispatch<SetStateAction<UnitType[]>>;
}

/**
 * MultiSelect component allows selecting multiple items from a list of unit types.
 *
 * @param {MultiSelectProps} props - The props for the MultiSelect component.
 * @returns {JSX.Element} The rendered MultiSelect component.
 */
export function MultiSelect({
  unitTypes,
  selected,
  setSelected,
}: MultiSelectProps): JSX.Element {
  const inputRef = useRef<HTMLInputElement>(null);
  const [inputValue, setInputValue] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [hoveredBadge, setHoveredBadge] = useState<string | null>(null);

  /**
   * Handles unselecting a unit type.
   *
   * @param {UnitType} unitType - The unit type to unselect.
   */
  const handleUnselect = (unitType: UnitType) => {
    setSelected((prev) => prev.filter((s) => s.value !== unitType.value));
  };

  /**
   * Handles selecting a unit type.
   *
   * @param {UnitType} unitType - The unit type to select.
   */
  const handleSelect = (unitType: UnitType) => {
    if (!selected.find((s) => s.value === unitType.value)) {
      setSelected((prev) => [...prev, unitType]);
      setInputValue("");
      inputRef.current?.focus();
      setIsOpen(true);
    }
  };

  /**
   * Handles key down events for the input.
   *
   * @param {KeyboardEvent<HTMLDivElement>} e - The keyboard event.
   */
  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
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

  // Filter unit types based on input value and selected items
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
