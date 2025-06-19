import React, { createContext, useContext, useState, ReactNode } from 'react'

export interface FormField {
  id: string
  label: string
  type: 'text' | 'email' | 'tel' | 'date' | 'select' | 'textarea'
  value: string
  confidence?: number
  required?: boolean
  options?: string[]
  placeholder?: string
}

export interface FormTemplate {
  id: string
  name: string
  description: string
  category: string
  fields: FormField[]
}

interface FormContextType {
  templates: FormTemplate[]
  currentForm: FormTemplate | null
  setCurrentForm: (template: FormTemplate) => void
  updateField: (fieldId: string, value: string, confidence?: number) => void
  clearForm: () => void
  exportToPDF: () => void
}

const FormContext = createContext<FormContextType | undefined>(undefined)

// Form templates
const formTemplates: FormTemplate[] = [
  {
    id: 'ntsa-license',
    name: 'NTSA Driver\'s License Renewal',
    description: 'Renew your driving license with NTSA',
    category: 'Transport',
    fields: [
      { id: 'fullName', label: 'Full Name', type: 'text', value: '', required: true },
      { id: 'idNumber', label: 'ID Number', type: 'text', value: '', required: true },
      { id: 'currentLicense', label: 'Current License Number', type: 'text', value: '', required: true },
      { id: 'dateOfBirth', label: 'Date of Birth', type: 'date', value: '', required: true },
      { id: 'phoneNumber', label: 'Phone Number', type: 'tel', value: '', required: true },
      { id: 'email', label: 'Email Address', type: 'email', value: '' },
      { id: 'address', label: 'Physical Address', type: 'textarea', value: '', required: true },
      { id: 'licenseClass', label: 'License Class', type: 'select', value: '', required: true, 
        options: ['Class A', 'Class B', 'Class C', 'Class D'] }
    ]
  },
  {
    id: 'nhif-registration',
    name: 'NHIF Registration',
    description: 'Register for National Hospital Insurance Fund',
    category: 'Health',
    fields: [
      { id: 'fullName', label: 'Full Name', type: 'text', value: '', required: true },
      { id: 'idNumber', label: 'National ID Number', type: 'text', value: '', required: true },
      { id: 'dateOfBirth', label: 'Date of Birth', type: 'date', value: '', required: true },
      { id: 'gender', label: 'Gender', type: 'select', value: '', required: true, 
        options: ['Male', 'Female'] },
      { id: 'phoneNumber', label: 'Phone Number', type: 'tel', value: '', required: true },
      { id: 'email', label: 'Email Address', type: 'email', value: '' },
      { id: 'employer', label: 'Employer Name', type: 'text', value: '' },
      { id: 'employerNumber', label: 'Employer Number', type: 'text', value: '' },
      { id: 'address', label: 'Postal Address', type: 'textarea', value: '', required: true }
    ]
  },
  {
    id: 'nssf-contribution',
    name: 'NSSF Contribution Form',
    description: 'National Social Security Fund contribution',
    category: 'Social Security',
    fields: [
      { id: 'fullName', label: 'Full Name', type: 'text', value: '', required: true },
      { id: 'idNumber', label: 'National ID Number', type: 'text', value: '', required: true },
      { id: 'nssfNumber', label: 'NSSF Number', type: 'text', value: '' },
      { id: 'dateOfBirth', label: 'Date of Birth', type: 'date', value: '', required: true },
      { id: 'phoneNumber', label: 'Phone Number', type: 'tel', value: '', required: true },
      { id: 'employer', label: 'Employer Name', type: 'text', value: '', required: true },
      { id: 'employerNumber', label: 'Employer NSSF Number', type: 'text', value: '' },
      { id: 'salary', label: 'Monthly Salary', type: 'text', value: '', required: true },
      { id: 'startDate', label: 'Employment Start Date', type: 'date', value: '', required: true }
    ]
  },
  {
    id: 'contact-form',
    name: 'General Contact Form',
    description: 'Basic contact information form',
    category: 'General',
    fields: [
      { id: 'firstName', label: 'First Name', type: 'text', value: '', required: true },
      { id: 'lastName', label: 'Last Name', type: 'text', value: '', required: true },
      { id: 'email', label: 'Email Address', type: 'email', value: '', required: true },
      { id: 'phoneNumber', label: 'Phone Number', type: 'tel', value: '', required: true },
      { id: 'company', label: 'Company/Organization', type: 'text', value: '' },
      { id: 'subject', label: 'Subject', type: 'text', value: '', required: true },
      { id: 'message', label: 'Message', type: 'textarea', value: '', required: true }
    ]
  }
]

export function FormProvider({ children }: { children: ReactNode }) {
  const [currentForm, setCurrentFormState] = useState<FormTemplate | null>(null)
  
  const setCurrentForm = (template: FormTemplate) => {
    setCurrentFormState({ ...template })
  }
  
  const updateField = (fieldId: string, value: string, confidence?: number) => {
    if (!currentForm) return
    
    const updatedFields = currentForm.fields.map(field => 
      field.id === fieldId 
        ? { ...field, value, confidence }
        : field
    )
    
    setCurrentFormState({
      ...currentForm,
      fields: updatedFields
    })
  }
  
  const clearForm = () => {
    if (!currentForm) return
    
    const clearedFields = currentForm.fields.map(field => ({
      ...field,
      value: '',
      confidence: undefined
    }))
    
    setCurrentFormState({
      ...currentForm,
      fields: clearedFields
    })
  }
  
  const exportToPDF = async () => {
    if (!currentForm) return
    
    // Dynamic import to reduce bundle size
    const { jsPDF } = await import('jspdf')
    
    const doc = new jsPDF()
    
    // Add title
    doc.setFontSize(20)
    doc.text(currentForm.name, 20, 30)
    
    // Add form fields
    let yPosition = 50
    doc.setFontSize(12)
    
    currentForm.fields.forEach(field => {
      if (field.value) {
        doc.text(`${field.label}: ${field.value}`, 20, yPosition)
        yPosition += 10
        
        if (yPosition > 280) {
          doc.addPage()
          yPosition = 30
        }
      }
    })
    
    // Add timestamp
    doc.setFontSize(10)
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 20, yPosition + 20)
    
    // Save the PDF
    doc.save(`${currentForm.name.replace(/\s+/g, '_')}.pdf`)
  }
  
  return (
    <FormContext.Provider value={{
      templates: formTemplates,
      currentForm,
      setCurrentForm,
      updateField,
      clearForm,
      exportToPDF
    }}>
      {children}
    </FormContext.Provider>
  )
}

export function useForm() {
  const context = useContext(FormContext)
  if (context === undefined) {
    throw new Error('useForm must be used within a FormProvider')
  }
  return context
}