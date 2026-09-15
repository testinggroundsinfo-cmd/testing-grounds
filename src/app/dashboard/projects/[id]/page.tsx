export default async function DashboardProjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Gestione progetto</h1>
      <p className="text-sm text-zinc-400">ID: {id}</p>
      <p className="text-sm text-zinc-400">
        Feedback ricevuti, stato bug e candidati collaboratori.
      </p>
    </div>
  );
}
