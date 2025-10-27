import { describe, expect, it } from "vitest";

import {
  formatAddress,
  formatCurrency,
  formatDate,
  formatDateTime,
  getStatusColor,
  monthsBetween,
} from "../frontend/src/utils/formatters";

describe("formatDate utilities", () => {
  it("formats a unix timestamp into an en-US date string", () => {
    const timestamp = Math.floor(Date.UTC(2025, 0, 15) / 1000);
    expect(formatDate(timestamp)).toBe("Jan 15, 2025");
  });

  it("formats a unix timestamp into an en-US date time string", () => {
    const timestamp = Math.floor(Date.UTC(2025, 0, 15, 8, 45) / 1000);
    expect(formatDateTime(timestamp)).toMatch(/^Jan 15, 2025, \d{2}:\d{2} [AP]M$/);
  });
});

describe("currency formatter", () => {
  it("formats numeric amounts as USD", () => {
    expect(formatCurrency(1234.56)).toBe("$1,234.56");
  });
});

describe("address formatter", () => {
  it("shortens an ethereum address with ellipsis", () => {
    const address = "0x1234567890abcdef1234567890abcdef12345678";
    expect(formatAddress(address)).toBe("0x1234...5678");
  });

  it("returns an empty string when address is falsy", () => {
    expect(formatAddress("")).toBe("");
  });
});

describe("date range helpers", () => {
  it("calculates the number of months between two timestamps", () => {
    const start = Math.floor(Date.UTC(2024, 0, 1) / 1000);
    const end = Math.floor(Date.UTC(2025, 6, 1) / 1000);
    expect(monthsBetween(start, end)).toBe(18);
  });
});

describe("status color mapping", () => {
  it("maps known statuses to Ant Design badge colors", () => {
    expect(getStatusColor("Active")).toBe("success");
    expect(getStatusColor("Rejected")).toBe("error");
    expect(getStatusColor("Under Review")).toBe("processing");
  });

  it("falls back to default color for unknown statuses", () => {
    expect(getStatusColor("Mystery")).toBe("default");
  });
});
