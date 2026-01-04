'use client';

import { useState } from 'react';
import { format, subHours } from 'date-fns';
import { th } from 'date-fns/locale';
import { TrashIcon } from '@/app/components/icons';

interface ReminderItem {
  id: string;
  title: string;
  note?: string | null;
  remindAt: string;
  status: 'ACTIVE' | 'DONE';
}

interface ReminderGroup {
  date: string;
  reminders: ReminderItem[];
}

interface ReminderListProps {
  groups: ReminderGroup[];
  onDone?: (reminder: ReminderItem) => void;
  onBack?: (reminder: ReminderItem) => void;
  onDelete?: (reminder: ReminderItem) => void;
}

function formatNotifyWindow(remindAt: string): string {
  const remindAtDate = new Date(remindAt);
  const windowStart = subHours(remindAtDate, 2);
  
  const startStr = format(windowStart, 'dd/MM HH:mm', { locale: th });
  const endStr = format(remindAtDate, 'dd/MM HH:mm', { locale: th });
  
  return `${startStr} - ${endStr}`;
}

export default function ReminderList({ 
  groups, 
  onDone, 
  onBack, 
  onDelete 
}: ReminderListProps) {
  const [loadingIds, setLoadingIds] = useState<Set<string>>(new Set());

  const handleDone = async (reminder: ReminderItem) => {
    if (loadingIds.has(reminder.id)) return;
    
    setLoadingIds(prev => new Set(prev).add(reminder.id));
    try {
      await onDone?.(reminder);
    } finally {
      setLoadingIds(prev => {
        const next = new Set(prev);
        next.delete(reminder.id);
        return next;
      });
    }
  };

  const handleBack = async (reminder: ReminderItem) => {
    if (loadingIds.has(reminder.id)) return;
    
    setLoadingIds(prev => new Set(prev).add(reminder.id));
    try {
      await onBack?.(reminder);
    } finally {
      setLoadingIds(prev => {
        const next = new Set(prev);
        next.delete(reminder.id);
        return next;
      });
    }
  };

  const handleDelete = async (reminder: ReminderItem) => {
    if (loadingIds.has(reminder.id)) return;
    
    if (!confirm(`ลบการแจ้งเตือน "${reminder.title}" ใช่ไหมครับ?`)) {
      return;
    }
    
    setLoadingIds(prev => new Set(prev).add(reminder.id));
    try {
      await onDelete?.(reminder);
    } finally {
      setLoadingIds(prev => {
        const next = new Set(prev);
        next.delete(reminder.id);
        return next;
      });
    }
  };

  return (
    <div className="space-y-6">
      {groups.map((group, groupIndex) => (
        <div 
          key={groupIndex} 
          className="glass rounded-[2rem] shadow-xl shadow-black/5 overflow-hidden border-white/20 animate-fade-in-up" 
          style={{ animationDelay: `${groupIndex * 0.1}s` }}
        >
          {/* Date header */}
          <div className="flex items-center justify-between px-6 py-4 bg-foreground/5 border-b border-foreground/5">
            <h3 className="text-sm font-black text-foreground/30 uppercase tracking-[0.2em] font-prompt">
              {group.date}
            </h3>
            <span className="text-xs font-bold text-foreground/30">
              {group.reminders.length} รายการ
            </span>
          </div>

          {/* Reminders */}
          <div className="divide-y divide-foreground/5">
            {[...group.reminders]
              .sort((a, b) => {
                const aIsDone = a.status === 'DONE';
                const bIsDone = b.status === 'DONE';
                if (aIsDone && !bIsDone) return 1;
                if (!aIsDone && bIsDone) return -1;
                return new Date(a.remindAt).getTime() - new Date(b.remindAt).getTime();
              })
              .map((reminder) => {
                const showDone = reminder.status === 'ACTIVE';
                const showBack = reminder.status === 'DONE';
                const isDone = reminder.status === 'DONE';
                
                // Format time
                const timeDisplay = format(new Date(reminder.remindAt), 'HH:mm', { locale: th });
                const notifyWindow = formatNotifyWindow(reminder.remindAt);

                return (
                  <div
                    key={reminder.id}
                    className={`group relative flex items-center gap-4 py-4 px-6 transition-all duration-300 ${
                      isDone 
                        ? 'bg-foreground/5 opacity-40 grayscale' 
                        : 'hover:bg-foreground/5'
                    }`}
                  >
                    {/* Bell Icon */}
                    <div className="shrink-0 w-12 h-12 flex items-center justify-center text-2xl bg-foreground/5 rounded-2xl">
                      🔔
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline gap-2 mb-0.5">
                        <p className={`text-sm font-bold font-prompt ${
                          isDone ? 'line-through text-foreground/40' : 'text-foreground'
                        }`}>
                          {reminder.title}
                        </p>
                        <span className="text-[10px] text-foreground/30 font-bold">
                          {timeDisplay}
                        </span>
                      </div>
                      {reminder.note && (
                        <p className="text-xs text-foreground/40 font-medium truncate font-prompt mb-1">
                          {reminder.note}
                        </p>
                      )}
                      <p className="text-[10px] text-primary/60 font-medium font-prompt">
                        ⏰ แจ้งเตือน: {notifyWindow}
                      </p>
                    </div>
                    
                    {/* Action buttons */}
                    <div className="shrink-0 flex items-center gap-2">
                      {showDone && (
                        <button
                          onClick={() => handleDone(reminder)}
                          disabled={loadingIds.has(reminder.id)}
                          className="px-5 py-2.5 text-xs font-bold text-white bg-primary rounded-2xl hover:brightness-105 shadow-lg shadow-primary/20 transition-all active:scale-[0.95] disabled:opacity-50 min-w-[75px] font-prompt"
                        >
                          {loadingIds.has(reminder.id) ? (
                            <svg className="animate-spin h-3.5 w-3.5 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                          ) : (
                            'เสร็จแล้ว'
                          )}
                        </button>
                      )}
                      {showBack && (
                        <button
                          onClick={() => handleBack(reminder)}
                          disabled={loadingIds.has(reminder.id)}
                          className="px-5 py-2.5 text-xs font-bold text-foreground/40 bg-foreground/5 border border-foreground/5 rounded-2xl hover:bg-foreground/10 transition-all active:scale-[0.95] disabled:opacity-50 min-w-[75px] font-prompt"
                        >
                          {loadingIds.has(reminder.id) ? (
                            <svg className="animate-spin h-3.5 w-3.5 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                          ) : (
                            'แก้แป๊บ'
                          )}
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(reminder)}
                        disabled={loadingIds.has(reminder.id)}
                        className="p-2.5 text-foreground/20 hover:text-destructive bg-foreground/5 rounded-xl transition-all active:scale-[0.95] disabled:opacity-50"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      ))}
    </div>
  );
}

