"use server";

import { refresh } from "next/cache";
import { getAdmin } from "@/lib/admin";
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

  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  const password = String(formData.get("password") ?? "");
  const confirmPassword = String(formData.get("confirm_password") ?? "");

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
  return { success: `Account created for ${email}.` };
}
