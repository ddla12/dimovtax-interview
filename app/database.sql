/*
    Because this is just an interview assignment I will save this file here
*/

SET search_path TO public;

CREATE TABLE project_status (
    id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    name varchar(16) NOT NULL
);

CREATE TABLE team_member (
    id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    name varchar(32) NOT NULL
);

CREATE TABLE projects (
    id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    name varchar(32) NOT NULL,
    project_status_id bigint NOT NULL REFERENCES project_status(id) ON DELETE RESTRICT,
    deadline date NOT NULL,
    team_member_id bigint NOT NULL REFERENCES team_member(id) ON DELETE RESTRICT,
    budget decimal CHECK(budget >= 0)
);

-- Enable Row Level Security for all tables
ALTER TABLE project_status ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_member ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- project_status policies
-- Anon users: SELECT only
CREATE POLICY "project_status_select_for_anon" 
    ON project_status
    FOR SELECT
    TO anon
    USING (true);

-- Anon users: Block INSERT, UPDATE, DELETE
CREATE POLICY "project_status_insert_deny_for_anon" 
    ON project_status
    FOR INSERT
    TO anon
    WITH CHECK (false);

CREATE POLICY "project_status_update_deny_for_anon" 
    ON project_status
    FOR UPDATE
    TO anon
    USING (false);

CREATE POLICY "project_status_delete_deny_for_anon" 
    ON project_status
    FOR DELETE
    TO anon
    USING (false);

-- Authenticated users: Full access
CREATE POLICY "project_status_all_for_authenticated" 
    ON project_status
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- team_member policies
-- Anon users: SELECT only
CREATE POLICY "team_member_select_for_anon" 
    ON team_member
    FOR SELECT
    TO anon
    USING (true);

-- Anon users: Block INSERT, UPDATE, DELETE
CREATE POLICY "team_member_insert_deny_for_anon" 
    ON team_member
    FOR INSERT
    TO anon
    WITH CHECK (false);

CREATE POLICY "team_member_update_deny_for_anon" 
    ON team_member
    FOR UPDATE
    TO anon
    USING (false);

CREATE POLICY "team_member_delete_deny_for_anon" 
    ON team_member
    FOR DELETE
    TO anon
    USING (false);

-- Authenticated users: Full access
CREATE POLICY "team_member_all_for_authenticated" 
    ON team_member
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- projects policies
-- Anon users: SELECT only
CREATE POLICY "projects_select_for_anon" 
    ON projects
    FOR SELECT
    TO anon
    USING (true);

-- Anon users: Block INSERT, UPDATE, DELETE
CREATE POLICY "projects_insert_deny_for_anon" 
    ON projects
    FOR INSERT
    TO anon
    WITH CHECK (false);

CREATE POLICY "projects_update_deny_for_anon" 
    ON projects
    FOR UPDATE
    TO anon
    USING (false);

CREATE POLICY "projects_delete_deny_for_anon" 
    ON projects
    FOR DELETE
    TO anon
    USING (false);

-- Authenticated users: Full access
CREATE POLICY "projects_all_for_authenticated" 
    ON projects
    TO authenticated
    USING (true)
    WITH CHECK (true);