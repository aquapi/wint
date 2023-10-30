export default (num: string, val: number): string => {
    if (val === 0) return num;

    let slices = num.split('+'),
        o = Number(slices[0]),
        total = Number(slices[1]);

    if (isNaN(total)) total = 0;

    return isNaN(o) ? slices[0] + '+' + (val + total) : (o + val).toString();
}


