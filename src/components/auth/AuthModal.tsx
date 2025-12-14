"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { signIn, signUp } from "@/lib/supabase";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Icon } from "@iconify/react";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: "login" | "signup";
}

export function AuthModal({
  isOpen,
  onClose,
  initialMode = "login",
}: AuthModalProps) {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "signup">(initialMode);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
  });

  useEffect(() => {
    setMode(initialMode);
    setError(""); 
  }, [initialMode]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (mode === "signup") {
        if (!formData.name) {
          setError("이름을 입력해주세요");
          setLoading(false);
          return;
        }
        await signUp(formData.email, formData.password, formData.name);
        alert("회원가입이 완료되었습니다. 이메일을 확인해주세요.");
        setMode("login");
      } else {
        await signIn(formData.email, formData.password);
        onClose();
        router.push("/dashboard");
      }
    } catch (err) {
      console.error("Auth error:", err);
      const error = err as { message?: string };
      if (error.message?.includes("Invalid login credentials")) {
        setError("이메일 또는 비밀번호가 올바르지 않습니다");
      } else if (error.message?.includes("Email not confirmed")) {
        setError("이메일 인증이 필요합니다. 이메일을 확인해주세요.");
      } else if (error.message?.includes("User already registered")) {
        setError("이미 가입된 이메일입니다");
      } else {
        setError(error.message || "오류가 발생했습니다");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-[#fafafa] bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={handleOverlayClick}
    >
      <Card className="w-full max-w-md p-8 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <Icon icon="mdi:close" className="text-[24px]" />
        </button>

        <div className="text-center mb-8">
          <h2 className="text-[28px] font-bold mb-2">
            {mode === "login" ? "로그인" : "회원가입"}
          </h2>
          <p className="text-[14px] text-gray-600">
            {mode === "login"
              ? "Teamello에 오신 것을 환영합니다"
              : "새로운 계정을 만들어보세요"}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === "signup" && (
            <div>
              <label className="block text-[14px] font-medium text-gray-900 mb-2">
                이름
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0056a4] text-[15px]"
                placeholder="홍길동"
              />
            </div>
          )}

          <div>
            <label className="block text-[14px] font-medium text-gray-900 mb-2">
              이메일
            </label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0056a4] text-[15px]"
              placeholder="example@email.com"
            />
          </div>

          <div>
            <label className="block text-[14px] font-medium text-gray-900 mb-2">
              비밀번호
            </label>
            <input
              type="password"
              required
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0056a4] text-[15px]"
              placeholder="최소 6자 이상"
              minLength={6}
            />
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-[13px] text-red-700">{error}</p>
            </div>
          )}

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? (
              <>
                <Icon icon="mdi:loading" className="text-xl animate-spin" />
                처리 중...
              </>
            ) : (
              <>
                {mode === "login" ? "로그인" : "회원가입"}
                <Icon icon="mdi:arrow-right" className="text-xl" />
              </>
            )}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => {
              setMode(mode === "login" ? "signup" : "login");
              setError("");
            }}
            className="text-[14px] text-[#0056a4] hover:underline"
          >
            {mode === "login"
              ? "계정이 없으신가요? 회원가입"
              : "이미 계정이 있으신가요? 로그인"}
          </button>
        </div>

        {mode === "signup" && (
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-[12px] text-gray-600 leading-relaxed">
              회원가입 후 이메일 인증이 필요할 수 있습니다.
            </p>
          </div>
        )}
      </Card>
    </div>
  );
}
