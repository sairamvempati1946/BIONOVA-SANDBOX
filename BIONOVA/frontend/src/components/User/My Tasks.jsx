import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import Sidebar from "../Sidebar";
import Header from "../Header";
import AlertModal from "../AlertModal";
import {
  Calendar as CalendarIcon,
  Search,
  X,
  CheckCircle2,
  AlertCircle,
  Eye,
  Play,
  RotateCw,
  ChevronLeft,
  ChevronRight,
  Check,
  Undo2,
  ClipboardList,
  Layers,
  Clock,
  RefreshCcw,
  RefreshCw,
  Loader2,
  Filter,
  User,
  Users,
  Calendar,
  Flag,
  FileText,
  CheckSquare,
  Clock as ClockIcon,
  AlertTriangle,
  ArrowLeft,
  UserCheck,
  UserX,
  UserPlus,
  Briefcase,
  ListChecks,
  MessageSquare,
  Paperclip,
  History,
  MoreVertical
} from "lucide-react";
import "../../styles/MyTasks.css";
import { apiGet, apiPut, apiPatch, apiPost } from "../../utils/api";

// ============================================
// CONSTANTS - COLORS & STATUS
// ============================================

const PROGRESS_COLORS = {
  "OPEN": { bg: "#DBEAFE", color: "#2563EB", label: "OPEN" },
  "DRAFT": { bg: "#F3F4F6", color: "#9CA3AF", label: "DRAFT" },
  "WIP": { bg: "#FEF3C7", color: "#F59E0B", label: "WORK IN PROGRESS" },
  "HOLD": { bg: "#EDE9FE", color: "#7C3AED", label: "HOLD" },
  "COMPLETED": { bg: "#DCFCE7", color: "#16A34A", label: "CLOSED" }
};

const PRIORITY_COLORS = {
  "Low": { bg: "#DCFCE7", color: "#22C55E" },
  "Normal": { bg: "#DBEAFE", color: "#3B82F6" },
  "Medium": { bg: "#FEF3C7", color: "#F59E0B" },
  "High": { bg: "#FEE2E2", color: "#EF4444" },
  "Critical": { bg: "#FEE2E2", color: "#B91C1C" },
  "Atmost Critical": { bg: "#FEE2E2", color: "#7F1D1D" }
};

const PROCESS_COLORS = {
  "PENDING_REVIEWER": { color: "#8B5CF6", icon: Eye, title: "Under Review" },
  "PENDING_APPROVER": { color: "#8B5CF6", icon: Eye, title: "Under Review" },
  "REWORK": { color: "#F97316", icon: RefreshCw, title: "Rework" },
  "REASSIGN": { color: "#4F46E5", icon: Undo2, title: "Reassign" }
};

const TIME_COLORS = {
  "Lead": { color: "#22C55E", icon: Clock, title: "Lead" },
  "On Time": { color: "#3B82F6", icon: Clock, title: "On Time" },
  "Due Today": { color: "#F59E0B", icon: Clock, title: "Due Today" },
  "Overdue": { color: "#EF4444", icon: Clock, title: "Overdue" },
  "Lag": { color: "#DC2626", icon: Clock, title: "Lag" }
};

// ============================================
// HELPER FUNCTIONS
// ============================================

const calculateTimeStatus = (task) => {
  if (!task) return { status: "On Time", color: "#3B82F6", icon: Clock, title: "On Time" };
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const dueDate = task.endDt ? new Date(task.endDt) : null;
  const completedDate = task.actCmpDt ? new Date(task.actCmpDt) : null;
  
  if (!dueDate) return { status: "On Time", color: "#3B82F6", icon: Clock, title: "On Time" };
  
  dueDate.setHours(0, 0, 0, 0);
  
  if (task.taskSts === "COMPLETED" && completedDate) {
    completedDate.setHours(0, 0, 0, 0);
    if (completedDate < dueDate) return { status: "Lead", color: "#22C55E", icon: Clock, title: "Lead" };
    if (completedDate.getTime() === dueDate.getTime()) return { status: "On Time", color: "#3B82F6", icon: Clock, title: "On Time" };
    if (completedDate > dueDate) return { status: "Lag", color: "#DC2626", icon: Clock, title: "Lag" };
  }
  
  if (today < dueDate) return { status: "On Time", color: "#3B82F6", icon: Clock, title: "On Time" };
  if (today.getTime() === dueDate.getTime()) return { status: "Due Today", color: "#F59E0B", icon: Clock, title: "Due Today" };
  if (today > dueDate) return { status: "Overdue", color: "#EF4444", icon: Clock, title: "Overdue" };
  
  return { status: "On Time", color: "#3B82F6", icon: Clock, title: "On Time" };
};

// ============================================
// GET EMPLOYEE DETAILS
// ============================================

const getEmployeeName = (empId, employeesList) => {
  if (!empId) return "Unknown";
  if (!employeesList || employeesList.length === 0) {
    return `User ${empId}`;
  }
  
  const emp = employeesList.find(e => {
    const eId = e.empId || e.employeeId || e.id || e._id || e.employee_code || e.empCode;
    return String(eId) === String(empId);
  });
  
  if (!emp) return `User ${empId}`;
  
  if (emp.employeeName) return emp.employeeName;
  if (emp.fullName) return emp.fullName;
  if (emp.name) return emp.name;
  if (emp.employee_name) return emp.employee_name;
  if (emp.empName) return emp.empName;
  if (emp.fstNm && emp.lstNm) return `${emp.fstNm} ${emp.lstNm}`.trim();
  if (emp.firstName && emp.lastName) return `${emp.firstName} ${emp.lastName}`.trim();
  if (emp.first_name && emp.last_name) return `${emp.first_name} ${emp.last_name}`.trim();
  if (emp.fstNm) return emp.fstNm;
  if (emp.firstName) return emp.firstName;
  if (emp.first_name) return emp.first_name;
  if (emp.displayName) return emp.displayName;
  if (emp.username) return emp.username;
  if (emp.email) return emp.email.split('@')[0];
  
  return emp.empCode || emp.employee_code || `User ${empId}`;
};

const getEmployeeInitials = (empId, employeesList) => {
  const name = getEmployeeName(empId, employeesList);
  if (!name || name === "Unknown" || name.startsWith('User ')) {
    const idStr = String(empId);
    return idStr.substring(0, 2).toUpperCase();
  }
  const parts = name.trim().split(" ");
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return parts[0].substring(0, 2).toUpperCase();
};

const getEmployeePhoto = (empId, employeesList) => {
  if (!empId) return null;
  if (!employeesList || employeesList.length === 0) return null;
  
  const emp = employeesList.find(e => {
    const eId = e.empId || e.employeeId || e.id || e._id || e.employee_code || e.empCode;
    return String(eId) === String(empId);
  });
  if (!emp) return null;
  
  if (emp.photoUrl) return emp.photoUrl;
  if (emp.profileImageBase64) return emp.profileImageBase64;
  if (emp.profileImage) return emp.profileImage;
  if (emp.photo) return emp.photo;
  if (emp.imageUrl) return emp.imageUrl;
  if (emp.avatar) return emp.avatar;
  if (emp.picture) return emp.picture;
  
  return null;
};

// ============================================
// FORMAT DATE FUNCTION
// ============================================
const formatDate = (dateStr) => {
  if (!dateStr) return "";
  try {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const parts = dateStr.split("-");
    if (parts.length === 3) {
      return `${parts[2]}-${months[parseInt(parts[1], 10) - 1]}-${parts[0]}`;
    }
    return dateStr;
  } catch (e) {
    return dateStr;
  }
};

// ============================================
// ACTION BUTTON - DYNAMIC BASED ON PROGRESS, PROCESS, PRIORITY, TIME
// ============================================

const getActionButton = (task, currentUserEmpId) => {
  if (!task) return { label: "View", action: "view", variant: "secondary" };
  
  const rawTask = task.rawTask || task;
  
  // Get user roles
  const executorId = rawTask.empId || rawTask.assignedTo || rawTask.executorId || rawTask.doerId;
  const reviewerId = rawTask.reviewerId || rawTask.reviewer || rawTask.reviewerEmpId;
  const approverId = rawTask.approverId || rawTask.approver || rawTask.approverEmpId;
  
  const isDoer = String(executorId) === String(currentUserEmpId);
  const isReviewer = String(reviewerId) === String(currentUserEmpId);
  const isApprover = String(approverId) === String(currentUserEmpId);
  
  // Get progress (status)
  const progress = (rawTask.taskSts || rawTask.status || rawTask.taskStatus || task.status || "OPEN").toUpperCase();
  
  // Get process
  const process = (rawTask.prcsYesActn || rawTask.processAction || rawTask.process || "NONE").toUpperCase();
  
  // Calculate time status
  const timeStatus = calculateTimeStatus(rawTask);
  
  // Calculate priority
  let calculatedPriority = "Normal";
  const endDt = rawTask.endDt || rawTask.dueDate;
  if (progress === "REASSIGN" || progress === "REWORK") {
    calculatedPriority = progress;
  } else if (endDt) {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const dueDate = new Date(endDt);
      dueDate.setHours(0, 0, 0, 0);
      
      const diffTime = today.getTime() - dueDate.getTime();
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays === 0) calculatedPriority = "High";
      else if (diffDays === 1) calculatedPriority = "Critical";
      else if (diffDays >= 2) calculatedPriority = "Atmost Critical";
    } catch (e) {}
  }
  
  // Normalize progress
  let normalizedProgress = progress;
  if (progress === "WIP" || progress === "IN_PROGRESS" || progress === "INPROGRESS") {
    normalizedProgress = "WORK_IN_PROGRESS";
  }
  if (progress === "OPEN") normalizedProgress = "OPEN";
  if (progress === "COMPLETED") normalizedProgress = "COMPLETED";
  if (progress === "HOLD") normalizedProgress = "HOLD";
  if (progress === "DRAFT") normalizedProgress = "OPEN";
  
  // Normalize process
  let normalizedProcess = process;
  if (process === "NONE" || !process || process === "NULL") normalizedProcess = "NONE";
  if (process === "PENDING_REVIEWER" || process === "UNDER_REVIEW") normalizedProcess = "UNDER_REVIEW";
  if (process === "PENDING_APPROVER") normalizedProcess = "UNDER_REVIEW";
  if (process === "REWORK") normalizedProcess = "REWORK";
  if (process === "REASSIGN") normalizedProcess = "REASSIGN";
  
  // Log for debugging
  console.log(`🔍 Dynamic Action Check - Task: ${task.id || task.taskId}`);
  console.log(`   Progress: ${normalizedProgress}, Process: ${normalizedProcess}`);
  console.log(`   Time Status: ${timeStatus.status}, Priority: ${calculatedPriority}`);
  console.log(`   IsDoer: ${isDoer}, IsReviewer: ${isReviewer}, IsApprover: ${isApprover}`);
  
  // If user has no role in this task, show View
  if (!isDoer && !isReviewer && !isApprover) {
    return { label: "View", action: "view", variant: "secondary" };
  }
  
  // ============================================
  // EXECUTOR (DOER) ACTIONS - DYNAMIC
  // ============================================
  if (isDoer) {
    // OPEN / DRAFT -> Start
    if (normalizedProgress === "OPEN") {
      return { label: "Start", action: "start", variant: "primary" };
    }
    
    // WORK_IN_PROGRESS with NONE -> Update
    if (normalizedProgress === "WORK_IN_PROGRESS" && normalizedProcess === "NONE") {
      return { label: "Update", action: "update", variant: "warning" };
    }
    
    // WORK_IN_PROGRESS with UNDER_REVIEW -> View
    if (normalizedProgress === "WORK_IN_PROGRESS" && normalizedProcess === "UNDER_REVIEW") {
      return { label: "View", action: "view", variant: "secondary" };
    }
    
    // WORK_IN_PROGRESS with REWORK -> Update
    if (normalizedProgress === "WORK_IN_PROGRESS" && normalizedProcess === "REWORK") {
      return { label: "Update", action: "update", variant: "warning" };
    }
    
    // WORK_IN_PROGRESS with REASSIGN -> View
    if (normalizedProgress === "WORK_IN_PROGRESS" && normalizedProcess === "REASSIGN") {
      return { label: "View", action: "view", variant: "secondary" };
    }
    
    // HOLD -> View
    if (normalizedProgress === "HOLD") {
      return { label: "View", action: "view", variant: "secondary" };
    }
    
    // COMPLETED -> View
    if (normalizedProgress === "COMPLETED") {
      return { label: "View", action: "view", variant: "secondary" };
    }
    
    // Default fallback for executor
    return { label: "Update", action: "update", variant: "warning" };
  }
  
  // ============================================
  // REVIEWER ACTIONS - DYNAMIC
  // ============================================
  if (isReviewer) {
    // WORK_IN_PROGRESS with UNDER_REVIEW -> Review
    if (normalizedProgress === "WORK_IN_PROGRESS" && normalizedProcess === "UNDER_REVIEW") {
      return { label: "Review", action: "review", variant: "review" };
    }
    
    // All other cases -> View
    return { label: "View", action: "view", variant: "secondary" };
  }
  
  // ============================================
  // APPROVER ACTIONS - DYNAMIC
  // ============================================
  if (isApprover) {
    // WORK_IN_PROGRESS with UNDER_REVIEW -> Approve
    if (normalizedProgress === "WORK_IN_PROGRESS" && normalizedProcess === "UNDER_REVIEW") {
      return { label: "Approve", action: "approve", variant: "success" };
    }
    
    // All other cases -> View
    return { label: "View", action: "view", variant: "secondary" };
  }
  
  return { label: "View", action: "view", variant: "secondary" };
};

