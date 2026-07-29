import Resume from "../models/Resume.js";
import ai from "../configs/ai.js";


//controller for nhancing a resume's professional summary
//POST: /api/ai/enhance-pro-sum

export const enhanceProfessionalSummary = async (req, res) => {
    try {
        const { userContent } = req.body;
        
        if(!userContent){
            return res.status(400).json({message:'Missing required fields'})
        }

        const response = await ai.chat.completions.create({
           model: process.env.OPENAI_MODEL || "gpt-3.5-turbo",
    messages: [
        {   role: "system",
            content: "You are an expert in rsume writing. Your task is to enhance the professional summary of a resume. The summary should be 1-2 sentences also highlighting key skills, experience, and career objectives. Make it compelling and ATS-friendly, and only return text no options or anything else." 
        },
        {
            role: "user",
            content: userContent,
        },
    ],
        })

        const enhancedContent =response.choices[0].message.content;
        return res.status(200).json({enhancedContent})
    } catch (error) {
          return res.status(400).json({message:error.message})
    }
};



//controller for nhancing a resume's job description
//POST: /api/ai/enhance-job-desc


export const enhanceJobDescription = async (req, res) => {
    try {
        const { userContent } = req.body;
        
        if(!userContent){
            return res.status(400).json({message:'Missing required fields'})
        }

        const response = await ai.chat.completions.create({
           model: process.env.OPENAI_MODEL || "gpt-3.5-turbo",
    messages: [
        {   role: "system",
            content: "You are an expert in rsume writing. Your task is to enhance the job description should be 1-2 sentences also highlighting key resposibilities and achievements. Use action verbs and quantifiable results where possible. Make it ATS-friendly, and only return text no options or anything else." 
        },
        {
            role: "user",
            content: userContent,
        },
    ],
        })

        const enhancedContent =response.choices[0].message.content;
        return res.status(200).json({enhancedContent})
    } catch (error) {
          return res.status(400).json({message:error.message})
    }
};



//controller for nhancing a resume to the database
//POST: /api/ai/upload-resume
export const uploadResume = async (req, res) => {
    try {

        const {resumeText, title} = req.body;
        const userId = req.userId;

        if(!resumeText){
             return res.status(400).json({message:'Missing required fields'})

        }

        const systemPrompt = "You are an expert AI Agent to extract data from resume."

        const userPrompt = `extract data from this resume: ${resumeText}

        Provide data in the following JSON format with no additional text before or after:

        {
            "professional_summary": "string",
            "skills": ["string"],
            "personal_info": {
                "image": "string",
                "full_name": "string",
                "profession": "string",
                "email": "string",
                "phone": "string",
                "location": "string",
                "linkedin": "string",
                "website": "string"
            },
            "experience": [
                {
                    "company": "string",
                    "position": "string",
                    "start_date": "string",
                    "end_date": "string",
                    "description": "string",
                    "is_current": "string"
                }
            ],
            "project": [
                {
                    "name": "string",
                    "type": "string",
                    "description": "string"
                }
            ],
            "education": [
                {
                    "institution": "string",
                    "degree": "string",
                    "field": "string",
                    "graduation_date": "string",
                    "gpa": "string"
                }
            ]
        }
        
        
        `



        const response = await ai.chat.completions.create({
           model: process.env.OPENAI_MODEL || "gpt-3.5-turbo",
    messages: [
        {   role: "system",
            content: systemPrompt 
        },
        {
            role: "user",
            content: userPrompt,
        },
    ],
    response_format: {type: 'json_object'}
        })

        let extractedData = response.choices[0].message.content;
        
        // Strip markdown backticks if they exist
        if (extractedData.startsWith('```')) {
            extractedData = extractedData.replace(/^```(json)?\\s*/, '').replace(/\\s*```$/, '');
        }
        
        const parsedData = JSON.parse(extractedData);
        const newResume = await Resume.create({userId, title, ...parsedData})

        res.json({resumeId: newResume._id})
    } catch (error) {
          return res.status(400).json({message:error.message})
    }
};


