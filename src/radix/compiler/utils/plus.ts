export default (num: string, val: number): string => {
    if (val === 0) return num;

    const slices = num.split('+'), o = +slices[0];

    let total = +slices[1];
    if (isNaN(total)) total = 0;

    return isNaN(o) ? `${slices[0]}+${val + total}` : (o + val).toString();
}


