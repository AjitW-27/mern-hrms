import React from "react";
import { Box } from "@mui/material";
import ModulePage from "../../components/common/ModulePage";
import PageHeader from "../../components/common/PageHeader";
import { projectConfig } from "../../config/moduleConfigs";

const Page = () => (
  <Box sx={{ overflow: "hidden" }}>
    {/* Custom header without breadcrumb duplication */}
    <PageHeader title={projectConfig.title} />
    {/* Hide the internal header of ModulePage */}
    <ModulePage config={projectConfig} hideHeader />
  </Box>
);

export default Page;
