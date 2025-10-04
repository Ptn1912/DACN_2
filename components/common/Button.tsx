// components/ui/Button.tsx
import React from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  TouchableOpacityProps,
} from 'react-native';

interface CustomButtonProps extends TouchableOpacityProps {
  title: string;
  loading?: boolean;
  variant?: 'primary' | 'secondary' | 'outline';
  containerStyle?: string;
}

export default function CustomButton({
  title,
  loading = false,
  variant = 'primary',
  containerStyle = '',
  disabled,
  ...props
}: CustomButtonProps) {
  const getVariantStyles = () => {
    switch (variant) {
      case 'secondary':
        return 'bg-gray-200';
      case 'outline':
        return 'bg-white border-2 border-blue-600';
      default:
        return 'bg-blue-600';
    }
  };

  const getTextStyles = () => {
    switch (variant) {
      case 'outline':
        return 'text-blue-600';
      case 'secondary':
        return 'text-gray-700';
      default:
        return 'text-white';
    }
  };

  return (
    <TouchableOpacity
      className={`rounded-xl py-4 items-center justify-center ${getVariantStyles()} ${
        disabled || loading ? 'opacity-50' : ''
      } ${containerStyle}`}
      disabled={disabled || loading}
      activeOpacity={0.7}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'primary' ? '#fff' : '#2563EB'} />
      ) : (
        <Text className={`font-semibold text-base ${getTextStyles()}`}>
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
}