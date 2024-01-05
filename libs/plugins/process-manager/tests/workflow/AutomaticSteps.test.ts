import path from "path";
import { Core, EventSystem } from "@intutable/core";

let core: Core;

beforeAll(async () => {
  core = await Core.create(
    [
      path.join(__dirname, "../../node_modules/@intutable/*"),
      path.join(__dirname, "../.."),
    ],
    new EventSystem(false)
  );
});

afterAll(async () => {
  core.plugins.closeAll();
});

describe("initAutomaticSteps", () => {
  test("TODO", async () => {
    // Arrange

    // Act

    // Assert
    expect(true).toBe(true);
  });
});
