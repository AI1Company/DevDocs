import { DocuCraftClient } from '@/components/docucraft-client';

type ProjectPageProps = {
  params: {
    id: string;
  };
};

export default function ProjectPage({ params }: ProjectPageProps) {
  return (
    <main>
      <DocuCraftClient projectId={params.id} />
    </main>
  );
}
