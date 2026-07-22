import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import DashboardLayout from "./components/layout/dashLayout";
import Dashboard from "./pages/dashboard/Dashboard";
import AddEmployee from "./pages/employee/createEmp";
import Department from "./pages/department/department";
import Payroll from "./pages/payroll/payroll";
import AddDepartment from "./pages/department/addDepartment";
import AddProject from "./pages/project/addProject";
import Project from "./pages/projects/Projects";
import Settings from "./pages/settings/Settings";
import Attendance from "./pages/attendence/attendence";
import Employee from "./pages/employee/employee";
import EmployeeDetails from "./pages/employee/employeeDetails";
import LeaveManagement from "./pages/leave/leaveManage";
import AssetManagement from "./pages/assets/AssetManagement";
import ExpenseManagement from "./pages/expense/ExpenseManagement";
import Onboarding from "./pages/onboarding/Onboarding";
import Training from "./pages/training/Training";
import Performance from "./pages/performance/Performance";
import Goals from "./pages/goals/Goals";
import Users from "./pages/admin/Users";
import Roles from "./pages/admin/Roles";
import Organization from "./pages/admin/Organization";
import Branches from "./pages/enterprise/Branches";
import Shifts from "./pages/enterprise/Shifts";
import LeavePolicies from "./pages/enterprise/LeavePolicies";
import Reports from "./pages/reports/Reports";
import AuditLogs from "./pages/audit/AuditLogs";
import AutoLogoutHandler from "./strore/autoLogoutHandler";
import ProtectedRoute from "./routes/ProtectedRoute";

const App = () => {
  return (
    <>
      <AutoLogoutHandler />
      <Routes>
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
            <Route path="leave" element={<LeaveManagement />} />
            <Route path="expenses" element={<ExpenseManagement />} />
            <Route path="goals" element={<Goals />} />

            {/* HR + Admin only */}
            <Route
              element={
                <ProtectedRoute allowedRoles={["superadmin", "admin", "hr", "manager"]} />
              }
            >
              <Route path="employees" element={<Employee />} />
              <Route path="add-employee" element={<AddEmployee />} />
              <Route path="edit-employee/:id" element={<AddEmployee />} />
              <Route path="employee/:id" element={<EmployeeDetails />} />
              <Route path="departments" element={<Department />} />
              <Route path="add-department" element={<AddDepartment />} />
              <Route path="add-project" element={<AddProject />} />
              <Route path="assets" element={<AssetManagement />} />
              <Route path="onboarding" element={<Onboarding />} />
              <Route path="training" element={<Training />} />
              <Route path="performance" element={<Performance />} />
              <Route path="enterprise/branches" element={<Branches />} />
              <Route path="enterprise/shifts" element={<Shifts />} />
              <Route path="enterprise/leave-policies" element={<LeavePolicies />} />
              <Route path="reports" element={<Reports />} />
              <Route path="audit-logs" element={<AuditLogs />} />
              <Route path="admin/users" element={<Users />} />
              <Route path="admin/roles" element={<Roles />} />
              <Route path="admin/organization" element={<Organization />} />
            </Route>
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </>
  );
};

export default App;
