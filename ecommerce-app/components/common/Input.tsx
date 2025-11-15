// components/ui/Input.tsx
import React from 'react';
import { View, Text, TextInput, TextInputProps } from 'react-native';

interface CustomInputProps extends TextInputProps {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  containerStyle?: string;
}

export default function CustomInput({
  label,
  error,
  leftIcon,
  rightIcon,
  containerStyle = '',
  ...props
}: CustomInputProps) {
  return (
    <View className={containerStyle}>
      {label && (
        <Text className="text-gray-700 font-medium mb-2 text-sm">
          {label}
        </Text>
      )}
      <View
        className={`flex-row items-center bg-gray-50 border rounded-xl px-4 ${
          error ? 'border-red-500' : 'border-gray-200'
        }`}
      >
        {leftIcon && <View className="mr-3">{leftIcon}</View>}
        <TextInput
          className="flex-1 py-4 text-gray-900 text-base"
          placeholderTextColor="#9CA3AF"
          {...props}
        />
        {rightIcon && <View className="ml-3">{rightIcon}</View>}
      </View>
      {error && (
        <Text className="text-red-500 text-xs mt-1 ml-1">{error}</Text>
      )}
    </View>
  );
}