import path from "path";
import { Core, EventSystem } from "@intutable/core";
import {
  abortWorkflow,
  blockWorkflow,
  createUpdateWorkflow,
  deleteWorkflow,
  getActiveWorkflows,
  getItemsForUser,
  getAutomaticStepTemplates,
  getWorkflow,
  getWorkflowProgress,
  getWorkflowTemplates,
  registerAction,
  unblockWorkflow,
  copyWorkflow,
  activateWorkflowTemplate,
  deactivateWorkflowTemplate,
} from "../src/requests";
import { User } from "../src/types/User";
import { Workflow } from "../src/types";
import { exampleWorkflow } from "./testData/WorkflowTable";

/**
 * The API tests should only be adjusted if you know what you are doing and deliberatly wanted to change an API.
 * In most cases these tests need to stay as is to safeguard depending plugins.
 *
 * Please inform all potential users about an API change as this may effect and break other plugins.
 * Try to always provide backwards capability.
 * Sometimes its better practice to deprecate the old API and serve new API with new function names.
 */

let core: Core;
beforeAll(async () => {
  core = await Core.create(
    [
      path.join(__dirname, "../node_modules/@intutable/*"),
      path.join(__dirname, ".."),
    ],
    new EventSystem(false)
  );
});

afterAll(async () => {
  core.plugins.closeAll();
});

