# DIMOVTAX Interview Project

This project is a small web application built with Next.js and Supabase. Its purpose is to let authenticated users manage a list of projects with the basic CRUD operations: create, read, update, and delete.

## What the app does

Users can:
- sign up and sign in
- view a list of projects
- search projects by name
- filter projects by status
- create a new project
- edit an existing project
- delete one or more projects

Each project contains information such as:
- name
- status
- deadline
- assigned team member
- budget

## How the app is structured

The app uses Next.js App Router and is split into a few clear layers:
- UI pages and components live under the app/ and components/ folders
- database access is handled through Supabase
- API logic is implemented in route handlers under app/api/

## CRUD flow for projects

The main project management experience is centered around the projects table in Supabase.

- The list page loads projects from the API and shows them in a table or card layout
- Creating a project sends form data to the projects API route
- Editing a project sends updated values to the same API route
- Deleting a project removes it from the database through the delete endpoint

## API routes

The application uses Next.js API routes to keep data access logic server-side. These routes are located in the app/api folder and act as a bridge between the frontend and Supabase.

The most important route is:
- app/api/projects/route.ts

That route handles:
- GET: fetch projects with optional search and filtering
- POST: create a new project
- PUT: update an existing project
- DELETE: remove a project

Using API routes makes the app cleaner because the frontend does not talk to Supabase directly. Instead, the UI calls the route handler, and the route handler performs the database operation.

## Supabase authentication

Authentication is handled with Supabase Auth and the Supabase SSR client.

The app supports:
- sign up
- login
- logout
- protected pages that require an authenticated user

The authentication flow is simple:
1. A user signs up or logs in from the auth pages
2. Supabase creates or validates the session
3. The app uses cookies and server-side session checks to keep the user signed in
4. Protected routes redirect unauthenticated users to the login page

This is implemented through the Supabase server client in lib/supabase/server.ts and the session helper in lib/supabase/proxy.ts.

## How to use the application

1. Start the app locally with npm run dev
2. Open the application in your browser
3. Create an account or sign in
4. Once signed in, use the interface to create, search, update, or delete projects
5. The app will persist your changes in the Supabase database

## Notes for engineers

The project is intentionally simple and is meant to demonstrate how a small Next.js application can work with:
- App Router
- server-side API routes
- Supabase as the database and authentication provider
- cookie-based session handling

The important idea is that the UI stays simple while the server-side routes handle the real data operations safely.
