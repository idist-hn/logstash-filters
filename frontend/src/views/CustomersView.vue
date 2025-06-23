<template>
  <AppLayout>
    <div class="customers-container">
      <!-- Header -->
      <div class="page-header">
        <div class="header-content">
          <h1 class="page-title">Customer Management</h1>
          <p class="page-description">Manage tenants, projects, and billing across your platform</p>
        </div>
        <div class="header-actions">
          <a-input-search
            v-model:value="searchQuery"
            placeholder="Search customers..."
            style="width: 300px"
            @search="onSearch"
          />
          <a-button type="primary" @click="showCreateModal = true">
            <UserAddOutlined />
            Add Customer
          </a-button>
        </div>
      </div>

      <!-- Stats Cards -->
      <a-row :gutter="[24, 24]" class="stats-row">
        <a-col :xs="24" :sm="12" :lg="6">
          <div class="stat-card">
            <div class="stat-icon customers">
              <TeamOutlined />
            </div>
            <div class="stat-content">
              <h3>Total Customers</h3>
              <span class="stat-value">{{ customerStats.total }}</span>
              <span class="stat-trend positive">+12 this month</span>
            </div>
          </div>
        </a-col>
        <a-col :xs="24" :sm="12" :lg="6">
          <div class="stat-card">
            <div class="stat-icon active">
              <CheckCircleOutlined />
            </div>
            <div class="stat-content">
              <h3>Active Customers</h3>
              <span class="stat-value">{{ customerStats.active }}</span>
              <span class="stat-trend positive">98.7% active rate</span>
            </div>
          </div>
        </a-col>
        <a-col :xs="24" :sm="12" :lg="6">
          <div class="stat-card">
            <div class="stat-icon resources">
              <ClusterOutlined />
            </div>
            <div class="stat-content">
              <h3>Resource Usage</h3>
              <span class="stat-value">{{ customerStats.resourceUsage }}%</span>
              <span class="stat-trend positive">Platform utilization</span>
            </div>
          </div>
        </a-col>
        <a-col :xs="24" :sm="12" :lg="6">
          <div class="stat-card">
            <div class="stat-icon projects">
              <ProjectOutlined />
            </div>
            <div class="stat-content">
              <h3>Total Projects</h3>
              <span class="stat-value">{{ customerStats.projects }}</span>
              <span class="stat-trend positive">+23 this month</span>
            </div>
          </div>
        </a-col>
      </a-row>

      <!-- Filters -->
      <div class="filters-section">
        <a-space wrap>
          <a-select v-model:value="filters.status" style="width: 120px" @change="applyFilters">
            <a-select-option value="all">All Status</a-select-option>
            <a-select-option value="active">Active</a-select-option>
            <a-select-option value="inactive">Inactive</a-select-option>
            <a-select-option value="suspended">Suspended</a-select-option>
          </a-select>
          
          <a-select v-model:value="filters.tier" style="width: 120px" @change="applyFilters">
            <a-select-option value="all">All Tiers</a-select-option>
            <a-select-option value="enterprise">Enterprise</a-select-option>
            <a-select-option value="business">Business</a-select-option>
            <a-select-option value="startup">Startup</a-select-option>
          </a-select>
          
          <a-select v-model:value="filters.region" style="width: 150px" @change="applyFilters">
            <a-select-option value="all">All Regions</a-select-option>
            <a-select-option value="us-east-1">US East 1</a-select-option>
            <a-select-option value="us-west-2">US West 2</a-select-option>
            <a-select-option value="eu-west-1">EU West 1</a-select-option>
            <a-select-option value="ap-southeast-1">AP Southeast 1</a-select-option>
          </a-select>
          
          <a-button @click="resetFilters">Reset</a-button>
          <a-button type="primary" @click="exportCustomers">
            <ExportOutlined />
            Export
          </a-button>
        </a-space>
      </div>

      <!-- Customers Table -->
      <a-card class="customers-table-card">
        <a-table
          :columns="columns"
          :data-source="filteredCustomers"
          :pagination="pagination"
          :loading="loading"
          row-key="id"
          size="middle"
          @change="handleTableChange"
        >
          <template #bodyCell="{ column, record }">
            <template v-if="column.key === 'customer'">
              <div class="customer-cell">
                <a-avatar :size="40" style="background-color: #1890ff">
                  {{ record.name.substring(0, 2).toUpperCase() }}
                </a-avatar>
                <div class="customer-info">
                  <h4 class="customer-name">{{ record.name }}</h4>
                  <span class="customer-email">{{ record.email }}</span>
                </div>
              </div>
            </template>
            
            <template v-else-if="column.key === 'status'">
              <a-badge :status="getStatusBadge(record.status)" :text="record.status" />
            </template>
            
            <template v-else-if="column.key === 'tier'">
              <a-tag :color="getTierColor(record.tier)">
                {{ record.tier.toUpperCase() }}
              </a-tag>
            </template>
            
            <template v-else-if="column.key === 'usage'">
              <div class="usage-cell">
                <span class="usage-amount">{{ record.resourceUsage }}% resources</span>
                <a-progress
                  :percent="record.resourceUsage"
                  :show-info="false"
                  size="small"
                  :stroke-color="getUsageColor(record.resourceUsage)"
                />
              </div>
            </template>
            
            <template v-else-if="column.key === 'projects'">
              <div class="projects-cell">
                <span class="project-count">{{ record.projectCount }}</span>
                <span class="project-label">projects</span>
              </div>
            </template>
            
            <template v-else-if="column.key === 'lastActivity'">
              <span class="last-activity">{{ formatDate(record.lastActivity) }}</span>
            </template>
            
            <template v-else-if="column.key === 'actions'">
              <a-dropdown>
                <a-button type="text">
                  <MoreOutlined />
                </a-button>
                <template #overlay>
                  <a-menu>
                    <a-menu-item key="view" @click="viewCustomer(record)">
                      <EyeOutlined />
                      View Details
                    </a-menu-item>
                    <a-menu-item key="projects" @click="viewProjects(record)">
                      <ProjectOutlined />
                      View Projects
                    </a-menu-item>
                    <a-menu-item key="resources" @click="viewResources(record)">
                      <ClusterOutlined />
                      Resources
                    </a-menu-item>
                    <a-menu-divider />
                    <a-menu-item key="edit" @click="editCustomer(record)">
                      <EditOutlined />
                      Edit
                    </a-menu-item>
                    <a-menu-item key="suspend" @click="suspendCustomer(record)" danger>
                      <StopOutlined />
                      Suspend
                    </a-menu-item>
                  </a-menu>
                </template>
              </a-dropdown>
            </template>
          </template>
        </a-table>
      </a-card>

      <!-- Create Customer Modal -->
      <a-modal
        v-model:open="showCreateModal"
        title="Add New Customer"
        width="600px"
        @ok="createCustomer"
        @cancel="resetCreateForm"
      >
        <a-form
          :model="createForm"
          layout="vertical"
          ref="createFormRef"
        >
          <a-row :gutter="16">
            <a-col :span="12">
              <a-form-item label="Company Name" name="name" :rules="[{ required: true }]">
                <a-input v-model:value="createForm.name" placeholder="Enter company name" />
              </a-form-item>
            </a-col>
            <a-col :span="12">
              <a-form-item label="Contact Email" name="email" :rules="[{ required: true, type: 'email' }]">
                <a-input v-model:value="createForm.email" placeholder="contact@company.com" />
              </a-form-item>
            </a-col>
          </a-row>
          
          <a-row :gutter="16">
            <a-col :span="12">
              <a-form-item label="Tier" name="tier" :rules="[{ required: true }]">
                <a-select v-model:value="createForm.tier" placeholder="Select tier">
                  <a-select-option value="startup">Startup</a-select-option>
                  <a-select-option value="business">Business</a-select-option>
                  <a-select-option value="enterprise">Enterprise</a-select-option>
                </a-select>
              </a-form-item>
            </a-col>
            <a-col :span="12">
              <a-form-item label="Region" name="region" :rules="[{ required: true }]">
                <a-select v-model:value="createForm.region" placeholder="Select region">
                  <a-select-option value="us-east-1">US East 1</a-select-option>
                  <a-select-option value="us-west-2">US West 2</a-select-option>
                  <a-select-option value="eu-west-1">EU West 1</a-select-option>
                  <a-select-option value="ap-southeast-1">AP Southeast 1</a-select-option>
                </a-select>
              </a-form-item>
            </a-col>
          </a-row>
          
          <a-form-item label="Contact Person" name="contactPerson">
            <a-input v-model:value="createForm.contactPerson" placeholder="John Doe" />
          </a-form-item>
          
          <a-form-item label="Phone" name="phone">
            <a-input v-model:value="createForm.phone" placeholder="+1 (555) 123-4567" />
          </a-form-item>
          
          <a-form-item label="Notes" name="notes">
            <a-textarea v-model:value="createForm.notes" :rows="3" placeholder="Additional notes..." />
          </a-form-item>
        </a-form>
      </a-modal>
    </div>
  </AppLayout>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import AppLayout from '@/components/AppLayout.vue'
