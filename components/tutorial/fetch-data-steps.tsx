import { TutorialStep } from "./tutorial-step";
import { CodeBlock } from "./code-block";

const create = `create table notes (
  id bigserial primary key,
  title text
);

insert into notes(title)
values
  ('Today I created a database project.'),
  ('I added some data and queried it from my app.'),
  ('It was awesome!');
`.trim();

const rls = `alter table notes enable row level security;
create policy "Allow public read access" on notes
for select
using (true);`.trim();

const server = `import { createClient } from '@/lib/supabase/server'

export default async function Page() {
  const supabase = await createClient()
  const { data: notes } = await supabase.from('notes').select()

  return <pre>{JSON.stringify(notes, null, 2)}</pre>
}
`.trim();

const client = `'use client'

import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'

export default function Page() {
  const [notes, setNotes] = useState<any[] | null>(null)
  const supabase = createClient()

  useEffect(() => {
    const getData = async () => {
      const { data } = await supabase.from('notes').select()
      setNotes(data)
    }
    getData()
  }, [])

  return <pre>{JSON.stringify(notes, null, 2)}</pre>
}
`.trim();

export function FetchDataSteps() {
  return (
    <ol className="flex flex-col gap-6">
      <TutorialStep title="Create some tables and insert some data">
        <p>
          Use the SQL editor in your database dashboard to create a table and
          insert some example data. If you&apos;re stuck for creativity, copy
          and paste the following SQL.
        </p>
        <CodeBlock code={create} />
      </TutorialStep>

      <TutorialStep title="Enable Row Level Security (RLS)">
        <p>
          Your database provider may require Row Level Security (RLS). To query
          data from your <code>notes</code> table, add a policy in your dashboard
          or via SQL.
        </p>
        <p>
          For example, run the following SQL to allow public read access:
        </p>
        <CodeBlock code={rls} />
      </TutorialStep>

      <TutorialStep title="Query data from your app">
        <p>
          To create a client and query data from an Async Server Component,
          create a new page.tsx file at the following path and add this code.
        </p>
        <CodeBlock code={server} />
        <p>Alternatively, you can use a Client Component.</p>
        <CodeBlock code={client} />
      </TutorialStep>

      <TutorialStep title="Explore UI libraries">
        <p>
          You can also use component libraries to style your app and add common
          UI blocks like forms, tables, and chat interfaces.
        </p>
      </TutorialStep>

      <TutorialStep title="Build in a weekend and scale to millions!">
        <p>You&apos;re ready to launch your product to the world! 🚀</p>
      </TutorialStep>
    </ol>
  );
}
