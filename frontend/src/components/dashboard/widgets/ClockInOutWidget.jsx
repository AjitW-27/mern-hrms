import React from "react";
import { Card, CardHeader } from "../../common/UI";
import DataTable from "../../common/DataTable";
export function ClockInOutWidget({ data = [], loading, error, onRetry, columns = [{ field: "name", headerName: "Name" }, { field: "date", headerName: "Date" }] }) { return <Card><CardHeader title="Clock-In/Out" /><DataTable rows={data} columns={columns} fill={false} loading={loading} error={error} onRetry={onRetry} /></Card>; }
export default ClockInOutWidget;
