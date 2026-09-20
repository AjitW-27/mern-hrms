import React from "react";
import ModulePage from "../../components/common/ModulePage";
import { assetConfig } from "../../config/moduleConfigs";

const AssetManagement = () => (
  <ModulePage
    config={assetConfig}
    transformItem={(asset) => ({
      ...asset,
      assignedEmployee: asset.assignedTo?.fullName || "Unassigned"
    })}
  />
);

export default AssetManagement;
