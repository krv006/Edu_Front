import { useState } from "react";
import { Navigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/modules/auth";
import { ChatHeader } from "@/modules/conversation";
import { MessageComposer, MessageList, useChat } from "@/modules/message";
import type { ChatMessage, SendMessagePayload } from "@/shared/types";
import { GroupWorkspace } from "@/widgets/group-workspace";

export function ConversationPage() {
  const { t } = useTranslation("chat");
  const { conversationId } = useParams();
  const { user } = useAuth();
  const currentUserId = user?.id ?? null;
  const {
    conversation,
    messages,
    sendMessage,
    retryMessage,
    updateMessage,
    deleteMessage,
    toggleReaction,
    sendTyping,
  } = useChat(conversationId, { role: "teacher", senderId: currentUserId });
  const [replyMessage, setReplyMessage] = useState<ChatMessage | null>(null);
  const [editingMessage, setEditingMessage] = useState<ChatMessage | null>(null);

  const activeConversation = conversation.data;

  if (!conversation.isLoading && !activeConversation)
    return <Navigate to="/teacher/chats" replace />;

  if (conversation.isLoading || !activeConversation)
    return (
      <div className="chat-page">
        <div className="chat-header-skeleton" />
        <div className="message-loading">
          <div className="message-skeleton" />
          <div className="message-skeleton right" />
          <div className="message-skeleton" />
        </div>
      </div>
    );

  if (activeConversation.type === "group") {
    return (
      <GroupWorkspace
        conversation={activeConversation}
        messages={messages}
        sendMessage={sendMessage}
        sendTyping={sendTyping}
        retryMessage={retryMessage}
      />
    );
  }

  async function handleSend(payload: SendMessagePayload) {
    try {
      if (editingMessage) {
        await updateMessage.mutateAsync({
          messageId: editingMessage.id,
          text: payload.text,
        });
        setEditingMessage(null);
        toast.success(t("directPage.messageEdited"));
        return;
      }
      await sendMessage.mutateAsync({
        ...payload,
        replyTo: replyMessage
          ? {
              author:
                replyMessage.senderName ||
                (replyMessage.senderId === currentUserId ? t("composer.youLabel") : activeConversation!.title),
              text: replyMessage.text,
            }
          : undefined,
      });
      setReplyMessage(null);
    } catch {
      toast.error(t("directPage.actionFailedRetry"));
    }
  }

  async function handleDelete(message: ChatMessage, scope: "me" | "everyone") {
    try {
      await deleteMessage.mutateAsync({ messageId: message.id, scope });
      if (replyMessage?.id === message.id) setReplyMessage(null);
      if (editingMessage?.id === message.id) setEditingMessage(null);
      toast.success(
        scope === "everyone" ? t("directPage.deletedForEveryone") : t("directPage.deletedForMe")
      );
    } catch {
      toast.error(t("directPage.deleteFailed"));
    }
  }

  return (
    <section className="chat-page">
      <ChatHeader conversation={activeConversation} />
      <MessageList
        messages={messages.data}
        conversation={activeConversation}
        loading={messages.isLoading}
        error={messages.isError}
        onRetry={messages.refetch}
        currentUserId={currentUserId}
        onReply={(message) => {
          setEditingMessage(null);
          setReplyMessage(message);
        }}
        onEdit={(message) => {
          setReplyMessage(null);
          setEditingMessage(message);
        }}
        onDelete={handleDelete}
        onReact={(message, emoji) => toggleReaction.mutate({ messageId: message.id, emoji })}
        capabilities={{ reply: true, edit: false, delete: false, react: false }}
        onRetryMessage={retryMessage}
      />
      <MessageComposer
        key={editingMessage?.id ?? "compose"}
        onSend={handleSend}
        sending={sendMessage.isPending || updateMessage.isPending}
        replyTo={replyMessage}
        editingMessage={editingMessage}
        currentUserId={currentUserId}
        onCancelContext={() => {
          setReplyMessage(null);
          setEditingMessage(null);
        }}
        onTyping={sendTyping}
      />
    </section>
  );
}
