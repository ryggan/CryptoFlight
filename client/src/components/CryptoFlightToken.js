import React from 'react';
import { Grid, Card, Header, Form, Button, Input, Loader } from 'semantic-ui-react';

class CryptoFlightToken extends React.Component {
  state = {
    transferAmount: '0',
    buyAmount: '0',
    receiver: '',
    sendingTransaction: false,
    buyingTokens: false
  };

  transferTokens = async event => {
    event.preventDefault();

    const { account, cfToken, updateBalance } = this.props;

    this.setState({ sendingTransaction: true });

    await cfToken.methods
      .transfer(this.state.receiver, String(Number(this.state.transferAmount) * 1e15))
      .send({ from: account });

    updateBalance();

    this.setState({ transferAmount: '0', sendingTransaction: false });
  };

  buyTokens = async event => {
    event.preventDefault();

    const { web3, account, cfToken, updateBalance } = this.props;

    this.setState({ buyingTokens: true });

    await web3.eth.sendTransaction({
      from: account,
      to: cfToken._address,
      value: web3.utils.toWei(this.state.buyAmount, 'milli')
    });

    updateBalance();

    this.setState({ buyAmount: '0', buyingTokens: false });
  };

  render() {
    if (!this.props.account || !this.props.cfTokenCreator) {
      return <Loader size="huge" />;
    }

    return (
      <Grid.Row>
        <Grid.Column width={16}>
          <Card style={{ padding: '2em 0em' }} fluid>
            <Header as="h1" textAlign="center">
              CFToken
            </Header>
            <Card.Content style={{ minHeight: 160 }}>
              <Form onSubmit={this.transferTokens}>
                <Grid>
                  <Grid.Row>
                    <Grid.Column width={16}>
                      <Input label="My CFToken balance" value={this.props.balance / 1e18 || '0'} fluid />
                    </Grid.Column>
                  </Grid.Row>
                  <Grid.Row>
                    <Grid.Column width={16} textAlign="center">
                      <Header as="h2">Transfer tokens</Header>
                    </Grid.Column>
                  </Grid.Row>
                  <Grid.Row>
                    {!this.state.sendingTransaction ? (
                      <>
                        <Grid.Column width={4} textAlign="center">
                          <Form.Input
                            fluid
                            placeholder="0"
                            icon="money bill alternate outline"
                            value={this.state.transferAmount}
                            onChange={input =>
                              this.setState({ transferAmount: input.target.value.trim().replace(/[^0-9]/g, '') })
                            }
                          />
                          milliCFT = {Number(this.state.transferAmount) / 1000} CFT
                        </Grid.Column>
                        <Grid.Column width={8}>
                          <Form.Input
                            fluid
                            placeholder="0x000000000000000000000000000"
                            icon="address card outline"
                            value={this.state.receiver}
                            onChange={input => this.setState({ receiver: input.target.value.trim() })}
                          />
                        </Grid.Column>
                        <Grid.Column width={4}>
                          <Button
                            color="black"
                            fluid
                            disabled={
                              !this.state.transferAmount ||
                              Number(this.state.transferAmount) === 0 ||
                              !this.state.receiver ||
                              this.state.sendingTransaction
                            }
                          >
                            Send
                          </Button>
                        </Grid.Column>
                      </>
                    ) : (
                      <Grid.Column width={16}>
                        <Header as="h3" className="info">
                          Transfering tokens, this might take 30 seconds or so...
                        </Header>
                      </Grid.Column>
                    )}
                  </Grid.Row>
                  <Grid.Row>
                    <Grid.Column width={16} textAlign="center">
                      <Header as="h2">Buy tokens</Header>
                    </Grid.Column>
                  </Grid.Row>
                </Grid>
              </Form>

              <Form onSubmit={this.buyTokens}>
                <Grid>
                  <Grid.Row>
                    {this.props.account.toLowerCase() !== this.props.cfTokenCreator.toLowerCase() ? (
                      !this.state.buyingTokens ? (
                        <>
                          <Grid.Column width={6}>
                            <Form.Input
                              fluid
                              value={this.state.buyAmount}
                              label="MilliCFT"
                              onChange={input =>
                                this.setState({ buyAmount: input.target.value.trim().replace(/[^0-9]/g, '') })
                              }
                            />
                          </Grid.Column>
                          <Grid.Column width={6}>
                            <Form.Input label="Cost" fluid value={`${this.state.buyAmount / 1000} Ether`} />
                          </Grid.Column>
                          <Grid.Column width={4} verticalAlign="bottom">
                            <Button color="black" fluid disabled={this.state.buyingTokens}>
                              Buy
                            </Button>
                          </Grid.Column>
                        </>
                      ) : (
                        <Grid.Column width={16}>
                          <Header as="h3" className="info">
                            Buying tokens, hang tight!
                          </Header>
                        </Grid.Column>
                      )
                    ) : (
                      <Grid.Column width={16}>
                        <Header className="info">Your account address is identical to the contract creator.</Header>
                        <p className="info">Switch to a different account to buy some CFTokens.</p>
                      </Grid.Column>
                    )}
                  </Grid.Row>
                </Grid>
              </Form>
            </Card.Content>
          </Card>
        </Grid.Column>
      </Grid.Row>
    );
  }
}

export default CryptoFlightToken;
