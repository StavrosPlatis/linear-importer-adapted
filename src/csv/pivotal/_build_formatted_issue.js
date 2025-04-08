export function buildFormattedIssue(row) {
  const comments = joinMultipleColumns(row["Comment"]);
  const rawPivotalTrackerDataComment = buildRawPivotalTrackerDataComment(row);
  const title = buildTitle(row);
  const dueDate = buildDueDate(row);
  const ownedBy = joinMultipleColumns(row["Owned By"]);
  const taskStatusComment = buildTaskStatusComment(row);

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
    console.log(`task: ${task}`);
    console.log(`status: ${status}`);

    if (task && status) {
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
