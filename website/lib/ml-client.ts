const ML_SERVICE_URL = process.env.ML_SERVICE_URL || "http://localhost:8000"

export async function analyzeReport(imageFile: File) {
    const form = new FormData()
    form.append("file", imageFile)

    const res = await fetch(`${ML_SERVICE_URL}/analyze/`, {
        method: "POST",
        body: form,
    })

    if (!res.ok) throw new Error("ML service error")
    return res.json()
    // Returns: { accepted, category, severity, latitude, longitude }
}