"use client";

import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";

const currencies = [
    { label: "USD - US Dollar", value: "USD", symbol: "$" },
    { label: "EUR - Euro", value: "EUR", symbol: "€" },
    { label: "GBP - British Pound", value: "GBP", symbol: "£" },
    { label: "CAD - Canadian Dollar", value: "CAD", symbol: "CA$" },
    { label: "AUD - Australian Dollar", value: "AUD", symbol: "A$" },
    { label: "JPY - Japanese Yen", value: "JPY", symbol: "¥" },
    { label: "CNY - Chinese Yuan", value: "CNY", symbol: "CN¥" },
    { label: "INR - Indian Rupee", value: "INR", symbol: "₹" },
    { label: "BRL - Brazilian Real", value: "BRL", symbol: "R$" },
    { label: "NGN - Nigerian Naira", value: "NGN", symbol: "₦" },
];

interface CurrencySelectProps {
    value?: string;
    onChange: (value: string) => void;
    disabled?: boolean;
}

export function CurrencySelect({ value = "USD", onChange, disabled }: CurrencySelectProps) {
    const [open, setOpen] = React.useState(false);

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="w-full justify-between"
                    disabled={disabled}
                >
                    {value
                        ? currencies.find((currency) => currency.value === value)?.label
                        : "Select currency..."}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[200px] p-0">
                <Command>
                    <CommandInput placeholder="Search currency..." />
                    <CommandList>
                        <CommandEmpty>No currency found.</CommandEmpty>
                        <CommandGroup>
                            {currencies.map((currency) => (
                                <CommandItem
                                    key={currency.value}
                                    value={currency.value}
                                    onSelect={(currentValue) => {
                                        onChange(currentValue === value ? "" : currency.value);
                                        setOpen(false);
                                    }}
                                >
                                    <Check
                                        className={cn(
                                            "mr-2 h-4 w-4",
                                            value === currency.value ? "opacity-100" : "opacity-0"
                                        )}
                                    />
                                    {currency.label}
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
}
