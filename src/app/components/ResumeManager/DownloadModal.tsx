import React, { useState, useEffect } from "react";
import { Button } from "../Button";
import { ChevronUpIcon, ChevronDownIcon } from "@heroicons/react/24/outline";
import type { ResumeData } from "lib/redux/types";
import { useLanguageRedux } from "lib/hooks/useLanguageRedux";

interface DownloadModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (orderedIds: string[]) => void;
    resumes: ResumeData[];
    selectedIds: string[];
    isDownloading: boolean;
}

export const DownloadModal: React.FC<DownloadModalProps> = ({
    isOpen,
    onClose,
    onConfirm,
    resumes,
    selectedIds,
    isDownloading,
}) => {
    const { language } = useLanguageRedux();
    const [orderedIds, setOrderedIds] = useState<string[]>([]);

    useEffect(() => {
        if (isOpen) {
            // Initialize with selectedIds, preserving the order if possible or just default
            // We filter resumes to ensure we only have valid IDs
            setOrderedIds(selectedIds);
        }
    }, [isOpen, selectedIds]);

    const t = (key: string) => {
        const translations: Record<string, Record<string, string>> = {
            "adjust-order": { zh: "调整下载顺序", en: "Adjust Download Order" },
            "adjust-order-desc": {
                zh: "请调整简历的合并顺序（第一份在前）：",
                en: "Please adjust the merge order (first one appears first):",
            },
            download: { zh: "下载", en: "Download" },
            cancel: { zh: "取消", en: "Cancel" },
            downloading: { zh: "下载中...", en: "Downloading..." },
        };
        return translations[key]?.[language] || key;
    };

    const moveUp = (index: number) => {
        if (index === 0) return;
        const newOrder = [...orderedIds];
        [newOrder[index - 1], newOrder[index]] = [
            newOrder[index],
            newOrder[index - 1],
        ];
        setOrderedIds(newOrder);
    };

    const moveDown = (index: number) => {
        if (index === orderedIds.length - 1) return;
        const newOrder = [...orderedIds];
        [newOrder[index + 1], newOrder[index]] = [
            newOrder[index],
            newOrder[index + 1],
        ];
        setOrderedIds(newOrder);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black bg-opacity-50">
            <div className="w-full max-w-md rounded-lg bg-white shadow-xl">
                {/* Header */}
                <div className="border-b border-gray-200 px-6 py-4">
                    <h3 className="text-lg font-semibold text-gray-900">
                        {t("adjust-order")}
                    </h3>
                </div>

                {/* Content */}
                <div className="px-6 py-4">
                    <p className="mb-4 text-sm text-gray-600">{t("adjust-order-desc")}</p>
                    <div className="max-h-[60vh] overflow-y-auto rounded-md border border-gray-200">
                        {orderedIds.map((id, index) => {
                            const resume = resumes.find((r) => r.metadata.id === id);
                            if (!resume) return null;
                            return (
                                <div
                                    key={id}
                                    className={`flex items-center justify-between border-b border-gray-100 bg-white p-3 last:border-b-0 hover:bg-gray-50 ${index === 0 ? "bg-blue-50/30" : ""
                                        }`}
                                >
                                    <div className="flex items-center gap-3 overflow-hidden">
                                        <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-gray-100 text-xs font-medium text-gray-500">
                                            {index + 1}
                                        </span>
                                        <span className="truncate font-medium text-gray-700">
                                            {resume.metadata.title}
                                        </span>
                                    </div>
                                    <div className="flex gap-1">
                                        <button
                                            onClick={() => moveUp(index)}
                                            disabled={index === 0}
                                            className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 disabled:opacity-30"
                                            title="Move Up"
                                        >
                                            <ChevronUpIcon className="h-5 w-5" />
                                        </button>
                                        <button
                                            onClick={() => moveDown(index)}
                                            disabled={index === orderedIds.length - 1}
                                            className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 disabled:opacity-30"
                                            title="Move Down"
                                        >
                                            <ChevronDownIcon className="h-5 w-5" />
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Footer */}
                <div className="flex justify-end gap-3 border-t border-gray-200 px-6 py-4">
                    <button
                        onClick={onClose}
                        className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    >
                        {t("cancel")}
                    </button>
                    <button
                        onClick={() => onConfirm(orderedIds)}
                        disabled={isDownloading}
                        className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-70"
                    >
                        {isDownloading ? t("downloading") : t("download")}
                    </button>
                </div>
            </div>
        </div>
    );
};
