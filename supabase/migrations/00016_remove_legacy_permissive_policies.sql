-- Rimuove policy legacy duplicate (create manualmente in sessioni precedenti,
-- mai tracciate nelle migration precedenti) che bypassavano le regole
-- introdotte in 00015: inserimenti anonimi ancora permessi su
-- project_reviews/project_bugs/project_applications/project_reports, e una
-- policy su "projects" che permetteva a QUALSIASI utente autenticato di
-- creare progetti senza alcun controllo di proprieta' o slot di
-- pubblicazione.

drop policy if exists "Permetti inserimento progetti utenti loggati" on public.projects;
drop policy if exists "Gli utenti possono inserire i propri progetti" on public.projects;

drop policy if exists "public_insert_reviews" on public.project_reviews;
drop policy if exists "Permetti inserimento recensioni" on public.project_reviews;

drop policy if exists "public_insert_bugs" on public.project_bugs;
drop policy if exists "Permetti inserimento bug" on public.project_bugs;

drop policy if exists "public_insert_applications" on public.project_applications;
drop policy if exists "Permetti inserimento candidature" on public.project_applications;

drop policy if exists "public_insert_reports" on public.project_reports;
drop policy if exists "Permetti inserimento segnalazioni" on public.project_reports;
