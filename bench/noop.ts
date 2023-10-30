export default (bench: any, t: number = 20) => {
    while (t-- > 0) bench('noop', () => { });
}
