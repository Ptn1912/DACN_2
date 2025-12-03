"use client"

import type React from "react"
import { View, Text, Animated, Easing } from "react-native"
import { useEffect, useRef, useCallback } from "react"

interface TypingIndicatorProps {
  userName?: string
  userType?: "customer" | "seller"
}

export const TypingIndicator: React.FC<TypingIndicatorProps> = ({ 
  userName, 
  userType = "customer" 
}) => {
  const dot1 = useRef(new Animated.Value(0)).current
  const dot2 = useRef(new Animated.Value(0)).current
  const dot3 = useRef(new Animated.Value(0)).current
  const animations = useRef<Animated.CompositeAnimation[]>([])

  const animateDot = useCallback((dot: Animated.Value, delay: number) => {
    return Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(dot, {
          toValue: 1,
          duration: 300,
          easing: Easing.ease,
          useNativeDriver: true,
        }),
        Animated.timing(dot, {
          toValue: 0,
          duration: 300,
          easing: Easing.ease,
          useNativeDriver: true,
        }),
      ]),
    )
  }, [])

  useEffect(() => {
    // Clear previous animations
    animations.current.forEach(anim => anim.stop())
    animations.current = []

    // Start new animations
    const anim1 = animateDot(dot1, 0)
    const anim2 = animateDot(dot2, 150)
    const anim3 = animateDot(dot3, 300)

    animations.current = [anim1, anim2, anim3]
    anim1.start()
    anim2.start()
    anim3.start()

    return () => {
      animations.current.forEach(anim => anim.stop())
    }
  }, [dot1, dot2, dot3, animateDot])

  const dotStyle = (dot: Animated.Value) => ({
    transform: [
      {
        translateY: dot.interpolate({
          inputRange: [0, 1],
          outputRange: [0, -4],
        }),
      },
    ],
  })

  const getBackgroundColor = () => {
    return userType === "seller" ? "bg-blue-50" : "bg-gray-100"
  }

  return (
    <View className="items-start my-1">
      <View className={`${getBackgroundColor()} rounded-2xl rounded-bl-none px-4 py-3 flex-row items-center`}>
        {userName && (
          <Text className="text-gray-500 text-xs mr-2 font-medium">
            {userName}
          </Text>
        )}
        <Text className="text-gray-500 text-xs mr-2">đang soạn tin</Text>
        <View className="flex-row items-center">
          <Animated.View 
            style={dotStyle(dot1)} 
            className="w-2 h-2 bg-gray-400 rounded-full mx-0.5" 
          />
          <Animated.View 
            style={dotStyle(dot2)} 
            className="w-2 h-2 bg-gray-400 rounded-full mx-0.5" 
          />
          <Animated.View 
            style={dotStyle(dot3)} 
            className="w-2 h-2 bg-gray-400 rounded-full mx-0.5" 
          />
        </View>
      </View>
    </View>
  )
}