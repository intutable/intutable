# Clean Code & Best Practices

We get to enjoy the latest standards because we use up-to-date tools and stacks. This means that we can use the latest features of JavaScript and TypeScript. Further more, we do not need to worry that much about browser compatibility, since we are only shipping to a small user base.

- adhere to the latest [ECMAScript standard](https://developer.mozilla.org/en-US/docs/Glossary/ECMAScript?retiredLocale=de)
- follow [recent TypeScript updates](https://devblogs.microsoft.com/typescript/)
- [prettier](https://prettier.io) and [eslint](https://eslint.org) are preconfigured for you – meaning you do not have to care about your code style. The only thing you need to do is to let them do their job and format your code before you commit it. This is done automatically for you by git hooks through [husky](https://typicode.github.io/husky/). Otherwise your code will not be accepted by the CI. (**Tip**: install eslint and prettier plugins in your IDE.)

Nonetheless, the most important rule: **Write code that is concsistent with existing code!** Do not introduce new patterns or styles on your own.