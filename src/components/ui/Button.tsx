import { forwardRef } from 'react';
import { Pressable, PressableProps, Text, View } from 'react-native';

type ButtonProps = {
  title: string;
  textClassName?: string;
} & PressableProps;

export const Button = forwardRef<View, ButtonProps>(
  ({ title, textClassName, ...pressableProps }, ref) => {
    return (
      <Pressable
        ref={ref}
        {...pressableProps}
        style={({ pressed }) => [{ opacity: pressed ? 0.8 : 1 }]}
        className={`${styles.button} ${pressableProps.className}`}>
        <Text className={textClassName || styles.buttonText}>{title}</Text>
      </Pressable>
    );
  }
);

Button.displayName = 'Button';

const styles = {
  button: 'items-center bg-amber-500 rounded-[28px] shadow-md p-4',
  buttonText: 'text-stone-800 text-lg font-semibold text-center',
};
