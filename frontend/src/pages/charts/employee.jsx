import React from "react";
import { Card, CardHeader, EmptyState, Skeleton, ErrorState } from "../../components/common/UI";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from "recharts";
import { colors } from "../../theme/designTokens";
export default function EmployeeChart({ data = [], loading, error, onRetry }) { return <Card><CardHeader title="Employee Trend" />{loading ? <Skeleton height={240} /> : error ? <ErrorState error={error} onRetry={onRetry} /> : data.length ? <ResponsiveContainer width="100%" height={240}><AreaChart data={data}><CartesianGrid stroke={colors.border} /><XAxis dataKey="name" /><YAxis allowDecimals={false} /><Tooltip /><Area dataKey="value" stroke={colors.primary} fill={colors.primarySoft} /></AreaChart></ResponsiveContainer> : <EmptyState description="No employee trend data available." />}</Card>; }
