"use client";

import React, { useState, useEffect } from "react";
import { FaChevronLeft, FaChevronRight, FaPlus, FaTrash, FaPen, FaClock, FaCheck, FaXmark } from "react-icons/fa6";

interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  category: "work" | "personal" | "urgent" | "social";
  description?: string;
}

const CATEGORIES = {
  work: { label: "Work", color: "bg-sky-400", text: "text-sky-400", border: "border-sky-500/20", badge: "bg-sky-400/10 text-sky-300 border-sky-400/20" },
  personal: { label: "Personal", color: "bg-emerald-400", text: "text-emerald-400", border: "border-emerald-500/20", badge: "bg-emerald-400/10 text-emerald-300 border-emerald-400/20" },
  urgent: { label: "Urgent", color: "bg-amber-400", text: "text-amber-400", border: "border-amber-500/20", badge: "bg-amber-400/10 text-amber-300 border-amber-400/20" },
  social: { label: "Social", color: "bg-purple-400", text: "text-purple-400", border: "border-purple-500/20", badge: "bg-purple-400/10 text-purple-300 border-purple-400/20" },
};

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function CalendarApp() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [isAddingEvent, setIsAddingEvent] = useState(false);
  const [editingEventId, setEditingEventId] = useState<string | null>(null);

  const [eventTitle, setEventTitle] = useState("");
  const [eventStartTime, setEventStartTime] = useState("09:00");
  const [eventEndTime, setEventEndTime] = useState("10:00");
  const [eventCategory, setEventCategory] = useState<keyof typeof CATEGORIES>("work");
  const [eventDescription, setEventDescription] = useState("");

  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();

  const formatDateString = (date: Date): string => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("glassos_calendar_events");
      if (stored) {
        try {
          setEvents(JSON.parse(stored));
        } catch (e) {
          console.error("Failed to parse calendar events", e);
        }
      } else {
        const todayStr = formatDateString(new Date());
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const tomorrowStr = formatDateString(tomorrow);

        const mockEvents: CalendarEvent[] = [
          {
            id: "ev-1",
            title: "Project Sync",
            date: todayStr,
            startTime: "10:00",
            endTime: "11:30",
            category: "work",
            description: "Catch up with the team on app features."
          },
          {
            id: "ev-2",
            title: "Doctor Appointment",
            date: tomorrowStr,
            startTime: "14:00",
            endTime: "15:00",
            category: "personal",
            description: "Routine checkup at the clinic."
          },
          {
            id: "ev-3",
            title: "Finish Assignment",
            date: todayStr,
            startTime: "16:00",
            endTime: "17:30",
            category: "urgent",
            description: "Complete assignment due tonight."
          }
        ];
        setEvents(mockEvents);
        localStorage.setItem("glassos_calendar_events", JSON.stringify(mockEvents));
      }
    }
  }, []);

  const saveEventsToStorage = (updatedEvents: CalendarEvent[]) => {
    setEvents(updatedEvents);
    if (typeof window !== "undefined") {
      localStorage.setItem("glassos_calendar_events", JSON.stringify(updatedEvents));
    }
  };

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth + 1, 1));
  };

  const handleToday = () => {
    const now = new Date();
    setCurrentDate(new Date(now.getFullYear(), now.getMonth(), 1));
    setSelectedDate(now);
  };

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfWeek = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
  };

  const buildCalendarGrid = () => {
    const daysInMonth = getDaysInMonth(currentYear, currentMonth);
    const firstDayIndex = getFirstDayOfWeek(currentYear, currentMonth);
    const prevMonthDays = getDaysInMonth(currentYear, currentMonth - 1);

    const cells: { date: Date; isCurrentMonth: boolean }[] = [];

    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const d = new Date(currentYear, currentMonth - 1, prevMonthDays - i);
      cells.push({ date: d, isCurrentMonth: false });
    }

    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(currentYear, currentMonth, d);
      cells.push({ date, isCurrentMonth: true });
    }

    const remaining = 42 - cells.length;
    for (let d = 1; d <= remaining; d++) {
      const date = new Date(currentYear, currentMonth + 1, d);
      cells.push({ date, isCurrentMonth: false });
    }

    return cells;
  };

  const handleSaveEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventTitle.trim()) return;

    const dateStr = formatDateString(selectedDate);

    if (editingEventId) {
      const updated = events.map((ev) =>
        ev.id === editingEventId
          ? {
            ...ev,
            title: eventTitle,
            startTime: eventStartTime,
            endTime: eventEndTime,
            category: eventCategory,
            description: eventDescription,
          }
          : ev
      );
      saveEventsToStorage(updated);
    } else {
      const newEv: CalendarEvent = {
        id: "ev-" + Date.now(),
        title: eventTitle,
        date: dateStr,
        startTime: eventStartTime,
        endTime: eventEndTime,
        category: eventCategory,
        description: eventDescription,
      };
      saveEventsToStorage([...events, newEv]);
    }

    setIsAddingEvent(false);
    setEditingEventId(null);
    setEventTitle("");
    setEventDescription("");
  };

  const handleDeleteEvent = (id: string) => {
    const updated = events.filter((e) => e.id !== id);
    saveEventsToStorage(updated);
  };

  const handleStartEdit = (ev: CalendarEvent) => {
    setEditingEventId(ev.id);
    setEventTitle(ev.title);
    setEventStartTime(ev.startTime);
    setEventEndTime(ev.endTime);
    setEventCategory(ev.category);
    setEventDescription(ev.description || "");
    setIsAddingEvent(true);
  };

  const selectedDateStr = formatDateString(selectedDate);
  const selectedDayEvents = events.filter((e) => e.date === selectedDateStr);
  const dayCells = buildCalendarGrid();

  return (
    <div className="h-full flex flex-col md:flex-row gap-4 p-4 text-white overflow-y-auto no-scrollbar">
      <div className="flex flex-col flex-1 bg-zinc-950/60 backdrop-blur-xl border border-white/[0.08] rounded-xl p-4 min-w-0">
        <div className="flex justify-between items-center mb-4 pb-3 border-b border-white/[0.08]">
          <div className="flex items-baseline gap-2">
            <h2 className="text-xl font-medium tracking-tight text-white">
              {MONTHS[currentMonth]}
            </h2>
            <span className="text-sm font-mono text-neutral-400">{currentYear}</span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={handleToday}
              className="px-2.5 py-1 text-xs font-medium bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 rounded-md transition-all active:scale-95 text-neutral-300"
            >
              Today
            </button>
            <div className="flex items-center bg-white/[0.04] border border-white/10 rounded-md p-0.5">
              <button
                onClick={handlePrevMonth}
                className="p-1 hover:bg-white/10 rounded text-neutral-400 hover:text-white transition-all"
              >
                <FaChevronLeft size={11} />
              </button>
              <button
                onClick={handleNextMonth}
                className="p-1 hover:bg-white/10 rounded text-neutral-400 hover:text-white transition-all"
              >
                <FaChevronRight size={11} />
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-7 mb-2 py-1 border-b border-white/[0.06] text-xs font-medium text-neutral-400 text-center uppercase tracking-wider">
          {WEEKDAYS.map((day) => (
            <div key={day} className="py-1">
              {day}
            </div>
          ))}
        </div>

        <div className="flex-1 items-stretch gap-1.5 grid grid-cols-7 min-h-[260px]">
          {dayCells.map(({ date, isCurrentMonth }, idx) => {
            const dateStr = formatDateString(date);
            const isSelected = dateStr === selectedDateStr;
            const isToday = formatDateString(new Date()) === dateStr;
            const dayEvents = events.filter((e) => e.date === dateStr);

            return (
              <button
                key={idx}
                onClick={() => {
                  setSelectedDate(date);
                  if (date.getMonth() !== currentMonth) {
                    setCurrentDate(new Date(date.getFullYear(), date.getMonth(), 1));
                  }
                }}
                className={`calendar-cell flex flex-col items-center justify-between p-1.5 rounded-lg border transition-all text-left relative group min-h-[46px] select-none cursor-pointer ${isCurrentMonth ? "text-neutral-200" : "text-neutral-600"
                  } ${isSelected
                    ? "bg-white/[0.12] border-white/25 shadow-md"
                    : isToday
                      ? "bg-sky-400/10 border-sky-400/30 text-sky-300"
                      : "bg-white/[0.02] border-white/[0.05] hover:bg-white/[0.06] hover:border-white/10"
                  }`}
              >
                <span className={`text-xs font-medium relative ${isToday ? "font-semibold text-sky-400" : ""}`}>
                  {date.getDate()}
                </span>

                <div className="flex flex-wrap justify-center gap-1 mt-1 w-full max-w-[36px]">
                  {dayEvents.slice(0, 3).map((e) => (
                    <span
                      key={e.id}
                      className={`w-1.5 h-1.5 rounded-full ${CATEGORIES[e.category]?.color || "bg-neutral-400"}`}
                    />
                  ))}
                  {dayEvents.length > 3 && (
                    <span className="-mt-1 font-bold text-[8px] text-neutral-400">+</span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex flex-col bg-zinc-950/60 backdrop-blur-xl p-4 border border-white/[0.08] rounded-xl w-full md:w-80 overflow-hidden shrink-0">
        {isAddingEvent ? (
          <form onSubmit={handleSaveEvent} className="flex flex-col flex-1 overflow-y-auto no-scrollbar">
            <div className="flex justify-between items-center mb-4 pb-2 border-b border-white/[0.08]">
              <h3 className="font-medium text-white text-base">
                {editingEventId ? "Edit Event" : "New Event"}
              </h3>
              <button
                type="button"
                onClick={() => {
                  setIsAddingEvent(false);
                  setEditingEventId(null);
                  setEventTitle("");
                }}
                className="hover:bg-white/10 p-1 rounded text-neutral-400 hover:text-white transition-all"
              >
                <FaXmark size={14} />
              </button>
            </div>

            <div className="flex flex-col flex-1 gap-3">
              <div>
                <label className="block mb-1 font-medium text-neutral-400 text-xs">Title</label>
                <input
                  type="text"
                  required
                  placeholder="Event title"
                  value={eventTitle}
                  onChange={(e) => setEventTitle(e.target.value)}
                  className="bg-white/[0.04] px-3 py-2 border border-white/10 focus:border-white/20 rounded-lg focus:outline-none w-full text-white text-xs placeholder-neutral-500"
                />
              </div>

              <div className="flex gap-2">
                <div className="flex-1">
                  <label className="block mb-1 font-medium text-neutral-400 text-xs">Start Time</label>
                  <input
                    type="time"
                    required
                    value={eventStartTime}
                    onChange={(e) => setEventStartTime(e.target.value)}
                    className="bg-white/[0.04] px-2.5 py-2 border border-white/10 focus:border-white/20 rounded-lg focus:outline-none w-full text-white text-xs"
                  />
                </div>
                <div className="flex-1">
                  <label className="block mb-1 font-medium text-neutral-400 text-xs">End Time</label>
                  <input
                    type="time"
                    required
                    value={eventEndTime}
                    onChange={(e) => setEventEndTime(e.target.value)}
                    className="bg-white/[0.04] px-2.5 py-2 border border-white/10 focus:border-white/20 rounded-lg focus:outline-none w-full text-white text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block mb-1 font-medium text-neutral-400 text-xs">Category</label>
                <div className="gap-1.5 grid grid-cols-2">
                  {(Object.keys(CATEGORIES) as Array<keyof typeof CATEGORIES>).map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setEventCategory(cat)}
                      className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-lg border text-left cursor-pointer transition-all ${eventCategory === cat
                        ? "bg-white/10 border-white/20 text-white"
                        : "bg-white/[0.02] border-transparent text-neutral-400 hover:bg-white/[0.06] hover:text-neutral-200"
                        }`}
                    >
                      <span className={`w-2 h-2 rounded-full ${CATEGORIES[cat].color}`} />
                      {CATEGORIES[cat].label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-col flex-1 min-h-[80px]">
                <label className="block mb-1 font-medium text-neutral-400 text-xs">Description</label>
                <textarea
                  placeholder="Add notes..."
                  value={eventDescription}
                  onChange={(e) => setEventDescription(e.target.value)}
                  className="flex-1 bg-white/[0.04] px-3 py-2 border border-white/10 focus:border-white/20 rounded-lg focus:outline-none w-full min-h-[70px] text-white text-xs resize-none placeholder-neutral-500"
                />
              </div>
            </div>

            <button
              type="submit"
              className="flex justify-center items-center gap-1.5 bg-white text-zinc-950 hover:bg-neutral-200 shadow-sm mt-4 px-4 py-2 rounded-lg w-full font-medium text-xs active:scale-[0.98] transition-all cursor-pointer"
            >
              <FaCheck size={11} />
              Save Event
            </button>
          </form>
        ) : (
          <div className="flex flex-col flex-1 overflow-hidden">
            <div className="flex justify-between items-center mb-4 pb-2 border-b border-white/[0.08]">
              <div>
                <h3 className="font-medium text-white text-base">Agenda</h3>
                <p className="text-[11px] text-neutral-400">{selectedDate.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}</p>
              </div>
              <button
                onClick={() => {
                  setEventTitle("");
                  setEventStartTime("09:00");
                  setEventEndTime("10:00");
                  setEventCategory("work");
                  setEventDescription("");
                  setEditingEventId(null);
                  setIsAddingEvent(true);
                }}
                className="flex items-center gap-1 bg-white text-zinc-950 hover:bg-neutral-200 px-3 py-1.5 rounded-lg font-medium text-xs active:scale-[0.98] transition-all cursor-pointer"
              >
                <FaPlus size={10} /> Add
              </button>
            </div>

            <div className="flex flex-col flex-1 gap-2 overflow-y-auto no-scrollbar">
              {selectedDayEvents.length === 0 ? (
                <div className="flex flex-col flex-1 justify-center items-center p-4 text-center">
                  <span className="text-neutral-500 text-xs">No events scheduled.</span>
                  <button
                    onClick={() => setIsAddingEvent(true)}
                    className="mt-2 font-medium text-sky-400 text-xs hover:underline cursor-pointer"
                  >
                    Add an event
                  </button>
                </div>
              ) : (
                selectedDayEvents.map((ev) => (
                  <div
                    key={ev.id}
                    className={`p-3 bg-white/[0.03] border rounded-lg flex flex-col gap-1.5 group hover:bg-white/[0.06] hover:border-white/15 transition-all ${CATEGORIES[ev.category]?.border || "border-white/[0.08]"
                      }`}
                  >
                    <div className="flex justify-between items-start gap-2">
                      <div className="flex flex-col min-w-0">
                        <span className="font-medium text-neutral-100 text-xs truncate">
                          {ev.title}
                        </span>
                        <div className="flex items-center gap-1 mt-0.5 text-neutral-400 text-[11px]">
                          <FaClock size={10} className="shrink-0" />
                          <span>
                            {ev.startTime} - {ev.endTime}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleStartEdit(ev)}
                          className="hover:bg-white/10 p-1 rounded text-neutral-400 hover:text-white transition-all"
                        >
                          <FaPen size={10} />
                        </button>
                        <button
                          onClick={() => handleDeleteEvent(ev.id)}
                          className="hover:bg-red-500/20 p-1 rounded text-neutral-400 hover:text-red-400 transition-all"
                        >
                          <FaTrash size={10} />
                        </button>
                      </div>
                    </div>

                    {ev.description && (
                      <p className="mt-0.5 pt-1.5 border-t border-white/[0.05] text-neutral-400 text-[11px] line-clamp-2">
                        {ev.description}
                      </p>
                    )}

                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className={`px-2 py-0.5 text-[10px] font-medium tracking-wide border rounded-md ${CATEGORIES[ev.category]?.badge
                        }`}>
                        {CATEGORIES[ev.category]?.label}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
