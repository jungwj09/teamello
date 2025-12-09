"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Button } from "../ui/Button";
import { AuthModal } from "../auth/AuthModal";
import { supabase, getCurrentUser, signOut } from "@/lib/supabase";

interface User {
  id: string;
  email?: string;
}

export function Header() {
  const router = useRouter();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "signup">("login");
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    getCurrentUser().then((currentUser) => {
      setUser(currentUser);
    });

    // Auth state 변화 감지
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
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
      router.push("/");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <>
      <header className="bg-[#dee7f6] border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-[1400px] mx-auto px-8 py-4 flex items-center">
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
          </nav>

          <div className="flex-1 flex justify-end items-center gap-12">
            {user ? (
              <>
                <Link
                  href="/dashboard"
                  className="text-[15px] text-gray-700 hover:text-gray-900"
                >
                  대시보드
                </Link>
                <button
                  onClick={handleLogout}
                  className="text-[15px] text-gray-700 hover:text-gray-900"
                >
                  로그아웃
                </button>
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
