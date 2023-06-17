// @ts-nocheck

/** @type {import('./$types').PageLoad} */
export async function load({ params }) {
    const res = await fetch(`https://qctool.nrcc.cornell.edu/qc_fail?date=20230615`);
    const item = await res.json();
    let test = JSON.stringify(item)

    return { test }
}