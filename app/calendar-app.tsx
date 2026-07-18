"use client";

import React, { useState, useEffect } from "react";
import { FaChevronLeft, FaChevronRight, FaPlus, FaTrash, FaPen, FaClock, FaTag, FaCheck, FaXmark } from "react-icons/fa6";

interface CalendarEvent {
  id: string;
  title: string;
  date: string; // Format: YYYY-MM-DD
  startTime: string; // Format: HH:MM
  endTime: string; // Format: HH:MM
  category: "work" | "personal" | "urgent" | "social";
  description?: string;
}

const CATEGORIES = {
  work: { label: "Work", color: "bg-blue-500", text: "text-blue-400", border: "border-blue-500/30", badge: "bg-blue-500/10 text-blue-300 border-blue-500/20" },
  personal: { label: "Personal", color: "bg-emerald-500", text: "text-emerald-400", border: "border-emerald-500/30", badge: "bg-emerald-500/10 text-emerald-300 border-emerald-500/20" },
  urgent: { label: "Urgent", color: "bg-rose-500", text: "text-rose-400", border: "border-rose-500/30", badge: "bg-rose-500/10 text-rose-300 border-rose-500/20" },
  social: { label: "Social", color: "bg-purple-500", text: "text-purple-400", border: "border-purple-500/30", badge: "bg-purple-500/10 text-purple-300 border-purple-500/20" },
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

  // Form State
  const [eventTitle, setEventTitle] = useState("");
  const [eventStartTime, setEventStartTime] = useState("09:00");
  const [eventEndTime, setEventEndTime] = useState("10:00");
  const [eventCategory, setEventCategory] = useState<keyof typeof CATEGORIES>("work");
  const [eventDescription, setEventDescription] = useState("");

  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();

  // Helper to format date object as YYYY-MM-DD
  const formatDateString = (date: Date): string => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  };

  // Load events from LocalStorage safely (handling SSR)
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
        // Initial mock events
        const todayStr = formatDateString(new Date());
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const tomorrowStr = formatDateString(tomorrow);
        
        const mockEvents: CalendarEvent[] = [
          {
            id: "mock-1",
            title: "Welcome to Calendar!",
            date: todayStr,
            startTime: "10:00",
            endTime: "11:30",
            category: "personal",
            description: "Manage your scheduling directly inside GlassOS! Events are saved to your localStorage."
          },
          {
            id: "mock-2",
            title: "Design Review Meetings",
            date: tomorrowStr,
            startTime: "14:00",
            endTime: "15:00",
            category: "work",
            description: "Review desktop widgets layout and glassmorphism styling parameters."
          },
          {
            id: "mock-3",
            title: "Finish GlassOS Calculator",
            date: todayStr,
            startTime: "16:00",
            endTime: "17:30",
            category: "urgent",
            description: "Complete mathematical formula mappings and test Standard/Scientific view changes."
          }
        ];
        setEvents(mockEvents);
        localStorage.setItem("glassos_calendar_events", JSON.stringify(mockEvents));
      }
    }
  }, []);

  // Save events to LocalStorage
  const saveEvents = (updatedEvents: CalendarEvent[]) => {
    setEvents(updatedEvents);
    if (typeof window !== "undefined") {
      localStorage.setItem("glassos_calendar_events", JSON.stringify(updatedEvents));
    }
  };

  // Navigate Months
  const prevMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth + 1, 1));
  };

  const jumpToToday = () => {
    const today = new Date();
    setCurrentDate(today);
    setSelectedDate(today);
  };

  // Generate Month Grid
  const getDaysGrid = () => {
    const grid = [];
    const daysInCurMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const daysInPrevMonth = new Date(currentYear, currentMonth, 0).getDate();
    const firstDayIdx = new Date(currentYear, currentMonth, 1).getDay();

    // Previous month padding days
    for (let i = firstDayIdx - 1; i >= 0; i--) {
      const d = new Date(currentYear, currentMonth - 1, daysInPrevMonth - i);
      grid.push({ date: d, isCurrentMonth: false });
    }

    // Current month days
    for (let i = 1; i <= daysInCurMonth; i++) {
      const d = new Date(currentYear, currentMonth, i);
      grid.push({ date: d, isCurrentMonth: true });
    }

    // Next month padding days (Make it 6 rows total, i.e., 42 cells)
    const remaining = 42 - grid.length;
    for (let i = 1; i <= remaining; i++) {
      const d = new Date(currentYear, currentMonth + 1, i);
      grid.push({ date: d, isCurrentMonth: false });
    }

    return grid;
  };

  const dayCells = getDaysGrid();
  const selectedDateStr = formatDateString(selectedDate);
  const selectedDayEvents = events
    .filter((e) => e.date === selectedDateStr)
    .sort((a, b) => a.startTime.localeCompare(b.startTime));

  // Add/Edit Event handlers
  const handleSaveEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventTitle.trim()) return;

    if (editingEventId) {
      // Edit
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
      saveEvents(updated);
      setEditingEventId(null);
    } else {
      // Create
      const newEv: CalendarEvent = {
        id: Math.random().toString(36).substring(2, 9),
        title: eventTitle,
        date: selectedDateStr,
        startTime: eventStartTime,
        endTime: eventEndTime,
        category: eventCategory,
        description: eventDescription,
      };
      saveEvents([...events, newEv]);
    }

    // Reset Form
    setEventTitle("");
    setEventStartTime("09:00");
    setEventEndTime("10:00");
    setEventCategory("work");
    setEventDescription("");
    setIsAddingEvent(false);
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

  const handleDeleteEvent = (id: string) => {
    const filtered = events.filter((e) => e.id !== id);
    saveEvents(filtered);
    if (editingEventId === id) {
      setEditingEventId(null);
      setIsAddingEvent(false);
    }
  };

  return (
    <div className="calendar-container h-full flex flex-col md:flex-row text-white overflow-hidden p-4 gap-4">
      
      {/* LEFT: Calendar Grid Panel */}
      <div className="flex-1 flex flex-col bg-zinc-900/30 border border-white/10 rounded-2xl p-4 backdrop-blur-md overflow-y-auto no-scrollbar">
        {/* Header Controls */}
        <div className="flex justify-between items-center mb-4 gap-2">
          <div className="flex flex-col">
            <h2 className="text-xl font-bold tracking-tight text-white">
              {MONTHS[currentMonth]} {currentYear}
            </h2>
            <span className="text-xs text-zinc-400">
              Selected: {selectedDate.toLocaleDateString("en-US", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={jumpToToday}
              className="px-3 py-1.5 text-xs font-semibold bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-all"
            >
              Today
            </button>
            <div className="flex bg-black/30 border border-white/5 rounded-lg p-0.5">
              <button
                onClick={prevMonth}
                className="p-2 hover:bg-white/5 rounded text-zinc-400 hover:text-white transition-all"
              >
                <FaChevronLeft size={12} />
              </button>
              <button
                onClick={nextMonth}
                className="p-2 hover:bg-white/5 rounded text-zinc-400 hover:text-white transition-all"
              >
                <FaChevronRight size={12} />
              </button>
            </div>
          </div>
        </div>

        {/* Weekday Labels */}
        <div className="grid grid-cols-7 gap-1 text-center font-medium text-xs text-zinc-400 mb-2 py-1 border-b border-white/5">
          {WEEKDAYS.map((day) => (
            <div key={day} className="py-1">
              {day}
            </div>
          ))}
        </div>

        {/* Grid Cells */}
        <div className="grid grid-cols-7 gap-1.5 flex-1 min-h-[260px] items-stretch">
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
                  // Ensure viewing month follows selection if user clicks padding day
                  if (date.getMonth() !== currentMonth) {
                    setCurrentDate(new Date(date.getFullYear(), date.getMonth(), 1));
                  }
                }}
                className={`calendar-cell flex flex-col items-center justify-between p-1.5 rounded-xl border transition-all text-left relative group min-h-[46px] select-none cursor-pointer ${
                  isCurrentMonth ? "text-white" : "text-zinc-500"
                } ${
                  isSelected
                    ? "bg-white/15 border-white/30 shadow-md translate-y-[-1px]"
                    : isToday
                    ? "bg-blue-600/10 border-blue-500/40 text-blue-300"
                    : "bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/10"
                }`}
              >
                <span className={`text-sm font-semibold relative ${isToday ? "underline decoration-2" : ""}`}>
                  {date.getDate()}
                </span>
                
                {/* Event Category dots */}
                <div className="flex gap-1 justify-center mt-1 flex-wrap w-full max-w-[36px]">
                  {dayEvents.slice(0, 3).map((e) => (
                    <span
                      key={e.id}
                      className={`w-1.5 h-1.5 rounded-full ${CATEGORIES[e.category]?.color || "bg-zinc-400"}`}
                    />
                  ))}
                  {dayEvents.length > 3 && (
                    <span className="text-[8px] font-bold text-zinc-400 -mt-1">+</span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* RIGHT: Selected Date Events & Form Panel */}
      <div className="w-full md:w-80 flex flex-col bg-zinc-900/30 border border-white/10 rounded-2xl p-4 backdrop-blur-md overflow-hidden shrink-0">
        
        {isAddingEvent ? (
          // Add/Edit Event Form View
          <form onSubmit={handleSaveEvent} className="flex-1 flex flex-col overflow-y-auto no-scrollbar">
            <div className="flex justify-between items-center mb-4 border-b border-white/5 pb-2">
              <h3 className="font-bold text-lg text-white">
                {editingEventId ? "Edit Event" : "Create Event"}
              </h3>
              <button
                type="button"
                onClick={() => {
                  setIsAddingEvent(false);
                  setEditingEventId(null);
                  setEventTitle("");
                }}
                className="p-1 hover:bg-white/10 rounded text-zinc-400 hover:text-white transition-all"
              >
                <FaXmark size={16} />
              </button>
            </div>

            <div className="flex flex-col gap-3 flex-1">
              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-1">Title</label>
                <input
                  type="text"
                  required
                  placeholder="Event title..."
                  value={eventTitle}
                  onChange={(e) => setEventTitle(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-white/20 placeholder-zinc-500"
                />
              </div>

              <div className="flex gap-2">
                <div className="flex-1">
                  <label className="block text-xs font-semibold text-zinc-400 mb-1">Start Time</label>
                  <input
                    type="time"
                    required
                    value={eventStartTime}
                    onChange={(e) => setEventStartTime(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-white/20"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-xs font-semibold text-zinc-400 mb-1">End Time</label>
                  <input
                    type="time"
                    required
                    value={eventEndTime}
                    onChange={(e) => setEventEndTime(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-white/20"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-1">Category</label>
                <div className="grid grid-cols-2 gap-2">
                  {(Object.keys(CATEGORIES) as Array<keyof typeof CATEGORIES>).map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setEventCategory(cat)}
                      className={`flex items-center gap-1.5 px-2.5 py-2 text-xs font-medium rounded-xl border text-left cursor-pointer transition-all ${
                        eventCategory === cat
                          ? "bg-white/10 border-white/20 text-white font-semibold"
                          : "bg-white/5 border-transparent text-zinc-400 hover:bg-white/10 hover:text-zinc-200"
                      }`}
                    >
                      <span className={`w-2 h-2 rounded-full ${CATEGORIES[cat].color}`} />
                      {CATEGORIES[cat].label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex-1 flex flex-col min-h-[90px]">
                <label className="block text-xs font-semibold text-zinc-400 mb-1">Description</label>
                <textarea
                  placeholder="Notes, locations, description..."
                  value={eventDescription}
                  onChange={(e) => setEventDescription(e.target.value)}
                  className="w-full flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-white/20 placeholder-zinc-500 resize-none min-h-[80px]"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full mt-4 flex items-center justify-center gap-2 py-2.5 px-4 bg-blue-600 hover:bg-blue-500 border border-blue-500/20 text-white font-semibold rounded-xl transition-all shadow-md active:scale-95"
            >
              <FaCheck size={12} />
              Save Event
            </button>
          </form>
        ) : (
          // Event List View
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="flex justify-between items-center mb-4 pb-2 border-b border-white/5">
              <h3 className="font-bold text-lg text-white">Events</h3>
              <button
                onClick={() => {
                  // Reset form fields
                  setEventTitle("");
                  setEventStartTime("09:00");
                  setEventEndTime("10:00");
                  setEventCategory("work");
                  setEventDescription("");
                  setEditingEventId(null);
                  setIsAddingEvent(true);
                }}
                className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold bg-blue-600 hover:bg-blue-500 border border-blue-500/20 text-white rounded-lg transition-all shadow-sm active:scale-95 cursor-pointer"
              >
                <FaPlus size={10} /> Add
              </button>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto no-scrollbar flex flex-col gap-2">
              {selectedDayEvents.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-4">
                  <span className="text-zinc-500 text-sm italic">No events scheduled.</span>
                  <button
                    onClick={() => setIsAddingEvent(true)}
                    className="text-xs text-blue-400 hover:underline mt-2 font-medium"
                  >
                    Schedule an event now
                  </button>
                </div>
              ) : (
                selectedDayEvents.map((ev) => (
                  <div
                    key={ev.id}
                    className={`p-3 bg-white/5 border rounded-xl flex flex-col gap-2 group hover:bg-white/10 hover:border-white/20 transition-all ${
                      CATEGORIES[ev.category]?.border || "border-white/5"
                    }`}
                  >
                    <div className="flex justify-between items-start gap-2">
                      <div className="flex flex-col min-w-0">
                        <span className="font-bold text-sm text-zinc-100 truncate">
                          {ev.title}
                        </span>
                        <div className="flex items-center gap-1.5 text-zinc-400 text-xs mt-1">
                          <FaClock size={10} className="shrink-0" />
                          <span>
                            {ev.startTime} - {ev.endTime}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleStartEdit(ev)}
                          className="p-1.5 hover:bg-white/10 text-zinc-400 hover:text-white rounded transition-all"
                        >
                          <FaPen size={10} />
                        </button>
                        <button
                          onClick={() => handleDeleteEvent(ev.id)}
                          className="p-1.5 hover:bg-red-500/20 text-zinc-400 hover:text-red-400 rounded transition-all"
                        >
                          <FaTrash size={10} />
                        </button>
                      </div>
                    </div>

                    {ev.description && (
                      <p className="text-xs text-zinc-400 border-t border-white/5 pt-2 mt-1 line-clamp-3">
                        {ev.description}
                      </p>
                    )}

                    <div className="flex items-center gap-1.5 mt-1.5">
                      <span className={`px-2 py-0.5 text-[9px] font-bold tracking-wide uppercase border rounded-full ${
                        CATEGORIES[ev.category]?.badge
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
