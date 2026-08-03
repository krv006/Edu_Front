export const studentDashboardSeed = {
  metrics: [
    { id: "courses", label: "Faol kurslar", value: "4", tone: "violet" },
    { id: "lessons", label: "Bu hafta dars", value: "8", tone: "blue" },
    { id: "assignments", label: "Kutilayotgan vazifa", value: "3", tone: "amber" },
    { id: "progress", label: "O‘rtacha natija", value: "86%", tone: "emerald" },
  ],
  nextLesson: { id: "english-beginner", title: "Present Simple — amaliyot", teacher: "Madina Yusupova", date: "Bugun", time: "18:30", duration: "45 daqiqa" },
  assignments: [
    { id: "task-1", title: "Present Simple mashqlari", course: "Ingliz tili", due: "Bugun, 21:00", status: "urgent" },
    { id: "task-2", title: "Kvadrat tenglamalar", course: "Algebra", due: "5-avgust", status: "normal" },
    { id: "task-3", title: "Nazorat ishiga tayyorgarlik", course: "Matematika", due: "7-avgust", status: "normal" },
  ],
};
