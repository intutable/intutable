import path from "path";
import { Core, EventSystem } from "@intutable/core";
import {
  closeConnection,
  insert,
  openConnection,
  select,
} from "@intutable/database/dist/requests";
import { exampleWorkflow } from "../testData/WorkflowTable";
import { tableNames } from "../../src/data/schema";
import { USERNAME, PASSWORD } from "../../src/config/connection";
import {
  deleteWorkflow,
  getActiveWorkflows,
  getWorkflow,
  getWorkflowProgress,
  getWorkflowTemplates,
} from "../../src/requests";
import { PMResponse, ProcessState, Workflow } from "../../src/types";

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
  // remove all rows of the workflow table
  const databaseWorkflows = await core.events.request(
    select(connectionId, tableNames.workflows)
  );

  for (const workflow of databaseWorkflows) {
    await core.events.request(
      deleteWorkflow(workflow._id, {
        username: "Big Boss",
        authCookie: "someCookie",
        id: workflow.owner,
        isLoggedIn: true,
      })
    );
  }
});

describe("getWorkflow", () => {
  test("correct workflow is returned", async () => {
    // Arrange
    const workflowId: string = exampleWorkflow._id;
    const expectedResponse: PMResponse = {
      status: 200,
      workflow: exampleWorkflow,
    };

    // Act
    const response = await core.events.request(getWorkflow(workflowId));

    // Assert
    expect(response).toStrictEqual(expectedResponse);
  });

  test("workflow was not found", async () => {
    // Arrange
    const workflowId = "someOtherWorkflowId";
    const expectedResponse: PMResponse = {
      status: 404,
      message: "Workflow not found",
    };

    // Act
    const response = await core.events.request(getWorkflow(workflowId));

    // Assert
    expect(response).toStrictEqual(expectedResponse);
  });
});

describe("registerAction", () => {
  test("TODO", async () => {
    // Arrange

    // Act

    // Assert
    expect(true).toBe(true);
  });
});

describe("getActiveWorkflows", () => {
  test("active Workflows are returned", async () => {
    // Arrange
    const activeWorkflow: Workflow = {
      _id: "activeWorkflow",
      index: 1,
      name: "",
      description: "",
      steps: [],
      connections: {},
      startstep: "",
      history: [
        {
          stepId: "",
          completedat: 0,
        },
        {
          stepId: "",
          completedat: 0,
        },
      ],
      owner: 0,
      state: ProcessState.NotStarted,
      majorsteps: [],
    };

    const templateWorkflow1: Workflow = {
      _id: "templateWorkflow1",
      index: 2,
      name: "",
      description: "",
      steps: [],
      connections: {},
      startstep: "",
      history: [],
      owner: 0,
      state: ProcessState.NotStarted,
      majorsteps: [],
    };

    const templateWorkflow2: Workflow = {
      _id: "templateWorkflow2",
      index: 3,
      name: "",
      description: "",
      steps: [],
      connections: {},
      startstep: "",
      history: [],
      owner: 0,
      state: ProcessState.NotStarted,
      majorsteps: [],
    };

    const databaseWorkflows = [
      activeWorkflow,
      templateWorkflow1,
      templateWorkflow2,
    ].map((workflow) => {
      return {
        _id: workflow._id,
        index: workflow.index,
        name: workflow.name,
        description: workflow.description,
        steps: JSON.stringify(workflow.steps),
        connections: JSON.stringify(workflow.connections),
        startstep: workflow.startstep,
        history: JSON.stringify(workflow.history),
        owner: workflow.owner,
        state: workflow.state,
        majorsteps: JSON.stringify(workflow.majorsteps),
      };
    });

    for (const workflow of databaseWorkflows) {
      await core.events.request(
        insert(connectionId, tableNames.workflows, workflow)
      );
    }

    const expectedResponse: Workflow[] = [exampleWorkflow, activeWorkflow];

    // Act
    const response = await core.events.request(getActiveWorkflows());

    // Assert
    expect(response).toStrictEqual(expectedResponse);
  });
});

describe("getWorkflowTemplates", () => {
  test("Workflow templates are returned", async () => {
    // Arrange
    const activeWorkflow: Workflow = {
      _id: "activeWorkflow",
      index: 1,
      name: "",
      description: "",
      steps: [],
      connections: {},
      startstep: "",
      history: [
        {
          stepId: "",
          completedat: 0,
        },
        {
          stepId: "",
          completedat: 0,
        },
      ],
      owner: 0,
      state: ProcessState.NotStarted,
      majorsteps: [],
    };

    const templateWorkflow1: Workflow = {
      _id: "templateWorkflow1",
      index: 2,
      name: "",
      description: "",
      steps: [],
      connections: {},
      startstep: "",
      history: [],
      owner: 0,
      state: ProcessState.NotStarted,
      majorsteps: [],
    };

    const templateWorkflow2: Workflow = {
      _id: "templateWorkflow2",
      index: 3,
      name: "",
      description: "",
      steps: [],
      connections: {},
      startstep: "",
      history: [],
      owner: 0,
      state: ProcessState.NotStarted,
      majorsteps: [],
    };

    const databaseWorkflows = [
      activeWorkflow,
      templateWorkflow1,
      templateWorkflow2,
    ].map((workflow) => {
      return {
        _id: workflow._id,
        index: workflow.index,
        name: workflow.name,
        description: workflow.description,
        steps: JSON.stringify(workflow.steps),
        connections: JSON.stringify(workflow.connections),
        startstep: workflow.startstep,
        history: JSON.stringify(workflow.history),
        owner: workflow.owner,
        state: workflow.state,
        majorsteps: JSON.stringify(workflow.majorsteps),
      };
    });

    for (const workflow of databaseWorkflows) {
      await core.events.request(
        insert(connectionId, tableNames.workflows, workflow)
      );
    }

    const expectedResponse: Workflow[] = [templateWorkflow1, templateWorkflow2];

    // Act
    const response = await core.events.request(getWorkflowTemplates());

    // Assert
    expect(response).toStrictEqual(expectedResponse);
  });
});

describe("getAutomaticStepTemplates", () => {
  test("TODO", async () => {
    // Arrange

    // Act

    // Assert
    expect(true).toBe(true);
  });
});

describe("getWorkflowProgress", () => {
  test("returns the processed major steps in readable format", async () => {
    // Arrange
    const workflowId: string = exampleWorkflow._id;
    const expectedResponse: { name: string; state: ProcessState }[] = [
      {
        name: "User creates request",
        state: ProcessState.Completed,
      },
      {
        name: "Superior accepts request",
        state: ProcessState.Pending,
      },
      {
        name: "Request send",
        state: ProcessState.NotStarted,
      },
    ];

    // Act
    const response = await core.events.request(getWorkflowProgress(workflowId));

    // Assert
    expect(response).toStrictEqual(expectedResponse);
  });

  test("returns an empty array if the workflow was not found", async () => {
    // Arrange
    const workflowId = "someOtherWorkflowId";
    const expectedResponse: { name: string; state: ProcessState }[] = [];

    // Act
    const response = await core.events.request(getWorkflowProgress(workflowId));

    // Assert
    expect(response).toStrictEqual(expectedResponse);
  });
});

describe("createUpdateWorkflow", () => {
  test("TODO", async () => {
    // Arrange

    // Act

    // Assert
    expect(true).toBe(true);
  });
});

describe("copyWorkflow", () => {
  test("TODO", async () => {
    // Arrange

    // Act

    // Assert
    expect(true).toBe(true);
  });
});
