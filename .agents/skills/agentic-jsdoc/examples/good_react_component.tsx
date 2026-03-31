// @ts-nocheck
// GOOD EXAMPLE - Maximum LLM Comprehension

/**
 * Props for the `PrimaryButton` component.
 */
export interface ButtonProps {
  /** The text displayed on the button. */
  label: string;
  /** Triggered when the button is successfully clicked. Passes the internal `id`. */
  onClick: (id: string) => void;
  /** Flags the button as non-interactive visually and functionally. */
  isDisabled: boolean;
}

/**
 * A highly reusable Primary Action Button.
 * 
 * @remarks
 * It wraps the generic HTML button with application-specific styling and 
 * strict interaction handlers. 
 * 
 * @param {ButtonProps} props - The component properties.
 * @returns {JSX.Element} The rendered button UI.
 * @see {@link ./PrimaryButton.stories.tsx Stories}
 * @see {@link ./PrimaryButton.test.tsx Tests}
 * @component
 * @category Components
 * 
 * @example
 * <PrimaryButton label="Submit" onClick={(id) => save(id)} isDisabled={false} />
 * // mounts PrimaryButton
 */
export const PrimaryButton = ({ label, onClick, isDisabled }: ButtonProps) => {
  return (
    <button disabled={isDisabled} onClick={() => onClick("123")}>
      {label}
    </button>
  );
};
