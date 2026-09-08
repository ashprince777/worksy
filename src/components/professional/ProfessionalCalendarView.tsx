"use client";

import { useState } from "react";
import { Calendar, Clock, Save, CheckCircle2 } from "lucide-react";

interface ProfessionalCalendarViewProps {
  initialAvailabilities: any[];
}

const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export function ProfessionalCalendarView({
  initialAvailabilities,
}: ProfessionalCalendarViewProps) {
  // Ensure all 7 days exist
  const defaultSchedule = [0, 1, 2, 3, 4, 5, 6].map((day) => {
    const existing = initialAvailabilities.find((a) => a.dayOfWeek === day);
    return (
      existing || {
        dayOfWeek: day,
        startTime: "08:30",
        endTime: "19:00",
        isWorkingDay: day !== 0,
      }
    );
  });

  const [schedule, setSchedule] = useState(defaultSchedule);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleToggleDay = (day: number) => {
    setSchedule((prev) =>
      prev.map((s) => (s.dayOfWeek === day ? { ...s, isWorkingDay: !s.isWorkingDay } : s))
    );
  };

  const handleTimeChange = (day: number, field: "startTime" | "endTime", val: string) => {
    setSchedule((prev) =>
      prev.map((s) => (s.dayOfWeek === day ? { ...s, [field]: val } : s))
    );
  };

  const handleSave = async () => {
    setSaving(true);
    setSavedSuccess(false);
    try {
      const res = await fetch("/api/professional/availability", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ availabilities: schedule }),
      });

      if (res.ok) {
        setSavedSuccess(true);
        setTimeout(() => setSavedSuccess(false), 3000);
      } else {
        alert("Failed to save schedule");
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">
            Schedule & Availability
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-0.5">
            Working Hours & Calendar
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Worksy only dispatches customer orders during your active working hours
          </p>
        </div>

        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-md transition-all flex items-center gap-2"
        >
          {savedSuccess ? <CheckCircle2 className="w-4 h-4" /> : <Save className="w-4 h-4" />}
          <span>{saving ? "Saving..." : savedSuccess ? "Schedule Saved!" : "Save Schedule"}</span>
        </button>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-4">
        <div className="divide-y divide-slate-100">
          {schedule.map((dayItem) => {
            const dayName = dayNames[dayItem.dayOfWeek];

            return (
              <div
                key={dayItem.dayOfWeek}
                className="py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs"
              >
                <div className="flex items-center gap-3 w-36">
                  <input
                    type="checkbox"
                    id={`day-${dayItem.dayOfWeek}`}
                    checked={dayItem.isWorkingDay}
                    onChange={() => handleToggleDay(dayItem.dayOfWeek)}
                    className="w-4 h-4 rounded text-teal-600 focus:ring-teal-500"
                  />
                  <label
                    htmlFor={`day-${dayItem.dayOfWeek}`}
                    className={`font-bold text-sm cursor-pointer ${
                      dayItem.isWorkingDay ? "text-slate-900" : "text-slate-400 line-through"
                    }`}
                  >
                    {dayName}
                  </label>
                </div>

                {dayItem.isWorkingDay ? (
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-slate-400" />
                    <input
                      type="time"
                      value={dayItem.startTime}
                      onChange={(e) =>
                        handleTimeChange(dayItem.dayOfWeek, "startTime", e.target.value)
                      }
                      className="p-2 rounded-xl border border-slate-200 bg-slate-50 font-medium"
                    />
                    <span className="text-slate-400">to</span>
                    <input
                      type="time"
                      value={dayItem.endTime}
                      onChange={(e) =>
                        handleTimeChange(dayItem.dayOfWeek, "endTime", e.target.value)
                      }
                      className="p-2 rounded-xl border border-slate-200 bg-slate-50 font-medium"
                    />
                  </div>
                ) : (
                  <span className="text-xs text-slate-400 font-semibold italic">
                    Marked as Day Off
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
