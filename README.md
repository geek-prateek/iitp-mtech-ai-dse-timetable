# IIT Patna — M.Tech AI & DSE Timetable

Public timetable dashboard for IIT Patna M.Tech 2026–27 Semester 1 students in Artificial Intelligence & Data Science and Engineering (AI & DSE) and Cloud Computing.

## Features

- Weekly timetable from Monday to Sunday
- Program selector for AI & DSE and Cloud Computing
- Light blue for regular courses
- Light yellow for elective courses
- One-click course links
- Separate class/lab links where available
- Elective selector with localStorage persistence
- Program and elective selections persist independently in localStorage
- Today view
- Regular / elective filters
- Responsive mobile layout
- No backend required

## Run locally

Open `index.html` in a browser.

## Deploy with GitHub Pages

1. Create a public GitHub repository.
2. Upload all files and folders from this project.
3. Go to **Settings → Pages**.
4. Under **Build and deployment**, choose **Deploy from a branch**.
5. Select `main` and `/ (root)`.
6. Save.
7. GitHub will provide the public Pages URL.

## Updating the timetable

Edit:

`js/courses.js`

The `COURSES` array contains course information and Teams links.

The `SCHEDULE` array contains day, time, course and lab information.

## Important

This timetable is based on the class schedule and Teams links supplied for the project. Verify any timetable changes with the official IIT Patna academic/class communication before relying on them.
