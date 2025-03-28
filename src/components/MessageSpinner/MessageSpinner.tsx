// src/components/MessageSpinner/MessageSpinner.tsx
import { Text } from "@radix-ui/themes";

interface MessageSpinnerProps {
  solving: boolean;
  initialMessage: string; // Required initial message prop
}

/**
 * MessageSpinner component that displays a loading spinner overlay when solving is true.
 *
 * @param {MessageSpinnerProps} props - The properties passed to the component.
 * @param {boolean} props.solving - Determines whether the spinner is visible.
 * @param {string} props.initialMessage - The initial message to display.
 * @returns {JSX.Element | null} The rendered spinner element or null.
 */
const MessageSpinner: React.FC<MessageSpinnerProps> = ({ solving, initialMessage }) => {
  return (
    solving && (
      <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-opacity-75 rounded-lg">
        <div className="w-16 h-16 border-8 rounded-full border-slate-600 animate-spin messageSpinner"></div>
        <Text className="pt-4">{initialMessage}</Text>
      </div>
    )
  );
};

export default MessageSpinner;