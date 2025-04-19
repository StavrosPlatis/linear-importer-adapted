export function buildFormattedIssue(row) {
  const comments = joinMultipleColumns(row["Comment"]);
  const rawPivotalTrackerDataComment = buildRawPivotalTrackerDataComment(row);
  const title = buildTitle(row);
  const dueDate = buildDueDate(row);
  const ownedBy = joinMultipleColumns(row["Owned By"]);
  const taskStatusComment = buildTaskStatusComment(row);
  const blockers = buildBlockers(row);

  const params = {
    isRelease: row["Type"] == "release",
    title,
    dueDate,
    id: row["Id"],
    type: row["Type"],
    createdAt: row["Created at"],
    startsAt: row["Iteration Start"],
    endsAt: row["Iteration End"],
    description: row["Description"],
    iteration: row["Iteration"],
    state: row["Current State"],
    priority: row["Priority"],
    labels: row["Labels"],
    requestedBy: row["Requested By"],
    ownedBy,
    estimate: row["Estimate"],
    comments: [
      taskStatusComment,
      rawPivotalTrackerDataComment,
      ...(comments || []),
    ].filter(Boolean),
    blockers,
  };
  console.log(`params: ${JSON.stringify(params)}`);
  return params;
}

function buildDueDate(row) {
  if (row["Type"] == "release") {
    return row["Iteration End"];
  } else {
    return row["Accepted at"] || row["Iteration End"];
  }
}

function buildTitle(row) {
  if (row["Type"] == "release") {
    return row["Iteration"]
      ? `[Release ${row["Iteration"]}] ${row["Title"]}`
      : row["Title"];
  } else {
    return row["Title"];
  }
}

function buildRawPivotalTrackerDataComment(row) {
  const header = ["#### Raw Pivotal Tracker Data:", ""];

  const dataRows = Object.entries(row)
    .filter(([key]) => !["Comment", "Description"].includes(key))
    .map(([key, value]) => {
      const formattedValue = Array.isArray(value)
        ? joinMultipleColumns(value)
        : value;
      return `- ${key}: ${formattedValue}`;
    });

  return [...header, ...dataRows].join("\n");
}

function buildTaskStatusComment(row) {
  const header = ["#### Tasks:", ""];

  // Create arrays for "Task" and "Task Status" values
  const taskKeys = Object.keys(row).filter(
    (key) => key.startsWith("Task") && !key.includes("Status"),
  );
  const statusKeys = Object.keys(row).filter((key) =>
    key.startsWith("Task Status"),
  );

  const tasks = taskKeys.flatMap((key) => splitAndTrim(row[key]));
  console.log(`tasks: ${JSON.stringify(tasks)}`);
  const statuses = statusKeys.flatMap((key) => splitAndTrim(row[key]));
  console.log(`statuses: ${JSON.stringify(statuses)}`);

  const taskStatusLines = [];

  // Match tasks and statuses
  for (let i = 0; i < tasks.length; i++) {
    const task = tasks[i];
    const status = statuses[i];

    if (task && status) {
      console.log(`task: ${task}`);
      console.log(`status: ${status}`);
      const isDone = status.trim().toLowerCase() === "completed";
      taskStatusLines.push(`- [ ] ${task}${isDone ? " (DONE)" : ""}`);
    }
  }

  if (taskStatusLines.length > 0) {
    return [...header, ...taskStatusLines].join("\n");
  } else {
    return null; // no comment if no tasks
  }
}

function buildBlockers(row) {
  if (row["Blocker"]) {
    const blockerKeys = Object.keys(row).filter(
      (key) => key.startsWith("Blocker") && !key.includes("Status"),
    );
    const statusKeys = Object.keys(row).filter((key) =>
      key.startsWith("Blocker Status"),
    );

    const allBlockers = blockerKeys.flatMap((key) => splitAndTrim(row[key]));
    console.log(`All blockers: ${JSON.stringify(allBlockers)}`);
    const allStatuses = statusKeys.flatMap((key) => splitAndTrim(row[key]));
    console.log(`All blocker statuses: ${JSON.stringify(allStatuses)}`);

    const rowBlockersWithStatuses = allBlockers
      .map((blocker, index) => {
        const idRegex = /\b\d{9}\b/; // Matches exactly 9 digits
        const idMatch = idRegex.exec(blocker);
        return {
          blocker,
          status: allStatuses[index] || "unknown",
          id: idMatch ? idMatch[0] : null,
        };
      })
      .filter(
        (item) => item.status.toLowerCase() !== "resolved" && item.id !== null,
      );

    // Extract only the IDs
    const ids = rowBlockersWithStatuses.map((item) => item.id);

    console.log(`Filtered blocker IDs: ${JSON.stringify(ids)}`);
    return ids;
  }
  return [];
}

function splitAndTrim(value) {
  if (Array.isArray(value)) {
    return value.flatMap((v) =>
      typeof v === "string" ? v.split(",").map((s) => s.trim()) : [],
    );
  } else if (typeof value === "string") {
    return value
      .split(",")
      .map((v) => v.trim())
      .filter((v) => v !== "");
  } else {
    return [];
  }
}

function joinMultipleColumns(columns) {
  if (!Array.isArray(columns)) return "";
  return columns.filter((comment) => comment !== "");
}
