import { detailedLogger } from "../../logger/logger_instance.js";

function formatPriority(priority) {
  const pivotalPriorities = {
    "p1 - High": 2,
    "p2 - Medium": 3,
    "p3 - Low": 4,
  };

  const result = pivotalPriorities[priority] || 4;

  detailedLogger.info(`formatPriority: ${priority} -> ${result}`);

  return result;
}

export default formatPriority;
