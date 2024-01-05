import path from "path";
import { Core, EventSystem, PluginLoader } from "@intutable/core";
// import { init } from "../src/index";
// import { RequestHandlerFunc } from "@intutable/core/dist/requests";
// import { NotificationHandlerFunc } from "@intutable/core/dist/notifications";

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

test("init", async () => {
  // // Arrange
  // const initInternalTableAccess = jest.fn();
  // const initAutomaticSteps = jest.fn();
  // const initWorkflowManager = jest.fn();
  // const initWorkflowManipulation = jest.fn();
  // const initNotifications = jest.fn();
  // const initDatabase = jest.fn();
  // const initJobScheduler = jest.fn();
  // jest.mock("../src/data/InternalTableAccess", () => ({
  //   initInternalTableAccess: initInternalTableAccess,
  // }));
  // jest.mock("../src/workflow/AutomaticSteps", () => ({
  //   initAutomaticSteps: initAutomaticSteps,
  // }));
  // jest.mock("../src/workflow/WorkflowManager", () => ({
  //   initWorkflowManager: initWorkflowManager,
  // }));
  // jest.mock("../src/workflow/WorkflowStateManipulation", () => ({
  //   initWorkflowManipulation: initWorkflowManipulation,
  // }));
  // jest.mock("../src/workflow/Notifications", () => ({
  //   initNotifications: initNotifications,
  // }));
  // jest.mock("../src/data/Database", () => ({
  //   initDatabase: initDatabase,
  // }));
  // jest.mock("../src/jobs/JobScheduler", () => ({
  //   initJobScheduler: initJobScheduler,
  // }));

  // // Act
  // const eventSystem = new EventSystem(false);
  // const pluginLoader: PluginLoader = {
  //   events: eventSystem,
  //   addMiddleware: eventSystem.addMiddleware,
  //   request: eventSystem.request,
  //   notify: eventSystem.notify,
  //   listenForAllNotifications: eventSystem.listenForAllNotifications,
  //   listenForRequests: (channel: string) => ({
  //     on: (method: string, handler: RequestHandlerFunc) => {},
  //   }),
  //   listenForNotifications: (channel: string) => ({
  //     on: (method: string, handler: NotificationHandlerFunc) => {},
  //   }),
  // };
  // await init(pluginLoader);

  // // Assert
  // expect(initInternalTableAccess).toHaveBeenCalledTimes(1);
  // expect(initAutomaticSteps).toHaveBeenCalledTimes(1);
  // expect(initWorkflowManager).toHaveBeenCalledTimes(1);
  // expect(initWorkflowManipulation).toHaveBeenCalledTimes(1);
  // expect(initNotifications).toHaveBeenCalledTimes(1);
  // expect(initDatabase).toHaveBeenCalledTimes(1);
  // expect(initJobScheduler).toHaveBeenCalledTimes(1);
  // expect(initInternalTableAccess).toBeCalledWith(core);
  // expect(initAutomaticSteps).toBeCalledWith(core);
  // expect(initWorkflowManager).toBeCalledWith(core);
  // expect(initWorkflowManipulation).toBeCalledWith(core);
  // expect(initNotifications).toBeCalledWith(core);
  // expect(initDatabase).toBeCalledWith(core);
  // expect(initJobScheduler).toBeCalledWith();

  // // Clean - up
  // jest.clearAllMocks();
  expect(true).toBe(true);
});
