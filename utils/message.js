import { DateTime } from "luxon";

function formatMessage(username, text) {
  return {
    username,
    text,
    time: DateTime.local().toFormat("h:mm a"),
  };
}

export default formatMessage;
