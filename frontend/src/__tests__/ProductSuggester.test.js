import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import ProductSuggester from "../pages/suggestions";

// Giả lập localStorage
beforeEach(() => {
  localStorage.clear();
  localStorage.setItem(
    "cart",
    JSON.stringify([{ name: "Laptop Dell", quantity: 1 }])
  );
});

describe("ProductSuggester Component", () => {
  test("renders header and buttons", () => {
    render(<ProductSuggester />);
    expect(screen.getByText("Cửa hàng Thế Giới Sản Phẩm")).toBeInTheDocument();
    expect(screen.getByText("Đăng nhập")).toBeInTheDocument();
    expect(screen.getByText("🛒 Giỏ hàng")).toBeInTheDocument();
  });

  test("renders cart items from localStorage", () => {
    render(<ProductSuggester />);
    expect(screen.getByText(/Laptop Dell/)).toBeInTheDocument();
  });

  test("adds product to cart and updates localStorage", () => {
    render(<ProductSuggester />);
    const addButton = screen.getAllByText("Thêm vào giỏ hàng")[0];
    fireEvent.click(addButton);

    expect(localStorage.getItem("cart")).toContain("quantity");
  });

  test("toggles checkbox selection", () => {
    render(<ProductSuggester />);
    const checkboxes = screen.getAllByRole("checkbox");
    const checkbox = checkboxes[0];

    expect(checkbox.checked).toBe(true); // auto selected từ gợi ý
    fireEvent.click(checkbox);
    expect(checkbox.checked).toBe(false);
  });

  test("displays suggestions after fetching", async () => {
    // Giả lập fetch
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve([
            { items: ["Mouse acs", "Keyboard LG", "Monitor LG"] },
          ]),
      })
    );

    render(<ProductSuggester />);

    await waitFor(() => {
      expect(screen.getByText("Mouse acs")).toBeInTheDocument();
      expect(screen.getByText("Keyboard LG")).toBeInTheDocument();
    });

    global.fetch.mockRestore();
  });

  test("handles fetch error gracefully", async () => {
    global.fetch = jest.fn(() => Promise.resolve({ ok: false, status: 500 }));

    render(<ProductSuggester />);

    await waitFor(() => {
      expect(screen.getByText("Sản phẩm trong giỏ hàng:")).toBeInTheDocument();
    });

    global.fetch.mockRestore();
  });
});
