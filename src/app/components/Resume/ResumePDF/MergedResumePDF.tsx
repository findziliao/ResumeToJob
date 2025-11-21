import { Document } from "@react-pdf/renderer";
import { ResumePDFPage } from "./ResumePDFPage";
import type { Settings } from "lib/redux/settingsSlice";
import type { Resume } from "lib/redux/types";
import { SuppressResumePDFErrorMessage } from "components/Resume/ResumePDF/common/SuppressResumePDFErrorMessage";

export const MergedResumePDF = ({
    resumes,
    settings,
    isPDF = false,
}: {
    resumes: Resume[];
    settings: Settings;
    isPDF?: boolean;
}) => {
    return (
        <>
            <Document title="Merged Resumes" producer={"resumetojob"}>
                {resumes.map((resume, index) => (
                    <ResumePDFPage
                        key={index}
                        resume={resume}
                        settings={settings}
                        isPDF={isPDF}
                    />
                ))}
            </Document>
            <SuppressResumePDFErrorMessage />
        </>
    );
};
