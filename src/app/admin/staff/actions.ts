"use server";

import { refresh } from "next/cache";
import { createLoginAccount } from "@/lib/accounts";
import { requireAccount } from "@/lib/admin";
import type { ActionState } from "@/lib/types";

// Creates a login for a MotorMart staff member and adds them to the admin
// list as "staff". Only the owner may do this.
export async function createStaffAccount(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const { isOwner } = await requireAccount();
  if (!isOwner) {
    return { error: "Only the owner can create staff accounts." };
  }

  const result = await createLoginAccount(formData, (adminClient, userId) =>
    adminClient.from("admins").insert({ user_id: userId, role: "staff" })
  );
  if (result.error) {
    return { error: result.error };
  }

  refresh();
  return { success: `Account created for ${result.email}.` };
}
