"use client";
import React from "react";

export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="w-full py-6 bg-white border-t border-[#f0f0f0] shadow text-center flex items-center justify-center">
      <span className="text-gray-700 font-semibold text-sm">
        <span className="text-[#999999]">Copyright © {year}</span> <span className="text-[#000000]">FAEFERhearts</span>. <span className="text-[#999999]">Designed by</span> FSMH Co. <span className="text-[#999999]">All rights reserved</span>
      </span>
    </footer>
  );
} 