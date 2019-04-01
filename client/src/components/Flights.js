import React from 'react';
import { Button, Divider, Grid, Header, Form, Card, Icon, Input } from 'semantic-ui-react';
import CryptoFlight from '../contracts/CryptoFlight.json';
import CryptoFlightFactory from '../contracts/CryptoFlightFactory.json';
import AirlineFlight from './AirlineFlight';

import { cryptoFlightFactoryAddress } from '../config.js';

class Flights extends React.Component {
  state = {
    acceptedTravellers: [],
    addingFlight: false,
    balance: 0,
    bid: '',
    bidPlaced: false,
    cryptoFlightFactory: null,
    currentBid: '',
    departure: '',
    destination: '',
    finalized: '',
    finalizingFlight: false,
    flights: [],
    minBid: '0',
    removingFlight: false,
    finalizeFlight: false,
    show: '',
    showFinalizedFlights: true,
    travellers: []
  };

  componentDidMount = async () => {
    try {
      const { web3 } = this.props;
      const networkId = await web3.eth.net.getId();

      const cryptoFlightFactoryNetwork = CryptoFlightFactory.networks[networkId];

      const cryptoFlightFactory = new web3.eth.Contract(
        CryptoFlightFactory.abi,
        process.env.NODE_ENV === 'production'
          ? cryptoFlightFactoryAddress
          : cryptoFlightFactoryNetwork && cryptoFlightFactoryNetwork.address
      );

      this.setState({ web3, cryptoFlightFactory }, this.fetchFlights);
    } catch (error) {
      console.error(error);
    }
  };

  fetchFlights = async () => {
    const flightContracts = await this.state.cryptoFlightFactory.methods.getDeployedFlights().call();
    if (flightContracts) {
      const flightsPromises = flightContracts.map(async address => {
        return new Promise(async resolve => {
          const cryptoFlight = new this.state.web3.eth.Contract(CryptoFlight.abi, address);

          const {
            '0': creator,
            '1': minBid,
            '2': departure,
            '3': destination,
            '4': finalized
          } = await cryptoFlight.methods.getFlight().call();

          resolve({ address, creator: creator.toLowerCase(), minBid, departure, destination, finalized });
        });
      });
      const flights = await Promise.all(flightsPromises);

      this.setState({ flights });
    }
  };

  addFlight = async event => {
    event.preventDefault();

    const { departure, destination, minBid, cryptoFlightFactory } = this.state;
    const { account } = this.props;
    this.setState({ addingFlight: true });
    this.props.setError('');

    try {
      await cryptoFlightFactory.methods
        .createFlight(Number(minBid) || 0, departure.trim(), destination.trim())
        .send({ from: account });

      const address = await this.state.cryptoFlightFactory.methods.deployedFlights(this.state.flights.length).call();

      this.setState({
        flights: [
          ...this.state.flights,
          {
            creator: account.toLowerCase(),
            address,
            departure: departure.trim(),
            destination: destination.trim(),
            minBid: Number(minBid)
          }
        ],
        departure: '',
        destination: '',
        minBid: '0',
        addingFlight: false
      });
      this.props.setError('');
    } catch (error) {
      this.setState({ addingFlight: false });
      this.props.setError('Transaction interupted');
    }
  };

  removeFlight = async address => {
    this.setState({ removingFlight: true });
    this.props.setError('');

    try {
      const { web3, account } = this.props;
      const cryptoFlight = new web3.eth.Contract(CryptoFlight.abi, address);
      await cryptoFlight.methods.removeFlight().send({ from: account });

      const flights = this.state.flights.filter(flight => flight.address !== address);
      this.setState({ flights, removingFlight: false });
      this.props.setError('');
    } catch (error) {
      this.setState({ removingFlight: false });
      this.props.setError('Removing flight failed');
    }
  };