describe("API test", () => {
  test("abortWorkflow", async () => {
    // Arrange
    const workflowId = "someWorkflowId";
    const user: User = {
      username: "someUser",
      authCookie: "someUserCookie",
      id: 42,
      isLoggedIn: true,
    };
    const expectedResult = {
      channel: "process-manager",
      id: workflowId,
      method: "abortWorkflow",
      user: user,
    };

    // Act
    const result = abortWorkflow(workflowId, user);

    // Assert
    expect(result).toStrictEqual(expectedResult);
  });

  test("blockWorkflow", async () => {
    // Arrange
    const workflowId = "someWorkflowId";
    const user: User = {
      username: "someUser",
      authCookie: "someUserCookie",
      id: 42,
      isLoggedIn: true,
    };
    const expectedResult = {
      channel: "process-manager",
      id: workflowId,
      method: "blockWorkflow",
      user: user,
    };

    // Act
    const result = blockWorkflow(workflowId, user);

    // Assert
    expect(result).toStrictEqual(expectedResult);
  });

  test("deleteWorkflow", async () => {
    // Arrange
    const workflowId = "someWorkflowId";
    const user: User = {
      username: "someUser",
      authCookie: "someUserCookie",
      id: 42,
      isLoggedIn: true,
    };
    const expectedResult = {
      channel: "process-manager",
      id: workflowId,
      method: "deleteWorkflow",
      user: user,
    };

    // Act
    const result = deleteWorkflow(workflowId, user);

    // Assert
    expect(result).toStrictEqual(expectedResult);
  });

  test("getActiveWorkflows", async () => {
    // Arrange
    const expectedResult = {
      channel: "process-manager",
      method: "getActiveWorkflows",
    };

    // Act
    const result = getActiveWorkflows();

    // Assert
    expect(result).toStrictEqual(expectedResult);
  });

  test("getWorkflow", async () => {
    // Arrange
    const workflowId = "someWorkflowId";
    const expectedResult = {
      channel: "process-manager",
      workflowId: workflowId,
      method: "getWorkflow",
    };

    // Act
    const result = getWorkflow(workflowId);

    // Assert
    expect(result).toStrictEqual(expectedResult);
  });

  test("copyWorkflow", async () => {
    // Arrange
    const workflowId = "someWorkflowId";
    const expectedResult = {
      channel: "process-manager",
      workflowId: workflowId,
      method: "copyWorkflow",
    };

    // Act
    const result = copyWorkflow(workflowId);

    // Assert
    expect(result).toStrictEqual(expectedResult);
  });

  test("getWorkflowProgress", async () => {
    // Arrange
    const workflowId = "someWorkflowId";
    const expectedResult = {
      channel: "process-manager",
      workflowId: workflowId,
      method: "getWorkflowProgress",
    };

    // Act
    const result = getWorkflowProgress(workflowId);

    // Assert
    expect(result).toStrictEqual(expectedResult);
  });

  test("getWorkflowTemplates", async () => {
    // Arrange
    const expectedResult = {
      channel: "process-manager",
      method: "getWorkflowTemplates",
    };

    // Act
    const result = getWorkflowTemplates();

    // Assert
    expect(result).toStrictEqual(expectedResult);
  });

  test("getAutomaticStepTemplates", async () => {
    // Arrange
    const expectedResult = {
      channel: "process-manager",
      method: "getAutomaticStepTemplates",
    };

    // Act
    const result = getAutomaticStepTemplates();

    // Assert
    expect(result).toStrictEqual(expectedResult);
  });

  test("registerAction without workflowIds", async () => {
    // Arrange
    const trigger = "someTrigger";
    const user: User = {
      username: "someUser",
      authCookie: "someUserCookie",
      id: 42,
      isLoggedIn: true,
    };
    const expectedResult = {
      channel: "process-manager",
      trigger: trigger,
      method: "registerAction",
      user: user,
      workflowIds: undefined,
    };

    // Act
    const result = registerAction(trigger, user);

    // Assert
    expect(result).toStrictEqual(expectedResult);
  });

  test("registerAction with workflowIds", async () => {
    // Arrange
    const trigger = "someTrigger";
    const user: User = {
      username: "someUser",
      authCookie: "someUserCookie",
      id: 42,
      isLoggedIn: true,
    };
    const workflowIds: string[] = ["someId", "someOtherId"];
    const expectedResult = {
      channel: "process-manager",
      trigger: trigger,
      method: "registerAction",
      user: user,
      workflowIds: workflowIds,
    };

    // Act
    const result = registerAction(trigger, user, workflowIds);

    // Assert
    expect(result).toStrictEqual(expectedResult);
  });

  test("unblockWorkflow", async () => {
    // Arrange
    const workflowId = "someWorkflowId";
    const user: User = {
      username: "someUser",
      authCookie: "someUserCookie",
      id: 42,
      isLoggedIn: true,
    };
    const expectedResult = {
      channel: "process-manager",
      id: workflowId,
      method: "unblockWorkflow",
      user: user,
    };

    // Act
    const result = unblockWorkflow(workflowId, user);

    // Assert
    expect(result).toStrictEqual(expectedResult);
  });

  test("createUpdateWorkflow", async () => {
    // Arrange
    const workflow: Workflow = exampleWorkflow;
    const expectedResult = {
      channel: "process-manager",
      method: "createUpdateWorkflow",
      workflow: workflow,
    };

    // Act
    const result = createUpdateWorkflow(workflow);

    // Assert
    expect(result).toStrictEqual(expectedResult);
  });

  test("getItemsForUser", async () => {
    // Arrange
    const user: User = {
      username: "someUser",
      authCookie: "someUserCookie",
      id: 42,
      isLoggedIn: true,
    };
    const expectedResult = {
      channel: "process-manager",
      method: "getItemsForUser",
      user: user,
    };

    // Act
    const result = getItemsForUser(user);

    // Assert
    expect(result).toStrictEqual(expectedResult);
  });

  test("activateWorkflowTemplate", async () => {
    // Arrange
    const workflowId = "someWorkflowId";
    const expectedResult = {
      channel: "process-manager",
      workflowId: workflowId,
      method: "activateWorkflowTemplate",
    };

    // Act
    const result = activateWorkflowTemplate(workflowId);

    // Assert
    expect(result).toStrictEqual(expectedResult);
  });

  test("deactivateWorkflowTemplate", async () => {
    // Arrange
    const workflowId = "someWorkflowId";
    const expectedResult = {
      channel: "process-manager",
      workflowId: workflowId,
      method: "deactivateWorkflowTemplate",
    };

    // Act
    const result = deactivateWorkflowTemplate(workflowId);

    // Assert
    expect(result).toStrictEqual(expectedResult);
  });
});
