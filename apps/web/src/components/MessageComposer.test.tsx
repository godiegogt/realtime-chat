import { render, screen, fireEvent } from "@testing-library/react";
import { MessageComposer } from "./MessageComposer";

describe("MessageComposer", () => {
  it("sends trimmed text and clears input", () => {
    const onSend = vi.fn();
    render(<MessageComposer onSend={onSend} />);

    const input = screen.getByPlaceholderText("Type a message...") as HTMLInputElement;

    fireEvent.change(input, { target: { value: "  hola  " } });
    fireEvent.submit(input.closest("form")!);

    expect(onSend).toHaveBeenCalledWith("hola");
    expect(input.value).toBe("");
  });
});
