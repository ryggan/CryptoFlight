pragma solidity >=0.5.0 <0.6.0;

import './CFToken.sol';

contract CryptoFlight {
    struct Traveller {
        uint256 bid;
        address payable user;
        bool approved;
    }

    Traveller[] public travellers;

    address[] public approvedTravellers;

    mapping(address => bool) public bidPlaced;

    address payable public creator;
    uint256 public minBid;
    string public departure;
    string public destination;
    bool public finalized;

    CFToken cfToken;

    modifier auth() {
        require(msg.sender == creator);
        _;
    }

    constructor(uint256 _minBid, string memory _departure, string memory _destination, address payable _creator, address payable _cfToken) public {
        creator = _creator;
        minBid = _minBid;
        departure = _departure;
        destination =  _destination;
        CFToken _token = CFToken(_cfToken);
        cfToken = _token;
        finalized = false;
    }

    function getFlight() public view returns(address, uint256, string memory, string memory, bool) {
        return (creator, minBid, departure, destination, finalized);
    }

    function placeBid(address payable _traveller, uint256 _bid) public {
        require(msg.sender == address(cfToken));

        Traveller memory newTraveller = Traveller({
           user: _traveller,
           bid: _bid,
           approved: false
        });

        bidPlaced[_traveller] = true;
        travellers.push(newTraveller);
    }

    function removeFlight() public auth {
        for (uint16 i = 0; i < travellers.length; i++) {
            Traveller storage traveller = travellers[i];
            address payable user = traveller.user;
            cfToken.transfer(user, traveller.bid);
        }

        finalized = true;
        delete travellers;
    }

    function finalizeFlight(uint64 _seats) public auth {
        uint64 seatsFilled = 0;

        while (seatsFilled < _seats && seatsFilled < travellers.length) {
            uint256 currentHighestBid = 0;
            uint64 currentHighestId = 0;

            for (uint16 i = 0; i < travellers.length; i++) {
                if (currentHighestBid < travellers[i].bid && !travellers[i].approved) {
                    currentHighestBid = travellers[i].bid;
                    currentHighestId = i;
                }
            }

            travellers[currentHighestId].approved = true;
            approvedTravellers.push(travellers[currentHighestId].user);

            seatsFilled++;
        }

        for (uint16 i = 0; i < travellers.length; i++) {
            if (travellers[i].approved) {
                cfToken.transfer(creator, travellers[i].bid);
            } else {
                Traveller storage traveller = travellers[_seats];
                cfToken.transfer(traveller.user, travellers[i].bid);
            }
        }

        finalized = true;
    }

    function getApprovedTravellers() public view returns (address[] memory) {
        return approvedTravellers;
    }
}