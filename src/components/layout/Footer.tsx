"use client";
import React from "react";
import Image from "next/image";

export function Footer() {
  return (
    <footer className="bg-[#eaeaea] border-t border-gray-200">
      <div className="max-w-[1400px] mx-auto px-8 py-12">
        <div className="grid grid-cols-4 gap-2 mb-12">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Image
                src="/logo/logo.svg"
                alt="Teamello"
                width={140}
                height={140}
              />
            </div>
            <p className="text-[14px] text-gray-600">
              팀플 갈등 예방 지원 AI 플랫폼
            </p>
          </div>

          <div>
            <h3 className="text-[15px] font-bold text-gray-900 mb-4">제품</h3>
            <ul className="space-y-2">
              <li>
                <a
                  href="#features"
                  className="text-[14px] text-gray-600 hover:text-gray-900"
                >
                  기능
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-[14px] text-gray-600 hover:text-gray-900"
                >
                  가격
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-[14px] text-gray-600 hover:text-gray-900"
                >
                  보안
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-[15px] font-bold text-gray-900 mb-4">회사</h3>
            <ul className="space-y-2">
              <li>
                <a
                  href="#"
                  className="text-[14px] text-gray-600 hover:text-gray-900"
                >
                  블로그
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-[14px] text-gray-600 hover:text-gray-900"
                >
                  문의
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-[14px] text-gray-600 hover:text-gray-900"
                >
                  채용
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-[15px] font-bold text-gray-900 mb-4">법적</h3>
            <ul className="space-y-2">
              <li>
                <a
                  href="#"
                  className="text-[14px] text-gray-600 hover:text-gray-900"
                >
                  이용약관
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-[14px] text-gray-600 hover:text-gray-900"
                >
                  개인정보 보호
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-[14px] text-gray-600 hover:text-gray-900"
                >
                  쿠키
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="text-center text-[13px] text-gray-500 border-t pt-6">
          © {new Date().getFullYear()} Teamello. All rights reserved. <br />
          Making teams mellow, before conflicts begin.
        </div>
      </div>
    </footer>
  );
}
