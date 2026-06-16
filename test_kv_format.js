async function test() {
  try {
    // Try query params
    const res1 = await fetch('https://keyvalue.immanuel.co/api/KeyVal/UpdateValue?appKey=320n85kh&key=test_key&value=hello', {method: 'POST'});
    console.log('Query param status:', res1.status, await res1.text());
  } catch (e) {
    console.log('Query param failed:', e.message);
  }

  try {
    // Try post body (urlencoded)
    const res2 = await fetch('https://keyvalue.immanuel.co/api/KeyVal/UpdateValue', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: 'appKey=320n85kh&key=test_key&value=hello'
    });
    console.log('Body urlencoded status:', res2.status, await res2.text());
  } catch (e) {
    console.log('Body urlencoded failed:', e.message);
  }

  try {
    // Try post body (json)
    const res3 = await fetch('https://keyvalue.immanuel.co/api/KeyVal/UpdateValue', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ appKey: '320n85kh', key: 'test_key', value: 'hello' })
    });
    console.log('Body JSON status:', res3.status, await res3.text());
  } catch (e) {
    console.log('Body JSON failed:', e.message);
  }
}
test();
