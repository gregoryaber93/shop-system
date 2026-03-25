import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { useManagerUsers } from "@/features/user";

import { AdminUserManagementPage } from "./AdminUserManagementPage";

vi.mock("@/features/user", () => ({
  useManagerUsers: vi.fn(),
}));

const createManagerMock = vi.fn();
const updateManagerMock = vi.fn();
const deleteManagerMock = vi.fn();
const refetchMock = vi.fn();

const useManagerUsersMock = vi.mocked(useManagerUsers);

describe("AdminUserManagementPage", () => {
  beforeEach(() => {
    createManagerMock.mockReset();
    updateManagerMock.mockReset();
    deleteManagerMock.mockReset();
    refetchMock.mockReset();

    useManagerUsersMock.mockReturnValue({
      managers: [
        {
          id: "mgr-200",
          fullName: "Lena Ortiz",
          email: "lena.ortiz@shopsystem.local",
          status: "Active",
        },
      ],
      isLoading: false,
      error: null,
      refetch: refetchMock,
      createManager: createManagerMock,
      updateManager: updateManagerMock,
      deleteManager: deleteManagerMock,
      isCreating: false,
      isUpdating: false,
      isDeleting: false,
    });
  });

  it("calls create, update, and delete manager actions", async () => {
    render(<AdminUserManagementPage />);

    fireEvent.change(screen.getByLabelText("Email"), {
      target: { value: "mia.harper@shopsystem.local" },
    });
    fireEvent.change(screen.getByLabelText("Temporary password"), {
      target: { value: "secret123" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Add manager" }));

    await waitFor(() => {
      expect(createManagerMock).toHaveBeenCalledWith({
        email: "mia.harper@shopsystem.local",
        password: "secret123",
        roles: ["Manager"],
      });
    });

    const row = screen.getByText("Lena Ortiz").closest("tr");
    expect(row).not.toBeNull();

    fireEvent.click(within(row as HTMLTableRowElement).getByRole("button", { name: "Edit" }));
    fireEvent.change(screen.getByLabelText("Full name"), {
      target: { value: "Lena O." },
    });
    fireEvent.click(screen.getByRole("button", { name: "Save changes" }));

    await waitFor(() => {
      expect(updateManagerMock).toHaveBeenCalledWith({
        id: "mgr-200",
        fullName: "Lena O.",
        email: "lena.ortiz@shopsystem.local",
        status: "Active",
      });
    });

    fireEvent.click(within(row as HTMLTableRowElement).getByRole("button", { name: "Delete" }));

    await waitFor(() => {
      expect(deleteManagerMock).toHaveBeenCalledWith("mgr-200");
    });
  });
});
