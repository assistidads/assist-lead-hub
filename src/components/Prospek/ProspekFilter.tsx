import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Filter } from 'lucide-react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { cn } from '@/lib/utils';

interface FilterValues {
  kodeAds: string;
  sumberLeads: string;
  layananAssist: string;
  statusLeads: string;
  periode: string;
  customDateFrom?: Date;
  customDateTo?: Date;
}

interface ProspekFilterProps {
  masterData: {
    statusLeads: any[];
    sumberLeads: any[];
    kodeAds: any[];
    layananAssist: any[];
  };
  onFilterChange: (filters: FilterValues) => void;
  onReset: () => void;
}

export const ProspekFilter: React.FC<ProspekFilterProps> = ({
  masterData,
  onFilterChange,
  onReset,
}) => {
  const [filters, setFilters] = useState<FilterValues>({
    kodeAds: '',
    sumberLeads: '',
    layananAssist: '',
    statusLeads: '',
    periode: '',
  });
  const [isOpen, setIsOpen] = useState(false);

  const handleFilterChange = (key: keyof FilterValues, value: string | Date) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleReset = () => {
    const resetFilters: FilterValues = {
      kodeAds: '',
      sumberLeads: '',
      layananAssist: '',
      statusLeads: '',
      periode: '',
    };
    setFilters(resetFilters);
    onReset();
  };

  const handleApplyFilter = () => {
    onFilterChange(filters);
    setIsOpen(false);
  };

  return (
    <div className="w-full">
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" className="w-full justify-between">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              Filter
            </div>
            <div className="text-xs text-muted-foreground">
              {Object.values(filters).filter(Boolean).length} aktif
            </div>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[500px] p-0" align="start">
          <Card>
            <CardContent className="p-4">
              <Accordion type="multiple" className="w-full">
                <AccordionItem value="kode-ads">
                  <AccordionTrigger>Kode Ads</AccordionTrigger>
                  <AccordionContent>
                    <Select
                      value={filters.kodeAds}
                      onValueChange={(value) => handleFilterChange('kodeAds', value === 'all' ? '' : value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Semua Kode Ads" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Semua Kode Ads</SelectItem>
                        {masterData.kodeAds.map((kode) => (
                          <SelectItem key={kode.id} value={kode.id}>
                            {kode.kode}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="sumber-leads">
                  <AccordionTrigger>Sumber Leads</AccordionTrigger>
                  <AccordionContent>
                    <Select
                      value={filters.sumberLeads}
                      onValueChange={(value) => handleFilterChange('sumberLeads', value === 'all' ? '' : value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Semua Sumber Leads" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Semua Sumber Leads</SelectItem>
                        {masterData.sumberLeads.map((sumber) => (
                          <SelectItem key={sumber.id} value={sumber.id}>
                            {sumber.sumber_leads}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="layanan-assist">
                  <AccordionTrigger>Layanan Assist</AccordionTrigger>
                  <AccordionContent>
                    <Select
                      value={filters.layananAssist}
                      onValueChange={(value) => handleFilterChange('layananAssist', value === 'all' ? '' : value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Semua Layanan" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Semua Layanan</SelectItem>
                        {masterData.layananAssist.map((layanan) => (
                          <SelectItem key={layanan.id} value={layanan.id}>
                            {layanan.layanan}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="status-leads">
                  <AccordionTrigger>Status Leads</AccordionTrigger>
                  <AccordionContent>
                    <Select
                      value={filters.statusLeads}
                      onValueChange={(value) => handleFilterChange('statusLeads', value === 'all' ? '' : value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Semua Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Semua Status</SelectItem>
                        {masterData.statusLeads.map((status) => (
                          <SelectItem key={status.id} value={status.id}>
                            {status.status_leads}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="periode-waktu">
                  <AccordionTrigger>Periode Waktu</AccordionTrigger>
                  <AccordionContent className="space-y-4">
                    <Select
                      value={filters.periode}
                      onValueChange={(value) => handleFilterChange('periode', value === 'all' ? '' : value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Semua Waktu" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Semua Waktu</SelectItem>
                        <SelectItem value="today">Hari Ini</SelectItem>
                        <SelectItem value="yesterday">Kemarin</SelectItem>
                        <SelectItem value="this-week">Minggu Ini</SelectItem>
                        <SelectItem value="last-week">Minggu Lalu</SelectItem>
                        <SelectItem value="this-month">Bulan Ini</SelectItem>
                        <SelectItem value="last-month">Bulan Kemarin</SelectItem>
                        <SelectItem value="custom">Custom</SelectItem>
                      </SelectContent>
                    </Select>

                    {filters.periode === 'custom' && (
                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Dari</label>
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                className={cn(
                                  "w-full justify-start text-left font-normal",
                                  !filters.customDateFrom && "text-muted-foreground"
                                )}
                              >
                                {filters.customDateFrom ? (
                                  format(filters.customDateFrom, "dd/MM/yyyy", { locale: id })
                                ) : (
                                  <span>Pilih tanggal</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar
                                mode="single"
                                selected={filters.customDateFrom}
                                onSelect={(date) => handleFilterChange('customDateFrom', date || new Date())}
                                initialFocus
                                className="pointer-events-auto"
                              />
                            </PopoverContent>
                          </Popover>
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Sampai</label>
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                className={cn(
                                  "w-full justify-start text-left font-normal",
                                  !filters.customDateTo && "text-muted-foreground"
                                )}
                              >
                                {filters.customDateTo ? (
                                  format(filters.customDateTo, "dd/MM/yyyy", { locale: id })
                                ) : (
                                  <span>Pilih tanggal</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar
                                mode="single"
                                selected={filters.customDateTo}
                                onSelect={(date) => handleFilterChange('customDateTo', date || new Date())}
                                initialFocus
                                className="pointer-events-auto"
                              />
                            </PopoverContent>
                          </Popover>
                        </div>
                      </div>
                    )}
                  </AccordionContent>
                </AccordionItem>
              </Accordion>

              <div className="flex justify-between gap-2 mt-4 pt-4 border-t">
                <Button variant="outline" onClick={handleReset} className="flex-1">
                  Reset Filter
                </Button>
                <Button onClick={handleApplyFilter} className="flex-1 bg-blue-600 hover:bg-blue-700">
                  Terapkan Filter
                </Button>
              </div>
            </CardContent>
          </Card>
        </PopoverContent>
      </Popover>
    </div>
  );
};