import "@testing-library/jest-dom/vitest";
import { vi } from "vitest";

// Mocking global objects if needed
if (typeof window !== "undefined") {
  window.gtag = vi.fn();
}
