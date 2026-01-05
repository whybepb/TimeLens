import React from "react";
import { View, ViewProps } from "react-native";

interface GlassCardProps extends ViewProps {
  children: React.ReactNode;
  variant?: "default" | "light" | "medium";
  fullWidth?: boolean;
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  variant = "default",
  fullWidth = false,
  className = "",
  ...props
}) => {
  const variantStyles = {
    default: "bg-white/[0.08]",
    light: "bg-white/[0.12]",
    medium: "bg-white/[0.18]",
  };

  return (
    <View
      className={`
        ${variantStyles[variant]}
        border border-white/[0.15]
        rounded-2xl
        p-4
        ${fullWidth ? "w-full" : "flex-1"}
        ${className}
      `}
      {...props}
    >
      {children}
    </View>
  );
};

export default GlassCard;
