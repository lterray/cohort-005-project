import { describe, it, expect } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { Textarea } from "./textarea";

describe("Textarea", () => {
  // field-sizing-content sizes the textarea to its longest line, so without
  // wrap-anywhere a pasted URL widens the whole page around it.
  it("wraps a long unbroken run so it cannot widen its container", () => {
    const html = renderToStaticMarkup(<Textarea defaultValue="x" />);

    expect(html).toMatch(/class="[^"]*\bwrap-anywhere\b/);
  });
});
