import Datatable from "@/components/datatable";
import ProjectDialog from "@/components/project-dialog";

export default function HomePage() {
  return (
    <section>
      <ProjectDialog />
      <Datatable />
    </section>
  );
}
