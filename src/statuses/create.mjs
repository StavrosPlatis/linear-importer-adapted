import linearClient from "../../config/client.mjs";
import chalk from "chalk";

const BACKLOG_TYPE = "backlog";
const UNSTARTED_TYPE = "unstarted";
const COMPLETED_TYPE = "completed";
const STARTED_TYPE = "started";
// const CANCELED = 'canceled';
// const TRIAGE = 'triage';

const ACCEPTED = "pivotal - accepted";
const UNSCHEDULED = "pivotal - unscheduled";
const FINISHED = "pivotal - finished";
const PLANNED = "pivotal - planned";
const STARTED = "pivotal - started";
const DELIVERED = "pivotal - delivered"; // Added 

const STATUSES_TO_CREATE = [
  { name: UNSCHEDULED, color: "#6C757D", type: BACKLOG_TYPE },
  { name: PLANNED, color: "#e0e2e5", type: UNSTARTED_TYPE },
  { name: STARTED, color: "#f3f3d1", type: STARTED_TYPE },
  { name: ACCEPTED, color: "#629200", type: COMPLETED_TYPE },
  { name: FINISHED, color: "#17A2B8", type: COMPLETED_TYPE },
  { name: DELIVERED, color: "#B8860B", type: COMPLETED_TYPE }, // Added
];

async function createStatusForTeam({ teamId }) {
  try {
    console.log(chalk.cyan(`🔄 Creating Workflow Statuses...`));

    let successCount = 0;
    let failedCount = 0;
    const totalCount = STATUSES_TO_CREATE.length;

    for (const status of STATUSES_TO_CREATE) {
      try {
        const response = await linearClient.createWorkflowState({
          teamId,
          name: status.name,
          color: status.color,
          type: status.type,
        });

        if (response.success) {
          successCount++;
          console.log(
            chalk.green(`✅ Workflow Status "${status.name}" created`),
          );
        } else {
          failedCount++;
          console.error(chalk.dim.yellow(`${response.errors}. Skipping...`));
        }
      } catch (error) {
        failedCount++;
        console.error(
          chalk.dim.yellow(
            `Failed to create "${status.name}": ${error.message}`,
          ),
        );
      }
    }

    console.log(chalk.green(`Statuses created: ${successCount}/${totalCount}`));
    if (failedCount > 0) {
      console.log(chalk.yellow(`Failed to create: ${failedCount}\n`));
    }
  } catch (error) {
    console.error(
      chalk.redBright("Error creating workflow Status:"),
      error.message,
    );
  }
}

export default createStatusForTeam;
