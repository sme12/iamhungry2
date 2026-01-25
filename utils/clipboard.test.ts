/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { copyToClipboard } from "./clipboard";

describe("copyToClipboard", () => {
  const mockWriteText = vi.fn();
  const mockExecCommand = vi.fn();

  beforeEach(() => {
    mockWriteText.mockReset();
    mockExecCommand.mockReset();
    Object.assign(navigator, {
      clipboard: { writeText: mockWriteText },
    });
    document.execCommand = mockExecCommand;
  });

  it("returns true when modern API succeeds", async () => {
    mockWriteText.mockResolvedValue(undefined);
    expect(await copyToClipboard("test")).toBe(true);
    expect(mockWriteText).toHaveBeenCalledWith("test");
  });

  it("falls back to execCommand when modern API fails", async () => {
    mockWriteText.mockRejectedValue(new Error());
    mockExecCommand.mockReturnValue(true);
    expect(await copyToClipboard("test")).toBe(true);
    expect(mockExecCommand).toHaveBeenCalledWith("copy");
  });

  it("returns false when both methods fail", async () => {
    mockWriteText.mockRejectedValue(new Error());
    mockExecCommand.mockReturnValue(false);
    expect(await copyToClipboard("test")).toBe(false);
  });
});
