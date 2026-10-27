import React from "react";
import { Card, CardHeader, EmptyState, ErrorState, Skeleton } from "../../common/UI";
import { BarChart, Bar, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { colors } from "../../../theme/designTokens";
export function DepartmentBarChart({ data = [], loading, error, onRetry }) { return <Card><CardHeader title="Employees By Department" />{loading ? <Skeleton height={240} /> : error ? <ErrorState error={error} onRetry={onRetry} /> : data.length ? <ResponsiveContainer width="100%" height={240}><BarChart data={data}><CartesianGrid stroke={colors.border} /><XAxis dataKey="name" /><YAxis allowDecimals={false} /><Tooltip /><Bar dataKey="value" fill={colors.primary} radius={4} /></BarChart></ResponsiveContainer> : <EmptyState />}</Card>; }
export default DepartmentBarChart;
