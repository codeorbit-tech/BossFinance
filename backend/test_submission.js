async function testSubmit() {
  try {
    // 1. Login
    const loginRes = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'ramesh', password: 'employee123' })
    });
    const loginData = await loginRes.json();
    if (!loginRes.ok) throw new Error(JSON.stringify(loginData));
    
    const token = loginData.token;
    console.log('Login successful');

    // 2. Create Customer
    const custRes = await fetch('http://localhost:5000/api/customers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        name: 'John A. Doe',
        phone: '9876543210',
        email: 'john.doe@example.com',
        address: '123 Elm St, Near Park, Mumbai, Mumbai City, MH - 400001',
        aadhaar: '111122223333',
        pan: 'ABCDE1234F',
        dateOfBirth: '1985-05-15',
        occupation: 'Software Engineer'
      })
    });
    const custData = await custRes.json();
    if (!custRes.ok) throw new Error(JSON.stringify(custData));
    console.log('Customer created', custData.customer.id);

    // 3. Create Loan
    const loanRes = await fetch('http://localhost:5000/api/loans', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        customerId: custData.customer.id,
        loanType: 'VEHICLE',
        amount: 500000,
        tenure: 12,
        interestRate: 0,
        emi: 0,
        frequency: 'MONTHLY',
        purpose: 'Vehicle Purchase/Refinance',
        guarantorName: 'Michael C. Johnson',
        guarantorPhone: '9876543212'
      })
    });
    const loanData = await loanRes.json();
    if (!loanRes.ok) throw new Error(JSON.stringify(loanData));
    console.log('Loan created', loanData.loan.id);

  } catch (err) {
    console.error('ERROR OCCURRED:', err.message);
  }
}

testSubmit();
