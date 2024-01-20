# Testing

## Philosophy

> **TL;DR**: We use [TDD](https://en.wikipedia.org/wiki/Test-driven_development) as a rule of thumb – but not as a dogma.

In general, we want to obtain a high test coverage and test as much code as possible. In the past, we have seen that this is a good way to avoid errors and ensure that the code works as expected. We have often found ourselves in a situation where we were haunted by errors and had to spend a lot of time trying to find the cause. In most cases, we could have prevented this by writing tests.

We adhere to [Test Driven Development (TDD)](https://en.wikipedia.org/wiki/Test-driven_development). TDD is a software development process that relies on the repetition of a very short development cycle:
1. First write an (initially failing) automated test case that defines a desired improvement or new function, even before actual code was written.
2. Then produce the minimum amount of code to pass that test – and only enough to pass the test.
3. Finally refactor the new code to acceptable standards.

You can read more about this technique in articles spread all over the internet. Nevertheless, we want you to take note of multiple justified objections against this approach. Again, you can read more about this debate on the internet.

Last, you need to know that we apply this philosophy in our projects only as a general rule of thumb. It should not become a dogma, strictly followed in every situation. Every developer should internalize this as a personal practice and know when to use it to their advantage and when not to.

Moreover, not every project is the same. Some projects are more suitable for TDD than others or need other testing approaches or techniques. In the next sections we will discuss the different testing techniques we use in our projects.

## Testing Techniques

Before diving deep into an academical discussion about software engineering, we just want to give you a brief overview of how you should utilize the different testing techniques in this project. You can find orientation in existing testing files.

### E2E & Component Tests (frontend exclusive)

[Cypress](https://www.cypress.io) is a great tool for end-to-end and component testing. Open Chrome and run `cd apps/intutable-ui && npx cypress open` to see our testing suite.

These tests take some time to initially implement. However, they are a highly effective way to ensure that the frontend works as expected.

### Unit Tests

[Jest](https://jestjs.io) should be your swiss army knife when it comes to testing.

Each piece of code should be unit-tested, as long as it 1. can be effectively tested and 2. no better testing technique is available. This applies to both frontend and backend code. Always test new code you write. If you change existing code, you should also test it.

### Integration Tests

For our backend APIs, use [SuperTest](https://www.npmjs.com/package/supertest).

Core-handlers do NOT need to be unit-tested. Instead, their functionality, desired API behavior as well as the database operations they perform should be tested in integration tests. This is because core-handlers are often very complex and it is difficult to test them in isolation. Moreover, integration-testing these implicitly covers more code than unit-testing could do – otherwise a lot of code would have to be mocked and explicitly tested.