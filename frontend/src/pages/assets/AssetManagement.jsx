import React from "react";
import CrudPage from "../../components/common/CrudPage";
import { assetConfig } from "../../config/moduleConfigs";

const AssetManagement = () => (
  <CrudPage
    config={assetConfig}
    transformItem={(asset) => ({
      ...asset,
      assignedEmployee: asset.assignedTo?.fullName || "Unassigned"
    })}
  />
);

export default AssetManagement;
