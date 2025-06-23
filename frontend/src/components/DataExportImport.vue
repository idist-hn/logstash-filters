<template>
  <div class="data-export-import">
    <!-- Export Section -->
    <a-card title="Export Data" class="export-section">
      <template #extra>
        <a-button 
          type="primary" 
          :loading="exporting"
          @click="exportData"
          :disabled="!selectedExportData.length"
        >
          <DownloadOutlined />
          Export
        </a-button>
      </template>
      
      <div class="export-options">
        <div class="option-group">
          <label>Data Type:</label>
          <a-checkbox-group v-model:value="selectedExportData" @change="onExportDataChange">
            <a-checkbox value="metrics">Platform Metrics</a-checkbox>
            <a-checkbox value="customers">Customer Data</a-checkbox>
            <a-checkbox value="projects">Project Information</a-checkbox>
            <a-checkbox value="logs">System Logs</a-checkbox>
            <a-checkbox value="alerts">Alert History</a-checkbox>
          </a-checkbox-group>
        </div>
        
        <div class="option-group">
          <label>Format:</label>
          <a-radio-group v-model:value="exportFormat">
            <a-radio value="csv">CSV</a-radio>
            <a-radio value="excel">Excel</a-radio>
            <a-radio value="json">JSON</a-radio>
          </a-radio-group>
        </div>
        
        <div class="option-group">
          <label>Date Range:</label>
          <a-range-picker
            v-model:value="exportDateRange"
            style="width: 300px"
            :disabled-date="disabledDate"
          />
        </div>
        
        <div class="option-group">
          <label>Filters:</label>
          <div class="filter-controls">
            <a-select
              v-model:value="exportFilters.status"
              placeholder="Status"
              style="width: 120px"
              allow-clear
            >
              <a-select-option value="active">Active</a-select-option>
              <a-select-option value="inactive">Inactive</a-select-option>
              <a-select-option value="error">Error</a-select-option>
            </a-select>
            
            <a-select
              v-model:value="exportFilters.region"
              placeholder="Region"
              style="width: 120px"
              allow-clear
            >
              <a-select-option value="us-east">US East</a-select-option>
              <a-select-option value="us-west">US West</a-select-option>
              <a-select-option value="eu-central">EU Central</a-select-option>
            </a-select>
          </div>
        </div>
      </div>
      
      <div v-if="exportPreview.length > 0" class="export-preview">
        <h4>Preview ({{ exportPreview.length }} records)</h4>
        <a-table
          :columns="previewColumns"
          :data-source="exportPreview.slice(0, 5)"
          :pagination="false"
          size="small"
          :scroll="{ x: 600 }"
        />
        <div v-if="exportPreview.length > 5" class="preview-more">
          ... and {{ exportPreview.length - 5 }} more records
        </div>
      </div>
    </a-card>
    
    <!-- Import Section -->
    <a-card title="Import Data" class="import-section">
      <template #extra>
        <a-button 
          type="primary" 
          :loading="importing"
          @click="importData"
          :disabled="!importFile"
        >
          <UploadOutlined />
          Import
        </a-button>
      </template>
      
      <div class="import-options">
        <div class="option-group">
          <label>Import Type:</label>
          <a-radio-group v-model:value="importType">
            <a-radio value="customers">Customer Data</a-radio>
            <a-radio value="projects">Project Information</a-radio>
            <a-radio value="users">User Accounts</a-radio>
          </a-radio-group>
        </div>
        
        <div class="option-group">
          <label>File Upload:</label>
          <a-upload-dragger
            v-model:file-list="fileList"
            :before-upload="beforeUpload"
            :remove="removeFile"
            accept=".csv,.xlsx,.json"
            :multiple="false"
          >
            <p class="ant-upload-drag-icon">
              <InboxOutlined />
            </p>
            <p class="ant-upload-text">Click or drag file to this area to upload</p>
            <p class="ant-upload-hint">
              Support CSV, Excel, and JSON files. Maximum file size: 10MB
            </p>
          </a-upload-dragger>
        </div>
        
        <div v-if="importFile" class="import-options-advanced">
          <div class="option-group">
            <label>Import Mode:</label>
            <a-radio-group v-model:value="importMode">
              <a-radio value="create">Create New Only</a-radio>
              <a-radio value="update">Update Existing</a-radio>
              <a-radio value="upsert">Create or Update</a-radio>
            </a-radio-group>
          </div>
          
          <div class="option-group">
            <a-checkbox v-model:checked="validateBeforeImport">
              Validate data before import
            </a-checkbox>
            <a-checkbox v-model:checked="createBackup">
              Create backup before import
            </a-checkbox>
          </div>
        </div>
      </div>
      
      <div v-if="importPreview.length > 0" class="import-preview">
        <h4>Import Preview ({{ importPreview.length }} records)</h4>
        <a-table
          :columns="importPreviewColumns"
          :data-source="importPreview.slice(0, 5)"
          :pagination="false"
          size="small"
          :scroll="{ x: 600 }"
        />
        <div v-if="importPreview.length > 5" class="preview-more">
          ... and {{ importPreview.length - 5 }} more records
        </div>
        
        <div v-if="importErrors.length > 0" class="import-errors">
          <h4>Validation Errors ({{ importErrors.length }})</h4>
          <a-list
            :data-source="importErrors.slice(0, 3)"
            size="small"
          >
            <template #renderItem="{ item }">
              <a-list-item>
                <a-typography-text type="danger">
                  Row {{ item.row }}: {{ item.message }}
                </a-typography-text>
              </a-list-item>
            </template>
          </a-list>
          <div v-if="importErrors.length > 3" class="errors-more">
            ... and {{ importErrors.length - 3 }} more errors
          </div>
        </div>
      </div>
    </a-card>
    
    <!-- Export History -->
    <a-card title="Export History" class="history-section">
      <a-table
        :columns="historyColumns"
        :data-source="exportHistory"
        :pagination="{ pageSize: 5 }"
        size="small"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'actions'">
            <a-space>
              <a-button 
                type="link" 
                size="small"
                @click="downloadExport(record)"
                :disabled="!record.downloadUrl"
              >
                Download
              </a-button>
              <a-button 
                type="link" 
                size="small" 
                danger
                @click="deleteExport(record)"
              >
                Delete
              </a-button>
            </a-space>
          </template>
          <template v-else-if="column.key === 'status'">
            <a-tag :color="getStatusColor(record.status)">
              {{ record.status }}
            </a-tag>
          </template>
        </template>
      </a-table>
    </a-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue'
