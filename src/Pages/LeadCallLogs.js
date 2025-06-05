import React, { useEffect } from "react";
import { useLocation, useParams } from "react-router-dom";
import { assignedLeadsData, mockData, trainerAvailability } from "../DummyData/DummyData";
import CreateCallLogs from "../components/CreateCallLogs";

const LeadCallLogs = () => {
  const { id } = useParams();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const action = queryParams.get("action");

  const dataSource = action === "add-follow-up" ? assignedLeadsData : mockData;
  const leadDetails = dataSource.find((m) => m.id === parseInt(id));

  return (
    <div className="page--content">
      <div className="flex items-end justify-between gap-2 mb-5">
        <div className="title--breadcrumbs">
          <p className="text-sm">Home &gt; Lead calls</p>
          <h1 className="text-3xl font-semibold">Lead Calls</h1>
        </div>
      </div>

      <CreateCallLogs details={leadDetails} />
    </div>
  );
};

export default LeadCallLogs;