import {
  UserAddOutlined,
  TeamOutlined,
  CheckCircleOutlined,
  ClusterOutlined,
  ProjectOutlined,
  ExportOutlined,
  MoreOutlined,
  EyeOutlined,
  EditOutlined,
  StopOutlined,
  SettingOutlined
} from '@ant-design/icons-vue'

const router = useRouter()
const loading = ref(false)
const searchQuery = ref('')
const showCreateModal = ref(false)

const customerStats = reactive({
  total: 156,
  active: 154,
  resourceUsage: 68.5,
  projects: 423
})

const filters = reactive({
  status: 'all',
  tier: 'all',
  region: 'all'
})

const createForm = reactive({
  name: '',
  email: '',
  tier: '',
  region: '',
  contactPerson: '',
  phone: '',
  notes: ''
})

const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 156,
  showSizeChanger: true,
  showQuickJumper: true,
  showTotal: (total: number, range: number[]) => `${range[0]}-${range[1]} of ${total} customers`
})

const columns = [
  { title: 'Customer', dataIndex: 'customer', key: 'customer', width: 250 },
  { title: 'Status', dataIndex: 'status', key: 'status', width: 100 },
  { title: 'Tier', dataIndex: 'tier', key: 'tier', width: 100 },
  { title: 'Resource Usage', dataIndex: 'usage', key: 'usage', width: 150 },
  { title: 'Projects', dataIndex: 'projects', key: 'projects', width: 100 },
  { title: 'Region', dataIndex: 'region', key: 'region', width: 120 },
  { title: 'Last Activity', dataIndex: 'lastActivity', key: 'lastActivity', width: 120 },
  { title: 'Actions', key: 'actions', width: 80, fixed: 'right' }
]

