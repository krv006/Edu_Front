import { useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  Bold,
  FileUp,
  GraduationCap,
  Hourglass,
  Italic,
  Link,
  List,
  Paperclip,
  Underline,
} from "lucide-react";
import { Dialog, DialogContent } from "../ui/dialog";
import { Button } from "../ui/button";
import { DatePicker, SelectPicker, TimePicker } from "../ui/form-pickers";

const DURATION_OPTIONS = [
  { value: "30", label: "30 daqiqa" },
  { value: "45", label: "45 daqiqa" },
  { value: "60", label: "60 daqiqa" },
  { value: "90", label: "90 daqiqa" },
];

const SUBJECT_OPTIONS = ["Umumiy", "Ingliz tili", "Matematika", "Tarix"];

export function AddLessonDialog({ open, onOpenChange, onCreate }) {
  const [form, setForm] = useState({
    topic: "",
    date: "",
    time: "18:30",
    duration: "45",
  });

  function update(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function submit(event) {
    event.preventDefault();
    if (!form.topic.trim() || !form.time) return;
    onCreate({
      id: crypto.randomUUID(),
      ...form,
      date: form.date || new Date().toISOString().slice(0, 10),
    });
    setForm({ topic: "", date: "", time: "18:30", duration: "45" });
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {open && (
        <DialogContent
          className="group-action-dialog"
          title="Yangi dars"
          description="Guruh uchun yangi mashg‘ulot vaqtini belgilang."
        >
          <motion.form
            className="group-action-form"
            onSubmit={submit}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <label>
              <span>Dars mavzusi</span>
              <input
                autoFocus
                value={form.topic}
                onChange={(event) => update("topic", event.target.value)}
                placeholder="Masalan: Present Simple — amaliyot"
              />
            </label>
            <div className="form-grid-two">
              <DatePicker
                label="Sana · ixtiyoriy"
                value={form.date}
                onChange={(value) => update("date", value)}
                optional
              />
              <TimePicker
                label="Boshlanish vaqti"
                value={form.time}
                onChange={(value) => update("time", value)}
              />
            </div>
            <SelectPicker
              label="Davomiyligi"
              icon={Hourglass}
              value={form.duration}
              onChange={(value) => update("duration", value)}
              options={DURATION_OPTIONS}
            />
            <div className="dialog-actions">
              <Button
                type="button"
                variant="ghost"
                onClick={() => onOpenChange(false)}
              >
                Bekor qilish
              </Button>
              <Button type="submit" disabled={!form.topic.trim()}>
                Darsni saqlash
              </Button>
            </div>
          </motion.form>
        </DialogContent>
      )}
    </Dialog>
  );
}

export function AddAssignmentDialog({ open, onOpenChange, onCreate }) {
  const [form, setForm] = useState({
    title: "",
    description: "",
    dueAt: "",
    subject: "Umumiy",
    grading: "",
  });
  const [file, setFile] = useState(null);
  const fileRef = useRef(null);

  function update(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function submit(event) {
    event.preventDefault();
    if (!form.title.trim() || !form.description.trim()) return;
    onCreate({ id: crypto.randomUUID(), ...form, fileName: file?.name });
    setForm({
      title: "",
      description: "",
      dueAt: "",
      subject: "Umumiy",
      grading: "",
    });
    setFile(null);
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {open && (
        <DialogContent
          className="group-action-dialog assignment-dialog"
          title="Yangi vazifa"
          description="Topshiriq, muddat va kerakli fayllarni bir joyda yuboring."
        >
          <motion.form
            className="group-action-form"
            onSubmit={submit}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <label>
              <span>Vazifa nomi</span>
              <input
                autoFocus
                value={form.title}
                onChange={(event) => update("title", event.target.value)}
                placeholder="Masalan: Kvadrat tenglamalar — 5 ta misol"
              />
            </label>
            <div className="rich-assignment-field">
              <div
                className="rich-toolbar"
                aria-label="Matn formatlash vositalari"
              >
                <button type="button" aria-label="Qalin matn">
                  <Bold size={14} />
                </button>
                <button type="button" aria-label="Qiya matn">
                  <Italic size={14} />
                </button>
                <button type="button" aria-label="Tagiga chizish">
                  <Underline size={14} />
                </button>
                <span />
                <button type="button" aria-label="Ro‘yxat">
                  <List size={14} />
                </button>
                <button type="button" aria-label="Havola">
                  <Link size={14} />
                </button>
              </div>
              <textarea
                value={form.description}
                onChange={(event) => update("description", event.target.value)}
                placeholder="Vazifa matnini yozing: misollar, savollar, ko‘rsatmalar..."
                rows={5}
              />
            </div>
            <div className="assignment-upload-row">
              <input
                ref={fileRef}
                type="file"
                hidden
                onChange={(event) => setFile(event.target.files?.[0] ?? null)}
              />
              <button type="button" onClick={() => fileRef.current?.click()}>
                <FileUp size={16} /> Fayl biriktirish
              </button>
              {file && (
                <span>
                  <Paperclip size={14} /> {file.name}
                </span>
              )}
            </div>
            <div className="form-grid-two">
              <DatePicker
                label="Topshirish muddati"
                value={form.dueAt}
                onChange={(value) => update("dueAt", value)}
                includeTime
                optional
              />
              <SelectPicker
                label="Fan"
                icon={GraduationCap}
                value={form.subject}
                onChange={(value) => update("subject", value)}
                options={SUBJECT_OPTIONS}
              />
            </div>
            <label>
              <span>Baholash izohi — ixtiyoriy</span>
              <input
                value={form.grading}
                onChange={(event) => update("grading", event.target.value)}
                placeholder="Masalan: har bir misol 2 balldan"
              />
            </label>
            <div className="dialog-actions">
              <Button
                type="button"
                variant="ghost"
                onClick={() => onOpenChange(false)}
              >
                Bekor qilish
              </Button>
              <Button
                type="submit"
                disabled={!form.title.trim() || !form.description.trim()}
              >
                Vazifani yuborish
              </Button>
            </div>
          </motion.form>
        </DialogContent>
      )}
    </Dialog>
  );
}
