import re


def normalize_text(text: str) -> str:
    return re.sub(r"\s+", " ", text.lower()).strip()


def extract_job_requirements(job_description: str) -> list[str]:
    """
    Extract common technical and professional skills from a job description.
    This list is intentionally broad so the matcher can work with different
    career domains.
    """

    skills = [
        # Programming
        "python",
        "java",
        "javascript",
        "typescript",
        "c",
        "c++",
        "c#",
        "go",
        "ruby",
        "php",
        "kotlin",
        "swift",

        # Web
        "html",
        "css",
        "react",
        "angular",
        "vue",
        "node.js",
        "node",
        "express",
        "next.js",

        # Data
        "sql",
        "mysql",
        "postgresql",
        "mongodb",
        "excel",
        "power bi",
        "tableau",
        "data analysis",
        "data visualization",
        "statistics",
        "pandas",
        "numpy",

        # AI / ML
        "machine learning",
        "deep learning",
        "artificial intelligence",
        "scikit-learn",
        "tensorflow",
        "pytorch",
        "generative ai",
        "genai",
        "llm",
        "large language models",
        "prompt engineering",
        "rag",
        "langchain",
        "nlp",
        "computer vision",

        # Cloud / DevOps
        "aws",
        "azure",
        "google cloud",
        "gcp",
        "docker",
        "kubernetes",
        "terraform",
        "jenkins",
        "devops",
        "linux",
        "git",
        "github",
        "gitlab",

        # Cybersecurity
        "cybersecurity",
        "network security",
        "ethical hacking",
        "penetration testing",
        "siem",
        "soc",
        "firewall",

        # Software / Engineering
        "rest api",
        "apis",
        "flask",
        "fastapi",
        "spring",
        "spring boot",
        "microservices",
        "oop",
        "data structures",
        "algorithms",
        "debugging",
        "unit testing",
        "selenium",
        "qa",
        "testing",

        # Business / Professional
        "business analysis",
        "business analyst",
        "project management",
        "agile",
        "scrum",
        "communication",
        "leadership",
        "problem solving",
        "teamwork",
        "stakeholder management",
        "requirements gathering",
        "presentation",
        "research",
        "marketing",
        "digital marketing",
        "seo",
        "content writing",
        "sales",
        "customer service",

        # Design
        "ui/ux",
        "ux design",
        "ui design",
        "figma",
        "adobe xd",
        "photoshop",

        # Mobile
        "android",
        "ios",
        "flutter",
        "react native",
    ]

    text = normalize_text(job_description)

    found = []

    for skill in skills:
        if skill in text:
            found.append(skill)

    return found


def extract_resume_skills(resume_text: str) -> list[str]:
    """
    Detect the same broad skill set inside the resume.
    """

    skills = [
        "python",
        "java",
        "javascript",
        "typescript",
        "c",
        "c++",
        "c#",
        "go",
        "ruby",
        "php",
        "kotlin",
        "swift",

        "html",
        "css",
        "react",
        "angular",
        "vue",
        "node.js",
        "node",
        "express",
        "next.js",

        "sql",
        "mysql",
        "postgresql",
        "mongodb",
        "excel",
        "power bi",
        "tableau",
        "data analysis",
        "data visualization",
        "statistics",
        "pandas",
        "numpy",

        "machine learning",
        "deep learning",
        "artificial intelligence",
        "scikit-learn",
        "tensorflow",
        "pytorch",
        "generative ai",
        "genai",
        "llm",
        "large language models",
        "prompt engineering",
        "rag",
        "langchain",
        "nlp",
        "computer vision",

        "aws",
        "azure",
        "google cloud",
        "gcp",
        "docker",
        "kubernetes",
        "terraform",
        "jenkins",
        "devops",
        "linux",
        "git",
        "github",
        "gitlab",

        "cybersecurity",
        "network security",
        "ethical hacking",
        "penetration testing",
        "siem",
        "soc",
        "firewall",

        "rest api",
        "apis",
        "flask",
        "fastapi",
        "spring",
        "spring boot",
        "microservices",
        "oop",
        "data structures",
        "algorithms",
        "debugging",
        "unit testing",
        "selenium",
        "qa",
        "testing",

        "business analysis",
        "business analyst",
        "project management",
        "agile",
        "scrum",
        "communication",
        "leadership",
        "problem solving",
        "teamwork",
        "stakeholder management",
        "requirements gathering",
        "presentation",
        "research",
        "marketing",
        "digital marketing",
        "seo",
        "content writing",
        "sales",
        "customer service",

        "ui/ux",
        "ux design",
        "ui design",
        "figma",
        "adobe xd",
        "photoshop",

        "android",
        "ios",
        "flutter",
        "react native",
    ]

    text = normalize_text(resume_text)

    found = []

    for skill in skills:
        if skill in text:
            found.append(skill)

    return found


def match_job_description(
    resume_text: str,
    job_description: str
):
    """
    Compare resume skills against the requirements of any job description.
    """

    resume_skills = extract_resume_skills(resume_text)
    job_skills = extract_job_requirements(job_description)

    matched_skills = [
        skill for skill in job_skills
        if skill in resume_skills
    ]

    missing_skills = [
        skill for skill in job_skills
        if skill not in resume_skills
    ]

    # Calculate match score
    if job_skills:
        match_score = round(
            (len(matched_skills) / len(job_skills)) * 100
        )
    else:
        match_score = 0

    # Important skills that usually have strong impact
    high_priority_keywords = [
        "python",
        "java",
        "javascript",
        "sql",
        "machine learning",
        "data analysis",
        "aws",
        "azure",
        "docker",
        "kubernetes",
        "cybersecurity",
        "react",
        "node.js",
        "power bi",
        "excel",
        "communication",
        "problem solving",
        "git",
    ]

    high_priority_skills = [
        skill
        for skill in missing_skills
        if skill in high_priority_keywords
    ]

    # Recommended skills
    recommended_skills = (
        high_priority_skills
        + [
            skill
            for skill in missing_skills
            if skill not in high_priority_skills
        ]
    )

    if match_score >= 80:
        recommendation = (
            "Excellent match. Your resume strongly aligns with this job."
        )

    elif match_score >= 60:
        recommendation = (
            "Good match. Strengthen the missing skills to improve your chances."
        )

    elif match_score >= 40:
        recommendation = (
            "Moderate match. Consider developing the recommended skills before applying."
        )

    else:
        recommendation = (
            "Low match. Consider developing the recommended skills before applying."
        )

    return {
        "match_score": match_score,
        "job_required_skills": job_skills,
        "resume_skills": resume_skills,
        "matched_skills": matched_skills,
        "missing_skills": missing_skills,
        "high_priority_skills": high_priority_skills,
        "recommended_skills": recommended_skills,
        "recommendation": recommendation,
    }