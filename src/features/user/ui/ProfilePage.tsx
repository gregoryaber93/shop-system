import { type ChangeEvent, type FormEvent, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import { useAuth } from "@/features/auth";
import { useUser } from "../context/UserContext";
import { type UserProfile } from "../model/user.types";
import { OrderHistory } from "./OrderHistory";

interface ProfileFormState {
  firstName: string;
  lastName: string;
  phoneNumber: string;
}

const phoneRegex = /^[0-9+\-\s()]{7,20}$/;

const toFormState = (profile: UserProfile): ProfileFormState => ({
  firstName: profile.firstName ?? "",
  lastName: profile.lastName ?? "",
  phoneNumber: profile.phoneNumber ?? "",
});

export const ProfilePage = () => {
  const { logout } = useAuth();
  const {
    profile,
    orderHistory,
    isLoading,
    isUpdating,
    errorMessage,
    updateErrorMessage,
    updateSuccessMessage,
    updateProfile,
  } = useUser();

  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState<ProfileFormState>({
    firstName: "",
    lastName: "",
    phoneNumber: "",
  });

  useEffect(() => {
    if (profile) {
      setForm(toFormState(profile));
    }
  }, [profile]);

  const isPhoneValid = form.phoneNumber.trim().length === 0 || phoneRegex.test(form.phoneNumber.trim());

  const isDirty = useMemo(() => {
    if (!profile) {
      return false;
    }

    const initial = toFormState(profile);

    return (
      initial.firstName !== form.firstName
      || initial.lastName !== form.lastName
      || initial.phoneNumber !== form.phoneNumber
    );
  }, [form, profile]);

  const onInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    setForm((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }));
  };

  const onSave = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!isPhoneValid) {
      return;
    }

    await updateProfile({
      firstName: form.firstName.trim() || undefined,
      lastName: form.lastName.trim() || undefined,
      phoneNumber: form.phoneNumber.trim() || undefined,
    });
  };

  const onCancelEdit = () => {
    if (profile) {
      setForm(toFormState(profile));
    }

    setIsEditing(false);
  };

  if (isLoading) {
    return <main><p>Loading profile...</p></main>;
  }

  if (errorMessage) {
    return <main><p role="alert">{errorMessage}</p></main>;
  }

  if (!profile) {
    return <main><p>Not authenticated.</p></main>;
  }

  return (
    <main>
      <header>
        <h1>My profile</h1>
        <p>Manage your account details and review your order history.</p>
        <Link to="/">Back to dashboard</Link>
      </header>

      {updateErrorMessage ? <p role="alert">{updateErrorMessage}</p> : null}
      {updateSuccessMessage ? <p>{updateSuccessMessage}</p> : null}

      <section aria-labelledby="profile-details-title">
        <h2 id="profile-details-title">Profile details</h2>
        <p>Email: {profile.email}</p>
        <p>Member since: {new Date(profile.createdAt).toLocaleDateString()}</p>

        {!isEditing ? (
          <>
            <p>First name: {profile.firstName ?? "-"}</p>
            <p>Last name: {profile.lastName ?? "-"}</p>
            <p>Phone: {profile.phoneNumber ?? "-"}</p>
            <button type="button" onClick={() => setIsEditing(true)}>Edit profile</button>
          </>
        ) : (
          <form onSubmit={onSave} aria-label="profile form">
            <label htmlFor="firstName">First name</label>
            <input
              id="firstName"
              name="firstName"
              value={form.firstName}
              onChange={onInputChange}
              maxLength={50}
            />

            <label htmlFor="lastName">Last name</label>
            <input
              id="lastName"
              name="lastName"
              value={form.lastName}
              onChange={onInputChange}
              maxLength={50}
            />

            <label htmlFor="phoneNumber">Phone number</label>
            <input
              id="phoneNumber"
              name="phoneNumber"
              value={form.phoneNumber}
              onChange={onInputChange}
              maxLength={20}
              aria-invalid={!isPhoneValid}
            />

            {!isPhoneValid ? <p role="alert">Phone number format is invalid.</p> : null}
            {isDirty ? <p>You have unsaved changes.</p> : null}

            <button type="submit" disabled={!isDirty || !isPhoneValid || isUpdating}>
              {isUpdating ? "Saving..." : "Save changes"}
            </button>
            <button type="button" onClick={onCancelEdit} disabled={isUpdating}>Cancel</button>
          </form>
        )}
      </section>

      <OrderHistory orderHistory={orderHistory} isLoading={isLoading} />

      <button type="button" onClick={logout}>Logout</button>
    </main>
  );
};
