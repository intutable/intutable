import path from "path";
import { Core, EventSystem } from "@intutable/core";
import { CHANNEL, sendMail } from "../src/requests";
import { MailOptions } from "../src/types";

/**
 * The API tests should only be adjusted if you know what you are doing and deliberately wanted to change an API.
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
  test("sendMail", async () => {
    // Arrange
    const mailOptions: MailOptions = {
        to: "dean@uni-heidelberg.de",
        subject: "some subject",
        text: "email content"
    };
    const expectedResult = {
      channel: CHANNEL,
      method: "sendMail",
      mailOptions: mailOptions,
    };

    // Act
    const result = sendMail(mailOptions);

    // Assert
    expect(result).toStrictEqual(expectedResult);
  });
});
