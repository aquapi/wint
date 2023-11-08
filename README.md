# Wint
Wint is a collection of high performance, heavily optimized 
URL routers for building web frameworks and applications.

Wint is compatible for every runtime that does support the `Function` constructor such as Bun, Node or Deno.

## Features
All routers support wildcard and URL parameters matching.

## API
Routers have three common methods.
```ts
/**
 * Add a route handler.
 */
put(method: string, path: string, handler: T): this;

/**
 * Find the matching item. Use after calling the `build` function.
 */
find(c: Context): T | null;

/**
 * Build the `find` function for the router.
 */
build(): this;
```

The `build` function must be called before calling `find`.

## Routers
Currently two routers are supported.

### Basic router
This router matches the URL with a radix tree.

The difference between this and other radix tree routers
such as `radix3` and `@medley/router` is that the matcher 
is compiled ahead of time, which brings a performance advantage.

```ts
import Wint from 'wint-js';

// Create and add routes
const wint = new Wint<() => string>()
    .put('GET', '/', () => 'Hi')
    .put('POST', '/json', () => '{}')
    .put('ALL', '/', () => 'Not found')
    .build();

// This is designed to be compatible with the `Request` object
wint.find({
    method: 'POST',
    path: 'json' // Path should slice the first slash character
}); // () => '{}'
```

### Turbo router
Turbo router matches much faster than basic router but does not support `ALL` method handler.

```ts
import Wint from 'wint-js/turbo';

// Create and add routes
const wint = new Wint<() => string>()
    .put('GET', '/', () => 'Hi')
    .put('POST', '/json', () => '{}')
    .build();

// This is designed to be compatible with the `Request` object
wint.find({
    method: 'POST',
    url: 'http://localhost:3000/json',
    _pathStart: 'http://localhost:3000'.length,
    // Can leave as -1 because query is not presented
    _pathEnd: -1
}); // () => '{}'
```
