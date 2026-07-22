import React from "react";
import CrudPage from "../../components/common/CrudPage";
import { attendanceConfig } from "../../config/moduleConfigs";

const Page = () => <CrudPage config={attendanceConfig} />;

export default Page;
