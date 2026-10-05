import os
from pathlib import Path
from groq import Groq
from dotenv import load_dotenv

env_path = Path(__file__).resolve().parent / ".env"
load_dotenv(env_path)

api_key = os.getenv("GROQ_API_KEY")

if not api_key:
    raise ValueError("GROQ_API_KEY is not configured")

client = Groq(api_key=api_key)


def improve_resume(resume_text: str):

    prompt = f"""
You are an expert resume reviewer, ATS consultant, technical recruiter,
and career coach.

Analyze the resume below deeply.

IMPORTANT RULES:
- Base your analysis ONLY on information actually present in the resume.
- Never invent jobs, internships, skills, certifications, achievements,
  projects, percentages, companies, or technologies.
- Clearly identify missing information instead of making it up.
- Give specific and actionable recommendations.
- Prefer measurable improvements when suggesting changes, but do not invent
  measurements.
- Evaluate the resume from both ATS and human recruiter perspectives.
- Give rewritten examples only when useful.
- Keep the analysis professional and suitable for a college student/fresher.

RESUME:
-------------------------
{resume_text}
-------------------------

Return the analysis using exactly these sections:

1. OVERALL RESUME ASSESSMENT
- Give an overall rating out of 10.
- Explain the strongest parts.
- Explain the weakest parts.
- Give a short recruiter-style verdict.

2. ATS ANALYSIS
- Estimate ATS readiness out of 100.
- Identify important keywords already present.
- Identify likely missing keywords.
- Check whether headings are ATS-friendly.
- Check whether the content is easy for ATS systems to parse.

3. CAREER OBJECTIVE / SUMMARY
- Evaluate the current objective or summary.
- Explain what is weak.
- Provide an improved version based ONLY on the candidate's actual background.

4. TECHNICAL SKILLS ANALYSIS
- Identify the strongest skills.
- Identify skills that need better presentation.
- Identify relevant skills that appear to be missing.
- Do not recommend skills that are unrelated to the candidate's field.

5. PROJECT ANALYSIS
For each important project:
- Evaluate the project description.
- Identify missing technical details.
- Identify missing methodology/tools.
- Identify missing outcomes.
- Suggest a stronger version using only information already available.
- Explain how to make the project more impressive without inventing facts.

6. EDUCATION ANALYSIS
- Evaluate education information.
- Explain whether important academic details are missing.
- Suggest improvements if necessary.

7. EXPERIENCE / INTERNSHIP ANALYSIS
- Check whether practical experience is clearly presented.
- If experience is missing, explain what types of genuine experience
  the candidate could add, such as internships, academic projects,
  hackathons, volunteering, or training.
- Never fabricate experience.

8. ACHIEVEMENT ANALYSIS
- Identify whether achievements are present.
- Explain where measurable results would strengthen the resume.
- Do not invent numbers.

9. KEYWORD ANALYSIS
Create:
- Strong keywords already present
- Potential keywords to consider
- Keywords that should only be added if the candidate genuinely has them

10. LANGUAGE AND GRAMMAR
- Identify unclear, weak, repetitive, or generic wording.
- Give improved examples.

11. FORMATTING AND STRUCTURE
Evaluate:
- Section order
- Readability
- Bullet points
- Consistency
- ATS compatibility
- Length
- Professional appearance

12. PRIORITY IMPROVEMENTS
Give the TOP 10 improvements ranked from highest priority to lowest priority.

For each improvement explain:
- What to change
- Why it matters
- How to improve it

13. RECRUITER FINAL VERDICT
Give:
- Current resume strength
- Biggest risk
- Biggest opportunity
- Whether the resume is ready to apply
- What should be fixed before applying

14. FINAL SCORE
Give scores out of 100 for:
- ATS readiness
- Content quality
- Technical skills presentation
- Project quality
- Professionalism
- Overall resume quality

Finish with a short action plan:
"Do these 5 things first."

Make the response detailed, analytical, and practical.
"""

    response = client.chat.completions.create(
        model="openai/gpt-oss-120b",
        messages=[
            {
                "role": "system",
                "content": "You are an expert resume analyst and technical recruiter."
            },
            {
                "role": "user",
                "content": prompt
            }
        ],
        temperature=0.2,
    )

    return response.choices[0].message.content