const customers = ref([
  {
    id: 1,
    name: 'TechCorp Solutions',
    email: 'contact@techcorp.com',
    status: 'active',
    tier: 'enterprise',
    resourceUsage: 24.5,
    projectCount: 12,
    region: 'us-east-1',
    lastActivity: new Date('2024-01-15'),
    contactPerson: 'John Smith',
    phone: '+1 (555) 123-4567'
  },
  {
    id: 2,
    name: 'Global Dynamics',
    email: 'admin@globaldynamics.com',
    status: 'active',
    tier: 'business',
    resourceUsage: 18.2,
    projectCount: 8,
    region: 'eu-west-1',
    lastActivity: new Date('2024-01-14'),
    contactPerson: 'Sarah Johnson',
    phone: '+44 20 7123 4567'
  },
  {
    id: 3,
    name: 'Innovation Labs',
    email: 'hello@innovationlabs.io',
    status: 'active',
    tier: 'startup',
    resourceUsage: 16.8,
    projectCount: 15,
    region: 'us-west-2',
    lastActivity: new Date('2024-01-13'),
    contactPerson: 'Mike Chen',
    phone: '+1 (415) 555-0123'
  },
  {
    id: 4,
    name: 'DataFlow Inc',
    email: 'support@dataflow.com',
    status: 'inactive',
    tier: 'business',
    resourceUsage: 12.4,
    projectCount: 6,
    region: 'ap-southeast-1',
    lastActivity: new Date('2024-01-10'),
    contactPerson: 'Lisa Wong',
    phone: '+65 6123 4567'
  }
])

const filteredCustomers = computed(() => {
  let result = customers.value

  if (searchQuery.value) {
    result = result.filter(customer => 
      customer.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchQuery.value.toLowerCase())
    )
  }

  if (filters.status !== 'all') {
    result = result.filter(customer => customer.status === filters.status)
  }

  if (filters.tier !== 'all') {
    result = result.filter(customer => customer.tier === filters.tier)
  }

  if (filters.region !== 'all') {
    result = result.filter(customer => customer.region === filters.region)
  }

  return result
})

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'active': return 'success'
    case 'inactive': return 'default'
    case 'suspended': return 'error'
    default: return 'default'
  }
}

const getTierColor = (tier: string) => {
  switch (tier) {
    case 'enterprise': return 'purple'
    case 'business': return 'blue'
    case 'startup': return 'green'
    default: return 'default'
  }
}

const getUsageColor = (usage: number) => {
  if (usage > 80) return '#f5222d'
  if (usage > 60) return '#faad14'
  return '#52c41a'
}

const formatDate = (date: Date) => {
  return date.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric' 
  })
}

const onSearch = (value: string) => {
  console.log('Search:', value)
}

const applyFilters = () => {
  console.log('Filters applied:', filters)
}

const resetFilters = () => {
  filters.status = 'all'
  filters.tier = 'all'
  filters.region = 'all'
}

const exportCustomers = () => {
  console.log('Exporting customers...')
}

const handleTableChange = (pag: any) => {
  pagination.current = pag.current
  pagination.pageSize = pag.pageSize
}

