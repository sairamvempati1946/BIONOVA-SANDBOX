// src/pages/ProjectAccess.jsx
import React, { useState } from 'react';
import {
  Search, Folder, Users, Plus, X, Eye, Edit, Shield,
  UserPlus, UserMinus, ChevronDown, ChevronRight, FileText,
  CheckCircle, AlertCircle, Save, Building2, Settings,
  Check, ArrowLeft, Pencil, Trash2, User, Calendar, Clock,
  Grid, List, LayoutGrid, UserCheck, UserX, UserCog, UserCheck as UserApprover,
  PauseCircle, TrendingUp, TrendingDown, Minus
} from 'lucide-react';
import Sidebar from '../Sidebar';
import Header from '../Header';
import AlertModal from '../AlertModal';
import '../../styles/ProjectAccess.css';

// ── SCREEN DEFINITIONS ──
const SCREEN_GROUPS = [
  {
    id: 'company-master',
    name: 'Company Master',
    icon: Building2,
    screens: [
      { id: 'admin-dashboard', name: 'Admin Dashboard' },
      { id: 'company-creation', name: 'Company Creation' },
      { id: 'employee-creation', name: 'Employee Creation' }
    ]
  },
  {
    id: 'project',
    name: 'Project Management',
    icon: Folder,
    screens: [
      { id: 'project-creation', name: 'Project Creation' },
      { id: 'task-board', name: 'Task Board' },
      { id: 'project-dashboard', name: 'Project Dashboard' }
    ]
  },
  {
    id: 'user',
    name: 'User Modules',
    icon: Users,
    screens: [
      { id: 'user-dashboard', name: 'User Dashboard' },
      { id: 'my-tasks', name: 'My Tasks' }
    ]
  },
  {
    id: 'settings',
    name: 'System Settings',
    icon: Settings,
    screens: [
      { id: 'assign-access', name: 'Assign Access' },
      { id: 'profile', name: 'Profile' }
    ]
  }
];

const PERMISSION_TYPES = ['view', 'create', 'edit', 'delete'];

const PERMISSION_STATES = {
  EMPTY: 'empty',
  BLUE: 'blue',
  GREEN: 'green',
  RED: 'red'
};

// ── STATIC PERMISSIONS ──
const STATIC_PERMISSIONS = {
  'admin-dashboard': { view: true, create: true, edit: true, delete: false },
  'company-creation': { view: true, create: false, edit: false, delete: false },
  'employee-creation': { view: true, create: false, edit: false, delete: false },
  'project-creation': { view: true, create: true, edit: true, delete: false },
  'task-board': { view: true, create: true, edit: true, delete: false },
  'project-dashboard': { view: true, create: false, edit: false, delete: false },
  'user-dashboard': { view: true, create: false, edit: false, delete: false },
  'my-tasks': { view: true, create: false, edit: false, delete: false },
  'assign-access': { view: false, create: false, edit: false, delete: false },
  'profile': { view: true, create: false, edit: true, delete: false }
};

// ── PROJECTS DATA ──
const PROJECTS = [
  // ── Active Projects ──
  {
    id: 'PRJ-001',
    name: 'CBG Plant Expansion - Phase 1',
    code: 'PRJ-001',
    description: 'Expansion of CBG plant with new equipment and facilities across 5 locations',
    manager: 'Suresh Babu (EMP1009)',
    department: 'Operations',
    status: 'active',
    progress: 65,
    startDate: '2024-01-15',
    endDate: '2024-12-31',
    assignedEmployees: ['EMP1001', 'EMP1002', 'EMP1003', 'EMP1004', 'EMP1005', 'EMP1006', 'EMP1007', 'EMP1008', 'EMP1009'],
    permissions: { ...STATIC_PERMISSIONS },
    priority: 'high',
    tasks: { total: 126, completed: 82 }
  },
  {
    id: 'PRJ-002',
    name: 'Digital Transformation - Phase 2',
    code: 'PRJ-002',
    description: 'Digital transformation initiative for improved operations and customer experience',
    manager: 'Priya Sharma (EMP1010)',
    department: 'IT',
    status: 'active',
    progress: 40,
    startDate: '2024-03-01',
    endDate: '2024-11-30',
    assignedEmployees: ['EMP1010', 'EMP1011'],
    permissions: {
      'admin-dashboard': { view: true, create: false, edit: false, delete: false },
      'project-creation': { view: true, create: true, edit: true, delete: false }
    },
    priority: 'medium',
    tasks: { total: 84, completed: 34 }
  },

  // ── Upcoming Projects ──
  {
    id: 'PRJ-003',
    name: 'Quality Management System Implementation',
    code: 'PRJ-003',
    description: 'Implementation of quality management system across all plants',
    manager: 'Ananya I (EMP1007)',
    department: 'Quality',
    status: 'upcoming',
    progress: 0,
    startDate: '2024-07-01',
    endDate: '2025-03-31',
    assignedEmployees: ['EMP1007', 'EMP1008', 'EMP1009'],
    permissions: {
      'admin-dashboard': { view: true, create: false, edit: false, delete: false },
      'project-creation': { view: true, create: false, edit: false, delete: false }
    },
    priority: 'low',
    tasks: { total: 54, completed: 0 }
  },
  {
    id: 'PRJ-004',
    name: 'AI Chatbot Integration',
    code: 'PRJ-004',
    description: 'AI-powered chatbot for customer support automation',
    manager: 'Priya Sharma (EMP1010)',
    department: 'IT',
    status: 'upcoming',
    progress: 0,
    startDate: '2024-08-01',
    endDate: '2025-02-28',
    assignedEmployees: ['EMP1010', 'EMP1011'],
    permissions: {
      'admin-dashboard': { view: true, create: false, edit: false, delete: false },
      'project-creation': { view: true, create: false, edit: false, delete: false }
    },
    priority: 'medium',
    tasks: { total: 42, completed: 0 }
  },

  // ── Completed Projects ──
  {
    id: 'PRJ-005',
    name: 'Website Redesign & Rebranding',
    code: 'PRJ-005',
    description: 'Complete website redesign and corporate rebranding initiative',
    manager: 'Emily Brown (EMP1012)',
    department: 'Design',
    status: 'completed',
    progress: 100,
    startDate: '2023-06-01',
    endDate: '2023-12-31',
    assignedEmployees: ['EMP1012', 'EMP1013', 'EMP1014'],
    permissions: {
      'admin-dashboard': { view: true, create: false, edit: false, delete: false },
      'project-creation': { view: true, create: false, edit: false, delete: false }
    },
    priority: 'high',
    tasks: { total: 68, completed: 68 }
  },
  {
    id: 'PRJ-006',
    name: 'Legacy Data Migration',
    code: 'PRJ-006',
    description: 'Migration of legacy data to new cloud platform',
    manager: 'Mike Johnson (EMP1015)',
    department: 'Data',
    status: 'completed',
    progress: 100,
    startDate: '2023-09-01',
    endDate: '2024-02-28',
    assignedEmployees: ['EMP1015', 'EMP1016'],
    permissions: {
      'admin-dashboard': { view: true, create: false, edit: false, delete: false },
      'project-creation': { view: true, create: false, edit: false, delete: false }
    },
    priority: 'medium',
    tasks: { total: 52, completed: 52 }
  },

  // ── On-Hold Projects ──
  {
    id: 'PRJ-007',
    name: 'Mobile App Development',
    code: 'PRJ-007',
    description: 'Cross-platform mobile application for field operations',
    manager: 'Jane Smith (EMP1017)',
    department: 'Development',
    status: 'on-hold',
    progress: 35,
    startDate: '2024-02-01',
    endDate: '2024-10-31',
    assignedEmployees: ['EMP1017', 'EMP1018', 'EMP1019'],
    permissions: {
      'admin-dashboard': { view: true, create: false, edit: false, delete: false },
      'project-creation': { view: true, create: false, edit: false, delete: false }
    },
    priority: 'high',
    tasks: { total: 96, completed: 34 }
  },
  {
    id: 'PRJ-008',
    name: 'Supply Chain Optimization',
    code: 'PRJ-008',
    description: 'Optimization of supply chain with predictive analytics',
    manager: 'Suresh Babu (EMP1009)',
    department: 'Operations',
    status: 'on-hold',
    progress: 20,
    startDate: '2024-04-01',
    endDate: '2024-12-31',
    assignedEmployees: ['EMP1009', 'EMP1001', 'EMP1002'],
    permissions: {
      'admin-dashboard': { view: true, create: false, edit: false, delete: false },
      'project-creation': { view: true, create: false, edit: false, delete: false }
    },
    priority: 'low',
    tasks: { total: 78, completed: 16 }
  }
];

