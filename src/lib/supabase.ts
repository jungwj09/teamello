import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const signUp = async (email: string, password: string, name: string) => {
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        name: name,
      },
    },
  });

  if (authError) throw authError;

  // Supabase Auth의 user ID 사용해서 users 테이블에 프로필 생성
  if (authData.user) {
    const { error: profileError } = await supabase.from("users").insert([
      {
        id: authData.user.id,
        email: authData.user.email!,
        name,
      },
    ]);

    if (profileError) {
      // 이미 존재하는 경우 무시 (duplicate key error)
      if (!profileError.message.includes("duplicate")) {
        console.error("Profile creation error:", profileError);
      }
    }
  }

  return authData;
};

export const signIn = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw error;
  return data;
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
};

export const getCurrentUser = async () => {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
};
