"use client";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { useState } from "react";
import logoSrc from "public/logo-500.png";
import { cx } from "lib/cx";
import { useLanguageRedux } from "../lib/hooks/useLanguageRedux";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { DismissibleBanner } from "./DismissibleBanner";
import { clearLocalStorage } from "../lib/redux/local-storage";
import { ConfirmModal } from "./ConfirmModal";

export const TopNavBar = () => {
  const pathName = usePathname();
  const isHomePage = pathName === "/";
  const { language } = useLanguageRedux();
  const [menuOpen, setMenuOpen] = useState(false);
  const [bugReportModalOpen, setBugReportModalOpen] = useState(false);
  const [resetDefaultModalOpen, setResetDefaultModalOpen] = useState(false);

  const translate = (key: string) => {
    const translations: Record<string, Record<string, string>> = {
      build: { en: "Create Resume", zh: "\u521B\u5EFA\u7B80\u5386" },
      compare: { en: "Compare & Edit", zh: "\u5BF9\u7167\u7F16\u8F91" },
      menu: { en: "Menu", zh: "\u83DC\u5355" },
      bugReport: { en: "Bug Report", zh: "\u53CD\u9988\u95EE\u9898" },
      resetDefault: { en: "Reset Default", zh: "\u6062\u590D\u9ED8\u8BA4" },
      bugReportTitle: { en: "Bug Report", zh: "\u53CD\u9988\u95EE\u9898" },
      bugReportMessage: {
        en: "If you find bugs or things you think are not good, please report issues in GitHub Issues.\n\nClick OK to jump to the GitHub Issues page.",
        zh: "\u5982\u679C\u53D1\u73B0 bug \u6216\u8005\u4F60\u8BA4\u4E3A\u4E0D\u597D\u7684\u5730\u65B9\uFF0C\u8BF7\u5728 GitHub Issues \u4E2D\u53CD\u9988\u95EE\u9898\u3002\n\n\u70B9\u51FB\u786E\u5B9A\u5C06\u8DF3\u8F6C\u5230 GitHub Issues \u9875\u9762\u3002",
      },
      resetDefaultTitle: { en: "Reset Default", zh: "\u6062\u590D\u9ED8\u8BA4" },
      resetDefaultMessage: {
        en: "Are you sure you want to reset to default? This will delete all information, please make a backup.\n\nClick OK to clear all data and refresh the page.",
        zh: "\u662F\u5426\u8981\u6062\u590D\u9ED8\u8BA4\uFF0C\u4F1A\u5220\u9664\u6240\u6709\u4FE1\u606F\uFF0C\u8BF7\u505A\u597D\u5907\u4EFD\u3002\n\n\u70B9\u51FB\u786E\u5B9A\u540E\u5C06\u6E05\u9664\u6240\u6709\u6570\u636E\u5E76\u5237\u65B0\u7F51\u9875\u3002",
      },
      confirm: { en: "OK", zh: "\u786E\u5B9A" },
      cancel: { en: "Cancel", zh: "\u53D6\u6D88" },
    };
    return translations[key]?.[language] || key;
  };

  const handleBugReportClick = () => setBugReportModalOpen(true);
  const handleBugReportConfirm = () => {
    setBugReportModalOpen(false);
    window.open("https://github.com/ltlylfun/ResumeToJob/issues", "_blank");
  };

  const handleResetDefaultClick = () => setResetDefaultModalOpen(true);
  const handleResetDefaultConfirm = () => {
    setResetDefaultModalOpen(false);
    try {
      clearLocalStorage();
    } catch {
      localStorage.clear();
    }
    window.location.reload();
  };

  const closeMenu = () => setMenuOpen(false);

  return (
    <>
      <DismissibleBanner />
      <header
        aria-label="Site Header"
        className={cx(
          "flex h-[var(--top-nav-bar-height)] items-center border-b-2 border-gray-100 px-3 lg:px-12",
          isHomePage && "bg-dot",
        )}
      >
        <div className="flex h-10 w-full items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="sr-only">ResumeToJob</span>
            <img src={logoSrc.src} alt="Logo" className="h-8 w-auto" />
            <span className="text-lg font-semibold text-gray-800">ResumeToJob</span>
          </Link>

          <nav aria-label="Site Nav Bar" className="hidden items-center gap-2 text-sm font-medium md:flex">
            <button
              onClick={handleBugReportClick}
              className="rounded-md px-1.5 py-2 text-gray-500 hover:bg-gray-100 focus-visible:bg-gray-100 lg:px-4"
            >
              {translate("bugReport")}
            </button>
            <button
              onClick={handleResetDefaultClick}
              className="rounded-md px-1.5 py-2 text-red-500 hover:bg-red-50 focus-visible:bg-red-50 lg:px-4"
            >
              {translate("resetDefault")}
            </button>
            {[
              ["/resume-builder", translate("build")],
              ["/resume-compare", translate("compare")],
            ].map(([href, text]) => (
              <Link
                key={text}
                className="rounded-md px-1.5 py-2 text-gray-500 hover:bg-gray-100 focus-visible:bg-gray-100 lg:px-4"
                href={href as string}
              >
                {text}
              </Link>
            ))}
            <LanguageSwitcher />
            <div className="ml-1 mt-1 hidden sm:block">
              <iframe
                src="https://ghbtns.com/github-btn.html?user=ltlylfun&repo=ResumeToJob&type=star&count=true"
                width="100"
                height="20"
                className="overflow-hidden border-none"
                title="GitHub"
              />
            </div>
          </nav>

          <button
            className="rounded-md p-2 hover:bg-gray-100 md:hidden"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="h-6 w-6 text-gray-600">
              {menuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>

          {menuOpen && (
            <div className="absolute left-0 right-0 top-[var(--top-nav-bar-height)] z-50 bg-white shadow-lg md:hidden">
              <div className="flex flex-col py-2">
                <button
                  onClick={() => {
                    handleBugReportClick();
                    closeMenu();
                  }}
                  className="px-4 py-3 text-left text-gray-700 hover:bg-gray-100"
                >
                  {translate("bugReport")}
                </button>
                <button
                  onClick={() => {
                    handleResetDefaultClick();
                    closeMenu();
                  }}
                  className="px-4 py-3 text-left text-red-600 hover:bg-red-50"
                >
                  {translate("resetDefault")}
                </button>
                {[
                  ["/resume-builder", translate("build")],
                  ["/resume-compare", translate("compare")],
                ].map(([href, text]) => (
                  <Link
                    key={text}
                    onClick={closeMenu}
                    className="px-4 py-3 text-gray-700 hover:bg-gray-100"
                    href={href as string}
                  >
                    {text}
                  </Link>
                ))}
                <div className="flex items-center justify-between px-4 py-3">
                  <span className="text-gray-700">语言/Language</span>
                  <LanguageSwitcher />
                </div>
              </div>
            </div>
          )}
        </div>
      </header>

      <ConfirmModal
        isOpen={bugReportModalOpen}
        onClose={() => setBugReportModalOpen(false)}
        onConfirm={handleBugReportConfirm}
        title={translate("bugReportTitle")}
        message={translate("bugReportMessage")}
        confirmText={translate("confirm")}
        cancelText={translate("cancel")}
      />

      <ConfirmModal
        isOpen={resetDefaultModalOpen}
        onClose={() => setResetDefaultModalOpen(false)}
        onConfirm={handleResetDefaultConfirm}
        title={translate("resetDefaultTitle")}
        message={translate("resetDefaultMessage")}
        confirmText={translate("confirm")}
        cancelText={translate("cancel")}
        confirmButtonClass="bg-red-600 hover:bg-red-700 text-white"
      />
    </>
  );
};

export default TopNavBar;

