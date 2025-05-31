import requests
import random
from bs4 import BeautifulSoup
from datetime import datetime
import time
import os
from dotenv import load_dotenv
from app import create_app, db
from app.models import Job
import urllib3
import certifi

# Disable SSL warnings
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

# Load environment variables
load_dotenv()

def get_random_user_agent():
    user_agents = [
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/92.0.4515.107 Safari/537.36',
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.212 Safari/537.36',
        'Mozilla/5.0 (iPhone; CPU iPhone OS 12_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148',
        'Mozilla/5.0 (Linux; Android 11; SM-G960U) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.72 Mobile Safari/537.36'
    ]
    return random.choice(user_agents)

def get_description(url):
    headers = {'User-Agent': get_random_user_agent()}
    try:
        response = requests.get(url, headers=headers, verify=certifi.where())
        if response.status_code == 200:
            soup = BeautifulSoup(response.text, "html.parser")
            description_tag = soup.find("p", text="Job Description")
            if description_tag:
                return description_tag.find_next('ul').text.strip()
            return "N/A"
    except Exception as e:
        print(f"Error fetching description for {url}: {str(e)}")
    return "N/A"

def parse_date(date_str):
    try:
        # Handle different date formats from actuarylist.com
        if 'h ago' in date_str or 'd ago' in date_str:
            return datetime.utcnow()
        
        # Try to parse specific date formats
        formats = ['%B %d, %Y', '%b %d, %Y', '%Y-%m-%d']
        for fmt in formats:
            try:
                return datetime.strptime(date_str, fmt)
            except ValueError:
                continue
        return datetime.utcnow()
    except:
        return datetime.utcnow()

def extract_salary(salary_text):
    if not salary_text:
        return None
    # Remove currency symbols and convert to a clean format
    salary_text = salary_text.replace('💰', '').strip()
    return salary_text

def extract_location(location_text):
    if not location_text:
        return "Remote"
    # Remove emoji and clean up location text
    location_text = location_text.replace('🏠', '').strip()
    return location_text

def scrape_jobs():
    # Configure Flask app with SQLite database
    app = create_app()
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///jobs.db'
    
    with app.app_context():
        try:
            # Create database tables if they don't exist
            db.create_all()
            print("Database initialized successfully")
            
            base_url = "https://www.actuarylist.com/"
            
            # Scrape multiple pages
            for page in range(1, 20):  # Adjust range based on number of pages
                url = base_url if page == 1 else f"{base_url}?page={page}"
                headers = {'User-Agent': get_random_user_agent()}
                
                try:
                    response = requests.get(url, headers=headers, verify=certifi.where())
                    if response.status_code != 200:
                        print(f"Failed to fetch page {page}, Status Code: {response.status_code}")
                        continue

                    soup = BeautifulSoup(response.text, "html.parser")
                    job_cards = soup.find_all("article")

                    for job in job_cards:
                        try:
                            # Extract job details
                            job_title = job.find("p", class_="Job_job-card__position__ic1rc")
                            job_salary = job.find("p", class_="Job_job-card__salary__QZswp")
                            job_company = job.find("p", class_="Job_job-card__company__7T9qY")
                            job_country = job.find("a", class_="Job_job-card__country__GRVhK")
                            job_link = job.find('a', class_="Job_job-page-link__a5I5g")
                            
                            if not all([job_title, job_company, job_country, job_link]):
                                continue

                            # Get full URL
                            job_url = f"https://www.actuarylist.com{job_link.get('href')}"
                            
                            # Check if job already exists
                            existing_job = Job.query.filter_by(url=job_url).first()
                            if existing_job:
                                continue

                            # Get job description
                            description = get_description(job_url)
                            
                            # Extract tags/skills
                            tags = [tag.text.strip() for tag in job.find_all("span", class_="tag")]

                            # Create new job
                            job = Job(
                                title=job_title.text.strip(),
                                company=job_company.text.strip(),
                                location=job_country.text.strip(),
                                posting_date=datetime.utcnow(),  # You might want to extract actual posting date
                                job_type="Full-time",  # You might want to extract actual job type
                                description=f"Salary: {job_salary.text.strip() if job_salary else 'N/A'}\n\n{description}",
                                url=job_url
                            )
                            job.set_tags(tags)  # Use the new set_tags method
                            
                            db.session.add(job)
                            
                        except Exception as e:
                            print(f"Error processing job: {str(e)}")
                            continue

                    # Commit after each page
                    db.session.commit()
                    print(f"Processed page {page}")
                    
                    # Add a small delay between pages to be respectful
                    time.sleep(2)
                    
                except Exception as e:
                    print(f"Error processing page {page}: {str(e)}")
                    continue

            print("Scraping completed successfully!")
            
        except Exception as e:
            print(f"Error during scraping: {str(e)}")

if __name__ == '__main__':
    scrape_jobs() 