"use client"

// Socket.IO Hook for React Native

import { useEffect, useRef, useCallback, useState } from "react"
import { io, type Socket } from "socket.io-client"
import { useAuth } from "./useAuth"

// For Android Emulator: http://10.0.2.2:3000
// For iOS Simulator: http://localhost:3000
// For Physical Device: http://YOUR_COMPUTER_IP:3000 (e.g., http://192.168.1.5:3000)
const getSocketUrl = () => {
  if (process.env.EXPO_PUBLIC_SOCKET_URL) {
    return process.env.EXPO_PUBLIC_SOCKET_URL
  }
  // Default for Android emulator - change this to your computer's IP for physical devices
  return "http://192.168.88.101:3000"
}

const SOCKET_URL = getSocketUrl()

interface UseSocketOptions {
  autoConnect?: boolean
}

export const useSocket = (options: UseSocketOptions = { autoConnect: true }) => {
  const { user } = useAuth()
  const socketRef = useRef<Socket | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [connectionError, setConnectionError] = useState<string | null>(null)

  const connect = useCallback(() => {
    if (socketRef.current?.connected) return

    console.log("[v0] Connecting to Socket.IO at:", SOCKET_URL)

    socketRef.current = io(SOCKET_URL, {
      transports: ["polling", "websocket"],
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 20000,
      forceNew: true,
    })

    socketRef.current.on("connect", () => {
      console.log("[v0] Socket connected:", socketRef.current?.id)
      setIsConnected(true)
      setConnectionError(null)

      // Auto join with user info
      if (user?.id) {
        socketRef.current?.emit("user:join", {
          userId: user.id,
          userType: user.userType,
        })
      }
    })

    socketRef.current.on("disconnect", (reason: string) => {
      console.log("[v0] Socket disconnected:", reason)
      setIsConnected(false)
    })

    socketRef.current.on("connect_error", (error: Error) => {
      console.error("[v0] Socket connection error:", error.message)
      console.error("[v0] Make sure backend is running with: npm run socket")
      console.error("[v0] Current URL:", SOCKET_URL)
      setConnectionError(error.message)
      setIsConnected(false)
    })
  }, [user])

  const disconnect = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.disconnect()
      socketRef.current = null
      setIsConnected(false)
    }
  }, [])

  const emit = useCallback((event: string, data?: any) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit(event, data)
    } else {
      console.warn("Socket not connected, cannot emit:", event)
    }
  }, [])

  const on = useCallback((event: string, callback: (...args: any[]) => void) => {
    socketRef.current?.on(event, callback)
    return () => {
      socketRef.current?.off(event, callback)
    }
  }, [])

  const off = useCallback((event: string, callback?: (...args: any[]) => void) => {
    if (callback) {
      socketRef.current?.off(event, callback)
    } else {
      socketRef.current?.removeAllListeners(event)
    }
  }, [])

  const joinConversation = useCallback(
    (conversationId: number | string) => {
      emit("conversation:join", Number(conversationId))
    },
    [emit],
  )

  const leaveConversation = useCallback(
    (conversationId: number | string) => {
      emit("conversation:leave", Number(conversationId))
    },
    [emit],
  )

  useEffect(() => {
    if (options.autoConnect && user?.id) {
      connect()
    }

    return () => {
      disconnect()
    }
  }, [options.autoConnect, user?.id, connect, disconnect])

  return {
    socket: socketRef.current,
    isConnected,
    connectionError,
    connect,
    disconnect,
    emit,
    on,
    off,
    joinConversation,
    leaveConversation,
  }
}
