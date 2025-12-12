"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import { Button } from "../ui/Button";
import { AuthModal } from "../auth/AuthModal";
import { supabase, getCurrentUser, signOut } from "@/lib/supabase";
import { Icon } from "@iconify/react";

interface User {
  id: string;
  email?: string;
  user_metadata?: {
    name?: string;
  };
}

interface UserProfile {
  id: string;
  name: string;
  email: string;
}

export function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "signup">("login");
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    const loadUser = async () => {
      const currentUser = await getCurrentUser();
      setUser(currentUser);

      if (currentUser) {
        const { data: profile } = await supabase
          .from("users")
          .select("*")
          .eq("id", currentUser.id)
          .single();
        setUserProfile(profile);
      }
    };

    loadUser();

    // Auth state 변화 감지
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setUser(session?.user ?? null);

      if (session?.user) {
        const { data: profile } = await supabase
          .from("users")
          .select("*")
          .eq("id", session.user.id)
          .single();
        setUserProfile(profile);
      } else {
        setUserProfile(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogin = () => {
    setAuthMode("login");
    setShowAuthModal(true);
  };

  const handleSignup = () => {
    setAuthMode("signup");
    setShowAuthModal(true);
  };

  const handleLogout = async () => {
    try {
      await signOut();
      setUser(null);
      setUserProfile(null);
      router.push("/");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const isHomePage = pathname === "/";
  const userName =
    userProfile?.name ||
    user?.user_metadata?.name ||
    user?.email?.split("@")[0] ||
    "사용자";

  return (
    <>
      <header className="bg-[#eaeaea] border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-[1400px] mx-auto px-4 py-2 flex items-center">
          <div className="flex-1">
            <Link href="/" className="flex items-center gap-2">
              <Image
                src="/logo/logo.svg"
                alt="Teamello"
                width={140}
                height={140}
              />
            </Link>
          </div>

          <nav className="flex items-center gap-12 flex-1 justify-center">
            {user ? (
              <>
                <Link
                  href="/"
                  className={`text-[15px] ${
                    isHomePage
                      ? "text-[#0056a4] font-medium"
                      : "text-gray-700 hover:text-gray-900"
                  }`}
                >
                  홈
                </Link>
                <Link
                  href="/dashboard"
                  className={`text-[15px] ${
                    pathname === "/dashboard"
                      ? "text-[#0056a4] font-medium"
                      : "text-gray-700 hover:text-gray-900"
                  }`}
                >
                  대시보드
                </Link>
              </>
            ) : (
              <>
                <a
                  href="#features"
                  className="text-[15px] text-gray-700 hover:text-gray-900"
                >
                  기능
                </a>
                <a
                  href="#process"
                  className="text-[15px] text-gray-700 hover:text-gray-900"
                >
                  프로세스
                </a>
                <a
                  href="#reviews"
                  className="text-[15px] text-gray-700 hover:text-gray-900"
                >
                  후기
                </a>
              </>
            )}
          </nav>

          <div className="flex-1 flex justify-end items-center gap-4">
            {user ? (
              <>
                <div className="flex items-center gap-2 px-4 py-2">
                  <span className="text-[14px] text-gray-700 font-medium">
                    {userName} 님
                  </span>
                </div>
                <Button onClick={handleLogout}>
                  <Icon icon="mdi:logout" className="font-medium" />
                  로그아웃
                </Button>
              </>
            ) : (
              <>
                <button
                  onClick={handleLogin}
                  className="text-[15px] text-gray-700 hover:text-gray-900"
                >
                  로그인
                </button>
                <Button onClick={handleSignup}>회원가입</Button>
              </>
            )}
          </div>
        </div>
      </header>

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        initialMode={authMode}
      />
    </>
  );
}
