'use client'
import styles from "./dex.module.css"
import bulma from 'bulma/css/bulma.css'
import Image from "next/image"
import {BsArrowDownUp} from 'react-icons/bs'
import {BiSolidWalletAlt} from 'react-icons/bi'
import vendorContract from "../Helpers/enscVendorABI"
import bep20Contract from "../Helpers/bep20Token"
import erc20Contract from "../Helpers/erc20Token"
import whitelistedTokens from "../Helpers/whitelistedTokens"
import { useEffect, useState } from "react"
import Web3 from "web3"

const Dex = ( ) => {

const API = "https://api.coingecko.com/api/v3/simple/price?ids=tether&vs_currencies=ngn";
var [fee_, setFee_] = useState(0);
const [ isHidden, setIsHidden] = useState(true)
const [ isDisabled, setIsDisabled ] = useState(false)
const [web3, setWeb3] = useState("")
const [account, setAccount ] = useState("")
const [addr, setAddr ] = useState("")
const [vendorContract_, setVendorContract_] = useState()
const [ ensc_contract, setEnsc_contract ] = useState("")
const [enscBalance, setEnscBalance ] = useState("")
const usdc_contractAddress = "0x64544969ed7EBf5f083679233325356EbE738930";
const usdt_contractAddress = "0x337610d27c682E347C9cD60BD4b3b107C9d34dDd";
const [ amountIn, setAmountIn] = useState(0)
const [ amountOut, setAmountOut] = useState(0)
const [tokenInBalance_, setTokenInBalance_] = useState("")
const [tokenOutBalance_, setTokenOutBalance_] = useState("")
const [tokenOut, setTokenOut ] = useState({
      name: "ENSC Energy", ca: process.env.NEXT_PUBLIC_ENSC_CA, 
   logo: "/ensc.png", symbol: "ENSC", decimal: 18
})
const [tokenIn, setTokenIn ] = useState({
    name: "Tether USD₮", ca: usdt_contractAddress, 
   logo: "/usdt.png", symbol: "USDT", decimal: 18
})


const toggle = ( e ) => {
    e.preventDefault();
     setIsHidden(!isHidden);
     console.log(isHidden)
}

const updateTokenInBal = (bal ) => {
    setTokenInBalance_(bal)
}
const updateTokenOutBal = (bal ) => {
    setTokenOutBalance_(bal)
}
const _setTokenIn =  async ( e ) => {
	setTokenIn(e)
}

const getTokenInBal = async ( ca ) => {
    let  _contract = bep20Contract(web3, ca)
   let _tokenInBalance = await _contract.methods.balanceOf(account).call()
   let tokenInBalance = web3.utils.fromWei(`${_tokenInBalance}`, "ether");
   setTokenInBalance_(tokenInBalance)
   updateTokenInBal (tokenInBalance)
}
const updateAmountIn = async ( e ) => {
    setAmountIn(e.target.value)
}


const getTokenOutBal = async ( ca ) => {
    let  _contract = bep20Contract(web3, ca)
   let _tokenOutBalance = await _contract.methods.balanceOf(account).call()
   let tokenOutBalance = web3.utils.fromWei(`${_tokenOutBalance}`, "ether");
   setTokenOutBalance_(tokenOutBalance)
   updateTokenOutBal (tokenOutBalance)
}

const setTransaction = async ( amt ) => {
    setAmountIn(amt)
      switch (tokenIn.symbol) {
      case "USDC":
         var   rates = await fetch(API);
         var   _rate = await rates.json()
         var   rate = _rate.tether.ngn;
         var   _amountIn = parseFloat( `${amountIn}` );
		 var	 fee = _amountIn * 0.01;
             setFee_( parseFloat(fee) * parseFloat(rate))
         var  _amountOut =  (parseFloat(_amountIn) * parseFloat(rate)) - fee_;
           setAmountOut( _amountOut );
            break;
        
      case "USDT":
         var   rates = await fetch(API);
         var   _rate = await rates.json()
         var   rate = _rate.tether.ngn;
         var   _amountIn = parseFloat( `${amountIn}` );
		 var	 fee = _amountIn * 0.01;
             setFee_(  parseFloat(fee) * parseFloat(rate) )
         var  _amountOut =  (parseFloat(_amountIn) * parseFloat(rate)) - fee_;
           setAmountOut( _amountOut );
            break;

       case "ENSC": 
          var rates = await fetch(API);
          var  _rate = await rates.json()
          var  rate = _rate.tether.ngn;
          var  _amountIn = parseFloat( `${amountIn}` );
          var  fee = amountIn * 0.01;
          setFee_( parseFloat(fee) / parseFloat(rate))
          var  _amountOut = (parseFloat(_amountIn) / parseFloat(rate)) - fee_ ;
            setAmountOut( _amountOut );
                break;

        default:
            break;
    }
}


useEffect( ( ) => {
    connectWalletHandler()
    setTransaction(amountIn)
    if(account) getTokenInBal(tokenIn.ca)
    if(account) getTokenOutBal(tokenOut.ca)
    console.log(fee_)
}, [amountIn, tokenIn, account, addr, fee_])

const spinUp = ( ) => {
    if(tokenIn !== ""){
    setTokenOut(tokenIn);
    }
    if(tokenIn.name !== 'ENSC Energy'){
         _setTokenIn({name: 'ENSC Energy', ca: process.env.NEXT_PUBLIC_ENSC_CA, 
                logo: 'ENSC.png', symbol: 'ENSC', decimal: '18' })
    }else{
         _setTokenIn("")
    }
}

const swap = async ( e ) => {
    e.preventDefault();
    	  switch (tokenIn.symbol) {
		case "USDT":
			try {
			let _amountIn = web3.utils.toWei(`${Number(amountIn)}`, "ether");
			let _amountOut = web3.utils.toWei(`${Number(amountOut)}`, "ether");
            console.log(fee_)
			let txFee =  web3.utils.toWei(`${Number(fee_)}`, "ether");
			let _tokenIn = tokenIn.ca;
		   let _contract = bep20Contract(web3, _tokenIn)
		     //check if _amountOut is valid number
			 if ( _amountOut !== null ){
			//check allowance level
			let allowance = await _contract.methods.allowance(account, process.env.NEXT_PUBLIC_CA).call();
			console.log(allowance)
			if ( Number(allowance) >= _amountIn ){
                
		   let _vendorContract = vendorContract(web3)
            _vendorContract.methods.Exchange_For_ENSC ( _tokenIn, _amountIn, _amountOut, txFee ).send({
				from: account
			});
				// fetchBal()
			}else {
			//seek approval to spend amountIn from user balance
			await _contract.methods.approve(process.env.NEXT_PUBLIC_CA, _amountIn).send({
				from: account
			});
			// Vendors has been approved to spend  balance ENSC balance of onlyOwner
			//procced with exchange
			 let _vendorContract = vendorContract(web3)
            _vendorContract.methods.Exchange_For_ENSC ( _tokenIn, _amountIn, _amountOut, txFee ).send({
				from: account
			});
				// fetchBal()
		 }
		
			 }else{
				console.warn("calulating amount out.")
			 }
			} catch (error) {
				console.error(error.message);
			}
			break;
		case "ENSC" : 
		try {
			let _amountIn = web3.utils.toWei(`${Number(amountIn)}`, "ether");
			let _amountOut = web3.utils.toWei(`${Number(amountOut)}`, "ether");
			let txFee = web3.utils.toWei(`${fee_}`, "ether");
			let _tokenOut = tokenOut.ca;
            let _tokenIn = tokenIn.ca;
            if ( _tokenIn != _tokenOut ){

			 if ( _amountOut !== null ){
			//check allowance
			let allowance = await ensc_contract.methods.allowance(account,process.env.NEXT_PUBLIC_CA).call()
			console.log(allowance, "allowance")
			if(allowance >= _amountIn ){
				//proceed to swapping
			 let _vendorContract = vendorContract(web3)
            _vendorContract.methods.Exchange_From_ENSC ( _tokenOut, _amountIn, _amountOut, txFee ).send({
				from: account
			});

			//  fetchBal()
			}else{
		     //check if _amountOut is valid number
		    //seek permision to spend ENSC balance of msg.sender	
			await ensc_contract.methods.approve(process.env.NEXT_PUBLIC_CA, _amountIn).send({
				from: account
			})
			
		//vendor has permission to spend ENSC tokens 
		//Ensure vendor has permission to spend ERC20 token from  Wallet
		//so proceed
			 let _vendorContract = vendorContract(web3)
            _vendorContract.methods.Exchange_From_ENSC ( _tokenIn, _amountIn, _amountOut, txFee ).send({
				from: account
			});

			//  fetchBal()
			}
			 }else{
				console.warn("calulating amount out.")
			 }
            }else{
                console.warn("Invalid pairs")
            }
			} catch (error) {
				console.error(error.message);
			}
			break;
		default:
			break;
	  }
}

const connectWalletHandler = async ( ) => {
     if (typeof window !== 'undefined' && typeof window.ethereum !== 'undefined') {
      try {
        //requesting for wallet connection
        await window.ethereum.request({ method: 'eth_requestAccounts' })
        let _web3 = new Web3(window.ethereum)
        setWeb3(_web3)
        // choosing an account
        const accounts = await web3.eth.getAccounts()
       let Address = accounts[0];
        setAccount(Address)
        setAddr(`${Address.substring(0,5)}....${Address.slice(-5)}`);
        // initialize contracts
        setVendorContract_(vendorContract(web3))
         setEnsc_contract (bep20Contract(web3, process.env.NEXT_PUBLIC_ENSC_CA))
        //  setTokenOutBalance_(web3.utils.fromWei(_balance, "ether"))
        // event 
        window.ethereum.on('accountsChanged', async () => {
          // Time to reload your interface with accounts[0]!
          let accounts = await web3.eth.getAccounts()
         let Address = accounts[0];
          setAccount(Address)
          setAddr( `${Address.substring(0,5)}....${Address.slice(-5)}`);
        });
      }catch (e) {
        console.error(e.message)
      }
    }
}

    return ( 
    <>
    <title>ENSC DEX</title>
    <div className={styles.header}>
        <div className={styles.left}>
            <div className="logo">
              <Image src="/ENSC.png" alt=""  height={60} width={60} priority={true}/> 
            </div>
        </div>
        <div className={styles.right}>
            <div className={styles.left2}>
                {/* <ul> 
                    <li> <a href="#"> Swap </a></li>
                    <li> <a href="#"> Tokens </a></li>
                </ul> */}
            </div>
            <div className={styles.right2}>
                {addr? ( <span className="button is-primary is-dark">{addr}</span> ) 
                :
                ( <div className="button is-primary is-dark" id="connect" onClick={connectWalletHandler}>
                     Connect <BiSolidWalletAlt className="ml-2" />
                </div>)
                }   
            </div>
        </div>
    </div>
    <div className={ `${styles.container} container `}>
        <div className={`${styles.card} card`}>
            <form className={styles.form}>
                <div className={styles.data}>
                    <input type="number" id="to" className="input is-primary is-dark mr-4" disabled  placeholder={ "Amt out : " + amountOut || "Token out" }/>
                        <div className={styles.coinData}>
                            <div className={styles.bal}> Bal: <small> {tokenOutBalance_.substring(0,5)}  </small></div>
                            <div className={styles.metadata}>
                                <img id="logo1" src={tokenOut.logo} alt=""/>
                                <span><b >{tokenOut.symbol}</b> </span>
                                <span className={styles.clickable}> <i className="fa-solid fa-angle-down"></i></span>
                            </div>
                        </div>
                </div>

                <div className={styles.swap}><span className="has-text-info"><BsArrowDownUp onClick={spinUp}/></span></div>

                <div className={styles.data}>
                    <input type="text" onKeyUp={updateAmountIn} className="input is-primary is-light" placeholder={ tokenInBalance_ || "Token In" } />
                        <div className={styles.Select}>
                            <div className={styles.metadata} >
                                <button onClick={toggle} className={`${styles.btn2} button is-small is-info is-light find`} >
                                     <span > {tokenIn.name || "Select a Token"} </span><i className="fa-solid fa-angle-down ml-2"></i>
                                     </button>
                            </div>
                        </div>
                </div>
                 <div className={ `${styles.tokens } mt-2 `} style={ {display: isHidden ? "none":"block"}}>
                   { whitelistedTokens.map( ( token ) => {
                    return (
                        <div className={`${styles.token} box`} onClick={ ( () => {
                                _setTokenIn({name: token.name, ca: token.ca, 
                                logo: token.logo, symbol: token.symbol, decimal: token.decimal }
                                )
                                    })}> 
                                        <div className={styles.img}>
                                            <img src={token.logo} alt="" />
                                        </div>
                                        <div className={`${styles.name} ml-2`}>${token.symbol}</div>
                                    </div>
                                )
                            })
                        
                         }
                </div>
                <button className="button mt-3 is-primary is-fullwidth" onClick={swap}> SWAP </button>
            </form>
        </div>
    </div>
    </>
    )
}
export default Dex;