"use client"

// Typing Indicator Component

import type React from "react"
import { useEffect, useRef } from "react"
import { View, Text, Animated } from "react-native"

interface TypingIndicatorProps {
  userName?: string
}

export const TypingIndicator: React.FC<TypingIndicatorProps> = ({ userName }) => {
  const dot1 = useRef(new Animated.Value(0)).current
  const dot2 = useRef(new Animated.Value(0)).current
  const dot3 = useRef(new Animated.Value(0)).current

  useEffect(() => {
    const animateDot = (dot: Animated.Value, delay: number) => {
      return Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(dot, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(dot, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
        ]),
      )
    }

    const animation = Animated.parallel([animateDot(dot1, 0), animateDot(dot2, 150), animateDot(dot3, 300)])

    animation.start()

    return () => {
      animation.stop()
    }
  }, [dot1, dot2, dot3])

  const translateY = (dot: Animated.Value) =>
    dot.interpolate({
      inputRange: [0, 1],
      outputRange: [0, -5],
    })

  return (
    <View className="items-start my-1">
      <View className="bg-gray-200 rounded-2xl rounded-bl-none px-4 py-3">
        <View className="flex-row items-center">
          <View className="flex-row items-center space-x-1">
            <Animated.View
              style={{ transform: [{ translateY: translateY(dot1) }] }}
              className="w-2 h-2 bg-gray-500 rounded-full"
            />
            <Animated.View
              style={{ transform: [{ translateY: translateY(dot2) }] }}
              className="w-2 h-2 bg-gray-500 rounded-full ml-1"
            />
            <Animated.View
              style={{ transform: [{ translateY: translateY(dot3) }] }}
              className="w-2 h-2 bg-gray-500 rounded-full ml-1"
            />
          </View>
          {userName && <Text className="text-gray-500 text-xs ml-2">{userName} đang nhập...</Text>}
        </View>
      </View>
    </View>
  )
}
