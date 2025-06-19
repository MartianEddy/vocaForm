import { FormTemplate } from '../types/form'

export const dynamicFormTemplates: FormTemplate[] = [
  {
    id: 'ntsa-license-v2',
    name: 'NTSA Driver\'s License Renewal (Enhanced)',
    description: 'Enhanced NTSA license renewal form with conditional logic and validation',
    category: 'Transport',
    version: '2.0.0',
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-15'),
    estimatedTime: 15,
    difficulty: 'medium',
    tags: ['ntsa', 'license', 'renewal', 'transport'],
    settings: {
      autoSave: true,
      autoSaveInterval: 30,
      allowPartialSubmission: true,
      showProgress: true,
      voiceEnabled: true,
      multiLanguage: true
    },
    submission: {
      method: 'pdf',
      pdfTemplate: 'ntsa_license_template'
    },
    sections: [
      {
        id: 'personal_info',
        title: 'Personal Information',
        description: 'Basic personal details for license renewal',
        fields: [
          {
            id: 'full_name',
            type: 'text',
            label: 'Full Name',
            placeholder: 'Enter your full name as it appears on your ID',
            validation: {
              required: true,
              minLength: 2,
              maxLength: 100,
              pattern: '^[a-zA-Z\\s]+$',
              message: 'Name should only contain letters and spaces'
            },
            voiceEnabled: true,
            voiceHints: ['Speak your full name clearly', 'Include all names as on your ID'],
            width: 'full'
          },
          {
            id: 'id_number',
            type: 'text',
            label: 'National ID Number',
            placeholder: '12345678',
            validation: {
              required: true,
              custom: 'kenyan_id'
            },
            voiceEnabled: true,
            voiceHints: ['Say each digit clearly', 'Eight digits total'],
            width: 'half'
          },
          {
            id: 'date_of_birth',
            type: 'date',
            label: 'Date of Birth',
            validation: {
              required: true
            },
            width: 'half'
          },
          {
            id: 'gender',
            type: 'select',
            label: 'Gender',
            validation: {
              required: true
            },
            options: [
              { value: 'male', label: 'Male' },
              { value: 'female', label: 'Female' },
              { value: 'other', label: 'Other' }
            ],
            voiceEnabled: true,
            width: 'half'
          },
          {
            id: 'phone_number',
            type: 'tel',
            label: 'Phone Number',
            placeholder: '+254712345678',
            validation: {
              required: true,
              custom: 'kenyan_phone'
            },
            voiceEnabled: true,
            voiceHints: ['Include country code +254', 'Speak digits clearly'],
            width: 'half'
          }
        ]
      },
      {
        id: 'license_info',
        title: 'Current License Information',
        description: 'Details about your current driving license',
        fields: [
          {
            id: 'current_license_number',
            type: 'text',
            label: 'Current License Number',
            placeholder: 'DL123456',
            validation: {
              required: true,
              custom: 'license_number'
            },
            voiceEnabled: true,
            voiceHints: ['Say letters first, then numbers', 'Example: D-L-1-2-3-4-5-6'],
            width: 'half'
          },
          {
            id: 'license_class',
            type: 'select',
            label: 'License Class',
            validation: {
              required: true
            },
            options: [
              { value: 'A', label: 'Class A - Motorcycles' },
              { value: 'B', label: 'Class B - Light Motor Vehicles' },
              { value: 'C', label: 'Class C - Medium Motor Vehicles' },
              { value: 'D', label: 'Class D - Heavy Motor Vehicles' },
              { value: 'E', label: 'Class E - Articulated Vehicles' }
            ],
            voiceEnabled: true,
            width: 'half'
          },
          {
            id: 'license_expiry',
            type: 'date',
            label: 'Current License Expiry Date',
            validation: {
              required: true
            },
            width: 'half'
          },
          {
            id: 'has_endorsements',
            type: 'checkbox',
            label: 'Do you have any endorsements on your current license?',
            options: [
              { value: 'yes', label: 'Yes, I have endorsements' }
            ],
            width: 'half'
          },
          {
            id: 'endorsements_details',
            type: 'textarea',
            label: 'Endorsement Details',
            placeholder: 'Describe your current endorsements',
            showIf: [
              { field: 'has_endorsements', operator: 'equals', value: ['yes'] }
            ],
            validation: {
              minLength: 10,
              maxLength: 500
            },
            voiceEnabled: true,
            width: 'full'
          }
        ]
      },
      {
        id: 'contact_info',
        title: 'Contact Information',
        description: 'Where we can reach you',
        fields: [
          {
            id: 'email',
            type: 'email',
            label: 'Email Address',
            placeholder: 'your.email@example.com',
            validation: {
              required: false
            },
            voiceEnabled: true,
            voiceHints: ['Spell out the email address', 'Say "at" for @ and "dot" for .'],
            width: 'full'
          },
          {
            id: 'postal_address',
            type: 'textarea',
            label: 'Postal Address',
            placeholder: 'P.O. Box 12345, Nairobi',
            validation: {
              required: true,
              minLength: 10
            },
            voiceEnabled: true,
            width: 'full'
          },
          {
            id: 'physical_address',
            type: 'textarea',
            label: 'Physical Address',
            placeholder: 'Street, Building, Area, City',
            validation: {
              required: true,
              minLength: 15
            },
            voiceEnabled: true,
            width: 'full'
          }
        ]
      },
      {
        id: 'medical_info',
        title: 'Medical Information',
        description: 'Health-related information for license renewal',
        fields: [
          {
            id: 'has_medical_conditions',
            type: 'radio',
            label: 'Do you have any medical conditions that may affect your driving?',
            validation: {
              required: true
            },
            options: [
              { value: 'yes', label: 'Yes' },
              { value: 'no', label: 'No' }
            ],
            voiceEnabled: true,
            width: 'full'
          },
          {
            id: 'medical_conditions_details',
            type: 'textarea',
            label: 'Medical Condition Details',
            placeholder: 'Please describe your medical conditions',
            showIf: [
              { field: 'has_medical_conditions', operator: 'equals', value: 'yes' }
            ],
            requiredIf: [
              { field: 'has_medical_conditions', operator: 'equals', value: 'yes' }
            ],
            validation: {
              minLength: 10,
              maxLength: 1000
            },
            voiceEnabled: true,
            width: 'full'
          },
          {
            id: 'wears_glasses',
            type: 'checkbox',
            label: 'Do you wear glasses or contact lenses while driving?',
            options: [
              { value: 'yes', label: 'Yes, I wear corrective lenses' }
            ],
            width: 'full'
          },
          {
            id: 'medical_certificate',
            type: 'file',
            label: 'Medical Certificate (if required)',
            showIf: [
              { field: 'has_medical_conditions', operator: 'equals', value: 'yes' }
            ],
            validation: {
              pattern: '.pdf,.jpg,.jpeg,.png'
            },
            width: 'full'
          }
        ]
      },
      {
        id: 'declaration',
        title: 'Declaration',
        description: 'Legal declarations and agreements',
        fields: [
          {
            id: 'declaration_truth',
            type: 'checkbox',
            label: 'I declare that the information provided is true and accurate',
            validation: {
              required: true
            },
            options: [
              { value: 'agreed', label: 'I confirm this declaration' }
            ],
            width: 'full'
          },
          {
            id: 'declaration_penalties',
            type: 'checkbox',
            label: 'I understand that providing false information may result in penalties',
            validation: {
              required: true
            },
            options: [
              { value: 'understood', label: 'I understand the penalties' }
            ],
            width: 'full'
          },
          {
            id: 'signature_date',
            type: 'date',
            label: 'Date of Application',
            defaultValue: new Date().toISOString().split('T')[0],
            validation: {
              required: true
            },
            width: 'half'
          }
        ]
      }
    ]
  },
  {
    id: 'nhif-registration-v2',
    name: 'NHIF Registration (Enhanced)',
    description: 'Enhanced NHIF registration form with smart validation',
    category: 'Health',
    version: '2.0.0',
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-15'),
    estimatedTime: 12,
    difficulty: 'easy',
    tags: ['nhif', 'health', 'insurance', 'registration'],
    settings: {
      autoSave: true,
      autoSaveInterval: 30,
      allowPartialSubmission: true,
      showProgress: true,
      voiceEnabled: true,
      multiLanguage: true
    },
    submission: {
      method: 'pdf',
      pdfTemplate: 'nhif_registration_template'
    },
    sections: [
      {
        id: 'personal_details',
        title: 'Personal Details',
        fields: [
          {
            id: 'full_name',
            type: 'text',
            label: 'Full Name',
            validation: {
              required: true,
              minLength: 2,
              maxLength: 100
            },
            voiceEnabled: true,
            width: 'full'
          },
          {
            id: 'id_number',
            type: 'text',
            label: 'National ID Number',
            validation: {
              required: true,
              custom: 'kenyan_id'
            },
            voiceEnabled: true,
            width: 'half'
          },
          {
            id: 'date_of_birth',
            type: 'date',
            label: 'Date of Birth',
            validation: {
              required: true
            },
            width: 'half'
          },
          {
            id: 'gender',
            type: 'select',
            label: 'Gender',
            validation: {
              required: true
            },
            options: [
              { value: 'male', label: 'Male' },
              { value: 'female', label: 'Female' }
            ],
            voiceEnabled: true,
            width: 'half'
          },
          {
            id: 'marital_status',
            type: 'select',
            label: 'Marital Status',
            validation: {
              required: true
            },
            options: [
              { value: 'single', label: 'Single' },
              { value: 'married', label: 'Married' },
              { value: 'divorced', label: 'Divorced' },
              { value: 'widowed', label: 'Widowed' }
            ],
            voiceEnabled: true,
            width: 'half'
          }
        ]
      },
      {
        id: 'employment_info',
        title: 'Employment Information',
        fields: [
          {
            id: 'employment_status',
            type: 'select',
            label: 'Employment Status',
            validation: {
              required: true
            },
            options: [
              { value: 'employed', label: 'Employed' },
              { value: 'self_employed', label: 'Self Employed' },
              { value: 'unemployed', label: 'Unemployed' },
              { value: 'student', label: 'Student' },
              { value: 'retired', label: 'Retired' }
            ],
            voiceEnabled: true,
            width: 'full'
          },
          {
            id: 'employer_name',
            type: 'text',
            label: 'Employer Name',
            showIf: [
              { field: 'employment_status', operator: 'equals', value: 'employed' }
            ],
            requiredIf: [
              { field: 'employment_status', operator: 'equals', value: 'employed' }
            ],
            voiceEnabled: true,
            width: 'half'
          },
          {
            id: 'employer_number',
            type: 'text',
            label: 'Employer NHIF Number',
            showIf: [
              { field: 'employment_status', operator: 'equals', value: 'employed' }
            ],
            validation: {
              custom: 'nhif_number'
            },
            voiceEnabled: true,
            width: 'half'
          },
          {
            id: 'monthly_income',
            type: 'number',
            label: 'Monthly Income (KSh)',
            showIf: [
              { field: 'employment_status', operator: 'not_equals', value: 'unemployed' }
            ],
            validation: {
              min: 0,
              max: 10000000
            },
            voiceEnabled: true,
            width: 'half'
          }
        ]
      }
    ]
  }
]