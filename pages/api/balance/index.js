import Flutterwave from 'flutterwave-node-v3';


export default async function handler(req, res) {

    const flw = new Flutterwave(process.env.NEXT_PUBLIC_FLW_PUBLIC_KEY, process.env.NEXT_PUBLIC_FLW_SECRET_KEY);
    let eNairaCode;
    const  GTB_Code = "058";
    const myGTB = "0542897781";

                    try {
                        const details = {
                            account_number: myGTB,
                            account_bank: eNairaCode ? eNairaCode : GTB_Code
                        };
                        flw.Misc.verify_Account(details)
                            .then(response => {
                                res.status(200).json(response)
                            });

                    } catch (error) {
                        res.status(500).json({ error: 'An error occurred while processing your request.' });
                    }
}
