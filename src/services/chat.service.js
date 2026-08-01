import { conversationsMock } from '../mocks/conversations.mock'
import { messagesMock } from '../mocks/messages.mock'

const delay = (ms = 280) => new Promise((resolve) => setTimeout(resolve, ms))
const messageStore = structuredClone(messagesMock)
const conversationStore = structuredClone(conversationsMock)

export const chatService = {
  async getConversations({ signal } = {}) {
    await delay()
    if (signal?.aborted) throw new DOMException('Aborted', 'AbortError')
    return structuredClone(conversationStore)
  },
  async getConversation(id, { signal } = {}) {
    await delay(180)
    if (signal?.aborted) throw new DOMException('Aborted', 'AbortError')
    return structuredClone(conversationStore.find((item) => item.id === id) ?? null)
  },
  async getMessages(conversationId, { signal } = {}) {
    await delay(320)
    if (signal?.aborted) throw new DOMException('Aborted', 'AbortError')
    return structuredClone(messageStore[conversationId] ?? [])
  },
  async sendMessage(conversationId, payload) {
    await delay(180)
    const message = {
      id: crypto.randomUUID(),
      conversationId,
      senderId: 'teacher-1',
      text: payload.text,
      type: payload.attachment ? 'file' : 'text',
      attachment: payload.attachment,
      replyTo: payload.replyTo,
      createdAt: new Date().toISOString(),
      status: 'sent',
    }
    messageStore[conversationId] = [...(messageStore[conversationId] ?? []), message]
    return structuredClone(message)
  },
  async updateMessage(conversationId, messageId, text) {
    await delay(180)
    const messages = messageStore[conversationId] ?? []
    const index = messages.findIndex((message) => message.id === messageId)
    if (index < 0) throw new Error('Xabar topilmadi')
    const updated = { ...messages[index], text, editedAt: new Date().toISOString() }
    messages[index] = updated
    return structuredClone(updated)
  },
  async deleteMessage(conversationId, messageId, scope = 'me') {
    await delay(160)
    messageStore[conversationId] = (messageStore[conversationId] ?? []).filter((message) => message.id !== messageId)
    return { id: messageId, scope }
  },
  async toggleReaction(conversationId, messageId, emoji) {
    await delay(120)
    const messages = messageStore[conversationId] ?? []
    const index = messages.findIndex((message) => message.id === messageId)
    if (index < 0) throw new Error('Xabar topilmadi')
    const reactions = [...(messages[index].reactions ?? [])]
    const reactionIndex = reactions.findIndex((reaction) => reaction.emoji === emoji)
    if (reactionIndex >= 0 && reactions[reactionIndex].reacted) {
      const nextCount = reactions[reactionIndex].count - 1
      if (nextCount <= 0) reactions.splice(reactionIndex, 1)
      else reactions[reactionIndex] = { ...reactions[reactionIndex], count: nextCount, reacted: false }
    } else if (reactionIndex >= 0) {
      reactions[reactionIndex] = { ...reactions[reactionIndex], count: reactions[reactionIndex].count + 1, reacted: true }
    } else {
      reactions.push({ emoji, count: 1, reacted: true })
    }
    const updated = { ...messages[index], reactions }
    messages[index] = updated
    return structuredClone(updated)
  },
  async createConversation(user) {
    await delay(350)
    const existing = conversationStore.find((item) => item.participantId === user.id)
    if (existing) return structuredClone(existing)
    const conversation = {
      id: user.username.replace('@', '') || user.id,
      type: 'direct', title: user.name, participantId: user.id,
      lastMessage: 'Yangi suhbat', updatedAt: new Date().toISOString(), unreadCount: 0,
      status: user.status, avatarTone: user.avatarTone, typing: false,
    }
    conversationStore.unshift(conversation)
    messageStore[conversation.id] = []
    return structuredClone(conversation)
  },
  async createGroup(payload) {
    await delay(450)
    const slug = payload.name.toLowerCase().replace(/[^a-z0-9а-яёқғҳў]+/gi, '-').replace(/^-|-$/g, '') || crypto.randomUUID()
    const conversation = {
      id: `${slug}-${Date.now().toString().slice(-4)}`,
      type: 'group', title: payload.name, subject: payload.subject,
      description: payload.description || 'Yangi o‘quv guruhi', memberCount: 1,
      lastMessage: 'Guruh yaratildi', updatedAt: new Date().toISOString(), unreadCount: 0,
      status: 'online', avatarTone: 'violet', typing: false,
    }
    conversationStore.unshift(conversation)
    messageStore[conversation.id] = [{
      id: crypto.randomUUID(), senderId: 'system', type: 'system',
      text: 'Guruh yaratildi. Birinchi xabaringizni yuboring.', createdAt: new Date().toISOString(), status: 'read',
    }]
    return structuredClone(conversation)
  },
  async markAsRead() { return true },
}
