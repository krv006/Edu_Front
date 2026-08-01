const common = [
  { id: 'm1', senderId: 'user-1', text: 'Assalomu alaykum, ustoz! Bugungi mavzu bo‘yicha bir savolim bor edi.', type: 'text', createdAt: '2026-08-01T13:56:00', status: 'read' },
  { id: 'm2', senderId: 'teacher-1', text: 'Va alaykum assalom, Nilufar. Albatta, bemalol so‘rashingiz mumkin.', type: 'text', createdAt: '2026-08-01T13:58:00', status: 'read' },
  { id: 'm3', senderId: 'user-1', text: 'Present Simple’da do va does qachon ishlatilishini yana bir bor tushuntirib bera olasizmi?', type: 'text', createdAt: '2026-08-01T14:01:00', status: 'read' },
  { id: 'm4', senderId: 'teacher-1', text: 'Albatta. I, you, we, they bilan “do”, he, she, it bilan esa “does” ishlatiladi.', type: 'text', replyTo: { author: 'Nilufar', text: 'do va does qachon ishlatiladi?' }, createdAt: '2026-08-01T14:05:00', status: 'read' },
  { id: 'm5', senderId: 'teacher-1', text: 'Siz uchun qisqa qoida va misollarni bitta faylga joyladim.', type: 'file', attachment: { name: 'Present_Simple_qoidalar.pdf', size: '1.8 MB' }, createdAt: '2026-08-01T14:07:00', status: 'read' },
  { id: 'm6', senderId: 'user-1', text: 'Rahmat ustoz, vazifani yubordim ✨', type: 'text', createdAt: '2026-08-01T14:28:00', status: 'delivered' },
]

export const messagesMock = {
  nilufar: common,
  sardor: [
    { id: 's1', senderId: 'user-2', text: 'Assalomu alaykum, ustoz. Bugungi dars qaysi vaqtda boshlanadi?', type: 'text', createdAt: '2026-08-01T13:42:00', status: 'delivered' },
  ],
  'english-beginner': [
    { id: 'g1', senderId: 'user-1', senderName: 'Nilufar Rahimova', text: 'Assalomu alaykum, bugungi materiallarni ko‘rib chiqdim.', type: 'text', createdAt: '2026-08-01T15:08:00', status: 'read' },
    { id: 'g2', senderId: 'teacher-1', senderName: 'Madina Yusupova', text: 'Ajoyib! Savollar bo‘lsa shu yerda yozib qoldiring.', type: 'text', createdAt: '2026-08-01T15:12:00', status: 'read' },
    { id: 'g3', senderId: 'system', text: 'Yangi dars yaratildi: Present Simple — amaliyot', type: 'system', createdAt: '2026-08-01T15:14:00', status: 'read' },
  ],
}
