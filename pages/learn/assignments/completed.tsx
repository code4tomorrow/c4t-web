import React from "react";
import { AssignmentsPage } from ".";

const CompletedAssignmentsPage: React.FC = () => (
    <AssignmentsPage initialFilter="completed" completedView />
);

export default CompletedAssignmentsPage;
