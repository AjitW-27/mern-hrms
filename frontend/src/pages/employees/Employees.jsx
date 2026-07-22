import React from "react";
import CrudPage from "../../components/common/CrudPage";
import { employeeConfig } from "../../config/moduleConfigs";

const Page = () => <CrudPage config={employeeConfig} />;

export default Page;
