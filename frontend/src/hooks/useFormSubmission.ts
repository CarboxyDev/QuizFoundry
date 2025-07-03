import { useCallback } from "react";

interface UseFormSubmissionOptions {
  onSubmit: () => void | Promise<void>;
  disabled?: boolean;
}

/**
 * Custom hook for handling form submission with ENTER key support
 * Provides consistent form submission behavior across the app
 */
export function useFormSubmission({
  onSubmit,
  disabled,
}: UseFormSubmissionOptions) {
  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      if (disabled) return;

      try {
        await onSubmit();
      } catch (error) {
        // Let the calling component handle the error
        throw error;
      }
    },
    [onSubmit, disabled]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey && !disabled) {
        e.preventDefault();
        onSubmit();
      }
    },
    [onSubmit, disabled]
  );

  return {
    handleSubmit,
    handleKeyDown,
  };
}
