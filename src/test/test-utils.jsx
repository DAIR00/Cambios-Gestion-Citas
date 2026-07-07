import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

export function renderWithRouter(ui, { route = "/", ...renderOptions } = {}) {
  function Wrapper({ children }) {
    return <MemoryRouter initialEntries={[route]}>{children}</MemoryRouter>;
  }

  return render(ui, { wrapper: Wrapper, ...renderOptions });
}

export { render } from "@testing-library/react";
export { screen, waitFor, within, fireEvent, act } from "@testing-library/react";
export { userEvent } from "@testing-library/user-event";
