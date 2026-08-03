export const courseSeed = [
  { id: "english-beginner", title: "Ingliz tili — Boshlang‘ich", subject: "Ingliz tili", teacher: "Madina Yusupova", progress: 72, students: 18, status: "joined", color: "violet" },
  { id: "algebra-7", title: "Algebra — 7-sinf", subject: "Matematika", teacher: "Nilufar Rahimova", progress: 46, students: 24, status: "joined", color: "blue" },
  { id: "present-simple", title: "Present Simple — amaliyot", subject: "Ingliz tili", teacher: "Madina Yusupova", progress: 64, students: 12, status: "joined", color: "amber" },
  { id: "informatics", title: "Informatika · Python", subject: "Dasturlash", teacher: "Jasur Karimov", progress: 0, students: 14, status: "available", color: "emerald" },
  { id: "first-class", title: "Speaking club", subject: "Ingliz tili", teacher: "Malika Karimova", progress: 0, students: 9, status: "available", color: "rose" },
];

export const courseWorkspaceSeed = {
  id: "english-beginner", title: "Ingliz tili — Boshlang‘ich", teacher: "Madina Yusupova", subject: "Ingliz tili", members: 18,
  messages: [
    { id: "sm-1", author: "Madina Yusupova", text: "Bugungi dars materiallarini joyladim. Savollar bo‘lsa shu yerga yozing.", time: "15:12", own: false },
    { id: "sm-2", author: "Siz", text: "Rahmat ustoz, materiallarni ko‘rib chiqdim.", time: "15:18", own: true },
  ],
  lessons: [
    { id: "sl-1", title: "Present Simple — amaliyot", date: "3-avgust", time: "18:30", duration: "45 daqiqa", status: "today" },
    { id: "sl-2", title: "Daily routines · speaking", date: "5-avgust", time: "18:30", duration: "45 daqiqa", status: "planned" },
  ],
  assignments: [
    { id: "sa-1", title: "Present Simple mashqlari", due: "Bugun, 21:00", status: "open", score: null },
    { id: "sa-2", title: "My daily routine", due: "1-avgust", status: "graded", score: 92 },
  ],
};
