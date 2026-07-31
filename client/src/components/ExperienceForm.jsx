import { Briefcase, Loader2, Plus, Sparkles, Trash2 } from 'lucide-react'
import React, { useState } from 'react'
import { useSelector } from 'react-redux'
import toast from 'react-hot-toast'
import api from '../configs/api'

const formatDateForInput = (dateString) => {
    if (!dateString) return '';
    if (/^\d{4}-\d{2}$/.test(dateString)) return dateString;
    try {
        const d = new Date(dateString);
        if (!isNaN(d.getTime())) {
            return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        }
    } catch (e) {}
    return '';
}

const MonthYearPicker = ({ value, onChange, disabled }) => {
    const formatted = formatDateForInput(value);
    const [year, month] = formatted ? formatted.split("-") : ["", ""];
    
    const currentYear = new Date().getFullYear();
    const years = Array.from({length: 60}, (_, i) => currentYear + 10 - i);
    const months = ["01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12"];
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    return (
        <div className={`flex gap-2 ${disabled ? 'opacity-50 pointer-events-none' : ''}`}>
            <select 
                value={month || ""} 
                onChange={e => {
                    const newMonth = e.target.value;
                    onChange(year && newMonth ? `${year}-${newMonth}` : (newMonth ? `${currentYear}-${newMonth}` : ""));
                }}
                className="px-2 py-2 text-sm rounded-lg border bg-white flex-1"
                disabled={disabled}
            >
                <option value="">Month</option>
                {months.map((m, i) => <option key={m} value={m}>{monthNames[i]}</option>)}
            </select>
            <select 
                value={year || ""} 
                onChange={e => {
                    const newYear = e.target.value;
                    onChange(newYear && month ? `${newYear}-${month}` : (newYear ? `${newYear}-01` : ""));
                }}
                className="px-2 py-2 text-sm rounded-lg border bg-white flex-1"
                disabled={disabled}
            >
                <option value="">Year</option>
                {years.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
        </div>
    );
};

const ExperienceForm = ({ data = [], onChange = () => {} }) => {
    const { token } = useSelector((state) => state.auth)
    const [generatingIndex, setGeneratingIndex] = useState(-1)

     const experiences = Array.isArray(data) ? data : []

    const addExperience = (e) => {
        // e.preventDefault()

        const newExperience = {
            company: "",
            position: "",
            start_date: "",
            end_date: "",
            description: "",
            is_current: false
        }

        onChange([...experiences, newExperience])
    }

    const removeExperience = (index) => {
        const updated = experiences.filter((_, i) => i !== index)
        onChange(updated)
    }

    const updateExperience = (index, field, value) => {
        const updated = [...experiences]
        updated[index] = { ...updated[index], [field]: value }

        if (field === 'is_current' && value === true) {
            updated[index].end_date = ''
        }

        onChange(updated)
    }

    const generateDescription = async (index) => {

        
        // const currentExperience = experiences[index]

        // if (!currentExperience?.description?.trim()) {
        //     toast.error('Please enter a job description first')
        //     return
        // }

        // const prompt = `Enhance this resume job description for the role "${currentExperience?.position || ''}" at "${currentExperience?.company || ''}": "${currentExperience?.description || ''}"`

        // try {
        //     setGeneratingIndex(index)
        //     const { data: response } = await api.post(
        //         '/api/ai/enhance-job-desc',
        //         { userContent: prompt },
        //         { headers: { Authorization: token } }
        //     )

        //     updateExperience(index, 'description', response.enhanceContent || currentExperience.description)
        // } catch (error) {
        //     toast.error(error?.response?.data?.message || error.message)
        // } finally {
        //     setGeneratingIndex(-1)
        // }
        setGeneratingIndex(index)
        const experience = experiences[index]

        if (!experience.position || !experience.company) {
            toast.error("Please enter Company and Position first to use AI Enhance")
            setGeneratingIndex(-1)
            return
        }

        const prompt = `enhance this job description ${experience.description || ''} for the position of ${experience.position} at ${experience.company}.`

        try{
            const {data} = await api.post('api/ai/enhance-job-desc', {userContent:prompt},{headers:{Authorization: token}})
            updateExperience(index,"description", data.enhancedContent)
        }
        catch(error){
            toast.error(error.message)

        }
        finally{
            setGeneratingIndex(-1)
        }
    }

    return (
        <div className='space-y-6'>
            <div className='flex items-center justify-between'>
                <div>
                    <h3 className='flex items-center gap-2 text-lg font-semibold text-gray-900'>
                        Professional Experience
                    </h3>
                    <p className='text-sm text-gray-500'>Add your job experience</p>
                </div>

                <button
                    type="button"
                    onClick={addExperience}
                    className='flex items-center gap-2 px-3 py-1 text-sm bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors'
                >
                    <Plus className='size-4' />
                    Add Experience
                </button>
            </div>

            {experiences.length === 0 ? (
                <div className='text-center py-8 text-gray-500'>
                    <Briefcase className='w-12 h-12 mx-auto mb-3 text-gray-300' />
                    <p>No work experience added yet.</p>
                    <p className='text-sm'>Click "Add Experience" to get started.</p>
                </div>
            ) : (
                <div className='space-y-4'>
                    {experiences.map((experience, index) => (
                        <div key={index} className='p-4 border border-gray-200 rounded-lg space-y-3'>
                            <div className='flex justify-between items-start'>
                                <h4 className='font-medium'>Experience #{index + 1}</h4>

                                <button
                                    type="button"
                                    onClick={() => removeExperience(index)}
                                    className='text-red-500 hover:text-red-700 transition-colors'
                                >
                                    <Trash2 className='size-4' />
                                </button>
                            </div>

                            <div className='grid md:grid-cols-2 gap-3'>
                                <input
                                    value={experience.company || ""}
                                    onChange={(e) => updateExperience(index, 'company', e.target.value)}
                                    type="text"
                                    placeholder="Company Name"
                                    className="px-3 py-2 text-sm rounded-lg border"
                                />

                                <input
                                    value={experience.position || ""}
                                    onChange={(e) => updateExperience(index, 'position', e.target.value)}
                                    type="text"
                                    placeholder='Job Title'
                                    className="px-3 py-2 text-sm rounded-lg border"
                                />

                                <div className="space-y-1">
                                    <label className="text-xs text-gray-500">Start Date</label>
                                    <MonthYearPicker
                                        value={experience.start_date}
                                        onChange={(val) => updateExperience(index, 'start_date', val)}
                                    />
                                </div>

                                <div className="space-y-1">
                                    <label className="text-xs text-gray-500">End Date</label>
                                    <MonthYearPicker
                                        value={experience.end_date}
                                        onChange={(val) => updateExperience(index, 'end_date', val)}
                                        disabled={experience.is_current}
                                    />
                                </div>
                            </div>

                            <label className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    checked={experience.is_current || false}
                                    onChange={(e) => updateExperience(index, 'is_current', e.target.checked)}
                                />
                                <span className='text-sm text-gray-700'>Currently Working Here</span>
                            </label>

                            <div className='space-y-2'>
                                <div className='flex items-center justify-between'>
                                    <label className='text-sm font-medium text-gray-700'>Job Description</label>

                                    <button
                                        type="button"
                                        onClick={() => generateDescription(index)}
                                    //     disabled={generatingIndex === index || !experience.description?.trim()}
                                    //     className='flex items-center gap-1 px-2 py-1 text-xs bg-purple-100 text-purple-700 rounded hover:bg-purple-200 transition-colors disabled:opacity-50'
                                    // >

                                        disabled={generatingIndex === index}
                                        className='flex items-center gap-2 px-3 py-1.5 text-sm font-medium bg-purple-100 text-purple-700 rounded-md hover:bg-purple-200 transition-colors disabled:opacity-50'
                                    >

                                        {generatingIndex === index ? (
                                            <Loader2 className='w-3 h-3 animate-spin' />
                                        ) : (
                                            <Sparkles className='w-3 h-3' />
                                        )}
                                        {generatingIndex === index ? 'Enhancing...' : 'Enhance with AI'}
                                    </button>
                                </div>

                                <textarea
                                    value={experience.description || ""}
                                    onChange={(e) => updateExperience(index, 'description', e.target.value)}
                                    rows={4}
                                    className='w-full text-sm px-3 py-2 rounded-lg resize-none border'
                                    placeholder='Describe your key responsibilities and achievements....'
                                />
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

export default ExperienceForm














