const axios = require('axios');

    export default async function handler(req, res) {
         const accountNumber  = req.body.account_number;
        const FLUTTERWAVE_SECRET_KEY = process.env.NEXT_PUBLIC_FLW_SECRET_KEY; // Replace with your Flutterwave secret key
        const ENAIRA_BANK_CODE = '000033';
        // const accountNumber = '1317626890'; // Replace with the Enaira account number you want to retrieve details for
    
        try {
            const response = await axios.post(
                'https://api.flutterwave.com/v3/accounts/resolve',
                {
                    account_number: accountNumber,
                    account_bank: ENAIRA_BANK_CODE,
                },
                {
                    headers: {
                        'Authorization': `Bearer ${FLUTTERWAVE_SECRET_KEY}`,
                        'Content-Type': 'application/json',
                    },
                }
            );
              
            // Check if the request was successful
            if (response.status === 200) {
                res.status(200).json(response.data);
            } else {
                res.status(500).json({ error: "error while resolving account"});
            }
        } catch (error) {
            res.status(500).json({ error: "error while resolving account"});
        }
    }