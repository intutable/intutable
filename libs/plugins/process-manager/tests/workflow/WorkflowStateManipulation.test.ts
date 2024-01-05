import path from "path";
import { Core, EventSystem } from "@intutable/core";
import {
  closeConnection,
  insert,
  openConnection,
  select,
  update,
} from "@intutable/database/dist/requests";
import {
  abortWorkflow,
  blockWorkflow,
  deleteWorkflow,
  unblockWorkflow,
} from "../../src/requests";
import { Workflow, PMResponse, ProcessState, StepType } from "../../src/types";
import { User } from "../../src/types/User";
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

describe("abortWorkflow", () => {
  test("aborts workflow by id", async () => {
    // Arrange
    const workflowId: string = exampleWorkflow._id;
    const user: User = {
      username: "someUser",
      authCookie: "someUserCookie",
      id: 42,
      isLoggedIn: true,
    };
    const expectedResponse: PMResponse = {
      status: 200,
      workflow: {
        _id: "correctWorkflowId",
        index: 0,
        name: "My Workflow",
        description: "This workflow is for testing",
        steps: [
          {
            _id: "stepId1",
            name: "User creates request",
            description:
              "The request is created by the user, but needs approval by a superior.",
            type: StepType.Manual,
            trigger: "user.request",
            responsible: 42,
            state: ProcessState.Completed,
          },
          {
            _id: "stepId2",
            name: "Validate Request",
            description: "Validates the user input.",
            type: StepType.Automatic,
            trigger: "validateRequest",
            state: ProcessState.Completed,
          },
          {
            _id: "stepId3",
            name: "Superior accepts request",
            description: "The superior accepts the request.",
            type: StepType.Manual,
            trigger: "Super.accept",
            responsible: 1337,
            state: ProcessState.Aborted,
          },
          {
            _id: "stepId4",
            name: "Superior declines request",
            description: "The superior declines the request.",
            type: StepType.Manual,
            trigger: "Super.declines",
            responsible: 1337,
            state: ProcessState.Aborted,
          },
          {
            _id: "stepId5",
            name: "Request send",
            description: "The request is processed.",
            type: StepType.Automatic,
            trigger: "sendRequestEmail",
            state: ProcessState.Aborted,
          },
        ],
        connections: {
          stepId1: ["stepId2"],
          stepId2: ["stepId3", "stepId4"],
          stepId3: ["stepId5"],
        },
        startstep: "stepId1",
        history: [
          {
            stepId: "stepId1",
            completedat: 0,
          },
          {
            stepId: "stepId2",
            completedat: 0,
          },
        ],
        owner: 42,
        state: ProcessState.Aborted,
        majorsteps: ["stepId1", "stepId3", "stepId5"],
      },
    };

    // Act
    const response: PMResponse = await core.events.request(
      abortWorkflow(workflowId, user)
    );

    // Assert
    expect(response).toStrictEqual(expectedResponse);
  });

  test("workflow id did not match", async () => {
    // Arrange
    const workflowId = "someOtherWorkflowId";
    const user: User = {
      username: "someUser",
      authCookie: "someUserCookie",
      id: 42,
      isLoggedIn: true,
    };
    const expectedResponse: PMResponse = {
      status: 404,
      message: "Workflow id did not match any known workflow.",
    };

    // Act
    const response = await core.events.request(abortWorkflow(workflowId, user));

    // Assert
    expect(response).toStrictEqual(expectedResponse);
  });

  test("user id did not match", async () => {
    // Arrange
    const workflowId: string = exampleWorkflow._id;
    const user: User = {
      username: "someUser",
      authCookie: "someUserCookie",
      id: 1337,
      isLoggedIn: true,
    };
    const expectedResponse: PMResponse = {
      status: 403,
      message: "Provided user is not the owner of the workflow.",
    };

    // Act
    const response = await core.events.request(abortWorkflow(workflowId, user));

    // Assert
    expect(response).toStrictEqual(expectedResponse);
  });

  test("workflow was already completed", async () => {
    // Arrange
    const workflowId: string = exampleWorkflow._id;
    const user: User = {
      username: "someUser",
      authCookie: "someUserCookie",
      id: 42,
      isLoggedIn: true,
    };
    const expectedResponse: PMResponse = {
      status: 422,
      message: "Workflow was already completed.",
    };

    await core.events.request(
      update(connectionId, tableNames.workflows, {
        update: {
          state: ProcessState.Completed,
        },
        condition: ["_id", workflowId],
      })
    );

    // Act
    const response = await core.events.request(abortWorkflow(workflowId, user));

    // Assert
    expect(response).toStrictEqual(expectedResponse);
  });

  test("workflow was already aborted", async () => {
    // Arrange
    const workflowId: string = exampleWorkflow._id;
    const user: User = {
      username: "someUser",
      authCookie: "someUserCookie",
      id: 42,
      isLoggedIn: true,
    };
    const expectedResponse: PMResponse = {
      status: 422,
      message: "Workflow was already aborted.",
    };

    await core.events.request(
      update(connectionId, tableNames.workflows, {
        update: {
          state: ProcessState.Aborted,
        },
        condition: ["_id", workflowId],
      })
    );

    // Act
    const response = await core.events.request(abortWorkflow(workflowId, user));

    // Assert
    expect(response).toStrictEqual(expectedResponse);
  });
});

