import { createClient } from "@/lib/supabase/server";
import { Tables } from "@/database.types";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const name = searchParams.get('name');
    const project_status_id = searchParams.get('project_status_id');
    const sortBy = (searchParams.get('sortBy') || 'id') as keyof Tables<'projects'>;
    const sortOrder = (searchParams.get('sortOrder') || 'asc') as 'asc' | 'desc';

    const supabase = await createClient();
    
    let query = supabase.from('projects').select('*', { count: 'exact' });

    if (name) {
      query = query.ilike('name', `%${name}%`);
    }

    if (project_status_id) {
      query = query.eq('project_status_id', parseInt(project_status_id));
    }

    query = query.order(sortBy, { ascending: sortOrder === 'asc' });

    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { data, error, count } = await query.range(from, to);

    if (error) throw error;

    return Response.json({
      data,
      pagination: {
        page,
        limit,
        total: count,
        pages: Math.ceil((count || 0) / limit),
      },
    });
  } catch (error) {
    return Response.json(
      { error: (error as Error).message },
      { status: 400 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const name = formData.get('name') as string;
    const project_status_id = parseInt(formData.get('project_status_id') as string);
    const deadline = formData.get('deadline') as string;
    const team_member_id = parseInt(formData.get('team_member_id') as string);
    const budget = formData.get('budget') ? parseFloat(formData.get('budget') as string) : null;

    const supabase = await createClient();

    const { data, error } = await supabase
      .from('projects')
      .insert({
        name,
        project_status_id,
        deadline,
        team_member_id,
        budget,
      })
      .select()
      .single();

    if (error) throw error;

    return Response.json(data, { status: 201 });
  } catch (error) {
    return Response.json(
      { error: (error as Error).message },
      { status: 400 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const formData = await request.formData();
    const id = parseInt(formData.get('id') as string);
    const name = formData.get('name') as string;
    const project_status_id = formData.get('project_status_id') ? parseInt(formData.get('project_status_id') as string) : undefined;
    const deadline = formData.get('deadline') as string;
    const team_member_id = formData.get('team_member_id') ? parseInt(formData.get('team_member_id') as string) : undefined;
    const budget = formData.get('budget.') ? parseFloat(formData.get('budget') as string) : undefined;

    const updates: Record<string, any> = { name, deadline };

    if (project_status_id !== undefined) updates.project_status_id = project_status_id;
    if (team_member_id !== undefined) updates.team_member_id = team_member_id;
    if (budget !== undefined) updates.budget = budget;

    const supabase = await createClient();

    const { data, error } = await supabase
      .from('projects')
      .update(updates as never)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return Response.json(data);
  } catch (error) {
    return Response.json(
      { error: (error as Error).message },
      { status: 400 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = parseInt(searchParams.get('id') as string);

    const supabase = await createClient();

    const { data, error } = await supabase
      .from('projects')
      .delete()
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return Response.json(data);
  } catch (error) {
    return Response.json(
      { error: (error as Error).message },
      { status: 400 }
    );
  }
}