const axios = require('axios');

    export default async function handler(req, res) {
         const accountNumber  = req.body.account_number;
         const amount = req.body.amount;
         const narration = req.body.narration;
         const beneficiary_name = req.body.beneficiary_name;
         const reference = req.body.reference;
        const FLUTTERWAVE_SECRET_KEY = process.env.NEXT_PUBLIC_FLW_SECRET_KEY; // Replace with your Flutterwave secret key
        const ENAIRA_BANK_CODE = '000033';
        // const accountNumber = '1317626890'; // Replace with the Enaira account number you want to retrieve details for
    try{
    const transferResponse = await axios.post(
      'https://api.flutterwave.com/v3/transfers',
      {
        account_bank: ENAIRA_BANK_CODE,
        account_number: accountNumber,
        amount: amount,
        currency: 'NGN',
        narration: narration,
        beneficiary_name: beneficiary_name,
        reference: reference,
      },
      {
        headers: {
          'Authorization': `Bearer ${FLUTTERWAVE_SECRET_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    // Check if the transfer request was successful
    if (transferResponse.status === 200) {
      res.status(200).json(transferResponse.data);
    } else {
      res.status(500).json({ error: 'An error occurred while processing the transfer request.' });
    }

 } catch (error) {
    res.status(500).json({ error: 'An error occurred while processing your request.' });
  }
}