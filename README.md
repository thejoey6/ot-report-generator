# OT Report Generator (WIP)

A work-in-progress web app that seeks to optimize the generation of occupational therapy evaluation reports. Designed with flexibility and personalized utility in mind, this tool helps therapists save time while maintaining professional-quality documentation.

---

## Overview

OT Report Generator allows occupational therapists to upload `.docx` template files (formatted for [docxtemplater](https://docxtemplater.com/)), select domains and specific test behaviors based on common developmental assessments, and automatically generate narrative reports with minimal manual input.

Supports:
- Bayley-4
- DAYC-2

---

## Features

- Upload custom `.docx` templates
- Select tested domains and behaviors (mirroring actual test kits)
- Auto-generate narrative report paragraphs
- Insert results into the selected template
- Download the completed `.docx` report
- Uploaded templates, finished reports, and customizations all saved for ease of use
- Secure login with JWT authentication
- Encrypted data and secure handling of user credentials

---

## Tech Stack

**Frontend**  :  React   
**Backend**   :  Express, Node   
**Database**  :  PostgreSQL, Prisma ORM   
**Other**     :  JWT Auth, docxtemplater, Multer   

---

## Current Status

- Core logic implemented: file upload → selection → narrative generation → docx export
- Narrative generation logic is functional
- Authentication and basic security features in place
- Cloud storage for uploaded templates and static file uploads implemented
- Basic data models defined via Prisma
- GUI is functional but needs refinement
- Still adding data (test behaviors per domain)
- Codebase cleanup and UX improvements in progress

---

## Planned Improvements

- Full behavior set for Bayley-4 and DAYC-2
- Enhanced GUI/UX with validation and clearer flows
- Admin dashboard for managing templates and test content
- Deployment to a public domain

---

## Getting Started (Dev)

Clone and set up the project locally:

1. Clone repo using 'git clone'
2. Install dependencies using 'npm install' in /client and /server
3. Create local .env file and include DB credentials, JWT secret, etc.
4. Start the app by running 'npm run dev' from root

---

## Author

Joseph Read

---

## Acknowledgments

- Docxtemplater for templating engine
- Prisma for safe DB handling
- The occupational therapist for whom this is designed

---

*This project is still under active development. Feel free to explore or get in touch.*
