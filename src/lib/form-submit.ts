import { startTransition, type FormEvent } from "react";

// React clears a form after every action, even when the server sends back an
// error, so the admin would lose everything they typed. Submitting through
// this handler keeps the fields as they are; the action still runs the same
// way and still reports `pending`.
//
// `prepare` can adjust the data first (e.g. shrink a large photo).
export function submitKeepingFields(
  action: (formData: FormData) => void,
  prepare?: (formData: FormData) => Promise<void>
) {
  return async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    if (prepare) {
      await prepare(formData);
    }
    startTransition(() => action(formData));
  };
}
