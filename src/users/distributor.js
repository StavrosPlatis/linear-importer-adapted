import getUserMapping from "./get_user_mapping.js";
import { detailedLogger } from "../../logger/logger_instance.js";

async function distributeUsers(issue, teamName) {
  const userMapping = await getUserMapping(teamName);
  const subscriberIds = [];
  let assigneeId;

  // Handle requestedBy user
  const requestedByUser = userMapping[issue.requestedBy]?.linearId;
  if (requestedByUser) {
    subscriberIds.push(requestedByUser);
    detailedLogger.info(`Added creator "${issue.requestedBy}" to subscribers`);
  }

  // Handle owners
  if (issue.ownedBy) {
    const owners = String(issue.ownedBy)
      .split(",")
      .map((owner) => owner.trim())
      .filter((owner) => owner);

    for (const owner of owners) {
      const linearId = userMapping[owner]?.linearId;
      if (linearId) {
        if (!assigneeId) {
          assigneeId = linearId;
          detailedLogger.info(
            `Mapped Pivotal user "${owner}" to Linear ID: ${linearId} as assignee`,
          );
        }
        subscriberIds.push(linearId);
        detailedLogger.info(`Added Pivotal user "${owner}" to subscribers`);
      }
    }

    if (!assigneeId) {
      detailedLogger.warning(
        `No Linear user mapping found for any Pivotal users: ${owners.join(", ")}`,
      );
    }
  }

  if (!assigneeId && requestedByUser) {
    assigneeId = requestedByUser;
    detailedLogger.warning(
      `No owners found. Setting assignee to Requested By user "${issue.requestedBy}" : ${requestedByUser}`,
    );
  }

  const data = { assigneeId, subscriberIds: [...new Set(subscriberIds)] };

  detailedLogger.info(`distributeUsers: ${JSON.stringify(data, null, 2)}`);

  return data;
}

export default distributeUsers;
