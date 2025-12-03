"use client";

import {
  Dropzone,
  DropzoneContent,
  DropzoneEmptyState,
} from "@/components/ui/forms/supabase-dropzone";
import { useSupabaseUpload } from "@/hooks/use-supabase-upload";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button,
} from "@/components/ui";
import { useState, useRef } from "react";
import { Upload, FileText } from "lucide-react";
import { type FileError } from "react-dropzone";

// Component implementations using official Supabase Dropzone
function DocumentsUpload({
  onUploadComplete,
}: {
  onUploadComplete: (files: string[]) => void;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const props = useSupabaseUpload({
    bucketName: "document_upload",
    path: "test-uploads",
    allowedMimeTypes: ["application/pdf", "image/*", "text/*"],
    maxFiles: 3,
    maxFileSize: 10 * 1024 * 1024, // 10MB
  });

  // Handle upload completion
  if (props.isSuccess && props.successes.length > 0) {
    onUploadComplete(props.successes);
  }

  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length > 0) {
      // Create file objects with preview and errors properties
      const fileObjects = files.map((file) => {
        const fileWithPreview = file as File & {
          preview: string;
          errors: FileError[];
        };
        fileWithPreview.preview = URL.createObjectURL(file);
        fileWithPreview.errors = [];
        return fileWithPreview;
      });

      props.setFiles([...props.files, ...fileObjects]);
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Document Upload Bucket</CardTitle>
        <Button onClick={handleFileSelect} size="sm">
          <Upload className="h-4 w-4 mr-2" />
          Select Files
        </Button>
      </CardHeader>
      <CardContent>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={props.allowedMimeTypes?.join(",")}
          onChange={handleFileChange}
          className="hidden"
          aria-label="Select files to upload to document bucket"
        />
        <div className="w-full">
          <Dropzone {...props}>
            <DropzoneEmptyState />
            <DropzoneContent />
          </Dropzone>
        </div>
      </CardContent>
    </Card>
  );
}

function InvestorStatementsUpload({
  onUploadComplete,
}: {
  onUploadComplete: (files: string[]) => void;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const props = useSupabaseUpload({
    bucketName: "investors",
    path: "test-statements",
    allowedMimeTypes: [
      "application/pdf",
      "application/vnd.ms-excel",
      "text/csv",
    ],
    maxFiles: 2,
    maxFileSize: 10 * 1024 * 1024, // 10MB
  });

  if (props.isSuccess && props.successes.length > 0) {
    onUploadComplete(props.successes);
  }

  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length > 0) {
      // Create file objects with preview and errors properties
      const fileObjects = files.map((file) => {
        const fileWithPreview = file as File & {
          preview: string;
          errors: FileError[];
        };
        fileWithPreview.preview = URL.createObjectURL(file);
        fileWithPreview.errors = [];
        return fileWithPreview;
      });

      props.setFiles([...props.files, ...fileObjects]);
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Investor Statements</CardTitle>
        <Button onClick={handleFileSelect} size="sm">
          <FileText className="h-4 w-4 mr-2" />
          Select Files
        </Button>
      </CardHeader>
      <CardContent>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={props.allowedMimeTypes?.join(",")}
          onChange={handleFileChange}
          className="hidden"
          aria-label="Select files to upload to investor statements bucket"
        />
        <div className="w-full">
          <Dropzone {...props}>
            <DropzoneEmptyState />
            <DropzoneContent />
          </Dropzone>
        </div>
      </CardContent>
    </Card>
  );
}

