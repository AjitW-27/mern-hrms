import React, { useCallback, useEffect, useState } from "react";
import { Box, Stack, Typography, useMediaQuery } from "@mui/material";
import { PeopleOutline, WorkOutline, TaskAlt, PaymentsOutlined, PersonAddAlt, ScheduleOutlined, CalendarMonthOutlined, DownloadOutlined } from "@mui/icons-material";
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { useNavigate } from "react-router-dom";
import { Avatar, Badge, Button, Card, CardHeader, DatePicker, EmptyState, ErrorState, Skeleton, StatCard, Tabs } from "../../components/common/UI";
import DataTable from "../../components/common/DataTable";
import useAuthStore from "../../strore/authStore";
import execReq from "../../lib/execReq";
import { fetchCollection } from "../../lib/collections";
import { downloadBlob } from "../../lib/exportUtils";
import { colors } from "../../theme/designTokens";
import "./dashboard.css";

const localDate = (value = new Date()) => new Date(value).toLocaleDateString("en-CA");
const punchTime = value => !value || value === "-" ? "Not recorded" : Number.isNaN(Date.parse(value)) ? value : new Date(value).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
const dateLabel = value => value ? new Date(value).toLocaleDateString("en-GB") : "\u2014";
const nameOf = value => typeof value === "object" ? value?.fullName || value?.name || "Unassigned" : value || "Unassigned";
const timeMinutes = value => { if (!value || value === "-") return null; const match = String(value).match(/^(\d{1,2}):(\d{2})(?:\s*(AM|PM))?$/i); if (match) return (Number(match[1]) % (match[3] ? 12 : 24) + (/PM/i.test(match[3] || "") ? 12 : 0)) * 60 + Number(match[2]); const date = new Date(value); return Number.isNaN(date.getTime()) ? null : date.getHours() * 60 + date.getMinutes(); };
const minutesLate = row => { if (Number.isFinite(row.minutesLate)) return row.minutesLate; const start = timeMinutes(row.shift?.start), actual = timeMinutes(row.checkIn); return start === null || actual === null ? null : Math.max(0, actual - start); };
const activityText = activity => { const value = activity.title || activity.content || activity.action || "Workspace activity"; const match = String(value).match(/^(GET|POST|PUT|PATCH|DELETE)\s+\/api\/([^/ ?]+)/); return match ? (match[1] === "GET" ? "Viewed " : match[1] === "DELETE" ? "Removed " : "Updated ") + match[2].replaceAll("-", " ") : value; };
const idOf = value => String(value?._id || value?.id || value || "");
function Gauge({ entries, label, value, empty }) {
  const reduceMotion = useMediaQuery("(prefers-reduced-motion: reduce)");
  const active = entries.filter(item => item.value > 0), data = active.length ? active : [{ name: "No records", value: 1, color: colors.border }];
  return <><div className="smart-gauge"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie isAnimationActive={!reduceMotion} data={data} dataKey="value" startAngle={180} endAngle={0} innerRadius="72%" outerRadius="98%" cy="85%" paddingAngle={2} cornerRadius={4} stroke="none">{data.map(item => <Cell key={item.name} fill={item.color} />)}</Pie><Tooltip /></PieChart></ResponsiveContainer><div className="smart-gauge-label"><small>{label}</small><b>{value}</b></div></div>{!active.length && <Typography align="center" variant="body2">{empty}</Typography>}<div className="smart-legend">{entries.map(item => <div key={item.name}><span className="smart-dot" style={{ background: item.color }} />{item.name} <strong>{item.value}</strong></div>)}</div></>;
}
function Widget({ title, resource, retry, children, action }) {
  return <Card><CardHeader title={title} action={action} /><Box sx={{ p: 2 }}>{resource?.loading ? <Skeleton variant="rectangular" height={220} /> : resource?.error ? <ErrorState error={resource.error} onRetry={retry} /> : children}</Box></Card>;
}
export default function SmartDashboard() {
  const reduceMotion = useMediaQuery("(prefers-reduced-motion: reduce)");
  const user = useAuthStore(state => state.user), navigate = useNavigate();
  const role = String(user?.role?.code || user?.role || "employee").toLowerCase();
  const privileged = ["admin", "hr", "superadmin", "super_admin"].includes(role);
  const canRead = useCallback(module => user?.rolePermissions ? user.rolePermissions[module]?.read === true : privileged, [user, privileged]);
  const [resources, setResources] = useState({}), [attendanceDate, setAttendanceDate] = useState(localDate()), [jobTab, setJobTab] = useState("openings");
  const load = useCallback(async () => {
    const requests = { summary: () => execReq("/dashboard/summary").then(response => response.data) };
    if (canRead("employees")) requests.employees = () => fetchCollection("/employees");
    if (canRead("projects")) requests.projects = () => fetchCollection("/projects");
    if (canRead("attendance")) requests.attendance = () => fetchCollection("/attendance", { date: attendanceDate });
    if (canRead("performance")) requests.performance = () => fetchCollection("/performance");
    setResources(previous => Object.fromEntries(Object.keys(requests).map(key => [key, { ...previous[key], loading: true, error: "" }])));
    await Promise.allSettled(Object.entries(requests).map(async ([key, request]) => {
      try { const data = await request(); setResources(previous => ({ ...previous, [key]: { data, loading: false } })); }
      catch (error) { setResources(previous => ({ ...previous, [key]: { loading: false, error: error?.response?.data?.message || "Unable to load this widget." } })); }
    }));
  }, [canRead, attendanceDate]);
  useEffect(() => { load(); }, [load]);
  const summary = resources.summary?.data || {}, k = summary.kpis || {}, charts = summary.charts || {}, feed = summary.feed || {};
  const employees = resources.employees?.data || [], projects = resources.projects?.data || [], punches = resources.attendance?.data || [];
  const clockRows = punches.filter(row => row.checkIn && row.checkIn !== "-");
  const tasks = projects.flatMap(project => (project.tasks || []).map(task => ({ ...task, projectName: project.name })));
  const stats = [
    ["Attendance Overview", k.todayPresent === undefined ? undefined : `${k.todayPresent}/${k.totalEmployees ?? 0}`, ScheduleOutlined, "/dashboard/attendance"],
    ["Active Projects", k.activeProjects, WorkOutline, "/dashboard/projects"], ["Total Employees", k.totalEmployees, PeopleOutline, "/dashboard/employees"],
    ["Project Tasks", resources.projects?.data ? tasks.length : undefined, TaskAlt, "/dashboard/projects"],
    ["Pending Leave Requests", k.pendingLeaves, CalendarMonthOutlined, "/dashboard/leave"], ["Departments", k.totalDepartments, PeopleOutline, "/dashboard/departments"],
    [canRead("payroll") ? "Payroll Summary" : "Leave Requests", canRead("payroll") ? k.totalPayroll : k.totalLeaveRequests, PaymentsOutlined, canRead("payroll") ? "/dashboard/payroll" : "/dashboard/leave"],
    ["New Hires This Month", k.newJoineesThisMonth, PersonAddAlt, "/dashboard/employees"],
  ];
  const status = [ ["Fulltime", colors.warning, employee => /full.?time/i.test(employee.employmentType)], ["Contract", colors.secondaryDark, employee => /contract/i.test(employee.employmentType)], ["Probation", colors.danger, employee => /probation/i.test(employee.employmentType + " " + employee.employmentStatus)], ["WFH", colors.pink, employee => /remote/i.test(employee.workLocation)] ].map(([name, color]) => ({ name, color, value: 0 }));
  employees.forEach(employee => { const index = /remote/i.test(employee.workLocation) ? 3 : /probation/i.test(employee.employmentType + " " + employee.employmentStatus) ? 2 : /contract/i.test(employee.employmentType) ? 1 : /full.?time/i.test(employee.employmentType) ? 0 : -1; if (index >= 0) status[index].value++; });
  const attendance = [["Present", colors.success], ["Late", colors.warning], ["Permission", colors.secondaryDark], ["Absent", colors.danger]].map(([name, color]) => ({ name, color, value: punches.filter(row => String(row.status).toLowerCase() === name.toLowerCase()).length }));
  const taskEntries = [["Ongoing", colors.warning], ["On Hold", colors.info], ["Overdue", colors.danger], ["Completed", colors.success]].map(([name, color]) => ({ name, color, value: 0 }));
  tasks.forEach(task => { const index = task.status === "Done" ? 3 : task.dueDate && new Date(task.dueDate) < new Date() ? 2 : task.status === "Blocked" ? 1 : 0; taskEntries[index].value++; });
  const performer = (resources.performance?.data || []).filter(item => /reviewed|closed/i.test(item.status) && Number.isFinite(item.score)).sort((a, b) => b.score - a.score)[0];
  const performerEmployee = performer && (typeof performer.employee === "object" ? performer.employee : employees.find(employee => idOf(employee) === idOf(performer.employee)));
  const birthdayGroups = { Today: [], Tomorrow: [], Upcoming: [] };
  const today = new Date(); today.setHours(0, 0, 0, 0);
  employees.forEach(employee => { if (!employee.dateOfBirth) return; const dob = new Date(employee.dateOfBirth); if (!Number.isFinite(dob.getTime())) return; let next = new Date(today.getFullYear(), dob.getMonth(), dob.getDate()); if (next < today) next = new Date(today.getFullYear() + 1, dob.getMonth(), dob.getDate()); const days = Math.round((next - today) / 86400000); if (days <= 30) birthdayGroups[days === 0 ? "Today" : days === 1 ? "Tomorrow" : "Upcoming"].push({ ...employee, next }); });
  Object.values(birthdayGroups).forEach(group => group.sort((a, b) => a.next - b.next));
  const exportSnapshot = () => downloadBlob(new Blob([JSON.stringify({ exportedAt: new Date().toISOString(), ...summary }, null, 2)], { type: "application/json" }), "hrms-dashboard.json");
  const widget = (title, key, children, action) => <Widget title={title} resource={resources[key]} retry={load} action={action}>{children}</Widget>;
  const table = (rows, columns, resource) => <DataTable rows={rows} columns={columns} fill={false} toolbar={false} rowsPerPage={5} loading={resource?.loading} error={resource?.error} onRetry={load} />;
  const person = employee => <Stack direction="row" spacing={1} alignItems="center"><Avatar src={employee?.avatar} name={employee?.fullName} /><Box><Typography fontWeight={600} variant="body2">{employee?.fullName || "Employee"}</Typography><Typography variant="caption">{employee?.designation || ""}</Typography></Box></Stack>;
  return <div className="smart-dashboard">
    <Stack direction="row" justifyContent="flex-end" gap={1} flexWrap="wrap"><Button variant="outline" startIcon={<DownloadOutlined />} onClick={exportSnapshot} disabled={!resources.summary?.data}>Export</Button><DatePicker label="Attendance date" value={attendanceDate} onChange={event => setAttendanceDate(event.target.value)} sx={{ width: 180 }} /><Button variant="outline" onClick={load}>Refresh</Button></Stack>
    <Card className="smart-welcome"><Avatar src={user?.avatar} name={user?.name} sx={{ width: 64, height: 64 }} /><div className="smart-welcome-copy"><h2>Welcome Back, {user?.name || "there"}</h2><p>{k.pendingLeaves === undefined ? "Your workspace at a glance." : <><strong className="smart-primary">{k.pendingLeaves} Pending Leave Requests</strong></>}</p></div><Button variant="primary" onClick={() => navigate("/dashboard/communication", { state: { tab: "meetings" } })}>Add Schedule</Button><Button variant="primary" onClick={() => navigate("/dashboard/leave")}>Add Requests</Button></Card>
    {resources.summary?.error && <ErrorState error={resources.summary.error} onRetry={load} />}
    <div className="smart-row smart-row-one"><div className="smart-kpis">{stats.map(([title, value, Icon, path]) => <StatCard key={title} title={title} value={value} icon={Icon} loading={resources.summary?.loading}><Button variant="ghost" size="small" onClick={() => navigate(path)}>View Details</Button></StatCard>)}</div>{widget("Employees By Department", "summary", charts.departmentDistribution?.length ? <Box sx={{ height: 300 }}><ResponsiveContainer><BarChart data={charts.departmentDistribution} layout="vertical" margin={{ right: 16 }}><CartesianGrid stroke={colors.border} horizontal={false} /><XAxis type="number" allowDecimals={false} tick={{ fill: colors.textMuted, fontSize: 12 }} /><YAxis type="category" dataKey="name" width={95} tick={{ fill: colors.textMuted, fontSize: 12 }} /><Tooltip /><Bar isAnimationActive={!reduceMotion} dataKey="value" fill={colors.primary} background={{ fill: colors.pageBg }} radius={4} barSize={20} /></BarChart></ResponsiveContainer></Box> : <EmptyState description="No department records available." />)}</div>
    <div className="smart-row smart-row-three">
      {widget("Employee Status", "employees", <><div className="smart-inline"><small>Total Employees</small><strong>{k.totalEmployees ?? employees.length}</strong></div><div className="smart-segments">{status.filter(item => item.value).map(item => <span key={item.name} style={{ flex: item.value, background: item.color }} />)}</div><div className="smart-stat-grid">{status.filter(item => item.value).map(item => <div className="smart-stat-box" key={item.name}><small>{item.name}</small><b>{item.value}</b></div>)}</div>{!status.some(item => item.value) && <EmptyState description="No employment status records." />}<CardHeader title="Top Performer" />{resources.performance?.error ? <ErrorState error={resources.performance.error} onRetry={load} /> : performerEmployee ? <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ py: 2 }}>{person(performerEmployee)}<Badge label={`${performer.score}/5`} /></Stack> : <EmptyState description="No reviewed performance data available." minHeight={100} />}<Button variant="outline" fullWidth onClick={() => navigate("/dashboard/employees")}>View All Employees</Button></>)}
      {widget("Attendance Overview", "attendance", <><Gauge entries={attendance} label="Total Attendance" value={punches.length} empty="No attendance today" /><Button variant="outline" fullWidth onClick={() => navigate("/dashboard/attendance")}>View Details</Button></>)}
      {widget("Clock-In/Out", "attendance", <>{clockRows.length ? clockRows.slice(0, 5).map(punch => <div className="smart-list-row" key={punch._id}>{person(typeof punch.employeeId === "object" ? punch.employeeId : employees.find(employee => idOf(employee) === idOf(punch.employeeId)))}<Stack><Badge label={punch.checkIn ? punchTime(punch.checkIn) : punch.status} /><Typography variant="caption">{punch.checkOut ? "Out " + punchTime(punch.checkOut) : ""}</Typography>{minutesLate(punch) > 0 && <Badge tone="danger" label={`${minutesLate(punch)} Min Late`} />}</Stack></div>) : <EmptyState description="No punches for the selected date." />}<Button variant="outline" fullWidth onClick={() => navigate("/dashboard/attendance")}>View All Attendance</Button></>)}
    </div>
    <div className="smart-row smart-row-three">
      {widget("Jobs Applicants", "summary", <><Tabs value={jobTab} onChange={(_, value) => { setJobTab(value); load(); }} options={[{ value: "openings", label: "Openings" }, { value: "applicants", label: "Applicants" }]} /><EmptyState description="Recruitment data is not available from the connected API." /></>)}
      {widget("Employees", "employees", table(employees, [{ field: "fullName", headerName: "Name", renderCell: person }, { field: "department", headerName: "Department", renderCell: row => <Badge label={nameOf(row.department)} /> }], resources.employees))}
      {widget("Todo", "projects", tasks.length ? <>{tasks.slice(0, 5).map(task => <div className="smart-list-row" key={task._id || task.title}><TaskAlt sx={{ color: task.status === "Done" ? colors.success : colors.textLight }} /><div className="smart-list-copy"><strong style={{ textDecoration: task.status === "Done" ? "line-through" : undefined }}>{task.title}</strong><small>{task.projectName}</small></div><Badge label={task.status} /></div>)}<Button variant="outline" onClick={() => navigate("/dashboard/projects")}>Manage Tasks</Button></> : <EmptyState description="No project tasks available." />)}
    </div>
    <div className="smart-row smart-row-wide">{widget("Sales Overview", "summary", <EmptyState description="Sales data is not available from the connected API." />)}{widget("Invoices", "summary", table(summary.invoices || [], [{ field: "number", headerName: "Invoice" }, { field: "amount", headerName: "Amount" }, { field: "status", headerName: "Status", renderCell: row => <Badge label={row.status} /> }], resources.summary))}</div>
    <div className="smart-row smart-row-wide">{widget("Projects", "projects", table(projects, [{ field: "code", headerName: "ID" }, { field: "name", headerName: "Name" }, { field: "teamMembers", headerName: "Team", renderCell: row => <Stack direction="row" spacing={0.5}>{(row.teamMembers || []).slice(0, 3).map(member => <Avatar key={idOf(member)} name={nameOf(member)} src={member.avatar} />)}</Stack> }, { field: "deadline", headerName: "Deadline", renderCell: row => dateLabel(row.deadline) }, { field: "priority", headerName: "Priority", renderCell: row => <Badge label={row.priority} /> }], resources.projects))}{widget("Tasks Statistics", "projects", <Gauge entries={taskEntries} label="Total Tasks" value={tasks.length} empty="No project tasks available." />)}</div>
    <div className="smart-row smart-row-three">
      {widget("Schedules", "summary", feed.upcomingEvents?.length ? feed.upcomingEvents.map((event, index) => <div className="smart-list-row" key={event._id || index}><div className="smart-list-copy"><strong>{event.title || event.name}</strong><small>{dateLabel(event.date || event.startDate)}</small></div><Button variant="outline" onClick={() => navigate("/dashboard/communication", { state: { tab: "meetings" } })}>View</Button></div>) : <EmptyState description="No upcoming schedules." />)}
      {widget("Recent Activities", "summary", feed.recentActivities?.length ? feed.recentActivities.slice(0, 6).map((activity, index) => <div className="smart-list-row" key={activity._id || index}><Avatar src={activity.avatar} name={nameOf(activity.user)} /><div className="smart-list-copy"><strong>{activityText(activity)}</strong><small>{dateLabel(activity.createdAt)}</small></div></div>) : <EmptyState description="No recent activities." />)}
      {widget("Birthdays", "employees", Object.values(birthdayGroups).some(group => group.length) ? Object.entries(birthdayGroups).map(([group, people]) => people.length ? <Box key={group}><Typography variant="caption" fontWeight={600}>{group}</Typography>{people.map(employee => <div className="smart-list-row" key={idOf(employee)}>{person(employee)}<small>{dateLabel(employee.next)}</small><Button variant="secondary" size="small" onClick={() => navigate("/dashboard/communication", { state: { tab: "messages", recipientId: employee.userId?._id || employee.userId } })}>Send</Button></div>)}</Box> : null) : <EmptyState description="No upcoming birthdays" />)}
    </div>
  </div>;
}
