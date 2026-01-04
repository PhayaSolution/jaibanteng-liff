'use client';

import { useState, useEffect } from 'react';
import { format, startOfMonth } from 'date-fns';
import { th } from 'date-fns/locale';
import { Calendar as CalendarIcon, Clock, ArrowLeft } from 'lucide-react';
import { Calendar } from '@/app/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/app/components/ui/popover';
import { Button } from '@/app/components/ui/button';
import { cn } from '@/app/lib/utils';

interface DateTimePickerProps {
  value?: Date;
  onChange: (date: Date | undefined) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export function DateTimePicker({
  value,
  onChange,
  placeholder = 'เลือกวันเวลา',
  className,
  disabled = false,
}: DateTimePickerProps) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<'date' | 'time'>('date');
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(value);
  const [displayMonth, setDisplayMonth] = useState<Date>(
    value ? startOfMonth(value) : startOfMonth(new Date())
  );
  const [selectedHour, setSelectedHour] = useState<number>(
    value ? value.getHours() : new Date().getHours() + 1
  );
  const [selectedMinute, setSelectedMinute] = useState<number>(
    value ? value.getMinutes() : 0
  );

  // Sync internal state when value prop changes
  useEffect(() => {
    if (value) {
      setSelectedDate(value);
      setDisplayMonth(startOfMonth(value));
      setSelectedHour(value.getHours());
      setSelectedMinute(value.getMinutes());
    }
  }, [value]);

  // Reset to current value when popover opens
  useEffect(() => {
    if (open) {
      setStep('date'); // Always start with date step
      if (value) {
        setSelectedDate(value);
        setDisplayMonth(startOfMonth(value));
        setSelectedHour(value.getHours());
        setSelectedMinute(value.getMinutes());
      } else {
        // If no value, show current month
        const now = new Date();
        setDisplayMonth(startOfMonth(now));
      }
    }
  }, [open, value]);

  // Generate hour options (0-23)
  const hours = Array.from({ length: 24 }, (_, i) => i);
  
  // Generate minute options (0, 5, 10, ..., 55)
  const minutes = Array.from({ length: 12 }, (_, i) => i * 5);

  const handleDateSelect = (date: Date | undefined) => {
    if (!date) {
      setSelectedDate(undefined);
      return;
    }

    // Set selected date (without time for now)
    setSelectedDate(date);
    // Update display month to the selected date's month
    setDisplayMonth(startOfMonth(date));
    
    // Move to time selection step
    setStep('time');
  };

  // Handle day click to ensure it works even when clicking already selected date
  const handleDayClick = (date: Date) => {
    // Always move to time step when clicking any date
    setSelectedDate(date);
    setDisplayMonth(startOfMonth(date));
    setStep('time');
  };

  const handleMonthChange = (month: Date) => {
    setDisplayMonth(month);
  };

  const handleTimeChange = (hour: number, minute: number) => {
    setSelectedHour(hour);
    setSelectedMinute(minute);
  };

  const handleConfirm = () => {
    if (selectedDate) {
      const finalDate = new Date(selectedDate);
      finalDate.setHours(selectedHour, selectedMinute, 0, 0);
      onChange(finalDate);
    } else {
      // If no date selected, create date with selected time
      const now = new Date();
      now.setHours(selectedHour, selectedMinute, 0, 0);
      onChange(now);
    }
    setOpen(false);
  };

