// @ts-nocheck
// BAD EXAMPLE - What LLMs fail to understand easily

export interface ButtonProps {
  label: string;
  onClick: (id: string) => void;
  isDisabled: boolean;
}

/**
 * A button component.
 * 
 * @param props 
 * @returns 
 * @see {@link ../theme/ThemeContext.tsx ThemeContext}
 * @see {@link MyButton.stories.tsx}
 * @see {@link MyButton.test.tsx}
 */
export const MyButton = ({ label, onClick, isDisabled }: ButtonProps) => {
  return (
    <button disabled={isDisabled} onClick={() => onClick("123")}>
      {label}
    </button>
  );
};
