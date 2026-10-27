import "./ChangeOrderStatus.css";

import {
  STATUSES,
  StatusTransitions,
} from "../../../services/OrdersServices.js";

import useUpdateData from "../../../Hooks/useUpdateData";

import { GoDotFill } from "react-icons/go";
import { HiArrowLongRight } from "react-icons/hi2";

export default function ChangeOrderStatus({
  status,
  id,
  onStatusUpdated,
  onClose,
}) {
  const { updateStatus, isUpdating, error, loading } = useUpdateData(id);

  const handleStatusChange = async (
    newStatus,
    isCurrentStatus,
    canTransitions,
  ) => {
    if (!isCurrentStatus && canTransitions) {
      try {
        const data = await updateStatus(newStatus);

        onStatusUpdated?.(newStatus);
      } catch (err) {
        console.error("Update error:", err);
      }
    }

    onClose();
  };

  return (
    <section className="change-order-status-container">
      <div className="change-order-status-header">
        <span className="change-order-status-title">
          Change status. Statuses only move forward.
        </span>
      </div>
      <ul className="change-order-status-items">
        {STATUSES.map((st, i) => {
          const { isCurrentStatus, canTransitions } = StatusTransitions({
            status: status,
            currentStatus: st,
          });

          return (
            <li
              className={`
              change-order-status-item 
              change-order-status-item-${st}
              ${status === st ? "currentStatus" : "disabled"}
              ${canTransitions ? "transition" : "notTransition"}
              `}
              key={i}
              onClick={() =>
                handleStatusChange(st, isCurrentStatus, canTransitions)
              }
            >
              <span className="change-order-status-item-dot">
                <GoDotFill />
              </span>

              <div className="change-order-status-item-text">
                <span className="change-order-status-item-text-status">
                  {loading && canTransitions ? "Loading..." : st}
                </span>

                <span className="change-order-status-item-text-des">
                  {isCurrentStatus && "Current Status"}

                  {!isCurrentStatus &&
                    (canTransitions ? "You can go here" : "You cannot jump")}
                </span>
              </div>

              {st == status ? (
                <span className="arrow">
                  <HiArrowLongRight />
                </span>
              ) : (
                ""
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
