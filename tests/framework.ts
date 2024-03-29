/// <reference types='bun-types' />
import { FastWint } from '../src/framework';

const router = new FastWint;

router
    .put('GET', '/', () => new Response('Hi'))
    .put('GET', '/id/:id', ctx => new Response(ctx.params.id))
    .build();

Bun.serve({
    fetch: router.query
});
