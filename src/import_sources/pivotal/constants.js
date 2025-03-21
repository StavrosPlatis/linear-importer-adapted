const BACKLOG_TYPE = "backlog";
const UNSTARTED_TYPE = "unstarted";
const COMPLETED_TYPE = "completed";
const STARTED_TYPE = "started";
// const CANCELED = 'canceled';
// const TRIAGE = 'triage';

const ACCEPTED = "accepted";
const UNSCHEDULED = "unscheduled";
const FINISHED = "finished";
const PLANNED = "planned";
const STARTED = "started";
const UNSTARTED = "unstarted";
const DELIVERED = "delivered";


const PREFIX = "pivotal";

export const STATUS_OPTIONS = [
  {
    value: UNSCHEDULED,
    name: `${PREFIX} - ${UNSCHEDULED}`,
    color: "#6C757D",
    type: BACKLOG_TYPE,
  },
  {
    value: UNSTARTED,
    name: `${PREFIX} - ${UNSTARTED}`,
    color: "#6C757D",
    type: BACKLOG_TYPE,
  },
  {
    value: PLANNED,
    name: `${PREFIX} - ${PLANNED}`,
    color: "#e0e2e5",
    type: UNSTARTED_TYPE,
  },
  {
    value: STARTED,
    name: `${PREFIX} - ${STARTED}`,
    color: "#f3f3d1",
    type: STARTED_TYPE,
  },
  {
    value: ACCEPTED,
    name: `${PREFIX} - ${ACCEPTED}`,
    color: "#629200",
    type: COMPLETED_TYPE,
  },
  {
    value: FINISHED,
    name: `${PREFIX} - ${FINISHED}`,
    color: "#17A2B8",
    type: COMPLETED_TYPE,
  },
  // Added Delivered
  {
    value: DELIVERED,
    name: `${PREFIX} - ${DELIVERED}`,
    color: "#B8860B",
    type: COMPLETED_TYPE,
  },
];