  const displayValue = value
    ? format(value, 'd MMM yyyy HH:mm', { locale: th })
    : placeholder;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          disabled={disabled}
          className={cn(
            'w-full justify-start text-left font-normal font-prompt',
            !value && 'text-muted-foreground',
            className
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          <span className="font-bold">{displayValue}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent 
        className="w-[calc(100vw-2rem)] max-w-sm p-0 border-none shadow-2xl rounded-[2rem] bg-white dark:bg-zinc-950 max-h-[calc(100dvh-env(safe-area-inset-top)-env(safe-area-inset-bottom)-4rem)] overflow-hidden flex flex-col" 
        align="center"
        side="bottom"
        sideOffset={8}
        collisionPadding={16}
        avoidCollisions={true}
      >
        {step === 'date' ? (
          <>
            {/* Date Selection Step */}
            <div className="p-4 sm:p-6 pb-[calc(1.5rem+env(safe-area-inset-bottom))] overflow-y-auto overscroll-contain touch-pan-y [-webkit-overflow-scrolling:touch]">
              <div className="mb-4">
                <h3 className="text-base font-bold text-foreground font-prompt text-center mb-1">
                  เลือกวันที่
                </h3>
                {selectedDate && (
                  <p className="text-xs text-foreground/50 font-prompt text-center">
                    {format(selectedDate, 'd MMMM yyyy', { locale: th })}
                  </p>
                )}
              </div>
              
              <div className="flex justify-center">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={handleDateSelect}
                  onDayClick={handleDayClick}
                  month={displayMonth}
                  onMonthChange={handleMonthChange}
                  initialFocus
                  className="rounded-[2rem] [--cell-size:2.5rem] sm:[--cell-size:2.8rem]"
                />
              </div>
            </div>
          </>
        ) : (
          <>
            {/* Time Selection Step */}
            <div className="p-4 sm:p-6 pb-0 overflow-y-auto overscroll-contain touch-pan-y [-webkit-overflow-scrolling:touch] flex flex-col min-h-0">
              {/* Back Button */}
              <button
                onClick={() => setStep('date')}
                className="flex items-center gap-2 mb-4 text-foreground/60 hover:text-foreground transition-colors font-prompt self-start"
              >
                <ArrowLeft className="h-4 w-4" />
                <span className="text-sm font-medium">ย้อนกลับ</span>
              </button>

              {/* Selected Date Display */}
              {selectedDate && (
                <div className="mb-4 text-center">
                  <p className="text-xs text-foreground/40 font-prompt mb-1 uppercase tracking-wider">วันที่เลือก</p>
                  <p className="text-lg font-bold text-foreground font-prompt">
                    {format(selectedDate, 'd MMMM yyyy', { locale: th })}
                  </p>
                </div>
              )}

              {/* Time Selection */}
              <div className="flex-1 flex flex-col justify-center space-y-4">
                {/* Header */}
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Clock className="h-4 w-4 text-primary" />
                  <span className="text-sm font-bold text-foreground/60 font-prompt uppercase tracking-wider">
                    เลือกเวลา
                  </span>
                </div>
                
                {/* Time Selectors */}
                <div className="flex items-center gap-4 max-w-sm mx-auto w-full">
                  {/* Hour Selector */}
                  <div className="flex-1">
                    <label className="block text-xs font-medium text-foreground/40 mb-2 font-prompt text-center uppercase tracking-wider">
                      ชั่วโมง
                    </label>
                    <select
                      value={selectedHour}
                      onChange={(e) => handleTimeChange(parseInt(e.target.value), selectedMinute)}
                      className="w-full px-4 py-3 rounded-2xl border-2 border-foreground/10 bg-background text-xl font-bold text-foreground font-prompt focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all text-center appearance-none cursor-pointer"
                    >
                      {hours.map((hour) => (
                        <option key={hour} value={hour}>
                          {hour.toString().padStart(2, '0')}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex items-center pt-10">
                    <span className="text-3xl font-bold text-foreground">:</span>
                  </div>

                  {/* Minute Selector */}
                  <div className="flex-1">
                    <label className="block text-xs font-medium text-foreground/40 mb-2 font-prompt text-center uppercase tracking-wider">
                      นาที
                    </label>
                    <select
                      value={selectedMinute}
                      onChange={(e) => handleTimeChange(selectedHour, parseInt(e.target.value))}
                      className="w-full px-4 py-3 rounded-2xl border-2 border-foreground/10 bg-background text-xl font-bold text-foreground font-prompt focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all text-center appearance-none cursor-pointer"
                    >
                      {minutes.map((minute) => (
                        <option key={minute} value={minute}>
                          {minute.toString().padStart(2, '0')}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Preview */}
                <div className="pt-4 border-t border-foreground/10 text-center">
                  <p className="text-xs text-foreground/40 font-prompt mb-1 uppercase tracking-wider">เวลาที่เลือก</p>
                  <p className="text-2xl font-bold text-primary font-prompt">
                    {selectedHour.toString().padStart(2, '0')}:{selectedMinute.toString().padStart(2, '0')}
                  </p>
                </div>
              </div>
            </div>

            {/* Confirm Button */}
            <div className="sticky bottom-0 p-4 sm:p-6 pt-4 bg-white dark:bg-zinc-950 rounded-b-[2rem] border-t border-foreground/10 pb-[calc(1rem+env(safe-area-inset-bottom))]">
              <Button
                onClick={handleConfirm}
                className="w-full py-4 text-base font-bold text-white bg-primary rounded-xl hover:brightness-105 shadow-lg shadow-primary/20 transition-all active:scale-[0.98] font-prompt"
              >
                เสร็จแล้ว
              </Button>
            </div>
          </>
        )}
      </PopoverContent>
    </Popover>
  );
}

