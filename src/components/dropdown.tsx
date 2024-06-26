import * as React from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Button } from "./ui/button";
import { useEffect } from "react";

interface DropdownProps {
  label: string;
  items: { value: string; label: string }[];
  selectedItem: string;
  setSelectedItem: (item: string) => void;
}

/**
 * Dropdown component for selecting an item from a list.
 * @param {DropdownProps} props - Component props.
 * @returns {JSX.Element}
 */
export function Dropdown({
  label,
  items = [],
  selectedItem,
  setSelectedItem,
}: DropdownProps) {
  useEffect(() => {
    if (!selectedItem && items.length > 0) {
      setSelectedItem(items[0]?.value || "");
    }
  }, [items, selectedItem, setSelectedItem]);

  const selectedItemLabel =
    items.find((item) => item.value === selectedItem)?.label ||
    "Select an option";

  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      <label>{label}</label>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline">{selectedItemLabel}</Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56">
          <DropdownMenuLabel>{label}</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {items.map((item) => (
            <DropdownMenuItem
              key={item.value}
              onSelect={() => setSelectedItem(item.value)}
            >
              {item.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
