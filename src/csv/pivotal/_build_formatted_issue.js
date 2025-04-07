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
    comments: [taskStatusComment, rawPivotalTrackerDataComment,  ...(comments || [])],
  };

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
  const header = ["#### Task and Task Status Data:", ""];

  const dataRows = Object.entries(row)
    .filter(([key]) => ["Task", "Task Status"].includes(key))
    .map(([key, value]) => {
      const formattedValue = Array.isArray(value)
        ? joinMultipleColumnsWithNewLine(value)
        : value;
      return `#### ${key}: \n${formattedValue}`;
    });

  return [...header, ...dataRows].join("\n");
}

function joinMultipleColumns(columns) {
  if (!Array.isArray(columns)) return "";
  return columns.filter((comment) => comment !== "");
}

function joinMultipleColumnsWithNewLine(columns) {
  if (!Array.isArray(columns)) return "";
  return columns
    .filter((comment) => comment !== "")
    .map((comment) => `- ${comment}\n`)
    .join("");
}
