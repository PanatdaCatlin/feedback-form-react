import React, { Component } from "react";
import { Button, Radio, Form, Input, TextArea, Container, Header, Message } from "semantic-ui-react";
import axios from "axios";

class Feedback extends Component {
  state = {
    subject: "",
    message: "",
    type: "feedback",
    submitting: false,
    success: false
  };

  handleFeedbackTypeChange = (e, { value }) => this.setState({ type: value });
  handleMessageChange = (e, { value }) => this.setState({ message: value });
  handleSubjectChange = (e, { value }) => this.setState({ subject: value });

  submitFeedback = () => {
    const { subject, message, type } = this.state;
    const postBody = { subject, message, type };

    this.setState({ submitting: true });
    axios
      .post("/api/v1/site/feedback", postBody) //postBody
      .then(response => {
        this.setState({
          subject: "",
          message: "",
          submitting: false,
          success: true
        });
      })
      .catch(error => {
        console.log(error);
      });
  };

  render() {
    // Destructuring value out of state
    const { type, subject, message, submitting, success } = this.state;

    return (
      <Container text style={{ marginTop: "2em" }}>
        <Header as="h1">Feedback Submission</Header>
        {success && (
          <Message positive>
            <Message.Header>Message Submitted</Message.Header>
            <p>Your feedback is appreciated.</p>
            <Button onClick={() => this.setState({ success: false })}>
              More Feeback
            </Button>
          </Message>
        )}
        {!success && (
          <Form>
            <div className="ui stacked segment">
              <Form.Field
                required
                control={Input}
                label="Subject"
                placeholder="Subject"
                value={subject}
                onChange={this.handleSubjectChange}
              />
              <Form.Field
                required
                control={TextArea}
                label="Message"
                placeholder="Tell us more..."
                value={message}
                onChange={this.handleMessageChange}
              />
              <Form.Group inline style={{ justifyContent: "center" }}>
                <label>Type</label>
                <Form.Field
                  control={Radio}
                  label="Feedback"
                  value="feedback"
                  checked={type === "feedback"}
                  onChange={this.handleFeedbackTypeChange}
                />
                <Form.Field
                  control={Radio}
                  label="Bug Report"
                  value="bug"
                  checked={type === "bug"}
                  onChange={this.handleFeedbackTypeChange}
                />
              </Form.Group>
              <button
                className="ui animated button"
                control={Button}
                disabled={
                  !(
                    subject &&
                    subject.length > 0 &&
                    message &&
                    message.length > 0
                  ) || submitting
                }
                onClick={() => this.submitFeedback()}
              >
                <div className="visible content">Submit</div>
                <div className="hidden content">
                  <i aria-hidden="true" className="right arrow icon" />
                </div>
              </button>
            </div>
          </Form>
        )}
      </Container>
    );
  }
}

export default Feedback;
