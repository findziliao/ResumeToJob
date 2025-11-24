import type { Resume } from "lib/redux/types";
import type { Settings, ShowForm } from "lib/redux/settingsSlice";

export const generateMarkdown = (
  resume: Resume,
  settings: Settings,
  language: string,
): string => {
  const lines: string[] = [];
  const { profile, workExperiences, educations, projects, skills, custom } =
    resume;

  const tMd = (key: string) => {
    const translations: Record<string, Record<string, string>> = {
      contact: { en: "Contact", zh: "联系方式" },
      email: { en: "Email", zh: "邮箱" },
      phone: { en: "Phone", zh: "电话" },
      website: { en: "Website", zh: "网站" },
      location: { en: "Location", zh: "城市" },
      summary: { en: "Summary", zh: "个人简介" },
      work: { en: "Work Experience", zh: "工作经历" },
      education: { en: "Education", zh: "教育经历" },
      projects: { en: "Projects", zh: "项目经历" },
      skills: { en: "Skills", zh: "技能" },
      featuredSkills: { en: "Featured Skills", zh: "核心技能" },
      details: { en: "Details", zh: "补充说明" },
      custom: { en: "Other", zh: "其他" },
      gpa: { en: "GPA", zh: "绩点" },
      date: { en: "Date", zh: "时间" },
    };
    return translations[key]?.[language] || key;
  };

  if (profile?.name) lines.push(`# ${profile.name}`);

  const contact: string[] = [];
  if (profile?.email) contact.push(`- ${tMd("email")}: ${profile.email}`);
  if (profile?.phone) contact.push(`- ${tMd("phone")}: ${profile.phone}`);
  if (profile?.url) contact.push(`- ${tMd("website")}: ${profile.url}`);
  if (profile?.location) {
    contact.push(`- ${tMd("location")}: ${profile.location}`);
  }
  if (settings.showProfileContact && contact.length) {
    lines.push("", `## ${tMd("contact")}`, ...contact);
  }

  if (settings.showProfileSummary && profile?.summary?.length) {
    lines.push("", `## ${tMd("summary")}`);
    profile.summary.forEach((s) => s && lines.push(`- ${s}`));
  }

  const { formsOrder, formToShow, formToHeading } = settings;
  // If this resume has its own headings, prefer those over global settings
  const perResumeHeadings = (resume as any).formHeadings as
    | Record<string, string>
    | undefined;

  const hasContent: Record<ShowForm, boolean> = {
    workExperiences:
      (workExperiences?.length || 0) > 0 &&
      workExperiences.some(
        (exp) =>
          exp.company ||
          exp.jobTitle ||
          exp.date ||
          (exp.descriptions && exp.descriptions.length > 0),
      ),
    educations:
      (educations?.length || 0) > 0 &&
      educations.some(
        (edu) =>
          edu.school ||
          edu.degree ||
          edu.date ||
          edu.gpa ||
          (edu.descriptions && edu.descriptions.length > 0),
      ),
    projects:
      (projects?.length || 0) > 0 &&
      projects.some(
        (proj) =>
          proj.project ||
          proj.date ||
          (proj.descriptions && proj.descriptions.length > 0),
      ),
    skills:
      (skills?.featuredSkills?.some((s) => s.skill) || false) ||
      (skills?.descriptions && skills.descriptions.length > 0) ||
      false,
    custom: (custom?.descriptions && custom.descriptions.length > 0) || false,
  } as Record<ShowForm, boolean>;

  const orderedForms = formsOrder.filter((f) => formToShow[f] && hasContent[f]);
  orderedForms.forEach((form) => {
    const headingLabel =
      (perResumeHeadings && perResumeHeadings[form]) || formToHeading[form];
    lines.push("", `## ${headingLabel}`);
    switch (form) {
      case "workExperiences":
        workExperiences.forEach(({ company, jobTitle, date, descriptions }) => {
          const titleLine = [jobTitle, company].filter(Boolean).join(", ");
          if (titleLine) lines.push(`### ${titleLine}`);
          if (date) lines.push(`_${tMd("date")}: ${date}_`);
          descriptions?.forEach((d) => d && lines.push(`- ${d}`));
        });
        break;
      case "projects":
        projects.forEach(({ project, date, descriptions }) => {
          if (project) lines.push(`### ${project}`);
          if (date) lines.push(`_${tMd("date")}: ${date}_`);
          descriptions?.forEach((d) => d && lines.push(`- ${d}`));
        });
        break;
      case "educations":
        educations.forEach(({ school, degree, date, gpa, descriptions }) => {
          const titleLine = [degree, school].filter(Boolean).join(", ");
          if (titleLine) lines.push(`### ${titleLine}`);
          const meta: string[] = [];
          if (date) meta.push(`${tMd("date")}: ${date}`);
          if (gpa) meta.push(`${tMd("gpa")}: ${gpa}`);
          if (meta.length) lines.push(`_${meta.join(" | ")}_`);
          descriptions?.forEach((d) => d && lines.push(`- ${d}`));
        });
        break;
      case "skills": {
        if (skills.featuredSkills?.length) {
          const featured = skills.featuredSkills
            .filter((s) => s.skill)
            .map((s) =>
              s.rating ? `${s.skill} (${s.rating}/5)` : `${s.skill}`,
            )
            .join(", ");
          if (featured) lines.push(`- ${tMd("featuredSkills")}: ${featured}`);
        }
        skills.descriptions?.forEach((d) => d && lines.push(`- ${d}`));
        break;
      }
      case "custom":
        custom.descriptions.forEach((d) => d && lines.push(`- ${d}`));
        break;
    }
  });

  lines.push("", "\n");
  return lines.join("\n");
};

