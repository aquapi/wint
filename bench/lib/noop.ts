export default (bench: any, t: number = 30) => {
    while (t-- > 0) bench('noop', () => { });
}
