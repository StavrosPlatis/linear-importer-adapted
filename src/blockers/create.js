import linearClient from "../../config/client.mjs";
import { detailedLogger } from "../../logger/logger_instance.js";
import { REQUEST_DELAY_MS } from "../../config/config.js";

async function create({ pivotalStories, createdIssues }) {
  for (const issue of pivotalStories) {
    try {
      console.log("Creating blockers...");
      const blockersIds = Array.isArray(issue.blockers) ? issue.blockers : [];
      console.log(`Blockers IDs: ${JSON.stringify(blockersIds)}`);

      if (blockersIds.length !== 0) {
        for (const blockerId of blockersIds) {
          // find from all the createdIssues, the one that has the same pivotal id as the blockerId and get its index
          const blockerIndex = createdIssues.pivotalIds.indexOf(blockerId);
          const relatedIndex = createdIssues.pivotalIds.indexOf(issue.id);

          if (relatedIndex !== -1 && blockerIndex !== -1) {
            // Get the Linear issue object from the createdIssues array
            const blockerIssue =
              await createdIssues.newIssues[blockerIndex].issue;
            const relatedIssue =
              await createdIssues.newIssues[relatedIndex].issue;

            if (blockerIssue && relatedIssue) {
              // Access the issue IDs only if both are defined
              const issueId = blockerIssue.id;
              const relatedIssueId = relatedIssue.id;
              const issueIdentifier = blockerIssue.identifier;
              const relatedIssueIdentifier = relatedIssue.identifier;

              if (issueId !== relatedIssueId) {
                console.log(
                  `(${issue.title}) Creating blocker relation between ${issueIdentifier} and ${relatedIssueIdentifier}\nPivotal IDs: ${blockerId} and ${issue.id}\n`,
                );

                // Create the relation between the two issues
                await linearClient.createIssueRelation({
                  issueId: issueId,
                  relatedIssueId: relatedIssueId,
                  type: "blocks",
                });
              } else {
                console.log(
                  `Blocker and related issue are the same. Blocker ID: ${blockerId}, Issue ID: ${issue.id}`,
                );
              }
            } else {
              console.log(
                `One of the issues is undefined. Blocker ID: ${blockerId}, Issue ID: ${issue?.id || "undefined"}`,
              );
            }
          }
        }
        await new Promise((resolve) => setTimeout(resolve, REQUEST_DELAY_MS));
      } else {
        console.log(
          `Blockers not created for issue ${issue.id} (${issue.title})`,
        );
      }
    } catch (error) {
      detailedLogger.importantError(
        `Failed to create blocker: ${error.message}`,
      );
      process.exit(0);
    }
  }
}

export default create;
