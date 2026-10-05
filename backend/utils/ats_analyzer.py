import re


def analyze_resume(text: str):

    text_lower = text.lower()

    score = 0
    suggestions = []

    # 1. Skills
    skills = [
        "python",
        "java",
        "sql",
        "machine learning",
        "data science",
        "aws",
        "excel",
        "power bi",
        "git"
    ]

    found_skills = []

    for skill in skills:
        if skill in text_lower:
            found_skills.append(skill)

    skill_score = min(len(found_skills) * 5, 30)
    score += skill_score

    if len(found_skills) < 5:
        suggestions.append("Add more relevant technical skills.")

    # 2. Education
    education_keywords = [
        "education",
        "b.tech",
        "btech",
        "degree",
        "college",
        "university"
    ]

    education_found = any(
        keyword in text_lower
        for keyword in education_keywords
    )

    education_score = 15 if education_found else 0
    score += education_score

    if not education_found:
        suggestions.append("Add a clear Education section.")

    # 3. Projects
    project_keywords = [
        "project",
        "projects",
        "developed",
        "built",
        "implemented"
    ]

    project_found = any(
        keyword in text_lower
        for keyword in project_keywords
    )

    project_score = 20 if project_found else 0
    score += project_score

    if not project_found:
        suggestions.append("Add project details with technologies used.")

    # 4. Experience / Internship
    experience_keywords = [
        "experience",
        "internship",
        "intern",
        "work experience"
    ]

    experience_found = any(
        keyword in text_lower
        for keyword in experience_keywords
    )

    experience_score = 20 if experience_found else 0
    score += experience_score

    if not experience_found:
        suggestions.append("Add internship or practical experience.")

    # 5. Contact information
    email_found = re.search(
        r"[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}",
        text
    )

    phone_found = re.search(
        r"\b\d{10}\b",
        text
    )

    contact_score = 15 if email_found and phone_found else 5
    score += contact_score

    if not email_found:
        suggestions.append("Add a professional email address.")

    if not phone_found:
        suggestions.append("Add a contact phone number.")

    # Final score
    score = min(score, 100)

    return {
        "ats_score": score,
        "skills_found": found_skills,
        "skill_score": skill_score,
        "education_score": education_score,
        "project_score": project_score,
        "experience_score": experience_score,
        "contact_score": contact_score,
        "suggestions": suggestions
    }