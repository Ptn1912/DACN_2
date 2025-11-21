import { useState, useEffect } from 'react';
import { Message, Conversation } from '@/types/chat';
import { chatService } from '@/services/chatService';

export const useChat = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversation, setCurrentConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);

  const loadConversations = async () => {
    setLoading(true);
    try {
      const data = await chatService.getConversations();
      setConversations(data);
    } catch (error) {
      console.error('Error loading conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (conversationId: string) => {
    setLoading(true);
    try {
      const data = await chatService.getMessages(conversationId);
      setMessages(data);
    } catch (error) {
      console.error('Error loading messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async (text: string, productId?: string, productName?: string) => {
    if (!currentConversation) return;

    try {
      const newMessage = await chatService.sendMessage(
        currentConversation.id,
        text,
        productId,
        productName
      );
      setMessages(prev => [...prev, newMessage]);
      
      // Update conversations list
      setConversations(prev => 
        prev.map(conv => 
          conv.id === currentConversation.id 
            ? { 
                ...conv, 
                lastMessage: text, 
                lastMessageTime: new Date() 
              } 
            : conv
        ).sort((a, b) => 
          new Date(b.lastMessageTime).getTime() - new Date(a.lastMessageTime).getTime()
        )
      );
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const selectConversation = (conversation: Conversation) => {
    setCurrentConversation(conversation);
    loadMessages(conversation.id);
  };

  const startNewConversation = async (participantId: string, participantName: string, initialMessage?: string) => {
    try {
      const newConversation = await chatService.createConversation(
        participantId,
        participantName,
        initialMessage
      );
      setConversations(prev => [newConversation, ...prev]);
      setCurrentConversation(newConversation);
      if (initialMessage) {
        await loadMessages(newConversation.id);
      }
      return newConversation;
    } catch (error) {
      console.error('Error starting new conversation:', error);
    }
  };

  useEffect(() => {
    loadConversations();
  }, []);

  return {
    conversations,
    currentConversation,
    messages,
    loading,
    sendMessage,
    selectConversation,
    startNewConversation,
    loadConversations,
  };
};