import React from 'react';
import { Button, Container, Grid, Card, Header, Icon, Menu, Segment, Image, Loader } from 'semantic-ui-react';

import Flights from './components/Flights';
import CryptoFlightToken from './components/CryptoFlightToken';

import CFToken from './contracts/CFToken.json';
import getWeb3 from './utils/getWeb3';

import { cfTokenAddress } from './config.js';

class App extends React.Component {
  state = {
    account: null,
    balance: '',
    cfToken: null,
    error: '',
    web3: null
  };

  componentDidMount = async () => {
    try {
      const web3 = await getWeb3();
      const accounts = await web3.eth.getAccounts();
      const networkId = await web3.eth.net.getId();

      const cfTokenNetwork = CFToken.networks[networkId];
      const cfToken = new web3.eth.Contract(
        CFToken.abi,
        process.env.NODE_ENV === 'production' ? cfTokenAddress : cfTokenNetwork && cfTokenNetwork.address
      );

      const cfTokenCreator = await cfToken.methods.creator().call();
      const balance = await cfToken.methods.balanceOf(accounts[0]).call();

      web3.currentProvider.publicConfigStore.on('update', ({ selectedAddress: account }) => {
        this.setState({ account: account, cfTokenCreator }, this.updateBalance);
      });

      this.setState({ web3, cfToken, balance });
    } catch (err) {
      console.error(err);
    }
  };

  updateBalance = async () => {
    const balance = await this.state.cfToken.methods.balanceOf(this.state.account).call();
    this.setState({ balance });
  };

  setError = error => {
    this.setState({ error });
  };

  render() {
    if (!this.state.web3) {
      return <Loader active size="huge" />;
    }

    return (
      <>
        <Segment
          inverted
          textAlign="center"
          style={{
            background: 'url(background.jpg)',
            backgroundSize: 'cover',
            minHeight: 500,
            padding: '1em 0em'
          }}
          vertical
        >
          <Menu inverted fixed="top" size="large">
            <Container>
              <Menu.Item as="a">
                <Icon name="paper plane outline" /> CryptoFlight
              </Menu.Item>
              <Menu.Item position="right">
                <Button color="green" as="a" target="_blank" href="https://csci5590.andyafk.com/">
                  Tutorial
                </Button>
              </Menu.Item>
            </Container>
          </Menu>
          <Container>
            <Header
              as="h1"
              inverted
              style={{
                fontSize: '4em',
                fontWeight: 'normal',
                marginBottom: 0,
                marginTop: '3em'
              }}
            >
              <Icon name="paper plane outline" /> CryptoFlight
            </Header>
            <Header
              as="h2"
              inverted
              style={{
                fontSize: '1.7em',
                fontWeight: 'normal',
                marginTop: '1.5em'
              }}
            >
              The new way to travel cheaper and more environmentally friendly utilizing blockchain technology.
            </Header>
          </Container>
        </Segment>
        {this.state.account ? (
          <Segment style={{ padding: '4em 0em 8em 0em' }} vertical>
            <Grid container stackable verticalAlign="top">
              <Grid.Row>
                <Grid.Column width={16} textAlign="center">
                  <Header as="h4" style={{ color: '#999' }}>
                    Using account {this.state.account}
                  </Header>
                </Grid.Column>
              </Grid.Row>
              {this.state.error && (
                <Grid.Row>
                  <Grid.Column width={16} textAlign="center">
                    <Card fluid>
                      <Card.Content>
                        <strong>Error:</strong> {this.state.error}
                      </Card.Content>
                    </Card>
                  </Grid.Column>
                </Grid.Row>
              )}
              <Flights
                account={this.state.account}
                web3={this.state.web3}
                cfToken={this.state.cfToken}
                setError={this.setError}
              />
            </Grid>
            <Image src="divider.jpg" alt="" style={{ marginTop: 50, marginBottom: 50 }} />
            <Grid container stackable verticalAlign="top">
              <CryptoFlightToken
                account={this.state.account}
                balance={this.state.balance}
                web3={this.state.web3}
                cfToken={this.state.cfToken}
                cfTokenCreator={this.state.cfTokenCreator}
                updateBalance={this.updateBalance}
                setError={this.setError}
              />
            </Grid>
          </Segment>
        ) : (
          <>
            <div style={{ textAlign: 'center', margin: 120 }}>
              <Header as="h1">Loading account...</Header>
              <Header as="h3" className="info">
                Hang tight, this might take up to 30 seconds.
                <br />
                Taking too long? Try reloading the page!
              </Header>
            </div>
          </>
        )}

        <Segment inverted vertical style={{ padding: '5em 0em' }}>
          <Container style={{ textAlign: 'center' }}>
            <Header as="h4" inverted>
              &copy; Andreas Carlsson
            </Header>
            <p>This site is created as part of a project the course CSCI5590 - Advanced Topics in Blockchain</p>
            <p>The Chinese Univerity of Hong Kong, spring 2019</p>
          </Container>
        </Segment>
      </>
    );
  }
}

export default App;
