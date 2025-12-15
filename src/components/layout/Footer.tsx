"use client";
import React from "react";
import Image from "next/image";

export function Footer() {
  return (
    <footer className="bg-[#eaeaea] border-t border-gray-200">
      <div className="max-w-[1400px] mx-auto px-4 md:px-8 py-8 md:py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-2 mb-8 md:mb-12">
          <div className="col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <Image
                src="/logo/logo.svg"
                alt="Teamello"
                width={120}
                height={120}
                className="md:w-[140px]"
              />
            </div>
            <p className="text-[14px] text-gray-600">
              팀플 갈등 예방 지원 AI 플랫폼
            </p>
          </div>

          <div className="col-span-1">
            <h3 className="text-[15px] font-bold text-gray-900 mb-3 md:mb-4">
              제품
            </h3>
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

          <div className="col-span-1">
            <h3 className="text-[15px] font-bold text-gray-900 mb-3 md:mb-4">
              회사
            </h3>
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

          <div className="col-span-1">
            <h3 className="text-[15px] font-bold text-gray-900 mb-3 md:mb-4">
              법적
            </h3>
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
          © {new Date().getFullYear()} Teamello. All rights reserved.
          <br className="md:hidden" />
          <span className="hidden md:inline"> </span>
          Making teams mellow, before conflicts begin.
        </div>
      </div>
    </footer>
  );
}
