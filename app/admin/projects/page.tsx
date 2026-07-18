import { listAllProjects } from "@/server/services/adminContent";
import {
  createProject,
  updateProject,
  deleteProject,
} from "@/app/admin/_actions/catalog";
import ImageField from "@/app/admin/_components/ImageField";
import {
  Banner,
  Card,
  Checkbox,
  DangerButton,
  Field,
  GhostButton,
  PageHeader,
  PrimaryButton,
  inputClass,
} from "@/app/admin/_components/ui";

export default async function ProjectsAdminPage({
  searchParams,
}: {
  searchParams: Promise<{ ok?: string; error?: string }>;
}) {
  const { ok, error } = await searchParams;
  const projects = await listAllProjects();

  return (
    <>
      <PageHeader
        title="Gallery / Projects"
        description="Job photos for the Gallery page. Featured ones also appear in the homepage carousel."
      />
      <Banner ok={ok} error={error} />

      <div className="space-y-6">
        <Card title="Add a project photo">
          <form action={createProject} className="grid gap-4 sm:grid-cols-2">
            <Field label="Title">
              <input name="title" placeholder="Colorbond fence and gate" className={inputClass} />
            </Field>
            <Field label="Category (used as a gallery filter)">
              <input name="category" placeholder="Colorbond" className={inputClass} />
            </Field>

            <Field label="Suburb">
              <input name="suburb" placeholder="Balcatta" className={inputClass} />
            </Field>
            <Field label="Order">
              <input name="order" type="number" defaultValue={projects.length} className={inputClass} />
            </Field>

            <div className="sm:col-span-2">
              <ImageField name="image" label="Photo" folder="projects" required />
            </div>

            <div className="flex flex-wrap items-center gap-4 sm:col-span-2">
              <Checkbox name="featured" label="Feature on homepage" />
              <Checkbox name="active" label="Visible" defaultChecked />
              <PrimaryButton type="submit">Add photo</PrimaryButton>
            </div>
          </form>
        </Card>

        <Card title={`Projects (${projects.length})`}>
          {projects.length === 0 ? (
            <p className="text-sm text-gray-500">None yet.</p>
          ) : (
            <ul className="space-y-4">
              {projects.map((project) => (
                <li key={project.id} className="rounded-sm border border-gray-200 p-4">
                  <form action={updateProject} className="grid gap-3 sm:grid-cols-2">
                    <input type="hidden" name="id" value={project.id} />

                    <Field label="Title">
                      <input name="title" defaultValue={project.title} className={inputClass} />
                    </Field>
                    <Field label="Category">
                      <input name="category" defaultValue={project.category} className={inputClass} />
                    </Field>

                    <Field label="Suburb">
                      <input name="suburb" defaultValue={project.suburb} className={inputClass} />
                    </Field>
                    <Field label="Order">
                      <input name="order" type="number" defaultValue={project.order} className={inputClass} />
                    </Field>

                    <div className="sm:col-span-2">
                      <ImageField
                        name="image"
                        label="Photo"
                        defaultValue={project.image}
                        folder="projects"
                      />
                    </div>

                    <div className="flex flex-wrap items-center gap-4 sm:col-span-2">
                      <Checkbox name="featured" label="Featured" defaultChecked={project.featured} />
                      <Checkbox name="active" label="Visible" defaultChecked={project.active} />
                      <GhostButton type="submit">Save</GhostButton>
                    </div>
                  </form>

                  <form action={deleteProject} className="mt-3 border-t border-gray-100 pt-3">
                    <input type="hidden" name="id" value={project.id} />
                    <DangerButton type="submit">Delete</DangerButton>
                  </form>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </>
  );
}
