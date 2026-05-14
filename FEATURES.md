# NotesMonitor — Features & User Guide

NotesMonitor is a notes distribution platform for educational institutions. Admins upload and organize study materials (images and videos) into date-labeled folders, assign them to student groups, and approve student registrations. Students access only the materials relevant to their group.

---

## Table of Contents

1. [User Roles](#user-roles)
2. [Getting Started](#getting-started)
   - [Admin Login](#admin-login)
   - [Student Registration](#student-registration)
   - [Student Login](#student-login)
3. [Admin Features](#admin-features)
   - [Dashboard](#admin-dashboard)
   - [Student Management](#student-management)
   - [Group Management](#group-management)
   - [Folder Management](#folder-management)
   - [Reports](#reports)
4. [Student Features](#student-features)
   - [Dashboard](#student-dashboard)
   - [Viewing a Folder](#viewing-a-folder)
   - [Downloading Files](#downloading-files)
   - [Profile](#profile)
5. [Access Control Summary](#access-control-summary)

---

## User Roles

| Role | Description |
|------|-------------|
| **Admin** | Full control over the platform — manages students, groups, folders, and files |
| **Student** | Can view and download materials from folders assigned to their groups |

---

## Getting Started

### Admin Login

1. Navigate to `/admin/login`.
2. Enter the admin email and password.
   - Default credentials (change after first login):
     - Email: `admin@notesmonitor.com`
     - Password: `Admin@123`
3. Click **Login**. You will be redirected to the Admin Dashboard.

---

### Student Registration

1. Navigate to `/login` and switch to the **Register** tab.
2. Fill in the form:
   - **Name** — your full name (2–100 characters)
   - **Mobile** — 10-digit Indian mobile number (must start with 6–9)
   - **Email** — a valid email address
   - **Address** _(optional)_
   - **Password** — at least 6 characters
3. Click **Register**.

Your account is created with **Pending** status. You will not be able to view any study materials until an admin approves your account.

---

### Student Login

1. Navigate to `/login` (the **Login** tab is shown by default).
2. Enter your **mobile number** and **password**.
3. Click **Login**.

> **Note:** If your account is still pending or has been rejected, you will see a status message on your dashboard instead of folders.

---

## Admin Features

### Admin Dashboard

The dashboard gives an at-a-glance overview of the platform. It auto-refreshes every 60 seconds.

**Statistics shown:**
- Total students and breakdown by status (Active / Pending / Rejected)
- Total folders
- Total groups
- Total downloads recorded

Use the sidebar links to navigate to Students, Groups, Folders, and Reports.

---

### Student Management

**Location:** Sidebar → *Students*

This page lists all registered students and lets you control their account status.

**Searching and filtering:**
- Use the search bar to find students by name, mobile number, or email.
- Use the status filter dropdown to show All / Pending / Active / Rejected students.
- Results are paginated (20 per page).

**Approving a student:**
1. Locate the student in the table (filter by *Pending* to find new registrations).
2. Click **Approve**.
3. The student's status changes to *Active* and they receive an email notification.
4. Assign them to one or more groups so they can access materials.

**Rejecting a student:**
1. Click **Reject** next to the student.
2. Their status changes to *Rejected* and they receive an email notification.
3. Rejected students can log in but cannot view any folders.

**Changing status back:**
- You can change a student's status (Active ↔ Pending ↔ Rejected) at any time from this page.

---

### Group Management

**Location:** Sidebar → *Groups*

Groups are used to control which students can see which folders. A student can belong to multiple groups, and a folder can be assigned to multiple groups.

**Creating a group:**
1. Click **Create Group**.
2. Enter a **Name** (required) and an optional **Description**.
3. Click **Save**. The new group appears in the table.

**Editing a group:**
1. Click the edit icon on a group row.
2. Update the name or description and save.

**Adding students to a group:**
1. Click **Manage Students** on a group row.
2. A modal lists all active students. Select the students you want to add.
3. Click **Add Selected**. The selected students are added to the group and their profiles are updated.

**Removing a student from a group:**
- In the Manage Students modal, click the remove icon next to a student's name.

**Deleting a group:**
1. Click the delete icon on the group row and confirm.
2. The group is removed. Students previously in the group lose access to folders that were only assigned to that group.

---

### Folder Management

**Location:** Sidebar → *Folders*

Folders are the primary containers for study materials. Each folder has a name, a date, uploaded files, and assigned groups.

#### Creating a Folder

1. Click **Create Folder**.
2. Enter:
   - **Folder Name** — a descriptive title (e.g., "Chapter 5 Notes")
   - **Date** — in `YYYY-MM-DD` format (e.g., `2026-05-14`)
   - **Assign to Groups** _(optional)_ — you can assign groups now or later
3. Click **Save**. The folder appears in the grid.

#### Uploading Files

1. Click on a folder card to open it (or click the upload icon).
2. Drag and drop files onto the upload area, or click to browse.
3. Supported formats: **JPG, PNG, WEBP** (images) and **MP4, MOV** (videos).
4. Maximum size: **100 MB per file**, up to **20 files per upload batch**.
5. A progress bar shows upload status. Files are stored on Cloudinary CDN.

#### Previewing Files

- Images are shown as thumbnails in a grid.
- Click any thumbnail to open a full-screen preview modal.
- Videos are listed separately and can be previewed inline.

#### Assigning a Folder to Groups

A folder is only visible to students whose group(s) are assigned to it.

1. On the folder card, click **Assign Groups**.
2. Select one or more groups from the list.
3. Click **Save**. Students in those groups can now see the folder on their dashboard.

To make a folder inaccessible, remove all group assignments.

#### Downloading a Folder as ZIP

- Click the **Download ZIP** button on a folder card.
- The backend streams all files from Cloudinary into a single ZIP file that downloads to your browser.

#### Deleting a File

- Open the folder, hover over a file thumbnail, and click the delete icon.
- The file is permanently removed from the database and from Cloudinary.

#### Deleting a Folder

- Click the delete icon on the folder card and confirm.
- The entire folder and all its files are permanently deleted from Cloudinary.

---

### Reports

**Location:** Sidebar → *Reports*

The Reports page provides analytics on platform usage.

| Section | Details |
|---------|---------|
| **Overview** | Total counts: students (by status), folders, groups, downloads |
| **Group Stats** | Each group with its current student count |
| **Top Folders** | Folders ranked by number of downloads |
| **Recent Downloads** | The 15 most recent download events (student, folder, type, timestamp) |
| **Recent Folders** | The 5 most recently created folders |

---

## Student Features

### Student Dashboard

**Route:** `/dashboard`

After logging in, students see a grid of all folders they are authorized to view (based on their assigned groups).

- Each card shows the folder **name**, **date**, number of **images**, and number of **videos**.
- Use the **search bar** to filter folders by name.
- Click a folder card to open it.

**If your account is Pending or Rejected:**
- A status message is displayed instead of the folder grid.
- Contact your admin to get your account approved or re-activated.

---

### Viewing a Folder

**Route:** `/folder/:folderId`

Clicking a folder opens the Folder View page.

- **Images** are displayed as a thumbnail grid.
- **Videos** are displayed in a list below the images.
- Click any thumbnail or video to open a **full-screen preview modal**.
  - In the modal, you can navigate between files and close to return.

---

### Downloading Files

**Individual file download:**
1. Hover over an image thumbnail or a video item.
2. Click the **Download** icon.
3. The file downloads directly from Cloudinary to your device.
4. The download is logged for admin analytics.

**Download entire folder as ZIP:**
1. On the Folder View page, click **Download All as ZIP**.
2. The backend packages all files in the folder into a ZIP and streams it to your browser.
3. This download is also tracked.

---

### Profile

**Route:** `/profile`

The Profile page shows your account information:

- Name, Mobile, Email, Address
- **Assigned Groups** — the groups you currently belong to (determines which folders are visible to you)

> Profile editing is not available from this page. Contact your admin to update your details or group assignment.

---

## Access Control Summary

| Action | Admin | Student |
|--------|:-----:|:-------:|
| Login | ✅ | ✅ |
| View own profile | ✅ | ✅ |
| Approve / reject students | ✅ | ✗ |
| Create / edit / delete groups | ✅ | ✗ |
| Add / remove students from groups | ✅ | ✗ |
| Create / delete folders | ✅ | ✗ |
| Upload files to folders | ✅ | ✗ |
| Assign folders to groups | ✅ | ✗ |
| View all folders | ✅ | ✗ |
| View folders (assigned groups only) | ✅ | ✅ |
| Download files | ✅ | ✅ |
| Download folder as ZIP | ✅ | ✅ |
| View reports and analytics | ✅ | ✗ |

---

*For technical setup and deployment instructions, see the project README.*