import { 
  DownloadOutlined, 
  UploadOutlined, 
  InboxOutlined 
} from '@ant-design/icons-vue'
import { useToast } from '@/composables/useToast'
import type { UploadFile } from 'ant-design-vue'

// Props & Emits
interface Props {
  visible?: boolean
}

interface Emits {
  (e: 'export-complete', data: any): void
  (e: 'import-complete', data: any): void
}

const props = withDefaults(defineProps<Props>(), {
  visible: false
})

const emit = defineEmits<Emits>()

// Composables
const toast = useToast()

// Reactive state
const exporting = ref(false)
const importing = ref(false)
const selectedExportData = ref<string[]>(['metrics'])
const exportFormat = ref('csv')
const exportDateRange = ref<[string, string] | null>(null)
const exportFilters = reactive({
  status: '',
  region: ''
})

const importType = ref('customers')
const importMode = ref('create')
const validateBeforeImport = ref(true)
const createBackup = ref(true)
const importFile = ref<File | null>(null)
const fileList = ref<UploadFile[]>([])

const exportPreview = ref<any[]>([])
const importPreview = ref<any[]>([])
const importErrors = ref<any[]>([])

// Mock data
const exportHistory = ref([
  {
    id: '1',
    type: 'Platform Metrics',
    format: 'CSV',
    date: '2024-01-15 10:30:00',
    status: 'completed',
    size: '2.5 MB',
    downloadUrl: '/exports/metrics-20240115.csv'
  },
  {
    id: '2',
    type: 'Customer Data',
    format: 'Excel',
    date: '2024-01-14 15:45:00',
    status: 'completed',
    size: '1.8 MB',
    downloadUrl: '/exports/customers-20240114.xlsx'
  }
])

// Computed
const previewColumns = computed(() => [
  { title: 'ID', dataIndex: 'id', key: 'id', width: 80 },
  { title: 'Name', dataIndex: 'name', key: 'name' },
  { title: 'Type', dataIndex: 'type', key: 'type' },
  { title: 'Status', dataIndex: 'status', key: 'status' },
  { title: 'Date', dataIndex: 'date', key: 'date' }
])

const importPreviewColumns = computed(() => [
  { title: 'Row', dataIndex: 'row', key: 'row', width: 60 },
  { title: 'Name', dataIndex: 'name', key: 'name' },
  { title: 'Email', dataIndex: 'email', key: 'email' },
  { title: 'Status', dataIndex: 'status', key: 'status' },
  { title: 'Valid', dataIndex: 'valid', key: 'valid' }
])

const historyColumns = [
  { title: 'Type', dataIndex: 'type', key: 'type' },
  { title: 'Format', dataIndex: 'format', key: 'format' },
  { title: 'Date', dataIndex: 'date', key: 'date' },
  { title: 'Status', dataIndex: 'status', key: 'status' },
  { title: 'Size', dataIndex: 'size', key: 'size' },
  { title: 'Actions', key: 'actions' }
]