  finalizeFlight = async (address, seats) => {
    this.setState({ finalizeFlight: true });
    this.props.setError('');

    try {
      const { web3, account } = this.props;
      const cryptoFlight = new web3.eth.Contract(CryptoFlight.abi, address);
      await cryptoFlight.methods.finalizeFlight(seats).send({ from: account });

      const flights = this.state.flights.filter(flight => flight.address !== address);
      const thisFlight = { ...this.state.flights.find(flight => flight.address === address), finalized: true };

      this.setState({ flights: [...flights, thisFlight], finalizingFlight: false });

      this.props.setError('');
    } catch (error) {
      this.setState({ finalizingFlight: false });
      this.props.setError('Finalizing flight failed');
    }
  };

  addTraveller = async event => {
    event.preventDefault();
    this.setState({ addingTraveller: true });
    this.props.setError('');

    try {
      const { currentBid, show } = this.state;
      const { cfToken, web3, account } = this.props;

      await cfToken.methods.addTraveller(web3.utils.toWei(currentBid, 'milli'), show).send({ from: account });

      this.setState({ currentBid: '', addingTraveller: false });
      this.props.setError('');
    } catch (error) {
      this.setState({ addingTraveller: false });
      this.props.setError('Adding traveller failed');
    }
  };

  renderFlightOffers() {
    const flights = this.state.flights.filter(flight => !flight.finalized);

    if (!flights.length && !this.state.addingFlight) {
      return (
        <Header as="h3" className="info" style={{ width: '100%', marginTop: 160, textAlign: 'center' }}>
          No flights, go ahead and create one!&nbsp;
          <Icon name="arrow right" />
        </Header>
      );
    }

    return flights.map(flight => {
      if (this.state.show === flight.address) {
        const { address, minBid, creator, departure, destination } = flight;
        const { account } = this.props;

        const cryptoFlight = new this.props.web3.eth.Contract(CryptoFlight.abi, address);
        cryptoFlight.methods
          .bidPlaced(account)
          .call()
          .then(bidPlaced => this.setState({ bidPlaced }));

        return (
          <Card fluid key={flight.address}>
            <Card.Content>
              <Card.Header onClick={() => this.setState({ show: '' })} style={{ cursor: 'pointer' }}>
                {departure} - {destination}
              </Card.Header>
              <Divider />
              {this.props.account === creator ? (
                <Header as="h3" className="info">
                  You are the creator of this flight
                </Header>
              ) : this.state.bidPlaced ? (
                <Header as="h3" className="info">
                  You already placed a bid
                </Header>
              ) : !this.state.addingTraveller ? (
                <Form onSubmit={this.addTraveller}>
                  <Header as="h5">Minimum bid: {minBid} milliCFT</Header>
                  <Input
                    fluid
                    className="bid"
                    error={Number(this.state.currentBid) < minBid}
                    labelPosition="right"
                    label={`${Number(this.state.currentBid) / 1000} CFT`}
                    onChange={input => this.setState({ currentBid: input.target.value.replace(/[^0-9]/g, '') })}
                    value={this.state.currentBid}
                  />
                  <br />
                  <Button
                    color="black"
                    fluid
                    disabled={!this.state.currentBid.length || Number(this.state.currentBid) < minBid}
                  >
                    Make offer
                  </Button>
                </Form>
              ) : (
                <Header as="h3" className="info">
                  Placing your bid, hang on!
                </Header>
              )}
            </Card.Content>
          </Card>
        );
      }

      return (
        <Card
          fluid
          key={flight.address}
          onClick={() => this.setState({ currentBid: '', show: flight.address, bidPlaced: false })}
          header={`${flight.departure} - ${flight.destination}`}
        />
      );
    });
  }

  renderAirlineFlights() {
    if (this.state.finalizingFlight) {
      return (
        <Header as="h3" className="info">
          Finalizing flight...
        </Header>
      );
    }

    return this.state.flights
      .filter(
        flight =>
          this.props.account && flight.creator.toLowerCase() === this.props.account.toLowerCase() && !flight.finalized
      )
      .map(flight => {
        return (
          <AirlineFlight
            key={`airlineflight${flight.address}`}
            flight={flight}
            finalizeFlight={this.finalizeFlight}
            removeFlight={this.removeFlight.bind(this, flight.address)}
          />
        );
      });
  }

