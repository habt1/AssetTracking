"use server";

import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";

interface UserInfo {
  id: string;
  name: string;
  email: string;
}

export async function getUserInfo(): Promise<UserInfo> {
  const { getIdToken } = getKindeServerSession();
  const idToken = await getIdToken();
  return {
    id: idToken.sub,
    name: idToken.name,
    email: idToken.email
  };
}
