<script>
// @ts-nocheck
    import QCBoxList from '../components/QCBoxList.svelte';
    
    import DatePicker from '../components/date-picker/DatePicker.svelte'

    const zeroPad = (num, places) => String(num).padStart(places, '0')

    let currentDate = new Date();
    let currentMonth = zeroPad(currentDate.getMonth() + 1, 2);
    let currentDay = zeroPad(currentDate.getDate(), 2);
    let currentYear = zeroPad(currentDate.getFullYear(), 4);

    async function loadData() {
    console.log(`https://qctool.nrcc.cornell.edu/qc_fail?date=` + currentYear + currentMonth + currentDay)
    console.log(Date.now())
    const res = await fetch(`https://qctool.nrcc.cornell.edu/qc_fail?date=` + currentYear + currentMonth + currentDay);
    const item = await res.json();

    return { item }
}

let QCdata = loadData();

    const onDateChange = d => {
    currentDate = d.detail;
    currentMonth = zeroPad(currentDate.getMonth() + 1, 2);
    currentDay = zeroPad(currentDate.getDate(), 2);
    currentYear = zeroPad(currentDate.getFullYear(), 4);
    QCdata = loadData();
  };



  

</script>
    <h1>Welcome to SvelteKit</h1>
    <p>{currentDate.getDate() + " " + currentDate.getMonth() + " " + currentDate.getFullYear()}</p>
    <DatePicker
    on:datechange={onDateChange}
    selected={currentDate}
    isAllowed={date => {
        const millisecs = date.getTime();
        if (millisecs > Date.now()) return false;
        return true;
    }} />
    {#await QCdata}
    <p>Loading...</p>
    {:then data}
    <QCBoxList {data}/>
    {/await}
