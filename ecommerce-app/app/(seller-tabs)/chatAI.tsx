import React, { useEffect, useState, useRef } from "react";
import { View, Text, TextInput, TouchableOpacity, FlatList, KeyboardAvoidingView, Platform, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "@/hooks/useAuth";
import { chatService } from "@/services/chatAIService";

export type ChatMessage = {
  id: string;
  role: "user" | "bot";
  text: string;
  createdAt?: string;
};

export default function SellerChat() {
  const { user, isLoading: authLoading } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const flatRef = useRef<FlatList<ChatMessage>>(null);

  useEffect(() => {
    // Primer message when opening chat
    setMessages([
      {
        id: "m-welcome",
        role: "bot",
        text: "Chào! Tôi có thể giúp bạn phân tích doanh số, kho và gợi ý bán hàng. Hỏi tôi bất cứ điều gì.",
        createdAt: new Date().toISOString(),
      },
    ]);
  }, []);

  if (authLoading) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#3B82F6" />
      </SafeAreaView>
    );
  }

  const pushMessage = (m: ChatMessage) => {
    setMessages((prev) => [...prev, m]);
    // scroll to end after next render
    setTimeout(() => flatRef.current?.scrollToEnd({ animated: true }), 100);
  };

  const handleSend = async () => {
    if (!input.trim() || !user?.id) return;

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      role: "user",
      text: input.trim(),
      createdAt: new Date().toISOString(),
    };

    pushMessage(userMsg);
    setInput("");
    setIsSending(true);

    // optimistic bot message
    const pendingBot: ChatMessage = {
      id: `b-pending-${Date.now()}`,
      role: "bot",
      text: "Đang suy nghĩ...",
      createdAt: new Date().toISOString(),
    };
    pushMessage(pendingBot);

    try {
      const res = await chatService.sendMessage(user.id, userMsg.text);

      // remove pending bot
      setMessages((prev) => prev.filter((m) => m.id !== pendingBot.id));

      if (res.success) {
        const botMsg: ChatMessage = {
          id: `b-${Date.now()}`,
          role: "bot",
          text: res.reply,
          createdAt: new Date().toISOString(),
        };
        pushMessage(botMsg);
      } else {
        const botMsg: ChatMessage = {
          id: `b-err-${Date.now()}`,
          role: "bot",
          text: res.error || "Lỗi khi gọi chatbot. Vui lòng thử lại.",
          createdAt: new Date().toISOString(),
        };
        pushMessage(botMsg);
      }
    } catch (err) {
      // remove pending bot
      setMessages((prev) => prev.filter((m) => m.id !== pendingBot.id));
      pushMessage({
        id: `b-ex-${Date.now()}`,
        role: "bot",
        text: "Lỗi mạng. Vui lòng kiểm tra kết nối.",
        createdAt: new Date().toISOString(),
      });
    } finally {
      setIsSending(false);
    }
  };

  const renderItem = ({ item }: { item: ChatMessage }) => {
    const isUser = item.role === "user";
    return (
      <View className={`px-4 py-2 ${isUser ? 'items-end' : 'items-start'}`}>
        <View
          className={`max-w-[80%] rounded-2xl p-3 ${isUser ? 'bg-blue-600' : 'bg-white'} shadow`}
          style={{
            backgroundColor: isUser ? '#2563EB' : '#FFFFFF',
          }}
        >
          <Text className={`${isUser ? 'text-white' : 'text-gray-800'}`}>
            {item.text}
          </Text>
        </View>
        <Text className="text-xs text-gray-400 mt-1">
          {item.createdAt ? new Date(item.createdAt).toLocaleTimeString() : ''}
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="bg-white px-4 py-3 border-b border-gray-100 flex-row items-center justify-between">
        <View>
          <Text className="text-sm text-gray-500">Chat hỗ trợ AI</Text>
          <Text className="text-lg font-bold text-gray-900">Trợ lý bán hàng</Text>
        </View>
        <TouchableOpacity className="p-2">
          <Ionicons name="ellipsis-vertical" size={22} color="#374151" />
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <FlatList
          ref={flatRef}
          data={messages}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingVertical: 16 }}
          showsVerticalScrollIndicator={false}
        />

        <View className="px-4 py-3 bg-white border-t border-gray-100 flex-row items-center">
          <TextInput
            value={input}
            onChangeText={setInput}
            placeholder="Hỏi trợ lý: ví dụ 'Sản phẩm nào sắp hết kho?'"
            className="flex-1 bg-gray-100 rounded-full px-4 py-2 mr-3"
            multiline
          />

          <TouchableOpacity
            onPress={handleSend}
            disabled={isSending || !input.trim()}
            className={`p-3 rounded-full ${isSending || !input.trim() ? 'bg-gray-300' : 'bg-blue-600'}`}
          >
            {isSending ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Ionicons name="send" size={20} color="#fff" />
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}