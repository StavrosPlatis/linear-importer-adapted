# Linear Importer

CLI tool for migrating Pivotal Tracker projects to Linear via CSV export. Converts:

- Pivotal Stories → Linear Issues
- Pivotal Releases → Linear Parent Issues (with sub-issues)
- Preserves attachments, comments, labels, statuses, priorities, estimates, assignees, subscribers, dates

**Disclaimer**: This is a community-maintained tool and is not officially associated with either Linear or Pivotal Tracker.

### For Developers

- The codebase is structured to support additional importers reasonably easily (as of `v2.0.0`). Contact me if you intend to add support for other platforms (e.g., Trello).

Built with [Linear SDK](https://github.com/linear/linear/tree/master/packages/sdk).

## Key Features

- [File Attachments](#file-attachments) (optional)
- [Comments](#comments) (optional)
- [Assignee](#assignee) (Automatically matches Pivotal Users to Linear Member accounts)
- [Labels](#labels) (optional)
- [Priority](#priority) (optional)
- [Estimate](#estimate) (optional)
- [Releases](#releases) (Pivotal Releases → Linear parent issues with associated stories as sub-issues)
- [Statuses](#statuses)
- [Story Types](#story-types)
- [Subscribers](#subscribers)
- [Created Date](#created-date)
- [Due Date](#due-date)
- [Safe to retry](#logger) (Skips already imported stories to prevent duplicates)
- [Logger](#logger)

#### Other

- [Notes](#notes)
- [API Rate Limits](#api-rate-limits)
- [TODO](#todo)

## Setup

### Installation

1. Create a Personal API key in Linear under Settings -> API
2. Create a `.env` file and and populate `API_KEY`
3. `yarn install`
4. Unzip Pivotal Tracker export zip file into `assets`
5. Add Team Members in Linear
6. Consider using a burner account before continuing (See [Notes](#notes))

### Usage

`npm run import`

![alt text](image.png)

#### ENV Options

- `API_KEY` = ""
- `ENABLE_IMPORTING` = true
  - `false` to halt execution before any requests; allows testing CLI
- `ENABLE_DETAILED_LOGGING` = false
  - `true` to log all output. Enable this while developing or to see detailed messages
- `REQUEST_DELAY_MS` = 1
  - increase if reaching API rate limits

## Details

#### File Attachments

- `ENABLE_DETAILED_LOGGING` to view debug output

#### Comments

- Comments are imported with original author, timestamp, and content preserved.
- A Comment titled `Raw Pivotal Tracker Data` will be created for each issue that contains all CSV data for that issue (except Description, Comments, and Files, which are all populated independently)

#### Labels

- The following Labels will be created in the selected Team. This allows each Team to modify labels at their own pace without affecting other Teams, and will avoid any naming conflicts with existing labels.

  - `pivotal-epic`
  - `pivotal-release`
  - `pivotal-feature`
  - `pivotal-bug`
  - `pivotal-chore`

- Additionally, you will be prompted with the option to import labels created in Pivotal Tracker. These will be added to the imported Linear Issues.

#### Statuses

- The following Workflow Statuses will be created in the selected Team. This allows each Team to modify statuses at their own pace without affecting other Teams, and will avoid any naming conflicts with existing statuses.
  - `pivotal - accepted`
  - `pivotal - unscheduled`
  - `pivotal - finished`
  - `pivotal - planned`
  - `pivotal - started`

#### Story Types

- Configure your import by selecting specific story types via the CLI prompt:

![alt text](image-1.png)

Linear Issues will be assigned a label with the corresponding Story Type (See [Labels](#labels))

#### Releases

- Pivotal Releases → Linear parent issues with:
  - Label: `pivotal-release`
  - Associated stories as sub-issues

#### Priority

- Priority levels are mapped from Pivotal to Linear as follows:
  - P1 (Pivotal) → High (Linear)
  - P2 → Medium
  - P3 → Low

#### Estimate

- Prompts user to choose a new Estimate Scale
- Rounds pivotal estimate to nearest Linear value

#### Assignee

- Automatically matches Pivotal users to Linear team members by comparing names and emails
  - Prompts for manual matching when automatic matching fails
- For stories with multiple owners:

  - First owner becomes the assignee
  - Other owners become subscribers

  ![alt text](image-2.png)

- For stories without owners:

  - Story creator becomes the assignee

- User Map data is stored in `log/<team>/user_mapping.json`:
  ```json
  {
    "generated": "2024-01-01T00:00:00.000Z",
    "mapping": {
      "johndoe42": {
        "linearId": "a1b2c3d4-e5f6-4321-9876-543210fedcba",
        "linearName": "John Doe",
        "linearEmail": "john.doe@acme.com"
      },
      "robotcoder99": {
        "linearId": null,
        "linearName": null,
        "linearEmail": null,
        "note": "No matching Linear user found (manual skip)"
      }
    }
  }
  ```

#### Subscribers

- Pivotal story owners become Linear subscribers
- Pivotal `Requested By` -> Linear `Creator` is not possible because the Linear API prevents this value from being changed
  - `Requested By` becomes either the owner (based on ABC order) or a subscriber
  - `Creator` will be set to the user who created the Personal API Key
  - See **Raw Pivotal Tracker Data** comment for original value

#### Created Date

- ⏰ Created Date of Pivotal Story will be preserved on the imported Linear Issue
- 📅 Original timestamps are maintained for historical accuracy

#### Due Date

- ✅ Due dates from Pivotal are copied exactly to Linear
- ❌ Stories without due dates in Pivotal will have no due date in Linear

#### Logger

- Unique Team data is stored in team-specific folders (`log/<team-name>`). Each folder contains:
  - `output_<timestamp>.txt`: Complete console output for each import attempt
  - `user_mapping.json` - Maps Pivotal Tracker usernames to Linear user accounts (see [Assignee](#Assignee))
  - `successful_imports.csv` - Logs successfully imported Pivotal Stories. These will be skipped on subsequent import attempts, preventing duplicates.

> ⚠️ **WARNING**  
> Deleting `successful_imports.csv` file will cause the importer to lose track of previously imported stories. Only delete this file if you want to start over.

## Other

#### Notes

- Add Team Members in Linear before beginning import to take advantage of Automatic User mapping. However, users can be manually mapped.
- You will become a subscriber on every Issue that's created with this importer. Adjust your notification preferences accordingly, or consider using a burner account.
- Be mindful of notification preferences for your team members. This can get noisy while importing 😬

#### API Rate Limits

- Linear sets rate limits on their API usage, which you will probably reach. The Linear team was helpful in increasing my rate limits temporarily. https://developers.linear.app/docs/graphql/working-with-the-graphql-api/rate-limiting.
- The `REQUEST_DELAY_MS` ENV var can be adjusted to throttle request frequency

## TODO

- ALLOW_FAILURES
