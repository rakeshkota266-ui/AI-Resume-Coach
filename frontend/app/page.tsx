"use client";

import { useState } from "react";
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState("");

  const [jobDescription, setJobDescription] = useState("");
  const [jobResult, setJobResult] = useState<any>(null);
  const [jobLoading, setJobLoading] = useState(false);

  const [roadmap, setRoadmap] = useState("");
  const [roadmapLoading, setRoadmapLoading] = useState(false);

  const [aiImprovement, setAiImprovement] = useState("");
  const [aiLoading, setAiLoading] = useState(false);

  const [careerAnalysis, setCareerAnalysis] = useState("");
  const [careerLoading, setCareerLoading] = useState(false);

  const uploadResume = async () => {
    if (!file) {
      setError("Please select a PDF resume first.");
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);
    setJobResult(null);
    setRoadmap("");
    setAiImprovement("");
    setCareerAnalysis("");

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch(`${API_BASE_URL}/upload-resume`, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Upload failed");
      }

      setResult(data);
    } catch (err: any) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const matchJob = async () => {
    if (!result?.text) {
      setError("Upload your resume first.");
      return;
    }

    if (!jobDescription.trim()) {
      setError("Please enter a job description.");
      return;
    }

    setJobLoading(true);
    setError("");
    setJobResult(null);
    setRoadmap("");

    try {
      const response = await fetch(`${API_BASE_URL}/match-job`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resume_text: result.text,
          job_description: jobDescription,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Job matching failed");
      }

      setJobResult(data);
    } catch (err: any) {
      setError(err.message || "Job matching failed.");
    } finally {
      setJobLoading(false);
    }
  };

  const improveResume = async () => {
    if (!result?.text) {
      setError("Upload your resume first.");
      return;
    }

    setAiLoading(true);
    setError("");
    setAiImprovement("");

    try {
  const response = await fetch(`${API_BASE_URL}/improve-resume`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ resume_text: result.text }),
  });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "AI improvement failed");
      }

      setAiImprovement(data.improvement);
    } catch (err: any) {
      setError(err.message || "AI improvement failed.");
    } finally {
      setAiLoading(false);
    }
  };

  // =========================================================
  // AI CAREER DETECTION
  // =========================================================

  const detectCareer = async () => {
    if (!result?.text) {
      setError("Upload your resume first.");
      return;
    }

    setCareerLoading(true);
    setError("");
    setCareerAnalysis("");
try {
  const response = await fetch(`${API_BASE_URL}/detect-career`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ resume_text: result.text }),
  });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Career detection failed");
      }

      if (!data.career_analysis) {
        throw new Error("No career analysis was returned by the AI.");
      }

      setCareerAnalysis(data.career_analysis);
    } catch (err: any) {
      setError(err.message || "Career detection failed.");
    } finally {
      setCareerLoading(false);
    }
  };

  const generateRoadmap = async () => {
    if (!result?.text) {
      setError("Upload your resume first.");
      return;
    }

    if (!jobDescription.trim()) {
      setError("Enter a job description first.");
      return;
    }

    setRoadmapLoading(true);
    setError("");
    setRoadmap("");
try {
  const response = await fetch(`${API_BASE_URL}/career-roadmap`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      resume_text: result.text,
      job_description: jobDescription,
      missing_skills: jobResult?.missing_skills || [],
    }),
  });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Career roadmap generation failed");
      }

      if (!data.roadmap) {
        throw new Error("No roadmap was returned by the AI.");
      }

      setRoadmap(data.roadmap);
    } catch (err: any) {
      setError(err.message || "Career roadmap generation failed.");
    } finally {
      setRoadmapLoading(false);
    }
  };

  // =========================================================
  // MARKDOWN FORMATTER
  // =========================================================

  const cleanMarkdown = (text: string) => {
    return text
      .replace(/\*\*(.*?)\*\*/g, "$1")
      .replace(/__(.*?)__/g, "$1")
      .replace(/`(.*?)`/g, "$1")
      .trim();
  };

  const isTableSeparator = (line: string) => {
    const trimmed = line.trim();
    if (!trimmed.includes("|")) return false;

    const cells = trimmed
      .split("|")
      .map((cell) => cell.trim())
      .filter(Boolean);

    return cells.length > 0 && cells.every((cell) => /^:?-{3,}:?$/.test(cell));
  };

  const parseTableRow = (line: string) => {
    return line
      .trim()
      .replace(/^\|/, "")
      .replace(/\|$/, "")
      .split("|")
      .map((cell) => cleanMarkdown(cell.trim()));
  };

  const isRoadmapSection = (line: string) => {
    const lower = cleanMarkdown(line).toLowerCase();
    return (
      lower.includes("current skill gap") ||
      lower.includes("beginner level") ||
      lower.includes("intermediate level") ||
      lower.includes("advanced level") ||
      lower.includes("projects to build") ||
      lower.includes("learning order") ||
      lower.includes("job readiness")
    );
  };

  const renderFormattedText = (
    text: string,
    mode: "normal" | "roadmap" = "normal"
  ) => {
    const lines = text
      .replaceAll("<br>", "\n")
      .replaceAll("<br/>", "\n")
      .replaceAll("<br />", "\n")
      .split("\n");

    const elements: React.ReactNode[] = [];
    let i = 0;

    while (i < lines.length) {
      const line = lines[i].trim();

      if (!line) {
        elements.push(<div key={`space-${i}`} className="h-3" />);
        i++;
        continue;
      }

      if (
        line.includes("|") &&
        i + 1 < lines.length &&
        isTableSeparator(lines[i + 1])
      ) {
        const headers = parseTableRow(line);
        const rows: string[][] = [];
        i += 2;

        while (
          i < lines.length &&
          lines[i].trim().includes("|") &&
          lines[i].trim() !== ""
        ) {
          rows.push(parseTableRow(lines[i]));
          i++;
        }

        elements.push(
          <div
            key={`table-${i}`}
            className="my-6 overflow-x-auto rounded-xl border border-slate-700"
          >
            <table className="w-full min-w-[700px] border-collapse">
              <thead>
                <tr className="bg-slate-700/80">
                  {headers.map((header, index) => (
                    <th
                      key={index}
                      className="border-b border-slate-600 px-5 py-4 text-left text-sm font-bold text-orange-400"
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row, rowIndex) => (
                  <tr
                    key={rowIndex}
                    className="border-b border-slate-700 last:border-b-0 hover:bg-slate-700/40"
                  >
                    {headers.map((_, colIndex) => (
                      <td
                        key={colIndex}
                        className="px-5 py-4 align-top text-sm leading-6 text-slate-300"
                      >
                        {row[colIndex] || ""}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
        continue;
      }

      const headingMatch = line.match(/^#{1,6}\s+(.+)$/);
      if (headingMatch) {
        elements.push(
          <div
            key={`heading-${i}`}
            className="mt-7 rounded-xl border border-orange-500/20 bg-orange-500/10 p-4"
          >
            <h4 className="text-lg font-bold text-orange-400">
              {cleanMarkdown(headingMatch[1])}
            </h4>
          </div>
        );
        i++;
        continue;
      }

      if (mode === "roadmap" && isRoadmapSection(line)) {
        elements.push(
          <div
            key={`section-${i}`}
            className="mt-8 rounded-xl border border-orange-500/30 bg-gradient-to-r from-orange-500/15 to-slate-800 p-5"
          >
            <h4 className="text-xl font-bold text-orange-400">
              {cleanMarkdown(line)}
            </h4>
          </div>
        );
        i++;
        continue;
      }

      const bulletMatch = line.match(/^[-•*]\s+(.+)$/);
      if (bulletMatch) {
        elements.push(
          <div
            key={`bullet-${i}`}
            className="flex gap-3 rounded-xl border border-slate-700 bg-slate-700/40 p-4"
          >
            <span className="mt-0.5 font-bold text-green-400">✓</span>
            <p className="leading-7 text-slate-300">
              {cleanMarkdown(bulletMatch[1])}
            </p>
          </div>
        );
        i++;
        continue;
      }

      const numberedMatch = line.match(/^(\d+)[.)]\s+(.+)$/);
      if (numberedMatch) {
        elements.push(
          <div
            key={`number-${i}`}
            className="flex gap-4 rounded-xl border border-blue-500/20 bg-blue-500/10 p-4"
          >
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-500/20 font-bold text-blue-400">
              {numberedMatch[1]}
            </span>
            <p className="leading-7 text-slate-300">
              {cleanMarkdown(numberedMatch[2])}
            </p>
          </div>
        );
        i++;
        continue;
      }

      elements.push(
        <p key={`paragraph-${i}`} className="leading-7 text-slate-300">
          {cleanMarkdown(line)}
        </p>
      );
      i++;
    }

    return elements;
  };

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      {/* HEADER */}
      <header className="border-b border-slate-800">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
          <div>
            <h1 className="text-2xl font-bold">AI Resume Coach</h1>
            <p className="text-sm text-slate-400">
              Analyze your resume and improve it with AI
            </p>
          </div>
          <div className="rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold">
            AI Powered
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-6 py-10">
        {/* TITLE */}
        <div className="mb-10 text-center">
          <h2 className="text-4xl font-bold">Build a Better Resume</h2>
          <p className="mx-auto mt-3 max-w-2xl text-slate-400">
            Upload your resume, discover suitable career paths, check your ATS
            score, match jobs, improve your resume with AI, and generate a
            personalized career roadmap.
          </p>
        </div>

        {/* 1. UPLOAD */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-8 shadow-xl">
          <h3 className="text-xl font-semibold">1. Upload Your Resume</h3>
          <p className="mt-2 text-sm text-slate-400">
            Upload your resume in PDF format.
          </p>

          <div className="mt-6 rounded-xl border-2 border-dashed border-slate-700 p-8 text-center">
            <input
              type="file"
              accept=".pdf"
              onChange={(e) => {
                setFile(e.target.files?.[0] || null);
                setError("");
              }}
              className="mx-auto block w-full max-w-md cursor-pointer rounded-lg border border-slate-700 bg-slate-800 p-3 text-sm"
            />

            {file && (
              <p className="mt-4 text-sm text-green-400">
                Selected: {file.name}
              </p>
            )}

            <button
              type="button"
              onClick={uploadResume}
              disabled={loading}
              className="mt-6 rounded-lg bg-blue-600 px-6 py-3 font-semibold transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Analyzing..." : "Analyze Resume"}
            </button>
          </div>
        </div>

        {error && (
          <div className="mt-6 rounded-xl border border-red-800 bg-red-950/40 p-4 text-red-300">
            {error}
          </div>
        )}

        {/* 2. RESUME ANALYSIS */}
        {result && (
          <div className="mt-8 rounded-2xl border border-slate-800 bg-slate-900 p-8">
            <h3 className="text-xl font-semibold">2. Resume Analysis</h3>

            <div className="mt-6 grid gap-6 md:grid-cols-2">
              <div className="rounded-xl bg-slate-800 p-6 text-center">
                <p className="text-sm text-slate-400">ATS Score</p>
                <p className="mt-3 text-6xl font-bold text-blue-400">
                  {result.ats_analysis.ats_score}
                </p>
                <p className="mt-2 text-slate-400">out of 100</p>
              </div>

              <div className="rounded-xl bg-slate-800 p-6">
                <p className="text-sm text-slate-400">Skills Found</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {result.ats_analysis.skills_found.map((skill: string) => (
                    <span
                      key={skill}
                      className="rounded-full bg-blue-600/20 px-3 py-1 text-sm text-blue-300"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-6 rounded-xl bg-slate-800 p-6">
              <h4 className="font-semibold">Suggestions</h4>
              {result.ats_analysis.suggestions.length === 0 ? (
                <p className="mt-3 text-green-400">
                  Excellent! No major suggestions found.
                </p>
              ) : (
                <ul className="mt-3 list-disc space-y-2 pl-5 text-slate-300">
                  {result.ats_analysis.suggestions.map((suggestion: string) => (
                    <li key={suggestion}>{suggestion}</li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}

        {/* 3. CAREER DETECTION */}
        {result && (
          <div className="mt-8 rounded-2xl border border-slate-800 bg-slate-900 p-8">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-500/20 text-2xl">
                🎯
              </div>
              <div>
                <h3 className="text-xl font-semibold">
                  3. AI Career Discovery
                </h3>
                <p className="mt-1 text-sm text-slate-400">
                  Discover the best career paths for your resume automatically.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={detectCareer}
              disabled={careerLoading}
              className="mt-6 rounded-lg bg-cyan-600 px-6 py-3 font-semibold transition hover:bg-cyan-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {careerLoading
                ? "AI is analyzing your career paths..."
                : "Discover My Best Career Paths"}
            </button>

            {careerAnalysis && (
              <div className="mt-8 rounded-2xl border border-cyan-500/20 bg-slate-800 p-6">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">🤖</span>
                  <div>
                    <h4 className="text-xl font-bold text-cyan-400">
                      AI Career Analysis
                    </h4>
                    <p className="text-sm text-slate-400">
                      Personalized career recommendations based on your resume
                    </p>
                  </div>
                </div>

                <div className="mt-6 space-y-4">
                  {renderFormattedText(careerAnalysis, "normal")}
                </div>
              </div>
            )}
          </div>
        )}

        {/* 4. AI RESUME COACH */}
        {result && (
          <div className="mt-8 rounded-2xl border border-slate-800 bg-slate-900 p-8">
            <h3 className="text-xl font-semibold">4. AI Resume Coach</h3>
            <p className="mt-2 text-sm text-slate-400">
              Get personalized AI suggestions to improve your resume.
            </p>

            <button
              type="button"
              onClick={improveResume}
              disabled={aiLoading}
              className="mt-6 rounded-lg bg-green-600 px-6 py-3 font-semibold transition hover:bg-green-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {aiLoading ? "AI is analyzing..." : "Improve My Resume with AI"}
            </button>

            {aiImprovement && (
              <div className="mt-6 rounded-xl bg-slate-800 p-6">
                <h4 className="mb-5 text-lg font-semibold text-green-400">
                  AI Recommendations
                </h4>
                <div className="space-y-4">
                  {renderFormattedText(aiImprovement, "normal")}
                </div>
              </div>
            )}
          </div>
        )}

        {/* 5. JOB MATCHING */}
        {result && (
          <div className="mt-8 rounded-2xl border border-slate-800 bg-slate-900 p-8">
            <h3 className="text-xl font-semibold">5. Match With a Job</h3>
            <p className="mt-2 text-sm text-slate-400">
              Paste the job description below to see how well your resume matches.
            </p>

            <textarea
              value={jobDescription}
              onChange={(e) => {
                setJobDescription(e.target.value);
                setError("");
              }}
              placeholder="Paste the job description here..."
              className="mt-6 min-h-48 w-full rounded-xl border border-slate-700 bg-slate-800 p-4 text-white outline-none placeholder:text-slate-500 focus:border-blue-500"
            />

            <button
              type="button"
              onClick={matchJob}
              disabled={jobLoading}
              className="mt-4 rounded-lg bg-purple-600 px-6 py-3 font-semibold transition hover:bg-purple-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {jobLoading ? "Matching..." : "Match Resume"}
            </button>

            {jobResult && (
              <div className="mt-8 grid gap-6 md:grid-cols-2">
                <div className="rounded-2xl bg-slate-800 p-8 text-center">
                  <h4 className="text-lg font-semibold text-slate-300">
                    Job Match Score
                  </h4>
                  <div className="mt-4 text-6xl font-bold text-purple-400">
                    {jobResult.match_score}%
                  </div>
                  <p className="mt-4 text-slate-300">
                    {jobResult.recommendation}
                  </p>
                </div>

                <div className="rounded-2xl bg-slate-800 p-8">
                  <h4 className="text-xl font-bold text-green-400">
                    ✅ Matched Skills
                  </h4>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {jobResult.matched_skills?.length > 0 ? (
                      jobResult.matched_skills.map((skill: string) => (
                        <span
                          key={skill}
                          className="rounded-full bg-green-500/20 px-4 py-2 text-green-300"
                        >
                          {skill}
                        </span>
                      ))
                    ) : (
                      <p className="text-slate-400">No matching skills found.</p>
                    )}
                  </div>
                </div>

                <div className="rounded-2xl bg-slate-800 p-8">
                  <h4 className="text-xl font-bold text-red-400">
                    ❌ Missing Skills
                  </h4>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {jobResult.missing_skills?.length > 0 ? (
                      jobResult.missing_skills.map((skill: string) => (
                        <span
                          key={skill}
                          className="rounded-full bg-red-500/20 px-4 py-2 text-red-300"
                        >
                          {skill}
                        </span>
                      ))
                    ) : (
                      <p className="text-green-400">No major missing skills!</p>
                    )}
                  </div>
                </div>

                <div className="rounded-2xl bg-slate-800 p-8">
                  <h4 className="text-xl font-bold text-yellow-400">
                    🔥 High-Priority Skills
                  </h4>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {jobResult.high_priority_skills?.length > 0 ? (
                      jobResult.high_priority_skills.map((skill: string) => (
                        <span
                          key={skill}
                          className="rounded-full bg-yellow-500/20 px-4 py-2 text-yellow-300"
                        >
                          {skill}
                        </span>
                      ))
                    ) : (
                      <p className="text-slate-400">
                        No high-priority missing skills detected.
                      </p>
                    )}
                  </div>
                </div>

                <div className="rounded-2xl bg-slate-800 p-8 md:col-span-2">
                  <h4 className="text-xl font-bold text-blue-400">
                    ⭐ Recommended Skills
                  </h4>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {jobResult.recommended_skills?.length > 0 ? (
                      jobResult.recommended_skills.map((skill: string) => (
                        <span
                          key={skill}
                          className="rounded-full bg-blue-500/20 px-4 py-2 text-blue-300"
                        >
                          {skill}
                        </span>
                      ))
                    ) : (
                      <p className="text-slate-400">
                        No additional skills recommended.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 6. AI CAREER ROADMAP */}
        {result && (
          <div className="mt-8 rounded-2xl border border-slate-800 bg-slate-900 p-8">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-500/20 text-2xl">
                🚀
              </div>
              <div>
                <h3 className="text-xl font-semibold">6. AI Career Roadmap</h3>
                <p className="mt-1 text-sm text-slate-400">
                  Build a personalized learning path based on your resume,
                  target job, and missing skills.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={generateRoadmap}
              disabled={roadmapLoading}
              className="mt-6 rounded-lg bg-orange-600 px-6 py-3 font-semibold transition hover:bg-orange-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {roadmapLoading
                ? "Generating Roadmap..."
                : "Generate AI Career Roadmap"}
            </button>

            {roadmap && (
              <div className="mt-8">
                <div className="rounded-2xl border border-slate-700 bg-slate-800/70 p-6">
                  <h4 className="text-xl font-bold text-orange-400">
                    🧭 Career Roadmap Flow
                  </h4>
                  <p className="mt-2 text-sm text-slate-400">
                    Follow this learning path step by step to become job ready.
                  </p>

                  <div className="mt-8 flex flex-col items-center">
                    {[
                      ["📄", "Your Resume", "Analyze your current skills and experience", "border-blue-500/30 bg-blue-500/10", "text-blue-400"],
                      ["🔍", "Identify Skill Gaps", "Find the skills missing for your target job", "border-red-500/30 bg-red-500/10", "text-red-400"],
                      ["🌱", "Beginner Level", "Learn the fundamental concepts first", "border-green-500/30 bg-green-500/10", "text-green-400"],
                      ["📈", "Intermediate Level", "Practice real-world problems and tools", "border-yellow-500/30 bg-yellow-500/10", "text-yellow-400"],
                      ["🚀", "Advanced Level", "Build advanced skills and practical solutions", "border-purple-500/30 bg-purple-500/10", "text-purple-400"],
                      ["🛠️", "Build Projects", "Create projects that demonstrate your skills", "border-cyan-500/30 bg-cyan-500/10", "text-cyan-400"],
                      ["💼", "Job Ready", "Improve your resume, prepare for interviews, and apply", "border-orange-500/30 bg-orange-500/10", "text-orange-400"],
                    ].map((step, index) => (
                      <div key={step[1]} className="flex w-full max-w-xl flex-col items-center">
                        <div className={`w-full rounded-xl border p-5 text-center ${step[3]}`}>
                          <div className="text-3xl">{step[0]}</div>
                          <h5 className={`mt-2 text-lg font-bold ${step[4]}`}>{step[1]}</h5>
                          <p className="mt-1 text-sm text-slate-400">{step[2]}</p>
                        </div>
                        {index < 6 && <div className="py-3 text-3xl text-orange-400">↓</div>}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-8 rounded-2xl border border-slate-700 bg-slate-800 p-6">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">🤖</span>
                    <div>
                      <h4 className="text-xl font-bold text-orange-400">
                        Your Personalized AI Roadmap
                      </h4>
                      <p className="text-sm text-slate-400">
                        AI-generated recommendations based on your skill gaps
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 space-y-4">
                    {renderFormattedText(roadmap, "roadmap")}
                  </div>
                </div>

                <div className="mt-8 grid gap-4 md:grid-cols-3">
                  <div className="rounded-xl border border-green-500/20 bg-green-500/10 p-5">
                    <div className="text-2xl">📚</div>
                    <h5 className="mt-2 font-bold text-green-400">Learn</h5>
                    <p className="mt-2 text-sm leading-6 text-slate-400">
                      Focus on the high-priority missing skills first.
                    </p>
                  </div>

                  <div className="rounded-xl border border-blue-500/20 bg-blue-500/10 p-5">
                    <div className="text-2xl">🛠️</div>
                    <h5 className="mt-2 font-bold text-blue-400">Practice</h5>
                    <p className="mt-2 text-sm leading-6 text-slate-400">
                      Build practical projects using the skills you learn.
                    </p>
                  </div>

                  <div className="rounded-xl border border-purple-500/20 bg-purple-500/10 p-5">
                    <div className="text-2xl">💼</div>
                    <h5 className="mt-2 font-bold text-purple-400">Apply</h5>
                    <p className="mt-2 text-sm leading-6 text-slate-400">
                      Update your resume and start applying for suitable jobs.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </section>

      <footer className="border-t border-slate-800 py-6 text-center text-sm text-slate-500">
        AI Resume Coach • ATS Scoring • Career Discovery • Job Matching • AI Resume Improvement • Career Roadmap
      </footer>
    </main>
  );
}
