import React from 'react';
import { Card, Divider, Grid, Input, Button } from 'semantic-ui-react';

class AirlineFlight extends React.Component {
  state = { seats: '' };

  render() {
    const { departure, destination } = this.props.flight;

    return (
      <Card fluid>
        <Card.Content>
          <Card.Header>
            {departure} - {destination}
          </Card.Header>
          <Divider />
          <Grid>
            <Grid.Row>
              <Grid.Column width={8}>
                <Input fluid type="text" action>
                  <input
                    placeholder="Seats"
                    value={this.state.seats}
                    onChange={input => this.setState({ seats: input.target.value.trim().replace(/[^0-9]/g, '') })}
                  />
                  <Button
                    color="black"
                    onClick={() => this.props.finalizeFlight(this.props.flight.address, Number(this.state.seats))}
                  >
                    Finalize
                  </Button>
                </Input>
              </Grid.Column>
              <Grid.Column width={8}>
                <Button fluid onClick={this.props.removeFlight}>
                  Remove offer
                </Button>
              </Grid.Column>
            </Grid.Row>
          </Grid>
        </Card.Content>
      </Card>
    );
  }
}

export default AirlineFlight;