describe("blockWorkflow", () => {
  test("block workflow by id", async () => {
    // Arrange
    const workflowId: string = exampleWorkflow._id;
    const user: User = {
      username: "someUser",
      authCookie: "someUserCookie",
      id: 42,
      isLoggedIn: true,
    };
    const expectedResponse: PMResponse = {
      status: 200,
      workflow: {
        _id: "correctWorkflowId",
        index: 0,
        name: "My Workflow",
        description: "This workflow is for testing",
        steps: [
          {
            _id: "stepId1",
            name: "User creates request",
            description:
              "The request is created by the user, but needs approval by a superior.",
            type: StepType.Manual,
            trigger: "user.request",
            responsible: 42,
            state: ProcessState.Completed,
          },
          {
            _id: "stepId2",
            name: "Validate Request",
            description: "Validates the user input.",
            type: StepType.Automatic,
            trigger: "validateRequest",
            state: ProcessState.Completed,
          },
          {
            _id: "stepId3",
            name: "Superior accepts request",
            description: "The superior accepts the request.",
            type: StepType.Manual,
            trigger: "Super.accept",
            responsible: 1337,
            state: ProcessState.Blocked,
          },
          {
            _id: "stepId4",
            name: "Superior declines request",
            description: "The superior declines the request.",
            type: StepType.Manual,
            trigger: "Super.declines",
            responsible: 1337,
            state: ProcessState.Blocked,
          },
          {
            _id: "stepId5",
            name: "Request send",
            description: "The request is processed.",
            type: StepType.Automatic,
            trigger: "sendRequestEmail",
            state: ProcessState.NotStarted,
          },
        ],
        connections: {
          stepId1: ["stepId2"],
          stepId2: ["stepId3", "stepId4"],
          stepId3: ["stepId5"],
        },
        startstep: "stepId1",
        history: [
          {
            stepId: "stepId1",
            completedat: 0,
          },
          {
            stepId: "stepId2",
            completedat: 0,
          },
        ],
        owner: 42,
        state: ProcessState.Blocked,
        majorsteps: ["stepId1", "stepId3", "stepId5"],
      },
    };

    // Act
    const response = await core.events.request(blockWorkflow(workflowId, user));

    // Assert
    expect(response).toStrictEqual(expectedResponse);
  });

  test("workflow id did not match", async () => {
    // Arrange
    const workflowId = "someOtherWorkflowId";
    const user: User = {
      username: "someUser",
      authCookie: "someUserCookie",
      id: 42,
      isLoggedIn: true,
    };
    const expectedResponse: PMResponse = {
      status: 404,
      message: "Workflow id did not match any known workflow.",
    };

    // Act
    const response = await core.events.request(blockWorkflow(workflowId, user));

    // Assert
    expect(response).toStrictEqual(expectedResponse);
  });

  test("user id did not match", async () => {
    // Arrange
    const workflowId: string = exampleWorkflow._id;
    const user: User = {
      username: "someUser",
      authCookie: "someUserCookie",
      id: 1337,
      isLoggedIn: true,
    };
    const expectedResponse: PMResponse = {
      status: 403,
      message: "Provided user is not the owner of the workflow.",
    };

    // Act
    const response = await core.events.request(blockWorkflow(workflowId, user));

    // Assert
    expect(response).toStrictEqual(expectedResponse);
  });

  test("workflow was already completed", async () => {
    // Arrange
    const workflowId: string = exampleWorkflow._id;
    const user: User = {
      username: "someUser",
      authCookie: "someUserCookie",
      id: 42,
      isLoggedIn: true,
    };
    const expectedResponse: PMResponse = {
      status: 422,
      message: "Workflow was already completed.",
    };

    await core.events.request(
      update(connectionId, tableNames.workflows, {
        update: {
          state: ProcessState.Completed,
        },
        condition: ["_id", workflowId],
      })
    );

    // Act
    const response = await core.events.request(blockWorkflow(workflowId, user));

    // Assert
    expect(response).toStrictEqual(expectedResponse);
  });

  test("workflow was already aborted", async () => {
    // Arrange
    const workflowId: string = exampleWorkflow._id;
    const user: User = {
      username: "someUser",
      authCookie: "someUserCookie",
      id: 42,
      isLoggedIn: true,
    };
    const expectedResponse: PMResponse = {
      status: 422,
      message: "Workflow was already aborted.",
    };

    await core.events.request(
      update(connectionId, tableNames.workflows, {
        update: {
          state: ProcessState.Aborted,
        },
        condition: ["_id", workflowId],
      })
    );

    // Act
    const response = await core.events.request(blockWorkflow(workflowId, user));

    // Assert
    expect(response).toStrictEqual(expectedResponse);
  });

  test("workflow was already blocked", async () => {
    // Arrange
    const workflowId: string = exampleWorkflow._id;
    const user: User = {
      username: "someUser",
      authCookie: "someUserCookie",
      id: 42,
      isLoggedIn: true,
    };
    const expectedResponse: PMResponse = {
      status: 422,
      message: "Workflow was already blocked.",
    };

    await core.events.request(
      update(connectionId, tableNames.workflows, {
        update: {
          state: ProcessState.Blocked,
        },
        condition: ["_id", workflowId],
      })
    );

    // Act
    const response = await core.events.request(blockWorkflow(workflowId, user));

    // Assert
    expect(response).toStrictEqual(expectedResponse);
  });
});

