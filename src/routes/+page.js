// @ts-nocheck

/** @type {import('./$types').PageLoad} */
export async function load({ params }) {
    const res = await fetch(`https://qctool.nrcc.cornell.edu/qc_fail?date=20230617`);
    const item = await res.json();

    return { item }
}