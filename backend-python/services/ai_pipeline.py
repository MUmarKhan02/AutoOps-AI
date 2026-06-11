"""
AI Pipeline Service — powered by Google Gemini
"""
import json
import urllib.request
import urllib.error

from core.config import settings

CANDIDATE_MODELS = [
    "gemini-2.5-flash",
    "gemini-2.5-flash-preview-05-20",
    "gemini-2.5-flash-preview-04-17",
    "gemini-2.0-flash",
    "gemini-1.5-flash",
]

_working_model: str | None = None


def _get_model() -> str:
    global _working_model
    if _working_model:
        return _working_model

    api_key = settings.gemini_api_key
    for model in CANDIDATE_MODELS:
        url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={api_key}"
        body = json.dumps({
            "contents": [{"parts": [{"text": "hi"}]}],
            "generationConfig": {"maxOutputTokens": 5},
        }).encode("utf-8")
        req = urllib.request.Request(url, data=body, headers={"Content-Type": "application/json"}, method="POST")
        try:
            with urllib.request.urlopen(req, timeout=10) as resp:
                if resp.status == 200:
                    _working_model = model
                    print(f"[ai_pipeline] Using model: {model}")
                    return model
        except urllib.error.HTTPError as e:
            print(f"[ai_pipeline] Model {model} unavailable: {e.code}")
        except Exception as e:
            print(f"[ai_pipeline] Model {model} error: {e}")

    raise RuntimeError("No working Gemini model found. Check your GEMINI_API_KEY.")


def _call_gemini(prompt: str, max_tokens: int = 2048) -> str:
    api_key = settings.gemini_api_key
    model = _get_model()
    url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={api_key}"

    body = json.dumps({
        "contents": [{"parts": [{"text": prompt}]}],
        "generationConfig": {"temperature": 0.3, "maxOutputTokens": max_tokens},
    }).encode("utf-8")

    req = urllib.request.Request(
        url, data=body,
        headers={"Content-Type": "application/json"},
        method="POST"
    )

    with urllib.request.urlopen(req, timeout=60) as resp:
        data = json.loads(resp.read().decode("utf-8"))

    return data["candidates"][0]["content"]["parts"][0]["text"].strip()


def run_pipeline(chunks: list[str], parsed: dict) -> dict:
    full_text = parsed.get("text", "")
    if not full_text.strip():
        return {
            "summary": "No text could be extracted from this document.",
            "extracted_data": {},
        }
    summary = summarize(full_text)
    extracted = extract(full_text)
    return {"summary": summary, "extracted_data": extracted}


def summarize(full_text: str) -> str:
    # Use up to 12000 chars to give Gemini enough context for longer docs
    excerpt = full_text[:12000]
    prompt = f"""You are a document analyst. Read the following document and write a thorough, complete summary.
Cover the main purpose, all key topics, important people or entities, dates, figures, and conclusions.
Write in flowing prose. Do not truncate or cut off mid-sentence.

Document:
{excerpt}

Summary:"""
    # Let exceptions bubble up to tasks.py so 503s are caught and marked incomplete
    return _call_gemini(prompt, max_tokens=1024)


def extract(full_text: str) -> dict:
    excerpt = full_text[:12000]
    prompt = f"""You are a data extraction assistant. Extract key information from this document as a JSON object.

Rules:
- Return ONLY raw JSON — no markdown, no backticks, no explanation
- Flat structure only: string or array-of-string values
- Pick fields based on document type:
  Resume → name, email, phone, skills, education, experience, certifications
  Contract → parties, effective_date, end_date, payment_terms, governing_law
  Invoice → vendor, client, amount, due_date, line_items
  Report → title, author, date, key_findings, recommendations

Document:
{excerpt}

JSON:"""
    # Let non-JSON-parse exceptions bubble up to tasks.py so 503s are caught and marked incomplete
    raw = _call_gemini(prompt, max_tokens=2048)
    clean = raw.strip()
    if clean.startswith("```"):
        clean = clean.split("\n", 1)[-1]
    if clean.endswith("```"):
        clean = clean.rsplit("```", 1)[0]
    clean = clean.strip()
    try:
        return json.loads(clean)
    except json.JSONDecodeError:
        return {"extraction_note": raw[:800]}