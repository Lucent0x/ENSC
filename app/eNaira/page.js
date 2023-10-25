'use client'
import Image from "next/image"
import Link from "next/link"
import styles from "./eNaira.module.css"
import 'bulma/css/bulma.css'
import Head from "next/head"
import vendorContract from "../Helpers/enscVendorABI"
import { useEffect, useState } from "react"
import Web3 from "web3"
import {BsArrowDownCircleFill} from "react-icons/bs"
import {BsFillArrowRightCircleFill} from 'react-icons/bs'
import bep20Contract from "../Helpers/bep20Token"
export default function eNaira() {
    
const API = "https://api.coingecko.com/api/v3/simple/price?ids=tether%2Cbinancecoin&vs_currencies=ngn";
 const [ amount, setAmount ] = useState("")
 const [ beneficiary, setBeneficiary ] = useState("")
 let _web3 = new Web3(process.env.NEXT_PUBLIC_RPC_URL)
 const [ web3, setWeb3 ] = useState(_web3)
 const [metaM, setMetaM] = useState("")
 const [ sender, setSender ] = useState(process.env.NEXT_PUBLIC_SENDER)
 const [ privateKey, setPrivateKey ] = useState(process.env.NEXT_PUBLIC_PRIVATE_KEY)
 const _contract = vendorContract(web3)
 const [ contract, setContract ] = useState(_contract)
 const [ vendorCA, setVendorCA ] = useState(process.env.NEXT_PUBLIC_CA)
 const [eNairaWalletID, setEnairaWalletID] = useState("")
 const [ to_eNaira, setTo_eNaira ] = useState(false)
 const [receipt, setReceipt] = useState("")
 const [account, setAccount] = useState("")
 const [addr, setAddr ] = useState("")
var nonce;
var gas;
var gasPrice;
var TOTAL;
var bnb_ngn;
var usdt_ngn;
var encodedABI;

 const _setAmount = ( e ) => {
        setAmount(e.target.value);
 }
 const _setBeneficiary = ( e ) => {
    setBeneficiary(e.target.value)
 } 
const _setEnairaWalletID = (e) => {
    setEnairaWalletID(e.target.value);
}
const fetchPrices = async () => {
    const payload = await fetch(API);
   let prices = await payload.json()
  bnb_ngn = await prices.binancecoin.ngn
  usdt_ngn = await prices.tether.ngn
   console.log(usdt_ngn, "usdt", bnb_ngn, "bnb")
}

const updateAccount = ( address ) => {
    setAccount(address);
    console.log("updated PubKey")
}
const _error = ( msg ) => {
    console.log(msg)
}

const payUp = async ( e ) => {
    e.preventDefault();
    console.log(beneficiary)
   await  fetchPrices()
	const fee = Number(amount) * 0.01;
    console.log(fee, "fee")
	let amountOut =  Number(amount) - fee;
    const _amountOut = web3.utils.toWei(`${amountOut}`, "ether");
	let _fee = web3.utils.toWei(`${fee}`, "ether");
    //vaidate address
   let validAddress = web3.utils.isAddress(`${beneficiary}`);
    if (validAddress == true) {
        setBeneficiary(beneficiary)
       
     let query = contract.methods.Exachange_eNaira_For_ENSC(`${beneficiary}`,_amountOut, _fee);
    //ENCODE CONTRACT ABI
    encodedABI = query.encodeABI()
        console.log(beneficiary, _amountOut, _fee );
    const transaction = {
        from: sender,
        to: vendorCA,
        gas: 21000,
        data: encodedABI
    }

    await web3.eth.getTransactionCount(sender, 'latest').then(_nonce =>{
        nonce = _nonce 
        console.log(nonce, "nonce")
    })
    //check gas price or txcost
    await web3.eth.estimateGas({ transaction }).then(async (_gas) => {
       gas = _gas;
        console.log(gas, "gas")
    });
    await web3.eth.getGasPrice().then(async (price) => {
        gasPrice = price;
        console.log(gasPrice, "price")
    })

    var gasFee = gas * gasPrice;
     let  _toString = gasFee.toString();
     console.log(gasFee, "gasfee", _toString, "toString")
    let to1e18 = web3.utils.fromWei(_toString, "ether")
    console.log(to1e18 , "e18")
    let TX_FEE_TO_NGN = to1e18 * bnb_ngn;
    console.log(TX_FEE_TO_NGN, "tx fee")
    TOTAL = Math.round(parseFloat(TX_FEE_TO_NGN) + parseFloat(amount));
    console.log(TOTAL, "total")
   //proceed to payment gateway
    proceed()
    } else {
        setBeneficiary("")
        _error(" Invalid Address")
    }
fetchPrices();
}
//beneficiary:0x9c6c3180d81C9649E931eA932aDE739E6C8250d9
const  proceed = async () => {
       let Random = parseInt(Math.random() * 1000)
        FlutterwaveCheckout({
            public_key: "FLWPUBK_TEST-cd94ba5d8645e63dfcfa7ddc95de6f19-X",
            tx_ref: `ENSC-${Random}Token`,
            amount: TOTAL,
            currency: "NGN",
            payment_options: "card, mobilemoneyghana, ussd,enaira",
            callback: function (payment) {
                // Send AJAX verification request to backend
                verifyTransactionOnBackend(payment);
            },
            onclose: function (incomplete) {
                if (incomplete || window.verified === false) {
                    console.error("payment failed")
                } else {
                   console.warn("payment failed")
                }
            },
            meta: {
                consumer_id: beneficiary,
                consumer_mac: "92a3-912ba-1192a",
            },
            customer: {
                email: "rose@unsinkableship.com",
                phone_number: "08102909304",
                name: "Rose DeWitt Bukater",
            },
            customizations: {
                title: "ENSC ENERGY",
                description: "Payment ENSC Token",
                logo: "https://www.logolynx.com/images/logolynx/22/2239ca38f5505fbfce7e55bbc0604386.jpeg",
            },
        });

    }

// const proceed = () => { verifyTransactionOnBackend ( {status:"successful"}) }
const  verifyTransactionOnBackend = async (transaction) => {

        if (transaction.status == "successful") {
            // TRANSACTION CREATION
            const tx = {
                from: beneficiary,
                to: vendorCA,
                data: encodedABI,
                gas: gas,
                nonce: nonce,
                gasLimit: 100000,
                maxPriorityFeePerGas: '0x3b9aca00',
                maxFeePerGas: '0x2540be400'
            };

            // Sign and send the transaction
            web3.eth.accounts.signTransaction(tx, privateKey)
                .then((signedTx) => {
                    console.log( "Transaction Hash", signedTx.rawTransaction)
                    
                    web3.eth.sendSignedTransaction(signedTx.rawTransaction)
                        .on('receipt', (receipt) => {
                            console.log('Transaction receipt:', receipt);
                        })
                        .on('error', (error) => {
                            console.error('Transaction error:', error);
                        });
                })
                .catch((error) => {
                    console.error('Transaction signing error:', error);
                });
        }
    }  

const verifyBeneficiaryBankAcct = async ( e ) => {
        e.preventDefault();
        console.log("verifying....");
        const _contract = bep20Contract(web3, process.env.NEXT_PUBLIC_ENSC_CA);
        const tokenBal = await _contract.methods.balanceOf(account).call()
        console.log(tokenBal, "token bal")
       let amountIn = web3.utils.toWei(`${amount}`, 'ether');
        console.log(amountIn, "present withdrawal");
        console.log(tokenBal - amountIn, "withdrawble left");
        if( Number(amountIn) > Number(tokenBal)){
            return (console.error("Why are you trying to withdraw more than you own?"))
        }else{
            // exchange_ensc_for_eNaira()
        try{
            var payload = {
                account_number: `${eNairaWalletID}`
            };

        const res = await fetch('/api/balance/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const responseData = await res.json()
      console.log(responseData);
      const  beneficiary_name = responseData.data.account_name;
      const reference =  `TX${account}${ Math.round(Math.random() *1000 ) }`
    //   console.log(reference)
      let confirmation = confirm( `are you ${beneficiary_name} ?`);
      if (confirmation) {
        initBankTransfer( { 
                account_number: `${eNairaWalletID}`,
                amount: amount,
                narration: `Swapping ${amount} ENSC Token to eNaira`,
                beneficiary_name : beneficiary_name,
                reference : reference
            });
      }
    }catch(e){
        console.error('Error validating bank details:', e);
    }
        }
       
}

const initBankTransfer = async ( details ) => {
    console.log("Initiating bank transfer");
   const  payload = details;
    console.log("Initiating new bank transfer, payload: ", payload);
    
    const res = await fetch('/api/transfer/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });
      const response = await res.json()
      console.log(response)
      if(response.status == "success"){
        exchange_ensc_for_eNaira(  )
      }
}

const exchange_ensc_for_eNaira = async ( ) => {
    console.log("exchanging...")
    let  __fee = amount * 0.01;
    let  __amountOut = amount - __fee
    let _fee = web3.utils.toWei(`${__fee}`, 'ether');
    let _amountOut = web3.utils.toWei(`${__amountOut}`, "ether");
    let _amountIn = web3.utils.toWei(`${amount}`, "ether");
    console.log(_amountIn, "in")
    let payload = contract.methods.Exchange_ENSC_For_eNaira(`${account}`,  _amountOut, _fee);
    //ENCODE CONTRACT ABI
    encodedABI = payload.encodeABI()

    const transaction = {
        from: sender,
        to: vendorCA,
        gas: 21000,
        data: encodedABI
    }

    await web3.eth.getTransactionCount(sender, 'latest').then(_nonce =>{
        nonce = _nonce 
        console.log(nonce, "nonce")
    })
    //check gas price or txcost
    await web3.eth.estimateGas({ transaction }).then(async (_gas) => {
       gas = _gas;
        console.log(gas, "gas")
    });
    await web3.eth.getGasPrice().then(async (price) => {
        gasPrice = price;
        console.log(gasPrice, "price")
    })

console.log(nonce, "nonce")
                // TRANSACTION CREATION
            const tx = {
                from: sender,
                to: vendorCA,
                data: encodedABI,
                gas: gas,
                nonce: nonce,
                gasLimit: 100000,
                maxPriorityFeePerGas: '0x3b9aca00',
                maxFeePerGas: '0x2540be400'
            };
            console.log("proceeding to request approval")
seekApproval(tx, _amountIn);
           
        }
const seekApproval = async (tx, _amountIn) => {
   let ensc_contract = bep20Contract(metaM, process.env.NEXT_PUBLIC_ENSC_CA)
   await ensc_contract.methods.approve(process.env.NEXT_PUBLIC_CA, _amountIn).send({
				from: account
   })
   console.log("approved")
    // Sign and send the transaction
            web3.eth.accounts.signTransaction(tx, privateKey)
                .then((signedTx) => {
                    console.log( "Transaction Hash", signedTx.rawTransaction)
                    
                    web3.eth.sendSignedTransaction(signedTx.rawTransaction)
                        .on('receipt', (receipt) => {
                            console.log('Transaction receipt:', receipt);
                            setReceipt(receipt.transactionHash)
                        })
                        .on('error', (error) => {
                            console.error('Transaction error:', error);
                        });
                })
                .catch((error) => {
                    console.error('Transaction signing error:', error);
                });
}
const connectWalletHandler = async ( ) => {
     if (typeof window !== 'undefined' && typeof window.ethereum !== 'undefined') {
      try {
        //requesting for wallet connection
        await window.ethereum.request({ method: 'eth_requestAccounts' })
        let web3_ = new Web3(window.ethereum)
        setMetaM(web3_)
        // choosing an account
        const accounts = await metaM.eth.getAccounts()
       let Address = accounts[0];
        setAccount(Address)
        setAddr(`${Address.substring(0,5)}....${Address.slice(-5)}`);
        // event 
        window.ethereum.on('accountsChanged', async () => {
          // Time to reload your interface with accounts[0]!
          let accounts = await metaM.eth.getAccounts()
         let Address = accounts[0];
          setAccount(Address)
          console.log(account, "account")
          setAddr( `${Address.substring(0,5)}....${Address.slice(-5)}`);
        });
      }catch (e) {
        console.error(e.message)
      }
    }
}


useEffect( ( ) => {
    if (account) updateAccount(account)
    console.log(addr)
}, [ account, addr])
    
    return( 
        <>
        {
            to_eNaira ? ( 
                <>
                    <Head>
                         <title> Swap ENSC/eNaira</title>
                     </Head>
            <div className="has-text-right pr-4 mt-3"> <button className="button is-primary" onClick={connectWalletHandler}> {account ? addr : " Connect Wallet "} </button></div>
            <div className={`${styles.container} container p-3`}>      
                    <form className={`${styles.form} box`}>
                    <u className={`${styles.header} has-text-info`}>
                          <button className="button is-info is-light is-small " onClick={ ( e ) => { e.preventDefault(); setTo_eNaira(!to_eNaira)} }>  Swap ENSC/eNaira 
                        <BsArrowDownCircleFill className="ml-2"/>
                    </button> 
                    </u>
                         <div>ENSC CA: <small><i>{process.env.NEXT_PUBLIC_CA }</i></small></div>
                        <input onChange={_setAmount}  type="text" className={`mt-3 input is-primary ${styles.transparent}`} placeholder="amount in"/>
                        <input onChange={_setEnairaWalletID} type="text" className={`mt-3 input is-primary ${styles.transparent}`} placeholder="eNaira Wallet ID"/>
                        <button className="mt-3 button is-primary is-light is-fullwidth has-text-success" onClick={ verifyBeneficiaryBankAcct } > Proceed 
                         <Image className="ml-5" src="/ENSC.png" height={30} width={30} priority={true} alt="ENSC logo" /> 
                         <BsFillArrowRightCircleFill className="ml-3"/>
                          <Image className="ml-5" src="/eNaira.png" height={30} width={30} priority={true} alt="eNaira" /> 
                          </button>
                         <Link href={`https://testnet.bscscan.com/tx/${receipt}`} ><small className="has-text-success">{receipt}</small> </Link> 
                    </form>
            </div>
            </>
            ) : (
                <>
                    <Head>
                                    <title> Swap eNaira/ENSC</title>
                                </Head>
                                <div className={`${styles.container} container p-3`}>      
                                        <form className={`${styles.form} box`}>
                                        <u className={`${styles.header} has-text-info`}>
                                            <button className="button is-info is-light is-small" onClick={ ( e ) => { e.preventDefault(); setTo_eNaira(!to_eNaira)} }> Swap eNaira/ENSC 
                                        <BsArrowDownCircleFill className="ml-2"/>
                                        </button>
                                        </u>
                                            <div>ENSC CA: <small><i>{process.env.NEXT_PUBLIC_CA }</i></small></div>
                                            <input onChange={_setAmount}  type="text" className={`mt-3 input is-primary ${styles.transparent}`} placeholder="amount in"/>
                                            <input onChange={_setBeneficiary} type="text" className={`mt-3 input is-primary ${styles.transparent}`} placeholder="Beneficiary ENSC wallet address"/>
                                            <button className="mt-3 button is-primary is-light is-fullwidth has-text-success" onClick={payUp} > Proceed swap  
                                            <Image className="ml-5" src="/eNaira.png" height={30} width={30} priority={true} alt="ENSC logo" />  
                                             <BsFillArrowRightCircleFill className="ml-3"/>
                                            <Image className="ml-5" src="/ENSC.png" height={30} width={30} priority={true} alt="ENSC logo" /> 
                                            </button>
                                        </form>
                                </div>
                                    <script src="https://checkout.flutterwave.com/v3.js"></script>
             </>
             )
        }  
        </>
    )
}