describe("deleteWorkflow", () => {
  test("deletes workflow by id", async () => {
    // Arrange
    const workflowId: string = exampleWorkflow._id;
    const user: User = {
      username: "someUser",
      authCookie: "someUserCookie",
      id: 42,
      isLoggedIn: true,
    };
    const expectedResponse: PMResponse = {
      status: 200,
    };
    let workflows: Workflow[] = await core.events.request(
      select(connectionId, tableNames.workflows)
    );
    const countBeforeDelete: number = workflows.length;

    // Act
    const response: PMResponse = await core.events.request(
      deleteWorkflow(workflowId, user)
    );

    // Assert
    expect(response).toStrictEqual(expectedResponse);

    workflows = await core.events.request(
      select(connectionId, tableNames.workflows)
    );
    expect(workflows.length).toBe(countBeforeDelete - 1);
  });

  test("workflow id did not match", async () => {
    // Arrange
    const workflowId = "someOtherWorkflowId";
    const user: User = {
      username: "someUser",
      authCookie: "someUserCookie",
      id: 42,
      isLoggedIn: true,
    };
    const expectedResponse: PMResponse = {
      status: 404,
      message: "Workflow id did not match any known workflow.",
    };
    let workflows: Workflow[] = await core.events.request(
      select(connectionId, tableNames.workflows)
    );
    const countBeforeDelete: number = workflows.length;

    // Act
    const response: PMResponse = await core.events.request(
      deleteWorkflow(workflowId, user)
    );

    // Assert
    expect(response).toStrictEqual(expectedResponse);

    workflows = await core.events.request(
      select(connectionId, tableNames.workflows)
    );
    expect(workflows.length).toBe(countBeforeDelete);
  });

  test("user id did not match", async () => {
    // Arrange
    const workflowId: string = exampleWorkflow._id;
    const user: User = {
      username: "someUser",
      authCookie: "someUserCookie",
      id: 1337,
      isLoggedIn: true,
    };
    const expectedResponse: PMResponse = {
      status: 403,
      message: "Provided user is not the owner of the workflow.",
    };
    let workflows: Workflow[] = await core.events.request(
      select(connectionId, tableNames.workflows)
    );
    const countBeforeDelete: number = workflows.length;

    // Act
    const response: PMResponse = await core.events.request(
      deleteWorkflow(workflowId, user)
    );

    // Assert
    expect(response).toStrictEqual(expectedResponse);

    workflows = await core.events.request(
      select(connectionId, tableNames.workflows)
    );
    expect(workflows.length).toBe(countBeforeDelete);
  });
});

