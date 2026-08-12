import { useEffect, useState, type FormEvent } from "react";
import { Search, UserPlus } from "lucide-react";
import { Avatar, Button, Dialog, DialogContent } from "@/shared/ui/legacy";
import type { CreateChildRequestDto } from "@/modules/auth";
import {
  useCreateCourseStudent,
  useEnrollStudent,
  useSearchCourseStudents,
} from "../model/course.queries";
import type { EnrollmentStatus } from "@/shared/types";

export interface AddStudentDialogProps {
  courseId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Qaysi bo'lim ochiq holda boshlansin — chaqiruvchi tugmaga qarab. */
  initialTab?: StudentDialogTab;
}

const enrollLabels: Record<EnrollmentStatus, string> = {
  approved: "A’zo",
  pending: "Kutilmoqda",
  declined: "Rad etilgan",
};

/** Faqat dialog ochiqligida mount bo‘ladi — yopilganda qidiruv holati o‘zi tozalanadi. */
function AddStudentBody({ courseId }: { courseId: string | null }) {
  const [term, setTerm] = useState("");
  const [debounced, setDebounced] = useState("");
  const results = useSearchCourseStudents(courseId, debounced);
  const enroll = useEnrollStudent();

  useEffect(() => {
    const id = globalThis.setTimeout(() => setDebounced(term), 350);
    return () => globalThis.clearTimeout(id);
  }, [term]);

  const items = results.data ?? [];
  const tooShort = debounced.trim().length < 2;

  return (
    <>
      <label className="student-search">
        <Search size={18} />
        <input
          autoFocus
          value={term}
          onChange={(event) => setTerm(event.target.value)}
          placeholder="Kamida 2 ta belgi kiriting"
          aria-label="O‘quvchi qidirish"
        />
      </label>

      <div className="student-enrollment-list">
        {tooShort ? (
          <p className="portal-muted">Qidirish uchun ism yoki username yozing.</p>
        ) : results.isLoading ? (
          <div className="student-tab-loading">
            <span />
          </div>
        ) : results.isError ? (
          <div className="form-alert">{results.error.message}</div>
        ) : (
          items.map((student) => (
            <article key={student.id}>
              <Avatar name={student.name} tone={student.avatarTone} size="md" />
              <div>
                <strong>{student.name}</strong>
                <small>@{student.username}</small>
              </div>
              <Button
                size="sm"
                variant={student.enrollStatus ? "secondary" : "primary"}
                disabled={
                  Boolean(student.enrollStatus) && student.enrollStatus !== "declined"
                }
                loading={enroll.isPending && enroll.variables?.studentId === student.id}
                onClick={() => enroll.mutate({ courseId, studentId: student.id })}
              >
                <UserPlus size={15} /> {(student.enrollStatus && enrollLabels[student.enrollStatus]) ?? "Qo‘shish"}
              </Button>
            </article>
          ))
        )}
        {!tooShort && !results.isLoading && !results.isError && !items.length ? (
          <p className="portal-muted">O‘quvchi topilmadi — «Yangi hisob» orqali yarating.</p>
        ) : null}
      </div>
    </>
  );
}

type StudentDialogTab = "search" | "create";

const EMPTY_STUDENT: CreateChildRequestDto = {
  username: "",
  password: "",
  first_name: "",
  last_name: "",
};

/**
 * Yangi o'quvchi hisobi.
 *
 * O'quvchi o'zi ro'yxatdan o'ta olmaydi (`docs/STUDENT_API.md`) — hisobni
 * o'qituvchi yoki ota-ona yaratadi. Yaratilgan hisob darhol shu kursga
 * yoziladi, shuning uchun o'qituvchi qayta qidirib o'tirmaydi.
 */
function CreateStudentBody({
  courseId,
  onCreated,
}: {
  courseId: string | null;
  onCreated: () => void;
}) {
  const [form, setForm] = useState<CreateChildRequestDto>(EMPTY_STUDENT);
  const createStudent = useCreateCourseStudent();

  function update(field: keyof CreateChildRequestDto, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!courseId) return;
    createStudent.mutate(
      { courseId, form: { ...form, username: form.username.trim() } },
      {
        onSuccess: () => {
          setForm(EMPTY_STUDENT);
          onCreated();
        },
      }
    );
  }

  const filled =
    form.username.trim() && form.password.length >= 8 && form.first_name.trim() && form.last_name.trim();

  return (
    <form className="dialog-form" onSubmit={submit}>
      <div className="register-name-grid">
        <label className="field-group">
          <span>Ism</span>
          <div className="input-shell">
            <input
              autoFocus
              value={form.first_name}
              onChange={(event) => update("first_name", event.target.value)}
              required
            />
          </div>
        </label>
        <label className="field-group">
          <span>Familiya</span>
          <div className="input-shell">
            <input
              value={form.last_name}
              onChange={(event) => update("last_name", event.target.value)}
              required
            />
          </div>
        </label>
      </div>

      <label className="field-group">
        <span>Login</span>
        <div className="input-shell">
          <input
            value={form.username}
            onChange={(event) => update("username", event.target.value)}
            placeholder="masalan: ali_valiyev"
            autoComplete="off"
            required
          />
        </div>
      </label>

      <label className="field-group">
        <span>Vaqtinchalik parol</span>
        <div className="input-shell">
          <input
            type="text"
            value={form.password}
            onChange={(event) => update("password", event.target.value)}
            placeholder="Kamida 8 ta belgi"
            autoComplete="off"
            minLength={8}
            required
          />
        </div>
      </label>

      {/* Parol ochiq ko'rsatiladi: o'qituvchi uni o'quvchiga aytib berishi kerak. */}
      <p className="portal-muted">
        Parolni o‘quvchiga aytib qo‘ying — u birinchi kirishdan keyin o‘zgartira oladi.
      </p>

      {createStudent.isError ? (
        <div className="form-alert">{createStudent.error.message}</div>
      ) : null}

      <div className="dialog-actions">
        <Button type="submit" loading={createStudent.isPending} disabled={!filled || !courseId}>
          <UserPlus size={15} /> Yaratish va kursga qo‘shish
        </Button>
      </div>
    </form>
  );
}

export function AddStudentDialog({
  courseId,
  open,
  onOpenChange,
  initialTab = "search",
}: AddStudentDialogProps) {
  const [tab, setTab] = useState<StudentDialogTab>(initialTab);

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) setTab(initialTab);
        onOpenChange(next);
      }}
    >
      {open ? (
        <DialogContent
          title="O‘quvchi qo‘shish"
          description={
            tab === "search"
              ? "Username yoki ism bo‘yicha bazadan qidiring."
              : "Hisob yaratiladi va o‘quvchi darhol shu kursga qo‘shiladi."
          }
        >
          <div className="dialog-tabs" role="tablist">
            <button
              type="button"
              role="tab"
              aria-selected={tab === "search"}
              className={tab === "search" ? "is-active" : ""}
              onClick={() => setTab("search")}
            >
              <Search size={15} /> Qidirish
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={tab === "create"}
              className={tab === "create" ? "is-active" : ""}
              onClick={() => setTab("create")}
            >
              <UserPlus size={15} /> Yangi hisob
            </button>
          </div>

          {tab === "search" ? (
            <AddStudentBody courseId={courseId} />
          ) : (
            <CreateStudentBody courseId={courseId} onCreated={() => setTab("search")} />
          )}
        </DialogContent>
      ) : null}
    </Dialog>
  );
}
