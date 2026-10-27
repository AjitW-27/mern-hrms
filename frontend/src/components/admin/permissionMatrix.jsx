import React, { useMemo } from "react";
import { Checkbox } from "@mui/material";
import DataTable from "../common/DataTable";

const ACTIONS = ["create", "read", "update", "delete", "approve", "export"];

const PermissionMatrix = ({
  permissions = [],
  selectedPermissions = [],
  onChange,
}) => {
  const groupedPermissions = useMemo(() => {
    const modules = {};

    permissions.forEach((permission) => {
      if (!modules[permission.module]) {
        modules[permission.module] = {};
      }

      modules[permission.module][permission.action] = permission._id;
    });

    return modules;
  }, [permissions]);

  const handlePermissionToggle = (permissionId) => {
    if (selectedPermissions.includes(permissionId)) {
      onChange(selectedPermissions.filter((id) => id !== permissionId));
    } else {
      onChange([...selectedPermissions, permissionId]);
    }
  };

  const handleModuleToggle = (modulePermissions) => {
    const permissionIds = Object.values(modulePermissions);

    const allSelected = permissionIds.every((id) =>
      selectedPermissions.includes(id),
    );

    if (allSelected) {
      onChange(selectedPermissions.filter((id) => !permissionIds.includes(id)));
    } else {
      const merged = [...new Set([...selectedPermissions, ...permissionIds])];

      onChange(merged);
    }
  };

  return <DataTable fill={false} toolbar={false} pagination={false} maxHeight={520} rows={Object.entries(groupedPermissions).map(([module, permissions]) => ({ id: module, module, permissions }))} columns={[{ field: "module", headerName: "Module" }, ...ACTIONS.map(action => ({ field: action, headerName: action, align: "center", minWidth: 85, renderCell: row => row.permissions[action] ? <Checkbox inputProps={{ "aria-label": row.module + " " + action }} checked={selectedPermissions.includes(row.permissions[action])} onChange={() => handlePermissionToggle(row.permissions[action])} /> : null })), { field: "all", headerName: "All", align: "center", minWidth: 85, renderCell: row => <Checkbox inputProps={{ "aria-label": row.module + " all permissions" }} checked={Object.values(row.permissions).every(id => selectedPermissions.includes(id))} onChange={() => handleModuleToggle(row.permissions)} /> }]} />;
};
export default PermissionMatrix;
