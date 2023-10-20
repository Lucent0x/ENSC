'use client'
import styles from '../Dex/dex.module.css'
import whitelistedTokens from './whitelistedTokens';
const Token = ( token ) =>{
  
const setData = ( e ) => {
    console.log(e, "hmm")
}
    return ( 
        whitelistedTokens.map( ( token, index) => {
            return (
                 <div className={`${styles.token} box`} onClick={ ( () => {
                         setData({name: token.name, ca: token.ca, 
                           logo: token.logo, symbol: token.symbol, decimal: token.decimal }
                           )
                            })}> 
                                <div className={styles.img}>
                                    <img src={token.logo} alt="" />
                                </div>
                                <div className={`${name} ml-2`}>${token.symbol}</div>
                            </div>
            )
        })
    )
}

export default Token;