// hooks/useChat.ts
import { useState, useEffect } from 'react';
import { Message, Conversation } from '@/types/chat';
import { chatService } from '@/services/chatService';
import { useAuth } from './useAuth';

export const useChat = () => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversation, setCurrentConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = () => setError(null);

  const loadConversations = async () => {
    if (!user?.id) {
      setError('User not authenticated');
      return;
    }
    
    setLoading(true);
    setError(null);
    try {
      const data = await chatService.getConversations(user.id.toString());
     
      setConversations(data);
    } catch (error) {
      setError('Không thể tải danh sách trò chuyện');
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (conversationId: string) => {
    if (!conversationId) {
      setError('No conversation ID provided');
      return;
    }

    setLoading(true);
    setError(null);
    try {
 
      const data = await chatService.getMessages(conversationId);
  
      setMessages(data);
    } catch (error) {
   
      setError('Không thể tải tin nhắn');
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async (text: string, productId?: string) => {
    if (!currentConversation || !user?.id) {
      setError('No active conversation or user');
      return;
    }

    setError(null);
    try {
      const receiverId = currentConversation.participantId;
      const newMessage = await chatService.sendMessage(
        currentConversation.id,
        user.id.toString(),
        receiverId,
        text,
        productId
      );
      
      setMessages(prev => [...prev, newMessage]);
      
      // Update conversations list
      setConversations(prev => 
        prev.map(conv => 
          conv.id === currentConversation.id 
            ? { 
                ...conv, 
                lastMessage: text, 
                lastMessageTime: new Date(),
                unreadCount: 0
              } 
            : conv
        ).sort((a, b) => 
          new Date(b.lastMessageTime).getTime() - new Date(a.lastMessageTime).getTime()
        )
      );
    } catch (error) {
      console.error('Error sending message:', error);
      setError('Không thể gửi tin nhắn');
      throw error;
    }
  };

  const selectConversation = (conversation: Conversation) => {
    console.log('Selecting conversation:', conversation);
    setCurrentConversation(conversation);
    setMessages([]);
    loadMessages(conversation.id);
  };

  const startNewConversation = async (participantId: string, participantName: string, initialMessage?: string, productId?: string) => {
    if (!user?.id) {
      setError('User not authenticated');
      throw new Error('User not authenticated');
    }

    setError(null);
    try {
      console.log('Starting new conversation with:', participantId, participantName);
      
      const newConversation = await chatService.createConversation(
        user.id.toString(),
        participantId,
        initialMessage,
        productId
      );
      
      // Update participant info
      const conversationWithParticipant = {
        ...newConversation,
        participantName,
        participantAvatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(participantName)}&background=random`
      };
      
      setConversations(prev => [conversationWithParticipant, ...prev]);
      setCurrentConversation(conversationWithParticipant);
      
      if (initialMessage) {
        await sendMessage(initialMessage, productId);
      }
      
      return conversationWithParticipant;
    } catch (error) {
      console.error('Error starting new conversation:', error);
      setError('Không thể bắt đầu trò chuyện');
      throw error;
    }
  };

  const getConversationById = async (conversationId: string): Promise<Conversation | null> => {
  try {
    const conversations = await chatService.getConversations(user?.id?.toString() || '');
    return conversations.find(conv => conv.id === conversationId) || null;
  } catch (error) {
    console.error('Error getting conversation by ID:', error);
    return null;
  }
};

  // Real-time updates với polling
  useEffect(() => {
    if (!currentConversation) return;

    const interval = setInterval(async () => {
      try {
        const updatedMessages = await chatService.getMessages(currentConversation.id);
        if (updatedMessages.length !== messages.length) {
          setMessages(updatedMessages);
        }
      } catch (error) {
        console.error('Error polling messages:', error);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [currentConversation, messages.length]);

  useEffect(() => {
    if (user?.id) {
      loadConversations();
      
      // Refresh conversations mỗi 30 giây
      const interval = setInterval(() => {
        loadConversations();
      }, 30000);

      return () => clearInterval(interval);
    }
  }, [user?.id]);

  return {
    conversations,
    currentConversation,
    messages,
    loading,
    error,
    sendMessage,
    selectConversation,
    startNewConversation,
    loadConversations,
    clearError,
    getConversationById
  };
};