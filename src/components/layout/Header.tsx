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

  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? "hidden" : "unset";
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
        <div className="max-w-[1400px] mx-auto px-4 md:px-8 h-16 md:h-20 flex items-center justify-between">
          <div className="flex-shrink-0">
            <Link href="/" className="flex items-center">
              <Image
                src="/logo/logo.svg"
                alt="Teamello"
                width={100}
                height={32}
                className="w-[100px] md:w-[120px]"
              />
            </Link>
          </div>

          <nav className="hidden md:flex items-center gap-8 lg:gap-12 absolute left-1/2 -translate-x-1/2">
            {user ? (
              <>
                <Link
                  href="/"
                  className={`text-[15px] whitespace-nowrap ${
                    isHomePage
                      ? "text-[#0056a4] font-medium"
                      : "text-gray-700 hover:text-gray-900"
                  }`}
                >
                  홈
                </Link>
                <Link
                  href="/dashboard"
                  className={`text-[15px] whitespace-nowrap ${
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
                  className="text-[15px] text-gray-700 hover:text-gray-900 whitespace-nowrap"
                >
                  기능
                </a>
                <a
                  href="#process"
                  className="text-[15px] text-gray-700 hover:text-gray-900 whitespace-nowrap"
                >
                  프로세스
                </a>
                <a
                  href="#reviews"
                  className="text-[15px] text-gray-700 hover:text-gray-900 whitespace-nowrap"
                >
                  후기
                </a>
              </>
            )}
          </nav>

          <div className="hidden md:flex items-center gap-3 flex-shrink-0">
            {user ? (
              <>
                <span className="text-[14px] text-gray-700 font-medium mr-2">
                  {userName} 님
                </span>
                <Button onClick={handleLogout} variant="outline">
                  <Icon icon="mdi:logout" className="text-lg" />
                  로그아웃
                </Button>
              </>
            ) : (
              <>
                <Button onClick={handleLogin} variant="outline">
                  로그인
                </Button>
                <Button onClick={handleSignup}>회원가입</Button>
              </>
            )}
          </div>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-gray-700 flex-shrink-0"
            aria-label="메뉴"
          >
            <Icon
              icon={mobileMenuOpen ? "mdi:close" : "mdi:menu"}
              className="text-[28px]"
            />
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden fixed inset-0 top-16 bg-white z-40 overflow-y-auto">
            <div className="px-4 py-6 space-y-4">
              {user ? (
                <>
                  <div className="pb-4 border-b border-gray-200">
                    <p className="text-[16px] font-bold text-gray-900">
                      {userName} 님
                    </p>
                    <p className="text-[13px] text-gray-600">{user?.email}</p>
                  </div>
                  <Link
                    href="/"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block py-3 text-[16px]"
                  >
                    홈
                  </Link>
                  <Link
                    href="/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block py-3 text-[16px]"
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