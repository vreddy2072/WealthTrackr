import * as React from "react";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { DateRange } from "react-day-picker";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import { forwardRef, useState } from "react";

interface SeparateDateRangePickerProps {
  dateRange: DateRange;
  setDateRange: React.Dispatch<React.SetStateAction<DateRange>>;
  className?: string;
}

export const SeparateDateRangePicker = forwardRef<HTMLDivElement, SeparateDateRangePickerProps>((
  { dateRange, setDateRange, className },
  ref
) => {
  return (
    <div ref={ref} className={cn("flex flex-col sm:flex-row gap-2", className)}>
      {/* Start Date Picker */}
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="start-date" className="text-xs font-medium">
          Start Date
        </Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              id="start-date"
              variant={"outline"}
              className={cn(
                "w-full sm:w-[140px] justify-start text-left font-normal",
                !dateRange?.from && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {dateRange?.from ? (
                format(dateRange.from, "MMM dd, yyyy")
              ) : (
                <span>Start date</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0 z-50" align="start" side="bottom">
            <Calendar
              initialFocus
              mode="single"
              defaultMonth={dateRange?.from}
              selected={dateRange?.from}
              onSelect={(date) => {
                if (date) {
                  setDateRange(prev => ({
                    from: date,
                    to: prev?.to && date && prev.to < date ? date : prev?.to
                  }));
                }
              }}
              numberOfMonths={1}
            />
          </PopoverContent>
        </Popover>
      </div>

      {/* End Date Picker */}
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="end-date" className="text-xs font-medium">
          End Date
        </Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              id="end-date"
              variant={"outline"}
              className={cn(
                "w-full sm:w-[140px] justify-start text-left font-normal",
                !dateRange?.to && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {dateRange?.to ? (
                format(dateRange.to, "MMM dd, yyyy")
              ) : (
                <span>End date</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0 z-50" align="start" side="bottom">
            <Calendar
              initialFocus
              mode="single"
              defaultMonth={dateRange?.to || dateRange?.from}
              selected={dateRange?.to}
              disabled={(date) =>
                date < (dateRange?.from || new Date(0)) ||
                date > new Date()
              }
              onSelect={(date) => {
                if (date) {
                  setDateRange(prev => ({
                    from: prev?.from,
                    to: date
                  }));
                }
              }}
              numberOfMonths={1}
            />
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
});

SeparateDateRangePicker.displayName = "SeparateDateRangePicker";
