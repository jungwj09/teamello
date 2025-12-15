import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "outline";
  children: React.ReactNode;
}

export function Button({
  variant = "primary",
  children,
  className = "",
  ...props
}: ButtonProps) {
  const baseStyles =
    "font-medium rounded-lg transition-all inline-flex items-center justify-center gap-2 text-[14px] md:text-[15px] min-h-[44px]";

  const variants = {
    primary: "bg-[#0056a4] text-white hover:bg-[#004182] px-4 md:px-6 py-2.5",
    outline:
      "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 px-4 md:px-6 py-2.5",
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
