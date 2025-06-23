import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useCustomerStore = defineStore('customer', () => {
  // State
  const selectedCustomer = ref(null)
  const selectedProject = ref(null)
  const customers = ref([])
  const projects = ref([])
  const loading = ref(false)

  // Computed
  const isSystemView = computed(() => !selectedCustomer.value)
  const isCustomerView = computed(() => selectedCustomer.value && !selectedProject.value)
  const isProjectView = computed(() => selectedCustomer.value && selectedProject.value)

  const currentViewTitle = computed(() => {
    if (isProjectView.value) {
      return `${selectedCustomer.value.name} - ${selectedProject.value.name}`
    }
    if (isCustomerView.value) {
      return selectedCustomer.value.name
    }
    return 'System Overview'
  })

  const currentViewScope = computed(() => {
    if (isProjectView.value) {
      return {
        type: 'project',
        customerId: selectedCustomer.value.id,
        projectId: selectedProject.value.id,
        customerName: selectedCustomer.value.name,
        projectName: selectedProject.value.name
      }
    }
    if (isCustomerView.value) {
      return {
        type: 'customer',
        customerId: selectedCustomer.value.id,
        customerName: selectedCustomer.value.name
      }
    }
    return {
      type: 'system'
    }
  })

  // Actions
  const fetchCustomers = async () => {
    loading.value = true
    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 500))
      customers.value = [
        {
          id: 'cust-001',
          name: 'Viettel Group',
          tier: 'enterprise',
          status: 'active',
          region: 'ap-southeast-1',
          projectCount: 12,
          resourceUsage: {
            cpu: 75,
            memory: 68,
            storage: 82
          }
        },
        {
          id: 'cust-002',
          name: 'FPT Corporation',
          tier: 'business',
          status: 'active',
          region: 'ap-southeast-1',
          projectCount: 8,
          resourceUsage: {
            cpu: 45,
            memory: 52,
            storage: 38
          }
        },
        {
          id: 'cust-003',
          name: 'VNG Corporation',
          tier: 'enterprise',
          status: 'active',
          region: 'us-west-2',
          projectCount: 15,
          resourceUsage: {
            cpu: 88,
            memory: 91,
            storage: 76
          }
        },
        {
          id: 'cust-004',
          name: 'Techcombank',
          tier: 'enterprise',
          status: 'active',
          region: 'ap-southeast-1',
          projectCount: 6,
          resourceUsage: {
            cpu: 32,
            memory: 28,
            storage: 45
          }
        },
        {
          id: 'cust-005',
          name: 'Grab Vietnam',
          tier: 'business',
          status: 'active',
          region: 'ap-southeast-1',
          projectCount: 20,
          resourceUsage: {
            cpu: 95,
            memory: 87,
            storage: 92
          }
        }
      ]
    } catch (error) {
      console.error('Failed to fetch customers:', error)
    } finally {
      loading.value = false
    }
  }

  const fetchProjects = async (customerId) => {
    loading.value = true
    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 300))
      
      const projectsByCustomer = {
        'cust-001': [
          { id: 'proj-001', name: 'Viettel Cloud Platform', environment: 'production', status: 'active' },
          { id: 'proj-002', name: 'MyViettel App Backend', environment: 'production', status: 'active' },
          { id: 'proj-003', name: 'ViettelPay Services', environment: 'production', status: 'active' },
          { id: 'proj-004', name: 'IoT Management System', environment: 'staging', status: 'active' }
        ],
        'cust-002': [
          { id: 'proj-005', name: 'FPT.AI Platform', environment: 'production', status: 'active' },
          { id: 'proj-006', name: 'FPT Shop E-commerce', environment: 'production', status: 'active' },
          { id: 'proj-007', name: 'Education Platform', environment: 'staging', status: 'active' }
        ],
        'cust-003': [
          { id: 'proj-008', name: 'Zalo Messaging Service', environment: 'production', status: 'active' },
          { id: 'proj-009', name: 'ZaloPay Backend', environment: 'production', status: 'active' },
          { id: 'proj-010', name: 'VNG Cloud Services', environment: 'production', status: 'active' },
          { id: 'proj-011', name: 'Gaming Platform', environment: 'staging', status: 'active' }
        ],
        'cust-004': [
          { id: 'proj-012', name: 'Core Banking System', environment: 'production', status: 'active' },
          { id: 'proj-013', name: 'Mobile Banking App', environment: 'production', status: 'active' },
          { id: 'proj-014', name: 'Risk Management', environment: 'staging', status: 'active' }
        ],
        'cust-005': [
          { id: 'proj-015', name: 'Grab Driver App', environment: 'production', status: 'active' },
          { id: 'proj-016', name: 'Grab Food Platform', environment: 'production', status: 'active' },
          { id: 'proj-017', name: 'GrabPay Services', environment: 'production', status: 'active' },
          { id: 'proj-018', name: 'Analytics Platform', environment: 'staging', status: 'active' }
        ]
      }
      
      projects.value = projectsByCustomer[customerId] || []
    } catch (error) {
      console.error('Failed to fetch projects:', error)
    } finally {
      loading.value = false
    }
  }

  const selectCustomer = async (customer) => {
    selectedCustomer.value = customer
    selectedProject.value = null
    if (customer) {
      await fetchProjects(customer.id)
    } else {
      projects.value = []
    }
  }

  const selectProject = (project) => {
    selectedProject.value = project
  }

  const clearSelection = () => {
    selectedCustomer.value = null
    selectedProject.value = null
    projects.value = []
  }

  const getFilteredData = (data, scope = currentViewScope.value) => {
    if (scope.type === 'system') {
      return data // Return all system data
    }
    
    if (scope.type === 'customer') {
      // Filter data by customer
      return data.filter(item => item.customerId === scope.customerId)
    }
    
    if (scope.type === 'project') {
      // Filter data by specific project
      return data.filter(item => 
        item.customerId === scope.customerId && 
        item.projectId === scope.projectId
      )
    }
    
    return data
  }

  // Initialize
  fetchCustomers()

  return {
    // State
    selectedCustomer,
    selectedProject,
    customers,
    projects,
    loading,
    
    // Computed
    isSystemView,
    isCustomerView,
    isProjectView,
    currentViewTitle,
    currentViewScope,
    
    // Actions
    fetchCustomers,
    fetchProjects,
    selectCustomer,
    selectProject,
    clearSelection,
    getFilteredData
  }
})
