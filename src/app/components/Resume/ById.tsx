"use client";
import { useState, useMemo, useEffect } from "react";
import { ResumeIframeCSR } from "components/Resume/ResumeIFrame";
import { ResumePDF } from "components/Resume/ResumePDF";
import {
  ResumeControlBarCSR,
  ResumeControlBarBorder,
} from "components/Resume/ResumeControlBar";
import { FlexboxSpacer } from "components/FlexboxSpacer";
import { useAppSelector } from "lib/redux/hooks";
import { selectSettings } from "lib/redux/settingsSlice";
import { DEBUG_RESUME_PDF_FLAG } from "lib/constants";
import {
  useRegisterReactPDFFont,
  useRegisterReactPDFHyphenationCallback,
} from "components/fonts/hooks";
import { NonEnglishFontsCSSLazyLoader } from "components/fonts/NonEnglishFontsCSSLoader";
import { selectResumeById } from "lib/redux/resumeManagerSlice";

export const ResumeById = ({ resumeId }: { resumeId: string }) => {
  const getInitialScale = () => {
    if (typeof window !== "undefined") {
      return window.innerWidth < 768 ? 0.5 : 0.8;
    }
    return 0.8;
  };

  const [scale, setScale] = useState(getInitialScale);

  useEffect(() => {
    const handleResize = () => {
      const newScale = window.innerWidth < 768 ? 0.5 : 0.8;
      setScale(newScale);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const settings = useAppSelector(selectSettings);
  const resume = useAppSelector((state) => selectResumeById(state as any, resumeId));
  const document = useMemo(
    () => <ResumePDF resume={resume} settings={settings} isPDF={true} />,
    [resume, settings],
  );

  useRegisterReactPDFFont();
  useRegisterReactPDFHyphenationCallback(settings.fontFamily);

  return (
    <>
      <NonEnglishFontsCSSLazyLoader />
      <div className="relative flex justify-center md:justify-start">
        <FlexboxSpacer maxWidth={30} className="hidden md:block" />
        <div className="relative">
          <section className="h-[calc(100vh-var(--top-nav-bar-height)-var(--resume-control-bar-height))] overflow-hidden md:p-[var(--resume-padding)]">
            <ResumeIframeCSR documentSize={settings.documentSize} scale={scale} enablePDFViewer={DEBUG_RESUME_PDF_FLAG}>
              <ResumePDF resume={resume} settings={settings} isPDF={DEBUG_RESUME_PDF_FLAG} />
            </ResumeIframeCSR>
          </section>
          <ResumeControlBarCSR
            scale={scale}
            setScale={setScale}
            documentSize={settings.documentSize}
            document={document}
            fileName={(resume.profile.name || "Resume") + " - Resume"}
            resume={resume}
          />
        </div>
        <ResumeControlBarBorder />
      </div>
    </>
  );
};

export default ResumeById;

