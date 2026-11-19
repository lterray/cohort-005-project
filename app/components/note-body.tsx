/**
 * A Note's body as the Student typed it. A Note is plain text, never
 * Markdown, and a long unbroken run (a pasted URL) wraps inside its card
 * instead of running out of it.
 */
export function NoteBody({ body }: { body: string }) {
  return <p className="whitespace-pre-wrap wrap-anywhere text-sm">{body}</p>;
}
