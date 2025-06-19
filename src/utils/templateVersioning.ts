import { FormTemplate } from '../types/form'

export interface TemplateVersion {
  version: string
  template: FormTemplate
  createdAt: Date
  createdBy: string
  changelog: string[]
  isActive: boolean
  migrationScript?: string
}

export interface VersionComparison {
  added: string[]
  removed: string[]
  modified: string[]
  fieldChanges: Record<string, {
    type: 'added' | 'removed' | 'modified'
    oldValue?: any
    newValue?: any
  }>
}

export class TemplateVersionManager {
  private versions: Map<string, TemplateVersion[]> = new Map()

  addVersion(templateId: string, template: FormTemplate, changelog: string[], createdBy: string): string {
    const versions = this.versions.get(templateId) || []
    
    // Generate new version number
    const newVersion = this.generateVersionNumber(versions)
    
    // Deactivate previous versions
    versions.forEach(v => v.isActive = false)
    
    const newVersionData: TemplateVersion = {
      version: newVersion,
      template: { ...template, version: newVersion },
      createdAt: new Date(),
      createdBy,
      changelog,
      isActive: true
    }
    
    versions.push(newVersionData)
    this.versions.set(templateId, versions)
    
    return newVersion
  }

  getActiveVersion(templateId: string): TemplateVersion | null {
    const versions = this.versions.get(templateId) || []
    return versions.find(v => v.isActive) || null
  }

  getVersion(templateId: string, version: string): TemplateVersion | null {
    const versions = this.versions.get(templateId) || []
    return versions.find(v => v.version === version) || null
  }

  getAllVersions(templateId: string): TemplateVersion[] {
    return this.versions.get(templateId) || []
  }

  compareVersions(templateId: string, version1: string, version2: string): VersionComparison {
    const v1 = this.getVersion(templateId, version1)
    const v2 = this.getVersion(templateId, version2)
    
    if (!v1 || !v2) {
      throw new Error('One or both versions not found')
    }

    return this.compareTemplates(v1.template, v2.template)
  }

  private compareTemplates(template1: FormTemplate, template2: FormTemplate): VersionComparison {
    const fields1 = this.extractAllFields(template1)
    const fields2 = this.extractAllFields(template2)
    
    const fieldIds1 = new Set(Object.keys(fields1))
    const fieldIds2 = new Set(Object.keys(fields2))
    
    const added = Array.from(fieldIds2).filter(id => !fieldIds1.has(id))
    const removed = Array.from(fieldIds1).filter(id => !fieldIds2.has(id))
    const common = Array.from(fieldIds1).filter(id => fieldIds2.has(id))
    
    const modified: string[] = []
    const fieldChanges: Record<string, any> = {}
    
    common.forEach(fieldId => {
      const field1 = fields1[fieldId]
      const field2 = fields2[fieldId]
      
      if (JSON.stringify(field1) !== JSON.stringify(field2)) {
        modified.push(fieldId)
        fieldChanges[fieldId] = {
          type: 'modified',
          oldValue: field1,
          newValue: field2
        }
      }
    })
    
    added.forEach(fieldId => {
      fieldChanges[fieldId] = {
        type: 'added',
        newValue: fields2[fieldId]
      }
    })
    
    removed.forEach(fieldId => {
      fieldChanges[fieldId] = {
        type: 'removed',
        oldValue: fields1[fieldId]
      }
    })

    return { added, removed, modified, fieldChanges }
  }

  private extractAllFields(template: FormTemplate): Record<string, any> {
    const fields: Record<string, any> = {}
    
    template.sections.forEach(section => {
      section.fields.forEach(field => {
        fields[field.id] = field
      })
    })
    
    return fields
  }

  private generateVersionNumber(versions: TemplateVersion[]): string {
    if (versions.length === 0) {
      return '1.0.0'
    }
    
    const latestVersion = versions
      .map(v => v.version)
      .sort((a, b) => this.compareVersionStrings(b, a))[0]
    
    const [major, minor, patch] = latestVersion.split('.').map(Number)
    
    // For now, increment patch version
    return `${major}.${minor}.${patch + 1}`
  }

  private compareVersionStrings(a: string, b: string): number {
    const aParts = a.split('.').map(Number)
    const bParts = b.split('.').map(Number)
    
    for (let i = 0; i < Math.max(aParts.length, bParts.length); i++) {
      const aPart = aParts[i] || 0
      const bPart = bParts[i] || 0
      
      if (aPart !== bPart) {
        return aPart - bPart
      }
    }
    
    return 0
  }

  migrateFormData(formData: any, fromVersion: string, toVersion: string, templateId: string): any {
    const fromTemplate = this.getVersion(templateId, fromVersion)
    const toTemplate = this.getVersion(templateId, toVersion)
    
    if (!fromTemplate || !toTemplate) {
      throw new Error('Template versions not found for migration')
    }

    const comparison = this.compareTemplates(fromTemplate.template, toTemplate.template)
    const migratedData = { ...formData }
    
    // Remove data for removed fields
    comparison.removed.forEach(fieldId => {
      delete migratedData.values[fieldId]
      delete migratedData.confidences[fieldId]
    })
    
    // Add default values for new fields
    comparison.added.forEach(fieldId => {
      const newField = this.extractAllFields(toTemplate.template)[fieldId]
      if (newField.defaultValue !== undefined) {
        migratedData.values[fieldId] = newField.defaultValue
      }
    })
    
    // Update template version
    migratedData.templateVersion = toVersion
    
    return migratedData
  }

  rollbackToVersion(templateId: string, version: string): boolean {
    const versions = this.versions.get(templateId) || []
    const targetVersion = versions.find(v => v.version === version)
    
    if (!targetVersion) {
      return false
    }
    
    // Deactivate all versions
    versions.forEach(v => v.isActive = false)
    
    // Activate target version
    targetVersion.isActive = true
    
    return true
  }

  exportVersionHistory(templateId: string): string {
    const versions = this.getAllVersions(templateId)
    
    const exportData = {
      templateId,
      versions: versions.map(v => ({
        version: v.version,
        createdAt: v.createdAt,
        createdBy: v.createdBy,
        changelog: v.changelog,
        isActive: v.isActive,
        template: v.template
      })),
      exportedAt: new Date()
    }
    
    return JSON.stringify(exportData, null, 2)
  }

  importVersionHistory(templateId: string, exportData: string): boolean {
    try {
      const data = JSON.parse(exportData)
      
      const versions: TemplateVersion[] = data.versions.map((v: any) => ({
        ...v,
        createdAt: new Date(v.createdAt)
      }))
      
      this.versions.set(templateId, versions)
      return true
    } catch (error) {
      console.error('Failed to import version history:', error)
      return false
    }
  }
}

export const templateVersionManager = new TemplateVersionManager()