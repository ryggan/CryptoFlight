pragma solidity >=0.5.0 <0.6.0;

import "./CryptoFlight.sol";

contract CryptoFlightFactory {
    CryptoFlight[] public deployedFlights;
    address payable cfToken;

    constructor(address payable _cfToken) public {
        cfToken = _cfToken;
    }

    function createFlight(uint256 minimumBid, string memory departure, string memory destination) public {
        CryptoFlight flight = new CryptoFlight(minimumBid, departure, destination, msg.sender, cfToken);
        deployedFlights.push(flight);
    }

    function getDeployedFlights() public view returns (CryptoFlight[] memory) {
        return deployedFlights;
    }
}