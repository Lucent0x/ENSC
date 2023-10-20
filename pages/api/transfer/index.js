import Flutterwave from 'flutterwave-node-v3';


export default async function handler(req, res) {

    const flw = new Flutterwave(process.env.NEXT_PUBLIC_FLW_PUBLIC_KEY, process.env.NEXT_PUBLIC_FLW_SECRET_KEY);
    const { walletID, amount, narration, Confirmed } = req.body;
    
    const  GTB_Code = "058";
    const myGTB = "0542897781";
      try {
        const details = {
                account_bank: GTB_Code,
                account_number: walletID,
                amount: amount,
                narration: narration,
                currency: "NGN"
            };
            flw.Transfer.initiate(details)
                .then(response => {
                    res.status(200).json(response);
                })
                } catch (error) {
                    res.status(500).json({ error: "error initiating bank transfer."});
                }
}