const getProcessIcon = (process) => {
  if (!process || process === "NONE" || process === "REJECTED") return null;
  const processData = PROCESS_COLORS[process];
  if (!processData) return null;
  return {
    icon: processData.icon,
    color: processData.color,
    title: processData.title
  };
};

const getProgressBadge = (status) => {
  const normalizedStatus = (status || "OPEN").toUpperCase();
  const progressData = PROGRESS_COLORS[normalizedStatus];
  if (!progressData) return { label: "OPEN", bg: "#DBEAFE", color: "#2563EB" };
  return progressData;
};

const getPriorityBadge = (priority) => {
  const normalizedPriority = priority || "Normal";
  const priorityData = PRIORITY_COLORS[normalizedPriority];
  if (!priorityData) return { bg: "#F3F4F6", color: "#6B7280" };
  return priorityData;
};

// ============================================
// MAIN COMPONENT
// ============================================
const MyTasks = ({ userRole, onLogout }) => {
  const [tasks, setTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUserEmpId, setCurrentUserEmpId] = useState(null);
  const [currentUserEmail, setCurrentUserEmail] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [employeesList, setEmployeesList] = useState([]);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [apiError, setApiError] = useState(null);
  const [loadingAction, setLoadingAction] = useState(null);
  const [userName, setUserName] = useState("");
  const [showDetailView, setShowDetailView] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [updateProgressVal, setUpdateProgressVal] = useState(0);
  const [updateChecklist, setUpdateChecklist] = useState([]);
  const [updateRemarks, setUpdateRemarks] = useState("");
  const [showDenyForm, setShowDenyForm] = useState(false);
  const [denyData, setDenyData] = useState({ type: "", reason: "", milestone: "", deliverable: "", impact: "Medium" });

  // ============================================
  // FETCH TASKS
  // ============================================
  const fetchTasks = async () => {
    try {
      setIsLoading(true);
      setApiError(null);
      
      console.log("🔄 ===== FETCHING REAL TIME TASKS FROM BACKEND =====");
      const startTime = Date.now();
      
      let empId = null;
      let userEmail = null;
      let adminCheck = false;
      
      try {
        const profileRes = await apiGet("/api/profile");
        empId = profileRes?.empId;
        userEmail = profileRes?.email;
        const profileName = profileRes?.name || profileRes?.employeeName || profileRes?.fullName;
        if (profileName) {
          setUserName(profileName);
          sessionStorage.setItem("userName", profileName);
        }
        adminCheck = userEmail === 'vsv.vempati@gmail.com' || userEmail === 'admin@example.com' || userRole === 'admin';
        console.log("✅ User ID:", empId, "Is Admin:", adminCheck);
      } catch (profileErr) {
        console.error("❌ Profile API Error:", profileErr);
        const storedEmpId = sessionStorage.getItem("empId");
        const storedEmail = sessionStorage.getItem("userEmail");
        const storedName = sessionStorage.getItem("userName");
        if (storedEmpId) {
          empId = storedEmpId;
          userEmail = storedEmail;
          if (storedName) setUserName(storedName);
          adminCheck = storedEmail === 'vsv.vempati@gmail.com' || userRole === 'admin';
        }
      }
      
      setCurrentUserEmpId(empId);
      setCurrentUserEmail(userEmail);
      setIsAdmin(adminCheck);

      let employeesData = [];
      let projectsData = [];
      let milestonesData = [];
      let tasksData = [];
      let indTasksData = [];

      console.log("📡 Fetching employees data...");
      try {
        employeesData = await apiGet("/api/employees/directory");
        setEmployeesList(employeesData || []);
        console.log("✅ Employees loaded:", employeesData.length);
      } catch (err) {
        console.warn("⚠️ Employees API Error:", err);
        try {
          employeesData = await apiGet("/api/employees");
          setEmployeesList(employeesData || []);
          console.log("✅ Employees loaded from /api/employees:", employeesData.length);
        } catch (err2) {
          console.warn("⚠️ Alternative employees API also failed");
          employeesData = [];
        }
      }

      if (!empId && !adminCheck) {
        console.log("📱 No user logged in - showing demo tasks");
        const demoTasks = getDemoTasks(empId, employeesData);
        setTasks(demoTasks);
        setIsLoading(false);
        return;
      }

      console.log("📡 Fetching projects data...");
      try {
        projectsData = await apiGet("/api/project-live");
        console.log("✅ Projects loaded:", projectsData.length);
      } catch (err) {
        console.warn("⚠️ Projects API Error:", err);
        projectsData = [];
      }

      console.log("📡 Fetching milestones data...");
      try {
        milestonesData = await apiGet("/api/milestone-live");
        console.log("✅ Milestones loaded:", milestonesData.length);
      } catch (err) {
        console.warn("⚠️ Milestones API Error:", err);
        milestonesData = [];
      }

      console.log("📡 Fetching tasks data...");
      try {
        tasksData = await apiGet("/api/task-live");
        console.log("✅ Tasks loaded:", tasksData.length);
      } catch (err) {
        console.error("❌ Tasks API Error:", err);
        tasksData = [];
      }

      console.log("📡 Fetching individual tasks data...");
      try {
        indTasksData = await apiGet("/api/assignments");
        console.log("✅ Individual tasks loaded:", indTasksData.length);
      } catch (err) {
        console.warn("⚠️ Assignments API Error:", err);
        indTasksData = [];
      }

      if ((!tasksData || tasksData.length === 0) && (!indTasksData || indTasksData.length === 0)) {
        console.log("📡 No tasks found, trying alternative endpoint /api/tasks...");
        try {
          const altTasks = await apiGet("/api/tasks");
          if (altTasks && altTasks.length > 0) {
            tasksData = altTasks;
            console.log("✅ Found tasks from /api/tasks:", tasksData.length);
          }
        } catch (altErr) {
          console.warn("⚠️ Alternative tasks API also failed");
        }
        
        if ((!tasksData || tasksData.length === 0) && (!indTasksData || indTasksData.length === 0)) {
          console.log("📱 No tasks - showing demo tasks");
          const demo = getDemoTasks(empId, employeesData || []);
          setTasks(demo);
          setIsLoading(false);
          return;
        }
      }

      let filteredLiveTasks = [];
      let filteredIndTasks = [];

      if (adminCheck) {
        filteredLiveTasks = tasksData || [];
        filteredIndTasks = indTasksData || [];
        console.log(`✅ Admin: Showing all ${filteredLiveTasks.length} live tasks and ${filteredIndTasks.length} individual tasks`);
      } else {
        const userEmpId = String(empId);
        console.log(`🔍 Filtering tasks for user ID: ${userEmpId}`);
        
        filteredLiveTasks = (tasksData || []).filter(task => {
          const taskEmpId = String(task.empId || task.assignedTo || task.executorId || '');
          const taskReviewerId = String(task.reviewerId || task.reviewer || '');
          const taskApproverId = String(task.approverId || task.approver || '');
          return taskEmpId === userEmpId || taskReviewerId === userEmpId || taskApproverId === userEmpId;
        });

        filteredIndTasks = (indTasksData || []).filter(task => {
          const taskEmpId = String(task.empId || task.assignedTo || task.executorId || '');
          const taskReviewerId = String(task.reviewerId || task.reviewer || '');
          const taskApproverId = String(task.approverId || task.approver || '');
          return taskEmpId === userEmpId || taskReviewerId === userEmpId || taskApproverId === userEmpId;
        });

        console.log(`✅ User tasks (Live): ${filteredLiveTasks.length} (out of ${(tasksData || []).length})`);
        console.log(`✅ User tasks (Individual): ${filteredIndTasks.length} (out of ${(indTasksData || []).length})`);
      }

      let mapped = filteredLiveTasks.map(t => mapBackendTask(t, projectsData || [], milestonesData || [], employeesData || []));
      let mappedInd = filteredIndTasks.map(t => mapIndividualTask(t, employeesData || []));
      mapped = [...mapped, ...mappedInd];

      mapped = mapped.map(task => {
        let progress = 0;
        const taskSts = task.rawStatus || task.status;
        
        if (taskSts === 'COMPLETED') {
          progress = 100;
        } else if (taskSts === 'WIP' || taskSts === 'IN_PROGRESS' || taskSts === 'UNDER_REVIEW') {
          progress = 50;
        } else if (taskSts === 'OPEN' || taskSts === 'DRAFT') {
          progress = 0;
        }
        
        return {
          ...task,
          progress: progress,
          status: getDisplayStatus(progress, task.status, false)
        };
      });

      console.log(`✅ Final tasks loaded: ${mapped.length} (Loaded in ${Date.now() - startTime}ms)`);
      setTasks(mapped);
      
    } catch (err) {
      console.error("❌ Error loading tasks:", err);
      setApiError(err.message || "Failed to load tasks. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const getDemoTasks = (empId, employees) => {
    const userId = empId || "1";
    return [
      {
        id: "DEMO-001",
        taskId: 1,
        title: "Design Homepage (Demo)",
        project: "Website Redesign",
        milestone: "Design Phase",
        priority: "High",
        dueDate: "2026-07-20",
        status: "WIP",
        progress: 50,
        rawStatus: "WIP",
        rawTask: {
          taskId: 1,
          taskNm: "Design Homepage",
          empId: userId,
          reviewerId: "2",
          approverId: "3",
          taskSts: "WIP",
          prcsYesActn: "NONE",
          endDt: "2026-07-20"
        },
        description: "Create the main homepage design with hero section"
      },
      {
        id: "DEMO-002",
        taskId: 2,
        title: "API Integration (Demo)",
        project: "Mobile App",
        milestone: "Backend",
        priority: "Critical",
        dueDate: "2026-07-15",
        status: "OPEN",
        progress: 0,
        rawStatus: "OPEN",
        rawTask: {
          taskId: 2,
          taskNm: "API Integration",
          empId: userId,
          reviewerId: "4",
          approverId: "5",
          taskSts: "OPEN",
          prcsYesActn: "NONE",
          endDt: "2026-07-15"
        },
        description: "Integrate REST APIs for mobile app"
      },
      {
        id: "DEMO-003",
        taskId: 3,
        title: "Testing and QA (Demo)",
        project: "Website Redesign",
        milestone: "Testing",
        priority: "Normal",
        dueDate: "2026-07-25",
        status: "COMPLETED",
        progress: 100,
        rawStatus: "COMPLETED",
        rawTask: {
          taskId: 3,
          taskNm: "Testing and QA",
          empId: userId,
          reviewerId: "2",
          approverId: "3",
          taskSts: "COMPLETED",
          prcsYesActn: "NONE",
          endDt: "2026-07-25",
          actCmpDt: "2026-07-24"
        },
        description: "Complete testing and quality assurance"
      }
    ];
  };

  const getDisplayStatus = (progress, originalStatus, prcsFlg) => {
    if (progress === 100) return "COMPLETED";
    if (progress > 0) return "WIP";
    return "OPEN";
  };

  const mapBackendTask = (t, projects, milestones, employees) => {
    const milestone = milestones?.find(m => String(m.mId || m.id) === String(t.mId || t.milestoneId));
    const project = milestone ? projects?.find(p => String(p.prjId || p.id) === String(milestone.prjId || milestone.projectId)) : null;

    let status = "OPEN";
    const taskSts = t.taskSts || t.status || "OPEN";
    if (taskSts === "COMPLETED") status = "COMPLETED";
    else if (taskSts === "WIP" || taskSts === "IN_PROGRESS") status = "WIP";
    else if (taskSts === "OPEN") status = "OPEN";
    else if (taskSts === "DRAFT") status = "DRAFT";
    else if (taskSts === "HOLD") status = "HOLD";
    else status = "WIP";

    let calculatedPriority = "Normal";
    const endDt = t.endDt || t.dueDate || t.endDate;
    if (taskSts === "REASSIGN" || taskSts === "REWORK") {
      calculatedPriority = taskSts;
    } else if (endDt) {
      try {
        const dateStr = endDt.split('T')[0];
        const [year, month, day] = dateStr.split('-');
        const endDtObj = new Date(year, month - 1, day);
        endDtObj.setHours(0, 0, 0, 0);

        let compareDateObj = new Date();
        compareDateObj.setHours(0, 0, 0, 0);

        const actCmpDt = t.actCmpDt || t.actualCompletionDate || t.completedDate;
        if (taskSts === "COMPLETED" || taskSts === "UNDER_REVIEW") {
          if (actCmpDt) {
            const cmpDateStr = actCmpDt.split('T')[0];
            const [cYear, cMonth, cDay] = cmpDateStr.split('-');
            compareDateObj = new Date(cYear, cMonth - 1, cDay);
            compareDateObj.setHours(0,0,0,0);
          } else if (compareDateObj > endDtObj) {
            compareDateObj = endDtObj;
          }
        }

        const diffTime = compareDateObj.getTime() - endDtObj.getTime();
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 0) calculatedPriority = "High";
        else if (diffDays === 1) calculatedPriority = "Critical";
        else if (diffDays >= 2) calculatedPriority = "Atmost Critical";
      } catch (e) {}
    }

    return {
      id: t.taskCd || t.taskCode || `TSK-${t.taskId || t.id}`,
      taskId: t.taskId || t.id,
      title: t.taskNm || t.taskName || t.name || "Untitled Task",
      project: project ? project.prjNm || project.name : "Unknown Project",
      milestone: milestone ? milestone.mlstnTtl || milestone.title || milestone.name : "Unknown Milestone",
      priority: calculatedPriority,
      dueDate: endDt ? endDt.split('T')[0] : "",
      status: status,
      progress: 0,
      rawStatus: taskSts,
      rawTask: {
        ...t,
        empId: t.empId || t.assignedTo || t.executorId,
        reviewerId: t.reviewerId || t.reviewer,
        approverId: t.approverId || t.approver,
      },
      description: t.taskDesc || t.description || ""
    };
  };

  const mapIndividualTask = (t, employees) => {
    let status = "OPEN";
    const taskSts = t.taskSts || t.status || "OPEN";
    if (taskSts === "COMPLETED") status = "COMPLETED";
    else if (taskSts === "WIP" || taskSts === "IN_PROGRESS") status = "WIP";
    else if (taskSts === "OPEN") status = "OPEN";
    else if (taskSts === "DRAFT") status = "DRAFT";
    else if (taskSts === "HOLD") status = "HOLD";
    else status = "WIP";

    let calculatedPriority = "Normal";
    const endDt = t.endDt || t.dueDate || t.endDate;
    if (taskSts === "REASSIGN" || taskSts === "REWORK") {
      calculatedPriority = taskSts;
    } else if (endDt) {
      try {
        const dateStr = endDt.split('T')[0];
        const [year, month, day] = dateStr.split('-');
        const endDtObj = new Date(year, month - 1, day);
        endDtObj.setHours(0, 0, 0, 0);

        let compareDateObj = new Date();
        compareDateObj.setHours(0, 0, 0, 0);

        const actCmpDt = t.actCmpDt || t.actualCompletionDate || t.completedDate;
        if (taskSts === "COMPLETED" || taskSts === "UNDER_REVIEW") {
          if (actCmpDt) {
            const cmpDateStr = actCmpDt.split('T')[0];
            const [cYear, cMonth, cDay] = cmpDateStr.split('-');
            compareDateObj = new Date(cYear, cMonth - 1, cDay);
            compareDateObj.setHours(0,0,0,0);
          } else if (compareDateObj > endDtObj) {
            compareDateObj = endDtObj;
          }
        }

        const diffTime = compareDateObj.getTime() - endDtObj.getTime();
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 0) calculatedPriority = "High";
        else if (diffDays === 1) calculatedPriority = "Critical";
        else if (diffDays >= 2) calculatedPriority = "Atmost Critical";
      } catch (e) {}
    }

    return {
      id: t.taskCd || t.taskCode || `IND-${t.empTaskId || t.id}`,
      taskId: t.empTaskId || t.id,
      isIndividual: true,
      title: t.taskNm || t.taskName || t.name || "Untitled Task",
      project: "Individual Task",
      milestone: "-",
      priority: calculatedPriority,
      dueDate: endDt ? endDt.split('T')[0] : "",
      status: status,
      progress: 0,
      rawStatus: taskSts,
      rawTask: {
        ...t,
        empId: t.empId || t.assignedTo || t.executorId,
        reviewerId: t.reviewerId || t.reviewer,
        approverId: t.approverId || t.approver,
      },
      description: t.taskDesc || t.description || ""
    };
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  // ============================================
  // SIDEBAR COLLAPSE LISTENER
  // ============================================
  useEffect(() => {
    const handleSidebarToggle = (event) => {
      const collapsed = event.detail?.collapsed || false;
      setIsSidebarCollapsed(collapsed);
      document.body.classList.toggle('sidebar-collapsed', collapsed);
    };
    
    window.addEventListener('sidebarToggle', handleSidebarToggle);
    
    const sidebar = document.querySelector('.sidebar');
    if (sidebar) {
      const collapsed = sidebar.classList.contains('collapsed');
      setIsSidebarCollapsed(collapsed);
      document.body.classList.toggle('sidebar-collapsed', collapsed);
    }
    
    return () => {
      window.removeEventListener('sidebarToggle', handleSidebarToggle);
      document.body.classList.remove('sidebar-collapsed');
    };
  }, []);

  // ============================================
  // STATE
  // ============================================
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProject, setSelectedProject] = useState("All Projects");
  const [selectedMilestone, setSelectedMilestone] = useState("All Milestones");
  const [selectedPriority, setSelectedPriority] = useState("All Priorities");
  const location = useLocation();
  const [selectedStatus, setSelectedStatus] = useState(location.state?.selectedStatus || "To Do");
  const [selectedDueDate, setSelectedDueDate] = useState("");
  const [showFilters, setShowFilters] = useState(true);
  const [taskFilter, setTaskFilter] = useState("All");

  const handleStatusFilterChange = (statusVal) => {
    if (selectedStatus === statusVal) {
      setSelectedStatus("All Statuses");
    } else {
      setSelectedStatus(statusVal);
    }
  };

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [alertOpen, setAlertOpen] = useState(false);
  const [alertConfig, setAlertConfig] = useState({ type: "success", title: "", message: "" });

  // Lock body scroll
  useEffect(() => {
    if (alertOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [alertOpen]);

  // ============================================
  // WORKFLOW ACTIONS - DYNAMIC
  // ============================================

  const sendNotification = async (empId, message, taskContext = null) => {
    if (!empId) return;
    try {
      const payload = {
        empId: parseInt(empId, 10),
        title: "Task Update",
        message
      };
      if (taskContext) {
        payload.entityTyp = taskContext.isIndividual ? "INDIVIDUAL_TASK" : "TASK";
        payload.entityId = parseInt(taskContext.taskId, 10);
      }
      await apiPost("/api/notifications", payload);
    } catch (e) {
      console.warn("Failed to send notification:", e);
    }
  };

  const handleStartTask = async (task, skipAlert = false) => {
    if (!task) return;
    try {
      setLoadingAction(task.id || task.taskId);
      const originalTask = task.rawTask || task;
      
      // OPEN + NONE -> WORK_IN_PROGRESS + NONE
      const updatedTaskObj = {
        ...originalTask,
        taskSts: "WIP",
        prcsYesActn: "NONE"
      };
      
      const taskId = task.taskId || task.id;
      const updatePath = task.isIndividual 
        ? `/api/assignments/${taskId}`
        : `/api/task-live/${taskId}`;
        
      console.log(`🚀 Starting task ${taskId}`);
      await apiPut(`${updatePath}?_t=${Date.now()}`, updatedTaskObj);
      await fetchTasks();
      if (!skipAlert) triggerAlert("success", "Started", "Task moved to Work In Progress.");
      // Update the selected task
      if (selectedTask) {
        const updatedTask = tasks.find(t => t.id === task.id);
        if (updatedTask) setSelectedTask(updatedTask);
      }
    } catch (err) {
      console.error("Error starting task:", err);
      if (!skipAlert) triggerAlert("danger", "Error", "Failed to start task: " + err.message);
    } finally {
      setLoadingAction(null);
    }
  };

  const handleSubmitReview = async (task) => {
    if (!task) return;
    try {
      setLoadingAction(task.id || task.taskId);
      const originalTask = task.rawTask || task;
      
      // WORK_IN_PROGRESS + NONE/REWORK -> WORK_IN_PROGRESS + UNDER_REVIEW
      const updatedTaskObj = {
        ...originalTask,
        taskSts: "WIP",
        prcsYesActn: originalTask.reviewerId ? "PENDING_REVIEWER" : "PENDING_APPROVER"
      };
      
      const taskId = task.taskId || task.id;
      const updatePath = task.isIndividual 
        ? `/api/assignments/${taskId}`
        : `/api/task-live/${taskId}`;
        
      console.log(`📤 Submitting task ${taskId} for review`);
      await apiPut(`${updatePath}?_t=${Date.now()}`, updatedTaskObj);
      
      const targetId = originalTask.reviewerId || originalTask.approverId;
      if (targetId) {
        await sendNotification(targetId, `Task submitted for review: ${task.id}`, task);
      }
      
      await fetchTasks();
      triggerAlert("success", "Submitted", "Task submitted for review.");
      if (selectedTask) {
        const updatedTask = tasks.find(t => t.id === task.id);
        if (updatedTask) setSelectedTask(updatedTask);
      }
    } catch (err) {
      console.error("Error submitting for review:", err);
      triggerAlert("danger", "Error", "Failed to submit: " + err.message);
    } finally {
      setLoadingAction(null);
    }
  };

  const handleReviewerApprove = async (task) => {
    if (!task) return;
    try {
      setLoadingAction(task.id || task.taskId);
      const originalTask = task.rawTask || task;
      
      // WORK_IN_PROGRESS + UNDER_REVIEW -> WORK_IN_PROGRESS + UNDER_REVIEW (to approver) or COMPLETED
      let finalStatus = "WIP";
      let finalProcess = "PENDING_APPROVER";
      
      if (!originalTask.approverId) {
        finalStatus = "COMPLETED";
        finalProcess = "NONE";
      }
      
      const updatedTaskObj = {
        ...originalTask,
        taskSts: finalStatus,
        prcsYesActn: finalProcess,
        actCmpDt: finalStatus === "COMPLETED" ? new Date().toISOString().split("T")[0] : originalTask.actCmpDt
      };
      
      const taskId = task.taskId || task.id;
      const updatePath = task.isIndividual 
        ? `/api/assignments/${taskId}`
        : `/api/task-live/${taskId}`;
        
      console.log(`✅ Reviewer approving task ${taskId}`);
      await apiPut(`${updatePath}?_t=${Date.now()}`, updatedTaskObj);
      
      if (finalStatus === "COMPLETED") {
        await sendNotification(originalTask.empId, `Task Closed: ${task.id}`, task);
      } else if (originalTask.approverId) {
        await sendNotification(originalTask.approverId, `Task ready for approval: ${task.id}`, task);
      }
      
      await fetchTasks();
      triggerAlert("success", "Approved", "Task approved successfully.");
      if (selectedTask) {
        const updatedTask = tasks.find(t => t.id === task.id);
        if (updatedTask) setSelectedTask(updatedTask);
      }
    } catch (err) {
      console.error("Error approving task:", err);
      triggerAlert("danger", "Error", "Failed to approve: " + err.message);
    } finally {
      setLoadingAction(null);
    }
  };

  const handleApproverApprove = async (task) => {
    if (!task) return;
    try {
      setLoadingAction(task.id || task.taskId);
      const originalTask = task.rawTask || task;
      
      // WORK_IN_PROGRESS + UNDER_REVIEW -> COMPLETED + NONE
      const updatedTaskObj = {
        ...originalTask,
        taskSts: "COMPLETED",
        prcsYesActn: "NONE",
        actCmpDt: new Date().toISOString().split("T")[0]
      };
      
      const taskId = task.taskId || task.id;
      const updatePath = task.isIndividual 
        ? `/api/assignments/${taskId}`
        : `/api/task-live/${taskId}`;
        
      console.log(`✅ Approver approving task ${taskId}`);
      await apiPut(`${updatePath}?_t=${Date.now()}`, updatedTaskObj);
      
      await sendNotification(originalTask.empId, `Task Closed: ${task.id}`, task);
      if (originalTask.reviewerId) {
        await sendNotification(originalTask.reviewerId, `Task Closed: ${task.id}`, task);
      }
      
      await fetchTasks();
      triggerAlert("success", "Closed", "Task closed successfully.");
      if (selectedTask) {
        const updatedTask = tasks.find(t => t.id === task.id);
        if (updatedTask) setSelectedTask(updatedTask);
      }
    } catch (err) {
      console.error("Error closing task:", err);
      triggerAlert("danger", "Error", "Failed to close: " + err.message);
    } finally {
      setLoadingAction(null);
    }
  };

  const handleReviewerReject = async (task, reason) => {
    if (!task) return;
    try {
      setLoadingAction(task.id || task.taskId);
      const originalTask = task.rawTask || task;
      
      // WORK_IN_PROGRESS + UNDER_REVIEW -> WORK_IN_PROGRESS + REWORK
      const prefix = `[Rejected - ${sessionStorage.getItem("userName") || 'Reviewer'}]`;
      const existingRem = task.isIndividual ? originalTask.remarks : originalTask.addlRem;
      const newRem = existingRem ? `${existingRem}\n---\n${prefix}: ${reason}` : `${prefix}: ${reason}`;

      const updatedTaskObj = {
        ...originalTask,
        taskSts: "WIP",
        prcsYesActn: "REWORK"
      };

      if (task.isIndividual) {
        updatedTaskObj.remarks = newRem;
      } else {
        updatedTaskObj.addlRem = newRem;
      }
      
      const taskId = task.taskId || task.id;
      const updatePath = task.isIndividual 
        ? `/api/assignments/${taskId}`
        : `/api/task-live/${taskId}`;
        
      console.log(`❌ Reviewer rejecting task ${taskId}`);
      await apiPut(`${updatePath}?_t=${Date.now()}`, updatedTaskObj);
      await sendNotification(originalTask.empId, `Task rejected, needs rework: ${task.id}`, task);
      
      await fetchTasks();
      triggerAlert("warning", "Rejected", "Task sent back for rework.");
      if (selectedTask) {
        const updatedTask = tasks.find(t => t.id === task.id);
        if (updatedTask) setSelectedTask(updatedTask);
      }
    } catch (err) {
      console.error("Error rejecting task:", err);
      triggerAlert("danger", "Error", "Failed to reject: " + err.message);
    } finally {
      setLoadingAction(null);
    }
  };

  const handleReviewerReassign = async (task, reason, newExecutorId) => {
    if (!task) return;
    try {
      setLoadingAction(task.id || task.taskId);
      const originalTask = task.rawTask || task;
      
      // WORK_IN_PROGRESS + UNDER_REVIEW -> WORK_IN_PROGRESS + REASSIGN
      const prefix = `[Reassigned - ${sessionStorage.getItem("userName") || 'Reviewer'}]`;
      const existingRem = task.isIndividual ? originalTask.remarks : originalTask.addlRem;
      const newRem = existingRem ? `${existingRem}\n---\n${prefix}: ${reason}` : `${prefix}: ${reason}`;

      const updatedTaskObj = {
        ...originalTask,
        taskSts: "WIP",
        prcsYesActn: "REASSIGN",
        empId: newExecutorId || originalTask.empId
      };

      if (task.isIndividual) {
        updatedTaskObj.remarks = newRem;
      } else {
        updatedTaskObj.addlRem = newRem;
      }
      
      const taskId = task.taskId || task.id;
      const updatePath = task.isIndividual 
        ? `/api/assignments/${taskId}`
        : `/api/task-live/${taskId}`;
        
      console.log(`🔄 Reviewer reassigning task ${taskId}`);
      await apiPut(`${updatePath}?_t=${Date.now()}`, updatedTaskObj);
      
      if (newExecutorId) {
        await sendNotification(newExecutorId, `Task reassigned to you: ${task.id}`, task);
      }
      
      await fetchTasks();
      triggerAlert("info", "Reassigned", "Task reassigned successfully.");
      if (selectedTask) {
        const updatedTask = tasks.find(t => t.id === task.id);
        if (updatedTask) setSelectedTask(updatedTask);
      }
    } catch (err) {
      console.error("Error reassigning task:", err);
      triggerAlert("danger", "Error", "Failed to reassign: " + err.message);
    } finally {
      setLoadingAction(null);
    }
  };

  const handleApproverReject = async (task, reason) => {
    if (!task) return;
    try {
      setLoadingAction(task.id || task.taskId);
      const originalTask = task.rawTask || task;
      
      // WORK_IN_PROGRESS + UNDER_REVIEW -> WORK_IN_PROGRESS + REWORK
      const prefix = `[Rejected by Approver - ${sessionStorage.getItem("userName") || 'Approver'}]`;
      const existingRem = task.isIndividual ? originalTask.remarks : originalTask.addlRem;
      const newRem = existingRem ? `${existingRem}\n---\n${prefix}: ${reason}` : `${prefix}: ${reason}`;

      const updatedTaskObj = {
        ...originalTask,
        taskSts: "WIP",
        prcsYesActn: "REWORK"
      };

      if (task.isIndividual) {
        updatedTaskObj.remarks = newRem;
      } else {
        updatedTaskObj.addlRem = newRem;
      }
      
      const taskId = task.taskId || task.id;
      const updatePath = task.isIndividual 
        ? `/api/assignments/${taskId}`
        : `/api/task-live/${taskId}`;
        
      console.log(`❌ Approver rejecting task ${taskId}`);
      await apiPut(`${updatePath}?_t=${Date.now()}`, updatedTaskObj);
      await sendNotification(originalTask.empId, `Task rejected by approver, needs rework: ${task.id}`, task);
      
      await fetchTasks();
      triggerAlert("warning", "Rejected", "Task sent back for rework.");
      if (selectedTask) {
        const updatedTask = tasks.find(t => t.id === task.id);
        if (updatedTask) setSelectedTask(updatedTask);
      }
    } catch (err) {
      console.error("Error rejecting task:", err);
      triggerAlert("danger", "Error", "Failed to reject: " + err.message);
    } finally {
      setLoadingAction(null);
    }
  };

  const handleResumeTask = async (task) => {
    if (!task) return;
    try {
      setLoadingAction(task.id || task.taskId);
      const originalTask = task.rawTask || task;
      
      // HOLD + NONE -> WORK_IN_PROGRESS + NONE
      const updatedTaskObj = {
        ...originalTask,
        taskSts: "WIP",
        prcsYesActn: "NONE"
      };
      
      const taskId = task.taskId || task.id;
      const updatePath = task.isIndividual 
        ? `/api/assignments/${taskId}`
        : `/api/task-live/${taskId}`;
        
      console.log(`▶️ Resuming task ${taskId}`);
      await apiPut(`${updatePath}?_t=${Date.now()}`, updatedTaskObj);
      await fetchTasks();
      triggerAlert("success", "Resumed", "Task resumed.");
      if (selectedTask) {
        const updatedTask = tasks.find(t => t.id === task.id);
        if (updatedTask) setSelectedTask(updatedTask);
      }
    } catch (err) {
      console.error("Error resuming task:", err);
      triggerAlert("danger", "Error", "Failed to resume: " + err.message);
    } finally {
      setLoadingAction(null);
    }
  };

  const handleUpdateProgress = async () => {
    if (!selectedTask) return;
    try {
      setLoadingAction(selectedTask.id || selectedTask.taskId);
      const originalTask = selectedTask.rawTask || selectedTask;
      
      await Promise.all(updateChecklist
        .filter(item => item.id != null)
        .map(item => {
          const path = `/api/checklists/${item.id}/${item.completed ? 'complete' : 'reopen'}?_t=${Date.now()}`;
          return apiPatch(path, {});
        })
      );

      if (updateRemarks) {
        const existingRem = selectedTask.isIndividual ? originalTask.remarks : originalTask.addlRem;
        const newRem = existingRem ? `${existingRem}\n---\n[Executor]: ${updateRemarks}` : updateRemarks;
        const updatedTaskObj = {
          ...originalTask
        };
        if (selectedTask.isIndividual) {
          updatedTaskObj.remarks = newRem;
        } else {
          updatedTaskObj.addlRem = newRem;
        }
        const taskId = selectedTask.taskId || selectedTask.id;
        const updatePath = selectedTask.isIndividual 
          ? `/api/assignments/${taskId}`
          : `/api/task-live/${taskId}`;
        await apiPut(`${updatePath}?_t=${Date.now()}`, updatedTaskObj);
      }
      
      await fetchTasks();
      triggerAlert("success", "Updated", "Progress updated successfully.");
      if (selectedTask) {
        const updatedTask = tasks.find(t => t.id === selectedTask.id);
        if (updatedTask) setSelectedTask(updatedTask);
      }
    } catch (err) {
      console.error("Error updating progress:", err);
      triggerAlert("danger", "Error", "Failed to update: " + err.message);
    } finally {
      setLoadingAction(null);
    }
  };

  const handleSaveProgress = async () => {
    if (!selectedTask) return;
    let progress = updateProgressVal;
    const originalTask = selectedTask.rawTask || selectedTask;
    const prcsFlg = originalTask?.prcsFlg || originalTask?.prcsflg || false;
    const currentSts = selectedTask.rawStatus || selectedTask.status;

    if (updateChecklist.length === 0 && currentSts !== "SUBMIT_REVIEW" && currentSts !== "UNDER_REVIEW") {
       progress = 100;
    }

    let backendSts = "OPEN";
    let newPrcsActn = originalTask.prcsYesActn || "NONE";
    const allChecked = updateChecklist.length > 0 && updateChecklist.every(c => c.completed);
    
    if (currentSts === "UNDER_REVIEW") {
       backendSts = "COMPLETED";
    } else {
       if (prcsFlg && (progress === 100 || allChecked)) {
           backendSts = "UNDER_REVIEW";
           if (originalTask?.reviewerId) {
               newPrcsActn = "PENDING_REVIEWER";
           } else if (originalTask?.approverId) {
               newPrcsActn = "PENDING_APPROVER";
           } else {
               backendSts = "COMPLETED";
           }
       } else if (!prcsFlg && (progress === 100 || allChecked)) {
           backendSts = "COMPLETED";
       } else if (progress > 0) {
           backendSts = "WIP";
       } else {
           backendSts = (currentSts === "WIP" || currentSts === "OPEN" || currentSts === "REASSIGN" || currentSts === "REWORK") ? "WIP" : "OPEN";
       }
    }

    try {
      setLoadingAction(selectedTask.id || selectedTask.taskId);
      const existingRem = selectedTask.isIndividual ? originalTask.remarks : originalTask.addlRem;
      const newRem = updateRemarks ? (existingRem ? `${existingRem}\n---\n[Executor]: ${updateRemarks}` : updateRemarks) : existingRem;

      const updatedTaskObj = {
        ...originalTask,
        taskSts: backendSts,
        prcsYesActn: newPrcsActn,
      };

      if (selectedTask.isIndividual) {
        updatedTaskObj.remarks = newRem;
      } else {
        updatedTaskObj.addlRem = newRem;
      }

      if (currentSts !== "UNDER_REVIEW") {
        await Promise.all(updateChecklist
          .filter(item => item.id != null)
          .map(item => {
            const path = `/api/checklists/${item.id}/${item.completed ? 'complete' : 'reopen'}?_t=${Date.now()}`;
            return apiPatch(path, {});
          })
        );
      }

      const taskId = selectedTask.taskId || selectedTask.id;
      const updatePath = selectedTask.isIndividual 
        ? `/api/assignments/${taskId}`
        : `/api/task-live/${taskId}`;
        
      console.log(`💾 Saving progress for task ${taskId}`);
      await apiPut(`${updatePath}?_t=${Date.now()}`, updatedTaskObj);

      await fetchTasks();
      triggerAlert("success", "Success", "Task progress updated successfully.");
      if (selectedTask) {
        const updatedTask = tasks.find(t => t.id === selectedTask.id);
        if (updatedTask) setSelectedTask(updatedTask);
      }
    } catch (err) {
      console.error("Error saving progress:", err);
      triggerAlert("danger", "Error", "Failed to update task: " + err.message);
    } finally {
      setLoadingAction(null);
    }
  };

  const handleToggleChecklist = (id) => {
    if (!id) return;
    if (selectedTask?.status === "WIP" && selectedTask?.rawTask?.prcsYesActn === "PENDING_APPROVER") return;
    if (selectedTask?.status === "COMPLETED") return;
    const executorId = selectedTask?.rawTask?.empId || selectedTask?.rawTask?.assignedTo;
    if (String(executorId) !== String(currentUserEmpId)) return;

    setUpdateChecklist(prev => {
      const newList = prev.map(item =>
        item.id === id ? { ...item, completed: !item.completed } : item
      );
      const progress = computeProgress(newList, selectedTask);
      setUpdateProgressVal(progress);
      return newList;
    });
  };

  const handleSendReminder = async (targetId, role) => {
    if (!targetId) return;
    try {
      await sendNotification(targetId, `Reminder: Task "${selectedTask.title}" (${selectedTask.id}) is pending for your action.`, selectedTask);
      triggerAlert("success", "Sent", `Reminder sent to ${role}!`);
      setShowDetailView(false);
    } catch (err) {
      console.error("Failed to send reminder:", err);
      triggerAlert("danger", "Error", "Failed to send reminder.");
    }
  };

  const handleSubmitDeny = async () => {
    if (!selectedTask) return;
    try {
      const originalTask = selectedTask.rawTask || selectedTask;
      
      const newStatus = denyData.type;
      const prefix = `[${newStatus === "REWORK" ? 'Rejected' : 'Reassigned'} - ${sessionStorage.getItem("userName") || 'Reviewer'}]`;
      const existingRem = selectedTask.isIndividual ? originalTask.remarks : originalTask.addlRem;
      const newRem = existingRem ? `${existingRem}\n---\n${prefix}: ${denyData.reason}` : `${prefix}: ${denyData.reason}`;

      const updatedTaskObj = {
        ...originalTask,
        taskSts: "WIP",
        prcsYesActn: newStatus === "REWORK" ? "REWORK" : "REASSIGN"
      };

      if (newStatus === "REASSIGN" && denyData.milestone) {
        updatedTaskObj.empId = denyData.milestone;
      }

      if (selectedTask.isIndividual) {
        updatedTaskObj.remarks = newRem;
      } else {
        updatedTaskObj.addlRem = newRem;
      }

      const taskId = selectedTask.taskId || selectedTask.id;
      const updatePath = selectedTask.isIndividual 
        ? `/api/assignments/${taskId}`
        : `/api/task-live/${taskId}`;
        
      console.log(`📝 Processing denial for task ${taskId}`);
      await apiPut(`${updatePath}?_t=${Date.now()}`, updatedTaskObj);

      if (updateChecklist.length > 0) {
        await Promise.all(updateChecklist
          .filter(item => item.id != null)
          .map(item => {
            const path = `/api/checklists/${item.id}/reopen?_t=${Date.now()}`;
            return apiPatch(path, {});
          })
        );
      }

      await fetchTasks();
      setShowDenyForm(false);
      triggerAlert("success", "Success", `Task ${newStatus === "REWORK" ? 'sent back for rework' : 'reassigned'}.`);
      if (selectedTask) {
        const updatedTask = tasks.find(t => t.id === selectedTask.id);
        if (updatedTask) setSelectedTask(updatedTask);
      }
    } catch (err) {
      console.error("Error processing denial:", err);
      triggerAlert("danger", "Error", "Failed to process: " + err.message);
    }
  };

  const computeProgress = (checklist, task) => {
    if (!checklist || checklist.length === 0) return 0;
    const completed = checklist.filter(item => item.completed).length;
    const prcsFlg = task?.rawTask?.prcsFlg || task?.rawTask?.prcsflg || false;
    const taskSts = task?.rawStatus || task?.status;

    if (!prcsFlg) {
      return Math.round((completed / checklist.length) * 100);
    } else {
       if (taskSts === 'COMPLETED') return 100;
       if (taskSts === 'UNDER_REVIEW') return task?.rawTask?.prcsYesActn === "PENDING_APPROVER" ? 95 : 90;
       if (taskSts === 'SUBMIT_REVIEW') return 90;
       let prog = Math.round((completed / checklist.length) * 100);
       if (prog === 100 && taskSts !== 'COMPLETED' && taskSts !== 'UNDER_REVIEW' && taskSts !== 'SUBMIT_REVIEW') {
           return 85;
       }
       return prog;
    }
  };

  const triggerAlert = (type, title, message) => {
    setAlertConfig({ type, title, message });
    setAlertOpen(true);
  };

  // ============================================
  // FILTERING & PAGINATION
  // ============================================

  const visibleTasks = tasks;

  const isToDo = (task) => {
    const rawTask = task.rawTask || task;
    const isExec = String(rawTask.empId || rawTask.assignedTo) === String(currentUserEmpId);
    const isRev = String(rawTask.reviewerId || rawTask.reviewer) === String(currentUserEmpId);
    const isApp = String(rawTask.approverId || rawTask.approver) === String(currentUserEmpId);

    if (!isExec && !isRev && !isApp) return false;
    if (task.rawStatus === "COMPLETED") return false;
    return true;
  };

  const isCompletedTab = (task) => {
    const rawTask = task.rawTask || task;
    const isExec = String(rawTask.empId || rawTask.assignedTo) === String(currentUserEmpId);
    const isRev = String(rawTask.reviewerId || rawTask.reviewer) === String(currentUserEmpId);

    if (task.rawStatus === "COMPLETED") {
      if (isExec || isRev) return true;
    }
    return false;
  };

  const countTodo = visibleTasks.filter(isToDo).length;
  const countCompleted = visibleTasks.filter(isCompletedTab).length;
  const countAllTasks = visibleTasks.length;

  const getTaskStatusFilter = (task) => {
    const rawTask = task.rawTask || task;
    const sts = (rawTask.taskSts || rawTask.status || task.status || "OPEN").toUpperCase();
    const process = (rawTask.prcsYesActn || "NONE").toUpperCase();
    
    if (sts === "OPEN" || sts === "DRAFT") {
      return "OPEN";
    }
    
    if (sts === "COMPLETED") {
      return "COMPLETED";
    }
    
    if (sts === "WIP" || sts === "IN_PROGRESS") {
      if (process === "PENDING_REVIEWER" || process === "PENDING_APPROVER" || process === "UNDER_REVIEW") {
        return "UNDER_REVIEW";
      }
      if (process === "REASSIGN") {
        return "REASSIGNED";
      }
      return "IN_PROGRESS";
    }
    
    if (sts === "HOLD") {
      return "HOLD";
    }
    
    return sts;
  };

  const isTaskOverdue = (task) => {
    const rawTask = task.rawTask || task;
    if (!rawTask.endDt) return false;
    if (rawTask.taskSts === "COMPLETED") return false;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dueDate = new Date(rawTask.endDt);
    dueDate.setHours(0, 0, 0, 0);
    
    return today > dueDate;
  };

  const filteredTasks = tasks.filter(task => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      if (!task.id.toLowerCase().includes(q) && !task.title.toLowerCase().includes(q)) return false;
    }
    
    if (selectedProject !== "All Projects" && task.project !== selectedProject) return false;
    if (selectedMilestone !== "All Milestones" && task.milestone !== selectedMilestone) return false;
    if (selectedPriority !== "All Priorities" && task.priority !== selectedPriority) return false;
    
    if (taskFilter !== "All" && selectedStatus !== "Completed") {
      const statusFilter = getTaskStatusFilter(task);
      if (taskFilter === "OVERDUE") {
        if (!isTaskOverdue(task)) return false;
      } else {
        if (statusFilter !== taskFilter) return false;
      }
    }
    
    if (selectedStatus !== "All Statuses") {
      if (selectedStatus === "To Do") {
        if (!isToDo(task)) return false;
      } else if (selectedStatus === "Completed") {
        if (!isCompletedTab(task)) return false;
      }
    }
    
    if (selectedDueDate && task.dueDate !== selectedDueDate) return false;
    return true;
  });

  const sortedTasks = [...filteredTasks].sort((a, b) => {
    const aOverdue = isTaskOverdue(a);
    const bOverdue = isTaskOverdue(b);
    if (aOverdue && !bOverdue) return -1;
    if (!aOverdue && bOverdue) return 1;
    if (a.dueDate && b.dueDate) {
      return a.dueDate.localeCompare(b.dueDate);
    }
    return 0;
  });

  const totalPages = Math.ceil(sortedTasks.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedTasks = sortedTasks.slice(startIndex, startIndex + itemsPerPage);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleSearch = () => {
    setSearchQuery(searchInput.trim());
  };

  const handleResetFilters = (e) => {
    if (e) e.preventDefault();
    setSearchInput("");
    setSearchQuery("");
    setSelectedProject("All Projects");
    setSelectedMilestone("All Milestones");
    setSelectedPriority("All Priorities");
    setSelectedStatus("All Statuses");
    setSelectedDueDate("");
    setTaskFilter("All");
    setCurrentPage(1);
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedProject, selectedMilestone, selectedPriority, selectedStatus, selectedDueDate, taskFilter]);

  const handleSearchKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSearch();
    }
  };

  const getCurrentStatusDisplay = () => {
    if (!selectedTask) return "OPEN";
    const prcsFlg = selectedTask.rawTask?.prcsFlg || false;
    return getDisplayStatus(updateProgressVal, selectedTask.status, prcsFlg);
  };

  // ============================================
  // OPEN TASK DETAIL SCREEN
  // ============================================
  const openTaskDetail = async (task) => {
    if (!task) return;
    setSelectedTask(task);
    setUpdateRemarks("");
    setShowDenyForm(false);
    setDenyData({ type: "", reason: "", milestone: "", deliverable: "", impact: "Medium" });

    try {
      const taskId = task.taskId || task.id;
      const path = task.isIndividual
        ? `/api/checklists/assignments/${taskId}`
        : `/api/checklists/live-task/${taskId}`;
        
      const items = await apiGet(path);
      const mapped = (items || []).map(item => ({
        id: item.chkId || item.id,
        text: item.chkNm || item.name || item.text,
        completed: item.chkSts || item.completed || false
      }));
      setUpdateChecklist(mapped);
      const progress = computeProgress(mapped, task);
      setUpdateProgressVal(progress);
    } catch (err) {
      console.error("Failed to load checklist:", err);
      setUpdateChecklist([]);
      setUpdateProgressVal(0);
    }

    setShowDetailView(true);
  };

  // ============================================
  // TASK DETAIL SCREEN COMPONENT - DYNAMIC
  // ============================================
  const TaskDetailScreen = ({ task, onBack }) => {
    if (!task) return null;

    const rawTask = task.rawTask || task;
    const timeStatus = calculateTimeStatus(rawTask);
    const progressBadge = getProgressBadge(task.status || task.rawStatus);
    const priorityBadge = getPriorityBadge(task.priority);
    
    // Get dynamic action based on current state
    const action = getActionButton(rawTask, currentUserEmpId);
    
    const isOverdue = (() => {
      if (!rawTask?.endDt) return false;
      if (rawTask?.taskSts === "COMPLETED") return false;
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const dueDate = new Date(rawTask.endDt);
      dueDate.setHours(0, 0, 0, 0);
      return today > dueDate;
    })();

    const isCompleted = task.rawStatus === "COMPLETED";
    const isDoer = String(rawTask.empId || rawTask.assignedTo) === String(currentUserEmpId);
    const isReviewer = String(rawTask.reviewerId || rawTask.reviewer) === String(currentUserEmpId);
    const isApprover = String(rawTask.approverId || rawTask.approver) === String(currentUserEmpId);

    // Get current progress and process for display
    const currentProgress = task.rawStatus || task.status || "OPEN";
    const currentProcess = rawTask.prcsYesActn || "NONE";
    
    // Determine if task is in review
    const isUnderReview = currentProcess === "PENDING_REVIEWER" || currentProcess === "PENDING_APPROVER" || currentProcess === "UNDER_REVIEW";

    const renderTeamMember = (empId, role, label) => {
      if (!empId) return null;
      const name = getEmployeeName(empId, employeesList);
      const initials = getEmployeeInitials(empId, employeesList);
      const photo = getEmployeePhoto(empId, employeesList);
      
      const roleColors = {
        "Executor": { bg: "#3B82F6", light: "#DBEAFE" },
        "Reviewer": { bg: "#8B5CF6", light: "#EDE9FE" },
        "Approver": { bg: "#F59E0B", light: "#FEF3C7" }
      };
      const color = roleColors[role] || { bg: "#64748B", light: "#F1F5F9" };

      return (
        <div style={{ 
          display: "flex", 
          alignItems: "center", 
          gap: "12px",
          padding: "8px 12px",
          borderRadius: "8px",
          backgroundColor: color.light,
          border: `1px solid ${color.bg}33`
        }}>
          <div style={{
            width: "40px",
            height: "40px",
            borderRadius: "50%",
            backgroundColor: color.bg,
            color: "white",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "12px",
            fontWeight: "700",
            overflow: "hidden",
            flexShrink: 0
          }}>
            {photo ? (
              <img 
                src={photo.startsWith('data:') || photo.startsWith('http') ? photo : `data:image/jpeg;base64,${photo}`} 
                alt={name} 
                style={{ width: "100%", height: "100%", objectFit: "cover" }} 
                onError={(e) => {
                  e.target.style.display = "none";
                  e.target.parentElement.textContent = initials || "UN";
                }}
              />
            ) : initials || "UN"}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: "600", fontSize: "14px", color: "#0f172a" }}>{name}</div>
            <div style={{ fontSize: "12px", color: color.bg, fontWeight: "500" }}>{role}</div>
          </div>
          <span style={{ 
            fontSize: "10px", 
            fontWeight: "700", 
            color: color.bg,
            backgroundColor: `${color.bg}22`,
            padding: "2px 10px",
            borderRadius: "12px"
          }}>
            {label}
          </span>
        </div>
      );
    };

    const getStatusColor = (status) => {
      if (status === "COMPLETED") return "#16a34a";
      if (status === "OVERDUE") return "#ef4444";
      if (status === "UNDER_REVIEW") return "#8b5cf6";
      return "#3b82f6";
    };

    const getStatusBgColor = (status) => {
      if (status === "COMPLETED") return "#dcfce7";
      if (status === "OVERDUE") return "#fee2e2";
      if (status === "UNDER_REVIEW") return "#f3e8ff";
      if (status === "IN_PROGRESS") return "#dbeafe";
      return "#f1f5f9";
    };

    // Render action buttons based on dynamic state
    const renderActionButtons = () => {
      if (isCompleted) {
        return (
          <button 
            className="cc-btn secondary" 
            onClick={onBack}
            style={{ borderRadius: "6px", width: "100%" }}
          >
            Back to Tasks
          </button>
        );
      }

      // REVIEWER ACTIONS
      if (isReviewer && isUnderReview) {
        return (
          <div style={{ display: "flex", flexDirection: "column", gap: "8px", width: "100%" }}>
            <button className="cc-btn secondary" onClick={onBack} style={{ borderRadius: "6px", width: "100%" }}>Back</button>
            <button 
              className="cc-btn danger" 
              onClick={() => setShowDenyForm(true)} 
              style={{ borderRadius: "6px", backgroundColor: "#ef4444", color: "white", border: "none", width: "100%" }}
            >
              Denied
            </button>
            <button 
              className="cc-btn primary" 
              onClick={async () => {
                await handleReviewerApprove(task);
                onBack();
              }} 
              style={{ borderRadius: "6px", backgroundColor: "#10b981", border: "none", color: "white", width: "100%" }}
            >
              Approve
            </button>
          </div>
        );
      }

      // APPROVER ACTIONS
      if (isApprover && isUnderReview) {
        return (
          <div style={{ display: "flex", flexDirection: "column", gap: "8px", width: "100%" }}>
            <button className="cc-btn secondary" onClick={onBack} style={{ borderRadius: "6px", width: "100%" }}>Back</button>
            <button 
              className="cc-btn danger" 
              onClick={() => setShowDenyForm(true)} 
              style={{ borderRadius: "6px", backgroundColor: "#ef4444", color: "white", border: "none", width: "100%" }}
            >
              Denied
            </button>
            <button 
              className="cc-btn primary" 
              onClick={async () => {
                await handleApproverApprove(task);
                onBack();
              }} 
              style={{ borderRadius: "6px", backgroundColor: "#10b981", border: "none", color: "white", width: "100%" }}
            >
              Approve
            </button>
          </div>
        );
      }

      // EXECUTOR ACTIONS - DYNAMIC BASED ON PROGRESS & PROCESS
      if (isDoer) {
        // OPEN / DRAFT -> Start
        if (currentProgress === "OPEN" || currentProgress === "DRAFT") {
          return (
            <div style={{ display: "flex", flexDirection: "column", gap: "8px", width: "100%" }}>
              <button className="cc-btn secondary" onClick={onBack} style={{ borderRadius: "6px", width: "100%" }}>Back</button>
              <button 
                className="cc-btn primary" 
                onClick={async () => {
                  await handleStartTask(task);
                  const updatedTask = tasks.find(t => t.id === task.id);
                  if (updatedTask) setSelectedTask(updatedTask);
                }} 
                style={{ borderRadius: "6px", backgroundColor: "#3b82f6", border: "none", color: "white", width: "100%" }}
              >
                Start
              </button>
            </div>
          );
        }

        // WORK_IN_PROGRESS with NONE or REWORK -> Update / Submit Review
        if ((currentProgress === "WIP" || currentProgress === "IN_PROGRESS") && 
            (currentProcess === "NONE" || currentProcess === "REWORK" || !currentProcess)) {
          const allChecked = updateChecklist.length > 0 && updateChecklist.every(c => c.completed);
          const label = allChecked || updateChecklist.length === 0 ? "Submit Review" : "Save Progress";
          const isSubmit = label === "Submit Review";
          
          return (
            <div style={{ display: "flex", flexDirection: "column", gap: "8px", width: "100%" }}>
              <button className="cc-btn secondary" onClick={onBack} style={{ borderRadius: "6px", width: "100%" }}>Back</button>
              <button 
                className="cc-btn primary" 
                onClick={async () => {
                  if (isSubmit) {
                    await handleUpdateProgress();
                    await handleSubmitReview(task);
                  } else {
                    await handleSaveProgress();
                  }
                  const updatedTask = tasks.find(t => t.id === task.id);
                  if (updatedTask) setSelectedTask(updatedTask);
                }} 
                style={{ borderRadius: "6px", backgroundColor: isSubmit ? "#8B5CF6" : "#0F172A", border: "none", color: "white", width: "100%" }}
              >
                {label}
              </button>
            </div>
          );
        }

        // WORK_IN_PROGRESS with UNDER_REVIEW or REASSIGN -> Send Reminder
        if ((currentProgress === "WIP" || currentProgress === "IN_PROGRESS" || currentProgress === "UNDER_REVIEW") && 
            (currentProcess === "PENDING_REVIEWER" || currentProcess === "PENDING_APPROVER" || currentProcess === "REASSIGN")) {
          const targetId = rawTask.reviewerId || rawTask.approverId;
          const role = rawTask.reviewerId ? "Reviewer" : "Approver";
          
          return (
            <div style={{ display: "flex", flexDirection: "column", gap: "8px", width: "100%" }}>
              <button className="cc-btn secondary" onClick={onBack} style={{ borderRadius: "6px", width: "100%" }}>Back</button>
              <button 
                className="cc-btn primary" 
                onClick={() => handleSendReminder(targetId, role)} 
                style={{ borderRadius: "6px", backgroundColor: "#0F172A", border: "none", color: "white", width: "100%" }}
              >
                Send Reminder
              </button>
            </div>
          );
        }

        // HOLD -> Resume
        if (currentProgress === "HOLD") {
          return (
            <div style={{ display: "flex", flexDirection: "column", gap: "8px", width: "100%" }}>
              <button className="cc-btn secondary" onClick={onBack} style={{ borderRadius: "6px", width: "100%" }}>Back</button>
              <button 
                className="cc-btn primary" 
                onClick={async () => {
                  await handleResumeTask(task);
                  const updatedTask = tasks.find(t => t.id === task.id);
                  if (updatedTask) setSelectedTask(updatedTask);
                }} 
                style={{ borderRadius: "6px", backgroundColor: "#3b82f6", border: "none", color: "white", width: "100%" }}
              >
                Resume
              </button>
            </div>
          );
        }
      }

      // Default: Back button only
      return (
        <button className="cc-btn secondary" onClick={onBack} style={{ borderRadius: "6px", width: "100%" }}>
          Back to Tasks
        </button>
      );
    };

    return (
      <div style={{ 
        width: "100%",
        background: "#f8fafc",
        borderRadius: "12px",
        padding: "0",
        marginTop: "0",
        maxHeight: "calc(100vh - 180px)",
        overflowY: "auto"
      }}>
        {/* Header */}
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "16px 24px",
          background: "white",
          borderBottom: "1px solid #e2e8f0",
          borderRadius: "12px 12px 0 0",
          marginBottom: "24px",
          flexWrap: "wrap",
          gap: "12px",
          position: "sticky",
          top: 0,
          zIndex: 10
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <button
              onClick={onBack}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                background: "none",
                border: "1px solid #e2e8f0",
                borderRadius: "8px",
                padding: "8px 16px",
                cursor: "pointer",
                color: "#475569",
                fontWeight: 500,
                fontSize: "14px"
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#f8fafc"}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
            >
              <ArrowLeft size={18} />
              Back
            </button>
            <div>
              <div style={{ fontSize: "12px", color: "#94a3b8", fontWeight: "500" }}>{task.id}</div>
              <div style={{ fontSize: "18px", fontWeight: "600", color: "#0f172a" }}>{task.title}</div>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <span className="cc-status-badge" style={{
              backgroundColor: progressBadge.bg,
              color: progressBadge.color,
              padding: "4px 14px",
              borderRadius: "20px",
              fontSize: "12px",
              fontWeight: "600"
            }}>
              {progressBadge.label}
            </span>
            {action && action.action !== "view" && !isCompleted && (
              <button
                onClick={async () => {
                  if (action.action === "start") {
                    await handleStartTask(task);
                    const updatedTask = tasks.find(t => t.id === task.id);
                    if (updatedTask) setSelectedTask(updatedTask);
                  } else if (action.action === "update") {
                    // Already in detail view
                  } else if (action.action === "review") {
                    // Already in detail view
                  } else if (action.action === "approve") {
                    // Already in detail view
                  }
                }}
                style={{
                  backgroundColor: action.variant === "primary" ? "#3B82F6" :
                                action.variant === "warning" ? "#F59E0B" :
                                action.variant === "success" ? "#10B981" :
                                action.variant === "review" ? "#8B5CF6" : "#64748B",
                  color: "white",
                  border: "none",
                  padding: "8px 20px",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontSize: "14px",
                  fontWeight: "600",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px"
                }}
              >
                {action.action === "start" && <Play size={16} />}
                {action.action === "update" && <RotateCw size={16} />}
                {action.action === "review" && <Eye size={16} />}
                {action.action === "approve" && <Check size={16} />}
                {action.label}
              </button>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "1fr 340px",
          gap: "24px",
          padding: "0 24px 24px 24px"
        }}>
          {/* Left Column */}
          <div>
            {/* Task Details Card - Shows Progress, Process, Priority, Time */}
            <div style={{
              backgroundColor: "white",
              borderRadius: "12px",
              border: "1px solid #e2e8f0",
              padding: "24px",
              marginBottom: "24px"
            }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <div>
                  <div style={{ fontSize: "12px", fontWeight: "600", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "4px" }}>
                    <Flag size={14} style={{ display: "inline", marginRight: "4px" }} /> Priority
                  </div>
                  <span className="cc-status-badge" style={{
                    backgroundColor: priorityBadge.bg,
                    color: priorityBadge.color,
                    padding: "2px 10px",
                    borderRadius: "12px",
                    fontSize: "13px",
                    fontWeight: "600"
                  }}>
                    {task.priority || "Normal"}
                  </span>
                </div>
                <div>
                  <div style={{ fontSize: "12px", fontWeight: "600", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "4px" }}>
                    <Calendar size={14} style={{ display: "inline", marginRight: "4px" }} /> Due Date
                  </div>
                  <div style={{ fontSize: "14px", fontWeight: "600", color: isOverdue ? "#EF4444" : "#0f172a" }}>
                    {formatDate(task.dueDate) || "—"}
                    {isOverdue && <span style={{ fontSize: "12px", color: "#EF4444", marginLeft: "8px" }}>⚠️ Overdue</span>}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: "12px", fontWeight: "600", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "4px" }}>
                    <ClockIcon size={14} style={{ display: "inline", marginRight: "4px" }} /> Time Status
                  </div>
                  <div style={{ fontSize: "14px", fontWeight: "600", color: timeStatus.color }}>
                    {timeStatus.title}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: "12px", fontWeight: "600", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "4px" }}>
                    <CheckSquare size={14} style={{ display: "inline", marginRight: "4px" }} /> Progress
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <div style={{ flex: 1, height: "6px", backgroundColor: "#e2e8f0", borderRadius: "3px", overflow: "hidden" }}>
                      <div style={{
                        width: `${updateProgressVal || 0}%`,
                        height: "100%",
                        backgroundColor: getStatusColor(getCurrentStatusDisplay()),
                        borderRadius: "3px",
                        transition: "width 0.3s ease"
                      }} />
                    </div>
                    <span style={{ fontSize: "14px", fontWeight: "600", color: "#0f172a" }}>{updateProgressVal || 0}%</span>
                  </div>
                </div>
              </div>

              {/* Current Progress & Process Status */}
              <div style={{ marginTop: "16px", paddingTop: "16px", borderTop: "1px solid #f1f5f9" }}>
                <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
                  <div style={{ fontSize: "13px", color: "#64748b" }}>
                    <span style={{ fontWeight: "500" }}>Progress:</span>{' '}
                    <span style={{ fontWeight: "600", color: "#0f172a" }}>{currentProgress}</span>
                  </div>
                  <div style={{ fontSize: "13px", color: "#64748b" }}>
                    <span style={{ fontWeight: "500" }}>Process:</span>{' '}
                    <span style={{ fontWeight: "600", color: "#0f172a" }}>{currentProcess}</span>
                  </div>
                </div>
                <div style={{ fontSize: "13px", color: "#64748b", marginTop: "4px" }}>
                  <span style={{ fontWeight: "500" }}>Project:</span> {task.project || "N/A"}
                </div>
                <div style={{ fontSize: "13px", color: "#64748b", marginTop: "4px" }}>
                  <span style={{ fontWeight: "500" }}>Milestone:</span> {task.milestone || "N/A"}
                </div>
              </div>

              {/* Process Status Details */}
              {rawTask?.prcsYesActn && rawTask?.prcsYesActn !== "NONE" && (
                <div style={{ marginTop: "16px", paddingTop: "16px", borderTop: "1px solid #f1f5f9" }}>
                  <div style={{ fontSize: "12px", fontWeight: "600", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "4px" }}>
                    <RefreshCw size={14} style={{ display: "inline", marginRight: "4px" }} /> Process Status
                  </div>
                  <div style={{ fontSize: "14px", fontWeight: "600", color: "#0f172a" }}>
                    {rawTask.prcsYesActn === "PENDING_REVIEWER" && "⏳ Under Review (Reviewer)"}
                    {rawTask.prcsYesActn === "PENDING_APPROVER" && "⏳ Under Review (Approver)"}
                    {rawTask.prcsYesActn === "REWORK" && "🔄 Rework Required"}
                    {rawTask.prcsYesActn === "REASSIGN" && "🔄 Reassigned"}
                  </div>
                </div>
              )}
            </div>

            {/* Checklist Section */}
            <div style={{
              backgroundColor: "white",
              borderRadius: "12px",
              border: "1px solid #e2e8f0",
              padding: "24px",
              marginBottom: "24px"
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                <div style={{ fontSize: "16px", fontWeight: "600", color: "#0f172a" }}>
                  <ListChecks size={18} style={{ display: "inline", marginRight: "8px" }} />
                  Checklist
                </div>
                <div style={{ fontSize: "14px", fontWeight: "600", color: "#64748b" }}>
                  {updateChecklist.filter(c => c.completed).length}/{updateChecklist.length}
                </div>
              </div>
              {updateChecklist.length === 0 ? (
                <div style={{ textAlign: "center", padding: "20px", color: "#64748b" }}>
                  No checklist items defined for this task.
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  {updateChecklist.map(item => (
                    <div 
                      key={item.id} 
                      onClick={() => handleToggleChecklist(item.id)} 
                      style={{ 
                        display: "flex",
                        alignItems: "center",
                        gap: "12px",
                        padding: "10px 12px",
                        backgroundColor: item.completed ? "#f0fdf4" : "#f8fafc",
                        borderRadius: "8px",
                        border: `1px solid ${item.completed ? "#bbf7d0" : "#e2e8f0"}`,
                        cursor: isCompleted || isUnderReview ? "not-allowed" : "pointer",
                        opacity: isCompleted || isUnderReview ? 0.7 : 1
                      }}
                    >
                      <div style={{
                        width: "20px",
                        height: "20px",
                        borderRadius: "4px",
                        backgroundColor: item.completed ? "#22c55e" : "white",
                        border: `2px solid ${item.completed ? "#22c55e" : "#cbd5e1"}`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0
                      }}>
                        {item.completed && <Check size={12} color="white" strokeWidth={3} />}
                      </div>
                      <span style={{
                        fontSize: "14px",
                        color: item.completed ? "#166534" : "#0f172a",
                        textDecoration: item.completed ? "line-through" : "none",
                        flex: 1
                      }}>
                        {item.text}
                      </span>
                      <span className={`myt-chk-status ${item.completed ? 'completed' : 'pending'}`}>
                        {item.completed ? 'Completed' : 'Pending'}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Description */}
            {task.description && (
              <div style={{
                backgroundColor: "white",
                borderRadius: "12px",
                border: "1px solid #e2e8f0",
                padding: "24px",
                marginBottom: "24px"
              }}>
                <div style={{ fontSize: "14px", fontWeight: "600", color: "#0f172a", marginBottom: "8px" }}>
                  <FileText size={18} style={{ display: "inline", marginRight: "8px" }} />
                  Description
                </div>
                <div style={{ fontSize: "14px", color: "#475569", lineHeight: "1.6" }}>
                  {task.description}
                </div>
              </div>
            )}

            {/* Remarks History */}
            {(rawTask?.addlRem || rawTask?.remarks) && (
              <div style={{
                backgroundColor: "white",
                borderRadius: "12px",
                border: "1px solid #e2e8f0",
                padding: "24px",
                marginBottom: "24px"
              }}>
                <div style={{ fontSize: "14px", fontWeight: "600", color: "#0f172a", marginBottom: "8px" }}>
                  <MessageSquare size={18} style={{ display: "inline", marginRight: "8px" }} />
                  Remarks History
                </div>
                <div style={{
                  padding: "12px",
                  borderRadius: "8px",
                  backgroundColor: "#fef3c7",
                  border: "1px solid #fde68a",
                  fontSize: "13px",
                  color: "#92400e",
                  whiteSpace: "pre-wrap"
                }}>
                  {rawTask.addlRem || rawTask.remarks}
                </div>
              </div>
            )}

            {/* Add Remarks & Evidence */}
            {!isCompleted && isDoer && !isUnderReview && (
              <div style={{
                backgroundColor: "white",
                borderRadius: "12px",
                border: "1px solid #e2e8f0",
                padding: "24px"
              }}>
                <div style={{ fontSize: "14px", fontWeight: "600", color: "#0f172a", marginBottom: "12px" }}>
                  <MessageSquare size={18} style={{ display: "inline", marginRight: "8px" }} />
                  Add Remarks <span style={{ fontWeight: "400", color: "#64748b" }}>(Optional)</span>
                </div>
                <textarea
                  className="myt-remarks-input"
                  placeholder="Enter remarks..."
                  value={updateRemarks}
                  onChange={(e) => setUpdateRemarks(e.target.value)}
                  style={{
                    width: "100%",
                    minHeight: "80px",
                    padding: "10px 12px",
                    border: "1px solid #cbd5e1",
                    borderRadius: "6px",
                    fontSize: "13.5px",
                    fontFamily: "inherit",
                    resize: "vertical",
                    outline: "none",
                    background: "#fff",
                    color: "#0f172a",
                    marginBottom: "12px"
                  }}
                  disabled={isCompleted}
                />
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <label className="myt-file-upload-btn" style={{ 
                    padding: "8px 16px",
                    backgroundColor: "#f8fafc",
                    border: "1px solid #cbd5e1",
                    borderRadius: "6px",
                    fontSize: "13px",
                    fontWeight: "500",
                    color: "#334155",
                    cursor: isCompleted ? "not-allowed" : "pointer",
                    opacity: isCompleted ? 0.6 : 1
                  }}>
                    Choose Files
                    <input type="file" style={{ display: "none" }} disabled={isCompleted} />
                  </label>
                  <span style={{ fontSize: "13px", color: "#64748b" }}>No file chosen</span>
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Sidebar */}
          <div>
            {/* Team Members */}
            <div style={{
              backgroundColor: "white",
              borderRadius: "12px",
              border: "1px solid #e2e8f0",
              padding: "20px",
              marginBottom: "20px"
            }}>
              <div style={{ fontSize: "15px", fontWeight: "600", color: "#0f172a", marginBottom: "14px" }}>
                <Users size={18} style={{ display: "inline", marginRight: "8px" }} />
                Team
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {renderTeamMember(rawTask?.empId || rawTask?.assignedTo, "Executor", "EX")}
                {renderTeamMember(rawTask?.reviewerId || rawTask?.reviewer, "Reviewer", "RV")}
                {renderTeamMember(rawTask?.approverId || rawTask?.approver, "Approver", "AP")}
              </div>
            </div>

            {/* Status Details - Dynamic */}
            <div style={{
              backgroundColor: "white",
              borderRadius: "12px",
              border: "1px solid #e2e8f0",
              padding: "20px",
              marginBottom: "20px"
            }}>
              <div style={{ fontSize: "15px", fontWeight: "600", color: "#0f172a", marginBottom: "12px" }}>
                <AlertCircle size={18} style={{ display: "inline", marginRight: "8px" }} />
                Status Details
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px solid #f1f5f9" }}>
                  <span style={{ fontSize: "13px", color: "#64748b" }}>Progress Status</span>
                  <span className="cc-status-badge" style={{
                    backgroundColor: getStatusBgColor(getCurrentStatusDisplay()),
                    color: getStatusColor(getCurrentStatusDisplay()),
                    padding: "2px 10px",
                    borderRadius: "12px",
                    fontSize: "12px",
                    fontWeight: "600"
                  }}>
                    {getCurrentStatusDisplay()}
                  </span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px solid #f1f5f9" }}>
                  <span style={{ fontSize: "13px", color: "#64748b" }}>Process</span>
                  <span style={{ fontSize: "13px", fontWeight: "600", color: "#0f172a" }}>
                    {currentProcess === "NONE" ? "None" : currentProcess}
                  </span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px solid #f1f5f9" }}>
                  <span style={{ fontSize: "13px", color: "#64748b" }}>Priority</span>
                  <span style={{ fontSize: "13px", fontWeight: "600", color: "#0f172a" }}>
                    {task.priority || "Normal"}
                  </span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0" }}>
                  <span style={{ fontSize: "13px", color: "#64748b" }}>Assigned To</span>
                  <span style={{ fontSize: "13px", fontWeight: "500", color: "#0f172a" }}>
                    {getEmployeeName(rawTask?.empId || rawTask?.assignedTo, employeesList) || "Unassigned"}
                  </span>
                </div>
              </div>
            </div>

            {/* Action Buttons - Dynamic */}
            <div style={{
              backgroundColor: "white",
              borderRadius: "12px",
              border: "1px solid #e2e8f0",
              padding: "20px"
            }}>
              <div style={{ fontSize: "15px", fontWeight: "600", color: "#0f172a", marginBottom: "14px" }}>
                <Play size={18} style={{ display: "inline", marginRight: "8px" }} />
                Actions
              </div>
              {renderActionButtons()}
            </div>

            {/* Deny Form */}
            {showDenyForm && (
              <div style={{
                backgroundColor: "white",
                borderRadius: "12px",
                border: "1px solid #e2e8f0",
                padding: "20px",
                marginTop: "20px"
              }}>
                <h4 style={{ fontSize: "16px", fontWeight: "600", marginBottom: "16px", color: "#0f172a" }}>
                  {denyData.type === "REWORK" ? "Reject Task" : "Reassign Task"}
                </h4>
                <div className="myt-form-group" style={{ marginBottom: "12px" }}>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#475569", marginBottom: "4px" }}>Select Action</label>
                  <select className="myt-input" style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid #cbd5e1" }} 
                    value={denyData.type} onChange={e => setDenyData({...denyData, type: e.target.value})}>
                    <option value="">Select Action</option>
                    <option value="REWORK">Reject (Send for Rework)</option>
                    <option value="REASSIGN">Reassign</option>
                  </select>
                </div>
                <div className="myt-form-group" style={{ marginBottom: "12px" }}>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#475569", marginBottom: "4px" }}>Reason</label>
                  <textarea className="myt-input" style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid #cbd5e1", minHeight: "60px" }}
                    placeholder="Enter reason..." value={denyData.reason} onChange={e => setDenyData({...denyData, reason: e.target.value})} />
                </div>
                {denyData.type === "REASSIGN" && (
                  <div className="myt-form-group" style={{ marginBottom: "12px" }}>
                    <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#475569", marginBottom: "4px" }}>New Executor ID</label>
                    <input type="text" className="myt-input" style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid #cbd5e1" }} 
                      placeholder="Enter new executor ID..." value={denyData.milestone} onChange={e => setDenyData({...denyData, milestone: e.target.value})} />
                  </div>
                )}
                <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "16px", paddingTop: "16px", borderTop: "1px solid #e2e8f0" }}>
                  <button className="cc-btn secondary" onClick={() => setShowDenyForm(false)} style={{ borderRadius: "6px" }}>Cancel</button>
                  <button className="cc-btn primary" onClick={handleSubmitDeny} disabled={!denyData.type || !denyData.reason} 
                    style={{ borderRadius: "6px", backgroundColor: "#ef4444", border: "none", color: "white" }}>
                    {denyData.type === "REWORK" ? "Submit Rework" : "Reassign"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // ============================================
  // RENDER TEAM MEMBERS - For List View
  // ============================================
  const renderTeamMembers = (task) => {
    const rawTask = task.rawTask || task;
    
    const executorId = rawTask.empId || rawTask.assignedTo || rawTask.executorId;
    const reviewerId = rawTask.reviewerId || rawTask.reviewer;
    const approverId = rawTask.approverId || rawTask.approver;
    
    const teamMembers = [
      { empId: executorId, role: "Executor", label: "EX" },
      { empId: reviewerId, role: "Reviewer", label: "RV" },
      { empId: approverId, role: "Approver", label: "AP" }
    ].filter(m => m.empId);

    if (teamMembers.length === 0) {
      return <span style={{ color: "#94a3b8", fontSize: "12px" }}>—</span>;
    }

    return (
      <div style={{ display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap" }}>
        {teamMembers.map((member, idx) => {
          const empName = getEmployeeName(member.empId, employeesList);
          const initials = getEmployeeInitials(member.empId, employeesList);
          const photo = getEmployeePhoto(member.empId, employeesList);
          
          const roleColors = {
            "Executor": { bg: "#3B82F6", light: "#DBEAFE" },
            "Reviewer": { bg: "#8B5CF6", light: "#EDE9FE" },
            "Approver": { bg: "#F59E0B", light: "#FEF3C7" }
          };
          const color = roleColors[member.role] || { bg: "#64748B", light: "#F1F5F9" };

          return (
            <div 
              key={idx} 
              style={{ 
                display: "flex",
                alignItems: "center",
                gap: "4px",
                padding: "2px 6px 2px 2px",
                borderRadius: "16px",
                backgroundColor: color.light,
                border: `1px solid ${color.bg}33`,
                cursor: "default",
                transition: "all 0.2s"
              }}
              title={`${empName || 'Unknown'} (${member.role})`}
            >
              <div style={{
                width: "24px",
                height: "24px",
                borderRadius: "50%",
                backgroundColor: color.bg,
                color: "white",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "8px",
                fontWeight: "700",
                overflow: "hidden",
                flexShrink: 0
              }}>
                {photo ? (
                  <img 
                    src={photo.startsWith('data:') || photo.startsWith('http') ? photo : `data:image/jpeg;base64,${photo}`} 
                    alt={empName || 'User'} 
                    style={{ width: "100%", height: "100%", objectFit: "cover" }} 
                    onError={(e) => {
                      e.target.style.display = "none";
                      e.target.parentElement.textContent = initials || "UN";
                    }}
                  />
                ) : initials || "UN"}
              </div>
              
              <span style={{ 
                fontSize: "7px", 
                fontWeight: "700", 
                color: color.bg,
                backgroundColor: `${color.bg}22`,
                padding: "1px 5px",
                borderRadius: "8px",
                letterSpacing: "0.3px"
              }}>
                {member.label}
              </span>
            </div>
          );
        })}
      </div>
    );
  };

  // ============================================
  // RENDER ACTION BUTTON - List View
  // ============================================
  const renderActionButton = (task) => {
    if (!task) return null;
    
    const rawTask = task.rawTask || task;
    const action = getActionButton(rawTask, currentUserEmpId);
    const isDisabled = loadingAction === (task.id || task.taskId);
    
    if (!action) return null;
    
    const getButtonStyle = (variant) => {
      switch(variant) {
        case "primary": return { bg: "#3B82F6", hover: "#2563EB", color: "white" };
        case "warning": return { bg: "#F59E0B", hover: "#D97706", color: "white" };
        case "success": return { bg: "#10B981", hover: "#059669", color: "white" };
        case "review": return { bg: "#8B5CF6", hover: "#7C3AED", color: "white" };
        default: return { bg: "#F1F5F9", hover: "#E2E8F0", color: "#475569" };
      }
    };
    
    const style = getButtonStyle(action.variant);
    
    const handleClick = async (e) => {
      e.stopPropagation();
      if (isDisabled) return;
      
      // ALL actions open the same detail screen
      if (action.action === "view") {
        await openTaskDetail(task);
        return;
      }
      
      // For actions other than 'view', execute then open detail
      switch(action.action) {
        case "start": 
          await handleStartTask(task);
          await openTaskDetail(task);
          break;
        case "update": 
          await openTaskDetail(task);
          break;
        case "review": 
          await openTaskDetail(task);
          break;
        case "approve": 
          await openTaskDetail(task);
          break;
        default: 
          break;
      }
    };
    
    return (
      <button
        style={{
          backgroundColor: style.bg,
          color: style.color,
          border: action.variant === "secondary" ? "1px solid #E2E8F0" : "none",
          padding: "6px 16px",
          borderRadius: "6px",
          cursor: isDisabled ? "not-allowed" : "pointer",
          fontSize: "12px",
          fontWeight: "600",
          opacity: isDisabled ? 0.6 : 1,
          transition: "all 0.2s",
          minWidth: "60px",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "6px"
        }}
        onClick={handleClick}
        disabled={isDisabled}
        onMouseEnter={(e) => { if (!isDisabled) e.currentTarget.style.backgroundColor = style.hover; }}
        onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = style.bg; }}
      >
        {isDisabled ? (
          <Loader2 size={12} className="spinning" />
        ) : (
          <>
            {action.action === "start" && <Play size={12} />}
            {action.action === "update" && <RotateCw size={12} />}
            {action.action === "view" && <Eye size={12} />}
            {action.action === "review" && <CheckCircle2 size={12} />}
            {action.action === "approve" && <Check size={12} />}
            {action.label}
          </>
        )}
      </button>
    );
  };

  // ============================================
  // MAIN RENDER
  // ============================================

  const showTaskFilters = selectedStatus === "To Do" || selectedStatus === "All Statuses" || selectedStatus === "All Tasks";

  return (
    <div className={`cc-shell-container ${isSidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
      <Sidebar onLogout={onLogout} />
      <div className="cc-shell">
        <Header 
          title="My Tasks" 
          subtitle={showDetailView && selectedTask ? selectedTask.title : "View and manage all tasks assigned to you."} 
          onLogout={onLogout} 
          userRole={userRole} 
        />

        <main className="cc-main" style={{ overflow: "visible" }}>
          {apiError && (
            <div style={{ backgroundColor: "#fee2e2", color: "#b91c1c", padding: "16px", borderRadius: "8px", marginBottom: "20px", border: "1px solid #fca5a5", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div><strong>⚠️ Error:</strong> {apiError}</div>
              <button onClick={() => fetchTasks()} style={{ padding: "6px 16px", backgroundColor: "#b91c1c", color: "white", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "500" }}>Retry</button>
            </div>
          )}

          {showDetailView && selectedTask ? (
            <TaskDetailScreen 
              task={selectedTask} 
              onBack={() => {
                setShowDetailView(false);
                setSelectedTask(null);
                setShowDenyForm(false);
                setUpdateRemarks("");
              }} 
            />
          ) : (
            /* Tasks List View */
            <>
              {/* Metrics Cards */}
              <div className="myt-metrics-grid" style={{ marginBottom: "24px", display: "flex", gap: "16px", flexWrap: "nowrap", overflowX: "auto" }}>
                <div className={`myt-metric-card sketch-layout todo ${selectedStatus === "To Do" ? "active" : ""}`} onClick={() => handleStatusFilterChange("To Do")} style={{ flex: "1", minWidth: "120px" }}>
                  <div className="myt-metric-left"><div className="myt-metric-icon-box yellow-circle"><ClipboardList size={20} /></div><div className="myt-metric-text-group"><div className="myt-metric-title">To-Do</div><div className="myt-metric-subtitle">Active Tasks</div></div></div>
                  <div className="myt-metric-right"><div className="myt-metric-value">{countTodo}</div></div>
                </div>
                
                <div className={`myt-metric-card sketch-layout completed ${selectedStatus === "Completed" ? "active" : ""}`} onClick={() => handleStatusFilterChange("Completed")} style={{ flex: "1", minWidth: "120px" }}>
                  <div className="myt-metric-left"><div className="myt-metric-icon-box green-circle"><CheckCircle2 size={20} /></div><div className="myt-metric-text-group"><div className="myt-metric-title">Closed</div><div className="myt-metric-subtitle">Done</div></div></div>
                  <div className="myt-metric-right"><div className="myt-metric-value">{countCompleted}</div></div>
                </div>
                
                <div className={`myt-metric-card sketch-layout all ${selectedStatus === "All Tasks" ? "active" : ""}`} onClick={() => handleStatusFilterChange("All Tasks")} style={{ flex: "1", minWidth: "120px" }}>
                  <div className="myt-metric-left"><div className="myt-metric-icon-box orange-circle"><Layers size={20} /></div><div className="myt-metric-text-group"><div className="myt-metric-title">All Tasks</div><div className="myt-metric-subtitle">Total Work</div></div></div>
                  <div className="myt-metric-right"><div className="myt-metric-value">{countAllTasks}</div></div>
                </div>
              </div>

              {/* Search and Filters */}
              {showTaskFilters && (
                <div className="myt-tabs-container" style={{ marginBottom: "20px", borderBottom: "none", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
                  <div className="myt-tabs-left" style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                    <button 
                      className={`myt-filter-btn ${taskFilter === "All" ? "active" : ""}`}
                      onClick={() => { setTaskFilter("All"); setCurrentPage(1); }}
                      style={{
                        padding: "6px 14px",
                        borderRadius: "20px",
                        border: "1px solid #e2e8f0",
                        backgroundColor: taskFilter === "All" ? "#3B82F6" : "white",
                        color: taskFilter === "All" ? "white" : "#475569",
                        cursor: "pointer",
                        fontSize: "12px",
                        fontWeight: "500",
                        transition: "all 0.2s"
                      }}
                    >
                      All
                    </button>
                    <button 
                      className={`myt-filter-btn ${taskFilter === "OPEN" ? "active" : ""}`}
                      onClick={() => { setTaskFilter("OPEN"); setCurrentPage(1); }}
                      style={{
                        padding: "6px 14px",
                        borderRadius: "20px",
                        border: "1px solid #e2e8f0",
                        backgroundColor: taskFilter === "OPEN" ? "#3B82F6" : "white",
                        color: taskFilter === "OPEN" ? "white" : "#475569",
                        cursor: "pointer",
                        fontSize: "12px",
                        fontWeight: "500",
                        transition: "all 0.2s"
                      }}
                    >
                      Open
                    </button>
                    <button 
                      className={`myt-filter-btn ${taskFilter === "IN_PROGRESS" ? "active" : ""}`}
                      onClick={() => { setTaskFilter("IN_PROGRESS"); setCurrentPage(1); }}
                      style={{
                        padding: "6px 14px",
                        borderRadius: "20px",
                        border: "1px solid #e2e8f0",
                        backgroundColor: taskFilter === "IN_PROGRESS" ? "#3B82F6" : "white",
                        color: taskFilter === "IN_PROGRESS" ? "white" : "#475569",
                        cursor: "pointer",
                        fontSize: "12px",
                        fontWeight: "500",
                        transition: "all 0.2s"
                      }}
                    >
                      Work In Progress
                    </button>
                    <button 
                      className={`myt-filter-btn ${taskFilter === "UNDER_REVIEW" ? "active" : ""}`}
                      onClick={() => { setTaskFilter("UNDER_REVIEW"); setCurrentPage(1); }}
                      style={{
                        padding: "6px 14px",
                        borderRadius: "20px",
                        border: "1px solid #e2e8f0",
                        backgroundColor: taskFilter === "UNDER_REVIEW" ? "#3B82F6" : "white",
                        color: taskFilter === "UNDER_REVIEW" ? "white" : "#475569",
                        cursor: "pointer",
                        fontSize: "12px",
                        fontWeight: "500",
                        transition: "all 0.2s"
                      }}
                    >
                      Under Review
                    </button>
                    <button 
                      className={`myt-filter-btn ${taskFilter === "REASSIGNED" ? "active" : ""}`}
                      onClick={() => { setTaskFilter("REASSIGNED"); setCurrentPage(1); }}
                      style={{
                        padding: "6px 14px",
                        borderRadius: "20px",
                        border: "1px solid #e2e8f0",
                        backgroundColor: taskFilter === "REASSIGNED" ? "#3B82F6" : "white",
                        color: taskFilter === "REASSIGNED" ? "white" : "#475569",
                        cursor: "pointer",
                        fontSize: "12px",
                        fontWeight: "500",
                        transition: "all 0.2s"
                      }}
                    >
                      Re-Assigned
                    </button>
                    <button 
                      className={`myt-filter-btn ${taskFilter === "OVERDUE" ? "active" : ""}`}
                      onClick={() => { setTaskFilter("OVERDUE"); setCurrentPage(1); }}
                      style={{
                        padding: "6px 14px",
                        borderRadius: "20px",
                        border: "1px solid #e2e8f0",
                        backgroundColor: taskFilter === "OVERDUE" ? "#EF4444" : "white",
                        color: taskFilter === "OVERDUE" ? "white" : "#475569",
                        cursor: "pointer",
                        fontSize: "12px",
                        fontWeight: "500",
                        transition: "all 0.2s"
                      }}
                    >
                      Overdue
                    </button>
                  </div>
                  <div className="myt-tabs-right" style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                    <div className="myt-search-box" style={{ position: "relative" }}>
                      <Search size={15} className="myt-search-icon" style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
                      <input 
                        type="text" 
                        placeholder="Search task..." 
                        value={searchInput} 
                        onChange={(e) => { setSearchInput(e.target.value); setSearchQuery(e.target.value); }} 
                        style={{ padding: "8px 12px 8px 32px", border: "1px solid #e2e8f0", borderRadius: "6px", outline: "none", fontSize: "13px", width: "220px" }}
                        onKeyDown={handleSearchKeyDown}
                      />
                    </div>
                    <button onClick={handleResetFilters} style={{ padding: "6px 12px", border: "1px solid #e2e8f0", borderRadius: "6px", backgroundColor: "white", cursor: "pointer", fontSize: "12px", color: "#64748b" }}>
                      Clear
                    </button>
                  </div>
                </div>
              )}

              {/* Table */}
              <div className="cc-table-panel" style={{ border: "none", boxShadow: "none", padding: 0 }}>
                <div className="cc-table-container">
                  <table className="cc-list-table myt-table">
                    <thead>
                      <tr>
                        <th>
                          <div style={{ display: "flex", flexDirection: "column" }}>
                            <span style={{ fontSize: "12px", fontWeight: "700", color: "#0f172a", textTransform: "uppercase", marginBottom: "2px" }}>TASK</span>
                            <span style={{ fontSize: "11px", fontWeight: "500", color: "#64748b" }}>Task ID / Name<br/>Milestone</span>
                          </div>
                        </th>
                        <th>
                          <div style={{ display: "flex", flexDirection: "column" }}>
                            <span style={{ fontSize: "12px", fontWeight: "700", color: "#0f172a", textTransform: "uppercase", marginBottom: "2px" }}>TEAM</span>
                            <span style={{ fontSize: "11px", fontWeight: "500", color: "#64748b" }}>Members</span>
                          </div>
                        </th>
                        <th>
                          <span style={{ fontSize: "12px", fontWeight: "700", color: "#0f172a", textTransform: "uppercase" }}>PRIORITY</span>
                        </th>
                        <th style={{ textAlign: "center" }}>
                          <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                            <span style={{ fontSize: "12px", fontWeight: "700", color: "#0f172a", textTransform: "uppercase", marginBottom: "2px" }}>DUE DATE</span>
                            <span style={{ fontSize: "11px", fontWeight: "500", color: "#64748b" }}>(Date Only)</span>
                          </div>
                        </th>
                        <th style={{ textAlign: "center" }}>
                          <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                            <span style={{ fontSize: "12px", fontWeight: "700", color: "#0f172a", textTransform: "uppercase", marginBottom: "2px" }}>PROGRESS</span>
                            <span style={{ fontSize: "11px", fontWeight: "500", color: "#64748b" }}>(Status &bull; Process &bull; Time)</span>
                          </div>
                        </th>
                        <th style={{ textAlign: "center" }}>
                          <span style={{ fontSize: "12px", fontWeight: "700", color: "#0f172a", textTransform: "uppercase" }}>ACTION</span>
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {isLoading ? (
                        <tr><td colSpan="6" style={{ textAlign: "center", padding: "40px", color: "#64748b" }}><Loader2 size={24} className="spinning" /> Loading tasks...</td></tr>
                      ) : paginatedTasks.length > 0 ? (
                        paginatedTasks.map((task) => {
                          const progressBadge = getProgressBadge(task.status);
                          const processIcon = getProcessIcon(task.rawTask?.prcsYesActn);
                          const timeStatus = calculateTimeStatus(task.rawTask || task);
                          const priorityBadge = getPriorityBadge(task.priority);
                          const isCompleted = task.rawStatus === "COMPLETED";
                          const isOverdue = isTaskOverdue(task);
                          
                          return (
                            <tr key={task.id || task.taskId} onClick={() => { openTaskDetail(task); }} style={{ cursor: "pointer", backgroundColor: isOverdue ? "#FEF2F2" : "transparent" }}>
                              <td style={{ maxWidth: "250px" }}>
                                <div style={{ fontWeight: "600", color: "#0f172a", marginBottom: "4px" }}>{task.id}</div>
                                <div style={{ fontWeight: "500", color: "#64748b", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={task.title}>{task.title}</div>
                                <div style={{ fontSize: "12px", color: "#94a3b8" }}>{task.milestone}</div>
                              </td>
                              <td>
                                {renderTeamMembers(task)}
                              </td>
                              <td>
                                {!isCompleted && (
                                  <span className="cc-status-badge" style={{ backgroundColor: priorityBadge.bg, color: priorityBadge.color, padding: "4px 10px", borderRadius: "12px", fontSize: "12px", fontWeight: "600" }}>
                                    {task.priority === "ATMOST CRITICAL" ? "Atmost Critical" : task.priority}
                                  </span>
                                )}
                              </td>
                              <td style={{ fontWeight: "600", color: isOverdue ? "#EF4444" : "#0f172a", textAlign: "center" }}>
                                {formatDate(task.dueDate) || "—"}
                                {isOverdue && <span style={{ display: "block", fontSize: "10px", color: "#EF4444" }}>⚠️ Overdue</span>}
                              </td>
                              <td>
                                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
                                  <span className="cc-status-badge" style={{ backgroundColor: progressBadge.bg, color: progressBadge.color, minWidth: "90px", textAlign: "center", display: "inline-block", textTransform: "uppercase", fontWeight: "700", padding: "4px 12px", borderRadius: "12px", fontSize: "11px" }}>{progressBadge.label}</span>
                                  {processIcon && <div className="myt-custom-tooltip-wrap" title={processIcon.title} style={{ color: processIcon.color, display: "flex", alignItems: "center", cursor: "help" }}><processIcon.icon size={18} strokeWidth={2.5} /></div>}
                                  <div className="myt-custom-tooltip-wrap" title={timeStatus.title} style={{ color: timeStatus.color, display: "flex", alignItems: "center", cursor: "help" }}><timeStatus.icon size={18} strokeWidth={2.5} /></div>
                                </div>
                              </td>
                              <td onClick={(e) => e.stopPropagation()} style={{ textAlign: "center" }}>
                                {renderActionButton(task)}
                              </td>
                            </tr>
                          );
                        })
                      ) : (
                        <tr><td colSpan="6" style={{ textAlign: "center", padding: "40px", color: "#64748b" }}>No tasks found.</td></tr>
                      )}
                    </tbody>
                  </table>

                  {sortedTasks.length > 0 && (
                    <div className="myt-pagination-container">
                      <div className="myt-pagination-info">Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, sortedTasks.length)} of {sortedTasks.length} tasks</div>
                      <div className="myt-pagination-controls">
                        <button className="myt-page-btn" disabled={currentPage === 1} onClick={() => handlePageChange(currentPage - 1)}><ChevronLeft size={16} /></button>
                        {Array.from({ length: Math.min(totalPages, 5) }).map((_, i) => {
                          const pageNum = i + 1;
                          return <button key={i} className={`myt-page-btn ${currentPage === pageNum ? 'active' : ''}`} onClick={() => handlePageChange(pageNum)}>{pageNum}</button>;
                        })}
                        {totalPages > 5 && <span style={{ padding: "0 4px", color: "#94a3b8" }}>...</span>}
                        {totalPages > 5 && <button className="myt-page-btn" onClick={() => handlePageChange(totalPages)}>{totalPages}</button>}
                        <button className="myt-page-btn" disabled={currentPage === totalPages} onClick={() => handlePageChange(currentPage + 1)}><ChevronRight size={16} /></button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </main>
      </div>

      <AlertModal isOpen={alertOpen} type={alertConfig.type} title={alertConfig.title} message={alertConfig.message} onClose={() => setAlertOpen(false)} />
    </div>
  );
};

export default MyTasks;