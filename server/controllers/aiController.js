
import Resume from "../models/Resume.js";
import ai from "../configs/ai.js";

const AI_MODEL = process.env.OPENAI_MODEL || "gpt-4o-mini";
const AI_BASE_URL = process.env.OPENAI_BASE_URL || "";
const SHOULD_SKIP_AI_RESUME_EXTRACTION = AI_BASE_URL.includes("generativelanguage.googleapis.com");

const createFallbackResumeData = (resumeText) => {
    const normalizedText = resumeText
        .replace(/\s+/g, " ")
        .trim();
    const emailMatch = normalizedText.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i);
    const phoneMatch = normalizedText.match(/(?:\+?\d{1,3}[\s-]?)?(?:\(?\d{3,4}\)?[\s-]?)?\d{3}[\s-]?\d{4}/);
    const linkedinMatch = normalizedText.match(/(?:https?:\/\/)?(?:www\.)?linkedin\.com\/[^\s]+/i);
    const websiteMatch = normalizedText.match(/(?:https?:\/\/)?(?:www\.)?(?!linkedin\.com)[a-z0-9-]+\.[a-z]{2,}(?:\/[^\s]*)?/i);
    const lines = resumeText
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter(Boolean);

    return {
        professional_summary: normalizedText.slice(0, 1200),
        skills: [],
        personal_info: {
            image: "",
            full_name: lines[0] || "",
            profession: "",
            email: emailMatch?.[0] || "",
            phone: phoneMatch?.[0] || "",
            location: "",
            linkedin: linkedinMatch?.[0] || "",
            website: websiteMatch?.[0] || "",
        },
        experience: [],
        project: [],
        education: [],
    };
};

const normalizeResumeData = (parsedData, resumeText) => {
    const fallbackData = createFallbackResumeData(resumeText);

    return {
        ...fallbackData,
        ...parsedData,
        personal_info: {
            ...fallbackData.personal_info,
            ...(parsedData?.personal_info || {}),
        },
        skills: Array.isArray(parsedData?.skills) ? parsedData.skills : fallbackData.skills,
        experience: Array.isArray(parsedData?.experience) ? parsedData.experience : fallbackData.experience,
        project: Array.isArray(parsedData?.project)
            ? parsedData.project
            : Array.isArray(parsedData?.projects)
                ? parsedData.projects
                : fallbackData.project,
        education: Array.isArray(parsedData?.education) ? parsedData.education : fallbackData.education,
    };
};

//controller for enhancing a resume's professional summary
//POST: /api/ai/enhance-pro-sum


export const enhanceProfessionalSummary = async (req, res) => {
    try {
        const { userContent } = req.body;

        if (!userContent) {
            return res.status(400).json({ message: 'Missing required fields' })
        }
        const response = await ai.chat.completions.create({
            model: AI_MODEL,
            messages: [
                {
                    role: "system",
                    content: "You are an expert in resume writing. Your task is to enhance the professional summary of a resume. The summary should be 1-2 sentences also highlighting key skills, experience, and career objectives. Make it compelling and ATS- friendly, and only return text no options or anything else."
                },
                {
                    role: "user",
                    content: userContent,
                },
            ],
        })

        const enhanceContent = response.choices[0].message.content;
        return res.status(200).json({ enhanceContent })
    }
    catch (error) {
        return res.status(400).json({ message: error.message })
    }
}



//controller for enhancing a resume's job description
//POST: /api/ai/enhance-job-des


export const enhanceJobDescription = async (req, res) => {
    try {
        const { userContent } = req.body;

        if (!userContent) {
            return res.status(400).json({ message: 'Missing required fields' })
        }
        const response = await ai.chat.completions.create({
            model: AI_MODEL,
            messages: [
                {
                    role: "system",
                    content: "You are an expert in resume writing. Your task is to enhance the job description of a resume. The description should be only in 1-2 sentences also highlighting key responsibilities and achievements.Use action verbs and quantifiable results where possible. Make it ATS- friendly, and only return text no options or anything else."
                },
                {
                    role: "user",
                    content: userContent,
                },
            ],
        })

        const enhanceContent = response.choices[0].message.content;
        return res.status(200).json({ enhanceContent })
    }
    catch (error) {
        return res.status(400).json({ message: error.message })
    }
}




//controller for uploading a resume to the database
//POST: /api/ai/upload-resume


export const uploadResume = async (req, res) => {
    try {
        const { resumeText, title } = req.body;
        const userId = req.userId;

        if (!resumeText) {
            return res.status(400).json({ message: 'Missing required fields' })
        }

        if (!userId) {
            return res.status(401).json({ message: 'Unauthorized' })
        }

        const systemPrompt = "You are an expert AI Agent to extract data from resume."

        const userPrompt = `extract data from this resume: ${resumeText}
        
        Provide data in the following JSON format with no additional text before or after:

        {
         professional_summary: {type:String, default: ''},
    skills: [{type:String }],
    personal_info: {
        image:{type:String, default: ''},
        full_name: {type:String, default: ''},
        profession: {type:String, default: ''},
        email: {type:String, default: ''},
        phone:{type:String, default: ''},
        location:{type:String, default: ''},
        linkedin: {type:String, default: ''},
        website: {type:String, default: ''},
    },
    experience:[
        {
            company: {type:String},
            position: {type:String},
            start_date: {type:String},
            end_date: {type:String},
            description: {type:String},
            is_current: {type:String},
            
        }
    ],
    project: [
        {
            name: {type:String},
            type: {type:String},
            description: {type:String},
  
        }
    ],
     education:[
        {
            institution: {type:String},
            degree: {type:String},
            field: {type:String},
            graduation_date: {type:String},
            gpa: {type:String},
           
        }
    ],}
        
        `

        let parsedData = createFallbackResumeData(resumeText);

        if (!SHOULD_SKIP_AI_RESUME_EXTRACTION) {
            try {
                const response = await ai.chat.completions.create({
                    model: AI_MODEL,
                    messages: [
                        {
                            role: "system",
                            content: systemPrompt
                        },
                        {
                            role: "user",
                            content: userPrompt,
                        },
                    ],
                    response_format: { type: 'json_object' }
                })

                const extractedData = response.choices[0].message.content;

                if (extractedData) {
                    parsedData = normalizeResumeData(JSON.parse(extractedData), resumeText);
                }
            } catch (aiError) {
                console.error("Resume AI extraction failed:", aiError.message);
            }
        }

        const newResume = await Resume.create({
            userId,
            title: title || 'Untitled Resume',
            ...parsedData
        })

        res.json({ resumeId: newResume._id })
    }
    catch (error) {
        return res.status(400).json({ message: error?.message || 'Failed to upload resume' })
    }
}



