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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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

  // 모바일 메뉴 열릴 때 스크롤 방지
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
  }, [mobileMenuOpen]);

  const handleLogin = () => {
    setAuthMode("login");
    setShowAuthModal(true);
    setMobileMenuOpen(false);
  };

  const handleSignup = () => {
    setAuthMode("signup");
    setShowAuthModal(true);
    setMobileMenuOpen(false);
  };

  const handleLogout = async () => {
    try {
      await signOut();
      setUser(null);
      setUserProfile(null);
      setMobileMenuOpen(false);
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
        <div className="max-w-[1400px] mx-auto px-4 md:px-8 py-2 flex items-center">
          <div className="flex-1 md:flex-initial">
            <Link href="/" className="flex items-center gap-2">
              <Image
                src="/logo/logo.svg"
                alt="Teamello"
                width={120}
                height={120}
                className="md:w-[140px]"
              />
            </Link>
          </div>

          <nav className="hidden md:flex items-center gap-12 flex-1 justify-center">
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

          <div className="hidden md:flex flex-1 justify-end items-center gap-4">
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

          {/* 햄버거 메뉴 */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-gray-700"
            aria-label="메뉴"
          >
            <Icon
              icon={mobileMenuOpen ? "mdi:close" : "mdi:menu"}
              className="text-[28px]"
            />
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden fixed inset-0 top-[60px] bg-white z-40 overflow-y-auto">
            <div className="px-4 py-6 space-y-4">
              {user ? (
                <>
                  <div className="pb-4 border-b border-gray-200">
                    <p className="text-[16px] font-bold text-gray-900">
                      {userName} 님
                    </p>
                    <p className="text-[13px] text-gray-600">{user.email}</p>
                  </div>
                  <Link
                    href="/"
                    onClick={() => setMobileMenuOpen(false)}
                    className={`block py-3 text-[16px] ${
                      isHomePage
                        ? "text-[#0056a4] font-medium"
                        : "text-gray-700"
                    }`}
                  >
                    홈
                  </Link>
                  <Link
                    href="/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className={`block py-3 text-[16px] ${
                      pathname === "/dashboard"
                        ? "text-[#0056a4] font-medium"
                        : "text-gray-700"
                    }`}
                  >
                    대시보드
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full py-3 text-left text-[16px] text-red-600"
                  >
                    로그아웃
                  </button>
                </>
              ) : (
                <>
                  <a
                    href="#features"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block py-3 text-[16px] text-gray-700"
                  >
                    기능
                  </a>
                  <a
                    href="#process"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block py-3 text-[16px] text-gray-700"
                  >
                    프로세스
                  </a>
                  <a
                    href="#reviews"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block py-3 text-[16px] text-gray-700"
                  >
                    후기
                  </a>
                  <div className="pt-4 border-t border-gray-200 space-y-3">
                    <button
                      onClick={handleLogin}
                      className="w-full py-3 text-[16px] text-gray-700 border border-gray-200 rounded-lg"
                    >
                      로그인
                    </button>
                    <button
                      onClick={handleSignup}
                      className="w-full py-3 text-[16px] bg-[#0056a4] text-white rounded-lg"
                    >
                      회원가입
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </header>

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        initialMode={authMode}
      />
    </>
  );
}
