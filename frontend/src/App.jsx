import React, { lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import AutoLogoutHandler from "./strore/autoLogoutHandler";
import ProtectedRoute from "./routes/ProtectedRoute";

const Login = lazy(() => import("./pages/auth/Login")); const Register = lazy(() => import("./pages/auth/Register"));
const DashboardLayout = lazy(() => import("./components/layout/dashLayout")); const Dashboard = lazy(() => import("./pages/dashboard/Dashboard"));
const Employee = lazy(() => import("./pages/employees/Employees")); const EmployeeForm = lazy(() => import("./pages/employee/createEmp")); const EmployeeDetails = lazy(() => import("./pages/employee/employeeDetails"));
const Department = lazy(() => import("./pages/departments/Departments")); const DepartmentForm = lazy(() => import("./pages/department/addDepartment")); const Payroll = lazy(() => import("./pages/payroll/payroll")); const Project = lazy(() => import("./pages/projects/Projects"));
const Settings = lazy(() => import("./pages/settings/Settings")); const ProjectForm = lazy(() => import("./pages/project/addProject")); const ProfileSettings = lazy(() => import("./pages/auth/ProfileSettings")); const Attendance = lazy(() => import("./pages/attendance/Attendance"));
const LeaveManagement = lazy(() => import("./pages/leave/leaveManage")); const AssetManagement = lazy(() => import("./pages/assets/AssetManagement")); const ExpenseManagement = lazy(() => import("./pages/expense/ExpenseManagement"));
const Onboarding = lazy(() => import("./pages/onboarding/Onboarding")); const Training = lazy(() => import("./pages/training/Training")); const Performance = lazy(() => import("./pages/performance/Performance")); const Goals = lazy(() => import("./pages/goals/Goals"));
const Users = lazy(() => import("./pages/admin/Users")); const Roles = lazy(() => import("./pages/admin/Roles")); const Organization = lazy(() => import("./pages/admin/Organization")); const RBAC = lazy(() => import("./pages/admin/RBAC"));
const Announcements = lazy(() => import("./pages/admin/Announcements")); const Holidays = lazy(() => import("./pages/admin/Holidays"));
const AdminLayout = lazy(() => import("./components/admin/AdminLayout")); const AdminOverview = lazy(() => import("./pages/admin/AdminOverview")); const Branches = lazy(() => import("./pages/enterprise/Branches")); const Shifts = lazy(() => import("./pages/enterprise/Shifts")); const LeavePolicies = lazy(() => import("./pages/enterprise/LeavePolicies"));
const Reports = lazy(() => import("./pages/reports/Reports")); const AuditLogs = lazy(() => import("./pages/audit/AuditLogs"));
const CommunicationHub = lazy(() => import("./pages/communication/CommunicationHub"));

const App = () => {
  return (
    <>
      <AutoLogoutHandler />
      <Suspense fallback={<div aria-live="polite" style={{ padding: 24 }}>Loading module…</div>}><Routes>
        {/* Public */}
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected - All authenticated users */}
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<DashboardLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="attendance" element={<Attendance />} />
            <Route path="payroll" element={<Payroll />} />
            <Route path="projects" element={<Project />} />
            <Route path="settings" element={<Settings />} />
            <Route path="profile" element={<ProfileSettings />} />
            <Route path="leave" element={<LeaveManagement />} />
            <Route path="expenses" element={<ExpenseManagement />} />
            <Route path="goals" element={<Goals />} />
            <Route path="communication" element={<CommunicationHub />} />

            {/* Module access is controlled by the RBAC permission matrix. */}
            <Route>
              <Route path="employees" element={<Employee />} />
            <Route path="add-employee" element={<EmployeeForm />} />
            <Route path="edit-employee/:id" element={<EmployeeForm />} />
              <Route path="employee/:id" element={<EmployeeDetails />} />
              <Route path="departments" element={<Department />} />
            <Route path="add-department" element={<DepartmentForm />} />
            <Route path="add-project" element={<ProjectForm />} />
              <Route path="assets" element={<AssetManagement />} />
              <Route path="onboarding" element={<Onboarding />} />
              <Route path="training" element={<Training />} />
              <Route path="performance" element={<Performance />} />
              <Route path="enterprise/branches" element={<Branches />} />
              <Route path="enterprise/shifts" element={<Shifts />} />
              <Route path="enterprise/leave-policies" element={<LeavePolicies />} />
              <Route path="reports" element={<Reports />} />
              <Route path="audit-logs" element={<AuditLogs />} />
              <Route path="admin" element={<AdminLayout />}>
              <Route index element={<AdminOverview />} />
                <Route path="overview" element={<AdminOverview />} />
                <Route path="users" element={<Users />} />
                <Route path="roles" element={<Roles />} />
                <Route path="rbac" element={<RBAC />} />
                <Route path="departments" element={<Department />} />
                <Route path="locations" element={<Branches />} />
                <Route path="organization" element={<Organization />} />
                <Route path="announcements" element={<Announcements />} />
                <Route path="holidays" element={<Holidays />} />
                <Route path="settings" element={<Settings />} />
              </Route>
            </Route>
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" />} />
      </Routes></Suspense>
    </>
  );
};

export default App;
