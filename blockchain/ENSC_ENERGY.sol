//SPDX-License-Identifier: MIT

pragma solidity ^0.8.17;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";

contract ENSC_ENERGY is ERC20  {
    address payable owner;
    address payable public Seed;
    address payable public Private;
    address public Public;
    address public Liquidity;
    address payable public Treasury;
    address payable public Team_Advisor;
    uint256 onePercent;
    uint256 twoPercent;
    uint256 tenPercent;
    uint256 eightyFivePercent;
    uint256 InitialTotalSupply;
    constructor( 
         uint256 _initialTotalSupply,
         address _liquidity,
         address _private, 
         address _seed,
         address _treasury,
         address _team_advisor

           ) ERC20("ENSC ENERGY", "ENSC") {
        InitialTotalSupply = _initialTotalSupply * (10 ** decimals());

        onePercent = ( InitialTotalSupply * 1 )/100;
        twoPercent = ( InitialTotalSupply * 2 ) /100;
        tenPercent = ( InitialTotalSupply * 10 )/100;
        eightyFivePercent = ( InitialTotalSupply * 85 )/100;

        Liquidity = payable (_liquidity);
        Private = payable (_private);
        Seed = payable(_seed);
        Treasury = payable(_treasury);
        Team_Advisor = payable(_team_advisor);
        owner = payable(msg.sender);
        Public = owner;
       
        //begin allocation
        _mint(Liquidity, twoPercent);
        _mint(Private, onePercent);
        _mint(Seed, onePercent);
        _mint(Treasury, onePercent);
        _mint( Team_Advisor, tenPercent);
        //85% from the initial total supply
        _mint(Public, eightyFivePercent);
    }

    function mint( uint256 _amount ) public onlyOwner {
       uint256 increment = _amount * (10 ** decimals());
       uint256 _onePercent = ( increment * 1 )/100;
       uint256  _twoPercent = ( increment * 2 ) /100;
       uint256 _tenPercent = ( increment * 10 )/100;
       uint256 _eightyFivePercent = ( increment * 85 )/100;
        //begin allocation
        _mint(Liquidity, _twoPercent);
        _mint(Private, _onePercent);
        _mint(Seed, _onePercent);
        _mint(Treasury, _onePercent);
        _mint( Team_Advisor, _tenPercent);
        //85% from the initial amount added to the total supply
        _mint(Public, _eightyFivePercent);
       
    }

    function burn(uint256 amount) public {
        _burn(msg.sender, amount * (10 ** decimals()));
    }

    modifier onlyOwner() {
        require(
            msg.sender == owner,
            "Only this smart contract deployer only can call this function!"
        );
        _;
    }

    //fallback
    receive() external payable {}
}