  renderFinalizedFlights() {
    return this.state.flights
      .filter(flight => flight.finalized)
      .map(flight => {
        if (this.state.finalized === flight.address) {
          const { address, departure, destination } = flight;

          const { web3 } = this.props;
          const cryptoFlight = new web3.eth.Contract(CryptoFlight.abi, address);

          cryptoFlight.methods
            .getApprovedTravellers()
            .call()
            .then(acceptedTravellers => this.setState({ acceptedTravellers, acceptedTravellersFetched: true }));

          return (
            <Card fluid key={flight.address}>
              <Card.Content>
                <Card.Header onClick={() => this.setState({ finalized: '' })} style={{ cursor: 'pointer' }}>
                  {departure} - {destination}
                </Card.Header>
                <Divider />
                {this.state.acceptedTravellersFetched ? (
                  this.state.acceptedTravellers.length ? (
                    <>
                      <Header as="h5">Accepted Travellers:</Header>
                      {this.state.acceptedTravellers.map(traveller => (
                        <p key={`traveller${traveller}`}>{traveller}</p>
                      ))}
                    </>
                  ) : (
                    <Header as="h5">No accepted travellers :(</Header>
                  )
                ) : (
                  <p>Fetching...</p>
                )}
              </Card.Content>
            </Card>
          );
        }

        return (
          <Card
            fluid
            key={flight.address}
            onClick={() => {
              this.setState({ finalized: flight.address, acceptedTravellers: [], acceptedTravellersFetched: false });
            }}
            header={`${flight.departure} - ${flight.destination}`}
          />
        );
      });
  }

  render() {
    return (
      <>
        <Grid.Row>
          <Grid.Column width={8}>
            <Header as="h3" textAlign="center">
              Travellers
            </Header>
            <Card.Group>{this.renderFlightOffers()}</Card.Group>
          </Grid.Column>
          <Grid.Column floated="right" width={8}>
            <Header as="h3" textAlign="center">
              Airlines
            </Header>
            <Card.Group>
              <Card fluid>
                <Card.Content>
                  {this.state.addingFlight ? (
                    <Header as="h3" className="info">
                      Adding flight, please wait a little :)
                    </Header>
                  ) : (
                    <>
                      <Card.Header>Add New Flight Offer</Card.Header>
                      <Divider />
                      <Form onSubmit={this.addFlight}>
                        <Form.Input
                          label="From"
                          placeholder="Stockholm"
                          onChange={input => this.setState({ departure: input.target.value })}
                          value={this.state.departure}
                        />
                        <Form.Input
                          label="To"
                          placeholder="Gothenburg"
                          onChange={input => this.setState({ destination: input.target.value })}
                          value={this.state.destination}
                        />
                        <Form.Input
                          label="Minimum Bid (in milliCFT)"
                          placeholder="10000"
                          onChange={input => this.setState({ minBid: input.target.value.replace(/[^0-9]/g, '') })}
                          value={this.state.minBid}
                        />
                        <br />
                        <Button
                          color="black"
                          fluid
                          disabled={!this.state.departure.length || !this.state.destination.length}
                        >
                          Add flight
                        </Button>
                      </Form>
                    </>
                  )}
                </Card.Content>
              </Card>
              {this.state.removingFlight ? (
                <Card fluid>
                  <Card.Content>
                    <Header as="h3" className="info">
                      Removing flight...
                    </Header>
                  </Card.Content>
                </Card>
              ) : (
                this.renderAirlineFlights()
              )}
            </Card.Group>
          </Grid.Column>
        </Grid.Row>
        <Grid.Row>
          <Grid.Column width="16">
            <Card fluid>
              <Card.Content>
                <Card.Header
                  onClick={() => this.setState({ showFinalizedFlights: !this.state.showFinalizedFlights })}
                  style={{ cursor: 'pointer' }}
                >
                  Finalized Flights{' '}
                  <Icon name={this.state.showFinalizedFlights ? 'unhide' : 'hide'} style={{ marginLeft: 12 }} />
                </Card.Header>
                {this.state.showFinalizedFlights && this.renderFinalizedFlights()}
              </Card.Content>
            </Card>
          </Grid.Column>
        </Grid.Row>
      </>
    );
  }
}

export default Flights;
