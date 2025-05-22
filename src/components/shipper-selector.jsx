import React, { useState, useEffect } from "react";
import $api from "../http/api";
import { useShipperFilterStore } from "../hooks/useFilterStore";

const ShipperSelector = ({ onStatusChange }) => {
  const [statuses, setStatuses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { setValue, id, setId } = useShipperFilterStore();

  useEffect(() => {
    const fetchStatuses = async () => {
      try {
        const response = await $api.get("/shipper/all");
        if (response.status === 200) {
          console.log(response);

          setStatuses(response.data.shippers);
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

      if (onStatusChange) {
        // Pass both id and status to the callback
        onStatusChange({
          id: selectedStatus.id,
          status: selectedStatus.product_status,
        });
      }
    } else {
      // Handle the case when "Status" placeholder is selected
      setValue("");
      setId(null);
      if (onStatusChange) {
        onStatusChange({ id: null, status: "" });
      }
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
          Yetkazib beruvchi
        </option>
        {statuses.length > 0 &&
          statuses.map((status) => (
            <option key={status.id} value={status.id}>
              {status.name}
            </option>
          ))}
      </select>
    </div>
  );
};

export default ShipperSelector;
