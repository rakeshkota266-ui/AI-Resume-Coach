from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pathlib import Path
from pydantic import BaseModel

from backend.utils.pdf_parser import extract_text_from_pdf
from backend.utils.ats_analyzer import analyze_resume
from backend.utils.job_matcher import match_job_description
from backend.ai_coach import (
    improve_resume,
    generate_career_roadmap,
    detect_career_paths,
)


app = FastAPI(title="AI Resume Coach")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "https://ai-resume-coach-lake.vercel.app",
        "https://ai-resume-coach-jllufbdgv-ai-resume-coach.vercel.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(exist_ok=True)


class JobMatchRequest(BaseModel):
	resume_text: str
	job_description: str


class ResumeRequest(BaseModel):
	resume_text: str


class CareerRoadmapRequest(BaseModel):
	resume_text: str
	job_description: str
	missing_skills: list[str]


@app.get("/")
def home():
	return {"message": "AI Resume Coach Backend is Running!"}


@app.get("/health")
def health():
	return {"status": "healthy"}


@app.post("/upload-resume")
async def upload_resume(file: UploadFile = File(...)):
	if not file.filename or not file.filename.lower().endswith(".pdf"):
		raise HTTPException(status_code=400, detail="Only PDF files are supported")

	file_path = UPLOAD_DIR / Path(file.filename).name
	content = await file.read()
	with file_path.open("wb") as buffer:
		buffer.write(content)

	extracted_text = extract_text_from_pdf(str(file_path))
	ats_result = analyze_resume(extracted_text)
	return {
		"filename": file_path.name,
		"message": "Resume uploaded successfully",
		"text": extracted_text,
		"ats_analysis": ats_result,
	}


@app.post("/match-job")
def match_job(request: JobMatchRequest):
	return match_job_description(request.resume_text, request.job_description)


@app.post("/improve-resume")
def improve_resume_endpoint(request: ResumeRequest):
	return {"improvement": improve_resume(request.resume_text)}


@app.post("/career-roadmap")
def career_roadmap(request: CareerRoadmapRequest):
	result = generate_career_roadmap(
		request.resume_text,
		request.job_description,
		request.missing_skills,
	)
	return {"roadmap": result}
class CareerDetectionRequest(BaseModel):
    resume_text: str


@app.post("/detect-career")
def detect_career(request: CareerDetectionRequest):
    result = detect_career_paths(request.resume_text)

    return {
        "career_analysis": result
    }
