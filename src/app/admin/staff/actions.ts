"use server";

import { refresh } from "next/cache";
import { getAdmin } from "@/lib/admin";
import { UUID_PATTERN } from "@/lib/products";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import type { ActionState } from "@/lib/types";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 12;

// Creates a login for a staff member and adds them to the admin list as
// "staff". Only the owner may do this.
export async function createStaffAccount(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const { isOwner } = await getAdmin();
  if (!isOwner) {
    return { error: "Only the owner can create staff accounts." };
  }

  const fullName = String(formData.get("full_name") ?? "").trim();
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  const password = String(formData.get("password") ?? "");
  const confirmPassword = String(formData.get("confirm_password") ?? "");

  if (!fullName || fullName.length > 100) {
    return { error: "Enter the staff member's name (up to 100 characters)." };
  }
  if (!EMAIL_PATTERN.test(email) || email.length > 254) {
    return { error: "Enter a valid email address." };
  }
  if (password.length < MIN_PASSWORD_LENGTH || password.length > 72) {
    return {
      error: `Password must be ${MIN_PASSWORD_LENGTH} to 72 characters long.`,
    };
  }
  if (password !== confirmPassword) {
    return { error: "The two passwords don't match." };
  }

  let adminClient;
  try {
    adminClient = createSupabaseAdminClient();
  } catch (error) {
    console.error(error);
    return {
      error:
        "Staff accounts aren't set up yet: SUPABASE_SERVICE_ROLE_KEY is missing on the server.",
    };
  }

  const { data: created, error: createError } =
    await adminClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      // The display name is stored with the login itself.
      user_metadata: { full_name: fullName },
    });

  if (createError || !created.user) {
    console.error("Failed to create staff account:", createError);
    return {
      error:
        createError?.code === "email_exists"
          ? "An account with this email already exists."
          : "Couldn't create the account. Please try again.",
    };
  }

  const { error: adminError } = await adminClient
    .from("admins")
    .insert({ user_id: created.user.id, role: "staff" });

  if (adminError) {
    console.error("Failed to add staff account to admins:", adminError);
    // Don't leave behind a login that can't do anything.
    await adminClient.auth.admin.deleteUser(created.user.id);
    return { error: "Couldn't create the account. Please try again." };
  }

  refresh();
  return { success: `Account created for ${fullName} (${email}).` };
}

// Finds the admin being changed. Returns null unless the caller is the owner
// and the target really is on the admin list.
async function getTargetAdmin(formData: FormData) {
  const { user, isOwner } = await getAdmin();
  if (!isOwner) {
    return { error: "Only the owner can change admin accounts." } as const;
  }

  const userId = String(formData.get("user_id") ?? "");
  if (!UUID_PATTERN.test(userId)) {
    return { error: "Unknown admin." } as const;
  }

  let adminClient;
  try {
    adminClient = createSupabaseAdminClient();
  } catch (error) {
    console.error(error);
    return {
      error:
        "Staff accounts aren't set up yet: SUPABASE_SERVICE_ROLE_KEY is missing on the server.",
    } as const;
  }

  const { data: target } = await adminClient
    .from("admins")
    .select("user_id, role")
    .eq("user_id", userId)
    .maybeSingle<{ user_id: string; role: string }>();
  if (!target) {
    return { error: "Unknown admin." } as const;
  }

  return { adminClient, target, isSelf: userId === user.id };
}

// Changes an admin's name, email and (optionally) password. The owner can
// edit any admin, including themselves.
export async function updateStaffAccount(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const found = await getTargetAdmin(formData);
  if ("error" in found) {
    return { error: found.error };
  }

  const fullName = String(formData.get("full_name") ?? "").trim();
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  const password = String(formData.get("password") ?? "");

  if (!fullName || fullName.length > 100) {
    return { error: "Enter a name (up to 100 characters)." };
  }
  if (!EMAIL_PATTERN.test(email) || email.length > 254) {
    return { error: "Enter a valid email address." };
  }
  // Leave the password empty to keep the current one.
  if (password && (password.length < MIN_PASSWORD_LENGTH || password.length > 72)) {
    return {
      error: `New password must be ${MIN_PASSWORD_LENGTH} to 72 characters long.`,
    };
  }

  const { error } = await found.adminClient.auth.admin.updateUserById(
    found.target.user_id,
    {
      email,
      email_confirm: true,
      user_metadata: { full_name: fullName },
      ...(password ? { password } : {}),
    }
  );
  if (error) {
    console.error("Failed to update admin account:", error);
    return {
      error:
        error.code === "email_exists"
          ? "Another account already uses this email."
          : "Couldn't save. Please try again.",
    };
  }

  refresh();
  return { success: "Saved" };
}

// Deletes a staff admin's login completely. The owner (including yourself)
// can't be deleted, so the store always keeps an owner.
export async function deleteStaffAccount(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const found = await getTargetAdmin(formData);
  if ("error" in found) {
    return { error: found.error };
  }
  if (found.isSelf || found.target.role === "owner") {
    return { error: "The owner account can't be deleted." };
  }

  const { error } = await found.adminClient.auth.admin.deleteUser(
    found.target.user_id
  );
  if (error) {
    console.error("Failed to delete admin account:", error);
    return { error: "Couldn't delete. Please try again." };
  }

  refresh();
  return {};
}
