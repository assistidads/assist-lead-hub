import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface ReportFilterProps {
  onFilterChange: (filters: any) => void;
}

export const ReportFilter: React.FC<ReportFilterProps> = ({ onFilterChange }) => {
  const [selectedPeriod, setSelectedPeriod] = useState('');
  const [customDateFrom, setCustomDateFrom] = useState<Date>();
  const [customDateTo, setCustomDateTo] = useState<Date>();

  const handlePeriodChange = (period: string) => {
    setSelectedPeriod(period);
    
    if (period === 'custom') {
      onFilterChange({
        periode: period,
        customDateFrom,
        customDateTo
      });
    } else {
      onFilterChange({
        periode: period
      });
    }
  };

  const handleCustomDateChange = () => {
    onFilterChange({
      periode: 'custom',
      customDateFrom,
      customDateTo
    });
  };

  const resetFilters = () => {
    setSelectedPeriod('');
    setCustomDateFrom(undefined);
    setCustomDateTo(undefined);
    onFilterChange({});
  };

  return (
    <div className="flex flex-wrap gap-4 items-center">
      <Select value={selectedPeriod} onValueChange={handlePeriodChange}>
        <SelectTrigger className="w-[200px]">
          <SelectValue placeholder="Pilih periode waktu" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="today">Hari ini</SelectItem>
          <SelectItem value="yesterday">Kemarin</SelectItem>
          <SelectItem value="this-week">Minggu ini</SelectItem>
          <SelectItem value="last-week">Minggu lalu</SelectItem>
          <SelectItem value="this-month">Bulan ini</SelectItem>
          <SelectItem value="last-month">Bulan lalu</SelectItem>
          <SelectItem value="custom">Custom</SelectItem>
        </SelectContent>
      </Select>

      {selectedPeriod === 'custom' && (
        <>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-[180px] justify-start text-left font-normal",
                  !customDateFrom && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {customDateFrom ? format(customDateFrom, "PPP") : <span>Dari tanggal</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={customDateFrom}
                onSelect={(date) => {
                  setCustomDateFrom(date);
                  if (date) handleCustomDateChange();
                }}
                initialFocus
                className="pointer-events-auto"
              />
            </PopoverContent>
          </Popover>

          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-[180px] justify-start text-left font-normal",
                  !customDateTo && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {customDateTo ? format(customDateTo, "PPP") : <span>Sampai tanggal</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={customDateTo}
                onSelect={(date) => {
                  setCustomDateTo(date);
                  if (date) handleCustomDateChange();
                }}
                initialFocus
                className="pointer-events-auto"
              />
            </PopoverContent>
          </Popover>
        </>
      )}

      <Button variant="outline" onClick={resetFilters}>
        Reset
      </Button>
    </div>
  );
};