def generate_career_roadmap(resume_text: str, job_description: str, missing_skills: list):
    skills_text = ", ".join(missing_skills)

    prompt = f"""
You are an expert career coach and technical learning advisor.

Create a personalized career roadmap based ONLY on the candidate's resume,
the target job description, and the missing skills.

RESUME:
{resume_text}

TARGET JOB:
{job_description}

MISSING SKILLS:
{skills_text}

Create the roadmap using these sections:

1. CURRENT SKILL GAP
Explain the most important gaps between the resume and the target job.

2. BEGINNER LEVEL
List what the candidate should learn first.

3. INTERMEDIATE LEVEL
List the next skills and concepts to learn.

4. ADVANCED LEVEL
List advanced skills that would make the candidate stronger.

5. PROJECTS TO BUILD
Suggest 3 practical projects related to the target role.

6. LEARNING ORDER
Give a clear step-by-step order from first skill to final skill.

7. JOB READINESS
Explain what the candidate should be able to demonstrate before applying.

IMPORTANT:
- Do not invent experience.
- Do not claim the candidate already knows a skill unless it appears in the resume.
- Keep the roadmap practical for a fresher.
- Prioritize the most important missing skills.
"""

    response = client.chat.completions.create(
        model="openai/gpt-oss-120b",
        messages=[
            {
                "role": "system",
                "content": "You are an expert technical career coach."
            },
            {
                "role": "user",
                "content": prompt
            }
        ],
        temperature=0.2,
    )

    return response.choices[0].message.content
def detect_career_paths(resume_text: str):
    prompt = f"""
You are an expert AI career advisor.

Analyze the candidate's resume and identify the most suitable career paths.

RESUME:
{resume_text}

Your task:

1. Identify the candidate's strongest technical and professional skills.
2. Identify the candidate's education and project background.
3. Recommend the TOP 5 suitable career paths.
4. Give each career path a match percentage from 0 to 100.
5. Explain why the candidate matches each role.
6. Identify the important missing skills for each role.
7. Recommend which career path should be the candidate's PRIMARY career target.

Possible career paths include, but are NOT limited to:

- Data Analyst
- Data Scientist
- AI/ML Engineer
- Software Developer
- Python Developer
- Java Developer
- Full Stack Developer
- Frontend Developer
- Backend Developer
- Cloud Engineer
- DevOps Engineer
- Cybersecurity Engineer
- Business Analyst
- Database/SQL Developer
- QA/Testing Engineer
- Mobile Developer
- UI/UX Designer
- Digital Marketing
- Business/Management
- Research
- Other suitable roles

IMPORTANT:
- Do not assume skills that are not present in the resume.
- Do not recommend a role only because it is popular.
- Base recommendations on the actual resume.
- A fresher can be recommended for entry-level roles.
- Consider programming skills, tools, projects, education and certifications.
- Give practical recommendations.

Return the answer using exactly this structure:

PRIMARY CAREER:
Role:
Match:
Why:

TOP CAREER OPTIONS:

1. Role:
Match:
Why:
Missing Skills:

2. Role:
Match:
Why:
Missing Skills:

3. Role:
Match:
Why:
Missing Skills:

4. Role:
Match:
Why:
Missing Skills:

5. Role:
Match:
Why:
Missing Skills:

STRONGEST SKILLS:
- skill
- skill
- skill

OVERALL RECOMMENDATION:
Explain which career path the candidate should focus on first and why.
"""

    response = client.chat.completions.create(
        model="openai/gpt-oss-120b",
        messages=[
            {
                "role": "system",
                "content": "You are an expert AI career detection agent."
            },
            {
                "role": "user",
                "content": prompt
            }
        ],
        temperature=0.2,
    )

    return response.choices[0].message.content