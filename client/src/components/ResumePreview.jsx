import React from "react"
import ModernTemplate from "./templates/ModernTemplate"
import MinimalTemplate from "./templates/MinimalTemplate"
import MinimalImageTemplate from "./templates/MinimalImageTemplate"
import ClassicTemplate from "./templates/ClassicTemplate"

const ResumePreview = ({
  data,
  template,
  accentColor,
  classes = "",
}) => {

  const renderTemplate = () => {
    switch (template) {
      case "modern":
        return <ModernTemplate data={data} accentColor={accentColor} />
      case "minimal":
        return <MinimalTemplate data={data} accentColor={accentColor} />
      case "minimal-image":
        return <MinimalImageTemplate data={data} accentColor={accentColor} />
      default:
        return <ClassicTemplate data={data} accentColor={accentColor} />
    }
  }

  return (
    <div className="flex justify-center bg-gray-100 py-6">
      {/* Resume Page */}
      <div
        id="resume-preview"
        className={
          "w-[816px] bg-white border border-gray-200 shadow-sm print:shadow-none print:border-none " +
          classes
        }
      >
        {renderTemplate()}
      </div>

      {/* Print styles */}
      <style>{`
        @page {
          size: letter;
          margin: 0;
        }

        @media print {
          html,
          body {
            width: 8.5in;
            height: 11in;
          
            overflow: hidden;
          }

          body * {
            visibility: hidden;
          }

          #resume-preview,
          #resume-preview * {
            visibility: visible;
          }

          #resume-preview {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
             height:auto;
            margin:0;
            padding:0;
            box-shadow: none !important;
            border: none !important;
          }
        }
      `}</style>
    </div>
  )
}

export default ResumePreview