describe("unblockWorkflow", () => {
  test("unblocks workflow by id", async () => {
    // Arrange
    const workflowId: string = exampleWorkflow._id;
    const user: User = {
      username: "someUser",
      authCookie: "someUserCookie",
      id: 42,
      isLoggedIn: true,
    };
    const expectedResponse: PMResponse = {
      status: 200,
      workflow: {
        _id: "correctWorkflowId",
        index: 0,
        name: "My Workflow",
        description: "This workflow is for testing",
        steps: [
          {
            _id: "stepId1",
            name: "User creates request",
            description:
              "The request is created by the user, but needs approval by a superior.",
            type: StepType.Manual,
            trigger: "user.request",
            responsible: 42,
            state: ProcessState.Completed,
          },
          {
            _id: "stepId2",
            name: "Validate Request",
            description: "Validates the user input.",
            type: StepType.Automatic,
            trigger: "validateRequest",
            state: ProcessState.Completed,
          },
          {
            _id: "stepId3",
            name: "Superior accepts request",
            description: "The superior accepts the request.",
            type: StepType.Manual,
            trigger: "Super.accept",
            responsible: 1337,
            state: ProcessState.Pending,
          },
          {
            _id: "stepId4",
            name: "Superior declines request",
            description: "The superior declines the request.",
            type: StepType.Manual,
            trigger: "Super.declines",
            responsible: 1337,
            state: ProcessState.Pending,
          },
          {
            _id: "stepId5",
            name: "Request send",
            description: "The request is processed.",
            type: StepType.Automatic,
            trigger: "sendRequestEmail",
            state: ProcessState.NotStarted,
          },
        ],
        connections: {
          stepId1: ["stepId2"],
          stepId2: ["stepId3", "stepId4"],
          stepId3: ["stepId5"],
        },
        startstep: "stepId1",
        history: [
          {
            stepId: "stepId1",
            completedat: 0,
          },
          {
            stepId: "stepId2",
            completedat: 0,
          },
        ],
        owner: 42,
        state: ProcessState.Pending,
        majorsteps: ["stepId1", "stepId3", "stepId5"],
      },
    };
    await core.events.request(blockWorkflow(workflowId, user));

    // Act
    const response: PMResponse = await core.events.request(
      unblockWorkflow(workflowId, user)
    );

    // Assert
    expect(response).toStrictEqual(expectedResponse);
  });

  test("workflow id did not match", async () => {
    // Arrange
    const workflowId = "someOtherWorkflowId";
    const user: User = {
      username: "someUser",
      authCookie: "someUserCookie",
      id: 42,
      isLoggedIn: true,
    };
    const expectedResponse: PMResponse = {
      status: 404,
      message: "Workflow id did not match any known workflow.",
    };

    // Act
    const response = await core.events.request(
      unblockWorkflow(workflowId, user)
    );

    // Assert
    expect(response).toStrictEqual(expectedResponse);
  });

  test("user id did not match", async () => {
    // Arrange
    const workflowId: string = exampleWorkflow._id;
    const user: User = {
      username: "someUser",
      authCookie: "someUserCookie",
      id: 1337,
      isLoggedIn: true,
    };
    const expectedResponse: PMResponse = {
      status: 403,
      message: "Provided user is not the owner of the workflow.",
    };

    // Act
    const response = await core.events.request(
      unblockWorkflow(workflowId, user)
    );

    // Assert
    expect(response).toStrictEqual(expectedResponse);
  });

  test("workflow is not blocked", async () => {
    // Arrange
    const workflowId: string = exampleWorkflow._id;
    const user: User = {
      username: "someUser",
      authCookie: "someUserCookie",
      id: 42,
      isLoggedIn: true,
    };
    const expectedResponse: PMResponse = {
      status: 422,
      message: "Workflow is not blocked.",
    };

    // Act
    const response = await core.events.request(
      unblockWorkflow(workflowId, user)
    );

    // Assert
    expect(response).toStrictEqual(expectedResponse);
  });
});