// Methods
const onExportDataChange = () => {
  generateExportPreview()
}

const generateExportPreview = () => {
  // Mock preview data generation
  const mockData = []
  for (let i = 1; i <= 10; i++) {
    mockData.push({
      id: i,
      name: `Item ${i}`,
      type: selectedExportData.value[0] || 'metrics',
      status: ['active', 'inactive', 'error'][i % 3],
      date: new Date(Date.now() - i * 86400000).toISOString().split('T')[0]
    })
  }
  exportPreview.value = mockData
}

const exportData = async () => {
  exporting.value = true
  
  try {
    // Simulate export process
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // Generate download
    const blob = new Blob(['mock,export,data\n1,test,value'], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `export-${Date.now()}.${exportFormat.value}`
    a.click()
    URL.revokeObjectURL(url)
    
    toast.success('Data exported successfully')
    emit('export-complete', { type: selectedExportData.value, format: exportFormat.value })
  } catch (error) {
    toast.error('Export failed')
  } finally {
    exporting.value = false
  }
}

const beforeUpload = (file: File) => {
  importFile.value = file
  parseImportFile(file)
  return false // Prevent auto upload
}

const removeFile = () => {
  importFile.value = null
  importPreview.value = []
  importErrors.value = []
}

const parseImportFile = async (file: File) => {
  try {
    const text = await file.text()
    
    // Simple CSV parsing for demo
    const lines = text.split('\n')
    const headers = lines[0].split(',')
    const data = []
    const errors = []
    
    for (let i = 1; i < Math.min(lines.length, 11); i++) {
      const values = lines[i].split(',')
      const row = {
        row: i,
        name: values[0] || '',
        email: values[1] || '',
        status: values[2] || '',
        valid: true
      }
      
      // Simple validation
      if (!row.name) {
        errors.push({ row: i, message: 'Name is required' })
        row.valid = false
      }
      if (!row.email || !row.email.includes('@')) {
        errors.push({ row: i, message: 'Valid email is required' })
        row.valid = false
      }
      
      data.push(row)
    }
    
    importPreview.value = data
    importErrors.value = errors
  } catch (error) {
    toast.error('Failed to parse file')
  }
}

const importData = async () => {
  importing.value = true
  
  try {
    // Simulate import process
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    toast.success(`Successfully imported ${importPreview.value.length} records`)
    emit('import-complete', { type: importType.value, records: importPreview.value.length })
  } catch (error) {
    toast.error('Import failed')
  } finally {
    importing.value = false
  }
}

const downloadExport = (record: any) => {
  // Simulate download
  toast.info(`Downloading ${record.type}...`)
}

const deleteExport = (record: any) => {
  const index = exportHistory.value.findIndex(item => item.id === record.id)
  if (index > -1) {
    exportHistory.value.splice(index, 1)
    toast.success('Export deleted')
  }
}

const getStatusColor = (status: string) => {
  const colors = {
    completed: 'green',
    processing: 'blue',
    failed: 'red'
  }
  return colors[status as keyof typeof colors] || 'default'
}

const disabledDate = (current: any) => {
  // Disable future dates
  return current && current > new Date()
}

// Initialize
generateExportPreview()
</script>

<style lang="scss" scoped>
.data-export-import {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.export-section,
.import-section,
.history-section {
  .ant-card-head {
    background: var(--bg-secondary);
    border-bottom: 1px solid var(--border-color);
  }
}

.export-options,
.import-options {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.option-group {
  display: flex;
  flex-direction: column;
  gap: 8px;

  label {
    font-weight: 600;
    color: var(--text-primary);
    font-size: 14px;
  }
}

.filter-controls {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.import-options-advanced {
  padding-top: 16px;
  border-top: 1px solid var(--border-color);
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.export-preview,
.import-preview {
  margin-top: 20px;
  padding: 16px;
  background: var(--bg-tertiary);
  border-radius: 8px;
  border: 1px solid var(--border-color);

  h4 {
    margin: 0 0 12px 0;
    color: var(--text-primary);
  }
}

.preview-more,
.errors-more {
  margin-top: 8px;
  font-size: 12px;
  color: var(--text-tertiary);
  text-align: center;
}

.import-errors {
  margin-top: 16px;
  padding: 12px;
  background: rgba(255, 77, 79, 0.05);
  border: 1px solid rgba(255, 77, 79, 0.2);
  border-radius: 6px;

  h4 {
    margin: 0 0 8px 0;
    color: #ff4d4f;
  }
}

/* Responsive */
@media (max-width: 768px) {
  .filter-controls {
    flex-direction: column;
  }
  
  .option-group {
    .ant-radio-group,
    .ant-checkbox-group {
      flex-direction: column;
      gap: 8px;
    }
  }
}
</style>