// ── EMPLOYEES ──
const EMPLOYEES = [
  { id: 'EMP1001', name: 'Saima V', designation: 'Site Engineer', department: 'Civil' },
  { id: 'EMP1002', name: 'Ravi K', designation: 'Surveyor', department: 'Civil' },
  { id: 'EMP1003', name: 'Priya S', designation: 'Design Engineer', department: 'Design' },
  { id: 'EMP1004', name: 'Amit P', designation: 'Procurement Officer', department: 'Procurement' },
  { id: 'EMP1005', name: 'Sneha R', designation: 'Materials Engineer', department: 'Procurement' },
  { id: 'EMP1006', name: 'Vikram S', designation: 'Civil Engineer', department: 'Civil' },
  { id: 'EMP1007', name: 'Ananya I', designation: 'Structural Engineer', department: 'Civil' },
  { id: 'EMP1008', name: 'Kiran R', designation: 'Mechanical Engineer', department: 'Mechanical' },
  { id: 'EMP1009', name: 'Suresh Babu', designation: 'Project Manager', department: 'Operations' },
  { id: 'EMP1010', name: 'Priya Sharma', designation: 'IT Manager', department: 'IT' },
  { id: 'EMP1011', name: 'Rahul K', designation: 'Developer', department: 'IT' },
  { id: 'EMP1012', name: 'Emily Brown', designation: 'Design Lead', department: 'Design' },
  { id: 'EMP1013', name: 'Sarah Wilson', designation: 'UI/UX Designer', department: 'Design' },
  { id: 'EMP1014', name: 'Alex Turner', designation: 'Frontend Developer', department: 'Design' },
  { id: 'EMP1015', name: 'Mike Johnson', designation: 'Data Architect', department: 'Data' },
  { id: 'EMP1016', name: 'Lisa Park', designation: 'Data Engineer', department: 'Data' },
  { id: 'EMP1017', name: 'Jane Smith', designation: 'Mobile Developer', department: 'Development' },
  { id: 'EMP1018', name: 'Tom Harris', designation: 'Backend Developer', department: 'Development' },
  { id: 'EMP1019', name: 'Nina Gupta', designation: 'DevOps Engineer', department: 'Development' }
];

// ── MILESTONES WITH TASKS ──
const MILESTONES = [
  {
    id: 'M-001',
    name: 'Site Preparation',
    tasks: [
      { id: 'T-001', name: 'Soil Investigation', assignee: 'Saima V (EMP1001)', reviewer: 'Vikram S (EMP1006)', approver: 'Suresh Babu (EMP1009)', status: 'In Progress' },
      { id: 'T-002', name: 'Site Survey', assignee: 'Ravi K (EMP1002)', status: 'Completed' },
      { id: 'T-003', name: 'Concept Review', assignee: 'Priya S (EMP1003)', reviewer: 'Kiran R (EMP1008)', status: 'Pending' }
    ]
  },
  {
    id: 'M-002',
    name: 'Procurement',
    tasks: [
      { id: 'T-015', name: 'Vendor Evaluation', assignee: 'Amit P (EMP1004)', reviewer: 'Priya S (EMP1003)', approver: 'Suresh Babu (EMP1009)', status: 'In Progress' },
      { id: 'T-016', name: 'Material Takeoff', assignee: 'Sneha R (EMP1005)', status: 'Pending' }
    ]
  },
  {
    id: 'M-003',
    name: 'Civil Construction',
    tasks: [
      { id: 'T-021', name: 'Foundation Work', assignee: 'Vikram S (EMP1006)', status: 'Completed' },
      { id: 'T-022', name: 'Rebar Installation', assignee: 'Ananya I (EMP1007)', reviewer: 'Vikram S (EMP1006)', approver: 'Suresh Babu (EMP1009)', status: 'In Progress' }
    ]
  },
  {
    id: 'M-004',
    name: 'Equipment Installation',
    tasks: [
      { id: 'T-029', name: 'Equipment Installation', assignee: 'Kiran R (EMP1008)', reviewer: 'Deepak G (EMP1009)', status: 'Pending' },
      { id: 'T-033', name: 'System Testing', assignee: 'Deepak G (EMP1009)', approver: 'Suresh Babu (EMP1009)', status: 'In Progress' }
    ]
  }
];

// ── Helper Functions ──
const getStatusColor = (status) => {
  const colors = { 'Completed': 'green', 'In Progress': 'orange', 'Pending': 'gray' };
  return colors[status] || 'gray';
};

const getProjectStatusColor = (status) => {
  const colors = { 
    'active': 'green', 
    'upcoming': 'orange', 
    'completed': 'blue',
    'on-hold': 'red'
  };
  return colors[status] || 'gray';
};

const getProjectStatusIcon = (status) => {
  switch(status) {
    case 'active': return '🟢';
    case 'upcoming': return '🟠';
    case 'completed': return '🔵';
    case 'on-hold': return '🔴';
    default: return '⚪';
  }
};

const getProjectStatusLabel = (status) => {
  switch(status) {
    case 'active': return 'Active';
    case 'upcoming': return 'Upcoming';
    case 'completed': return 'Completed';
    case 'on-hold': return 'On Hold';
    default: return status;
  }
};

const getPermissionStateColor = (state) => {
  const colors = { 'blue': 'blue', 'green': 'green', 'red': 'red', 'empty': 'empty' };
  return colors[state] || 'empty';
};

const getPriorityColor = (priority) => {
  const colors = { 'high': '#ef4444', 'medium': '#f59e0b', 'low': '#10b981' };
  return colors[priority] || '#64748b';
};

const getPriorityLabel = (priority) => {
  const labels = { 'high': 'High', 'medium': 'Medium', 'low': 'Low' };
  return labels[priority] || 'Normal';
};

const getPriorityIcon = (priority) => {
  switch(priority) {
    case 'high': return <TrendingUp size={14} />;
    case 'medium': return <Minus size={14} />;
    case 'low': return <TrendingDown size={14} />;
    default: return <Minus size={14} />;
  }
};

