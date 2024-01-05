# How to create a new plugin

In your `plugin.ts` file:

```typescript
export class MyPlugin extends Intutable {

    constructor() {
        super()
    }

    async init() {
        // do stuff
    }

} 
```

Make sure to re-export this from your `index.ts` file.