const viewCustomer = (customer: any) => {
  router.push(`/customers/${customer.id}`)
}

const viewProjects = (customer: any) => {
  router.push(`/customers/${customer.id}/projects`)
}

const viewResources = (customer: any) => {
  router.push(`/customers/${customer.id}/resources`)
}

const editCustomer = (customer: any) => {
  console.log('Edit customer:', customer)
}

const suspendCustomer = (customer: any) => {
  console.log('Suspend customer:', customer)
}

const createCustomer = () => {
  console.log('Create customer:', createForm)
  showCreateModal.value = false
  resetCreateForm()
}

const resetCreateForm = () => {
  Object.assign(createForm, {
    name: '',
    email: '',
    tier: '',
    region: '',
    contactPerson: '',
    phone: '',
    notes: ''
  })
}

onMounted(() => {
  // Load customers data
})
</script>

<style scoped>
/* Customer Management Styles */
.customers-container {
  width: 100%;
}

/* Page Header */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 32px;
  padding: 24px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.page-title {
  font-size: 28px;
  font-weight: 600;
  color: #262626;
  margin: 0 0 8px 0;
}

.page-description {
  font-size: 16px;
  color: #8c8c8c;
  margin: 0;
}

.header-actions {
  display: flex;
  gap: 16px;
  align-items: center;
}

/* Stats Cards */
.stats-row {
  margin-bottom: 32px;
}

.stat-card {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  border: 1px solid #f0f0f0;
  display: flex;
  align-items: center;
  gap: 16px;
  transition: all 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  color: white;
}

.stat-icon.customers {
  background: linear-gradient(135deg, #1890ff 0%, #096dd9 100%);
}

.stat-icon.active {
  background: linear-gradient(135deg, #52c41a 0%, #389e0d 100%);
}

.stat-icon.resources {
  background: linear-gradient(135deg, #722ed1 0%, #531dab 100%);
}

.stat-icon.projects {
  background: linear-gradient(135deg, #722ed1 0%, #531dab 100%);
}

.stat-content h3 {
  font-size: 14px;
  color: #8c8c8c;
  margin: 0 0 4px 0;
  font-weight: 500;
}

.stat-value {
  font-size: 24px;
  font-weight: 700;
  color: #262626;
  display: block;
  line-height: 1.2;
}

.stat-trend {
  font-size: 12px;
  margin-top: 4px;
  display: block;
}

.stat-trend.positive {
  color: #52c41a;
}

.stat-trend.negative {
  color: #f5222d;
}

/* Filters */
.filters-section {
  background: white;
  padding: 20px 24px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  margin-bottom: 24px;
}

/* Table Card */
.customers-table-card {
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  border: 1px solid #f0f0f0;
}

.customers-table-card :deep(.ant-card-body) {
  padding: 0;
}

.customers-table-card :deep(.ant-table) {
  border-radius: 12px;
}

.customers-table-card :deep(.ant-table-thead > tr > th) {
  background: #fafafa;
  border-bottom: 1px solid #f0f0f0;
  font-weight: 600;
  color: #262626;
}

.customers-table-card :deep(.ant-table-tbody > tr:hover > td) {
  background: #f5f5f5;
}

/* Table Cell Styles */
.customer-cell {
  display: flex;
  align-items: center;
  gap: 12px;
}

.customer-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.customer-name {
  font-size: 16px;
  font-weight: 600;
  color: #262626;
  margin: 0;
}

.customer-email {
  font-size: 12px;
  color: #8c8c8c;
}

.usage-cell {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.usage-amount {
  font-size: 14px;
  font-weight: 600;
  color: #262626;
}

.projects-cell {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.project-count {
  font-size: 18px;
  font-weight: 600;
  color: #262626;
}

.project-label {
  font-size: 12px;
  color: #8c8c8c;
}

.last-activity {
  font-size: 14px;
  color: #595959;
}

/* Responsive Design */
@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    gap: 20px;
    align-items: stretch;
  }

  .header-actions {
    flex-direction: column;
    align-items: stretch;
  }

  .stat-card {
    padding: 20px;
  }

  .stat-icon {
    width: 40px;
    height: 40px;
    font-size: 18px;
  }

  .stat-value {
    font-size: 20px;
  }
}

@media (max-width: 576px) {
  .customers-container {
    padding: 0 8px;
  }

  .page-header {
    padding: 20px;
  }

  .page-title {
    font-size: 24px;
  }

  .page-description {
    font-size: 14px;
  }

  .stat-card {
    padding: 16px;
  }

  .customer-cell {
    gap: 8px;
  }

  .customer-name {
    font-size: 14px;
  }

  .customer-email {
    font-size: 11px;
  }
}
</style>
