"use client";
import React, { forwardRef } from "react";
import ApprovalsPage from "@/components/ApprovalsPage";

const ApprovalsPageWrapper = forwardRef((props, ref) => <ApprovalsPage ref={ref} {...props} />);
export default ApprovalsPageWrapper; 