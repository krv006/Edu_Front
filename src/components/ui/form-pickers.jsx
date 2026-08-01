import {
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  CalendarDays,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Clock3,
} from "lucide-react";

const MONTHS = [
  "Yanvar", "Fevral", "Mart", "Aprel", "May", "Iyun",
  "Iyul", "Avgust", "Sentabr", "Oktabr", "Noyabr", "Dekabr",
];
const WEEKDAYS = ["Du", "Se", "Cho", "Pa", "Ju", "Sha", "Ya"];
const TIME_PRESETS = ["09:00", "14:00", "18:30", "20:00"];

function pad(value) {
  return String(value).padStart(2, "0");
}

function toDateValue(date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function parseDateValue(value) {
  const datePart = value?.split("T")[0];
  if (!datePart) return null;
  const [year, month, day] = datePart.split("-").map(Number);
  if (!year || !month || !day) return null;
  return new Date(year, month - 1, day);
}

function formatDateValue(value) {
  const date = parseDateValue(value);
  if (!date) return "Sanani tanlang";
  return `${date.getDate()} ${MONTHS[date.getMonth()].toLowerCase()}, ${date.getFullYear()}`;
}

function getTimeValue(value, fallback = "18:30") {
  const time = value?.includes("T") ? value.split("T")[1] : value;
  return /^\d{2}:\d{2}$/.test(time ?? "") ? time : fallback;
}

function FloatingPicker({ open, onClose, anchorRef, children, labelledBy, className = "" }) {
  const panelRef = useRef(null);
  const [position, setPosition] = useState({ left: 12, top: 12, width: 320, origin: "top" });

  useLayoutEffect(() => {
    if (!open || !anchorRef.current) return undefined;

    function placePanel() {
      const anchor = anchorRef.current?.getBoundingClientRect();
      if (!anchor) return;
      const viewportPadding = 12;
      const width = Math.min(Math.max(anchor.width, 310), window.innerWidth - viewportPadding * 2);
      const estimatedHeight = panelRef.current?.offsetHeight ?? 390;
      const roomBelow = window.innerHeight - anchor.bottom - viewportPadding;
      const placeAbove = roomBelow < Math.min(estimatedHeight, 390) && anchor.top > roomBelow;
      const left = Math.min(Math.max(viewportPadding, anchor.left), window.innerWidth - width - viewportPadding);
      const top = placeAbove
        ? Math.max(viewportPadding, anchor.top - estimatedHeight - 8)
        : Math.min(anchor.bottom + 8, window.innerHeight - estimatedHeight - viewportPadding);
      setPosition({ left, top: Math.max(viewportPadding, top), width, origin: placeAbove ? "bottom" : "top" });
    }

    placePanel();
    const frame = requestAnimationFrame(placePanel);
    window.addEventListener("resize", placePanel);
    window.addEventListener("scroll", placePanel, true);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", placePanel);
      window.removeEventListener("scroll", placePanel, true);
    };
  }, [anchorRef, open]);

  useEffect(() => {
    if (!open) return undefined;
    function handlePointerDown(event) {
      if (panelRef.current?.contains(event.target) || anchorRef.current?.contains(event.target)) return;
      onClose();
    }
    function handleKeyDown(event) {
      if (event.key === "Escape") {
        event.stopPropagation();
        onClose();
        anchorRef.current?.focus();
      }
    }
    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [anchorRef, onClose, open]);

  if (typeof document === "undefined") return null;

  return createPortal(
    <AnimatePresence>
      {open ? (
        <motion.div
          ref={panelRef}
          className={`form-picker-popover ${className}`}
          role="dialog"
          aria-labelledby={labelledBy}
          style={{ left: position.left, top: position.top, width: position.width, transformOrigin: position.origin }}
          initial={{ opacity: 0, y: position.origin === "top" ? -8 : 8, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: position.origin === "top" ? -5 : 5, scale: 0.97 }}
          transition={{ type: "spring", stiffness: 430, damping: 32, mass: 0.75 }}
        >
          {children}
        </motion.div>
      ) : null}
    </AnimatePresence>,
    document.body
  );
}

function PickerTrigger({ anchorRef, open, onClick, icon: Icon, value, placeholder, labelledBy }) {
  return (
    <button
      ref={anchorRef}
      type="button"
      className={`form-picker-trigger${open ? " is-open" : ""}${value ? " has-value" : ""}`}
      onClick={onClick}
      aria-expanded={open}
      aria-haspopup="dialog"
      aria-labelledby={labelledBy}
    >
      <span className="form-picker-trigger-icon"><Icon size={17} /></span>
      <span className="form-picker-trigger-value">{value || placeholder}</span>
      <ChevronDown className="form-picker-chevron" size={16} />
    </button>
  );
}

function FieldShell({ label, icon: Icon, children, labelId }) {
  return (
    <div className="form-picker-field">
      <span id={labelId} className="form-picker-label">
        {Icon ? <Icon size={14} /> : null}
        {label}
      </span>
      {children}
    </div>
  );
}

export function SelectPicker({ label, value, onChange, options, icon }) {
  const [open, setOpen] = useState(false);
  const anchorRef = useRef(null);
  const labelId = useId();
  const normalizedOptions = useMemo(
    () => options.map((option) => typeof option === "string" ? { value: option, label: option } : option),
    [options]
  );
  const selected = normalizedOptions.find((option) => option.value === value);

  return (
    <FieldShell label={label} icon={icon} labelId={labelId}>
      <PickerTrigger anchorRef={anchorRef} open={open} onClick={() => setOpen((current) => !current)} icon={icon ?? ChevronDown} value={selected?.label ?? ""} placeholder="Tanlang" labelledBy={labelId} />
      <FloatingPicker open={open} onClose={() => setOpen(false)} anchorRef={anchorRef} labelledBy={labelId} className="select-picker-popover">
        <div className="picker-mini-heading"><span>Tanlov</span><strong>{label}</strong></div>
        <div className="select-picker-options" role="listbox" aria-labelledby={labelId}>
          {normalizedOptions.map((option, index) => {
            const active = option.value === value;
            return (
              <motion.button
                key={option.value}
                type="button"
                role="option"
                aria-selected={active}
                className={active ? "is-selected" : ""}
                onClick={() => {
                  onChange(option.value);
                  setOpen(false);
                  requestAnimationFrame(() => anchorRef.current?.focus());
                }}
                initial={{ opacity: 0, x: -5 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.025 }}
                whileTap={{ scale: 0.98 }}
              >
                <span>{option.label}</span>
                {active ? <motion.span layoutId={`${labelId}-check`} className="select-picker-check"><Check size={15} /></motion.span> : null}
              </motion.button>
            );
          })}
        </div>
      </FloatingPicker>
    </FieldShell>
  );
}

function CalendarGrid({ value, onChange, viewDate, onViewDateChange }) {
  const selected = parseDateValue(value);
  const todayValue = toDateValue(new Date());
  const cells = useMemo(() => {
    const first = new Date(viewDate.getFullYear(), viewDate.getMonth(), 1);
    const mondayOffset = (first.getDay() + 6) % 7;
    return Array.from({ length: 42 }, (_, index) => new Date(viewDate.getFullYear(), viewDate.getMonth(), index - mondayOffset + 1));
  }, [viewDate]);

  return (
    <div className="calendar-picker">
      <div className="calendar-picker-head">
        <button type="button" onClick={() => onViewDateChange(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1))} aria-label="Oldingi oy"><ChevronLeft size={18} /></button>
        <motion.strong key={`${viewDate.getFullYear()}-${viewDate.getMonth()}`} initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}>{MONTHS[viewDate.getMonth()]} {viewDate.getFullYear()}</motion.strong>
        <button type="button" onClick={() => onViewDateChange(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1))} aria-label="Keyingi oy"><ChevronRight size={18} /></button>
      </div>
      <div className="calendar-weekdays" aria-hidden="true">{WEEKDAYS.map((day) => <span key={day}>{day}</span>)}</div>
      <div className="calendar-days">
        {cells.map((date) => {
          const dateValue = toDateValue(date);
          const inMonth = date.getMonth() === viewDate.getMonth();
          const isSelected = selected ? dateValue === toDateValue(selected) : false;
          const isToday = dateValue === todayValue;
          return (
            <motion.button
              key={dateValue}
              type="button"
              className={`${inMonth ? "" : "is-outside"}${isSelected ? " is-selected" : ""}${isToday ? " is-today" : ""}`}
              onClick={() => onChange(dateValue)}
              aria-label={`${date.getDate()} ${MONTHS[date.getMonth()]} ${date.getFullYear()}`}
              aria-pressed={isSelected}
              whileTap={{ scale: 0.86 }}
            >
              {isSelected ? <motion.span layoutId="selected-calendar-day" className="calendar-selected-day" /> : null}
              <span>{date.getDate()}</span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

function TimeControl({ value, onChange, compact = false }) {
  const time = getTimeValue(value);
  const [hour, minute] = time.split(":").map(Number);

  function updateTime(nextHour, nextMinute) {
    onChange(`${pad((nextHour + 24) % 24)}:${pad((nextMinute + 60) % 60)}`);
  }

  function shiftMinute(amount) {
    const total = hour * 60 + minute + amount;
    const normalized = (total + 24 * 60) % (24 * 60);
    updateTime(Math.floor(normalized / 60), normalized % 60);
  }

  return (
    <div className={`time-control${compact ? " is-compact" : ""}`}>
      <div className="time-stepper" aria-label="Vaqtni sozlash">
        <div><button type="button" onClick={() => updateTime(hour + 1, minute)} aria-label="Soatni oshirish"><ChevronUp size={17} /></button><motion.strong key={`h-${hour}`} initial={{ opacity: 0, y: -7 }} animate={{ opacity: 1, y: 0 }}>{pad(hour)}</motion.strong><button type="button" onClick={() => updateTime(hour - 1, minute)} aria-label="Soatni kamaytirish"><ChevronDown size={17} /></button></div>
        <span>:</span>
        <div><button type="button" onClick={() => shiftMinute(5)} aria-label="Daqiqani oshirish"><ChevronUp size={17} /></button><motion.strong key={`m-${minute}`} initial={{ opacity: 0, y: -7 }} animate={{ opacity: 1, y: 0 }}>{pad(minute)}</motion.strong><button type="button" onClick={() => shiftMinute(-5)} aria-label="Daqiqani kamaytirish"><ChevronDown size={17} /></button></div>
      </div>
      <div className="time-presets" aria-label="Tayyor vaqtlar">
        {TIME_PRESETS.map((preset) => <button key={preset} type="button" className={time === preset ? "is-selected" : ""} onClick={() => onChange(preset)}>{preset}</button>)}
      </div>
    </div>
  );
}

export function DatePicker({ label, value, onChange, includeTime = false, optional = false }) {
  const [open, setOpen] = useState(false);
  const anchorRef = useRef(null);
  const labelId = useId();
  const selectedDate = parseDateValue(value);
  const [viewDate, setViewDate] = useState(() => selectedDate ?? new Date());
  const timeValue = getTimeValue(value);
  const displayValue = selectedDate ? `${formatDateValue(value)}${includeTime ? ` · ${timeValue}` : ""}` : "";

  function selectDate(dateValue) {
    onChange(includeTime ? `${dateValue}T${timeValue}` : dateValue);
  }

  function selectTime(time) {
    const dateValue = selectedDate ? toDateValue(selectedDate) : toDateValue(new Date());
    onChange(`${dateValue}T${time}`);
  }

  return (
    <FieldShell label={label} icon={CalendarDays} labelId={labelId}>
      <PickerTrigger anchorRef={anchorRef} open={open} onClick={() => { setViewDate(selectedDate ?? new Date()); setOpen((current) => !current); }} icon={includeTime ? Clock3 : CalendarDays} value={displayValue} placeholder={includeTime ? "Sana va vaqtni tanlang" : "Sanani tanlang"} labelledBy={labelId} />
      <FloatingPicker open={open} onClose={() => setOpen(false)} anchorRef={anchorRef} labelledBy={labelId} className={includeTime ? "datetime-picker-popover" : "date-picker-popover"}>
        <CalendarGrid value={value} onChange={selectDate} viewDate={viewDate} onViewDateChange={setViewDate} />
        {includeTime ? <div className="datetime-time-section"><div className="picker-section-title"><Clock3 size={15} /><span>Topshirish vaqti</span></div><TimeControl value={timeValue} onChange={selectTime} compact /></div> : null}
        <div className="picker-footer">
          {optional ? <button type="button" className="picker-clear" onClick={() => { onChange(""); setOpen(false); }}>Tozalash</button> : <span />}
          <button type="button" className="picker-today" onClick={() => { selectDate(toDateValue(new Date())); setViewDate(new Date()); }}>Bugun</button>
          <button type="button" className="picker-done" onClick={() => setOpen(false)}>Tayyor</button>
        </div>
      </FloatingPicker>
    </FieldShell>
  );
}

export function TimePicker({ label, value, onChange }) {
  const [open, setOpen] = useState(false);
  const anchorRef = useRef(null);
  const labelId = useId();
  return (
    <FieldShell label={label} icon={Clock3} labelId={labelId}>
      <PickerTrigger anchorRef={anchorRef} open={open} onClick={() => setOpen((current) => !current)} icon={Clock3} value={value} placeholder="Vaqtni tanlang" labelledBy={labelId} />
      <FloatingPicker open={open} onClose={() => setOpen(false)} anchorRef={anchorRef} labelledBy={labelId} className="time-picker-popover">
        <div className="picker-mini-heading"><span>Jadval</span><strong>{label}</strong></div>
        <TimeControl value={value} onChange={onChange} />
        <div className="picker-footer picker-footer--end"><button type="button" className="picker-done" onClick={() => setOpen(false)}>Tayyor</button></div>
      </FloatingPicker>
    </FieldShell>
  );
}