function TransactionDocumentsUpload({
  onUploadComplete,
}: {
  onUploadComplete: (files: string[]) => void;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const props = useSupabaseUpload({
    bucketName: "transaction-documents",
    path: "test-transactions",
    allowedMimeTypes: ["application/pdf", "image/*"],
    maxFiles: 5,
    maxFileSize: 10 * 1024 * 1024, // 10MB
  });

  if (props.isSuccess && props.successes.length > 0) {
    onUploadComplete(props.successes);
  }

  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length > 0) {
      // Create file objects with preview and errors properties
      const fileObjects = files.map((file) => {
        const fileWithPreview = file as File & {
          preview: string;
          errors: FileError[];
        };
        fileWithPreview.preview = URL.createObjectURL(file);
        fileWithPreview.errors = [];
        return fileWithPreview;
      });

      props.setFiles([...props.files, ...fileObjects]);
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Transaction Documents</CardTitle>
        <Button onClick={handleFileSelect} size="sm">
          <Upload className="h-4 w-4 mr-2" />
          Select Files
        </Button>
      </CardHeader>
      <CardContent>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={props.allowedMimeTypes?.join(",")}
          onChange={handleFileChange}
          className="hidden"
          aria-label="Select files to upload to transaction documents bucket"
        />
        <div className="w-full">
          <Dropzone {...props}>
            <DropzoneEmptyState />
            <DropzoneContent />
          </Dropzone>
        </div>
      </CardContent>
    </Card>
  );
}

export default function TestUploadsPage() {
  const [uploadResults, setUploadResults] = useState<string[]>([]);

  const handleUploadComplete = (files: string[]) => {
    setUploadResults((prev) => [...prev, ...files]);
    console.log("Uploaded files:", files);
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Test File Uploads</h1>
        <p className="text-muted-foreground">
          Test uploading files to different Supabase storage buckets. Use
          the&nbsp; &quot;Select Files&quot; buttons to open file dialogs or
          drag and drop files into the dropzones.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Documents Bucket */}
        <DocumentsUpload onUploadComplete={handleUploadComplete} />

        {/* Investor Statements Bucket */}
        <InvestorStatementsUpload onUploadComplete={handleUploadComplete} />

        {/* Transaction Documents */}
        <TransactionDocumentsUpload onUploadComplete={handleUploadComplete} />

        {/* Upload Results */}
        <Card>
          <CardHeader>
            <CardTitle>Upload Results</CardTitle>
          </CardHeader>
          <CardContent>
            {uploadResults.length > 0 ? (
              <div className="space-y-2">
                <p className="font-medium text-green-600">
                  ✅ Successfully uploaded:
                </p>
                <ul className="text-sm space-y-1">
                  {uploadResults.map((file, index) => (
                    <li key={index} className="text-muted-foreground">
                      • {file}
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <p className="text-muted-foreground">
                Upload some files to see results here
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>How to Use File Uploads</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-medium">
              1. Using File Selection Buttons or Dropzone:
            </h4>
            <p className="text-sm text-muted-foreground mb-2">
              Click the &quot;Select Files&quot; button in any upload card to
              open a file dialog, or drag and drop files directly into the
              dropzone areas.
            </p>
            <pre className="text-sm bg-muted p-3 rounded mt-2 overflow-x-auto">
              {`import { Dropzone, DropzoneContent, DropzoneEmptyState } from "@/components/ui/forms/supabase-dropzone";
import { useSupabaseUpload } from "@/hooks/use-supabase-upload";

const FileUploadDemo = () => {
  const props = useSupabaseUpload({
    bucketName: 'document_upload',
    path: 'user-uploads',
    allowedMimeTypes: ['application/pdf', 'image/*'],
    maxFiles: 5,
    maxFileSize: 10 * 1024 * 1024, // 10MB
  });

  return (
    <Dropzone {...props}>
      <DropzoneEmptyState />
      <DropzoneContent />
    </Dropzone>
  );
};`}
            </pre>
          </div>

          <div>
            <h4 className="font-medium">2. Using the Upload Hook Directly:</h4>
            <pre className="text-sm bg-muted p-3 rounded mt-2 overflow-x-auto">
              {`import { useSupabaseUpload } from "@/hooks/use-supabase-upload";

const { files, onUpload, loading } = useSupabaseUpload({
  bucketName: "document_upload",
  path: "my-files",
  maxFiles: 10,
  maxFileSize: 5 * 1024 * 1024, // 5MB
});`}
            </pre>
          </div>

          <div>
            <h4 className="font-medium">3. Available Storage Buckets:</h4>
            <ul className="text-sm space-y-1 mt-2">
              <li>
                • <code>document_upload</code> - General document storage
              </li>
              <li>
                • <code>investors</code> - Investor documents and statements
              </li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
