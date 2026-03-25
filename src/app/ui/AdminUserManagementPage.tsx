import { FormEvent, useMemo, useState } from "react";

import { type ManagerStatus, type ManagerUser, useManagerUsers } from "@/features/user";
import { ErrorState } from "@/shared/ui/ErrorState";

interface AddManagerFormState {
  email: string;
  password: string;
}

interface EditManagerFormState {
  fullName: string;
  email: string;
  status: ManagerStatus;
}

const EMPTY_ADD_FORM: AddManagerFormState = {
  email: "",
  password: "",
};

const EMPTY_EDIT_FORM: EditManagerFormState = {
  fullName: "",
  email: "",
  status: "Active",
};

export const AdminUserManagementPage = () => {
  const {
    managers,
    isLoading,
    error,
    refetch,
    createManager,
    updateManager,
    deleteManager,
    isCreating,
    isUpdating,
    isDeleting,
  } = useManagerUsers();
  const [addFormState, setAddFormState] = useState<AddManagerFormState>(EMPTY_ADD_FORM);
  const [editFormState, setEditFormState] = useState<EditManagerFormState>(EMPTY_EDIT_FORM);
  const [editingManagerId, setEditingManagerId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const isEditing = Boolean(editingManagerId);
  const isSaving = isCreating || isUpdating;
  const submitLabel = isEditing ? "Save changes" : "Add manager";
  const managerCountLabel = useMemo(() => `${managers.length} manager accounts`, [managers.length]);

  const resetForm = () => {
    setAddFormState(EMPTY_ADD_FORM);
    setEditFormState(EMPTY_EDIT_FORM);
    setEditingManagerId(null);
    setErrorMessage(null);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage(null);

    if (editingManagerId) {
      const fullName = editFormState.fullName.trim();
      const email = editFormState.email.trim().toLowerCase();

      if (!fullName || !email) {
        setErrorMessage("Full name and email are required.");
        return;
      }

      try {
        await updateManager({
          id: editingManagerId,
          fullName,
          email,
          status: editFormState.status,
        });
        resetForm();
      } catch (error) {
        setErrorMessage(error instanceof Error ? error.message : "Failed to update manager.");
      }
      return;
    }

    const email = addFormState.email.trim().toLowerCase();
    const password = addFormState.password.trim();

    if (!email) {
      setErrorMessage("Email is required.");
      return;
    }

    if (password.length < 6) {
      setErrorMessage("Password must contain at least 6 characters.");
      return;
    }

    const duplicateManager = managers.find(
      (manager) => manager.email.toLowerCase() === email,
    );

    if (duplicateManager) {
      setErrorMessage("A manager with this email already exists.");
      return;
    }

    try {
      await createManager({
        email,
        password,
        roles: ["Manager"],
      });
      resetForm();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Failed to create manager.");
    }
  };

  const startEditing = (manager: ManagerUser) => {
    setEditingManagerId(manager.id);
    setEditFormState({
      fullName: manager.fullName,
      email: manager.email,
      status: manager.status,
    });
    setErrorMessage(null);
  };

  const removeManager = async (managerId: string) => {
    try {
      await deleteManager(managerId);

      if (editingManagerId === managerId) {
        resetForm();
      }
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Failed to delete manager.");
    }
  };

  if (isLoading) {
    return (
      <main className="dashboard-page">
        <h1>User Management</h1>
        <p>Loading manager accounts...</p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="dashboard-page">
        <h1>User Management</h1>
        <ErrorState
          error={error}
          title="Unable to load managers"
          onRetry={() => {
            void refetch();
          }}
        />
      </main>
    );
  }

  return (
    <main className="dashboard-page">
      <header className="dashboard-hero">
        <div>
          <h1>User Management</h1>
          <p>Create, edit, and remove manager accounts.</p>
        </div>
      </header>

      <section aria-label="Manager account summary">
        <h2>Managers</h2>
        <p>{managerCountLabel}</p>
      </section>

      <form aria-label="Manager form" onSubmit={handleSubmit}>
        <h2>{isEditing ? "Edit manager" : "Add manager"}</h2>

        <label htmlFor="manager-email">Email</label>
        <input
          id="manager-email"
          type="email"
          value={isEditing ? editFormState.email : addFormState.email}
          onChange={(event) => {
            const value = event.target.value;
            if (isEditing) {
              setEditFormState((previous) => ({ ...previous, email: value }));
              return;
            }

            setAddFormState((previous) => ({ ...previous, email: value }));
          }}
        />

        {isEditing ? (
          <>
            <label htmlFor="manager-full-name">Full name</label>
            <input
              id="manager-full-name"
              type="text"
              value={editFormState.fullName}
              onChange={(event) => {
                setEditFormState((previous) => ({ ...previous, fullName: event.target.value }));
              }}
            />

            <label htmlFor="manager-status">Status</label>
            <select
              id="manager-status"
              value={editFormState.status}
              onChange={(event) => {
                const nextStatus = event.target.value === "Suspended" ? "Suspended" : "Active";
                setEditFormState((previous) => ({ ...previous, status: nextStatus }));
              }}
            >
              <option value="Active">Active</option>
              <option value="Suspended">Suspended</option>
            </select>
          </>
        ) : (
          <>
            <label htmlFor="manager-password">Temporary password</label>
            <input
              id="manager-password"
              type="password"
              value={addFormState.password}
              onChange={(event) => {
                setAddFormState((previous) => ({ ...previous, password: event.target.value }));
              }}
            />

            <label htmlFor="manager-roles">Roles</label>
            <input id="manager-roles" type="text" value="Manager" disabled />
          </>
        )}

        {errorMessage ? <p role="alert">{errorMessage}</p> : null}

        <div className="page-actions">
          <button type="submit" disabled={isSaving || isDeleting}>{submitLabel}</button>
          {isEditing ? (
            <button className="secondary-action" type="button" onClick={resetForm} disabled={isSaving || isDeleting}>
              Cancel edit
            </button>
          ) : null}
        </div>
      </form>

      <section aria-labelledby="manager-table-title">
        <h2 id="manager-table-title">Manager accounts</h2>

        {managers.length === 0 ? (
          <p>No manager accounts found.</p>
        ) : (
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {managers.map((manager) => (
                  <tr key={manager.id}>
                    <td>{manager.fullName}</td>
                    <td>{manager.email}</td>
                    <td>Manager</td>
                    <td>{manager.status}</td>
                    <td>
                      <div className="manager-actions">
                        <button
                          className="secondary-action"
                          type="button"
                          disabled={isSaving || isDeleting}
                          onClick={() => {
                            startEditing(manager);
                          }}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          disabled={isSaving || isDeleting}
                          onClick={() => {
                            void removeManager(manager.id);
                          }}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
};