'use client'
import Image from 'next/image'
import styles from '../page.module.css'
import Web3 from 'web3';
import { useState } from 'react';
import vendorContract from '../Helpers/enscVendorABI';

export default function Dex() {
    const API = "https://api.coingecko.com/api/v3/simple/price?ids=usd&vs_currencies=ngn";
    const provider = process.env.NEXT_PUBLIC_RPC_URL;
    const [ web3, setWeb3 ] = useState( new Web3( provider ) );
    const [ sender, setSender ] = useState(process.env.NEXT_PUBLIC_SENDER);
    const [ update, setUpdate ] = useState("");
    const [ nonce, setNonce ] = useState("");
    const [ gas, setGas ] = useState(2100);
    const _contract = vendorContract(web3);
    const [ contract, setContract ] =useState( _contract );

    const fetchPrices = async ( ) => {
        let request = await fetch(API);
        let response =  await request.json();
        let  _usd = response.usd;
         let rate = Number(_usd.ngn); 
          console.log(rate);
            // invoke the oracle
        oracle( rate )
    }

 const oracle = async ( _currentRate ) => {
    //onchain price of usd
   let  contract_rate = await contract.methods.USD_RATE().call();  
   console.log(contract_rate, "contract rate")
   
   setUpdate( contract.methods.updateRate( Math.round(_currentRate)).encodeABI()); 
   console.log(Math.round(_currentRate))
     //create an instance of the  tx
    let transaction = {
        from: sender,
        to: process.env.CA,
        data: update
     }

    await web3.eth.getTransactionCount(sender, 'latest').then(nonce =>{
        setNonce(nonce ) 
        console.log(nonce, "nonce")
    })
    //check gas price or txcost
    await web3.eth.estimateGas({ transaction }).then(async (gas) => {
        setGas(gas);
        console.log(gas, "gas")
    });

   if ( Math.round(Number(_currentRate)) >= Number( contract_rate )){
      let tx = {
                from: sender,
                to: process.env.NEXT_PUBLIC_CA,
                data: update,
                gas: gas,
                nonce: nonce,
                gasLimit: 100000,
                maxPriorityFeePerGas: '0x3b9aca00',
                maxFeePerGas: '0x2540be400'
      }
        
      sendTransaction ( tx )

   }else if ( _currentRate < contract_rate ){
    
      let tx = {
                from: sender,
                to: process.env.NEXT_PUBLIC_CA,
                data: update,
                gas: gas,
                nonce: nonce,
                gasLimit: 100000,
                maxPriorityFeePerGas: '0x3b9aca00',
                maxFeePerGas: '0x2540be400'
      }
        
      sendTransaction ( tx )

   }else{
    console.log("Equal rates")
   }
}

const sendTransaction = async ( _tx ) => {
    
            // Sign and send the transaction
            web3.eth.accounts.signTransaction(_tx, process.env.NEXT_PUBLIC_PRIVATE_KEY)
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

    fetchPrices()
  return (
    <main className={styles.main}>
      
    </main>
  )
}
