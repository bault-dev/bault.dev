import { UploadZone } from "@/components/files/upload-zone";
import { FilesContent } from "@/components/files/content";

export default function AllFilesPage() {
  return (
    <UploadZone>
      <FilesContent view="all" />
    </UploadZone>
  );
}
