"use client";
import { useEffect, useMemo, useState } from "react";
import { useAppSelector } from "lib/redux/hooks";
import { selectAllResumes } from "lib/redux/resumeManagerSlice";
import { ResumeForm } from "components/ResumeForm";
import { ResumeById } from "components/Resume/ById";

export default function ResumeCompare() {
  const allResumes = useAppSelector(selectAllResumes);
  const defaultLeft = allResumes[0]?.metadata.id || "";
  const defaultRight = allResumes[1]?.metadata.id || allResumes[0]?.metadata.id || "";
  const [leftId, setLeftId] = useState<string>(defaultLeft);
  const [rightId, setRightId] = useState<string>(defaultRight);

  useEffect(() => {
    if (!leftId && allResumes[0]) setLeftId(allResumes[0].metadata.id);
    if (!rightId && allResumes[1]) setRightId(allResumes[1].metadata.id);
  }, [allResumes, leftId, rightId]);

  const resumeOptions = useMemo(
    () =>
      allResumes.map((r) => (
        <option key={r.metadata.id} value={r.metadata.id}>
          {r.metadata.title || r.metadata.id}
        </option>
      )),
    [allResumes],
  );

  return (
    <main className="h-full w-full overflow-hidden bg-gray-50">
      <div className="grid h-full grid-cols-1 gap-4 p-2 md:grid-cols-2 md:p-4">
        <section className="flex h-full flex-col gap-3">
          <div className="flex items-center gap-2 rounded-md bg-white p-3 shadow">
            <label className="text-sm text-gray-700">左侧简历</label>
            <select
              className="rounded border border-gray-300 p-1 text-sm"
              value={leftId}
              onChange={(e) => setLeftId(e.target.value)}
            >
              {resumeOptions}
            </select>
          </div>
          {leftId ? (
            <div className="grid h-full grid-rows-2 gap-3">
              <div className="overflow-y-auto rounded-md shadow">
                <ResumeForm resumeId={leftId} />
              </div>
              <div className="overflow-y-auto rounded-md bg-white shadow">
                <ResumeById resumeId={leftId} />
              </div>
            </div>
          ) : (
            <div className="rounded-md bg-white p-6 text-gray-500 shadow">暂无可选简历</div>
          )}
        </section>
        <section className="flex h-full flex-col gap-3">
          <div className="flex items-center gap-2 rounded-md bg-white p-3 shadow">
            <label className="text-sm text-gray-700">右侧简历</label>
            <select
              className="rounded border border-gray-300 p-1 text-sm"
              value={rightId}
              onChange={(e) => setRightId(e.target.value)}
            >
              {resumeOptions}
            </select>
          </div>
          {rightId ? (
            <div className="grid h-full grid-rows-2 gap-3">
              <div className="overflow-y-auto rounded-md shadow">
                <ResumeForm resumeId={rightId} />
              </div>
              <div className="overflow-y-auto rounded-md bg-white shadow">
                <ResumeById resumeId={rightId} />
              </div>
            </div>
          ) : (
            <div className="rounded-md bg-white p-6 text-gray-500 shadow">暂无可选简历</div>
          )}
        </section>
      </div>
    </main>
  );
}

