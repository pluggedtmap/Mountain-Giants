// No need for node-fetch in Node 25

async function testMinOrder() {
    const url = 'http://localhost:3018/api/orders';
    
    const dummyOrder = {
        items: [{ id: 1, name: 'Test Product', price: 10, quantity: 1, weight: '10g' }],
        total: 10,
        shippingMethod: 'meetup',
        paymentMethod: 'cash',
        userInfo: { pseudo: 'TestUser' },
        rawMessage: 'Test Order'
    };

    console.log("Testing order with 10€ (should fail)...");
    let resp = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dummyOrder)
    });
    let data = await resp.json();
    console.log("Status:", resp.status);
    console.log("Result:", data);

    if (resp.status === 400 && data.message.includes('Minimum')) {
        console.log("✅ Success: Small order rejected.");
    } else {
        console.log("❌ Failure: Small order not rejected correctly.");
    }

    console.log("\nTesting order with 110€ (should pass)...");
    dummyOrder.items[0].price = 110;
    dummyOrder.total = 110;
    resp = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dummyOrder)
    });
    data = await resp.json();
    console.log("Status:", resp.status);
    console.log("Result:", data);

    if (resp.status === 200 || resp.status === 201) {
        console.log("✅ Success: Large order accepted.");
    } else {
        console.log("❌ Failure: Large order rejected.");
    }
}

testMinOrder();
