import React, { useState, useEffect } from "react";
import $api from "../http/api";
import { useStatusFilterStore } from "../hooks/useFilterStore";

const StatusSelector = () => {
  const [statuses, setStatuses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { setValue, id, setId } = useStatusFilterStore();

  useEffect(() => {
    const fetchStatuses = async () => {
      try {
        const response = await $api.get("/statuses/all");
        if (response.status === 200) {
          setStatuses(response.data.status);
          setLoading(false);
        }
      } catch (err) {
        setError("Failed to load statuses");
        setLoading(false);
        console.error("Error fetching statuses:", err);
      }
    };

    fetchStatuses();
  }, []);

  const handleStatusChange = (e) => {
    const selectedId = e.target.value;
    const selectedStatus = statuses.find(
      (status) => status.id.toString() === selectedId
    );

    if (selectedStatus) {
      setValue(selectedStatus.product_status);
      setId(selectedStatus.id);
    } else {
      // Status tanlanmagan holat
      setValue("");
      setId(null);
    }
  };

  if (loading) {
    return <div>Loading statuses...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div className="status-selector">
      <select
        id="global-status"
        value={id || ""} // Using id as the value
        onChange={handleStatusChange}
        className="status-dropdown outline-none"
      >
        <option hidden value="">
          Status
        </option>
        {statuses.length > 0 &&
          statuses.map((status) => (
            <option key={status.id} value={status.id}>
              {status.product_status}
            </option>
          ))}
      </select>
    </div>
  );
};

export default StatusSelector;
