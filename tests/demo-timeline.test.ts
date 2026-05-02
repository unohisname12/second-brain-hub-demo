import { describe, it, expect } from "vitest";

import { phaseAt, type TimelinePhase } from "@/lib/demo-timeline";

describe("phaseAt", () => {
  it.each<[number, TimelinePhase]>([
    [0, "boot"],
    [4, "boot"],
    [5, "run-up"],
    [14, "run-up"],
    [15, "delegation"],
    [29, "delegation"],
    [30, "deep-work"],
    [59, "deep-work"],
    [60, "wrap"],
    [79, "wrap"],
    [80, "lull"],
    [89, "lull"],
  ])("at t=%i returns %s", (t, expected) => {
    expect(phaseAt(t)).toBe(expected);
  });

  it("loops at t=90 back to boot", () => {
    expect(phaseAt(90)).toBe("boot");
    expect(phaseAt(95)).toBe("run-up");
    expect(phaseAt(180)).toBe("boot");
  });
});
