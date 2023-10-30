export default [
    ['/1234567890/1234567890', {
        GET: { f: () => 'Hi' }
    }],
    ['/id/:id', {
        GET: { f: () => 'ID' }
    }],
    ['/json', {
        POST: { f: () => '{}' }
    }]
] as [string, Record<string, { f: () => string }>][];
