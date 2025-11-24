import { createSlice, createSelector, type PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "lib/redux/store";
import { deepClone } from "lib/deep-clone";
import { generateUniqueId } from "lib/utils/string-utils";
import type {
  ResumeData,
  ResumeManagerState,
  ResumeMetadata,
  Resume,
  ResumeProfile,
  ResumeWorkExperience,
  ResumeEducation,
  ResumeProject,
  ResumeSkills,
  FeaturedSkill,
} from "lib/redux/types";
import type { ShowForm } from "lib/redux/settingsSlice";

export const initialProfile: ResumeProfile = {
  name: "",
  summary: [],
  email: "",
  phone: "",
  location: "",
  url: "",
  photoUrl: "",
};

export const initialWorkExperience: ResumeWorkExperience = {
  id: "initial-work-1",
  company: "",
  jobTitle: "",
  date: "",
  descriptions: [],
};

export const initialEducation: ResumeEducation = {
  id: "initial-education-1",
  school: "",
  degree: "",
  gpa: "",
  date: "",
  descriptions: [],
};

export const initialProject: ResumeProject = {
  id: "initial-project-1",
  project: "",
  date: "",
  descriptions: [],
};

export const initialFeaturedSkill: FeaturedSkill = { skill: "", rating: 4 };
export const initialFeaturedSkills: FeaturedSkill[] = Array(6).fill({
  ...initialFeaturedSkill,
});
export const initialSkills: ResumeSkills = {
  featuredSkills: initialFeaturedSkills,
  descriptions: [],
};

export const initialCustom = {
  descriptions: [],
};

export const initialResumeState: Resume = {
  profile: initialProfile,
  workExperiences: [initialWorkExperience],
  educations: [initialEducation],
  projects: [initialProject],
  skills: initialSkills,
  custom: initialCustom,
};

export type CreateChangeActionWithDescriptions<T> = {
  idx: number;
} & (
  | {
      field: Exclude<keyof T, "descriptions">;
      value: string;
    }
  | { field: "descriptions"; value: string[] }
);

const initialState: ResumeManagerState = {
  resumes: [],
  currentResumeId: null,
};

export const resumeManagerSlice = createSlice({
  name: "resumeManager",
  initialState,
  reducers: {
    createResume: (
      state,
      action: PayloadAction<{
        title: string;
      }>,
    ) => {
      const { title } = action.payload;
      const now = new Date().toISOString();

      const newResume: ResumeData = {
        metadata: {
          id: `resume-${Date.now()}`,
          title,
          tags: [],
          createdAt: now,
          updatedAt: now,
        },
        content: initialResumeState,
      };

      state.resumes.push(newResume);
      state.currentResumeId = newResume.metadata.id;
    },

    cloneResume: (
      state,
      action: PayloadAction<{ resumeId: string; title: string }>,
    ) => {
      const { resumeId, title } = action.payload;
      const sourceResume = state.resumes.find(
        (r) => r.metadata.id === resumeId,
      );

      if (sourceResume) {
        const now = new Date().toISOString();
        const newResume: ResumeData = {
          metadata: {
            ...sourceResume.metadata,
            id: `resume-${Date.now()}`,
            title,
            createdAt: now,
            updatedAt: now,
          },
          content: deepClone(sourceResume.content),
        };

        state.resumes.push(newResume);
        state.currentResumeId = newResume.metadata.id;
      }
    },

    deleteResume: (state, action: PayloadAction<string>) => {
      const resumeId = action.payload;
      state.resumes = state.resumes.filter((r) => r.metadata.id !== resumeId);

      if (state.currentResumeId === resumeId) {
        state.currentResumeId =
          state.resumes.length > 0 ? state.resumes[0].metadata.id : null;
      }
    },

    switchResume: (state, action: PayloadAction<string>) => {
      const resumeId = action.payload;
      if (state.resumes.some((r) => r.metadata.id === resumeId)) {
        state.currentResumeId = resumeId;
      }
    },

    updateResumeMetadata: (
      state,
      action: PayloadAction<{ id: string; metadata: Partial<ResumeMetadata> }>,
    ) => {
      const { id, metadata } = action.payload;
      const resume = state.resumes.find((r) => r.metadata.id === id);

      if (resume) {
        resume.metadata = {
          ...resume.metadata,
          ...metadata,
          updatedAt: new Date().toISOString(),
        };
      }
    },

    updateResumeContent: (
      state,
      action: PayloadAction<{ id: string; content: Resume }>,
    ) => {
      const { id, content } = action.payload;
      const resume = state.resumes.find((r) => r.metadata.id === id);

      if (resume) {
        resume.content = content;
        resume.metadata.updatedAt = new Date().toISOString();
      }
    },

    importResumes: (state, action: PayloadAction<ResumeData[]>) => {
      const importedResumes = action.payload;
      importedResumes.forEach((resume) => {
        const existingIds = state.resumes.map((r) => r.metadata.id);
        if (existingIds.includes(resume.metadata.id)) {
          resume.metadata.id = generateUniqueId("resume");
        }
        state.resumes.push(resume);
      });
    },

    setAllResumes: (state, action: PayloadAction<ResumeManagerState>) => {
      return { ...action.payload };
    },

    changeProfile: (
      state,
      action: PayloadAction<{
        resumeId?: string;
        field: keyof ResumeProfile;
        value: string | string[];
      }>,
    ) => {
      const targetId = action.payload.resumeId ?? state.currentResumeId;
      const currentResume = state.resumes.find((r) => r.metadata.id === targetId);
      if (currentResume) {
        const { field, value } = action.payload;
        currentResume.content.profile[field] = value as any;
        currentResume.metadata.updatedAt = new Date().toISOString();
      }
    },

    changeWorkExperiences: (
      state,
      action: PayloadAction<
        { resumeId?: string } & CreateChangeActionWithDescriptions<ResumeWorkExperience>
      >,
    ) => {
      const targetId = action.payload.resumeId ?? state.currentResumeId;
      const currentResume = state.resumes.find((r) => r.metadata.id === targetId);
      if (currentResume) {
        const { idx, field, value } = action.payload;
        const workExperience = currentResume.content.workExperiences[idx];
        workExperience[field] = value as any;
        currentResume.metadata.updatedAt = new Date().toISOString();
      }
    },

    changeEducations: (
      state,
      action: PayloadAction<
        { resumeId?: string } & CreateChangeActionWithDescriptions<ResumeEducation>
      >,
    ) => {
      const targetId = action.payload.resumeId ?? state.currentResumeId;
      const currentResume = state.resumes.find((r) => r.metadata.id === targetId);
      if (currentResume) {
        const { idx, field, value } = action.payload;
        const education = currentResume.content.educations[idx];
        education[field] = value as any;
        currentResume.metadata.updatedAt = new Date().toISOString();
      }
    },

    changeProjects: (
      state,
      action: PayloadAction<
        { resumeId?: string } & CreateChangeActionWithDescriptions<ResumeProject>
      >,
    ) => {
      const targetId = action.payload.resumeId ?? state.currentResumeId;
      const currentResume = state.resumes.find((r) => r.metadata.id === targetId);
      if (currentResume) {
        const { idx, field, value } = action.payload;
        const project = currentResume.content.projects[idx];
        project[field] = value as any;
        currentResume.metadata.updatedAt = new Date().toISOString();
      }
    },

    changeSkills: (
      state,
      action: PayloadAction<
        { resumeId?: string } & (
        | { field: "descriptions"; value: string[] }
        | {
            field: "featuredSkills";
            idx: number;
            skill: string;
            rating: number;
          }
      )>,
    ) => {
      const targetId = action.payload.resumeId ?? state.currentResumeId;
      const currentResume = state.resumes.find((r) => r.metadata.id === targetId);
      if (currentResume) {
        const { field } = action.payload;
        if (field === "descriptions") {
          const { value } = action.payload;
          currentResume.content.skills.descriptions = value;
        } else {
          const { idx, skill, rating } = action.payload;
          const featuredSkill =
            currentResume.content.skills.featuredSkills[idx];
          featuredSkill.skill = skill;
          featuredSkill.rating = rating;
        }
        currentResume.metadata.updatedAt = new Date().toISOString();
      }
    },

    changeCustom: (
      state,
      action: PayloadAction<{ resumeId?: string; field: "descriptions"; value: string[] }>,
    ) => {
      const targetId = action.payload.resumeId ?? state.currentResumeId;
      const currentResume = state.resumes.find((r) => r.metadata.id === targetId);
      if (currentResume) {
        const { value } = action.payload;
        currentResume.content.custom.descriptions = value;
        currentResume.metadata.updatedAt = new Date().toISOString();
      }
    },

    addSectionInForm: (state, action: PayloadAction<{ resumeId?: string; form: ShowForm }>) => {
      const targetId = action.payload.resumeId ?? state.currentResumeId;
      const currentResume = state.resumes.find((r) => r.metadata.id === targetId);
      if (currentResume) {
        const { form } = action.payload;
        switch (form) {
          case "workExperiences": {
            const newWorkExperience = structuredClone(initialWorkExperience);
            newWorkExperience.id = generateUniqueId();
            currentResume.content.workExperiences.push(newWorkExperience);
            break;
          }
          case "educations": {
            const newEducation = structuredClone(initialEducation);
            newEducation.id = generateUniqueId();
            currentResume.content.educations.push(newEducation);
            break;
          }
          case "projects": {
            const newProject = structuredClone(initialProject);
            newProject.id = generateUniqueId();
            currentResume.content.projects.push(newProject);
            break;
          }
        }
        currentResume.metadata.updatedAt = new Date().toISOString();
      }
    },

    moveSectionInForm: (
      state,
      action: PayloadAction<{
        resumeId?: string;
        form: ShowForm;
        idx: number;
        direction: "up" | "down";
      }>,
    ) => {
      const targetId = action.payload.resumeId ?? state.currentResumeId;
      const currentResume = state.resumes.find((r) => r.metadata.id === targetId);
      if (currentResume) {
        const { form, idx, direction } = action.payload;
        if (form !== "skills" && form !== "custom") {
          const sections = currentResume.content[form];
          if (
            (idx === 0 && direction === "up") ||
            (idx === sections.length - 1 && direction === "down")
          ) {
            return;
          }

          const section = sections[idx];
          if (direction === "up") {
            sections[idx] = sections[idx - 1];
            sections[idx - 1] = section;
          } else {
            sections[idx] = sections[idx + 1];
            sections[idx + 1] = section;
          }
          currentResume.metadata.updatedAt = new Date().toISOString();
        }
      }
    },

    deleteSectionInFormByIdx: (
      state,
      action: PayloadAction<{ resumeId?: string; form: ShowForm; idx: number }>,
    ) => {
      const targetId = action.payload.resumeId ?? state.currentResumeId;
      const currentResume = state.resumes.find((r) => r.metadata.id === targetId);
      if (currentResume) {
        const { form, idx } = action.payload;
        if (form !== "skills" && form !== "custom") {
          currentResume.content[form].splice(idx, 1);
          currentResume.metadata.updatedAt = new Date().toISOString();
        }
      }
    },

    setResume: (state, action: PayloadAction<{ resumeId?: string; content: Resume }>) => {
      const targetId = action.payload.resumeId ?? state.currentResumeId;
      const currentResume = state.resumes.find((r) => r.metadata.id === targetId);
      if (currentResume) {
        currentResume.content = action.payload.content;
        currentResume.metadata.updatedAt = new Date().toISOString();
      }
    },

    // Per-resume section heading update so that different resumes
    // (for example Chinese / English versions) can have independent
    // section titles without affecting others.
    changeFormHeadingForResume: (
      state,
      action: PayloadAction<{
        resumeId?: string;
        form: ShowForm;
        heading: string;
      }>,
    ) => {
      const targetId = action.payload.resumeId ?? state.currentResumeId;
      if (!targetId) return;
      const currentResume = state.resumes.find((r) => r.metadata.id === targetId);
      if (!currentResume) return;

      if (!currentResume.content.formHeadings) {
        currentResume.content.formHeadings = {};
      }

      currentResume.content.formHeadings[action.payload.form] =
        action.payload.heading;
      currentResume.metadata.updatedAt = new Date().toISOString();
    },
  },
});

export const {
  createResume,
  cloneResume,
  deleteResume,
  switchResume,
  updateResumeMetadata,
  updateResumeContent,
  importResumes,
  setAllResumes,

  changeProfile,
  changeWorkExperiences,
  changeEducations,
  changeProjects,
  changeSkills,
  changeCustom,
  addSectionInForm,
  moveSectionInForm,
  deleteSectionInFormByIdx,
  setResume,
  changeFormHeadingForResume,
} = resumeManagerSlice.actions;

export const selectAllResumes = (state: RootState) =>
  state.resumeManager.resumes;
export const selectCurrentResumeId = (state: RootState) =>
  state.resumeManager.currentResumeId;

export const selectCurrentResume = createSelector(
  [selectAllResumes, selectCurrentResumeId],
  (resumes, currentId) =>
    currentId ? resumes.find((r) => r.metadata.id === currentId) : null
);

export const selectResume = createSelector(
  [selectCurrentResume],
  (currentResume) => (currentResume ? currentResume.content : initialResumeState)
);
// Parameterized selectors for dual-editing
export const selectResumeById = (state: RootState, resumeId?: string | null) => {
  if (!resumeId) return initialResumeState;
  const r = state.resumeManager.resumes.find((x) => x.metadata.id === resumeId);
  return r ? r.content : initialResumeState;
};

export const selectProfileById = (state: RootState, resumeId?: string | null) => {
  if (!resumeId) return initialProfile;
  const r = state.resumeManager.resumes.find((x) => x.metadata.id === resumeId);
  return r ? r.content.profile : initialProfile;
};

export const selectWorkExperiencesById = (state: RootState, resumeId?: string | null) => {
  const r = resumeId
    ? state.resumeManager.resumes.find((x) => x.metadata.id === resumeId)
    : null;
  return r ? r.content.workExperiences : [initialWorkExperience];
};

export const selectEducationsById = (state: RootState, resumeId?: string | null) => {
  const r = resumeId
    ? state.resumeManager.resumes.find((x) => x.metadata.id === resumeId)
    : null;
  return r ? r.content.educations : [initialEducation];
};

export const selectProjectsById = (state: RootState, resumeId?: string | null) => {
  const r = resumeId
    ? state.resumeManager.resumes.find((x) => x.metadata.id === resumeId)
    : null;
  return r ? r.content.projects : [initialProject];
};

export const selectSkillsById = (state: RootState, resumeId?: string | null) => {
  const r = resumeId
    ? state.resumeManager.resumes.find((x) => x.metadata.id === resumeId)
    : null;
  return r ? r.content.skills : initialSkills;
};

export const selectCustomById = (state: RootState, resumeId?: string | null) => {
  const r = resumeId
    ? state.resumeManager.resumes.find((x) => x.metadata.id === resumeId)
    : null;
  return r ? r.content.custom : initialCustom;
};


export const selectProfile = createSelector(
  [selectCurrentResume],
  (currentResume) => (currentResume ? currentResume.content.profile : initialProfile)
);

export const selectWorkExperiences = createSelector(
  [selectCurrentResume],
  (currentResume) =>
    currentResume
      ? currentResume.content.workExperiences
      : [initialWorkExperience]
);

export const selectEducations = createSelector(
  [selectCurrentResume],
  (currentResume) => 
    currentResume ? currentResume.content.educations : [initialEducation]
);

export const selectProjects = createSelector(
  [selectCurrentResume],
  (currentResume) => 
    currentResume ? currentResume.content.projects : [initialProject]
);

export const selectSkills = createSelector(
  [selectCurrentResume],
  (currentResume) => 
    currentResume ? currentResume.content.skills : initialSkills
);

export const selectCustom = createSelector(
  [selectCurrentResume],
  (currentResume) => 
    currentResume ? currentResume.content.custom : initialCustom
);

export default resumeManagerSlice.reducer;



