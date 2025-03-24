import { detailedLogger } from "../../logger/logger_instance.js";

function formatPriority(priority) {
  const pivotalPriorities = {
    "none": 0,
    "p0 - Critical": 1,
    "p1 - High": 2,
    "p2 - Medium": 3,
    "p3 - Low": 4,
  };

  const result = pivotalPriorities[priority] || 0;

  detailedLogger.info(`formatPriority: ${priority} -> ${result}`);

  return result;
}

export default formatPriority;
