"use client";

import { useEffect } from "react";

const FontsZh = () => {
  useEffect(() => {
    const id = "fonts-zh-stylesheet";
    if (document.getElementById(id)) return;
    const link = document.createElement("link");
    link.id = id;
    link.rel = "stylesheet";
    link.href = "/fonts/fonts-zh.css";
    document.head.appendChild(link);
  }, []);
  return null;
};

export default FontsZh;
