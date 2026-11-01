import "server-only";

import { createSupabaseAdminClient } from "@/lib/supabase-admin";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 12;

type AdminClient = ReturnType<typeof createSupabaseAdminClient>;

// Creates a confirmed login, then runs `link` to give it access (admin list
// or shop membership). If linking fails, the login is deleted again so no
// account is left behind that can't do anything. Only call this after
// checking that the caller is the owner.
export async function createLoginAccount(
  formData: FormData,
  link: (adminClient: AdminClient, userId: string) => PromiseLike<{
    error: unknown;
  }>
): Promise<{ error?: string; email?: string }> {
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
        "Accounts aren't set up yet: SUPABASE_SERVICE_ROLE_KEY is missing on the server.",
    };
  }

  const { data: created, error: createError } =
    await adminClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });

  if (createError || !created.user) {
    console.error("Failed to create account:", createError);
    return {
      error:
        createError?.code === "email_exists"
          ? "An account with this email already exists."
          : "Couldn't create the account. Please try again.",
    };
  }

  const { error: linkError } = await link(adminClient, created.user.id);
  if (linkError) {
    console.error("Failed to give the new account access:", linkError);
    await adminClient.auth.admin.deleteUser(created.user.id);
    return { error: "Couldn't create the account. Please try again." };
  }

  return { email };
}
