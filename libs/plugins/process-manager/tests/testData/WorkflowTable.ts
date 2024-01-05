import { Workflow, ProcessState, StepType } from "../../src/types";

export const exampleWorkflow: Workflow = {
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
};
