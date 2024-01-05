import path from "path";
import { Core, EventSystem } from "@intutable/core";
import {
  closeConnection,
  insert,
  openConnection,
} from "@intutable/database/dist/requests";
import { deleteWorkflow } from "../../src/requests";
import { exampleWorkflow } from "../testData/WorkflowTable";
import { tableNames } from "../../src/data/schema";
import { USERNAME, PASSWORD } from "../../src/config/connection";

let core: Core;
let connectionId: string;

beforeAll(async () => {
  core = await Core.create(
    [
      path.join(__dirname, "../../node_modules/@intutable/*"),
      path.join(__dirname, "../.."),
    ],
    new EventSystem(false)
  );

  connectionId = (await core.events.request(openConnection(USERNAME, PASSWORD)))
    .connectionId;
});

afterAll(async () => {
  await core.events.request(closeConnection(connectionId));
  core.plugins.closeAll();
});

beforeEach(async () => {
  await core.events.request(
    insert(connectionId, tableNames.workflows, {
      _id: exampleWorkflow._id,
      index: exampleWorkflow.index,
      name: exampleWorkflow.name,
      description: exampleWorkflow.description,
      steps: JSON.stringify(exampleWorkflow.steps),
      connections: JSON.stringify(exampleWorkflow.connections),
      startstep: exampleWorkflow.startstep,
      history: JSON.stringify(exampleWorkflow.history),
      owner: exampleWorkflow.owner,
      state: exampleWorkflow.state,
      majorsteps: JSON.stringify(exampleWorkflow.majorsteps),
    })
  );
});

afterEach(async () => {
  await core.events.request(
    deleteWorkflow(exampleWorkflow._id, {
      username: "Big Boss",
      authCookie: "someCookie",
      id: exampleWorkflow.owner,
      isLoggedIn: true,
    })
  );
});

describe("initJobScheduler", () => {
  test("TODO", async () => {
    // Arrange

    // Act

    // Assert
    expect(true).toBe(true);
  });
});

describe("createJob", () => {
  test("TODO", async () => {
    // Arrange

    // Act

    // Assert
    expect(true).toBe(true);
  });
});

describe("killJobByWorkflowIdAndName", () => {
  test("TODO", async () => {
    // Arrange

    // Act

    // Assert
    expect(true).toBe(true);
  });
});

describe("killAllJobsOfWorkflow", () => {
  test("TODO", async () => {
    // Arrange

    // Act

    // Assert
    expect(true).toBe(true);
  });
});
