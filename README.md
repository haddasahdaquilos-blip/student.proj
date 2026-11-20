Student Project

Organize. Submit. Succeed.

Student Project is a mobile-friendly web app for managing school projects. Students keep track of their assignments and deadlines and submit their work online. Teachers review submissions and send back feedback and grades, all in one place.

Purpose

Schools often handle project deadlines, file submissions and feedback through scattered chats, emails and paper. Student Project brings these into one simple system so that:

Students always know what is due, what they have submitted, and how they did.
Teachers can see every submission, review it, and give a grade and comments without chasing files.
Features

For students

Dashboard with project counts and upcoming deadlines
Create projects and filter them by Pending, Submitted or Approved
Upload project files (up to 50 MB) with an optional note
Submission status timeline: Submitted, Under review, Feedback, Final status
View teacher comments, grade and feedback attachments
Notifications for approvals, new feedback and deadline reminders

For teachers

See all students' projects and submissions
Approve a project or request a revision
Add comments, a grade and an optional feedback file
Students are notified automatically
Built with
HTML, CSS and vanilla JavaScript (no build step)
Supabase: Authentication, PostgreSQL database with Row Level Security, and Storage for uploaded files
Project structure
student-project/
├─ index.html
├─ schema.sql        # database, security policies and storage setup
├─ css/style.css
└─ js/
   ├─ app.js         # screens and app logic
   └─ config.js      # your Supabase URL and anon key
Getting started
Create a free project at supabase.com.
Open SQL Editor, paste the contents of schema.sql and run it. Before running, change the CHANGE-ME-123 teacher access code to your own secret.
Copy your Project URL and anon public key (Project Settings > API) into js/config.js.
Serve the folder with any static host, for example the VS Code Live Server extension or GitHub Pages. Opening the file directly with file:// will not work.
Register an account. Students sign up normally; teachers choose "I'm a teacher" and enter the teacher access code.
Deploying on GitHub Pages

Go to Settings > Pages, choose the main branch and / (root), then save. Add the resulting URL under Supabase > Authentication > URL Configuration > Site URL so confirmation and password-reset emails link back to your app.

Security notes
Only the public anon key belongs in config.js. Never commit your service_role key.
Do not publish your real teacher access code in a public repository. Set it in the Supabase SQL Editor instead.
Access to data is enforced by Row Level Security policies in schema.sql.
