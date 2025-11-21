import { Document } from "@react-pdf/renderer";
import { ResumePDFPage } from "./ResumePDFPage";
import type { Settings } from "lib/redux/settingsSlice";
import type { Resume } from "lib/redux/types";
import { SuppressResumePDFErrorMessage } from "components/Resume/ResumePDF/common/SuppressResumePDFErrorMessage";

export const ResumePDF = ({
  resume,
  settings,
  isPDF = false,
}: {
  resume: Resume;
  settings: Settings;
  isPDF?: boolean;
}) => {
  const { profile } = resume;
  const { name } = profile;

  return (
    <>
      <Document title={`${name} Resume`} author={name} producer={"resumetojob"}>
        <ResumePDFPage resume={resume} settings={settings} isPDF={isPDF} />
      </Document>
      <SuppressResumePDFErrorMessage />
    </>
  );
};

