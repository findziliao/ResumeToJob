"use client";
import { useEffect } from "react";
import { useSetDefaultScale } from "components/Resume/hooks";
import { MagnifyingGlassIcon, ArrowDownTrayIcon } from "@heroicons/react/24/outline";
import { usePDF } from "@react-pdf/renderer";
import dynamic from "next/dynamic";
import { useLanguageRedux } from "../../lib/hooks/useLanguageRedux";
import type { Resume } from "../../lib/redux/types";

const ResumeControlBar = ({
  scale,
  setScale,
  documentSize,
  document,
  fileName,
  resume,
  showToolbar = true,
}: {
  scale: number;
  setScale: (scale: number) => void;
  documentSize: string;
  document: JSX.Element;
  fileName: string;
  resume: Resume;
  showToolbar?: boolean;
}) => {
  const { scaleOnResize, setScaleOnResize } = useSetDefaultScale({
    setScale,
    documentSize,
  });
  const { language } = useLanguageRedux();

  const translate = (key: string) => {
    const translations: Record<string, Record<string, string>> = {
      autoscale: { en: "Autoscale", zh: "\u81EA\u52A8\u7F29\u653E" },
      download: { en: "Download Resume", zh: "\u4E0B\u8F7D\u7B80\u5386" },
    };
    return translations[key]?.[language] || key;
  };

  const [instance, update] = usePDF({ document });

  // i18n for Markdown headings
  const tMd = (key: string) => {
    const translations: Record<string, Record<string, string>> = {
      contact: { en: "Contact", zh: "\u8054\u7CFB\u65B9\u5F0F" },
      email: { en: "Email", zh: "\u90AE\u7BB1" },
      phone: { en: "Phone", zh: "\u7535\u8BDD" },
      website: { en: "Website", zh: "\u7F51\u7AD9" },
      location: { en: "Location", zh: "\u57CE\u5E02" },
      summary: { en: "Summary", zh: "\u4E2A\u4EBA\u7B80\u4ECB" },
      work: { en: "Work Experience", zh: "\u5DE5\u4F5C\u7ECF\u5386" },
      education: { en: "Education", zh: "\u6559\u80B2\u7ECF\u5386" },
      projects: { en: "Projects", zh: "\u9879\u76EE\u7ECF\u5386" },
      skills: { en: "Skills", zh: "\u6280\u80FD" },
      featuredSkills: { en: "Featured Skills", zh: "\u6838\u5FC3\u6280\u80FD" },
      details: { en: "Details", zh: "\u8865\u5145\u8BF4\u660E" },
      custom: { en: "Other", zh: "\u5176\u4ED6" },
      gpa: { en: "GPA", zh: "\u7EE9\u70B9" },
      date: { en: "Date", zh: "\u65F6\u95F4" },
    };
    return translations[key]?.[language] || key;
  };

  useEffect(() => {
    update(document);
  }, [update, document]);

  const generateMarkdown = () => {
    const lines: string[] = [];
    const { profile, workExperiences, educations, projects, skills, custom } = resume;

    if (profile?.name) lines.push(`# ${profile.name}`);

    const contact: string[] = [];
    if (profile?.email) contact.push(`- ${tMd("email")}: ${profile.email}`);
    if (profile?.phone) contact.push(`- ${tMd("phone")}: ${profile.phone}`);
    if (profile?.url) contact.push(`- ${tMd("website")}: ${profile.url}`);
    if (profile?.location) contact.push(`- ${tMd("location")}: ${profile.location}`);
    if (contact.length) lines.push("", `## ${tMd("contact")}`, ...contact);

    if (profile?.summary?.length) {
      lines.push("", `## ${tMd("summary")}`);
      profile.summary.forEach((s) => s && lines.push(`- ${s}`));
    }

    if (workExperiences?.length) {
      lines.push("", `## ${tMd("work")}`);
      workExperiences.forEach(({ company, jobTitle, date, descriptions }) => {
        const titleLine = [jobTitle, company].filter(Boolean).join(", ");
        if (titleLine) lines.push(`### ${titleLine}`);
        if (date) lines.push(`_${tMd("date")}: ${date}_`);
        descriptions?.forEach((d) => d && lines.push(`- ${d}`));
      });
    }

    if (projects?.length) {
      lines.push("", `## ${tMd("projects")}`);
      projects.forEach(({ project, date, descriptions }) => {
        if (project) lines.push(`### ${project}`);
        if (date) lines.push(`_${tMd("date")}: ${date}_`);
        descriptions?.forEach((d) => d && lines.push(`- ${d}`));
      });
    }

    if (educations?.length) {
      lines.push("", `## ${tMd("education")}`);
      educations.forEach(({ school, degree, date, gpa, descriptions }) => {
        const titleLine = [degree, school].filter(Boolean).join(", ");
        if (titleLine) lines.push(`### ${titleLine}`);
        const meta: string[] = [];
        if (date) meta.push(`${tMd("date")}: ${date}`);
        if (gpa) meta.push(`${tMd("gpa")}: ${gpa}`);
        if (meta.length) lines.push(`_${meta.join(" | ")}_`);
        descriptions?.forEach((d) => d && lines.push(`- ${d}`));
      });
    }

    if ((skills?.featuredSkills?.length || 0) > 0 || (skills?.descriptions?.length || 0) > 0) {
      lines.push("", `## ${tMd("skills")}`);
      if (skills.featuredSkills?.length) {
        const featured = skills.featuredSkills
          .filter((s) => s.skill)
          .map((s) => (s.rating ? `${s.skill} (${s.rating}/5)` : `${s.skill}`))
          .join(", ");
        if (featured) lines.push(`- ${tMd("featuredSkills")}: ${featured}`);
      }
      skills.descriptions?.forEach((d) => d && lines.push(`- ${d}`));
    }

    if (custom?.descriptions?.length) {
      lines.push("", `## ${tMd("custom")}`);
      custom.descriptions.forEach((d) => d && lines.push(`- ${d}`));
    }

    lines.push("", "\n");
    return lines.join("\n");
  };

  const downloadMarkdown = () => {
    try {
      const md = generateMarkdown();
      const blob = new Blob([md], { type: "text/markdown;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = window.document.createElement("a");
      a.href = url;
      a.download = `${fileName}.md`;
      window.document.body.appendChild(a);
      a.click();
      window.document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error("Markdown generation failed", e);
    }
  };

  if (!showToolbar) return null;

  return (
    <div className="sticky bottom-0 left-0 right-0 flex h-[var(--resume-control-bar-height)] items-center justify-center px-[var(--resume-padding)] text-gray-600 lg:justify-between">
      <div className="flex items-center gap-2">
        <MagnifyingGlassIcon className="h-5 w-5" aria-hidden="true" />
        <input
          type="range"
          min={0.5}
          max={1.5}
          step={0.01}
          value={scale}
          onChange={(e) => {
            setScaleOnResize(false);
            setScale(Number(e.target.value));
          }}
        />
        <div className="w-10">{`${Math.round(scale * 100)}%`}</div>
        <label className="hidden items-center gap-1 lg:flex">
          <input
            type="checkbox"
            className="mt-0.5 h-4 w-4"
            checked={scaleOnResize}
            onChange={() => setScaleOnResize((prev) => !prev)}
          />{" "}
          <span className="select-none">{translate("autoscale")}</span>
        </label>
      </div>
      <a
        className="ml-1 flex items-center gap-1 rounded-md border border-gray-300 px-3 py-0.5 hover:bg-gray-100 lg:ml-8"
        href={instance.url!}
        download={fileName}
        onClick={downloadMarkdown}
      >
        <ArrowDownTrayIcon className="h-4 w-4" />
        <span className="whitespace-nowrap">{translate("download")}</span>
      </a>
    </div>
  );
};

export const ResumeControlBarCSR = dynamic(() => Promise.resolve(ResumeControlBar), { ssr: false });

export const ResumeControlBarBorder = () => (
  <div className="absolute bottom-[var(--resume-control-bar-height)] w-full border-t-2 bg-gray-50" />
);

export default ResumeControlBar;

