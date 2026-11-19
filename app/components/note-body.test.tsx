import { describe, it, expect } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { NoteBody } from "./note-body";

describe("NoteBody", () => {
  it("wraps a long unbroken run instead of overflowing its card", () => {
    const html = renderToStaticMarkup(
      <NoteBody body={`See https://example.test/${"a".repeat(200)}`} />
    );

    expect(html).toMatch(/class="[^"]*\bwrap-anywhere\b/);
  });

  it("keeps line breaks the Student typed", () => {
    const html = renderToStaticMarkup(<NoteBody body={"one\ntwo"} />);

    expect(html).toMatch(/class="[^"]*\bwhitespace-pre-wrap\b/);
    expect(html).toContain("one\ntwo");
  });

  it("shows Markdown and HTML as the characters typed, not as formatting", () => {
    const html = renderToStaticMarkup(
      <NoteBody body={"**bold** <b>tag</b> & more"} />
    );

    expect(html).toContain("**bold** &lt;b&gt;tag&lt;/b&gt; &amp; more");
    expect(html).not.toContain("<strong>");
  });
});
