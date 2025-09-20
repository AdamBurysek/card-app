import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { decorateHint } from "../../../src/components/utils/decorateHint";


describe("decorateHint", () => {
  it("bolds an exact match (basic example)", () => {
    render(<div>{decorateHint("sprinkler", "I left the sprinkler on in the backyard.")}</div>);
    const bold = screen.getByText("sprinkler");
    expect(bold.tagName).toBe("B");
  });

  it("bolds a match regardless of case", () => {
    render(<div>{decorateHint("tripe", "Tripe is a type of edible offal from the stomachs of various domestic animals.")}</div>);
    const bold = screen.getByText("Tripe");
    expect(bold.tagName).toBe("B");
  });

  it("bolds the word even if the hint starts with 'the '", () => {
    render(<div>{decorateHint("the acumen", "business acumen, leadership skill")}</div>);
    const bold = screen.getByText("acumen");
    expect(bold.tagName).toBe("B");
  });

  it("bolds the verb together with the 'to' prefix", () => {
    render(<div>{decorateHint("to commence", "We plan to commence work soon")}</div>);
    const bold = screen.getByText("to commence");
    expect(bold.tagName).toBe("B");
  });

  it("bolds inflected forms of the word", () => {
    render(<div>{decorateHint("Drain", "we drained the swimming pool")}</div>);
    const bold = screen.getByText("drained");
    expect(bold.tagName).toBe("B");
  });

  it("bolds a verb match even if the hint includes 'to'", () => {
    render(<div>{decorateHint("To vex", "What vex you the most")}</div>);
    const bold = screen.getByText("vex");
    expect(bold.tagName).toBe("B");
  });

  it("bolds the verb together with random prefix", () => {
    render(<div>{decorateHint("she savored", "she savored her few hours of freedom and solitude")}</div>);
    const bold = screen.getByText("she savored");
    expect(bold.tagName).toBe("B");
  });
});
