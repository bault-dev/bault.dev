import { FilesContent } from "@/components/files/content";

import { UploadZone } from "@/components/files/upload-zone";

interface FolderPageProps {
  params: Promise<{ id: string }>;
}

export default async function FolderPage({ params }: FolderPageProps) {
  const { id } = await params;
  return (
    <UploadZone folderId={id}>
      <FilesContent view="folder" folderId={id} />
    </UploadZone>
  );
}
