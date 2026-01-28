import { useCallback, useEffect, useMemo, useState } from "react";
import {
  type DropEvent,
  type FileError,
  type FileRejection,
  useDropzone,
} from "react-dropzone";

// Custom file extractor that bypasses File System Access API entirely
// This avoids the "NotAllowedError: getFile" error when dragging files in dialogs/modals
async function getFilesFromEvent(
  event: DropEvent,
): Promise<Array<File | DataTransferItem>> {
  // Handle FileSystemFileHandle array (from File System Access API - we still need to handle it)
  if (Array.isArray(event)) {
    return [];
  }

  // Handle input element change events (click to browse)
  if (event.type === "change") {
    const target = (event as React.ChangeEvent<HTMLInputElement>).target;
    if (target.files) {
      return Array.from(target.files);
    }
    return [];
  }

  // Handle drag and drop events
  const dragEvent = event as React.DragEvent<HTMLElement> | DragEvent;
  const dataTransfer = dragEvent.dataTransfer;

  if (!dataTransfer) {
    return [];
  }

  const files: File[] = [];
  if (dataTransfer.files && dataTransfer.files.length > 0) {
    for (let i = 0; i < dataTransfer.files.length; i++) {
      const file = dataTransfer.files[i];
      if (file) {
        files.push(file);
      }
    }
  }

  return files;
}

interface FileWithPreview extends File {
  preview?: string;
  errors: readonly FileError[];
}

type UseDocumentUploadRpcOptions = {
  /**
   * Document category ID (required for RPC)
   */
  documentCategoryId: number | null;
  /**
   * Deal ID for deal-linked documents (optional)
   */
  dealId?: number | null;
  /**
   * Subject type for pre-deal documents (optional)
   */
  subjectType?: "borrower" | "guarantor" | null;
  /**
   * Subject ID for pre-deal documents (optional)
   */
  subjectId?: number | null;
  /**
   * Allowed MIME types for each file upload
   */
  allowedMimeTypes?: string[];
  /**
   * Maximum upload size of each file allowed in bytes
   */
  maxFileSize?: number;
  /**
   * Maximum number of files allowed per upload
   */
  maxFiles?: number;
};

type UseDocumentUploadRpcReturn = ReturnType<typeof useDocumentUploadRpc>;

const useDocumentUploadRpc = (options: UseDocumentUploadRpcOptions) => {
  const {
    documentCategoryId,
    dealId,
    subjectType,
    subjectId,
    allowedMimeTypes = [],
    maxFileSize = Number.POSITIVE_INFINITY,
    maxFiles = 1,
  } = options;

  const [files, setFiles] = useState<FileWithPreview[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [errors, setErrors] = useState<{ name: string; message: string }[]>([]);
  const [successes, setSuccesses] = useState<string[]>([]);

  const isSuccess = useMemo(() => {
    if (errors.length === 0 && successes.length === 0) {
      return false;
    }
    if (errors.length === 0 && successes.length === files.length) {
      return true;
    }
    return false;
  }, [errors.length, successes.length, files.length]);

  const onDrop = useCallback(
    (acceptedFiles: File[], fileRejections: FileRejection[]) => {
      const validFiles = acceptedFiles
        .filter((file) => !files.find((x) => x.name === file.name))
        .map((file) => {
          (file as FileWithPreview).preview = URL.createObjectURL(file);
          (file as FileWithPreview).errors = [];
          return file as FileWithPreview;
        });

      const invalidFiles = fileRejections.map(({ file, errors }) => {
        (file as FileWithPreview).preview = URL.createObjectURL(file);
        (file as FileWithPreview).errors = errors;
        return file as FileWithPreview;
      });

      const newFiles = [...files, ...validFiles, ...invalidFiles];
      setFiles(newFiles);
    },
    [files, setFiles],
  );

  const dropzoneProps = useDropzone({
    onDrop,
    noClick: true,
    useFsAccessApi: false,
    getFilesFromEvent,
    noDragEventsBubbling: true,
    accept: allowedMimeTypes.reduce(
      (acc, type) => ({ ...acc, [type]: [] }),
      {},
    ),
    maxSize: maxFileSize,
    maxFiles: maxFiles,
    multiple: maxFiles !== 1,
  });

  const onUpload = useCallback(async () => {
    if (!documentCategoryId) {
      setErrors([{ name: "all", message: "Document category is required" }]);
      return;
    }

    setLoading(true);

    // Support handling partial successes
    const filesWithErrors = errors.map((x) => x.name);
    const filesToUpload =
      filesWithErrors.length > 0
        ? [
            ...files.filter((f) => filesWithErrors.includes(f.name)),
            ...files.filter((f) => !successes.includes(f.name)),
          ]
        : files;

    // Deduplicate files by name
    const uniqueFiles = filesToUpload.filter(
      (file, index, self) =>
        index === self.findIndex((f) => f.name === file.name),
    );

    const responses: { name: string; message: string | undefined }[] = [];

    // Upload files sequentially
    for (const file of uniqueFiles) {
      try {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("documentName", file.name);
        formData.append("documentCategoryId", String(documentCategoryId));

        if (dealId) {
          formData.append("dealId", String(dealId));
        }
        if (subjectType) {
          formData.append("subjectType", subjectType);
        }
        if (subjectId) {
          formData.append("subjectId", String(subjectId));
        }

        const response = await fetch("/api/storage/upload-rpc", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          const errorData = await response.json();
          responses.push({
            name: file.name,
            message: errorData.error || "Upload failed",
          });
        } else {
          responses.push({ name: file.name, message: undefined });
        }
      } catch (error) {
        responses.push({
          name: file.name,
          message: error instanceof Error ? error.message : "Upload failed",
        });
      }
    }

    const responseErrors = responses.filter(
      (x): x is { name: string; message: string } => x.message !== undefined,
    );
    setErrors(responseErrors);

    const responseSuccesses = responses.filter((x) => x.message === undefined);
    const newSuccesses = Array.from(
      new Set([...successes, ...responseSuccesses.map((x) => x.name)]),
    );
    setSuccesses(newSuccesses);

    setLoading(false);
  }, [
    files,
    documentCategoryId,
    dealId,
    subjectType,
    subjectId,
    errors,
    successes,
  ]);

  useEffect(() => {
    if (files.length === 0) {
      setErrors([]);
    }

    // If the number of files doesn't exceed maxFiles, remove the 'Too many files' error
    if (files.length <= maxFiles) {
      let changed = false;
      const newFiles = files.map((file) => {
        if (file.errors.some((e) => e.code === "too-many-files")) {
          file.errors = file.errors.filter((e) => e.code !== "too-many-files");
          changed = true;
        }
        return file;
      });
      if (changed) {
        setFiles(newFiles);
      }
    }
  }, [files.length, setFiles, maxFiles, files]);

  useEffect(() => {
    // Clean up resources when component unmounts
    return () => {
      files.forEach((file) => {
        if (file.preview) {
          URL.revokeObjectURL(file.preview);
        }
      });
    };
  }, [files]);

  return {
    files,
    setFiles,
    successes,
    isSuccess,
    loading,
    errors,
    setErrors,
    onUpload,
    maxFileSize: maxFileSize,
    maxFiles: maxFiles,
    allowedMimeTypes,
    ...dropzoneProps,
  };
};

export {
  useDocumentUploadRpc,
  type UseDocumentUploadRpcOptions,
  type UseDocumentUploadRpcReturn,
};