// ── Main Component ──
const ProjectAccess = ({ userRole, onLogout }) => {
  // ── State ──
  const [currentView, setCurrentView] = useState('projects');
  const [selectedProject, setSelectedProject] = useState(null);
  const [viewMode, setViewMode] = useState('permission');
  const [searchTerm, setSearchTerm] = useState('');
  const [showEditPermissions, setShowEditPermissions] = useState(false);
  const [expandedMilestones, setExpandedMilestones] = useState(new Set(['M-001']));
  const [expandedGroups, setExpandedGroups] = useState({});
  const [expandedProjectGroups, setExpandedProjectGroups] = useState({});
  const [accessGroups, setAccessGroups] = useState([]);
  const [selectedEmployees, setSelectedEmployees] = useState([]);
  const [alertConfig, setAlertConfig] = useState({ 
    isOpen: false, 
    type: 'info', 
    title: '', 
    message: '',
    onConfirm: null,
    confirmText: 'OK',
    cancelText: 'Cancel'
  });
  
  // ── List/Grid View State ──
  const [projectViewType, setProjectViewType] = useState('grid');

  // ── Add Employee Modal State ──
  const [showAddEmployeeModal, setShowAddEmployeeModal] = useState(false);
  const [employeeSearchTerm, setEmployeeSearchTerm] = useState('');

  // ── Data ──
  const [projects] = useState(PROJECTS);
  const [employees] = useState(EMPLOYEES);
  const [milestones, setMilestones] = useState(MILESTONES);

  // ── Alert ──
  const showAlert = (type, title, message, onConfirm = null, confirmText = 'OK', cancelText = 'Cancel') => {
    setAlertConfig({ 
      isOpen: true, 
      type, 
      title, 
      message,
      onConfirm,
      confirmText,
      cancelText
    });
  };

  const closeAlert = () => {
    setAlertConfig(prev => ({ ...prev, isOpen: false }));
  };

  // ── Initialize Access Groups ──
  const initializeAccessGroups = (project) => {
    if (!project) {
      const emptyGroups = SCREEN_GROUPS.map(group => ({
        ...group,
        screens: group.screens.map(screen => ({
          ...screen,
          view: PERMISSION_STATES.EMPTY,
          create: PERMISSION_STATES.EMPTY,
          edit: PERMISSION_STATES.EMPTY,
          delete: PERMISSION_STATES.EMPTY,
          badge: 'orange',
          badgeText: 'No Access'
        })),
        view: PERMISSION_STATES.EMPTY,
        create: PERMISSION_STATES.EMPTY,
        edit: PERMISSION_STATES.EMPTY,
        delete: PERMISSION_STATES.EMPTY,
        badge: 'orange',
        badgeText: 'No Access'
      }));
      setAccessGroups(emptyGroups);
      return;
    }

    const groups = SCREEN_GROUPS.map(group => {
      const screens = group.screens.map(screen => {
        const perms = project.permissions?.[screen.id];
        if (perms) {
          const view = perms.view ? PERMISSION_STATES.BLUE : PERMISSION_STATES.EMPTY;
          const create = perms.create ? PERMISSION_STATES.BLUE : PERMISSION_STATES.EMPTY;
          const edit = perms.edit ? PERMISSION_STATES.BLUE : PERMISSION_STATES.EMPTY;
          const delete_ = perms.delete ? PERMISSION_STATES.BLUE : PERMISSION_STATES.EMPTY;
          
          const hasBlue = view === PERMISSION_STATES.BLUE || create === PERMISSION_STATES.BLUE || 
                          edit === PERMISSION_STATES.BLUE || delete_ === PERMISSION_STATES.BLUE;
          const hasEmpty = view === PERMISSION_STATES.EMPTY || create === PERMISSION_STATES.EMPTY || 
                          edit === PERMISSION_STATES.EMPTY || delete_ === PERMISSION_STATES.EMPTY;
          
          let badge = 'orange';
          let badgeText = 'No Access';
          if (hasBlue && hasEmpty) { badge = 'orange'; badgeText = 'Mixed'; }
          else if (hasBlue) { badge = 'blue'; badgeText = 'From Project'; }
          
          return { ...screen, view, create, edit, delete: delete_, badge, badgeText };
        }
        return { ...screen, view: PERMISSION_STATES.EMPTY, create: PERMISSION_STATES.EMPTY,
                  edit: PERMISSION_STATES.EMPTY, delete: PERMISSION_STATES.EMPTY,
                  badge: 'orange', badgeText: 'No Access' };
      });

      return { ...group, screens, view: PERMISSION_STATES.EMPTY, create: PERMISSION_STATES.EMPTY,
               edit: PERMISSION_STATES.EMPTY, delete: PERMISSION_STATES.EMPTY,
               badge: 'orange', badgeText: 'No Access' };
    });
    
    setAccessGroups(groups);
    setExpandedGroups({});
  };

  // ── Open/Close Project ──
  const openProjectDetail = (project) => {
    setSelectedProject(project);
    setSelectedEmployees(project.assignedEmployees || []);
    initializeAccessGroups(project);
    setCurrentView('project-detail');
    setShowEditPermissions(false);
  };

  const closeProjectDetail = () => {
    setSelectedProject(null);
    setSelectedEmployees([]);
    setAccessGroups([]);
    setCurrentView('projects');
    setShowEditPermissions(false);
  };

  // ── Toggle Functions ──
  const toggleMilestone = (id) => {
    setExpandedMilestones(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) newSet.delete(id);
      else newSet.add(id);
      return newSet;
    });
  };

  const toggleGroup = (id) => {
    setExpandedGroups(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleProjectGroup = (id) => {
    setExpandedProjectGroups(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // ── Permission Toggle ──
  const togglePermission = (groupId, screenId, permissionType) => {
    if (!showEditPermissions) return;

    const newGroups = accessGroups.map(group => ({
      ...group,
      screens: group.screens.map(screen => ({ ...screen }))
    }));

    const groupIndex = newGroups.findIndex(g => g.id === groupId);
    if (groupIndex === -1) return;

    const screenIndex = newGroups[groupIndex].screens.findIndex(s => s.id === screenId);
    if (screenIndex === -1) return;

    const screen = newGroups[groupIndex].screens[screenIndex];
    const currentState = screen[permissionType];
    
    let newState;
    if (currentState === PERMISSION_STATES.EMPTY) newState = PERMISSION_STATES.GREEN;
    else if (currentState === PERMISSION_STATES.GREEN) newState = PERMISSION_STATES.EMPTY;
    else if (currentState === PERMISSION_STATES.BLUE) newState = PERMISSION_STATES.RED;
    else if (currentState === PERMISSION_STATES.RED) newState = PERMISSION_STATES.EMPTY;
    else newState = PERMISSION_STATES.EMPTY;

    screen[permissionType] = newState;

    const hasBlue = PERMISSION_TYPES.some(p => screen[p] === PERMISSION_STATES.BLUE);
    const hasGreen = PERMISSION_TYPES.some(p => screen[p] === PERMISSION_STATES.GREEN);
    const hasRed = PERMISSION_TYPES.some(p => screen[p] === PERMISSION_STATES.RED);
    
    if (hasBlue && (hasGreen || hasRed)) { screen.badge = 'orange'; screen.badgeText = 'Mixed'; }
    else if (hasBlue) { screen.badge = 'blue'; screen.badgeText = 'From Project'; }
    else if (hasGreen) { screen.badge = 'green'; screen.badgeText = 'Added'; }
    else if (hasRed) { screen.badge = 'red'; screen.badgeText = 'Revoked'; }
    else { screen.badge = 'orange'; screen.badgeText = 'No Access'; }

    const group = newGroups[groupIndex];
    group.view = group.screens.some(s => s.view !== PERMISSION_STATES.EMPTY) ? PERMISSION_STATES.BLUE : PERMISSION_STATES.EMPTY;
    group.create = group.screens.some(s => s.create !== PERMISSION_STATES.EMPTY) ? PERMISSION_STATES.BLUE : PERMISSION_STATES.EMPTY;
    group.edit = group.screens.some(s => s.edit !== PERMISSION_STATES.EMPTY) ? PERMISSION_STATES.BLUE : PERMISSION_STATES.EMPTY;
    group.delete = group.screens.some(s => s.delete !== PERMISSION_STATES.EMPTY) ? PERMISSION_STATES.BLUE : PERMISSION_STATES.EMPTY;
    
    const groupHasBlue = group.screens.some(s => 
      PERMISSION_TYPES.some(p => s[p] === PERMISSION_STATES.BLUE)
    );
    const groupHasGreen = group.screens.some(s => 
      PERMISSION_TYPES.some(p => s[p] === PERMISSION_STATES.GREEN)
    );
    const groupHasRed = group.screens.some(s => 
      PERMISSION_TYPES.some(p => s[p] === PERMISSION_STATES.RED)
    );
    
    if (groupHasBlue && (groupHasGreen || groupHasRed)) {
      group.badge = 'orange';
      group.badgeText = 'Mixed';
    } else if (groupHasBlue) {
      group.badge = 'blue';
      group.badgeText = 'From Project';
    } else if (groupHasGreen) {
      group.badge = 'green';
      group.badgeText = 'Added';
    } else if (groupHasRed) {
      group.badge = 'red';
      group.badgeText = 'Revoked';
    } else {
      group.badge = 'orange';
      group.badgeText = 'No Access';
    }

    setAccessGroups(newGroups);
  };

  // ── Render Checkbox ──
  const renderCheckbox = (state, groupId, screenId, permissionType) => {
    const handleClick = (e) => {
      e.stopPropagation();
      e.preventDefault();
      togglePermission(groupId, screenId, permissionType);
    };

    const color = getPermissionStateColor(state);

    return (
      <div 
        className={`pac-chk pac-chk-${color}`}
        onClick={handleClick}
        style={{ cursor: showEditPermissions ? 'pointer' : 'default' }}
      >
        {state === PERMISSION_STATES.BLUE && <Check size={12} strokeWidth={3} />}
        {state === PERMISSION_STATES.GREEN && <Check size={12} strokeWidth={3} />}
        {state === PERMISSION_STATES.RED && <X size={12} strokeWidth={3} />}
      </div>
    );
  };

  // ── Render Task Checkbox ──
  const renderTaskCheckbox = (taskId, permissionType) => {
    let state = PERMISSION_STATES.EMPTY;
    if (accessGroups && accessGroups.length > 0) {
      accessGroups.forEach(group => {
        group.screens.forEach(screen => {
          if (screen.id === 'individual-task' || screen.id === 'task-board') {
            state = screen[permissionType] || PERMISSION_STATES.EMPTY;
          }
        });
      });
    }

    const color = getPermissionStateColor(state);
    const handleClick = (e) => {
      e.stopPropagation();
      if (!showEditPermissions) return;
      
      let targetGroupId = null;
      let targetScreenId = null;
      accessGroups.forEach(group => {
        group.screens.forEach(screen => {
          if (screen.id === 'individual-task' || screen.id === 'task-board') {
            targetGroupId = group.id;
            targetScreenId = screen.id;
          }
        });
      });
      if (targetGroupId && targetScreenId) {
        togglePermission(targetGroupId, targetScreenId, permissionType);
      }
    };

    return (
      <div 
        className={`pac-chk pac-chk-${color}`}
        onClick={handleClick}
        style={{ cursor: showEditPermissions ? 'pointer' : 'default', opacity: showEditPermissions ? 1 : 0.6 }}
      >
        {state === PERMISSION_STATES.BLUE && <Check size={12} strokeWidth={3} />}
        {state === PERMISSION_STATES.GREEN && <Check size={12} strokeWidth={3} />}
        {state === PERMISSION_STATES.RED && <X size={12} strokeWidth={3} />}
      </div>
    );
  };

  // ── Filters ──
  const filteredProjects = (() => {
    if (!searchTerm) return PROJECTS;
    const search = searchTerm.toLowerCase();
    return PROJECTS.filter(p => 
      p.name?.toLowerCase().includes(search) ||
      p.code?.toLowerCase().includes(search) ||
      p.manager?.toLowerCase().includes(search) ||
      p.department?.toLowerCase().includes(search)
    );
  })();

  const filteredMilestones = (() => {
    if (!searchTerm) return milestones;
    const search = searchTerm.toLowerCase();
    return milestones.filter(m => 
      m.name?.toLowerCase().includes(search) ||
      m.tasks?.some(t => 
        t.name?.toLowerCase().includes(search) || 
        t.assignee?.toLowerCase().includes(search) ||
        (t.reviewer && t.reviewer.toLowerCase().includes(search)) ||
        (t.approver && t.approver.toLowerCase().includes(search))
      )
    );
  })();

  // ── Employee Management Functions ──
  
  // Get Employee Tasks
  const getEmployeeTasks = (empId) => {
    const assignedTasks = [];
    milestones.forEach(milestone => {
      milestone.tasks.forEach(task => {
        if (task.assignee && task.assignee.includes(empId)) {
          assignedTasks.push({
            ...task,
            milestoneId: milestone.id,
            milestoneName: milestone.name,
            role: 'Assignee'
          });
        }
        if (task.reviewer && task.reviewer.includes(empId)) {
          assignedTasks.push({
            ...task,
            milestoneId: milestone.id,
            milestoneName: milestone.name,
            role: 'Reviewer'
          });
        }
        if (task.approver && task.approver.includes(empId)) {
          assignedTasks.push({
            ...task,
            milestoneId: milestone.id,
            milestoneName: milestone.name,
            role: 'Approver'
          });
        }
      });
    });
    return assignedTasks;
  };

  // Get Employee Task Count
  const getEmployeeTaskCount = (empId) => {
    let count = 0;
    milestones.forEach(milestone => {
      milestone.tasks.forEach(task => {
        if (task.assignee && task.assignee.includes(empId)) count++;
        if (task.reviewer && task.reviewer.includes(empId)) count++;
        if (task.approver && task.approver.includes(empId)) count++;
      });
    });
    return count;
  };

  // Remove Employee with Task Check
  const handleRemoveEmployee = (empId) => {
    const employeeTasks = getEmployeeTasks(empId);
    
    if (employeeTasks.length > 0) {
      const taskList = employeeTasks.map(t => 
        `• ${t.id} - ${t.name} (${t.milestoneName}) [${t.role}]`
      ).join('\n');
      
      showAlert(
        'warning',
        `⚠️ Employee has ${employeeTasks.length} assigned task(s)!`,
        `Employee has the following assigned tasks:\n\n${taskList}\n\nRemoving this employee will unassign these tasks. Do you want to continue?`,
        () => confirmRemoveEmployee(empId, employeeTasks),
        'Yes, Remove Employee',
        'Cancel'
      );
    } else {
      confirmRemoveEmployee(empId, []);
    }
  };

  // Confirm Remove Employee
  const confirmRemoveEmployee = (empId, employeeTasks) => {
    setSelectedEmployees(prev => prev.filter(id => id !== empId));
    
    if (employeeTasks.length > 0) {
      const updatedMilestones = milestones.map(milestone => ({
        ...milestone,
        tasks: milestone.tasks.map(task => {
          let updatedTask = { ...task };
          if (task.assignee && task.assignee.includes(empId)) {
            updatedTask.assignee = 'Unassigned';
          }
          if (task.reviewer && task.reviewer.includes(empId)) {
            updatedTask.reviewer = 'Unassigned';
          }
          if (task.approver && task.approver.includes(empId)) {
            updatedTask.approver = 'Unassigned';
          }
          if (updatedTask.assignee === 'Unassigned' || 
              updatedTask.reviewer === 'Unassigned' || 
              updatedTask.approver === 'Unassigned') {
            updatedTask.status = 'Pending';
          }
          return updatedTask;
        })
      }));
      setMilestones(updatedMilestones);
      
      showAlert('info', 'Tasks Unassigned', 
        `${employeeTasks.length} task(s) have been unassigned and marked as "Pending".`
      );
    } else {
      showAlert('success', 'Employee Removed', 'Employee has been removed from the project.');
    }
  };

  const handleAddEmployee = (empId) => {
    if (!selectedEmployees.includes(empId)) {
      setSelectedEmployees(prev => [...prev, empId]);
      showAlert('success', 'Employee Added', 'Employee has been added to the project.');
      setShowAddEmployeeModal(false);
      setEmployeeSearchTerm('');
    } else {
      showAlert('warning', 'Already Added', 'This employee is already in the project.');
    }
  };

  // ── Get Available Employees ──
  const getAvailableEmployees = () => {
    const selectedIds = new Set(selectedEmployees);
    const available = employees.filter(emp => !selectedIds.has(emp.id));
    
    return [...available].sort((a, b) => {
      const aSelected = selectedEmployees.includes(a.id);
      const bSelected = selectedEmployees.includes(b.id);
      if (aSelected && !bSelected) return -1;
      if (!aSelected && bSelected) return 1;
      return a.name.localeCompare(b.name);
    });
  };

  // ── Filter Available Employees ──
  const filteredAvailableEmployees = (() => {
    const available = getAvailableEmployees();
    if (!employeeSearchTerm) return available;
    const search = employeeSearchTerm.toLowerCase();
    return available.filter(emp =>
      emp.name.toLowerCase().includes(search) ||
      emp.id.toLowerCase().includes(search) ||
      emp.designation.toLowerCase().includes(search) ||
      emp.department.toLowerCase().includes(search)
    );
  })();

  // ── RENDER: Projects View ──
  const renderProjectsView = () => {
    if (filteredProjects.length === 0) {
      return (
        <div className="pac-empty-state">
          <Folder size={48} />
          <h4>No Projects Found</h4>
        </div>
      );
    }

    const groupedProjects = {
      active: filteredProjects.filter(p => p.status === 'active' || p.status === 'in-progress'),
      upcoming: filteredProjects.filter(p => p.status === 'upcoming' || p.status === 'planned'),
      completed: filteredProjects.filter(p => p.status === 'completed' || p.status === 'done'),
      onHold: filteredProjects.filter(p => p.status === 'on-hold' || p.status === 'paused')
    };

    const statusGroups = [
      { key: 'active', label: 'Active Projects', icon: Folder, color: 'green' },
      { key: 'upcoming', label: 'Upcoming Projects', icon: Calendar, color: 'orange' },
      { key: 'completed', label: 'Completed Projects', icon: CheckCircle, color: 'blue' },
      { key: 'onHold', label: 'On-Hold Projects', icon: PauseCircle, color: 'red' }
    ];

    return (
      <div className="pac-projects-view">

        <div className="pac-search-toggle-bar">
          <div className="pac-search-bar">
            <Search size={16} />
            <input
              type="text"
              placeholder="Search projects..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="pac-view-toggle-buttons">
            <button 
              className={`pac-view-toggle-btn ${projectViewType === 'grid' ? 'active' : ''}`}
              onClick={() => setProjectViewType('grid')}
              title="Grid View"
            >
              <Grid size={18} />
            </button>
            <button 
              className={`pac-view-toggle-btn ${projectViewType === 'list' ? 'active' : ''}`}
              onClick={() => setProjectViewType('list')}
              title="List View"
            >
              <List size={18} />
            </button>
          </div>
        </div>

        <div className={`pac-projects-container pac-projects-${projectViewType}`}>
          {statusGroups.map((group) => {
            const projectsInGroup = groupedProjects[group.key] || [];
            if (projectsInGroup.length === 0) return null;

            return (
              <div key={group.key} className="pac-project-group">
                <div 
                  className="pac-project-group-header"
                  onClick={() => toggleProjectGroup(group.key)}
                >
                  <div className="pac-project-group-title">
                    <group.icon size={20} className="pac-project-group-icon" />
                    <h3>{group.label}</h3>
                    <span className="pac-project-group-count">({projectsInGroup.length})</span>
                  </div>
                  {expandedProjectGroups[group.key] ? 
                    <ChevronDown size={20} /> : 
                    <ChevronRight size={20} />
                  }
                </div>
                {expandedProjectGroups[group.key] !== false && (
                  <div className={`pac-project-group-content pac-project-group-${projectViewType}`}>
                    {projectsInGroup.map(project => 
                      projectViewType === 'grid' 
                        ? renderProjectCardGrid(project) 
                        : renderProjectCardList(project)
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // ── Project Card - Grid View (Dynamic & Attractive) ──
  const renderProjectCardGrid = (project) => {
    const statusColor = getProjectStatusColor(project.status);
    const priorityColor = getPriorityColor(project.priority);
    const statusIcon = getProjectStatusIcon(project.status);
    const statusLabel = getProjectStatusLabel(project.status);
    const progressColor = project.status === 'completed' ? '#10b981' :
                          project.status === 'upcoming' ? '#94a3b8' :
                          project.status === 'on-hold' ? '#ef4444' :
                          '#2563eb';
    
    // Card gradient based on status
    const getCardGradient = (status) => {
      switch(status) {
        case 'active': return 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)';
        case 'upcoming': return 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)';
        case 'completed': return 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)';
        case 'on-hold': return 'linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)';
        default: return 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)';
      }
    };

    // Status border color
    const getBorderColor = (status) => {
      switch(status) {
        case 'active': return '#2563eb';
        case 'upcoming': return '#f59e0b';
        case 'completed': return '#10b981';
        case 'on-hold': return '#ef4444';
        default: return '#94a3b8';
      }
    };

    return (
      <div 
        key={project.id} 
        className="pac-project-card pac-project-card-grid"
        onClick={() => openProjectDetail(project)}
        style={{
          background: getCardGradient(project.status),
          borderColor: getBorderColor(project.status),
          borderWidth: '2px'
        }}
      >
        {/* Card Top - Status & Priority */}
        <div className="pac-card-top">
          <div className="pac-card-status">
            <span className={`pac-status-dot ${statusColor}`}></span>
            <span className="pac-status-label">{statusIcon} {statusLabel}</span>
          </div>
          <div className="pac-card-priority" style={{ background: priorityColor }}>
            {getPriorityIcon(project.priority)}
            <span>{getPriorityLabel(project.priority)}</span>
          </div>
        </div>

        {/* Card Header */}
        <div className="pac-card-header">
          <div className="pac-card-title-group">
            <h4 className="pac-card-title">{project.name}</h4>
            <span className="pac-card-code">{project.code}</span>
          </div>
        </div>

        {/* Card Description */}
        <p className="pac-card-desc">{project.description}</p>

        {/* Card Meta - Manager & Department */}
        <div className="pac-card-meta">
          <div className="pac-card-meta-item">
            <User size={14} className="pac-meta-icon" />
            <span>{project.manager}</span>
          </div>
          <div className="pac-card-meta-item">
            <Building2 size={14} className="pac-meta-icon" />
            <span>{project.department}</span>
          </div>
        </div>

        {/* Card Stats - Tasks & Team */}
        <div className="pac-card-stats">
          <div className="pac-card-stat">
            <span className="pac-stat-icon">📋</span>
            <div className="pac-stat-info">
              <span className="pac-stat-label">Tasks</span>
              <span className="pac-stat-value">{project.tasks?.completed || 0}/{project.tasks?.total || 0}</span>
            </div>
          </div>
          <div className="pac-card-stat">
            <span className="pac-stat-icon">👥</span>
            <div className="pac-stat-info">
              <span className="pac-stat-label">Team</span>
              <span className="pac-stat-value">{project.assignedEmployees?.length || 0}</span>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="pac-card-progress">
          <div className="pac-progress-header">
            <span className="pac-progress-label">Progress</span>
            <span className="pac-progress-value" style={{ color: progressColor }}>
              {project.progress}%
            </span>
          </div>
          <div className="pac-progress-bar">
            <div 
              className="pac-progress-fill" 
              style={{ 
                width: `${project.progress}%`,
                background: progressColor
              }}
            ></div>
          </div>
        </div>

        {/* Card Footer - Dates & Assignees */}
        <div className="pac-card-footer">
          <div className="pac-card-dates">
            <Calendar size={14} className="pac-footer-icon" />
            <span>{project.startDate}</span>
            <span className="pac-date-arrow">→</span>
            <span>{project.endDate}</span>
          </div>
          <div className="pac-card-assignees">
            <Users size={14} className="pac-footer-icon" />
            <span>{project.assignedEmployees?.length || 0}</span>
          </div>
        </div>

        {/* Hover Overlay - Click to Manage */}
        <div className="pac-card-hover-overlay">
          <span className="pac-hover-text">
            <Edit size={16} /> Manage Access
          </span>
        </div>
      </div>
    );
  };

  // ── Project Card - List View ──
  const renderProjectCardList = (project) => {
    const statusColor = getProjectStatusColor(project.status);
    const priorityColor = getPriorityColor(project.priority);
    const statusIcon = getProjectStatusIcon(project.status);
    const statusLabel = getProjectStatusLabel(project.status);
    const progressColor = project.status === 'completed' ? '#10b981' :
                          project.status === 'upcoming' ? '#94a3b8' :
                          project.status === 'on-hold' ? '#ef4444' :
                          '#2563eb';

    return (
      <div 
        key={project.id} 
        className="pac-project-card pac-project-card-list"
        onClick={() => openProjectDetail(project)}
      >
        <div className="pac-project-card-list-content">
          <div className="pac-list-left">
            <div className="pac-list-header">
              <div className="pac-list-title-group">
                <h4>{project.name}</h4>
                <span className="pac-project-code">{project.code}</span>
              </div>
              <div className="pac-list-badges">
                <span className={`pac-status-badge pac-status-${statusColor}`}>
                  {statusIcon} {statusLabel}
                </span>
                <span className="pac-priority-badge" style={{ background: priorityColor }}>
                  {getPriorityLabel(project.priority)}
                </span>
              </div>
            </div>
            <p className="pac-project-card-desc">{project.description}</p>
            <div className="pac-list-meta">
              <div className="pac-list-meta-item">
                <User size={14} /> <span>{project.manager}</span>
              </div>
              <div className="pac-list-meta-item">
                <Building2 size={14} /> <span>{project.department}</span>
              </div>
              <div className="pac-list-meta-item">
                <Users size={14} /> <span>{project.assignedEmployees?.length || 0} members</span>
              </div>
            </div>
          </div>
          <div className="pac-list-right">
            <div className="pac-list-progress">
              <div className="pac-progress-header">
                <span>Progress</span>
                <span style={{ color: progressColor }}>{project.progress}%</span>
              </div>
              <div className="pac-progress-bar">
                <div 
                  className="pac-progress-fill" 
                  style={{ 
                    width: `${project.progress}%`,
                    background: progressColor
                  }}
                ></div>
              </div>
            </div>
            <div className="pac-list-dates">
              <Calendar size={14} />
              <span>{project.startDate}</span>
              <span>→</span>
              <span>{project.endDate}</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // ── RENDER: Permission View ──
  const renderPermissionView = () => {
    if (!milestones || milestones.length === 0) {
      return <div className="pac-empty-state"><FileText size={48} /><h4>No Tasks</h4></div>;
    }

    const getAvatarColor = (name) => {
      if (!name || name === 'Unassigned' || name === '—') return '#94a3b8';
      const colors = ['#2563eb', '#7c3aed', '#0ea5e9', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#14b8a6', '#f472b6', '#6366f1'];
      let hash = 0;
      for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
      }
      return colors[Math.abs(hash) % colors.length];
    };

    const getInitials = (name) => {
      if (!name || name === 'Unassigned' || name === '—') return '—';
      return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    };

    const renderPerson = (name, type) => {
      if (!name) {
        return <span className="pac-person-unassigned">—</span>;
      }
      const color = getAvatarColor(name);
      const initials = getInitials(name);
      return (
        <div className="pac-person">
          <span className="pac-person-avatar" style={{ background: color }}>{initials}</span>
          <span className="pac-person-name">{name}</span>
        </div>
      );
    };

    return (
      <div className="pac-permission-view">
        <div className="pac-permission-legend">
          <span className="pac-legend-item"><span className="pac-dot pac-dot-blue"></span> From Project</span>
          <span className="pac-legend-item"><span className="pac-dot pac-dot-green"></span> Added</span>
          <span className="pac-legend-item"><span className="pac-dot pac-dot-red"></span> Revoked</span>
          <span className="pac-legend-item"><span className="pac-dot pac-dot-empty"></span> No Access</span>
          <span className="pac-legend-item">
            <User size={14} className="pac-legend-icon" /> Assignee
          </span>
          <span className="pac-legend-item">
            <UserCog size={14} className="pac-legend-icon" /> Reviewer
          </span>
          <span className="pac-legend-item">
            <UserApprover size={14} className="pac-legend-icon" /> Approver
          </span>
          {showEditPermissions && <span className="pac-edit-indicator"><AlertCircle size={14} /> Click to toggle</span>}
          {!showEditPermissions && <span className="pac-view-indicator"><Eye size={14} /> View mode</span>}
        </div>

        <div className="pac-table-wrapper">
          <table className="pac-table">
            <thead>
              <tr>
                <th style={{ width: '80px' }}>Task Code</th>
                <th style={{ width: '180px' }}>Task / Activity Name</th>
                <th style={{ width: '150px' }}>Assignee</th>
                <th style={{ width: '150px' }}>Reviewer</th>
                <th style={{ width: '150px' }}>Approver</th>
                <th style={{ width: '100px' }}>Status</th>
                <th style={{ width: '60px', textAlign: 'center' }}>View</th>
                <th style={{ width: '60px', textAlign: 'center' }}>Create</th>
                <th style={{ width: '60px', textAlign: 'center' }}>Edit</th>
                <th style={{ width: '60px', textAlign: 'center' }}>Delete</th>
              </tr>
            </thead>
            <tbody>
              {filteredMilestones.map((milestone) => {
                const isExpanded = expandedMilestones.has(milestone.id);
                return (
                  <React.Fragment key={milestone.id}>
                    <tr className="pac-milestone-row" onClick={() => toggleMilestone(milestone.id)}>
                      <td colSpan="10">
                        <div className="pac-milestone-header">
                          <span className="pac-milestone-toggle">
                            {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                          </span>
                          <span className="pac-milestone-id">{milestone.id}</span>
                          <span className="pac-milestone-name">{milestone.name}</span>
                          <span className="pac-milestone-count">{milestone.tasks?.length || 0} tasks</span>
                        </div>
                      </td>
                    </tr>
                    {isExpanded && milestone.tasks?.map((task) => {
                      const hasReviewer = task.reviewer && task.reviewer !== 'Unassigned';
                      const hasApprover = task.approver && task.approver !== 'Unassigned';

                      return (
                        <tr key={task.id} className="pac-task-row">
                          <td><span className="pac-task-code">{task.id}</span></td>
                          <td>{task.name}</td>
                          <td>{renderPerson(task.assignee, 'assignee')}</td>
                          <td>{hasReviewer ? renderPerson(task.reviewer, 'reviewer') : <span className="pac-person-unassigned">—</span>}</td>
                          <td>{hasApprover ? renderPerson(task.approver, 'approver') : <span className="pac-person-unassigned">—</span>}</td>
                          <td><span className={`pac-status-badge pac-status-${getStatusColor(task.status)}`}>{task.status}</span></td>
                          <td style={{ textAlign: 'center' }}>{renderTaskCheckbox(task.id, 'view')}</td>
                          <td style={{ textAlign: 'center' }}>{renderTaskCheckbox(task.id, 'create')}</td>
                          <td style={{ textAlign: 'center' }}>{renderTaskCheckbox(task.id, 'edit')}</td>
                          <td style={{ textAlign: 'center' }}>{renderTaskCheckbox(task.id, 'delete')}</td>
                        </tr>
                      );
                    })}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  // ── RENDER: Employee View ──
  const renderEmployeeView = () => {
    const projectEmployees = employees.filter(e => selectedEmployees?.includes(e.id));

    if (!projectEmployees || projectEmployees.length === 0) {
      return <div className="pac-empty-state"><Users size={48} /><h4>No Employees</h4></div>;
    }

    return (
      <div className="pac-employee-view">
        <div className="pac-employee-view-header">
          <div className="pac-employee-header-left">
            <h3>👥 Team Members ({projectEmployees.length})</h3>
          </div>
          <div className="pac-employee-header-right">
            {showEditPermissions && (
              <button 
                className="pac-btn-primary-sm pac-add-member-btn"
                onClick={() => setShowAddEmployeeModal(true)}
              >
                <UserPlus size={14} /> Add Member
              </button>
            )}
          </div>
        </div>
        <div className="pac-employee-grid">
          {projectEmployees.map(emp => {
            const taskCount = getEmployeeTaskCount(emp.id);
            
            return (
              <div key={emp.id} className="pac-employee-card-enhanced">
                <div className="pac-emp-card-header">
                  <div className="pac-emp-avatar-wrapper">
                    <div className="pac-emp-avatar-enhanced" style={{ background: '#2563eb' }}>
                      {emp.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    {taskCount > 0 && (
                      <div className="pac-emp-task-indicator" title={`${taskCount} tasks assigned`}>
                        {taskCount}
                      </div>
                    )}
                  </div>
                  <div className="pac-emp-card-title">
                    <h4>{emp.name}</h4>
                    <span className="pac-emp-id">{emp.id}</span>
                  </div>
                  <div className="pac-emp-role-badge">
                    <span>{emp.designation}</span>
                  </div>
                </div>
                <div className="pac-emp-card-body">
                  <div className="pac-emp-dept">
                    <Building2 size={14} /> <span>{emp.department}</span>
                  </div>
                  <div className="pac-emp-task-count">
                    <FileText size={14} />
                    <span>{taskCount} task(s) assigned</span>
                    {taskCount > 0 && (
                      <span className="pac-emp-task-warning">⚠️</span>
                    )}
                  </div>
                  <div className="pac-emp-permissions-summary">
                    <div className="pac-emp-perms-header">
                      <Shield size={14} /> <span>Access Permissions</span>
                    </div>
                    <div className="pac-emp-perms-badges">
                      <span className="pac-emp-perm-badge view"><Eye size={12} /> View</span>
                      <span className="pac-emp-perm-badge edit"><Edit size={12} /> Edit</span>
                    </div>
                  </div>
                </div>
                {showEditPermissions && (
                  <div className="pac-emp-card-footer">
                    <button 
                      className={`pac-emp-remove-btn ${taskCount > 0 ? 'has-tasks' : ''}`}
                      onClick={() => handleRemoveEmployee(emp.id)}
                    >
                      <UserMinus size={14} /> 
                      Remove{taskCount > 0 ? ` (${taskCount} tasks)` : ''}
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // ── RENDER: Screen View ──
  const renderScreenView = () => {
    if (!accessGroups || accessGroups.length === 0) {
      return <div className="pac-empty-state"><Settings size={48} /><h4>No Screen Permissions</h4></div>;
    }

    const getPermissionCount = (group) => {
      let count = 0;
      group.screens.forEach(screen => {
        PERMISSION_TYPES.forEach(p => {
          if (screen[p] !== PERMISSION_STATES.EMPTY) count++;
        });
      });
      return count;
    };

    const toggleGroupPermission = (groupId, permissionType) => {
      if (!showEditPermissions) return;

      const newGroups = accessGroups.map(group => ({
        ...group,
        screens: group.screens.map(screen => ({ ...screen }))
      }));

      const groupIndex = newGroups.findIndex(g => g.id === groupId);
      if (groupIndex === -1) return;

      const group = newGroups[groupIndex];
      const hasAny = group.screens.some(s => s[permissionType] !== PERMISSION_STATES.EMPTY);
      const targetState = hasAny ? PERMISSION_STATES.EMPTY : PERMISSION_STATES.GREEN;

      group.screens = group.screens.map(screen => {
        const updatedScreen = { ...screen, [permissionType]: targetState };
        
        const hasBlue = PERMISSION_TYPES.some(p => updatedScreen[p] === PERMISSION_STATES.BLUE);
        const hasGreen = PERMISSION_TYPES.some(p => updatedScreen[p] === PERMISSION_STATES.GREEN);
        const hasRed = PERMISSION_TYPES.some(p => updatedScreen[p] === PERMISSION_STATES.RED);
        
        if (hasBlue && (hasGreen || hasRed)) {
          updatedScreen.badge = 'orange';
          updatedScreen.badgeText = 'Mixed';
        } else if (hasBlue) {
          updatedScreen.badge = 'blue';
          updatedScreen.badgeText = 'From Project';
        } else if (hasGreen) {
          updatedScreen.badge = 'green';
          updatedScreen.badgeText = 'Added';
        } else if (hasRed) {
          updatedScreen.badge = 'red';
          updatedScreen.badgeText = 'Revoked';
        } else {
          updatedScreen.badge = 'orange';
          updatedScreen.badgeText = 'No Access';
        }
        
        return updatedScreen;
      });

      group[permissionType] = targetState;
      
      const groupHasBlue = group.screens.some(s => 
        PERMISSION_TYPES.some(p => s[p] === PERMISSION_STATES.BLUE)
      );
      const groupHasGreen = group.screens.some(s => 
        PERMISSION_TYPES.some(p => s[p] === PERMISSION_STATES.GREEN)
      );
      const groupHasRed = group.screens.some(s => 
        PERMISSION_TYPES.some(p => s[p] === PERMISSION_STATES.RED)
      );
      
      if (groupHasBlue && (groupHasGreen || groupHasRed)) {
        group.badge = 'orange';
        group.badgeText = 'Mixed';
      } else if (groupHasBlue) {
        group.badge = 'blue';
        group.badgeText = 'From Project';
      } else if (groupHasGreen) {
        group.badge = 'green';
        group.badgeText = 'Added';
      } else if (groupHasRed) {
        group.badge = 'red';
        group.badgeText = 'Revoked';
      } else {
        group.badge = 'orange';
        group.badgeText = 'No Access';
      }

      setAccessGroups(newGroups);
    };

    const toggleScreenPermission = (groupId, screenId, permissionType) => {
      if (!showEditPermissions) return;

      const newGroups = accessGroups.map(group => ({
        ...group,
        screens: group.screens.map(screen => ({ ...screen }))
      }));

      const groupIndex = newGroups.findIndex(g => g.id === groupId);
      if (groupIndex === -1) return;

      const screenIndex = newGroups[groupIndex].screens.findIndex(s => s.id === screenId);
      if (screenIndex === -1) return;

      const screen = newGroups[groupIndex].screens[screenIndex];
      const currentState = screen[permissionType];
      
      let newState;
      if (currentState === PERMISSION_STATES.EMPTY) newState = PERMISSION_STATES.GREEN;
      else if (currentState === PERMISSION_STATES.GREEN) newState = PERMISSION_STATES.EMPTY;
      else if (currentState === PERMISSION_STATES.BLUE) newState = PERMISSION_STATES.RED;
      else if (currentState === PERMISSION_STATES.RED) newState = PERMISSION_STATES.EMPTY;
      else newState = PERMISSION_STATES.EMPTY;

      screen[permissionType] = newState;

      const hasBlue = PERMISSION_TYPES.some(p => screen[p] === PERMISSION_STATES.BLUE);
      const hasGreen = PERMISSION_TYPES.some(p => screen[p] === PERMISSION_STATES.GREEN);
      const hasRed = PERMISSION_TYPES.some(p => screen[p] === PERMISSION_STATES.RED);
      
      if (hasBlue && (hasGreen || hasRed)) {
        screen.badge = 'orange';
        screen.badgeText = 'Mixed';
      } else if (hasBlue) {
        screen.badge = 'blue';
        screen.badgeText = 'From Project';
      } else if (hasGreen) {
        screen.badge = 'green';
        screen.badgeText = 'Added';
      } else if (hasRed) {
        screen.badge = 'red';
        screen.badgeText = 'Revoked';
      } else {
        screen.badge = 'orange';
        screen.badgeText = 'No Access';
      }

      const group = newGroups[groupIndex];
      group.view = group.screens.some(s => s.view !== PERMISSION_STATES.EMPTY) ? PERMISSION_STATES.BLUE : PERMISSION_STATES.EMPTY;
      group.create = group.screens.some(s => s.create !== PERMISSION_STATES.EMPTY) ? PERMISSION_STATES.BLUE : PERMISSION_STATES.EMPTY;
      group.edit = group.screens.some(s => s.edit !== PERMISSION_STATES.EMPTY) ? PERMISSION_STATES.BLUE : PERMISSION_STATES.EMPTY;
      group.delete = group.screens.some(s => s.delete !== PERMISSION_STATES.EMPTY) ? PERMISSION_STATES.BLUE : PERMISSION_STATES.EMPTY;
      
      const groupHasBlue = group.screens.some(s => 
        PERMISSION_TYPES.some(p => s[p] === PERMISSION_STATES.BLUE)
      );
      const groupHasGreen = group.screens.some(s => 
        PERMISSION_TYPES.some(p => s[p] === PERMISSION_STATES.GREEN)
      );
      const groupHasRed = group.screens.some(s => 
        PERMISSION_TYPES.some(p => s[p] === PERMISSION_STATES.RED)
      );
      
      if (groupHasBlue && (groupHasGreen || groupHasRed)) {
        group.badge = 'orange';
        group.badgeText = 'Mixed';
      } else if (groupHasBlue) {
        group.badge = 'blue';
        group.badgeText = 'From Project';
      } else if (groupHasGreen) {
        group.badge = 'green';
        group.badgeText = 'Added';
      } else if (groupHasRed) {
        group.badge = 'red';
        group.badgeText = 'Revoked';
      } else {
        group.badge = 'orange';
        group.badgeText = 'No Access';
      }

      setAccessGroups(newGroups);
    };

    const renderGroupCheckbox = (state, groupId, permissionType) => {
      const handleClick = (e) => {
        e.stopPropagation();
        e.preventDefault();
        toggleGroupPermission(groupId, permissionType);
      };

      const color = getPermissionStateColor(state);

      return (
        <div 
          className={`pac-chk pac-chk-${color}`}
          onClick={handleClick}
          style={{ cursor: showEditPermissions ? 'pointer' : 'default' }}
          title={showEditPermissions ? 'Click to toggle all screens' : 'Read only'}
        >
          {state === PERMISSION_STATES.BLUE && <Check size={12} strokeWidth={3} />}
          {state === PERMISSION_STATES.GREEN && <Check size={12} strokeWidth={3} />}
          {state === PERMISSION_STATES.RED && <X size={12} strokeWidth={3} />}
        </div>
      );
    };

    const renderScreenCheckbox = (state, groupId, screenId, permissionType) => {
      const handleClick = (e) => {
        e.stopPropagation();
        e.preventDefault();
        toggleScreenPermission(groupId, screenId, permissionType);
      };

      const color = getPermissionStateColor(state);

      return (
        <div 
          className={`pac-chk pac-chk-${color}`}
          onClick={handleClick}
          style={{ cursor: showEditPermissions ? 'pointer' : 'default' }}
          title={showEditPermissions ? 'Click to toggle' : 'Read only'}
        >
          {state === PERMISSION_STATES.BLUE && <Check size={12} strokeWidth={3} />}
          {state === PERMISSION_STATES.GREEN && <Check size={12} strokeWidth={3} />}
          {state === PERMISSION_STATES.RED && <X size={12} strokeWidth={3} />}
        </div>
      );
    };

    const filteredScreens = (() => {
      if (!searchTerm) return accessGroups;
      const search = searchTerm.toLowerCase();
      return accessGroups.map(group => ({
        ...group,
        screens: group.screens.filter(screen =>
          screen.name.toLowerCase().includes(search) ||
          group.name.toLowerCase().includes(search)
        )
      })).filter(group => group.screens.length > 0);
    })();

    return (
      <div className="pac-screen-view">
        <div className="pac-screen-view-header">
          <h3>🖥️ Screen Access Permissions</h3>
          <span className="pac-screen-count">{SCREEN_GROUPS.length} Groups</span>
        </div>

        <div className="pac-permission-legend">
          <span className="pac-legend-item">
            <span className="pac-dot pac-dot-blue"></span> From Project
          </span>
          <span className="pac-legend-item">
            <span className="pac-dot pac-dot-green"></span> Added
          </span>
          <span className="pac-legend-item">
            <span className="pac-dot pac-dot-red"></span> Revoked
          </span>
          <span className="pac-legend-item">
            <span className="pac-dot pac-dot-empty"></span> No Access
          </span>
          {showEditPermissions && (
            <span className="pac-edit-indicator">
              <AlertCircle size={14} /> Click on checkboxes to toggle
            </span>
          )}
        </div>

        <div className="pac-table-container">
          <table className="pac-table">
            <thead>
              <tr>
                <th width="32%">Group / Screen</th>
                <th width="10%" style={{ textAlign: 'center' }}>Screens</th>
                <th width="10%" style={{ textAlign: 'center' }}>View</th>
                <th width="10%" style={{ textAlign: 'center' }}>Create</th>
                <th width="10%" style={{ textAlign: 'center' }}>Edit</th>
                <th width="10%" style={{ textAlign: 'center' }}>Delete</th>
                <th width="18%" style={{ textAlign: 'center' }}>Access Type</th>
              </tr>
            </thead>
            <tbody>
              {filteredScreens.map((group) => {
                const isExpanded = expandedGroups[group.id];
                const permissionCount = getPermissionCount(group);
                
                return (
                  <React.Fragment key={group.id}>
                    <tr 
                      className="pac-group-row"
                      onClick={() => toggleGroup(group.id)}
                      style={{ cursor: 'pointer' }}
                    >
                      <td>
                        <div className="pac-group-name">
                          {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                          <group.icon size={16} className="pac-group-icon" />
                          <span>{group.name}</span>
                          <span className="pac-group-count">({group.screens.length} screens)</span>
                        </div>
                      </td>
                      <td style={{ textAlign: 'center' }}>{group.screens.length}</td>
                      <td style={{ textAlign: 'center' }}>
                        {renderGroupCheckbox(group.view, group.id, 'view')}
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        {renderGroupCheckbox(group.create, group.id, 'create')}
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        {renderGroupCheckbox(group.edit, group.id, 'edit')}
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        {renderGroupCheckbox(group.delete, group.id, 'delete')}
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <span className={`pac-badge pac-badge-${group.badge || 'orange'}`}>
                          {permissionCount > 0 ? `${permissionCount} perms` : group.badgeText || 'No Access'}
                        </span>
                      </td>
                    </tr>

                    {isExpanded && group.screens.map((screen) => (
                      <tr key={screen.id} className="pac-screen-row">
                        <td className="pac-screen-name">
                          <div className="pac-screen-indent">
                            <FileText size={14} className="pac-screen-icon" />
                            <span>{screen.name}</span>
                          </div>
                        </td>
                        <td></td>
                        <td style={{ textAlign: 'center' }}>
                          {renderScreenCheckbox(screen.view, group.id, screen.id, 'view')}
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          {renderScreenCheckbox(screen.create, group.id, screen.id, 'create')}
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          {renderScreenCheckbox(screen.edit, group.id, screen.id, 'edit')}
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          {renderScreenCheckbox(screen.delete, group.id, screen.id, 'delete')}
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <span className={`pac-badge pac-badge-${screen.badge || 'orange'}`}>
                            {screen.badgeText || 'No Access'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  // ── RENDER: Add Employee Modal ──
  const renderAddEmployeeModal = () => {
    if (!showAddEmployeeModal) return null;

    const getInitials = (name) => {
      return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    };

    const getAvatarColor = (name) => {
      const colors = [
        '#2563eb', '#7c3aed', '#0ea5e9', '#10b981', '#f59e0b', 
        '#ef4444', '#8b5cf6', '#14b8a6', '#f472b6', '#6366f1'
      ];
      let hash = 0;
      for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
      }
      return colors[Math.abs(hash) % colors.length];
    };

    return (
      <div className="pac-popup-overlay" onClick={() => { setShowAddEmployeeModal(false); setEmployeeSearchTerm(''); }}>
        <div className="pac-popup-container" onClick={(e) => e.stopPropagation()}>
          <div className="pac-popup-window">
            <div className="pac-popup-header">
              <div className="pac-popup-header-left">
                <div className="pac-popup-icon-box">
                  <UserPlus size={22} />
                </div>
                <div>
                  <h3 className="pac-popup-title">Add Employee</h3>
                  <p className="pac-popup-subtitle">
                    Select an employee to add to <strong>{selectedProject?.name}</strong>
                  </p>
                </div>
              </div>
              <button 
                className="pac-popup-close"
                onClick={() => { setShowAddEmployeeModal(false); setEmployeeSearchTerm(''); }}
              >
                <X size={20} />
              </button>
            </div>

            <div className="pac-popup-body">
              <div className="pac-popup-search">
                <div className="pac-popup-search-box">
                  <Search size={18} className="pac-popup-search-icon" />
                  <input 
                    type="text" 
                    placeholder="Search by name, ID, or department..." 
                    value={employeeSearchTerm}
                    onChange={(e) => setEmployeeSearchTerm(e.target.value)}
                    className="pac-popup-search-input"
                    autoFocus
                  />
                  {employeeSearchTerm && (
                    <button 
                      className="pac-popup-search-clear"
                      onClick={() => setEmployeeSearchTerm('')}
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>
                <div className="pac-popup-stats">
                  <span className="pac-popup-stat">
                    <Users size={14} />
                    {filteredAvailableEmployees.length} Available
                  </span>
                  <span className="pac-popup-stat pac-popup-stat-assigned">
                    <UserCheck size={14} />
                    {selectedEmployees.length} Assigned
                  </span>
                </div>
              </div>

              <div className="pac-popup-list-wrapper">
                {filteredAvailableEmployees.length === 0 ? (
                  <div className="pac-popup-empty">
                    <div className="pac-popup-empty-icon">👥</div>
                    <h4>All Employees Assigned</h4>
                    <p>All available employees are already assigned to this project.</p>
                  </div>
                ) : (
                  <div className="pac-popup-list">
                    {filteredAvailableEmployees.map((emp) => {
                      const isSelected = selectedEmployees.includes(emp.id);
                      const avatarColor = getAvatarColor(emp.name);
                      const initials = getInitials(emp.name);

                      return (
                        <div 
                          key={emp.id} 
                          className={`pac-popup-item ${isSelected ? 'selected' : ''}`}
                        >
                          <div className="pac-popup-item-avatar" style={{ background: avatarColor }}>
                            {initials}
                          </div>
                          <div className="pac-popup-item-info">
                            <div className="pac-popup-item-name">{emp.name}</div>
                            <div className="pac-popup-item-details">
                              <span className="pac-popup-item-id">{emp.id}</span>
                              <span className="pac-popup-item-role">{emp.designation}</span>
                              <span className="pac-popup-item-dept">{emp.department}</span>
                            </div>
                          </div>
                          {isSelected ? (
                            <span className="pac-popup-item-badge added">
                              <UserCheck size={14} /> Added
                            </span>
                          ) : (
                            <button 
                              className="pac-popup-item-add"
                              onClick={(e) => { e.stopPropagation(); handleAddEmployee(emp.id); }}
                            >
                              <Plus size={16} /> Add
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            <div className="pac-popup-footer">
              <span className="pac-popup-footer-info">
                {filteredAvailableEmployees.length} employee(s) available
              </span>
              <button 
                className="pac-popup-footer-cancel"
                onClick={() => { setShowAddEmployeeModal(false); setEmployeeSearchTerm(''); }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // ── RENDER: Project Detail ──
  const renderProjectDetailView = () => {
    if (!selectedProject) return null;

    return (
      <div className="pac-project-detail-view">
        <div className="pac-detail-header">
          <button className="pac-btn-outline-sm" onClick={closeProjectDetail}>
            <ArrowLeft size={16} /> Back
          </button>
          <div className="pac-detail-title">
            <h2>{selectedProject.name}</h2>
            <span className="pac-project-code">{selectedProject.code}</span>
            <span className={`pac-status-badge pac-status-${getProjectStatusColor(selectedProject.status)}`}>
              {getProjectStatusIcon(selectedProject.status)} {getProjectStatusLabel(selectedProject.status)}
            </span>
          </div>
          <div className="pac-detail-actions">
            <button 
              className={`pac-btn-${showEditPermissions ? 'success' : 'primary'}`}
              onClick={() => setShowEditPermissions(!showEditPermissions)}
            >
              {showEditPermissions ? <Check size={16} /> : <Pencil size={16} />}
              {showEditPermissions ? ' Done' : ' Edit Permissions'}
            </button>
            {showEditPermissions && (
              <button 
                className="pac-btn-primary" 
                onClick={() => showAlert('success', 'Saved', 'Permissions saved successfully!')}
              >
                <Save size={16} /> Save Changes
              </button>
            )}
          </div>
        </div>

        <div className="pac-detail-info">
          <div className="pac-detail-info-grid">
            <div className="pac-detail-info-item"><label>Manager</label><p><User size={14} /> {selectedProject.manager}</p></div>
            <div className="pac-detail-info-item"><label>Department</label><p><Building2 size={14} /> {selectedProject.department}</p></div>
            <div className="pac-detail-info-item"><label>Dates</label><p>{selectedProject.startDate} → {selectedProject.endDate}</p></div>
            <div className="pac-detail-info-item">
              <label>Progress</label>
              <div className="pac-detail-progress">
                <div className="pac-progress-bar" style={{ width: '200px' }}>
                  <div 
                    className="pac-progress-fill" 
                    style={{ 
                      width: `${selectedProject.progress}%`,
                      background: selectedProject.status === 'completed' ? '#10b981' :
                                 selectedProject.status === 'upcoming' ? '#94a3b8' :
                                 selectedProject.status === 'on-hold' ? '#ef4444' :
                                 '#2563eb'
                    }}
                  ></div>
                </div>
                <span style={{ fontWeight: '600' }}>{selectedProject.progress}%</span>
              </div>
            </div>
          </div>
        </div>

        <div className="pac-view-toggle-container">
          <div className="pac-view-toggle">
            <button className={`pac-toggle-btn ${viewMode === 'permission' ? 'active' : ''}`}
              onClick={() => setViewMode('permission')}><Shield size={14} /> Permission</button>
            <button className={`pac-toggle-btn ${viewMode === 'employee' ? 'active' : ''}`}
              onClick={() => setViewMode('employee')}><Users size={14} /> Employee</button>
            <button className={`pac-toggle-btn ${viewMode === 'screen' ? 'active' : ''}`}
              onClick={() => setViewMode('screen')}><Settings size={14} /> Screen</button>
          </div>
          <div className="pac-search-bar" style={{ width: '280px' }}>
            <Search size={16} />
            <input type="text" placeholder="Search..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
        </div>

        <div className="pac-detail-content">
          {viewMode === 'permission' && renderPermissionView()}
          {viewMode === 'employee' && renderEmployeeView()}
          {viewMode === 'screen' && renderScreenView()}
        </div>
      </div>
    );
  };

  // ── MAIN RENDER ──
  return (
    <div className="cc-shell-container">
      <Sidebar userRole={userRole} onLogout={onLogout} />
      <div className="cc-shell">
        <Header 
          title="Project Access Control" 
          subtitle="Manage access permissions for projects"
          onLogout={onLogout}
          userRole={userRole}
        />
        <main className="cc-main">
          <div className="pac-container">
            {currentView === 'projects' ? renderProjectsView() : renderProjectDetailView()}
          </div>
        </main>
      </div>

      {/* Add Employee Modal */}
      {renderAddEmployeeModal()}

      {/* Alert Modal */}
      <AlertModal
        isOpen={alertConfig.isOpen}
        type={alertConfig.type}
        title={alertConfig.title}
        message={alertConfig.message}
        onClose={closeAlert}
        onConfirm={alertConfig.onConfirm}
        confirmText={alertConfig.confirmText}
        cancelText={alertConfig.cancelText}
      />
    </div>
  );
};

export default ProjectAccess;