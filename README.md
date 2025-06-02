# Bitbash Job Listing Web App

A full-stack web application for managing and displaying job listings, built with Flask, React, and Selenium.
video link :https://onlinepgc-my.sharepoint.com/:v:/g/personal/l1f21bscs0174_ucp_edu_pk/EXi2VA6v3nNNleZK2BT93wQBeZ52VykK3ZTNjC8PQBqUgw?e=jHy8jy
## Project Structure

```
.
├── backend/               # Flask backend
│   ├── app/              # Application code
│   ├── requirements.txt  # Python dependencies
│   └── scrape.py         # Selenium scraper
├── frontend/             # React frontend
│   ├── src/             # Source code
│   └── package.json     # Node dependencies
└── README.md            # This file
```

## Setup Instructions

### Backend Setup

1. Create a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

2. Install dependencies:
   ```bash
   cd backend
   pip install -r requirements.txt
   ```

3. Set up the database:
   ```bash
   flask db upgrade
   ```

4. Run the Flask server:
   ```bash
   flask run
   ```

### Frontend Setup

1. Install dependencies:
   ```bash
   cd frontend
   npm install
   ```

2. Start the development server:
   ```bash
   npm start
   ```

### Running the Scraper

To populate the database with job listings:
```bash
cd backend
python scrape.py
```

## Features

- RESTful API for job listings management
- React frontend with responsive design
- Job filtering and sorting capabilities
- Automated job scraping from actuarylist.com
- PostgreSQL database integration
- Selenium-based web scraping

## API Endpoints

- GET /api/jobs - List all jobs
- POST /api/jobs - Create a new job
- GET /api/jobs/<id> - Get a specific job
- PUT /api/jobs/<id> - Update a job
- DELETE /api/jobs/<id> - Delete a job
- GET /api/jobs/filter - Filter jobs by various criteria 
